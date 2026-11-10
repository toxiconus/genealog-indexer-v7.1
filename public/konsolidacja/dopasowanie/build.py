#!/usr/bin/env python3
"""Buduje dopasowanie_osob.html z CSV w katalogu nadrzędnym (urodzenia, małżeństwa, zgony)."""
import sys as _sys, os as _os
_sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'wspolne'))
from zbuduj import inline
import csv, json, os, re
here = os.path.dirname(os.path.abspath(__file__)); up = os.path.dirname(here)
def rd(f): return list(csv.DictReader(open(os.path.join(up, f), encoding='utf-8-sig'), delimiter=';'))
def js(o):  # JSON bezpieczny w bloku <script>: '</' -> '<\/', '<!--' -> '<\!--', U+2028/2029 jako escape
    return json.dumps(o, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/').replace('<!--', '<\\!--').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
def yr(x):
    m = re.search(r'\d{4}', x or ''); return int(m.group()) if m else 0
def num(x):
    m = re.search(r'\d+', x or ''); return int(m.group()) if m else 0
B = [[r['id'], num(r['rok']), r['nr'], r['dziecko_nazwisko'], r['dziecko_imiona'], r['miejscowosc'], r['ojciec_imiona'], r['ojciec_nazwisko'], num(r['ojciec_wiek']), r['matka_imiona'], r['matka_nazwisko'], num(r['matka_wiek']), r['uwagi']] for r in rd('blinow_akty.csv') if num(r['rok'])]
D = [[r['id_archiwalne'], num(r['rok']), r['nazwisko'], r['imie'], r['plec'], r['miejscowosc'], num(r['wiek']), r['jednostka_wieku'], r['stan'], r['ojciec_imie'], r['matka_imie'], r['matka_nazwisko'], r['rodowe'], r['zyjacy_malzonek'], yr(r['rok_ur_wyliczony']), r['nr_wpisu']] for r in rd('zgony.csv') if num(r['rok'])]
# zgony z zatwierdzonych odczytów skanów (1935, 1943-45) – tylko status ok; dane z katalogu haiku (opcjonalnie)
_zv = os.path.join(up, 'haiku', 'ZGONY_zweryfikowane_AKTUALNE.csv')
if os.path.exists(_zv):
    for r in csv.DictReader(open(_zv, encoding='utf-8-sig'), delimiter=';'):
        if r.get('verification_status') != 'ok' or not num(r.get('death_year')): continue
        a = (r.get('age') or '').strip(); unit = 'lat' if re.fullmatch(r'\d+', a) else ('mies' if 'mies' in a else ('dni' if re.search(r'dn|dzie', a) else ''))
        y = num(r['death_year']); ry = y - int(a) if re.fullmatch(r'\d+', a) else 0
        cl = lambda v: '' if (v or '').startswith('[') else (v or '').strip()
        D.append([f"Z-{y}/{num(r['death_act_number'])}", y, cl(r['deceased_last_name']), cl(r['deceased_first_name']), {'M': 'm', 'K': 'k'}.get(r.get('deceased_sex'), ''), cl(r['death_place']), num(a), unit, cl(r['deceased_status']), cl(r['father_first_name']), cl(r['mother_first_name']), cl(r['mother_last_name']), cl(r['deceased_maiden_name']), cl(r['deceased_spouse']), ry, str(num(r['death_act_number']))])
M = [[f"{r['rok']}/{r['nr']}", num(r['rok']), r['nr'], r['data_tekst'], r['pan_nazwisko'], r['pan_imie'], r['pan_stan'], r['pan_ojciec_imie'], r['pan_ojciec_nazwisko'], r['pan_matka_imie'], r['pan_matka_nazwisko'], r['pan_miejscowosc'], num(r['pan_wiek']), num(r['pan_rok_ur_przyb']),
      r['panna_nazwisko'], r['panna_imie'], r['panna_stan'], r['panna_ojciec_imie'], r['panna_ojciec_nazwisko'], r['panna_matka_imie'], r['panna_matka_nazwisko'], r['panna_miejscowosc'], num(r['panna_wiek']), num(r['panna_rok_ur_przyb']),
      r['pan_poprzednia_zona_imie'], r['wdowa_poprzedni_maz_imie']] for r in rd('malzenstwa_mal.csv') if num(r['rok'])]
seen={}
for r in M:
    n=seen.get(r[0],0); seen[r[0]]=n+1
    if n: r[0]=r[0]+'-'+str(n+1)
tpl = open(os.path.join(here, 'szablon.html'), encoding='utf-8').read()
data = 'const B=' + js(B) + ';const D=' + js(D) + ';const M=' + js(M) + ';'
# gospodarze z tabel likwidacyjnych 1864 (AP Lublin 168/1054) – wstępny odczyt AI (opcjonalnie)
G = []
_tl = os.path.join(up, 'haiku', 'TABELE_LIKWIDACYJNE_168_1054_odczyt_AI.csv')
if os.path.exists(_tl):
    _agg = {}
    for r in csv.DictReader(open(_tl, encoding='utf-8-sig'), delimiter=';'):
        nm = re.sub(r'\([^)]*\)', '', (r['gospodarz_pl'] or '').replace('?', '')).strip()
        t = nm.split()
        if len(t) < 2: continue
        sn, fn = t[0], ' '.join(t[1:])
        dz = (r['dzial'] or '')
        if re.search(r'[Pp]astwisko|Собрание|Межевой', dz): continue
        e = _agg.setdefault((sn, fn), [sn, fn, 0, []])
        if '?' in (r['gospodarz_pl'] or '') or 'niska' in (r['pewnosc'] or ''): e[2] = 1
        e[3].append([int(r['skan'] or 0), (r['lp'] if r['lp'] not in ('', '-') else r['nr_w_tabeli']) or '', r['razem_m'], r['razem_p'], (r['uwaga_przy_nazwisku'] or '')[:40]])
    G = list(_agg.values())
data += 'const G=' + js(G) + ';'
out = tpl.replace('/*DATA*/', data)
out = inline(out)
open(os.path.join(here, 'dopasowanie_osob.html'), 'w', encoding='utf-8').write(out)
print(len(B), len(D), len(M), round(len(out) / 1024), 'KB')
