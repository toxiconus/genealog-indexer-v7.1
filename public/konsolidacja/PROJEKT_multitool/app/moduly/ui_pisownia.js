/* app/moduly/ui_pisownia.js – „Pisownia nazwisk w czasie” (Menu ▾): warianty zapisu nazwiska × dekady, wykrywanie przełomu (zmiana dominującego zapisu), rozdzielenie/łączenie wariantów,
   lista aktów komórki z dostępem do skanów (obok siebie). Korzysta z OS_ROLE, kluczNazwiska, osKlasy (rejestr wariantów z decyzji), getv. HTML tylko przez h`…`/wstaw. */
const PIS = {grupy: null, sel: null, q: '', sa: []};
function pisLev(a, b){ if (a === b) return 0; const m = a.length, n = b.length; if (!m || !n) return Math.max(m, n); let p = Array.from({length: n + 1}, (_, j) => j);
  for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; } return p[n]; }
// wszystkie zapisy nazwisk: {z: zapis, rok, akt, rola, atr}
function pisZbierz(){ const out = [];
  D.wszystkie.forEach(a => { const R = OS_ROLE[a.typ]; if (!R) return; const rok = Number(a.year != null ? a.year : a.rok) || null;
    for (const r in R) for (const at of ['nazwisko', 'rodowe']) { const pola = R[r][at]; if (!pola) continue;
      for (const f of pola) { if (f === '@ojcowskie') continue; const v = String(getv(a, f) == null ? '' : getv(a, f)).trim(); if (!v || normBrak(v)) continue; out.push({z: v, rok, akt: a.id, rola: r, atr: at}); break; } } });
  return out; }
function pisGrupuj(){ const K = osKlasy(S.decyz), G = new Map();
  pisZbierz().forEach(x => { const k = kluczNazwiska(x.z); if (!k) return; const id = K.klasy[k.k2] || k.k2; let g = G.get(id); if (!g) G.set(id, g = {id, zap: new Map(), n: 0, klasa: !!K.klasy[k.k2]});
    g.n++; let w = g.zap.get(x.z); if (!w) g.zap.set(x.z, w = {z: x.z, n: 0, lata: [], wyst: []}); w.n++; if (x.rok) w.lata.push(x.rok); w.wyst.push(x); });
  PIS.grupy = [...G.values()].map(g => ({id: g.id, n: g.n, klasa: g.klasa, zap: [...g.zap.values()].sort((a, b) => b.n - a.n)})).filter(g => g.zap.length > 1).sort((a, b) => b.n - a.n); }
function pisDek(r){ return Math.floor(r / 10) * 10; }
// przełom: kolejne dekady, w których zmienia się dominujący zapis (min. 2 akty w dekadzie)
function pisPrzelomy(g){ const dek = {}; g.zap.forEach(w => w.lata.forEach(r => { const d = pisDek(r); (dek[d] = dek[d] || {})[w.z] = (dek[d][w.z] || 0) + 1; }));
  const L = Object.keys(dek).map(Number).sort((a, b) => a - b), P = []; let ost = null;
  L.forEach(d => { const e = Object.entries(dek[d]), s = e.reduce((t, x) => t + x[1], 0); if (s < 2) return; const top = e.sort((a, b) => b[1] - a[1])[0]; if (ost && ost.z !== top[0]) P.push({od: ost.d, do_: d, z1: ost.z, z2: top[0]}); ost = {d, z: top[0]}; });
  return {dek, L, P}; }
function pisFiltr(){ const q = PIS.q.trim(); if (!q) return PIS.grupy; const k = kluczNazwiska(q), fq = normNazwiskoBaza(q).baza;
  return PIS.grupy.filter(g => g.zap.some(w => { const kw = kluczNazwiska(w.z); return kw && ((k && kw.k2 === k.k2) || kw.k1.includes(fq) || (fq.length > 3 && pisLev(kw.k1, fq) <= 2)); })); }
function pisKarta(g){ const t = pisPrzelomy(g), lata = t.L; if (!lata.length) return h`<p class="muted">Brak lat w aktach tej grupy.</p>`;
  const zakr = []; for (let d = lata[0]; d <= lata[lata.length - 1]; d += 10) zakr.push(d);
  const kom = (w, d) => w.lata.filter(r => pisDek(r) === d).length;
  return h`<div><b>${g.zap.map(w => w.z).join(' / ')}</b> <span class="muted">${g.n} zapisów${g.klasa ? ' · klasa potwierdzona w rejestrze' : ''}</span>
    <div style="overflow:auto"><table class="pors-t"><tr><th>Zapis</th><th>Σ</th>${zakr.map(d => h`<th>${d}</th>`)}</tr>
    ${g.zap.map((w, i) => h`<tr><td>${w.z}</td><td>${w.n}</td>${zakr.map(d => { const c = kom(w, d); return c ? h`<td><button class="sm" data-pc="${i}|${d}">${c}</button></td>` : h`<td class="muted">·</td>`; })}</tr>`)}</table></div>
    ${t.P.length ? h`<div>${t.P.map(p => h`<div class="card">Przełom: dominujący zapis zmienia się z <b>${p.z1}</b> na <b>${p.z2}</b> między ${p.od}. a ${p.do_}. (sprawdź skany obu dekad)</div>`)}</div>` : h`<div class="muted">Dominujący zapis nie zmienia się w czasie – warianty współistnieją.</div>`}
    <div class="acts"><button class="sm" data-pd="roz">Rozdziel: to różne nazwiska</button><button class="sm" data-pd="lacz">Potwierdź: to jeden wariant nazwiska</button></div></div>`; }
function pisAkty(g, i, d){ const w = g.zap[i], L = w.wyst.filter(x => x.rok && pisDek(x.rok) === d).sort((a, b) => a.rok - b.rok);
  return h`<div class="card"><b>${w.z}</b> w latach ${d}–${d + 9} <span class="muted">(zaznacz 2 akty → skany obok siebie)</span>
    ${L.map(x => { const a = AM[x.akt], wid = 'w:' + x.akt + ':' + x.rola; return h`<div><label><input type="checkbox" data-ps="${wid}"> ${x.rok} · ${a ? a.typ : '?'} · ${x.rola} · ${x.akt}</label> <button class="sm" data-po="${wid}">Otwórz akt</button></div>`; })}
    <button class="sm p" id="pisObok">Skany obok siebie</button></div>`; }
function pisRender(o){ const G = pisFiltr(), g = PIS.sel != null ? G.find(x => x.id === PIS.sel) : null;
  wstaw(o.querySelector('#oknoTresc'), h`<div class="acts"><input id="pisQ" type="search" placeholder="Nazwisko (np. Pazdrak, Kowal…)" value="${PIS.q}"><span class="muted">Grup z różnym zapisem: ${G.length}</span></div>
    <div class="pisL" style="max-height:20vh;overflow:auto">${G.slice(0, 150).map(x => h`<button class="sm ${g && g.id === x.id ? 'p' : ''}" data-pg="${x.id}">${x.zap.slice(0, 3).map(w => w.z).join(' / ')} (${x.n})</button>`)}</div>
    <div id="pisK">${g ? pisKarta(g) : h`<p class="muted">Wybierz grupę nazwisk – zobaczysz zapisy w dekadach i przełom pisowni.</p>`}</div><div id="pisA"></div>`);
  const q = o.querySelector('#pisQ'); q.oninput = () => { PIS.q = q.value; PIS.sel = null; pisRender(o); const n = o.querySelector('#pisQ'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); };
  o.querySelectorAll('[data-pg]').forEach(b => b.onclick = () => { PIS.sel = b.dataset.pg; pisRender(o); });
  o.querySelectorAll('[data-pc]').forEach(b => b.onclick = () => { const [i, d] = b.dataset.pc.split('|'); wstaw(o.querySelector('#pisA'), pisAkty(g, +i, +d)); pisAkcje(o); });
  o.querySelectorAll('[data-pd]').forEach(b => b.onclick = () => pisDecyzja(g, b.dataset.pd, o)); }
function pisAkcje(o){ o.querySelectorAll('[data-po]').forEach(b => b.onclick = () => { o.hidden = true; osOtworzAkt(b.dataset.po); });
  o.querySelector('#pisObok').onclick = () => { const W = [...o.querySelectorAll('[data-ps]:checked')].map(c => c.dataset.ps); if (W.length !== 2) return toast('Zaznacz dokładnie 2 akty'); const q = PIS.sel, d = PIS.q; osSkanyObok(W[0], W[1]); PIS.sel = q; PIS.q = d; }; }
function pisDecyzja(g, jak, o){ if (!g || g.zap.length < 2) return; const A = g.zap[0].z, B = g.zap[1].z;
  const typ = jak === 'lacz' ? 'wariant_nazwiska' : 'odrzuc_wariant'; if (typeof osZapiszDec !== 'function') return toast('Decyzja niedostępna'); const r = osZapiszDec(typ, 'n:' + A, 'n:' + B, {why: 'pisownia w czasie'}); if (!r || !r.ok) return; toast((jak === 'lacz' ? 'Potwierdzono wariant: ' : 'Rozdzielono: ') + A + ' / ' + B); PIS.grupy = null; setTimeout(() => { pisGrupuj(); pisRender(o); }, 500); }
function pisownia(){ pisGrupuj(); PIS.sel = null; const o = okno('Pisownia nazwisk w czasie', h`<div></div>`); o.classList.add('bok'); pisRender(o); }
