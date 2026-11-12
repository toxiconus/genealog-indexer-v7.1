/* Test: Multitool mini (telefon) → paczka JSON → import w Multitoolu → szukanie skanów po sumie kontrolnej (inna nazwa pliku na dysku).
   Uruchom: node test/test_krok9_mini.cjs   (wymaga app/multitool_mini.html i app/multitool_v1.html) */
const { chromium } = require('playwright'), assert = require('assert'), path = require('path'), fs = require('fs'), crypto = require('crypto');
const MINI = 'file://' + path.join(__dirname, '..', 'app', 'multitool_mini.html'), APP = 'file://' + path.join(__dirname, '..', 'app', 'multitool_v1.html');
const PNG = ['iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR4nGM4ISd3Qk4OAAh3Agl9JFcwAAAAAElFTkSuQmCC', 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR4nGOQOyEnd0IOAAcjAgkJkJn/AAAAAElFTkSuQmCC'].map(x => Buffer.from(x, 'base64'));
const sha = b => crypto.createHash('sha256').update(b).digest('hex').slice(0, 16);
let ok = 0; const pass = m => { ok++; console.log('OK  ' + m); };
(async () => {
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 390, height: 800 }, acceptDownloads: true }), m = await ctx.newPage(); const bl = [];
  m.on('pageerror', e => bl.push(e.message)); m.on('console', x => x.type() === 'error' && bl.push(x.text()));
  await m.goto(MINI);
  await m.setInputFiles('#fFoto', [{ name: 'IMG_0001.png', mimeType: 'image/png', buffer: PNG[0] }, { name: 'IMG_0002.png', mimeType: 'image/png', buffer: PNG[1] }]);
  await m.waitForFunction(() => document.querySelectorAll('#pas .m').length === 2);
  pass('mini: dwa zdjęcia dodane (' + (await m.textContent('#lic')) + ')');
  await m.setInputFiles('#fFoto', [{ name: 'kopia_IMG_0001.png', mimeType: 'image/png', buffer: PNG[0] }]); await m.waitForTimeout(300);
  assert.strictEqual(await m.locator('#pas .m').count(), 2); pass('mini: ten sam plik pod inną nazwą nie dubluje się (ta sama suma)');
  // akt 1 na skanie 1
  await m.click('#kAkt'); await m.selectOption('#dl select', 'zgon'); const inp = await m.locator('#dl input').all(); await inp[0].fill('1890'); await inp[1].fill('5'); await m.click('#dl button.pri');
  await m.waitForSelector('#main .pole input'); const first = m.locator('#main .pole input').first(); await first.fill('Kowalski'); await m.locator('#main .pole input').nth(1).fill('Jan'); await m.locator('#main .pole .q').nth(1).click();
  await m.click('#kAkt'); assert.strictEqual(await m.locator('#dl input').nth(1).inputValue(), '6'); pass('mini: numer następnego aktu podpowiada się sam (5 → 6)'); await m.locator('#dl input').nth(1).fill('6'); await m.click('#dl button.pri');
  await m.waitForFunction(() => /nr 6/.test(document.querySelector('#main .box b').textContent)); await m.locator('#main .pole input').first().fill('[_]'); await m.waitForTimeout(600);
  await m.click('#bMenu'); await m.click('#dl button:has-text("Eksport")'); const [dl] = await Promise.all([m.waitForEvent('download'), m.click('#dl button:has-text("Pobierz")')]); const p = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  assert.strictEqual(p.format.nazwa, 'multitool-mini'); assert.strictEqual(p.skany.length, 2); assert.strictEqual(p.akty.length, 2);
  assert.strictEqual(p.skany[0].h, sha(PNG[0])); assert.strictEqual(p.skany[1].h, sha(PNG[1])); assert.strictEqual(p.skany[0].rozmiar, PNG[0].length); pass('mini: suma kontrolna w paczce = SHA-256 pliku (' + p.skany[0].h + '), rozmiar zapisany');
  const a5 = p.akty.find(a => a.nr === '5'); assert.strictEqual(a5.pola.deceased_last_name.v, 'Kowalski'); assert(a5.pola.deceased_first_name.u === 1, 'niepewne pole'); assert.strictEqual(p.akty.find(a => a.nr === '6').pola.deceased_last_name.v, '[_]'); pass('mini: pola, znacznik niepewności i [_] w paczce');
  await m.reload(); await m.waitForSelector('#pas .m'); assert.strictEqual(await m.locator('#pas .m').count(), 2); pass('mini: dane zostają po przeładowaniu strony (IndexedDB)');
  assert.deepStrictEqual(bl, [], 'błędy w konsoli mini: ' + bl.join(' | '));
  // ---- Multitool: import paczki ----
  const t = await ctx.newPage(); const bt = []; t.on('pageerror', e => bt.push(e.message)); t.on('dialog', d => d.accept()); await t.goto(APP); await t.waitForFunction('GOTOWE === true', null, { timeout: 60000 });
  await t.click('#zNarz'); const [fc] = await Promise.all([t.waitForEvent('filechooser'), t.click('[data-klik="nMini"]')]); await fc.setFiles({ name: 'pak.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(p)) });
  await t.waitForSelector('#miTab'); assert.strictEqual(await t.locator('#miTab tr[data-stan]').count(), 2); pass('Multitool: podgląd paczki (2 akty)');
  const przed = await t.evaluate(() => D.wszystkie.length); await t.click('#miZastosuj'); await t.waitForSelector('#miOk');
  const po = await t.evaluate(() => { const a = D.wszystkie.find(x => x.typ === 'zgon' && !x.parafia && +x.year === 1890 && String(x.act) === '5'); return { n: D.wszystkie.length, nowy: !!(a && a.nowy), nazw: a && getv(a, 'deceased_last_name'), unc: a && S.acts[a.id].f.deceased_first_name.unc, h: a && S.acts[a.id].scanH, sz: a && S.acts[a.id].scanSz, scan: a && S.acts[a.id].scan }; });
  assert.strictEqual(po.n, przed + 2); assert(po.nowy); assert.strictEqual(po.nazw, 'Kowalski'); assert.strictEqual(po.unc, true); assert.strictEqual(po.h, sha(PNG[0])); assert.strictEqual(po.sz, PNG[0].length); assert.strictEqual(po.scan, 'IMG_0001.png'); pass('Multitool: akty dopisane z polami (niepewne zachowane), suma i rozmiar skanu zapisane');
  // ---- folder na dysku: inna nazwa, w podfolderze, plus „śmieci” o innym rozmiarze i o tym samym rozmiarze ----
  const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'skany-')); fs.mkdirSync(path.join(dir, 'Zgony', '1890'), { recursive: true }); fs.writeFileSync(path.join(dir, 'Zgony', '1890', '0150.png'), PNG[0]); fs.writeFileSync(path.join(dir, 'Zgony', '1890', '0151.png'), Buffer.concat([PNG[0].subarray(0, PNG[0].length - 1), Buffer.from([1])])); fs.writeFileSync(path.join(dir, 'Zgony', 'inny.txt'), 'x');
  const pliki = []; const walk = (d, rel) => fs.readdirSync(d, { withFileTypes: true }).forEach(e => e.isDirectory() ? walk(path.join(d, e.name), rel + e.name + '/') : pliki.push({ name: e.name, rel: rel + e.name, buf: fs.readFileSync(path.join(d, e.name)) })); walk(dir, 'skany/');
  const znal = await t.evaluate(async (L) => { const F = L.map(x => { const f = new File([Uint8Array.from(atob(x.b64), c => c.charCodeAt(0))], x.name); Object.defineProperty(f, 'webkitRelativePath', { value: x.rel }); return f; });
    const dt = new DataTransfer(); F.forEach(f => dt.items.add(f)); const i = document.getElementById('fMiFolder'); i.files = dt.files; i.dispatchEvent(new Event('change')); return true; }, pliki.map(x => ({ name: x.name, rel: x.rel, b64: x.buf.toString('base64') })));
  await t.waitForSelector('#miZn'); const wiersze = await t.evaluate(() => [...document.querySelectorAll('#miZnTab tr')].slice(1).map(r => [/nie znaleziono/.test(r.cells[1].textContent) ? '0' : '1', r.cells[1].textContent]));
  assert.strictEqual(wiersze[0][0], '1'); assert(/Zgony\/1890\/0150\.png/.test(wiersze[0][1]), wiersze[0][1]); assert.strictEqual(wiersze.length, 1); pass('Multitool: skan z telefonu (IMG_0001.png) znaleziony na dysku jako ' + wiersze[0][1] + ' po sumie kontrolnej (plik o tym samym rozmiarze, ale innej zawartości, pominięty)');
  const sc = await t.evaluate(() => { const a = D.wszystkie.find(x => x.typ === 'zgon' && !x.parafia && +x.year === 1890 && String(x.act) === '5'); return S.acts[a.id].scan; }); assert(/Zgony\/1890\/0150\.png$/.test(sc)); pass('Multitool: przy akcie zapisana ścieżka z dysku');
  // trwałość
  await t.reload(); await t.waitForFunction('GOTOWE === true', null, { timeout: 60000 }); const trw = await t.evaluate(() => { const a = D.wszystkie.find(x => x.typ === 'zgon' && !x.parafia && +x.year === 1890 && String(x.act) === '5'); return a && [S.acts[a.id].scanH, S.acts[a.id].scanSz, getv(a, 'deceased_last_name')]; });
  assert.deepStrictEqual(trw, [sha(PNG[0]), PNG[0].length, 'Kowalski']); pass('Multitool: po przeładowaniu akt, suma i rozmiar zachowane');
  assert.deepStrictEqual(bt, [], 'błędy: ' + bt.join(' | ')); pass('bez błędów w konsoli'); console.log('\nWSZYSTKO OK (' + ok + ' kontroli)'); await b.close();
})().catch(e => { console.error('BŁĄD', e.message); process.exit(1); });
