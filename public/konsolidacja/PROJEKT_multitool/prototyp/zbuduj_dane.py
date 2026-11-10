#!/usr/bin/env python3
"""Buduje prototyp/dane.json: próbka ok. 200 aktów (rodziny Kudrelek i Pasternak) z indeksów archiwalnych w repo,
w formacie z MODEL_DANYCH.md (Akt, Źródło, Wystąpienie, Relacja; pole = value/status/unc/source).
Tylko dane archiwalne (indeksy i odczyty ksiąg); nic z drzewa GED. Uruchom: python3 prototyp/zbuduj_dane.py"""
import csv, json, os, re, unicodedata, glob
H = os.path.dirname(os.path.abspath(__file__)); K = os.path.join(H, '..', '..')
NAZWISKA = ('kudrelek', 'pasternak')
def rd(f): return list(csv.DictReader(open(os.path.join(K, f), encoding='utf-8-sig'), delimiter=';'))
def fold(x):
    x = (x or '').lower().replace('ł', 'l'); return ''.join(c for c in unicodedata.normalize('NFD', x) if unicodedata.category(c) != 'Mn')
def trafia(*v): return any(any(fold(x).startswith(n) for n in NAZWISKA) for x in v if x)
def pole(v, status, plik, wiersz='', skan='', strona='', unc=None):
    v = (v or '').strip()
    return {'value': v, 'status': status, 'unc': ('?' in v) if unc is None else unc, 'source': {'plik': plik, 'skan': skan, 'strona': strona, 'wiersz': str(wiersz)}}
def pola(d, status, plik, wiersz):   # puste wartości z indeksu nie tworzą pól (brak danych ≠ „nie podano w akcie”)
    return {k: pole(v, status, plik, wiersz) for k, v in d.items() if (v or '').strip() and (v or '').strip() not in ('.', '?', '"b.d."')}
akty, wyst, rel = [], [], []
def W(akt, rola, mapa):
    mapa = {k: v for k, v in mapa.items() if v in akt['pola']}
    if not any(k in mapa for k in ('imie', 'nazwisko', 'imie_nazwisko', 'rodowe')): return None
    w = {'id': 'w:%s:%s' % (akt['id'], rola), 'akt': akt['id'], 'rola': rola, 'mapa': mapa}; wyst.append(w); return w['id']
def R(typ, a, b, akt, status='hipoteza'):   # „dokument” dopiero, gdy pola obu stron mają status ok (MODEL_DANYCH.md §7)
    if a and b: rel.append({'id': 'r:%s:%s:%s' % (typ, a.split(':', 1)[1], b.split(':')[-1]), 'typ': typ, 'a': a, 'b': b, 'status': status, 'zrodlo': akt['id']})
# --- chrzty (indeks z kart): blinow_akty.csv
P = 'blinow_akty.csv'
for i, r in enumerate(rd(P), 2):
    if not trafia(r['dziecko_nazwisko'], r['ojciec_nazwisko'], r['matka_nazwisko']) or not r['rok'].strip().isdigit(): continue
    a = {'id': r['id'], 'typ': 'chrzest', 'rok': int(r['rok']), 'nr': r['nr'], 'miejsce': r['miejscowosc'], 'epoka': 'lac' if int(r['rok']) < 1809 else 'pol' if int(r['rok']) < 1868 else 'ros', 'zrodla': ['zr:indeks-chrzty'], 'skan': None, 'stan': 'z_indeksu',
         'pola': pola({'child_last_name': r['dziecko_nazwisko'], 'child_first_name': r['dziecko_imiona'], 'child_birth_place': r['miejscowosc'], 'father_first_name': r['ojciec_imiona'], 'father_last_name': r['ojciec_nazwisko'], 'father_age': r['ojciec_wiek'],
                       'mother_first_name': r['matka_imiona'], 'mother_last_name': r['matka_nazwisko'], 'mother_age': r['matka_wiek'], 'index_month': r['uwagi'], 'notes_org': r['uwagi_org']}, 'lub', P, r['linia'] or i)}
    akty.append(a)
    d = W(a, 'dziecko', {'imie': 'child_first_name', 'nazwisko': 'child_last_name', 'miejsce': 'child_birth_place'})
    o = W(a, 'ojciec', {'imie': 'father_first_name', 'nazwisko': 'father_last_name', 'wiek': 'father_age', 'miejsce': 'child_birth_place'})
    m = W(a, 'matka', {'imie': 'mother_first_name', 'rodowe': 'mother_last_name', 'nazwisko': 'father_last_name', 'wiek': 'mother_age', 'miejsce': 'child_birth_place'})
    R('rodzic-dziecko', o, d, a); R('rodzic-dziecko', m, d, a); R('malzenstwo', o, m, a)
# --- zgony (indeks): zgony.csv + nakładka odczytów ksiąg łacińskich (status ai)
P = 'zgony.csv'; zg = {}
for r in rd(P):
    if not trafia(r['nazwisko'], r['rodowe'], r['matka_nazwisko']): continue
    y = int(r['rok']); wiek = (r['wiek'] + ' ' + {'lat': '', 'mies': 'mies.', 'tyg': 'tyg.'}.get(r['jednostka_wieku'], r['jednostka_wieku'])).strip()
    a = {'id': 'ZG.' + r['id_archiwalne'], 'typ': 'zgon', 'rok': y, 'nr': r['nr_wpisu'], 'miejsce': r['miejscowosc'], 'epoka': 'lac' if y < 1826 else 'pol' if y < 1868 else 'ros', 'zrodla': ['zr:indeks-zgony'], 'skan': None, 'stan': 'z_indeksu',
         'pola': pola({'deceased_last_name': r['nazwisko'], 'deceased_first_name': r['imie'], 'deceased_maiden_name': r['rodowe'], 'deceased_sex': {'m': 'M', 'k': 'K'}.get(r['plec'], ''), 'age': wiek, 'deceased_status': r['stan'], 'deceased_spouse': r['zyjacy_malzonek'],
                       'father_first_name': r['ojciec_imie'], 'mother_first_name': r['matka_imie'], 'mother_last_name': r['matka_nazwisko'], 'deceased_residence': r['miejscowosc'], 'notes_org': r['surowe_kol_6']}, 'lub', P, r['wiersz_zrodlo'])}
    akty.append(a); zg[(y, r['nr_wpisu'].strip())] = a
for fn in sorted(glob.glob(os.path.join(K, 'haiku', 'ODCZYTY', 'lm', '*.csv'))):
    rp = os.path.relpath(fn, K).replace(os.sep, '/')
    for i, r in enumerate(csv.DictReader(open(fn, encoding='utf-8-sig'), delimiter=';'), 2):
        a = zg.get((int(r['rok']) if (r.get('rok') or '').isdigit() else 0, (r.get('nr_wpisu_DB') or '').strip()))
        if not a: continue
        skan = 'haiku/skany_lm/blinow_%s.jpg' % r['skan'] if r.get('skan') else ''
        nowe = {'house': r['dom'], 'age': r['wiek'], 'deceased_sex': {'M': 'M', 'K': 'K', 'F': 'K'}.get((r['plec'] or '')[:1].upper(), ''), 'parents_raw': r['rodzice'], 'cause_of_death': (r['przyczyna_pl'] + (' (' + r['przyczyna_lac'] + ')' if r['przyczyna_lac'] else '')).strip(),
                'death_date': '%s-%s' % (r['rok'], r['data_mm-dd']) if r['data_mm-dd'] else '', 'notes': r['uwagi']}
        for f, v in nowe.items():
            v = (v or '').strip()
            if not v: continue
            p = pole(v, 'ai', rp, i, skan, r.get('strona_ksiegi', ''), unc=('?' in v) or (r.get('pewnosc') == '?' and f == 'notes'))
            if f in a['pola'] and a['pola'][f]['value'] != v: a['pola'][f].setdefault('alt', []).append(p)   # indeks zostaje, odczyt jako wariant do decyzji
            elif f not in a['pola']: a['pola'][f] = p
        if skan: a['skan'] = {'id': 'sk:' + skan, 'strona': r.get('strona_ksiegi', ''), 'roi': None}; a['zrodla'].append('zr:liber-mortuorum')
for a in akty:
    if a['typ'] != 'zgon': continue
    z = W(a, 'zmarly', {'imie': 'deceased_first_name', 'nazwisko': 'deceased_last_name', 'rodowe': 'deceased_maiden_name', 'plec': 'deceased_sex', 'wiek': 'age', 'stan': 'deceased_status', 'miejsce': 'deceased_residence', 'dom': 'house'})
    o = W(a, 'ojciec', {'imie': 'father_first_name', 'nazwisko': 'deceased_last_name'}); m = W(a, 'matka', {'imie': 'mother_first_name', 'rodowe': 'mother_last_name'}); s = W(a, 'malzonek', {'imie_nazwisko': 'deceased_spouse'})
    R('rodzic-dziecko', o, z, a); R('rodzic-dziecko', m, z, a); R('malzenstwo', z, s, a)
# --- małżeństwa (indeks): malzenstwa_mal.csv
P = 'malzenstwa_mal.csv'; seen = {}
for r in rd(P):
    if not trafia(r['pan_nazwisko'], r['panna_nazwisko'], r['pan_matka_nazwisko'], r['panna_matka_nazwisko'], r['panna_ojciec_nazwisko']) or not r['rok'].strip().isdigit(): continue
    k = 'MA.%s.%s' % (r['rok'], r['nr']); seen[k] = seen.get(k, 0) + 1
    a = {'id': k if seen[k] == 1 else '%s-%d' % (k, seen[k]), 'typ': 'malzenstwo', 'rok': int(r['rok']), 'nr': r['nr'], 'miejsce': r['pan_miejscowosc'], 'epoka': 'pol' if int(r['rok']) < 1868 else 'ros', 'zrodla': ['zr:indeks-malzenstwa'], 'skan': None, 'stan': 'z_indeksu',
         'pola': pola({'marriage_date': r['data_iso'], 'groom_last_name': r['pan_nazwisko'], 'groom_first_name': r['pan_imie'], 'groom_status': r['pan_stan'], 'groom_age': r['pan_wiek'], 'groom_residence': r['pan_miejscowosc'],
                       'groom_father_first_name': r['pan_ojciec_imie'], 'groom_father_last_name': r['pan_ojciec_nazwisko'], 'groom_mother_first_name': r['pan_matka_imie'], 'groom_mother_last_name': r['pan_matka_nazwisko'],
                       'bride_last_name': r['panna_nazwisko'], 'bride_first_name': r['panna_imie'], 'bride_status': r['panna_stan'], 'bride_age': r['panna_wiek'], 'bride_residence': r['panna_miejscowosc'],
                       'bride_father_first_name': r['panna_ojciec_imie'], 'bride_father_last_name': r['panna_ojciec_nazwisko'], 'bride_mother_first_name': r['panna_matka_imie'], 'bride_mother_last_name': r['panna_matka_nazwisko'],
                       'witness1_name': (r['swiadek1_imie'] + ' ' + r['swiadek1_nazwisko']).strip(), 'witness2_name': (r['swiadek2_imie'] + ' ' + r['swiadek2_nazwisko']).strip(),
                       'previous_spouse': (r['pan_poprzednia_zona_imie'] + ' ' + r['pan_poprzednia_zona_nazwisko'] + ' ' + r['wdowa_poprzedni_maz_imie'] + ' ' + r['wdowa_poprzedni_maz_nazwisko']).strip()}, 'lub', P, r['wiersz_zrodlo'])}
    akty.append(a)
    g = W(a, 'pan_mlody', {'imie': 'groom_first_name', 'nazwisko': 'groom_last_name', 'wiek': 'groom_age', 'stan': 'groom_status', 'miejsce': 'groom_residence'})
    b = W(a, 'panna_mloda', {'imie': 'bride_first_name', 'nazwisko': 'bride_last_name', 'wiek': 'bride_age', 'stan': 'bride_status', 'miejsce': 'bride_residence'})
    go = W(a, 'ojciec_pana', {'imie': 'groom_father_first_name', 'nazwisko': 'groom_father_last_name'}); gm = W(a, 'matka_pana', {'imie': 'groom_mother_first_name', 'rodowe': 'groom_mother_last_name', 'nazwisko': 'groom_father_last_name'})
    bo = W(a, 'ojciec_panny', {'imie': 'bride_father_first_name', 'nazwisko': 'bride_father_last_name'}); bm = W(a, 'matka_panny', {'imie': 'bride_mother_first_name', 'rodowe': 'bride_mother_last_name', 'nazwisko': 'bride_father_last_name'})
    R('malzenstwo', g, b, a); R('rodzic-dziecko', go, g, a); R('rodzic-dziecko', gm, g, a); R('rodzic-dziecko', bo, b, a); R('rodzic-dziecko', bm, b, a)
    for n in ('1', '2'):
        s = W(a, 'swiadek' + n, {'imie_nazwisko': 'witness%s_name' % n}); R('swiadek', s, g, a, 'wskazowka')
akty.sort(key=lambda a: (a['rok'], a['typ'], a['id']))
D = {'format': {'nazwa': 'multitool-dane', 'wersja': 1}, 'opis': 'Próbka: akty z nazwiskami Kudrelek i Pasternak (indeksy archiwalne parafii Blinów). Bez danych z drzewa GED.',
     'zrodla': [{'id': 'zr:indeks-chrzty', 'typ': 'indeks', 'nazwa': 'Indeks chrztów Blinów 1783–1908 (karty)', 'plik': 'blinow_akty.csv'}, {'id': 'zr:indeks-zgony', 'typ': 'indeks', 'nazwa': 'Indeks zgonów 1797–1880 (Lubgens)', 'plik': 'zgony.csv'},
                {'id': 'zr:indeks-malzenstwa', 'typ': 'indeks', 'nazwa': 'Indeks małżeństw 1841–1894', 'plik': 'malzenstwa_mal.csv'}, {'id': 'zr:liber-mortuorum', 'typ': 'ksiega', 'nazwa': 'Liber mortuorum 1797–1825 (odczyt skanów)', 'plik': 'haiku/ODCZYTY/lm/'}],
     'akty': akty, 'wystapienia': wyst, 'relacje': rel, 'decyzje': []}
json.dump(D, open(os.path.join(H, 'dane.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
from collections import Counter
print(len(akty), 'aktów', dict(Counter(a['typ'] for a in akty)), len(wyst), 'wystąpień', len(rel), 'relacji', os.path.getsize(os.path.join(H, 'dane.json')) // 1024, 'KB', 'pola ai:', sum(1 for a in akty for p in a['pola'].values() if p['status'] == 'ai'))
