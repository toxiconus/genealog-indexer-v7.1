/* moduly/decyzje.js – dziennik decyzji o tożsamości i klastry osób (czyste funkcje, bez DOM).
   Dziennik jest jedynym źródłem prawdy o scaleniach. Osoba = klaster wystąpień wyliczany z dziennika. Nic się nie kasuje: cofnięcie to nowy wpis.
   Decyzja: {n, t, typ:'scal'|'odrzuc'|'odloz'|'cofnij', a, b, wniosek, uzasadnienie:{zgodnosci,rozbieznosci,sprzecznosci,braki}, reguly, cofa, why} */
const DEC_FORMAT = {nazwa:'multitool-decyzje', wersja:1};
const decKlucz = (a, b) => a < b ? a + '|' + b : b + '|' + a;
function decNowa(L, d){ const n = L.reduce((m, x) => Math.max(m, x.n), 0) + 1; const e = Object.assign({n, t: new Date().toISOString()}, d); L.push(e); return e; }
// decyzje obowiązujące: bez cofniętych i bez samych wpisów „cofnij”; dla pary liczy się ostatnia
function decAktywne(L){ const cof = new Set(L.filter(d => d.typ === 'cofnij').map(d => d.cofa)); const par = {}; L.forEach(d => { if (d.typ === 'cofnij' || cof.has(d.n)) return; par[decKlucz(d.a, d.b)] = d; }); return Object.values(par); }
// klastry (union-find) z aktywnych decyzji „scal”; id osoby = najmniejszy numer decyzji w klastrze (stabilny, dopóki ta decyzja obowiązuje)
function decKlastry(L){ const par = {}, f = x => par[x] === undefined || par[x] === x ? (par[x] = x) : (par[x] = f(par[x])); const akt = decAktywne(L); akt.filter(d => d.typ === 'scal').forEach(d => { par[f(d.a)] = f(d.b); });
  const G = {}; Object.keys(par).forEach(x => (G[f(x)] = G[f(x)] || []).push(x)); const osoby = {}, czyja = {};
  Object.values(G).forEach(c => { if (c.length < 2) return; const dn = akt.filter(d => d.typ === 'scal' && c.includes(d.a)).map(d => d.n); const id = 'o:' + Math.min(...dn); dn.sort((x, y) => x - y); osoby[id] = {id, wystapienia: c.sort(), decyzje: dn, aliasy: dn.slice(1).map(x => 'o:' + x), status: 'zatwierdzona'}; c.forEach(w => czyja[w] = id); });
  const odrz = new Set(akt.filter(d => d.typ === 'odrzuc').map(d => decKlucz(d.a, d.b))), odl = new Set(akt.filter(d => d.typ === 'odloz').map(d => decKlucz(d.a, d.b)));
  return {osoby, czyja, odrzucone: odrz, odlozone: odl}; }
// para odrzucona blokuje scalenie pośrednie: zwraca listę odrzuconych par, które znalazłyby się w jednym klastrze po scaleniu a+b
function decKolizje(L, a, b){ const K = decKlastry(L), ca = K.czyja[a] ? K.osoby[K.czyja[a]].wystapienia : [a], cb = K.czyja[b] ? K.osoby[K.czyja[b]].wystapienia : [b], out = []; ca.forEach(x => cb.forEach(y => { if (K.odrzucone.has(decKlucz(x, y))) out.push([x, y]); })); return out; }
// walidacja importu: format, wersja, typy, odwołania do istniejących wystąpień; zwraca {ok:[...], bledy:[...]}
function decWaliduj(obj, znaneWyst){ const bl = [], ok = []; if (!obj || !obj.format || obj.format.nazwa !== DEC_FORMAT.nazwa) return {ok, bledy: ['To nie jest plik decyzji Multitoola (brak pola format).']}; if (obj.format.wersja > DEC_FORMAT.wersja) return {ok, bledy: ['Plik z nowszej wersji (' + obj.format.wersja + '). Zaktualizuj aplikację.']};
  if (!Array.isArray(obj.decyzje)) return {ok, bledy: ['Brak listy decyzji.']}; const nry = new Set();
  obj.decyzje.forEach((d, i) => { const gdzie = 'wpis ' + (i + 1) + ': '; if (!d || typeof d !== 'object' || !Number.isInteger(d.n) || nry.has(d.n)) return bl.push(gdzie + 'brak lub powtórzony numer'); if (!/^(scal|odrzuc|odloz|cofnij)$/.test(d.typ)) return bl.push(gdzie + 'nieznany typ „' + String(d.typ).slice(0, 20) + '”');
    if (d.typ === 'cofnij') { if (!Number.isInteger(d.cofa)) return bl.push(gdzie + 'cofnięcie bez numeru decyzji'); } else if (typeof d.a !== 'string' || typeof d.b !== 'string' || !znaneWyst.has(d.a) || !znaneWyst.has(d.b)) return bl.push(gdzie + 'odwołanie do nieznanego wystąpienia');
    nry.add(d.n); ok.push(d); }); return {ok, bledy: bl}; }
function decCsv(L){ return ['nr;czas;typ;a;b;wniosek;zgodnosci;rozbieznosci;sprzecznosci;braki;reguly;cofa;powod'].concat(L.map(d => { const u = d.uzasadnienie || {}; return [d.n, d.t, d.typ, d.a || '', d.b || '', d.wniosek || '', (u.zgodnosci || []).join(' | '), (u.rozbieznosci || []).join(' | '), (u.sprzecznosci || []).join(' | '), (u.braki || []).join(' | '), d.reguly || '', d.cofa || '', d.why || ''].map(csvCell).join(';'); })).join('\r\n') + '\r\n'; }
