#!/usr/bin/env python3
"""Buduje app/multitool_mini.html (jeden plik, offline, na telefon) z mini/szablon_mini.html + mini/pola_typow.json (pola z konfiguracji Multitoola; odśwież: node app/mini/zbuduj_pola.cjs)."""
import os, json, re
H = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(H, 'szablon_mini.html'), encoding='utf-8').read()
pola = json.dumps(json.load(open(os.path.join(H, 'pola_typow.json'), encoding='utf-8')), ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
assert t.count('/*POLA*/') == 1; t = t.replace('/*POLA*/', pola)
assert not re.search(r'\.innerHTML|insertAdjacentHTML|outerHTML', t), 'HTML wstawiany jako tekst'
out = os.path.join(H, '..', 'multitool_mini.html'); open(out, 'w', encoding='utf-8').write(t); print('multitool_mini.html', len(t.encode()) // 1024, 'KB')
