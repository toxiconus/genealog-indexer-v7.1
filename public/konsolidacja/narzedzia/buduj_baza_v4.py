# Buduje baza_zgonow_1797-1945.html: silnik weryfikacji v3 + cala baza zgonow + nawigacja stulecie/dekada/rok
import re,json,csv,glob,io,base64,sys
R='/home/claude/genealog-indexer-v7.1/public/konsolidacja/'
SZ=R+'narzedzia/weryfikacja_szablon_v3.html'
def LD(path):
    s=open(path,encoding='utf-8').read();i=s.index('const D = ');j=s.index(';\n',i);return json.loads(s[i+10:j])
D43=LD(R+'narzedzia/dane/zgony_1943-45_mini.html');D35=LD(R+'narzedzia/dane/zgony_1935_mini.html');DA=LD(R+'narzedzia/weryfikacja_zgonow_ASC_1870-79.html')
BASE='file:///J:/Genealog/Blin%C3%B3w%2C%20%C5%9Bw.%20Jana%20Chrzciciela/'
SF={};acts=[]
def take(Dn,prefix):
    m={}
    for k,rel in Dn['scanFiles'].items():
        full=prefix+rel;key=full.split('/')[-1];SF[key]=full;m[k]=key
    for a in Dn['acts']:
        a=dict(a)
        if a.get('file'):a['file']=m.get(a['file'],a['file'])
        acts.append(a)
ZG='Blinów - lubgens/BLIN/ZG/'
take(D35,ZG);take(D43,ZG);take(DA,'')
# indeks (poza 1870-79 i latami, ktore juz maja akty)
txt=open(R+'zgony.csv',encoding='utf-8-sig').read()
rows=list(csv.DictReader(txt.splitlines(),delimiter=';' if ';' in txt.split('\n')[0] else ','))
have={(a['year'],a['act']) for a in acts if not a.get('kind')}
seq={};cnt={'s':dict(DA['counts']['s']),'n':dict(DA['counts']['n'])}
idxact={}
for x in rows:
    y=int(x['rok']);seq[y]=seq.get(y,0)+1
    cnt['s'][x['nazwisko']]=cnt['s'].get(x['nazwisko'],0)+0 if x['nazwisko'] in cnt['s'] else cnt['s'].get(x['nazwisko'],1)
    if 1870<=y<=1879 or y in(1935,1943,1944,1945):continue
    a=int(x['nr_wpisu']) if x['nr_wpisu'].strip().isdigit() else None
    nr=a if a is not None else seq[y]
    age=(x['wiek']+' '+{'lat':'l.','mies':'mies.','tyg':'tyg.'}.get(x['jednostka_wieku'],x['jednostka_wieku'])).strip() if x['wiek'] else ''
    lub={'deceased_last_name':x['nazwisko'],'deceased_first_name':x['imie'],'deceased_maiden_name':x['rodowe'],'deceased_sex':{'m':'M','k':'K'}.get(x['plec'],''),
         'age':age,'deceased_status':x['stan'],'deceased_spouse':x['zyjacy_malzonek'],'father_first_name':x['ojciec_imie'],'mother_first_name':x['matka_imie'],'mother_last_name':x['matka_nazwisko'],
         'deceased_residence':x['miejscowosc']}
    lub={k:v for k,v in lub.items() if v}
    aid='idx-%d-%d'%(y,nr if a is not None else 1000+nr)
    act=dict(id=aid,year=y,act=nr,ai=None,unc=[],file='',roi=None,lub=lub,lubRaw=x['surowe_kol_6'],lubName=(x['nazwisko']+' '+x['imie']).strip())
    acts.append(act);idxact[(y,a)]=act
# nakladka odczytow recznych (dom, przyczyna, rodzice) + skany wbudowane
SCANS={}
from PIL import Image
for nm,src in [('lm_str16-17.jpg','eabeafb5-image.jpg'),('lm_str18-19.jpg','969c52e8-image.jpg')]:
    im=Image.open('/mnt/user-data/attachments/3e7ce577-16ba-54bc-8dbe-e2ba98a801b3/'+src);im.thumbnail((1700,1700));bf=io.BytesIO();im.save(bf,'JPEG',quality=78)
    SCANS[nm]='data:image/jpeg;base64,'+base64.b64encode(bf.getvalue()).decode()
LMDIRS=['/tmp/lm_new/','/mnt/user-data/uploads/ZG/Liber mortuorum-zmarlych 1797-1825/','/mnt/user-data/uploads/ZG/Z 1815/','/mnt/user-data/uploads/ZG/Z 1822/']
def lmscan(sk):
    nm='blinow_%s.jpg'%sk
    if nm in SCANS:return nm
    for d in LMDIRS:
        import os
        if os.path.exists(d+nm):
            im=Image.open(d+nm);im.thumbnail((1700,1700));bf=io.BytesIO();im.save(bf,'JPEG',quality=70)
            SCANS[nm]='data:image/jpeg;base64,'+base64.b64encode(bf.getvalue()).decode();return nm
    return None
def rd(fn):
    L=open(fn,encoding='utf-8-sig').read().splitlines();H=L[0].split(';');n=len(H);u=H.index('uwagi');tail=n-1-u;out=[]
    for ln in L[1:]:
        if not ln.strip():continue
        p=ln.split(';')
        if len(p)>n:p=p[:u]+[';'.join(p[u:len(p)-tail])]+p[len(p)-tail:]
        p+=['']*(n-len(p));out.append(dict(zip(H,p)))
    return out
GEN={'matthaei':'Maciej','mathaei':'Maciej','hiacynthi':'Jacek','augustini':'Augustyn','gasparis':'Kacper','caspari':'Kacper','francisci':'Franciszek','mathiae':'Maciej','matthiae':'Maciej','joannis':'Jan','johannis':'Jan','adalberti':'Wojciech','josephi':'Józef','andreae':'Andrzej','thomae':'Tomasz','stanislai':'Stanisław','laurentii':'Wawrzyniec','antonii':'Antoni','petri':'Piotr','pauli':'Paweł','michaelis':'Michał','martini':'Marcin','jacobi':'Jakub','simonis':'Szymon','casimiri':'Kazimierz','gregorii':'Grzegorz','valentini':'Walenty','nicolai':'Mikołaj','christophori':'Krzysztof','blasii':'Błażej','sebastiani':'Sebastian','bartholomaei':'Bartłomiej','caroli':'Karol','ignatii':'Ignacy','catharinae':'Katarzyna','mariannae':'Marianna','agnetis':'Agnieszka','annae':'Anna','sophiae':'Zofia','dorotheae':'Dorota','theclae':'Tekla','hedwigis':'Jadwiga','margarithae':'Małgorzata','franciscae':'Franciszka','elisabethae':'Elżbieta','eliesabethae':'Elżbieta','rosaliae':'Rozalia','anastasiae':'Anastazja','salomeae':'Salomea','apolloniae':'Apolonia','magdalenae':'Magdalena','susannae':'Zuzanna','reginae':'Regina','victoriae':'Wiktoria','evae':'Ewa','justinae':'Justyna','barbarae':'Barbara','josephae':'Józefa','constantiae':'Konstancja','theresiae':'Teresa','agnetae':'Agnieszka','sophiae':'Zofia'}
def parents(pr):
    m=re.match(r'^\s*([A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)(?:\s+et\s+([A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+))?\s*(.*?)\s*$',pr)
    if not m or m.group(1).lower() not in GEN:return {}
    o={'father_first_name':GEN[m.group(1).lower()]}
    if m.group(2):
        o['mother_first_name']=GEN.get(m.group(2).lower(),m.group(2))
    sur=re.sub(r'[?()]','',m.group(3)).strip()
    if sur:o['father_last_name']=sur
    return o
PGEN={'kacpra':'Kacper','hiacynta':'Jacek','ignacego':'Ignacy','mateusza':'Mateusz','augustyna':'Augustyn','sebastiana':'Sebastian','agaty':'Agata','joanny':'Joanna','hieronima':'Hieronim','józefa':'Józef','pawła':'Paweł','andrzeja':'Andrzej','macieja':'Maciej','jana':'Jan','wojciecha':'Wojciech','tomasza':'Tomasz','marcina':'Marcin','jakuba':'Jakub','szymona':'Szymon','michała':'Michał','stanisława':'Stanisław','kazimierza':'Kazimierz','antoniego':'Antoni','piotra':'Piotr','franciszka':'Franciszek','walentego':'Walenty','wawrzyńca':'Wawrzyniec','mikołaja':'Mikołaj','błażeja':'Błażej','bartłomieja':'Bartłomiej','grzegorza':'Grzegorz','katarzyny':'Katarzyna','agnieszki':'Agnieszka','anastazji':'Anastazja','marianny':'Marianna','anny':'Anna','zofii':'Zofia','doroty':'Dorota','jadwigi':'Jadwiga','małgorzaty':'Małgorzata','elżbiety':'Elżbieta','rozalii':'Rozalia','tekli':'Tekla','ewy':'Ewa','teresy':'Teresa','barbary':'Barbara','salomei':'Salomea','magdaleny':'Magdalena','apolonii':'Apolonia','reginy':'Regina','franciszki':'Franciszka','józefy':'Józefa'}
def psur(t):
    t=re.sub(r'[?()]','',t).strip()
    f=fold(t)
    for suf in ('iow','ow','ich','ych'):
        if f.endswith(suf):
            stem=f[:-len(suf)]
            for k in (stem,stem+'a',stem+'o',stem+'e',stem+'i'):
                if k in MALE:return MALE[k]
            if suf in('ich','ych'):return t[:-len(suf)]+'i'
            return t[:-len(suf)]
    if t.endswith('ów'):
        stem=fold(t[:-2])
        for k in (stem,stem+'a',stem+'o'):
            if k in MALE:return MALE[k]
        return t[:-2]
    return t
def parents_pl(pr):
    m=re.match(r'^\s*(?:(?:syn|córka|dziecko|filia|filius)\s+)?(?:szlachetnych\s+)?(\S+)(?:\s+i\s+(\S+))?\s*(.*?)\s*$',pr,re.I)
    if not m or m.group(1).lower() not in PGEN:return {}
    o={'father_first_name':PGEN[m.group(1).lower()]}
    if m.group(2):o['mother_first_name']=PGEN.get(m.group(2).lower(),m.group(2))
    if m.group(3):o['father_last_name']=psur(re.sub(r'[?()]','',m.group(3)))
    return o
import unicodedata
def fold(x):
    x=x.lower().replace('ł','l').replace('ó','o')
    return ''.join(c for c in unicodedata.normalize('NFD',x) if unicodedata.category(c)!='Mn')
MALE={}
def addm(n):
    n=n.strip()
    if not n or ' ' in n or '?' in n or '/' in n:return
    f=fold(n)
    if re.search(r'(owa|owna|ina|yna|ska|cka|anka)$',f):return
    for k in {f,f[:-1] if f[-1] in 'oae' else f,re.sub(r'e([^aeiouy])$',r'\1',f)}:
        MALE.setdefault(k,n)
for x in rows:
    if x['plec']=='m':addm(x['nazwisko'])
for x in csv.DictReader(open(R+'blinow_akty.csv',encoding='utf-8-sig'),delimiter=';'):addm(x.get('ojciec_nazwisko',''))
FSUF=[('iowna','panna'),('owna','panna'),('ówna','panna'),('ianka','panna'),('anka','panna'),('onka','panna'),('iowa','zona'),('owa','zona'),('ina','zona'),('yna','zona')]
def male_surname(sn,sex):
    sn=sn.strip().rstrip('?').strip()
    if not sn or ' ' in sn:return None
    f=fold(sn)
    if f in MALE or re.sub(r'e([^aeiouy])$',r'\1',f) in MALE and False:return None
    for suf,typ in FSUF:
        if f.endswith(suf):
            stem=f[:-len(suf)]
            for k in (stem,stem+'a',stem+'o',stem+'e'):
                if k in MALE:return MALE[k],typ
            return sn[:-len(suf)],typ+'?'
    m=re.match(r'^(.*?)(ska|cka|dzka)$',f)
    if m and sex!='M':
        return sn[:-1]+'i',('ska')
    return None
def is_child(age):
    a=(age or '').lower()
    if re.search(r'mies|mens|dies|dn\.|dni|tyg|hebd|m\.\d',a):return True
    m=re.search(r'\d+',a);return bool(m and int(m.group())<15)
def fill_markers(ai):
    ch=is_child(ai.get('age'))
    ln=(ai.get('deceased_last_name') or '').strip()
    if ai.get('father_first_name') and not ai.get('father_last_name') and ln and not ln.startswith('['):
        ai['father_last_name']=ln
    for f in ('house','age','deceased_status','deceased_last_name','profession'):
        if not ai.get(f):ai[f]='[-]' if (f=='profession' and ch) else '[_]'
    hasp=bool(ai.get('parents_raw') or ai.get('father_first_name'))
    for f in ('father_first_name','father_last_name','mother_first_name','mother_last_name','parents_raw'):
        if not ai.get(f):ai[f]='[_]' if (ch and (f in('parents_raw','father_first_name','father_last_name') or not hasp or f.startswith('mother'))) else '[-]'
bynr={}
for (y,n),a in idxact.items():bynr.setdefault(n,[]).append(a)
nov=0;newn=0
for fn in sorted(glob.glob(R+'haiku/ODCZYTY/*_dom_przyczyny.csv'))+sorted(glob.glob(R+'haiku/ODCZYTY/lm/*.csv')):
    for x in rd(fn):
        if not x.get('nazwisko','').strip() and not x.get('imie','').strip():continue
        yr=int(x['rok']);a=None
        if x['nr_wpisu_DB'].strip().isdigit():
            n=int(x['nr_wpisu_DB']);a=idxact.get((yr,n))
            if not a and len(bynr.get(n,[]))==1 and abs(bynr[n][0]['year']-yr)<=1:a=bynr[n][0]
        loc=(x.get('miejscowosc') or 'Blinów').strip() or 'Blinów'
        lac=x['przyczyna_lac'];mag=re.match(r'^\s*(Agricola|Agricolarum)\b[\s,/-]*(.*)$',lac,re.I)
        if mag:x=dict(x);x['przyczyna_lac']=mag.group(2).strip(' /,-');x['_stan']='Agricola'
        ai={'deceased_last_name':x['nazwisko'],'deceased_first_name':x['imie'],'deceased_sex':x['plec'][:1] if x['plec'][:1] in 'MK' else '',
            'death_place':loc,'deceased_residence':loc,'age':x['wiek'],'house':x['dom'],'cause_of_death':x['przyczyna_pl']+(' ('+x['przyczyna_lac']+')' if x['przyczyna_lac'] else '')}
        if not ai['cause_of_death'].strip() or ai['cause_of_death']=='brak przyczyny':ai['cause_of_death']='brak w akcie'
        if x['data_mm-dd'] and '?' not in x['data_mm-dd']:ai['death_date']='%s-%s'%(x['rok'],x['data_mm-dd'])
        elif x['data_mm-dd']:ai['death_date']='%s-%s'%(x['rok'],x['data_mm-dd'])
        pr=x['rodzice'].strip()
        if pr:
            ai['parents_raw']=pr
            for k_,v_ in (parents(pr) or parents_pl(pr)).items():ai[k_]=v_+('?' if '?' in pr else '')
        if x.get('_stan'):ai['profession']=x['_stan']
        _ms=male_surname(ai['deceased_last_name'],ai['deceased_sex']) if ai['deceased_last_name'] else None
        _ntf=''
        _unres=bool(_ms and _ms[1].endswith('?'))
        if _ms and _unres:
            _ntf='nazwisko w akcie: '+ai['deceased_last_name']+' ('+('forma panieńska' if _ms[1].startswith('panna') else 'forma: żona lub wdowa')+', nazwisko męskie do ustalenia)'
            _ms=None
        if _ms:
            _w=ai['deceased_last_name'];ai['deceased_last_name']=_ms[0]
            _ntf='nazwisko w akcie: '+_w+' ('+{'panna':'forma panieńska','zona':'forma: żona lub wdowa','panna?':'forma panieńska, nazwisko męskie wyprowadzone','zona?':'forma: żona lub wdowa, nazwisko męskie wyprowadzone','ska':'forma żeńska'}[_ms[1]]+')'
        un=x['uwagi'];ms=re.search(r'(?:^|, )stan: ([^,;]+)',un)
        if ms:
            st=ms.group(1).strip()
            if st!='brak w akcie':
                if re.search(r'maritata|zamężn|vidua|wdow|virgo|panna|caelebs|kawaler|żonat|coniugat',st,re.I):ai['deceased_status']=st
                else:ai['profession']=st
            un=(un[:ms.start()]+un[ms.end():]).strip(', ;').strip()
        ai['notes']=', '.join(t for t in (_ntf,un) if t)
        if is_child(ai.get('age')) and not ai.get('deceased_status'):ai['deceased_status']='dziecko'
        ai['notes']=re.sub(r'(^|, )dziecko(?=,|$)','',ai.get('notes','')).strip(', ').strip()
        fill_markers(ai)
        unc=[f for f,v in ai.items() if '?' in str(v)]
        if _unres and 'deceased_last_name' not in unc:unc.append('deceased_last_name')
        if x['pewnosc']=='?' and not unc:unc=['notes']
        if not a:
            newn+=1;ym=yr;a=dict(id='lm-%s-%d'%(x['skan'],newn),year=yr,act=900+newn,ai=None,unc=[],file='',roi=None,lub={},lubRaw='',lubName=(x['nazwisko']+' '+x['imie']).strip()+' (nowy – brak w indeksie)')
            acts.append(a)
        a['ai']={f:v for f,v in ai.items() if v};a['unc']=unc;a['era']='lat'
        sk=lmscan(x['skan'])
        if not sk and x['strona_ksiegi'].strip().isdigit():
            pg=int(x['strona_ksiegi']);a['file']='lm_str16-17.jpg' if pg<=17 else 'lm_str18-19.jpg';a['roi']={'x':0.0 if pg%2==0 else 0.5,'y':0.05,'w':0.5,'h':0.93}
        if sk:
            a['file']=sk;pg=x['strona_ksiegi']
            a['roi']={'x':0.0 if ('L' in pg or pg.strip()[:1].isdigit() and int(re.match(r'\d+',pg).group())%2==0) else 0.5,'y':0.0,'w':0.5,'h':1.0}
        nov+=1
print('nakladka',nov,'nowe',newn)
acts.sort(key=lambda a:(a['year'],0 if a.get('kind')=='prot' else 1 if a.get('kind')=='rej' else 2,a['act'],a['id']))
FL=D35['fields']+[{'id':'house','label':'Nr domu'},{'id':'cause_of_death','label':'Przyczyna zgonu / choroba'},{'id':'parents_raw','label':'Rodzice (z rubryki przyczyny)'}]
D=dict(fieldsProt=D35['fieldsProt'],fieldsRej=D35['fieldsRej'],fields=FL,acts=acts,counts=cnt,scans=SCANS,cols=D35['cols']+['house','parents_raw'],fix=D43['fix'],
       scanFiles=SF,scanBase=BASE,ord=D35['ord'],gz=D35['gz'],pairs=D35['pairs'],lata=[1797,1945],zakres='1797–1945',tytul='Baza zgonów Blinów 1797–1945',key='bazazgonow3')
t=open(SZ,encoding='utf-8').read()
def sub(old,new,cnt=1):
    global t
    assert old in t,old[:70];t=t.replace(old,new,cnt)

sub("  const cellOf = f => { const v = getv(a,f.id), x = s.f[f.id]; if (!appl(a,f.id) && !clean(v)) return '';",
    "  const HMK = []; const cellOf = f => { const v = getv(a,f.id), x = s.f[f.id]; if (!appl(a,f.id) && !clean(v)) return ''; if (S.hideMk !== false && /^\\[(?:_|-)\\]$/.test(String(v||'').trim()) && !x?.ok && !x?.skip) { HMK.push(f.label + ' ' + String(v).trim()); return ''; }")
sub("  if (!a.kind) h += `<div class=\"actbar\">","  if (HMK.length) h += `<div class=\"muted hmk\" style=\"margin:8px 0;font-size:13px\">∅ Puste (ukryte): ${HMK.map(esc).join(' · ')} <button class=\"sm\" id=\"tShowMk\">pokaż</button></div>`;\n  if (!a.kind) h += `<div class=\"actbar\">")
sub("<button class=\"sm chip ${S.hideOk?'sel':''}\" id=\"tHideOk\">👁 Ukryj zatwierdzone pola</button>","<button class=\"sm chip ${S.hideOk?'sel':''}\" id=\"tHideOk\">👁 Ukryj zatwierdzone pola</button><button class=\"sm chip ${S.hideMk!==false?'sel':''}\" id=\"tHideMk\">∅ Ukryj puste [_] [-]</button>")
sub("  $('tHideOk').onclick = () => { S.hideOk = !S.hideOk; save(); renderAct(); };","  $('tHideOk').onclick = () => { S.hideOk = !S.hideOk; save(); renderAct(); };\n  $('tHideMk').onclick = () => { S.hideMk = S.hideMk === false; save(); renderAct(); };\n  { const sm = $('tShowMk'); if (sm) sm.onclick = () => { S.hideMk = false; save(); renderAct(); }; }")
# --- zakres/ nawigacja
sub("const fieldsOf = a => a.kind==='prot' ? D.fieldsProt : a.kind==='rej' ? D.fieldsRej : ORDF;","const LATF = ['death_place','house','deceased_last_name','deceased_first_name','death_date','deceased_sex','age','deceased_status','profession','parents_raw','father_first_name','mother_first_name','mother_last_name','cause_of_death','notes'].map(id => FIELDS.find(f => f.id === id)).filter(Boolean).map(f => f.id==='death_date' ? Object.assign({}, f, {l:'Data zgonu / zgłoszenia', label:'Data zgonu / zgłoszenia', n:'Data zgonu / zgłoszenia'}) : f); const CAUSEF = [...ORDF.slice(0,-1), FIELDS.find(f => f.id==='cause_of_death'), ORDF[ORDF.length-1]].filter(Boolean); const fieldsOf = a => a.kind==='prot' ? D.fieldsProt : a.kind==='rej' ? D.fieldsRej : (a.year < 1826 ? LATF : (a.year >= 1870 && a.year <= 1879 ? CAUSEF : ORDF));")
sub("let S = {acts:{}, cur:null, year:'all', flt:'all',","let S = {acts:{}, cur:null, year:'all', cen:null, dec:null, onlyScan:false, flt:'all',")
sub("(S.flt==='rej' || S.year==='all' || String(a.year)===S.year)","(S.flt==='rej' || inScope(a)) && (!S.onlyScan || S.flt==='rej' || !!scanOf(a))")
i=t.index('function renderTabs(){');j=t.index("save(); renderTabs(); renderList(); }); }",i)+len("save(); renderTabs(); renderList(); }); }")
newtabs='''function inScope(a){ if (S.year !== 'all') return String(a.year) === S.year; if (S.dec) return Math.floor(a.year/10)*10 === +S.dec; if (S.cen) return Math.floor(a.year/100) === +S.cen; return true; }
function renderTabs(){ const A = D.acts.filter(a => !a.kind), yc = {}; A.forEach(a => yc[a.year] = (yc[a.year]||0)+1);
  const cn = (f) => A.filter(f).length, cens = [...new Set(A.map(a => Math.floor(a.year/100)))].sort();
  const fl = [['rej','Rejestr + protokoły'],['all','Wszystkie'],['ai','Z odczytem AI'],['todo','Do weryfikacji'],['missing','Braki / kontrole'],['diff','Konflikty'],['unc','Niepewne'],['fam','Rodzina'],['noscan','Bez skanu'],['done','Gotowe'],['lub','Tylko indeks']];
  let h = `<button class="sm ${(!S.cen&&S.year==='all')?'on':''}" data-n="all">Wszystkie lata (${A.length})</button>`;
  h += cens.map(c => `<button class="sm ${S.cen==c?'on':''}" data-n="c${c}">${c*100}–${c*100+99} (${cn(a=>Math.floor(a.year/100)===c)})</button>`).join('');
  if (S.cen) { const ds = [...new Set(A.filter(a => Math.floor(a.year/100)===+S.cen).map(a => Math.floor(a.year/10)*10))].sort(); h += '<span class="tsep"></span>' + ds.map(d => `<button class="sm ${S.dec==d?'on':''}" data-n="d${d}">${d}s (${cn(a=>Math.floor(a.year/10)*10===d)})</button>`).join(''); }
  if (S.dec) { const ys = [...new Set(A.filter(a => Math.floor(a.year/10)*10===+S.dec).map(a => a.year))].sort(); h += '<span class="tsep"></span>' + ys.map(y => `<button class="sm ${S.year===String(y)?'on':''}" data-n="y${y}">${y} (${yc[y]})</button>`).join(''); }
  h += '<span class="tsep"></span>' + `<button class="sm ${S.onlyScan?'on':''}" id="tScan">🖼 Tylko ze skanem</button>`;
  h += fl.map(([k,l]) => `<button class="sm ${S.flt===k?'on':''}" data-f="${k}">${l}</button>`).join('') + `<button class="sm ${S.hideDoneActs?'on':''}" id="tHide">Ukryj ✓ zatwierdzone</button>`;
  $('tabs').innerHTML = h;
  $('tHide').onclick = () => { S.hideDoneActs = !S.hideDoneActs; save(); renderTabs(); renderList(); };
  $('tScan').onclick = () => { S.onlyScan = !S.onlyScan; save(); renderTabs(); renderList(); };
  $('tabs').querySelectorAll('button[data-n],button[data-f]').forEach(b => b.onclick = () => { if (b.dataset.n) { const n = b.dataset.n; if (n==='all') { S.cen = null; S.dec = null; S.year = 'all'; } else if (n[0]==='c') { S.cen = n.slice(1); S.dec = null; S.year = 'all'; } else if (n[0]==='d') { S.dec = n.slice(1); S.year = 'all'; } else { S.year = n.slice(1); } if (S.flt==='rej') S.flt = 'all'; } else S.flt = b.dataset.f; save(); renderTabs(); renderList(); }); }'''
t=t[:i]+newtabs+t[j:]
sub('.tabs button.on{background:var(--acc);color:#fff}','.tabs button.on{background:var(--acc);color:#fff}.tabs .tsep{flex:0 0 1px;background:var(--line);margin:0 4px;align-self:stretch}')
sub('Weryfikacja zgonów · v2','Baza zgonów 1797–1945')
sub('<title>Weryfikacja zgonów</title>','<title>Baza zgonów 1797–1945</title>')
out=t.replace('const D = /*DATA*/;','const D = '+json.dumps(D,ensure_ascii=False,separators=(',',':'))+';') if 'const D = /*DATA*/;' in t else None
assert out,'marker'
open(R+'narzedzia/baza_zgonow_1797-1945.html','w',encoding='utf-8').write(out)
print(len(acts),sum(1 for a in acts if a.get('ai') and not a.get('kind')),'overlay',nov,len(out))
