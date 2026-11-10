/* moduly/norm.js – normalizacja do porównań (czyste funkcje, bez DOM). Wymaga: wspolne/tekst.js (fold, lev), wspolne/raport.js (wiekLat).
   Zasada: normalizacja NIE zmienia danych aktu. Tworzy klucze obok wartości; zapis z aktu zostaje w polu. */

/* ---------- nazwiska ---------- */
// znaczniki [_] [-] [niecz.] i puste → brak danych
const normBrak = v => { const t = String(v ?? '').trim(); return !t || /^\[[^\]]*\]$/.test(t) || /^[?.\-–]+$/.test(t) || /^b\.?\s?d\.?$/i.test(t); };
const normCzysc = v => normBrak(v) ? '' : String(v).replace(/\?/g, '').replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
// końcówki żeńskie: forma (panna / żona) + rdzeń; -ina/-yna tylko gdy rdzeń jest w słowniku znanych nazwisk (Kalina to nie żona Kala)
const NORM_FSUF = [['iowna','panna'],['owna','panna'],['ianka','panna'],['anka','panna'],['onka','panna'],['iowa','zona'],['owa','zona']];
function normNazwiskoBaza(s){ let f = fold(normCzysc(s)).replace(/[^a-z]/g, ''); let forma = '';
  for (const [suf, typ] of NORM_FSUF) if (f.length - suf.length >= 3 && f.endsWith(suf)) { f = f.slice(0, -suf.length); forma = typ; break; }
  f = f.replace(/ska$/, 'ski').replace(/cka$/, 'cki').replace(/dzka$/, 'dzki');
  return {baza: f, forma}; }
// k1 – klucz ścisły (ogonki, forma żeńska); k2 – klucz pisowni dawnej (y/i, rz/ż, ch/h, ó/u, -owski/-oski, ę/en, ą/on, podwojenia, końcowa samogłoska rdzenia)
function kluczNazwiska(s){ const b = normNazwiskoBaza(s).baza; if (b.length < 2) return null;
  let k2 = b.replace(/y/g, 'i').replace(/rz/g, 'z').replace(/ch/g, 'h').replace(/u/g, 'o').replace(/([oe])wsk/g, '$1sk').replace(/ks/g, 'x')
    .replace(/e[nm](?=[bdtcszkgp])/g, 'e').replace(/o[nm](?=[bdtcszkgp])/g, 'a').replace(/(.)\1/g, '$1').replace(/sc/g, 'c').replace(/[aoe]$/, '');
  return {k1: b, k2}; }
// porównanie nazwisk: 'rowne' | 'wariant' (ta sama wymowa/dawna pisownia) | 'slownik' (klasa potwierdzona decyzją) | 'podobne' (1 litera różnicy – tylko ostrzeżenie) | 'rozne' | null (brak danych)
function porNazwiska(a, b, klasy){ const A = kluczNazwiska(a), B = kluczNazwiska(b); if (!A || !B) return null;
  if (A.k1 === B.k1) return 'rowne'; if (A.k2 === B.k2) return 'wariant';
  if (klasy) { const ka = klasy[A.k2] || klasy[A.k1], kb = klasy[B.k2] || klasy[B.k1]; if (ka && ka === kb) return 'slownik'; }
  if (Math.min(A.k2.length, B.k2.length) >= 5 && lev(A.k2, B.k2, 1) <= 1) return 'podobne';
  return 'rozne'; }

/* ---------- imiona ---------- */
// forma z aktu (łacina, dawna pisownia, odmiana) → dzisiejsze polskie. Pełny słownik: NPL/GEN/PGEN z buduj_baza_v4.py + data/imiona_wszystkie.json (migracja w kroku 1 planu).
const NORM_IMIONA = {jacobus:'jakub',joannes:'jan',johannes:'jan',ioannes:'jan',adalbertus:'wojciech',adalbert:'wojciech',albertus:'wojciech',woyciech:'wojciech',stanislaus:'stanislaw',josephus:'jozef',andreas:'andrzej',
  mathias:'maciej',matthias:'maciej',matheus:'mateusz',matthaeus:'mateusz',mathaeus:'mateusz',thomas:'tomasz',martinus:'marcin',antonius:'antoni',paulus:'pawel',valentinus:'walenty',laurentius:'wawrzyniec',
  franciscus:'franciszek',blasius:'blazej',lucas:'lukasz',bartholomaeus:'bartlomiej',ignatius:'ignacy',gregorius:'grzegorz',nicolaus:'mikolaj',casimirus:'kazimierz',michael:'michal',petrus:'piotr',simon:'szymon',
  stephanus:'stefan',vincentius:'wincenty',hyacinthus:'jacek',hiacynt:'jacek',hiacenty:'jacek',gasparus:'kacper',casparus:'kacper',kasper:'kacper',felix:'feliks',agnes:'agnieszka',sophia:'zofia',hedwigis:'jadwiga',
  catharina:'katarzyna',margaretha:'malgorzata',elisabeth:'elzbieta',eva:'ewa',theresia:'teresa',thecla:'tekla',dorothea:'dorota',francisca:'franciszka',susanna:'zuzanna',ursula:'urszula',lucia:'lucja',
  maryanna:'marianna',marjanna:'marianna',maryja:'maria',jozefa:'jozefa',jedrzej:'andrzej',bartosz:'bartlomiej',jozefat:'jozafat',gabryel:'gabriel',regina:'regina',helena:'helena'};
// pary imion często mylonych w księgach – zgodność słaba, do sprawdzenia na skanie (nigdy „równe”)
const NORM_IMIONA_BLISKIE = [['maciej','mateusz'],['maria','marianna'],['stefan','szczepan'],['lucja','lukasz'],['jozef','jozafat'],['stefan','stanislaw']];
function kluczImienia(s){ return fold(normCzysc(s)).split(/[\s,./-]+/).map(t => t.replace(/[^a-z]/g, '')).filter(t => t.length > 1).map(t => NORM_IMIONA[t] || t.replace(/y(?=[aeo])/g, 'i')); }
// 'rowne' (dowolny człon zgodny) | 'bliskie' (para mylona lub 1 litera) | 'rozne' | null
function porImiona(a, b){ const A = kluczImienia(a), B = kluczImienia(b); if (!A.length || !B.length) return null;
  if (A.some(x => B.includes(x))) return 'rowne';
  if (A.some(x => B.some(y => NORM_IMIONA_BLISKIE.some(p => (p[0] === x && p[1] === y) || (p[0] === y && p[1] === x)) || (Math.min(x.length, y.length) >= 5 && lev(x, y, 1) <= 1)))) return 'bliskie';
  return 'rozne'; }

/* ---------- wiek → przedział roku urodzenia ---------- */
// wiek w aktach jest przybliżony; tolerancja rośnie z wiekiem i dla wieków „okrągłych”. Zwraca [min, max] roku urodzenia albo null.
function przedzialUr(rokAktu, wiekTekst){ if (!rokAktu || normBrak(wiekTekst)) return null; const w = wiekLat(String(wiekTekst).replace(/\?/g, '')); if (w === null || w < 0 || w > 115) return null;
  let tol = w < 1 ? 0 : w < 10 ? 1 : w < 25 ? 2 : w < 45 ? 4 : w < 65 ? 6 : 9; if (w >= 30 && Math.round(w) % 10 === 0) tol += 2; else if (w >= 30 && Math.round(w) % 5 === 0) tol += 1;
  const r = rokAktu - w; return [Math.floor(r - tol) - (w >= 1 ? 1 : 0), Math.ceil(r + tol)]; }
const przedzialyWspolne = (a, b) => a && b ? Math.max(a[0], b[0]) <= Math.min(a[1], b[1]) : null;
const przedzialyOdstep = (a, b) => Math.max(a[0], b[0]) - Math.min(a[1], b[1]);

/* ---------- miejscowości ---------- */
// nazwa z aktu → identyfikator miejsca. Nazwa z dokumentu zostaje w polu; tu tylko klucz. Słownik rozszerzany decyzjami użytkownika (typ decyzji „miejsce”).
const NORM_MIEJSCA = {blinow:'blinow', blinowie:'blinow', brzozowka:'brzozowka', brzozzowka:'brzozowka', brzozowce:'brzozowka', moczydla:'moczydla', mocydla:'moczydla', moczyda:'moczydla', moczydlo:'moczydla', moczydlach:'moczydla',
  majdan:'majdan-moczydla?', 'moczydla majdan':'majdan-moczydla', 'majdan moczydla':'majdan-moczydla', 'majdan blinowski':'majdan-blinowski', kaczyniec:'kaczyniec', kacyniec:'kaczyniec', sulow:'sulow', cieslanki:'cieslanki'};
function kluczMiejsca(s){ const f = fold(normCzysc(s)).replace(/[^a-z ]/g, '').trim(); if (!f) return null; return NORM_MIEJSCA[f] || f; }
// 'rowne' | 'mozliwe' (Majdan bez dookreślenia vs Majdan Moczydła/Blinowski) | 'rozne' | null
function porMiejsca(a, b){ const A = kluczMiejsca(a), B = kluczMiejsca(b); if (!A || !B) return null; if (A === B) return 'rowne';
  const m = x => x.replace('?', ''); if ((/\?$/.test(A) || /\?$/.test(B)) && (m(A).startsWith('majdan') && m(B).startsWith('majdan') || m(A) === 'majdan-moczydla' && B === 'moczydla' || m(B) === 'majdan-moczydla' && A === 'moczydla')) return 'mozliwe';
  if (A.startsWith('majdan-moczydla') && B === 'moczydla' || B.startsWith('majdan-moczydla') && A === 'moczydla') return 'mozliwe';
  return 'rozne'; }
