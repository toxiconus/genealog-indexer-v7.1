/* app/moduly/skan_profil.js – profil folderu skanów i plan „skan → akty” (bez DOM).
   Profil pamięta dla folderu (lub wspólnego początku nazw plików): typ aktu, rok, ile aktów zwykle jest na skanie, numer pierwszego skanu z aktami
   (poprzedzające skany to okładka, karta filmu itp.) oraz ostatni obsłużony skan i numer aktu – z tego liczy się domyślny numer pierwszego aktu na następnym skanie.
   Plan to lista numerów aktów z jednego skanu: brak w bazie → dopisze nowy akt, jest bez skanu → dobierze skan, ma inny skan → zostawi (chyba że zaznaczono zastąpienie).
   Program niczego nie wypełnia w polach aktu; skan zapisuje się jak ręczne przypisanie (S.acts[id].scan). */
const SKP_MAX = 12;
// klucz folderu: nazwa folderu (gdy przeglądarka ją zna) albo nazwa pliku bez numeru na końcu („urodzenia_1890-1897_0150.jpg” → „urodzenia_1890-1897”)
function skpKlucz(f){ const rel = (f && f.webkitRelativePath) || ''; if (rel.includes('/')) { const s = rel.split('/'); return s[s.length - 2]; }
  const n = String((f && f.name) || '').replace(/\.[^.]+$/, '').replace(/[\s_\-]*\d+$/, ''); return n; }   // pusty dla nazw z samych cyfr („001.jpg”) – wtedy okno używa wspólnego zbioru i nazwy wpisanej przez użytkownika
// numer skanu = ostatni ciąg cyfr w nazwie pliku („…_0150.jpg” → 150); null, gdy nazwa nie ma cyfr
function skpNumerPliku(nazwa){ const m = String(nazwa).replace(/\.[^.]+$/, '').match(/(\d+)\D*$/); return m ? parseInt(m[1], 10) : null; }
function skpTyp(klucz){ const k = String(klucz).toLowerCase(); if (/zgon|zmar|mort|obit/.test(k)) return 'zgon'; if (/ma[łl]|[śs]lub|za[śs]lub|nupt/.test(k)) return 'malzenstwo'; if (/urodz|chrz|chrzt|ochrz|bapt/.test(k)) return 'chrzest'; return ''; }
function skpRok(klucz){ const m = String(klucz).match(/(?:^|\D)(1[5-9]\d\d)(?!\d)/); return m ? +m[1] : ''; }
const skpAkt = (typ, rok, nr) => D.wszystkie.find(x => x.typ === typ && !x.parafia && +x.year === rok && String(x.act).toLowerCase() === String(nr));
// akty, które już mają ten skan przypisany ręcznie (wtedy okno podpowiada ich zakres)
function skpZeSkanu(nazwa){ const b = skanStem(nazwa), L = D.wszystkie.filter(a => !a.parafia && S.acts[a.id]?.scan && skanStem(S.acts[a.id].scan) === b); if (!L.length) return null;
  const typ = L[0].typ, rok = +L[0].year, N = L.filter(a => a.typ === typ && +a.year === rok).map(a => parseInt(a.act, 10)).filter(Number.isFinite); if (!N.length) return null;
  return {typ, rok, od: Math.min(...N), ile: Math.min(SKP_MAX, Math.max(...N) - Math.min(...N) + 1)}; }
// domyślny numer pierwszego aktu na skanie nr `nrPliku`
function skpOd(prof, typ, rok, nrPliku){ prof = prof || {};
  if (prof.ostNr != null && prof.ostRok === rok && prof.ostTyp === typ && prof.ostPlik != null && nrPliku != null && nrPliku > prof.ostPlik) return prof.ostNr + 1;
  if (prof.nrPierwszego != null && prof.ostPlik == null) return prof.nrPierwszego;
  const L = D.wszystkie.filter(x => x.typ === typ && !x.parafia && +x.year === rok).map(x => parseInt(x.act, 10)).filter(Number.isFinite); return L.length ? Math.max(...L) + 1 : 1; }
/* w planie: brak = skan z bazy, którego nie ma w wczytanych plikach */
function skpPlan(typ, rok, od, ile, nazwa){ const L = [], b = skanStem(nazwa);
  for (let i = 0; i < ile; i++) { const nr = od + i, a = skpAkt(typ, rok, nr), s = a ? skanKlucz(a) : '';
    if (!a) { const w = nowySprawdz(typ, String(rok), String(nr)); L.push({nr, typ, rok, id: '', skan: '', stan: w.ok ? 'nowy' : 'blad', blad: w.ok ? '' : w.blad}); }
    else L.push({nr, typ, rok, id: a.id, skan: s, stan: !s ? 'dobierz' : skanStem(s) === b ? 'ten-sam' : 'inny', blad: '', brak: !!s && skanStem(s) !== b && !SK.pliki.some(f => skanStem(f.name) === skanStem(s))}); }
  return L; }
// stosuje plan: nowe akty dopisuje (puste, ze skanem), istniejące bez skanu dobiera, z innym skanem – tylko gdy numer jest w zbiorze `zast`
function skpZastosuj(plan, nazwa, zast, hash){ const R = {dodane: [], dobrane: [], zastapione: [], zostawione: [], blad: ''};
  plan.forEach(w => { if (R.blad) return;
    if (w.stan === 'nowy') { const r = nowyDodaj(w.typ, String(w.rok), String(w.nr)); if (!r.ok) { R.blad = r.blad; return; } st(r.id).scan = nazwa; if (hash) st(r.id).scanH = hash; R.dodane.push(r.id); }
    else if (w.stan === 'dobierz') { st(w.id).scan = nazwa; if (hash) st(w.id).scanH = hash; R.dobrane.push(w.id); }
    else if (w.stan === 'inny' && zast && zast.has(w.nr)) { st(w.id).scan = nazwa; if (hash) st(w.id).scanH = hash; R.zastapione.push(w.id); }
    else if (w.stan === 'blad') R.blad = w.blad; else R.zostawione.push(w.id); });
  return R; }
// suma kontrolna zawartości pliku (SHA-256, pierwsze 16 znaków): nie zależy od nazwy ani folderu, więc skan rozpozna się po zmianie nazwy; zmieni ją dopiero ponowny zapis obrazu
async function skpHash(f){ try { const b = await f.arrayBuffer(), d = await crypto.subtle.digest('SHA-256', b); return [...new Uint8Array(d)].slice(0, 8).map(x => x.toString(16).padStart(2, '0')).join(''); } catch (e) { return ''; } }
// indeks suma → plik dla wybranego folderu; liczony w tle tylko wtedy, gdy jakiś akt ma zapisaną sumę (SK.hashMap)
async function skpHashIndeks(){ const ma = Object.values(S.acts || {}).some(x => x && x.scanH); if (!ma || !SK.pliki.length) return 0; const M = {}; for (const f of SK.pliki) { const k = f.size + '|' + f.lastModified; const h0 = (SK.hashCache = SK.hashCache || {})[k] || (SK.hashCache[k] = await skpHash(f)); if (h0) M[h0] = f; } SK.hashMap = M; return Object.keys(M).length; }
function skpZnajdzPoSumie(a){ const h0 = S.acts[a.id]?.scanH; return h0 && SK.hashMap ? SK.hashMap[h0] || null : null; }
