/* app/moduly/typy_aktow.js – konfiguracja typów aktów: `zgon` (krok 3), `malzenstwo` i `chrzest` (krok 5). Jedno miejsce zamiast ORDF/LATF/CAUSEF zaszytych łatkami `sub()` w buduj_baza_v4.py.
   TYPY[typ] = {nazwa, zestawy:{nazwa:[pola]|funkcja}, zestawDla(akt), etykiety:{zestaw:{pole:etykieta}}}.
   Typy 2+ dodatkowo: pola:[{id,label}] (definicje pól – zgony biorą je z danych), bloki:[{t,pola}] (kolejność i nagłówki w formularzu), role:{rola:{atrybut:pole}} (jak `mapa` wystąpienia w MODEL_DANYCH §6),
   daty:[pola dat], eksport:{plik, kolumny, kolRok, kolNr, idKol, poWierszu(r,a)} (CSV), stosuje(a,f), niepewne(a,f), ostrzezenia(a), nazwa(a). Silnik aktu (akt_zgon.js) jest wspólny – tu nie ma jego kopii.
   Kolejność ORDF pochodzi z D.ord (konfiguracja danych). */
const TYPY = {
  zgon: {
    nazwa: 'Zgony',
    /* grupy formularza (wprowadzanie): każde pole z zestawu jest w dokładnie jednej grupie */
    bloki: [{t: 'Zmarły', pola: ['deceased_last_name','deceased_first_name','deceased_maiden_name','deceased_sex','age','deceased_status','deceased_spouse','profession']},
      {t: 'Data i miejsce', pola: ['death_date','death_time','death_place','house','deceased_birth_place','deceased_residence']},
      {t: 'Rodzice', pola: ['father_first_name','father_last_name','mother_first_name','mother_last_name','parents_raw']},
      {t: 'Przyczyna i akt', pola: ['cause_of_death','act_date','informant1','informant2','officiant','notes']}],
    zestawy: {
      LATF: ['death_place','house','deceased_last_name','deceased_first_name','death_date','deceased_sex','age','deceased_status','profession','parents_raw','father_first_name','father_last_name','mother_first_name','mother_last_name','cause_of_death','notes'],   // < 1826 (księgi łacińskie)
      CAUSEF: () => [...ORDF.slice(0,-1), FIELDS.find(f => f.id === 'cause_of_death'), ORDF[ORDF.length-1]].filter(Boolean),   // 1870–79: ORDF + przyczyna zgonu przed uwagami
      ORDF: () => ORDF,                                                                                                          // reszta
    },
    etykiety: {LATF: {death_date: 'Data zgonu / zgłoszenia'}},   // w aktach łacińskich to zwykle data zgłoszenia (A-21)
    zestawDla: a => a.year < 1826 ? 'LATF' : (a.year >= 1870 && a.year <= 1879 ? 'CAUSEF' : 'ORDF'),
  },
  // ---------- krok 5: małżeństwa (zestaw pól, kolejność i eksport CSV jak w haiku/weryfikacja_malzenstw_szablon.html) ----------
  malzenstwo: {
    nazwa: 'Małżeństwa',
    pola: (() => { const L = [], P = [['groom', 'Pan młody'], ['bride', 'Panna młoda']], W = k => [['witness' + k + '_first_name', 'Świadek ' + k + ' – imię'], ['witness' + k + '_last_name', 'Świadek ' + k + ' – nazwisko'], ['witness' + k + '_profession', 'Świadek ' + k + ' – zawód'], ['witness' + k + '_residence', 'Świadek ' + k + ' – zamieszkanie']];
      L.push(['marriage_date', 'Data aktu (RRRR-MM-DD)'], ['margin_place', 'Miejscowość (margines)'], ['margin_groom_first_name', 'Margines: pan młody – imię'], ['margin_groom_last_name', 'Margines: pan młody – nazwisko'], ['margin_bride_first_name', 'Margines: panna młoda – imię'], ['margin_bride_last_name', 'Margines: panna młoda – nazwisko'], ...W(1), ...W(2));
      P.forEach(([x, n]) => L.push([x + '_first_name', n + ' – imię'], [x + '_last_name', n + ' – nazwisko'], [x + '_status', n + ' – stan'], [x + '_prev_spouse_first_name', n + ' – po kim, imię'], [x + '_prev_spouse_last_name', n + ' – po kim, nazwisko rodowe'], [x + '_profession', n + ' – zawód'], [x + '_age', n + ' – wiek'], [x + '_birth_place', n + ' – miejsce urodzenia'], [x + '_residence', n + ' – zamieszkanie'],
        [x + '_father_first_name', n + ': ojciec – imię'], [x + '_father_last_name', n + ': ojciec – nazwisko'], [x + '_father_alive', n + ': ojciec żyje?'], [x + '_mother_first_name', n + ': matka – imię'], [x + '_mother_last_name', n + ': matka – nazwisko rodowe'], [x + '_mother_alive', n + ': matka żyje?']));
      L.push(['officiant', 'Duchowny (ksiądz)'], ['margin_notes', 'Adnotacje i uwagi (margines, stemple, zgon, kolejne małżeństwo…)']); return L.map(([id, label]) => ({id, label})); })(),
    zestawy: { MAL: () => TYPY.malzenstwo.pola },   // kolejność = kolejność FIELDS starego weryfikatora (wpływa na uncertain_fields i verification_notes w eksporcie)
    zestawDla: () => 'MAL',
    bloki: [{t: 'Akt', pola: ['marriage_date', 'margin_place']}, {t: 'Margines – imiona młodych', pola: ['margin_groom_first_name', 'margin_groom_last_name', 'margin_bride_first_name', 'margin_bride_last_name']},
      {t: 'Świadek 1', pola: ['witness1_first_name', 'witness1_last_name', 'witness1_profession', 'witness1_residence']}, {t: 'Świadek 2', pola: ['witness2_first_name', 'witness2_last_name', 'witness2_profession', 'witness2_residence']},
      ...[['groom', 'Pan młody'], ['bride', 'Panna młoda']].map(([x, n]) => ({t: n, pola: ['first_name', 'last_name', 'status', 'prev_spouse_first_name', 'prev_spouse_last_name', 'profession', 'age', 'birth_place', 'residence', 'father_first_name', 'father_last_name', 'father_alive', 'mother_first_name', 'mother_last_name', 'mother_alive'].map(k => x + '_' + k)})),
      {t: 'Zakończenie aktu', pola: ['officiant', 'margin_notes']}],
    role: {   // rola w akcie → atrybut osoby → pole (jak `mapa` wystąpienia, MODEL_DANYCH §6)
      pan_mlody: {imie: 'groom_first_name', nazwisko: 'groom_last_name', stan: 'groom_status', zawod: 'groom_profession', wiek: 'groom_age', miejsce: 'groom_residence'},
      panna_mloda: {imie: 'bride_first_name', nazwisko: 'bride_last_name', stan: 'bride_status', zawod: 'bride_profession', wiek: 'bride_age', miejsce: 'bride_residence'},
      ojciec_pana: {imie: 'groom_father_first_name', nazwisko: 'groom_father_last_name'}, matka_pana: {imie: 'groom_mother_first_name', rodowe: 'groom_mother_last_name'},
      ojciec_panny: {imie: 'bride_father_first_name', nazwisko: 'bride_father_last_name'}, matka_panny: {imie: 'bride_mother_first_name', rodowe: 'bride_mother_last_name'},
      swiadek1: {imie: 'witness1_first_name', nazwisko: 'witness1_last_name', zawod: 'witness1_profession', miejsce: 'witness1_residence'}, swiadek2: {imie: 'witness2_first_name', nazwisko: 'witness2_last_name', zawod: 'witness2_profession', miejsce: 'witness2_residence'},
      poprzedni_malzonek_pana: {imie: 'groom_prev_spouse_first_name', nazwisko: 'groom_prev_spouse_last_name'}, poprzedni_malzonek_panny: {imie: 'bride_prev_spouse_first_name', nazwisko: 'bride_prev_spouse_last_name'}, ksiadz: {imie_nazwisko: 'officiant'}},
    daty: ['marriage_date'],
    dlugie: ['margin_notes'],
    miejsca: ['margin_place', 'groom_birth_place', 'groom_residence', 'bride_birth_place', 'bride_residence', 'witness1_residence', 'witness2_residence'],   // PLF starego weryfikatora: normPl przy eksporcie
    eksport: {plik: 'MALZENSTWA_zweryfikowane_auto.csv', kolRok: 'marriage_year', kolNr: 'marriage_act_number', idKol: 'id',
      kolumny: ['id','marriage_year','marriage_act_number','marriage_date','marriage_time','marriage_place','margin_place','groom_last_name','groom_first_name','groom_status','groom_age','groom_birth_place','groom_residence','groom_profession','groom_father_first_name','groom_father_last_name','groom_father_alive','groom_mother_first_name','groom_mother_last_name','groom_mother_alive','bride_last_name','bride_first_name','bride_status','bride_age','bride_birth_place','bride_residence','bride_profession','bride_father_first_name','bride_father_last_name','bride_father_alive','bride_mother_first_name','bride_mother_last_name','bride_mother_alive','witness1_name','witness1_residence','witness1_profession','witness2_name','witness2_residence','witness2_profession','banns','consent','officiant','margin_notes','verification_status','uncertain_fields','verification_notes','scan_path','act_text',
        'margin_groom','margin_bride','margin_groom_first_name','margin_groom_last_name','margin_bride_first_name','margin_bride_last_name','witness1_first_name','witness1_last_name','witness2_first_name','witness2_last_name','groom_prev_spouse_first_name','groom_prev_spouse_last_name','bride_prev_spouse_first_name','bride_prev_spouse_last_name'],
      poWierszu: (r) => { const t = v => String(v == null ? '' : v).trim(); ['groom', 'bride'].forEach(x => { r['margin_' + x] = (t(r['margin_' + x + '_first_name']) + ' ' + t(r['margin_' + x + '_last_name'])).trim(); }); [1, 2].forEach(k => { r['witness' + k + '_name'] = (t(r['witness' + k + '_first_name']) + ' ' + t(r['witness' + k + '_last_name'])).trim(); }); }},
    stosuje: (a, f) => { const m = /^(groom|bride)_prev_spouse_/.exec(f); return !m || /^(wd|w$)/i.test(String(getv(a, m[1] + '_status') || '').trim()) || !!String(getv(a, f) || '').trim(); },   // „po kim” tylko dla wdowców/wdów (albo gdy jest wartość)
    niepewne: (a, f) => { const b = a.ai || a.lub || {}; return (a.unc || []).includes(f) || /\?\s*$/.test(String(b[f] == null ? '' : b[f]).trim()); },
    nazwa: a => { const c = f => String(getv(a, f) || '').replace(/\?/g, '').trim(); return (c('groom_last_name') + ' ' + c('groom_first_name') + ' z ' + c('bride_first_name') + ' ' + c('bride_last_name')).replace(/^\s*z\s+/, '').trim(); },
    ostrzezenia: a => malOstrzezenia(a),
  },
  // ---------- krok 5: chrzty (indeks z kart blinow_akty.csv; weryfikator chrztów jeszcze nie istnieje – zestaw pól = kolumny indeksu) ----------
  chrzest: {
    nazwa: 'Chrzty',
    pola: [['child_last_name', 'Dziecko – nazwisko'], ['child_first_name', 'Dziecko – imiona'], ['child_birth_place', 'Miejscowość'], ['father_first_name', 'Ojciec – imiona'], ['father_last_name', 'Ojciec – nazwisko'], ['father_age', 'Ojciec – wiek'],
      ['mother_first_name', 'Matka – imiona'], ['mother_last_name', 'Matka – nazwisko'], ['mother_age', 'Matka – wiek'], ['index_month', 'Miesiąc (indeks)'], ['notes_org', 'Uwagi (indeks)']].map(([id, label]) => ({id, label})),
    zestawy: { CHR: () => TYPY.chrzest.pola },
    zestawDla: () => 'CHR',
    bloki: [{t: 'Dziecko', pola: ['child_last_name', 'child_first_name', 'child_birth_place']}, {t: 'Ojciec', pola: ['father_first_name', 'father_last_name', 'father_age']}, {t: 'Matka', pola: ['mother_first_name', 'mother_last_name', 'mother_age']}, {t: 'Indeks', pola: ['index_month', 'notes_org']}],
    role: {dziecko: {imie: 'child_first_name', nazwisko: 'child_last_name', miejsce: 'child_birth_place'}, ojciec: {imie: 'father_first_name', nazwisko: 'father_last_name', wiek: 'father_age'}, matka: {imie: 'mother_first_name', rodowe: 'mother_last_name', wiek: 'mother_age'}},
    daty: [],
    dlugie: ['notes_org'],
    eksport: {plik: 'CHRZTY_zweryfikowane.csv', kolRok: 'baptism_year', kolNr: 'baptism_act_number', idKol: 'id',
      kolumny: ['id', 'baptism_year', 'baptism_act_number', 'child_last_name', 'child_first_name', 'child_birth_place', 'father_first_name', 'father_last_name', 'father_age', 'mother_first_name', 'mother_last_name', 'mother_age', 'index_month', 'notes_org', 'verification_status', 'uncertain_fields', 'verification_notes']},
    stosuje: () => true,
    niepewne: (a, f) => { const b = a.ai || a.lub || {}; return (a.unc || []).includes(f) || /\?\s*$/.test(String(b[f] == null ? '' : b[f]).trim()); },
    nazwa: a => (String(getv(a, 'child_last_name') || '').trim() + ' ' + String(getv(a, 'child_first_name') || '').trim()).trim(),
    ostrzezenia: () => [],
  },
};
const ZESTAW_CACHE = {};
function zestawPola(typ, nazwa){ const k = typ + ':' + nazwa; if (ZESTAW_CACHE[k]) return ZESTAW_CACHE[k]; const T = TYPY[typ], z = T.zestawy[nazwa], et = (T.etykiety || {})[nazwa] || {};
  const DEF = T.pola || FIELDS; let L = typeof z === 'function' ? z() : z.map(id => DEF.find(f => f.id === id)).filter(Boolean);
  L = L.map(f => et[f.id] ? Object.assign({}, f, {l: et[f.id], label: et[f.id], n: et[f.id]}) : f); return ZESTAW_CACHE[k] = L; }
// ---- dyspozytory silnika (akt_zgon.js) dla typów innych niż zgon: wszystko czytają z konfiguracji TYPY[typ]
const typCfg = a => TYPY[(a && a.typ) || 'zgon'];
const typStosuje = (a, f) => { const t = typCfg(a); return t.stosuje ? t.stosuje(a, f) : true; };
const typNiepewne = (a, f) => { const t = typCfg(a); return t.niepewne ? !!t.niepewne(a, f) : false; };
const typOstrzezenia = a => { const t = typCfg(a); return t.ostrzezenia ? t.ostrzezenia(a) : []; };
const typNazwa = a => typCfg(a).nazwa(a);
const typDaty = a => typCfg(a).daty || [];
// wartość wpisana ręcznie: obcięte białe znaki; pola miejscowości (T.miejsca) z poprawką pisowni jak normPl starego weryfikatora
const typNorm = (a, f, v) => { v = String(v == null ? '' : v).trim(); return (typCfg(a).miejsca || []).includes(f) ? v.replace(/Mocydła/g, 'Moczydła').replace(/Mocydłach/g, 'Moczydłach').replace(/Kacyniec/g, 'Kaczyniec') : v; };
const NAZWY_TYPOW = {zgon: 'Zgony', malzenstwo: 'Małżeństwa', chrzest: 'Chrzty'};
// małżeństwa: ostrzeżenia – port warns() ze starego weryfikatora (te same komunikaty); kontrola marginesu i rejestru tylko dla aktów z odczytem (a.ai), bo indeks ich nie ma
function malOstrzezenia(a){ const w = [], tr = v => String(v == null ? '' : v).trim(), g = f => getv(a, f), num = f => { const m = tr(g(f)).match(/\d+/); return m ? +m[0] : null; };
  if (a.ai) { const dd = (x, y, mx) => lev(fold(tr(x)), fold(tr(y)), mx) > mx;
    [['groom', 'pan młody'], ['bride', 'panna młoda']].forEach(([x, l]) => { const mf = g('margin_' + x + '_first_name'), ml = g('margin_' + x + '_last_name'); if (!tr(mf) && !tr(ml)) { w.push('Margines: brak ' + l + ' – przepisz z marginesu (imię i nazwisko osobno).'); return; }
      const tf = g(x + '_first_name'), tl = g(x + '_last_name'); if (dd(ml, tl, 1) || dd(mf, tf, 2)) w.push('Margines a tekst: ' + l + ' „' + tr(mf) + ' ' + tr(ml) + '” ≠ „' + tr(tf) + ' ' + tr(tl) + '”.'); }); }
  [['groom_age', 'pana młodego'], ['bride_age', 'panny młodej']].forEach(([f, l]) => { const n = num(f); if (n != null && (n < 15 || n > 90)) w.push('Wiek ' + l + ' (' + n + ') wygląda nieprawdopodobnie.'); });
  const d = tr(g('marriage_date')); if (d && !/^\d{4}-\d{2}-\d{2}$/.test(d)) w.push('Data aktu nie ma formatu RRRR-MM-DD.');
  if (!tr(g('witness1_last_name')) || !tr(g('witness2_last_name'))) w.push('Brak jednego ze świadków.');
  const R = (D.rejestr.malzenstwo || {})[a.year];
  if (a.ai && R) { const r = R.find(x => x.akt === a.act);
    if (r) { const sn = x => tr(x).replace(/\?/g, '').toLowerCase().split(/\s+/)[0], bl = x => tr(x).replace(/\?/g, '').toLowerCase().split(/\s+/).slice(-1)[0];
      if (sn(r.mlodzi) !== sn(g('groom_last_name'))) w.push('Rejestr: pan młody „' + r.mlodzi + '” ≠ w akcie „' + tr(g('groom_last_name')) + '”.');
      if (bl(r.panna) !== bl(g('bride_last_name'))) w.push('Rejestr: panna młoda „' + r.panna + '” ≠ w akcie „' + tr(g('bride_first_name')) + ' ' + tr(g('bride_last_name')) + '”.'); }
    else w.push('Brak wpisu tego aktu w rejestrze alfabetycznym.'); }
  return w; }
// ---- eksport CSV typów 2+ (sposób zapisu jak w starym weryfikatorze małżeństw: separator „;”, CRLF, BOM dodaje dl())
function typWiersze(typ){ const T = TYPY[typ], E = T.eksport, F = zestawPola(typ, T.zestawDla()).map(f => f.id), miejsca = new Set(T.miejsca || []), tr = v => String(v == null ? '' : v).trim();
  const normV = (f, v) => { v = tr(v); return miejsca.has(f) ? v.replace(/Mocydła/g, 'Moczydła').replace(/Mocydłach/g, 'Moczydłach').replace(/Kacyniec/g, 'Kaczyniec') : v; };
  const ruszony = a => { const s = S.acts[a.id]; return !!s && (s.done || s.text != null || Object.keys(s.f || {}).length > 0); };
  return D.wszystkie.filter(a => a.typ === typ && (a.ai || ruszony(a))).map(a => { const s = S.acts[a.id] || {f: {}}, b = a.ai || a.lub || {}, r = {};
    E.kolumny.forEach(c => r[c] = b[c] != null ? b[c] : ''); r[E.idKol] = a.stary || a.id; r[E.kolRok] = a.year; r[E.kolNr] = a.act; F.forEach(f => { r[f] = normV(f, getv(a, f)); });
    const niep = f => { const o = s.f[f]; const u = T.niepewne(a, f); return o ? (o.unc || (!o.ok && !s.done && u)) : (!s.done && u); };
    r.uncertain_fields = F.filter(niep).join(','); r.verification_notes = F.filter(f => s.f[f] && s.f[f].note).map(f => f + ': ' + s.f[f].note).join(' | ');
    const tknieto = Object.keys(s.f || {}).some(k => s.f[k].ok || s.f[k].v != null); r.verification_status = s.done ? 'ok' : (tknieto ? 'ai_v1_w_trakcie' : 'ai_v1');
    if (E.kolumny.includes('act_text')) r.act_text = txtOf(a);
    if (E.poWierszu) E.poWierszu(r, a); return r; }); }
function typCsv(typ){ const E = TYPY[typ].eksport, R = typWiersze(typ); return E.kolumny.join(';') + '\r\n' + (R.length ? R.map(r => E.kolumny.map(c => csvCell(r[c])).join(';')).join('\r\n') + '\r\n' : ''); }   // bez wierszy: tylko nagłówek (stary weryfikator nigdy nie eksportował pustego zbioru)
