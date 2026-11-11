/* app/moduly/ui_skan_akty.js – okno „Skan → akty”: wczytanie pojedynczego skanu, ustawienia folderu (typ, rok, ile aktów na skanie, pierwszy skan z aktami)
   i dopisanie nowych aktów albo dobranie skanu do istniejących. Logika w skan_profil.js; tu tylko DOM. */
function skanAktyWybierz(){ let i = $('fSkanJeden'); if (!i) { i = document.createElement('input'); i.type = 'file'; i.id = 'fSkanJeden'; i.hidden = true; i.accept = 'image/*'; document.body.appendChild(i);
    i.onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) skanAktyOkno(f); }; } i.click(); }
const SP_STAN = {nowy: 'brak w bazie → dopisze nowy akt', dobierz: 'jest w bazie bez skanu → dobierze skan', 'ten-sam': 'jest w bazie, ten skan już przypisany', inny: 'jest w bazie, ma inny skan', blad: ''};
function skanAktyOkno(plik){ if (!plik) return skanAktyWybierz();
  if (!SK.pliki.some(f => f.name === plik.name)) { SK.pliki.push(plik); SK.kandCache = {}; }
  const klucz = skpKlucz(plik), PR = S.skProf = S.skProf || {}, prof = PR[klucz] || {}, nrp = skpNumerPliku(plik.name), z = skpZeSkanu(plik.name);
  const typ0 = z ? z.typ : prof.typ || skpTyp(klucz) || D.typ, rok0 = z ? z.rok : prof.rok || skpRok(klucz) || '';
  const przed = prof.pierwszy != null && nrp != null && nrp < prof.pierwszy, ile0 = z ? z.ile : przed ? 0 : (prof.aktow || 1), od0 = z ? z.od : rok0 ? skpOd(prof, typ0, +rok0, nrp) : '';
  let hash = '', zast = new Set(); skpHash(plik).then(x => { hash = x; });
  okno('Skan → akty', h`<img id="spImg" alt="Podgląd skanu" style="display:block;max-width:100%;max-height:36vh;margin:0 auto 8px;object-fit:contain;background:var(--skan-bg)">
    <p class="muted">Plik: <b>${plik.name}</b> · skan nr ${nrp == null ? '?' : nrp} · folder / zbiór: <b>${klucz}</b> · ${prof.typ ? 'ustawienia folderu zapamiętane' : 'pierwsze wczytanie z tego folderu'}. Ustawienia (typ aktu = format pól, rok, liczba aktów na skanie, pierwszy skan z aktami) zapamiętają się dla tego folderu, a numer pierwszego aktu na następnym skanie program policzy sam.</p>
    <div class="pola"><div class="pole"><label for="spTyp">Typ aktu (format pól)</label><select id="spTyp">${D.typy.map(t => h`<option value="${t}" ${t === typ0 ? raw('selected') : ''}>${NAZWY_TYPOW[t] || t}</option>`)}</select></div>
      <div class="pole"><label for="spRok">Rok aktów na tym skanie</label><input id="spRok" inputmode="numeric" maxlength="4" value="${rok0}" autocomplete="off"></div>
      <div class="pole"><label for="spNrP">Numer tego skanu</label><input id="spNrP" inputmode="numeric" maxlength="6" value="${nrp == null ? '' : nrp}" autocomplete="off"></div>
      <div class="pole"><label for="spPierw">Pierwszy skan z aktami (wcześniejsze: okładka, karta filmu)</label><input id="spPierw" inputmode="numeric" maxlength="6" value="${prof.pierwszy == null ? '' : prof.pierwszy}" autocomplete="off"></div>
      <div class="pole"><label for="spOd">Numer pierwszego aktu na skanie</label><input id="spOd" inputmode="numeric" maxlength="5" value="${od0}" autocomplete="off"></div>
      <div class="pole"><label for="spIle">Ile aktów na skanie (0 = brak aktów)</label><input id="spIle" inputmode="numeric" maxlength="2" value="${ile0}" autocomplete="off"></div></div>
    <div id="spPlan"></div><p class="err" id="spBlad" role="alert"></p>`, [['spZastosuj', 'Zastosuj i otwórz pierwszy akt', 'p'], ['spNast', 'Zastosuj i następny skan'], ['spPomin', 'Ten skan bez aktów, następny']]);
  $('spImg').src = skanUrl(plik);
  const num = id => { const v = String($(id).value).trim(); return /^\d+$/.test(v) ? parseInt(v, 10) : null; };
  const dane = () => { const rok = num('spRok'), od = num('spOd'), ile = num('spIle'); return {typ: $('spTyp').value, rok, od, ile: ile == null ? null : Math.min(SKP_MAX, ile), nrP: num('spNrP'), pierw: num('spPierw')}; };
  const rys = () => { const d = dane(), el = $('spPlan'); $('spBlad').textContent = '';
    if (d.ile === 0) return wstaw(el, h`<p class="muted" id="spPusty">Brak aktów na tym skanie – zapisze się tylko ustawienie folderu (ten skan liczy się jako obsłużony).</p>`);
    if (d.rok == null || d.rok < NOWE_ROK[0] || d.rok > NOWE_ROK[1] || d.od == null || d.od < 1 || d.ile == null) return wstaw(el, h`<p class="muted" id="spPusty">Wpisz rok, numer pierwszego aktu i liczbę aktów na skanie.</p>`);
    const P = skpPlan(d.typ, d.rok, d.od, d.ile, plik.name);
    wstaw(el, h`<div class="rtab"><table id="spTab"><tr><th>Nr aktu</th><th>Co zrobi</th><th></th></tr>${P.map(w => h`<tr data-stan="${w.stan}"><td>${w.nr}</td><td>${w.stan === 'blad' ? w.blad : SP_STAN[w.stan]}${w.stan === 'inny' ? ': ' + skanBase(w.skan) : ''}</td><td>${w.stan === 'inny' ? h`<label><input type="checkbox" data-zast="${w.nr}" ${zast.has(w.nr) ? raw('checked') : ''}> zastąp skan</label>` : ''}</td></tr>`)}</table></div>`);
    el.querySelectorAll('[data-zast]').forEach(c => c.onchange = () => { const n = +c.dataset.zast; if (c.checked) zast.add(n); else zast.delete(n); }); return P; };
  ['spTyp', 'spRok', 'spNrP', 'spPierw', 'spOd', 'spIle'].forEach(id => $(id).oninput = rys); rys();
  const nastepny = () => { const L = SK.pliki.filter(f => skpKlucz(f) === klucz).sort(skanNat), i = L.findIndex(f => f.name === plik.name); if (i >= 0 && L[i + 1]) return skanAktyOkno(L[i + 1]); toast('To ostatni wczytany skan tego folderu – wskaż następny'); skanAktyWybierz(); };
  const zastosuj = (nast, bez) => { const d = dane(); if (bez) d.ile = 0; if (d.ile == null) return void ($('spBlad').textContent = 'Wpisz liczbę aktów na skanie (0, jeśli brak).');
    let R = {dodane: [], dobrane: [], zastapione: [], zostawione: []};
    if (d.ile > 0) { if (d.rok == null || d.rok < NOWE_ROK[0] || d.rok > NOWE_ROK[1] || d.od == null || d.od < 1) return void ($('spBlad').textContent = 'Wpisz rok (cztery cyfry) i numer pierwszego aktu na skanie.');
      const P = skpPlan(d.typ, d.rok, d.od, d.ile, plik.name), b = P.find(w => w.stan === 'blad'); if (b) return void ($('spBlad').textContent = 'Akt nr ' + b.nr + ': ' + b.blad); R = skpZastosuj(P, plik.name, zast, hash); if (R.blad) return void ($('spBlad').textContent = R.blad); }
    const nowszy = d.nrP != null && (prof.ostPlik == null || d.nrP >= prof.ostPlik);   // wcześniejszy skan nie cofa licznika „ostatni skan / ostatni akt”
    PR[klucz] = Object.assign({}, prof, {typ: d.typ, rok: d.rok || prof.rok, aktow: d.ile > 0 ? d.ile : prof.aktow || 1, pierwszy: d.pierw != null ? d.pierw : d.ile > 0 && d.nrP != null ? d.nrP : prof.pierwszy == null ? null : prof.pierwszy});
    if (nowszy) { PR[klucz].ostPlik = d.nrP; if (d.ile > 0) { PR[klucz].ostNr = d.od + d.ile - 1; PR[klucz].ostRok = d.rok; PR[klucz].ostTyp = d.typ; } }
    save(); typInit0(); const ids = [...R.dodane, ...R.dobrane, ...R.zastapione];
    toast(d.ile > 0 ? 'Skan ' + plik.name + ': dopisano ' + R.dodane.length + ', dobrano ' + R.dobrane.length + (R.zastapione.length ? ', zastąpiono ' + R.zastapione.length : '') + (R.zostawione.length ? ', bez zmian ' + R.zostawione.length : '') : 'Zapisano ustawienia folderu „' + klucz + '”');
    if (nast) return nastepny(); $('okno').hidden = true; const pierwszy = ids.length ? ids[0] : (R.zostawione[0] || ''); if (pierwszy) { osOtworzAkt('w:' + pierwszy + ':x'); if (R.dodane.includes(pierwszy)) { const i = document.querySelector('#main input[data-f]'); if (i) i.focus(); } } };
  $('spZastosuj').onclick = () => zastosuj(false, false); $('spNast').onclick = () => zastosuj(true, false); $('spPomin').onclick = () => zastosuj(true, true); }
