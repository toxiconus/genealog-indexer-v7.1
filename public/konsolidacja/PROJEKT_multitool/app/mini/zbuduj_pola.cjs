/* Generuje app/mini/pola_typow.json (pola i grupy formularza z konfiguracji Multitoola) dla wersji mini. Uruchom: node app/mini/zbuduj_pola.cjs (wymaga zbudowanego app/multitool_v1.html) */
const {chromium}=require('playwright'), path=require('path'), fs=require('fs');
(async()=>{const b=await chromium.launch(),p=await b.newPage();await p.goto('file://'+path.join(__dirname,'..','multitool_v1.html'));await p.waitForFunction('GOTOWE===true',null,{timeout:60000});
const r=await p.evaluate(()=>{const o={},N={zgon:'Zgon',malzenstwo:'Małżeństwo',chrzest:'Chrzest'};for(const t of D.typy){const T=TYPY[t],lab={};(t==='zgon'?FIELDS:T.pola).forEach(f=>lab[f.id]=f.label);D.wszystkie.filter(x=>x.typ===t&&!x.parafia).slice(0,400).forEach(a=>fieldsOf(a).forEach(f=>{if(!lab[f.id])lab[f.id]=f.label}));
 o[t]={nazwa:N[t]||t,bloki:T.bloki.map(g=>({t:g.t,pola:g.pola.map(id=>({id,label:lab[id]||id}))}))};}return o});
fs.writeFileSync(path.join(__dirname,'pola_typow.json'),JSON.stringify(r,null,1));console.log(Object.entries(r).map(([k,v])=>k+': '+v.bloki.reduce((s,g)=>s+g.pola.length,0)+' pól').join(', '));await b.close()})()
