"""Génère src/npa.js à partir du répertoire officiel des localités (swisstopo, données ouvertes) :
https://data.geo.admin.ch/ch.swisstopo-vd.ortschaftenverzeichnis_plz/ortschaftenverzeichnis_plz/ortschaftenverzeichnis_plz_4326.csv.zip
Usage : python3 outils/generer_npa.py chemin/AMTOVZ_CSV_WGS84.csv
Garde la Suisse romande (VD, GE, VS, NE, FR, JU, et le Jura bernois francophone)."""
import csv, json, sys, pathlib

CANTONS = {"VD", "GE", "VS", "NE", "FR", "JU"}
out = {}
with open(sys.argv[1], encoding="utf-8-sig") as f:
    for r in csv.DictReader(f, delimiter=";"):
        if not (r["Kantonskürzel"] in CANTONS or (r["Kantonskürzel"] == "BE" and r["Sprache"] == "fr")):
            continue
        npa = r["PLZ4"]
        ligne = [r["Ortschaftsname"], round(float(r["N"]), 4), round(float(r["E"]), 4)]
        if npa not in out or r["Zusatzziffer"] == "00":
            out[npa] = ligne
p = pathlib.Path(__file__).resolve().parent.parent / "src" / "npa.js"
p.write_text("// Généré par outils/generer_npa.py depuis le répertoire officiel des localités (swisstopo, données ouvertes).\n"
             "// NPA → [localité, latitude, longitude]. Suisse romande uniquement.\n"
             "export const NPA_CH = " + json.dumps(dict(sorted(out.items())), ensure_ascii=False, separators=(",", ":")) + ";\n",
             encoding="utf-8")
print(len(out), "NPA écrits dans", p, p.stat().st_size, "octets")
