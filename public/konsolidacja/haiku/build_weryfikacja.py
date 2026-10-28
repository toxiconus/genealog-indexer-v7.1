#!/usr/bin/env python3
"""Buduje weryfikacja_zgonow.html (jeden plik, offline) z: ZGONY_ai1_import.csv, ZGONY_ai1_roi.json,
indeksu Lubgens (txt: NAZWISKO IMIE AKT ROK UWAGI), liczników nazwisk/imion z CSV w konsolidacji i skanów.
Użycie: build_weryfikacja.py LUBGENS.txt KATALOG_SKANOW OUT.html [--bez-skanow]"""
import difflib, sys as _sys, os as _os
_sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'wspolne'))
from zbuduj import inline
import csv, json, re, sys, os, base64, io, glob
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__)); kons = os.path.dirname(here)
lub_txt, scans_dir, out = sys.argv[1:4]
NO_SCANS = "--bez-skanow" in sys.argv[4:]
PATHS = "--sciezki" in sys.argv[4:]
def _argv(name):
    a = sys.argv
    return a[a.index(name) + 1] if name in a and a.index(name) + 1 < len(a) else None
import glob as _g, re as _re
_det = sorted({1943} | {int(m.group(1)) for f in _g.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), "ZGONY_*_ai1_import.csv")) for m in [_re.search(r"ZGONY_(\d{4})_ai1_import", f)] if m})
ROKS = [int(x) for x in _argv("--rok").split(",")] if _argv("--rok") else _det   # domyślnie WSZYSTKIE lata z repo (dane + ROI zawsze komplet; skany z dysku przez scanBase)
ROK = ROKS[0]
def PLIK(n, y=None):  # 1943: ZGONY_ai1_*, inne roczniki: ZGONY_<rok>_ai1_*
    y = y or ROK
    return n if y == 1943 else n.replace("ZGONY_ai1_", f"ZGONY_{y}_ai1_")
SCAN_BASE = "file:///J:/Genealog/Blin%C3%B3w%2C%20%C5%9Bw.%20Jana%20Chrzciciela/Blin%C3%B3w%20-%20lubgens/BLIN/ZG/"
SCAN_FILES = {"5cc8b77f-image.jpg": "Z 1943/Z1943_01_akty_26-27.jpg", "3bbd47ee-image.jpg": "Z 1943/Z1943_02_akty_28-31.jpg", "afa8c781-image.jpg": "Z 1943/Z1943_03_akty_32-35.jpg", "3015eba3-image.jpg": "Z 1943/Z1943_04_akty_36-39.jpg", "25b5b43d-image.jpg": "Z 1943/Z1943_05_akty_40-43.jpg", "9e1e2337-image.jpg": "Z 1943/Z1943_06_akty_44-47.jpg", "5b08e11a-image.jpg": "Z 1943/Z1943_07_akty_48-51.jpg", "d0442207-image.jpg": "Z 1943/Z1943_08_akty_52-55.jpg", "53d47fae-image.jpg": "Z 1943/Z1943_09_akty_56-59.jpg", "d57620bf-image.jpg": "Z 1943/Z1943_10_akty_60-63.jpg", "38451dde-image.jpg": "Z 1943/Z1943_11_akty_64_i_rejestr.jpg", "a213c362-image.jpg": "Z 1943/Z1943_12_rejestr_55-64_i_protokol_1944_akty_1944-1-2.jpg"}
SCAN_FILES_1944 = {"3c6c8fd4-image.jpg": "Z 1944/Z1944_00_protokol_rew_1943_akty_1944-1-2.jpg", "c0627cd5-image.jpg": "Z 1944/Z1944_01_akty_3-6.jpg", "1763c719-image.jpg": "Z 1944/Z1944_02_akty_7-10.jpg", "b45acd19-image.jpg": "Z 1944/Z1944_03_akty_11-14.jpg", "31014979-image.jpg": "Z 1944/Z1944_04_akty_15-18.jpg", "3dd628ed-image.jpg": "Z 1944/Z1944_05_akty_19-22.jpg", "d127a549-image.jpg": "Z 1944/Z1944_06_akty_23-26.jpg", "eb975f71-image.jpg": "Z 1944/Z1944_07_akty_27-30.jpg", "b1ae65f7-image.jpg": "Z 1944/Z1944_08_akty_31-34.jpg", "cca77861-image.jpg": "Z 1944/Z1944_09_akty_35-38.jpg", "06e0c571-image.jpg": "Z 1944/Z1944_10_akty_39-42.jpg", "5323df7a-image.jpg": "Z 1944/Z1944_11_akty_43-46.jpg", "5d1d50eb-image.jpg": "Z 1944/Z1944_12_akty_47-50.jpg", "23efaa5f-image.jpg": "Z 1944/Z1944_13_akty_51-54.jpg", "32315861-image.jpg": "Z 1944/Z1944_14_akty_55-58.jpg", "1152635c-image.jpg": "Z 1944/Z1944_15_akt_59_protokol_rejestr.jpg", "f3c9d370-image.jpg": "Z 1944/Z1944_16_protokol_rew_1945_akty_1945-1-2.jpg"}
if ROKS == [1944]: SCAN_FILES = SCAN_FILES_1944
elif 1944 in ROKS: SCAN_FILES = {**SCAN_FILES, **SCAN_FILES_1944}
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
ai = {}; cols = None; roi = {}
for _y in ROKS:
    rd = csv.DictReader(open(os.path.join(here,PLIK("ZGONY_ai1_import.csv",_y)),encoding="utf-8-sig"), delimiter=";"); cols = cols or rd.fieldnames
    for r in rd: ai[(int(r["death_year"]), int(r["death_act_number"]))] = r
    roi.update({o["id"]: o for o in json.load(open(os.path.join(here,PLIK("ZGONY_ai1_roi.json",_y)),encoding="utf-8"))})
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
        elif re.match(r"^(ż\.|mąż)", t): o["deceased_spouse"] = re.sub(r"^(ż\.|mąż)\s*", "", t).strip()
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
        if int(p[3]) not in ROKS: continue
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
# --- słownik z zatwierdzonych CSV (--zweryfikowane PLIK, bez danych w repo) i pamięć poprawek AI→potwierdzone (--korekty PLIK.json)
def _arg(name):
    a = sys.argv
    return a[a.index(name) + 1] if name in a and a.index(name) + 1 < len(a) else None
FIX = {}
_ver = _arg("--zweryfikowane")
if _ver and os.path.exists(_ver):
    _SN = ["deceased_last_name","deceased_maiden_name","father_last_name","mother_last_name"]; _NM = ["deceased_first_name","father_first_name","mother_first_name"]
    _ai0 = {r["id"]: r for _y in ROKS for r in csv.DictReader(open(os.path.join(here, PLIK("ZGONY_ai1_import.csv", _y)), encoding="utf-8-sig"), delimiter=";")}
    _fx = lambda s: re.sub(r"[^a-ząćęłńóśźż ]", "", (s or "").lower())
    for r in csv.DictReader(open(_ver, encoding="utf-8-sig"), delimiter=";"):
        if r.get("verification_status") != "ok": continue
        for c in _SN:
            v = (r.get(c) or "").strip()
            if v and not re.search(r"[?\d(]", v) and len(v) > 1: S[v] = S.get(v, 0) + 5
        for c in _NM:
            for w in (r.get(c) or "").split()[:2]:
                if len(w) > 1 and "?" not in w: N[w] = N.get(w, 0) + 5
        for c in ("informant1", "informant2"):
            w = (r.get(c) or "").split(",")[0].split()
            if len(w) >= 2 and "?" not in " ".join(w): N[w[0]] = N.get(w[0], 0) + 5; S[w[-1]] = S.get(w[-1], 0) + 5
        o = _ai0.get(r["id"])
        if o:
            for c in _SN + _NM + ["informant1", "informant2", "deceased_residence", "deceased_birth_place"]:
                x = ((o.get(c) or "").split(",")[0]).split(); y = ((r.get(c) or "").split(",")[0]).split()
                if len(x) == len(y):
                    for p, q in zip(x, y):
                        p0 = p.rstrip("?"); 
                        if p0 and q and _fx(p0) != _fx(q) and len(p0) > 2 and "?" not in q and difflib.SequenceMatcher(None, _fx(p0), _fx(q)).ratio() >= 0.6:
                            k = _fx(p0); FIX.setdefault(k, {}); FIX[k][q] = FIX[k].get(q, 0) + 1
_kor = _arg("--korekty")
if _kor and os.path.exists(_kor):
    for k, d in json.load(open(_kor, encoding="utf-8")).items():
        for q, n in d.items(): FIX.setdefault(k, {}); FIX[k][q] = FIX[k].get(q, 0) + n
print("słownik: nazwisk", len(S), "imion", len(N), "poprawek AI→potwierdzone:", len(FIX))
# --- rejestr alfabetyczny i protokoły (elementy do weryfikacji)
import unicodedata
REJ = json.load(open(os.path.join(here, PLIK("ZGONY_ai1_rejestr.json", 1943 if 1943 in ROKS else ROK)), encoding="utf-8"))
if 1943 not in ROKS or isinstance(REJ, list): REJ = {"items": [], "prot": [], "fields_prot": []}
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
_md = "\n".join(open(os.path.join(here, PLIK("ZGONY_ai1_pelny_tekst.md", _y)), encoding="utf-8").read() for _y in ROKS)
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
POLA = {}
for _y in ROKS:
    _pf = os.path.join(here, PLIK("ZGONY_ai1_pola.json", _y))
    if os.path.exists(_pf): POLA.update(json.load(open(_pf, encoding="utf-8")).get("akty", {}))
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
data = {"fieldsProt": FIELDS_PROT, "fieldsRej": FIELDS_REJ, "fields": [{"id": i, "label": l} for i, l in FIELDS], "acts": acts, "counts": {"s": S, "n": N}, "scans": scans, "cols": cols, "fix": {k: max(d, key=d.get) for k, d in FIX.items()}}
data["scanFiles"] = SCAN_FILES; data["scanBase"] = SCAN_BASE
html = open(os.path.join(here, "weryfikacja_szablon.html"), encoding="utf-8").read()
html = html.replace("/*DATA*/null", json.dumps(data, ensure_ascii=False))
html = inline(html)
open(out, "w", encoding="utf-8").write(html)
print("akty:", len(acts), "z polami:", sum(1 for a in acts if a.get("pola")), "w tym rejestr/protokoły:", len(items), "z AI:", sum(1 for a in acts if a["ai"]), "z Lubgens-szczegółami:", sum(1 for a in acts if a["lubRaw"]), "skany:", len(scans), "MB:", round(len(html)/1e6,1))
