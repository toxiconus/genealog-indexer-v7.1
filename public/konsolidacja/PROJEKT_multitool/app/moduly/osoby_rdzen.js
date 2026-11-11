/* app/moduly/osoby_rdzen.js – rdzeń zakładki „Osoby” (krok 6): model wystąpień z aktów, silnik propozycji, dziennik decyzji, klasy wariantów nazwisk, import dop.v1.
   Czyste funkcje, bez DOM – działają w Web Workerze i na wątku głównym (fallback). Wymaga (kolejność): tekst.js, raport.js (wiekLat), norm.js, norm_zapis.js, moduly/wystapienia.js, moduly/identity.js, moduly/decyzje.js.
   Zasady (MODEL_DANYCH §1, SCALANIE_OSOBY): program niczego nie scala; propozycja z uzasadnieniem → decyzja użytkownika → osoba wyliczana z dziennika. Akty, wystąpienia i źródła są tylko czytane. */

/* ---------- 1. model: wystąpienia z aktów ---------- */
// rola → atrybut → pola aktu (pierwsze niepuste); '=' w nazwie roli nie występuje. Role pomijane celowo: świadkowie, zgłaszający, księża (słabe tożsamościowo; zob. PLAN_WDROZENIA §6, krok 6).
const OS_ROLE = {
  zgon: {zmarly: {imie: ['deceased_first_name'], nazwisko: ['deceased_last_name'], rodowe: ['deceased_maiden_name'], plec: ['deceased_sex'], wiek: ['age'], miejsce: ['deceased_residence', 'death_place'], dom: ['house']},
    ojciec: {imie: ['father_first_name'], nazwisko: ['father_last_name', '@ojcowskie'], miejsce: ['deceased_residence', 'death_place']},
    matka: {imie: ['mother_first_name'], rodowe: ['mother_last_name'], nazwisko: ['father_last_name', '@ojcowskie'], miejsce: ['deceased_residence', 'death_place']},
    malzonek: {imie_nazwisko: ['deceased_spouse']}},
  chrzest: {dziecko: {imie: ['child_first_name'], nazwisko: ['child_last_name'], miejsce: ['child_birth_place']},
    ojciec: {imie: ['father_first_name'], nazwisko: ['father_last_name'], wiek: ['father_age'], miejsce: ['child_birth_place']},
    matka: {imie: ['mother_first_name'], rodowe: ['mother_last_name'], nazwisko: ['father_last_name'], wiek: ['mother_age'], miejsce: ['child_birth_place']}},
  malzenstwo: {pan_mlody: {imie: ['groom_first_name'], nazwisko: ['groom_last_name'], wiek: ['groom_age'], stan: ['groom_status'], miejsce: ['groom_residence']},
    panna_mloda: {imie: ['bride_first_name'], nazwisko: ['bride_last_name'], wiek: ['bride_age'], stan: ['bride_status'], miejsce: ['bride_residence']},
    ojciec_pana: {imie: ['groom_father_first_name'], nazwisko: ['groom_father_last_name']}, matka_pana: {imie: ['groom_mother_first_name'], rodowe: ['groom_mother_last_name'], nazwisko: ['groom_father_last_name']},
    ojciec_panny: {imie: ['bride_father_first_name'], nazwisko: ['bride_father_last_name']}, matka_panny: {imie: ['bride_mother_first_name'], rodowe: ['bride_mother_last_name'], nazwisko: ['bride_father_last_name']}}
};
// nazwisko ojca w akcie zgonu bez pola „ojciec”: mężczyzna → jego nazwisko; kobieta niezamężna (dziecko, panna) → jej nazwisko; kobieta z nazwiskiem rodowym → rodowe; inaczej nieznane
function osOjcowskie(w){ const z = w('deceased_sex'), n = w('deceased_last_name'), r = w('deceased_maiden_name'); if (!normBrak(r)) return r;
  if (z !== 'K') return n; return /dziec|panna|panienka|virgo|puella|infans|filia/i.test(String(w('deceased_status') || '')) ? n : ''; }
// pola: funkcja wart(akt, pole) → bieżąca wartość (w aplikacji getv, czyli z poprawkami użytkownika)
function osModel(akty, wart){ const M = {akty: [], wystapienia: []};
  akty.forEach(a => { const R = OS_ROLE[a.typ]; if (!R) return; const w = f => { const v = wart(a, f); return v == null ? '' : String(v); }, pola = {}, rola = [];
    for (const r in R) { const mapa = {}; let ma = false; for (const at in R[r]) { let v = ''; for (const f of R[r][at]) { v = f === '@ojcowskie' ? osOjcowskie(w) : w(f); if (!normBrak(v)) break; v = ''; } if (v !== '') { pola[r + '.' + at] = {value: v}; mapa[at] = r + '.' + at; if (at !== 'miejsce' && at !== 'plec' && at !== 'dom') ma = true; } }
      if (ma) M.wystapienia.push({id: 'w:' + a.id + ':' + r, akt: a.id, rola: r, mapa}); }
    M.akty.push({id: a.id, typ: a.typ, rok: Number(a.year != null ? a.year : a.rok) || null, miejsce: w('deceased_residence') || w('death_place') || w('child_birth_place') || w('groom_residence') || '', pola}); });
  return M; }
// podpis modelu (FNV-1a po JSON) – do rozpoznania, że dane aktów zmieniły się od ostatniego przeliczenia
function osPodpis(M){ let h = 0x811c9dc5; const s = JSON.stringify(M); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16) + ':' + s.length; }

/* ---------- 2. silnik: profile, indeks, kandydaci ---------- */
// klasy = {klucz nazwiska (k1/k2): id klasy} z decyzji wariant_nazwiska (osKlasy)
function osSilnik(M, klasy){ const P = wystProfile(M), PL = Object.values(P), E = {P, PL, klasy: klasy || {}, ix: {}}; osIndeksuj(E); return E; }
const osKlucz = (v, klasy) => { const k = kluczNazwiska(v); return k ? ((klasy && (klasy[k.k2] || klasy[k.k1])) || k.k2) : null; };
// indeks blokowy: klucz nazwiska × klucz imienia (rdzeń propozycji wymaga zgodnego nazwiska i imienia, więc pary spoza bloku nigdy nie byłyby kandydatami)
function osIndeksuj(E){ E.ix = {}; E.PL.forEach(p => { const iml = kluczImienia(p.imie); if (!iml.length) return; const ks = new Set(); idNazwiska(p).forEach(([v]) => { const k = osKlucz(v, E.klasy); if (k) ks.add(k); });
  ks.forEach(k => iml.forEach(im => (E.ix[k + '|' + im] = E.ix[k + '|' + im] || []).push(p))); }); }
function osKandydaci(E, id){ const p = E.P[id]; if (!p) return []; const seen = new Set([p.id]), out = [], opt = {klasy: E.klasy}, iml = kluczImienia(p.imie);
  idNazwiska(p).forEach(([v]) => { const k = osKlucz(v, E.klasy); if (!k) return; iml.forEach(im => (E.ix[k + '|' + im] || []).forEach(q => { if (seen.has(q.id) || q.akt === p.akt) return; seen.add(q.id); const u = porownajProfile(p, q, opt); if (!u.rdzen) return; u.a = p.id; u.b = q.id; out.push(u); })); });
  out.sort(idPorzadek); idKonkurencja(out); return out; }
const OS_WN = {sprawdz: 'sprawdź', mozliwe: 'możliwe', malo: 'za mało danych', konflikt: 'konflikt'};
// wersja do wysłania z Workera / zapisania: bez ciężkich pól
const osUzas = u => ({zgodnosci: u.zgodnosci.map(x => x.t), rozbieznosci: u.rozbieznosci.map(x => x.t), sprzecznosci: u.sprzecznosci.map(x => x.t), braki: u.braki.map(x => x.t)});
function osPoWyst(E, a, b){ const u = porownajProfile(E.P[a], E.P[b], {klasy: E.klasy}); u.a = a; u.b = b; return u; }
// przeliczenie profili porcjami. wyniki[id] = [[b, kod, konkurencja, mocnych, rodzinnych]] tylko dla „sprawdź” i „możliwe” (reszta to liczniki licz[id] = [za mało danych, konflikt]); pełne uzasadnienia liczy karta na żądanie
const OS_KOD = {sprawdz: 's', mozliwe: 'm', malo: 'l', konflikt: 'k'};
function osPrzeliczPorcja(E, od, ile, wyniki, licz){ const koniec = Math.min(E.PL.length, od + ile);
  for (let i = od; i < koniec; i++) { const p = E.PL[i], L = osKandydaci(E, p.id); if (!L.length) continue; const w = [], c = [0, 0];
    L.forEach(u => { if (u.wniosek === 'sprawdz' || u.wniosek === 'mozliwe') w.push([u.b, OS_KOD[u.wniosek], u.konkurencja || 0, u.zgodnosci.filter(x => x.mocna).length, u.zgodnosci.filter(x => /^(ojciec|matka|matkaNazw|malzonek)$/.test(x.k)).length]); else c[u.wniosek === 'konflikt' ? 1 : 0]++; });
    if (w.length) wyniki[p.id] = w; if (c[0] || c[1]) licz[p.id] = c; }
  return koniec; }
// etykieta do list i wyszukiwania: [id, tekst, rok, typ aktu, rola]
const osEtyk = E => E.PL.map(p => [p.id, wystEtykieta(p), p.rok || 0, p.typ, p.rolaAktu]);

/* ---------- 3. decyzje: walidacja, zapis, klasy wariantów nazwisk ---------- */
// typy dziennika: scal, odrzuc, odloz, cofnij (decyzje.js) + brak (b = „brak:B|D|M”), wariant_nazwiska / odrzuc_wariant (a, b = „n:<zapis nazwiska>”)
const OS_TYPY = /^(scal|odrzuc|odloz|brak|wariant_nazwiska|odrzuc_wariant|cofnij)$/, OS_ZAKAZ = new Set(['__proto__', 'constructor', 'prototype']);
const osStr = (v, max) => typeof v === 'string' && v.length <= max;
const osListaTekst = v => Array.isArray(v) && v.length <= 40 && v.every(x => osStr(x, 400));
// jedna decyzja → czysty obiekt albo null (białą listą pól; nic z pliku nie trafia dalej bez sprawdzenia)
function osCzyscDec(d, znane){ if (!d || typeof d !== 'object' || Array.isArray(d) || !Number.isInteger(d.n) || d.n < 1 || !OS_TYPY.test(d.typ)) return null; const o = {n: d.n, t: osStr(d.t, 40) ? d.t : '', typ: d.typ};
  if (d.typ === 'cofnij') { if (!Number.isInteger(d.cofa) || d.cofa < 1) return null; o.cofa = d.cofa; }
  else { if (!osStr(d.a, 200) || !osStr(d.b == null ? '' : d.b, 200)) return null; o.a = d.a; o.b = d.b == null ? '' : d.b;
    if (/^(scal|odrzuc|odloz)$/.test(d.typ)) { if (!/^w:/.test(o.a) || !/^w:/.test(o.b) || o.a === o.b || (znane && !(znane.has(o.a) && znane.has(o.b)))) return null; }
    else if (d.typ === 'brak') { if (!/^w:/.test(o.a) || !/^brak:[BDM]$/.test(o.b) || (znane && !znane.has(o.a))) return null; }
    else if (!/^n:.{1,150}$/.test(o.a) || !/^n:.{1,150}$/.test(o.b) || o.a === o.b) return null; }
  if (d.wniosek !== undefined) { if (!osStr(d.wniosek, 40)) return null; o.wniosek = d.wniosek; } if (d.reguly !== undefined) { if (!Number.isInteger(d.reguly)) return null; o.reguly = d.reguly; }
  if (d.why !== undefined) { if (!osStr(d.why, 1000)) return null; o.why = d.why; } if (d.zr !== undefined) { if (!osStr(d.zr, 40)) return null; o.zr = d.zr; } if (d.slot !== undefined) { if (!osStr(d.slot, 80)) return null; o.slot = d.slot; }
  if (d.uzasadnienie !== undefined) { const u = d.uzasadnienie; if (!u || typeof u !== 'object') return null; o.uzasadnienie = {}; for (const k of ['zgodnosci', 'rozbieznosci', 'sprzecznosci', 'braki']) { if (u[k] !== undefined && !osListaTekst(u[k])) return null; o.uzasadnienie[k] = u[k] || []; } }
  if (d.formy !== undefined) { if (!osListaTekst(d.formy)) return null; o.formy = d.formy; }
  return o; }
// plik/kopia → {ok:[...], bledy:[...]}; numery unikalne, „cofnij” musi wskazywać istniejący wpis
function osWaliduj(lista, znane){ const ok = [], bledy = [], nry = new Set(); if (!Array.isArray(lista)) return {ok, bledy: ['Brak listy decyzji.']};
  lista.forEach((d, i) => { const x = osCzyscDec(d, znane); if (!x) return bledy.push('wpis ' + (i + 1) + ': błędna lub niepełna decyzja'); if (nry.has(x.n)) return bledy.push('wpis ' + (i + 1) + ': powtórzony numer ' + x.n); nry.add(x.n); ok.push(x); });
  const dobre = ok.filter(x => x.typ !== 'cofnij' || nry.has(x.cofa)); if (dobre.length < ok.length) bledy.push('cofnięcia bez decyzji docelowej: ' + (ok.length - dobre.length));
  return {ok: dobre, bledy}; }
// dopisanie decyzji z kopii/pliku do dziennika: pomija identyczne (ten sam czas, typ, a, b), reszcie nadaje nowe numery (z przemapowaniem „cofa”)
function osDopiszDecyzje(L, nowe){ const mapa = {}, klucz = d => [d.t, d.typ, d.a || '', d.b || '', d.cofa || ''].join('|'); let dodane = 0, pominiete = 0;
  const maja = new Map(L.map(d => [klucz(Object.assign({}, d, {cofa: ''})), d.n]));
  nowe.slice().sort((x, y) => x.n - y.n).forEach(d => { const k = klucz(Object.assign({}, d, {cofa: d.typ === 'cofnij' ? (mapa[d.cofa] || d.cofa) : ''})); const ist = d.typ !== 'cofnij' && maja.get(klucz(Object.assign({}, d, {cofa: ''})));
    if (ist) { mapa[d.n] = ist; pominiete++; return; }
    if (d.typ === 'cofnij' && L.some(x => x.typ === 'cofnij' && x.cofa === (mapa[d.cofa] || d.cofa))) { pominiete++; return; }
    const e = Object.assign({}, d); e.n = L.reduce((m, x) => Math.max(m, x.n), 0) + 1; mapa[d.n] = e.n; if (d.typ === 'cofnij') e.cofa = mapa[d.cofa] || d.cofa; L.push(e); maja.set(klucz(Object.assign({}, e, {cofa: ''})), e.n); dodane++; });
  return {dodane, pominiete}; }
// zapisz decyzję z kontrolą spójności; zwraca {ok, blad, dec}
// typ: scal | odrzuc | odloz | brak | wariant_nazwiska | odrzuc_wariant; u = uzasadnienie z porównania (obiekt jak z idKandydaci/porownajProfile) albo null
function osDecyduj(L, typ, a, b, opt){ opt = opt || {}; const u = opt.u || null, why = String(opt.why || '').trim(), A = decAktywne(L).find(d => d.typ === typ && decKlucz(d.a, d.b) === decKlucz(a, b));
  if (A && typ !== 'odloz') return {ok: false, blad: 'Ta decyzja już obowiązuje (nr ' + A.n + ').'};
  if (typ === 'scal' || typ === 'odrzuc' || typ === 'odloz') {
    if (opt.akty && opt.akty[a] === opt.akty[b]) return {ok: false, blad: 'Dwa wystąpienia z tego samego aktu nie są jedną osobą.'};
    const K = decKlastry(L);
    if (typ === 'scal') { if (K.czyja[a] && K.czyja[a] === K.czyja[b]) return {ok: false, blad: 'Już należą do jednej osoby.'};
      const kol = decKolizje(L, a, b); if (kol.length) return {ok: false, blad: 'Nie można scalić: w połączonej osobie znalazłaby się para wcześniej oznaczona jako różne osoby (' + kol.length + '). Najpierw cofnij tamtą decyzję.', kolizje: kol};
      if (u && (u.wniosek !== 'sprawdz') && why.length < 5) return {ok: false, blad: 'Scalenie propozycji innej niż „sprawdź” (' + (OS_WN[u.wniosek] || u.wniosek) + ') wymaga powodu (min. 5 znaków).', trzebaPowod: true};
      if (u && u.sprzecznosci && u.sprzecznosci.length && why.length < 5) return {ok: false, blad: 'Para ma sprzeczność logiczną – wpisz wyjaśnienie, dlaczego mimo to to ta sama osoba.', trzebaPowod: true}; }
    if (typ === 'odrzuc' && K.czyja[a] && K.czyja[a] === K.czyja[b]) return {ok: false, blad: 'Te wystąpienia są w jednej osobie – najpierw cofnij scalenie.'}; }
  const d = {typ, a, b: b || '', wniosek: u ? u.wniosek : (opt.wniosek || ''), reguly: u ? u.reguly : (opt.reguly || 0), why, uzasadnienie: u ? osUzas(u) : (opt.uzasadnienie || {zgodnosci: [], rozbieznosci: [], sprzecznosci: [], braki: []})};
  if (opt.formy) d.formy = opt.formy; if (opt.zr) d.zr = opt.zr; if (opt.slot) d.slot = opt.slot; if (!d.why) delete d.why;
  return {ok: true, dec: decNowa(L, d)}; }
function osCofnij(L, n, why){ const d = L.find(x => x.n === n), akt = decAktywne(L); if (!d || d.typ === 'cofnij') return {ok: false, blad: 'Nie ma takiej decyzji.'}; if (!akt.some(x => x.n === n)) return {ok: false, blad: 'Decyzja nr ' + n + ' już nie obowiązuje.'};
  const e = {typ: 'cofnij', cofa: n}; if (why) e.why = String(why).slice(0, 1000); return {ok: true, dec: decNowa(L, e)}; }
// klasy wariantów nazwisk z aktywnych decyzji „wariant_nazwiska”: {klasy:{klucz k2: 'k:<n>'}, czlonkowie:{'k:<n>': [zapisy]}}; klucz = k2 z norm.js (porNazwiska sprawdza klasy[k2] || klasy[k1])
function osKlasy(L){ const par = {}, f = x => par[x] === undefined || par[x] === x ? (par[x] = x) : (par[x] = f(par[x])), zapis = {}, dn = {};
  const akt = decAktywne(L).filter(d => d.typ === 'wariant_nazwiska'); akt.forEach(d => { const ka = kluczNazwiska(d.a.slice(2)), kb = kluczNazwiska(d.b.slice(2)); if (!ka || !kb) return; (zapis[ka.k2] = zapis[ka.k2] || new Set()).add(d.a.slice(2)); (zapis[kb.k2] = zapis[kb.k2] || new Set()).add(d.b.slice(2)); par[f(ka.k2)] = f(kb.k2); });
  const G = {}; Object.keys(par).forEach(k => (G[f(k)] = G[f(k)] || []).push(k)); const klasy = {}, czlonkowie = {};
  Object.values(G).forEach(ks => { if (ks.length < 2) return; const ns = akt.filter(d => { const k = kluczNazwiska(d.a.slice(2)); return k && ks.includes(k.k2); }).map(d => d.n), id = 'k:' + Math.min(...ns); ks.forEach(k => klasy[k] = id); czlonkowie[id] = [].concat(...ks.map(k => [...zapis[k]])).sort(); });
  return {klasy, czlonkowie}; }
// zapis nazwiska → rdzeń po odjęciu końcówki pochodnej (Paluchowski → Paluch); null, gdy nie ma czego odjąć
const osRdzenNazw = k1 => { const m = /^(.{4,}?)(owski|ewski|ski|cki|dzki|owicz|ewicz)$/.exec(k1); return m ? m[1] : null; };
// kandydaci na klasy wariantów (do decyzji użytkownika; NIC nie jest klasą bez decyzji): pary kluczy k2, które nie są jeszcze równe, a mają wspólny rdzeń
//  „pochodne” – jedno z nich to drugie z końcówką -ski/-owski/-icz (Paluch / Paluchowski, Paluchowska); „podobne” – klucze (lub rdzenie) różnią się jedną literą (Paluch / Paruch)
function osWarianty(E, wylacz){ const G = new Map(); wylacz = wylacz || new Set();
  E.PL.forEach(p => [p.nazwisko, p.rodowe].forEach(v => { const c = normCzysc(v); if (!c || /\s/.test(c) || c.length < 3) return; const k = kluczNazwiska(c); if (!k) return; const kk = E.klasy[k.k2] || k.k2; let g = G.get(kk); if (!g) G.set(kk, g = {kk, k1: k.k1, k2: k.k2, formy: {}, n: 0, przyklad: []}); g.formy[c] = (g.formy[c] || 0) + 1; g.n++; if (g.przyklad.length < 3) g.przyklad.push(p.id); }));
  const MALE = zapBudujMale([...G.values()].flatMap(g => Object.keys(g.formy)).sort()), grupy = [...G.values()].map(g => { const f = Object.keys(g.formy).sort((x, y) => g.formy[y] - g.formy[x]); g.glowna = f[0]; const m = zapMaleNazwisko(f[0], '', MALE); g.meska = m ? m[0] : f[0]; const rd = osRdzenNazw(g.k1); g.rdzen = rd; g.k2r = rd ? (kluczNazwiska(rd) || {}).k2 || null : null; return g; });
  const poK2 = new Map(grupy.map(g => [g.k2, g])), wyn = new Map(), dodaj = (a, b, rodzaj, powod) => { if (a === b || a.kk === b.kk) return; const k = a.kk < b.kk ? a.kk + '|' + b.kk : b.kk + '|' + a.kk; if (wyn.has(k) || wylacz.has(k)) return; wyn.set(k, {a: a.glowna, b: b.glowna, formyA: a.formy, formyB: b.formy, nA: a.n, nB: b.n, rodzaj, powod, przykladA: a.przyklad, przykladB: b.przyklad, kluczA: a.kk, kluczB: b.kk}); };
  grupy.forEach(g => { if (g.k2r && poK2.has(g.k2r)) { const o = poK2.get(g.k2r); dodaj(o, g, 'pochodne', '„' + g.glowna + '” = „' + o.glowna + '” + końcówka pochodna (-' + g.k1.slice(g.rdzen.length) + '); rdzeń zgodny'); } });
  const kub = new Map(); grupy.forEach(g => [g.k2, g.k2r].filter(Boolean).forEach(k => { if (k.length < 5) return; const b = k[0] + k.length; (kub.get(b) || kub.set(b, []).get(b)).push([k, g]); }));
  grupy.forEach(g => [g.k2, g.k2r].filter(Boolean).forEach(k => { if (k.length < 5) return; for (const dl of [-1, 0, 1]) (kub.get(k[0] + (k.length + dl)) || []).forEach(([k2, h]) => { if (h.kk <= g.kk || k2 === k || lev(k, k2, 1) > 1) return; dodaj(g, h, 'podobne', 'klucze pisowni różnią się jedną literą: „' + k + '” / „' + k2 + '”' + (k !== g.k2 || k2 !== h.k2 ? ' (po odjęciu końcówki pochodnej)' : '') + ' – sprawdź na skanie, to bywają różne nazwiska'); }); }));
  return [...wyn.values()].sort((x, y) => (x.rodzaj === y.rodzaj ? 0 : x.rodzaj === 'pochodne' ? -1 : 1) || Math.min(y.nA, y.nB) - Math.min(x.nA, x.nB) || (y.nA + y.nB) - (x.nA + x.nB)); }
