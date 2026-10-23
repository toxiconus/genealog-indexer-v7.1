import sys, re, csv
sys.path.insert(0, '/tmp/claude-0/-home-claude/3e7ce577-16ba-54bc-8dbe-e2ba98a801b3/scratchpad/ods_in')
from dump_sheet import load
W = '/tmp/claude-0/-home-claude/3e7ce577-16ba-54bc-8dbe-e2ba98a801b3/scratchpad/zg'
SRC = '/tmp/claude-0/-home-claude/3e7ce577-16ba-54bc-8dbe-e2ba98a801b3/scratchpad/ods_in/src.ods'
EXT = set('FHIKLMNOPQRS')
PAT_NR = re.compile(r'^(.+?), nr\. wpisu (\d+)$')
PAT_KARTA = re.compile(r'^[Kk]arta (\d+)$')
PAT_PLACE = re.compile(r'^[A-ZĄĆĘŁŃÓŚŹŻ][^,|]*$')
COLS = ['id_archiwalne','wiersz_zrodlo','typ_ksiegi','nazwisko','imie','plec','zrodlo','rok',
        'miejscowosc','nr_wpisu','karta','wiek','jednostka_wieku','stan','ojciec_imie',
        'matka_imie','matka_nazwisko','rodowe','zyjacy_malzonek','uwagi','rok_ur_wyliczony',
        'data_surowa','surowe_kol_6','surowe_pozostale','flagi']
HAND_KEYS = {'plec','wiek','jedn','stan','ojc','mat','matn','rodowe','zyjacy_malzonek','uw',
             'miejsc','data','nr','karta','fl'}

def lower_fix(s):
    # poprawka tylko dla pierwszej litery; nazwiska przyimkowe 'z ...' zostają bez zmian
    if s and s[0].islower() and not s.startswith('z ') and s != 'nieczytelne':
        return s[0].upper() + s[1:], True
    return s, False

rows = load(SRC, 'Zg')
cells_by_rn = {}
d_by_rn = {}
for rn, cells in rows:
    cells_by_rn[rn] = cells
    d_by_rn[rn] = {c: t.strip() for c, t, f in cells if t and t.strip()}

free_expected = [int(x) for x in open(f'{W}/free_rows_list.txt').read().split()]
# parse hand files
hand = {}
for fn in ['hand_zg_01.txt','hand_zg_02.txt','hand_zg_03.txt']:
    for ln in open(f'{W}/{fn}', encoding='utf-8'):
        ln = ln.strip()
        if not ln: continue
        parts = [p.strip() for p in ln.split('|')]
        rn = int(parts[0])
        if rn in hand: raise SystemExit(f'duplikat wiersza {rn}')
        rec = {}
        for p in parts[1:]:
            k, v = p.split('=', 1)
            if k not in HAND_KEYS: raise SystemExit(f'nieznany klucz {k} w wierszu {rn}')
            rec[k] = v
        hand[rn] = rec
if sorted(hand) != sorted(free_expected):
    missing = set(free_expected) - set(hand); extra = set(hand) - set(free_expected)
    raise SystemExit(f'pokrycie: brak {sorted(missing)[:10]} nadmiar {sorted(extra)[:10]}')
print('pokrycie OK, wierszy wolnych:', len(hand))

def surowe_rest(d):
    return '|'.join(f'{c}={d[c]}' for c in sorted(d) if c in EXT)

out, log = [], []
def base(rn, d):
    nazw, imie = d.get('B',''), d.get('C','')
    flags_base = []
    if not nazw: flags_base.append('brak nazwiska')
    if not imie: flags_base.append('brak imienia')
    n2, c1 = lower_fix(nazw); i2, c2 = lower_fix(imie)
    if c1: flags_base.append('nazwisko z małej litery (poprawiono)'); log.append([rn,'nazwisko',nazw,n2,'mała litera na początku'])
    if c2: flags_base.append('imię z małej litery (poprawiono)'); log.append([rn,'imie',imie,i2,'mała litera na początku'])
    if '?' in n2 + i2: flags_base.append('znak ? w nazwisku/imieniu (niepewne)')
    return dict(id_archiwalne=d.get('A',''), wiersz_zrodlo=str(rn), typ_ksiegi='Liber mortuorum',
                nazwisko=n2, imie=i2, zrodlo=d.get('D',''), rok=d.get('E',''), surowe_kol_6=d.get('G',''),
                surowe_pozostale=surowe_rest(d), flagi_base=flags_base)

# proste wiersze: ta sama logika co build_zg_simple.py
for rn in sorted(d_by_rn):
    d = d_by_rn[rn]
    if not d or rn in hand: continue
    if set(d) & EXT: raise SystemExit(f'wiersz {rn} z kolumnami rozszerzonymi nie jest w liście wolnych')
    g = d.get('G','')
    m1, m2 = PAT_NR.match(g), PAT_KARTA.match(g)
    if m1: mia, nr, ka = m1.group(1), m1.group(2), ''
    elif m2: mia, nr, ka = '', '', m2.group(1)
    elif g == '': mia, nr, ka = '', '', ''
    elif PAT_PLACE.match(g): mia, nr, ka = g, '', ''
    else: raise SystemExit(f'wiersz {rn} nieoczekiwany G={g}')
    r = base(rn, d)
    r.update(miejscowosc=mia, nr_wpisu=nr, karta=ka)
    r['flagi'] = '; '.join(r.pop('flagi_base') + ([] if g else ['brak miejsca i numeru wpisu (kol. G)']))
    out.append(r)

# wiersze wolne: ręczne przepisanie
for rn in sorted(hand):
    d = d_by_rn.get(rn, {})
    h = hand[rn]
    r = base(rn, d)
    fl = r.pop('flagi_base')
    wiek = h.get('wiek','')
    jedn = h.get('jedn','')
    if wiek and not jedn: jedn = 'lat'   # liczba bez oznaczenia = lata (m. = miesiące, t. = tygodnie)
    rok_ur = ''
    if wiek.isdigit() and jedn == 'lat' and d.get('E','').isdigit():
        rok_ur = f'~{int(d["E"]) - int(wiek)}'
    if 'fl' in h: fl.append(h['fl'])
    if not wiek and jedn: fl.append('jednostka bez wieku')
    r.update(plec=h.get('plec',''), miejscowosc=h.get('miejsc',''), nr_wpisu=h.get('nr',''),
             karta=h.get('karta',''), data_surowa=h.get('data',''), wiek=wiek, jednostka_wieku=jedn,
             stan=h.get('stan',''), ojciec_imie=h.get('ojc',''), matka_imie=h.get('mat',''),
             matka_nazwisko=h.get('matn',''), rodowe=h.get('rodowe',''),
             zyjacy_malzonek=h.get('zyjacy_malzonek',''), uwagi=h.get('uw',''),
             rok_ur_wyliczony=rok_ur, flagi='; '.join(fl))
    out.append(r)

out.sort(key=lambda r: int(r['wiersz_zrodlo']))
with open(f'{W}/zgony.csv','w',encoding='utf-8-sig',newline='') as f:
    w = csv.DictWriter(f, fieldnames=COLS, delimiter=';'); w.writeheader()
    for r in out: w.writerow({c: r.get(c,'') for c in COLS})
with open(f'{W}/zgony_log_zmian.csv','w',encoding='utf-8-sig',newline='') as f:
    w = csv.writer(f, delimiter=';'); w.writerow(['wiersz','pole','przed','po','powod']); w.writerows(log)
print('wierszy wynikowych:', len(out), 'proste:', len(out)-len(hand), 'wolne:', len(hand), 'log:', len(log))
