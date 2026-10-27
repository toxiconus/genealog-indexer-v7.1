#!/usr/bin/env python3
"""Normalizacja imion rodziców (dopełniacz -> mianownik) w ŹRÓDŁACH: partie/reczne/hand_*.txt (pola ojc=, mat=)
oraz partie/akty_free_*.csv (ojciec_imie, matka_imie). Surowy zapis (kol.G itd.) zostaje w polach tekstowych.
Wstrzymane: ojciec Franciszka/Stanisława. Użycie: python3 normalizuj_zrodla_imiona.py [--zapisz]"""
import csv, glob, os, re, sys
here = os.path.dirname(os.path.abspath(__file__)); up = os.path.dirname(here)
sys.path.insert(0, here)
from normalizuj_imiona_rodzicow import mianownik, pisownia
n = 0
def fix(col, v):
    global n
    new, why = mianownik(col, v) if col in ('ojciec_imie', 'matka_imie') else (v, None)
    if why == 'WSTRZYMANE': return v
    if not why: new = pisownia(v)
    if new != v: n += 1
    return new
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
        for col in ('imie_dziecka', 'ojciec_imie', 'matka_imie'):
            if col in ix and len(r) > ix[col]:
                v = fix(col, r[ix[col]])
                if v != r[ix[col]]: r[ix[col]] = v; ch = True
    if ch and '--zapisz' in sys.argv:
        with open(f, 'w', encoding='utf-8-sig', newline='') as o: csv.writer(o, delimiter=';', lineterminator='\r\n' if crlf else '\n').writerows(rows)
# pliki wynikowe: starsza pisownia w kolumnach imion (nazwiska i wiek pomijane)
for fn in ('zgony.csv', 'blinow_akty.csv', 'blinow_scalone.csv', 'malzenstwa_mal.csv'):
    f = os.path.join(up, fn)
    raw = open(f, encoding='utf-8-sig', newline='').read(); crlf = '\r\n' in raw
    rows = list(csv.reader(raw.splitlines(), delimiter=';'))
    cols = [i for i, c in enumerate(rows[0]) if ('imie' in c or 'imiona' in c) and 'nazw' not in c and 'wiek' not in c]
    ch = False
    for r in rows[1:]:
        for i in cols:
            if i < len(r):
                v = pisownia(r[i])
                if v != r[i]: r[i] = v; ch = True; n += 1
    if ch and '--zapisz' in sys.argv:
        with open(f, 'w', encoding='utf-8-sig', newline='') as o: csv.writer(o, delimiter=';', lineterminator='\r\n' if crlf else '\n').writerows(rows)
print('zmian:', n, '(zapisano)' if '--zapisz' in sys.argv else '(próba)')
