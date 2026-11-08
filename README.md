# Tri des candidatures d'intervenant·e·s : prototype pour MénageSimple

Prototype réalisé pour le deuxième tour du poste *Digital Projects & AI Assistant* (Stonks Holding AG).
**Non affilié à MénageSimple. Toutes les candidatures sont fictives.** Informations publiques consultées le 8 novembre 2026.

## Le problème

MénageSimple retient moins de 5 % des candidatures, après « une série d'entretiens ». Son formulaire public
s'arrête déjà sur un écran de refus quand le permis ou le casier manque. Tout le reste (expérience réelle,
fiabilité, créneaux, zone et transport) se découvre au téléphone. Le tri range les candidatures **avant**
l'appel, justifie chaque point par la phrase du candidat, et prépare les questions à poser.

## Les quatre files

| File | Règle |
|---|---|
| Refus | Uniquement les critères éliminatoires publiés : permis, casier, aucune expérience |
| À relire avant tout appel | Donnée incohérente : permis G avec adresse en Suisse, code postal introuvable, expérience déclarée contredite par le texte |
| Appel à préparer | Au moins un point d'attention, chacun accompagné d'une question à poser |
| Appel prioritaire | Score ≥ 7/10 et aucun point d'attention |

Barème sur 10 : expérience 3, fiabilité 3, disponibilité 2, engagement dans la durée 1, référence 1.
Tout est dans [`src/tri.js`](src/tri.js), rien n'est caché ailleurs. Aucun critère « mou » ne mène au refus.

## Reproduire

Aucune dépendance. Node 20 ou plus.

```
npm test                 # 16 tests, 1 limite connue marquée « todo »
npm run accord           # accord avec le tri humain : taux, kappa, matrice, désaccords
python3 -m http.server   # puis ouvrir http://localhost:8000
```

Régénérer les données :

```
python3 outils/generer_candidats.py                        # data/candidats.json et .js
python3 outils/generer_npa.py AMTOVZ_CSV_WGS84.csv         # src/npa.js
```

Le fichier `AMTOVZ_CSV_WGS84.csv` vient du répertoire officiel des localités, en données ouvertes :
https://data.geo.admin.ch/ch.swisstopo-vd.ortschaftenverzeichnis_plz/ortschaftenverzeichnis_plz/ortschaftenverzeichnis_plz_4326.csv.zip

## Comment l'accord a été mesuré

1. Les règles sont gelées dans git **avant** tout étiquetage humain (voir l'historique).
2. Une personne classe les 30 candidatures dans `etiquetage.html`, sans voir les sorties de l'outil, ni les noms ni les coordonnées.
3. `npm run accord` compare les deux classements. Une « erreur grave » est un bon profil refusé, ou un dossier douteux appelé en premier.

## Usage de l'IA

- **Pas dans la décision.** Écarter ou appeler quelqu'un pour un emploi doit pouvoir s'expliquer ligne par ligne.
- **Dans la fabrication.** Claude a servi à rédiger les candidatures fictives, à proposer le barème et à écrire le code ; tout a été relu.
- **Dans la vérification.** Tri humain à l'aveugle, après le gel des règles.

## Limites

- Le jeu de test a été écrit par la même main que les règles : l'accord mesuré est un plafond. Le vrai test, ce sont 50 vraies candidatures anonymisées.
- Les mots-clés ratent des tournures : synonymes, fautes, phrases indirectes, nombres composés en lettres (« dix-huit mois »).
- Distances à vol d'oiseau. Côté France, 7 communes frontalières seulement.
- Les « zones peu desservies » sont une hypothèse à valider avec l'équipe qui recrute.
