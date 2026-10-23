import json,csv,re,sys
SRC="/home/claude/genealog-indexer-v7.1/public/CH BLIN.txt"
OUT="/home/claude/genealog-indexer-v7.1/public/konsolidacja/"
lines=open(SRC,encoding="utf-8").read().split("\n")
hdr=lines[0].split("\t")
# mapowanie wg nagłówków z viewera (indeks kolumny -> pole)
POLA={0:"id",1:"rok",2:"nr",3:"dziecko_nazwisko",4:"dziecko_imiona",5:"miejscowosc",
      6:"ojciec_imiona",7:"ojciec_nazwisko",8:"ojciec_wiek",9:"matka_imiona",10:"matka_nazwisko",
      11:"matka_wiek",12:"uwagi",13:"uwagi_org"}
DUP_START,DUP_END=6002,6089   # kopia bloku 5900-5987 (potwierdzone)
ID_RE=re.compile(r"^CH\.LUB\.BLIN\.\d{4}\.\d{3}[a-z]?$")
akty=[];karty=[];problemy=[]
seen={}          # id -> lista wierszy
for n,l in enumerate(lines[1:],2):
    if not l.strip(): continue
    r=l.split("\t")+[""]*27
    if DUP_START<=n<=DUP_END:
        problemy.append((n,"-","kopia bloku 5900-5987 (usunięta)")); continue
    rec={POLA[i]:r[i].strip() for i in POLA}
    rec["linia"]=n
    rec["ojciec_nazwisko"]=rec["ojciec_nazwisko"]
    if "nr karty" in (r[13] if len(r)>13 else "") and not rec["dziecko_nazwisko"]:
        karty.append(rec); problemy.append((n,rec["id"],"wiersz z 'nr karty', bez nazwiska dziecka")); continue
    if "nr karty" in (r[13] if len(r)>13 else ""):
        karty.append(rec); problemy.append((n,rec["id"],"wiersz 'nr karty' (z nazwiskiem) -> tylko w pliku kart")); continue
    if "liber" in rec["id"] or rec["nr"]=="liber":
        karty.append(rec); problemy.append((n,rec["id"],"wiersz 'liber' (nie akt; data 30.12.1899 to prawdopodobnie błąd arkusza) -> osobno")); continue
    akty.append(rec)
# unikalność ID; identyczne wiersze usuwamy, różne z tym samym ID dostają #k
out=[];byid={}
for rec in akty:
    key=rec["id"]
    if not key:
        problemy.append((rec["linia"],"-","brak ID")); out.append(rec); continue
    content=tuple((k,v) for k,v in rec.items() if k!="linia")
    if key in byid:
        prev=byid[key]
        if prev==content:
            problemy.append((rec["linia"],key,"identyczny wiersz już istnieje (usunięty)")); continue
        k=2
        while f"{key}#{k}" in byid: k+=1
        rec["id_oryg"]=key; rec["id"]=f"{key}#{k}"
        problemy.append((rec["linia"],key,f"ID powtórzony z innymi danymi -> {rec['id']}"))
        byid[rec["id"]]=content
    else:
        byid[key]=content
    out.append(rec)
# proste kontrole
for rec in out:
    if rec["id"].startswith("CH") and not rec["dziecko_nazwisko"] and rec.get("id_oryg","")=="":
        problemy.append((rec["linia"],rec["id"],"brak nazwiska dziecka"))
    if "`" in " ".join(str(v) for v in rec.values()):
        problemy.append((rec["linia"],rec["id"],"znak ` w polu"))
    if rec["dziecko_nazwisko"][:1].islower():
        problemy.append((rec["linia"],rec["id"],f"nazwisko z małej litery: {rec['dziecko_nazwisko']}"))
json.dump(out,open(OUT+"blinow_akty.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)
cols=list(POLA.values())+["linia","id_oryg"]
with open(OUT+"blinow_akty.csv","w",encoding="utf-8-sig",newline="") as f:
    w=csv.DictWriter(f,fieldnames=cols,delimiter=";",extrasaction="ignore"); w.writeheader(); w.writerows(out)
with open(OUT+"blinow_karty_nr.csv","w",encoding="utf-8-sig",newline="") as f:
    w=csv.DictWriter(f,fieldnames=cols,delimiter=";",extrasaction="ignore"); w.writeheader(); w.writerows(karty)
with open(OUT+"blinow_problemy.csv","w",encoding="utf-8-sig",newline="") as f:
    w=csv.writer(f,delimiter=";"); w.writerow(["linia","id","problem"]); w.writerows(problemy)
from collections import Counter
print("linii w pliku:",len(lines)-1,"niepustych:",sum(1 for l in lines[1:] if l.strip()))
print("akty po scaleniu:",len(out))
print("wiersze poza aktami (karty/liber):",len(karty))
print("problemy:",len(problemy), Counter(p[2].split(' (')[0].split(' ->')[0][:40] for p in problemy).most_common(8))
