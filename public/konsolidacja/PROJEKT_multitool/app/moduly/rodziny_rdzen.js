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
  const poAkcie = G.poAkcieRola = {}; M.wystapienia.forEach(w => { if (!P[w.id]) return; (poAkcie[w.akt] = poAkcie[w.akt] || {})[w.rola] = w.id; (G.czlonkowie[G.wezel(w.id)] = G.czlonkowie[G.wezel(w.id)] || []).push(w.id); });
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
function kontNumeracja(akty){ const g = {}; akty.forEach(a => { const n = parseInt(a.act, 10); if (a.parafia || !Number.isFinite(n) || !Number.isFinite(+a.year)) return; (g[a.typ + '|' + a.year] = g[a.typ + '|' + a.year] || []).push([n, a.id]); });
  const dziury = [], duble = []; Object.keys(g).sort().forEach(k => { const [typ, rok] = k.split('|'), L = g[k].sort((x, y) => x[0] - y[0]);
    for (let i = 1; i < L.length; i++) { const d = L[i][0] - L[i - 1][0]; if (d === 0) duble.push({typ, rok: +rok, nr: L[i][0], ids: [L[i - 1][1], L[i][1]]}); else if (d >= 2 && d <= 4) dziury.push({typ, rok: +rok, brak: Array.from({length: d - 1}, (_, j) => L[i - 1][0] + 1 + j), przed: L[i - 1][1], po: L[i][1]}); } });
  return {dziury, duble}; }
// 4. możliwe duble aktów zgonu: ta sama osoba (klucz imienia i nazwiska) i ta sama pełna data zgonu w dwóch aktach
function kontDubleZgonow(akty, wart){ const g = {}; akty.forEach(a => { if (a.typ !== 'zgon') return; const d = String(wart(a, 'death_date') || ''); if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return; const k = rdzKN(wart(a, 'deceased_last_name')) + '|' + rdzKI(wart(a, 'deceased_first_name')) + '|' + d; if (k.startsWith('|') || k.includes('||')) return; (g[k] = g[k] || []).push(a.id); });
  return Object.keys(g).filter(k => g[k].length > 1).map(k => ({data: k.split('|')[2], ids: g[k]})); }
/* ---------- imiona rodziców w dopełniaczu („syn Marcina i Antoniny” → Marcin, Antonina) ----------
   Propozycja powstaje tylko wtedy, gdy zapis NIE jest znanym imieniem (wyjątek: imię żeńskie w polu ojca), a po zdjęciu końcówki dopełniacza JEST imieniem znanym ze słownika bazy (znane(v) → true).
   Pole ojca: -a, -ka→-ek, -wła→-weł, -iego→-i, -ego→-y, -ra→-er, -ca→-iec; pole matki: -y→-a, -ii→-ia, -ji→-ja, -i→-a. Zwraca mianownik albo ''. */
const IMIE_POLA = {zgon: [['father_first_name', 'M'], ['mother_first_name', 'K']], chrzest: [['father_first_name', 'M'], ['mother_first_name', 'K']], malzenstwo: [['groom_father_first_name', 'M'], ['groom_mother_first_name', 'K'], ['bride_father_first_name', 'M'], ['bride_mother_first_name', 'K']]};
function imieMianownik(v, plec, znane){ v = String(v == null ? '' : v).trim(); if (!v || /[\s\[\]?(),.]/.test(v) || (znane(v) && !(plec === 'M' && /a$/.test(v)))) return '';   // w polu ojca imię żeńskie (Józefa, Franciszka) to dopełniacz męskiego
  const C = plec === 'M' ? [v.replace(/a$/, ''), v.replace(/ka$/, 'ek'), v.replace(/wła$/, 'weł'), v.replace(/iego$/, 'i'), v.replace(/ego$/, 'y'), v.replace(/ra$/, 'er'), v.replace(/ca$/, 'iec')] : [v.replace(/y$/, 'a'), v.replace(/ii$/, 'ia'), v.replace(/ji$/, 'ja'), v.replace(/i$/, 'a')];
  return C.find(c => c !== v && znane(c)) || ''; }
function kontDopelniacz(akty, wart, znane){ const out = []; akty.forEach(a => (IMIE_POLA[a.typ] || []).forEach(([f, pl]) => { const v = String(wart(a, f) ?? '').trim(), m = imieMianownik(v, pl, znane); if (m) out.push({id: a.id, f, v, m}); })); return out; }
/* ---------- rekonstrukcja rodzin: rodzice z aktów dzieci ↔ para młodych z aktu ślubu ----------
   Drzewo rośnie w górę dopiero wtedy, gdy „ojciec” i „matka” z aktu dziecka zostaną połączeni z własnym ślubem (akt ślubu podaje ICH rodziców).
   Propozycja: para rodziców (imię i nazwisko ojca + imię matki) ↔ ślub o tych samych imionach i nazwisku pana młodego, zawarty najwyżej rok po i nie dawniej niż 32 lata przed urodzeniem dziecka.
   „Jednoznaczna”: dokładnie jeden taki ślub, nazwisko panny młodej zgodne z nazwiskiem rodowym matki w co najmniej jednym akcie dziecka i w żadnym niesprzeczne.
   Zwraca [{klucz, ojciec, nazwisko, matka, rodowe, sluby:[{akt, rok, pan, panna, pannaNazw}], akty:[{dz, o, m, rok, rodowe}], jednoznaczna}] – same podpowiedzi, bez zmiany danych. */
function rdzPropozycjeSlubow(G, K){ const P = G.P, sl = {}, odrz = (K && K.odrzucone) || new Set(), out = [];
  for (const akt in G.poAkcieRola || {}) { const R = G.poAkcieRola[akt], g = R.pan_mlody && P[R.pan_mlody], b = R.panna_mloda && P[R.panna_mloda]; if (!g || !b) continue; const k = rdzKluczPary(g.imie, g.nazwisko, b.imie); if (!k) continue; (sl[k] = sl[k] || []).push({akt, rok: g.rok, pan: g.id, panna: b.id, pannaNazw: b.nazwisko || '', kn: rdzKN(b.nazwisko || '')}); }
  for (const k in G.pary) { const x = G.pary[k], S0 = sl[k]; if (!S0) continue;
    const akty = x.dzieci.map((dz, i) => { const p = P[dz], o = x.rodziceW[2 * i], m = x.rodziceW[2 * i + 1], ur = p.rolaAktu === 'dziecko' ? [p.rok, p.rok] : idUr(p); return {dz, o, m, rok: p.rok, ur: ur || null, rodowe: (P[m] && P[m].rodowe) || '', kn: rdzKN((P[m] && P[m].rodowe) || ''), typ: p.typ, rola: p.rolaAktu}; }).filter(a => a.o && a.m);
    const C = S0.filter(s => !odrz.has(decKlucz(akty[0].o, s.pan)) && akty.every(a => (!a.kn || !s.kn || a.kn === s.kn) && (!a.ur || (a.ur[1] >= s.rok - 1 && a.ur[0] <= s.rok + 32)) && P[a.dz].akt !== s.akt)); if (!C.length) continue;
    if (C.length === 1 && akty.every(a => G.wezel(a.o) === G.wezel(C[0].pan) && G.wezel(a.m) === G.wezel(C[0].panna))) continue;   // już połączone
    const zgodne = C.length === 1 && C[0].kn && akty.some(a => a.kn && a.kn === C[0].kn) && akty.some(a => a.ur);
    out.push({klucz: k, ojciec: x.ojciec, nazwisko: x.nazwisko, matka: x.matka, rodowe: [...x.rodowe], sluby: C, akty, jednoznaczna: !!zgodne}); }
  return out.sort((a, b) => (b.jednoznaczna - a.jednoznaczna) || fold(a.nazwisko + a.ojciec).localeCompare(fold(b.nazwisko + b.ojciec))); }
/* ---------- zgon osoby zamężnej / żonatej ↔ jej akt ślubu (po imieniu współmałżonka) ----------
   Akt zgonu dorosłego często nie podaje rodziców, ale podaje współmałżonka. Propozycja: zmarły + małżonek ↔ para młodych o tych samych imionach i nazwisku męża;
   ślub nie później niż zgon i nie dawniej niż 70 lat przed nim; gdy oba akty podają wiek – roczniki urodzenia muszą się zgadzać (±3 lata); nazwisko rodowe zmarłej (jeśli jest) = nazwisko panny młodej.
   „Jednoznaczna”: jeden pasujący ślub, żaden inny zgon nie pasuje do tej samej strony tego ślubu, a zgodność potwierdza wiek albo nazwisko rodowe.
   Wynik ma ten sam kształt co rdzPropozycjeSlubow (akty: jeden wpis, o = wystąpienie łączone z panem młodym, m = z panną młodą) + rodzaj: 'zgon'. */
function rdzPropozycjeZgonSlub(G, K){ const P = G.P, sl = {}, odrz = (K && K.odrzucone) || new Set(), out = [], zak = (a, b) => !a || !b || (a[0] <= b[1] + 3 && b[0] <= a[1] + 3);
  for (const akt in G.poAkcieRola || {}) { const R = G.poAkcieRola[akt], g = R.pan_mlody && P[R.pan_mlody], b = R.panna_mloda && P[R.panna_mloda]; if (!g || !b) continue; const k = rdzKluczPary(g.imie, g.nazwisko, b.imie); if (!k) continue; (sl[k] = sl[k] || []).push({akt, rok: g.rok, pan: g.id, panna: b.id, pannaNazw: b.nazwisko || '', kn: rdzKN(b.nazwisko || '')}); }
  const zajete = {};
  for (const akt in G.poAkcieRola || {}) { const R = G.poAkcieRola[akt], z = R.zmarly && P[R.zmarly], m = R.malzonek && P[R.malzonek]; if (!z || !m || !z.imie || !m.imie || !z.nazwisko) continue; const mez = z.plec === 'M', kob = z.plec === 'K'; if (!mez && !kob) continue;
    const k = mez ? rdzKluczPary(z.imie, z.nazwisko, m.imie) : rdzKluczPary(m.imie, z.nazwisko, z.imie), S0 = k && sl[k]; if (!S0) continue; const urZ = idUr(z), knZ = kob ? rdzKN(z.rodowe || '') : '';
    const C = S0.filter(s => { const strona = P[mez ? s.pan : s.panna]; return s.rok <= z.rok && z.rok - s.rok <= 70 && zak(urZ, idUr(strona)) && (!knZ || !s.kn || knZ === s.kn) && !odrz.has(decKlucz(z.id, strona.id)); }); if (!C.length) continue;
    const o = mez ? z.id : m.id, mm = mez ? m.id : z.id; if (C.length === 1 && G.wezel(o) === G.wezel(C[0].pan) && G.wezel(mm) === G.wezel(C[0].panna)) continue;
    const s0 = C[0], strona0 = P[mez ? s0.pan : s0.panna], potw = (urZ && idUr(strona0)) || (knZ && s0.kn && knZ === s0.kn);
    const x = {rodzaj: 'zgon', klucz: 'zg|' + z.id, ojciec: mez ? z.imie : m.imie, nazwisko: z.nazwisko, matka: mez ? m.imie : z.imie, rodowe: kob && z.rodowe ? [z.rodowe] : [], sluby: C, akty: [{dz: z.id, o, m: mm, rok: z.rok, ur: urZ, rodowe: z.rodowe || '', kn: knZ, typ: 'zgon', rola: 'zmarly'}], jednoznaczna: C.length === 1 && !!potw, mez};
    if (C.length === 1) (zajete[(mez ? s0.pan : s0.panna)] = zajete[(mez ? s0.pan : s0.panna)] || []).push(x); out.push(x); }
  for (const w in zajete) if (zajete[w].length > 1) zajete[w].forEach(x => { x.jednoznaczna = false; x.konkurencja = zajete[w].length; });   // dwa zgony pasują do tego samego małżonka ze ślubu → żaden nie jest jednoznaczny
  return out.sort((a, b) => (b.jednoznaczna - a.jednoznaczna) || fold(a.nazwisko + a.ojciec).localeCompare(fold(b.nazwisko + b.ojciec))); }
