/* app/moduly/rodziny_rdzen.js – graf osób i rodzin z aktów + kontrole (czyste funkcje, bez DOM). Wymaga: norm.js, raport (wiekLat), moduly/wystapienia.js, moduly/decyzje.js, osoby_rdzen.js (osModel).
   Zasada: POTWIERDZONE jest tylko to, co wynika z jednego aktu (dziecko–rodzice, małżonkowie) oraz z decyzji „scal” użytkownika (osoba = klaster wystąpień).
   Wszystko inne (ta sama para imion rodziców w różnych aktach) to PODPOWIEDŹ – zwracana osobno i oznaczana w widoku jako „możliwe”. Niczego tu nie scalamy i nie dopisujemy do aktów. */
const RDZ_DZIECI = {dziecko: ['ojciec', 'matka'], zmarly: ['ojciec', 'matka'], pan_mlody: ['ojciec_pana', 'matka_pana'], panna_mloda: ['ojciec_panny', 'matka_panny']};
const RDZ_PARY = [['ojciec', 'matka'], ['pan_mlody', 'panna_mloda'], ['ojciec_pana', 'matka_pana'], ['ojciec_panny', 'matka_panny'], ['zmarly', 'malzonek']];
const RDZ_ROLA = {dziecko: 'dziecko (chrzest)', zmarly: 'zmarły/a', ojciec: 'ojciec', matka: 'matka', malzonek: 'małżonek', pan_mlody: 'pan młody', panna_mloda: 'panna młoda', ojciec_pana: 'ojciec pana młodego', matka_pana: 'matka pana młodego', ojciec_panny: 'ojciec panny młodej', matka_panny: 'matka panny młodej'};
const rdzKI = v => kluczImienia(v)[0] || '';
const rdzKN = v => { const k = kluczNazwiska(v); return k ? k.k2 : ''; };
// klucz pary rodziców: imię ojca + nazwisko ojca + imię matki (wszystkie trzy wymagane); nazwisko rodowe matki tylko do pokazania
const rdzKluczPary = (oi, on, mi) => { const a = rdzKI(oi), b = rdzKN(on), c = rdzKI(mi); return a && b && c ? b + '|' + a + '|' + c : ''; };
/* graf: M = model (osModel), P = profile (wystProfile), K = klastry decyzji (decKlastry).
   Zwraca {P, wezel(w)→id osoby, czlonkowie[id]→[w], rodzice[id]→Set, dzieci[id]→Set, malz[id]→Set, pary{klucz→{ojciec, nazwisko, matka, rodowe:Set, dzieci:[w], rodziceW:[w]}}, kluczDziecka{w→klucz}, kluczRodzica{w→klucz}} */
function rdzGraf(M, P, K){ const G = {P, czlonkowie: {}, rodzice: {}, dzieci: {}, malz: {}, pary: {}, kluczDziecka: {}, kluczRodzica: {}}, czyja = (K && K.czyja) || {};
  G.wezel = w => czyja[w] || w; const dod = (o, k, v) => (o[k] = o[k] || new Set()).add(v);
  const poAkcie = {}; M.wystapienia.forEach(w => { if (!P[w.id]) return; (poAkcie[w.akt] = poAkcie[w.akt] || {})[w.rola] = w.id; (G.czlonkowie[G.wezel(w.id)] = G.czlonkowie[G.wezel(w.id)] || []).push(w.id); });
  for (const akt in poAkcie) { const R = poAkcie[akt];
    for (const dz in RDZ_DZIECI) { if (!R[dz]) continue; const [ro, rm] = RDZ_DZIECI[dz], d = G.wezel(R[dz]);
      [R[ro], R[rm]].forEach(r => { if (r && G.wezel(r) !== d) { dod(G.rodzice, d, G.wezel(r)); dod(G.dzieci, G.wezel(r), d); } });
      const po = R[ro] && P[R[ro]], pm = R[rm] && P[R[rm]], k = po && pm ? rdzKluczPary(po.imie, po.nazwisko, pm.imie) : '';
      if (k) { const x = G.pary[k] = G.pary[k] || {klucz: k, ojciec: po.imie, nazwisko: po.nazwisko, matka: pm.imie, rodowe: new Set(), dzieci: [], rodziceW: []}; if (pm.rodowe) x.rodowe.add(pm.rodowe); x.dzieci.push(R[dz]); x.rodziceW.push(R[ro], R[rm]); G.kluczDziecka[R[dz]] = k; G.kluczRodzica[R[ro]] = k; G.kluczRodzica[R[rm]] = k; } }
    RDZ_PARY.forEach(([x, y]) => { if (R[x] && R[y] && G.wezel(R[x]) !== G.wezel(R[y])) { dod(G.malz, G.wezel(R[x]), G.wezel(R[y])); dod(G.malz, G.wezel(R[y]), G.wezel(R[x])); } }); }
  return G; }
// rok zdarzeń osoby z jej wystąpień (tylko to, co mówią akty): chrzest (jako dziecko), ślub, zgon (z wiekiem)
function rdzZycie(G, id){ const o = {ur: null, sl: [], zg: null, wiekZg: '', plec: '', imie: '', nazwisko: '', rodowe: ''}; let waga = -1;
  (G.czlonkowie[id] || []).forEach(w => { const p = G.P[w]; if (!p) return; if (p.rolaAktu === 'dziecko') o.ur = o.ur == null ? p.rok : Math.min(o.ur, p.rok); if (p.rolaAktu === 'pan_mlody' || p.rolaAktu === 'panna_mloda') o.sl.push(p.rok); if (p.rolaAktu === 'zmarly') { o.zg = p.rok; o.wiekZg = p.wiek || ''; }
    if (!o.plec && p.plec) o.plec = p.plec; const g = /^(dziecko|zmarly|pan_mlody|panna_mloda)$/.test(p.rolaAktu) ? 2 : 1; if (g > waga && (p.imie || p.nazwisko)) { waga = g; o.imie = p.imie; o.nazwisko = p.nazwisko; o.rodowe = p.rodowe || ''; } else if (!o.rodowe && p.rodowe) o.rodowe = p.rodowe; });
  return o; }
const rdzNazwa = z => ((z.imie || '?') + ' ' + (z.nazwisko || (z.rodowe ? 'z d. ' + z.rodowe : '(bez nazwiska)'))).trim() + (z.nazwisko && z.rodowe && fold(z.rodowe) !== fold(z.nazwisko) ? ' z d. ' + z.rodowe : '');
const rdzLata = z => [z.ur != null ? 'chrz. ' + z.ur : '', z.sl.length ? 'ślub ' + z.sl.join(', ') : '', z.zg != null ? 'zm. ' + z.zg + (z.wiekZg ? ' (wiek ' + z.wiekZg + ')' : '') : ''].filter(Boolean).join(' · ');
// przerwy między kolejnymi dziećmi pary dłuższe niż `prog` lat – podpowiedź, że może brakować aktu (nie fakt)
function rdzPrzerwy(lata, prog){ const L = [...new Set(lata.filter(y => Number.isFinite(y)))].sort((a, b) => a - b), out = []; for (let i = 1; i < L.length; i++) if (L[i] - L[i - 1] > (prog || 4)) out.push([L[i - 1], L[i]]); return out; }

/* ---------- kontrole do zakładki „Raport” ---------- */
const rdzLiczba = v => { const m = String(v == null ? '' : v).match(/\d+/); return m ? +m[0] : null; };
// 1. wiek w aktach poza zwykłym zakresem (do sprawdzenia na skanie): rodzice przy chrzcie, młodzi przy ślubie, zmarli
function kontWiekWAktach(akty, wart){ const out = [], spr = (a, f, et, min, max) => { const v = wart(a, f); if (normBrak(v)) return; const n = /mies|tyg|dni|dzie|godz/i.test(String(v)) ? 0 : rdzLiczba(v); if (n == null) return; if (n < min || n > max) out.push({id: a.id, f, msg: et + ': ' + v + ' (zwykle ' + min + '–' + max + ' lat)'}); };
  akty.forEach(a => { if (a.typ === 'chrzest') { spr(a, 'father_age', 'wiek ojca przy chrzcie', 16, 75); spr(a, 'mother_age', 'wiek matki przy chrzcie', 14, 52); } else if (a.typ === 'malzenstwo') { spr(a, 'groom_age', 'wiek pana młodego', 16, 85); spr(a, 'bride_age', 'wiek panny młodej', 14, 80); } else if (a.typ === 'zgon') spr(a, 'age', 'wiek zmarłego', 0, 105); });
  return out; }
// 2. osoby scalone decyzją: zgodność wieku z latami aktów (chrzest ↔ ślub ↔ zgon). Tylko dla klastrów – bez decyzji użytkownika nie łączymy aktów.
function kontWiekOsob(G){ const out = [];
  for (const id in G.czlonkowie) { const C = G.czlonkowie[id]; if (C.length < 2) continue; const P = C.map(w => G.P[w]).filter(Boolean), ur = P.filter(p => p.rolaAktu === 'dziecko').map(p => p.rok), zg = P.find(p => p.rolaAktu === 'zmarly'), sl = P.filter(p => p.rolaAktu === 'pan_mlody' || p.rolaAktu === 'panna_mloda'), akty = P.map(p => p.akt);
    const B = ur.length ? Math.min(...ur) : null, bl = (msg) => out.push({id, akty, msg});
    if (ur.length > 1 && Math.max(...ur) !== B) bl('dwa chrzty w różnych latach (' + ur.join(', ') + ') – to raczej dwie osoby');
    if (zg && B != null) { if (zg.rok < B) bl('zgon (' + zg.rok + ') przed chrztem (' + B + ')'); const w = wiekLat(zg.wiek); if (w != null && Math.abs((zg.rok - B) - w) > 2) bl('wiek w akcie zgonu: ' + zg.wiek + ', a od chrztu (' + B + ') do zgonu (' + zg.rok + ') minęło ' + (zg.rok - B) + ' lat'); }
    sl.forEach(s => { if (B != null) { if (s.rok - B < 14) bl('ślub (' + s.rok + ') w wieku ' + (s.rok - B) + ' lat od chrztu (' + B + ')'); const w = rdzLiczba(s.wiek); if (w != null && Math.abs((s.rok - B) - w) > 2) bl('wiek w akcie ślubu: ' + s.wiek + ', a od chrztu (' + B + ') minęło ' + (s.rok - B) + ' lat'); } if (zg && s.rok > zg.rok) bl('ślub (' + s.rok + ') po zgonie (' + zg.rok + ')'); });
    if (zg) P.filter(p => p.rolaAktu === 'ojciec' && p.typ === 'chrzest' && p.rok > zg.rok + 1).forEach(p => bl('ojciec przy chrzcie w ' + p.rok + ', a zgon w ' + zg.rok)), P.filter(p => p.rolaAktu === 'matka' && p.typ === 'chrzest' && p.rok > zg.rok).forEach(p => bl('matka przy chrzcie w ' + p.rok + ', a zgon w ' + zg.rok)); }
  return out; }
// 3. numeracja: małe dziury (1–3 numery) wewnątrz ciągu numerów jednego roku i typu + powtórzone numery
function kontNumeracja(akty){ const g = {}; akty.forEach(a => { const n = parseInt(a.act, 10); if (!Number.isFinite(n) || !Number.isFinite(+a.year)) return; (g[a.typ + '|' + a.year] = g[a.typ + '|' + a.year] || []).push([n, a.id]); });
  const dziury = [], duble = []; Object.keys(g).sort().forEach(k => { const [typ, rok] = k.split('|'), L = g[k].sort((x, y) => x[0] - y[0]);
    for (let i = 1; i < L.length; i++) { const d = L[i][0] - L[i - 1][0]; if (d === 0) duble.push({typ, rok: +rok, nr: L[i][0], ids: [L[i - 1][1], L[i][1]]}); else if (d >= 2 && d <= 4) dziury.push({typ, rok: +rok, brak: Array.from({length: d - 1}, (_, j) => L[i - 1][0] + 1 + j), przed: L[i - 1][1], po: L[i][1]}); } });
  return {dziury, duble}; }
// 4. możliwe duble aktów zgonu: ta sama osoba (klucz imienia i nazwiska) i ta sama pełna data zgonu w dwóch aktach
function kontDubleZgonow(akty, wart){ const g = {}; akty.forEach(a => { if (a.typ !== 'zgon') return; const d = String(wart(a, 'death_date') || ''); if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return; const k = rdzKN(wart(a, 'deceased_last_name')) + '|' + rdzKI(wart(a, 'deceased_first_name')) + '|' + d; if (k.startsWith('|') || k.includes('||')) return; (g[k] = g[k] || []).push(a.id); });
  return Object.keys(g).filter(k => g[k].length > 1).map(k => ({data: k.split('|')[2], ids: g[k]})); }
