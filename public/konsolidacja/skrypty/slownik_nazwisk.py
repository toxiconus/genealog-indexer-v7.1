#!/usr/bin/env python3
"""Buduje slownik_nazwisk.csv: zapisy nazwisk z blinow_akty/zgony/malzenstwa_mal zgrupowane po rdzeniu (ska/ski, y/i, rz/ż, ch/h...).
Niczego nie zmienia w źródłach – to tylko propozycja kolumny 'kanoniczne' do zatwierdzenia."""
import csv,re,unicodedata,collections,os
up=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f):return list(csv.DictReader(open(os.path.join(up,f),encoding='utf-8-sig'),delimiter=';'))
def strip(x):return unicodedata.normalize('NFD',x.lower().replace('ł','l')).encode('ascii','ignore').decode()
def stem(x):
    x=re.sub(r'[^a-z]','',strip(x)).replace('y','i').replace('rz','z').replace('ch','h')
    x=re.sub(r'(owna|owa)$','',x);x=re.sub(r'ska$','ski',x);x=re.sub(r'cka$','cki',x);return re.sub(r'dzka$','dzki',x)
cols={'blinow_akty.csv':['dziecko_nazwisko','ojciec_nazwisko','matka_nazwisko'],'zgony.csv':['nazwisko','matka_nazwisko'],'malzenstwa_mal.csv':['pan_nazwisko','pan_ojciec_nazwisko','pan_matka_nazwisko','panna_nazwisko','panna_ojciec_nazwisko','panna_matka_nazwisko']}
cnt=collections.Counter()
for f,cs in cols.items():
    for r in rd(f):
        for c in cs:
            v=(r.get(c) or '').strip()
            if re.search(r'[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]{3,}',v):cnt[v]+=1
clean=lambda v:v.replace('?','').strip()
groups=collections.defaultdict(list)
for v,n in cnt.items():
    if ',' in v or '(' in v or '?' in v:continue
    groups[stem(v)].append((n,v))
canon={}
for k,l in groups.items():
    l.sort(reverse=True);masc=[v for n,v in l if not re.search(r'(ska|cka|dzka|owa|owna|ówna)$',v)]
    c=(masc or [l[0][1]])[0]
    for n,v in l:canon[v]=c
rows=[]
for v,n in sorted(cnt.items(),key=lambda x:-x[1]):
    if v in canon:
        c=canon[v];pow_='wariant formy/pisowni' if c!=v else 'forma podstawowa'
        rows.append([v,n,c,pow_,'tak' if c!=v and not re.search(r'(ska|cka|dzka|owa|owna|ówna)$',v) else 'nie'])
    else:
        base=clean(v.split(',')[0].split('(')[0]);c=canon.get(base,base)
        rows.append([v,n,c,'zapis niepewny/alternatywny (?, przecinek, nawias) – decyzja po skanie','tak'])
with open(os.path.join(up,'slownik_nazwisk.csv'),'w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f,delimiter=';');w.writerow(['zapis_w_zrodle','liczba','kanoniczne_propozycja','powod','wymaga_decyzji']);w.writerows(rows)
print(len(rows),'zapisów;',sum(1 for r in rows if r[4]=='tak'),'wymaga decyzji;',len(groups),'grup')
