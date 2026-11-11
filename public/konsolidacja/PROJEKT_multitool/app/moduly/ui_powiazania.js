/* app/moduly/ui_powiazania.js – karta aktu: sekcja „W innych aktach” (potwierdzenia krzyżowe).
   Dla każdej osoby z aktu (zmarły, dziecko, młodzi, rodzice, małżonek) pokazuje: (1) akty już połączone decyzją „scal” wraz z kontrolą zgodności wieku i dat,
   (2) propozycje silnika z zakładki Osoby (te same reguły), z przyciskami „ta sama osoba” / „różne osoby” – decyzja zapisuje się w dzienniku decyzji i da się cofnąć w zakładce Osoby.
   Program niczego nie przenosi między aktami: pola aktu mówią tylko to, co jest w tym akcie; inne akty są pokazane obok jako potwierdzenie albo sprzeczność.
   Silnik (model wszystkich aktów) przelicza się w tle, gdy dane się zmieniły – karta aktu nie czeka. HTML wyłącznie przez wstaw(h`…`). */
const XR = {t: null, LIM: 4};
const xrSwiezy = () => DRZ.G && DRZ.sig === (S.histN || 0) + '|' + (S.decyz || []).length + '|' + D.wszystkie.length;
const XR_TYP = {zgon: 'zgon', malzenstwo: 'ślub', chrzest: 'chrzest'};
const xrAkt = w => { const p = DRZ.G.P[w], a = p && AM[p.akt]; return a ? (XR_TYP[a.typ] || a.typ) + ' ' + a.year + ' nr ' + a.act + (a.parafia ? ' (' + a.parafia + ')' : '') : ''; };
function xrefSekcja(a){ return h`<details class="txt" id="xrefDet" ${S.xOpen === false ? '' : raw('open')}><summary>W innych aktach <span class="muted" id="xrefIle"></span></summary><div id="xrefTresc"><span class="muted">Szukam powiązań…</span></div></details>`; }
function xrefPodlacz(a){ const det = $('xrefDet'); if (!det) return; det.ontoggle = () => { S.xOpen = det.open; if (det.open) xrefPlanuj(a); }; xrefPlanuj(a); }
// przeliczenie w tle: od razu, gdy silnik jest aktualny; inaczej po chwili bezczynności (żeby nie przerywać pisania)
function xrefPlanuj(a){ clearTimeout(XR.t); const det = $('xrefDet'); if (!det || !det.open) return; if (xrSwiezy() && DRZ.E) return xrefRysuj(a);
  XR.t = setTimeout(() => { const el = document.activeElement; if (el && el.dataset && el.dataset.f && el.value !== String(getv(a, el.dataset.f) ?? '')) return xrefPlanuj(a); if (S.cur !== a.id || !wAktach()) return; xrefRysuj(a); }, DRZ.G ? 700 : 150); }
function xrefDane(a){ const G = drzGraf(), E = drzSilnik(), K = decKlastry(S.decyz), W = G.poAkcie[a.id] || [], out = [];
  W.forEach(w => { const p = G.P[w], id = G.wezel(w), inne = (G.czlonkowie[id] || []).filter(x => x !== w), kand = [], seen = new Set();
    osKandydaci(E, w).forEach(u => { const c = G.wezel(u.b); if (c === id || seen.has(c) || (u.wniosek !== 'sprawdz' && u.wniosek !== 'mozliwe') || K.odrzucone.has(decKlucz(w, u.b))) return; seen.add(c); if (u.wniosek === 'mozliwe' && u.rozbieznosci.some(x => x.istotna)) return; kand.push(u); });
    out.push({w, p, id, inne, kand}); });
  const kontr = kontWiekOsob({P: G.P, czlonkowie: Object.fromEntries(out.filter(o => o.inne.length).map(o => [o.id, G.czlonkowie[o.id]]))});
  return {G, out, kontr}; }
function xrefRysuj(a){ const box = $('xrefTresc'); if (!box || S.cur !== a.id) return; let X; try { X = xrefDane(a); } catch (e) { wstaw(box, h`<span class="err">Nie udało się policzyć powiązań: ${e.message}</span>`); return; }
  const G = X.G, potw = X.out.reduce((n, o) => n + o.inne.length, 0), mocne = X.out.reduce((n, o) => n + o.kand.filter(u => u.wniosek === 'sprawdz').length, 0), moz = X.out.reduce((n, o) => n + o.kand.filter(u => u.wniosek === 'mozliwe').length, 0);
  const il = $('xrefIle'); if (il) il.textContent = '· potwierdzone: ' + potw + ' · mocne propozycje: ' + mocne + ' · możliwe: ' + moz;
  XR.flat = [];
  const wiersz = (o, u) => { const i = XR.flat.push({a: o.w, b: u.b, u}) - 1, q = G.P[u.b]; return h`<div class="xprop" data-xb="${u.b}"><div class="xgl"><span class="bdg ${u.wniosek === 'sprawdz' ? 'ok' : 'un'}">${OS_WN[u.wniosek]}</span> <button class="lk" data-xakt="${u.b}">${xrAkt(u.b)}</button> <span class="muted">– ${RDZ_ROLA[q.rolaAktu] || q.rolaAktu}: ${(q.imie || '?') + ' ' + (q.nazwisko || '')}${q.rodowe ? ' z d. ' + q.rodowe : ''}${q.wiek ? ', wiek ' + q.wiek : ''}</span>
      <span class="sp"></span><button class="sm" data-xdec="scal" data-i="${i}" title="Zapisz decyzję: to ta sama osoba">ta sama osoba</button><button class="sm" data-xdec="odrzuc" data-i="${i}" title="Zapisz decyzję: to różne osoby (propozycja zniknie)">różne osoby</button></div>
      <div class="muted">zgadza się: ${u.zgodnosci.map(x => x.t).join('; ')}</div>${u.rozbieznosci.length ? h`<div class="err xroz">różni się: ${u.rozbieznosci.map(x => x.t).join('; ')}</div>` : ''}</div>`; };
  const czesc = X.out.filter(o => o.inne.length || o.kand.length).map(o => { const k = o.kand.slice(0, XR.LIM), sygn = X.kontr.filter(x => x.id === o.id);
    return h`<h3 class="blok">${RDZ_ROLA[o.p.rolaAktu] || o.p.rolaAktu}: ${(o.p.imie || '?') + ' ' + (o.p.nazwisko || (o.p.rodowe ? 'z d. ' + o.p.rodowe : ''))} <button class="lk" data-xos="${o.id}" title="Pokaż tę osobę w zakładce Drzewo">drzewo</button></h3>
      ${o.inne.length ? h`<div class="xpotw">${o.inne.map(w => h`<div>✓ potwierdzone decyzją: <button class="lk" data-xakt="${w}">${xrAkt(w)}</button> <span class="muted">– ${RDZ_ROLA[G.P[w].rolaAktu] || G.P[w].rolaAktu}${G.P[w].wiek ? ', wiek ' + G.P[w].wiek : ''}</span></div>`)}</div>` : ''}
      ${sygn.length ? h`<div class="warn">${sygn.map(x => h`<div>⚠ ${x.msg}</div>`)}</div>` : ''}
      ${k.length ? h`<div class="xrefTab">${k.map(u => wiersz(o, u))}</div>${o.kand.length > k.length ? h`<div class="muted">…i ${o.kand.length - k.length} dalszych propozycji – <button class="lk" data-xwiecej="${o.w}">pokaż w zakładce Osoby</button></div>` : ''}` : ''}`; });
  wstaw(box, czesc.length ? h`<div class="muted">Pola tego aktu pokazują tylko to, co jest w tym akcie. Poniżej inne akty tych samych osób: połączone Twoją decyzją albo proponowane do sprawdzenia.</div>${czesc}` : h`<span class="muted" id="xrefPusto">Nie znaleziono tych osób w innych aktach (zgony, małżeństwa, chrzty w bazie).</span>`);
  box.querySelectorAll('[data-xakt]').forEach(b => b.onclick = () => osOtworzAkt(b.dataset.xakt));
  box.querySelectorAll('[data-xos]').forEach(b => b.onclick = () => { zaklUstaw('drzewo'); drzIdz(b.dataset.xos); });
  box.querySelectorAll('[data-xwiecej]').forEach(b => b.onclick = () => { const c = DRZ.G.wezel(b.dataset.xwiecej); OSS.widok = 'prop'; OSS.flt = 'mozliwe'; OSS.q = ''; zaklUstaw('osoby'); osWybierz(c); });
  box.querySelectorAll('[data-xdec]').forEach(b => b.onclick = () => xrefDecyzja(a, b.dataset.xdec, XR.flat[+b.dataset.i])); }
function xrefDecyzja(a, typ, x){ if (!x) return; let opt = {u: x.u, akty: osAktyMapa()}, r = osDecyduj(S.decyz, typ, x.a, x.b, opt);
  if (!r.ok && r.trzebaPowod) { const why = prompt(r.blad + '\n\nPowód (np. „zgodny wiek i rodzice na skanie”):', ''); if (why == null) return; opt.why = why; r = osDecyduj(S.decyz, typ, x.a, x.b, opt); }
  if (!r.ok) return toast(r.blad, 6000); OSS.cache = null; OSS.KL = decKlastry(S.decyz); save(); toast(typ === 'scal' ? 'Zapisano: ta sama osoba. Cofniesz to w zakładce Osoby → Decyzje.' : 'Zapisano: różne osoby. Propozycja nie będzie już pokazywana.'); xrefRysuj(a); }
