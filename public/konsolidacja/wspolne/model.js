/* wspolne/model.js – wspólny model genealogiczny (wersja 1): osoba, zdarzenie, źródło, relacja.
   Zasada: skan, transkrypcja, dane osoby i relacje to osobne obiekty; każdy atrybut ma status (zatwierdzone / propozycja),
   każda relacja ma status dowodowy i wskazuje źródło. Osoby z różnych aktów NIE są scalane automatycznie (tożsamość = hipoteza). */
const MODEL_STATUS = {dokument:'potwierdzone dokumentem', hipoteza:'hipoteza', poszlaka:'poszlaka', wskazowka:'wskazówka', konflikt:'konflikt dowodów', odrzucone:'odrzucone'};
const mAttr = (v, ok) => (v ? {v:String(v), status: ok ? 'zatwierdzone' : 'propozycja'} : null);
// akt zgonu → osoby, zdarzenia, źródła, relacje. get(pole)→wartość, ok(pole)→bool, meta {id, year, num, scan, hasText}
function modelZZgonu(get, ok, meta){ const A = f => mAttr(get(f), ok(f)), id = meta.id, osoby = [], relacje = [], zdarzenia = [], zrodla = [];
  zrodla.push({id:'zr:' + id, typ:'akt zgonu', rok:meta.year, numer:meta.num, skan:meta.scan || '', transkrypcja:!!meta.hasText});
  const os = (rola, o) => { const x = Object.assign({id:'os:' + id + ':' + rola, rola, zrodlo:'zr:' + id, tozsamosc:'nierozstrzygnięta'}, o); osoby.push(x); return x; };
  const zm = os('zmarly', {nazwisko:A('deceased_last_name'), imie:A('deceased_first_name'), nazwisko_rodowe:A('deceased_maiden_name'), plec:A('deceased_sex'), wiek:A('age'), stan:A('deceased_status'), zawod:A('profession'), zamieszkanie:A('deceased_residence'), miejsce_urodzenia:A('deceased_birth_place')});
  zdarzenia.push({id:'zd:' + id, typ:'zgon', osoba:zm.id, data:A('death_date'), godzina:A('death_time'), miejsce:A('death_place'), data_aktu:A('act_date'), zrodlo:'zr:' + id});
  const par = (rola, fn, ln) => { if (!get(fn) && !get(ln)) return null; const o = os(rola, {imie:A(fn), nazwisko:A(ln)}); relacje.push({typ:'rodzic-dziecko', a:o.id, b:zm.id, status: ok(fn) && ok(ln) ? 'dokument' : 'hipoteza', zrodlo:'zr:' + id}); return o; };
  par('ojciec', 'father_first_name', 'father_last_name'); par('matka', 'mother_first_name', 'mother_last_name');
  if (get('deceased_spouse')) { const o = os('malzonek', {imie_nazwisko:A('deceased_spouse')}); relacje.push({typ:'malzenstwo', a:zm.id, b:o.id, status: ok('deceased_spouse') ? 'dokument' : 'hipoteza', zrodlo:'zr:' + id}); }
  ['informant1', 'informant2'].forEach((f, i) => { if (get(f)) { const o = os('swiadek' + (i + 1), {imie_nazwisko:A(f)}); relacje.push({typ:'swiadek', a:o.id, b:zm.id, status: ok(f) ? 'wskazowka' : 'hipoteza', zrodlo:'zr:' + id}); } });
  return {osoby, zdarzenia, zrodla, relacje}; }
