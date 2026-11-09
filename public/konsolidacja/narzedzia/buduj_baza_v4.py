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
LMDIRS=['/mnt/user-data/uploads/ZG/Liber mortuorum-zmarlych 1797-1825/','/mnt/user-data/uploads/ZG/Z 1815/','/mnt/user-data/uploads/ZG/Z 1822/']
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
        ai={'deceased_last_name':x['nazwisko'],'deceased_first_name':x['imie'],'deceased_sex':x['plec'][:1] if x['plec'][:1] in 'MK' else '',
            'death_place':loc,'deceased_residence':loc,'age':x['wiek'],'house':x['dom'],'cause_of_death':x['przyczyna_pl']+(' ('+x['przyczyna_lac']+')' if x['przyczyna_lac'] else '')}
        if not ai['cause_of_death'].strip() or ai['cause_of_death']=='brak przyczyny':ai['cause_of_death']='brak w akcie'
        if x['data_mm-dd'] and '?' not in x['data_mm-dd']:ai['death_date']='%s-%s'%(x['rok'],x['data_mm-dd'])
        elif x['data_mm-dd']:ai['death_date']='%s-%s'%(x['rok'],x['data_mm-dd'])
        pr=x['rodzice'].strip()
        if pr:ai['parents_raw']=pr
        ai['notes']=x['uwagi']
        unc=[f for f,v in ai.items() if '?' in str(v)]
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
       scanFiles=SF,scanBase=BASE,ord=D35['ord'],gz=D35['gz'],pairs=D35['pairs'],lata=[1797,1945],zakres='1797–1945',tytul='Baza zgonów Blinów 1797–1945',key='bazazgonow2')
t=open(SZ,encoding='utf-8').read()
def sub(old,new,cnt=1):
    global t
    assert old in t,old[:70];t=t.replace(old,new,cnt)
# --- zakres/ nawigacja
sub("const fieldsOf = a => a.kind==='prot' ? D.fieldsProt : a.kind==='rej' ? D.fieldsRej : ORDF;","const LATF = ['death_place','house','deceased_last_name','deceased_first_name','death_date','deceased_sex','age','deceased_status','profession','parents_raw','father_first_name','mother_first_name','mother_last_name','cause_of_death','notes'].map(id => FIELDS.find(f => f.id === id)).filter(Boolean); const CAUSEF = [...ORDF.slice(0,-1), FIELDS.find(f => f.id==='cause_of_death'), ORDF[ORDF.length-1]].filter(Boolean); const fieldsOf = a => a.kind==='prot' ? D.fieldsProt : a.kind==='rej' ? D.fieldsRej : (a.year < 1826 ? LATF : (a.year >= 1870 && a.year <= 1879 ? CAUSEF : ORDF));")
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
