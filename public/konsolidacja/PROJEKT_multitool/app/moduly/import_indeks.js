/* app/moduly/import_indeks.js – wklejka wyników wyszukiwarki Lubgens (lubgens.pl) → akty z indeksu, także z innych parafii (czyste funkcje + dopisanie do S, bez DOM).
   Wklejka to tekst skopiowany ze strony wyników: sekcje „Znalezione urodzenia / chrzty”, „Znalezione małżeństwa”, „Znalezione zgony”, wiersze rozdzielone tabulatorami.
   Zasady: (1) wartości trafiają do pól jako „indeks” (src 'lub'), niezatwierdzone; (2) z uwag wyciągane jest tylko to, co zapisano wprost („O: Jan”, „M: Anna z Nowaków”, miejscowość na początku) –
   całe uwagi zawsze zostają w polu uwag; (3) nazwisko ojca NIE jest dopisywane z nazwiska dziecka; (4) wiersz, który wygląda na akt już obecny w bazie (ten sam typ, rok, osoba i parafia), jest pomijany. */
const IDX_SEKCJE = [[/^Znalezione urodzenia/i, 'chrzest'], [/^Znalezione ma[łl]że[ńn]stwa/i, 'malzenstwo'], [/^Znalezione zgony/i, 'zgon']];
const IDX_MIES = /^(sty|lut|mar|kwi|maj|cze|lip|sie|wrz|pa[źz]|lis|gru)[a-zńźś]*\.?$/i;
const idxTnij = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
// uwagi indeksu → {miejsce, ojciec, ojciecWiek, matka, matkaNazw, matkaWiek}; tylko jawne znaczniki „O:” i „M:”
function idxUwagi(u){ const o = {}, t = idxTnij(u, 400); if (!t) return o; const seg = t.split(',').map(x => x.trim());
  if (seg[0] && !/[:\d]/.test(seg[0]) && !/^(ur|nr|k|zm|chrz)\b\.?/i.test(seg[0]) && /^[A-ZĄĆĘŁŃÓŚŹŻ][\p{L} .-]{1,40}$/u.test(seg[0])) o.miejsce = seg[0];
  const mo = t.match(/(?:^|[\s,;])O:\s*([^,;]+)/), mm = t.match(/(?:^|[\s,;])M:\s*([^,;]+)/), wiek = s => { const m = s.match(/\blat\s+(\d{1,3})\b/); return m ? m[1] : ''; }, bez = s => s.replace(/\blat\s+\d{1,3}\??/, '').replace(/\s+/g, ' ').trim();
  if (mo) { const s = mo[1].trim(); o.ojciecWiek = wiek(s); const im = bez(s); if (im && !/\d/.test(im)) o.ojciec = im; }
  if (mm) { const s = mm[1].trim(); o.matkaWiek = wiek(s); const b = bez(s), z = b.match(/^(\S+(?:\s+\S+)?)\s+z(?:\s+d\.)?\s+(\S.*)$/), dwa = b.match(/^(\S+)\s+(\p{Lu}\S*)$/u);
    if (z) { o.matka = z[1]; o.matkaNazw = z[2]; } else if (dwa) { o.matka = dwa[1]; o.matkaNazw = dwa[2]; } else if (b && !/\d/.test(b)) o.matka = b; }
  return o; }
// tekst wklejki → {wiersze:[{typ, rok, nr, parafia, pola:{pole:wartość}, etykieta}], bledy:[...], sekcje}
function idxParsuj(txt){ const out = {wiersze: [], bledy: [], sekcje: 0}; let typ = null; String(txt || '').replace(/\r/g, '').split('\n').forEach((ln, n) => { const t = ln.trim(); if (!t) return;
    const s = IDX_SEKCJE.find(x => x[0].test(t)); if (s) { typ = s[1]; out.sekcje++; return; } if (!typ || /^NAZWISKO/i.test(t)) return; if (/^poka[żz] wyniki|^Copyright|^Powered by/i.test(t)) { typ = null; return; }
    const c = ln.split('\t').map(x => x.trim()), mal = typ === 'malzenstwo', ir = mal ? 6 : 4; if (c.length < ir + 1) return; const rok = c[ir];
    if (!/^1[5-9]\d\d$/.test(rok)) { if (c.length >= ir + 1 && c[0]) out.bledy.push('wiersz ' + (n + 1) + ': brak czytelnego roku'); return; }
    const parafia = idxTnij(c[ir - 2], 60), akt = idxTnij(c[ir - 1], 12), uw = idxTnij(c[ir + 1], 400), U = idxUwagi(uw), pola = {}, daj = (f, v) => { v = idxTnij(v, 200); if (v) pola[f] = v; };
    if (!parafia || !idxTnij(c[0], 80)) { out.bledy.push('wiersz ' + (n + 1) + ': brak nazwiska lub parafii'); return; }
    if (typ === 'chrzest') { daj('child_last_name', c[0]); daj('child_first_name', c[1]); if (IDX_MIES.test(akt)) daj('index_month', akt); daj('notes_org', uw); daj('child_birth_place', U.miejsce); daj('father_first_name', U.ojciec); daj('father_age', U.ojciecWiek); daj('mother_first_name', U.matka); daj('mother_last_name', U.matkaNazw); daj('mother_age', U.matkaWiek); }
    else if (typ === 'zgon') { daj('deceased_last_name', c[0]); daj('deceased_first_name', c[1]); daj('notes', uw); daj('father_first_name', U.ojciec); daj('mother_first_name', U.matka); daj('mother_last_name', U.matkaNazw); }
    else { daj('groom_last_name', c[0]); daj('groom_first_name', c[1]); daj('bride_last_name', c[2]); daj('bride_first_name', c[3]); daj('margin_notes', uw); }
    out.wiersze.push({typ, rok: +rok, nr: akt || '?', parafia, pola, etykieta: (mal ? c[0] + ' ' + c[1] + ' z ' + c[3] + ' ' + c[2] : c[0] + ' ' + c[1]).trim()}); });
  if (!out.sekcje) out.bledy.unshift('Nie znaleziono nagłówków „Znalezione urodzenia / małżeństwa / zgony” – wklej cały tekst strony wyników Lubgens.');
  return out; }
// klucz „ta sama osoba w tym samym roku i typie” (do wykrywania aktów już obecnych): nazwisko + imię głównych osób
const IDX_GL = {chrzest: [['child_last_name', 'child_first_name']], zgon: [['deceased_last_name', 'deceased_first_name']], malzenstwo: [['groom_last_name', 'groom_first_name'], ['bride_last_name', 'bride_first_name']]};
const idxKlucz = (typ, rok, wart) => typ + '|' + rok + '|' + IDX_GL[typ].map(([n, i]) => rdzKN(wart(n)) + '.' + rdzKI(wart(i))).join('+');
const idxParafiaBazy = p => /^blin[oó]w$/i.test(String(p).trim());
// plan importu: które wiersze są nowe, a które już są w bazie (akty parafii bazowej albo wcześniej zaimportowane z tej samej parafii)
function idxPlan(W, pomijajBaze){ const jest = {}; D.wszystkie.forEach(a => { if (!IDX_GL[a.typ]) return; const k = idxKlucz(a.typ, a.year, f => getv(a, f)) + '|' + fold(a.parafia || ''); jest[k] = a.id; });
  const widziane = new Set(); return W.map(w => { const baza = idxParafiaBazy(w.parafia), k = idxKlucz(w.typ, w.rok, f => w.pola[f] || '') + '|' + (baza ? '' : fold(w.parafia));
    const pusty = IDX_GL[w.typ].every(([n]) => !rdzKN(w.pola[n] || '')), st = pusty ? 'blad' : jest[k] ? 'jest' : widziane.has(k) ? 'powt' : (baza && pomijajBaze) ? 'baza' : 'nowy'; widziane.add(k); return Object.assign({}, w, {stan: st, istnieje: jest[k] || null}); }); }
function idxDodaj(P){ S.nowe = S.nowe || []; let n = 0; const licz = {}; D.wszystkie.forEach(a => { for (const t in NOWE_PFX) if (a.id.startsWith(NOWE_PFX[t])) licz[t] = Math.max(licz[t] || 0, +a.id.slice(NOWE_PFX[t].length) || 0); });
  P.forEach(w => { if (w.stan !== 'nowy') return; licz[w.typ] = (licz[w.typ] || 0) + 1; const x = noweCzysc({id: NOWE_PFX[w.typ] + String(licz[w.typ]).padStart(5, '0'), typ: w.typ, rok: w.rok, nr: w.nr, parafia: idxParafiaBazy(w.parafia) ? '' : w.parafia, zr: 'indeks', utw: new Date().toISOString().slice(0, 19)}); if (!x) return;
    S.nowe.push(x); noweWlacz([x]); const s = S.acts[x.id] = {f: {}, done: false}; for (const f in w.pola) s.f[f] = {v: w.pola[f], src: 'lub', ok: false}; n++; });
  return n; }
