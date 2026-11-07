import re,csv,sys,collections
sys.path.insert(0,'/home/claude/genealog-indexer-v7.1/public/konsolidacja/skrypty')
from osoby_dopasowanie import kanon_imie,stem_nazwisko
def sk(n):
    s=stem_nazwisko(n or '');return re.sub(r'(ianka|owna|owa)$','',s)
def kim(n):return kanon_imie((n or '').strip().rstrip('?'))
def parse(path):
    I={};F={};cur=None;ev=None
    for l in open(path,encoding='utf-8',errors='ignore'):
        l=l.rstrip('\n');m=re.match(r'(\d+) (@\w+@ )?(\w+)(?: (.*))?',l)
        if not m:continue
        lv,idr,tag,val=int(m.group(1)),m.group(2),m.group(3),m.group(4) or ''
        if lv==0:
            ev=None
            if idr and tag=='INDI':cur=I.setdefault(idr.strip(),dict(name='',birt=None,deat=None,sex='',famc=[],fams=[]));typ='I'
            elif idr and tag=='FAM':cur=F.setdefault(idr.strip(),dict(h=None,w=None,ch=[],marr=None));typ='F'
            else:cur=None
            continue
        if cur is None:continue
        if typ=='I':
            if lv==1:
                ev=tag
                if tag=='NAME':cur['name']=val
                elif tag=='SEX':cur['sex']=val
                elif tag=='FAMC':cur['famc'].append(val)
                elif tag=='FAMS':cur['fams'].append(val)
            elif lv==2 and tag=='DATE':
                y=re.search(r'\b(1[5-9]\d\d)\b',val)
                if y and ev=='BIRT' and not cur['birt']:cur['birt']=int(y.group(1))
                if y and ev in('DEAT','BURI') and not cur['deat']:cur['deat']=int(y.group(1))
        else:
            if lv==1:
                ev=tag
                if tag=='HUSB':cur['h']=val
                elif tag=='WIFE':cur['w']=val
                elif tag=='CHIL':cur['ch'].append(val)
            elif lv==2 and tag=='DATE' and ev=='MARR':
                y=re.search(r'\b(1[5-9]\d\d)\b',val);cur['marr']=int(y.group(1)) if y else None
    return I,F
def nm(p):
    m=re.match(r'(.*?)\s*/(.*?)/',p['name']);return (m.group(1),m.group(2)) if m else (p['name'],'')
mine,mf=parse(sys.argv[1]); ours,of=parse(sys.argv[2])
idx=collections.defaultdict(list)
for k,p in ours.items():
    g,s=nm(p);idx[(kim(g.split()[0] if g.split() else ''),sk(s))].append((k,p))
sur=set(sk(nm(p)[1]) for p in mine.values())
# A: osoby parafii z rokiem ur -> w naszym
tot=hit=0;noh=[];dub=0
for k,p in mine.items():
    if not p['birt']:continue
    g,s=nm(p)
    if p['birt']<1783:continue
    tot+=1
    c=[o for o in idx.get((kim(g.split()[0]),sk(s)),[]) if o[1]['birt'] and abs(o[1]['birt']-p['birt'])<=1]
    if c:hit+=1
    else:noh.append((g,s,p['birt']))
print('A) osoby parafii z rokiem ur >=1783:',tot,'znalezione w naszym GED (imie+nazw+rok±1):',hit,f'({100*hit//tot}%)')
# B: nasze osoby w latach 1783-1908 o nazwiskach z parafii
mi=set((kim(nm(p)[0].split()[0] if nm(p)[0].split() else ''),sk(nm(p)[1]),p['birt']) for p in mine.values() if p['birt'])
ot=oh=0;miss=[]
for k,p in ours.items():
    if not p['birt'] or not 1783<=p['birt']<=1908:continue
    g,s=nm(p)
    if sk(s) not in sur:continue
    ot+=1
    if any((kim(g.split()[0]) if g.split() else '',sk(s),y) in mi for y in (p['birt']-1,p['birt'],p['birt']+1)):oh+=1
    else:miss.append((g,s,p['birt']))
print('B) nasze osoby 1783-1908 o nazwiskach parafii:',ot,'ma odpowiednik w indeksach:',oh,f'({100*oh//ot}%)')
print('   przykłady naszych osób BEZ odpowiednika w indeksach:',miss[:15])
print('   przykłady osób z indeksów BEZ odpowiednika w naszym GED:',[x for x in noh if x[1] in('Pudło','Kopiwoda','Bucon')][:15])
# C: małżeństwa 1841-1894
def fkey(F,I,f):
    h=I.get(f['h']);w=I.get(f['w'])
    if not h or not w:return None
    gh,sh=nm(h);gw,sw=nm(w)
    return (kim(gh.split()[0] if gh.split() else ''),sk(sh),kim(gw.split()[0] if gw.split() else ''),sk(sw))
mm=collections.defaultdict(list)
for f in mf.values():
    k=fkey(mf,mine,f)
    if k and f['marr']:mm[k].append(f['marr'])
oc=0;ohit=0;onohit=[]
for f in of.values():
    k=fkey(of,ours,f)
    if not k or not f['marr'] or not 1841<=f['marr']<=1894:continue
    oc+=1
    if any(abs(y-f['marr'])<=1 for y in mm.get(k,[])):ohit+=1
    elif k[1] in sur or k[3] in sur:onohit.append((k,f['marr']))
print('C) nasze małżeństwa 1841-1894:',oc,'zgodne z indeksem (imiona+nazwiska+rok±1):',ohit,'; niezgodne z nazwiskiem z parafii:',len(onohit))
print('   przykłady:',onohit[:10])
mset=set(mm.keys());ours_set=set(fkey(of,ours,f) for f in of.values() if f['marr'])
print('   małżeństwa z indeksów których nie ma w naszym GED:',len([k for k in mset if k not in ours_set]),'z',len(mset))
print('\n--- poprawione porównania ---')
oursur=collections.Counter(sk(nm(p)[1]) for p in ours.values())
# A2: osoby parafii (>=1783) których nazwisko jest w naszym GED (>=20 osób)
big={s for s,c in oursur.items() if c>=20}
tot=hit=0;perS=collections.defaultdict(lambda:[0,0])
for k,p in mine.items():
    if not p['birt'] or p['birt']<1783:continue
    g,s=nm(p);ss=sk(s)
    if ss not in big:continue
    tot+=1;perS[ss][0]+=1
    c=[o for o in idx.get((kim(g.split()[0]),ss),[]) if o[1]['birt'] and abs(o[1]['birt']-p['birt'])<=1]
    if c:hit+=1;perS[ss][1]+=1
print(f'A2) osoby parafii o nazwiskach obecnych w naszym GED (>=20 os.): {tot}, znalezione: {hit} ({100*hit//tot}%)')
top=sorted(perS.items(),key=lambda x:-x[1][0])[:12]
print('   najliczniejsze nazwiska (indeks / w naszym):',[(s,a,b) for s,(a,b) in top])
# C2: małżeństwa po mężu: imię+nazwisko męża + imię żony + rok
def mk(F,I,f):
    h=I.get(f['h']);w=I.get(f['w'])
    if not h or not w:return None
    gh,sh=nm(h);gw,sw=nm(w)
    return (kim(gh.split()[0] if gh.split() else ''),sk(sh),kim(gw.split()[0] if gw.split() else ''))
mm2=collections.defaultdict(list)
for f in mf.values():
    k=mk(mf,mine,f)
    if k and f['marr']:mm2[k].append(f['marr'])
oc=ohit=0;noyear=0;miss=[]
for f in of.values():
    k=mk(of,ours,f)
    if not k:continue
    if not f['marr']:
        continue
    if not 1841<=f['marr']<=1894:continue
    oc+=1
    if any(abs(y-f['marr'])<=1 for y in mm2.get(k,[])):ohit+=1
    else:miss.append((k,f['marr']))
print(f'C2) nasze małżeństwa 1841-1894 z datą: {oc}, zgodne z indeksem (mąż imię+nazwisko, żona imię, rok±1): {ohit} ({100*ohit//max(oc,1)}%)')
print('   niezgodne (przykłady):',miss[:12])
print('   z tego z nazwiskiem męża z indeksów:',sum(1 for k,y in miss if k[1] in sur))
