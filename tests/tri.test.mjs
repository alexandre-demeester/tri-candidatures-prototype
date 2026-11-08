// Lancer : node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { trier, dureeCiteeMois, localiser, CHAMPS_LUS, REGLES } from "../src/tri.js";

const CANDIDATS = JSON.parse(fs.readFileSync(new URL("../data/candidats.json", import.meta.url), "utf8"));
const base = () => structuredClone(CANDIDATS.find((c) => c.id === "C01")); // profil solide, aucune alerte

test("équité : changer le nom, l'e-mail, le téléphone ou l'adresse ne change rien au tri", () => {
  for (const c of CANDIDATS) {
    const autre = { ...structuredClone(c), prenom: "Jean", nom: "Martin", email: "x@exemple.invalid", telephone: "+41 00 000 00 00", adresse: "Rue Inconnue 1" };
    assert.deepEqual(trier(autre), trier(c), c.id);
  }
});

test("équité : le tri ne lit aucun champ d'identité", () => {
  for (const k of ["prenom", "nom", "email", "telephone", "adresse"]) assert.ok(!CHAMPS_LUS.includes(k), k);
});

test("reproductible : deux exécutions donnent exactement le même résultat", () => {
  for (const c of CANDIDATS) assert.deepEqual(trier(c), trier(structuredClone(c)));
});

test("critères éliminatoires : refus même avec un excellent profil", () => {
  for (const [champ, valeur] of [["permis", "aucun"], ["casier_vierge", false], ["experience_tranche", "jamais"]]) {
    const c = base(); c[champ] = valeur;
    const r = trier(c);
    assert.equal(r.file, "refus", champ);
    assert.equal(r.score, 0);
  }
});

test("le profil de référence passe en appel prioritaire", () => {
  const r = trier(base());
  assert.equal(r.file, "prioritaire");
  assert.equal(r.score, 10);
});

test("seuil : 7 sans alerte = prioritaire, 6 = à préparer", () => {
  const c = base(); c.reference = false; c.horizon = "3_12_mois"; c.disponibilites = { lun: ["matin"], mar: ["matin"], mer: ["matin"] }; c.heures_semaine = "10-20";
  assert.equal(trier(c).score, REGLES.seuil_prioritaire);
  assert.equal(trier(c).file, "prioritaire");
  c.disponibilites = { lun: ["matin"] }; c.heures_semaine = "5-10";
  assert.equal(trier(c).score, 6);
  assert.equal(trier(c).file, "a_preparer");
});

test("une incohérence de données passe avant le score : relecture humaine", () => {
  const c = base(); c.permis = "G"; // permis frontalier avec une adresse à Lausanne
  const r = trier(c);
  assert.equal(r.score, 10);
  assert.equal(r.file, "a_revoir");
});

test("un code postal inconnu n'est jamais deviné", () => {
  const c = base(); c.npa = "9999";
  assert.equal(trier(c).file, "a_revoir");
});

test("négation : « je n'ai pas prévenu » ne rapporte aucun point", () => {
  const c = base(); c.texte_fiabilite = "Je n'ai pas prévenu la cliente.";
  const f = trier(c).detail.find((d) => d.critere === "Fiabilité");
  assert.equal(f.points, 0);
});

test("négation limitée à la proposition : « si je ne peux pas venir, j'appelle la veille »", () => {
  const c = base(); c.texte_fiabilite = "Si je ne peux pas venir, j'appelle la cliente la veille.";
  assert.equal(trier(c).detail.find((d) => d.critere === "Fiabilité").points, 2);
});

test("« j'avais oublié mon téléphone » n'est pas compté comme « a prévenu »", () => {
  const c = base(); c.texte_fiabilite = "Une fois j'avais oublié mon téléphone.";
  assert.equal(trier(c).detail.find((d) => d.critere === "Fiabilité").points, 0);
});

test("durées citées dans le texte", () => {
  assert.equal(dureeCiteeMois("J'ai travaillé 6 ans chez des particuliers"), 72);
  assert.equal(dureeCiteeMois("Huit ans de ménage"), 96);
  assert.equal(dureeCiteeMois("Depuis 2016 je fais le ménage"), 120);
  assert.equal(dureeCiteeMois("18 mois dans un hôtel"), 18);
  assert.equal(dureeCiteeMois("Je suis motivée"), null);
  // « dix-huit » ne doit jamais être lu comme « huit » : mieux vaut aucune durée qu'une durée fausse
  assert.equal(dureeCiteeMois("dix-huit mois chez deux familles"), null);
});

test("limite connue : les nombres composés en toutes lettres ne sont pas lus", { todo: "« dix-huit mois », « un an et demi »" }, () => {
  assert.equal(dureeCiteeMois("dix-huit mois chez deux familles"), 18);
});

test("chaque alerte produit une question à poser à l'appel", () => {
  for (const c of CANDIDATS) {
    const r = trier(c);
    if (r.file === "refus") continue;
    assert.equal(r.questions.length, r.alertes.length, c.id);
  }
});

test("codes postaux : répertoire officiel pour la Suisse romande, table courte pour la France voisine", () => {
  assert.equal(localiser("1304")[0], "Cossonay-Ville");
  assert.equal(localiser("1304")[3], "CH");
  assert.equal(localiser("74100")[3], "FR");
  assert.equal(localiser("8000"), null); // Zurich : hors Suisse romande, donc signalé, pas deviné
});

test("« première expérience en Suisse » avec 6 ans d'hôtel ailleurs n'est pas une incohérence", () => {
  const c = base(); c.texte_experience = "C'est ma première expérience en Suisse. En Roumanie j'ai fait le ménage pendant 6 ans dans un hôtel : chambres, draps, sanitaires.";
  assert.ok(!trier(c).alertes.some((a) => a.code === "EXPERIENCE_INCOHERENTE"));
  c.texte_experience = "C'est ma première expérience, je suis très motivée pour apprendre le ménage et le repassage.";
  assert.equal(trier(c).file, "a_revoir");
});

test("moins d'un an d'expérience ou fiabilité 1/3 : jamais en appel prioritaire, toujours une question", () => {
  const c = base(); c.experience_tranche = "moins_1";
  let r = trier(c);
  assert.equal(r.file, "a_preparer");
  assert.ok(r.alertes.some((a) => a.code === "EXPERIENCE_COURTE"));
  const d = base(); d.texte_fiabilite = "J'ai prévenu mon chef le matin même.";
  r = trier(d);
  assert.equal(r.detail.find((x) => x.critere === "Fiabilité").points, 1);
  assert.equal(r.file, "a_preparer");
});
