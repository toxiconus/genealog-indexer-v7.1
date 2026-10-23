import zipfile, sys
from lxml import etree
NS={'table':'urn:oasis:names:tc:opendocument:xmlns:table:1.0','text':'urn:oasis:names:tc:opendocument:xmlns:text:1.0','office':'urn:oasis:names:tc:opendocument:xmlns:office:1.0'}
T='{%s}'%NS['table']; O='{%s}'%NS['office']; X='{%s}'%NS['text']
def col(i):
    s=''
    i+=1
    while i: i,r=divmod(i-1,26); s=chr(65+r)+s
    return s
def load(path, sheet):
    z=zipfile.ZipFile(path); root=etree.fromstring(z.read('content.xml'))
    for t in root.iter(T+'table'):
        if t.get(T+'name')!=sheet: continue
        rows=[]; r=0
        for row in t.iter(T+'table-row'):
            rep=int(row.get(T+'number-rows-repeated','1'))
            cells=[]; c=0
            for cell in row:
                if cell.tag not in (T+'table-cell',T+'covered-table-cell'): continue
                crep=int(cell.get(T+'number-columns-repeated','1'))
                txt='\n'.join(''.join(p.itertext()) for p in cell.findall(X+'p'))
                f=cell.get(T+'formula')
                for _ in range(min(crep,200)):
                    cells.append((col(c),txt,f)); c+=1
            for _ in range(min(rep,1)):
                rows.append((r+1,cells))
            r+=rep
        return rows
if __name__=='__main__':
    rows=load(sys.argv[1],sys.argv[2])
    a,b=int(sys.argv[3]),int(sys.argv[4])
    for rn,cells in rows:
        if a<=rn<=b:
            vals=[f'{c}={t}' for c,t,f in cells if t]
            print(rn,' | '.join(vals)[:700])
