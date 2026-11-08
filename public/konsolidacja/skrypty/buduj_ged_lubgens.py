#!/usr/bin/env python3
"""GED z eksportów Lubgens (Lubelskie Korzenie) dla nazwisk Kopiwoda, Pudło, Bucoń (parafia Biała i inne; Blinów pomijany, bo jest w indeksach).
Wejście: pliki CSV (;) z nagłówkiem NAZWISKO;IMIĘ;PARAFIA;AKT;ROK;UWAGI (małżeństwa: 'X (mąż) / Y (żona)') oraz TXT z wyszukiwarki (tab, 3 sekcje).
Użycie: buduj_ged_lubgens.py <wyjscie_dir> <plik>...   Wszystko to dane archiwalne (indeksy), brak danych z prywatnego GED."""
import re,sys,os,csv,collections,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from osoby_dopasowanie import kanon_imie,stem_nazwisko
OUT=sys.argv[1];FILES=sys.argv[2:];os.makedirs(OUT,exist_ok=True)
def sk(n):return re.sub(r'(ianka|owna|owa|zionka|zianka|ówna)$','',stem_nazwisko(n or ''))
def kg(n):
    n=(n or '').split();return kanon_imie(n[0].rstrip('?')) if n else ''
def like(a,b):
    import difflib
    return a==b or (a and b and difflib.SequenceMatcher(None,a,b).ratio()>=0.8)
def comp(a,b):return not a or not b or like(a,b)
MALE_A={'kuba','barnaba','bonawentura','jarema','kosma','saba'}
def sex(g):
    f=(g or '').split()[0].lower() if g else ''
    return 'F' if f.endswith('a') and f not in MALE_A else 'M'
WANT=re.compile(r'kopiw|pud[łl]o?\b|pudl|buc[oz]|buczo',re.I)
def ynum(s):
    m=re.search(r'\b(1[5-9]\d\d)\b',s or '');return int(m.group(1)) if m else None
# ---------- wczytanie rekordów ----------
R=[];seen=set()
def add(typ,rec):
    if re.search(r'Blin[óo]w',rec['par']):return
    k=(typ,rec['par'],rec['akt'],rec['rok'],rec.get('n1',''),rec.get('g1',''),rec.get('n2',''),rec.get('g2',''))
    if k in seen:return
    seen.add(k);rec['typ']=typ;R.append(rec)
def csvread(p):
    n=os.path.basename(p).lower()
    typ='u' if 'urodz' in n else 's' if 'slub' in n else 'z' if 'zgon' in n else None
    if not typ:return
    for row in csv.reader(open(p,encoding='utf-8-sig'),delimiter=';'):
        if len(row)<6 or row[0].startswith('NAZWISKO'):continue
        a,b,par,akt,rok,uw=[x.strip() for x in row[:6]]
        try:rok=int(rok)
        except:continue
        if typ=='s':
            m=re.match(r'(.*?)\s*\(mąż\)\s*/\s*(.*?)\s*\(żona\)',a)
            if not m:continue
            g=[x.strip() for x in b.split('/')]
            if len(g)<2:continue
            rec=dict(n1=m.group(1),g1=g[0],n2=m.group(2),g2=g[1],par=par,akt=akt,rok=rok,uw=uw)
            if WANT.search(rec['n1']+' '+rec['n2']+' '+uw):add('s',rec)
        else:
            if WANT.search(a+' '+uw):add(typ,dict(n1=a,g1=b,par=par,akt=akt,rok=rok,uw=uw))
def txtread(p):
    sec=None
    for l in open(p,encoding='utf-8-sig'):
        l=l.rstrip('\r\n')
        if l.startswith('Znalezione urodz'):sec='u';continue
        if l.startswith('Znalezione małż'):sec='s';continue
        if l.startswith('Znalezione zgon'):sec='z';continue
        c=l.split('\t')
        if sec is None or c[0].startswith('NAZWISKO') or len(c)<5:continue
        try:
            if sec=='s':
                rec=dict(n1=c[0],g1=c[1],n2=c[2],g2=c[3],par=c[4],akt=c[5],rok=int(c[6]),uw=(c[7] if len(c)>7 else ''))
            else:
                rec=dict(n1=c[0],g1=c[1],par=c[2],akt=c[3],rok=int(c[4]),uw=(c[5] if len(c)>5 else ''))
        except:continue
        if WANT.search(' '.join(c)):add(sec,rec)
for f in FILES:
    (txtread if f.lower().endswith('.txt') else csvread)(f)
# ---------- struktury ----------
P=[];F=[]
def newp(g,s,sx=None,birt=None,birp='',src='',note=''):
    p=dict(id=len(P),g=g,s=s,sx=sx or sex(g),birt=birt,birp=birp,deat=None,deap='',src=[],note=[],famc=None,fams=[])
    if src:p['src'].append(src)
    if note:p['note'].append(note)
    P.append(p);return p
def newf(h,w):
    f=dict(id=len(F),h=h,w=w,ch=[],marr=None,marp='',src=[],note=[]);F.append(f)
    if h:h['fams'].append(f)
    if w:w['fams'].append(f)
    return f
def clean(x):return re.sub(r'\s+',' ',re.sub(r'\bl\.?\s*\d+|\[\?\]|\?','',x or '')).strip()
def namesplit(x,default_s=''):
    x=re.sub(r'\b(z d\.|zd\.|z|ze)\b','',clean(x)).strip();t=x.split()
    return (t[0] if t else '',' '.join(t[1:]) or default_s)
PLACES=re.compile(r'^(Krzemień|Godziszów|Dzwola|Kocudza|Wólka Ratajska|Kawęczyn|Bory|Łążek|Brzozówka|Majdan|Andrzejów|Janów|Biała|Moczydła|Branewka|Gózd|Zakrzówek)',re.I)
def place(uw,par):
    m=PLACES.match((uw or '').strip().lstrip(',').strip())
    return m.group(1) if m else ''
def src(r):return f"{r['par']}, akt {r['akt']}/{r['rok']} (Lubgens, indeks)"
def parents_from(uw,chs):
    m=re.search(r'O:\s*([^,;]*?)\s*(?:\(O:[^)]*\))?\s*(?:,|;)\s*M:\s*([^,;(]+)',uw or '')
    if not m:
        m=re.search(r'O:\s*([^,;(]+)',uw or '')
        if not m:return None
        return (namesplit(m.group(1),chs),('',''))
    return (namesplit(m.group(1),chs),namesplit(m.group(2),''))
def find_fam(fg,fs,mg,ms,year):
    best=None
    for f in F:
        h,w=f['h'],f['w']
        if not h or not kg(fg)==kg(h['g']) or not comp(sk(fs),sk(h['s'])):continue
        if mg and w and kg(mg)!=kg(w['g']):continue
        if mg and not w:continue
        if ms and w and not comp(sk(ms),sk(w['s'])):continue
        ys=[P[c]['birt'] for c in f['ch'] if P[c]['birt']]
        if year and ys and (year<min(ys)-2 or year>max(ys)+25):continue
        if year and f['marr'] and year<f['marr']-1:continue
        # preferuj z dopasowanym nazwiskiem matki
        sc=(1 if ms and w and sk(ms)==sk(w['s']) else 0)+(1 if mg else 0)
        if best is None or sc>best[0]:best=(sc,f)
    return best[1] if best else None
def ensure_fam(par,fg,fs,mg,ms,year,s):
    f=find_fam(fg,fs,mg,ms,year) if fg else None
    if f:
        if ms and f['w'] and not f['w']['s']:f['w']['s']=ms
        if f['w'] is None and mg:
            w=newp(mg,ms,'F',src=s);f['w']=w;w['fams'].append(f)
        return f
    h=newp(fg,fs,'M',src=s) if fg else None
    w=newp(mg,ms,'F',src=s) if mg else None
    return newf(h,w)
# ---------- urodzenia ----------
for r in [x for x in R if x['typ']=='u']:
    cs=re.sub(r'(ianka|owna|zionka|ówna|zianka)$','a',r['n1']) if r['n1'].lower().startswith('kopiw') else r['n1']
    cs=re.sub(r'^Kopiwid','Kopiwod',cs)
    c=newp(r['g1'].split()[0] if r['g1'] else '',cs,birt=r['rok'],birp=place(r['uw'],r['par']) or r['par'],src=src(r))
    c['sx']=sex(c['g'])
    pr=parents_from(r['uw'],cs)
    if pr and pr[0][0]:
        (fg,fs),(mg,ms)=pr;f=ensure_fam(r['par'],fg,fs or cs,mg,ms,r['rok'],src(r))
        f['ch'].append(c['id']);c['famc']=f['id']
        if not f['h']['birt'] and False:pass
# ---------- małżeństwa ----------
def find_person(g,s,sx,y1,y2,fam_free=True):
    c=[p for p in P if kg(p['g'])==kg(g) and comp(sk(s),sk(p['s'])) and sk(s) and p['sx']==sx and p['birt'] and y1<=p['birt']<=y2 and not any(f['marr'] for f in p['fams'])]
    return c[0] if len(c)==1 else None
for r in [x for x in R if x['typ']=='s']:
    s=src(r);y=r['rok']
    n1,n2=r['n1'],r['n2']
    wm=re.search(r'zd\.\s*([^\s,;]+)',r['uw'] or '')
    wmaid=wm.group(1) if wm else n2
    note_w=f"nazwisko w akcie: {n2}" if wm else ''
    # rodzice z nawiasów [ ... ]
    def par_br(label,default_s):
        m=re.search(label+r'\s*\[\s*(.*?)\s*\]',r['uw'] or '')
        if not m:return None
        t=re.split(r'\s+i\s+',m.group(1),1)
        if len(t)==2:return namesplit(t[0],default_s),namesplit(t[1],'')
        return ('',''),namesplit(t[0],'')
    pm=par_br('rodzice młodego',n1);pz=par_br('rodzice młodej',wmaid)
    ages=re.findall(r'(?:kaw|wdow)\.?\s*lat:?\s*(\d+)',r['uw'] or '');agew=re.findall(r'panna\.?\s*lat:?\s*(\d+)|wdowa\.?\s*lat:?\s*(\d+)',r['uw'] or '')
    gname,wname=r['g1'],r['g2']
    # kandydat: istniejąca rodzina (mąż jest ojcem, żona matką)
    f=None
    for fam in F:
        h,w=fam['h'],fam['w']
        if h and w and kg(h['g'])==kg(gname) and comp(sk(n1),sk(h['s'])) and kg(w['g'])==kg(wname) and (comp(sk(wmaid),sk(w['s'])) or comp(sk(n2),sk(w['s']))):
            ys=[P[c]['birt'] for c in fam['ch'] if P[c]['birt']]
            if (not ys or min(ys)>=y-1) and not fam['marr']:f=fam;break
    if not f:
        h=find_person(gname,n1,'M',y-60,y-14) or newp(gname,n1,'M',src=s)
        w=find_person(wname,wmaid,'F',y-60,y-13) or newp(wname,wmaid,'F',src=s)
        if w['s']!=wmaid and not w['s']:w['s']=wmaid
        f=newf(h,w)
    f['marr']=y;f['marp']=place(r['uw'],r['par']) or r['par'];f['src'].append(s)
    if note_w:f['w']['note'].append(note_w+f" ({s})")
    if r['uw'] and not re.search(r'rodzice|kaw\.|panna',r['uw']):f['note'].append(r['uw'])
    for p,pp,sx_ in((f['h'],pm,'M'),(f['w'],pz,'F')):
        if pp and not p['famc']:
            (fg,fs),(mg,ms)=pp
            if fg or mg:
                ff=ensure_fam(r['par'],fg,fs or p['s'],mg,ms,None,s) if fg else newf(None,newp(mg,ms,'F',src=s))
                ff['ch'].append(p['id']);p['famc']=ff['id']
    if ages and not f['h']['birt']:f['h']['birt']=y-int(ages[0]);f['h']['note'].append('rok ur. szacowany z wieku w akcie ślubu')
    if agew and not f['w']['birt']:
        a=[x for t in agew for x in t if x]
        if a:f['w']['birt']=y-int(a[0]);f['w']['note'].append('rok ur. szacowany z wieku w akcie ślubu')
# ---------- zgony ----------
for r in [x for x in R if x['typ']=='z']:
    s=src(r);y=r['rok'];uw=r['uw'] or ''
    zm=re.search(r'z d\.\s*([^\s,;]+)|zd\.\s*([^\s,;]+)',uw);maid=(zm.group(1) or zm.group(2)) if zm else ''
    g=r['g1'].split()[0] if r['g1'] else '';sx_=sex(g);surn=re.sub(r'(zionka|ianka|ówna)$','a',r['n1']);
    nm=maid or surn
    age=re.search(r'(\d+)\s*l\.|l\.\s*(\d+)',uw);age=int((age.group(1) or age.group(2))) if age else None
    if age is not None and age>110:age=None
    c=[p for p in P if kg(p['g'])==kg(g) and p['sx']==sx_ and (comp(sk(nm),sk(p['s'])) or (maid=='' and sx_=='F' and any(comp(sk(surn),sk(F[fi]['h']['s'])) for fi in [x['id'] for x in p['fams']] if F[fi]['h']))) and sk(nm) and p['deat'] is None and (p['birt'] is None or 0<=y-p['birt']<=100) and (age is None or p['birt'] is None or abs((y-age)-p['birt'])<=3) and any(True for _ in [0])]
    # tylko pewne (jednoznaczne) dopasowanie osób z rodzinami lub rocznikiem
    c=[p for p in c if p['birt'] or p['fams']]
    if len(c)==1:
        p=c[0];p['deat']=y;p['deap']=place(uw,r['par']) or r['par'];p['src'].append(s)
        if zm:p['note'].append(f"nazwisko po mężu wg aktu zgonu: {r['n1']} ({s})")
    else:
        p=newp(g,nm,sx_,birt=(y-age if age is not None else None),src=s,note=('dopasowanie do istniejącej osoby niejednoznaczne ('+str(len(c))+')' if len(c)>1 else ''))
        p['deat']=y;p['deap']=place(uw,r['par']) or r['par']
        if age is not None:p['note'].append('rok ur. szacowany z wieku w akcie zgonu')
        if zm:p['note'].append(f"nazwisko po mężu wg aktu zgonu: {r['n1']} ({s})")
        pr=parents_from(uw,surn)
        if pr and pr[0][0]:
            (fg,fs),(mg,ms)=pr;ff=ensure_fam(r['par'],fg,fs or surn,mg,ms,None,s);ff['ch'].append(p['id']);p['famc']=ff['id']
    sp=re.search(r'(?:mąż|ż\.|żona):\s*([A-ZŁŚŻ][\wąęóćłńśźż]+(?:\s+[A-ZŁŚŻ][\wąęóćłńśźż]+)?)',uw)
    if sp:p['note'].append(f"małżonek wg aktu zgonu: {sp.group(1)} ({s})")
    if uw.strip():p['note'].append('uwagi: '+uw.strip()+f" ({s})")
# ---------- zapis GED ----------
def nm(p):return f"{p['g'] or ''} /{p['s'] or ''}/".strip()
with open(os.path.join(OUT,'lubgens_Kopiwoda_Pudlo_Bucon.ged'),'w',encoding='utf-8') as o:
    o.write('0 HEAD\n1 SOUR LUBGENS_INDEKSY\n2 NAME GED z eksportow Lubgens (Kopiwoda, Pudlo, Bucon)\n1 GEDC\n2 VERS 5.5.1\n2 FORM LINEAGE-LINKED\n1 CHAR UTF-8\n0 @SLG@ SOUR\n1 TITL Lubgens (Lubelskie Korzenie) - indeks, niepotwierdzone skanem\n')
    for p in P:
        o.write(f"0 @L{p['id']}@ INDI\n1 NAME {nm(p)}\n1 SEX {p['sx']}\n")
        if p['birt']:
            o.write(f"1 BIRT\n2 DATE {'ABT ' if any('szacowany' in n for n in p['note']) and not any('akt' in x and 'urodz' in x for x in p['src']) else ''}{p['birt']}\n")
            if p['birp']:o.write(f"2 PLAC {p['birp']}\n")
        if p['deat']:
            o.write(f"1 DEAT\n2 DATE {p['deat']}\n")
            if p['deap']:o.write(f"2 PLAC {p['deap']}\n")
        if p['famc'] is not None:o.write(f"1 FAMC @LF{p['famc']}@\n")
        for f in p['fams']:o.write(f"1 FAMS @LF{f['id']}@\n")
        for s_ in dict.fromkeys(p['src']):o.write(f"1 NOTE Źródło: {s_}\n")
        for n_ in dict.fromkeys(p['note']):o.write(f"1 NOTE {n_}\n")
    for f in F:
        o.write(f"0 @LF{f['id']}@ FAM\n")
        if f['h']:o.write(f"1 HUSB @L{f['h']['id']}@\n")
        if f['w']:o.write(f"1 WIFE @L{f['w']['id']}@\n")
        for c in f['ch']:o.write(f"1 CHIL @L{c}@\n")
        if f['marr']:
            o.write(f"1 MARR\n2 DATE {f['marr']}\n")
            if f['marp']:o.write(f"2 PLAC {f['marp']}\n")
        for s_ in dict.fromkeys(f['src']):o.write(f"1 NOTE Źródło: {s_}\n")
        for n_ in dict.fromkeys(f['note']):o.write(f"1 NOTE {n_}\n")
    o.write('0 TRLR\n')
st=dict(rekordy=len(R),urodzenia=sum(1 for x in R if x['typ']=='u'),malzenstwa=sum(1 for x in R if x['typ']=='s'),zgony=sum(1 for x in R if x['typ']=='z'),osoby=len(P),rodziny=len(F),rodziny_z_slubem=sum(1 for f in F if f['marr']),rodziny_z_dziecmi=sum(1 for f in F if f['ch']))
json.dump(st,open(os.path.join(OUT,'statystyki.json'),'w'),indent=1);print(st)
