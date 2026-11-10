/* moduly/identity.js – propozycje tożsamości (czyste funkcje, bez DOM). Wymaga: tekst.js, raport.js, norm.js.
   NIC NIE SCALA. Zwraca uzasadnienie: zgodności / rozbieżności / sprzeczności / braki + wniosek słowny. Nie ma jednej liczby punktów.
   Wejście = „profil” wystąpienia (budowany z pól aktu, patrz MODEL_DANYCH.md §4):
   {id, akt, typ, rola, rok, imie, nazwisko, rodowe, plec('M'|'K'|''), wiek, ur:[min,max]|null, zg:rok|null, zyje:[lata],
    miejsce, dom, ojciec, ojciecNazw, matka, matkaNazw, malzonek:[imiona], dzieciUr:[lata]} */
const ID_WERSJA_REGUL = 1;
const ID_WNIOSKI = {sprawdz:'sprawdź (mocna propozycja)', mozliwe:'możliwe', malo:'za mało danych', konflikt:'konflikt', odrzucone:'odrzucone'};   // „odrzucone” ustawia wyłącznie użytkownik
const ID_ROLE_ZYJE = /^(pan_mlody|panna_mloda|ojciec|matka|swiadek|chrzestny|chrzestna|zglaszajacy|osadnik|malzonek_zyjacy)/;

// przedział urodzenia profilu: jawny (akt chrztu) albo z wieku w akcie
function idUr(p){ if (p.ur) return p.ur; if (p.rola === 'dziecko' && p.rok) return [p.rok - 1, p.rok]; return przedzialUr(p.rok, p.wiek); }
// nazwiska kobiety: mężowskie i rodowe to dwa różne pola; porównujemy każde z każdym i zapisujemy, które się zgodziły
function idNazwiska(p){ const o = []; if (!normBrak(p.nazwisko)) o.push([p.nazwisko, p.rola === 'panna_mloda' || p.rola === 'dziecko' ? 'rodowe' : (p.plec === 'K' ? 'nieokreślone' : 'rodowe')]); if (!normBrak(p.rodowe)) o.push([p.rodowe, 'rodowe']); return o; }
function idPorNazw(a, b, klasy){ const A = idNazwiska(a), B = idNazwiska(b); if (!A.length || !B.length) return null; const rank = {rowne:4, wariant:3, slownik:3, podobne:1, rozne:0}; let best = null;
  A.forEach(x => B.forEach(y => { const r = porNazwiska(x[0], y[0], klasy); if (r && (!best || rank[r] > rank[best.r])) best = {r, x, y}; }));
  // różne nazwiska u kobiety, gdy nie porównano rodowego z rodowym, to brak danych, nie rozbieżność (zmiana nazwiska po ślubie)
  if (best && best.r === 'rozne' && (a.plec === 'K' || b.plec === 'K') && !(best.x[1] === 'rodowe' && best.y[1] === 'rodowe')) best.r = 'nieporownywalne';
  return best; }

/* Porównanie dwóch profili. opt.klasy = klasy wariantów nazwisk potwierdzone decyzjami {klucz: idKlasy}. */
function porownajProfile(a, b, opt){ opt = opt || {}; const Z = [], R = [], S = [], B = []; const z = (k, t, mocna) => Z.push({k, t, mocna: !!mocna}), r = (k, t, istotna) => R.push({k, t, istotna: !!istotna}), s = (k, t) => S.push({k, t}), br = (k, t) => B.push({k, t});
  // 1. płeć
  if (a.plec && b.plec) { if (a.plec !== b.plec) s('plec', 'różna płeć (' + a.plec + ' / ' + b.plec + ')'); } else br('plec', 'płeć nieznana w ' + (!a.plec && !b.plec ? 'obu wystąpieniach' : 'jednym wystąpieniu'));
  // 2. nazwisko
  const n = idPorNazw(a, b, opt.klasy);
  if (!n) br('nazwisko', 'brak nazwiska do porównania');
  else if (n.r === 'rowne') z('nazwisko', 'nazwisko „' + n.x[0] + '”');
  else if (n.r === 'wariant') z('nazwisko', 'nazwisko w dawnej pisowni: „' + n.x[0] + '” / „' + n.y[0] + '”');
  else if (n.r === 'slownik') z('nazwisko', 'warianty jednego nazwiska wg zatwierdzonego słownika: „' + n.x[0] + '” / „' + n.y[0] + '”');
  else if (n.r === 'podobne') r('nazwisko', 'nazwiska podobne, ale nie te same: „' + n.x[0] + '” / „' + n.y[0] + '” – sprawdź na skanie', true);
  else if (n.r === 'nieporownywalne') br('nazwisko', 'nazwisk nie da się porównać (kobieta: mężowskie / rodowe): „' + n.x[0] + '” / „' + n.y[0] + '”');
  else r('nazwisko', 'różne nazwiska: „' + n.x[0] + '” / „' + n.y[0] + '”', true);
  // 3. imię
  const im = porImiona(a.imie, b.imie);
  if (im === null) br('imie', 'brak imienia do porównania'); else if (im === 'rowne') z('imie', 'imię „' + normCzysc(a.imie) + '”' + (fold(normCzysc(a.imie)) !== fold(normCzysc(b.imie)) ? ' / „' + normCzysc(b.imie) + '”' : ''));
  else if (im === 'bliskie') r('imie', 'imiona bliskie, często mylone: „' + normCzysc(a.imie) + '” / „' + normCzysc(b.imie) + '”', true); else r('imie', 'różne imiona: „' + normCzysc(a.imie) + '” / „' + normCzysc(b.imie) + '”', true);
  // 4. urodzenie (przedziały, nie punkty)
  const ua = idUr(a), ub = idUr(b);
  if (!ua || !ub) br('urodzenie', 'brak wieku lub daty urodzenia w ' + (!ua && !ub ? 'obu wystąpieniach' : 'jednym wystąpieniu'));
  else if (przedzialyWspolne(ua, ub)) { const waski = Math.min(ua[1] - ua[0], ub[1] - ub[0]) <= 4 && Math.max(ua[1] - ua[0], ub[1] - ub[0]) <= 14; z('urodzenie', 'rok urodzenia zgodny: ' + ua.join('–') + ' i ' + ub.join('–') + (waski ? '' : ' (szeroki przedział, wiek przybliżony)'), waski); }
  else { const d = przedzialyOdstep(ua, ub); if (d <= 5) r('urodzenie', 'rok urodzenia rozbieżny o ' + d + ' l. ponad tolerancję: ' + ua.join('–') + ' i ' + ub.join('–'), false); else r('urodzenie', 'rok urodzenia niezgodny (' + d + ' l. ponad tolerancję): ' + ua.join('–') + ' i ' + ub.join('–'), true); }
  // 5. chronologia – niemożliwości logiczne
  const chr = (x, y) => { if (!x.zg) return; const pozniej = (y.zyje || []).filter(t => t > x.zg + (y.rola === 'ojciec' ? 1 : 0)); if (pozniej.length) s('zyje-po-zgonie', 'zgon w ' + x.zg + ', a w ' + pozniej[0] + ' osoba występuje jako żyjąca (' + y.rola + ')');
    const dz = (y.dzieciUr || []).filter(t => t > x.zg + (x.plec === 'K' ? 0 : 1)); if (dz.length) s('dziecko-po-zgonie', 'zgon w ' + x.zg + ', a dziecko urodzone w ' + dz[0]); };
  chr(a, b); chr(b, a);
  if (a.zg && b.zg && a.akt !== b.akt) { if (a.zg !== b.zg) s('dwa-zgony', 'dwa akty zgonu w różnych latach: ' + a.zg + ' i ' + b.zg); else z('zgon', 'ten sam rok zgonu ' + a.zg + ' (możliwy podwójny wpis – sprawdź)', false); }
  if (a.rola === 'dziecko' && b.rola === 'dziecko' && a.akt !== b.akt && a.typ === b.typ) s('dwa-chrzty', 'dwa różne akty chrztu (' + a.rok + ' i ' + b.rok + ') – to dwoje dzieci, częste powtórzenie imienia po zmarłym rodzeństwie');
  const przedUr = (x, y) => { const u = idUr(x); if (u) (y.zyje || []).forEach(t => { if (ID_ROLE_ZYJE.test(y.rola) && t < u[0] + 12 && !S.some(q => q.k === 'przed-urodzeniem')) s('przed-urodzeniem', 'w ' + t + ' osoba dorosła (' + y.rola + '), a urodzenie najwcześniej w ' + u[0]); }); };
  przedUr(a, b); przedUr(b, a);
  // 6. rodzice
  let RODZ = () => {};
  const rodz = (etyk, x, y, kx, ky) => { const p = porImiona(x, y); if (p === null) { if (!normBrak(x) || !normBrak(y)) br(kx, etyk + ' znany tylko w jednym wystąpieniu'); else br(kx, etyk + ' nieznany w obu'); return null; }
    if (p === 'rowne') z(kx, etyk + ': „' + normCzysc(x) + '”', true); else if (p === 'bliskie') r(kx, etyk + ' – imiona bliskie: „' + normCzysc(x) + '” / „' + normCzysc(y) + '”', false); else r(kx, etyk + ' – inne imię: „' + normCzysc(x) + '” / „' + normCzysc(y) + '”', true); return p; };
  const po = rodz('ojciec', a.ojciec, b.ojciec, 'ojciec'), pm = rodz('matka', a.matka, b.matka, 'matka');
  let mnZg = false;
  if (po === 'rozne' && pm === 'rozne') RODZ = () => { if (!mnZg) s('rodzice', 'oboje rodzice inni: ' + normCzysc(a.ojciec) + ' i ' + normCzysc(a.matka) + ' / ' + normCzysc(b.ojciec) + ' i ' + normCzysc(b.matka)); };
  if (!normBrak(a.matkaNazw) && !normBrak(b.matkaNazw)) { const q = porNazwiska(a.matkaNazw, b.matkaNazw, opt.klasy); if (q === 'rowne' || q === 'wariant' || q === 'slownik') { mnZg = true; z('matkaNazw', 'nazwisko rodowe matki: „' + normCzysc(a.matkaNazw) + '”', true); } else if (q === 'rozne') r('matkaNazw', 'inne nazwisko rodowe matki: „' + normCzysc(a.matkaNazw) + '” / „' + normCzysc(b.matkaNazw) + '”', true); }
  RODZ();   // oboje rodzice inni = sprzeczność, chyba że zgadza się nazwisko rodowe matki (wtedy zostają dwie istotne rozbieżności)
  // 7. małżonek (różny małżonek to nie sprzeczność: drugie małżeństwo)
  const ma = (a.malzonek || []).filter(x => !normBrak(x)), mb = (b.malzonek || []).filter(x => !normBrak(x));
  if (ma.length && mb.length) { if (ma.some(x => mb.some(y => porImiona(x, y) === 'rowne'))) z('malzonek', 'imię małżonka: „' + ma.find(x => mb.some(y => porImiona(x, y) === 'rowne')) + '”', true); else r('malzonek', 'inny małżonek: „' + ma.join(', ') + '” / „' + mb.join(', ') + '” (możliwe drugie małżeństwo)', false); }
  else br('malzonek', 'małżonek nieznany w ' + (!ma.length && !mb.length ? 'obu wystąpieniach' : 'jednym wystąpieniu'));
  // 8. miejscowość i dom (inna miejscowość to nie sprzeczność: ludzie się przenoszą)
  const pmj = porMiejsca(a.miejsce, b.miejsce);
  if (pmj === null) br('miejsce', 'brak miejscowości do porównania'); else if (pmj === 'rowne') z('miejsce', 'miejscowość „' + normCzysc(a.miejsce) + '”', false); else if (pmj === 'mozliwe') z('miejsce', 'miejscowość prawdopodobnie ta sama: „' + normCzysc(a.miejsce) + '” / „' + normCzysc(b.miejsce) + '”', false); else r('miejsce', 'inna miejscowość: „' + normCzysc(a.miejsce) + '” / „' + normCzysc(b.miejsce) + '”', false);
  if (!normBrak(a.dom) && !normBrak(b.dom) && pmj === 'rowne') { if (String(a.dom).replace(/\D/g, '') === String(b.dom).replace(/\D/g, '') && Math.abs((a.rok || 0) - (b.rok || 0)) <= 30) z('dom', 'ten sam numer domu ' + a.dom + ' (akty w odstępie do 30 lat)', true); }
  return idWniosek({zgodnosci: Z, rozbieznosci: R, sprzecznosci: S, braki: B}); }

/* Wniosek z tabeli decyzyjnej (jawnej, bez wag):
   konflikt  – jakakolwiek sprzeczność logiczna;
   (brak propozycji) – nazwisko lub imię różne/niezgodne → para w ogóle nie jest kandydatem (rdzen=false);
   sprawdź   – rdzeń zgodny + ≥2 mocne zgodności, w tym ≥1 rodzinna (ojciec, matka, nazwisko matki, małżonek), 0 istotnych rozbieżności;
   możliwe   – rdzeń zgodny + ≥1 mocna zgodność, najwyżej 1 istotna rozbieżność;
   za mało danych – sam rdzeń (imię + nazwisko, ewentualnie miejscowość). */
function idWniosek(u){ const ma = k => u.zgodnosci.some(x => x.k === k); u.rdzen = ma('nazwisko') && ma('imie');
  const rodzinne = u.zgodnosci.filter(x => /^(ojciec|matka|matkaNazw|malzonek)$/.test(x.k)).length, mocne = u.zgodnosci.filter(x => x.mocna).length, istotne = u.rozbieznosci.filter(x => x.istotna && !/^(nazwisko|imie)$/.test(x.k)).length;
  u.wniosek = u.sprzecznosci.length ? 'konflikt' : !u.rdzen ? 'malo' : (mocne >= 2 && rodzinne >= 1 && !istotne) ? 'sprawdz' : (mocne >= 1 && istotne <= 1) ? 'mozliwe' : 'malo';
  u.porzadek = [({sprawdz:0, mozliwe:1, malo:2, konflikt:3})[u.wniosek], -rodzinne, -mocne, istotne, u.rozbieznosci.length];   // do sortowania listy (leksykograficznie), nie do pokazywania
  u.reguly = ID_WERSJA_REGUL; return u; }
const idPorzadek = (x, y) => { for (let i = 0; i < x.porzadek.length; i++) if (x.porzadek[i] !== y.porzadek[i]) return x.porzadek[i] - y.porzadek[i]; return 0; };

/* Kandydaci dla jednego profilu. Blokowanie po kluczu nazwiska (k2) i klasach słownika; wynik bez par z niezgodnym rdzeniem.
   Po zebraniu listy: konkurencja – jeśli na najwyższym poziomie jest >1 kandydat, „sprawdź” spada do „możliwe” z adnotacją. */
function idIndeks(profile, klasy){ const ix = {}; profile.forEach(p => idNazwiska(p).forEach(([v]) => { const k = kluczNazwiska(v); if (!k) return; const kk = (klasy && (klasy[k.k2] || klasy[k.k1])) || k.k2; (ix[kk] = ix[kk] || []).push(p); })); return ix; }
function idKandydaci(p, ix, opt){ opt = opt || {}; const seen = new Set([p.id]), out = [];
  idNazwiska(p).forEach(([v]) => { const k = kluczNazwiska(v); if (!k) return; const kk = (opt.klasy && (opt.klasy[k.k2] || opt.klasy[k.k1])) || k.k2;
    (ix[kk] || []).forEach(q => { if (seen.has(q.id) || q.akt === p.akt) return; seen.add(q.id); if (opt.pomin && opt.pomin(p, q)) return; const u = porownajProfile(p, q, opt); if (!u.rdzen) return; u.a = p.id; u.b = q.id; out.push(u); }); });
  out.sort(idPorzadek); idKonkurencja(out); return out; }
function idKonkurencja(L){ const top = L.filter(u => u.wniosek === 'sprawdz'); if (top.length > 1) top.forEach(u => { u.wniosek = 'mozliwe'; u.konkurencja = top.length; u.rozbieznosci.push({k:'konkurencja', t:'niejednoznaczne: ' + top.length + ' kandydatów spełnia warunki mocnej propozycji', istotna:false}); });
  const moz = L.filter(u => u.wniosek === 'mozliwe' && !u.konkurencja).length; L.forEach(u => { if (u.wniosek === 'mozliwe' && !u.konkurencja && moz > 1) u.konkurencja = moz; });
  // jedyny kandydat w całej bazie o tym imieniu i nazwisku + zgodny rok urodzenia → „możliwe” (z adnotacją), nigdy wyżej
  const zywi = L.filter(u => u.wniosek !== 'konflikt'); if (zywi.length === 1 && zywi[0].wniosek === 'malo' && zywi[0].zgodnosci.some(x => x.k === 'urodzenie')) { zywi[0].wniosek = 'mozliwe'; zywi[0].jedyny = true; zywi[0].zgodnosci.push({k:'jedyny', t:'jedyny kandydat w bazie o tym imieniu i nazwisku', mocna:false}); }
  return L; }
// tekst wniosku do pokazania i do zapisania w Decyzji
function idZdanie(u){ const n = u.konkurencja ? ' Kandydatów na tym poziomie: ' + u.konkurencja + '.' : '';
  return ({sprawdz:'Mocna propozycja: zgodny rdzeń i dane rodzinne. Sprawdź na skanie i zdecyduj.', mozliwe:'Możliwe: zgodny rdzeń i część danych; brakuje potwierdzenia rodzinnego lub jest rozbieżność.', malo:'Za mało danych: zgadza się tylko imię i nazwisko. Nie scalaj bez dodatkowego źródła.', konflikt:'Konflikt: ' + u.sprzecznosci.map(x => x.t).join('; ') + '. To raczej różne osoby albo błąd w jednym z aktów.'})[u.wniosek] + n; }
