/* Test „Skan → akty”: pojedynczy skan, ustawienia folderu, dopisanie / dobranie aktów, następny numer, okładka, rozpoznanie po sumie kontrolnej.
   Uruchom: node test/test_krok8_skan_akty.cjs   (wymaga zbudowanego app/multitool_v1.html) */
const { chromium } = require('playwright'); const assert = require('assert'); const path = require('path');
const APP = 'file://' + path.join(__dirname, '..', 'app', 'multitool_v1.html');
const PNG = ['iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR4nGM4ISd3Qk4OAAh3Agl9JFcwAAAAAElFTkSuQmCC', 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR4nGOQOyEnd0IOAAcjAgkJkJn/AAAAAElFTkSuQmCC', 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR4nGOQkzshJ3cCAAXPAgnT9vJeAAAAAElFTkSuQmCC'].map(x => Buffer.from(x, 'base64'));
let ok = 0; const pass = m => { ok++; console.log('OK  ' + m); };
(async () => {
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 1400, height: 900 } }), p = await ctx.newPage(); p.bledy = [];
  p.on('pageerror', e => p.bledy.push(e.message)); p.on('console', m => m.type() === 'error' && p.bledy.push(m.text())); p.on('dialog', d => d.accept());
  await p.goto(APP); await p.waitForFunction('GOTOWE === true', null, { timeout: 60000 });
  const wczytaj = async (nazwa, buf) => { const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.click('[data-klik="nSkanAkty"]')]); await fc.setFiles({ name: nazwa, mimeType: 'image/png', buffer: buf }); await p.waitForSelector('#spTyp'); };
  await p.click('#zNarz'); const nm = await p.evaluate(() => { const L = D.wszystkie.filter(a => a.typ === 'malzenstwo' && !a.parafia), rok = +L[0].year, N = L.filter(a => +a.year === rok).map(a => parseInt(a.act, 10)).filter(Number.isFinite), m = Math.max(...N); return { rok, m, ile: D.wszystkie.length, ma: !!L.find(a => +a.year === rok && parseInt(a.act, 10) === m), ilosc: L.length }; });
  // 1. skan nr 2 (nr 1 to okładka): typ i rok odgadnięte z nazwy folderu, nr skanu z nazwy
  await wczytaj('malzenstwa_1944_0002.png', PNG[0]);
  assert.strictEqual(await p.inputValue('#spTyp'), 'malzenstwo'); assert.strictEqual(await p.inputValue('#spRok'), '1944'); assert.strictEqual(await p.inputValue('#spNrP'), '2');
  pass('wczytanie pojedynczego skanu: typ aktu, rok i numer skanu odgadnięte z nazwy pliku');
  // 2. plan: pierwszy akt istnieje (dobierze skan), drugi jest nowy (dopisze)
  await p.fill('#spRok', String(nm.rok)); await p.fill('#spOd', String(nm.m)); await p.fill('#spIle', '2');
  const st1 = await p.evaluate(() => [...document.querySelectorAll('#spTab tr[data-stan]')].map(r => r.dataset.stan)); assert.strictEqual(st1.length, 2); assert.strictEqual(st1[1], 'nowy'); assert(['dobierz', 'inny'].includes(st1[0]), 'istniejący akt: ' + st1[0]);
  pass('plan skanu: istniejący akt dostaje skan, brakujący jest dopisywany (' + st1.join(', ') + ')');
  // 3. zastosowanie: skan przypisany, nowy akt z numerem, profil folderu zapamiętany
  const przed = await p.evaluate(() => D.wszystkie.length); await p.fill('#spPierw', ''); await p.click('#spZastosuj'); await p.waitForFunction(() => document.getElementById('okno').hidden === true);
  const po = await p.evaluate(({ rok, m }) => { const a1 = D.wszystkie.find(a => a.typ === 'malzenstwo' && !a.parafia && +a.year === rok && parseInt(a.act, 10) === m), a2 = D.wszystkie.find(a => a.typ === 'malzenstwo' && +a.year === rok && String(a.act) === String(m + 1)); return { n: D.wszystkie.length, s1: a1 && skanKlucz(a1), s2: a2 && S.acts[a2.id]?.scan, nowy: a2 && !!a2.nowy, h: a2 && S.acts[a2.id]?.scanH, prof: S.skProf['malzenstwa_1944'], cur: S.cur, id2: a2 && a2.id }; }, nm);
  assert.strictEqual(po.n, przed + 1); if (st1[0] === 'dobierz') assert.strictEqual(po.s1, 'malzenstwa_1944_0002.png'); assert.strictEqual(po.s2, 'malzenstwa_1944_0002.png'); assert(po.nowy);
  assert(/^[0-9a-f]{16}$/.test(po.h), 'suma kontrolna: ' + po.h); assert.strictEqual(po.prof.pierwszy, 2); assert.strictEqual(po.prof.ostPlik, 2); assert.strictEqual(po.prof.ostNr, nm.m + 1); assert(po.cur);
  pass('zastosowanie: nowy akt dopisany, skan i suma kontrolna zapisane, ustawienia folderu zapamiętane (pierwszy skan z aktami = 2)');
  // 4. następny skan tego samego folderu: numer pierwszego aktu liczy się sam, liczba aktów z profilu
  await p.click('#zNarz'); await wczytaj('malzenstwa_1944_0003.png', PNG[1]);
  assert.strictEqual(await p.inputValue('#spOd'), String(nm.m + 2)); assert.strictEqual(await p.inputValue('#spIle'), '2'); assert.strictEqual(await p.inputValue('#spPierw'), '2'); assert.strictEqual(await p.inputValue('#spTyp'), 'malzenstwo');
  pass('następny skan folderu: numer pierwszego aktu = ostatni + 1, format i liczba aktów z ustawień folderu');
  // 5. skan przed pierwszym skanem z aktami (okładka) – 0 aktów; pominięcie nie cofa licznika
  await p.click('#oknoX'); await p.click('#zNarz'); await wczytaj('malzenstwa_1944_0001.png', PNG[2]);
  assert.strictEqual(await p.inputValue('#spIle'), '0'); assert.strictEqual(await p.locator('#spPusty').count(), 1); const nA = await p.evaluate(() => D.wszystkie.length);
  await p.click('#spPomin'); await p.waitForTimeout(300); assert.strictEqual(await p.evaluate(() => D.wszystkie.length), nA); const pr = await p.evaluate(() => S.skProf['malzenstwa_1944']); assert.strictEqual(pr.ostPlik, 2); assert.strictEqual(pr.ostNr, nm.m + 1);
  pass('okładka (skan przed pierwszym skanem z aktami): 0 aktów, nic się nie dopisuje, licznik folderu bez zmian');
  // 6. ten sam skan jeszcze raz: akty z tym skanem są podpowiedziane, plan „ten skan już przypisany”, nic się nie dubluje
  await p.click('#oknoX'); await p.click('#zNarz'); await wczytaj('malzenstwa_1944_0002.png', PNG[0]);
  assert.strictEqual(await p.inputValue('#spOd'), String(nm.m)); const st2 = await p.evaluate(() => [...document.querySelectorAll('#spTab tr[data-stan]')].map(r => r.dataset.stan)); assert(st2.every(x => x === 'ten-sam' || x === 'dobierz'), st2.join());
  const n2 = await p.evaluate(() => D.wszystkie.length); await p.click('#spZastosuj'); await p.waitForFunction(() => document.getElementById('okno').hidden === true); assert.strictEqual(await p.evaluate(() => D.wszystkie.length), n2);
  pass('ten sam skan ponownie: podpowiada swoje akty i niczego nie dubluje');
  // 7. konflikt: inny skan przy istniejącym akcie – domyślnie zostaje, „zastąp” zmienia
  await p.click('#zNarz'); await wczytaj('malzenstwa_1944_0003.png', PNG[1]); await p.fill('#spOd', String(nm.m)); await p.fill('#spIle', '1');
  assert.strictEqual(await p.evaluate(() => document.querySelector('#spTab tr[data-stan]').dataset.stan), 'inny'); await p.click('#spZastosuj'); await p.waitForFunction(() => document.getElementById('okno').hidden === true);
  const s0 = await p.evaluate(nm0 => { const a = D.wszystkie.find(a => a.typ === 'malzenstwo' && !a.parafia && +a.year === nm0.rok && parseInt(a.act, 10) === nm0.m); return skanKlucz(a); }, nm); assert.notStrictEqual(s0, 'malzenstwa_1944_0003.png');
  await p.click('#zNarz'); await wczytaj('malzenstwa_1944_0003.png', PNG[1]); await p.fill('#spOd', String(nm.m)); await p.fill('#spIle', '1'); await p.check('[data-zast]'); await p.click('#spZastosuj'); await p.waitForFunction(() => document.getElementById('okno').hidden === true);
  assert.strictEqual(await p.evaluate(nm0 => { const a = D.wszystkie.find(a => a.typ === 'malzenstwo' && !a.parafia && +a.year === nm0.rok && parseInt(a.act, 10) === nm0.m); return skanKlucz(a); }, nm), 'malzenstwa_1944_0003.png');
  pass('akt z innym skanem: domyślnie bez zmian, po zaznaczeniu „zastąp skan” skan się zmienia');
  // 8. rozpoznanie po sumie kontrolnej przy zmienionej nazwie pliku
  const r = await p.evaluate(async buf => { const bytes = Uint8Array.from(atob(buf), c => c.charCodeAt(0)), f = new File([bytes], 'zupelnie_inna_nazwa.png', { type: 'image/png' }); const id = Object.keys(S.acts).find(k => S.acts[k].scanH && S.acts[k].scan === 'malzenstwa_1944_0003.png'); skanWybierzFolder([f]); await new Promise(r => setTimeout(r, 500)); const a = AM[id]; const z = skanZnajdz(a); return { id: !!id, z: z && z.name }; }, PNG[1].toString('base64'));
  assert(r.id, 'brak aktu z sumą'); assert.strictEqual(r.z, 'zupelnie_inna_nazwa.png'); pass('skan zmienionej nazwy rozpoznany po sumie kontrolnej zawartości');
  // 8b. nazwa skanu w danych bez rozszerzenia („M1944_01”) i plik z rozszerzeniem: skan się znajduje, okno z karty aktu proponuje właśnie ten akt
  await p.click('#zAkty'); const idA = await p.evaluate(() => { const a = D.wszystkie.find(a => a.typ === 'malzenstwo' && !a.parafia && !a.nowy); st(a.id).scan = 'M1944_01'; save(); return a.id; });
  const znal = await p.evaluate(async ({ buf, id }) => { const f = new File([Uint8Array.from(atob(buf), c => c.charCodeAt(0))], 'M1944_01.jpg', { type: 'image/jpeg' }); skanWybierzFolder([f]); osOtworzAkt('w:' + id + ':x'); renderAkt(); const z = skanZnajdz(AM[id]); return z && z.name; }, { buf: PNG[0].toString('base64'), id: idA });
  assert.strictEqual(znal, 'M1944_01.jpg'); assert.strictEqual(await p.locator('#skStan').count(), 0, 'komunikat „nie znaleziono pliku” mimo pasującego pliku');
  await p.click('#skAktyOkno'); await p.waitForSelector('#spTyp'); const aA = await p.evaluate(id => ({ nr: String(parseInt(AM[id].act, 10)), rok: String(AM[id].year) }), idA);
  assert.strictEqual(await p.inputValue('#spOd'), aA.nr); assert.strictEqual(await p.inputValue('#spRok'), aA.rok); assert.strictEqual(await p.evaluate(() => document.querySelector('#spTab tr[data-stan]').dataset.stan), 'ten-sam');
  pass('skan z nazwą bez rozszerzenia w danych: znaleziony, a okno z karty aktu dotyczy oglądanego aktu (' + aA.rok + ' nr ' + aA.nr + ')');
  // 8c. plik o zupełnie innej nazwie: skan z bazy, którego nie ma w wczytanych plikach, zostaje domyślnie zastąpiony wczytanym
  await p.click('#oknoX'); await p.evaluate(buf => { const f = new File([Uint8Array.from(atob(buf), c => c.charCodeAt(0))], 'IMG_77.png', { type: 'image/png' }); skanWybierzFolder([f]); renderAkt(); }, PNG[2].toString('base64'));
  await p.click('#skAktyOkno'); await p.waitForSelector('#spTab'); assert.strictEqual(await p.evaluate(() => document.querySelector('#spTab tr[data-stan]').dataset.stan), 'inny'); assert.strictEqual(await p.locator('[data-zast]').isChecked(), true);
  await p.click('#spZastosuj'); await p.waitForFunction(() => document.getElementById('okno').hidden === true); assert.strictEqual(await p.evaluate(id => skanKlucz(AM[id]), idA), 'IMG_77.png');
  pass('plik o innej nazwie: skan z bazy, którego nie ma w wczytanych plikach, zastąpiony wczytanym (zaznaczone domyślnie)');
  // 8d. plik z samych cyfr („001.jpg”): typ i rok odgadywane z wpisanej nazwy folderu; plan pokazuje nazwę aktu, otwiera się akt wskazanego typu (nie pierwszy zgon)
  await p.click('#zNarz'); await p.evaluate(() => typUstaw('zgon')); await wczytaj('001.jpg', PNG[1]); assert.strictEqual(await p.inputValue('#spKlucz'), '(pliki numerowane)'); assert.strictEqual(await p.inputValue('#spTyp'), 'zgon');
  const cel = await p.evaluate(() => { const a = D.wszystkie.find(a => a.typ === 'malzenstwo' && !a.parafia && !a.nowy && +a.year > 1800); return { id: a.id, rok: String(a.year), nr: String(parseInt(a.act, 10)) }; });
  await p.fill('#spKlucz', 'Małżeństwa ' + cel.rok + '-' + (+cel.rok + 1) + ' USC Szastarka'); assert.strictEqual(await p.inputValue('#spTyp'), 'malzenstwo'); assert.strictEqual(await p.inputValue('#spRok'), cel.rok);
  await p.fill('#spOd', cel.nr); await p.fill('#spIle', '1'); assert((await p.locator('#spTab tbody tr[data-stan] td').nth(1).innerText()).length > 1, 'plan bez nazwy aktu');
  await p.click('#spZastosuj'); await p.waitForFunction(() => document.getElementById('okno').hidden === true); const po8 = await p.evaluate(() => ({ typ: D.typ, cur: S.cur, nazwa: S.skProf && S.skProfNum })); assert.strictEqual(po8.cur, cel.id); assert.strictEqual(po8.typ, 'malzenstwo'); assert(po8.nazwa && /Małżeństwa/.test(po8.nazwa));
  pass('plik „001.jpg”: typ i rok z wpisanej nazwy folderu, plan z nazwą aktu, po zastosowaniu otwiera się wskazany akt (nie pierwszy zgon)');
  // 9. zapis trwały: po przeładowaniu zostają nowy akt, skan i profil folderu
  await p.evaluate(() => save()); await p.waitForTimeout(800); await p.reload(); await p.waitForFunction('GOTOWE === true', null, { timeout: 60000 });
  const tr = await p.evaluate(nm0 => ({ prof: !!(S.skProf && S.skProf['malzenstwa_1944']), nowy: !!D.wszystkie.find(a => a.nowy && a.typ === 'malzenstwo' && +a.year === nm0.rok && String(a.act) === String(nm0.m + 1)) }), nm); assert(tr.prof && tr.nowy, JSON.stringify(tr));
  pass('po przeładowaniu: ustawienia folderu i dopisany akt są zachowane');
  assert.deepStrictEqual(p.bledy, [], 'błędy strony: ' + p.bledy.join(' | ')); pass('bez błędów w konsoli'); await b.close(); console.log('\nWSZYSTKO OK (' + ok + ' kontroli)');
})().catch(e => { console.error('BŁĄD:', e.message); process.exit(1); });
