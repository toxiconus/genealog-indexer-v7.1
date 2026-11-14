/* Test: menu ▾ znaczników, podpowiedzi, kontrola margines↔akt, pola † , ukrywanie (mini małżeństw). node test/test_krok10_pomoce.cjs */
const { chromium } = require('playwright'), assert = require('assert'), path = require('path');
(async () => { const b = await chromium.launch(), p = await b.newPage({viewport: {width: 420, height: 900}}), er = []; p.on('pageerror', e => er.push(e.message));
 await p.goto('file://' + path.join(__dirname, '..', 'app', 'multitool_mini_malzenstwa.html')); await p.waitForSelector('#lista .li');
 await p.evaluate(() => { otwarty = {rok: 1944, nr: '23'}; rys(); });
 await p.waitForSelector('.pole');
 const poz = id => `.pole:has([aria-label="${id}"])`;
 // pola †
 assert(await p.evaluate(() => [...document.querySelectorAll('summary')].some(s => /† Zgon na marginesie/.test(s.textContent))), 'brak bloku †');
 // menu ▾
 const pole = await p.$('.pole:has(input)'); await (await pole.$('.ar')).evaluate(e => e.click());
 assert((await pole.$$('.mi')).length >= 8, 'menu znaczników'); await (await pole.$$('.mi'))[1].evaluate(e => e.click());
 assert(/^\[/.test(await (await pole.$('input')).inputValue()), 'wstawiony znacznik');
 // podpowiedzi
 await p.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true)); const im = await p.$('.pole:has(input[aria-label*="Pan młody – imię"]) input'); await im.evaluate(e => { e.focus(); e.value = 'W'; e.dispatchEvent(new Event('input')); });
 const ch = await p.$$eval('.pole:has(input[aria-label*="Pan młody – imię"]) .sug .ch', a => a.map(x => x.textContent)); assert(ch.length >= 3 && ch.every(x => /^W/i.test(x)), 'podpowiedzi: ' + ch);
 // podobne + auto-zwijanie
 await im.evaluate(e => { e.focus(); e.value = 'Wojciec'; e.dispatchEvent(new Event('input')); e.blur(); });
 const sim = await p.$$eval('.pole:has(input[aria-label*="Pan młody – imię"]) .sim .ch', a => a.map(x => x.textContent)); assert(sim.some(x => /^Wojciech/.test(x)), 'podobne: ' + sim);
 await p.evaluate(() => document.querySelector('.pole:has(input[aria-label*="Pan młody – imię"]) .sim .ch').click());
 assert(await p.$eval('.pole:has(input[aria-label*="Pan młody – imię"])', e => e.classList.contains('zw')), 'pole zwinięte po potwierdzeniu');
 await p.evaluate(() => document.querySelector('.pole.zw .zwv').click()); assert(!await p.$eval('.pole:has(input[aria-label*="Pan młody – imię"])', e => e.classList.contains('zw')), 'rozwija po kliknięciu');
 // margines vs akt
 const zg = await p.$$eval('.chk.ok, .chk.ne', a => a.map(x => x.textContent)); console.log('kontrola:', zg.slice(0, 4));
 assert(er.length === 0, er.join()); console.log('OK'); await b.close(); })().catch(e => { console.error(e); process.exit(1); });
