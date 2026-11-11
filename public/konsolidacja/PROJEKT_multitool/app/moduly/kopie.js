/* app/moduly/kopie.js – kopie bezpieczeństwa i import kopii (PLAN_WDROZENIA §2.3–2.4, krok 3).
   Pełna kopia = jeden JSON {format:{nazwa:'multitool-kopia', wersja}, dane:{wersja, suma}, zapisano, pola, teksty, akty, decyzje, historia, slowniki, ustawienia}.
   Wskaźnik „zmian bez kopii” zeruje tylko pełna kopia (CSV nie zawiera historii ani decyzji). Import: rozpoznanie → walidacja schematu (biała lista kluczy) → podgląd różnic → migawka → zapis.
   Wartości z pliku są tekstem; nigdy nie trafiają do innerHTML bez esc(). Żadnego Object.assign na surowym pliku. */
const KOP_NAZWA = 'multitool-kopia', KOP_WER = 1, KOP_MAX = 5, KOP_PRZYP_ZMIAN = 20, KOP_PRZYP_DNI = 7;
const KOP_MIGRACJE = {};   // KOP_MIGRACJE[n] = obj => obj w wersji n+1 (gdy format zmieni wersję)
let KOP_AUTO = null;
const KOP_ZAKAZ = new Set(['__proto__', 'constructor', 'prototype']);
function kopiaPelna(){ const R = stRekordy(); return {format: {nazwa: KOP_NAZWA, wersja: KOP_WER}, dane: {wersja: (typeof DANE !== 'undefined' && DANE.format && DANE.format.wersja) || 1, suma: (typeof DANE !== 'undefined' && DANE.suma) || ''},
  zapisano: new Date().toISOString(), pola: R.pola, teksty: R.teksty, akty: R.akty, decyzje: [], historia: S.hist || [], slowniki: R.slowniki, ustawienia: Object.assign({}, R.meta.ustawienia, {seeded: R.meta.seeded, histN: R.meta.histN})}; }
async function kopiaMigawka(powod){ const k = kopiaPelna(); k.powod = powod || ''; const klucz = k.zapisano;
  if (ST_TRYB === 'pamiec') { (kopiaMigawka.pamiec = kopiaMigawka.pamiec || []).push([klucz, k]); kopiaMigawka.pamiec = kopiaMigawka.pamiec.slice(-KOP_MAX); return klucz; }
  try { await stTx(['kopie'], 'readwrite', w => w.kopie.put(k, klucz)); const L = await stWszystko('kopie'); L.sort((a, b) => a[0] < b[0] ? -1 : 1); const nadmiar = L.slice(0, Math.max(0, L.length - KOP_MAX)); if (nadmiar.length) await stTx(['kopie'], 'readwrite', w => nadmiar.forEach(([kk]) => w.kopie.delete(kk))); }
  catch (e) { stAwaria(e); }
  return klucz; }
async function kopiaLista(){ if (ST_TRYB === 'pamiec') return (kopiaMigawka.pamiec || []).map(([k, v]) => ({klucz: k, powod: v.powod, pol: Object.keys(v.pola).length})).reverse();
  try { const L = await stWszystko('kopie'); return L.sort((a, b) => a[0] < b[0] ? 1 : -1).map(([k, v]) => ({klucz: k, powod: v.powod || '', pol: Object.keys(v.pola || {}).length})); } catch (e) { stAwaria(e); return []; } }
async function kopiaZMigawki(klucz){ if (ST_TRYB === 'pamiec') { const x = (kopiaMigawka.pamiec || []).find(a => a[0] === klucz); return x && x[1]; } const L = await stWszystko('kopie'); const x = L.find(a => a[0] === klucz); return x && x[1]; }
const KOP_OK_SRC = new Set(['csv', 'txt', 'ai', 'lub', 'bz', 'akt', 'edit', 'auto']);
const kopStr = (v, max) => typeof v === 'string' && v.length <= (max || 20000);
function kopPole(x){ if (!x || typeof x !== 'object' || Array.isArray(x)) return null; if (!kopStr(x.v, 5000)) return null; const o = {v: x.v}; if (x.src !== undefined) { if (!KOP_OK_SRC.has(x.src)) return null; o.src = x.src; }
  for (const b of ['ok', 'unc', 'skip']) if (x[b] !== undefined) { if (typeof x[b] !== 'boolean') return null; o[b] = x[b]; } if (x.note !== undefined) { if (!kopStr(x.note, 5000)) return null; o.note = x.note; } if (x.baza !== undefined) { if (!kopStr(x.baza, 5000)) return null; o.baza = x.baza; } return o; }
function kopAkt(x){ if (!x || typeof x !== 'object' || Array.isArray(x)) return null; const o = {};
  if (x.done !== undefined) { if (typeof x.done !== 'boolean') return null; o.done = x.done; } if (x.lubAck !== undefined) { if (typeof x.lubAck !== 'boolean') return null; o.lubAck = x.lubAck; }
  for (const k of ['scan', 'notesOrg']) if (x[k] !== undefined) { if (!kopStr(x[k], 5000)) return null; o[k] = x[k]; }
  if (x.roi !== undefined && x.roi !== null) { const r = x.roi; if (typeof r !== 'object' || !['x', 'y', 'w', 'h'].every(k => typeof r[k] === 'number' && isFinite(r[k]))) return null; o.roi = {x: r.x, y: r.y, w: r.w, h: r.h}; }
  if (x.par !== undefined) { if (!x.par || typeof x.par !== 'object') return null; o.par = {}; ['father', 'mother'].forEach(k => { if (x.par[k]) o.par[k] = 1; }); }
  if (x.hid !== undefined) { if (!x.hid || typeof x.hid !== 'object' || (x.hid.death_time !== undefined && !kopStr(x.hid.death_time, 50))) return null; o.hid = x.hid.death_time !== undefined ? {death_time: x.hid.death_time} : {}; }
  if (x.qs !== undefined) { if (!x.qs || typeof x.qs !== 'object') return null; o.qs = {}; for (const k in x.qs) { if (KOP_ZAKAZ.has(k) || !kopStr(x.qs[k], 50)) return null; o.qs[k] = x.qs[k]; } }
  return o; }
function kopHist(e){ if (!e || typeof e !== 'object') return null; if (!Number.isInteger(e.n) || !kopStr(e.t, 40) || !kopStr(e.id, 80) || !['f', 'text', 'done', 'q'].includes(e.k) || !kopStr(e.f, 200)) return null;
  for (const k of ['before', 'after']) if (e[k] !== null && e[k] !== undefined && !kopStr(e[k], 20000)) return null; const o = {n: e.n, t: e.t, id: e.id, k: e.k, f: e.f, before: e.before ?? null, after: e.after ?? null}; if (e.why !== undefined) { if (!kopStr(e.why, 1000)) return null; o.why = e.why; } return o; }
// walidacja: zwraca {ok, blad, bledy[], czysty:{pola,teksty,akty,historia,fixes,ust}, roznice}
function kopiaWalidacja(obj){ const r = {ok: false, blad: '', bledy: [], czysty: null, roznice: null};
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) { r.blad = 'To nie jest plik kopii Multitool (oczekiwany obiekt JSON).'; return r; }
  const f = obj.format; if (!f || f.nazwa !== KOP_NAZWA) { r.blad = 'Nieznany format pliku' + (f && f.nazwa ? ' („' + String(f.nazwa).slice(0, 40) + '”)' : '') + ': oczekiwano ' + KOP_NAZWA + '.'; return r; }
  if (!Number.isInteger(f.wersja) || f.wersja < 1) { r.blad = 'Brak numeru wersji formatu kopii.'; return r; } if (f.wersja > KOP_WER) { r.blad = 'Kopia jest w nowszej wersji formatu (' + f.wersja + ') niż ta aplikacja (' + KOP_WER + '). Zaktualizuj aplikację.'; return r; }
  while (obj.format.wersja < KOP_WER) { const m = KOP_MIGRACJE[obj.format.wersja]; if (!m) { r.blad = 'Brak migracji kopii z wersji ' + obj.format.wersja + '.'; return r; } obj = m(obj); }
  const C = {pola: {}, teksty: {}, akty: {}, historia: [], fixes: {}, ust: {}}, B = r.bledy, bl = (t, k) => { if (B.length < 200) B.push(t + ': ' + String(k).slice(0, 80)); };
  const pl = obj.pola && typeof obj.pola === 'object' ? obj.pola : {}; for (const k in pl) { const i = k.lastIndexOf('|'), id = k.slice(0, i), fl = k.slice(i + 1); if (i < 1 || KOP_ZAKAZ.has(id) || !AM[id] || !/^[a-z_0-9]{1,40}$/.test(fl) || KOP_ZAKAZ.has(fl)) { bl('pole poza danymi', k); continue; } const p = kopPole(pl[k]); if (!p) { bl('błędne pole', k); continue; } C.pola[k] = p; }
  const tk = obj.teksty && typeof obj.teksty === 'object' ? obj.teksty : {}; for (const id in tk) { if (KOP_ZAKAZ.has(id) || !AM[id] || !kopStr(tk[id], 50000)) { bl('błędny tekst', id); continue; } C.teksty[id] = tk[id]; }
  const ak = obj.akty && typeof obj.akty === 'object' ? obj.akty : {}; for (const id in ak) { if (KOP_ZAKAZ.has(id) || !AM[id]) { bl('akt poza danymi', id); continue; } const x = kopAkt(ak[id]); if (!x) { bl('błędny stan aktu', id); continue; } C.akty[id] = x; }
  (Array.isArray(obj.historia) ? obj.historia : []).forEach((e, i) => { const x = kopHist(e); if (x && (AM[x.id])) C.historia.push(x); else bl('błędny wpis historii', i); });
  const fx = obj.slowniki && obj.slowniki.fixes; if (fx && typeof fx === 'object') for (const a in fx) { if (KOP_ZAKAZ.has(a) || !fx[a] || typeof fx[a] !== 'object') { bl('słownik', a); continue; } const o = {}; for (const b in fx[a]) { if (KOP_ZAKAZ.has(b) || !Number.isFinite(fx[a][b])) { bl('słownik', a + '→' + b); continue; } o[b] = fx[a][b]; } C.fixes[a] = o; }
  const u = obj.ustawienia && typeof obj.ustawienia === 'object' ? obj.ustawienia : {}; ['year', 'cen', 'dec', 'flt', 'cur', 'tmode', 'q'].forEach(k => { if (u[k] === null || kopStr(u[k], 200)) C.ust[k] = u[k]; }); ['hideOk', 'hideDoneActs', 'noroi', 'onlyScan', 'hideMk'].forEach(k => { if (typeof u[k] === 'boolean') C.ust[k] = u[k]; });
  if (u.seeded && typeof u.seeded === 'object') { C.ust.seeded = {}; for (const id in u.seeded) if (AM[id]) C.ust.seeded[id] = 1; } if (Number.isInteger(u.histN)) C.ust.histN = u.histN;
  // różnice względem bieżącego stanu
  let nowe = 0, takie = 0, konflikt = 0, nadpisz = 0; for (const k in C.pola) { const i = k.lastIndexOf('|'), cur = S.acts[k.slice(0, i)]?.f?.[k.slice(i + 1)]; if (!cur) nowe++; else if (cur.v === C.pola[k].v) takie++; else if (cur.ok) konflikt++; else nadpisz++; }
  r.roznice = {pola: Object.keys(C.pola).length, nowe, takie, konfliktyZOk: konflikt, nadpisane: nadpisz, teksty: Object.keys(C.teksty).length, akty: Object.keys(C.akty).length, zatwierdzone: Object.values(C.akty).filter(a => a.done).length, historia: C.historia.length};
  r.czysty = C; r.ok = true; return r; }
// zastosowanie: 'dopisz' (domyślnie; nie rusza pól ok) albo 'zastap' (stan = kopia). Migawka obecnego stanu zawsze przed zapisem.
async function kopiaZastosuj(w, tryb, nazwa){ if (!w || !w.ok) return false; await kopiaMigawka('przed importem kopii' + (nazwa ? ': ' + nazwa : '')); const C = w.czysty; tryb = tryb === 'zastap' ? 'zastap' : 'dopisz';
  const stan = id => S.acts[id] || (S.acts[id] = {f: {}, done: false}); HIST_WHY = 'import kopii' + (nazwa ? ': ' + nazwa : '') + ' (' + tryb + ')';
  if (tryb === 'zastap') { S.acts = {}; S.hist = []; S.histN = 0; S.fixes = {}; }
  for (const k in C.pola) { const i = k.lastIndexOf('|'), id = k.slice(0, i), f = k.slice(i + 1), cur = S.acts[id]?.f?.[f]; if (tryb === 'dopisz' && cur && (cur.ok || cur.v === C.pola[k].v)) continue; stan(id).f[f] = C.pola[k]; if ('baza' in C.pola[k]) ST_BAZA[k] = C.pola[k].baza; }
  for (const id in C.teksty) { if (tryb === 'dopisz' && S.acts[id]?.text != null) continue; stan(id).text = C.teksty[id]; }
  for (const id in C.akty) { const s = stan(id); for (const p in C.akty[id]) { if (tryb === 'dopisz' && s[p] !== undefined && s[p] !== false) continue; s[p] = C.akty[id][p]; } }
  if (tryb === 'zastap') { C.historia.forEach(e => S.hist.push(e)); S.histN = Math.max(S.histN || 0, C.ust.histN || 0, ...C.historia.map(e => e.n), 0); S.fixes = C.fixes; Object.assign(S, C.ust); }
  else { for (const a in C.fixes) { S.fixes[a] = S.fixes[a] || {}; for (const b in C.fixes[a]) S.fixes[a][b] = Math.max(S.fixes[a][b] || 0, C.fixes[a][b]); } }
  save(); HIST_WHY = null; HS = histSnap(S.acts); await stFlush(true); return true; }
async function kopiaPrzywroc(klucz){ const k = await kopiaZMigawki(klucz); if (!k) return false; const w = kopiaWalidacja(JSON.parse(JSON.stringify(k))); if (!w.ok) return false; return kopiaZastosuj(w, 'zastap', 'migawka ' + klucz); }
function kopiaZrobiona(){ ST_ZMIANY = 0; ST_OSTATNIA = new Date().toISOString(); if (typeof stWskaznik === 'function') stWskaznik(); stFlush(false); }
function kopiaPrzypomnij(){ if (!ST_ZMIANY) return ''; if (ST_ZMIANY >= KOP_PRZYP_ZMIAN) return 'Masz ' + ST_ZMIANY + ' zmian bez kopii – zrób kopię pełną.'; const t = ST_OSTATNIA ? Date.parse(ST_OSTATNIA) : 0; if (!t || Date.now() - t > KOP_PRZYP_DNI * 864e5) return 'Ostatnia kopia pełna jest sprzed ponad ' + KOP_PRZYP_DNI + ' dni (lub jej nie ma) – zrób kopię.'; return ''; }
// autozapis do pliku (File System Access, Chromium): po zmianie z opóźnieniem, do pliku wskazanego raz przez użytkownika; gdzie API brak – pobieranie
async function kopiaAutoWybierz(){ if (!window.showSaveFilePicker) return false; KOP_AUTO = {h: await window.showSaveFilePicker({suggestedName: 'multitool_kopia.json', types: [{description: 'JSON', accept: {'application/json': ['.json']}}]}), t: null}; kopiaAutoZapis(true); return true; }
function kopiaAutoZapis(od){ if (!KOP_AUTO) return; clearTimeout(KOP_AUTO.t); KOP_AUTO.t = setTimeout(async () => { try { const w = await KOP_AUTO.h.createWritable(); await w.write(JSON.stringify(kopiaPelna())); await w.close(); kopiaZrobiona(); } catch (e) { KOP_AUTO = null; } }, od ? 0 : 1500); }
