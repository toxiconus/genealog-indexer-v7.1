#!/usr/bin/env python3
"""Buduje prototyp/multitool_prototyp.html (pojedynczy plik, offline) z: szablon.html + ../../wspolne/*.js (/*MODULE:x*/) + ../moduly/*.js (/*MODUL:x*/) + dane.json (/*DATA*/).
Kontrola: budowa przerywa się, gdy w wyniku został niewstawiony znacznik albo brakuje wymaganego modułu. Uruchom: python3 prototyp/zbuduj.py"""
import os, re, sys, json
H = os.path.dirname(os.path.abspath(__file__)); K = os.path.join(H, '..', '..')
sys.path.insert(0, os.path.join(K, 'wspolne')); sys.dont_write_bytecode = True
from zbuduj import inline
WYMAGANE = {'MODULE': ['tekst', 'plik', 'raport'], 'MODUL': ['norm', 'identity', 'wystapienia', 'decyzje', 'db']}
t = open(os.path.join(H, 'szablon.html'), encoding='utf-8').read()
for typ, L in WYMAGANE.items():
    for m in L: assert '/*%s:%s*/' % (typ, m) in t, 'szablon nie wstawia modułu ' + m
t = inline(t)
t = re.sub(r'/\*MODUL:(\w+)\*/', lambda m: open(os.path.join(H, '..', 'moduly', m.group(1) + '.js'), encoding='utf-8').read(), t)
d = json.load(open(os.path.join(H, 'dane.json'), encoding='utf-8'))
assert d.get('format', {}).get('nazwa') == 'multitool-dane', 'zły format danych'
dane = json.dumps(d, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
assert 'const DANE = /*DATA*/;' in t; t = t.replace('const DANE = /*DATA*/;', 'const DANE = ' + dane + ';')
assert not re.search(r'/\*(MODULE|MODUL|DATA)[:*]', t), 'został niewstawiony znacznik'
open(os.path.join(H, 'multitool_prototyp.html'), 'w', encoding='utf-8').write(t)
print('multitool_prototyp.html', len(t.encode('utf-8')) // 1024, 'KB,', len(d['akty']), 'aktów')
