/* app/moduly/import_mini.js – import paczki z telefonu (Multitool mini → „multitool-mini” JSON) i szukanie skanów na dysku po sumie kontrolnej (bez DOM).
   Paczka: skany [{h: 16 znaków SHA-256 zawartości, nazwa, rozmiar}], akty [{typ, rok, nr, h, pola: {pole: {v, u?}}}].
   Zasady: brak aktu w bazie → dopisuje nowy (puste pola wypełnione z paczki); akt jest → wypełnia tylko puste pola (różnice liczy jako konflikty i niczego nie nadpisuje);
   skan: nazwa, suma (scanH) i rozmiar (scanSz) zapisują się przy akcie, jeśli akt nie ma jeszcze skanu. Wartości z telefonu to odczyt do sprawdzenia (ok: false). */
const MINI_MAX_AKTOW = 5000, MINI_H = /^[0-9a-f]{16}$/;
const miniPolaTypu = typ => { const T = TYPY[typ]; const s = new Set(); ((T && T.bloki) || []).forEach(g => g.pola.forEach(p => s.add(p))); return s; };
const miniCzysc = v => String(v).replace(/[\u0000-\u001f\u007f<>]/g, ' ').trim().slice(0, 500);
function miniRozpoznaj(txt){ const w = {ok: false, blad: '', akty: [], skany: {}, pominiete: 0};
  let p; try { p = JSON.parse(txt); } catch (e) { w.blad = 'To nie jest plik JSON.'; return w; }
  if (!p || !p.format || p.format.nazwa !== 'multitool-mini' || !Array.isArray(p.akty) || !Array.isArray(p.skany || [])) { w.blad = 'To nie jest paczka z Multitool mini.'; return w; }
  if (p.akty.length > MINI_MAX_AKTOW) { w.blad = 'Za dużo aktów w paczce (limit ' + MINI_MAX_AKTOW + ').'; return w; }
  (p.skany || []).forEach(s => { if (s && MINI_H.test(String(s.h))) w.skany[s.h] = {h: s.h, nazwa: miniCzysc(s.nazwa || ''), rozmiar: Number.isInteger(s.rozmiar) && s.rozmiar >= 0 ? s.rozmiar : 0}; });
  p.akty.forEach(x => { if (!x || !D.typy.includes(x.typ) || !MINI_H.test(String(x.h)) || !/^\d{4}$/.test(String(x.rok)) || +x.rok < NOWE_ROK[0] || +x.rok > NOWE_ROK[1] || !/^\d{1,4}[a-z]?$/i.test(String(x.nr))) { w.pominiete++; return; }
    const ok = miniPolaTypu(x.typ), pola = {}; Object.entries(x.pola || {}).forEach(([k, o]) => { if (!ok.has(k) || !o || typeof o.v !== 'string') return; const v = miniCzysc(o.v); if (v) pola[k] = {v, u: !!o.u}; });
    const a = skpAkt(x.typ, +x.rok, String(x.nr).toLowerCase()), sk = w.skany[x.h] || {h: x.h, nazwa: '', rozmiar: 0};
    let nowe = 0, konf = 0; Object.entries(pola).forEach(([k, o]) => { const cur = a ? String(getv(a, k) ?? '').trim() : ''; if (!cur) nowe++; else if (cur !== o.v) konf++; });
    w.akty.push({typ: x.typ, rok: +x.rok, nr: String(x.nr), h: x.h, pola, stan: a ? 'jest' : 'nowy', id: a ? a.id : '', nowe, konf, skan: sk, innySkan: !!(a && S.acts[a.id] && S.acts[a.id].scanH && S.acts[a.id].scanH !== x.h)}); });
  w.ok = true; return w; }
function miniStosuj(w){ const R = {dodane: 0, uzupelnione: 0, pol: 0, konflikty: 0, skany: 0, innySkan: 0, blad: ''};
  for (const x of w.akty) { let id = x.id; if (!id) { const r = nowyDodaj(x.typ, String(x.rok), x.nr); if (!r.ok) { if (r.istnieje) id = r.istnieje; else { R.blad = r.blad; break; } } else { id = r.id; R.dodane++; } }
    const a = AM[id], s = st(id); let n = 0;
    Object.entries(x.pola).forEach(([k, o]) => { const cur = String(getv(a, k) ?? '').trim(); if (cur) { if (cur !== o.v) R.konflikty++; return; } s.f[k] = {v: o.v, src: 'edit', ok: false, unc: !!o.u}; n++; });
    if (n && x.stan === 'jest') R.uzupelnione++; R.pol += n;
    if (!s.scanH) { if (x.skan.nazwa && !s.scan) s.scan = x.skan.nazwa; s.scanH = x.h; if (x.skan.rozmiar) s.scanSz = x.skan.rozmiar; R.skany++; } else if (s.scanH !== x.h) R.innySkan++; }
  return R; }
/* szukanie skanów z paczki wśród plików z dysku: najpierw rozmiar (tani filtr), potem suma; wynik {h: File}. Wywołanie zwrotne `postep(i, n)` jest opcjonalne. */
async function miniSzukaj(w, pliki, postep){ const rozm = {}; Object.values(w.skany).forEach(s => { if (s.rozmiar) (rozm[s.rozmiar] = rozm[s.rozmiar] || []).push(s.h); });
  const kand = pliki.filter(f => rozm[f.size]), znal = {}; let i = 0; for (const f of kand) { postep && postep(++i, kand.length); const k = f.size + '|' + f.lastModified; const h0 = (SK.hashCache = SK.hashCache || {})[k] || (SK.hashCache[k] = await skpHash(f)); if (h0 && w.skany[h0] && !znal[h0]) znal[h0] = f; }
  return znal; }
const miniSciezka = f => { const r = f.webkitRelativePath || f.name, s = r.split('/'); return s.slice(-3).join('/'); };
