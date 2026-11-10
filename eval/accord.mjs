// Mesure l'accord entre l'outil et un tri humain fait à l'aveugle.
// Lancer : node eval/accord.mjs [labels/alexandre.json] [sortie.json]
// Écrit data/resultats.json (lu par la page), sauf si une autre sortie est donnée.
import fs from "node:fs";
import { trier, FILES, VERSION } from "../src/tri.js";

const racine = new URL("../", import.meta.url);
const fichier = process.argv[2] || "labels/alexandre.json";
const C = JSON.parse(fs.readFileSync(new URL("data/candidats.json", racine), "utf8"));
const L = JSON.parse(fs.readFileSync(new URL(fichier, racine), "utf8"));
const ORDRE = ["prioritaire", "a_preparer", "a_revoir", "refus"];
const pre = L.prerempli || [];
const APPEL = ["prioritaire", "a_preparer"];

const lignes = C.map((c) => {
  const r = trier(c);
  return { id: c.id, outil: r.file, humain: L.etiquettes[c.id], score: r.score, alertes: r.alertes.map((a) => a.code), note: (L.notes || {})[c.id] || "" };
}).filter((l) => l.humain);

const n = lignes.length;
const accords = lignes.filter((l) => l.outil === l.humain).length;
const matrice = Object.fromEntries(ORDRE.map((h) => [h, Object.fromEntries(ORDRE.map((o) => [o, 0]))]));
for (const l of lignes) matrice[l.humain][l.outil]++;

// Kappa de Cohen : accord corrigé du hasard
const po = accords / n;
const pe = ORDRE.reduce((s, k) => s + (lignes.filter((l) => l.humain === k).length / n) * (lignes.filter((l) => l.outil === k).length / n), 0);
const kappa = pe === 1 ? 1 : (po - pe) / (1 - pe);

// Erreurs graves : celles qui coûtent cher en vrai
const graves = lignes.filter((l) =>
  (l.outil === "refus" && l.humain !== "refus") ||          // un bon profil écarté sans appel
  (l.outil === "prioritaire" && ["refus", "a_revoir"].includes(l.humain)) // un dossier douteux appelé en premier
);

const resultats = {
  version_regles: VERSION, date: new Date().toISOString().slice(0, 10), etiqueteur: L.etiqueteur, date_etiquetage: L.date,
  n, accords, taux: Math.round(po * 1000) / 10, kappa: Math.round(kappa * 100) / 100,
  matrice, graves: graves.map((g) => g.id),
  desaccords: lignes.filter((l) => l.outil !== l.humain),
  // Critères éliminatoires publiés, rangés d'office par la page d'étiquetage : mis à part pour ne pas gonfler l'accord
  prerempli: pre,
  accord_jugees: lignes.filter((l) => !pre.includes(l.id) && l.outil === l.humain).length,
  // Question plus grossière : appeler maintenant (prioritaire ou à préparer) ou pas (relire, refus)
  accord_appel: lignes.filter((l) => APPEL.includes(l.outil) === APPEL.includes(l.humain)).length,
};
fs.writeFileSync(new URL(process.argv[3] || "data/resultats.json", racine), JSON.stringify(resultats, null, 1));

console.log(`Règles v${VERSION} · ${n} candidatures · étiquetage : ${L.etiqueteur} (${L.date})`);
console.log(`Accord : ${accords}/${n} (${resultats.taux} %) · kappa de Cohen : ${resultats.kappa}`);
console.log(`Sur « appeler maintenant ou pas » : ${resultats.accord_appel}/${n}`);
if (pre.length) {
  const jugees = lignes.filter((l) => !pre.includes(l.id));
  console.log(`Dont ${pre.length} rangées d'office en refus (critère publié : ${pre.join(", ")}). Accord sur les ${jugees.length} jugées à la main : ${resultats.accord_jugees}/${jugees.length}`);
}
console.log(`Erreurs graves : ${graves.length ? graves.map((g) => g.id).join(", ") : "aucune"}`);
console.log("\nMatrice (lignes = humain, colonnes = outil)");
console.log("".padEnd(14) + ORDRE.map((o) => o.padStart(12)).join(""));
for (const h of ORDRE) console.log(h.padEnd(14) + ORDRE.map((o) => String(matrice[h][o]).padStart(12)).join(""));
console.log("\nDésaccords");
for (const d of resultats.desaccords) console.log(`${d.id}  humain=${FILES[d.humain]}  outil=${FILES[d.outil]}  score=${d.score}  [${d.alertes.join(", ")}]  ${d.note}`);
