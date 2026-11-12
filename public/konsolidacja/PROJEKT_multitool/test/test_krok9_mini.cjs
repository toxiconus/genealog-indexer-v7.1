/* Test: Multitool mini (telefon, cała baza zgonów) → edycja + zdjęcie → paczka JSON → import w Multitoolu → szukanie skanu po sumie (inna nazwa pliku na dysku).
   Uruchom: node test/test_krok9_mini.cjs   (wymaga app/multitool_mini_zgony.html, app/multitool_mini_malzenstwa.html, app/multitool_mini_urodzenia.html i app/multitool_v1.html) */
const { chromium } = require('playwright'), assert = require('assert'), path = require('path'), fs = require('fs'), crypto = require('crypto'), os = require('os');
const A = f => 'file://' + path.join(__dirname, '..', 'app', f), MINI = A('multitool_mini_zgony.html'), APP = A('multitool_v1.html');
const PNG = ['iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR4nGM4ISd3Qk4OAAh3Agl9JFcwAAAAAElFTkSuQmCC', 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR4nGOQOyEnd0IOAAcjAgkJkJn/AAAAAElFTkSuQmCC'].map(x => Buffer.from(x, 'base64'));
const sha = b => crypto.createHash('sha256').update(b).digest('hex').slice(0, 16);
let ok = 0; const pass = m => { ok++; console.log('OK  ' + m); };
(async () => {
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 390, height: 800 }, acceptDownloads: true }), m = await ctx.newPage(); const bl = [];
  m.on('pageerror', e => bl.push(e.message)); m.on('console', x => x.type() === 'error' && bl.push(x.text()));
  // rozmiary i zawartość wszystkich trzech wersji
  for (const [f, n, min] of [['multitool_mini_zgony.html', 2842, 2500], ['multitool_mini_malzenstwa.html', 745, 700], ['multitool_mini_urodzenia.html', 5456, 5000]]) { await m.goto(A(f)); const k = await m.evaluate(() => [BAZA.length, BAZA.filter(a => a.ai).length, BAZA.filter(a => a.o).length, TYP]); assert.strictEqual(k[0], n); assert(k[0] > min); console.log('    ' + f + ': ' + k[0] + ' aktów, odczyty AI w aktach: ' + k[1] + ', odczyty Haiku (podgląd): ' + k[2]); if (k[3] === 'malzenstwo') assert(k[1] >= 25); if (k[3] === 'chrzest') assert.strictEqual(k[2], 77); if (k[3] === 'zgon') assert(k[1] > 800); }
  pass('trzy wersje mini mają wbudowaną całą bazę (zgony 2842, małżeństwa 745, urodzenia 5456) z odczytami AI/Haiku');
  await m.goto(MINI);
  const wzor = await m.evaluate(() => { const a = BAZA.find(x => x.ai && x.f.deceased_last_name && x.f.deceased_first_name); return { r: a.r, n: a.n, nazw: a.f.deceased_last_name, imie: a.f.deceased_first_name }; });
  await m.fill('#szuk', wzor.r + '/' + wzor.n); await m.waitForSelector('#lista .li'); assert.strictEqual(await m.locator('#lista .li').count(), 1); assert(/odczyt AI/.test(await m.textContent('#lista .li'))); pass('mini: wyszukiwanie „rok/nr” znajduje akt z odczytu AI (' + wzor.r + '/' + wzor.n + ' ' + wzor.nazw + ')');
  await m.fill('#szuk', wzor.nazw.slice(0, 5)); await m.waitForTimeout(200); assert((await m.locator('#lista .li').count()) >= 1); pass('mini: wyszukiwanie po nazwisku');
  await m.fill('#szuk', wzor.r + '/' + wzor.n); await m.click('#lista .li'); await m.waitForSelector('#main .pole input');
  assert.strictEqual(await m.locator('#main .pole input').first().inputValue(), wzor.nazw); pass('mini: formularz otwiera akt z wartościami z bazy');
  await m.locator('#main .pole input').first().fill(wzor.nazw + 'X'); await m.locator('#main .pole .q').nth(1).click();
  // zdjęcie przypisane do aktu
  await m.click('button:has-text("Skan…")'); await m.setInputFiles('#dl input[type=file]', [{ name: 'IMG_0001.png', mimeType: 'image/png', buffer: PNG[0] }]).catch(async () => { await m.click('#dl button:has-text("Dodaj zdjęcie")'); });
  await m.waitForSelector('.pg img'); pass('mini: zdjęcie dodane i przypisane do aktu');
  // nowy akt
  await m.click('button:has-text("‹ Lista")'); await m.click('button:has-text("Nowy akt")'); await m.locator('#dl input').nth(0).fill('1890'); const nr = await m.locator('#dl input').nth(1).inputValue(); await m.click('#dl button.pri'); await m.waitForSelector('#main .pole input');
  await m.locator('#main .pole input').first().fill('Testowy'); await m.waitForTimeout(600);
  await m.click('#bMenu'); await m.click('#dl button:has-text("Eksport")'); const [dl] = await Promise.all([m.waitForEvent('download'), m.click('#dl button:has-text("Pobierz")')]); const p = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  assert.strictEqual(p.typ, 'zgon'); assert.strictEqual(p.akty.length, 2); const e1 = p.akty.find(a => a.rok === wzor.r && a.nr === wzor.n), e2 = p.akty.find(a => a.rok === 1890);
  assert.strictEqual(e1.pola.deceased_last_name.v, wzor.nazw + 'X'); assert.strictEqual(e1.pola.deceased_last_name.b, wzor.nazw); assert.strictEqual(e1.h, sha(PNG[0])); assert.strictEqual(p.skany[0].rozmiar, PNG[0].length); assert.strictEqual(e2.pola.deceased_last_name.v, 'Testowy'); assert.strictEqual(e2.h, '');
  assert(Object.keys(e1.pola).length <= 3, 'w paczce tylko zmienione pola: ' + Object.keys(e1.pola)); pass('mini: paczka ma tylko zmienione pola (z wartością z bazy „b”), sumę kontrolną skanu = SHA-256 pliku, nowy akt ' + e2.rok + '/' + nr);
  await m.reload(); await m.fill('#szuk', wzor.r + '/' + wzor.n); await m.waitForSelector('#lista .li'); assert(/zmieniony/.test(await m.textContent('#lista .li'))); pass('mini: zmiany zostają po przeładowaniu (IndexedDB)');
  assert.deepStrictEqual(bl, [], 'błędy w konsoli mini: ' + bl.join(' | '));
  // ---- Multitool ----
  const t = await ctx.newPage(); const bt = []; t.on('pageerror', e => bt.push(e.message)); t.on('dialog', d => d.accept()); await t.goto(APP); await t.waitForFunction('GOTOWE === true', null, { timeout: 60000 });
  await t.click('#zNarz'); const [fc] = await Promise.all([t.waitForEvent('filechooser'), t.click('[data-klik="nMini"]')]); await fc.setFiles({ name: 'pak.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(p)) });
  await t.waitForSelector('#miTab'); assert.strictEqual(await t.locator('#miTab tr[data-stan]').count(), 2); assert.strictEqual(await t.locator('#miTab tr[data-stan="nowy"]').count(), 1); pass('Multitool: podgląd paczki (1 poprawiony akt z bazy, 1 nowy)');
  const przed = await t.evaluate(() => D.wszystkie.length); await t.click('#miZastosuj'); await t.waitForSelector('#miOk');
  const po = await t.evaluate(({ r, n }) => { const a = D.wszystkie.find(x => x.typ === 'zgon' && !x.parafia && +x.year === r && String(x.act) === n), z = D.wszystkie.find(x => x.typ === 'zgon' && !x.parafia && +x.year === 1890 && getv(x, 'deceased_last_name') === 'Testowy'); return { n: D.wszystkie.length, naz: getv(a, 'deceased_last_name'), ok: S.acts[a.id].f.deceased_last_name.ok, h: S.acts[a.id].scanH, sz: S.acts[a.id].scanSz, z: !!(z && z.nowy) }; }, { r: wzor.r, n: wzor.n });
  assert.strictEqual(po.n, przed + 1); assert.strictEqual(po.naz, wzor.nazw + 'X'); assert.strictEqual(po.ok, false); assert.strictEqual(po.h, sha(PNG[0])); assert.strictEqual(po.sz, PNG[0].length); assert(po.z); pass('Multitool: poprawka naniesiona (do sprawdzenia, nie zatwierdzona), nowy akt dopisany, suma i rozmiar skanu zapisane');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'skany-')); fs.mkdirSync(path.join(dir, 'Zgony', '1890'), { recursive: true }); fs.writeFileSync(path.join(dir, 'Zgony', '1890', '0150.png'), PNG[0]); fs.writeFileSync(path.join(dir, 'Zgony', '1890', '0151.png'), Buffer.concat([PNG[0].subarray(0, PNG[0].length - 1), Buffer.from([1])]));
  const pliki = []; const walk = (d, rel) => fs.readdirSync(d, { withFileTypes: true }).forEach(e => e.isDirectory() ? walk(path.join(d, e.name), rel + e.name + '/') : pliki.push({ name: e.name, rel: rel + e.name, b64: fs.readFileSync(path.join(d, e.name)).toString('base64') })); walk(dir, 'skany/');
  await t.evaluate(async L => { const dt = new DataTransfer(); L.forEach(x => { const f = new File([Uint8Array.from(atob(x.b64), c => c.charCodeAt(0))], x.name); Object.defineProperty(f, 'webkitRelativePath', { value: x.rel }); dt.items.add(f); }); const i = document.getElementById('fMiFolder'); i.files = dt.files; i.dispatchEvent(new Event('change')); }, pliki);
  await t.waitForSelector('#miZn'); const w = await t.evaluate(() => [...document.querySelectorAll('#miZnTab tr')].slice(1).map(r => r.cells[1].textContent)); assert.strictEqual(w.length, 1); assert(/Zgony\/1890\/0150\.png/.test(w[0]), w[0]); pass('Multitool: IMG_0001.png z telefonu znaleziony na dysku jako ' + w[0] + ' po sumie (plik o tym samym rozmiarze, ale innej zawartości, pominięty)');
  const zt = await t.evaluate(() => { const w = miniRozpoznaj(JSON.stringify({ format: { nazwa: 'multitool-mini', wersja: 2 }, skany: [], akty: [{ typ: 'zgon', rok: 1890, nr: '1', h: '', zatw: 1, pola: { deceased_first_name: { v: 'Adam' } } }] })); const R = miniStosuj(w), a = D.wszystkie.find(x => x.typ === 'zgon' && +x.year === 1890 && String(x.act) === '1'); return [R.zatw, !!S.acts[a.id].done, S.acts[a.id].f.deceased_first_name.ok]; });
  assert.deepStrictEqual(zt, [1, true, true]); pass('Multitool: akt zatwierdzony na telefonie dostaje status zatwierdzony (pola bez „?” zatwierdzone)'); await t.evaluate(() => save()); await t.waitForTimeout(500);
  await t.reload(); await t.waitForFunction('GOTOWE === true', null, { timeout: 60000 }); const trw = await t.evaluate(({ r, n }) => { const a = D.wszystkie.find(x => x.typ === 'zgon' && !x.parafia && +x.year === r && String(x.act) === n); return [S.acts[a.id].scanH, getv(a, 'deceased_last_name'), /Zgony\/1890\/0150\.png$/.test(S.acts[a.id].scan)]; }, { r: wzor.r, n: wzor.n });
  assert.deepStrictEqual(trw, [sha(PNG[0]), wzor.nazw + 'X', true]); pass('Multitool: po przeładowaniu poprawka, suma i ścieżka zachowane');
  assert.deepStrictEqual(bt, [], 'błędy: ' + bt.join(' | ')); pass('bez błędów w konsoli'); console.log('\nWSZYSTKO OK (' + ok + ' kontroli)'); await b.close();
})().catch(e => { console.error('BŁĄD', e.message); process.exit(1); });
