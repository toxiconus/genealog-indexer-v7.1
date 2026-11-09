import re,json,csv,collections,sys
R='/home/claude/genealog-indexer-v7.1/public/konsolidacja/'
COLS=['id','death_year','death_act_number','deceased_first_name','deceased_last_name','deceased_maiden_name','deceased_sex','death_date','death_time','death_place','age','deceased_status','deceased_spouse','deceased_birth_place','deceased_residence','profession','father_first_name','father_last_name','mother_first_name','mother_last_name','informant1','informant2','cause_of_death','burial_place','officiant','notes','notes_org','verification_status','uncertain_fields','source_office','house_number','parents_text']
recs=[]
# 1) indeks 1797-1869 + 1880 z zgony.csv (1870-79 bierzemy z indeksu ASC z numerami aktow)
txt=open(R+'zgony.csv',encoding='utf-8-sig').read()
rows=list(csv.DictReader(txt.splitlines(),delimiter=';' if ';' in txt.split('\n')[0] else ','))
seq=collections.Counter()
for x in rows:
    y=int(x['rok'])
    if 1870<=y<=1879: continue
    seq[y]+=1
    a=int(x['nr_wpisu']) if x['nr_wpisu'].strip().isdigit() else None
    age=''
    if x['wiek']: age=x['wiek']+' '+{'lat':'l.','mies':'mies.','tyg':'tyg.'}.get(x['jednostka_wieku'],x['jednostka_wieku'])
    f={'deceased_first_name':x['imie'],'deceased_last_name':x['nazwisko'],'deceased_maiden_name':x['rodowe'],
       'deceased_sex':{'m':'M','k':'K'}.get(x['plec'],''),'death_place':x['miejscowosc'],'age':age.strip(),'deceased_status':x['stan'],
       'deceased_spouse':x['zyjacy_malzonek'],'father_first_name':x['ojciec_imie'],'mother_first_name':x['matka_imie'],'mother_last_name':x['matka_nazwisko'],
       'notes':x['uwagi'],'notes_org':x['surowe_kol_6']}
    recs.append(dict(id='idx-%s'%x['id_archiwalne'],y=y,a=a,s='idx',ord=seq[y],f={k:v for k,v in f.items() if v},book=x['typ_ksiegi'],flags=x['flagi']))
# 2) ASC 1870-79 z aplikacji
s=open(R+'narzedzia/weryfikacja_zgonow_ASC_1870-79.html',encoding='utf-8').read()
i=s.find('const D');i=s.find('{',i);D=json.JSONDecoder().raw_decode(s[i:])[0]
base=D['scanBase']
for a in D['acts']:
    f=dict(a['lub']);src='idx'
    if a.get('ai'):
        f.update({k:v for k,v in a['ai'].items() if v});src='ai'
    f['notes_org']=a.get('lubRaw','')
    r=dict(id=a['id'],y=a['year'],a=a['act'],s=src,ord=a['act'],f={k:v for k,v in f.items() if v},book='ASC Blinów');
    if a.get('file'): r['scan']=D['scanFiles'][a['file']].split('/')[-1]
    if a.get('unc'): r['unc']=a['unc']
    recs.append(r)
# 3) zweryfikowane 1935,43-45
txt=open(R+'haiku/ZGONY_zweryfikowane_AKTUALNE.csv',encoding='utf-8-sig').read()
rr=list(csv.DictReader(txt.splitlines(),delimiter=';'))
for x in rr:
    f={c:x.get(c,'') for c in COLS if c not in('id','death_year','death_act_number') and x.get(c)}
    if x.get('act_date'): f['act_date']=x['act_date']
    if x.get('act_text'): f['act_text']=x['act_text']
    r=dict(id=x['id'],y=int(x['death_year']),a=int(x['death_act_number']),s='ok',ord=int(x['death_act_number']),f=f,book=x.get('source_office','USC'))
    if x.get('scan_path'): r['scan']=x['scan_path'].split('/')[-1]
    recs.append(r)
# 4) odczyty reczne ksiegi (dom, przyczyna, rodzice) - nakladka na wpisy indeksu
import glob
byk={(r['y'],r['a']):r for r in recs if r['s']=='idx' and r['a'] is not None and r.get('book','').startswith('Liber') and r['f'].get('death_place','Blinów') in ('Blinów','')}
for fn in sorted(glob.glob(R+'haiku/ODCZYTY/*_dom_przyczyny.csv')):
    for x in csv.DictReader(open(fn,encoding='utf-8-sig'),delimiter=';'):
        k=(int(x['rok']),int(x['nr_wpisu_DB']));r=byk.get(k)
        if not r: print('brak w indeksie',k);continue
        f=r['f'];f['death_place']='Blinów';f['house_number']=x['dom']
        if x['data_mm-dd']: f['death_date']='%s-%s'%(x['rok'],x['data_mm-dd'])
        if x['wiek']: f['age']=x['wiek']
        if x['plec'] in('M','K'): f['deceased_sex']=x['plec']
        f['cause_of_death']=(x['przyczyna_pl']+(' ('+x['przyczyna_lac']+')' if x['przyczyna_lac'] else '')).strip()
        if x['rodzice']: f['parents_text']=x['rodzice']
        if x['uwagi']: f['notes']=(f.get('notes','')+' '+x['uwagi']).strip()
        if x['nazwisko'] and not f.get('deceased_last_name'): f['deceased_last_name']=x['nazwisko']
        if x['pewnosc']=='?': r['unc']=['odczyt do potwierdzenia']
        r['s']='ai';r['book']='Liber mortuorum (odczyt Claude, str. %s)'%x['strona_ksiegi']
recs.sort(key=lambda r:(r['y'],r['a'] if r['a'] is not None else 9999,r['ord']))
print(len(recs),collections.Counter(r['s'] for r in recs),min(r['y'] for r in recs),max(r['y'] for r in recs))
tpl=open('szablon.html',encoding='utf-8').read()
out=tpl.replace('/*DATA*/null',json.dumps(dict(recs=recs,cols=COLS,scanBase=base),ensure_ascii=False,separators=(',',':')))
open(R+'narzedzia/baza_zgonow_1797-1945.html','w',encoding='utf-8').write(out)
print(len(out))
