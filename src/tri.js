// Tri des candidatures intervenant·e·s : prototype MénageSimple (données fictives).
// Module pur : aucune dépendance, aucun appel réseau, même résultat à chaque exécution.
// Utilisé tel quel par la page web (navigateur) et par les tests (Node).

export const VERSION = "1.0.0";

// ---------------------------------------------------------------------------
// Champs lus. Le tri ne voit QUE ces champs : nom, e-mail, téléphone et adresse
// complète ne sont jamais transmis (voir anonymiser()).
// ---------------------------------------------------------------------------
export const CHAMPS_LUS = [
  "npa", "pays", "permis", "casier_vierge", "experience_tranche",
  "heures_semaine", "transport", "zones", "disponibilites", "horizon",
  "reference", "francais", "smartphone", "texte_experience", "texte_fiabilite",
];

export function anonymiser(candidat) {
  const out = {};
  for (const k of CHAMPS_LUS) out[k] = candidat[k];
  return out;
}

// ---------------------------------------------------------------------------
// Référentiels publics
// Zones : liste exacte du formulaire de candidature MénageSimple (Typeform t4Qv04).
// Coordonnées : centres approximatifs, distances à vol d'oiseau.
// ---------------------------------------------------------------------------
export const ZONES = {
  "Vaud - Lausanne et alentours": [46.52, 6.63],
  "Vaud - Nyon et alentours": [46.38, 6.24],
  "Vaud - Aubonne": [46.49, 6.39],
  "Vaud - Montreux-Vevey": [46.45, 6.87],
  "Vaud - Lucens": [46.71, 6.84],
  "Vaud - Echallens": [46.64, 6.63],
  "Vaud - Yverdon et alentours": [46.78, 6.64],
  "Vaud - Vallorbe": [46.71, 6.37],
  "Vaud - Palézieux": [46.54, 6.84],
  "Genève et alentours": [46.20, 6.14],
  "Valais - Sion et Sierre": [46.26, 7.45],
  "Valais - Martigny-Aigle-St Maurice": [46.21, 7.02],
  "Valais - Evolène": [46.11, 7.49],
  "Neuchâtel - Ville et alentours": [46.99, 6.93],
  "Neuchâtel - La Chaux-de-Fonds": [47.10, 6.83],
  "Fribourg - Ville et alentours": [46.81, 7.16],
  "Fribourg - Bulle": [46.62, 7.06],
  "Fribourg - Payerne": [46.82, 6.94],
};

// Hypothèse à valider avec l'équipe : zones où les transports publics
// rendent difficile l'enchaînement de plusieurs ménages dans la journée.
export const ZONES_PEU_DESSERVIES = new Set([
  "Valais - Evolène", "Vaud - Vallorbe", "Vaud - Lucens", "Vaud - Palézieux", "Vaud - Aubonne",
]);

// NPA → [localité, lat, lon, pays]. Limité aux localités du jeu fictif ;
// un NPA inconnu déclenche une alerte au lieu d'être deviné.
export const LOCALITES = {
  "1003": ["Lausanne", 46.52, 6.63, "CH"], "1004": ["Lausanne", 46.53, 6.62, "CH"],
  "1006": ["Lausanne", 46.51, 6.64, "CH"], "1020": ["Renens", 46.54, 6.59, "CH"],
  "1030": ["Bussigny", 46.55, 6.55, "CH"], "1040": ["Echallens", 46.64, 6.63, "CH"],
  "1110": ["Morges", 46.51, 6.50, "CH"], "1196": ["Gland", 46.42, 6.27, "CH"],
  "1260": ["Nyon", 46.38, 6.24, "CH"], "1201": ["Genève", 46.21, 6.14, "CH"],
  "1205": ["Genève", 46.20, 6.14, "CH"], "1217": ["Meyrin", 46.23, 6.08, "CH"],
  "1227": ["Carouge", 46.18, 6.14, "CH"], "1400": ["Yverdon-les-Bains", 46.78, 6.64, "CH"],
  "1337": ["Vallorbe", 46.71, 6.37, "CH"], "1522": ["Lucens", 46.71, 6.84, "CH"],
  "1530": ["Payerne", 46.82, 6.94, "CH"], "1630": ["Bulle", 46.62, 7.06, "CH"],
  "1700": ["Fribourg", 46.81, 7.16, "CH"], "1800": ["Vevey", 46.46, 6.84, "CH"],
  "1820": ["Montreux", 46.43, 6.91, "CH"], "1860": ["Aigle", 46.32, 6.97, "CH"],
  "1870": ["Monthey", 46.25, 6.95, "CH"], "1920": ["Martigny", 46.10, 7.07, "CH"],
  "1950": ["Sion", 46.23, 7.36, "CH"], "3960": ["Sierre", 46.29, 7.53, "CH"],
  "1983": ["Evolène", 46.11, 7.49, "CH"], "2000": ["Neuchâtel", 46.99, 6.93, "CH"],
  "2300": ["La Chaux-de-Fonds", 47.10, 6.83, "CH"], "2400": ["Le Locle", 47.06, 6.75, "CH"],
  "74100": ["Annemasse", 46.19, 6.24, "FR"], "74160": ["Saint-Julien-en-Genevois", 46.14, 6.08, "FR"],
  "74200": ["Thonon-les-Bains", 46.37, 6.48, "FR"], "25300": ["Pontarlier", 46.90, 6.35, "FR"],
  "25500": ["Morteau", 47.06, 6.61, "FR"],
};

// ---------------------------------------------------------------------------
// Règles réglables (tout le barème est ici, rien n'est caché ailleurs)
// ---------------------------------------------------------------------------
export const REGLES = {
  seuil_prioritaire: 7,          // sur 10, et aucune alerte
  distance_max_km: { tp: 20, voiture: 35, scooter: 35 }, // vol d'oiseau
  heures_par_demi_journee: 4,
  mots_min_texte: 15,
};

const ANNEE_REFERENCE = 2026;

// ---------------------------------------------------------------------------
// Outils texte
// ---------------------------------------------------------------------------
export function normaliser(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[’`]/g, "'");
}

function phrases(texte) {
  return (texte || "")
    .split(/(?<=[.!?;])\s+|\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function nbMots(texte) {
  return (texte || "").trim().split(/\s+/).filter(Boolean).length;
}

const NOMBRES = { un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10, onze: 11, douze: 12, quinze: 15, vingt: 20 };

// Durée totale d'expérience citée dans le texte, en mois (null si aucune durée).
export function dureeCiteeMois(texte) {
  const t = normaliser(texte);
  let mois = 0, trouve = false;
  // (?<![\\w-]) : « dix-huit » n'est jamais lu comme « huit » (mieux vaut ne rien lire que lire faux)
  const nombre = "(?<![\\w-])(\\d+(?:[.,]5)?|" + Object.keys(NOMBRES).join("|") + ")";
  const val = (x) => (NOMBRES[x] !== undefined ? NOMBRES[x] : parseFloat(x.replace(",", ".")));
  for (const m of t.matchAll(new RegExp(nombre + "\\s*(?:ans?|annees?)\\b", "g"))) { mois += val(m[1]) * 12; trouve = true; }
  for (const m of t.matchAll(new RegExp(nombre + "\\s*mois\\b", "g"))) { mois += val(m[1]); trouve = true; }
  for (const m of t.matchAll(/depuis (?:\w+ )?(20\d\d|19\d\d)/g)) { mois += (ANNEE_REFERENCE - parseInt(m[1], 10)) * 12; trouve = true; }
  return trouve ? Math.round(mois) : null;
}

// Cherche un motif dans les phrases ; ignore une occurrence niée
// (« pas », « jamais », « sans », « n' » dans les 4 mots qui précèdent, même proposition).
function chercher(texte, motif) {
  const global = new RegExp(motif.source, "g");
  for (const p of phrases(texte)) {
    const n = normaliser(p);
    for (const m of n.matchAll(global)) {
      // La négation ne compte que dans la même proposition (on coupe à la dernière virgule).
      const prop = n.slice(0, m.index).split(/[,;:]/).pop();
      const avant = prop.split(/\s+/).slice(-4).join(" ");
      if (/\b(pas|jamais|sans)\b|\bn'/.test(avant)) continue;
      return p;
    }
  }
  return null;
}

const MOTIFS = {
  contexte: /\b(particuliers?|familles?|villas?|appartements?|maisons?|hotel\w*|ems|clinique|hopital|bureaux?|entreprise de nettoyage|airbnb|gite|ecole|creche|restaurant|cabinet)\b/,
  taches: /\b(sols?|aspirateur|serpilliere|poussiere|salles? de bains?|sanitaires|cuisines?|four|frigo|vitres|fenetres|repassage|linge|lits|draps|desinfect\w*)\b/g,
  prevenir: /\b(prevenu\w*|prevenir|previens|averti\w*|appel\w*|telephoner|telephone (a|au|aux|le|la|les)|par telephone|ai telephone|message|sms|informe\w*|contacte\w*|ecri[st]|ecrire)\b/,
  delai: /(a l'avance|la veille|des que|tout de suite|immediatement|le jour (d')?avant|(\d+|une?|deux|trois|quatre|quelques|plusieurs)\s*(h|heures?|jours?|semaines?) (avant|a l'avance))/,
  solution: /\b(remplac\w*|rattrap\w*|autre jour|autre date|report\w*|decal\w*|propose\w*|collegue|le lendemain|deplace\w*)\b/,
  premiere_fois: /(premiere experience|jamais travaille|jamais fait|pas encore d'experience|je debute)/,
};

// ---------------------------------------------------------------------------
// Géographie
// ---------------------------------------------------------------------------
function distanceKm([la1, lo1], [la2, lo2]) {
  const r = Math.PI / 180, R = 6371;
  const a = Math.sin(((la2 - la1) * r) / 2) ** 2 +
    Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(((lo2 - lo1) * r) / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

const QUESTIONS = {
  PERMIS_ADRESSE: (c) => `Votre adresse est en ${c.pays === "FR" ? "France" : "Suisse"} avec un ${c.permis === "G" ? "permis G (frontalier)" : "permis " + c.permis} : pouvez-vous confirmer votre lieu de résidence et votre permis ?`,
  EXPERIENCE_INCOHERENTE: () => "Vous avez indiqué plus de deux ans d'expérience, mais votre description parle d'une expérience plus courte : pouvez-vous nous détailler vos postes et leur durée ?",
  NPA_INCONNU: () => "Nous n'avons pas reconnu votre code postal : pouvez-vous nous redonner votre localité ?",
  TEXTE_VAGUE: () => "Racontez-nous votre dernier emploi de ménage : chez qui, pendant combien de temps, et quelles tâches vous faisiez.",
  FIABILITE_NON_DECRITE: () => "Si un jour vous ne pouvez pas venir chez un client, comment faites-vous concrètement ?",
  ZONE_ELOIGNEE: (c, x) => `Vous habitez à environ ${x.km} km de la zone « ${x.zone} » : combien de temps vous faut-il pour y aller avec votre moyen de transport ?`,
  TP_ZONE_PEU_DESSERVIE: (c, x) => `La zone « ${x.zone} » est peu desservie en transports publics : comment comptez-vous enchaîner deux ménages dans la même journée ?`,
  HEURES_SUPERIEURES_DISPO: (c, x) => `Vous souhaitez ${x.heures} heures par semaine mais vos disponibilités couvrent environ ${x.capacite} heures : avez-vous d'autres créneaux ?`,
  HORIZON_COURT: () => "Nos clients gardent la même personne chaque semaine : sur combien de mois pouvez-vous vous engager ?",
  FRANCAIS_A_VERIFIER: () => "(À l'appel, mener l'échange en français et vérifier la compréhension des consignes d'un client.)",
  SMARTPHONE: () => "Les missions, changements d'horaire et messages clients passent par notre application : êtes-vous à l'aise pour l'utiliser au quotidien ?",
  DISPO_NON_RENSEIGNEE: () => "Quels jours et à quels moments de la journée êtes-vous disponible chaque semaine ?",
};

// Alertes qui demandent une relecture humaine AVANT tout appel (données incohérentes).
const ALERTES_A_REVOIR = new Set(["PERMIS_ADRESSE", "EXPERIENCE_INCOHERENTE", "NPA_INCONNU"]);

// ---------------------------------------------------------------------------
// Tri
// ---------------------------------------------------------------------------
export function trier(candidatComplet) {
  const c = anonymiser(candidatComplet);
  const res = { file: null, score: 0, detail: [], motifs_refus: [], alertes: [], questions: [] };
  const alerte = (code, message, extra = {}) => {
    res.alertes.push({ code, message });
    if (QUESTIONS[code]) res.questions.push(QUESTIONS[code](c, extra));
  };

  // 1. Critères éliminatoires publiés par MénageSimple (aucune IA, aucune note)
  if (!c.permis || c.permis === "aucun") res.motifs_refus.push("Pas d'autorisation de travailler en Suisse");
  if (c.casier_vierge === false) res.motifs_refus.push("Casier judiciaire non vierge");
  if (c.experience_tranche === "jamais") res.motifs_refus.push("Aucune expérience du ménage (profil publié : « expérimenté·e en nettoyage »)");
  if (res.motifs_refus.length) { res.file = "refus"; return res; }

  // 2. Cohérence des données
  const loc = LOCALITES[c.npa];
  if (!loc) alerte("NPA_INCONNU", `Code postal ${c.npa || "absent"} inconnu du référentiel`);
  const pays = loc ? loc[3] : c.pays;
  if (loc && c.permis === "G" && pays === "CH") alerte("PERMIS_ADRESSE", "Permis G (frontalier) mais adresse en Suisse", {});
  if (loc && ["B", "C"].includes(c.permis) && pays !== "CH") alerte("PERMIS_ADRESSE", `Permis ${c.permis} mais adresse hors de Suisse`);
  c.pays = pays;

  // 3. Expérience (max 3)
  const base = { moins_1: 0, "1_2": 1, plus_2: 2, plus_5: 2 }[c.experience_tranche] ?? 0;
  const duree = dureeCiteeMois(c.texte_experience);
  const ctx = chercher(c.texte_experience, MOTIFS.contexte);
  const taches = [...new Set((normaliser(c.texte_experience).match(MOTIFS.taches) || []))];
  const concret = [duree !== null, !!ctx, taches.length >= 2].filter(Boolean).length >= 2;
  const exp = base + (concret ? 1 : 0);
  res.detail.push({
    critere: "Expérience", points: exp, max: 3,
    preuve: `Tranche déclarée : ${libelleTranche(c.experience_tranche)}` +
      (concret ? ` · description concrète (${[duree !== null && `durée citée ≈ ${Math.round(duree / 12 * 10) / 10} an(s)`, ctx && "contexte", taches.length >= 2 && `tâches : ${taches.join(", ")}`].filter(Boolean).join(", ")})` : " · description trop vague pour un point de plus"),
  });
  const premiere = chercher(c.texte_experience, MOTIFS.premiere_fois);
  if (["plus_2", "plus_5"].includes(c.experience_tranche) && ((duree !== null && duree < 18) || premiere)) {
    alerte("EXPERIENCE_INCOHERENTE", premiere ? `Tranche « ${libelleTranche(c.experience_tranche)} » mais le texte dit : « ${premiere} »` : `Tranche « ${libelleTranche(c.experience_tranche)} » mais le texte cite ≈ ${duree} mois`);
  }
  if (!concret) alerte("TEXTE_VAGUE", nbMots(c.texte_experience) < REGLES.mots_min_texte ? "Description de l'expérience trop courte pour en juger" : "Description sans durée, lieu ni tâches précises");

  // 4. Fiabilité (max 3) : question comportementale « une fois où vous n'avez pas pu venir »
  const prev = chercher(c.texte_fiabilite, MOTIFS.prevenir);
  const del = chercher(c.texte_fiabilite, MOTIFS.delai);
  const sol = chercher(c.texte_fiabilite, MOTIFS.solution);
  const fia = [prev, del, sol].filter(Boolean).length;
  res.detail.push({
    critere: "Fiabilité", points: fia, max: 3,
    preuve: fia ? [prev && `prévient : « ${prev} »`, del && `à temps : « ${del} »`, sol && `propose une solution : « ${sol} »`].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(" · ") : "Aucun comportement concret décrit",
  });
  if (fia === 0) alerte("FIABILITE_NON_DECRITE", "La réponse ne décrit pas ce que la personne fait quand elle ne peut pas venir");

  // 5. Disponibilité (max 2)
  const demi = Object.values(c.disponibilites || {}).reduce((s, v) => s + (v ? v.length : 0), 0);
  const dispo = demi >= 6 ? 2 : demi >= 3 ? 1 : 0;
  res.detail.push({ critere: "Disponibilité", points: dispo, max: 2, preuve: `${demi} demi-journée(s) par semaine` });
  if (demi === 0) alerte("DISPO_NON_RENSEIGNEE", "Aucun créneau renseigné");
  const heuresMin = { "5-10": 5, "10-20": 10, "20-30": 20, "30+": 30 }[c.heures_semaine];
  const capacite = demi * REGLES.heures_par_demi_journee;
  if (heuresMin && demi > 0 && heuresMin > capacite) alerte("HEURES_SUPERIEURES_DISPO", `Souhaite au moins ${heuresMin} h/semaine pour ≈ ${capacite} h de créneaux`, { heures: c.heures_semaine, capacite });

  // 6. Engagement dans la durée (max 1) : les clients veulent la même personne
  const hor = c.horizon === "plus_1_an" ? 1 : 0;
  res.detail.push({ critere: "Durée d'engagement", points: hor, max: 1, preuve: libelleHorizon(c.horizon) });
  if (c.horizon === "moins_3_mois") alerte("HORIZON_COURT", "Disponible moins de 3 mois, alors que les clients réguliers veulent la même personne");

  // 7. Référence (max 1)
  res.detail.push({ critere: "Référence", points: c.reference ? 1 : 0, max: 1, preuve: c.reference ? "Peut fournir une référence" : "Pas de référence proposée" });

  // 8. Logistique (alertes seulement, pas de points)
  if (loc) {
    const lim = REGLES.distance_max_km[c.transport] ?? 25;
    const proches = (c.zones || []).filter((z) => ZONES[z]).map((z) => ({ zone: z, km: distanceKm([loc[1], loc[2]], ZONES[z]) }));
    const loin = proches.filter((p) => p.km > lim).sort((a, b) => b.km - a.km)[0];
    if (loin) alerte("ZONE_ELOIGNEE", `Zone « ${loin.zone} » à ≈ ${loin.km} km du domicile (${libelleTransport(c.transport)})`, loin);
  }
  if (c.transport === "tp") {
    const z = (c.zones || []).find((x) => ZONES_PEU_DESSERVIES.has(x));
    if (z) alerte("TP_ZONE_PEU_DESSERVIE", `Transports publics et zone « ${z} »`, { zone: z });
  }
  if (c.francais === "debutant") alerte("FRANCAIS_A_VERIFIER", "Français déclaré débutant (exigence publiée : savoir s'exprimer en français)");
  if (c.smartphone === false) alerte("SMARTPHONE", "Pas à l'aise avec les applications (exigence publiée)");

  // 9. Décision
  res.score = res.detail.reduce((s, d) => s + d.points, 0);
  if (res.alertes.some((a) => ALERTES_A_REVOIR.has(a.code))) res.file = "a_revoir";
  else if (res.score >= REGLES.seuil_prioritaire && res.alertes.length === 0) res.file = "prioritaire";
  else res.file = "a_preparer";
  return res;
}

export const FILES = {
  prioritaire: "Appel prioritaire",
  a_preparer: "Appel à préparer",
  a_revoir: "À relire avant tout appel",
  refus: "Refus (critère éliminatoire)",
};

export function libelleTranche(t) {
  return { jamais: "jamais fait de ménage", moins_1: "moins d'un an", "1_2": "1 à 2 ans", plus_2: "plus de 2 ans", plus_5: "plus de 5 ans" }[t] || "non renseignée";
}
export function libelleHorizon(h) {
  return { moins_3_mois: "moins de 3 mois", "3_12_mois": "3 à 12 mois", plus_1_an: "plus d'un an" }[h] || "non renseigné";
}
export function libelleTransport(t) {
  return { tp: "transports publics", voiture: "voiture", scooter: "scooter ou moto" }[t] || "transport non renseigné";
}
