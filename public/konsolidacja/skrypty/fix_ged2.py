import re,collections,sys
src,out=sys.argv[1],sys.argv[2]
L=open(src,encoding='utf-8').read().split('\n')
st=[k for k,l in enumerate(L) if l.startswith('0 ')]+[len(L)]
famm={};indblk={}
for a,b in zip(st,st[1:]):
    m=re.match(r'0 (@[^@]+@) (INDI|FAM)',L[a])
    if not m: continue
    (famm if m.group(2)=='FAM' else indblk)[m.group(1)]=(a,b)
# brakujace linki zwrotne
add=collections.defaultdict(list)
for fid,(a,b) in famm.items():
    for x in L[a:b]:
        mm=re.match(r'1 (HUSB|WIFE|CHIL) (@[^@]+@)',x)
        if mm and mm.group(2) in indblk:
            tag='FAMC' if mm.group(1)=='CHIL' else 'FAMS'
            ia,ib=indblk[mm.group(2)]
            if not any(y=='1 %s %s'%(tag,fid) for y in L[ia:ib]) and ('1 %s %s'%(tag,fid)) not in add[mm.group(2)]:
                add[mm.group(2)].append('1 %s %s'%(tag,fid))
res=[]
for a,b in zip(st,st[1:]):
    blk=L[a:b]
    m=re.match(r'0 (@[^@]+@) INDI',blk[0]) if blk else None
    if m and m.group(1) in add:
        # wstaw po ostatniej linii poziomu 1 przed koncem, ale przed NOTE nie wymagane
        blk=blk+add[m.group(1)]
    res.extend(blk)
if not st or st[0]>0: res=L[:st[0]]+res
# CONC dla linii > 255
final=[]
nl=0
for l in res:
    if len(l)>255:
        m=re.match(r'(\d+) (\S+) ?(.*)$',l,re.S)
        lvl=int(m.group(1)); tag=m.group(2); val=m.group(3)
        first=f'{lvl} {tag} '
        chunk=255-len(first)-1
        final.append(first+val[:chunk]); val=val[chunk:]
        while val:
            final.append(f'{lvl+1} CONC '+val[:240]); val=val[240:]
        nl+=1
    else: final.append(l)
open(out,'w',encoding='utf-8').write('\n'.join(final))
print('dodane linki zwrotne',sum(len(v) for v in add.values()),'podzielone linie',nl,'max',max(len(x) for x in final))
