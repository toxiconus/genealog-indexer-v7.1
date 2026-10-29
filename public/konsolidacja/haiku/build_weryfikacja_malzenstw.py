#!/usr/bin/env python3
"""Buduje weryfikacja_malzenstw.html. Użycie:
  build_weryfikacja_malzenstw.py SCANS_DIR OUT.html [--bez-skanow]
SCANS_DIR zawiera podkatalogi 'M 1944', 'M 1945' z plikami M<rok>_NN_*.jpg"""
import csv, json, glob, base64, os, sys, re
H = os.path.dirname(os.path.abspath(__file__))
scans_dir, out = sys.argv[1], sys.argv[2]
embed = '--bez-skanow' not in sys.argv
BASE = 'file:///J:/Genealog/Blin%C3%B3w%2C%20%C5%9Bw.%20Jana%20Chrzciciela/Blin%C3%B3w%20-%20lubgens/BLIN/M%C5%BB/'
years = sorted(int(re.search(r'MALZENSTWA_(\d{4})_', p).group(1)) for p in glob.glob(H + '/MALZENSTWA_*_ai1_import.csv'))
acts, reg, cols, scans, pola = [], {}, None, {}, {}
for y in years:
    rows = list(csv.reader(open(f'{H}/MALZENSTWA_{y}_ai1_import.csv', encoding='utf-8-sig', newline=''), delimiter=';'))
    cols = rows[0] + [c for c in ('margin_groom','margin_bride') if c not in rows[0]]
    roi = {r['id']: r for r in json.load(open(f'{H}/MALZENSTWA_{y}_ai1_roi.json', encoding='utf-8'))}
    pola.update(json.load(open(f'{H}/MALZENSTWA_{y}_ai1_pola.json', encoding='utf-8')) if os.path.exists(f'{H}/MALZENSTWA_{y}_ai1_pola.json') else {})
    reg[y] = json.load(open(f'{H}/MALZENSTWA_{y}_ai1_rejestr.json', encoding='utf-8'))
    for r in rows[1:]:
        d = dict(zip(cols, r))
        a = dict(id=d['id'], year=y, act=int(d['marriage_act_number']), ai=d, text=d.get('act_text', ''), roi=roi[d['id']])
        acts.append(a)
    for f in sorted(glob.glob(f'{scans_dir}/M {y}/M{y}_*.jpg')):
        key = re.match(r'(M\d{4}_\d+)', os.path.basename(f)).group(1)
        if embed:
            scans[key] = 'data:image/jpeg;base64,' + base64.b64encode(open(f, 'rb').read()).decode()
        else:
            scans[key] = BASE + f'M%20{y}/' + os.path.basename(f)
    for a in acts:
        k = a['roi']['plik']
        a['roi']['file'] = os.path.basename(next((f for f in glob.glob(f'{scans_dir}/M {a["year"]}/{k}_*.jpg')), k))
acts.sort(key=lambda a: (a['year'], a['act']))
# --- słownik nazwisk/imion/miejscowości wg płci (indeksy w repo + opcjonalnie zweryfikowane zgony: --zweryfikowane PLIK, waga 5)
import unicodedata
KONS = os.path.dirname(H)
C = {k: {} for k in ('s_m', 's_f', 'n_m', 'n_f', 'p')}
def _cnt(key, v, w=1):
    v = (v or '').strip()
    if v and not re.search(r'[?\d(]', v) and len(v) > 1: C[key][v] = C[key].get(v, 0) + w
def _scan(file, spec, fn=None):
    fp = os.path.join(KONS, file)
    if not os.path.exists(fp): return
    for r in csv.DictReader(open(fp, encoding='utf-8-sig'), delimiter=';'):
        for cols, key, first in spec:
            for c in cols:
                v = r.get(c) or ''
                if first: [ _cnt(key, x) for x in v.split()[:2] ]
                else: _cnt(key, v)
_scan('blinow_akty.csv', [(['ojciec_nazwisko'], 's_m', 0), (['matka_nazwisko'], 's_f', 0), (['ojciec_imiona'], 'n_m', 1), (['matka_imiona'], 'n_f', 1), (['miejscowosc'], 'p', 0)])
_scan('zgony.csv', [(['matka_nazwisko', 'rodowe'], 's_f', 0), (['ojciec_imie'], 'n_m', 1), (['matka_imie'], 'n_f', 1), (['miejscowosc'], 'p', 0)])
_scan('malzenstwa_mal.csv', [(['pan_nazwisko', 'pan_ojciec_nazwisko', 'panna_ojciec_nazwisko', 'swiadek1_nazwisko', 'swiadek2_nazwisko'], 's_m', 0), (['panna_nazwisko', 'pan_matka_nazwisko', 'panna_matka_nazwisko'], 's_f', 0), (['pan_imie', 'pan_ojciec_imie', 'panna_ojciec_imie', 'swiadek1_imie', 'swiadek2_imie'], 'n_m', 1), (['panna_imie', 'pan_matka_imie', 'panna_matka_imie'], 'n_f', 1), (['pan_miejscowosc', 'panna_miejscowosc'], 'p', 0)])
# zgony: nazwisko/imię zmarłego wg płci (kolumna plec: m/k)
fp = os.path.join(KONS, 'zgony.csv')
if os.path.exists(fp):
    for r in csv.DictReader(open(fp, encoding='utf-8-sig'), delimiter=';'):
        g = (r.get('plec') or '').strip().lower()
        if g in ('m', 'k'):
            _cnt('s_' + ('m' if g == 'm' else 'f'), r.get('nazwisko')); [_cnt('n_' + ('m' if g == 'm' else 'f'), x) for x in (r.get('imie') or '').split()[:2]]
if '--zweryfikowane' in sys.argv:
    vf = sys.argv[sys.argv.index('--zweryfikowane') + 1]
    for r in csv.DictReader(open(vf, encoding='utf-8-sig'), delimiter=';'):
        if r.get('verification_status') != 'ok': continue
        g = 'm' if (r.get('deceased_sex') or '').upper() == 'M' else 'f' if (r.get('deceased_sex') or '').upper() == 'K' else None
        if g:
            _cnt('s_' + g, r.get('deceased_last_name'), 5)
            for x in (r.get('deceased_first_name') or '').split()[:2]: _cnt('n_' + g, x, 5)
        _cnt('s_f', r.get('deceased_maiden_name'), 5); _cnt('s_m', r.get('father_last_name'), 5); _cnt('s_f', r.get('mother_last_name'), 5)
        for x in (r.get('father_first_name') or '').split()[:2]: _cnt('n_m', x, 5)
        for x in (r.get('mother_first_name') or '').split()[:2]: _cnt('n_f', x, 5)
        for c in ('deceased_residence', 'deceased_birth_place', 'death_place'): _cnt('p', (r.get(c) or '').split(',')[0], 5)
        for c in ('informant1', 'informant2'):
            w = (r.get(c) or '').split(',')[0].split()
            if len(w) >= 2 and '?' not in ' '.join(w): _cnt('n_m', w[0], 5); _cnt('s_m', w[-1], 5)
# poprawa pisowni: wariant bez ogonków (Jozef) scalany z wariantem z ogonkami (Józef), gdy ten ma >= wystąpień
def _fold(x): return unicodedata.normalize('NFD', x.lower()).replace('ł', 'l').encode('ascii', 'ignore').decode()
MERGED = []
for key, d in C.items():
    groups = {}
    for n, c in d.items(): groups.setdefault(_fold(n), []).append((n, c))
    for k, v in groups.items():
        dia = [x for x in v if not x[0].isascii()]
        plain = [x for x in v if x[0].isascii()]
        if dia and plain:
            best = max(dia, key=lambda x: x[1])
            for n, c in plain:
                if best[1] >= c and (key.startswith('n_') or key == 'p' or c <= 2 or best[1] >= 4 * c):
                    MERGED.append((key, n, c, best[0], best[1])); d[best[0]] += c; del d[n]
print('scalone pisownie bez ogonków:', len(MERGED)); [print('  ', m) for m in MERGED]
D = dict(counts=C, pola=pola, acts=acts, reg={str(k): v for k, v in reg.items()}, cols=cols, scans=scans)
t = open(H + '/weryfikacja_malzenstw_szablon.html', encoding='utf-8').read()
t = t.replace('/*DATA*/null', json.dumps(D, ensure_ascii=False).replace('</', '<\\/'))
open(out, 'w', encoding='utf-8').write(t)
print(out, len(t) // 1024, 'KB', len(acts), 'aktów', len(scans), 'skanów')
