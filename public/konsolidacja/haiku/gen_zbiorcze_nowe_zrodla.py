# Dopisuje do BLINOW_spisy_1701-1799_vs_akty_ZBIORCZE.csv kolumny dla nowych źródeł (liczba wierszy z danym nazwiskiem)
import csv,re,unicodedata,sys
def norm(s):
    s=s.lower().replace('ł','l')
    s=''.join(c for c in unicodedata.normalize('NFD',s) if unicodedata.category(c)!='Mn')
    return re.sub(r'[^a-z ]',' ',s)
ALIAS={'pcion':['pcion','mcion'],'wcislo':['wcislo','wscislo'],'brzozek':['brzozek','brozek','brzoza'],'kosidlo':['kosidlo','kosik','kosilik'],
'gretka':['gretka','greta'],'samuel':['samuel','samulik','samul '],'kudrelek':['kudrelek','kudrelik','kudrelak','kudrel '],'wstepnik':['wstepnik','wstepien','stepnik'],
'zoltan':['zoltan','zolton'],'kisiel':['kisiel'],'kozaczek':['kozaczek']}
SRC={ # etykieta: (plik, funkcja wyciągająca tekst osadnika z wiersza)
'1658':('BLINOW_inwentarz_1658_71-1.1-4_poddani_odczyt_reczny.csv',lambda r:r.get('osadnik','')),
'1705':('BLINOW_inwentarz_1705_202_poddani_odczyt_reczny.csv',lambda r:r.get('osadnik','')),
'1719':('BLINOW_rewizja_1719_1343_odczyt_reczny.csv',lambda r:r.get('osadnik','')+' '+r.get('uwagi','')),
'1741':('BLINOW_rewizja_1741_1351_odczyt_reczny.csv',lambda r:r.get('osadnik','')+' '+r.get('uwagi','')),
'1752':('BLINOW_rewizja_1752_1354_odczyt_reczny.csv',lambda r:r.get('osadnik','')),
'1846':('BLINOW_tabella_1846_2695_odczyt_reczny.csv',lambda r:r.get('nazwisko','')+' '+r.get('imie','')),
'1865':('BLINOW_tabela_likwidacyjna_1865_3015_odczyt_reczny.csv',lambda r:r.get('osadnik_1865','')),
'1872':('BLINOW_materialy_lesne_1872_3557_odczyt_reczny.csv',lambda r:r.get('nazwisko_imie','')),
}
base=list(csv.reader(open('BLINOW_spisy_1701-1799_vs_akty_ZBIORCZE.csv',encoding='utf-8-sig'),delimiter=';'))
hdr=[h for h in base[0] if not h.startswith('nowe_')]
keep=len(hdr); rows=[r[:keep] for r in base[1:]]
cnt={k:{} for k in SRC}
for k,(fn,fx) in SRC.items():
    for r in csv.DictReader(open(fn,encoding='utf-8-sig'),delimiter=';'):
        t=' '+norm(fx(r))+' '
        for fam in rows:
            st=fam[0]; keys=ALIAS.get(st,[st])
            if any((' '+a.strip()) in t or a in t for a in keys if len(a.strip())>=4):
                cnt[k][st]=cnt[k].get(st,0)+1
out=[hdr+['nowe_'+k for k in SRC]]
for r in rows: out.append(r+[str(cnt[k].get(r[0],0)) for k in SRC])
csv.writer(open('BLINOW_spisy_1701-1799_vs_akty_ZBIORCZE.csv','w',encoding='utf-8-sig',newline=''),delimiter=';').writerows(out)
print(len(rows),{k:sum(v.values()) for k,v in cnt.items()})
