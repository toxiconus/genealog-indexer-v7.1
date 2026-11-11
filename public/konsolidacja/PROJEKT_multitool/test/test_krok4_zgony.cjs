/* Test odbioru kroku 4 planu Multitool – migracja zatwierdzeń ZGONÓW z CSV (app/moduly/migracja_zgony.js, ui_migracja.js).
   Uruchom: node test/test_krok4_zgony.cjs   (wymaga: npm i playwright; zbudowane app/multitool_v1.html – python3 app/zbuduj_app.py)
   Sprawdza: (A) rozpoznanie _10: 881 aktów, 8 ok; odrzucenie AKTUALNE i CSV spoza zgonów; (B) migracja przez UI (oba pliki): liczby po = oczekiwane = odczyt z IndexedDB, migawka przed zapisem, raport zapisany w bazie i jako plik;
   (C) trwałość po przeładowaniu; (D) idempotencja: ponowne uruchomienie (w tej samej sesji i po przeładowaniu) nie zmienia liczb, nie dubluje historii, nie tworzy migawki;
   (E) pliki w haiku/ZATWIERDZENIA i haiku/ODCZYTY nietknięte (sha256 przed/po); brak błędów JS. */
const { chromium } = require('playwright'); const assert = require('assert'); const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
const T = __dirname, APP = 'file://' + path.join(T, '..', 'app', 'multitool_v1.html'), HAIKU = path.join(T, '..', '..', 'haiku');
const CSV10 = path.join(HAIKU, 'ZATWIERDZENIA', 'ZGONY_zweryfikowane_10.csv'), NAKL = path.join(HAIKU, 'ODCZYTY', 'zatwierdzenia_uzytkownika.csv'), AKT = path.join(HAIKU, 'ZGONY_zweryfikowane_AKTUALNE.csv');
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'); const PRZED = [CSV10, NAKL, AKT].map(sha);
let ok = 0; const pass = m => { ok++; console.log('OK  ' + m); };
async function nowa(b) { const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true }); const p = await ctx.newPage(); p.bledy = []; p.on('pageerror', e => p.bledy.push(e.message)); p.on('console', m => m.type() === 'error' && p.bledy.push(m.text())); p.on('dialog', d => d.accept()); return p; }
async function otworz(p) { await p.goto(APP); await p.waitForFunction('GOTOWE === true', null, { timeout: 60000 }); }
async function uruchomUi(p, pliki) { if (await p.$('#oknoX').then(x => x && x.isVisible())) await p.click('#oknoX'); await p.click('#bMenu'); await p.click('#mMigr'); await p.waitForSelector('#migWybierz'); await p.setInputFiles('#fMigr', pliki); await p.waitForSelector('#migPodglad, #migBlad'); }
(async () => {
  const b = await chromium.launch(); const p = await nowa(b); await otworz(p);
  // ---------- A. rozpoznanie
  const A = await p.evaluate(async t => { const x = await migrZgRozpoznaj('ZGONY_zweryfikowane_10.csv', t); return { format: x.format, wierszy: x.wierszy, ok: x.ok, rozp: x.rozpoznanych, nieznane: x.nieznane.length, bledy: x.bledy.length, dup: x.duplikaty, blad: x.blad, sha: x.sha256 }; }, fs.readFileSync(CSV10, 'utf8'));
  assert.strictEqual(A.format, 'eksport'); assert.strictEqual(A.wierszy, 881); assert.strictEqual(A.ok, 8); assert.strictEqual(A.rozp, 881, 'wszystkie 881 id zmapowane: ' + JSON.stringify(A)); assert.strictEqual(A.nieznane, 0); assert.strictEqual(A.bledy, 0); assert.strictEqual(A.dup, 0);
  assert.strictEqual(A.sha, PRZED[0], 'sha256 w raporcie = sha256 pliku'); pass('import _10: 881 aktów (wszystkie zmapowane, 0 nieznanych, 0 duplikatów), 8 ok, sha256 zgodny z plikiem');
  const N = await p.evaluate(async t => { const x = await migrZgRozpoznaj('zatwierdzenia_uzytkownika.csv', t); return { format: x.format, wierszy: x.wierszy, ok: x.ok, rozp: x.rozpoznanych, nieznane: x.nieznane.length }; }, fs.readFileSync(NAKL, 'utf8'));
  assert.deepStrictEqual(N, { format: 'nakladka', wierszy: 441, ok: 8, rozp: 441, nieznane: 0 }); pass('nakładka: 441 aktów, 8 ok, wszystkie zmapowane');
  await uruchomUi(p, [AKT]); assert(/nierozstrzygni/.test(await p.innerText('#migBlad'))); pass('ZGONY_zweryfikowane_AKTUALNE.csv odrzucony (nierozstrzygnięta rozbieżność), nic nie zapisano');
  await uruchomUi(p, [{ name: 'malzenstwa.csv', mimeType: 'text/csv', buffer: Buffer.from('id;groom;bride\nx;a;b\n') }]); assert(/Nieznany format|nie jest CSV zgonów/.test(await p.innerText('#migBlad'))); pass('CSV spoza zgonów odrzucony');
  assert.strictEqual(await p.evaluate(async () => (await kopiaLista()).length), 0, 'odrzucone pliki nie tworzą migawek');
  // ---------- B. migracja przez UI (oba pliki naraz; nakładka podana pierwsza – kolejność ustala moduł)
  await uruchomUi(p, [NAKL, CSV10]); const podglad = await p.innerText('#migPodglad'); assert(/Nowych wpisów historii/.test(podglad), podglad);
  const przedStan = await p.evaluate(() => ({ polaIdb: null, s: Object.keys(S.acts).length, ls: localStorage.length })); await p.click('#migTak'); await p.waitForSelector('#migZgodne', {timeout: 60000}).catch(e => { throw new Error(e.message + ' JS: ' + p.bledy.join(' / ')); });
  const R = await p.evaluate(() => migrZgOdczytajRaport()); assert(R && R.zakres === 'zgony'); assert.strictEqual(R.pliki[0].format, 'eksport', 'eksport przed nakładką'); assert.strictEqual(R.zgodne, true, 'oczekiwane = po'); assert.strictEqual(R.zgodneZIDB, true, 'po = IndexedDB');
  assert.deepStrictEqual(R.po, R.oczekiwane); assert.deepStrictEqual(R.po, R.odczytIDB); assert.strictEqual(R.po.gotowe, 8); assert(R.po.polaOkCsv > 0 && R.po.polaOk >= R.po.polaOkCsv); assert(R.po.pola > 10000, 'pola: ' + R.po.pola); assert(R.po.akty >= 881);
  assert.strictEqual(R.nieznanychId, 0); assert(R.nowychWpisowHistorii > 0 && R.po.historia === R.przed.historia + R.nowychWpisowHistorii, 'historia'); assert.strictEqual(R.uruchomien, 1);
  pass('migracja UI: pola ' + R.po.pola + ', pola ok ' + R.po.polaOk + ' (z CSV ' + R.po.polaOkCsv + '), akty z polami ' + R.po.akty + ', akty gotowe ' + R.po.gotowe + ', teksty ' + R.po.teksty + ', wpisy historii ' + R.po.historia + ' – po = oczekiwane = odczyt z IndexedDB');
  console.log('RAPORT ' + JSON.stringify({ przed: R.przed, po: R.po, nadpisane: R.nadpisanePola, nowaHistoria: R.nowychWpisowHistorii, pliki: R.pliki.map(x => [x.nazwa, x.wierszy, x.ok, x.rozpoznanych]) }));
  const mig = await p.evaluate(async () => (await kopiaLista()).map(x => x.powod)); assert.strictEqual(mig.length, 1); assert(/przed migracją zgonów/.test(mig[0])); assert(R.migawka); pass('przed zapisem powstała dokładnie jedna migawka: "' + mig[0].slice(0, 60) + '…"');
  const dl = await Promise.all([p.waitForEvent('download'), p.click('#migZapiszRaport')]); const tekst = fs.readFileSync(await dl[0].path(), 'utf8'); assert(/Raport migracji zgonów/.test(tekst) && /Zgodność oczekiwane = po: TAK; po = IndexedDB: TAK/.test(tekst) && /AKTUALNE/.test(tekst)); pass('raport zapisany do pliku .md (' + tekst.length + ' znaków) i w bazie (meta)');
  // ---------- C. trwałość po przeładowaniu
  await p.reload(); await p.waitForFunction('GOTOWE === true'); const C = await p.evaluate(async () => ({ idb: await migrZgOdczytIDB(), pam: migrZgLiczby(S, S.hist.length), r: await migrZgOdczytajRaport() }));
  assert.deepStrictEqual(C.idb, R.po); assert.deepStrictEqual(C.pam, R.po); assert.strictEqual(C.r.uruchomien, 1); pass('po przeładowaniu stan i raport są w bazie, liczby bez zmian');
  // ---------- D. idempotencja: ponowne uruchomienie po przeładowaniu
  await uruchomUi(p, [CSV10, NAKL]); assert(/niczego nie zmieni/.test(await p.innerText('#migPodglad'))); await p.click('#migTak'); await p.waitForSelector('#migKomunikat');
  const D2 = await p.evaluate(async () => ({ idb: await migrZgOdczytIDB(), r: await migrZgOdczytajRaport(), mig: (await kopiaLista()).length }));
  assert.deepStrictEqual(D2.idb, R.po, 'liczby po ponownym uruchomieniu'); assert.strictEqual(D2.r.bezZmian, true); assert.strictEqual(D2.r.uruchomien, 2); assert.strictEqual(D2.mig, 1, 'bez nowej migawki'); pass('ponowne uruchomienie po przeładowaniu: bez zmian (historia ' + D2.idb.historia + ', pola ' + D2.idb.pola + '), bez nowej migawki, licznik uruchomień 2');
  // i jeszcze raz w tej samej sesji
  await uruchomUi(p, [CSV10, NAKL]); await p.click('#migTak'); await p.waitForSelector('#migKomunikat'); const D3 = await p.evaluate(async () => ({ idb: await migrZgOdczytIDB(), r: await migrZgOdczytajRaport(), mig: (await kopiaLista()).length, h: S.hist.length }));
  assert.deepStrictEqual(D3.idb, R.po); assert.strictEqual(D3.r.uruchomien, 3); assert.strictEqual(D3.mig, 1); assert.strictEqual(D3.h, R.po.historia); pass('trzecie uruchomienie w tej samej sesji: bez zmian, historia nie rośnie');
  // pojedynczy plik _10 po pełnej migracji też nic nie zmienia
  await uruchomUi(p, [CSV10]); assert(/niczego nie zmieni/.test(await p.innerText('#migPodglad'))); pass('sam eksport _10 po migracji: bez zmian');
  assert.deepStrictEqual(PRZED, [CSV10, NAKL, AKT].map(sha)); pass('pliki CSV w haiku/ (ZATWIERDZENIA, ODCZYTY, AKTUALNE) nietknięte (sha256 przed = po)');
  assert(p.bledy.length === 0, 'błędy JS: ' + p.bledy); await p.context().close(); await b.close();
  console.log('\n' + ok + ' kontroli OK');
})().catch(e => { console.error('BŁĄD: ' + (e.stack || e)); process.exit(1); });
