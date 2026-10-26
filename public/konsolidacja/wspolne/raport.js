/* wspolne/raport.js – raport spójności aktów zgonu (czyste funkcje, bez DOM).
   Wiersz: {id, year, num, last, first, sex('M'|'K'|''), death('RRRR-MM-DD'), act('RRRR-MM-DD'), ageText, status, spouse, job, father, mother, maiden, resid}
   Zwraca listę {id, sev:'err'|'warn'|'info', code, msg, rel:[id,...]}. Brak pola = test pomijany. */
const RAP_NUM = {jeden:1,jedna:1,dwa:2,dwie:2,trzy:3,cztery:4,piec:5,szesc:6,siedem:7,osiem:8,dziewiec:9,dziesiec:10,jedenascie:11,dwanascie:12,trzynascie:13,czternascie:14,pietnascie:15,szesnascie:16,siedemnascie:17,osiemnascie:18,dziewietnascie:19,dwadziescia:20,trzydziesci:30,czterdziesci:40,piecdziesiat:50,szescdziesiat:60,siedemdziesiat:70,osiemdziesiat:80,dziewiecdziesiat:90,sto:100};
// wiek w latach z zapisu ("78", "osiemdziesiąt", "dwa lata", "1 miesiąc"); null gdy nie da się ustalić
function wiekLat(t){ t = fold(t || ''); if (!t.trim()) return null; let n = null; const d = t.match(/\d+/); if (d) n = +d[0]; else { let s = 0, ok = false; t.split(/[^a-z]+/).forEach(w => { if (RAP_NUM[w]) { s += RAP_NUM[w]; ok = true; } }); if (ok) n = s; }
  if (n === null) return null; if (/miesi/.test(t)) return n / 12; if (/tydz/.test(t)) return n / 52; if (/(^|[^a-z])(dni|dzien|doba|godz)/.test(t)) return n / 365; return n; }
function dzien(s){ const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? Date.UTC(+m[1], +m[2]-1, +m[3]) / 864e5 : null; }
const RAP_M_A = /^(kuba|barnaba|bonawentura|jarema|kosma|mykoła|miko[lł]a|saba|zawisza)$/i;
function raportSpojnosci(rows){ const out = []; const add = (r, sev, code, msg, rel) => out.push({id:r.id, sev, code, msg, rel:rel || []});
  rows.forEach(r => { const last = (r.last || '').trim(), first = (r.first || '').trim(), age = wiekLat(r.ageText), st = fold(r.status || ''), dd = dzien(r.death), ad = dzien(r.act);
    if (r.death && dd === null) add(r, 'warn', 'data-zla', 'Data zgonu „' + r.death + '” nie jest w formacie RRRR-MM-DD.');
    if (dd !== null && ad !== null) { if (dd > ad) add(r, 'err', 'zgon-po-akcie', 'Data zgonu (' + r.death + ') jest późniejsza niż data aktu (' + r.act + ').'); else if (ad - dd > 10) add(r, 'warn', 'zgon-dawno', 'Akt spisany ' + (ad - dd) + ' dni po zgonie (' + r.death + ' → ' + r.act + ') – sprawdź daty.'); }
    if (dd !== null && r.year) { const y = new Date(dd * 864e5).getUTCFullYear(); if (y < +r.year - 1 || y > +r.year) add(r, 'warn', 'rok-zgonu', 'Rok zgonu (' + y + ') nie pasuje do roku księgi (' + r.year + ').'); }
    if (age !== null && age > 110) add(r, 'warn', 'wiek-duzy', 'Wiek „' + r.ageText + '” wygląda na zbyt duży.');
    if (age !== null && age < 15 && /zonat|zamezn|wdow/.test(st)) add(r, 'err', 'wiek-stan', 'Wiek „' + r.ageText + '” i stan „' + r.status + '” się wykluczają.');
    if (age !== null && age < 18 && /wdow/.test(st)) add(r, 'warn', 'wiek-wdowiec', 'Wdowa/wdowiec w wieku „' + r.ageText + '”.');
    if (age !== null && age < 15) { if (fold(r.job || '').trim()) add(r, 'warn', 'dziecko-zawod', 'Dziecko (wiek „' + r.ageText + '”) ma wpisany zawód: ' + r.job + '.'); if (r.spouse) add(r, 'warn', 'dziecko-malzonek', 'Dziecko ma wpisanego małżonka.'); if (!r.father && !r.mother) add(r, 'info', 'dziecko-rodzice', 'Dziecko bez wpisanych rodziców.'); }
    if (/panna|kawaler/.test(st) && r.spouse) add(r, 'warn', 'stan-malzonek', 'Stan „' + r.status + '” ale wpisany małżonek: ' + r.spouse + '.');
    if (r.sex === 'M' && r.maiden) add(r, 'warn', 'mezczyzna-rodowe', 'Mężczyzna z nazwiskiem rodowym („' + r.maiden + '”) – nazwisko powinno być rodowe, chyba że wyjątek.');
    if (first && r.sex) { const f = fold(first.split(/\s+/)[0]); if (r.sex === 'M' && /a$/.test(f) && !RAP_M_A.test(first.split(/\s+/)[0])) add(r, 'warn', 'plec-imie', 'Płeć M, ale imię „' + first + '” brzmi żeńsko.'); if (r.sex === 'K' && !/a$/.test(f)) add(r, 'warn', 'plec-imie', 'Płeć K, ale imię „' + first + '” brzmi męsko.'); }
    if (last && r.sex) { const l = fold(last); if (r.sex === 'K' && /(sk|ck|dzk)i$/.test(l)) add(r, 'warn', 'plec-nazwisko', 'Płeć K, ale nazwisko „' + last + '” ma formę męską.'); if (r.sex === 'M' && /(sk|ck|dzk)a$/.test(l)) add(r, 'warn', 'plec-nazwisko', 'Płeć M, ale nazwisko „' + last + '” ma formę żeńską.'); }
    ['last','first','sex','death'].forEach(k => { if (!r[k]) add(r, 'warn', 'brak-' + k, 'Brak: ' + ({last:'nazwisko', first:'imię', sex:'płeć', death:'data zgonu'})[k] + '.'); });
  });
  // chronologia dat aktów w obrębie roku (numer rośnie → data nie maleje)
  const by = {}; rows.forEach(r => { if (r.year && r.num && dzien(r.act) !== null) (by[r.year] = by[r.year] || []).push(r); });
  Object.values(by).forEach(L => { L.sort((a, b) => a.num - b.num); let mx = null; L.forEach(r => { const d = dzien(r.act); if (mx && d < mx.d) add(r, 'warn', 'chronologia', 'Data aktu ' + r.act + ' jest wcześniejsza niż w akcie ' + mx.r.num + ' (' + mx.r.act + ') – sprawdź daty lub numer.', [mx.r.id]); if (!mx || d >= mx.d) mx = {d, r}; }); });
  // duplikaty: ta sama osoba i ta sama data zgonu w dwóch aktach
  const key = {}; rows.forEach(r => { if (r.last && r.first && r.death) (key[fold(r.last) + '|' + fold(r.first) + '|' + r.death] = key[fold(r.last) + '|' + fold(r.first) + '|' + r.death] || []).push(r); });
  Object.values(key).forEach(L => { if (L.length > 1) L.forEach(r => add(r, 'err', 'duplikat', 'Ta sama osoba i data zgonu w aktach: ' + L.filter(x => x !== r).map(x => x.num + '/' + x.year).join(', ') + '.', L.filter(x => x !== r).map(x => x.id))); });
  return out; }
function raportCsv(items, label){ return ['id;waga;kod;opis;powiazane'].concat(items.map(i => [i.id, i.sev, i.code, i.msg, (i.rel || []).join(' ')].map(csvCell).join(';'))).join('\r\n') + '\r\n'; }
