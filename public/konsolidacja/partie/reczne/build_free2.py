import csv,sys,re
hand_path,lo,hi,out=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),sys.argv[4]
L=[l for l in open('free_rows.tsv',encoding='utf-8').read().split('\n') if l.strip()]
free={}
for line in L:
    p=line.split('\t'); free[int(p[0])]=p[1:]   # A,B,C,D,E,G,H,I,J,K,L,M,N,O
order=[int(l.split('\t')[0]) for l in L]
batch=[r for r in order if lo<=r<=hi] if lo else None
hand={}
for line in open(hand_path,encoding='utf-8'):
    line=line.rstrip('\n')
    if not line.strip(): continue
    if ' | ' in line:
        parts=[x.strip() for x in line.split(' | ')]
        wr=int(parts[0]); d={}
        for kv in parts[1:]:
            k,_,v=kv.partition('='); d[k.strip()]=v.strip()
    else:
        p=line.split('|')+['']*8
        wr=int(p[0]); d={'ojc':p[1].strip(),'mat':p[2].strip(),'nazw':p[3].strip(),'ojcw':p[4].strip(),'matw':p[5].strip(),'miejsc':p[6].strip(),'fl':'|'.join(p[7:]).strip('| ')}
    assert wr not in hand, ('dup', wr)
    hand[wr]=d
if batch is not None:
    miss=[r for r in batch if r not in hand]; extra=[r for r in hand if r not in batch]
    assert not miss and not extra, ('coverage', miss[:5], extra[:5], len(miss), len(extra))
rows=[]
for wr in sorted(hand):
    A,B,C,D,E,G,H,I,J,K,Lc,M,N,O=free[wr]
    d=hand[wr]; flags=[]
    if d.get('fl'): flags.append(d['fl'])
    nr=D.strip()
    if nr=='0': flags.append('bez numeru w księdze (nr 0)')
    oi=d.get('ojc',''); mi=d.get('mat',''); mn=d.get('nazw','')
    ow_s=(I.strip() if I.strip().isdigit() else d.get('ojcw',''))
    mw_s=(N.strip() if N.strip().isdigit() else d.get('matw',''))
    ow=int(ow_s) if ow_s.isdigit() else None
    mw=int(mw_s) if mw_s.isdigit() else None
    ojc_rok=f"~{int(E)-ow}" if ow is not None else ''
    mat_rok=f"~{int(E)-mw}" if mw is not None else ''
    miejsc=d.get('miejsc','') or K.strip() or (J.strip() if J.strip() and not J.startswith('około') else '')
    uw=[]
    if G.strip(): uw.append(f"kol.G: {G}")
    if J.strip() and not J.startswith('około') and J.strip()!=miejsc: uw.append(f"kol.J: {J}")
    if J.startswith('około'): uw.append(f"kol.J: {J}")
    if O.strip(): uw.append(f"kol.O: {O}")
    if Lc.strip() or M.strip(): uw.append(f"kol.L: {Lc}; kol.M: {M}".strip('; '))
    if N.strip() and not N.strip().isdigit(): uw.append(f"kol.N: {N}")
    if not oi and not mi and not mn and not d.get('fl',''): flags.append('brak rodziców w G')
    if oi and not H.strip(): flags.append('brak nazwiska ojca (kol. H pusta)')
    if not oi and H.strip() and 'brak imienia ojca' not in flags and not any('w G tylko' in f for f in flags): flags.append('brak imienia ojca')
    if any('?' in x for x in [oi,mi,mn]): flags.append("znak '?' w imieniu/nazwisku rodzica")
    rows.append([A,wr,'akt',E,'' if nr=='0' else nr,B,C,'','',oi,H.strip(),ow_s if ow is not None else '',ojc_rok,
                 miejsc,mi,mn,mw_s if mw is not None else '',mat_rok,'','; '.join(uw),'; '.join(flags)])
hdr="id_archiwalne;wiersz_zrodlo;typ_wpisu;rok;nr;nazwisko_dziecka;imie_dziecka;data_tekst;data_iso;ojciec_imie;ojciec_nazwisko;ojciec_wiek;ojciec_rok_ur_przyb;miejscowosc;matka_imie;matka_nazwisko;matka_wiek;matka_rok_ur_przyb;karta_nr;uwagi_surowe;flagi".split(';')
assert all(len(r)==len(hdr) for r in rows)
with open(out,'w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f,delimiter=';'); w.writerow(hdr); w.writerows(rows)
print(out.split('/')[-1], len(rows), 'flagged', sum(1 for r in rows if r[-1]), 'rows', rows[0][1], '-', rows[-1][1])
