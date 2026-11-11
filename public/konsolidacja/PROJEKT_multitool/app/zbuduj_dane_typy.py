#!/usr/bin/env python3
"""Krok 5 planu: buduje app/dane_malzenstwa.json i app/dane_chrzty.json (nowe pliki; dane_zgony.json nietknięty).
Uruchamiane przez zbuduj_dane_app.py:  python3 app/zbuduj_dane_app.py --typy   (albo --malzenstwa / --chrzty)

Źródła (bez zatwierdzeń – nie ma ich dla małżeństw ani urodzeń, migracja tych typów jest pusta; nic nie jest wymyślane):
  małżeństwa: malzenstwa_mal.csv (indeks 1841–1894, status `lub`) + haiku/MALZENSTWA_{1944,1945}_ai1_import.csv z rejestrem i ROI (odczyt AI, status `ai`);
  chrzty:     blinow_akty.csv (indeks z kart, status `lub`).
Dla aktów 1944–45 powtórzone są przekształcenia, które stary weryfikator (haiku/weryfikacja_malzenstw_szablon.html) robił przy starcie na a.ai:
  imię/nazwisko świadka z pola łącznego, imiona z marginesu (kopia z aktu, oznaczona jako niepewna), „wdowiec/wdowa po X z Y” z uwag/tekstu, poprawa pisowni 3 miejscowości.
Zapis zwarty: pole {v} (+ s, z, u tylko gdy różni się od domyślnych akt-owych s0/z); format jak dane_zgony.json (multitool-dane v1)."""
import csv, json, os, re, sys, unicodedata
H = os.path.dirname(os.path.abspath(__file__)); K = os.path.join(H, '..', '..'); HK = os.path.join(K, 'haiku')

def rd(p, enc='utf-8-sig'):
    return list(csv.DictReader(open(p, encoding=enc, newline=''), delimiter=';'))

class Tab:
    def __init__(self): self.tab = []; self.ix = {}
    def nr(self, plik, skan='', strona=''):
        k = (plik, skan, strona)
        if k not in self.ix: self.ix[k] = len(self.tab); self.tab.append(list(k))
        return self.ix[k]

def trim(v): return (v or '').strip()
def kropka(v): return trim(v) in ('.', '?', '"b.d."')

# ---------- małżeństwa ----------
MAL_IDX = {   # kolumna indeksu -> pole modelu (zestaw MAL w typy_aktow.js); wartości puste i placeholdery nie tworzą pól
    'data_iso': 'marriage_date',
    'pan_nazwisko': 'groom_last_name', 'pan_imie': 'groom_first_name', 'pan_stan': 'groom_status', 'pan_wiek': 'groom_age', 'pan_miejscowosc': 'groom_residence',
    'pan_ojciec_imie': 'groom_father_first_name', 'pan_ojciec_nazwisko': 'groom_father_last_name', 'pan_matka_imie': 'groom_mother_first_name', 'pan_matka_nazwisko': 'groom_mother_last_name',
    'pan_poprzednia_zona_imie': 'groom_prev_spouse_first_name', 'pan_poprzednia_zona_nazwisko': 'groom_prev_spouse_last_name',
    'panna_nazwisko': 'bride_last_name', 'panna_imie': 'bride_first_name', 'panna_stan': 'bride_status', 'panna_wiek': 'bride_age', 'panna_miejscowosc': 'bride_residence',
    'panna_ojciec_imie': 'bride_father_first_name', 'panna_ojciec_nazwisko': 'bride_father_last_name', 'panna_matka_imie': 'bride_mother_first_name', 'panna_matka_nazwisko': 'bride_mother_last_name',
    'wdowa_poprzedni_maz_imie': 'bride_prev_spouse_first_name', 'wdowa_poprzedni_maz_nazwisko': 'bride_prev_spouse_last_name',
    'swiadek1_imie': 'witness1_first_name', 'swiadek1_nazwisko': 'witness1_last_name', 'swiadek2_imie': 'witness2_first_name', 'swiadek2_nazwisko': 'witness2_last_name',
}
PLF = {'margin_place', 'groom_birth_place', 'groom_residence', 'bride_birth_place', 'bride_residence', 'witness1_residence', 'witness2_residence'}
def norm_pl(v):   # normPl ze starego weryfikatora (clean + 3 poprawki pisowni)
    return trim(v).replace('Mocydła', 'Moczydła').replace('Mocydłach', 'Moczydłach').replace('Kacyniec', 'Kaczyniec')
RE_WD = re.compile(r'wdow\S*\s+po\s+([A-ZŻŹĆŚŁÓĄĘŃ][a-ząćęłńóśźż]+)\s+(?:z|ze)\s+([A-ZŻŹĆŚŁÓĄĘŃ][a-ząćęłńóśźż]+)')

def przygotuj_ai(ai, tekst):
    """Odpowiednik trzech pętli D.acts.forEach ze starego weryfikatora (operują na a.ai); zwraca listę pól niepewnych (uncertain_fields po przekształceniach)."""
    raw_unc = trim(ai.get('uncertain_fields'))
    def dopisz(*klucze):
        nonlocal raw_unc
        for k in klucze:
            raw_unc = (raw_unc + ',' if raw_unc else '') + k
    for k in (1, 2):
        w = trim(ai.get('witness%d_name' % k)).split()
        if not trim(ai.get('witness%d_last_name' % k)) and w:
            ai['witness%d_last_name' % k] = w[-1]; ai['witness%d_first_name' % k] = ' '.join(w[:-1])
    c = lambda x: trim(ai.get(x)).replace('?', '')
    for x in ('groom', 'bride'):
        old = trim(ai.get('margin_' + x)).split()
        for i, k in enumerate(('first_name', 'last_name')):
            key = 'margin_%s_%s' % (x, k)
            if not trim(ai.get(key)):
                ai[key] = (old[-1] if i else ' '.join(old[:-1])) if len(old) > 1 else c(x + '_' + k)
                dopisz(key)
    for x in ('groom', 'bride'):
        if trim(ai.get(x + '_prev_spouse_last_name')) or trim(ai.get(x + '_prev_spouse_first_name')): continue
        if not re.match(r'^wd', trim(ai.get(x + '_status')), re.I): continue
        m = RE_WD.search(trim(ai.get('margin_notes')) + ' ' + trim(tekst))
        if m:
            ai[x + '_prev_spouse_first_name'] = m.group(1); ai[x + '_prev_spouse_last_name'] = m.group(2)
            dopisz(x + '_prev_spouse_first_name', x + '_prev_spouse_last_name')
    for k in list(ai):
        if isinstance(ai[k], str) and k in PLF: ai[k] = norm_pl(ai[k])
    return [t for t in re.split(r'[;,]\s*', raw_unc) if t != '']

def buduj_malzenstwa():
    T = Tab(); akty = []; rejestr = {}
    # --- indeks 1841–1894
    P = 'malzenstwa_mal.csv'; seen = {}
    for i, r in enumerate(rd(os.path.join(K, P)), 2):
        if not trim(r['rok']).isdigit(): continue
        rok = int(r['rok']); k = 'MA.%s.%s' % (r['rok'], r['nr']); seen[k] = seen.get(k, 0) + 1; n = seen[k]
        pola = {}
        for kol, f in MAL_IDX.items():
            v = trim(r.get(kol))
            if v and not kropka(v): pola[f] = {'v': norm_pl(v) if f in PLF else v}
        akty.append({'id': k if n == 1 else '%s-%d' % (k, n), 'id_dawne': ['%s/%s' % (r['rok'], r['nr'])], 'stary': '%s/%s%s' % (r['rok'], r['nr'], '' if n == 1 else '#%d' % n),
                     'typ': 'malzenstwo', 'rok': rok, 'nr': r['nr'], 'miejsce': r['pan_miejscowosc'], 'epoka': 'pol' if rok < 1868 else 'ros', 'zrodla': ['zr:indeks-malzenstwa'], 'stan': 'z_indeksu',
                     's0': 'lub', 'z': [T.nr(P), r['wiersz_zrodlo']], 'pola': pola, 'robocze': {'act': int(r['nr']) if trim(r['nr']).isdigit() else r['nr'], 'year': rok}})
    n_idx = len(akty)
    # --- odczyty 1944–45 (AI)
    scan_files = {}
    for y in sorted(int(re.search(r'MALZENSTWA_(\d{4})_', f).group(1)) for f in os.listdir(HK) if re.match(r'MALZENSTWA_\d{4}_ai1_import\.csv$', f)):
        pl = 'haiku/MALZENSTWA_%d_ai1_import.csv' % y
        rows = rd(os.path.join(HK, 'MALZENSTWA_%d_ai1_import.csv' % y)); cols = list(rows[0].keys())
        roi = {r['id']: r for r in json.load(open(os.path.join(HK, 'MALZENSTWA_%d_ai1_roi.json' % y), encoding='utf-8'))}
        wsk = {}
        for cz in sorted(f for f in os.listdir(HK) if re.match(r'MALZENSTWA_%d_cz\d+_ai1_import\.csv$' % y, f)):   # kolejne części odczytu tego samego roku (osobny plik z ROI)
            nowe = rd(os.path.join(HK, cz)); wsk.update({r['id']: ('haiku/' + cz, w) for w, r in enumerate(nowe, 2)}); rows += nowe; roi.update({r['id']: r for r in json.load(open(os.path.join(HK, cz.replace('_import.csv', '_roi.json')), encoding='utf-8'))})
        rejestr[str(y)] = json.load(open(os.path.join(HK, 'MALZENSTWA_%d_ai1_rejestr.json' % y), encoding='utf-8'))
        for w, r in enumerate(rows, 2):
            ai = dict(r); tekst = r.get('act_text', ''); unc = przygotuj_ai(ai, tekst); ro = roi[r['id']]
            pola = {}
            for f, v in ai.items():
                if f in ('id', 'marriage_year', 'marriage_act_number', 'act_text', 'uncertain_fields', 'verification_status', 'verification_notes'): continue
                if v == '': continue
                pola[f] = {'v': v}
            nr = int(r['marriage_act_number'])
            x = {'id': 'MA.%d.%d' % (y, nr), 'id_dawne': [r['id']], 'stary': r['id'], 'typ': 'malzenstwo', 'rok': y, 'nr': str(nr), 'miejsce': r.get('marriage_place', ''), 'zrodla': ['zr:odczyt-malzenstwa-%d' % y], 'stan': 'w_toku',
                 's0': 'ai', 'z': [T.nr(wsk[r['id']][0] if r['id'] in wsk else pl, ro['plik'], ro.get('strona', '')), str(wsk[r['id']][1] if r['id'] in wsk else w)], 'pola': pola, 'unc': unc, 'tekst': tekst,
                 'skan': {'id': 'sk:' + ro['plik'], 'strona': ro.get('strona', ''), 'roi': ro['roi']}, 'robocze': {'act': nr, 'year': y, 'file': ro['plik'], 'roi': ro['roi']}}
            if ro.get('uwaga'): x['robocze']['roiUwaga'] = ro['uwaga']
            scan_files[ro['plik']] = ro['plik']
            akty.append(x)
    akty.sort(key=lambda a: (a['rok'], a['robocze']['act'] if isinstance(a['robocze']['act'], int) else 10 ** 6, a['id']))
    zrodla = [{'id': 'zr:indeks-malzenstwa', 'typ': 'indeks', 'nazwa': 'Indeks małżeństw 1841–1894', 'plik': 'malzenstwa_mal.csv'}] + \
             [{'id': 'zr:odczyt-malzenstwa-%s' % y, 'typ': 'odczyt', 'nazwa': 'Odczyt AI małżeństw %s (haiku)' % y, 'plik': 'haiku/MALZENSTWA_%s_ai1_import.csv' % y} for y in rejestr]
    # zbiory skanów: pełna ścieżka względna (nazwy 001.jpg powtarzają się w wielu folderach) i suma kontrolna zawartości
    scan_hash = {}; zbp = os.path.join(H, 'skany_zbiory.json')
    for nz, z in (json.load(open(zbp, encoding='utf-8')) if os.path.exists(zbp) else {}).items():
        if nz.startswith('_'): continue
        for klucz, plik in z['pliki'].items():
            if klucz in scan_files:
                scan_files[klucz] = z['folder'] + '/' + plik
                if plik in z['sumy']: scan_hash[klucz] = z['sumy'][plik]
    return {'format': {'nazwa': 'multitool-dane', 'wersja': 1, 'zakres': 'malzenstwa'}, 'typ': 'malzenstwo',
            'opis': 'Małżeństwa: indeks 1841–1894 (%d aktów, status lub) + odczyty AI 1944–45 (%d aktów) z rejestrami i ROI. Bez zatwierdzeń (nie ma ich w żadnym pliku). Zapis zwarty.' % (n_idx, len(akty) - n_idx),
            'zr': T.tab, 'zrodla': zrodla, 'rejestr': rejestr, 'scanFiles': scan_files, 'scanHash': scan_hash, 'zatw': [], 'akty': akty}

# ---------- chrzty ----------
CHR_IDX = {'dziecko_nazwisko': 'child_last_name', 'dziecko_imiona': 'child_first_name', 'miejscowosc': 'child_birth_place', 'ojciec_imiona': 'father_first_name', 'ojciec_nazwisko': 'father_last_name', 'ojciec_wiek': 'father_age',
           'matka_imiona': 'mother_first_name', 'matka_nazwisko': 'mother_last_name', 'matka_wiek': 'mother_age', 'uwagi': 'index_month', 'uwagi_org': 'notes_org'}
def buduj_chrzty():
    T = Tab(); akty = []; P = 'blinow_akty.csv'
    for i, r in enumerate(rd(os.path.join(K, P)), 2):
        if not trim(r['rok']).isdigit(): continue
        rok = int(r['rok']); pola = {}
        for kol, f in CHR_IDX.items():
            v = trim(r.get(kol))
            if v and not kropka(v): pola[f] = {'v': v}
        dawne = trim(r['id_oryg']) or r['id']   # '#2' = akt przenumerowany; id_oryg to jego dawne id (dubluje id innego aktu), więc w eksporcie i jako `stary` zostaje id z indeksu (unikalne)
        akty.append({'id': r['id'], 'id_dawne': [dawne], 'stary': r['id'], 'typ': 'chrzest', 'rok': rok, 'nr': r['nr'], 'miejsce': r['miejscowosc'], 'epoka': 'lac' if rok < 1809 else 'pol' if rok < 1868 else 'ros',
                     'zrodla': ['zr:indeks-chrzty'], 'stan': 'z_indeksu', 's0': 'lub', 'z': [T.nr(P), trim(r['linia']) or str(i)], 'pola': pola,
                     'robocze': {'act': int(r['nr']) if trim(r['nr']).isdigit() else r['nr'], 'year': rok}})
    akty.sort(key=lambda a: (a['rok'], a['id']))
    return {'format': {'nazwa': 'multitool-dane', 'wersja': 1, 'zakres': 'chrzty'}, 'typ': 'chrzest',
            'opis': 'Chrzty 1783–1908: indeks z kart blinow_akty.csv (%d aktów, status lub). Bez zatwierdzeń (nie ma ich w żadnym pliku). Zapis zwarty.' % len(akty),
            'zr': T.tab, 'zrodla': [{'id': 'zr:indeks-chrzty', 'typ': 'indeks', 'nazwa': 'Indeks chrztów Blinów 1783–1908 (karty)', 'plik': 'blinow_akty.csv'}], 'scanFiles': {}, 'zatw': [], 'akty': akty}

def zapisz(nazwa, d):
    p = os.path.join(H, nazwa); s = json.dumps(d, ensure_ascii=False, separators=(',', ':'))
    open(p, 'w', encoding='utf-8', newline='\n').write(s + '\n'); print(nazwa, len(s.encode('utf-8')) // 1024, 'KB,', len(d['akty']), 'aktów')

def main(argv):
    wszystko = '--typy' in argv
    if wszystko or '--malzenstwa' in argv: zapisz('dane_malzenstwa.json', buduj_malzenstwa())
    if wszystko or '--chrzty' in argv: zapisz('dane_chrzty.json', buduj_chrzty())

if __name__ == '__main__': main(sys.argv[1:])
