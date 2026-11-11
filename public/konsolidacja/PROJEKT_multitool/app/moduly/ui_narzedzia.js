/* app/moduly/ui_narzedzia.js – narzędzia karty aktu (krok 3): tryby tekstu aktu i „[?]”, kreator pól, picker wieku i kalendarza (nowy/stary styl), ignorowanie sygnałów raportu spójności,
   nawigacja stulecie → dekada → rok (pomocnik filtrów). HTML wstawiany wyłącznie przez h`…`/wstaw. */
// ---- tryby tekstu: edycja | podgląd ([?] podświetlone) | sugestie (poprawki z zatwierdzonych pól + lista [?])
const TM = a => (S.tmode === 'podglad' || S.tmode === 'sug') ? S.tmode : 'edycja';
function sugLista(a){ const t = txtOf(a); return {q: qList(t), s: t ? textSugs(a, fieldsOf(a), t) : []}; }
function tekstSekcja(a){ const t = txtOf(a), m = TM(a);
  const widok = m === 'edycja' ? h`<textarea id="tTxt" rows="8" data-txt="1">${t}</textarea>`
    : m === 'podglad' ? h`<div class="tpodglad" id="tPodglad">${t.split(/(\[[^\]]*\])/).map(x => /^\[[^\]]*\]$/.test(x) ? h`<span class="${/\?/.test(x) ? 'mq' : /nieczytel/i.test(x) ? 'mr' : 'mg'}">${x}</span>` : x)}</div>`
    : (() => { const L = sugLista(a); return h`<div id="tSug"><div class="muted">Znaczniki [?] / [nieczytelne]: ${L.q.length}. Poprawki z zatwierdzonych pól: ${L.s.length}.</div>
        ${L.q.map((x, i) => h`<div class="sugw" data-sq="${i}"><code>${x.txt}</code> <button class="sm" data-qx="${i}" title="Usuń znacznik niepewności, zostaw słowo">Usuń znacznik</button></div>`)}
        ${L.s.map((x, i) => h`<div class="sugw" data-ss="${i}"><code>${x.from}</code> → <code>${x.to}</code> <span class="muted">(${fieldsOf(a).find(f => f.id === x.f)?.label || x.f})</span> <button class="sm" data-sx="${i}">Zastosuj</button></div>`)}
        ${L.s.length ? h`<button class="sm p" id="sugWszystkie">Zastosuj wszystkie poprawki</button>` : ''}</div>`; })();
  return h`<details class="txt" id="txtDet" ${S.tOpen ? raw('open') : ''}><summary>Tekst aktu ${t ? '' : '(brak)'}</summary>
    <div class="acts">${[['edycja', 'Edycja'], ['podglad', 'Podgląd [?]'], ['sug', 'Sugestie']].map(([k, l]) => h`<button class="sm ${m === k ? 'p' : ''}" data-tm="${k}">${l}</button>`)}</div>${widok}</details>`; }
function tekstPodlacz(a){ const det = $('txtDet'); if (!det) return; det.ontoggle = () => { S.tOpen = det.open; };
  det.querySelectorAll('[data-tm]').forEach(b => b.onclick = () => { S.tmode = b.dataset.tm; S.tOpen = true; save(); renderAkt(); });
  const zastosuj = L => { let r = txtOf(a), last = Infinity; L.slice().sort((x, y) => y.i - x.i).forEach(x => { if (x.e > last) return; r = r.slice(0, x.i) + x.to + r.slice(x.e); last = x.i; }); setTxt(a, r); };
  det.querySelectorAll('[data-qx]').forEach(b => b.onclick = () => { const x = sugLista(a).q[+b.dataset.qx]; if (!x) return; const t = txtOf(a); setTxt(a, t.slice(0, x.s) + qClean(x.txt) + t.slice(x.e)); S.tOpen = true; renderAkt(); toast('Usunięto znacznik'); });
  det.querySelectorAll('[data-sx]').forEach(b => b.onclick = () => { const x = sugLista(a).s[+b.dataset.sx]; if (!x) return; zastosuj([x]); S.tOpen = true; renderAkt(); toast('Zastosowano poprawkę'); });
  if ($('sugWszystkie')) $('sugWszystkie').onclick = () => { const L = sugLista(a).s; zastosuj(L); S.tOpen = true; renderAkt(); toast('Zastosowano poprawek: ' + L.length); }; }
// ---- picker wieku i kalendarza (pod polem)
const WIEK_J = [['r', 'lat'], ['m', 'miesięcy'], ['t', 'tygodni'], ['d', 'dni'], ['g', 'godzin']];
function narzPicker(a, f){
  if (f.id === 'age') return h`<div class="pick" data-pick="age"><span class="muted">Wiek:</span> <input type="number" min="0" max="130" step="1" aria-label="Wiek – liczba" data-pn> <select aria-label="Wiek – jednostka" data-pu>${WIEK_J.map(([k, l]) => h`<option value="${k}">${l}</option>`)}</select> <button class="sm" data-pk="age">Wstaw</button></div>`;
  if (f.id === 'death_date' || f.id === 'act_date') { const d = dwParse(getv(a, f.id)) || {y: a.year || 1900, m: 1, d: 1};
    return h`<details class="kal" data-kal="${f.id}"><summary class="muted">Kalendarz</summary><div class="pick">
      <select aria-label="Dzień" data-kd>${Array.from({length: 31}, (_, i) => i + 1).map(n => h`<option value="${n}" ${n === d.d ? raw('selected') : ''}>${n}</option>`)}</select>
      <select aria-label="Miesiąc" data-km>${MIES.map((n, i) => h`<option value="${i + 1}" ${i + 1 === d.m ? raw('selected') : ''}>${n}</option>`)}</select>
      <input type="number" min="1500" max="1950" aria-label="Rok" data-ky value="${d.y}"> <label class="muted"><input type="checkbox" data-kj> stary styl (juliański)</label>
      <span class="muted" data-kp></span> <button class="sm" data-kk="${f.id}">Wstaw</button></div></details>`; }
  return ''; }
function kalWynik(box){ const d = +box.querySelector('[data-kd]').value, m = +box.querySelector('[data-km]').value, y = +box.querySelector('[data-ky]').value, jul = box.querySelector('[data-kj]').checked;
  if (!(y >= 1000 && y <= 2100)) return {bad: 'Podaj rok'}; if (d > dim(y, m)) return {bad: 'W tym miesiącu nie ma dnia ' + d}; const g = jul ? julToGreg(y, m, d) : {y, m, d}; return {iso: isoYMD(g), jul}; }
function narzPickerPodlacz(a){ const M = $('main');
  M.querySelectorAll('[data-pk="age"]').forEach(b => b.onclick = () => { const box = b.closest('.pick'), n = parseInt(box.querySelector('[data-pn]').value, 10), u = box.querySelector('[data-pu]').value; if (!(n >= 0 && n <= 130)) return toast('Podaj liczbę 0–130'); setf(a, 'age', ageFmt(n, u, true), 'edit'); });
  M.querySelectorAll('[data-kal]').forEach(box => { const pod = box.querySelector('[data-kp]'), odsw = () => { const w = kalWynik(box); pod.textContent = w.bad ? '⚠ ' + w.bad : '→ ' + w.iso + (w.jul ? ' (nowy styl)' : ''); }; box.querySelectorAll('select,input').forEach(i => i.onchange = odsw); odsw();
    box.querySelector('[data-kk]').onclick = () => { const w = kalWynik(box); if (w.bad) return toast('⚠ ' + w.bad, 4000); const f = box.dataset.kal, bad = dateBad(a, f, w.iso); if (bad) return toast('⚠ ' + bad + ' – nie zapisano', 5000); setf(a, f, w.iso, 'edit'); }; }); }
// ---- ignorowanie sygnałów raportu spójności
function sygnalyHtml(a){ const all = repAll(true).filter(i => i.id === a.id), ign = S.repIgn || {}, akt = all.filter(i => !ign[i.id + '|' + i.code]), n = all.length - akt.length;
  return h`${akt.length ? h`<div class="warn rap">${akt.map(i => h`<div data-kod="${i.code}">${i.sev === 'err' ? '⛔' : i.sev === 'warn' ? '⚠' : 'ℹ'} ${i.msg} <button class="sm" data-ign="${i.id + '|' + i.code}" title="Nie pokazuj tego sygnału">ignoruj</button></div>`)}</div>` : ''}
    ${n ? h`<div class="muted" id="ignInfo">Ignorowanych sygnałów: ${n} <button class="sm" id="bIgnPrzywroc">przywróć</button></div>` : ''}`; }
function sygnalyPodlacz(a){ const M = $('main');
  M.querySelectorAll('[data-ign]').forEach(b => b.onclick = () => { S.repIgn = Object.assign({}, S.repIgn, {[b.dataset.ign]: 1}); save(); renderAkt(); toast('Sygnał ignorowany'); });
  if ($('bIgnPrzywroc')) $('bIgnPrzywroc').onclick = () => { const p = Object.assign({}, S.repIgn); Object.keys(p).forEach(k => { if (k.startsWith(a.id + '|')) delete p[k]; }); S.repIgn = p; save(); renderAkt(); toast('Przywrócono sygnały'); }; }
// ---- kreator pól: pole po polu (zatwierdź i dalej / pomiń / wstecz)
const KR = {id: null, F: [], i: 0};
function kreatorStart(a){ KR.id = a.id; KR.F = fieldsOf(a).filter(f => appl(a, f.id) || clean(getv(a, f.id))); const s = S.acts[a.id]?.f || {}; const k = KR.F.findIndex(f => !(s[f.id]?.ok || s[f.id]?.skip)); KR.i = k < 0 ? 0 : k; kreatorRender(); }
function kreatorRender(){ const a = AM[KR.id]; if (!a || !KR.F.length) return; const f = KR.F[KR.i], v = getv(a, f.id), ai = a.ai?.[f.id], lb = a.lub?.[f.id], x = S.acts[a.id]?.f?.[f.id];
  okno('Kreator pól (' + (KR.i + 1) + '/' + KR.F.length + ')', h`<div class="pole"><label for="krV">${f.label}</label><input id="krV" value="${v}" autocomplete="off">
      <div class="chips">${x?.ok ? h`<span class="bdg ok">zatwierdzone</span>` : ''}${x?.skip ? h`<span class="bdg">pominięte</span>` : ''}${isUnc(a, f.id) ? h`<span class="bdg un">niepewne</span>` : ''}
      ${ai != null && String(ai).trim() !== '' && ai !== v ? h`<button class="chip" data-krv="${ai}">AI: ${ai}</button>` : ''}${lb != null && String(lb).trim() !== '' && lb !== v ? h`<button class="chip" data-krv="${lb}">indeks: ${lb}</button>` : ''}</div></div>`,
    [['krPrev', '‹ Wstecz'], ['krOk', 'Zatwierdź i dalej', 'p'], ['krSkip', 'Pomiń']]);
  const inp = $('krV'), dalej = () => { if (KR.i + 1 < KR.F.length) { KR.i++; kreatorRender(); } else { $('okno').hidden = true; toast('Kreator: koniec pól'); } };
  $('oknoTresc').querySelectorAll('[data-krv]').forEach(b => b.onclick = () => { inp.value = b.dataset.krv; inp.focus(); });
  $('krPrev').disabled = KR.i === 0; $('krPrev').onclick = () => { KR.i = Math.max(0, KR.i - 1); kreatorRender(); };
  $('krOk').onclick = () => { const val = inp.value, bad = dateBad(a, f.id, val); if (bad) return toast('⚠ ' + bad + ' – nie zapisano', 5000); const z = S.acts[a.id]?.f?.[f.id]?.src; commit(a, f.id, val, z === 'ai' && val === a.ai?.[f.id] ? 'ai' : (z && val === getv(a, f.id) ? z : 'edit')); keepScroll(); dalej(); };
  $('krSkip').onclick = () => { commit(a, f.id, getv(a, f.id), S.acts[a.id]?.f?.[f.id]?.src || 'edit', {skip: true}); keepScroll(); dalej(); };
  inp.onkeydown = e => { if (e.key === 'Enter') $('krOk').click(); }; inp.focus(); }
// ---- nawigacja stulecie → dekada → rok
const navStulecia = () => [...new Set(D.acts.map(a => Math.floor(a.year / 100) * 100))].sort((x, y) => x - y);
const navDekady = c => [...new Set(D.acts.filter(a => Math.floor(a.year / 100) * 100 === +c).map(a => Math.floor(a.year / 10) * 10))].sort((x, y) => x - y);
const navLata = () => [...new Set(D.acts.filter(a => (!S.cen || S.cen === 'all' || Math.floor(a.year / 100) * 100 === +S.cen) && (!S.dec || S.dec === 'all' || Math.floor(a.year / 10) * 10 === +S.dec)).map(a => a.year))].sort((x, y) => x - y);
const navPasuje = a => (!S.cen || S.cen === 'all' || Math.floor(a.year / 100) * 100 === +S.cen) && (!S.dec || S.dec === 'all' || Math.floor(a.year / 10) * 10 === +S.dec);
// ---- podłączenie po renderze karty
function narzPodlacz(a){ tekstPodlacz(a); narzPickerPodlacz(a); sygnalyPodlacz(a); if ($('bKreator')) $('bKreator').onclick = () => kreatorStart(a); skanPodlacz(a);
  $('main').querySelectorAll('input[data-f],textarea[data-f]').forEach(inp => inp.addEventListener('focus', () => { if (typeof skanFokusPola === 'function') skanFokusPola(a, inp.dataset.f); })); }
