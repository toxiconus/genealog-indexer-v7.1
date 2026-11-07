#!/usr/bin/env python3
"""EKSPERYMENT: budowa GED parafii Blinów WYŁĄCZNIE z indeksów (chrzty, śluby, zgony).
Nie używa żadnego prywatnego GED. Wynik: osoby + rodziny + zdarzenia + źródła (akt/rok/nr).
Użycie: python3 buduj_ged_blinow.py [katalog_wyjsciowy]
Etapy: 1) osoby-dzieci z chrztów, 2) rodziny z rodziców (ojciec+matka+panieńskie, miejscowość, rozstęp lat),
3) śluby -> rodziny (dopasowanie do grup chrztów), 4) łączenie małżonków z własnymi chrztami (imię+nazwisko+rok+rodzice),
5) zgony -> osoby (tylko jednoznacznie), 6) eksport GED i statystyki."""
import csv,re,sys,os,collections,itertools,difflib
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from osoby_dopasowanie import stem_nazwisko,kanon_imie
KONS=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/blin_ged'
os.makedirs(OUT,exist_ok=True)
MALE_A={'barnaba','kuba','jarema','bonawentura','kosma','jakuba','szczepan'}
def sk(n):
    n=(n or '').strip()
    if not n or n in('.','-','[---]'):return ''
    s=stem_nazwisko(n)
    return re.sub(r'(ianka|owna|owa)$','',s)
def like(a,b):
    if a==b:return True
    if not a or not b:return True
    return difflib.SequenceMatcher(None,a,b).ratio()>=0.8
def kim(n):
    n=(n or '').strip().rstrip('?')
    return kanon_imie(n) if n and n not in('.','-','[---]') else ''
def plec(imie):
    i=(imie or '').strip().lower().rstrip('?')
    if not i:return ''
    return 'M' if (not i.endswith('a') or i in MALE_A) else 'F'
def num(x):
    m=re.search(r'\d+',x or '');return int(m.group()) if m else None
def rd(f):
    return list(csv.DictReader(open(os.path.join(KONS,f),encoding='utf-8-sig'),delimiter=';'))

# ---------- osoby ----------
P=[]            # lista osób
def nowa(imie,nazw,pl='',rb=None,miej='',zr=None):
    p=dict(id=len(P),imie=(imie or '').strip(),nazw=(nazw or '').strip(),sex=pl or plec(imie),rb=rb,miej=miej or '',
           fams=None,famc=None,zr=zr or [],dz=None,uwagi=[],scal=None)
    p['fams']=[];P.append(p);return p['id']
def zr(p,typ,txt):P[p]['zr'].append((typ,txt))
FAM=[]
def nowa_rodzina(m=None,z=None,rok_sl=None,data_sl=None,miej='',zrod=None):
    f=dict(id=len(FAM),m=m,z=z,dzieci=[],rok_sl=rok_sl,data_sl=data_sl,miej=miej,zr=zrod or [],klucz=None)
    FAM.append(f)
    if m is not None:P[m]['fams'].append(f['id'])
    if z is not None:P[z]['fams'].append(f['id'])
    return f['id']

# ---------- 1. chrzty ----------
ch=[r for r in rd('blinow_scalone.csv') if r['typ']=='akt' and r['imie'] and r['nazwisko'] and r['rok'].isdigit()]
BIR=[]   # dzieci z chrztów
for r in ch:
    rok=int(r['rok']);pid=nowa(r['imie'],r['nazwisko'],rb=rok,miej=r['miejscowosc'])
    zr(pid,'CH',f"{r['id'] or 'rok '+r['rok']} (rok {r['rok']}, nr {r['nr']})")
    BIR.append(dict(p=pid,r=r,rok=rok,oi=kim(r['ojciec_imie']),on=sk(r['ojciec_nazwisko'] or r['nazwisko']) if plec(r['imie'])!='F' or r['ojciec_nazwisko'] else sk(r['nazwisko']),
                    mi=kim(r['matka_imie']),mn=sk(r['matka_nazwisko']),miej=r['miejscowosc']))
# ---------- 2. rodziny z grup rodziców ----------
bucket=collections.defaultdict(list)
for b in BIR:
    if b['oi'] and b['mi']:bucket[(b['oi'],b['on'][:4],b['mi'])].append(b)
par={}
def find(x):
    while par.setdefault(x,x)!=x:par[x]=par[par[x]];x=par[x]
    return x
def kompat(a,b):
    if not like(a['on'],b['on']):return False
    if not like(a['mn'],b['mn']):return False
    if a['miej'] and b['miej'] and a['miej']!=b['miej'] and not(a['mn'] and b['mn']):return False
    return abs(a['rok']-b['rok'])<=24
for k,lst in bucket.items():
    for a,b in itertools.combinations(lst,2):
        if kompat(a,b):par[find(id(a))]=find(id(b))
grupy=collections.defaultdict(list)
for k,lst in bucket.items():
    for b in lst:grupy[(k,find(id(b)))].append(b)
GR=[]
for (k,_),lst in grupy.items():
    r0=lst[0]['r']
    maid=next((x['mn'] for x in lst if x['mn']),'')
    maid_raw=next((x['r']['matka_nazwisko'] for x in lst if x['mn']),'')
    ojciec_nazw=next((x['r']['ojciec_nazwisko'] for x in lst if x['r']['ojciec_nazwisko']),'') or next((x['r']['nazwisko'] for x in lst if plec(x['r']['imie'])=='M'),lst[0]['r']['nazwisko'])
    miej=next((x['miej'] for x in lst if x['miej']),'')
    fid=nowa(lst[0]['r']['ojciec_imie'],ojciec_nazw,'M',miej=miej)
    mid=nowa(lst[0]['r']['matka_imie'],maid_raw,'F',miej=miej)
    f=nowa_rodzina(fid,mid,miej=miej);FAM[f]['klucz']=k
    for x in lst:
        FAM[f]['dzieci'].append(x['p']);P[x['p']]['famc']=f
    GR.append(dict(f=f,oi=k[0],on=lst[0]['on'],mi=k[2],mn=maid,min=min(x['rok'] for x in lst),max=max(x['rok'] for x in lst),miej=miej,lst=lst))
# dzieci bez pary rodziców: osoby bez rodziny (zostają)
byname=collections.defaultdict(list)
for b in BIR:byname[(kim(b['r']['imie']),sk(b['r']['nazwisko']))].append(b)

# ---------- 3. śluby ----------
MAL=rd('malzenstwa_mal.csv')
stat=collections.Counter()
STUB={}
MARFAM=[]
def rodzina_rodzicow(oi,on,mi,mn,miej,rok_dziecka):
    """znajdź grupę chrztów albo stub rodziców; zwróć id rodziny"""
    if not(oi and mi):return None
    najl=None
    for g in GR:
        if g['oi']==oi and like(g['on'],on) and g['mi']==mi and like(g['mn'],mn) and g['min']<=rok_dziecka+2 and g['min']>=rok_dziecka-30:
            if najl is None or abs(g['min']-rok_dziecka)<abs(najl['min']-rok_dziecka):najl=g
    return najl['f'] if najl else None
def wiek_ur(r,pref):
    rb=num(r.get(pref+'_rok_ur_przyb'));
    if rb:return rb
    w=num(r.get(pref+'_wiek'))
    return int(r['rok'])-w if w else None
for r in MAL:
    if not r['rok'].isdigit() or not r['pan_nazwisko'] or not r['panna_nazwisko']:stat['sl_pominiete']+=1;continue
    rok=int(r['rok']);
    hi,hn=kim(r['pan_imie']),sk(r['pan_nazwisko']);wi,wn=kim(r['panna_imie']),sk(r['panna_nazwisko'])
    # grupa chrztów, w której H i W są rodzicami
    gz=[g for g in GR if g['oi']==hi and like(g['on'],hn) and g['mi']==wi and like(g['mn'],wn) and g['min']>=rok-1 and g['min']<=rok+25]
    gz.sort(key=lambda g:g['min'])
    zrod=[('MAL',f"mał. {r['rok']} nr {r['nr']}")]
    if gz and len(gz)==1 or (gz and gz[0]['min']-rok<=3):
        g=gz[0];f=g['f'];FAM[f]['rok_sl']=rok;FAM[f]['data_sl']=r['data_iso'];FAM[f]['zr']+=zrod;stat['sl_dop_do_chrztow']+=1
        h,w=FAM[f]['m'],FAM[f]['z']
        P[h]['rb']=P[h]['rb'] or wiek_ur(r,'pan');P[w]['rb']=P[w]['rb'] or wiek_ur(r,'panna')
        if r['panna_stan']=='w' or r['pan_stan']=='w':P[w]['uwagi'].append('wdowa w chwili ślubu') if r['panna_stan']=='w' else None
    else:
        h=nowa(r['pan_imie'],r['pan_nazwisko'],'M',rb=wiek_ur(r,'pan'),miej=r['pan_miejscowosc'])
        w=nowa(r['panna_imie'],r['panna_nazwisko'],'F',rb=wiek_ur(r,'panna'),miej=r['panna_miejscowosc'])
        f=nowa_rodzina(h,w,rok_sl=rok,data_sl=r['data_iso'],miej='Blinów',zrod=zrod);stat['sl_nowa_rodzina']+=1
    P[h]['uwagi'].append(f"stan: {r['pan_stan']}") if r['pan_stan'] in('w',) else None
    # rodzice H i W
    for osoba,pref in((h,'pan'),(w,'panna')):
        oi,on=kim(r[pref+'_ojciec_imie']),sk(r[pref+'_ojciec_nazwisko'] or (r['pan_nazwisko'] if pref=='pan' else r['panna_nazwisko']))
        mi,mn=kim(r[pref+'_matka_imie']),sk(r[pref+'_matka_nazwisko'])
        rb=P[osoba]['rb'] or rok-25
        # czy osoba ma już chrzest? szukamy dziecka w grupie rodziców
        kandydaci=[]
        for b in byname.get((kim(P[osoba]['imie']),sk(P[osoba]['nazw'])),[]):
            if abs(b['rok']-rb)<=2 and (not oi or not b['oi'] or oi==b['oi']) and (not mi or not b['mi'] or mi==b['mi']) and P[b['p']]['scal'] is None and b['p']!=osoba:
                kandydaci.append(b)
        if len(kandydaci)==1 and P[osoba]['famc'] is None:
            b=kandydaci[0];stat['malzonek_z_chrztem']+=1;pb=b['p']
            # scal: osoba (małżonek) = osoba dziecka z chrztu
            P[osoba]['scal']=pb;P[pb]['fams']+=P[osoba]['fams'];P[pb]['zr']+=P[osoba]['zr'];P[pb]['uwagi']+=P[osoba]['uwagi']
            for ff in P[osoba]['fams']:
                if FAM[ff]['m']==osoba:FAM[ff]['m']=pb
                if FAM[ff]['z']==osoba:FAM[ff]['z']=pb
            P[osoba]['fams']=[]
            if P[pb]['sex']=='' and P[osoba]['sex']:P[pb]['sex']=P[osoba]['sex']
            osoba=pb
            if osoba==h or True:pass
        elif P[osoba]['famc'] is None and oi and mi:
            fr=rodzina_rodzicow(oi,on,mi,mn,'',rb)
            if fr is not None:
                FAM[fr]['dzieci'].append(osoba);P[osoba]['famc']=fr;stat['rodzice_z_grupy']+=1
            else:
                kl=(oi,on,mi,mn)
                if kl not in STUB:
                    fi=nowa(r[pref+'_ojciec_imie'],r[pref+'_ojciec_nazwisko'] or (r['pan_nazwisko'] if pref=='pan' else r['panna_nazwisko']),'M')
                    mi_=nowa(r[pref+'_matka_imie'],r[pref+'_matka_nazwisko'],'F')
                    STUB[kl]=nowa_rodzina(fi,mi_);FAM[STUB[kl]]['zr'].append(('MAL',f"rodzice z mał. {r['rok']} nr {r['nr']}"))
                fr=STUB[kl];FAM[fr]['dzieci'].append(osoba);P[osoba]['famc']=fr;stat['rodzice_stub']+=1
        # po scaleniu: wynikowy osoba (h/w) mógł się zmienić
        if pref=='pan':h=osoba
        else:w=osoba
    for pp in(h,w):zr(pp,'MAL',f"mał. {r['rok']} nr {r['nr']}")
    MARFAM.append((r,f))


# ---------- 4b. wdowiec: poprzednia żona z aktu ślubu -> ten sam mężczyzna co ojciec dzieci z tą żoną ----------
def scal_osoby(src,dst):
    if src==dst or P[src]['scal'] is not None or P[dst]['scal'] is not None:return False
    P[src]['scal']=dst
    for ff in P[src]['fams']:
        if FAM[ff]['m']==src:FAM[ff]['m']=dst
        if FAM[ff]['z']==src:FAM[ff]['z']=dst
        if ff not in P[dst]['fams']:P[dst]['fams'].append(ff)
    P[src]['fams']=[]
    if P[src]['famc'] is not None:
        if P[dst]['famc'] is None:
            P[dst]['famc']=P[src]['famc'];FAM[P[src]['famc']]['dzieci']=[dst if c==src else c for c in FAM[P[src]['famc']]['dzieci']]
        else:FAM[P[src]['famc']]['dzieci']=[c for c in FAM[P[src]['famc']]['dzieci'] if c!=src]
        P[src]['famc']=None
    for k in('rb','miej'):
        if not P[dst][k]:P[dst][k]=P[src][k]
    P[dst]['zr']+=P[src]['zr'];P[dst]['uwagi']+=P[src]['uwagi'];return True
for r,f in MARFAM:
    pi,pn=kim(r['pan_poprzednia_zona_imie']),sk(r['pan_poprzednia_zona_nazwisko'])
    if not pi:continue
    H=FAM[f]['m'];hi,hn=kim(r['pan_imie']),sk(r['pan_nazwisko'])
    cand=[g for g in GR if g['oi']==hi and like(g['on'],hn) and g['mi']==pi and like(g['mn'],pn) and g['max']<=int(r['rok'])+1 and g['f']!=f]
    if len(cand)==1:
        Fp=FAM[cand[0]['f']]['m']
        if scal_osoby(H,Fp):stat['wdowiec_zlaczony']+=1
        # poprzednia żona: ślub rodziny z dziećmi -> data zgonu z aktu ślubu
        W0=FAM[cand[0]['f']]['z'];d=r['pan_poprzednia_zona_data_iso']
        if d and P[W0]['dz'] is None:P[W0]['dz']=dict(rok=int(d[:4]),data=d,wiek='',miej='');P[W0]['zr'].append(('MAL',f"zgon wg aktu ślubu męża {r['rok']} nr {r['nr']}"))
    elif len(cand)>1:stat['wdowiec_niejednoznaczny']+=1

# ---------- 5. zgony ----------
ZG=rd('zgony.csv')
akt=[p for p in P if p['scal'] is None]
byn=collections.defaultdict(list)
kids=collections.defaultdict(list)
for f in FAM:
    for c in f['dzieci']:
        if P[c]['rb']:
            for par in(f['m'],f['z']):
                if par is not None:kids[par].append(P[c]['rb'])
for p in akt:
    byn[(kim(p['imie']),sk(p['nazw']))].append(p)
    # kobiety z rodzin: także pod nazwiskiem męża (zgon bywa zapisany po mężu)
    for fid in p['fams']:
        f=FAM[fid]
        if f['z']==p['id'] and f['m'] is not None:byn[(kim(p['imie']),sk(P[f['m']]['nazw']))].append(p)
def rb_zg(z):
    m=re.search(r'\d{4}',z.get('rok_ur_wyliczony') or '');return int(m.group()) if m else None
rodzic_imie=lambda p,r:(kim(P[FAM[p['famc']]['m']]['imie']) if r=='o' else kim(P[FAM[p['famc']]['z']]['imie'])) if p['famc'] is not None else ''
def rodzice_stub(pid,z):
    """z zgonu znamy imiona rodziców -> rodzina rodziców (stub), jeśli osoba nie ma jeszcze rodziców"""
    p=P[pid]
    if p['famc'] is not None or not(z['ojciec_imie'] and z['matka_imie']):return
    kl=(kim(z['ojciec_imie']),sk(p['nazw']),kim(z['matka_imie']),sk(z['matka_nazwisko']))
    if kl not in STUB:
        fi=nowa(z['ojciec_imie'],p['nazw'],'M');mi_=nowa(z['matka_imie'],z['matka_nazwisko'],'F')
        STUB[kl]=nowa_rodzina(fi,mi_);FAM[STUB[kl]]['zr'].append(('ZG',f"rodzice z zgonu {z['rok']} {z['id_archiwalne']}"))
    FAM[STUB[kl]]['dzieci'].append(pid);p['famc']=STUB[kl];stat['rodzice_z_zgonu']+=1
for z in ZG:
    if not z['rok'].isdigit() or not z['imie'] or not z['nazwisko']:stat['zg_pominiete']+=1;continue
    rok=int(z['rok']);k=(kim(z['imie']),sk(z['nazwisko']));rb=rb_zg(z)
    kand=[];seen=set()
    for p in byn.get(k,[]):
        if p['id'] in seen or p['dz'] is not None:continue
        seen.add(p['id'])
        ky=kids.get(p['id'])
        if p['rb'] and rok<p['rb']:continue
        if rb and p['rb'] and abs(rb-p['rb'])>2:continue
        if not rb and p['rb'] and rok-p['rb']>95:continue
        if ky:
            if rok<max(ky)-1:continue
            if rb and not p['rb'] and not(14<=min(ky)-rb<=50):continue
        if z['ojciec_imie'] and p['famc'] is not None and kim(z['ojciec_imie'])!=rodzic_imie(p,'o'):continue
        if z['matka_imie'] and p['famc'] is not None and kim(z['matka_imie'])!=rodzic_imie(p,'m'):continue
        if z['miejscowosc'] and p['miej'] and z['miejscowosc']!=p['miej'] and not rb:continue
        kand.append(p)
    if rb:pewne=[p for p in kand if p['rb'] or kids.get(p['id'])]
    else:pewne=[p for p in kand if p['famc'] is not None and z['miejscowosc'] and p['miej']==z['miejscowosc']]
    if len(pewne)>1:
        # preferuj osobę z zgodnym rokiem ur.; potem z rodzicami z aktu
        c2=[p for p in pewne if p['rb'] and rb and p['rb']==rb] or pewne
        if len(c2)==1:pewne=c2
    if len(pewne)==1:
        p=pewne[0];p['dz']=dict(rok=rok,data=z['data_surowa'],wiek=z['wiek'],miej=z['miejscowosc']);zr(p['id'],'ZG',f"zgon {z['rok']} nr {z['nr_wpisu'] or z['id_archiwalne']}");stat['zg_dopasowany']+=1
        if not p['rb'] and rb:p['rb']=rb;p['uwagi'].append(f"rok ur. ok. {rb} wyliczony z wieku w zgonie {z['rok']}")
        rodzice_stub(p['id'],z)
    else:
        pid=nowa(z['imie'],z['nazwisko'],z['plec'] or plec(z['imie']),rb=rb,miej=z['miejscowosc'])
        P[pid]['dz']=dict(rok=rok,data=z['data_surowa'],wiek=z['wiek'],miej=z['miejscowosc']);zr(pid,'ZG',f"zgon {z['rok']} nr {z['nr_wpisu'] or z['id_archiwalne']}")
        rodzice_stub(pid,z)
        P[pid]['uwagi'].append('zgon bez dopasowania do chrztu/ślubu' if not kand else f'zgon niejednoznaczny ({len(kand)} kandydatów)');stat['zg_samodzielny' if not kand else 'zg_niejedn']+=1

# ---------- 6. eksport GED ----------
akt=[p for p in P if p['scal'] is None]
def gd(x):return (x or '').replace('\n',' ')
def nm(p):
    return f"{gd(p['imie'])} /{gd(p['nazw'])}/"
with open(os.path.join(OUT,'blinow_z_indeksow.ged'),'w',encoding='utf-8') as g:
    g.write('0 HEAD\n1 SOUR BLINOW_INDEKSY\n2 NAME Eksperyment GED z indeksow parafii Blinow\n1 GEDC\n2 VERS 5.5.1\n2 FORM LINEAGE-LINKED\n1 CHAR UTF-8\n')
    for s,t in(('CH','Chrzty Blinów (indeks)'),('MAL','Małżeństwa Blinów 1841-1894 (indeks)'),('ZG','Zgony Blinów (indeks)')):
        g.write(f'0 @S{s}@ SOUR\n1 TITL {t}\n')
    for p in akt:
        g.write(f"0 @I{p['id']}@ INDI\n1 NAME {nm(p)}\n")
        if p['sex']:g.write(f"1 SEX {p['sex']}\n")
        if p['rb']:
            g.write(f"1 BIRT\n2 DATE {'ABT ' if not any(t=='CH' for t,_ in p['zr']) else ''}{p['rb']}\n")
            if p['miej']:g.write(f"2 PLAC {gd(p['miej'])}\n")
            for t,txt in p['zr']:
                if t=='CH':g.write(f"2 SOUR @SCH@\n3 PAGE {gd(txt)}\n")
        if p['dz']:
            d=p['dz'];g.write(f"1 DEAT\n2 DATE {d['rok']}\n")
            if d['miej']:g.write(f"2 PLAC {gd(d['miej'])}\n")
            if d['wiek']:g.write(f"2 AGE {d['wiek']}y\n")
            for t,txt in p['zr']:
                if t=='ZG':g.write(f"2 SOUR @SZG@\n3 PAGE {gd(txt)}\n")
        if p['famc'] is not None:g.write(f"1 FAMC @F{p['famc']}@\n")
        for f in p['fams']:g.write(f"1 FAMS @F{f}@\n")
        for u in p['uwagi']:g.write(f"1 NOTE {gd(u)}\n")
    for f in FAM:
        if f['m'] is None and f['z'] is None:continue
        g.write(f"0 @F{f['id']}@ FAM\n")
        if f['m'] is not None:g.write(f"1 HUSB @I{f['m']}@\n")
        if f['z'] is not None:g.write(f"1 WIFE @I{f['z']}@\n")
        for c in f['dzieci']:g.write(f"1 CHIL @I{c}@\n")
        if f['rok_sl']:
            g.write(f"1 MARR\n2 DATE {f['data_sl'] or f['rok_sl']}\n2 PLAC Blinów\n")
            for t,txt in f['zr']:
                if t=='MAL' and txt.startswith('mał.'):g.write(f"2 SOUR @SMAL@\n3 PAGE {gd(txt)}\n")
    g.write('0 TRLR\n')
# stats
rod=[f for f in FAM if f['m'] is not None]
S=dict(osoby=len(akt),rodziny=len(rod),rodziny_z_dziecmi=sum(1 for f in rod if f['dzieci']),rodziny_ze_slubem=sum(1 for f in rod if f['rok_sl']),
       osoby_z_zgonem=sum(1 for p in akt if p['dz']),osoby_z_rodzicami=sum(1 for p in akt if p['famc'] is not None),
       chrzty_wejscie=len(ch),sluby_wejscie=len(MAL),zgony_wejscie=len(ZG))
S.update(stat)
import json;json.dump(S,open(os.path.join(OUT,'statystyki.json'),'w'),ensure_ascii=False,indent=1)
# zapis tabeli osób do porównań
with open(os.path.join(OUT,'osoby.csv'),'w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f,delimiter=';');w.writerow(['id','imie','nazwisko','sex','rok_ur','rok_zg','miejsce','ojciec_imie','matka_imie','zrodla'])
    for p in akt:
        w.writerow([p['id'],p['imie'],p['nazw'],p['sex'],p['rb'] or '',(p['dz'] or {}).get('rok',''),p['miej'],
                    P[FAM[p['famc']]['m']]['imie'] if p['famc'] is not None else '',P[FAM[p['famc']]['z']]['imie'] if p['famc'] is not None else '',
                    ' | '.join(f'{t}:{x}' for t,x in p['zr'])])
print(json.dumps(S,ensure_ascii=False,indent=1))
