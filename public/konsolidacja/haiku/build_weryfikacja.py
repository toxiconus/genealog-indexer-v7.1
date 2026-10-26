#!/usr/bin/env python3
"""Buduje weryfikacja_zgonow.html (jeden plik, offline) z: ZGONY_ai1_import.csv, ZGONY_ai1_roi.json,
indeksu Lubgens (txt: NAZWISKO IMIE AKT ROK UWAGI), liczników nazwisk/imion z CSV w konsolidacji i skanów.
Użycie: build_weryfikacja.py LUBGENS.txt KATALOG_SKANOW OUT.html"""
import csv, json, re, sys, os, base64, io, glob
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__)); kons = os.path.dirname(here)
lub_txt, scans_dir, out = sys.argv[1:4]
FIELDS = [("deceased_last_name","Nazwisko"),("deceased_first_name","Imię"),("deceased_maiden_name","Nazwisko rodowe"),("deceased_sex","Płeć (M/K)"),
 ("death_date","Data zgonu (RRRR-MM-DD)"),("death_time","Godzina zgonu"),("age","Wiek"),("deceased_status","Stan"),("deceased_spouse","Małżonek"),
 ("death_place","Miejsce zgonu"),("deceased_birth_place","Miejsce urodzenia"),("deceased_residence","Zamieszkanie"),("profession","Zawód"),
 ("father_first_name","Ojciec – imię"),("father_last_name","Ojciec – nazwisko"),("mother_first_name","Matka – imię"),("mother_last_name","Matka – nazwisko rodowe"),
 ("informant1","Świadek 1"),("informant2","Świadek 2"),("officiant","Duchowny"),("notes","Uwagi")]
UNC = {"first_name":["deceased_first_name"],"date":["death_date"],"time":["death_time"],"age":["age"],"maiden":["deceased_maiden_name"],"birth":["deceased_birth_place"],
 "mother_last":["mother_last_name"],"father_last":["father_last_name"],"fa_last":["father_last_name"],"father_first":["father_first_name"],"father_first_name":["father_first_name"],
 "father":["father_first_name","father_last_name"],"mo":["mother_first_name","mother_last_name"],"informant1":["informant1"],"informant2":["informant2"],
 "spouse":["deceased_spouse"],"spouse_maiden":["deceased_spouse"],"mother_first":["mother_first_name"],"fa_last":["father_last_name"]}
# --- AI
rd = csv.DictReader(open(os.path.join(here,"ZGONY_ai1_import.csv"),encoding="utf-8-sig"), delimiter=";"); cols = rd.fieldnames
ai = {}
for r in rd: ai[(int(r["death_year"]), int(r["death_act_number"]))] = r
roi = {o["id"]: o for o in json.load(open(os.path.join(here,"ZGONY_ai1_roi.json"),encoding="utf-8"))}
# --- Lubgens
def iso(d):
    m = re.match(r"(\d{1,2})\.(\d{1,2})\.(\d{4})", d); return f"{m[3]}-{int(m[2]):02d}-{int(m[1]):02d}" if m else ""
def parse(u):
    o = {}; 
    for t in [x.strip() for x in u.split(",")]:
        if not t: continue
        if t.startswith("O:"): o["father_first_name"] = t[2:].strip()
        elif t.startswith("M:"):
            p = t[2:].strip().split(" zd. ", 1); o["mother_first_name"] = p[0].strip()
            if len(p) > 1: o["mother_last_name"] = p[1].strip()
        elif t.startswith("zm."): o["death_date"] = iso(t[3:].strip())
        elif re.match(r"^(ż\.|mąż)", t): o["deceased_spouse"] = re.sub(r"^(ż\.|mąż)\s*", "", t) + (" (żona)" if t.startswith("ż.") else " (mąż)")
        elif t.startswith("ur. i zam."): o["deceased_birth_place"] = o["deceased_residence"] = t[10:].strip()
        elif t.startswith("ur."): o["deceased_birth_place"] = t[3:].strip()
        elif re.search(r"(^|\s)[lk]\.\s*\d+", t):
            m = re.match(r"^(?:zd\.\s*(.+?)\s+)?[lk]\.\s*(\d+)", t)
            if m:
                if m[1]: o["deceased_maiden_name"] = m[1]
                o["age"] = m[2]
        elif t.startswith("zd."): o["deceased_maiden_name"] = t[3:].strip()
        elif re.match(r"^szpital", t, re.I): o["death_place"] = t
        else: o["deceased_residence"] = t
    return o
lub = {}
for l in open(lub_txt, encoding="utf-8").read().split("\n"):
    p = l.split("\t")
    if len(p) >= 4 and p[2].strip().isdigit() and p[3].strip().isdigit():
        k = (int(p[3]), int(p[2])); o = parse(p[4]) if len(p) > 4 and p[4].strip() else {}
        o["deceased_last_name"], o["deceased_first_name"] = p[0].strip(), p[1].strip()
        lub.setdefault(k, []).append((o, (p[4].strip() if len(p) > 4 else "")))
# --- liczniki
S, N = {}, {}
def cnt(d, v):
    v = (v or "").strip()
    if v and not re.search(r"[?\d(]", v) and len(v) > 1: d[v] = d.get(v, 0) + 1
def scan(file, sc, nc):
    for r in csv.DictReader(open(os.path.join(kons, file), encoding="utf-8-sig"), delimiter=";"):
        for c in sc: cnt(S, r.get(c))
        for c in nc:
            for w in (r.get(c) or "").split()[:2]: cnt(N, w)
scan("blinow_akty.csv", ["dziecko_nazwisko","ojciec_nazwisko","matka_nazwisko"], ["dziecko_imiona","ojciec_imiona","matka_imiona"])
scan("zgony.csv", ["nazwisko","matka_nazwisko","rodowe"], ["imie","ojciec_imie","matka_imie"])
scan("malzenstwa_mal.csv", ["pan_nazwisko","panna_nazwisko","pan_ojciec_nazwisko","pan_matka_nazwisko","panna_ojciec_nazwisko","panna_matka_nazwisko","swiadek1_nazwisko","swiadek2_nazwisko"], ["pan_imie","panna_imie","pan_ojciec_imie","pan_matka_imie","panna_ojciec_imie","panna_matka_imie","swiadek1_imie","swiadek2_imie"])
for k in json.load(open(os.path.join(os.path.dirname(kons),"..","data","nazwiska_wszystkie.json"),encoding="utf-8")) if os.path.exists(os.path.join(os.path.dirname(kons),"..","data","nazwiska_wszystkie.json")) else []: S.setdefault(k, 1)
# --- skany
scans = {}
for f in sorted(glob.glob(os.path.join(scans_dir, "*-image.jpg"))):
    nm = os.path.basename(f)
    if not any(o["plik"] == nm for o in roi.values()): continue
    im = Image.open(f).convert("RGB"); im.thumbnail((1700, 1700)); b = io.BytesIO(); im.save(b, "JPEG", quality=76, optimize=True)
    scans[nm] = "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode()
# --- akty
acts = []
keys = sorted(set(ai) | set(lub))
for k in keys:
    y, n = k; id_ = f"ai1-{y}-{n:03d}"; a = {"id": id_, "year": y, "act": n}
    if k in ai:
        r = ai[k]; a["ai"] = {f: (r.get(f) or "").strip() for f, _ in FIELDS}
        unc = []
        for t in re.split(r"[;,]", r.get("uncertain_fields") or ""):
            unc += UNC.get(t.strip(), [t.strip()] if t.strip() in dict(FIELDS) else [])
        a["unc"] = unc; a["file"] = roi.get(id_, {}).get("plik", ""); a["roi"] = roi.get(id_, {}).get("roi")
    else: a["ai"] = None; a["unc"] = []; a["file"] = ""; a["roi"] = None
    if k in lub:
        cand = lub[k]
        # wybierz wpis o zgodnym nazwisku z AI, w razie braku – z najdłuższymi uwagami
        best = max(cand, key=lambda c: (len(c[1]), 0))
        if k in ai:
            for c in cand:
                if c[0]["deceased_last_name"][:3].lower() == a["ai"]["deceased_last_name"][:3].lower(): best = c
        a["lub"] = best[0]; a["lubRaw"] = best[1]; a["lubName"] = f'{best[0]["deceased_last_name"]} {best[0]["deceased_first_name"]}'
    else: a["lub"] = None; a["lubRaw"] = ""; a["lubName"] = ""
    acts.append(a)
data = {"fields": [{"id": i, "label": l} for i, l in FIELDS], "acts": acts, "counts": {"s": S, "n": N}, "scans": scans, "cols": cols}
html = open(os.path.join(here, "weryfikacja_szablon.html"), encoding="utf-8").read()
html = html.replace("/*DATA*/null", json.dumps(data, ensure_ascii=False))
open(out, "w", encoding="utf-8").write(html)
print("akty:", len(acts), "z AI:", sum(1 for a in acts if a["ai"]), "z Lubgens-szczegółami:", sum(1 for a in acts if a["lubRaw"]), "skany:", len(scans), "MB:", round(len(html)/1e6,1))
