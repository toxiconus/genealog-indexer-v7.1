#!/usr/bin/env python3
"""FTB (MyHeritage Family Tree Builder, SQLite) -> GEDCOM 5.5.1 (UTF-8) + drzewo_ftb.json (format narzędzia dopasowania).
Użycie: python3 -I ftb_do_ged.py PLIK.ftb WYJSCIE_BEZ_ROZSZERZENIA   (powstają .ged i .json; dane nie trafiają do repo)"""
import sqlite3, sys, json, re
src, out = sys.argv[1:3]
c = sqlite3.connect(f'file:{src}?mode=ro', uri=True); c.text_factory = bytes
S = lambda b: (b or b'').decode('utf-8', 'replace').strip()
def pb(b):   # pole tekstowe w formacie protobuf: 0x0A, długość, tekst
    b = b or b''
    if b[:1] == b'\n' and len(b) > 2 and b[1] < 128: return b[2:2 + b[1]].decode('utf-8', 'replace').strip()
    return S(b)
def tc(x): return x.title() if x and x.isupper() and len(x) > 1 else x
place = {}
for pid, lang, txt in c.execute('select place_id,data_language,place from places_lang_data order by (data_language=16) asc'): place[pid] = S(txt)   # lang 16 nadpisuje
ds = {r[0]: r[1] for r in c.execute('select individual_data_set_id,individual_id from individual_data_set where delete_flag=0')}
names = {}
for sid, lang, fn, ln, ms, fo in c.execute('select individual_data_set_id,data_language,first_name,last_name,married_surname,former_name from individual_lang_data order by (data_language=16) asc'):
    if sid in ds: names[ds[sid]] = (tc(S(fn)), tc(S(ln)), tc(S(ms)), tc(S(fo)))
P = {}
for iid, g, dl in c.execute('select individual_id,gender,delete_flag from individual_main_data'):
    if dl: continue
    fn, ln, ms, fo = names.get(iid, ('', '', '', ''))
    P['I%d' % iid] = {'fn': fn, 'sn': ln or ms, 'ms': ms if ln else '', 'sex': S(g) or 'U', 'b': '', 'bp': '', 'b2': '', 'd': '', 'dp': '', 'd2': '', 'notes': [], 'id': iid}
TOK = {b'BIRT': ('b', 'bp'), b'DEAT': ('d', 'dp'), b'CHR': ('b2', None), b'BAPM': ('b2', None), b'BURI': ('d2', None)}
for iid, tok, date, pid in c.execute('select individual_id,token,date,place_id from individual_fact_main_data where delete_flag=0 order by individual_fact_id'):
    p = P.get('I%d' % iid); t = TOK.get(tok)
    if not p or not t: continue
    d = pb(date)
    if d and not p[t[0]]: p[t[0]] = d
    if t[1] and pid and not p[t[1]]: p[t[1]] = place.get(pid, '')
F = {}
for fid, dl in c.execute('select family_id,delete_flag from family_main_data'):
    if not dl: F['F%d' % fid] = {'h': '', 'w': '', 'k': [], 'm': '', 'mp': ''}
kids = {}
for fid, iid, role, order in c.execute('select family_id,individual_id,individual_role_type,child_order_in_family from family_individual_connection where delete_flag=0'):
    f = F.get('F%d' % fid); i = 'I%d' % iid
    if f is None or i not in P: continue
    if role == 2: f['h'] = i
    elif role == 3: f['w'] = i
    elif role == 5: kids.setdefault(fid, []).append((order if order is not None else -1, iid))
for fid, l in kids.items(): F['F%d' % fid]['k'] = ['I%d' % i for _, i in sorted(l)]
for fid, tok, date, pid in c.execute('select family_id,token,date,place_id from family_fact_main_data where delete_flag=0 order by family_fact_id'):
    f = F.get('F%d' % fid)
    if f and tok == b'MARR' and not f['m']: f['m'] = pb(date); f['mp'] = place.get(pid, '')
# --- JSON (format narzędzia)
js = {'p': {k: {x: v for x, v in p.items() if x != 'id'} for k, p in P.items()}, 'f': F}
json.dump(js, open(out + '.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
# --- GED
famc = {}; fams = {}
for fid, f in F.items():
    for k in f['k']: famc.setdefault(k, []).append(fid)
    for s in (f['h'], f['w']):
        if s: fams.setdefault(s, []).append(fid)
L = ['0 HEAD', '1 SOUR FTB_DO_GED', '1 GEDC', '2 VERS 5.5.1', '2 FORM LINEAGE-LINKED', '1 CHAR UTF-8']
def ev(tag, d, pl):
    if not (d or pl): return
    L.append('1 ' + tag)
    if d: L.append('2 DATE ' + d)
    if pl: L.append('2 PLAC ' + pl)
for k, p in P.items():
    L += ['0 @%s@ INDI' % k, '1 NAME %s /%s/' % (p['fn'], p['sn']), '2 GIVN ' + p['fn'], '2 SURN ' + p['sn']]
    if p['ms']: L += ['1 NAME %s /%s/' % (p['fn'], p['ms']), '2 TYPE married']
    L.append('1 SEX ' + (p['sex'] if p['sex'] in 'MF' else 'U'))
    ev('BIRT', p['b'], p['bp']); ev('CHR', p['b2'], ''); ev('DEAT', p['d'], p['dp']); ev('BURI', p['d2'], '')
    for f in fams.get(k, []): L.append('1 FAMS @%s@' % f)
    for f in famc.get(k, []): L.append('1 FAMC @%s@' % f)
for fid, f in F.items():
    L.append('0 @%s@ FAM' % fid)
    if f['h']: L.append('1 HUSB @%s@' % f['h'])
    if f['w']: L.append('1 WIFE @%s@' % f['w'])
    for k in f['k']: L.append('1 CHIL @%s@' % k)
    ev('MARR', f['m'], f['mp'])
L.append('0 TRLR')
open(out + '.ged', 'w', encoding='utf-8', newline='').write('\r\n'.join(L) + '\r\n')
print('osoby', len(P), 'rodziny', len(F), 'z datą ur.', sum(1 for p in P.values() if p['b']), 'z datą zg.', sum(1 for p in P.values() if p['d']), 'dzieci w rodzinach', sum(len(f['k']) for f in F.values()))
