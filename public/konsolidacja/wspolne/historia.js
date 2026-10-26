/* wspolne/historia.js – wspólna historia zmian z możliwością cofnięcia (czyste funkcje, bez DOM).
   Stan: acts = { idAktu: { f:{pole:{...}}, text, done, qs:{klucz:'skip'} } }. Migawka → różnice → wpisy {id,k,f,before,after}. */
function histSnap(acts){ const o = {}; for (const id in acts) { const a = acts[id] || {}; for (const f in (a.f || {})) o[id + '|f|' + f] = JSON.stringify(a.f[f]); if (a.text != null) o[id + '|text'] = String(a.text); if (a.done) o[id + '|done'] = '1'; for (const k in (a.qs || {})) o[id + '|q|' + k] = String(a.qs[k]); } return o; }
function histDiff(prev, cur){ const out = [], keys = new Set([...Object.keys(prev), ...Object.keys(cur)]); keys.forEach(k => { if (prev[k] !== cur[k]) { const p = k.split('|'); out.push({id:p[0], k:p[1], f:p.slice(2).join('|'), before:prev[k] ?? null, after:cur[k] ?? null}); } }); return out; }
// cofnięcie wpisu: przywraca stan „przed” w acts
function histApply(acts, e){ const a = acts[e.id] = acts[e.id] || {f:{}, done:false}; a.f = a.f || {};
  if (e.k === 'f') { if (e.before == null) delete a.f[e.f]; else a.f[e.f] = JSON.parse(e.before); }
  else if (e.k === 'text') { if (e.before == null) delete a.text; else a.text = e.before; }
  else if (e.k === 'done') a.done = e.before != null;
  else if (e.k === 'q') { a.qs = a.qs || {}; if (e.before == null) delete a.qs[e.f]; else a.qs[e.f] = e.before; } }
function histCsv(list){ return ['nr;czas;akt;rodzaj;pole;przed;po;powod'].concat(list.map(e => [e.n, e.t, e.id, e.k, e.f, e.before ?? '', e.after ?? '', e.why || ''].map(csvCell).join(';'))).join('\r\n') + '\r\n'; }
