#!/usr/bin/env python3
"""Buduje trzy pliki app/multitool_mini_{zgony,malzenstwa,urodzenia}.html (jeden plik, offline, na telefon, z całą bazą danego typu i odczytami AI).
Wejście: mini/szablon_mini.html, mini/pola_typow.json (node app/mini/zbuduj_pola.cjs), mini/dane_<typ>.json (node app/mini/zbuduj_dane_mini.cjs; wymaga zbudowanego multitool_v1.html).
Odczyty Haiku urodzeń 1896–97 (haiku/GENBAZA_849_urodzenia_1896-97_odczyt_AI_v2.csv, po baza_id) dochodzą jako podgląd „Odczyt Haiku” przy akcie."""
import os, json, re, csv
H = os.path.dirname(os.path.abspath(__file__)); HK = os.path.join(H, '..', '..', '..', 'haiku')
TYPY = {'zgon': ('zgony', 'Zgony', ['deceased_last_name', 'deceased_first_name']), 'malzenstwo': ('malzenstwa', 'Małżeństwa', ['groom_last_name', 'groom_first_name', 'bride_last_name', 'bride_first_name']),
        'chrzest': ('urodzenia', 'Urodzenia / chrzty', ['child_last_name', 'child_first_name'])}
t0 = open(os.path.join(H, 'szablon_mini.html'), encoding='utf-8').read(); pola = json.load(open(os.path.join(H, 'pola_typow.json'), encoding='utf-8'))
def dump(x): return json.dumps(x, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
for typ, (plik, nazwa, naz) in TYPY.items():
    baza = json.load(open(os.path.join(H, 'dane_%s.json' % typ), encoding='utf-8')); n_o = 0
    if typ == 'chrzest':
        idx = {a['i']: a for a in baza}; p = os.path.join(HK, 'GENBAZA_849_urodzenia_1896-97_odczyt_AI_v2.csv')
        if os.path.exists(p):
            for r in csv.DictReader(open(p, encoding='utf-8-sig'), delimiter=';'):
                a = idx.get(r.get('baza_id', ''))
                if a: a['o'] = {k: v for k, v in r.items() if v and v != '[niecz.]' and k not in ('plik', 'baza_id', 'rok_z_tekstu', 'rok_ustalony', 'czesc', 'zgodnosc_auto')}; n_o += 1
    t = t0.replace('/*NAZWA*/', nazwa)
    for m, v in [('/*TYP*/', dump(typ)), ('/*POLA*/', dump(pola[typ])), ('/*BAZA*/', dump(baza)), ('/*NAZ*/', dump(naz))]:
        assert t.count(m) == 1, m; t = t.replace(m, v)
    assert not re.search(r'\.innerHTML|insertAdjacentHTML|outerHTML', t), 'HTML wstawiany jako tekst'
    out = os.path.join(H, '..', 'multitool_mini_%s.html' % plik); open(out, 'w', encoding='utf-8').write(t)
    print(os.path.basename(out), len(t.encode()) // 1024, 'KB,', len(baza), 'aktów', ('(+%d odczytów Haiku)' % n_o) if n_o else '')
