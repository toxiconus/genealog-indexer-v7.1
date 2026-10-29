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
D = dict(pola=pola, acts=acts, reg={str(k): v for k, v in reg.items()}, cols=cols, scans=scans)
t = open(H + '/weryfikacja_malzenstw_szablon.html', encoding='utf-8').read()
t = t.replace('/*DATA*/null', json.dumps(D, ensure_ascii=False).replace('</', '<\\/'))
open(out, 'w', encoding='utf-8').write(t)
print(out, len(t) // 1024, 'KB', len(acts), 'aktów', len(scans), 'skanów')
