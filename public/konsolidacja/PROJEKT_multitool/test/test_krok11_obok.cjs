/* Test: Osoby → karta propozycji: „Dane obok siebie” (tabela, podświetlenie zgodności/różnic) i „Skany obok siebie” (okno z dwoma panelami). node test/test_krok11_obok.cjs */
const { chromium } = require('playwright'), assert = require('assert'), path = require('path');
(async () => { const b = await chromium.launch(), p = await b.newPage({viewport: {width: 1280, height: 900}}), er = []; p.on('pageerror', e => er.push(e.message));
 await p.goto('file://' + path.join(__dirname, '..', 'app', 'multitool_v1.html')); await p.waitForFunction('GOTOWE === true', null, {timeout: 60000});
 await p.click('#zOsoby'); await p.waitForFunction('OSS.gotowe === true', null, {timeout: 180000}); await p.selectOption('#osWidok', 'prop'); await p.waitForSelector('#lista .it'); await p.click('#lista .it'); await p.waitForSelector('.osprop');
 const t = await p.$$eval('.osprop .pors-t', a => a.length); assert(t >= 1, 'tabela obok siebie'); const wiersze = await p.$$eval('.osprop .pors-t tr', a => a.length); assert(wiersze >= 5, 'wiersze: ' + wiersze);
 const kol = await p.$$eval('.osprop .pors-t tr.ok, .osprop .pors-t tr.ne', a => a.length); assert(kol >= 1, 'podświetlenie');
 await p.click('.osprop[data-i="0"] button[data-a="skany"]'); await p.waitForSelector('#okno .skdwa .skpan'); assert.strictEqual(await p.$$eval('#okno .skpan', a => a.length), 2);
 assert(/Brak skanu/.test(await p.innerText('#okno')), 'bez folderu skanów: komunikat'); await p.click('#oknoX');
 assert.strictEqual(er.length, 0, er.join()); console.log('OK'); await b.close(); })().catch(e => { console.error(e.message); process.exit(1); });
