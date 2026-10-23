import sys, re, csv
sys.path.insert(0, '/home/claude/genealog-indexer-v7.1/public/konsolidacja/skrypty')
from dump_sheet import load

SRC = sys.argv[1] if len(sys.argv) > 1 else '869f3f66-arkusze_osobowe.ods'
OUT = '/home/claude/genealog-indexer-v7.1/public/konsolidacja/malzenstwa_mal.csv'
LOG = '/home/claude/genealog-indexer-v7.1/public/konsolidacja/malzenstwa_mal_log_zmian.csv'
PLACEHOLDERS = {'', '.', '-----', '?', '0', 'X', 'x'}

rows = load(SRC, 'Mał')
cols_out = ['rok','nr','wiersz_zrodlo','data_tekst','data_iso',
 'pan_nazwisko','pan_imie','pan_stan','pan_ojciec_imie','pan_ojciec_nazwisko',
 'pan_matka_imie','pan_matka_nazwisko','pan_miejscowosc','pan_wiek',
 'pan_rok_ur_przyb','pan_rok_ur_przyb_surowe',
 'panna_imie','panna_nazwisko','panna_stan','panna_ojciec_imie','panna_ojciec_nazwisko',
 'panna_matka_imie','panna_matka_nazwisko','panna_miejscowosc','panna_wiek',
 'panna_rok_ur_przyb','panna_rok_ur_przyb_surowe',
 'swiadek1_imie','swiadek1_nazwisko','swiadek1_wiek',
 'swiadek2_imie','swiadek2_nazwisko','swiadek2_wiek',
 'surowe_kol_6_8','surowe_kol_21_23','flagi']

def clean(v):
    v = (v or '').strip()
    v = re.sub(r'\s+', ' ', v)
    return v

def num(v):
    return int(v) if re.fullmatch(r'\d{1,3}', v or '') else None

def near_year(raw):
    m = re.search(r'(\d{4})', raw or '')
    return int(m.group(1)) if m else None

def iso_date(c, year):
    m = re.fullmatch(r'(\d{1,2})\.(\d{1,2})\??', c or '')
    if not m or not year:
        return '', False
    d, mo = int(m.group(1)), int(m.group(2))
    if not (1 <= mo <= 12 and 1 <= d <= 31):
        return '', False
    std = bool(re.fullmatch(r'\d{2}\.\d{2}', c))
    return f'{year:04d}-{mo:02d}-{d:02d}', std

out, logs, skipped = [], [], []
for rn, cells in rows:
    d = {c: clean(t) for c, t, f in cells}
    # content check: any real value in the used columns
    used = ['A','B','C','D','E','F','J','K','L','M','N','O','P','S','T','U','Y','Z','AA','AB','AC','AD','AE','AG','AH','AI','AJ','AK','AL']
    if not any(d.get(c, '') not in PLACEHOLDERS and d.get(c, '') != '' for c in ['A','B','D','E','S','T','J','L','Y','AA']):
        skipped.append(rn)
        continue
    flags = []
    year = num(d.get('A', '')) or near_year(d.get('A', ''))
    if year is None:
        flags.append('brak roku (kol. A)')
    if d.get('Q') != d.get('A') or d.get('R') != d.get('B'):
        flags.append('kol. Q/R nie zgadza się z A/B')
    dt = d.get('C', '')
    iso, std = iso_date(dt, year)
    if not iso:
        flags.append('brak lub nieczytelna data w kol. C' if dt in ('', '.') else f'data nieczytelna: {dt}')
    elif not std:
        flags.append(f'data w niestandardowym formacie: {dt}')
    if dt.endswith('?'):
        flags.append('data z pytajnikiem')

    def person(prefix, col):
        name = {}
        return name

    # --- groom
    pan = dict(
        pan_nazwisko=d.get('D',''), pan_imie=d.get('E',''), pan_stan=d.get('F',''),
        pan_ojciec_imie=d.get('J',''), pan_ojciec_nazwisko=d.get('K',''),
        pan_matka_imie=d.get('L',''), pan_matka_nazwisko=d.get('M',''),
        pan_miejscowosc=d.get('N',''), pan_wiek=d.get('O',''))
    panna = dict(
        panna_imie=d.get('S',''), panna_nazwisko=d.get('T',''), panna_stan=d.get('U',''),
        panna_ojciec_imie=d.get('Y',''), panna_ojciec_nazwisko=d.get('Z',''),
        panna_matka_imie=d.get('AA',''), panna_matka_nazwisko=d.get('AB',''),
        panna_miejscowosc=d.get('AC',''), panna_wiek=d.get('AD',''))

    for pfx, rec, rokcol, wiekcol in [('pan', pan, 'P', 'O'), ('panna', panna, 'AE', 'AD')]:
        for k, v in rec.items():
            if v in ('.', '?', '-----', 'x', 'X', 'w', '0') and k.endswith(('_imie','_nazwisko','_miejscowosc')):
                pass
        w = rec[f'{pfx}_wiek']
        wn = num(w)
        if w and wn is None:
            flags.append(f'{pfx}: wiek nieliczbowy w kol. {wiekcol}: {w}')
        rec[f'{pfx}_rok_ur_przyb'] = str(year - wn) if (year and wn is not None) else ''
        raw = d.get(rokcol, '')
        rec[f'{pfx}_rok_ur_przyb_surowe'] = raw
        if raw.startswith('#'):
            flags.append(f'{pfx}: błąd formuły w arkuszu w kol. {rokcol} ({raw})')
        elif raw and wn is not None and year:
            ry = near_year(raw)
            if ry and ry != year - wn:
                flags.append(f'{pfx}_rok_ur_przyb_rozni_sie: surowe {raw}, z wieku ~{year - wn}')

    # --- uncertain / placeholder markers in name fields
    for k in ['pan_nazwisko','pan_imie','panna_imie','panna_nazwisko','pan_ojciec_imie','pan_ojciec_nazwisko','pan_matka_imie','pan_matka_nazwisko','panna_ojciec_imie','panna_ojciec_nazwisko','panna_matka_imie','panna_matka_nazwisko']:
        v = pan.get(k) or panna.get(k) or ''
        if v in ('x', 'w'):
            flags.append(f'{k}: wartość {v} (placeholder?) zostawiona')
        elif '?' in v:
            flags.append(f'{k}: znak ? w wartości "{v}" (niepewne)')
        elif '(' in v:
            flags.append(f'{k}: nawias w wartości "{v}"')
        elif v in ('.', '-----'):
            pass

    # --- stan
    if pan['pan_stan'] not in ('k', 'w'):
        flags.append(f'pan_stan nietypowy: {pan["pan_stan"]!r}')
    if panna['panna_stan'] not in ('p', 'w'):
        flags.append(f'panna_stan nietypowy: {panna["panna_stan"]!r}')

    # --- witnesses
    sw = {}
    for n, (ci, cn, cw) in {1: ('AG','AH','AI'), 2: ('AJ','AK','AL')}.items():
        iv, nv, wv = d.get(ci,''), d.get(cn,''), d.get(cw,'')
        sw[f'swiadek{n}_imie'] = '' if iv in ('.','') else iv
        sw[f'swiadek{n}_nazwisko'] = '' if nv in ('.','') else nv
        sw[f'swiadek{n}_wiek'] = '' if wv in ('.','') else wv
        if wv and wv not in ('.',) and num(wv) is None:
            flags.append(f'swiadek{n}: wiek nieliczbowy {wv}')

    surowe68 = ' | '.join(x for x in [d.get('G',''), d.get('H',''), d.get('I','')] if x)
    surowe2123 = ' | '.join(x for x in [d.get('V',''), d.get('W',''), d.get('X','')] if x)

    rec = dict(rok=str(year) if year else d.get('A',''), nr=d.get('B',''), wiersz_zrodlo=str(rn),
               data_tekst=dt, data_iso=iso, surowe_kol_6_8=surowe68, surowe_kol_21_23=surowe2123,
               flagi='; '.join(flags))
    rec.update(pan); rec.update(panna); rec.update(sw)
    out.append(rec)

with open(OUT, 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.DictWriter(f, fieldnames=cols_out, delimiter=';')
    w.writeheader()
    for r in out:
        w.writerow({k: r.get(k, '') for k in cols_out})
with open(LOG, 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f, delimiter=';')
    w.writerow(['wiersz','pole','przed','po','powod'])
    for rn in skipped:
        w.writerow([rn,'pominiety','','','pusty wiersz: tylko formuly i znaki ? lub .'])
print('written', len(out), 'skipped empty', len(skipped), skipped[:50])
