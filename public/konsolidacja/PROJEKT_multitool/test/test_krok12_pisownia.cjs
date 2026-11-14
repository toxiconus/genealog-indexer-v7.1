/* Test: Menu → Pisownia nazwisk w czasie. node test/test_krok12_pisownia.cjs */
const { chromium } = require('playwright'), assert = require('assert'), path = require('path');
(async () => { const b = await chromium.launch(), p = await b.newPage({viewport: {width: 1280, height: 900}}), er = []; p.on('pageerror', e => er.push(e.message));
 await p.goto('file://' + path.join(__dirname, '..', 'app', 'multitool_v1.html')); await p.waitForFunction('GOTOWE === true', null, {timeout: 60000});
 await p.click('#bMenu'); await p.click('#mPisownia'); await p.waitForSelector('#okno .pisL'); const n = await p.$$eval('[data-pg]', a => a.length); assert(n > 0, 'grupy: ' + n);
 await p.click('[data-pg]'); await p.waitForSelector('#pisK .pors-t'); assert(await p.$$eval('#pisK [data-pc]', a => a.length) > 0);
 await p.click('#pisK [data-pc]'); await p.waitForSelector('#pisA [data-ps]'); const c = await p.$$('#pisA [data-ps]'); if (c.length >= 2) { await c[0].check(); await c[1].check(); await p.click('#pisObok'); await p.waitForSelector('#okno .skdwa'); }
 assert.strictEqual(er.length, 0, er.join()); console.log('OK grup:', n); await b.close(); })().catch(e => { console.error(e.message); process.exit(1); });
