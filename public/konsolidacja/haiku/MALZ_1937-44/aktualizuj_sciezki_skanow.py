#!/usr/bin/env python3
"""Po przeniesieniu skanów wg plan_nazw_skanow.csv: przepisuje app/skany_zbiory.json na nowe ścieżki (folder 'Małżeństwa', pliki '<rok> USC/lub.blin.M....jpg') z sumami kontrolnymi."""
import csv, json, os, hashlib, re
H = os.path.dirname(os.path.abspath(__file__)); APP = os.path.join(os.path.dirname(os.path.dirname(H)), 'PROJEKT_multitool', 'app')
UP = '/mnt/user-data/uploads/'
plan = list(csv.DictReader(open(os.path.join(H, 'plan_nazw_skanow.csv'), encoding='utf-8-sig'), delimiter=';'))
by = {}
for r in plan: by.setdefault((r['folder_zrodlowy'], r['plik']), []).append(r)
def wybierz(fol, pl):   # preferuj wiersz z numerem aktu (nie sam protokół/okładka)
    L = by[(fol, pl)]; z = [r for r in L if re.search(r'\.M\.\d{4}\.\d{3}', r['nowa_nazwa'])]
    r = (z or L)[0]; return r['rok'] + ' USC/' + r['nowa_nazwa']
zb = os.path.join(APP, 'skany_zbiory.json'); d = json.load(open(zb, encoding='utf-8'))
sums = {}
for (fol, pl) in by:
    p = UP + fol + '/' + pl
    if os.path.exists(p): sums[(fol, pl)] = hashlib.sha256(open(p, 'rb').read()).hexdigest()[:16]
for nz, fol in (('malzenstwa_1944-45', '1944-1945 USC Szastarka'), ('malzenstwa_1937-44', '1937-1944 USC Szastarka')):
    z = d[nz]; z['folder'] = 'Małżeństwa'
    z['pliki'] = {k: wybierz(fol, v) for k, v in z['pliki'].items()}
    z['sumy'] = {}
    for (f2, pl), h in sums.items():
        if f2 == fol:
            for r in by[(f2, pl)]: z['sumy'][r['rok'] + ' USC/' + r['nowa_nazwa']] = h
json.dump(d, open(zb, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print({k: (len(v['pliki']), len(v['sumy'])) for k, v in d.items() if not k.startswith('_')})
