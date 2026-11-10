/* moduly/wystapienia.js – wystąpienie → profil do porównań (czyste funkcje, bez DOM). Wymaga: norm.js.
   Wystąpienie nie kopiuje danych: „mapa” wskazuje pola aktu. Profil jest pochodną liczoną przy każdym uruchomieniu (zmiana pola aktu od razu zmienia profil). */
const WYST_PLEC_ROLI = {ojciec:'M', matka:'K', pan_mlody:'M', panna_mloda:'K', ojciec_pana:'M', matka_pana:'K', ojciec_panny:'M', matka_panny:'K', chrzestny:'M', chrzestna:'K'};
const WYST_ZYJE = /^(ojciec|matka|pan_mlody|panna_mloda|swiadek\d?|chrzestny|chrzestna|zglaszajacy\d?|osadnik)$/;   // role, w których osoba na pewno żyje w roku aktu
const WYST_RODZICE = {dziecko:['ojciec','matka'], zmarly:['ojciec','matka'], pan_mlody:['ojciec_pana','matka_pana'], panna_mloda:['ojciec_panny','matka_panny']};
const WYST_PARY = [['ojciec','matka'], ['pan_mlody','panna_mloda'], ['ojciec_pana','matka_pana'], ['ojciec_panny','matka_panny'], ['zmarly','malzonek']];
const wystPole = (akt, w, k) => { const f = w.mapa[k], p = f && akt.pola[f]; return p && !normBrak(p.value) ? p.value : ''; };
// „Jan Kowalski, 43” → imię + nazwisko (świadkowie, małżonek w akcie zgonu)
function wystRozbij(t){ const c = normCzysc(String(t).split(',')[0]).split(' ').filter(Boolean); return c.length > 1 ? {imie: c.slice(0, -1).join(' '), nazwisko: c[c.length - 1]} : {imie: c[0] || '', nazwisko: ''}; }
// płeć z imienia tylko jako dane pochodne do porównań (nie zapisujemy jej w akcie)
const wystPlecZImienia = im => { const k = kluczImienia(im)[0]; return !k ? '' : /a$/.test(k) && !/^(kuba|barnaba|bonawentura|kosma|jarema)$/.test(k) ? 'K' : 'M'; };
function wystProfile(D){ const A = {}; D.akty.forEach(a => A[a.id] = a); const poAkcie = {}; D.wystapienia.forEach(w => (poAkcie[w.akt] = poAkcie[w.akt] || {})[w.rola] = w); const P = {};
  D.wystapienia.forEach(w => { const a = A[w.akt]; if (!a) return; let imie = wystPole(a, w, 'imie'), nazw = wystPole(a, w, 'nazwisko'); const razem = wystPole(a, w, 'imie_nazwisko'); if (razem) { const x = wystRozbij(razem); imie = imie || x.imie; nazw = nazw || x.nazwisko; }
    const p = P[w.id] = {id: w.id, akt: a.id, typ: a.typ, rola: w.rola.replace(/^(ojciec|matka)_(pana|panny)$/, '$1'), rolaAktu: w.rola, rok: a.rok, imie, nazwisko: nazw, rodowe: wystPole(a, w, 'rodowe'), wiek: wystPole(a, w, 'wiek'), miejsce: wystPole(a, w, 'miejsce') || a.miejsce || '', dom: wystPole(a, w, 'dom'),
      plec: wystPole(a, w, 'plec') || WYST_PLEC_ROLI[w.rola] || wystPlecZImienia(imie), zg: w.rola === 'zmarly' ? a.rok : null, zyje: WYST_ZYJE.test(w.rola) ? [a.rok] : [], dzieciUr: /^(ojciec|matka)$/.test(w.rola) && a.typ === 'chrzest' ? [a.rok] : [], malzonek: []};
    if (p.rola === 'matka' && p.rodowe && fold(p.rodowe) === fold(p.nazwisko)) p.nazwisko = ''; });
  // rodzice i małżonek z tego samego aktu
  D.wystapienia.forEach(w => { const p = P[w.id], R = poAkcie[w.akt]; if (!p) return; const rd = WYST_RODZICE[w.rola];
    if (rd) { const o = R[rd[0]] && P[R[rd[0]].id], m = R[rd[1]] && P[R[rd[1]].id]; if (o) { p.ojciec = o.imie; p.ojciecNazw = o.nazwisko; } if (m) { p.matka = m.imie; p.matkaNazw = m.rodowe; } }
    WYST_PARY.forEach(([x, y]) => { const q = w.rola === x ? R[y] : w.rola === y ? R[x] : null; if (q && P[q.id] && P[q.id].imie) p.malzonek.push(P[q.id].imie); }); });
  return P; }
// etykieta wystąpienia do list
const wystEtykieta = p => [(p.imie + ' ' + (p.nazwisko || (p.rodowe ? 'z d. ' + p.rodowe : ''))).trim() || '(bez nazwiska)', p.rolaAktu.replace(/_/g, ' '), p.typ + ' ' + p.rok].join(' · ');
