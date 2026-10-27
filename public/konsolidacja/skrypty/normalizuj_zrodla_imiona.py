#!/usr/bin/env python3
"""Normalizacja imion rodziców (dopełniacz -> mianownik) w ŹRÓDŁACH: partie/reczne/hand_*.txt (pola ojc=, mat=)
oraz partie/akty_free_*.csv (ojciec_imie, matka_imie). Surowy zapis (kol.G itd.) zostaje w polach tekstowych.
Wstrzymane: ojciec Franciszka/Stanisława. Użycie: python3 normalizuj_zrodla_imiona.py [--zapisz]"""
import csv, glob, os, re, sys
here = os.path.dirname(os.path.abspath(__file__)); up = os.path.dirname(here)
sys.path.insert(0, here)
from normalizuj_imiona_rodzicow import mianownik
n = 0
def fix(col, v):
    global n
    new, why = mianownik(col, v)
    if why and why != 'WSTRZYMANE': n += 1; return new
    return v
for f in sorted(glob.glob(os.path.join(up, 'partie/reczne/hand_*.txt'))):
    s = open(f, encoding='utf-8', newline='').read()
    def sub(m):
        col = 'ojciec_imie' if m.group(1) == 'ojc' else 'matka_imie'
        return m.group(1) + '=' + fix(col, m.group(2))
    t = re.sub(r'(?<=\| )(ojc|mat)=([^|\n]*?)(?= \||\n|$)', sub, s)
    if t != s and '--zapisz' in sys.argv: open(f, 'w', encoding='utf-8', newline='').write(t)
for f in sorted(glob.glob(os.path.join(up, 'partie/akty_*.csv'))):
    raw = open(f, encoding='utf-8-sig', newline='').read()
    crlf = '\r\n' in raw
    rows = list(csv.reader(raw.splitlines(), delimiter=';'))
    ix = {c: i for i, c in enumerate(rows[0])}
    ch = False
    for r in rows[1:]:
        for col in ('ojciec_imie', 'matka_imie'):
            if col in ix and len(r) > ix[col]:
                v = fix(col, r[ix[col]])
                if v != r[ix[col]]: r[ix[col]] = v; ch = True
    if ch and '--zapisz' in sys.argv:
        with open(f, 'w', encoding='utf-8-sig', newline='') as o: csv.writer(o, delimiter=';', lineterminator='\r\n' if crlf else '\n').writerows(rows)
print('zmian:', n, '(zapisano)' if '--zapisz' in sys.argv else '(próba)')
