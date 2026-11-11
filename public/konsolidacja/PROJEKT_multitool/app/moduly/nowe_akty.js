/* app/moduly/nowe_akty.js – akty dodane przez użytkownika (czyste funkcje + włączenie do D/AM, bez DOM).
   Nowy akt to pusty rekord {id, typ, rok, nr}; wszystkie wartości pól wpisuje użytkownik w karcie aktu (zapisują się jak zwykłe poprawki: magazyn `pola`, historia, cofanie).
   Lista nowych aktów jest w S.nowe → IndexedDB (magazyn `slowniki`, klucz `noweAkty`) → kopia pełna. Program niczego w nowym akcie nie wypełnia sam. */
const NOWE_PFX = {zgon: 'ZG.U', malzenstwo: 'MA.U', chrzest: 'CH.U'}, NOWE_ROK = [1500, 1950];
const noweIdOk = id => /^(ZG|MA|CH)\.U\d{5}$/.test(String(id));
function noweCzysc(x){ if (!x || typeof x !== 'object' || !noweIdOk(x.id) || !NOWE_PFX[x.typ] || !x.id.startsWith(NOWE_PFX[x.typ])) return null; const rok = +x.rok, nr = String(x.nr == null ? '' : x.nr).trim();
  if (!Number.isInteger(rok) || rok < NOWE_ROK[0] || rok > NOWE_ROK[1] || !/^\d{1,4}[a-z]?$/i.test(nr)) return null; return {id: x.id, typ: x.typ, rok, nr, utw: typeof x.utw === 'string' ? x.utw.slice(0, 30) : ''}; }
function nowyAktObiekt(x){ return {id: x.id, stary: 'nowy-' + x.id, typ: x.typ, year: x.rok, act: x.nr, ai: {}, unc: [], file: '', roi: null, lub: null, lubRaw: '', lubName: '', nowy: true, model: {pola: {}, zrodla: ['zr:uzytkownik'], stan: 'nowy', skan: null, id_dawne: []}}; }
// włącza akty z listy do danych w pamięci (D.wszystkie, AM, liczniki); pomija już obecne i błędne. Zwraca liczbę dodanych.
function noweWlacz(L){ let n = 0; (L || []).forEach(x0 => { const x = noweCzysc(x0); if (!x || AM[x.id] || !D.typy.includes(x.typ)) return; const a = nowyAktObiekt(x); D.wszystkie.push(a); AM[a.id] = a; D.liczby[a.typ] = (D.liczby[a.typ] || 0) + 1; n++; }); if (n) daneUstawTyp(D, D.typ); return n; }
// walidacja formularza: zwraca {ok, blad, istnieje?:id}
function nowySprawdz(typ, rok, nr){ if (!NOWE_PFX[typ] || !D.typy.includes(typ)) return {ok: false, blad: 'Wybierz typ aktu.'}; const r = Number(String(rok).trim()), n = String(nr == null ? '' : nr).trim();
  if (!/^\d{4}$/.test(String(rok).trim()) || r < NOWE_ROK[0] || r > NOWE_ROK[1]) return {ok: false, blad: 'Rok aktu: cztery cyfry z zakresu ' + NOWE_ROK[0] + '–' + NOWE_ROK[1] + '.'};
  if (!/^\d{1,4}[a-z]?$/i.test(n)) return {ok: false, blad: 'Numer aktu: liczba 1–9999 (dopuszczalna litera na końcu, np. 12a).'};
  const jest = D.wszystkie.find(a => a.typ === typ && +a.year === r && String(a.act).toLowerCase() === n.toLowerCase()); if (jest) return {ok: false, blad: 'Taki akt już jest w bazie: ' + (NAZWY_TYPOW[typ] || typ) + ' ' + r + ' nr ' + n + '.', istnieje: jest.id};
  return {ok: true, rok: r, nr: n}; }
function nowyDodaj(typ, rok, nr){ const w = nowySprawdz(typ, rok, nr); if (!w.ok) return w; S.nowe = S.nowe || []; let k = 0; D.wszystkie.forEach(a => { if (a.id.startsWith(NOWE_PFX[typ])) k = Math.max(k, +a.id.slice(NOWE_PFX[typ].length) || 0); });
  const x = {id: NOWE_PFX[typ] + String(k + 1).padStart(5, '0'), typ, rok: w.rok, nr: w.nr, utw: new Date().toISOString().slice(0, 19)}; S.nowe.push(x); noweWlacz([x]); return {ok: true, id: x.id}; }
// usunięcie aktu dodanego ręcznie (tylko takiego): znika z danych i ze stanu; wpisy historii zostają
function nowyUsun(id){ const a = AM[id]; if (!a || !a.nowy) return false; S.nowe = (S.nowe || []).filter(x => x.id !== id); delete S.acts[id]; delete AM[id]; const i = D.wszystkie.indexOf(a); if (i >= 0) D.wszystkie.splice(i, 1); D.liczby[a.typ] = Math.max(0, (D.liczby[a.typ] || 1) - 1); daneUstawTyp(D, D.typ); return true; }
