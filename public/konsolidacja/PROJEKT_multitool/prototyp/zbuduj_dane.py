#!/usr/bin/env python3
"""Buduje prototyp/dane.json: próbka ok. 200 aktów (rodziny Kudrelek i Pasternak) z indeksów archiwalnych w repo,
w formacie z MODEL_DANYCH.md (Akt, Źródło, Wystąpienie, Relacja; pole = value/status/unc/source).
Tylko dane archiwalne (indeksy i odczyty ksiąg); nic z drzewa GED. Uruchom: python3 prototyp/zbuduj_dane.py"""
import csv, json, os, re, sys, unicodedata, glob, hashlib
H = os.path.dirname(os.path.abspath(__file__)); K = os.path.join(H, '..', '..')
NAZWISKA = ('kudrelek', 'pasternak')
def rd(f): return list(csv.DictReader(open(os.path.join(K, f), encoding='utf-8-sig'), delimiter=';'))
def fold(x):
    x = (x or '').lower().replace('ł', 'l'); return ''.join(c for c in unicodedata.normalize('NFD', x) if unicodedata.category(c) != 'Mn')
WSZYSTKO = '--wszystko' in sys.argv   # pełny zbiór (cała parafia) zamiast próbki; wynik: dane_pelne.json (duży, nie commitować)
def trafia(*v): return WSZYSTKO or any(any(fold(x).startswith(n) for n in NAZWISKA) for x in v if x)
def pole(v, status, plik, wiersz='', skan='', strona='', unc=None):
    v = (v or '').strip()
    return {'value': v, 'status': status, 'unc': ('?' in v) if unc is None else unc, 'source': {'plik': plik, 'skan': skan, 'strona': strona, 'wiersz': str(wiersz)}}
def pola(d, status, plik, wiersz):   # puste wartości z indeksu nie tworzą pól (brak danych ≠ „nie podano w akcie”)
    return {k: pole(v, status, plik, wiersz) for k, v in d.items() if (v or '').strip() and (v or '').strip() not in ('.', '?', '"b.d."')}
akty, wyst, rel = [], [], []
OLD = {}   # id nowe -> lista id dawnych (tabela id_dawne, tylko --wszystko; MODEL_DANYCH.md §4)
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
    akty.append(a); OLD[a['id']] = [r['id_oryg'].strip()] if r['id_oryg'].strip() else [a['id']]
    d = W(a, 'dziecko', {'imie': 'child_first_name', 'nazwisko': 'child_last_name', 'miejsce': 'child_birth_place'})
    o = W(a, 'ojciec', {'imie': 'father_first_name', 'nazwisko': 'father_last_name', 'wiek': 'father_age', 'miejsce': 'child_birth_place'})
    m = W(a, 'matka', {'imie': 'mother_first_name', 'rodowe': 'mother_last_name', 'nazwisko': 'father_last_name', 'wiek': 'mother_age', 'miejsce': 'child_birth_place'})
    R('rodzic-dziecko', o, d, a); R('rodzic-dziecko', m, d, a); R('malzenstwo', o, m, a)
# --- zgony (indeks): zgony.csv + nakładka odczytów ksiąg łacińskich (status ai)
P = 'zgony.csv'; zg = {}; ZGR = {}
IDX = []; _seq = {}   # id dawne z indeksu jak w narzedzia/buduj_baza_v4.py: idx-ROK-NR, a bez numeru: 1000 + kolejność w roku; ASC 1870-79 nie ma idx
for r in rd(P):
    _y = int(r['rok']); _seq[_y] = _seq.get(_y, 0) + 1; _n = r['nr_wpisu'].strip()
    IDX.append(None if 1870 <= _y <= 1879 else 'idx-%d-%d' % (_y, int(_n) if _n.isdigit() else 1000 + _seq[_y]))
for ri, r in enumerate(rd(P)):
    if not trafia(r['nazwisko'], r['rodowe'], r['matka_nazwisko']): continue
    y = int(r['rok']); wiek = (r['wiek'] + ' ' + {'lat': '', 'mies': 'mies.', 'tyg': 'tyg.'}.get(r['jednostka_wieku'], r['jednostka_wieku'])).strip()
    a = {'id': 'ZG.' + r['id_archiwalne'], 'typ': 'zgon', 'rok': y, 'nr': r['nr_wpisu'], 'miejsce': r['miejscowosc'], 'epoka': 'lac' if y < 1826 else 'pol' if y < 1868 else 'ros', 'zrodla': ['zr:indeks-zgony'], 'skan': None, 'stan': 'z_indeksu',
         'pola': pola({'deceased_last_name': r['nazwisko'], 'deceased_first_name': r['imie'], 'deceased_maiden_name': r['rodowe'], 'deceased_sex': {'m': 'M', 'k': 'K'}.get(r['plec'], ''), 'age': wiek, 'deceased_status': r['stan'], 'deceased_spouse': r['zyjacy_malzonek'],
                       'father_first_name': r['ojciec_imie'], 'mother_first_name': r['matka_imie'], 'mother_last_name': r['matka_nazwisko'], 'deceased_residence': r['miejscowosc'], 'notes_org': r['surowe_kol_6']}, 'lub', P, r['wiersz_zrodlo'])}
    akty.append(a); zg[(y, r['nr_wpisu'].strip())] = a; ZGR[a['id']] = r
    OLD[a['id']] = ([] if IDX[ri] is None else [IDX[ri]]) + [r['id_archiwalne']]
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
# --- zgony spoza zgony.csv (tylko --wszystko). ASC 1870-79 są już w CSV (323 wiersze): dopasowanie akt HTML <-> wiersz CSV
#     po roku, nazwisku i imieniu (pary przy zduplikowanym kluczu w kolejności), odczyt AI to nakładka na akt CSV.
#     Mini 1935 i 1943-45 to nowe akty (brak w CSV): pola lub = indeks, pola ai = odczyt maszynowy.
if WSZYSTKO:
    def LDH(fn):   # const D = {...}; w mini-HTML i weryfikatorze ASC (jak LD w buduj_baza_v4.py)
        s = open(os.path.join(K, 'narzedzia', fn), encoding='utf-8').read(); i = s.index('const D = '); j = s.index(';\n', i)
        return json.loads(s[i + 10:j])
    ODC = 'narzedzia/odczyty_AI_ASC_start.csv'
    DA = LDH('weryfikacja_zgonow_ASC_1870-79.html')
    grupa = {}   # (rok, nazwisko, imię) -> akty CSV w kolejności wierszy
    for a in akty:
        r = ZGR.get(a['id'])
        if r and 1870 <= a['rok'] <= 1879: grupa.setdefault((a['rok'], r['nazwisko'].strip().lower(), r['imie'].strip().lower()), []).append(a)
    ASC = {}; hg = {}
    for x in sorted(DA['acts'], key=lambda x: (x['year'], x['act'])):
        l = x['lub']; hg.setdefault((x['year'], l.get('deceased_last_name', '').strip().lower(), l.get('deceased_first_name', '').strip().lower()), []).append(x)
    for k, xs in hg.items():
        cs = grupa.get(k, [])
        assert len(cs) == len(xs), ('ASC: brak dopasowania', k, len(cs), len(xs))
        for x, a in zip(xs, cs):
            ASC[x['id']] = a; OLD[a['id']] = [x['id']] + OLD[a['id']]; a['zrodla'].append('zr:asc-1870-79')
    POM = {'id', 'death_year', 'death_act_number', 'verification_status', 'uncertain_fields', 'notes_org', 'source_office'}
    for i, r in enumerate(csv.DictReader(open(os.path.join(K, ODC), encoding='utf-8-sig'), delimiter=';'), 2):
        a = ASC.get(r['id'])
        assert a is not None, ('ASC: odczyt bez aktu', r['id'])
        for f, v in r.items():
            if f is None or f in POM or not (v or '').strip(): continue
            v = v.strip(); p = pole(v, 'ai', ODC, i, unc=('?' in v))
            if f in a['pola'] and a['pola'][f]['value'] != v: a['pola'][f].setdefault('alt', []).append(p)
            elif f not in a['pola']: a['pola'][f] = p
    for fn, zr in (('dane/zgony_1935_mini.html', 'zr:akta-zgonow-1935'), ('dane/zgony_1943-45_mini.html', 'zr:akta-zgonow-1943-45')):
        Hm = LDH(fn); rp = 'narzedzia/' + fn
        for n, x in enumerate(Hm['acts'], 1):
            if x.get('kind'): continue
            ai = x.get('ai') or {}; lub = x.get('lub') or {}; pa = x.get('pola') or {}; unc = x.get('unc') or []
            skrel = Hm['scanFiles'].get(x['file'], x['file']) if x.get('file') else ''
            def mk(f, v, status):
                p = pole(v, status, rp, str(n), skan=skrel, unc=('?' in v) or f in unc)
                b = (pa.get(f) or [None])[0]
                if b and len(b) == 4: p['roi'] = {'x': b[0], 'y': b[1], 'w': b[2], 'h': b[3]}
                return p
            a = {'id': x['id'], 'typ': 'zgon', 'rok': x['year'], 'nr': str(x['act']), 'miejsce': ai.get('death_place') or lub.get('deceased_residence') or '', 'epoka': 'ros', 'zrodla': [zr],
                 'skan': {'plik': skrel, 'strona': '', 'roi': x.get('roi')} if skrel else None, 'stan': 'w_toku' if ai else 'z_indeksu', 'pola': {}}
            for f, v in lub.items():
                if (v or '').strip(): a['pola'][f] = mk(f, v.strip(), 'lub')
            if (x.get('lubRaw') or '').strip(): a['pola']['notes_org'] = pole(x['lubRaw'].strip(), 'lub', rp, str(n))
            for f, v in ai.items():
                if not (v or '').strip(): continue
                v = v.strip(); p = mk(f, v, 'ai')
                if f in a['pola'] and a['pola'][f]['value'] != v: a['pola'][f].setdefault('alt', []).append(p)
                elif f not in a['pola']: a['pola'][f] = p
            akty.append(a); OLD[a['id']] = [a['id']]
# --- nakładka z głównej bazy zgonów (narzedzia/baza_zgonow_1797-1945.html, D.acts[].ai; tylko --wszystko): pełny zakres pól odczytów ksiąg łacińskich
#     (normalizacje z buduj_baza_v4.py), wartości z eksportu użytkownika i akty lm-* spoza indeksu. Zatwierdzone (D.zatw) dostają status ok i wartość główną;
#     przy aktach z indeksu inne wartości AI idą do `alt` (indeks zostaje główny), jak w nakładce lm wyżej. Wymaga zbudowanej bazy (python3 narzedzia/buduj_baza_v4.py).
if WSZYSTKO:
    DB = LDH('baza_zgonow_1797-1945.html'); ZT = set(DB.get('zatw') or []); BP = 'narzedzia/baza_zgonow_1797-1945.html'
    REV = {o: k for k, v in OLD.items() for o in v}; AM = {a['id']: a for a in akty}; nowych = naniesionych = 0
    for x in DB['acts']:
        ai = x.get('ai') or {}
        if x.get('kind') or not ai: continue
        ok = x['id'] in ZT; unc = x.get('unc') or []
        fl = x.get('file') or ''; skrel = ('haiku/skany_lm/' + fl) if fl and os.path.exists(os.path.join(K, 'haiku', 'skany_lm', fl)) else ''
        a = AM.get(REV.get(x['id']))
        if a is None:
            if not x['id'].startswith('lm-'): continue   # inne akty bazy są już w danych (indeks, ASC, mini)
            a = {'id': x['id'], 'typ': 'zgon', 'rok': x['year'], 'nr': str(x['act']), 'miejsce': ai.get('death_place') or ai.get('deceased_residence') or '', 'epoka': 'lac', 'zrodla': ['zr:liber-mortuorum'],
                 'skan': {'plik': skrel, 'strona': '', 'roi': x.get('roi')} if skrel else None, 'stan': 'w_toku', 'pola': {}}
            akty.append(a); AM[a['id']] = a; OLD[a['id']] = [a['id']]; nowych += 1
        if 'zr:baza-zgonow' not in a['zrodla']: a['zrodla'].append('zr:baza-zgonow')
        for f, v in ai.items():
            v = str(v or '').strip()
            if not v: continue
            p = pole(v, 'ok' if ok else 'ai', BP, x['id'], skan=skrel, unc=('?' in v) or f in unc); cur = a['pola'].get(f)
            if cur is None: a['pola'][f] = p; naniesionych += 1
            elif cur['value'] == v:
                if ok: cur['status'] = 'ok'
            elif ok:
                stary = {k: w for k, w in cur.items() if k != 'alt'}; p['alt'] = cur.get('alt', []) + [stary]; a['pola'][f] = p; naniesionych += 1
            elif cur['status'] == 'ai':
                stary = {k: w for k, w in cur.items() if k != 'alt'}; p['alt'] = cur.get('alt', []) + [stary]; a['pola'][f] = p; naniesionych += 1
            elif all(w['value'] != v for w in cur.get('alt', [])): cur.setdefault('alt', []).append(p); naniesionych += 1
    print('nakładka z bazy zgonów: nowych aktów', nowych, 'pól naniesionych', naniesionych, 'zatwierdzonych aktów', len(ZT))
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
    akty.append(a); OLD[a['id']] = ['%s/%s' % (r['rok'], r['nr'])]
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
if WSZYSTKO:   # tabele pełnego zbioru: źródła nowych odczytów, skany (metadane, bez obrazów), id dawne (każdy akt, także z jednym id)
    D['zrodla'] += [{'id': 'zr:asc-1870-79', 'typ': 'odczyt', 'nazwa': 'Zgony 1870–1879 (weryfikator ASC, odczyt AI)', 'plik': 'narzedzia/weryfikacja_zgonow_ASC_1870-79.html; narzedzia/odczyty_AI_ASC_start.csv'},
                    {'id': 'zr:akta-zgonow-1935', 'typ': 'odczyt', 'nazwa': 'Zgony 1935 (mini, odczyt AI)', 'plik': 'narzedzia/dane/zgony_1935_mini.html'},
                    {'id': 'zr:baza-zgonow', 'typ': 'odczyt', 'nazwa': 'Baza zgonów 1797–1945 (nałożone odczyty ksiąg łacińskich, wartości z eksportu użytkownika)', 'plik': 'narzedzia/baza_zgonow_1797-1945.html'},
                    {'id': 'zr:akta-zgonow-1943-45', 'typ': 'odczyt', 'nazwa': 'Zgony 1943–1945 (mini, indeks i odczyt AI)', 'plik': 'narzedzia/dane/zgony_1943-45_mini.html'}]
    SK = []
    for fn in sorted(glob.glob(os.path.join(K, 'haiku', 'skany_lm', '*.jpg'))):
        bajty = open(fn, 'rb').read(); sha = hashlib.sha256(bajty).hexdigest(); nm = os.path.basename(fn)
        e = {'id': 'sk:' + sha[:12], 'nazwa': nm, 'sciezka': 'haiku/skany_lm/' + nm, 'bajty': len(bajty), 'sha256': sha}
        m = re.match(r'blinow_lm-(\d+)\.jpg$', nm)
        if m: e['n'] = int(m.group(1))
        SK.append(e)
    D['skany'] = SK
    D['id_dawne'] = {a['id']: OLD.get(a['id']) or [a['id']] for a in akty}
WYJ = 'dane_pelne.json' if WSZYSTKO else 'dane.json'
json.dump(D, open(os.path.join(H, WYJ), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
from collections import Counter
print(len(akty), 'aktów', dict(Counter(a['typ'] for a in akty)), len(wyst), 'wystąpień', len(rel), 'relacji', os.path.getsize(os.path.join(H, WYJ)) // 1024, 'KB', 'pola ai:', sum(1 for a in akty for p in a['pola'].values() if p['status'] == 'ai'))
