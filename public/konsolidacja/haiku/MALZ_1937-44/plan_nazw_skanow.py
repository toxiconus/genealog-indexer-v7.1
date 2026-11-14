#!/usr/bin/env python3
"""Plan zmiany nazw i podziału skanów małżeństw na foldery rocznikowe. Wynik: plan_nazw_skanow.csv i przenies_skany.ps1 (Move/Copy, nic nie kasuje poza przeniesieniem).
Nazwa: lub.blin.M.<rok>.<nr aktów>.usc-szast.jpg  (lub = lubelskie, blin = Blinów, M = małżeństwa). Strona z aktami z dwóch lat (lub aktem i protokołem/rejestrem poprzedniego roku) trafia do OBU folderów rocznikowych."""
import csv, glob, os, re, json, collections
H = os.path.dirname(os.path.abspath(__file__)); HK = os.path.dirname(H); APP = os.path.join(os.path.dirname(HK), 'PROJEKT_multitool', 'app')
BASE = r'D:\genealog\01_SKANY\Blinów\Małżeństwa'
ROK = {'cz05': 1940, 'cz06': 1940, 'cz07': 1940, 'cz12': 1943}
src = {}   # (folder, plik) -> {rok: set(akty)}, flagi
def dod(folder, plik, y, n): src.setdefault((folder, plik), {'akty': collections.defaultdict(set), 'prot': set(), 'okl': False, 'dubel': False})['akty'][y].add(n)
F1 = '1937-1944 USC Szastarka'; F2 = '1944-1945 USC Szastarka'
for f in sorted(glob.glob(os.path.join(H, 'cz*_skany.csv'))):
    cz = os.path.basename(f)[:4]
    for s in csv.reader(open(f, encoding='utf-8-sig'), delimiter=';'):
        if len(s) >= 4 and s[0].strip().isdigit() and s[1].strip().isdigit(): dod(F1, s[2].strip()[:7], ROK.get(cz, int(s[0])), int(s[1]))
# akty 1944/21–23 i 1945 z istniejących plików ROI -> pliki folderu 2
zb = json.load(open(os.path.join(APP, 'skany_zbiory.json'), encoding='utf-8'))['malzenstwa_1944-45']['pliki']
for f in glob.glob(os.path.join(HK, 'MALZENSTWA_19*_roi.json')):
    for r in json.load(open(f, encoding='utf-8')):
        m = re.match(r'ai1-m(\d{4})-(\d+)', r['id'])
        if m and r['plik'] in zb: dod(F2, zb[r['plik']], int(m.group(1)), int(m.group(2)))
# strony bez aktów: z rejestrów Haiku (protokół/rejestr/okładka/pusta)
for f in sorted(glob.glob(os.path.join(H, 'cz*_rejestr.txt'))):
    last = None
    for ln in open(f, encoding='utf-8'):
        m = re.match(r'\s*(\d{3})[_;:\s]*(.*)', ln)
        if not m: continue
        pl = m.group(1) + '.jpg'; t = m.group(2).lower(); k = (F1, pl); e = src.setdefault(k, {'akty': collections.defaultdict(set), 'prot': set(), 'okl': False, 'dubel': False})
        y = re.findall(r'19[34]\d', t)
        if 'protokół' in t or 'protokol' in t or 'rejestr alfabet' in t:
            for yy in y[:1] or ([max(e['akty'])] if e['akty'] else []): e['prot'].add(int(yy))
        if 'okładk' in t or 'okladk' in t: e['okl'] = True
        if re.search(r'duplikat\s+\d{3}_', t) or 'dubel' in t: e['dubel'] = True
# ręcznie: 003 i 019 folderu 2 (protokół+rejestr 1944 / 1945), 000 okładka
src.setdefault((F2, '003.jpg'), {'akty': collections.defaultdict(set), 'prot': {1944}, 'okl': False, 'dubel': False})
src.setdefault((F2, '019.jpg'), {'akty': collections.defaultdict(set), 'prot': {1945}, 'okl': False, 'dubel': False})
src.setdefault((F2, '000.jpg'), {'akty': collections.defaultdict(set), 'prot': set(), 'okl': True, 'dubel': False})
for p in ('011', '013', '014', '015'): src.setdefault((F2, p + '.jpg'), {'akty': collections.defaultdict(set), 'prot': set(), 'okl': False, 'dubel': True})
for p, y in (('000.jpg', 1937), ('102.jpg', 1944)): src[(F1, p)] = {'akty': collections.defaultdict(set), 'prot': set(), 'okl': True, 'dubel': False}
for fn in os.listdir('/mnt/user-data/uploads/' + F1): src.setdefault((F1, fn), {'akty': collections.defaultdict(set), 'prot': set(), 'okl': False, 'dubel': False})
def zakres(a):
    a = sorted(a); out = []; i = 0
    while i < len(a):
        j = i
        while j + 1 < len(a) and a[j + 1] == a[j] + 1: j += 1
        out.append('%03d' % a[i] if i == j else '%03d-%03d' % (a[i], a[j])); i = j + 1
    return '_'.join(out)
rows = []; uzyte = collections.Counter(); prev_y = {F1: 1937, F2: 1944}
for (fol, pl) in sorted(src, key=lambda x: (x[0], x[1])):
    e = src[(fol, pl)]; lata = sorted(set(e['akty']) | e['prot'])
    if not lata:
        y = prev_y[fol]; lata = [y]
    for y in lata:
        part = []
        if e['akty'].get(y): part.append(zakres(e['akty'][y]))
        if y in e['prot']: part.append('protokol-rejestr')
        if e['okl']: part.append('okladka')
        if e['dubel']: part.append('dubel-' + pl[:3])
        if (fol, pl) == (F1, '101.jpg'): part = ['zamkniecie-ksiegi']
        if (fol, pl) == (F2, '000.jpg'): part = ['okladka-ksiegi-1944-45']
        if not part: part.append('strona-' + pl[:3])
        nm = 'lub.blin.M.%d.%s.usc-szast' % (y, '+'.join(part)); uzyte[nm] += 1
        if uzyte[nm] > 1: nm += '_%d' % uzyte[nm]
        rows.append((fol, pl, y, nm + '.jpg', 'KOPIA' if len(lata) > 1 else 'PRZENIES'))
    prev_y[fol] = lata[-1]
with open(os.path.join(H, 'plan_nazw_skanow.csv'), 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f, delimiter=';'); w.writerow(['folder_zrodlowy', 'plik', 'rok', 'nowa_nazwa', 'operacja']); w.writerows(rows)
ps = ['# Przenosi i zmienia nazwy skanów małżeństw (Blinów). Uruchom: powershell -ExecutionPolicy Bypass -File przenies_skany.ps1   (próba bez zmian: dopisz -WhatIf)', 'param([switch]$WhatIf)', '$ErrorActionPreference = "Stop"', '$B = "%s"' % BASE]
by = collections.defaultdict(list)
for r in rows: by[(r[0], r[1])].append(r)
for (fol, pl), L in by.items():
    for i, r in enumerate(L):
        d = '$B\\%d USC' % r[2]; last = i == len(L) - 1
        ps.append('New-Item -ItemType Directory -Force -Path "%s" | Out-Null' % d)
        ps.append('%s -LiteralPath "$B\\%s\\%s" -Destination "%s\\%s" -WhatIf:$WhatIf' % ('Move-Item' if last else 'Copy-Item', fol, pl, d, r[3]))
open(os.path.join(H, 'przenies_skany.ps1'), 'w', encoding='utf-8-sig', newline='\r\n').write('\r\n'.join(ps) + '\r\n')
print(len(rows), 'operacji,', sum(1 for r in rows if r[4] == 'KOPIA'), 'kopii (strony na styku lat); lata:', sorted({r[2] for r in rows}))
