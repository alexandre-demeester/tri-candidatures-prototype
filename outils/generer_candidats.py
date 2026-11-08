"""Génère data/candidats.json : 30 candidatures FICTIVES (noms, adresses, textes inventés).
Rédigées avec l'aide d'une IA (Claude) à partir des champs du formulaire public de
MénageSimple, puis relues à la main. Aucune donnée réelle."""
import json, pathlib

J = ["lun", "mar", "mer", "jeu", "ven", "sam"]
def dispo(spec):
    # "lun:ma mar:m" -> {"lun": ["matin","apres-midi"], "mar": ["matin"]}
    out = {}
    for tok in spec.split():
        j, c = tok.split(":")
        out[j] = (["matin"] if "m" in c else []) + (["apres-midi"] if "a" in c else [])
    return out

L, NY, AU, MV, LU, EC, YV, VA, PA = ("Vaud - Lausanne et alentours", "Vaud - Nyon et alentours", "Vaud - Aubonne",
    "Vaud - Montreux-Vevey", "Vaud - Lucens", "Vaud - Echallens", "Vaud - Yverdon et alentours", "Vaud - Vallorbe", "Vaud - Palézieux")
GE, SI, MA, EV = "Genève et alentours", "Valais - Sion et Sierre", "Valais - Martigny-Aigle-St Maurice", "Valais - Evolène"
NE, CF, FR, BU, PY = "Neuchâtel - Ville et alentours", "Neuchâtel - La Chaux-de-Fonds", "Fribourg - Ville et alentours", "Fribourg - Bulle", "Fribourg - Payerne"

C = []
def add(prenom, nom, rue, npa, localite, pays, permis, casier, tranche, heures, transport, zones, dsp, horizon, ref, fr, phone, services, exp, fia):
    i = len(C) + 1
    C.append({
        "id": f"C{i:02d}", "fictif": True, "prenom": prenom, "nom": nom,
        "email": f"candidat{i:02d}@exemple.invalid", "telephone": f"+41 79 000 00 {i:02d}",
        "adresse": f"{rue}, {npa} {localite}", "npa": npa, "pays": pays,
        "permis": permis, "casier_vierge": casier, "experience_tranche": tranche,
        "heures_semaine": heures, "transport": transport, "zones": zones,
        "disponibilites": dispo(dsp), "horizon": horizon, "reference": ref,
        "francais": fr, "smartphone": phone, "services": services,
        "texte_experience": exp, "texte_fiabilite": fia,
    })

add("Ana", "Ferreira", "Rue de la Borde 12", "1004", "Lausanne", "CH", "B", True, "plus_5", "20-30", "tp", [L],
    "lun:m mar:ma mer:m jeu:ma ven:m", "plus_1_an", True, "courant", True, ["regulier", "repassage"],
    "J'ai travaillé 6 ans chez des particuliers à Lausanne, surtout des familles avec enfants. Je fais les sols, la cuisine, les salles de bain et le repassage.",
    "Une fois mon fils était malade. J'ai appelé la cliente la veille au soir et on a décalé au lendemain.")
add("Besnik", "Krasniqi", "Avenue du Silo 4", "1020", "Renens", "CH", "C", True, "plus_2", "30+", "voiture", [L, EC],
    "lun:ma mar:ma mer:ma jeu:ma ven:ma", "plus_1_an", True, "courant", True, ["regulier", "a_fond", "fin_de_bail", "vitres"],
    "Trois ans dans une entreprise de nettoyage, surtout des bureaux et des cabinets médicaux, puis deux ans chez des particuliers. Aspirateur, serpillière, sanitaires, vitres.",
    "Ça m'est arrivé avec une panne de voiture. J'ai envoyé un message tout de suite au client et j'ai proposé de venir l'après-midi.")
add("Maria", "Rossi", "Rue de Carouge 40", "1205", "Genève", "CH", "suisse", True, "plus_5", "10-20", "tp", [GE],
    "lun:m mer:m ven:m", "plus_1_an", False, "courant", True, ["regulier"],
    "Depuis 2015 je fais le ménage chez des personnes âgées du quartier. La poussière, le linge, la cuisine, parfois les courses.",
    "Je préviens toujours la personne à l'avance par téléphone, et je propose un autre jour dans la même semaine.")
add("Tesfaye", "Gebremedhin", "Rue des Moulins 8", "1400", "Yverdon-les-Bains", "CH", "B", True, "plus_2", "20-30", "tp", [YV],
    "lun:ma mar:ma mer:ma", "3_12_mois", True, "intermediaire", True, ["regulier"],
    "2 ans à l'hôtel à Yverdon comme femme de chambre : les lits, les draps, les salles de bain. Avant j'ai aidé une famille pour le ménage.",
    "J'ai prévenu mon chef le matin même parce que le bus était en grève.")
add("Lucia", "Martins", "Route de Divonne 3", "1260", "Nyon", "CH", "B", True, "moins_1", "5-10", "voiture", [NY],
    "mar:m jeu:m", "3_12_mois", False, "courant", True, ["regulier"],
    "J'ai fait quelques mois de ménage chez une voisine.",
    "Je ne suis jamais absente.")
add("Kevin", "Dubois", "Rue du Rhône 22", "1950", "Sion", "CH", "suisse", True, "jamais", "10-20", "voiture", [SI],
    "lun:ma mar:ma", "3_12_mois", False, "courant", True, ["regulier"],
    "Je n'ai jamais fait de ménage professionnellement mais je suis très motivé, je tiens mon appartement impeccable et j'apprends vite.",
    "Au travail je préviens toujours mon responsable à l'avance si j'ai un empêchement.")
add("Fatima", "Benali", "Rue du Salève 15", "74100", "Annemasse", "FR", "G", True, "plus_5", "20-30", "voiture", [GE],
    "lun:ma mar:ma mer:m jeu:ma ven:m", "plus_1_an", True, "courant", True, ["regulier", "repassage", "vitres"],
    "Huit ans de ménage chez des particuliers à Genève et Annemasse : villas, appartements, repassage, vitres, cuisine.",
    "Quand ma fille a eu la varicelle, j'ai prévenu mes clientes deux jours avant et une collègue m'a remplacée.")
add("João", "Pereira", "Rue de Lyon 51", "1201", "Genève", "CH", "G", True, "plus_2", "20-30", "tp", [GE],
    "lun:ma mar:ma mer:ma", "plus_1_an", True, "courant", True, ["regulier", "a_fond"],
    "J'ai travaillé 4 ans pour une entreprise de nettoyage à Genève : bureaux, écoles, sols, sanitaires et vitres.",
    "J'ai eu un accident de vélo. J'ai appelé mon responsable tout de suite et un collègue m'a remplacé.")
add("Elena", "Popescu", "Rue de l'Écluse 30", "2000", "Neuchâtel", "CH", "B", True, "plus_5", "20-30", "tp", [NE],
    "lun:ma mar:ma mer:m jeu:m", "plus_1_an", True, "intermediaire", True, ["regulier"],
    "C'est ma première expérience en Suisse. En Roumanie j'ai fait le ménage pendant 6 ans dans un hôtel : chambres, draps, sanitaires.",
    "À l'hôtel, si je ne pouvais pas venir, je prévenais la gouvernante la veille et on échangeait avec une collègue.")
add("Sandra", "Oliveira", "Avenue des Alpes 70", "1820", "Montreux", "CH", "C", True, "plus_2", "10-20", "tp", [MV],
    "mar:ma jeu:ma", "plus_1_an", True, "courant", True, ["regulier", "repassage"],
    "J'ai travaillé 1 an chez une famille à Vevey, ménage complet et repassage, la cuisine et les salles de bain.",
    "J'ai envoyé un SMS à la famille la veille et je suis venue le samedi à la place.")
add("Ardit", "Berisha", "Avenue de France 18", "1003", "Lausanne", "CH", "aucun", True, "plus_5", "30+", "tp", [L],
    "lun:ma mar:ma mer:ma jeu:ma ven:ma", "plus_1_an", True, "courant", True, ["regulier", "a_fond"],
    "Sept ans dans le nettoyage de bureaux et d'appartements, aspirateur, sols, vitres, sanitaires.",
    "J'ai toujours prévenu à l'avance et proposé une autre date.")
add("Nathalie", "Rochat", "Rue de Lausanne 9", "1700", "Fribourg", "CH", "suisse", False, "plus_5", "10-20", "voiture", [FR],
    "lun:ma mar:ma", "plus_1_an", True, "courant", True, ["regulier"],
    "Dix ans chez des particuliers à Fribourg, ménage, linge et repassage, cuisine.",
    "Je préviens la veille par téléphone et je rattrape les heures le lendemain.")
add("Rosa", "Gomes", "Rue de Gruyères 5", "1630", "Bulle", "CH", "C", True, "plus_5", "20-30", "tp", [BU, FR],
    "lun:ma mar:ma mer:m jeu:m", "plus_1_an", True, "courant", True, ["regulier", "repassage"],
    "Depuis 2017 je fais le ménage chez trois familles à Bulle : sols, cuisine, salles de bain, repassage.",
    "Ma voiture est tombée en panne : j'ai appelé la cliente tout de suite et on a reporté au jeudi.")
add("Mirela", "Hodžić", "Grand-Rue 2", "1522", "Lucens", "CH", "B", True, "plus_2", "10-20", "tp", [LU],
    "lun:ma mer:ma", "plus_1_an", True, "courant", True, ["regulier"],
    "3 ans dans un EMS : chambres, sanitaires, désinfection des surfaces, linge.",
    "J'ai prévenu ma cheffe la veille et j'ai rattrapé mes heures le samedi.")
add("Paolo", "Bianchi", "Avenue de l'Europe 11", "1870", "Monthey", "CH", "B", True, "plus_2", "30+", "voiture", [MA],
    "lun:m mar:m mer:m jeu:m", "plus_1_an", True, "courant", True, ["regulier", "a_fond", "fin_de_bail"],
    "Trois ans comme concierge dans des immeubles à Monthey : escaliers, sols, vitres, nettoyage de fin de bail.",
    "J'ai appelé la régie la veille et j'ai proposé de venir le samedi matin.")
add("Aylin", "Demir", "Rue Centrale 20", "1110", "Morges", "CH", "B", True, "plus_2", "10-20", "tp", [L, AU],
    "lun:ma mar:ma mer:ma", "moins_3_mois", True, "courant", True, ["regulier"],
    "Pendant mes études j'ai fait 2 ans de ménage dans un EMS à Morges, les chambres et les sanitaires.",
    "J'ai prévenu la responsable une semaine avant pour mes examens et une collègue a pris mes heures.")
add("Ngozi", "Okafor", "Rue de Livron 6", "1217", "Meyrin", "CH", "B", True, "plus_2", "20-30", "tp", [GE],
    "lun:ma mar:ma mer:ma", "plus_1_an", False, "debutant", True, ["regulier"],
    "Je travaille 3 ans nettoyage bureaux Genève. Sol, poubelle, toilette, cuisine. Je suis sérieuse et je travaille bien.",
    "Si malade je téléphone le chef avant et il trouve autre personne.")
add("Helena", "Silva", "Rue du Temple 7", "1304", "Cossonay", "CH", "C", True, "plus_5", "20-30", "voiture", [L, AU],
    "lun:ma mar:ma mer:ma", "plus_1_an", True, "courant", True, ["regulier", "repassage"],
    "Six ans chez des particuliers dans la région de Morges et Cossonay : cuisine, salles de bain, sols, repassage.",
    "J'ai prévenu la cliente deux jours avant et nous avons décalé au vendredi.")
add("Marco", "Ferri", "Chemin du Lac 3", "1196", "Gland", "CH", "suisse", True, "plus_5", "10-20", "voiture", [NY],
    "lun:ma mer:ma", "plus_1_an", True, "courant", False, ["regulier", "vitres"],
    "J'ai tenu le ménage de deux villas à Gland pendant 7 ans : sols, vitres, cuisine, linge.",
    "J'ai appelé la propriétaire la veille et je suis venu le lendemain.")
add("Daniela", "Costa", "Rue du Simplon 14", "1800", "Vevey", "CH", "B", True, "1_2", "10-20", "tp", [MV],
    "lun:m mar:ma jeu:ma", "plus_1_an", True, "courant", True, ["regulier", "repassage"],
    "J'ai fait dix-huit mois de ménage chez deux familles à Vevey : cuisine, salles de bain, repassage.",
    "Je n'ai pas pu prévenir à temps une fois, j'avais oublié mon téléphone. Depuis je mets un rappel la veille.")
add("Inês", "Rodrigues", "Rue Ancienne 33", "1227", "Carouge", "CH", "C", True, "plus_5", "20-30", "tp", [GE],
    "lun:ma mar:ma mer:m jeu:ma", "plus_1_an", True, "courant", True, ["regulier", "a_fond", "repassage"],
    "Douze ans chez des familles à Carouge et Genève : ménage complet, repassage, vitres, sols.",
    "Quand j'ai été opérée, j'ai prévenu mes clients deux semaines à l'avance et j'ai proposé une collègue de confiance pour me remplacer.")
add("Sami", "Haddad", "Rue Léopold-Robert 50", "2300", "La Chaux-de-Fonds", "CH", "B", True, "plus_2", "20-30", "voiture", [CF, NE],
    "lun:ma mar:m mer:m jeu:ma ven:m", "plus_1_an", False, "courant", True, ["regulier", "a_fond"],
    "J'ai travaillé 3 ans dans une entreprise de nettoyage : bureaux, cabinets, sols, vitres et sanitaires.",
    "J'ai appelé le client dès que j'ai su que j'étais malade et on a trouvé une autre date.")
add("Giulia", "Romano", "Rue de la République 4", "25300", "Pontarlier", "FR", "G", True, "plus_2", "10-20", "voiture", [VA, CF],
    "lun:ma mar:ma mer:ma", "plus_1_an", True, "courant", True, ["regulier"],
    "4 ans de ménage chez des particuliers et dans un gîte à Pontarlier : chambres, draps, cuisine, sanitaires.",
    "J'ai prévenu la propriétaire du gîte la veille et une amie m'a remplacée.")
add("Olga", "Ivanova", "Avenue de Cour 60", "1006", "Lausanne", "CH", "B", True, "plus_5", "20-30", "tp", [L],
    "lun:ma mar:ma mer:ma", "plus_1_an", True, "courant", True, ["regulier"],
    "Je suis une personne sérieuse, organisée et très motivée. J'aime que tout soit propre et bien rangé, c'est ma passion depuis toujours et je donne toujours le meilleur de moi-même.",
    "Je suis toujours ponctuelle et je respecte mes engagements, ça ne m'est jamais arrivé.")
add("Adriana", "Lopes", "Place de la Gare 2", "1040", "Echallens", "CH", "B", True, "plus_2", "10-20", "voiture", [EC, L],
    "lun:ma mer:ma", "3_12_mois", False, "courant", True, ["regulier"],
    "J'ai travaillé 3 ans chez des particuliers à Echallens : cuisine, sols, salles de bain.",
    "J'ai prévenu la cliente la veille par message.")
add("Liridona", "Gashi", "Rue de la Poste 10", "1920", "Martigny", "CH", "C", True, "plus_2", "10-20", "voiture", [MA],
    "lun:m mar:m jeu:m", "3_12_mois", False, "courant", True, ["regulier", "repassage"],
    "J'ai fait 4 ans de ménage chez des familles à Martigny : sols, cuisine, salles de bain, repassage.",
    "J'ai appelé la famille à l'avance et j'ai proposé de venir le vendredi à la place.")
add("Thomas", "Meier", "Avenue Général-Guisan 12", "3960", "Sierre", "CH", "suisse", True, "1_2", "5-10", "voiture", [SI],
    "sam:ma", "plus_1_an", False, "intermediaire", True, ["regulier", "vitres"],
    "Je nettoie depuis un an et demi des appartements de vacances à Crans-Montana le samedi, entre deux locations : lits, cuisine, sanitaires.",
    "Si je ne peux pas venir, j'écris au propriétaire le jeudi pour qu'il trouve quelqu'un.")
add("Carla", "Mendes", "Route Principale 1", "1983", "Evolène", "CH", "C", True, "plus_5", "20-30", "voiture", [EV, SI],
    "lun:ma mar:ma mer:ma jeu:m", "plus_1_an", True, "courant", True, ["regulier", "a_fond"],
    "Depuis 2016 je fais le ménage de chalets et d'appartements à Evolène et aux Haudères : cuisine, sols, lits, vitres.",
    "J'ai prévenu le propriétaire la veille à cause de la neige et je suis venue le lendemain matin.")
add("Yusuf", "Aydın", "Grande Rue 21", "74160", "Saint-Julien-en-Genevois", "FR", "B", True, "plus_2", "20-30", "voiture", [GE],
    "lun:ma mar:ma mer:ma", "plus_1_an", True, "courant", True, ["regulier", "fin_de_bail"],
    "Trois ans dans une entreprise de nettoyage à Genève : fins de bail, sols, vitres, cuisines.",
    "J'ai prévenu le chef d'équipe la veille et j'ai fait les heures le samedi.")
add("Beatriz", "Santos", "Rue de Lausanne 25", "1030", "Bussigny", "CH", "B", True, "moins_1", "20-30", "tp", [L],
    "lun:ma mar:ma mer:ma jeu:ma", "plus_1_an", True, "courant", True, ["regulier", "vitres"],
    "8 mois dans une entreprise de nettoyage : bureaux, sols, vitres, sanitaires. Avant je gardais des enfants dans une famille.",
    "J'ai prévenu mon responsable la veille et j'ai proposé de rattraper le samedi.")

assert len(C) == 30
p = pathlib.Path(__file__).resolve().parent.parent / "data" / "candidats.json"
p.write_text(json.dumps(C, ensure_ascii=False, indent=1), encoding="utf-8")
# Copie en script classique pour la page d'étiquetage (ouvrable en file://, sans serveur)
p.with_suffix(".js").write_text("window.CANDIDATS = " + json.dumps(C, ensure_ascii=False) + ";\n", encoding="utf-8")
print("écrit", p, len(C))
