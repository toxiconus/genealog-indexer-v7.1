#!/usr/bin/env python3
"""Logika dopasowania osób między źródłami (spisy, tabele likwidacyjne PL/RU, akty).
1) kanoniczne imię (Wawrzek/Wawrzyniec/Лаврентий/Laurentius -> wawrzyniec)
2) rdzeń nazwiska z transliteracją cyrylicy (Пудло -> pudlo, Копивода -> kopiwoda)
3) parser relacji ('syn X', 'zięć', 'wdowa po', 'z dobrowolnej sprzedaży z X', 'prawem sukcesji od X', rosyjskie odpowiedniki)
4) klucz osady (wieś, rok, nr) łączący dział I i II tabeli likwidacyjnej
OGRANICZENIE: nazwiska z ę/ą/cz/sz w cyrylicy (Рембачъ vs Rębacz) wymagają osobnych reguł – jeszcze niezrobione.
Użycie: python3 osoby_dopasowanie.py   (uruchamia testy)"""
import re,unicodedata
CYR={'а':'a','б':'b','в':'w','г':'g','д':'d','е':'e','ё':'e','ж':'z','з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'c','ш':'s','щ':'s','ъ':'','ы':'i','ь':'','э':'e','ю':'u','я':'ia','і':'i'}
def translit(x):
    return ''.join(CYR.get(ch,ch) for ch in x.lower())
def strip(x):
    return unicodedata.normalize('NFD',x.lower().replace('ł','l')).encode('ascii','ignore').decode()
def stem_nazwisko(x):
    x=strip(translit(x)); x=re.sub(r'[^a-z]','',x)
    x=x.replace('y','i').replace('rz','z').replace('ch','h').replace('ó','u')
    x=re.sub(r'(owna|owa|ska|cka|dzka)$',lambda m:{'ska':'ski','cka':'cki','dzka':'dzki'}.get(m.group(1),''),x)
    if x in('pcionek','mcionek'): x=x[0]+'cion'  # Pcion=Pcionek (potwierdzone 2026-11-08)
    if x.startswith('mcion'): x='p'+x[1:]  # Mcion(ek) = wariant Pcion(ek) (potwierdzone przez użytkownika 2026-11-08)
    return x
# imiona: grupa -> warianty (łacina, rosyjski, zdrobnienia)
IMIONA={'wawrzyniec':['wawrzyniec','wawrzek','wawrzyn','laurentius','лаврентий','лаврентiй','ławrentij'],
'jan':['jan','janek','joannes','иван','iwan','іоанн'],'wojciech':['wojciech','adalbertus','войцех','войцъх','woyciech'],
'andrzej':['andrzej','andreas','андрей'],'antoni':['antoni','antonius','антон'],'pawel':['pawel','paulus','павел'],
'stanislaw':['stanislaw','stanislaus','станислав'],'michal':['michal','michael','михаил'],'franciszek':['franciszek','franciscus','францишек','франциск'],
'marcin':['marcin','martinus','мартин'],'maciej':['maciej','matthias','матвей','матфей'],'jozef':['jozef','josephus','иосиф','йосиф'],
'tomasz':['tomasz','thomas','фома','томаш'],'szymon':['szymon','simon','семен','симон'],'piotr':['piotr','petrus','петр'],
'walenty':['walenty','valentinus','валентин'],'jakub':['jakub','jacobus','яков'],'marianna':['marianna','maria','marya','марианна','мария'],
'katarzyna':['katarzyna','catharina','катерина','екатерина'],'franciszka':['franciszka','francisca','франциска'],'zofia':['zofia','sophia','софия'],'teresa':['teresa','theresia','тереза'],
'jadwiga':['jadwiga','hedvigis','ядвига'],'agnieszka':['agnieszka','agnes','агнешка']}
_IM={}
for k,v in IMIONA.items():
    for w in v:_IM[strip(w) if re.match('^[a-z]',strip(w)) else w]=k
def kanon_imie(x):
    x=x.strip().lower()
    return _IM.get(x) or _IM.get(strip(x)) or strip(translit(x))
def ta_sama_osoba(a_imie,a_nazw,b_imie,b_nazw):
    return kanon_imie(a_imie)==kanon_imie(b_imie) and stem_nazwisko(a_nazw)==stem_nazwisko(b_nazw)
REL=[('syn',r'\bsyn\s+(\w+)|(\w+)ów\s+syn|(\w+)\s+сынъ|(\w+)(?:ов|ев)\s+сынъ'),
 ('zieć',r'\bzi[eę][ćc]\s+(\w+)|зять\s+(\w+)'),
 ('wdowa_po',r'\bwdowa\s+po\s+(\w+(?:\s+\w+)?)|вдова\s+(\w+)'),
 ('sukcesja',r'(?:prawem\s+)?sukcesji\s+od\s+(\w+)|po\s+dziedzictwie\s+od\s+(\w+)|по\s+наследству\s+от\s+(\w+)'),
 ('odstapienie',r'dobrowoln\w+\s+(?:odst[aą]pieni\w+|sprzeda[zż]y|umowy)\s+(?:przez|z)\s+(\w+(?:\s+\w+)?)|по\s+добровольной\s+сделк\w+\s+съ\s+(\w+(?:\s+\w+)?)'),
 ('po_zmarlym',r'\bpo\s+(\w+(?:\s+\w+)?)\b|послѣ\s+(\w+(?:\s+\w+)?)')]
def parse_relacje(t):
    out=[]
    for typ,rx in REL:
        for m in re.finditer(rx,t,re.I):
            g=[x for x in m.groups() if x]
            if g and not (typ=='po_zmarlym' and re.match(r'(sukcesji|dziedzictwie)',g[0],re.I)):out.append((typ,g[0]))
    return out
def klucz_osady(wies,rok,nr):
    return f'{stem_nazwisko(wies)}:{rok}:{int(nr)}'
def laczenie_dzialow(dzial1,dzial2):
    """dział I: {nr:(imie,nazw)}, dział II: [(imie,nazw,nr_osady_dz1)] -> lista (nr, osoba_dz1, osoba_dz2, zgodne)"""
    return [(nr,dzial1.get(nr),(i,n),nr in dzial1 and ta_sama_osoba(i,n,*dzial1[nr])) for i,n,nr in dzial2]
if __name__=='__main__':
    assert kanon_imie('Wawrzek')==kanon_imie('Лаврентий')==kanon_imie('Wawrzyniec')
    assert stem_nazwisko('Пудло')==stem_nazwisko('Pudło')=='pudlo'
    assert stem_nazwisko('Копивода')==stem_nazwisko('Kopiwoda')
    assert ta_sama_osoba('Лаврентий','Пудло','Wawrzek','Pudło')
    assert not ta_sama_osoba('Jan','Pudło','Wawrzyniec','Pudło')
    r=parse_relacje('Prawem sukcesji od Buconiowej otrzymał ją'); assert ('sukcesja','Buconiowej') in r,r
    r=parse_relacje('Pudło Wawrzyniec syn Michała'); assert ('syn','Michała') in r,r
    r=parse_relacje('Ogoń Jan z dobrowolnej sprzedaży z Buconiem Walentym'); assert ('odstapienie','Buconiem Walentym') in r,r
    r=parse_relacje('Machulakowa wdowa po Macieju Machulaku'); assert ('wdowa_po','Macieju Machulaku') in r,r
    r=parse_relacje('Пудло Лаврентий по наследству от Буцоновой'); assert ('sukcesja','Буцоновой') in r,r
    d1={1:('Andrzej','Kopiwoda'),44:('Wawrzyniec','Kopiwoda'),11:('Wawrzyniec','Pudło')}
    d2=[('Андрей','Копивода',1),('Лаврентий','Копивода',44)]
    assert all(x[3] for x in laczenie_dzialow(d1,d2))
    assert klucz_osady('Brzozówka',1865,11)==klucz_osady('Brzozówka',1865,'11')
    print('OK testy')
