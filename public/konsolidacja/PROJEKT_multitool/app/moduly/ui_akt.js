/* app/moduly/ui_akt.js – karta aktu zgonu (krok 3): pola z podpowiedziami AI/indeks, zatwierdzanie pola i aktu, ostrzeżenia, raport spójności, tekst aktu.
   Podgląd skanu/ROI: ui_skan.js; tryby tekstu, kreator pól, pickery wieku i kalendarza, ignorowanie sygnałów: ui_narzedzia.js. */
const $ = id => document.getElementById(id);
const curAct = () => AM[S.cur];
function toast(t, ms){ const e = $('toast'); if (!e) return; e.textContent = t; e.style.display = 'block'; clearTimeout(toast.t); toast.t = setTimeout(() => e.style.display = 'none', ms || 2500); }
const wAktach = () => typeof OSS === 'undefined' || OSS.zakl === 'akty';
function keepScroll(){ if (!wAktach()) return; const y = window.scrollY; if (typeof renderAkt === 'function') { renderAkt(); renderLista(); } window.scrollTo(0, y); }
const ZR = {csv: 'z CSV', txt: 'z tekstu', ai: 'AI', lub: 'indeks', bz: 'baza', akt: 'akt', edit: 'własne', auto: 'auto'};
function przyjmij(a, f, v, src, extra){ commit(a, f, v, src, extra); keepScroll(); }
const doAll = () => { const a = curAct(); if (!a || !a.ai) return toast('Brak odczytu AI do porównania'); let n = 0; fieldsOf(a).forEach(f => { if (diffState(a, f.id) === 'eq' && !st(a.id).f[f.id]) { st(a.id).f[f.id] = {v: clean(a.ai[f.id]), src: 'ai', ok: true, unc: st(a.id).f[f.id]?.unc}; n++; } }); save(); renderAkt(); renderLista(); toast('Przyjęto zgodne pola: ' + n); };
const doDone = () => { const a = curAct(); if (!a) return; const s = st(a.id); s.done = !s.done; if (s.done) autoResolve(a); save(); renderLista(); renderAkt(); toast(s.done ? 'Akt zatwierdzony ✓' : 'Cofnięto zatwierdzenie'); };
let AKT_ROZW = '';   // pole rozwinięte do edycji mimo trybu mini / „tylko sporne” (id aktu|pole)
function poleHtml(a, f, hid){ const s = S.acts[a.id], x = s?.f?.[f.id], v = getv(a, f.id), ai = a.ai?.[f.id], lb = a.lub?.[f.id];
  if (!appl(a, f.id) && !clean(v)) return ''; if (S.hideMk !== false && /^\[(?:_|-)\]$/.test(String(v || '').trim()) && !x?.ok && !x?.skip) { hid.push(f.label + ' ' + String(v).trim()); return ''; }
  const unc = isUnc(a, f.id), st0 = x?.skip ? 'sk' : x?.ok ? (unc ? 'un' : 'ok') : unc ? 'un' : (diffState(a, f.id) === 'ne' ? 'df' : ''), dlugie = /^(notes|cause_of_death|parents_raw|informant[12])$/.test(f.id) || (typDla(a).dlugie || []).includes(f.id) || String(v).length > 60;
  const sporne = !x?.ok && !x?.skip && (st0 === 'un' || st0 === 'df');
  if (S.sporne && !sporne && AKT_ROZW !== a.id + '|' + f.id) { hid.sp = (hid.sp || 0) + 1; return ''; }
  if (S.miniOk && (x?.ok || x?.skip) && !unc && AKT_ROZW !== a.id + '|' + f.id) return h`<div class="pole ok mini" data-pole="${f.id}"><span>${f.label}: <strong>${x.skip ? '— pominięte —' : v}</strong> ✓ <small class="muted">${ZR[x.src] || ''}</small></span><button class="sm" data-rozw="${f.id}" title="Pokaż pole do edycji">edytuj</button></div>`;
  const chip = (txt, val, src) => h`<button class="chip" data-chip="${f.id}" data-v="${val}" data-src="${src}" title="Użyj tej wartości">${txt}: ${val}</button>`;
  const chips = [ai != null && String(ai).trim() !== '' && ai !== v ? chip('AI', ai, 'ai') : '', lb != null && String(lb).trim() !== '' && lb !== v ? chip('indeks', lb, 'lub') : ''];
  return h`<div class="pole ${st0}" data-pole="${f.id}"><label for="p_${f.id}">${f.label}</label>
    ${dlugie ? h`<textarea id="p_${f.id}" data-f="${f.id}" rows="2">${v}</textarea>` : h`<input id="p_${f.id}" data-f="${f.id}" value="${v}" autocomplete="off">`}
    <div class="chips">${x ? h`<span class="bdg" data-bdg="zr">${ZR[x.src] || x.src || ''}</span>` : ''}${x?.ok ? h`<span class="bdg ok">zatwierdzone</span>` : ''}${unc ? h`<span class="bdg un">niepewne</span>` : ''}${x?.note ? h`<span class="bdg" title="${x.note}">uwaga</span>` : ''}${chips}
      <button class="sm" data-ak="ok" data-f="${f.id}" title="Zatwierdź pole">✓</button><button class="sm" data-ak="unc" data-f="${f.id}" title="Przełącz niepewność">?</button></div>${narzPicker(a, f)}</div>`; }
function renderAkt(){ if (!wAktach()) return; const m = $('main'), a = curAct(); if (!a) { wstaw(m, h`<div class="card muted">Wybierz akt z listy.</div>`); return; }
  const s = S.acts[a.id] || {}, FS = fieldsOf(a), hid = [], pr = progOf(a), W = warnsOf(a);
  const bl = typDla(a).bloki, pola = bl ? bl.map(b => { const L = b.pola.map(id => FS.find(f => f.id === id)).filter(Boolean).map(f => poleHtml(a, f, hid)).filter(x => x !== ''); return L.length ? h`<h3 class="blok">${b.t}</h3><div class="pola">${L}</div>` : ''; }) : null, poleZ = bl ? null : FS.map(f => poleHtml(a, f, hid));
  wstaw(m, h`<div class="card"><h2>${a.year} · akt ${a.act} · ${nmOf(a)}</h2>
    <div class="muted">id <code>${a.id}</code> · dawne <code>${a.stary}</code> · źródła ${(a.model?.zrodla || []).join(', ')} · skan: ${skanSciezka(a) || 'brak'}${a.nowy ? h` · <span class="bdg un" id="aktNowy">akt dodany ręcznie</span> <button class="sm d" id="bUsunNowy" title="Usuń ten akt (tylko akty dodane ręcznie)">usuń akt</button>` : ''}</div>
    <div class="bar"><i style="width:${pr}%"></i></div><div class="muted">Opracowanie pól: ${pr}%${s.done ? ' · AKT ZATWIERDZONY' : ''}</div>
    ${W.length ? h`<div class="warn">${W.map(t => h`<div>⚠ ${t}</div>`)}</div>` : ''}
    ${sygnalyHtml(a)}
    <div class="widok"><button id="bAll" ${a.ai ? '' : 'disabled'}>Przyjmij zgodne pola</button><button id="bKreator">Kreator pól</button>
      <button id="bSporne" class="${S.sporne ? 'on' : ''}" title="Pokaż tylko pola niepewne i z różnicą AI ↔ indeks (niezatwierdzone)">Tylko sporne</button><button id="bMini" class="${S.miniOk ? 'on' : ''}" title="Zatwierdzone pola jako krótkie wiersze">Zwiń zatwierdzone</button></div>
    ${bl ? h`<div class="bloki" id="bloki">${pola}</div>` : h`<div class="pola">${poleZ}</div>`}
    ${hid.sp ? h`<div class="muted" id="sporneInfo">Ukryto pól bez sporu: ${hid.sp}.</div>` : ''}
    ${hid.length ? h`<div class="muted hmk">∅ Puste (ukryte): ${hid.join(' · ')} <button class="sm" id="bShowMk">pokaż</button></div>` : ''}
    ${typeof xrefSekcja === 'function' ? xrefSekcja(a) : ''}${tekstSekcja(a)}${typeof aktHistoria === 'function' ? aktHistoria(a) : ''}
    <div class="aktbar"><button id="bPrev" title="Poprzedni akt (Alt+K)">‹ Poprzedni</button><button class="p" id="bDone" title="Alt+Enter">${s.done ? 'Cofnij zatwierdzenie aktu' : 'Zatwierdź akt'}</button><button id="bDoneNext" title="Zatwierdź i przejdź do następnego niezatwierdzonego (Ctrl+Shift+Enter)">✓ i następny ›</button><button id="bNext" title="Następny akt (Alt+J)">Następny ›</button>
      <button id="bSpor" title="Przejdź do następnego pola niepewnego lub z różnicą (Alt+R)">Sporne pole ↓</button><span class="sp"></span><button id="bUndo" title="Cofnij ostatnią zmianę (Alt+Z)">↶ Cofnij</button><button id="bRedo" title="Ponów (Alt+Y)">↷ Ponów</button></div></div>`);
  $('bDone').onclick = doDone; $('bAll').onclick = doAll; if ($('bShowMk')) $('bShowMk').onclick = () => { S.hideMk = false; save(); renderAkt(); };
  m.querySelectorAll('[data-f]').forEach(inp => { if (inp.tagName === 'BUTTON') return; inp.onchange = () => { const f = inp.dataset.f, bad = dateBad(a, f, inp.value); if (bad) { toast('⚠ ' + bad + ' – nie zapisano', 5000); inp.value = getv(a, f); return; } setf(a, f, inp.value, 'edit'); }; });
  m.querySelectorAll('[data-chip]').forEach(b => b.onclick = () => przyjmij(a, b.dataset.chip, b.dataset.v, b.dataset.src));
  m.querySelectorAll('[data-ak]').forEach(b => b.onclick = () => { const f = b.dataset.f, inp = m.querySelector('[data-f="' + f + '"]'); if (b.dataset.ak === 'ok') { const x = S.acts[a.id]?.f?.[f], v = inp ? inp.value : getv(a, f); przyjmij(a, f, v, x?.src || (a.ai?.[f] === v ? 'ai' : a.lub?.[f] === v ? 'lub' : 'edit')); } else przyjmij(a, f, inp ? inp.value : getv(a, f), S.acts[a.id]?.f?.[f]?.src || 'edit', {unc: !isUnc(a, f)}); });
  if ($('tTxt')) $('tTxt').onchange = e => { const t = e.target.value; if (t === (a.tekst || '')) delete st(a.id).text; else st(a.id).text = t; save(); toast('Zapisano tekst'); };
  m.querySelectorAll('[data-rozw]').forEach(b => b.onclick = () => { AKT_ROZW = a.id + '|' + b.dataset.rozw; keepScroll(); const i = $('p_' + b.dataset.rozw); if (i) i.focus(); });
  $('bSporne').onclick = () => { S.sporne = !S.sporne; AKT_ROZW = ''; save(); keepScroll(); }; $('bMini').onclick = () => { S.miniOk = !S.miniOk; AKT_ROZW = ''; save(); keepScroll(); };
  if ($('bUsunNowy')) $('bUsunNowy').onclick = () => { if (!confirm('Usunąć akt dodany ręcznie (' + a.year + ' nr ' + a.act + ') razem z wpisanymi polami? Tej operacji nie cofnie przycisk „Cofnij”. Wcześniej warto zrobić kopię pełną.')) return; nowyUsun(a.id); S.cur = (widoczne()[0] || {}).id || null; save(); odswiez(); typInit0(); toast('Usunięto akt dodany ręcznie'); };
  if (typeof aktbarPodlacz === 'function') aktbarPodlacz(a); if (typeof xrefPodlacz === 'function') xrefPodlacz(a);
  skanWinRender(a); narzPodlacz(a); }
