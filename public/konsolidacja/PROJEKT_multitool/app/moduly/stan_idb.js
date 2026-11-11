/* app/moduly/stan_idb.js – trwały stan roboczy w IndexedDB (PLAN_WDROZENIA §2.2, krok 3).
   Jedna baza `multitool` o stałej nazwie (zmiana danych w repo nie zmienia nazwy ani kluczy; koniec podbijania D.key). Wersja schematu w onupgradeneeded; magazyn `kv` (prototyp) zostaje.
   Magazyny: pola (klucz idAktu|pole), teksty, akty, decyzje, historia (bez limitu 4000), slowniki, skany, kopie (5 migawek), meta.
   S w pamięci ma układ v3 ({acts:{id:{f,done,text,…}}, hist, …}); tu jest tylko rozkład na magazyny i z powrotem. Zapis różnicowy: do bazy idą tylko rekordy, których podpis się zmienił.
   Pole w stanie pamięta wartość bazową (`baza`), którą użytkownik widział; gdy po przebudowie danych baza się zmieni, pole trafia do kolejki „dane źródłowe się zmieniły” (stKolejka) zamiast cicho znikać. */
const ST_NAZWA = 'multitool', ST_WER = 2, ST_SKLADY = ['kv', 'pola', 'teksty', 'akty', 'decyzje', 'historia', 'slowniki', 'skany', 'kopie', 'meta'];
const ST_LICZONE = ['pola', 'teksty', 'akty', 'decyzje'];   // zapisy, które zwiększają licznik „zmian bez kopii”
let ST_DODATKI = [];   // dodatkowe zapisy [magazyn, klucz, wartość] dołączane do następnej transakcji stFlush (np. raport migracji)
let ST_TRYB = 'idb', ST_DBP = null, ST_PODPIS = {}, ST_BAZA = {}, ST_HIST_N = 0, ST_T = null, ST_ZMIANY = 0, ST_OSTATNIA = null, ST_PERSIST = false, ST_BLAD = '', ST_KOLEJ = [];
const ST_UST = ['year', 'cen', 'dec', 'flt', 'hideOk', 'hideDoneActs', 'noroi', 'onlyScan', 'hideMk', 'cur', 'tmode', 'tfs', 'q', 'repIgn', 'typ', 'sporne', 'miniOk', 'xOpen', 'par', 'skObraz', 'skObrazOpen'];
function stOtworz(){ if (ST_DBP) return ST_DBP; ST_DBP = new Promise((ok, no) => { let r; try { r = indexedDB.open(ST_NAZWA, ST_WER); } catch (e) { return no(e); }
  r.onupgradeneeded = () => { ST_SKLADY.forEach(n => { if (!r.result.objectStoreNames.contains(n)) r.result.createObjectStore(n); }); };
  r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); r.onblocked = () => no(new Error('baza zablokowana przez inną kartę')); }); return ST_DBP; }
function stAwaria(e){ ST_TRYB = 'pamiec'; ST_BLAD = String(e && e.message || e || ''); if (typeof stPasek === 'function') stPasek(); }
function stTx(sklady, tryb, fn){ return stOtworz().then(db => new Promise((ok, no) => { const t = db.transaction(sklady, tryb), w = {}; sklady.forEach(n => w[n] = t.objectStore(n)); fn(w); t.oncomplete = () => ok(true); t.onerror = t.onabort = () => no(t.error || new Error('transakcja przerwana')); })); }
function stWszystko(sklad){ return stOtworz().then(db => new Promise((ok, no) => { const o = db.transaction(sklad).objectStore(sklad), K = o.getAllKeys(), V = o.getAll(); V.onsuccess = () => ok(K.result.map((k, i) => [k, V.result[i]])); V.onerror = () => no(V.error); })); }
function stPusty(){ return {decyz: [], acts: {}, cur: null, year: 'all', flt: 'all', hideOk: true, hideDoneActs: true, noroi: false, onlyScan: false, hist: [], histN: 0, fixes: {}, nowe: []}; }
function stBazaWart(a, f){ const ai = a.ai?.[f], lb = a.lub?.[f]; return (ai != null && String(ai).trim() !== '') ? String(ai) : String(lb ?? ai ?? ''); }
// pamięć → rekordy (to samo służy kopii pełnej)
function stRekordy(){ const R = {pola: {}, teksty: {}, akty: {}, decyzje: {}, historia: {}, slowniki: {}, meta: {}};
  for (const id in S.acts) { const a = S.acts[id] || {}, ak = {};
    for (const f in (a.f || {})) { const k = id + '|' + f, x = Object.assign({}, a.f[f]); if (!('baza' in x)) { if (!(k in ST_BAZA) && AM[id]) ST_BAZA[k] = stBazaWart(AM[id], f); if (k in ST_BAZA) x.baza = ST_BAZA[k]; } R.pola[k] = x; }
    if (a.text != null) R.teksty[id] = String(a.text);
    ['done', 'scan', 'roi', 'par', 'hid', 'notesOrg', 'lubAck', 'qs', 'fr'].forEach(p => { if (a[p] !== undefined && !(p === 'done' && !a.done)) ak[p] = a[p]; }); if (Object.keys(ak).length) R.akty[id] = ak; }
  (S.hist || []).forEach(e => R.historia[e.n] = e); (S.decyz || []).forEach(d => R.decyzje[d.n] = d); R.slowniki.fixes = S.fixes || {}; if ((S.nowe || []).length) R.slowniki.noweAkty = S.nowe;
  const u = {}; ST_UST.forEach(k => { if (S[k] !== undefined) u[k] = S[k]; }); R.meta.ustawienia = u; R.meta.seeded = S.seeded || {}; R.meta.histN = S.histN || 0; return R; }
const stPodpis = v => JSON.stringify(v);
async function stFlush(licz){ if (licz === undefined) licz = true; clearTimeout(ST_T); ST_T = null; const R = stRekordy(), zap = [], del = []; let zm = 0;
  for (const sk in R) for (const k in R[sk]) { const p = stPodpis(R[sk][k]), pk = sk + '\u0001' + k; if (ST_PODPIS[pk] !== p) { zap.push([sk, k, R[sk][k], p]); if (licz && (ST_LICZONE.includes(sk) || k === 'noweAkty')) zm++; } }
  for (const pk in ST_PODPIS) { const [sk, k] = pk.split('\u0001'); if (!(k in (R[sk] || {})) && sk !== 'meta' && sk !== 'historia') { del.push([sk, k, pk]); if (licz && (ST_LICZONE.includes(sk) || k === 'noweAkty')) zm++; } }
  if (!zap.length && !del.length && !ST_DODATKI.length) return true;
  const dod = ST_DODATKI.slice();
  const ok = () => { ST_DODATKI.splice(0, dod.length); zap.forEach(([sk, k, v, p]) => ST_PODPIS[sk + '\u0001' + k] = p); del.forEach(([sk, k, pk]) => delete ST_PODPIS[pk]); if (licz && zm) { ST_ZMIANY += zm; if (typeof stWskaznik === 'function') stWskaznik(); } };
  if (ST_TRYB === 'pamiec') { ok(); return false; }
  try { const meta = [['ostatniaKopia', ST_OSTATNIA], ['zmianyBezKopii', ST_ZMIANY + (licz ? zm : 0)]];
    await stTx(['pola', 'teksty', 'akty', 'decyzje', 'historia', 'slowniki', 'meta'], 'readwrite', w => { zap.forEach(([sk, k, v]) => w[sk].put(v, sk === 'historia' || sk === 'decyzje' ? +k : k)); del.forEach(([sk, k]) => w[sk].delete(k)); meta.forEach(([k, v]) => w.meta.put(v, k)); dod.forEach(([sk, k, v]) => w[sk].put(v, k)); });
    ok(); if (!ST_PERSIST && navigator.storage && navigator.storage.persist) { ST_PERSIST = true; try { navigator.storage.persist(); } catch (e) {} } if (licz && typeof kopiaAutoZapis === "function") kopiaAutoZapis(); return true; }
  catch (e) { stAwaria(e); ok(); return false; } }
function stZapisz(){ if (ST_T) return; ST_T = setTimeout(() => { stFlush(true); }, 120); }
async function stWczytaj(){ const s = stPusty();
  try { const [P, T, A, H, Sl, M, Dc] = await Promise.all(['pola', 'teksty', 'akty', 'historia', 'slowniki', 'meta', 'decyzje'].map(stWszystko));
    const st = id => s.acts[id] || (s.acts[id] = {f: {}, done: false});
    P.forEach(([k, x]) => { const i = k.lastIndexOf('|'), id = k.slice(0, i), f = k.slice(i + 1); if ('baza' in x) { ST_BAZA[k] = x.baza; } st(id).f[f] = x; ST_PODPIS['pola\u0001' + k] = stPodpis(x); });
    T.forEach(([id, t]) => { st(id).text = t; ST_PODPIS['teksty\u0001' + id] = stPodpis(t); });
    A.forEach(([id, x]) => { Object.assign(st(id), x); ST_PODPIS['akty\u0001' + id] = stPodpis(x); });
    H.sort((x, y) => x[0] - y[0]).forEach(([n, e]) => { s.hist.push(e); ST_PODPIS['historia\u0001' + n] = stPodpis(e); });
    Dc.sort((x, y) => x[0] - y[0]).forEach(([n, d]) => { s.decyz.push(d); ST_PODPIS['decyzje\u0001' + n] = stPodpis(d); });
    Sl.forEach(([k, v]) => { if (k === 'fixes') { s.fixes = v; ST_PODPIS['slowniki\u0001fixes'] = stPodpis(v); } else if (k === 'noweAkty' && Array.isArray(v)) { s.nowe = v; ST_PODPIS['slowniki\u0001noweAkty'] = stPodpis(v); } });
    M.forEach(([k, v]) => { if (k === 'ustawienia') Object.assign(s, v); else if (k === 'seeded') s.seeded = v; else if (k === 'histN') s.histN = v; else if (k === 'zmianyBezKopii') ST_ZMIANY = v || 0; else if (k === 'ostatniaKopia') ST_OSTATNIA = v; });
    ST_PODPIS['meta\u0001ustawienia'] = null; }
  catch (e) { stAwaria(e); }
  return s; }
// kolejka „dane źródłowe się zmieniły”: pole ze stanu, którego wartość bazowa w danych jest dziś inna niż ta, którą widział użytkownik
function stKolejka(){ ST_KOLEJ = []; for (const k in ST_BAZA) { const i = k.lastIndexOf('|'), id = k.slice(0, i), f = k.slice(i + 1), a = AM[id], x = S.acts[id]?.f?.[f]; if (!a || !x) continue; const teraz = stBazaWart(a, f); if (teraz !== ST_BAZA[k]) ST_KOLEJ.push({id, f, baza: ST_BAZA[k], teraz, v: x.v}); } return ST_KOLEJ; }
function stKolejkaRozstrzygnij(id, f, co){ const k = id + '|' + f; if (co === 'zostaw') ST_BAZA[k] = stBazaWart(AM[id], f); else if (co === 'przyjmij') { delete S.acts[id].f[f]; delete ST_BAZA[k]; } ST_KOLEJ = ST_KOLEJ.filter(x => !(x.id === id && x.f === f)); if (co === 'zostaw') { const x = S.acts[id].f[f]; if (x) x.baza = ST_BAZA[k]; } save(); }
// historia zmian pól (v3: histCommit; tu bez przycinania do 4000 wpisów – magazyn `historia` nie ma limitu)
let HS = null, HIST_WHY = null;
function histCommit(){ if (!HS) return; const cur = histSnap(S.acts), d = histDiff(HS, cur); if (!d.length) return; S.hist = S.hist || []; const t = new Date().toISOString(); d.forEach(e => { e.n = (S.histN = (S.histN || 0) + 1); e.t = t; if (HIST_WHY) e.why = HIST_WHY; S.hist.push(e); }); HS = cur; }
function stStan(){ return {tryb: ST_TRYB, blad: ST_BLAD, zmiany: ST_ZMIANY, ostatniaKopia: ST_OSTATNIA, kolejka: ST_KOLEJ.length}; }
