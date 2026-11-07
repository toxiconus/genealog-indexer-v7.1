#!/usr/bin/env python3
"""Scala PRYWATNY GED użytkownika z GED zbudowanym z indeksów parafii (buduj_ged_blinow.py).
Baza = GED z indeksów. Osoby i rodziny użytkownika są DOPASOWYWANE (rodzina po parze+roku ślubu, dzieci, potem osoby po imię+nazwisko+rok+rodzice),
dopisywane jako nowe, jeśli brak dopasowania; sprzeczności są logowane do CSV (nie są cicho nadpisywane).
Użycie: python3 scal_ged_z_indeksami.py <ged_z_indeksow> <ged_uzytkownika> <katalog_wyjsciowy>
Wyniki zawierają dane prywatne – NIE commitować do repo (repo jest publiczne)."""
import re,sys,os,csv,collections,difflib
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from osoby_dopasowanie import kanon_imie,stem_nazwisko
A,B,OUT=sys.argv[1],sys.argv[2],sys.argv[3];os.makedirs(OUT,exist_ok=True)
def sk(n):return re.sub(r'(ianka|owna|owa)$','',stem_nazwisko(n or ''))
def like(a,b):
    if a==b:return True
    if not a or not b:return False
    return difflib.SequenceMatcher(None,a,b).ratio()>=0.8
def kim(n):
    n=(n or '').strip().split()
    return kanon_imie(n[0].rstrip('?')) if n else ''
def yr(s):
    m=re.search(r'\b(1[4-9]\d\d)\b',s or '');return int(m.group(1)) if m else None
def parse(path):
    R=[];cur=None
    for l in open(path,encoding='utf-8-sig',errors='ignore'):
        l=l.rstrip('\r\n')
        m=re.match(r'0 (@[^@]+@) (\w+)',l)
        if m:cur=dict(x=m.group(1),tag=m.group(2),blocks=[],head=l);R.append(cur);continue
        if l.startswith('0 '):cur=dict(x=None,tag=l.split()[1],blocks=[],head=l);R.append(cur);continue
        if cur is None:continue
        if l.startswith('1 '):cur['blocks'].append([l])
        elif cur['blocks']:cur['blocks'][-1].append(l)
    return R
def info(r):
    d=dict(name='',sex='',birt=None,deat=None,birp='',famc=[],fams=[],husb=None,wife=None,chil=[],marr=None)
    for b in r['blocks']:
        t=b[0].split()[1];v=b[0][len(t)+3:].strip() if len(b[0])>len(t)+3 else ''
        sub=' '.join(b[1:])
        if t=='NAME' and not d['name']:d['name']=v
        elif t=='SEX':d['sex']=v
        elif t=='BIRT':d['birt']=d['birt'] or yr(sub);m=re.search(r'2 PLAC (.*)',' '.join(x for x in b if x.startswith('2 PLAC')));d['birp']=m.group(1) if m else d['birp']
        elif t in('DEAT','BURI'):d['deat']=d['deat'] or yr(sub)
        elif t=='FAMC':d['famc'].append(v)
        elif t=='FAMS':d['fams'].append(v)
        elif t=='HUSB':d['husb']=v
        elif t=='WIFE':d['wife']=v
        elif t=='CHIL':d['chil'].append(v)
        elif t=='MARR':d['marr']=yr(sub)
    m=re.match(r'(.*?)\s*/(.*?)/',d['name']);d['g'],d['s']=(m.group(1),m.group(2)) if m else (d['name'],'')
    d['kg'],d['ks']=kim(d['g']),sk(d['s']);return d
RA,RB=parse(A),parse(B)
IA={r['x']:info(r) for r in RA if r['tag']=='INDI'};FA={r['x']:info(r) for r in RA if r['tag']=='FAM'}
IB={r['x']:info(r) for r in RB if r['tag']=='INDI'};FB={r['x']:info(r) for r in RB if r['tag']=='FAM'}
byname=collections.defaultdict(list)
for k,p in IA.items():byname[(p['kg'],p['ks'][:4])].append(k)
PM={};FM={}   # B -> A
LOG=[]
def log(kind,b,a,txt):LOG.append((kind,b,a,txt))
def ok_year(y1,y2,tol=1):return y1 is None or y2 is None or abs(y1-y2)<=tol
def parent_g(F,I,p,role):
    if not p['famc']:return ''
    f=F.get(p['famc'][0]);x=I.get(f[role]) if f and f[role] else None
    return x['kg'] if x else ''
def compat_par(pb,pa):
    for role in('husb','wife'):
        gb,ga=parent_g(FB,IB,pb,role),parent_g(FA,IA,pa,role)
        if gb and ga and gb!=ga:return False
    return True
# --- 1. rodziny po parze + rok ślubu
fa_idx=collections.defaultdict(list)
for k,f in FA.items():
    h,w=IA.get(f['husb']),IA.get(f['wife'])
    if h and w:fa_idx[(h['kg'],h['ks'][:4],w['kg'])].append(k)
for k,f in FB.items():
    h,w=IB.get(f['husb']),IB.get(f['wife'])
    if not(h and w):continue
    c=[a for a in fa_idx.get((h['kg'],h['ks'][:4],w['kg']),[]) if ok_year(FA[a]['marr'],f['marr'],1) and like(IA[FA[a]['husb']]['ks'],h['ks'])]
    if f['marr']:c=[a for a in c if FA[a]['marr'] or True]
    # gdy mamy wiele: wybierz tę o zgodnym roku ślubu, a jeśli brak - tę z dziećmi
    if len(c)>1:
        c2=[a for a in c if FA[a]['marr'] and f['marr'] and FA[a]['marr']==f['marr']];c=c2 or c
    if len(c)==1 and c[0] not in FM.values():
        FM[k]=c[0];PM[f['husb']]=FA[c[0]]['husb'];PM[f['wife']]=FA[c[0]]['wife']
    elif len(c)>1:log('niejednoznaczna_rodzina',k,','.join(c),f"{h['name']} + {w['name']} ({f['marr']}): {len(c)} kandydatów w indeksach")
# --- 2. dzieci dopasowanych rodzin, 3. osoby po imieniu/roku/rodzicach, 4. propagacja do rodzin (kilka obiegów)
def match_child(cb,fa_id):
    pb=IB[cb];c=[a for a in FA[fa_id]['chil'] if IA[a]['kg']==pb['kg'] and ok_year(IA[a]['birt'],pb['birt'],1) and a not in PM.values()]
    if len(c)>1:c=[a for a in c if IA[a]['birt']==pb['birt']] or c
    return c[0] if len(c)==1 else None
for _ in range(4):
    for kb,ka in list(FM.items()):
        for cb in FB[kb]['chil']:
            if cb in PM:continue
            a=match_child(cb,ka)
            if a:PM[cb]=a
    for kb,pb in IB.items():
        if kb in PM:continue
        c=[a for a in byname.get((pb['kg'],pb['ks'][:4]),[]) if like(IA[a]['ks'],pb['ks']) and a not in PM.values() and ok_year(IA[a]['birt'],pb['birt'],1) and (pb['birt'] or IA[a]['birt'] is None or True)]
        if pb['birt']:c=[a for a in c if IA[a]['birt'] or False]  # tylko z rokiem po obu stronach
        c=[a for a in c if compat_par(pb,IA[a])]
        if len(c)>1:
            c2=[a for a in c if IA[a]['birt']==pb['birt']];c=c2 or c
        if len(c)==1 and pb['birt']:PM[kb]=c[0]
        elif len(c)>1:log('niejednoznaczna_osoba',kb,','.join(c),f"{pb['name']} ur. {pb['birt']}: {len(c)} kandydatów")
    # propagacja: rodziny dzieci/małżonków
    for kb,ka in list(PM.items()):
        pb,pa=IB[kb],IA[ka]
        for fb in pb['fams']:
            if fb in FM:continue
            fam=FB[fb]
            for fa in pa['fams']:
                if fa in FM.values():continue
                oth_b=fam['wife'] if fam['husb']==kb else fam['husb'];oth_a=FA[fa]['wife'] if FA[fa]['husb']==ka else FA[fa]['husb']
                if oth_b and oth_a and IB[oth_b]['kg']==IA[oth_a]['kg'] and like(IB[oth_b]['ks'],IA[oth_a]['ks']) and ok_year(fam['marr'],FA[fa]['marr'],1):
                    FM[fb]=fa;PM.setdefault(oth_b,oth_a)
        if pb['famc'] and pa['famc'] and pb['famc'][0] not in FM and pa['famc'][0] not in FM.values():
            fb,fa=FB[pb['famc'][0]],FA[pa['famc'][0]]
            hb,ha,wb,wa=IB.get(fb['husb']),IA.get(fa['husb']),IB.get(fb['wife']),IA.get(fa['wife'])
            if (not hb or not ha or hb['kg']==ha['kg']) and (not wb or not wa or wb['kg']==wa['kg']):
                FM[pb['famc'][0]]=pa['famc'][0]
                if hb and ha:PM.setdefault(fb['husb'],fa['husb'])
                if wb and wa:PM.setdefault(fb['wife'],fa['wife'])
def rodz(F,I,f):
    x=F.get(f)
    if not x:return '?'
    n=lambda k:(I[x[k]]['name'].replace('/','') if x[k] in I else '?')
    return f"{n('husb')} + {n('wife')}"
# --- duplikaty w indeksach: ta sama para rodziców zapisana jako 2 rodziny (potwierdzone przez drzewo) -> scal rodziny i rodziców
FUS={};PUS={}
def _find(m,x):
    while x in m:x=m[x]
    return x
if os.environ.get('DEDUP','1')=='1':
    for b,a in PM.items():
        pb,pa=IB[b],IA[a]
        if pb['famc'] and pa['famc'] and pb['famc'][0] in FM:
            X,Y=FM[pb['famc'][0]],pa['famc'][0]
            if X!=Y and Y in FA and X in FA:
                hx,hy,wx,wy=IA.get(FA[X]['husb']),IA.get(FA[Y]['husb']),IA.get(FA[X]['wife']),IA.get(FA[Y]['wife'])
                if hx and hy and wx and wy and hx['kg']==hy['kg'] and wx['kg']==wy['kg'] and like(hx['ks'],hy['ks']) and ok_year(FA[X]['marr'],FA[Y]['marr'],2):
                    FUS[Y]=X;PUS[FA[Y]['husb']]=FA[X]['husb'];PUS[FA[Y]['wife']]=FA[X]['wife']
    FUS={k:_find(FUS,v) for k,v in FUS.items() if _find(FUS,v)!=k};PUS={k:_find(PUS,v) for k,v in PUS.items() if _find(PUS,v)!=k}
    if FUS:
        def mp(line):
            def f(m):
                x=m.group(0);return PUS.get(x) or FUS.get(x) or x
            return re.sub(r'@[^@\s]+@',f,line)
        recs={r['x']:r for r in RA if r['x']}
        outl=[];seen=set()
        for r in RA:
            x=r['x']
            if x in PUS or x in FUS:continue
            rr=dict(r,blocks=[list(b) for b in r['blocks']])
            srcs=[k for k,v in list(PUS.items())+list(FUS.items()) if v==x]
            have={b[0].split()[1] for b in rr['blocks']}
            for k in srcs:
                for b in recs[k]['blocks']:
                    t=b[0].split()[1]
                    if t in('NAME','SEX','HUSB','WIFE'):continue
                    if t in have and t in('BIRT','DEAT','MARR'):continue
                    rr['blocks'].append(list(b))
            nb=[];vis=set()
            for b in rr['blocks']:
                b=[mp(l) for l in b]
                if b[0].split()[1] in('FAMC','FAMS','CHIL','HUSB','WIFE') and b[0] in vis:continue
                vis.add(b[0]);nb.append(b)
            rr['blocks']=nb;rr['head']=r['head'];outl.append(rr)
        dp=os.path.join(OUT,'indeksy_po_scaleniu_duplikatow.ged')
        with open(dp,'w',encoding='utf-8') as g:
            g.write('0 HEAD\n1 GEDC\n2 VERS 5.5.1\n2 FORM LINEAGE-LINKED\n1 CHAR UTF-8\n')
            for r in outl:
                if r['tag'] in('HEAD','TRLR'):continue
                g.write(f"0 {r['x']} {r['tag']}\n" if r['x'] else r['head']+'\n')
                for b in r['blocks']:
                    for l in b:g.write(l+'\n')
            g.write('0 TRLR\n')
        print('scalono duplikaty w indeksach: rodzin',len(FUS),'osób',len(PUS),'-> ponowny przebieg')
        os.environ['DEDUP']='0'
        os.execv(sys.executable,[sys.executable,os.path.abspath(__file__),dp,B,OUT])
# --- konflikty na dopasowanych
revP=collections.defaultdict(list)
for b,a in PM.items():revP[a].append(b)
for a,bs in revP.items():
    if len(bs)>1:log('duplikat_w_drzewie',','.join(bs),a,'; '.join(f"{IB[b]['name']} ur. {IB[b]['birt']}" for b in bs)+' = jedna osoba w indeksach')
for b,a in PM.items():
    pb,pa=IB[b],IA[a]
    if pb['sex'] and pa['sex'] and pb['sex']!=pa['sex']:log('plec_inna',b,a,f"{pb['name']}: drzewo {pb['sex']} / indeks {pa['sex']}")
    if pb['birt'] and pa['birt'] and pb['birt']!=pa['birt']:log('rok_ur_inny',b,a,f"{pb['name']}: drzewo {pb['birt']} / indeks {pa['birt']}")
    if pb['deat'] and pa['deat'] and pb['deat']!=pa['deat']:log('rok_zg_inny',b,a,f"{pb['name']}: drzewo {pb['deat']} / indeks {pa['deat']}")
    if pb['famc'] and pa['famc'] and pb['famc'][0] in FM and FM[pb['famc'][0]]!=pa['famc'][0]:log('inni_rodzice',b,a,f"{pb['name']} ur. {pb['birt']}: drzewo = {rodz(FB,IB,pb['famc'][0])} / indeks = {rodz(FA,IA,pa['famc'][0])}")
for b,a in FM.items():
    if FB[b]['marr'] and FA[a]['marr'] and FB[b]['marr']!=FA[a]['marr']:log('rok_slubu_inny',b,a,f"małżeństwo: drzewo {FB[b]['marr']} / indeks {FA[a]['marr']}")
# --- sprawdzenia logiczne nowych osób z drzewa
sur=set(p['ks'] for p in IA.values())
for b,p in IB.items():
    if b in PM:continue
    if p['birt'] and 1783<=p['birt']<=1908 and p['ks'] in sur:log('brak_w_indeksach',b,'',f"{p['name']} ur. {p['birt']} {p['birp']}: nazwisko z parafii, brak aktu w indeksach (inna parafia / błąd roku / brak w indeksie)")
# --- scalanie: remap id
def ref(x,mp):return mp.get(x)
IDMAP={};
for b in IB:IDMAP[b]=PM[b] if b in PM else '@GI'+b[2:]
for b in FB:IDMAP[b]=FM[b] if b in FM else '@GF'+b[2:]
def remap(line):
    def f(m):
        x=m.group(0)
        if x in IDMAP:return IDMAP[x]
        return '@G'+x[1:-1]+'@' if x[1:2]!='G' else x
    return re.sub(r'@[^@\s]+@',f,line)
SKIP={'NAME','SEX','FAMC','FAMS','HUSB','WIFE','CHIL','_UID','RIN','CHAN','_FSFTID'}
OUTR=[]
byx_B={r['x']:r for r in RB if r['x']}
dopiski=collections.Counter()
for r in RA:
    if r['tag'] in('HEAD','TRLR'):continue
    rr=dict(r,blocks=[list(b) for b in r['blocks']])
    if r['tag']=='INDI' and r['x'] in revP:
        a=r['x'];have={b[0].split()[1] for b in rr['blocks']}
        for bk in revP[a]:
            src=byx_B[bk];pb=IB[bk];pa=IA[a]
            for b in src['blocks']:
                t=b[0].split()[1]
                if t in SKIP:continue
                if t in('BIRT','DEAT','BURI','CHR','MARR') :
                    if t not in have:rr['blocks'].append([remap(x) for x in b]);dopiski['zdarzenie_z_drzewa']+=1
                    else:
                        rr['blocks'].append([f"1 NOTE Wg drzewa: {t} "+' '.join(x[2:] for x in b[1:] if x.startswith(('2 DATE','2 PLAC')))])
                    continue
                rr['blocks'].append([remap(x) for x in b]);dopiski['blok_z_drzewa']+=1
            for t,key in(('FAMC','famc'),('FAMS','fams')):
                for v in pb[key]:
                    m=IDMAP[v]
                    if v not in FM and not any(x[0]==f'1 {t} {m}' for x in rr['blocks']):
                        if t=='FAMC' and pa['famc']:rr['blocks'].append([f"1 NOTE Rodzice wg drzewa: {m}"]);continue
                        rr['blocks'].append([f'1 {t} {m}']);dopiski['link_rodziny']+=1
            if not pa['sex'] and pb['sex']:rr['blocks'].append([f"1 SEX {pb['sex']}"])
    if r['tag']=='FAM' and r['x'] in {v for v in FM.values()}:
        for bk,av in FM.items():
            if av!=r['x']:continue
            src=byx_B[bk];fb=FB[bk];fa=FA[av];have={b[0].split()[1] for b in rr['blocks']}
            for b in src['blocks']:
                t=b[0].split()[1]
                if t in('HUSB','WIFE','_UID','RIN','CHAN','_FSFTID'):continue
                if t=='CHIL':
                    c=IDMAP[b[0].split()[2]];
                    if not any(x[0]==f'1 CHIL {c}' for x in rr['blocks']):rr['blocks'].append([f'1 CHIL {c}']);dopiski['dziecko_z_drzewa']+=1
                    continue
                if t=='MARR' and 'MARR' in have:
                    continue
                rr['blocks'].append([remap(x) for x in b]);dopiski['blok_rodziny']+=1
    OUTR.append(rr)
# nowe osoby i rodziny z drzewa
for r in RB:
    if r['tag']=='INDI' and r['x'] not in PM:
        OUTR.append(dict(r,x=IDMAP[r['x']],blocks=[[remap(x) for x in b] for b in r['blocks']] ));dopiski['nowa_osoba']+=1
    elif r['tag']=='FAM' and r['x'] not in FM:
        OUTR.append(dict(r,x=IDMAP[r['x']],blocks=[[remap(x) for x in b] for b in r['blocks']]));dopiski['nowa_rodzina']+=1
    elif r['tag'] in('SOUR','REPO','NOTE','OBJE'):
        OUTR.append(dict(r,x='@G'+r['x'][1:-1]+'@',blocks=[[remap(x) for x in b] for b in r['blocks']]))
with open(os.path.join(OUT,'drzewo_scalone_z_indeksami.ged'),'w',encoding='utf-8') as g:
    g.write('0 HEAD\n1 SOUR SCAL_INDEKSY_I_DRZEWO\n1 GEDC\n2 VERS 5.5.1\n2 FORM LINEAGE-LINKED\n1 CHAR UTF-8\n')
    for r in OUTR:
        g.write(f"0 {r['x']} {r['tag']}\n" if r['x'] else r['head']+'\n')
        for b in r['blocks']:
            for l in b:g.write(l+'\n')
    g.write('0 TRLR\n')
with open(os.path.join(OUT,'analiza_sprzecznosci.csv'),'w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f,delimiter=';');w.writerow(['rodzaj','id_drzewo','id_indeks','opis']);w.writerows(LOG)
st=collections.Counter(k for k,_,_,_ in LOG)
print('osoby drzewa:',len(IB),'dopasowane:',len(PM),'| rodziny drzewa:',len(FB),'dopasowane:',len(FM))
print('dopisano:',dict(dopiski));print('analiza:',dict(st))
