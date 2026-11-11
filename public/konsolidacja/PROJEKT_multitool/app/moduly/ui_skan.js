/* app/moduly/ui_skan.js – podgląd skanu aktu (krok 3): wybór folderu skanów (<input webkitdirectory>), obraz tylko lokalnie (File → URL.createObjectURL, nic nie jest wysyłane),
   przesuwanie/powiększanie, obszar aktu (ROI) i ramki pól – oba edytowalne (zapis w stanie: akty.roi, akty.fr), eksport ROI (menu). HTML wstawiany wyłącznie przez wstaw(h`…`). */
const SK = {pliki: [], url: {}, folder: '', auto: {}, plywajacy: false, zwiniety: false, schowany: false, v: {key: '', s: 1, x: 0, y: 0, iw: 1, ih: 1}, tryb: '', pole: '', rn: null};
const roiOk = r => !!r && typeof r === 'object' && ['x', 'y', 'w', 'h'].every(k => typeof r[k] === 'number' && isFinite(r[k])) && r.w > 0 && r.h > 0 && r.x >= 0 && r.y >= 0 && r.x + r.w <= 1.0001 && r.y + r.h <= 1.0001;
const frOf = (a, f) => (S.acts[a.id]?.fr?.[f]) || (a.pola && a.pola[f]) || null;
const skanKlucz = a => scanOf(a) || (SK.auto && SK.auto[a.year + '|' + parseInt(a.act, 10)]) || '';
const skanSciezka = a => { const k = skanKlucz(a); return k ? String((D.scanFiles || {})[k] || k) : ''; };
/* Indeks z nazw plików: „…_1873_akty_06-15.jpg” → akty 6–15 roku 1873; rok z nazwy (najbliższy przed „akty”), a przy „wykaz” – z nazwy folderu. */
function skanBudujIndeks(lista){ const M = {};
  lista.forEach(f => { const base = f.name, rel = f.webkitRelativePath || f.name, rokiSciezki = [...rel.matchAll(/(?:^|\D)(1[7-9]\d\d)(?!\d)/g)].map(x => +x[1]);
    const re = /akty_(\d+)-(\d+)/g; let m;
    while ((m = re.exec(base))) { const przed = base.slice(0, m.index), lata = [...przed.matchAll(/(?:^|\D)(1[7-9]\d\d)(?!\d)/g)].map(x => +x[1]);
      const rok = /wykaz/i.test(base) || !lata.length ? rokiSciezki[rokiSciezki.length - 1] : lata[lata.length - 1]; if (!rok) continue;
      for (let n = +m[1]; n <= +m[2]; n++) { const k = rok + '|' + n; if (!(k in M)) M[k] = base; } } });
  return M; }
const skanBase = p => String(p).split(/[\\/]/).pop().toLowerCase();
function skanZnajdz(a){ const p = skanSciezka(a); if (!p || !SK.pliki.length) return null; const b = skanBase(p), seg = p.toLowerCase().split(/[\\/]/).reverse();
  const C = SK.pliki.filter(f => f.name.toLowerCase() === b); if (!C.length) return null; if (C.length === 1) return C[0];
  const wsp = f => { const s = (f.webkitRelativePath || f.name).toLowerCase().split('/').reverse(); let n = 0; while (n < s.length && n < seg.length && s[n] === seg[n]) n++; return n; };
  return C.slice().sort((x, y) => wsp(y) - wsp(x))[0]; }
function skanUrl(f){ const k = (f.webkitRelativePath || f.name) + '|' + f.size + '|' + f.lastModified; if (!SK.url[k]) SK.url[k] = URL.createObjectURL(f); return SK.url[k]; }
function skanWybierzFolder(lista){ Object.values(SK.url).forEach(u => URL.revokeObjectURL(u)); SK.url = {}; SK.pliki = [...lista].filter(f => /\.(jpe?g|png|webp|gif|bmp|tiff?)$/i.test(f.name));
  const w = lista[0]?.webkitRelativePath; SK.folder = w ? w.split('/')[0] : ''; SK.auto = skanBudujIndeks(SK.pliki); SK.v.key = ''; return SK.pliki.length; }
const skanTransform = () => { const L = $('skLayer'); if (L) L.style.transform = `translate(${SK.v.x}px,${SK.v.y}px) scale(${SK.v.s})`; };
function skanRysuj(){ const L = $('skLayer'), a = curAct(); if (!L || !a) return; L.querySelectorAll('.skbox').forEach(e => e.remove()); const V = SK.v, box = (r, cls, w) => { const e = document.createElement('div'); e.className = 'skbox ' + cls; Object.assign(e.style, {left: r.x * V.iw + 'px', top: r.y * V.ih + 'px', width: r.w * V.iw + 'px', height: r.h * V.ih + 'px', borderWidth: (w / V.s) + 'px'}); L.appendChild(e); };
  if (SK.rn) { box(SK.rn, 'nowy', 2); return; } const roi = roiOf(a); if (roi && roiOk(roi) && SK.tryb !== 'pole') box(roi, 'roi', 2);
  if (SK.pole) (frOf(a, SK.pole) || []).forEach(r => { if (Array.isArray(r) && r.length === 4) box({x: r[0], y: r[1], w: r[2], h: r[3]}, 'pole', 2); }); }
function skanDopasuj(r){ if (!$('skView')) return; const W = $('skView').clientWidth, H = $('skView').clientHeight, V = SK.v; if (!W || !H) return; if (r && roiOk(r)) { const rw = r.w * V.iw, rh = r.h * V.ih; V.s = Math.min(W / rw, H / rh) * 0.96; V.x = W / 2 - (r.x * V.iw + rw / 2) * V.s; V.y = H / 2 - (r.y * V.ih + rh / 2) * V.s; } else { V.s = Math.min(W / V.iw, H / V.ih); V.x = (W - V.iw * V.s) / 2; V.y = (H - V.ih * V.s) / 2; } skanTransform(); skanRysuj(); }
function skanFokusPola(a, f){ SK.pole = f; const rs = frOf(a, f); if (!$('skImg') || !SK.v.iw || !rs || !rs.length) { skanRysuj(); return; }
  const x1 = Math.min(...rs.map(r => r[0])), y1 = Math.min(...rs.map(r => r[1])), x2 = Math.max(...rs.map(r => r[0] + r[2])), y2 = Math.max(...rs.map(r => r[1] + r[3])), mx = Math.max(.03, (x2 - x1) * .2), my = Math.max(.03, (y2 - y1) * 1.2);
  const x = Math.max(0, x1 - mx), y = Math.max(0, y1 - my); skanDopasuj({x, y, w: Math.min(1 - x, x2 - x1 + 2 * mx), h: Math.min(1 - y, y2 - y1 + 2 * my)}); }
function skanPanel(a){ const sk = skanKlucz(a), sc = skanSciezka(a), plik = skanZnajdz(a), pf = fieldsOf(a).filter(f => frOf(a, f.id));
  const stan = !sk ? 'Ten akt nie ma przypisanego skanu.' : !SK.pliki.length ? 'Wybierz folder ze skanami (obraz zostaje na tym komputerze).' : plik ? '' : 'Nie znaleziono pliku „' + skanBase(sc) + '” w wybranym folderze (' + SK.pliki.length + ' obrazów).';
  return h`<div class="skwin-head" id="skHead"><span class="skwin-tyt">Skan <b>${sc ? skanBase(sc) : '(brak)'}</b>${plik ? '' : ' – niewczytany'}</span>
      <span class="skwin-btn"><button class="sm" id="skLista" title="Pokaż/ukryj listę aktów">${document.body.classList.contains('lista-ukryta') ? '☰ pokaż akty' : '☰ ukryj akty'}</button><button class="sm" id="skHdr" title="Schowaj/pokaż górny pasek">▲ pasek</button><button class="sm" id="skDok" title="Przypnij z prawej / odepnij">${SK.plywajacy ? '⇱ przypnij' : '⇲ odepnij'}</button><button class="sm" id="skZwin" title="Zwiń/rozwiń">${SK.zwiniety ? '▸' : '▾'}</button><button class="sm" id="skSchowaj" title="Schowaj skan">✕</button></span></div>
    <div class="skwin-cialo" ${SK.zwiniety ? raw('hidden') : ''}>
    <div class="acts"><button id="skFolder" class="sm">Wybierz folder skanów…</button><span class="muted" id="skInfo">${SK.folder ? 'folder: ' + SK.folder + ' · ' + SK.pliki.length + ' obrazów' : ''}</span>
      <button class="sm" id="skIn" title="Powiększ">＋</button><button class="sm" id="skOut" title="Pomniejsz">－</button><button class="sm" id="skFit" title="Dopasuj do obszaru aktu">Dopasuj</button>
      <label class="muted">Rysuj: <select id="skTryb"><option value="">tylko podgląd</option><option value="roi" ${SK.tryb === 'roi' ? raw('selected') : ''}>obszar aktu (ROI)</option><option value="pole" ${SK.tryb === 'pole' ? raw('selected') : ''}>ramkę pola</option></select></label>
      <button class="sm" id="skRoiDel" ${S.acts[a.id]?.roi ? '' : raw('disabled')} title="Przywróć ROI z danych">Cofnij własny ROI</button></div>
    ${stan ? h`<div class="muted" id="skStan">${stan}</div>` : ''}
    ${plik ? h`<div id="skView"><div id="skLayer"><img id="skImg" alt="Skan aktu ${a.act}" draggable="false"></div></div>` : ''}
    <div class="muted" id="skPole">${SK.tryb === 'pole' ? (SK.pole ? 'Rysujesz ramkę dla pola „' + (fieldsOf(a).find(f => f.id === SK.pole)?.label || SK.pole) + '” (zastępuje poprzednie). Kliknij pole formularza, by zmienić pole.' : 'Kliknij pole formularza, potem narysuj ramkę na skanie.') : ''}${pf.length && SK.tryb !== 'pole' ? ' Pola z ramkami: ' + pf.map(f => f.label).join(', ') + '.' : ''}</div></div></div>`; }
/* Okno skanu: przypięte z prawej (obok pól) albo pływające (przeciągane za nagłówek); można zwinąć, schować i ukryć górny pasek. */
function skTT(){ const hd = document.querySelector('header'); document.documentElement.style.setProperty('--tt', (document.body.classList.contains('hdr-ukryty') || !hd ? 0 : hd.offsetHeight) + 'px'); }
function skanWinRender(a){ const W = $('skWin'), pk = $('skPokaz'); if (!W) return; skTT();
  if (!a) { W.hidden = true; if (pk) pk.hidden = true; document.body.classList.remove('sk-dok'); return; }
  W.hidden = SK.schowany; if (pk) pk.hidden = !SK.schowany; document.body.classList.toggle('sk-dok', !SK.plywajacy && !SK.schowany);
  wstaw(W, skanPanel(a)); skanOknoPodlacz(); skanPodlacz(a); }
function skanOknoPodlacz(){ const W = $('skWin'), head = $('skHead'); if (!W || !head) return;
  $('skHdr').onclick = () => { document.body.classList.toggle('hdr-ukryty'); skanWinRender(curAct()); };
  $('skLista').onclick = () => { document.body.classList.toggle('lista-ukryta'); skanWinRender(curAct()); };
  $('skZwin').onclick = () => { SK.zwiniety = !SK.zwiniety; skanWinRender(curAct()); };
  $('skSchowaj').onclick = () => { SK.schowany = true; skanWinRender(curAct()); };
  $('skDok').onclick = () => { SK.plywajacy = !SK.plywajacy; if (!SK.plywajacy) Object.assign(W.style, {left: '', top: '', right: '', bottom: ''}); skanWinRender(curAct()); };
  head.onpointerdown = e => { if (e.target.closest('button')) return; SK.plywajacy = true; const r = W.getBoundingClientRect(); Object.assign(W.style, {left: r.left + 'px', top: r.top + 'px', right: 'auto', bottom: 'auto'}); document.body.classList.remove('sk-dok');
    const dx = e.clientX - r.left, dy = e.clientY - r.top; head.setPointerCapture(e.pointerId);
    head.onpointermove = ev => { W.style.left = Math.max(0, ev.clientX - dx) + 'px'; W.style.top = Math.max(0, ev.clientY - dy) + 'px'; };
    const kon = () => { head.onpointermove = null; head.onpointerup = null; head.onpointercancel = null; }; head.onpointerup = kon; head.onpointercancel = kon; }; }
function skanPodlacz(a){ if (!$('skFolder')) return;
  $('skFolder').onclick = () => $('fSkany').click(); $('skTryb').onchange = e => { SK.tryb = e.target.value; skanRysuj(); const t = $('skPole'); if (t) t.textContent = SK.tryb === 'pole' ? 'Kliknij pole formularza, potem narysuj ramkę na skanie.' : ''; };
  $('skIn').onclick = () => skanZoom(1.3); $('skOut').onclick = () => skanZoom(1 / 1.3); $('skFit').onclick = () => skanDopasuj(roiOf(a));
  $('skRoiDel').onclick = () => { const s = st(a.id); delete s.roi; save(); keepScroll(); toast('Przywrócono ROI z danych'); };
  const plik = skanZnajdz(a), img = $('skImg'), view = $('skView'); if (!plik) return; const key = (plik.webkitRelativePath || plik.name);
  img.onload = () => { const V = SK.v; if (V.key !== key) { V.key = key; V.iw = img.naturalWidth; V.ih = img.naturalHeight; skanDopasuj(roiOf(a)); } else { V.iw = img.naturalWidth; V.ih = img.naturalHeight; skanTransform(); skanRysuj(); } if (SK.pole) skanRysuj(); };
  img.onerror = () => toast('Nie można otworzyć pliku skanu'); img.src = skanUrl(plik);
  const pts = new Map(), pos = e => { const b = view.getBoundingClientRect(); return {x: e.clientX - b.left, y: e.clientY - b.top}; }, V = SK.v, wz = p => ({x: (p.x - V.x) / V.s / V.iw, y: (p.y - V.y) / V.s / V.ih}), kl = v => Math.min(1, Math.max(0, v));
  let start = null;
  view.onpointerdown = e => { view.setPointerCapture(e.pointerId); pts.set(e.pointerId, pos(e)); if (SK.tryb && pts.size === 1 && (SK.tryb === 'roi' || SK.pole)) { const p = wz(pos(e)); start = {x: kl(p.x), y: kl(p.y)}; } else start = null; };
  view.onpointermove = e => { if (!pts.has(e.pointerId)) return; const p = pos(e), o = pts.get(e.pointerId);
    if (start && pts.size === 1) { const q = wz(p), x2 = kl(q.x), y2 = kl(q.y); SK.rn = {x: Math.min(start.x, x2), y: Math.min(start.y, y2), w: Math.abs(x2 - start.x), h: Math.abs(y2 - start.y)}; skanRysuj(); }
    else if (pts.size === 1) { V.x += p.x - o.x; V.y += p.y - o.y; skanTransform(); }
    else if (pts.size === 2) { const ids = [...pts.keys()], other = pts.get(ids[0] === e.pointerId ? ids[1] : ids[0]), d0 = Math.hypot(o.x - other.x, o.y - other.y), d1 = Math.hypot(p.x - other.x, p.y - other.y); if (d0 > 0) { const f = d1 / d0, cx = (p.x + other.x) / 2, cy = (p.y + other.y) / 2; V.x = cx - (cx - V.x) * f; V.y = cy - (cy - V.y) * f; V.s *= f; skanTransform(); } }
    pts.set(e.pointerId, p); };
  const koniec = e => { pts.delete(e.pointerId); const r = SK.rn; if (r && start && !pts.size) { SK.rn = null; start = null; if (r.w > .01 && r.h > .01) { const s = st(a.id), rr = {x: +r.x.toFixed(4), y: +r.y.toFixed(4), w: +r.w.toFixed(4), h: +r.h.toFixed(4)};
        if (SK.tryb === 'roi') { s.roi = rr; save(); toast('Zapisano nowy obszar aktu (ROI)'); } else if (SK.pole) { s.fr = Object.assign({}, s.fr, {[SK.pole]: [[rr.x, rr.y, rr.w, rr.h]]}); save(); toast('Zapisano ramkę pola'); } keepScroll(); } else skanRysuj(); } start = null; };
  view.onpointerup = koniec; view.onpointercancel = koniec;
  view.onwheel = e => { e.preventDefault(); const p = pos(e), f = e.deltaY < 0 ? 1.15 : 1 / 1.15; V.x = p.x - (p.x - V.x) * f; V.y = p.y - (p.y - V.y) * f; V.s *= f; skanTransform(); }; }
function skanZoom(f){ const v = $('skView'); if (!v) return; const V = SK.v, W = v.clientWidth / 2, H = v.clientHeight / 2; V.x = W - (W - V.x) * f; V.y = H - (H - V.y) * f; V.s *= f; skanTransform(); }
function roiEksport(){ const A = D.acts.filter(a => !a.kind && (a.ai || S.acts[a.id]?.roi || S.acts[a.id]?.fr)).map(a => { const o = {id: a.id, plik: skanSciezka(a), strona: 1, roi: roiOf(a) || null}; const fr = Object.assign({}, a.pola || {}, S.acts[a.id]?.fr || {}); if (Object.keys(fr).length) o.pola = fr; return o; });
  dl('ZGONY_roi_poprawione.json', JSON.stringify(A, null, 1), 'application/json', false); return A.length; }
function skanInit(){ addEventListener('resize', () => skTT()); const W = document.createElement('div'); W.id = 'skWin'; W.className = 'skwin'; W.hidden = true; document.body.appendChild(W);
  const pk = document.createElement('button'); pk.id = 'skPokaz'; pk.className = 'skPok'; pk.hidden = true; pk.textContent = '🖼 Skan'; pk.onclick = () => { SK.schowany = false; skanWinRender(curAct()); }; document.body.appendChild(pk);
  const hp = document.createElement('button'); hp.id = 'hdrPokaz'; hp.className = 'hdrPok'; hp.textContent = '▼ pasek'; hp.onclick = () => { document.body.classList.remove('hdr-ukryty'); skanWinRender(curAct()); }; document.body.appendChild(hp);
  const i = document.createElement('input'); i.type = 'file'; i.id = 'fSkany'; i.hidden = true; i.multiple = true; i.setAttribute('webkitdirectory', ''); i.setAttribute('directory', ''); document.body.appendChild(i);
  i.onchange = e => { const n = skanWybierzFolder(e.target.files); e.target.value = ''; toast(n ? 'Wczytano listę skanów: ' + n + ' (obrazy zostają lokalnie)' : 'W folderze nie ma obrazów'); keepScroll(); };
  const m = $('menu'), b = document.createElement('button'); b.id = 'mRoi'; b.textContent = 'Eksport ROI i ramek pól (JSON)'; b.onclick = () => { m.hidden = true; toast('Wyeksportowano ROI: ' + roiEksport() + ' aktów'); }; m.appendChild(b);
  const c = document.createElement('button'); c.id = 'mSkany'; c.textContent = 'Folder skanów…'; c.onclick = () => { m.hidden = true; i.click(); }; m.appendChild(c); }
