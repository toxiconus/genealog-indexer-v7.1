import re,json,collections,csv
SRC='/mnt/user-data/attachments/3e7ce577-16ba-54bc-8dbe-e2ba98a801b3/4835ffd1-weryfikacja_zgonow_v2_mini_43-45.html'
IDX='/tmp/o74/idx1870_79.txt'
t=open(SRC,encoding='utf-8').read()
i=t.index('const D = '); j=t.index(';\n',i); D=json.loads(t[i+10:j])
# ---- indeks GenBaza
rows=[]
for l in open(IDX,encoding='utf-8').read().split('\n'):
    p=l.split('\t')
    if len(p)>=4 and re.fullmatch(r'\d+',p[2]) and re.fullmatch(r'18[78]\d',p[3]):
        rows.append(dict(nazw=p[0].strip(),imie=p[1].strip(),akt=int(p[2]),rok=int(p[3]),uw=(p[4].strip() if len(p)>4 else '')))
def parse(uw):
    o={}
    m=re.search(r'\b(Brzozówka|Moczydła|Moczdła|Blinów)\b',uw)
    if m: o['deceased_residence']={'Moczdła':'Moczydła'}.get(m.group(1),m.group(1))
    m=re.search(r'\b(?:l|lat)\.?\s*([\d,]+)',uw)
    if m: o['age']=m.group(1)+' l.'
    m=re.search(r'\bm-?\.?\s*(\d+)',uw)
    if m and 'age' not in o: o['age']=m.group(1)+' mies.'
    if re.search(r'\bs\. ',uw): o['deceased_sex']='M'
    if re.search(r'\bc\. ',uw): o['deceased_sex']='K'
    m=re.search(r'\b[sc]\. ([A-ZŁŚŻŹĆ][\wąęółśżźćń]+|\?\.?)\s+i\s+([A-ZŁŚŻŹĆ][\wąęółśżźćń]+)(?: z ([A-ZŁŚŻŹĆ][\wąęółśżźćń]+)(?:ów|ków|iów))?',uw)
    if m:
        o['father_first_name']=m.group(1); o['mother_first_name']=m.group(2)
        if m.group(3): o['mother_last_name']=m.group(3)
    if 'owd' in uw or 'wd' in uw or 'wdow' in uw: o['deceased_status']='wdowa/wdowiec'
    return o
SCANROOT='Blinów - zgony %s (ASC)/'
def fkey(rok,akt):
    S=[]
    if rok==1873: S=[((1,5),'1873/01_zgony_1873_akty_01-05.jpg'),((6,15),'1873/02_zgony_1873_akty_06-15.jpg'),((16,25),'1873/03_zgony_1873_akty_16-25.jpg'),((26,35),'1873/04_zgony_1873_akty_26-35.jpg'),((46,50),'1873/05_zgony_1873_akty_46-50_i_spis_alfabetyczny.jpg')]
    if rok==1874: S=[((1,5),'1874/01_zgony_1874_akty_01-05.jpg'),((6,15),'1874/02_zgony_1874_akty_06-15.jpg'),((16,25),'1874/03_zgony_1874_akty_16-25.jpg'),((26,26),'1874/05_zgony_1874_akt_26_i_skorowidz.jpg')]
    if rok==1875: S=[((1,5),'1875/01_zgony_1875_akty_01-05.jpg'),((6,15),'1875/02_zgony_1875_akty_06-15.jpg'),((16,25),'1875/03_zgony_1875_akty_16-25.jpg')]
    if rok==1876: S=[((1,4),'1875/04_skorowidz_1875_i_zgony_1876_akty_01-04.jpg'),((5,12),'1876-78/01_zgony_1876_akty_05-12.jpg'),((13,20),'1876-78/02_zgony_1876_akty_13-20.jpg'),((21,28),'1876-78/03_zgony_1876_akty_21-28.jpg')]
    if rok==1877: S=[((1,5),'1876-78/04_skorowidz_1876_i_zgony_1877_akty_01-05.jpg'),((6,15),'1876-78/05_zgony_1877_akty_06-15.jpg'),((16,20),'1876-78/06_zgony_1877_akty_16-20_i_1878_akty_21-25.jpg')]
    if rok==1878: S=[((21,25),'1876-78/06_zgony_1877_akty_16-20_i_1878_akty_21-25.jpg'),((26,31),'1876-78/07_zgony_1878_akty_26-31_i_skorowidz.jpg')]
    for (a,b),f in S:
        if a<=akt<=b: return f
    return ''
FOLD={'1873':'Blinów - zgony 1873 (ASC)','1874':'Blinów - zgony 1874 (ASC)','1875':'Blinów - zgony 1875 (ASC)','1876-78':'Blinów - zgony 1876-1878 (ASC)'}
def path(f):
    if not f: return ''
    d,n=f.split('/',1); return FOLD[d]+'/'+n
scanFiles={}; acts=[]
for r in rows:
    f=path(fkey(r['rok'],r['akt'])); key=re.sub(r'\W','',f)[-24:] if f else ''
    if f: scanFiles[key]=f
    lub=dict(deceased_last_name=r['nazw'],deceased_first_name=r['imie']); lub.update(parse(r['uw']))
    acts.append(dict(id='asc-%d-%03d'%(r['rok'],r['akt']),year=r['rok'],act=r['akt'],ai=None,unc=[],file=key,roi=None,lub=lub,lubRaw=r['uw'],lubName=r['nazw']+' '+r['imie']))
AM={a['id']:a for a in acts}
# ---- moje odczyty (ai)
def ai(rok,akt,unc=(),**kw):
    base={k:'' for k in ['deceased_last_name','deceased_first_name','deceased_maiden_name','deceased_sex','death_date','death_time','age','deceased_status','deceased_spouse','death_place','deceased_birth_place','deceased_residence','profession','father_first_name','father_last_name','mother_first_name','mother_last_name','act_date','informant1','informant2','officiant','notes']}
    base.update(kw); base['officiant']=base['officiant'] or 'ks. M. Chmielewski'
    a=AM.get('asc-%d-%03d'%(rok,akt))
    if a is None: print('brak',rok,akt); return
    a['ai']=base; a['unc']=list(unc)
ai(1874,11,deceased_last_name='Bucoń',deceased_first_name='Jan',deceased_sex='M',death_date='1874-08-02',death_time='17:00',age='2 l.',death_place='Brzozówka',deceased_residence='Brzozówka',father_first_name='Michał',father_last_name='Bucoń',mother_first_name='Zofia',mother_last_name='Serafin',act_date='1874-08-04',informant1='Stanisław Mazurek, 28',informant2='Michał Bucoń, 31',unc=(),notes='Matka w akcie Daria/Zofia (indeks: Zofia). Data zgonu 21 VII st.st.')
ai(1874,25,deceased_last_name='Kopiwoda',deceased_first_name='Szymon',deceased_sex='M',death_date='1874-12-09',death_time='23:00',age='2 mies.',death_place='Brzozówka',deceased_residence='Brzozówka',father_first_name='Jan',father_last_name='Kopiwoda',mother_first_name='Zofia',act_date='1874-12-11',informant1='Stanisław Mazurek, ~30',informant2='Jan Kopiwoda, ~27',unc=('mother_first_name','informant1','informant2'),notes='Matka wg indeksu Zofia (w akcie nieczytelnie).')
ai(1874,10,deceased_last_name='Pcionek',deceased_first_name='Agnieszka',deceased_sex='K',death_date='1874-08-02',death_time='01:00',age='1 r.',death_place='Blinów',deceased_residence='Blinów',father_first_name='Paweł',father_last_name='Pcionek',mother_first_name='Katarzyna',mother_last_name='Szabat',act_date='',informant1='Franciszek Pa?czyński, 38',informant2='Paweł Pcionek, 32',unc=('death_date','age','informant1','mother_last_name'),notes='W akcie „Pcionkówna”. Data zgonu 21/22 VII st.st. niepewna; wiek wg indeksu; kto zmarł – do sprawdzenia w urodzeniach.')
ai(1874,15,deceased_last_name='Kędziora',deceased_first_name='Antoni',deceased_sex='M',death_date='1874-08-29',death_time='08:00',age='2 l.',death_place='Blinów',deceased_residence='Blinów',father_first_name='Wojciech',father_last_name='Kędziora',mother_first_name='Agnieszka',informant1='Paweł Dziewa, 46',informant2='Wojciech Kędziora, 32',unc=('mother_first_name',),notes='Matka wg indeksu Agnieszka; w akcie Anna/Agnieszka?')
ai(1874,2,deceased_last_name='Dąbrowski',deceased_first_name='Grzegorz',deceased_sex='M',age='1',death_place='Brzozówka',deceased_residence='Brzozówka',informant1='Antoni Bucoń, 52',informant2='Bonifacy Dąbrowski',unc=('age','informant2'),notes='Indeks: s. Józefa i Barbary z Kolasów; wiek wg indeksu 1 l.')
ai(1874,23,deceased_last_name='Brzoskiewicz',deceased_first_name='Mikołaj',deceased_sex='M',age='2 l.',death_place='Brzozówka',deceased_residence='Brzozówka',informant1='Stanisław Mazurek, 29',informant2='Jan Brzoskiewicz, 40',unc=('age',),notes='Indeks: s. Jana i Franciszki.')
ai(1875,16,deceased_last_name='Piech',deceased_first_name='Anna',deceased_maiden_name='Bigos',deceased_sex='K',death_date='1875-08-28',death_time='19:00',age='59 l.',deceased_status='wdowa',deceased_spouse='Michał Piech',death_place='Blinów',deceased_residence='Blinów',father_first_name='Andrzej',father_last_name='Bigos',mother_first_name='Katarzyna',mother_last_name='Bigos',informant1='Jakub Sobótka, 59',informant2='Paweł Dziewa, 47',notes='W akcie wprost: córka zmarłych Andrzeja i Katarzyny z Bigosów. Data 16 VIII st.st.')
ai(1875,2,deceased_last_name='Pędzio',deceased_first_name='Tekla',deceased_maiden_name='Spryszak',deceased_sex='K',death_date='1875-02-04',death_time='22:00',age='30 l.',deceased_status='wdowa',deceased_spouse='Wojciech Pędzio',death_place='Brzozówka',deceased_residence='Brzozówka',father_first_name='Mateusz',father_last_name='Spryszak',mother_first_name='Magdalena',mother_last_name='Spryszak',informant1='Antoni Bucoń, 52',informant2='Michał Spryszak, 38',notes='Data 23 I st.st.')
ai(1875,3,deceased_last_name='Pcionek',deceased_first_name='Józef',deceased_sex='M',death_date='1875-02-09',death_time='06:00',age='2 mies.',death_place='Blinów',deceased_residence='Blinów',father_first_name='Paweł',father_last_name='Pcionek',mother_first_name='Agnieszka',mother_last_name='Sękuła',informant1='Franciszek Kaczyński, 39',informant2='Paweł Pcionek, 33',unc=('mother_last_name',),notes='Matka: Agnieszka (potwierdzone), nazwisko niepewne (Sękuła/Sekuła).')
ai(1875,8,deceased_last_name='Pcionek',deceased_first_name='Tomasz',deceased_sex='M',death_date='1875-03-23',death_time='17:00',age='4 mies.',deceased_status='dziecko',death_place='Blinów',deceased_residence='Blinów',mother_first_name='Magdalena',mother_last_name='Pcionek',informant1='Bonawentura Kurzyk?, 67',informant2='Dominik Kaczyński, 27',unc=('informant1',),notes='Nieślubny syn Magdaleny Pcionkówny, służącej.')
ai(1875,25,deceased_last_name='Pcionek',deceased_first_name='Jadwiga',deceased_sex='K',death_date='1875-12-25',death_time='19:00',age='67 l.',deceased_status='wdowa',profession='zarobnica',death_place='Blinów',deceased_residence='Blinów',father_first_name='Antoni',mother_last_name='Rybak',unc=('death_date','mother_first_name','mother_last_name','informant1','informant2'),notes='Matka: nazwisko wg użytkownika Rybak, imienia nie odczytano. Indeks: Marianna z Pawłasków – odrzucone. Zgłaszający do odczytu.')
ai(1876,19,deceased_last_name='Spryszak',deceased_first_name='Antoni',deceased_sex='M',death_date='1876-07-04',death_time='12:00',age='37 l.',deceased_status='żonaty',deceased_spouse='Anna Pudło',profession='gospodarz (землевладелец)',death_place='Brzozówka',deceased_residence='Brzozówka',father_first_name='Walenty',father_last_name='Spryszak',mother_first_name='Agnieszka',informant1='Walenty Jachura, 55',informant2='Walenty Rębacz, 42',unc=('death_date','father_first_name','mother_first_name'),notes='Wiek 37 potwierdzony (indeks l.7 błędny). Rozbieżność z Wojciechem Spryszakiem †1873 (l.19).')
ai(1876,21,deceased_last_name='Rębacz',deceased_first_name='Jan',deceased_sex='M',age='43 l.',deceased_status='żonaty',deceased_spouse='Anna Bucoń',death_place='Brzozówka',deceased_residence='Brzozówka',father_first_name='Paweł',father_last_name='Rębacz',mother_first_name='Katarzyna',mother_last_name='Sagan',informant1='Michał Bucoń, ~53',informant2='Rębacz (brat), ~41',unc=('death_date','informant1','informant2'),notes='Data do potwierdzenia.')
ai(1876,25,deceased_last_name='Pcionek',deceased_first_name='Mikołaj',deceased_sex='M',death_date='1876-10-16',death_time='05:00',age='41 l.',deceased_status='żonaty',deceased_spouse='Aniela Mróz',death_place='Blinów',deceased_residence='Blinów',father_first_name='Marcin',father_last_name='Pcionek',mother_first_name='Anastazja',mother_last_name='Jachura',informant1='Józef Kurek?, 57',informant2='Franciszek Mróz, 34',unc=('informant1',),notes='Ojciec Marcin (potwierdzone; indeks Mateusz błędny). Data 4 X st.st.')
ai(1878,27,deceased_last_name='Pcionek',deceased_first_name='Paweł',deceased_sex='M',death_date='1878-09-21',death_time='21:00',age='16 l.',death_place='Blinów',deceased_residence='Blinów',father_first_name='Walenty',father_last_name='Pcionek',mother_first_name='Marianna',mother_last_name='Kudrelek',informant1='Michał Kudrelek, 37',informant2='Adam Pawłasek, 44',notes='Zagrodnicy z Blinowa.')
ai(1878,29,deceased_last_name='Jachura',deceased_first_name='Jan',deceased_sex='M',death_date='1878-11-16',death_time='21:00',age='6 mies.',death_place='Blinów',deceased_residence='Blinów',father_first_name='Tomasz',father_last_name='Jachura',mother_first_name='Marianna',mother_last_name='Pcionek',informant1='Piotr Kozyra, 43',informant2='Antoni Jachura, 28')
ai(1878,30,deceased_last_name='Bucoń',deceased_first_name='Marianna',deceased_sex='K',death_date='1878-12-19',death_time='14:00',age='70 l.',deceased_status='wdowa',death_place='Brzozówka',deceased_residence='Brzozówka',father_first_name='Antoni',mother_first_name='Anastazja',mother_last_name='Kołot',informant1='Walenty Jachura, 54',informant2='Walenty Rębacz, 45',unc=('mother_last_name',),notes='W akcie „Buconiowa”; nawias = ta sama nazwa po polsku.')
ai(1873,14,deceased_last_name='Bigos',deceased_first_name='Zofia',deceased_sex='K',age='9 mies.',death_place='Brzozówka',deceased_residence='Brzozówka',father_first_name='Andrzej',father_last_name='Bigos',mother_first_name='Katarzyna',mother_last_name='Pudło',informant1='Jan Woś',informant2='Andrzej Bigos',notes='Potwierdzone przez użytkownika.')
ai(1873,9,deceased_last_name='Pudło',deceased_first_name='Stanisław',deceased_sex='M',age='7 l.',death_place='Brzozówka',deceased_residence='Brzozówka',father_first_name='Wawrzyniec',father_last_name='Pudło',mother_first_name='Franciszka',mother_last_name='Bucoń',informant1='Dobrzyński, 43',informant2='Wawrzyniec Pudło, 45',unc=('age',),notes='Wiek 6/7/8 – przyjęto 7 wg użytkownika.')
ai(1873,4,deceased_last_name='Spryszak',deceased_first_name='Wojciech',deceased_sex='M',age='19 l.',death_place='Brzozówka',deceased_residence='Brzozówka',father_first_name='Antoni',father_last_name='Spryszak',mother_first_name='Anna',mother_last_name='Pudło',informant1='Michał Bucoń, 28',informant2='Antoni Spryszak')
ai(1873,48,deceased_last_name='Kopiwoda',deceased_first_name='Wawrzyniec',deceased_sex='M',age='57 l.',deceased_status='wdowiec',father_first_name='Sebastian',father_last_name='Kopiwoda',mother_first_name='Cecylia',informant1='Andrzej Kopiwoda, 32',informant2='Stanisław Mazurek, 28')
ai(1873,21,deceased_last_name='Pcion',deceased_first_name='Antoni',deceased_sex='M',age='48 l.',father_first_name='Marcin',father_last_name='Pcion',mother_last_name='Łata',notes='W akcie Pcion.')
# ---- reszta D
D['acts']=acts; D['scanFiles']=scanFiles
D['scanBase']='file:///J:/Genealog/Blin%C3%B3w%2C%20%C5%9Bw.%20Jana%20Chrzciciela/'
D['tytul']='Weryfikacja zgonów ASC 1870–1879 (Blinów)'; D['key']='wzasc1'
for r in rows:
    D['counts']['s'][r['nazw']]=D['counts']['s'].get(r['nazw'],0)+1
    D['counts']['n'][r['imie']]=D['counts']['n'].get(r['imie'],0)+1
print(len(acts),sum(1 for a in acts if a['file']),sum(1 for a in acts if a['ai']),len(scanFiles))
new=t[:i]+'const D = '+json.dumps(D,ensure_ascii=False)+t[j:]
new=new.replace('<title>Weryfikacja zgonów</title>','<title>Weryfikacja zgonów ASC 1870–1879</title>')
open('/tmp/app/weryfikacja_zgonow_ASC_1870-79.html','w',encoding='utf-8').write(new)
# CSV AI (naglowek jak w aplikacji)
cols=D['cols']
with open('/tmp/app/odczyty_AI_ASC_start.csv','w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f,delimiter=';'); w.writerow(cols)
    for a in acts:
        if a['ai']:
            o=dict(a['ai']); o.update(id=a['id'],death_year=a['year'],death_act_number=a['act'],uncertain_fields=';'.join(a['unc']))
            w.writerow([o.get(c,'') for c in cols])
