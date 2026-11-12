/* Wyciąga z zbudowanego app/multitool_v1.html aktualne wartości pól każdego aktu (bez parafii obcych) → app/mini/dane_<typ>.json dla Multitool mini.
   Uruchom: node app/mini/zbuduj_dane_mini.cjs */
const {chromium}=require('playwright'), path=require('path'), fs=require('fs');
(async()=>{const b=await chromium.launch(),p=await b.newPage();await p.goto('file://'+path.join(__dirname,'..','multitool_v1.html'));await p.waitForFunction('GOTOWE===true',null,{timeout:90000});
const typy=await p.evaluate(()=>D.typy);
for(const t of typy){const r=await p.evaluate(t=>{const seen=new Set(),A=[];D.wszystkie.filter(a=>a.typ===t&&!a.parafia).forEach(a=>{const k=String(a.year)+'|'+String(a.act).toLowerCase();if(seen.has(k))return;seen.add(k);const f={},u=[];fieldsOf(a).forEach(x=>{const v=String(getv(a,x.id)??'').trim();if(v){f[x.id]=v;if(isUnc(a,x.id))u.push(x.id)}});A.push({i:a.id,r:+a.year,n:String(a.act),f,u,s:String(scanOf(a)||''),ai:a.ai&&Object.keys(a.ai).length?1:0,t:String(a.tekst||'').slice(0,4000)})});return A},t);
 fs.writeFileSync(path.join(__dirname,'dane_'+t+'.json'),JSON.stringify(r));console.log(t,r.length,'aktów',Math.round(fs.statSync(path.join(__dirname,'dane_'+t+'.json')).size/1024)+' KB')}
await b.close()})()
