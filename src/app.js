import { trier, FILES, ZONES, libelleTranche, libelleHorizon, libelleTransport } from "./tri.js";

const ORDRE = ["prioritaire", "a_preparer", "a_revoir", "refus"];
const A_REVOIR = new Set(["PERMIS_ADRESSE", "EXPERIENCE_INCOHERENTE", "NPA_INCONNU"]);
const $ = (id) => document.getElementById(id);
// Échappement HTML + espaces insécables de la typographie française (« », : ? !)
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]))
  .replace(/« /g, "«\u00a0").replace(/ (»|:|\?|!)/g, "\u00a0$1");
const COURT = {
  PERMIS_ADRESSE: "Permis et adresse à vérifier", EXPERIENCE_INCOHERENTE: "Expérience contredite par le texte",
  NPA_INCONNU: "Code postal introuvable", TEXTE_VAGUE: "Expérience décrite trop vaguement",
  FIABILITE_NON_DECRITE: "Fiabilité non décrite", FIABILITE_FAIBLE: "Fiabilité : un réflexe sur trois",
  EXPERIENCE_COURTE: "Moins d'un an d'expérience", ZONE_ELOIGNEE: "Zone éloignée du domicile",
  TP_ZONE_PEU_DESSERVIE: "Zone peu desservie en transports", HEURES_SUPERIEURES_DISPO: "Heures voulues > créneaux",
  HORIZON_COURT: "Disponible moins de 3 mois", FRANCAIS_A_VERIFIER: "Français à vérifier",
  SMARTPHONE: "Pas à l'aise avec l'application", DISPO_NON_RENSEIGNEE: "Aucun créneau renseigné",
};
const localite = (c) => c.adresse.split(",").pop().trim().replace(/^\d+\s*/, "");

const candidats = await (await fetch("data/candidats.json")).json();
let resultats = null;
try { const r = await fetch("data/resultats.json"); if (r.ok) resultats = await r.json(); } catch {}

const tries = candidats.map((c) => ({ c, r: trier(c) }));
let filtre = "tout", choisi = "C13";

// ---------------------------------------------------------------- détail
function rendreResultat(c, r, avecNom = true) {
  const tete = avecNom
    ? `<h3>${esc(c.prenom)} ${esc(c.nom[0])}. <span class="puce">fictif</span> <span class="doux petit">${esc(c.id)} · ${esc(localite(c))}</span></h3>`
    : "";
  let h = tete + `<p><span class="badge b-${r.file}">${FILES[r.file]}</span> ${r.file === "refus" ? "" : `<b>${r.score}/10</b>`}</p>`;
  if (r.file === "refus") {
    h += r.motifs_refus.map((m) => `<div class="alerte refus">${esc(m)}</div>`).join("");
    h += `<p class="doux petit">Critère éliminatoire publié par MénageSimple : aucune note n'est calculée, aucun texte n'est lu.</p>`;
    return h;
  }
  h += `<table class="bareme">${r.detail.map((d) => `<tr><td>${esc(d.critere)}<br><span class="doux petit">${esc(d.preuve)}</span></td><td class="pts">${d.points}/${d.max}</td></tr>`).join("")}</table>`;
  if (r.alertes.length) {
    h += `<h3 style="margin-top:12px">Points d'attention</h3>` + r.alertes.map((a) => `<div class="alerte ${A_REVOIR.has(a.code) ? "revoir" : ""}">${esc(a.message)}</div>`).join("");
    h += `<h3 style="margin-top:12px">À demander pendant l'appel</h3><ol class="questions">${r.questions.map((q) => `<li>${esc(q)}</li>`).join("")}</ol>`;
  } else {
    h += `<p class="doux petit">Aucun point d'attention : appel de confirmation, puis mise en relation.</p>`;
  }
  return h;
}

// ---------------------------------------------------------------- file
function rendreFile() {
  const n = (f) => tries.filter((t) => t.r.file === f).length;
  $("onglets").innerHTML = [["tout", `Tout (${tries.length})`], ...ORDRE.map((f) => [f, `${FILES[f]} (${n(f)})`])]
    .map(([k, l]) => `<button data-k="${k}" class="${filtre === k ? "on" : ""}">${l}</button>`).join("");
  $("onglets").querySelectorAll("button").forEach((b) => (b.onclick = () => { filtre = b.dataset.k; rendreFile(); }));

  const visibles = tries
    .filter((t) => filtre === "tout" || t.r.file === filtre)
    .sort((a, b) => ORDRE.indexOf(a.r.file) - ORDRE.indexOf(b.r.file) || b.r.score - a.r.score);
  $("liste").innerHTML = visibles.map(({ c, r }) => `
    <button class="ligne f-${r.file} ${c.id === choisi ? "on" : ""}" data-id="${c.id}">
      <div class="haut"><span><b>${esc(c.prenom)} ${esc(c.nom[0])}.</b> <span class="doux petit">${esc(localite(c))}</span></span>
      <span class="score">${r.file === "refus" ? "" : r.score + "/10"}</span></div>
      <div>${r.file === "refus" ? `<span class="puce">${esc(r.motifs_refus[0])}</span>` : r.alertes.map((a) => `<span class="puce">${esc(COURT[a.code] || a.code)}</span>`).join("")}</div>
    </button>`).join("");
  $("liste").querySelectorAll(".ligne").forEach((b) => (b.onclick = () => { choisi = b.dataset.id; rendreFile(); if (innerWidth < 820) $("detail").scrollIntoView({ behavior: "smooth" }); }));
  const t = tries.find((x) => x.c.id === choisi);
  $("detail").innerHTML = rendreResultat(t.c, t.r);
}

// ---------------------------------------------------------------- essai
const OPTIONS = {
  permis: [["suisse", "Nationalité suisse"], ["B", "Permis B"], ["C", "Permis C"], ["G", "Permis G"], ["aucun", "Pas autorisé·e à travailler en Suisse"]],
  casier_vierge: [["true", "Oui"], ["false", "Non"]],
  experience_tranche: ["jamais", "moins_1", "1_2", "plus_2", "plus_5"].map((k) => [k, libelleTranche(k)]),
  heures_semaine: [["5-10", "5 à 10 h"], ["10-20", "10 à 20 h"], ["20-30", "20 à 30 h"], ["30+", "Plus de 30 h"]],
  transport: ["tp", "voiture", "scooter"].map((k) => [k, libelleTransport(k)]),
  horizon: ["moins_3_mois", "3_12_mois", "plus_1_an"].map((k) => [k, libelleHorizon(k)]),
  reference: [["true", "Oui"], ["false", "Non"]],
  francais: [["courant", "Courant"], ["intermediaire", "Intermédiaire"], ["debutant", "Débutant"]],
  smartphone: [["true", "Oui"], ["false", "Non"]],
};
const LIB = { permis: "Permis de travail", casier_vierge: "Casier judiciaire vierge", experience_tranche: "Expérience déclarée", heures_semaine: "Heures souhaitées par semaine", transport: "Déplacements", horizon: "Engagement prévu", reference: "Référence possible", francais: "Français", smartphone: "À l'aise avec les applications" };
const JOURS = ["lun", "mar", "mer", "jeu", "ven", "sam"];
let essai = structuredClone(candidats.find((c) => c.id === "C24"));

function rendreFormulaire() {
  const sel = (k) => `<label>${LIB[k]}<select data-k="${k}">${OPTIONS[k].map(([v, l]) => `<option value="${v}" ${String(essai[k]) === v ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>`;
  $("formulaire").innerHTML = `
    <label>Partir de la candidature<select id="depart">${candidats.map((c) => `<option value="${c.id}" ${c.id === essai.id ? "selected" : ""}>${c.id} · ${esc(c.prenom)} ${esc(c.nom[0])}. (${esc(localite(c))})</option>`).join("")}</select></label>
    <label>Code postal<input data-k="npa" value="${esc(essai.npa)}"></label>
    ${Object.keys(OPTIONS).map(sel).join("")}
    <label>Zones souhaitées<select data-k="zones" multiple size="4">${Object.keys(ZONES).map((z) => `<option ${essai.zones.includes(z) ? "selected" : ""}>${esc(z)}</option>`).join("")}</select></label>
    <label>Disponibilités (matin / après-midi)</label>
    <div class="jours">${JOURS.map((j) => `<label>${j}<br><input type="checkbox" data-j="${j}" data-p="matin" ${essai.disponibilites[j]?.includes("matin") ? "checked" : ""}> <input type="checkbox" data-j="${j}" data-p="apres-midi" ${essai.disponibilites[j]?.includes("apres-midi") ? "checked" : ""}></label>`).join("")}</div>
    <label>Racontez votre dernier emploi de ménage<textarea data-k="texte_experience">${esc(essai.texte_experience)}</textarea></label>
    <label>Une fois où vous n'avez pas pu venir : qu'avez-vous fait ?<textarea data-k="texte_fiabilite">${esc(essai.texte_fiabilite)}</textarea></label>`;
  $("depart").onchange = (e) => { essai = structuredClone(candidats.find((c) => c.id === e.target.value)); rendreFormulaire(); };
  $("formulaire").querySelectorAll("[data-k]").forEach((el) => (el.oninput = el.onchange = () => {
    const k = el.dataset.k;
    if (k === "zones") essai.zones = [...el.selectedOptions].map((o) => o.value);
    else if (["casier_vierge", "reference", "smartphone"].includes(k)) essai[k] = el.value === "true";
    else essai[k] = el.value;
    rendreEssai();
  }));
  $("formulaire").querySelectorAll("[data-j]").forEach((el) => (el.onchange = () => {
    const j = el.dataset.j, p = el.dataset.p, d = (essai.disponibilites[j] ||= []);
    if (el.checked && !d.includes(p)) d.push(p);
    if (!el.checked) essai.disponibilites[j] = d.filter((x) => x !== p);
    rendreEssai();
  }));
  rendreEssai();
}
function rendreEssai() { $("resultat-essai").innerHTML = rendreResultat(essai, trier(essai), false); }

// ---------------------------------------------------------------- accord
function rendreAccord() {
  if (!resultats) {
    $("accord").innerHTML = `<h3>Accord avec un tri humain à l'aveugle</h3><p class="doux petit">En attente de l'étiquetage humain.</p>`;
    return;
  }
  const R = resultats;
  $("k-accord").textContent = `${R.accords}/${R.n}`;
  $("accord").innerHTML = `
    <h3>Accord avec un tri humain à l'aveugle</h3>
    <p class="petit">${R.accords} candidatures sur ${R.n} rangées dans la même file (${virgule(R.taux)}&nbsp;%), kappa de Cohen ${virgule(R.kappa)}. Erreurs graves (bon profil refusé, dossier douteux appelé en premier) : <b>${R.graves.length ? R.graves.join(", ") : "aucune"}</b>.</p>
    <table class="matrice"><tr><th>humain ↓ · outil →</th>${ORDRE.map((o) => `<th>${FILES[o].split(" (")[0]}</th>`).join("")}</tr>
    ${ORDRE.map((h) => `<tr><th>${FILES[h].split(" (")[0]}</th>${ORDRE.map((o) => `<td class="${h === o ? "diag" : ""}">${R.matrice[h][o]}</td>`).join("")}</tr>`).join("")}</table>
    ${R.accord_appel != null ? `<p class="petit">Sur la seule question « appeler maintenant ou pas » : <b>${R.accord_appel}/${R.n}</b>. L'essentiel des écarts porte sur l'ordre des appels.</p>` : ""}
    ${R.desaccords.length ? `<h3 style="margin-top:14px">Les ${R.desaccords.length} désaccords, regroupés</h3>${rendreAnalyse(R)}` : ""}
    <p class="doux petit">Étiquetage du ${esc(R.date_etiquetage)}, règles v${esc(R.version_regles)} gelées avant. Aucune règle modifiée après le tri humain : cette mesure reste valable.</p>`;
}

// Analyse écrite après le tri humain, à partir des fiches et des explications du recruteur.
// Elle explique les écarts ; elle ne sert pas à retoucher les règles (le chiffre deviendrait circulaire).
const ANALYSE = [
  { titre: "Le tri humain a révélé une préférence non écrite : la voiture", ids: ["C01", "C03", "C09", "C21"],
    texte: "Les 8 appels prioritaires du recruteur viennent tous en voiture, aucun en transports publics. L'outil ne pénalise les transports publics que dans les zones peu desservies : à Lausanne, Genève ou Neuchâtel, il les juge suffisants. Qui a raison ? Seules les données de MénageSimple le diront, en comparant retards et annulations selon le mode de transport." },
  { titre: "Refus sur des critères qui ne sont pas éliminatoires", ids: ["C05", "C17", "C27"],
    texte: "Quelques mois d'expérience et une réponse vague, français débutant, disponible le samedi seulement. Le recruteur refuse ; l'outil met un appel à préparer avec la question à poser. C'est voulu : il ne refuse que sur les critères publiés. Pour refuser d'office, il faudrait d'abord publier ces critères." },
  { titre: "« À relire » utilisé pour un doute", ids: ["C16", "C20"],
    texte: "Disponible moins de 3 mois ; a déjà manqué de prévenir une fois. L'outil réserve « à relire » aux données qui se contredisent et pose une question à la place. La définition des files est à fixer avec l'équipe qui recrute." },
  { titre: "L'outil plus prudent que l'humain", ids: ["C15", "C23"],
    texte: "C15 veut au moins 30 h par semaine pour quatre matinées cochées. C23 habite Pontarlier et vise La Chaux-de-Fonds, à 43 km à vol d'oiseau : un trajet ordinaire pour un frontalier en voiture. Le seuil de 35 km est à revoir avec des temps de trajet réels." },
  { titre: "Ce que l'outil a vu et pas l'humain", ids: ["C29"],
    texte: "Permis B, qui suppose d'habiter en Suisse, avec une adresse à Saint-Julien-en-Genevois, en France. Le recruteur l'aurait appelée en premier ; l'outil l'envoie en relecture. Le recruteur avait pourtant repéré l'incohérence inverse sur C08 (permis G, adresse à Genève)." },
  { titre: "Plus prudent que l'outil, raison non notée", ids: ["C22"],
    texte: "Trois ans en entreprise de nettoyage, voiture, pas de référence." },
];
const virgule = (x) => String(x).replace(".", ",");
const court = (f) => FILES[f].split(" (")[0];
function rendreAnalyse(R) {
  const parId = Object.fromEntries(R.desaccords.map((d) => [d.id, d]));
  const vus = new Set();
  const blocs = ANALYSE.filter((g) => g.ids.some((id) => parId[id])).map((g) => {
    g.ids.forEach((id) => vus.add(id));
    // Les candidatures d'un groupe qui partagent le même écart sont citées ensemble
    const paires = {};
    for (const id of g.ids.filter((x) => parId[x])) {
      const k = parId[id].humain + "|" + parId[id].outil;
      (paires[k] = paires[k] || []).push(id);
    }
    const qui = Object.entries(paires).map(([k, ids]) => {
      const [h, o] = k.split("|");
      return `<b>${ids.join(", ")}</b> ${esc(`: humain « ${court(h)} », outil « ${court(o)} »`)}`;
    }).join(" ; ");
    return `<li><b>${esc(g.titre)}</b><br><span class="doux">${qui}.</span> ${esc(g.texte)}</li>`;
  });
  // Filet : un désaccord sans analyse reste affiché tel quel
  const restes = R.desaccords.filter((d) => !vus.has(d.id)).map((d) => `<li><b>${d.id}</b> : humain « ${FILES[d.humain]} », outil « ${FILES[d.outil]} » (${d.score}/10).</li>`);
  return `<ul class="serre petit">${blocs.concat(restes).join("")}</ul>`;
}

rendreFile();
rendreFormulaire();
rendreAccord();
