import re,json,csv,sys
sys.path.insert(0,'.')
import importlib.util
src=open('gen_zbiorcze_nowe_zrodla.py').read().split("base=list")[0]
exec(src)
html=open('SPISY_BLINOW_weryfikacja_mini.html',encoding='utf-8').read()
m=re.search(r'const D=(\{.*?\});\n',html,re.S) or re.search(r'const D=(\{.*?\});',html,re.S)
D=json.loads(m.group(1))
fams=[r[0] for r in list(csv.reader(open('BLINOW_spisy_1701-1799_vs_akty_ZBIORCZE.csv',encoding='utf-8-sig'),delimiter=';'))[1:]]
have={r[0] for r in D['spisy']}
print('lata w module:',sorted(have))
LAB={'1658':'1658 oryg.','1705':'1705','1719':'1719','1741':'1741','1752':'1752','1846':'1846','1865':'1865','1872':'1872'}
def fam(t):
    n=' '+norm(t)+' '
    for f in fams:
        for a in ALIAS.get(f,[f]):
            if len(a.strip())>=4 and a in n: return f
    w=norm(t).split()
    return (w[-1] if w else '')
add=0
for k,(fn,fx) in SRC.items():
    if LAB[k] in have: continue
    for r in csv.DictReader(open(fn,encoding='utf-8-sig'),delimiter=';'):
        t=fx(r)
        if not t.strip(): continue
        os_=r.get('osiadlosc_dawna') or r.get('osiadlosc') or ''
        D['spisy'].append([LAB[k],os_,(r.get('osadnik') or t).strip()[:80],r.get('tryb',''),(r.get('uwagi','') or '')[:60],fam(r.get('osadnik') or t)]);add+=1
print('dodano',add)
new='const D='+json.dumps(D,ensure_ascii=False,separators=(',',':'))+';'
html=html[:m.start()]+new+html[m.end():]
open('SPISY_BLINOW_weryfikacja_mini.html','w',encoding='utf-8').write(html)
