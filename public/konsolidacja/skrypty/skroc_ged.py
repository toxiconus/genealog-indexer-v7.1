import re,sys
src,out=sys.argv[1],sys.argv[2]
L=open(src,encoding='utf-8').read().split('\n')
lg=[]
for l in L:
    m=re.match(r'(\d+) CONC (.*)$',l)
    if m and lg: lg[-1]+=m.group(2)
    else: lg.append(l)
R=[
 (r'HIPOTEZY/UWAGI: brak w indeksach Blinów/Lubgens; możliwe urodzenie/zgon poza parafią lub w nieindeksowanych latach \(np\. Blinów 1797-1825\)\.?','HIPOTEZY: brak w indeksach; szukać poza parafią lub w latach 1797-1825.'),
 (r'Treść aktu zgonu \(odczyt, polski\): ','Akt (PL): '),
 (r'Treść wpisu \(odczyt, polski\): ','Wpis (PL): '),
 (r'Działo się we wsi (?:Blinowie|Blinów|Blinowa)[,]? dnia ','Blinów, '),
 (r',? (?:obaj|oboje) (?:rolnicy|chłopi|robotnicy)[^,.;]{0,40}?(?:zamieszkali|zamieszkały)(?: w [A-ZŁŚŻ][a-ząęółśżźćń]+)? i oświadczyli,? że ','. Zgon: '),
 (r'(?: – zgłosili: | i oświadczyli,? że )','. Zgon: '),
 (r' roku bieżącego',''),
 (r'Po przekonaniu się naocznie o śmierci [^.…]{0,90}[….;]',''),
 (r'Akt ten (?:stawającym |niepiśmiennym )[^.]{0,60}(?:podpisany został|podpisan\w+)\.? ?',''),
 (r'Po przekonaniu się naocznie o śmierci [^.;]{0,80}[.;] Akt ten [^.]{0,60}przeczytany, przez (?:czas|Nas tylko|nas tylko) podpisany został\.? ?[—-]? ?',''),
 (r' ?Po przekonaniu się naocznie o śmierci .{0,160}?podpisany został\.?',''),
 (r'Stawili się: ','Zgłaszający: '),
]
n=0;saved=0
res=[]
for l in lg:
    if len(l)>200 and l.startswith(('1 NOTE','2 CONC')) or l.startswith('1 NOTE [Claude'):
        o=l
        for p,r in R: l=re.sub(p,r,l)
        saved+=len(o)-len(l); n+=(o!=l)
    res.append(l)
final=[]; longn=0
for l in res:
    if len(l)>255:
        m=re.match(r'(\d+) (\S+) ?(.*)$',l,re.S); lvl=int(m.group(1)); tag=m.group(2); val=m.group(3)
        first=f'{lvl} {tag} '; chunk=255-len(first)
        final.append(first+val[:chunk]); val=val[chunk:]
        while val: final.append(f'{lvl+1} CONC '+val[:240]); val=val[240:]
        longn+=1
    else: final.append(l)
open(out,'w',encoding='utf-8').write('\n'.join(final))
print('zmienione',n,'zaoszczedzone znakow',saved,'nadal dluzsze niz 255:',longn)
