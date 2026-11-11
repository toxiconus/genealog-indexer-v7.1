#!/usr/bin/env python3
"""Buduje app/multitool_v1.html (jeden plik, offline) z: szablon_app.html + ../../wspolne/*.js (/*MODULE:x*/) + app/moduly/*.js (/*MODUL:x*/) + app/dane_zgony.json (/*DATA*/).
Kontrole (budowa przerywa się): wymagane moduły są w szablonie; nie został żaden niewstawiony znacznik; format danych; innerHTML/insertAdjacentHTML/outerHTML tylko w ui_*.js; rozmiar wyniku (ostrzeżenie > 8 MB).
Uruchom: python3 app/zbuduj_app.py   (dane: python3 app/zbuduj_dane_app.py)"""
import os, re, sys, json, hashlib
H = os.path.dirname(os.path.abspath(__file__)); K = os.path.join(H, '..', '..')
sys.path.insert(0, os.path.join(K, 'wspolne')); sys.dont_write_bytecode = True
from zbuduj import inline
WYMAGANE = {'MODULE': ['tekst', 'plik', 'historia'], 'MODUL': ['raport_zgonow', 'dane_adapter', 'akt_zgon', 'typy_aktow', 'stan_idb', 'kopie', 'import_csv', 'migracja_zgony', 'ui_html', 'ui_akt', 'ui_skan', 'ui_narzedzia', 'ui_migracja', 'ui_powloka']}
t = open(os.path.join(H, 'szablon_app.html'), encoding='utf-8').read()
for typ, L in WYMAGANE.items():
    for m in L: assert '/*%s:%s*/' % (typ, m) in t, 'szablon nie wstawia modułu ' + m
t = inline(t)
def modul(m):
    p = os.path.join(H, 'moduly', m.group(1) + '.js'); s = open(p, encoding='utf-8').read()
    if not m.group(1).startswith('ui_') and re.search(r'\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML\(', s): sys.exit('HTML wstawiany poza ui_*.js: ' + m.group(1))
    return s
t = re.sub(r'/\*MODUL:(\w+)\*/', modul, t)
raw = open(os.path.join(H, 'dane_zgony.json'), 'rb').read(); d = json.loads(raw.decode('utf-8'))
assert d.get('format', {}).get('nazwa') == 'multitool-dane', 'zły format danych'
d['suma'] = hashlib.sha256(raw).hexdigest()
dane = json.dumps(d, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
assert 'const DANE = /*DATA*/;' in t; t = t.replace('const DANE = /*DATA*/;', 'const DANE = ' + dane + ';')
# krok 5: małżeństwa i chrzty (osobne pliki danych; budowa: python3 app/zbuduj_dane_app.py --typy)
def wczytaj_typ(nazwa):
    r = open(os.path.join(H, nazwa), 'rb').read(); x = json.loads(r.decode('utf-8')); assert x.get('format', {}).get('nazwa') == 'multitool-dane' and x.get('typ'), 'zły format danych: ' + nazwa; return x
typy = [wczytaj_typ('dane_malzenstwa.json'), wczytaj_typ('dane_chrzty.json')]
dane_typy = json.dumps(typy, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
assert 'const DANE_TYPY = /*DATA_TYPY*/;' in t; t = t.replace('const DANE_TYPY = /*DATA_TYPY*/;', 'const DANE_TYPY = ' + dane_typy + ';')
d['akty'] = d['akty'] + [x for y in typy for x in y['akty']]   # tylko do podsumowania poniżej
assert not re.search(r'/\*(MODULE|MODUL|JSON|DATA|DATA_TYPY)[:*]', t), 'został niewstawiony znacznik'
# szablon (poza modułami ui_) nie może sam używać innerHTML
assert not re.search(r'\.innerHTML\s*=', open(os.path.join(H, 'szablon_app.html'), encoding='utf-8').read()), 'innerHTML w szablonie'
open(os.path.join(H, 'multitool_v1.html'), 'w', encoding='utf-8').write(t)
kb = len(t.encode('utf-8')) // 1024
print('multitool_v1.html', kb, 'KB,', len(d['akty']), 'aktów', '(UWAGA: ponad 8 MB)' if kb > 8192 else '')
