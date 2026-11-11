/* app/moduly/import_csv.js – import CSV zatwierdzeń zgonów (ZGONY_zweryfikowane_*.csv) z walidacją i podglądem (PLAN_WDROZENIA §2.4, krok 3).
   Logika wczytania pól i aktów jest przeniesiona z `fVer` w weryfikacja_szablon_v3.html. Różnice: (1) id z pliku mapowane przez id dawne (idx-…, asc-…, ai1-…, lm-…) na id modelu;
   (2) etap „analiza” nie zmienia stanu (próba na kopii S), zapis dopiero po potwierdzeniu, po migawce; (3) nieznane id i błędne wiersze są wypisane, reszta przechodzi.
   fixAllTexts (dopasowanie tekstu aktu do zatwierdzonych pól po imporcie) jest przeniesione razem z silnikiem tokenów tekstu (akt_zgon.js), bez interfejsu trybów tekstu. */
const CSV_ID_MAX = 80;
function csvMapaId(){ const m = {}; ZG().forEach(a => { m[a.id] = a; (a.model?.id_dawne || []).forEach(o => { if (!m[o]) m[o] = a; }); if (a.stary) m[a.stary] = a; }); return m; }
// rozpoznanie + walidacja nagłówka i wierszy (bez zmiany stanu)
function csvImportRozpoznaj(txt){ const w = {ok: false, blad: '', wiersze: [], bledy: [], nieznane: []};
  let R; try { R = parseCsv(String(txt).replace(/^﻿/, '')); } catch (e) { w.blad = 'Nie udało się odczytać CSV.'; return w; }
  if (!R || R.length < 2) { w.blad = 'Pusty plik CSV.'; return w; } const H = R[0].map(h => String(h).trim()), ix = {}; H.forEach((h, i) => { if (!(h in ix)) ix[h] = i; });
  if (ix.id == null) { w.blad = 'Nieznany format: brak kolumny „id”.'; return w; } const znane = FIELDS.filter(f => ix[f.id] != null).length;
  if (znane < 3) { w.blad = 'Nieznany format: w pliku są ' + znane + ' kolumn pól zgonów (potrzeba co najmniej 3).'; return w; }
  const M = csvMapaId(); R.slice(1).forEach((r, n) => { if (r.length === 1 && !String(r[0]).trim()) return; const id = String(r[ix.id] || '').trim();
    if (!id || id.length > CSV_ID_MAX || !/^[\w.\-\/]+$/.test(id)) { w.bledy.push('wiersz ' + (n + 2) + ': błędne id'); return; }
    const a = M[id]; if (!a) { w.nieznane.push(id); return; } w.wiersze.push({a, r}); });
  w.ix = ix; w.ok = true; return w; }
// zastosowanie rozpoznanych wierszy do S (v3 `fVer`); zwraca {aktow, pol, pominieteOk, zatwierdzone, konflikty}
function csvImportStosuj(w, ovw){ const ix = w.ix; let nA = 0, nF = 0, nSkip = 0, nOk = 0, konf = 0;
  w.wiersze.forEach(({a, r}) => { const s2 = st(a.id); if (ovw) { s2.f = {}; s2.done = false; delete s2.text; delete s2.hid; delete s2.notesOrg; }
    if (ix.scan_path != null && r[ix.scan_path]) { D.scanFiles = D.scanFiles || {}; const pth = r[ix.scan_path], key = Object.keys(D.scanFiles).find(k => D.scanFiles[k] === pth) || pth; D.scanFiles[key] = pth; s2.scan = key; }
    if (ix.act_text != null && r[ix.act_text] && s2.text == null && r[ix.act_text] !== (a.tekst||'')) s2.text = r[ix.act_text];
    const ok = (r[ix.verification_status] || '') === 'ok'; const unc = new Set((r[ix.uncertain_fields] || '').split(/[;,]/).filter(Boolean)); let n = 0;
    if (ix.father_deceased != null && r[ix.father_deceased]) { s2.par = s2.par || {}; s2.par.father = 1; } if (ix.mother_deceased != null && r[ix.mother_deceased]) { s2.par = s2.par || {}; s2.par.mother = 1; }
    if (ix.death_time != null && (r[ix.death_time] || '').trim() && !/\?/.test(r[ix.death_time]) && !new Set((r[ix.uncertain_fields] || '').split(/[;,]/)).has('death_time')) { s2.hid = s2.hid || {}; s2.hid.death_time = r[ix.death_time].trim(); }
    FIELDS.forEach(f => { let v = ix[f.id] != null ? (r[ix[f.id]] || '').trim() : ''; if (!v) return; v = normFieldVal(a, f.id, v); if (f.id === 'deceased_spouse' && !/\((?:owd\.?|†)\)/.test(v)) v = spMark(v, spDef(r[ix.deceased_status]));
      if (s2.f[f.id]?.ok && !ovw) { nSkip++; if (s2.f[f.id].v !== v) konf++; return; } s2.f[f.id] = {v, src:'csv', ok:ok, unc:unc.has(f.id) || (TXTQ.has(f.id) && /\?\s*$/.test(v))}; n++; });
    if (n) { nA++; nF += n; if (ok && !s2.done) { s2.done = true; nOk++; } } });
  ZG().forEach(a => { if ((a.ai || a.lub) && minor(a) && st(a.id).f.deceased_status?.v !== 'dziecko') st(a.id).f.deceased_status = {v:'dziecko', src:'edit', ok:true}; });
  ZG().forEach(a => autoResolve(a));
  const nT = fixAllTexts();   // dopasowanie tekstu aktu do zatwierdzonych pól (v3: ten sam krok po imporcie)
  return {aktow: nA, pol: nF, pominieteOk: nSkip, zatwierdzone: nOk, konflikty: konf, tekstow: nT}; }
// podgląd: ta sama operacja na kopii stanu (S i D.scanFiles przywracane); nic nie jest zapisywane
function csvImportPodglad(w, ovw){ const bakS = S, bakSF = D.scanFiles, bakH = S.hist; let r; try { S = structuredClone(S); D.scanFiles = JSON.parse(JSON.stringify(D.scanFiles || {})); r = csvImportStosuj(w, ovw); } finally { S = bakS; D.scanFiles = bakSF; } return r; }
async function csvImportZapisz(w, ovw, nazwa){ await kopiaMigawka('przed importem CSV: ' + (nazwa || '')); HIST_WHY = 'import CSV: ' + (nazwa || '') + (ovw ? ' (zastąp)' : ' (dopisz)'); const r = csvImportStosuj(w, ovw); save(); HIST_WHY = null; await stFlush(true); return r; }
