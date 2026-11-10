#!/usr/bin/env python3
"""Test parytetu: wspolne/norm_zapis.js (JS) kontra funkcje z narzedzia/buduj_baza_v4.py (Python) na tych samych wejściach.
Funkcje Pythona są wyciągane z pliku buildera przez ast (builder nie jest uruchamiany), więc test sprawdza AKTUALNY kod buildera.
Wejścia: wszystkie wiersze haiku/ODCZYTY/lm/*.csv i *_dom_przyczyny.csv (rodzice, nazwiska, imiona, wiek) + nazwiska/imiona z indeksów + przypadki skrajne.
Uruchom: python3 PROJEKT_multitool/test/parytet_norm.py  (z public/konsolidacja). Kod wyjścia 0 = brak różnic."""
import ast, csv, glob, json, os, re, subprocess, sys, tempfile, unicodedata
H = os.path.dirname(os.path.abspath(__file__)); K = os.path.normpath(os.path.join(H, '..', '..'))
src = open(os.path.join(K, 'narzedzia', 'buduj_baza_v4.py'), encoding='utf-8').read()
WANT = {'fold', 'addm', 'male_surname', 'psur', 'parents', 'parents_pl', 'polname', 'polname_ai', 'is_child', 'fill_markers'}
nodes = [n for n in ast.parse(src).body if (isinstance(n, ast.FunctionDef) and n.name in WANT) or (isinstance(n, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'FSUF' for t in n.targets))]
assert {n.name for n in nodes if isinstance(n, ast.FunctionDef)} == WANT, 'brak funkcji w builderze'
SL = json.load(open(os.path.join(K, 'wspolne', 'slowniki_imion.json'), encoding='utf-8'))
ns = {'re': re, 'unicodedata': unicodedata, 'GEN': SL['GEN'], 'PGEN': SL['PGEN'], 'NPL': SL['NPL'], 'MALE': {}}
exec(compile(ast.Module(body=nodes, type_ignores=[]), 'buduj_baza_v4(wyciag)', 'exec'), ns)

# --- MALE: tak jak w builderze (zgony.csv plec=m, potem ojciec_nazwisko z blinow_akty.csv)
txt = open(os.path.join(K, 'zgony.csv'), encoding='utf-8-sig').read()
rows = list(csv.DictReader(txt.splitlines(), delimiter=';' if ';' in txt.split('\n')[0] else ','))
lista = [x['nazwisko'] for x in rows if x['plec'] == 'm'] + [x.get('ojciec_nazwisko', '') for x in csv.DictReader(open(os.path.join(K, 'blinow_akty.csv'), encoding='utf-8-sig'), delimiter=';')]
for n in lista: ns['addm'](n)
MALE = ns['MALE']

def rd(fn):   # jak rd() w builderze
    L = open(fn, encoding='utf-8-sig').read().splitlines(); Hd = L[0].split(';'); n = len(Hd); u = Hd.index('uwagi'); tail = n - 1 - u; out = []
    for ln in L[1:]:
        if not ln.strip(): continue
        p = ln.split(';')
        if len(p) > n: p = p[:u] + [';'.join(p[u:len(p) - tail])] + p[len(p) - tail:]
        p += [''] * (n - len(p)); out.append(dict(zip(Hd, p)))
    return out
lm = []
for fn in sorted(glob.glob(os.path.join(K, 'haiku', 'ODCZYTY', '*_dom_przyczyny.csv'))) + sorted(glob.glob(os.path.join(K, 'haiku', 'ODCZYTY', 'lm', '*.csv'))):
    lm += [x for x in rd(fn) if x.get('nazwisko', '').strip() or x.get('imie', '').strip()]
# przypadki skrajne (znaki, nawiasy, znaki zapytania, dopełniacze, formy żeńskie)
SK_ROD = ['', 'Matthaei et Annae', 'Joannis et Catharinae Kosidłow', 'Jacobi ? Kurczak', 'syn Kacpra i Agaty Kowalskich', 'córka Pawła Kosidłów', 'Szlachetnych Józefa i Marianny Nowaków', 'Jana', 'xyz', 'Adalberti (Woyciech) et Annae Wójcik?', 'DZIECKO Mateusza i Zofii Pcionów']
SK_NAZ = ['Kosidłowa', 'Kosidłowna', 'Kowalska', 'Pcionka', 'Kurczakowna', 'Woyciechowska', 'Kozaczkowa', 'Nowak', 'Nowak?', 'Gręda', 'Bucoń', 'Ma ria', '', 'Jakubowska', 'Szymańska', 'Cichocka', 'Wójcikowa', 'Kamieniakowa', 'Szymkowiakowna']
SK_IM = ['Jacobus', 'Jacobus (Jakub)', 'Joannes (Jan, Johannes)', 'Woyciech', 'Adalbertus?', '[_]', '[-]', 'Maria Anna', '(Jan)', 'Jan,', 'Hiacynthus', 'Mathias / Maciej', '', 'Anna (Hanna)', 'Catharina (Katarzyna), Kasia']
SK_AGE = ['', '3', '3 mies.', '14', '15', '60', '2 dni', '1 tyg.', '6 m.1', 'annor. 40', '3 ?', '[_]', '12 hebd']
PSUR = ['Kowalskiego', 'Kowalskich', 'Kosidłów', 'Pcionów', 'Pciona', 'Nowaków', 'Gręd', 'Jakubowskiego (?)', 'Wójcików', 'Kurczaków', 'Zielińskich', 'Kaczorowskich', '', 'Nowak']

cases = []
for x in lm:
    pl = x['plec'][:1]; pl = pl if pl in 'MK' else ''
    cases.append({'rodzice': x['rodzice'].strip(), 'nazwisko': x['nazwisko'], 'plec': pl, 'imie': x['imie'], 'wiek': x['wiek'], 'dom': x['dom']})
for r in SK_ROD: cases.append({'rodzice': r, 'nazwisko': 'Kowalski', 'plec': 'M', 'imie': 'Jan', 'wiek': '30', 'dom': '1'})
for n in SK_NAZ:
    for s in ('M', 'K', ''): cases.append({'rodzice': '', 'nazwisko': n, 'plec': s, 'imie': 'Jan', 'wiek': '', 'dom': ''})
for i in SK_IM:
    for a in SK_AGE: cases.append({'rodzice': '', 'nazwisko': 'Nowak', 'plec': 'M', 'imie': i, 'wiek': a, 'dom': '5'})
for x in rows[:3000]: cases.append({'rodzice': '', 'nazwisko': x['nazwisko'], 'plec': {'m': 'M', 'k': 'K'}.get(x['plec'], ''), 'imie': x['imie'], 'wiek': x.get('wiek', ''), 'dom': ''})

def py_case(c):
    out = {}
    out['lac'] = ns['parents'](c['rodzice']); out['pl'] = ns['parents_pl'](c['rodzice'])
    ms = ns['male_surname'](c['nazwisko'], c['plec']) if c['nazwisko'] else None
    out['ms'] = list(ms) if ms else None
    out['pn'] = list(ns['polname'](c['imie']))
    out['dz'] = ns['is_child'](c['wiek'])
    ai = {'deceased_last_name': c['nazwisko'], 'deceased_first_name': c['imie'], 'deceased_sex': c['plec'], 'age': c['wiek'], 'house': c['dom']}
    if c['rodzice']:
        ai['parents_raw'] = c['rodzice']
        for k, v in (ns['parents'](c['rodzice']) or ns['parents_pl'](c['rodzice'])).items(): ai[k] = v + ('?' if '?' in c['rodzice'] else '')
    ns['polname_ai'](ai); ns['fill_markers'](ai); out['ai'] = ai
    return out
exp = [py_case(c) for c in cases]
exp_psur = [ns['psur'](t) for t in PSUR]

js = r"""
const fs = require('fs'), vm = require('vm'), path = require('path');
const K = process.argv[2], inp = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const f = n => fs.readFileSync(path.join(K, 'wspolne', n), 'utf8');
const src = ['tekst.js', 'raport.js', 'norm.js', 'norm_zapis.js'].map(f).join('\n').replace('/*JSON:slowniki_imion*/', f('slowniki_imion.json'));
const X = {}; vm.createContext(X);
vm.runInContext(src + '\nthis.api = {zapBudujMale, zapMaleNazwisko, zapPsur, zapRodziceLac, zapRodzicePl, zapPolImie, zapPolImionaAi, zapDziecko, zapZnaczniki};', X); const A = X.api;
const MALE = A.zapBudujMale(inp.lista), out = [];
for (const c of inp.cases) {
  const o = {}; o.lac = A.zapRodziceLac(c.rodzice); o.pl = A.zapRodzicePl(c.rodzice, MALE);
  o.ms = c.nazwisko ? A.zapMaleNazwisko(c.nazwisko, c.plec, MALE) : null; o.pn = A.zapPolImie(c.imie); o.dz = A.zapDziecko(c.wiek);
  const ai = {deceased_last_name: c.nazwisko, deceased_first_name: c.imie, deceased_sex: c.plec, age: c.wiek, house: c.dom};
  if (c.rodzice) { ai.parents_raw = c.rodzice; const p = Object.keys(A.zapRodziceLac(c.rodzice)).length ? A.zapRodziceLac(c.rodzice) : A.zapRodzicePl(c.rodzice, MALE); for (const [k, v] of Object.entries(p)) ai[k] = v + (c.rodzice.includes('?') ? '?' : ''); }
  A.zapPolImionaAi(ai); A.zapZnaczniki(ai); o.ai = ai; out.push(o);
}
console.log(JSON.stringify({male: Object.assign({}, MALE), cases: out, psur: inp.psur.map(t => A.zapPsur(t, MALE))}));
"""
with tempfile.TemporaryDirectory() as td:
    ji = os.path.join(td, 'in.json'); jj = os.path.join(td, 'p.js')
    json.dump({'lista': lista, 'cases': cases, 'psur': PSUR}, open(ji, 'w', encoding='utf-8'), ensure_ascii=False); open(jj, 'w', encoding='utf-8').write(js)
    r = subprocess.run(['node', jj, K, ji], capture_output=True, text=True)
    if r.returncode: print(r.stderr[:2000]); sys.exit(2)
got = json.loads(r.stdout)
roz = []
if got['male'] != MALE: roz.append(('MALE', len(MALE), len(got['male']), [k for k in set(MALE) | set(got['male']) if MALE.get(k) != got['male'].get(k)][:10]))
for i, (e, g) in enumerate(zip(exp, got['cases'])):
    for k in e:
        if e[k] != g[k]: roz.append((k, cases[i], e[k], g[k]))
for t, e, g in zip(PSUR, exp_psur, got['psur']):
    if e != g: roz.append(('psur', t, e, g))
print('MALE: %d kluczy; przypadków: %d (z lm: %d); psur: %d; różnic: %d' % (len(MALE), len(cases), len(lm), len(PSUR), len(roz)))
for x in roz[:15]: print(' ', json.dumps(x, ensure_ascii=False)[:400])
sys.exit(1 if roz else 0)
