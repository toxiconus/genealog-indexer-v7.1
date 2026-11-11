/* app/moduly/dane_adapter.js – adapter Pole (model danych) ↔ a.ai / a.lub / a.unc silnika weryfikacji zgonów (krok 3).
   Silnik (akt_zgon.js) nadal czyta obiekt „akt” w układzie v3: {id, year, act, ai, lub, unc, alts, file, roi, pola, tekst, lubRaw, lubName, era}.
   Tu powstaje ten układ z `dane_zgony.json` (zapis zwarty: pole = {v, s, u, z:[nr w zr, wiersz], alt:[…]}). Id aktu w silniku = id z modelu (ZG.Z00011); stary id (idx-…) jest w a.stary i trafia do eksportu CSV. */
function poleRozwin(p, zr){ const z = zr[p.z[0]] || ['', '', '']; const o = {value: p.v, status: p.s, unc: !!p.u, source: {plik: z[0], skan: z[1], strona: z[2], wiersz: p.z[1]}};
  if (p.roi) o.roi = p.roi; ['raw', 'by', 'note'].forEach(k => { if (p[k]) o[k] = p[k]; }); if (p.alt) o.alt = p.alt.map(x => poleRozwin(x, zr)); return o; }
// Pole → {ai, lub, lubRaw}: wartość „ai” = pierwszy kandydat o statusie ai/ok (pole główne, potem alt); „lub” = pierwszy o statusie lub; notes_org z indeksu to lubRaw.
function poleNaAiLub(pola){ const ai = {}, lub = {}; let lubRaw = '';
  Object.keys(pola).forEach(f => { const c = [pola[f]].concat(pola[f].alt || []); const a = c.find(x => x.status === 'ai' || x.status === 'ok'), l = c.find(x => x.status === 'lub');
    if (f === 'notes_org') { if (l) lubRaw = l.value; if (a) ai[f] = a.value; return; }
    if (a) ai[f] = a.value; if (l) lub[f] = l.value; });
  return {ai, lub, lubRaw}; }
function aktZModelu(x, zr){ const pola = {}; Object.keys(x.pola).forEach(f => pola[f] = poleRozwin(x.pola[f], zr)); const r = x.robocze || {}, m = poleNaAiLub(pola);
  const a = {id: x.id, stary: x.stary, year: r.year != null ? r.year : x.rok, act: r.act, ai: Object.keys(m.ai).length ? m.ai : null, unc: x.unc || [], file: r.file || '', roi: r.roi || null, lub: Object.keys(m.lub).length ? m.lub : (r.lubEmpty ? {} : null), lubRaw: m.lubRaw || r.lubRaw || '', lubName: r.lubName || ''};
  if (r.era) a.era = r.era; if (r.alts) a.alts = r.alts; if (r.tnotes) a.tnotes = r.tnotes; if (r.pola) a.pola = r.pola; if (x.tekst) a.tekst = x.tekst; a.model = {pola, zrodla: x.zrodla, stan: x.stan, skan: x.skan, id_dawne: x.id_dawne}; return a; }
// cały zbiór → obiekt D w układzie v3 (acts, fields, cols, ord, counts, fix, scanFiles, scanBase, zatw)
function daneNaD(dane){ const D = {acts: dane.akty.map(x => aktZModelu(x, dane.zr)), fields: dane.konfig.fields, cols: dane.konfig.cols, ord: dane.konfig.ord, fieldsProt: dane.konfig.fieldsProt, fieldsRej: dane.konfig.fieldsRej,
    counts: dane.slowniki.counts, fix: dane.slowniki.fix, scanFiles: dane.slowniki.scanFiles, scanBase: dane.slowniki.scanBase, key: 'multitool', zatw: dane.zatw.map(id => id)};
  const L = D.acts.map(a => a.year).filter(y => Number.isFinite(y)); if (L.length) { D.lata = [Math.min(...L), Math.max(...L)]; D.zakres = D.lata[0] + '–' + D.lata[1]; }   // zakres lat do sprawdzania wpisanych dat (dateBad); bez tego obowiązywał domyślny 1940–1946 z księgi 1943
  return D; }
