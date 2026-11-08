import re,csv,sys,collections
src,out,csvout=sys.argv[1:4]
L=open(src,encoding='utf-8').read().split('\n')
lg=[]
for l in L:
    m=re.match(r'(\d+) CONC (.*)$',l)
    if m and lg: lg[-1]+=m.group(2)
    else: lg.append(l)
# ---- liczby
ordg={'pierwszego':1,'drugiego':2,'trzeciego':3,'czwartego':4,'piątego':5,'szóstego':6,'siódmego':7,'ósmego':8,'dziewiątego':9,'dziesiątego':10,'jedenastego':11,'dwunastego':12,'trzynastego':13,'czternastego':14,'piętnastego':15,'szesnastego':16,'siedemnastego':17,'osiemnastego':18,'dziewiętnastego':19,'dwudziestego':20,'trzydziestego':30,'czterdziestego':40,'pięćdziesiątego':50,'sześćdziesiątego':60,'siedemdziesiątego':70,'osiemdziesiątego':80,'dziewięćdziesiątego':90}
ordl={k[:-3]+'ej':v for k,v in ordg.items() if k.endswith('ego')}
card={'jeden':1,'jedna':1,'dwa':2,'dwie':2,'trzy':3,'cztery':4,'pięć':5,'sześć':6,'siedem':7,'osiem':8,'dziewięć':9,'dziesięć':10,'jedenaście':11,'dwanaście':12,'trzynaście':13,'czternaście':14,'piętnaście':15,'szesnaście':16,'siedemnaście':17,'osiemnaście':18,'dziewiętnaście':19,'dwadzieścia':20,'trzydzieści':30,'czterdzieści':40,'pięćdziesiąt':50,'sześćdziesiąt':60,'siedemdziesiąt':70,'osiemdziesiąt':80,'dziewięćdziesiąt':90,'sto':100}
months='stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia'
def ordval(s,table):
    ws=s.split(); v=0
    for w in ws: v+=table[w]
    return v
og='|'.join(sorted(ordg,key=len,reverse=True)); ol='|'.join(sorted(ordl,key=len,reverse=True)); cd='|'.join(sorted(card,key=len,reverse=True))
ORDG=r'(?:%s)(?: (?:%s))?'%(og,og)
ORDL=r'(?:%s)(?: (?:%s))?'%(ol,ol)
CARD=r'(?:%s)(?: (?:%s))?'%(cd,cd)
def date_sub(m):
    d=ordval(m.group('d'),ordg); mo=m.group('m'); y=m.group('y')
    s='%d %s'%(d,mo)
    if y:
        base={'osiemset':1800,'ośmset':1800,'osiemset':1800,'dziewięćset':1900}
        yy=1900+ordval(y,ordg)
        s+=' %d'%yy
    return s
pat_date=re.compile(r'(?:dnia )?(?P<d>%s) (?P<m>%s)(?:,? tysiąc[e]? dziewięćset (?P<y>%s) roku)?'%(ORDG,months,ORDG))
pat_hour=re.compile(r'o godzinie (%s)'%ORDL)
pat_age=re.compile(r'lat (%s)(?: (?:mająca|mający|liczący|liczącą|mające))?'%CARD)
pat_days=re.compile(r'\b(%s) (lata|lat|miesiące|miesięcy|miesiąc|tygodnie|tygodni|tydzień|dni|dzień)(?: (?:mająca|mający|liczący|liczącej|liczącą|mające))?'%CARD)
def cardval(s):
    return sum(card[w] for w in s.split())
pat_year=re.compile(r'(%s),? tysiąc[e]? dziewięćset (%s) roku'%(months,ORDG))
def conv(t):
    t=pat_year.sub(lambda m:'%s %d'%(m.group(1),1900+ordval(m.group(2),ordg)),t)
    t=pat_date.sub(date_sub,t)
    t=pat_hour.sub(lambda m:'o godz. %d'%ordval(m.group(1),ordl),t)
    t=pat_age.sub(lambda m:'lat %d'%cardval(m.group(1)),t)
    t=pat_days.sub(lambda m:'%d %s'%(cardval(m.group(1)),m.group(2)),t)
    return t
# ---- hipotezy ogolne
gen=re.compile(r'^(?:brak rodziców; szukać chrztu (\d{4})(?: w (.+?))? \(Biała/Blinów/Batorz\)\.?|brak rodziców)$')
gen2=re.compile(r'HIPOTEZY: brak w indeksach; szukać poza parafią lub w latach 1797-1825\.')
rows=[];cur=('','')
res=[];nc=0;nh=0
for l in lg:
    m=re.match(r'0 (@[^@]+@) INDI',l)
    if m: cur=[m.group(1),'']
    mn=re.match(r'1 NAME (.*)$',l)
    if mn and cur and not cur[1]: cur[1]=mn.group(1)
    if l.startswith('1 NOTE [Claude 2026-11-08] Akt (PL)') or l.startswith('1 NOTE [Claude 2026-11-08] Wpis (PL)'):
        o=l; l=conv(l); nc+= (o!=l)
    if l.startswith('1 NOTE [Claude 2026-11-08] MAMY'):
        m=re.search(r' HIPOTEZY/UWAGI: (.*)$',l)
        if m:
            segs=m.group(1).split(' | '); keep=[]
            for s in segs:
                if gen.match(s.strip()): rows.append((cur[0],cur[1],s.strip())); nh+=1
                else: keep.append(s)
            head=l[:m.start()]
            l=head+(' HIPOTEZY/UWAGI: '+' | '.join(keep) if keep else '')
        m2=gen2.search(l)
        if m2:
            rows.append((cur[0],cur[1],'brak w indeksach; szukać poza parafią lub w latach 1797-1825')); nh+=1
            l=(l[:m2.start()]+l[m2.end():]).rstrip()
    res.append(l)
final=[]
for l in res:
    if len(l)>255:
        m=re.match(r'(\d+) (\S+) ?(.*)$',l,re.S); lvl=int(m.group(1)); tag=m.group(2); val=m.group(3)
        first=f'{lvl} {tag} '; chunk=255-len(first)
        final.append(first+val[:chunk]); val=val[chunk:]
        while val: final.append(f'{lvl+1} CONC '+val[:240]); val=val[240:]
    else: final.append(l)
open(out,'w',encoding='utf-8').write('\n'.join(final))
with open(csvout,'w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f,delimiter=';'); w.writerow(['id_GED','osoba','wskazowka_do_poszukiwan']); w.writerows(rows)
print('akty z liczbami zamienione',nc,'hipotezy przeniesione',nh)
