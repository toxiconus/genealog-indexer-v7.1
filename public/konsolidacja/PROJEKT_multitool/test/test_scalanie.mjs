// Test reguł identity.js na RANKING_scalen_zgony.csv. Uruchom: node test/test_scalanie.mjs  (z katalogu PROJEKT_multitool)
// Dane kandydatów czytane są w locie z GED w repo; do wyników trafiają tylko identyfikatory i wnioski (bez danych osób z drzewa).
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
const H = path.dirname(fileURLToPath(import.meta.url)), K = path.join(H, '..', '..');
const src = ['wspolne/tekst.js', 'wspolne/raport.js', 'wspolne/norm.js', 'PROJEKT_multitool/moduly/identity.js'].map(f => fs.readFileSync(path.join(K, f), 'utf8')).join('\n').replace('/*JSON:slowniki_imion*/', fs.readFileSync(path.join(K, 'wspolne/slowniki_imion.json'), 'utf8'));
const X = {}; vm.createContext(X); vm.runInContext(src + '\nthis.api = {porownajProfile, idKandydaci, idIndeks, idZdanie, przedzialUr, kluczNazwiska, porNazwiska, porImiona, przedzialUr};', X); const A = X.api;
// --- GED
const I = {}, F = {}; let cur = null, sub = '';
for (const ln of fs.readFileSync(path.join(K, 'GED_scalone/drzewo_scalone_v36_rodziny.ged'), 'utf8').split(/\r?\n/)) { const m = /^(\d) (@[^@]+@ )?(\S+) ?(.*)$/.exec(ln); if (!m) continue; const [, lv, id, tag, val] = m;
  if (lv === '0') { cur = id && tag === 'INDI' ? (I[id.trim()] = {id: id.trim(), famc: [], fams: []}) : id && tag === 'FAM' ? (F[id.trim()] = {chil: []}) : null; sub = ''; continue; } if (!cur) continue;
  if (lv === '1') { sub = tag; if (tag === 'NAME') { const n = /^(.*?)\/(.*?)\//.exec(val); cur.imie = n ? n[1].trim() : val; cur.nazwisko = n ? n[2].trim() : ''; } else if (tag === 'SEX') cur.plec = val === 'M' ? 'M' : val === 'F' ? 'K' : ''; else if (tag === 'FAMC') cur.famc.push(val); else if (tag === 'FAMS') cur.fams.push(val); else if (tag === 'HUSB') cur.husb = val; else if (tag === 'WIFE') cur.wife = val; else if (tag === 'CHIL') cur.chil.push(val); }
  else if (lv === '2') { const y = (/(\d{4})/.exec(val) || [])[1]; if (tag === 'DATE' && y) { if (sub === 'BIRT') { cur.by = +y; cur.babt = !/^\d|^\d{4}$/.test(val) && /ABT|EST|CAL|BEF|AFT/.test(val); } else if (sub === 'DEAT') cur.dy = +y; else if (sub === 'MARR') cur.my = +y; } else if (tag === 'PLAC') { if (sub === 'DEAT' || (sub === 'BIRT' && !cur.pl)) cur.pl = val; } else if (tag === 'AGE' && sub === 'DEAT') cur.age = val.replace(/y$/, '').replace(/(\d+)m$/, '$1 mies.').replace(/(\d+)d$/, '$1 dni'); }
  else if (lv === '3' && tag === 'PAGE' && /^zgon/.test(val)) cur.zgonIdx = val; }
function profil(id, jakoZgon){ const p = I[id]; if (!p) return null; const o = {id, akt: id, typ: 'ged', rola: jakoZgon ? 'zmarly' : 'osoba', rok: p.dy || null, imie: p.imie, nazwisko: p.nazwisko, plec: p.plec || '', miejsce: p.pl || '', zg: p.dy || null, zyje: [], dzieciUr: [], malzonek: []};
  if (jakoZgon && p.age) { o.wiek = p.age; o.ur = A.przedzialUr(p.dy, p.age); } else if (p.by) o.ur = p.babt ? [p.by - 4, p.by + 4] : [p.by - 1, p.by];
  const fc = F[p.famc[0]]; if (fc) { const f = I[fc.husb], m = I[fc.wife]; if (f) { o.ojciec = f.imie; o.ojciecNazw = f.nazwisko; } if (m) { o.matka = m.imie; o.matkaNazw = m.nazwisko; } }
  p.fams.forEach(fid => { const f = F[fid]; if (!f) return; const sp = I[f.husb === id ? f.wife : f.husb]; if (sp && sp.imie) o.malzonek.push(sp.imie); if (f.my) o.zyje.push(f.my); f.chil.forEach(c => { const ch = I[c]; if (ch && ch.by && !ch.babt) o.dzieciUr.push(ch.by); }); });
  if (p.plec === 'K' && !jakoZgon) o.rola = 'osoba'; return o; }
// --- ranking
const rows = fs.readFileSync(path.join(K, 'haiku/ODCZYTY/RANKING_scalen_zgony.csv'), 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter(Boolean).slice(1).map(l => l.split(';'));
const pula = Object.values(I).filter(p => !p.zgonIdx).map(p => profil(p.id, false)); const ix = A.idIndeks(pula);
const out = ['id_zgon;klasa_rankingu;kandydat_rankingu;wniosek_pary;sprzecznosci;rozbieznosci_istotne;zgodnosci_mocne;kandydatow_wg_regul;najlepszy_wg_regul;wniosek_najlepszego;zgodny_z_rankingiem'], T = {}, przyk = [];
for (const r of rows) { const [idz, osoba, rok, wiek, miejsce, , , kand, , , klasa] = r; const kl = klasa[0], z = profil(idz, true); if (!z) continue;
  const L = A.idKandydaci(z, ix), naj = L.find(u => u.wniosek !== 'konflikt') || null; let u = null; if (kand && I[kand]) u = L.find(x => x.b === kand) || A.porownajProfile(z, profil(kand, false));
  const w = !kand ? 'brak-kandydata' : !u.rdzen ? 'rdzen-niezgodny' : u.wniosek; (T[kl] = T[kl] || {})[w] = (T[kl][w] || 0) + 1;
  const wn = naj ? naj.wniosek : 'brak'; (T[kl + '*'] = T[kl + '*'] || {})[wn] = (T[kl + '*'][wn] || 0) + 1;
  out.push([idz, kl, kand, w, u ? u.sprzecznosci.map(x => x.k).join(',') : '', u ? u.rozbieznosci.filter(x => x.istotna).map(x => x.k).join(',') : '', u ? u.zgodnosci.filter(x => x.mocna).map(x => x.k).join(',') : '', L.length, naj ? naj.b : '', wn, naj && kand ? (naj.b === kand ? 'tak' : 'nie') : ''].join(';'));
  if (u && (kl === 'A' || przyk.filter(p => p.kl === kl).length < 4)) przyk.push({kl, osoba, rok, wiek, kand, u, n: L.length}); }
fs.writeFileSync(path.join(H, 'wynik_ranking.csv'), '﻿' + out.join('\r\n') + '\r\n');
console.log('Klasa rankingu × wniosek dla pary z rankingu'); console.table(Object.fromEntries(Object.entries(T).filter(([k]) => !k.endsWith('*'))));
console.log('Klasa rankingu × wniosek najlepszego kandydata wg reguł (cała pula)'); console.table(Object.fromEntries(Object.entries(T).filter(([k]) => k.endsWith('*'))));
if (process.argv.includes('-v')) for (const p of przyk) { console.log(`\n[${p.kl}] ${p.osoba}, zm. ${p.rok}, wiek ${p.wiek || '–'} ↔ ${p.kand} (kandydatów wg reguł: ${p.n}) → ${p.u.rdzen ? p.u.wniosek : 'rdzeń niezgodny'}`);
  console.log('  + ' + p.u.zgodnosci.map(x => x.t.replace(/„[^”]*”/g, '„…”')).join(' | ')); if (p.u.rozbieznosci.length) console.log('  ~ ' + p.u.rozbieznosci.map(x => x.t.replace(/„[^”]*”/g, '„…”')).join(' | ')); if (p.u.sprzecznosci.length) console.log('  ! ' + p.u.sprzecznosci.map(x => x.k).join(' | ')); console.log('  ? ' + p.u.braki.map(x => x.k).join(', ')); }
