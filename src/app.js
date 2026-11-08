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
    <p class="petit">${R.accords} candidatures sur ${R.n} rangées dans la même file (${R.taux} %), kappa de Cohen ${R.kappa}. Erreurs graves (bon profil refusé, dossier douteux appelé en premier) : <b>${R.graves.length ? R.graves.join(", ") : "aucune"}</b>.</p>
    <table class="matrice"><tr><th>humain ↓ · outil →</th>${ORDRE.map((o) => `<th>${FILES[o].split(" (")[0]}</th>`).join("")}</tr>
    ${ORDRE.map((h) => `<tr><th>${FILES[h].split(" (")[0]}</th>${ORDRE.map((o) => `<td class="${h === o ? "diag" : ""}">${R.matrice[h][o]}</td>`).join("")}</tr>`).join("")}</table>
    ${R.desaccords.length ? `<h3 style="margin-top:14px">Les désaccords, un par un</h3><ul class="serre petit">${R.desaccords.map((d) => `<li><b>${d.id}</b> : humain « ${FILES[d.humain]} », outil « ${FILES[d.outil]} » (${d.score}/10).${d.note ? ` <span class="doux">Note : ${esc(d.note)}</span>` : ""}${d.analyse ? ` ${esc(d.analyse)}` : ""}</li>`).join("")}</ul>` : ""}
    <p class="doux petit">Étiquetage du ${esc(R.date_etiquetage)}, règles v${esc(R.version_regles)} gelées avant.</p>`;
}

rendreFile();
rendreFormulaire();
rendreAccord();
