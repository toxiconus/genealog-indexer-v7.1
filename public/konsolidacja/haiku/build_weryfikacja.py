#!/usr/bin/env python3
"""Buduje weryfikacja_zgonow.html (jeden plik, offline) z: ZGONY_ai1_import.csv, ZGONY_ai1_roi.json,
indeksu Lubgens (txt: NAZWISKO IMIE AKT ROK UWAGI), liczników nazwisk/imion z CSV w konsolidacji i skanów.
Użycie: build_weryfikacja.py LUBGENS.txt KATALOG_SKANOW OUT.html [--bez-skanow]"""
import csv, json, re, sys, os, base64, io, glob
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__)); kons = os.path.dirname(here)
lub_txt, scans_dir, out = sys.argv[1:4]
NO_SCANS = "--bez-skanow" in sys.argv[4:]
FIELDS = [("deceased_last_name","Nazwisko"),("deceased_first_name","Imię"),("deceased_maiden_name","Nazwisko rodowe"),("deceased_sex","Płeć (M/K)"),
 ("death_date","Data zgonu (RRRR-MM-DD)"),("death_time","Godzina zgonu"),("age","Wiek"),("deceased_status","Stan"),("deceased_spouse","Małżonek"),
 ("death_place","Miejsce zgonu"),("deceased_birth_place","Miejsce urodzenia"),("deceased_residence","Zamieszkanie"),("profession","Zawód"),
 ("father_first_name","Ojciec – imię"),("father_last_name","Ojciec – nazwisko"),("mother_first_name","Matka – imię"),("mother_last_name","Matka – nazwisko rodowe"),
 ("act_date","Data aktu (spisania)"),("informant1","Świadek 1"),("informant2","Świadek 2"),("officiant","Duchowny"),("notes","Uwagi")]
UNC = {"first_name":["deceased_first_name"],"date":["death_date"],"time":["death_time"],"age":["age"],"maiden":["deceased_maiden_name"],"birth":["deceased_birth_place"],
 "mother_last":["mother_last_name"],"father_last":["father_last_name"],"fa_last":["father_last_name"],"father_first":["father_first_name"],"father_first_name":["father_first_name"],
 "father":["father_first_name","father_last_name"],"mo":["mother_first_name","mother_last_name"],"informant1":["informant1"],"informant2":["informant2"],
 "spouse":["deceased_spouse"],"residence":["deceased_residence"],"spouse_maiden":["deceased_spouse"],"mother_first":["mother_first_name"],"fa_last":["father_last_name"]}
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
# --- rejestr alfabetyczny i protokoły (elementy do weryfikacji)
import unicodedata
REJ = json.load(open(os.path.join(here, "ZGONY_ai1_rejestr.json"), encoding="utf-8"))
REJ_FILES = {i["plik"] for i in REJ["items"] + REJ["prot"]}
fold = lambda t: "".join(c for c in unicodedata.normalize("NFD", (t or "").lower()) if not unicodedata.combining(c)).replace("ł", "l")
items = []
for it in REJ["items"]:
    k = (1943, it["act"]); cand = lub.get(k, [])
    pick = next((c for c in cand if fold(c[0]["deceased_last_name"])[:3] == fold(it["last"])[:3]), cand[0] if cand else None)
    a = {"id": it["id"], "kind": "rej", "year": 1943, "act": it["lp"], "file": it["plik"], "roi": it["roi"], "unc": it["unc"],
         "title": f'Rejestr Lp {it["lp"]} · akt {it["act"]}', "lubRaw": "", "lubName": "",
         "ai": {"deceased_last_name": it["last"], "deceased_first_name": it["first"], "death_act_number": str(it["act"])}, "lub": None, "alts": {}}
    cmp_ = []
    if pick:
        a["lub"] = {"deceased_last_name": pick[0]["deceased_last_name"], "deceased_first_name": pick[0]["deceased_first_name"].split()[0] if pick[0]["deceased_first_name"] else "", "death_act_number": str(it["act"])}
        cmp_.append(f'Lubgens akt {it["act"]}/1943: {pick[0]["deceased_last_name"]} {pick[0]["deceased_first_name"]}')
        a["lubRaw"] = pick[1]; a["lubName"] = f'{pick[0]["deceased_last_name"]} {pick[0]["deceased_first_name"]}'
    if k in ai:
        r = ai[k]; a["alts"] = {"deceased_last_name": [["akt", "AKT", r.get("deceased_last_name", "")]], "deceased_first_name": [["akt", "AKT", r.get("deceased_first_name", "")]]}
        cmp_.append(f'odczyt aktu {it["act"]}: {r.get("deceased_last_name","")} {r.get("deceased_first_name","")}')
    else: cmp_.append("akt poza skanami (brak odczytu aktu)")
    if it["uwaga"]: cmp_.append(it["uwaga"])
    a["cmp"] = " · ".join(cmp_)
    items.append(a)
nlub = len({n for (y, n) in lub if y == 1943})
for p in REJ["prot"]:
    items.append({"id": p["id"], "kind": "prot", "year": 1943 if p["id"].endswith("43") else 1944, "act": p["lp"], "file": p["plik"], "roi": p["roi"], "unc": p["unc"],
                  "title": p["title"], "ai": p["ai"], "lub": p.get("lub"), "alts": {}, "lubRaw": "", "lubName": "", "cmp": p["cmp"].replace("64 akty", f"{nlub} akty") if False else p["cmp"]})
# --- data aktu (spisania) z pełnego tekstu → podpowiedzi do daty zgonu
import datetime
_ORD = {"pierwszego":1,"drugiego":2,"trzeciego":3,"czwartego":4,"piątego":5,"szóstego":6,"siódmego":7,"ósmego":8,"dziewiątego":9,"dziesiątego":10,"jedenastego":11,"dwunastego":12,"trzynastego":13,"czternastego":14,"piętnastego":15,"szesnastego":16,"siedemnastego":17,"osiemnastego":18,"dziewiętnastego":19,"dwudziestego":20,"trzydziestego":30}
_MON = {"stycznia":1,"lutego":2,"marca":3,"kwietnia":4,"maja":5,"czerwca":6,"lipca":7,"sierpnia":8,"września":9,"października":10,"listopada":11,"grudnia":12}
ACTDATE = {}
_md = open(os.path.join(here, "ZGONY_ai1_pelny_tekst.md"), encoding="utf-8").read()
for _m in re.finditer(r"^## (ai1-(\d{4})-\d{3}) .*?^> Działo się we wsi \S+ dnia ([^\n]*?) (" + "|".join(_MON) + r") tysiąc", _md, re.S | re.M):
    _d = sum(_ORD.get(w, 0) for w in _m.group(3).split())
    if _d: ACTDATE[_m.group(1)] = datetime.date(int(_m.group(2)), _MON[_m.group(4)], _d)
# --- skany
scans = {}
for f in ([] if NO_SCANS else sorted(glob.glob(os.path.join(scans_dir, "*-image.jpg")))):
    nm = os.path.basename(f)
    if not any(o["plik"] == nm for o in roi.values()) and nm not in REJ_FILES: continue
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
        a["ai"]["act_date"] = ACTDATE[id_].isoformat() if id_ in ACTDATE else ""
        if id_ in ACTDATE:
            _d0 = ACTDATE[id_]; a["alts"] = {"death_date": [["akt", "wczoraj", (_d0 - datetime.timedelta(1)).isoformat()], ["akt", "dzisiaj", _d0.isoformat()], ["akt", "przedwczoraj", (_d0 - datetime.timedelta(2)).isoformat()]]}
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
POLA = json.load(open(os.path.join(here, "ZGONY_ai1_pola.json"), encoding="utf-8")).get("akty", {}) if os.path.exists(os.path.join(here, "ZGONY_ai1_pola.json")) else {}
for a in acts:
    if a["id"] in POLA: a["pola"] = POLA[a["id"]]["pola"]
acts += items
# --- pełny tekst Haiku (tryby tekstowe w narzędziu)
_TX = {}
for _blk in re.split(r"^## ", _md, flags=re.M)[1:]:
    _ls = _blk.split("\n"); _id = _ls[0].split(" ")[0]
    if not (_id.startswith("ai1-") or _id.startswith("prot-")): continue
    _t = " ".join(l[2:].strip() for l in _ls[1:] if l.startswith("> "))
    _n = [l.replace("**", "").strip() for l in _ls[1:] if l.strip() and not l.startswith("> ") and not l.startswith("Skan:") and l.strip() != "---"]
    if _t: _TX[_id] = (_t, _n)
for a in acts:
    if a["id"] in _TX: a["tekst"], a["tnotes"] = _TX[a["id"]]
FIELDS_PROT = [{"id": i, "label": l} for i, l in REJ["fields_prot"]]
FIELDS_REJ = [{"id": "deceased_last_name", "label": "Nazwisko (jak w rejestrze)"}, {"id": "deceased_first_name", "label": "Imię"}, {"id": "death_act_number", "label": "Nr aktu"}]
data = {"fieldsProt": FIELDS_PROT, "fieldsRej": FIELDS_REJ, "fields": [{"id": i, "label": l} for i, l in FIELDS], "acts": acts, "counts": {"s": S, "n": N}, "scans": scans, "cols": cols}
html = open(os.path.join(here, "weryfikacja_szablon.html"), encoding="utf-8").read()
html = html.replace("/*DATA*/null", json.dumps(data, ensure_ascii=False))
open(out, "w", encoding="utf-8").write(html)
print("akty:", len(acts), "z polami:", sum(1 for a in acts if a.get("pola")), "w tym rejestr/protokoły:", len(items), "z AI:", sum(1 for a in acts if a["ai"]), "z Lubgens-szczegółami:", sum(1 for a in acts if a["lubRaw"]), "skany:", len(scans), "MB:", round(len(html)/1e6,1))
