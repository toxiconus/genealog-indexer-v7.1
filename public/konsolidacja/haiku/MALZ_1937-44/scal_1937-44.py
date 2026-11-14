#!/usr/bin/env python3
"""Scala odczyty Haiku cz01–cz15 (małżeństwa 1937–1944) w pliki per rok w haiku/ (jak MALZENSTWA_1944/1945_ai1_*), poprawia lata z ciągłości numeracji,
dedupluje akty, normalizuje oczywiste literówki imion/nazwisk wg słownika z bazy (log: normalizacja_log.csv), dopisuje zbiór skanów do app/skany_zbiory.json."""
import csv, glob, os, re, json, hashlib, collections, sys
H = os.path.dirname(os.path.abspath(__file__)); HK = os.path.dirname(H); APP = os.path.join(os.path.dirname(HK), 'PROJEKT_multitool', 'app')
SK = '/mnt/user-data/uploads/1937-1944 USC Szastarka'
ROK = {'cz05': 1940, 'cz06': 1940, 'cz07': 1940, 'cz12': 1943}   # rok z ciągłości numeracji księgi (Haiku wpisał 1944)
rows = {}; skany = []; cols = None
for f in sorted(glob.glob(os.path.join(H, 'cz*_akty.csv'))):
    cz = os.path.basename(f)[:4]
    for r in csv.DictReader(open(f, encoding='utf-8-sig'), delimiter=';'):
        cols = cols or list(r.keys()); y = ROK.get(cz, int(r['marriage_year'])); n = int(r['marriage_act_number'])
        if y != int(r['marriage_year']):
            r['marriage_date'] = re.sub(r'^\d{4}', str(y), r['marriage_date']) if r['marriage_date'] else ''
            u = [x for x in r['uncertain_fields'].split(',') if x]; 
            if r['marriage_date'] and 'marriage_date' not in u: u.append('marriage_date')
            r['uncertain_fields'] = ','.join(u); r['verification_notes'] = (r['verification_notes'] + ' | rok poprawiony z ciągłości księgi (' + r['marriage_year'] + '→' + str(y) + ')').strip(' |')
        r['marriage_year'] = str(y); r['marriage_act_number'] = str(n); r['id'] = 'ai1-m%d-%03d' % (y, n); r['_cz'] = cz
        k = (y, n); fill = sum(1 for v in r.values() if v)
        if k not in rows or fill > rows[k][0]: rows[k] = (fill, r)
    for s in csv.reader(open(f.replace('_akty', '_skany'), encoding='utf-8-sig'), delimiter=';'):
        if len(s) >= 4 and s[0].strip().isdigit() and s[1].strip().isdigit():
            y = ROK.get(cz, int(s[0])); skany.append((y, int(s[1]), s[2].strip(), s[3].strip()))
# normalizacja imion/nazwisk wg słownika z całej bazy (mini)
cnt = {'n': collections.Counter(), 's': collections.Counter()}
for fn in ('dane_zgon.json', 'dane_malzenstwo.json', 'dane_chrzest.json'):
    d = json.load(open(os.path.join(APP, 'mini', fn), encoding='utf-8')); L = d if isinstance(d, list) else d['akty']
    for a in L:
        for k, v in a['f'].items():
            t = 'n' if k.endswith('_first_name') else 's' if (k.endswith('_last_name') or k.endswith('maiden_name')) else None
            if t and v and not v.startswith('['): cnt[t][v.replace('?', '').strip()] += 1
def lev(a, b):
    p = list(range(len(b) + 1))
    for i, x in enumerate(a, 1):
        c = [i]
        for j, y in enumerate(b, 1): c.append(min(p[j] + 1, c[-1] + 1, p[j - 1] + (x != y)))
        p = c
    return p[-1]
log = []
def popraw(r, k, t):
    v = r[k].strip()
    if not v or cnt[t][v] >= 1 or v in ('Pionek',): return   # tylko formy, których nie ma w bazie
    import unicodedata
    fold = lambda x: ''.join(ch for ch in unicodedata.normalize('NFD', x.lower().replace('ł', 'l')) if unicodedata.category(ch) != 'Mn')
    c = [(lev(v.lower(), w.lower()), -n, w) for w, n in cnt[t].items() if n >= 5 and abs(len(w) - len(v)) <= 1 and w[:1].lower() == v[:1].lower()]
    c = sorted(x for x in c if x[0] <= 1 and fold(x[2]) != fold(v) and not (v[:-1] == x[2][:-1] and v[-1] in 'aiy' and x[2][-1] in 'aiy'))   # bez zmian samych znaków diakrytycznych i końcówek rodzaju (-i/-a)
    if c and (len(c) == 1 or c[0][1] < c[1][1] * 2 or c[0][0] < c[1][0]):   # jednoznaczny kandydat (albo wyraźnie najczęstszy)
        r[k] = c[0][2]; u = [x for x in r['uncertain_fields'].split(',') if x]; 
        if k not in u: u.append(k)
        r['uncertain_fields'] = ','.join(u); log.append((r['id'], k, v, c[0][2], -c[0][1]))
for (y, n), (_, r) in sorted(rows.items()):
    for k in cols:
        if k.endswith('_first_name'): popraw(r, k, 'n')
        elif k.endswith('_last_name') or k.endswith('maiden_name'): popraw(r, k, 's')
with open(os.path.join(H, 'normalizacja_log.csv'), 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f, delimiter=';'); w.writerow(['id', 'pole', 'odczyt_AI', 'poprawione', 'wystapien_w_bazie']); w.writerows(log)
# zapis per rok (+ 1944 jako część cz2: akty 1–20)
roi = {'lewa': {'x': 0.02, 'y': 0.06, 'w': 0.47, 'h': 0.88}, 'prawa': {'x': 0.51, 'y': 0.06, 'w': 0.47, 'h': 0.88}}
sk = {}
for y, n, p, st in skany: sk.setdefault((y, n), []).append((p, st))
def zapis(nazwa, lista):
    with open(os.path.join(HK, nazwa + '_import.csv'), 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.DictWriter(f, fieldnames=cols, delimiter=';', extrasaction='ignore'); w.writeheader(); [w.writerow(r) for r in lista]
    R = []
    for r in lista:
        s = sk.get((int(r['marriage_year']), int(r['marriage_act_number'])), [('000.jpg', 'lewa')])[0]; fn = s[0] if s[0].endswith('.jpg') else s[0] + '.jpg'; fn = fn.split(' ')[0]
        R.append({'id': r['id'], 'plik': 'M3744_' + fn[:3], 'strona': s[1], 'roi': roi.get(s[1], roi['lewa']), 'uwaga': 'przybliżone'})
    json.dump(R, open(os.path.join(HK, nazwa + '_roi.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return R
used = set(); lat = sorted({y for y, _ in rows})
for y in lat:
    L = [r for (yy, n), (_, r) in sorted(rows.items()) if yy == y]
    if y == 1944:
        L = [r for r in L if int(r['marriage_act_number']) <= 20]; R = zapis('MALZENSTWA_1944_cz2_ai1', L)
    else:
        R = zapis('MALZENSTWA_%d_ai1' % y, L); json.dump([], open(os.path.join(HK, 'MALZENSTWA_%d_ai1_rejestr.json' % y), 'w')); 
    used |= {x['plik'] for x in R}; print(y, len(L), 'aktów')
# zbiór skanów (suma kontrolna SHA-256, 16 znaków)
pl = {}; su = {}
for k in sorted(used):
    fn = k[-3:] + '.jpg'; pl[k] = fn
for fn in sorted(os.listdir(SK)):
    su[fn] = hashlib.sha256(open(os.path.join(SK, fn), 'rb').read()).hexdigest()[:16]
zb = os.path.join(APP, 'skany_zbiory.json'); d = json.load(open(zb, encoding='utf-8'))
d['malzenstwa_1937-44'] = {'folder': 'Małżeństwa/1937-1944 USC Szastarka', 'pliki': pl, 'sumy': su}
json.dump(d, open(zb, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('normalizacji:', len(log), '| skanów:', len(su))
