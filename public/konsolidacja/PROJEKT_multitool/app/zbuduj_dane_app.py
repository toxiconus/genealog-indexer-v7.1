#!/usr/bin/env python3
"""Krok 3 planu: buduje app/dane_zgony.json (zgony z dane_pelne.json + to, czego model jeszcze nie niesie: tekst aktu, alts, tnotes, ROI pól, lubName, era, klucz pliku skanu, słowniki counts/fix).
Źródła: prototyp/dane_pelne.json (python3 prototyp/zbuduj_dane.py --wszystko) oraz narzedzia/baza_zgonow_1797-1945.html (D.acts). Zapis zwarty: source = [numer wpisu w tabeli `zr`, wiersz]; unc tylko gdy prawda.
Uruchom: python3 app/zbuduj_dane_app.py"""
import json, os, sys
H = os.path.dirname(os.path.abspath(__file__)); K = os.path.join(H, '..', '..')
d = json.load(open(os.path.join(H, '..', 'prototyp', 'dane_pelne.json'), encoding='utf-8'))
s = open(os.path.join(K, 'narzedzia', 'baza_zgonow_1797-1945.html'), encoding='utf-8').read(); i = s.index('const D = '); j = s.index(';\n', i)
OD = json.loads(s[i + 10:j]); ST = {a['id']: a for a in OD['acts'] if not a.get('kind')}
idd = d['id_dawne']; tab = []; tix = {}
def zr(src):
    k = (src.get('plik', ''), src.get('skan', ''), src.get('strona', ''))
    if k not in tix: tix[k] = len(tab); tab.append(list(k))
    return [tix[k], src.get('wiersz', '')]
def pole(p):
    o = {'v': p['value'], 's': p['status'], 'z': zr(p['source'])}
    if p.get('unc'): o['u'] = 1
    if p.get('roi'): o['roi'] = p['roi']
    if p.get('alt'): o['alt'] = [pole(x) for x in p['alt']]
    for k in ('raw', 'by', 'note'):
        if p.get(k): o[k] = p[k]
    return o
akty = []; brak = 0
for a in d['akty']:
    if a['typ'] != 'zgon': continue
    st = [x for x in idd[a['id']] if x in ST]
    if len(st) != 1: brak += 1; continue
    o = ST[st[0]]
    r = {'file': o.get('file') or '', 'roi': o.get('roi'), 'lubName': o.get('lubName') or '', 'lubRaw': o.get('lubRaw') or '', 'era': o.get('era') or '', 'act': o['act'], 'year': o['year']}
    for k in ('alts', 'tnotes', 'pola'):
        if o.get(k): r[k] = o[k]
    x = {'id': a['id'], 'id_dawne': idd[a['id']], 'stary': st[0], 'typ': 'zgon', 'rok': a['rok'], 'nr': a['nr'], 'miejsce': a['miejsce'], 'epoka': a['epoka'], 'zrodla': a['zrodla'], 'stan': a['stan'],
         'skan': a.get('skan'), 'pola': {f: pole(p) for f, p in a['pola'].items()}, 'unc': o.get('unc') or [], 'robocze': r}
    if o.get('tekst'): x['tekst'] = o['tekst']
    akty.append(x)
assert not brak, 'akty bez jednoznacznego id w bazie zgonów: %d' % brak
POR = {x['id']: n for n, x in enumerate(OD['acts'])}; akty.sort(key=lambda x: POR[x['stary']])   # kolejność jak w bazie zgonów (eksport CSV w tej samej kolejności)
out = {'format': {'nazwa': 'multitool-dane', 'wersja': 1, 'zakres': 'zgony'}, 'opis': 'Zgony 1797–1945 (krok 3 planu): akty z dane_pelne.json + nakładka z bazy zgonów. Zapis zwarty.',
       'zr': tab, 'zatw': [x['id'] for x in akty if x['stary'] in set(OD['zatw'])],
       'slowniki': {'counts': OD['counts'], 'fix': OD['fix'], 'scanFiles': OD['scanFiles'], 'scanBase': OD['scanBase']},
       'konfig': {'fields': OD['fields'], 'ord': OD['ord'], 'cols': OD['cols'], 'fieldsProt': OD['fieldsProt'], 'fieldsRej': OD['fieldsRej']}, 'akty': akty}
p = os.path.join(H, 'dane_zgony.json'); open(p, 'w', encoding='utf-8').write(json.dumps(out, ensure_ascii=False, separators=(',', ':')))
print('dane_zgony.json', os.path.getsize(p) // 1024, 'KB,', len(akty), 'aktów,', len(tab), 'wpisów tabeli źródeł')
