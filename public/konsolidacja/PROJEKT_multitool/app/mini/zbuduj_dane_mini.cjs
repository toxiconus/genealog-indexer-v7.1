/* Wyciąga z zbudowanego app/multitool_v1.html aktualne wartości pól każdego aktu (bez parafii obcych) → app/mini/dane_<typ>.json dla Multitool mini.
   Uruchom: node app/mini/zbuduj_dane_mini.cjs [kopia_multitool.json]
   Z kopią pełną Multitoola (Narzędzia → kopia) dane mini zawierają także poprawki z tej kopii (pola już wpisane i zatwierdzone w Multitoolu). */
const {chromium}=require('playwright'), path=require('path'), fs=require('fs');
(async()=>{const b=await chromium.launch(),p=await b.newPage();await p.goto('file://'+path.join(__dirname,'..','multitool_v1.html'));await p.waitForFunction('GOTOWE===true',null,{timeout:90000});
const KOP=process.argv[2]; if(KOP){const o=JSON.parse(fs.readFileSync(KOP,'utf8')); const r=await p.evaluate(async o=>{const w=kopiaWalidacja(o); if(!w.ok) return 'BŁĄD kopii: '+w.blad; await kopiaZastosuj(w,'zastap','mini'); return 'kopia zastosowana'},o); console.log(r); if(/BŁĄD/.test(r)) process.exit(1);}
const typy=await p.evaluate(()=>D.typy);
for(const t of typy){const r=await p.evaluate(t=>{const seen=new Set(),A=[];D.wszystkie.filter(a=>a.typ===t&&!a.parafia).forEach(a=>{const k=String(a.year)+'|'+String(a.act).toLowerCase();if(seen.has(k))return;seen.add(k);const f={},u=[];fieldsOf(a).forEach(x=>{const v=String(getv(a,x.id)??'').trim();if(v){f[x.id]=v;if(isUnc(a,x.id))u.push(x.id)}});A.push({i:a.id,r:+a.year,n:String(a.act),f,u,s:String(scanOf(a)||''),ai:a.ai&&Object.keys(a.ai).length?1:0,ro:a.roi&&typeof a.roi.x==='number'?[a.roi.x,a.roi.y,a.roi.w,a.roi.h]:null,t:String(a.tekst||'').slice(0,4000)})});return A},t);
 fs.writeFileSync(path.join(__dirname,'dane_'+t+'.json'),JSON.stringify(r));console.log(t,r.length,'aktów',Math.round(fs.statSync(path.join(__dirname,'dane_'+t+'.json')).size/1024)+' KB')}
await b.close()})()
