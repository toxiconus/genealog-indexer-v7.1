/* app/moduly/migracja_zgony.js – krok 4 planu: migracja zatwierdzeń ZGONÓW z plików CSV do stanu roboczego (IndexedDB).
   Zakres: tylko zgony. Źródłem są pliki CSV (eksport ZGONY_zweryfikowane_10.csv + nakładka zatwierdzenia_uzytkownika.csv), nie pamięć przeglądarki.
   Wczytanie rzędów: istniejący import (import_csv.js: csvImportRozpoznaj / csvImportStosuj, tryb „dopisz” – pola już zatwierdzone nie są ruszane).
   Kolejność: najpierw pełny eksport, potem nakładka (nakładka nadpisuje tylko pola niezatwierdzone). Stare dane (pliki CSV, localStorage starych narzędzi, haiku/ZATWIERDZENIA/) nie są zmieniane.
   Procedura: plan (próba na kopii stanu, nic nie jest zapisywane) → migawka → zastosowanie → jeden zapis (stFlush: pola, teksty, akty, historia, slowniki, meta + raport w jednej transakcji) → odczyt kontrolny z IndexedDB.
   Idempotencja: ponowne uruchomienie z tymi samymi plikami nie zmienia stanu (bez migawki, bez nowych wpisów historii); zapisuje się tylko licznik uruchomień w raporcie.
   Niezmapowane id (brak w danych) trafiają z pełną treścią wiersza do raportu (pole `osierocone`), nie przepadają. Plik ZGONY_zweryfikowane_AKTUALNE.csv jest odrzucany: rozbieżność 155 ok vs 8 ok czeka na decyzję użytkownika. */
const MIGR_ZG_KLUCZ = 'migracja_zgony', MIGR_ZG_WER = 1, MIGR_ZG_OSIEROCONE_MAX = 500;
const migrZgPamiec = {};
// cecha stanu bez pola `baza` (dopisywanego przy zapisie) – do wykrycia „bez zmian”
const migrZgPodpis = acts => JSON.stringify(acts, (k, v) => k === 'baza' ? undefined : v);
function migrZgLiczby(Sx, nHist){ let pola = 0, polaOk = 0, polaOkCsv = 0, akty = 0, gotowe = 0, teksty = 0;
  for (const id in Sx.acts) { const a = Sx.acts[id] || {}; let n = 0; for (const f in (a.f || {})) { n++; pola++; if (a.f[f].ok) { polaOk++; if (a.f[f].src === 'csv') polaOkCsv++; } } if (n) akty++; if (a.done) gotowe++; if (a.text != null) teksty++; }
  return {pola, polaOk, polaOkCsv, akty, gotowe, teksty, historia: nHist}; }
async function migrZgSuma(txt){ try { const b = new TextEncoder().encode(txt), d = await crypto.subtle.digest('SHA-256', b); return [...new Uint8Array(d)].map(x => x.toString(16).padStart(2, '0')).join(''); } catch (e) { return ''; } }
// rozpoznanie jednego pliku: {nazwa, bytes, sha256, format, etykieta, w, wierszy, ok, rozpoznanych, nieznane[], bledy[], duplikaty, blad}
async function migrZgRozpoznaj(nazwa, txt){ const p = {nazwa, bytes: new Blob([txt]).size, sha256: await migrZgSuma(txt), format: 'nieznany', etykieta: '', w: null, wierszy: 0, ok: 0, rozpoznanych: 0, nieznane: [], bledy: [], duplikaty: 0, blad: ''};
  if (/AKTUALNE/i.test(nazwa)) { p.blad = 'Plik „' + nazwa + '” to nierozstrzygnięta rozbieżność (155 ok vs 8 ok w eksporcie _10). Nie jest migrowany, dopóki użytkownik nie zdecyduje.'; return p; }
  const w = csvImportRozpoznaj(txt); if (!w.ok) { p.blad = w.blad; return p; }
  const H = Object.keys(w.ix); if (!['death_year', 'death_act_number', 'verification_status'].every(k => H.includes(k))) { p.blad = 'To nie jest CSV zgonów (brak kolumn death_year, death_act_number, verification_status). Małżeństwa i urodzenia nie są migrowane.'; return p; }
  p.format = (H.includes('scan_path') || H.includes('act_text')) ? 'eksport' : 'nakladka'; p.etykieta = p.format === 'eksport' ? 'eksport CSV zgonów (pełny)' : 'nakładka zatwierdzeń użytkownika';
  const R = parseCsv(String(txt).replace(/^﻿/, '')).slice(1).filter(r => !(r.length === 1 && !String(r[0]).trim())); p.wierszy = R.length; p.ok = R.filter(r => (r[w.ix.verification_status] || '') === 'ok').length;
  const widziane = new Set(); R.forEach(r => { const id = String(r[w.ix.id] || '').trim(); if (widziane.has(id)) p.duplikaty++; widziane.add(id); });
  p.w = w; p.rozpoznanych = w.wiersze.length; p.nieznane = w.nieznane.slice(); p.bledy = w.bledy.slice();
  p.osierocone = w.nieznane.length ? R.filter(r => w.nieznane.includes(String(r[w.ix.id] || '').trim())).slice(0, MIGR_ZG_OSIEROCONE_MAX).map(r => { const o = {}; Object.keys(w.ix).forEach(k => o[k] = r[w.ix[k]] ?? ''); return {plik: nazwa, id: o.id, wiersz: o}; }) : [];
  return p; }
const migrZgKolej = P => P.slice().sort((a, b) => (a.format === 'eksport' ? 0 : 1) - (b.format === 'eksport' ? 0 : 1));   // stabilne: eksport przed nakładką
function migrZgStosuj(P){ return P.map(p => csvImportStosuj(p.w, false)); }
// plan: próba na kopii stanu; zwraca {blad} albo {pliki, przed, oczekiwane, bezZmian, nadpisane, osierocone, lacznieNieznanych}
async function migrZgPlan(pliki){ const P = []; for (const f of pliki) P.push(await migrZgRozpoznaj(f.nazwa, f.tekst));
  const zle = P.filter(p => p.blad); if (zle.length) return {blad: zle.map(p => p.nazwa + ': ' + p.blad).join(' | '), pliki: P}; if (!P.length) return {blad: 'Nie wybrano plików.', pliki: P};
  const kol = migrZgKolej(P), nSnap = histSnap(S.acts), nHist = (S.hist || []).length + histDiff(HS || nSnap, nSnap).length, przed = migrZgLiczby(S, nHist), podpisPrzed = migrZgPodpis(S.acts);
  const bakS = S, bakSF = D.scanFiles; let Sk, wyn; try { S = structuredClone(S); D.scanFiles = JSON.parse(JSON.stringify(D.scanFiles || {})); wyn = migrZgStosuj(kol); Sk = S; } finally { S = bakS; D.scanFiles = bakSF; }
  const roz = histDiff(nSnap, histSnap(Sk.acts)), oczek = migrZgLiczby(Sk, nHist + roz.length);
  return {pliki: kol, przed, oczekiwane: oczek, bezZmian: migrZgPodpis(Sk.acts) === podpisPrzed, nowychWpisowHistorii: roz.length, nadpisanePola: roz.filter(e => e.k === 'f' && e.before != null).length, importy: wyn,
    osierocone: kol.flatMap(p => p.osierocone || []).slice(0, MIGR_ZG_OSIEROCONE_MAX), nieznanychId: kol.reduce((s, p) => s + p.nieznane.length, 0)}; }
function migrZgOpisPlik(p){ return {nazwa: p.nazwa, format: p.format, etykieta: p.etykieta, bytes: p.bytes, sha256: p.sha256, wierszy: p.wierszy, ok: p.ok, rozpoznanych: p.rozpoznanych, nieznane: p.nieznane.length, bledneWiersze: p.bledy.length, duplikatyId: p.duplikaty}; }
async function migrZgOdczytIDB(){ const R = {pola: 0, polaOk: 0, polaOkCsv: 0, akty: 0, gotowe: 0, teksty: 0, historia: 0}, ak = new Set();
  const [P, T, A, H] = await Promise.all(['pola', 'teksty', 'akty', 'historia'].map(stWszystko));
  P.forEach(([k, x]) => { R.pola++; ak.add(k.slice(0, k.lastIndexOf('|'))); if (x.ok) { R.polaOk++; if (x.src === 'csv') R.polaOkCsv++; } }); R.akty = ak.size; R.teksty = T.length; R.historia = H.length; R.gotowe = A.filter(([id, x]) => x && x.done).length; return R; }
function migrZgZapisMeta(r){ ST_DODATKI.push(['meta', MIGR_ZG_KLUCZ, r]); return stFlush(false); }
async function migrZgOdczytajRaport(){ if (ST_TRYB === 'pamiec') return migrZgPamiec[MIGR_ZG_KLUCZ] || null; try { const M = await stWszystko('meta'); const x = M.find(([k]) => k === MIGR_ZG_KLUCZ); return x ? x[1] : null; } catch (e) { return null; } }
// wykonanie: pliki = [{nazwa, tekst}]; zwraca raport (zapisany w meta['migracja_zgony'])
async function migrZgWykonaj(pliki){ const plan = await migrZgPlan(pliki); if (plan.blad) return {ok: false, blad: plan.blad};
  const poprzedni = await migrZgOdczytajRaport(), t = new Date().toISOString(), opis = plan.pliki.map(p => p.nazwa).join(' + ');
  const r = {format: {nazwa: 'multitool-migracja-zgony', wersja: MIGR_ZG_WER}, zakres: 'zgony', zapisano: t, uruchomien: ((poprzedni && poprzedni.uruchomien) || 0) + 1, pierwszeUruchomienie: (poprzedni && poprzedni.pierwszeUruchomienie) || t,
    pliki: plan.pliki.map(migrZgOpisPlik), przed: plan.przed, oczekiwane: plan.oczekiwane, bezZmian: plan.bezZmian, nowychWpisowHistorii: plan.nowychWpisowHistorii, nadpisanePola: plan.nadpisanePola, nieznanychId: plan.nieznanychId, osierocone: plan.osierocone,
    migawka: '', tryb: ST_TRYB, uwagi: ['Nierozstrzygnięte: ZGONY_zweryfikowane_AKTUALNE.csv (155 ok) kontra _10 (8 ok) – nie migrowano, nie łączono.', 'Stare dane nietknięte: pliki CSV w haiku/ i pamięć starych narzędzi nie są zmieniane.']};
  if (plan.bezZmian) { r.po = plan.przed; r.zgodne = true; r.komunikat = 'Stan już zawiera te dane – bez zmian (bez migawki, bez nowych wpisów historii).'; if (ST_TRYB === 'pamiec') migrZgPamiec[MIGR_ZG_KLUCZ] = r; else await migrZgZapisMeta(r); r.ok = true; return r; }
  histCommit(); r.migawka = await kopiaMigawka('przed migracją zgonów z CSV: ' + opis);
  const bazy = {}; for (const id in S.acts) for (const f in (S.acts[id].f || {})) if (S.acts[id].f[f].baza !== undefined) bazy[id + '|' + f] = S.acts[id].f[f].baza;
  HIST_WHY = 'migracja zgonów z CSV: ' + opis; try { migrZgStosuj(plan.pliki); for (const id in S.acts) for (const f in (S.acts[id].f || {})) { const x = S.acts[id].f[f], k = id + '|' + f; if (x.baza === undefined && k in bazy) x.baza = bazy[k]; } histCommit(); } finally { HIST_WHY = null; }
  r.po = migrZgLiczby(S, (S.hist || []).length); r.zgodne = JSON.stringify(r.po) === JSON.stringify(r.oczekiwane);
  if (ST_TRYB === 'pamiec') migrZgPamiec[MIGR_ZG_KLUCZ] = r; else ST_DODATKI.push(['meta', MIGR_ZG_KLUCZ, r]);
  await stFlush(true);   // jedna transakcja: pola, teksty, akty, historia, slowniki, meta + raport
  if (ST_TRYB === 'idb') { r.odczytIDB = await migrZgOdczytIDB(); r.zgodneZIDB = ['pola', 'polaOk', 'polaOkCsv', 'akty', 'gotowe', 'teksty', 'historia'].every(k => r.odczytIDB[k] === r.po[k]); await migrZgZapisMeta(r); }
  r.ok = true; return r; }
function migrZgRaportTekst(r){ const L = [], l = s => L.push(s), L1 = (e, o) => e + ': pól ' + o.pola + ' (ok ' + o.polaOk + ', w tym z CSV ' + o.polaOkCsv + '), aktów z polami ' + o.akty + ', aktów gotowych ' + o.gotowe + ', tekstów ' + o.teksty + ', wpisów historii ' + o.historia;
  l('# Raport migracji zgonów z CSV'); l(''); l('Zapisano: ' + r.zapisano + ' · uruchomień: ' + r.uruchomien + ' · tryb zapisu: ' + r.tryb); if (r.komunikat) l(r.komunikat); if (r.migawka) l('Migawka przed zapisem: ' + r.migawka); l('');
  l('## Pliki'); r.pliki.forEach(p => l('- ' + p.nazwa + ' (' + p.etykieta + ', ' + p.bytes + ' B, sha256 ' + (p.sha256 || '—') + '): wierszy ' + p.wierszy + ', ok ' + p.ok + ', rozpoznanych ' + p.rozpoznanych + ', nieznanych id ' + p.nieznane + ', błędnych wierszy ' + p.bledneWiersze + ', duplikatów id ' + p.duplikatyId)); l('');
  l('## Liczby'); l('- ' + L1('Przed', r.przed)); l('- ' + L1('Oczekiwane (próba na kopii)', r.oczekiwane)); l('- ' + L1('Po (pamięć)', r.po)); if (r.odczytIDB) l('- ' + L1('Po (odczyt z IndexedDB)', r.odczytIDB));
  l('- Zgodność oczekiwane = po: ' + (r.zgodne ? 'TAK' : 'NIE') + (r.odczytIDB ? '; po = IndexedDB: ' + (r.zgodneZIDB ? 'TAK' : 'NIE') : '')); l('- Nowe wpisy historii: ' + r.nowychWpisowHistorii + '; nadpisane istniejące pola niezatwierdzone: ' + r.nadpisanePola); l('- Niezmapowane id: ' + r.nieznanychId + (r.osierocone.length ? ' (pełne wiersze w polu „osierocone” raportu JSON)' : '')); l('');
  l('## Uwagi'); r.uwagi.forEach(u => l('- ' + u)); return L.join('\n') + '\n'; }
