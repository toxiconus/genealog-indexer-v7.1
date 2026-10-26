#!/usr/bin/env python3
"""Buduje dopasowanie_osob.html z CSV w katalogu nadrzędnym (urodzenia, małżeństwa, zgony)."""
import sys as _sys, os as _os
_sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..', 'wspolne'))
from zbuduj import inline
import csv, json, os, re
here = os.path.dirname(os.path.abspath(__file__)); up = os.path.dirname(here)
def rd(f): return list(csv.DictReader(open(os.path.join(up, f), encoding='utf-8-sig'), delimiter=';'))
def yr(x):
    m = re.search(r'\d{4}', x or ''); return int(m.group()) if m else 0
def num(x):
    m = re.search(r'\d+', x or ''); return int(m.group()) if m else 0
B = [[r['id'], num(r['rok']), r['nr'], r['dziecko_nazwisko'], r['dziecko_imiona'], r['miejscowosc'], r['ojciec_imiona'], r['ojciec_nazwisko'], num(r['ojciec_wiek']), r['matka_imiona'], r['matka_nazwisko'], num(r['matka_wiek']), r['uwagi']] for r in rd('blinow_akty.csv') if num(r['rok'])]
D = [[r['id_archiwalne'], num(r['rok']), r['nazwisko'], r['imie'], r['plec'], r['miejscowosc'], num(r['wiek']), r['jednostka_wieku'], r['stan'], r['ojciec_imie'], r['matka_imie'], r['matka_nazwisko'], r['rodowe'], r['zyjacy_malzonek'], yr(r['rok_ur_wyliczony']), r['nr_wpisu']] for r in rd('zgony.csv') if num(r['rok'])]
M = [[f"{r['rok']}/{r['nr']}", num(r['rok']), r['nr'], r['data_tekst'], r['pan_nazwisko'], r['pan_imie'], r['pan_stan'], r['pan_ojciec_imie'], r['pan_ojciec_nazwisko'], r['pan_matka_imie'], r['pan_matka_nazwisko'], r['pan_miejscowosc'], num(r['pan_wiek']), num(r['pan_rok_ur_przyb']),
      r['panna_nazwisko'], r['panna_imie'], r['panna_stan'], r['panna_ojciec_imie'], r['panna_ojciec_nazwisko'], r['panna_matka_imie'], r['panna_matka_nazwisko'], r['panna_miejscowosc'], num(r['panna_wiek']), num(r['panna_rok_ur_przyb']),
      r['pan_poprzednia_zona_imie'], r['wdowa_poprzedni_maz_imie']] for r in rd('malzenstwa_mal.csv') if num(r['rok'])]
seen={}
for r in M:
    n=seen.get(r[0],0); seen[r[0]]=n+1
    if n: r[0]=r[0]+'-'+str(n+1)
tpl = open(os.path.join(here, 'szablon.html'), encoding='utf-8').read()
data = 'const B=' + json.dumps(B, ensure_ascii=False, separators=(',', ':')) + ';const D=' + json.dumps(D, ensure_ascii=False, separators=(',', ':')) + ';const M=' + json.dumps(M, ensure_ascii=False, separators=(',', ':')) + ';'
out = tpl.replace('/*DATA*/', data)
out = inline(out)
open(os.path.join(here, 'dopasowanie_osob.html'), 'w', encoding='utf-8').write(out)
print(len(B), len(D), len(M), round(len(out) / 1024), 'KB')
