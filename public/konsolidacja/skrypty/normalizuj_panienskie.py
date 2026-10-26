#!/usr/bin/env python3
"""Normalizacja nazwisk panieńskich zapisanych w starych aktach jako „z <dopełniacz l.mn.>”
(np. 'Zofia z Panków' -> Panek, 'z Brzeskich' -> Brzeska). Zasada: oryginał zostaje w kolumnie *_org,
niepewne formy dostają '?' na końcu. Użycie: python3 normalizuj_panienskie.py [--zapisz]"""
import csv,re,sys,unicodedata,collections,os
up=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def strip(x):return unicodedata.normalize('NFD',x.lower().replace('ł','l')).encode('ascii','ignore').decode()
def rd(f):return list(csv.DictReader(open(os.path.join(up,f),encoding='utf-8-sig'),delimiter=';'))
GEN=re.compile(r'(?:ów|ych|ich)$')
def is_gen(w):return bool(re.match(r'^[A-ZĄĆĘŁŃÓŚŹŻ][\wąćęłńóśźż\-]+$',w)) and bool(GEN.search(w))
# słownik znanych nazwisk (mianownik) z danych – bez kolumn matczynych i bez form „z …”
def build_known():
    cnt=collections.Counter()
    src=[('blinow_akty.csv',['dziecko_nazwisko','ojciec_nazwisko']),('zgony.csv',['nazwisko']),('malzenstwa_mal.csv',['pan_nazwisko','panna_nazwisko','pan_ojciec_nazwisko','panna_ojciec_nazwisko'])]
    for f,cs in src:
        for r in rd(f):
            for c in cs:
                v=(r.get(c) or '').strip()
                if re.match(r'^[A-ZĄĆĘŁŃÓŚŹŻ][\wąćęłńóśźż\-]+$',v) and not GEN.search(v):cnt[v]+=1
    k=collections.defaultdict(collections.Counter)
    for v,n in cnt.items():k[strip(v)][v]+=n
    return {s:c.most_common(1)[0][0] for s,c in k.items()},{s:sum(c.values()) for s,c in k.items()}
KNOWN,KCNT=build_known()
def female(sk):
    return re.sub(r'(ski|cki|dzki|zki)$',lambda m:m.group(1)[:-1]+'a',sk)
def maiden(g):
    """zwraca (forma, pewność) ; pewność: 'tak' | '?'"""
    g=g.strip().rstrip(',.;')
    m=re.match(r'^(.*?)(skich|ckich|dzkich|zkich)$',g)
    if m:
        male=m.group(1)+m.group(2)[:-3]+'i'            # Łapińskich -> Łapiński
        male=KNOWN.get(strip(male),male)
        return female(male),'tak'
    if g.endswith('ych') or g.endswith('ich'):         # inne przymiotnikowe: Czarnych -> Czarna
        return g[:-3]+('a' if g.endswith('ych') else 'a'),'?'
    base=g[:-2]                                         # ...ów
    t1=[base,base+'a',base+'o',base+'e']
    t2=[]
    if g.endswith('ków'):t1+=[g[:-3]+'ek',g[:-3]+'ka'];t2+=[g[:-3]+'ak',g[:-3]+'ik',g[:-3]+'yk']   # t2: poprawki pisowni (Kurczków -> Kurczak)
    if g.endswith('iów'):t1+=[g[:-3],g[:-3]+'ń',g[:-3]+'ź']
    if g.endswith('ów') and base.endswith('i'):t1+=[base[:-1]]
    def look(cs):
        out=[]
        for c in cs:
            k=KNOWN.get(strip(c))
            if k and KCNT[strip(k)]>=5 and k not in out:out.append(k)   # wpisy rzadsze niż 5 nie potwierdzają formy
        return sorted(out,key=lambda x:-KCNT[strip(x)])
    f1=look(t1)
    if f1:
        if len(f1)==1 or KCNT[strip(f1[0])]>=10*KCNT[strip(f1[1])]:return f1[0],'tak'
        return f1[0],'?'
    f2=look(t2)
    if f2:return f2[0],'?'
    guess=(base if g[:-3].endswith(('i','n')) else g[:-3]+'ek') if g.endswith('ków') else base
    return guess+'?','?'
NOM_FN=lambda w:re.sub(r'ę$','a',w)                    # Mariannę -> Marianna
ZPAT=re.compile(r'^(?:(?P<pre>[A-ZĄĆĘŁŃÓŚŹŻ][\wąćęłńóśźż\-]+)\s+)?ze?\s+(?P<g>[A-ZĄĆĘŁŃÓŚŹŻ][\wąćęłńóśźż\-]+)$')
def fix_surname_field(v):
    v=(v or '').strip();m=ZPAT.match(v)
    if not m and is_gen(v) and re.search(r'(ów|skich|ckich|dzkich|zkich)$',v) and KCNT.get(strip(v),0)<5:      # samo dopełniacz bez „z” (np. 'Kurczków') w polu nazwiska matki
        f,ok=maiden(v);return f if ok=='tak' or f.endswith('?') else f+'?'
    if not m or not is_gen(m.group('g')):return None
    f,ok=maiden(m.group('g'));return f if ok=='tak' else (f if f.endswith('?') else f+'?')
def fix_spouse(v):
    m=re.match(r'^(owd\.\s+)?([A-ZĄĆĘŁŃÓŚŹŻ][\wąćęłńóśźż]+)\s+ze?\s+([A-ZĄĆĘŁŃÓŚŹŻ][\wąćęłńóśźż\-]+)$',(v or '').strip())
    if not m or not is_gen(m.group(3)):return None
    f,ok=maiden(m.group(3));return f"{m.group(1) or ''}{NOM_FN(m.group(2))} {f if ok=='tak' or f.endswith('?') else f+'?'}"
RAW=re.compile(r'\bi\s+(?P<im>[A-ZĄĆĘŁŃÓŚŹŻ][\wąćęłńóśźż]+)\s+ze?\s+(?P<g>[A-ZĄĆĘŁŃÓŚŹŻ][\wąćęłńóśźż\-]+)')
def run(zapisz):
    """Zmienia tylko komórki z formą „z …”; nie dodaje kolumn, zachowuje CRLF i resztę pliku. Każda zmiana trafia do logu."""
    rep={};logs={'blinow_akty.csv':[],'blinow_scalone.csv':[],'zgony.csv':[]}
    plan=(('blinow_akty.csv',[('matka_nazwisko',fix_surname_field)],'id'),('blinow_scalone.csv',[('matka_nazwisko',fix_surname_field)],'id'),('zgony.csv',[('matka_nazwisko',fix_surname_field),('zyjacy_malzonek',fix_spouse)],'wiersz_zrodlo'))
    for f,fn,key in plan:
        p=os.path.join(up,f)
        rows=list(csv.DictReader(open(p,encoding='utf-8-sig'),delimiter=';'));cols=list(rows[0].keys())
        n=collections.Counter();samples=[]
        for r in rows:
            for col,fx in fn:
                new=fx(r.get(col,''))
                if new is not None and new!=r[col]:
                    n[col]+=1;samples.append((r[col],new))
                    logs[f].append([r[key],col,r[col],new,'nazwisko panieńskie z „z …” (dopełniacz) -> mianownik'+(' (niepewne)' if new.endswith('?') else '')]);r[col]=new
        rep[f]=(n,samples[:14],len(rows))
        if zapisz:
            with open(p,'w',encoding='utf-8-sig',newline='') as out:
                w=csv.DictWriter(out,fieldnames=cols,delimiter=';',lineterminator='\r\n');w.writeheader();w.writerows(rows)
    if zapisz:
        def app(path,head,rows):
            new=not os.path.exists(path)
            with open(path,'a',encoding='utf-8-sig' if new else 'utf-8',newline='') as o:
                w=csv.writer(o,delimiter=';',lineterminator='\r\n')
                if new:w.writerow(head)
                w.writerows(rows)
        app(os.path.join(up,'zgony_log_zmian.csv'),['wiersz','pole','przed','po','powod'],logs['zgony.csv'])
        app(os.path.join(up,'blinow_log_zmian.csv'),['id','pole','przed','po','powod','plik'],[r+['blinow_akty.csv'] for r in logs['blinow_akty.csv']]+[r+['blinow_scalone.csv'] for r in logs['blinow_scalone.csv']])
    return rep
if __name__=='__main__':
    rep=run('--zapisz' in sys.argv)
    for f,(n,s,t) in rep.items():
        print('##',f,t,'wierszy; zmian:',dict(n))
        for a,b in s:print('   ',a,'->',b)
