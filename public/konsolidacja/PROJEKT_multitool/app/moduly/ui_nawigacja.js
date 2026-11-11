/* app/moduly/ui_nawigacja.js – powłoka v2: zakładki Akty / Osoby / Drzewo / Raport / Narzędzia, pasek akcji aktu (poprzedni/następny, sporne pole, cofnij/ponów),
   historia zmian aktu, skróty klawiszowe, motyw (auto/jasny/ciemny), zakładka „Narzędzia” (wszystkie funkcje z menu jako kafle).
   HTML wyłącznie przez wstaw(h`…`). Stan cofania żyje w pamięci sesji; każda cofnięta zmiana trafia też do trwałej historii (S.hist) jako nowy wpis. */
const ZAKL = [['akty', 'zAkty', 'akty'], ['osoby', 'zOsoby', 'osoby'], ['drzewo', 'zDrzewo', 'drzewo rodzin'], ['raport', 'zRaport', 'raport i kontrole'], ['narz', 'zNarz', 'narzędzia']];
function zaklUstaw(k){ if (!ZAKL.some(z => z[0] === k)) return; OSS.zakl = k; document.body.dataset.zakl = k; ZAKL.forEach(([n, id]) => { const b = $(id); if (b) b.className = n === k ? 'p' : ''; });
  $('selTyp').hidden = k !== 'akty'; document.querySelectorAll('.osMenu').forEach(b => b.hidden = k !== 'osoby'); $('menu').hidden = true;
  if (k !== 'akty') { skanWinRender(null); $('tytul').textContent = 'Multitool v1 · ' + ZAKL.find(z => z[0] === k)[2]; }
  if (k === 'akty') { OSS.sel = null; odswiez(); }
  else if (k === 'osoby') { if (!OSS.KL) OSS.KL = decKlastry(S.decyz); osStart(false); osRender(); }
  else { $('prog').textContent = ''; zaklOdswiez(); }
  window.scrollTo(0, 0); }
// zakładki bez listy aktów: render własny; zwraca true, gdy obsłużono (odswiez() wtedy nie rysuje karty aktu)
function zaklOdswiez(){ const k = OSS.zakl; if (k === 'drzewo' && typeof drzRender === 'function') { drzRender(); } else if (k === 'raport' && typeof rapRender === 'function') { rapRender(); } else if (k === 'narz') { narzRender(); } else return false;
  stWskaznik(); stPasek(); return true; }

// ---------- motyw: auto (wg systemu) / jasny / ciemny; wybór pamiętany w tej przeglądarce
function motywOdczyt(){ try { const m = localStorage.getItem('mt.motyw'); return m === 'light' || m === 'dark' ? m : 'auto'; } catch (e) { return document.documentElement.getAttribute('data-theme') || 'auto'; } }
function motywUstaw(m){ const r = document.documentElement; if (m === 'light' || m === 'dark') r.setAttribute('data-theme', m); else r.removeAttribute('data-theme'); try { if (m === 'auto') localStorage.removeItem('mt.motyw'); else localStorage.setItem('mt.motyw', m); } catch (e) {}
  const b = $('mMotyw'); if (b) b.textContent = 'Motyw: ' + ({light: 'jasny', dark: 'ciemny'}[m] || 'auto'); }

// ---------- cofnij / ponów (grupa = wszystkie wpisy historii z jednego zapisu)
const COF = {stos: [], redo: [], busy: false, MAX: 200};
function cofPoZapisie(n0){ if (COF.busy) return; const H = S.hist || [], g = []; for (let i = H.length - 1; i >= 0 && H[i].n > n0; i--) g.unshift({id: H[i].id, k: H[i].k, f: H[i].f, before: H[i].before, after: H[i].after});
  if (!g.length) return; COF.stos.push(g); if (COF.stos.length > COF.MAX) COF.stos.shift(); COF.redo = []; }
function cofWykonaj(wstecz){ const g = (wstecz ? COF.stos : COF.redo).pop(); if (!g) return toast(wstecz ? 'Nie ma czego cofać (cofanie obejmuje zmiany z tej sesji)' : 'Nie ma czego ponawiać');
  COF.busy = true; try { (wstecz ? g.slice().reverse() : g).forEach(e => histApply(S.acts, wstecz ? e : Object.assign({}, e, {before: e.after}))); HIST_WHY = wstecz ? 'cofnięcie' : 'ponowienie'; save(); } finally { HIST_WHY = null; COF.busy = false; }
  (wstecz ? COF.redo : COF.stos).push(g); const a = AM[g[0].id]; if (a && wAktach()) { if (a.typ === D.typ && S.cur !== a.id) S.cur = a.id; renderLista(); renderAkt(); }
  const pola = [...new Set(g.filter(e => e.k === 'f').map(e => e.f))]; toast((wstecz ? 'Cofnięto' : 'Ponowiono') + ': ' + (a ? a.year + ' akt ' + a.act : g[0].id) + (pola.length ? ' · pól: ' + pola.length : '')); }

// ---------- historia zmian aktu (z trwałej historii S.hist)
function histWart(e, v){ if (v == null) return '—'; if (e.k === 'f') { try { const x = JSON.parse(v); return String(x.v ?? '') + (x.ok ? ' ✓' : '') + (x.unc ? ' ?' : '') + (x.skip ? ' (pominięte)' : ''); } catch (er) { return String(v); } } if (e.k === 'done') return 'zatwierdzony'; return String(v).length > 80 ? String(v).slice(0, 80) + '…' : String(v); }
function aktHistoria(a){ const H = (S.hist || []).filter(e => e.id === a.id), L = H.slice(-40).reverse(), et = f => fieldsOf(a).find(x => x.id === f)?.label || f;
  return h`<details class="txt" id="histDet" ${S.hOpen ? raw('open') : ''}><summary>Historia zmian aktu (${H.length})</summary>
    ${L.length ? h`<div class="rtab"><table id="histTab"><tr><th>Kiedy</th><th>Co</th><th>Przed</th><th>Po</th></tr>${L.map(e => h`<tr><td>${String(e.t || '').slice(0, 16).replace('T', ' ')}</td><td class="w">${e.k === 'f' ? et(e.f) : e.k === 'done' ? 'zatwierdzenie aktu' : e.k === 'text' ? 'tekst aktu' : e.k}${e.why ? ' (' + e.why + ')' : ''}</td><td class="w">${histWart(e, e.before)}</td><td class="w">${histWart(e, e.after)}</td></tr>`)}</table></div>${H.length > L.length ? h`<div class="muted">Pokazano ostatnie ${L.length} z ${H.length}. Całość: Narzędzia → Eksport historii (CSV).</div>` : ''}` : h`<div class="muted">Brak zmian w tym akcie.</div>`}</details>`; }

// ---------- pasek akcji aktu
function aktSasiad(d){ const v = widoczne(), i = v.findIndex(a => a.id === S.cur); const n = i < 0 ? v[0] : v[i + d]; if (!n) return toast(d > 0 ? 'To ostatni akt na liście (zmień filtr lub rok)' : 'To pierwszy akt na liście'); if (v.indexOf(n) >= LISTA_N) LISTA_N = v.indexOf(n) + LISTA_PORCJA; otworz(n.id); aktPrzewin(); }
function aktPrzewin(){ const b = document.querySelector('#lista .it.cur'); if (b && b.scrollIntoView) b.scrollIntoView({block: 'nearest'}); if (!document.body.classList.contains('sk-dok')) window.scrollTo(0, 0); else { const m = $('main'); if (m) window.scrollTo(0, 0); } }
function aktZatwierdzINastepny(){ const a = curAct(); if (!a) return; const v = widoczne(), i = v.findIndex(x => x.id === a.id); let n = null; for (let j = i + 1; j < v.length; j++) if (!S.acts[v[j].id]?.done) { n = v[j]; break; }
  if (!S.acts[a.id]?.done) { const s = st(a.id); s.done = true; autoResolve(a); save(); toast('Akt zatwierdzony ✓'); } if (n) { otworz(n.id); aktPrzewin(); } else { renderLista(); renderAkt(); toast('Akt zatwierdzony ✓ – brak następnego niezatwierdzonego na liście'); } }
const poleSporne = (a, f) => { const x = S.acts[a.id]?.f?.[f]; if (x?.ok || x?.skip) return false; if (!appl(a, f) && !clean(getv(a, f))) return false; return isUnc(a, f) || diffState(a, f) === 'ne'; };
let SPOR_OST = ['', ''];
function aktSpornePole(){ const a = curAct(); if (!a) return; const kol = [...$('main').querySelectorAll('[data-pole]')].map(e => e.dataset.pole), poz = f => { const i = kol.indexOf(f); return i < 0 ? 999 : i; }, F = fieldsOf(a).map(f => f.id).filter(f => poleSporne(a, f)).sort((x, y) => poz(x) - poz(y)); if (!F.length) return toast('W tym akcie nie ma już pól spornych (niepewnych ani z różnicą)');
  const ae = document.activeElement, akt = ae && ae.dataset && ae.dataset.f ? ae.dataset.f : (SPOR_OST[0] === a.id ? SPOR_OST[1] : ''), i = F.indexOf(akt), f = F[(i + 1) % F.length]; SPOR_OST = [a.id, f]; let inp = $('p_' + f);
  if (!inp) { AKT_ROZW = a.id + '|' + f; keepScroll(); inp = $('p_' + f); } if (!inp) return; document.querySelectorAll('.pole.fok').forEach(e => e.classList.remove('fok')); const box = inp.closest('.pole'); if (box) { box.classList.add('fok'); box.scrollIntoView({block: 'center'}); } inp.focus(); toast('Sporne pole ' + (F.indexOf(f) + 1) + ' z ' + F.length); }
function aktbarPodlacz(a){ $('bPrev').onclick = () => aktSasiad(-1); $('bNext').onclick = () => aktSasiad(1); $('bDoneNext').onclick = aktZatwierdzINastepny; $('bSpor').onclick = aktSpornePole;
  $('bUndo').onclick = () => cofWykonaj(true); $('bRedo').onclick = () => cofWykonaj(false); $('bUndo').disabled = !COF.stos.length; $('bRedo').disabled = !COF.redo.length;
  const hd = $('histDet'); if (hd) hd.ontoggle = () => { S.hOpen = hd.open; }; }

// ---------- skróty klawiszowe (lewy Alt; prawy Alt = polskie znaki, więc go pomijamy)
const SKROTY = [['Enter', 'w polu: zapisz i przejdź do następnego pola'], ['Alt+J / Alt+↓', 'następny akt'], ['Alt+K / Alt+↑', 'poprzedni akt'], ['Ctrl+Enter', 'następny akt'], ['Alt+Enter', 'zatwierdź akt / cofnij zatwierdzenie'], ['Ctrl+Shift+Enter', 'zatwierdź akt i przejdź do następnego niezatwierdzonego'],
  ['Alt+R', 'następne sporne pole (niepewne lub z różnicą AI ↔ indeks)'], ['Alt+Z / Alt+Y', 'cofnij / ponów zmianę'], ['Alt+L', 'pokaż / ukryj listę aktów'], ['Alt+S', 'pokaż / schowaj skan'], ['Alt+1 … Alt+5', 'zakładki: Akty, Osoby, Drzewo, Raport, Narzędzia'], ['Esc', 'zamknij okno / menu']];
function skrotKlawisz(e){ const okno = !$('okno').hidden;
  if (e.key === 'Escape') { if (okno) { $('okno').hidden = true; return; } if (!$('menu').hidden) $('menu').hidden = true; return; }
  if (okno) return; const alt = e.altKey && !e.ctrlKey && !e.metaKey, mod = (e.ctrlKey || e.metaKey) && !e.altKey, k = e.key.length === 1 ? e.key.toLowerCase() : e.key, stop = () => { e.preventDefault(); e.stopPropagation(); };
  if (alt && /^[1-5]$/.test(k)) { stop(); return zaklUstaw(ZAKL[+k - 1][0]); }
  if (OSS.zakl !== 'akty') return;
  const zapisz = () => { const el = document.activeElement; if (el && el.dataset && el.dataset.f && el.blur) el.blur(); };
  if (alt && (k === 'j' || k === 'ArrowDown')) { stop(); zapisz(); return aktSasiad(1); } if (alt && (k === 'k' || k === 'ArrowUp')) { stop(); zapisz(); return aktSasiad(-1); }
  if (mod && k === 'Enter') { stop(); zapisz(); return e.shiftKey ? aktZatwierdzINastepny() : aktSasiad(1); }
  if (alt && k === 'Enter') { stop(); zapisz(); return doDone(); }
  if (alt && k === 'r') { stop(); zapisz(); return aktSpornePole(); } if (alt && k === 'z') { stop(); zapisz(); return cofWykonaj(true); } if (alt && k === 'y') { stop(); zapisz(); return cofWykonaj(false); }
  if (alt && k === 'l') { stop(); const t = $('listaTog'); if (t) t.click(); return; }
  if (alt && k === 's') { stop(); SK.schowany = !SK.schowany; return skanWinRender(curAct()); }
  if (k === 'Enter' && !e.shiftKey && !alt && !mod) { const el = e.target; if (el && el.tagName === 'INPUT' && el.dataset.f && el.closest('#main')) { stop(); const ids = [...$('main').querySelectorAll('input[data-f],textarea[data-f]')].map(x => x.dataset.f), nast = ids[ids.indexOf(el.dataset.f) + 1]; el.blur(); const n = nast && $('p_' + nast); if (n) { n.focus(); if (n.select) n.select(); } } } }

// ---------- zakładka „Narzędzia”: wszystkie funkcje w jednym miejscu
function narzStat(){ const o = {}; D.typy.forEach(t => o[t] = {n: 0, ai: 0, done: 0, skan: 0, wFolderze: 0}); D.wszystkie.forEach(a => { const x = o[a.typ]; if (!x) return; x.n++; if (a.ai) x.ai++; if (S.acts[a.id]?.done) x.done++; if (skanKlucz(a)) { x.skan++; if (SK.pliki.length && skanZnajdz(a)) x.wFolderze++; } }); return o; }
function narzRender(){ const m = $('main'), st0 = narzStat(), mot = motywOdczyt(), zg = D.typ === 'zgon', kaf = (t, opis, P) => h`<div class="card"><h3>${t}</h3><div class="muted">${opis}</div><div class="acts">${P.map(([id, l, off]) => h`<button data-klik="${id}" ${off ? raw('disabled') : ''}>${l}</button>`)}</div></div>`;
  wstaw($('filtry'), ''); wstaw($('lista'), '');
  wstaw(m, h`<div class="rnav"><button id="narzWroc" class="p">← Wróć do aktów</button><span class="muted">Typ aktów dla importu i eksportu CSV: <b>${NAZWY_TYPOW[D.typ] || D.typ}</b> (zmiana: zakładka Akty, lista obok tytułu).</span></div>
   <div class="kafle" id="narzKafle">
    ${kaf('Kopie i bezpieczeństwo', 'Zmian bez kopii: ' + ST_ZMIANY + (ST_OSTATNIA ? ' · ostatnia kopia: ' + String(ST_OSTATNIA).slice(0, 10) : ' · nie zrobiono jeszcze kopii') + '. Kopia pełna zawiera pola, teksty, decyzje i historię.', [['mKopia', 'Kopia pełna (JSON)'], ['mKopiaWczytaj', 'Wczytaj kopię (JSON)…'], ['mMigawki', 'Migawki / przywróć…'], ['mAuto', 'Autozapis do pliku…']])}
    ${kaf('Import', 'Każdy import pokazuje podgląd przed zapisem i robi migawkę. Pola zatwierdzone nie są nadpisywane w trybie „dopisz”.', [['mImpDop', 'Import CSV zatwierdzeń (dopisz)…', !zg], ['mImpZast', 'Import CSV zatwierdzeń (zastąp)…', !zg], ['mMigr', 'Migracja zgonów z CSV…', !zg], ['mDecImp', 'Decyzje o osobach: import JSON…'], ['mDop', 'Import decyzji dop.v1…']])}
    ${kaf('Eksport', 'Pliki zapisują się w folderze pobierania przeglądarki.', [['mCsv', 'Eksport CSV (' + (NAZWY_TYPOW[D.typ] || D.typ).toLowerCase() + ')'], ['nHist', 'Historia zmian (CSV, ' + (S.hist || []).length + ' wpisów)'], ['mDecJson', 'Decyzje o osobach (JSON)'], ['mDecCsv', 'Decyzje o osobach (CSV)'], ['mRoi', 'ROI i ramki pól (JSON)']])}
    <div class="card"><h3>Skany</h3><div class="muted">Aplikacja nie zawiera obrazów – pamięta nazwę pliku skanu i szuka jej w folderze wskazanym na tym komputerze. ${SK.folder ? 'Wybrany folder: ' + SK.folder + ' (' + SK.pliki.length + ' obrazów).' : 'Folder nie jest wybrany.'}</div>
      <div class="rtab"><table id="narzSkany"><tr><th>Typ</th><th>Aktów</th><th class="w">Z adresem skanu</th><th class="w">Znalezionych w folderze</th></tr>${D.typy.map(t => h`<tr><td>${NAZWY_TYPOW[t] || t}</td><td>${st0[t].n}</td><td>${st0[t].skan}</td><td>${SK.pliki.length ? st0[t].wFolderze : '—'}</td></tr>`)}</table></div>
      <div class="acts"><button data-klik="mSkany">Wybierz folder skanów…</button></div></div>
    ${kaf('Dane i kontrola', 'Kolejka pokazuje pola, w których dane źródłowe zmieniły się po Twojej decyzji.', [['mKolejka', 'Dane źródłowe się zmieniły (' + ST_KOLEJ.length + ')'], ['nRaport', 'Raport i kontrole →'], ['nNowy', 'Dodaj nowy akt…']])}
    <div class="card"><h3>Wygląd</h3><div class="muted">Motyw aplikacji (zapamiętany w tej przeglądarce).</div><div class="widok">${[['auto', 'Auto (wg systemu)'], ['light', 'Jasny'], ['dark', 'Ciemny']].map(([k, l]) => h`<button data-motyw="${k}" class="${mot === k ? 'on' : ''}">${l}</button>`)}</div></div>
    <div class="card" style="grid-column:1/-1"><h3>Skróty klawiszowe</h3><div class="skr">${SKROTY.map(([k, o]) => h`<span>${k.split(' / ').map((x, i) => h`${i ? ' / ' : ''}<kbd>${x}</kbd>`)}</span><span>${o}</span>`)}</div></div>
   </div>`);
  $('narzWroc').onclick = () => zaklUstaw('akty');
  m.querySelectorAll('[data-motyw]').forEach(b => b.onclick = () => { motywUstaw(b.dataset.motyw); narzRender(); });
  m.querySelectorAll('[data-klik]').forEach(b => b.onclick = () => { const id = b.dataset.klik;
    if (id === 'nHist') { dl('multitool_historia_' + new Date().toISOString().slice(0, 10) + '.csv', histCsv(S.hist || [])); return toast('Zapisano historię zmian (CSV)'); }
    if (id === 'nRaport') return zaklUstaw('raport'); if (id === 'nNowy') return typeof nowyAktOkno === 'function' ? nowyAktOkno() : toast('Dodawanie aktów będzie dostępne w kolejnej wersji');
    const x = $(id); if (x) x.click(); if (id === 'mKopia') setTimeout(narzRender, 300); }); }

function nawInit(){ document.body.dataset.zakl = 'akty'; $('zDrzewo').onclick = () => zaklUstaw('drzewo'); $('zRaport').onclick = () => zaklUstaw('raport'); $('zNarz').onclick = () => zaklUstaw('narz');
  const M = $('menu'), b = document.createElement('button'); b.id = 'mMotyw'; b.onclick = () => { const m = motywOdczyt(); motywUstaw(m === 'auto' ? 'dark' : m === 'dark' ? 'light' : 'auto'); if (OSS.zakl === 'narz') narzRender(); }; M.appendChild(b); motywUstaw(motywOdczyt());
  const s = document.createElement('button'); s.id = 'mSkroty'; s.textContent = 'Skróty klawiszowe i wszystkie narzędzia →'; s.onclick = () => zaklUstaw('narz'); M.appendChild(s);
  document.addEventListener('keydown', skrotKlawisz, true);
  document.addEventListener('click', e => { if (!M.hidden && !e.target.closest('#menu') && e.target.id !== 'bMenu') M.hidden = true; }); }
