import re,collections,sys
src,out=sys.argv[1],sys.argv[2]
L=open(src,encoding='utf-8').read().split('\n')
# rekordy FAM
fam=[]  # (start,end,id,members)
i=0
cur=None
for k,l in enumerate(L):
    if l.startswith('0 '):
        if cur: cur[1]=k; fam.append(tuple(cur)) if False else None
        cur=None
    m=re.match(r'0 (@[^@]+@) FAM',l)
    if m: cur=[k,None,m.group(1)]
    if cur and cur[1] is None and False: pass
# prostszy: wyznacz granice
starts=[k for k,l in enumerate(L) if l.startswith('0 ')]+[len(L)]
fams=[]
for a,b in zip(starts,starts[1:]):
    m=re.match(r'0 (@[^@]+@) FAM',L[a])
    if m:
        mem=set(re.findall(r'^1 (?:HUSB|WIFE|CHIL) (@[^@]+@)',"\n".join(L[a:b]),re.M))
        fams.append((a,b,m.group(1),mem))
byid=collections.defaultdict(list)
for f in fams: byid[f[2]].append(f)
dups={k:v for k,v in byid.items() if len(v)>1}
ren={}  # (famid, indi)-> newid
newid={}
n=0
for k,v in dups.items():
    assert len(v)==2
    n+=1; nid='@GFFD%d@'%n
    newid[k]=nid
    first,second=v
    L[second[0]]='0 %s FAM'%nid
    for ind in second[3]-first[3]:
        ren[(k,ind)]=nid
# przepnij linki w INDI
cur=None; changed=0
for a,b in zip(starts,starts[1:]):
    m=re.match(r'0 (@[^@]+@) INDI',L[a])
    if not m: continue
    ind=m.group(1)
    for j in range(a,b):
        mm=re.match(r'1 (FAMS|FAMC) (@[^@]+@)$',L[j])
        if mm and (mm.group(2),ind) in ren:
            L[j]='1 %s %s'%(mm.group(1),ren[(mm.group(2),ind)]); changed+=1
open(out,'w',encoding='utf-8').write('\n'.join(L))
print('dup',len(dups),'przepiete linki',changed)
# walidacja spojnosci
t=open(out,encoding='utf-8').read().split('\n')
st=[k for k,l in enumerate(t) if l.startswith('0 ')]+[len(t)]
famm={};indl=collections.defaultdict(set)
for a,b in zip(st,st[1:]):
    m=re.match(r'0 (@[^@]+@) (INDI|FAM)',t[a])
    if not m: continue
    blk=t[a:b]
    if m.group(2)=='FAM':
        famm[m.group(1)]=blk
    else:
        for x in blk:
            mm=re.match(r'1 (FAMS|FAMC) (@[^@]+@)$',x)
            if mm: indl[m.group(1)].add((mm.group(1),mm.group(2)))
bad=0;missing=0
for fid,blk in famm.items():
    for x in blk:
        mm=re.match(r'1 (HUSB|WIFE|CHIL) (@[^@]+@)',x)
        if mm:
            want=('FAMC' if mm.group(1)=='CHIL' else 'FAMS',fid)
            if want not in indl[mm.group(2)]: bad+=1
for ind,s in indl.items():
    for typ,f in s:
        if f not in famm: missing+=1
print('niespojne linki FAM->INDI',bad,'INDI->brak FAM',missing)
