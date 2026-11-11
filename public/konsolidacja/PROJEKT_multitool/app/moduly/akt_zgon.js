/* app/moduly/akt_zgon.js – silnik weryfikacji aktu zgonu (krok 3 planu).
   Funkcje PRZENIESIONE BEZ ZMIAN LOGIKI z narzedzia/weryfikacja_szablon_v3.html (wraz z łatkami buduj_baza_v4.py: LATF/CAUSEF, latName) – to ich parytet z bazą zgonów jest kryterium kroku 3.
   Nie ma tu kopii wklejanych na stałe: fold, esc, lev, csvCell, dl, wiekLat, dzien, raportSpojnosci, hist* pochodzą z wspolne/*.js (znaczniki w szablonie).
   Warunki zewnętrzne (definiuje powłoka): D (z daneNaD), S (stan), AM (id → akt), FIELDS, save(), keepScroll(). Bez DOM. */
const NUMW = {'jeden':1,'dwa':2,'trzy':3,'cztery':4,'pięć':5,'sześć':6,'siedem':7,'osiem':8,'dziewięć':9,'dziesięć':10,'jedenaście':11,'dwanaście':12,'trzynaście':13,'czternaście':14};
const ZG = () => D.wszystkie.filter(a => a.typ === 'zgon');   // krok 5: funkcje zgonów działają zawsze na zgonach, niezależnie od wybranego typu (D.acts = bieżący typ)
const nieZgon = a => !!a && !!a.typ && a.typ !== 'zgon';
const sLow = a => (getv(a,'deceased_status') || '').toString().toLowerCase();
const isSingle = a => /panna|kawaler/.test(sLow(a));
const isChild = a => { const t = (getv(a,'age') || '').toString().toLowerCase(); if (!t) return false; if (/mies|tyg|(^|\s)dni(\s|$)|(^|\s)dn\b|(^|\s)dzie[ńn](\s|$)|(^|\s)godz/.test(t)) return true; const m = t.match(/\d+/); if (m) return +m[0] < 15; const w = t.split(/\s+/).find(x => NUMW[x] !== undefined); return w ? NUMW[w] < 15 : false; };
const minor = a => { if (isChild(a)) return true; const m = (getv(a,'age') || '').toString().match(/^\s*(\d+)\s*(?:lat|lata|l\.?)?\s*$/i); return m ? +m[1] < (getv(a,'deceased_sex') === 'K' ? 16 : 18) : false; };
const appl = (a,f) => { if (nieZgon(a)) return typStosuje(a, f); if (f === 'deceased_maiden_name') return getv(a,'deceased_sex') === 'K'; const kid = /^dziecko/.test(sLow(a)); if (f === 'deceased_spouse') return !isSingle(a) && !isChild(a) && !kid; if (f === 'deceased_status') return true; if (f === 'profession') return (!isChild(a) && !kid) || !!clean(getv(a,f)); return true; };
const warnsOf = a => { if (nieZgon(a)) return typOstrzezenia(a); if (!a.ai && !a.lub) return []; const w = []; if (getv(a,'deceased_sex') === 'M' && clean(getv(a,'deceased_maiden_name'))) w.push('Mężczyzna: nazwisko rodowe powinno być puste (nazwisko jest rodowe) — chyba że wyjątek.'); if (isSingle(a) && clean(getv(a,'deceased_spouse'))) w.push('Panna/kawaler: nie powinno być małżonka.'); if (isChild(a) && fold(clean(getv(a,'deceased_status'))) !== 'dziecko') w.push('Dziecko: ustaw stan „dziecko” (nie zostawiaj pustego i nie wpisuj „kawaler/panna”).'); if (!isChild(a) && fold(clean(getv(a,'deceased_status'))) === 'dziecko') w.push('Stan „dziecko” nie pasuje jednoznacznie do odczytanego wieku — sprawdź wiek i zapis stanu w akcie.'); if (isChild(a) && clean(getv(a,'profession'))) w.push('Dziecko z zawodem — potwierdź, że zawód jest wymieniony w akcie.'); return w; };
const ORD = D.ord || ['death_place','deceased_last_name','deceased_first_name','act_date','informant1','informant2','death_date','death_time','deceased_birth_place','deceased_residence','deceased_sex','deceased_maiden_name','profession','deceased_status','deceased_spouse','age','father_first_name','father_last_name','mother_first_name','mother_last_name','officiant','notes'];
const ORDF = [...ORD.map(id => FIELDS.find(f => f.id === id)).filter(Boolean), ...FIELDS.filter(f => !ORD.includes(f.id))];
const clean = s => (s||'').toString().replace(/\?/g,'').trim();
const exact = (a,b) => clean(a).toLowerCase() === clean(b).toLowerCase() && clean(a) !== '';
const loose = (a,b) => fold(clean(a)) === fold(clean(b)) && clean(a) !== '';
const st = id => S.acts[id] || (S.acts[id] = {f:{}, done:false});
const getv = (a,f) => { const x = S.acts[a.id]?.f?.[f]; if (x) return x.v; const ai = a.ai?.[f], lb = a.lub?.[f]; return (ai != null && String(ai).trim() !== '') ? ai : (lb ?? ai ?? ''); };
const countOf = (f, v) => { const t = FT[f]; if (!t) return null; const c = D.counts[t][clean(v)]; return c || 0; };
const FT = {deceased_last_name:'s', deceased_maiden_name:'s', father_last_name:'s', mother_last_name:'s', deceased_first_name:'n', father_first_name:'n', mother_first_name:'n'};
function diffState(a,f){ let x = a.ai?.[f], y = a.lub?.[f]; if (f === 'deceased_spouse') { x = x && x.replace(/\s*\((?:owd\.?|†)\)/g,''); y = y && y.replace(/\s*\((?:owd\.?|†)\)/g,''); } if (!x || !y) return ''; if (exact(x,y)) return 'eq'; if (loose(x,y)) return 'ap'; return 'ne'; }
function hasDiff(a){ return fieldsOf(a).some(f => diffState(a,f.id) === 'ne' && !S.acts[a.id]?.f?.[f.id]?.ok && !S.acts[a.id]?.done); }   // czerwona ramka tylko dla nierozstrzygniętych różnic AI↔Lubgens (zatwierdzone pole = rozstrzygnięte)
const aiWarn = (a,f) => !!a.ai && (a.unc.includes(f) || /\?/.test(a.ai[f]||''));
function isUnc(a,f){ const x = S.acts[a.id]?.f?.[f]; if (x && x.unc !== undefined) return !!x.unc; if (nieZgon(a)) return typNiepewne(a, f); return !!a.ai && (a.unc.includes(f) || /\?/.test(a.ai[f]||'')); }

const repRows = () => ZG().filter(a => !a.kind && (a.ai || a.lub)).map(a => { const g = f => clean(getv(a,f)); return {id:a.id, year:a.year, num:a.act, last:g('deceased_last_name'), first:g('deceased_first_name'), sex:g('deceased_sex'), death:g('death_date'), act:g('act_date'), ageText:g('age'), status:g('deceased_status'), spouse:g('deceased_spouse'), job:g('profession'), father:(g('father_first_name')+' '+g('father_last_name')).trim(), mother:(g('mother_first_name')+' '+g('mother_last_name')).trim(), maiden:g('deceased_maiden_name')}; });
const repAll = (ign) => raportSpojnosci(repRows()).filter(i => ign || !(S.repIgn || {})[i.id + '|' + i.code]);
function progOf(a){ const s = S.acts[a.id]; if (!s) return 0; let n = 0, d = 0; fieldsOf(a).forEach(f => { if (!appl(a,f.id) && !clean(getv(a,f.id))) return; if (!(a.ai?.[f.id] || a.lub?.[f.id] || (a.alts?.[f.id]||[]).length || s.f[f.id])) return; n++; if (s.f[f.id]?.ok || s.f[f.id]?.skip) d++; }); return n ? Math.round(100 * d / n) : 0; }
const stripQ = v => String(v == null ? '' : v).replace(/\s*\?+/g, '').replace(/\s{2,}/g, ' ').replace(/\(\s*\)/g, '').trim();
const MARK = [['[_]','nie podano w akcie (pole dotyczy)'],['[-]','brak – pole nie dotyczy (np. niezamężna)'],['[niecz.]','jest, ale nieczytelne'],['[nieznane]','akt: nieznany/a/niepamiętny'],['[uszk.]','uszkodzone (dziura, plama)'],['[skreśl.]','skreślone w akcie'],['[b.d.]','tylko z indeksu (akt nieczytany)']];
const isMk = v => /^\[(?:_|-|niecz\.|nieznane|uszk\.|skreśl\.|b\.d\.)\]$/.test(String(v || '').trim());
const MKLEG = {'___':'[_]','---':'[-]','b.d.':'[b.d.]','[nieczytelne]':'[niecz.]','[niepamiętne]':'[nieznane]','[niepamiętna]':'[nieznane]','[niepamiętny]':'[nieznane]','[uszkodzone]':'[uszk.]','[nieznany]':'[nieznane]','[nieznana]':'[nieznane]'};
const normMk = v => { if (typeof v !== 'string') return v; const t = v.trim(); if (MKLEG[t]) return MKLEG[t]; return /\[(?:nieczytelne|niepamiętn[aey]|uszkodzone)\]/.test(v) ? v.replace(/\[nieczytelne\]/g, '[niecz.]').replace(/\[niepamiętn[aey]\]/g, '[nieznane]').replace(/\[uszkodzone\]/g, '[uszk.]') : v; };
const TXTQ = new Set(['deceased_first_name','deceased_last_name','deceased_maiden_name','father_first_name','father_last_name','mother_first_name','mother_last_name','informant1','informant2','deceased_spouse','deceased_birth_place','deceased_residence','death_place','profession']);
const hasQ = (v, f) => !/^(notes|p_note|verification_notes|act_text)$/.test(f) && /\?/.test(String(v || '')) && clean(String(v).replace(/[?\s]/g, '')) !== '';
const nQ = (a, FS) => FS.filter(f => hasQ(getv(a,f.id), f.id)).length;
const jdnG = (y,m,d) => { const a = Math.floor((14-m)/12), y2 = y+4800-a, m2 = m+12*a-3; return d + Math.floor((153*m2+2)/5) + 365*y2 + Math.floor(y2/4) - Math.floor(y2/100) + Math.floor(y2/400) - 32045; };
const jdnJ = (y,m,d) => { const a = Math.floor((14-m)/12), y2 = y+4800-a, m2 = m+12*a-3; return d + Math.floor((153*m2+2)/5) + 365*y2 + Math.floor(y2/4) - 32083; };
const fromJdnG = n => { const a = n+32044, b = Math.floor((4*a+3)/146097), c = a - Math.floor(146097*b/4), d = Math.floor((4*c+3)/1461), e = c - Math.floor(1461*d/4), m = Math.floor((5*e+2)/153); return {y:100*b+d-4800+Math.floor(m/10), m:m+3-12*Math.floor(m/10), d:e-Math.floor((153*m+2)/5)+1}; };
const fromJdnJ = n => { const c = n+32082, d = Math.floor((4*c+3)/1461), e = c - Math.floor(1461*d/4), m = Math.floor((5*e+2)/153); return {y:d-4800+Math.floor(m/10), m:m+3-12*Math.floor(m/10), d:e-Math.floor((153*m+2)/5)+1}; };
const julToGreg = (y,m,d) => fromJdnG(jdnJ(y,m,d)), gregToJul = (y,m,d) => fromJdnJ(jdnG(y,m,d));
const pad2 = n => String(n).padStart(2,'0'), isoYMD = o => `${String(o.y).padStart(4,'0')}-${pad2(o.m)}-${pad2(o.d)}`;
const DATE_F = new Set(['death_date','act_date','p_date']);
const MIES = ['styczeń','luty','marzec','kwiecień','maj','czerwiec','lipiec','sierpień','wrzesień','październik','listopad','grudzień'], MIESD = ['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'], DNI = ['niedziela','poniedziałek','wtorek','środa','czwartek','piątek','sobota'];
const dwParse = v => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((v||'').trim()); return m ? {y:+m[1], m:+m[2], d:+m[3]} : null; };
const dim = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const isoOf = (y, m, d) => { const t = new Date(Date.UTC(2000, 0, 1)); t.setUTCFullYear(y, m-1, d); return t.toISOString().slice(0,10).replace(/^\+?0*(\d{4})/, '$1'); };
const ROM = ['i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii'];
function dateShort(a, f, v){ const t = String(v ?? '').trim().toLowerCase(); if (!t || /^\d{4}-\d{2}-\d{2}$/.test(t)) return v;
  const m0 = t.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/); if (m0) return normDate(t);
  const m = t.match(/^(\d{1,2})[\s.\/-]+([a-ząćęłńóśźż]+|\d{1,2})\.?(?:[\s.\/-]+(\d{2,4}))?\.?$/i); if (!m) return v;
  let mo = 0; if (/^\d+$/.test(m[2])) mo = +m[2]; else { const w = m[2], ri = ROM.indexOf(w); if (ri >= 0) mo = ri + 1; else if (w.length >= 3) mo = MIES.findIndex((n, i) => n.startsWith(w) || MIESD[i].startsWith(w) || n.slice(0,3) === w.slice(0,3)) + 1; }
  const d = +m[1]; if (!(mo >= 1 && mo <= 12 && d >= 1 && d <= 31)) return v;
  let y = m[3] ? (m[3].length === 2 ? 1900 + +m[3] : +m[3]) : 0;
  if (!y) { const ad = f === 'death_date' ? dwParse(getv(a,'act_date')) : null; y = (ad && ad.y) || a.year || 1943; if (f === 'death_date' && ad && mo > ad.m) y -= 1; }
  if (d > dim(y, mo)) return v; return y + '-' + String(mo).padStart(2,'0') + '-' + String(d).padStart(2,'0'); }
function learnFix(a, f, v, src){ if (src !== 'edit' || nieZgon(a) || !a.ai || !/name|informant|residence|birth_place|death_place/.test(f)) return; const x = (clean(a.ai[f]) || '').split(',')[0].split(/\s+/), y = (clean(v) || '').split(',')[0].split(/\s+/); if (x.length !== y.length) return; x.forEach((p, i) => { p = p.replace(/\?$/, ''); const q = y[i]; if (p.length > 2 && q && fold(p) !== fold(q) && lev(fold(p), fold(q), 4) <= Math.max(2, Math.floor(p.length / 2))) { S.fixes = S.fixes || {}; const d = (S.fixes[fold(p)] = S.fixes[fold(p)] || {}); d[q] = (d[q] || 0) + 1; } }); }
const NPLJ = {"jacobus": "Jakub", "joannes": "Jan", "johannes": "Jan", "adalbertus": "Wojciech", "woyciech": "Wojciech", "stanislaus": "Stanisław", "josephus": "Józef", "josephatus": "Józefat", "josephatam": "Józefata", "andreas": "Andrzej", "mathias": "Maciej", "matthias": "Maciej", "matheus": "Mateusz", "matthaeus": "Mateusz", "mathaeus": "Mateusz", "thomas": "Tomasz", "martinus": "Marcin", "antonius": "Antoni", "paulus": "Paweł", "valentinus": "Walenty", "laurentius": "Wawrzyniec", "sebastianus": "Sebastian", "franciscus": "Franciszek", "blasius": "Błażej", "lucas": "Łukasz", "bartholomaeus": "Bartłomiej", "ignatius": "Ignacy", "gregorius": "Grzegorz", "christophorus": "Krzysztof", "nicolaus": "Mikołaj", "casimirus": "Kazimierz", "michael": "Michał", "alexius": "Aleksy", "petrus": "Piotr", "simon": "Szymon", "stephanus": "Stefan", "adamus": "Adam", "albertus": "Wojciech", "vincentius": "Wincenty", "hyacinthus": "Jacek", "augustinus": "Augustyn", "gasparus": "Kacper", "casparus": "Kacper", "philippus": "Filip", "agnes": "Agnieszka", "sophia": "Zofia", "hedwigis": "Jadwiga", "hedvigis": "Jadwiga", "anastasia": "Anastazja", "catharina": "Katarzyna", "catarina": "Katarzyna", "margaretha": "Małgorzata", "elisabeth": "Elżbieta", "elisabetha": "Elżbieta", "eva": "Ewa", "rosalia": "Rozalia", "theresia": "Teresa", "thecla": "Tekla", "dorothea": "Dorota", "francisca": "Franciszka", "apollonia": "Apolonia", "victoria": "Wiktoria", "mariae": "Maria", "agathae": "Agata", "agatha": "Agata", "dorothae": "Dorota", "petronillae": "Petronela", "petronilla": "Petronela", "susanna": "Zuzanna", "ursula": "Urszula", "lucia": "Łucja", "annae": "Anna", "joannae": "Joanna", "catharinae": "Katarzyna", "sophiae": "Zofia", "agnetis": "Agnieszka", "dorotha": "Dorota", "helisabeth": "Elżbieta", "hiacynt": "Jacek", "jozafat": "Józefat", "konstancji": "Konstancja", "marianne": "Marianna", "margaritha": "Małgorzata", "susanne": "Zuzanna", "teklae": "Tekla", "ursulae": "Urszula"}; const latName = v => String(v).split(/(\s+)/).map(w => NPLJ[w.toLowerCase().replace(/[.,?]/g,'')] ? NPLJ[w.toLowerCase().replace(/[.,?]/g,'')] + (/\?$/.test(w) ? '?' : '') : w).join('');
function commit(a,f,v,src,extra){ if (src === 'edit' && !nieZgon(a) && /^(deceased_first_name|father_first_name|mother_first_name)$/.test(f)) v = latName(v); if (src === 'edit' && (nieZgon(a) ? typDaty(a).includes(f) : (f === 'death_date' || f === 'act_date'))) v = dateShort(a, f, v); if (nieZgon(a) && src === 'edit') v = typNorm(a, f, v); learnFix(a, f, v, src); const o = st(a.id).f[f] || {}; st(a.id).f[f] = Object.assign({v: (src==='edit' ? v : clean(v) || v), src, ok:true, unc:(src==='csv'||src==='auto') ? o.unc : false, note:(src==='csv'||src==='auto') ? o.note : ''}, extra||{}); /* każda świadoma zmiana/wybór rozstrzyga niepewność */ save(); if (/^informant/.test(f) && src !== 'txt' && !(extra && extra.skip)) applyWitText(a, f); }
function dateBad(a, f, v){ if (!(nieZgon(a) ? typDaty(a).includes(f) : /^(death_date|act_date)$/.test(f)) || !String(v || '').trim() || isMk(v)) return ''; const t = dateShort(a, f, String(v).trim().replace(/\?+$/, '')); if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return 'Niepełna data – podaj dzień, miesiąc i rok (np. 1944-05-30)'; const y = +t.slice(0, 4); { const m = +t.slice(5, 7), d = +t.slice(8, 10); if (m < 1 || m > 12) return 'Miesiąc ' + m + ' nie istnieje'; if (d < 1 || d > dim(y, m)) return 'W tym miesiącu nie ma dnia ' + d; } const yr = (D.lata || [1940, 1946]); if (y < yr[0] || y > yr[1]) return 'Rok ' + y + ' wygląda na pomyłkę (księga: ' + (D.zakres || '1943–1945') + ')'; return ''; }
const NOTE_JUNK = /weryfikacj|^zgon\s+['‘]|niepewn|do sprawdzenia|sprawdzi[ćc]|odczyt|nieczytel|orientacyjn|czytane|indeks|(^|\s)lp\s*\d+|zgodn|^akt spisany|^data (aktu|zgonu|śmierci)|^wiek|^godzin/i;
const cleanNote = n => { const parts = String(n || '').split(/(?<=;)\s+|(?<=\.)\s+(?=[A-ZĄĆĘŁŃÓŚŹŻ„"'])/).map(x => x.trim()).filter(Boolean); const keep = parts.filter(x => !NOTE_JUNK.test(x.replace(/^["„]+/, ''))); return keep.join(' ').replace(/^["„]+|["”]+$/g, '').trim(); };
function autoResolve(a){ if (a.kind || nieZgon(a) || !(a.ai || a.lub)) return false; const s = st(a.id); let ch = false;
  if (minor(a) && !s.f.deceased_status) { s.f.deceased_status = {v:'dziecko', src:'edit', ok:true}; ch = true; }
  if (s.done) { const x = s.f.notes, cur = x ? x.v : getv(a,'notes'); if ((!x || x.src === 'csv' || x.src === 'auto') && cur) { const cl = cleanNote(cur); if (cl !== cur) { s.f.notes = {v:cl, src:'auto', ok:true}; s.notesOrg = s.notesOrg || cur; ch = true; } } }
  return ch; }
const q = csvCell;
const COLS = D.cols.concat(['act_date','verification_notes','scan_path','act_text','source_office','father_deceased','mother_deceased'].filter(c => !D.cols.includes(c)));
const normTime = v => { const m = String(v ?? '').trim().match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?$/); return m ? (m[2] && m[2] !== '00' ? (+m[1]) + ':' + m[2] : String(+m[1])) : String(v ?? '').trim(); };
const normDate = v => { v = String(v ?? '').trim(); const m = v.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/); return m ? m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0') : v; };
function rows(){ return ZG().filter(a => a.ai && !a.kind).map(a => { const s = S.acts[a.id] || {f:{}}; const r = {id:a.stary || a.id, death_year:a.year, death_act_number:a.act}; COLS.forEach(c => { if (!(c in r)) r[c] = a.ai[c] ?? ''; }); r.source_office = clean(a.ai.source_office) || (a.nowy ? (a.parafia || '') : 'USC Szastarka'); r.father_deceased = s.par?.father ? 'tak' : (a.ai?.father_deceased || ''); r.mother_deceased = s.par?.mother ? 'tak' : (a.ai?.mother_deceased || '');
  FIELDS.forEach(f => { if (s.f?.[f.id]) r[f.id] = s.f[f.id].v; });
  r.death_time = (s.hid && s.hid.death_time) || '';   // godzina zgonu: ukryta w narzędziu; w eksporcie tylko wartość potwierdzona wcześniej przez użytkownika (nigdy odczyt AI)
  const unc = FIELDS.filter(f => (isUnc(a,f.id) && !s.f?.[f.id]?.ok && !s.done) || (s.f?.[f.id]?.unc)).map(f => f.id); r.uncertain_fields = unc.join(','); FIELDS.forEach(f => { if (!TXTQ.has(f.id) || !r[f.id]) return; r[f.id] = stripQ(r[f.id]); if (unc.includes(f.id) && !isMk(r[f.id])) r[f.id] += '?'; }); r.verification_notes = FIELDS.filter(f => s.f?.[f.id]?.note).map(f => f.id + ': ' + s.f[f.id].note).join(' | ');
  r.scan_path = (D.scanFiles || {})[scanOf(a)] || '';
  r.act_text = txtOf(a);   // pełny tekst aktu (poprawiony, a jeśli nie ruszany – odczyt Haiku)
  if (s.notesOrg && s.f?.notes?.src === 'auto') r.notes_org = s.notesOrg;
  if (!s.done) r.death_time = '';
  r.death_time = normTime(r.death_time); r.death_date = normDate(r.death_date); r.act_date = normDate(r.act_date); r.deceased_status = minor(a) ? 'dziecko' : String(r.deceased_status || '').trim().toLowerCase(); r.profession = String(r.profession || '').trim().toLowerCase(); if (r.deceased_spouse) r.deceased_spouse = normFieldVal(a,'deceased_spouse',r.deceased_spouse).replace(/(?<=\S)y(\??)((?: \((?:owd\.|†)\))?)$/,(m0,q0,t0)=>/^[^ ]*a /.test(r.deceased_spouse)?'a'+q0+t0:m0);
  const ed = Object.keys(s.f||{}).length; r.verification_status = s.done ? 'ok' : (ed ? 'ai_v1_w_trakcie' : 'ai_v1'); return r; }); }
function csvText(){ const rs = rows(); return COLS.join(';') + '\r\n' + rs.map(r => COLS.map(c => q(r[c])).join(';')).join('\r\n') + '\r\n'; }
const PLC = [[/^Kaczy[ńn](?:ce|cu|ca|cach|com|iec|ców)$/i,'Kaczyniec'],[/^Blin(?:ów|owie|owem)$/i,'Blinów'],[/^Brzozówk(?:a|i|ę|ą|ach|e)$|^Brzozówce$/i,'Brzozówka'],[/^Moczydł(?:a|ach|om|ami)$/i,'Moczydła'],[/^Słodk(?:ów|owie|owem)$/i,'Słodków']];
const PLF = new Set(['death_place','deceased_birth_place','deceased_residence']);
const SPB = {'Stępniów':'Stępień','Stępniach':'Stępień','Stępni':'Stępień'};
function spBase(w){ const root = fold(w.replace(/(ów|ych|ich|ach|ami|om)$/i, '')), C = (D.counts && D.counts.s) || {}; let best = null;
  for (const [n, c] of Object.entries(C)) { const fn = fold(n); if (Math.abs(fn.length - root.length) > 2 || fn[0] !== root[0]) continue; const f2 = fn.replace(/[aeoyi]$/, ''), f3 = f2.replace(/e(?=[^aeiouy]$)/, ''), d = Math.min(lev(f2, root, 2), lev(f3, root, 2)); if (d > 1 || (d === 1 && root.length < 5)) continue; const sc = c * 10 - d * 1000; if (!best || sc > best.sc) best = {n, sc, d}; } return best && (best.n + (best.d ? '?' : '')); }
const SPM = /\s*\((?:owd\.?|†)\)$/;
const spFem = v => String(v).split(/;\s*/).map(x => /^\S*a\s/i.test(x) ? x.replace(/((?:sk|ck|dzk)i|(?<=[^aeiouy\s])y)(\??)((?: \((?:owd\.|†)\))?)$/i, (m0,g,q,t) => (/y$/i.test(g) && g.length === 1 ? 'a' : g.slice(0,-1) + 'a') + q + t) : x).join('; ');
const spMark = (v, m) => spFem(String(v || '').split(/;\s*/).filter(Boolean).map(x => x.replace(SPM, '') + (m ? ' (' + m + ')' : '')).join('; '));
const spDef = st => { st = String(st || '').toLowerCase(); return /^(żonaty|zamężna)/.test(st) ? 'owd.' : /^(wdowiec|wdowa)/.test(st) ? '†' : ''; };
const AGE_W = {zero:0,jeden:1,jedna:1,jedno:1,dwa:2,dwie:2,trzy:3,cztery:4,'pięć':5,'sześć':6,siedem:7,osiem:8,'dziewięć':9,'dziesięć':10,jedenaście:11,'dwanaście':12,'trzynaście':13,'czternaście':14,'piętnaście':15,'szesnaście':16,'siedemnaście':17,'osiemnaście':18,'dziewiętnaście':19,'dwadzieścia':20};
const AGE_U = {d:['dzień','dni','dni'], t:['tydzień','tygodnie','tygodni'], m:['miesiąc','miesiące','miesięcy'], r:['rok','lata','lat'], g:['godzina','godziny','godzin']};
const AGE_AB = {d:'dn.', t:'tyg.', m:'mies.', g:'godz.'};   // skróty: lata bez jednostki (gdy sam wiek), dalej: mies., tyg., dn., godz.
const ageFmt = (n, u, solo) => u === 'r' ? (solo ? String(n) : n + (n === 1 ? ' r.' : ' l.')) : n + ' ' + AGE_AB[u];
const agePl = (n, u) => { const f = AGE_U[u], k = n % 10, h = n % 100; return n === 1 ? f[0] : (k >= 2 && k <= 4 && !(h >= 12 && h <= 14)) ? f[1] : f[2]; };
function ageUnit(w){ w = w.toLowerCase(); if (/^(dz|dn|d\.?$)/.test(w)) return 'd'; if (/^(tyg|tydz|t\.?$)/.test(w)) return 't'; if (/^(mies|miesi|m-c|m-cy|m\.?$|msc)/.test(w)) return 'm'; if (/^(rok|roku|lat|lata|l\.?$|r\.?$)/.test(w)) return 'r'; if (/^godz/.test(w)) return 'g'; return ''; }
function normAge(v){ let t = String(v).trim(); if (!t || /^\d+$/.test(t)) return t;
  const q = (/\?\s*$/.test(t) || /^~/.test(t)) ? '?' : '', pre = ''; t = t.replace(/\?+\s*$/, '').replace(/^~/, '').trim();
  if (/^\d+$/.test(t)) return t + q;
  const par = t.match(/^0\s*\((.+)\)$/); if (par) t = par[1];            // „0 (osiem miesięcy)” → „osiem miesięcy”
  if (/^pół\s+roku$/i.test(t)) t = '6 miesięcy';
  t = t.replace(/^(\d+),5\s+roku?$/i, (m0, n) => (+n ? n + ' rok ' : '') + '6 miesięcy').replace(/\bpół\b/gi, '6');
  const parts = [], re = /(\d+|\?|[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+)\s*([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż.\-]+)/g; let m, rest = t.replace(/[,;]/g, ' ');
  while ((m = re.exec(rest))) { let n = m[1]; if (n !== '?') { if (!/^\d+$/.test(n)) { const w = AGE_W[n.toLowerCase()]; if (w == null) return v; n = w; } n = +n; }
    const u = ageUnit(m[2]); if (!u) return v; parts.push({n, u}); }
  return parts.length ? pre + parts.map(x => x.n === '?' ? '? ' + (x.u === 'r' ? 'l.' : AGE_AB[x.u]) : ageFmt(x.n, x.u, parts.length === 1)).join(' ') + q : v; }
function normFieldVal(a, f, v){ if (!v) return v; v = normMk(v); if (isMk(v)) return v;
  if (f === 'age') return normAge(v);
  if (f === 'death_place' && /^Szpital Janów/i.test(v)) return 'Szpital Janów Lubelski';   // zmarli w szpitalu: bez dopisku miejsca zamieszkania („…(zm.), Moczydła”)
  if (PLF.has(f)) return v.replace(/[\p{L}]+/gu, w => { for (const [re, c] of PLC) if (re.test(w)) return c; return w; });
  if (f === 'deceased_spouse') { let t = v.trim(); t = t.replace(/\(owd\)/gi,'(owd.)');
    if (/\((?:I|II|III)\s*(?:mąż|żona)\)/.test(t)) { const ps = [...t.matchAll(/([^,;()]+?)\s*\((?:I|II|III)\s*(?:mąż|żona)\)/g)].map(m => m[1].trim()); if (ps.length) return ps.join('; '); }
    t = t.replace(/^(?:żona|mąż)\s+/i, '').replace(/\s*\((?:owdowiał[aey]\s*)?(?:żona|mąż)?\)\s*$/i, '').replace(/\sz domu\s+/i, ' z ').trim();
    const m = t.match(/^(\S+(?:\s+\S+)?)\s+ze?\s+(\S+?)(\?)?$/u); if (!m) return spFem(t || v); const w = m[2]; let base = SPB[w] || spBase(w), q = m[3] || '';
    if (!base) { base = guessBase(w, 'mother_last_name', a); q = '?'; } if (/a$/i.test(m[1].split(' ')[0])) base = base.replace(/(sk|ck|dzk)i$/i,'$1a').replace(/(?<=[^aeiouy])y$/i,'a'); return `${m[1]} ${base}${q}`; }
  if (['mother_last_name','father_last_name','deceased_maiden_name','deceased_last_name'].includes(f)) { const t = v.replace(/\s*\((?:ze?)\s[^)]*\)/u, '').trim(); return t || v; }
  return v; }
function normActs(){ ZG().forEach(a => { ['ai','lub'].forEach(k => { const o = a[k]; if (!o) return; Object.keys(o).forEach(f => { if (typeof o[f] === 'string') o[f] = normFieldVal(a, f, o[f]); }); if (o.deceased_spouse && !/\((?:owd\.?|†)\)/.test(o.deceased_spouse)) o.deceased_spouse = spMark(o.deceased_spouse, spDef(o.deceased_status)); }); }); }
function guessBase(w, f, a){ const sex = getv(a,'deceased_sex'), fem = f === 'mother_last_name' || f === 'deceased_maiden_name' || (f === 'deceased_last_name' && sex === 'K'); let g = w; if (/(sk|ck|dzk)ich$/i.test(w)) g = w.replace(/ich$/i, fem ? 'a' : 'i'); else if (/(sk|ck|dzk)iej$/i.test(w)) g = w.replace(/iej$/i, 'a'); else if (/(sk|ck|dzk)iego$/i.test(w)) g = w.replace(/iego$/i, 'i'); else if (/ów$/i.test(w)) g = w.slice(0, -2); return g; }
let _NS = null; const nameSex = () => { if (_NS) return _NS; _NS = {M:new Set(), K:new Set()}; ZG().filter(a => !a.kind).forEach(a => ['ai','lub'].forEach(k => { const o = a[k]; if (!o) return; const sx = o.deceased_sex; const add = (n, t) => { n = stripQ(n).split(/[\s,;(]/)[0]; if (n.length > 2 && /^[A-ZĄĆĘŁŃÓŚŹŻ]/.test(n)) _NS[t].add(n); }; if (sx === 'M' || sx === 'K') add(o.deceased_first_name, sx); add(o.father_first_name, 'M'); add(o.mother_first_name, 'K'); })); return _NS; };
const typDla = a => TYPY[(a && a.typ) || 'zgon'];
const fieldsOf = a => { const t = (a && a.typ) || 'zgon'; return zestawPola(t, TYPY[t].zestawDla(a)); };   // zestawy pól w typy_aktow.js (v3: LATF/CAUSEF/ORDF zaszyte łatką buildera)
function lubMissing(a){ if (!a || a.kind || !a.lub) return []; return fieldsOf(a).filter(f => { const lv = clean(a.lub[f.id]); if (!lv || !appl(a, f.id)) return false; const x = st(a.id).f[f.id]; if (x?.skip) return false; return !clean(getv(a, f.id)); }); }
const scanOf = a => (S.acts[a.id]?.scan !== undefined ? S.acts[a.id].scan : a.file) || '';
const roiOf = a => S.acts[a.id]?.roi || a.roi;
const nmOf = a => nieZgon(a) ? typNazwa(a) : a.ai ? (String(getv(a,'deceased_last_name')||'').replace(/\?/g,'').trim() + ' ' + String(getv(a,'deceased_first_name')||'').replace(/\?/g,'').trim()).trim() : (a.lubName||'');   // nazwa aktu = bieżące (poprawione) nazwisko i imię
const actName = id => { const a = AM[id]; return a ? `${a.year} · akt ${a.act} · ${nmOf(a)}` : id; };
function parseCsv(txt){ txt = txt.replace(/^\uFEFF/, ''); const rows = []; let row = [], cur = '', q = false; for (let i = 0; i < txt.length; i++) { const c = txt[i]; if (q) { if (c === '"') { if (txt[i+1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; } else if (c === '"') q = true; else if (c === ';') { row.push(cur); cur = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && txt[i+1] === '\n') i++; row.push(cur); cur = ''; if (row.some(x => x !== '')) rows.push(row); row = []; } else cur += c; } if (cur !== '' || row.length) { row.push(cur); if (row.some(x => x !== '')) rows.push(row); } return rows; }
const missingAudit = (a, FS) => {
  if (a.kind) return {gaps:[], uncertain:[], checks:[], conflicts:[]};
  const gaps = [], uncertain = [], checks = [], text = String(a.tekst || ''), hasText = !!clean(text), hasAI = !!a.ai;
  const label = id => FS.find(f => f.id === id)?.label || (D.fields.find(f => f.id === id)?.label) || id;
  const val = id => clean(getv(a,id));
  const baseVal = id => clean(a.lub?.[id]);
  const addGap = (id, why) => { if (!FS.some(f => f.id === id)) return; if (!val(id) && !gaps.some(x=>x.id===id)) gaps.push({id,label:label(id),why}); };
  const addGapMaiden = () => { if (val('deceased_sex') === 'K' && !val('deceased_maiden_name') && val('father_last_name')) addGap('deceased_maiden_name', 'brak nazwiska rodowego – wynika z nazwiska ojca (' + val('father_last_name') + ')'); };
  const addCheck = (id, why) => { if (!checks.some(x=>x.id===id&&x.why===why)) checks.push({id,label:label(id),why}); };
  addGapMaiden();
  if (!hasAI) {
    if (a.lub) {
      ['deceased_last_name','deceased_first_name','death_date','age','father_first_name','mother_first_name'].forEach(id => {
        if (!baseVal(id)) addGap(id, 'brak wartości w indeksie Lubgensu; sprawdź skan, jeśli jest dostępny');
      });
      if (!hasText) checks.push({id:'',label:'Pełny odczyt aktu',why:'Brak transkrypcji AI/tekstu w tym rekordzie; indeks Lubgensu nie zastępuje odczytu aktu.'});
    }
    return {gaps,uncertain,checks,conflicts:[]};
  }
  // Wymagane minimum do kontroli. Brak oznacza „sprawdź”, a nie pewny błąd.
  [['deceased_first_name','imię zmarłego'],['deceased_last_name','nazwisko zmarłego'],['death_date','data zgonu'],['act_date','data spisania aktu'],['death_place','miejsce zgonu'],['age','wiek']].forEach(([id,why])=>{ if (!val(id)) addGap(id, 'podstawowa informacja nie została wpisana: '+why); });
  if (/stawili\s+si[eę]/i.test(text)) ['informant1','informant2'].forEach(id=>{ if (!val(id)) addGap(id,'tekst zaczyna opis świadków („Stawili się”), ale pole jest puste'); });
  if (/(?:syn|córk|cork|dzieci[eę]|małżonków|malzonkow)\b/i.test(text)) {
    ['father_first_name','father_last_name','mother_first_name','mother_last_name'].forEach(id=>{
      if (!val(id)) addGap(id,'tekst zawiera wzmiankę o pochodzeniu/rodzicach; sprawdź, czy da się odczytać brakujące pole');
    });
  }
  if (/(?:urodzon|urodzon[aey]|tamże urodzon|tamze urodzon)/i.test(text) && !val('deceased_birth_place')) addGap('deceased_birth_place','tekst wspomina miejsce urodzenia, ale pole nie jest wypełnione');
  if (/(?:zamieszkał|zamieszkała|zamieszkały|zamieszkał[aey])/i.test(text) && !val('deceased_residence')) addGap('deceased_residence','tekst wspomina zamieszkanie, ale pole nie jest wypełnione');
  FS.forEach(f=>{
    if (f.id==='notes') return;
    const v=val(f.id), x=st(a.id).f[f.id];
    if (v && (isUnc(a,f.id) && !x?.ok && !x?.skip || /\?|\[(?:niecz\.|uszk\.|skreśl\.)\]|nieczytelne|niepewn/i.test(v))) {
      if (!uncertain.some(q=>q.id===f.id)) uncertain.push({id:f.id,label:label(f.id),why:'wartość oznaczona jako niepewna lub zawiera znak niepewności'});
    }
  });
  if (val('death_date') && val('act_date')) {
    const d=val('death_date').match(/^(\d{4})-(\d{2})-(\d{2})/), ad=val('act_date').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (d&&ad) { const dt=Date.UTC(+d[1],+d[2]-1,+d[3]), at=Date.UTC(+ad[1],+ad[2]-1,+ad[3]); if (dt>at) addCheck('death_date','data zgonu wypada po dacie spisania aktu — sprawdź odczyt lub format daty'); }
  }
  if (a.lub) FS.forEach(f=>{ const lv=clean(a.lub[f.id]); if (lv && !val(f.id) && !gaps.some(g=>g.id===f.id)) addCheck(f.id,'Lubgens ma wartość, ale pole odczytu jest puste; porównaj ze skanem'); });
  const conflicts = [];
  if (a.lub) FS.forEach(f=>{ if (diffState(a,f.id)==='ne' && !st(a.id).f[f.id]?.ok && !st(a.id).f[f.id]?.skip) conflicts.push({id:f.id,label:label(f.id),why:'AI: „'+clean(a.ai[f.id])+'” ≠ Lubgens: „'+clean(a.lub[f.id])+'”'}); });
  return {gaps,uncertain,checks,conflicts};
};
const lubOnly = (a, FS) => a.lub ? FS.filter(f => { const lv = clean(a.lub[f.id]); if (!lv) return false; const x = st(a.id).f[f.id]; if (x?.ok || x?.skip) return false; const cur = x ? clean(x.v) : clean(a.ai?.[f.id]); return !cur || fold(cur) !== fold(lv); }) : [];
const txtOf = a => { const s = S.acts[a.id]; return s && s.text != null ? s.text : (a.tekst || ''); };

// ---- silnik tekstu aktu potrzebny przy zatwierdzaniu pól (commit → applyWitText) i po imporcie (fixAllTexts); BEZ interfejsu trybów tekstu
function applyWitText(a, f){ const t = txtOf(a); if (!t) return; const L = textSugs(a, fieldsOf(a), t).filter(x => x.f === f).sort((x, y) => y.i - x.i); if (!L.length) return; let r = t; L.forEach(x => { r = r.slice(0, x.i) + x.to + r.slice(x.e); }); st(a.id).text = r === (a.tekst||'') ? undefined : r; if (r === (a.tekst||'')) delete st(a.id).text; save(); }
function textSugs(a, FS, t){ const s = st(a.id), out = [], toks = assignTok(a, t, FS), okf = f => { const fx = s.f[f]; return fx && fx.ok && !fx.skip ? clean(fx.v) : ''; };
  const spans = []; const mm = t.match(/Staw(?:ili|ił)\s+się:?\s+/i);
  if (mm) { const st0 = mm.index + mm[0].length, cm = t.indexOf(',', st0); if (cm > st0) { const seg = t.slice(st0, cm), parts = []; let pos = 0; seg.split(/(\s+i\s+)/).forEach(pt => { if (!/^\s+i\s+$/.test(pt)) parts.push({s:st0 + pos, e:st0 + pos + pt.length, txt:pt}); pos += pt.length; });
      ['informant1','informant2'].forEach((f, k) => { const val = okf(f).split(',')[0].trim(), pt = parts[k]; if (!val || !pt || parts.length !== 2 && k) return; const bare = pt.txt.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
        const covered = toks.some(x => x.f === f && !x.vr && x.i >= pt.s && x.e <= pt.e); if (fold(bare) !== fold(val) && (/\[/.test(pt.txt) || !covered)) spans.push({i:pt.s, e:pt.e, from:pt.txt, to:val, f}); }); } }
  const inSpan = x => spans.some(q => x.i >= q.i && x.e <= q.e);
  toks.forEach(x => { const fx = s.f[x.f]; if (x.vr && fx?.ok && !fx.skip && !inSpan(x)) out.push({i:x.i, e:x.e, from:x.w, to:inflTo(x.w, x.fw), f:x.f}); });
  spans.forEach(q => out.push(q));
  const gm = t.match(/godzinie\s+(\[nieczytelne\]|\[niecz\.\])/i), tm = okf('death_time').match(/^(\d{1,2})(?::(\d\d))?$/);
  if (gm && tm) { const i = gm.index + gm[0].length - gm[1].length; out.push({i, e:i + gm[1].length, from:gm[1], to:normTime(tm[1] + (tm[2] ? ':' + tm[2] : '')), f:'death_time'}); }
  return out.sort((x, y) => x.i - y.i); }
function witParts(t){ const mm = (t||'').match(/Staw(?:ili|ił)\s+się:?\s+/i); if (!mm) return null; const st0 = mm.index + mm[0].length, cm = t.indexOf(',', st0); if (cm <= st0) return null; const parts = []; let pos = 0; t.slice(st0, cm).split(/(\s+i\s+)/).forEach(pt => { if (!/^\s+i\s+$/.test(pt)) parts.push({s:st0 + pos, e:st0 + pos + pt.length, txt:pt}); pos += pt.length; }); return parts; }
function syncWitnesses(a, oldT, newT){ if (a.kind) return; const po = witParts(oldT), pn = witParts(newT); if (!pn || pn.length > 2) return; const s2 = st(a.id), done = [];
  ['informant1','informant2'].forEach((f, k) => { const n = pn[k]; if (!n || (pn.length === 1 && k)) return; const o = po && po[k] ? po[k].txt : null; if (o !== null && o === n.txt) return;
    const name = n.txt.replace(/\s+/g, ' ').trim(); if (/[\[\]?]/.test(name) || name.split(' ').filter(w => w.length > 1).length < 2) return;
    const x = s2.f[f]; if (x && (x.ok || x.skip)) return; const cur = clean(getv(a, f)).replace(/\?$/, '').trim(); if (fold(cur) === fold(name)) return;
    s2.f[f] = {v:name, src:'txt', ok:true, unc:false, note:x?.note}; done.push(f); });
  if (done.length) { save(); toast('Świadkowie z tekstu zapisani do pól: ' + done.map(f => f.slice(-1)).join(', ')); } }
function assignTok(a, t, FS){ const toks = []; const re = /[\p{L}]+/gu; let m; while ((m = re.exec(t))) toks.push({w:m[0], i:m.index, e:m.index+m[0].length, f:null});
  const ids = new Set(FS.map(f => f.id)); let cur = 0; const um = toks.findIndex(x => /^(umar|zmar)/i.test(x.w));
  for (const f of TF_ORDER) { if (!ids.has(f)) continue; const ws = (f.startsWith('informant') ? clean(getv(a,f)).split(',')[0] : clean(getv(a,f))).split(/[\s\-,]+/).map(w => w.replace(/[^\p{L}]/gu, '')).filter(w => w.length >= 3 && !SLOWA.has(fold(w))); if (!ws.length) continue;
    if (um >= 0 && ['death_place','deceased_first_name','deceased_last_name'].includes(f) && cur < um) cur = um;
    let from = cur; for (const w of ws) { let j = toks.findIndex((x,k) => k >= from && !x.f && !MIESG.has(fold(x.w)) && stemOk(x.w, w)); if (j < 0) j = toks.findIndex(x => !x.f && !MIESG.has(fold(x.w)) && stemOk(x.w, w)); if (j >= 0) { toks[j].f = f; toks[j].fw = w; toks[j].vr = f !== 'profession' && !lenient(toks[j].w, w) && !((S.acts[a.id]?.vrOk || {})[fold(toks[j].w)+'|'+fold(w)]); from = j; if (w === ws[0]) cur = j; } } }
  return toks; }
function baseCands(word, f, a){ const t = FT[f]; if (!t || !D.counts[t]) return []; const x = stemOf(word), sex = getv(a,'deceased_sex'), fem = f === 'mother_last_name' || f === 'deceased_maiden_name' || (f === 'deceased_last_name' && sex === 'K') || (f === 'deceased_spouse');
  const out = []; for (const [n,c] of Object.entries(D.counts[t])) { if (c < 2) continue; const y = stemOf(n); if (y === x) { let sc = c; if (t === 's' && /(sk|ck|dzk)[ai]$/i.test(n)) sc += (fem === /a$/i.test(n)) ? 1e6 : 0; out.push([n,c,sc]); } }
  const seen = new Set(); return out.sort((p,q) => q[2]-p[2]).filter(r => { const k = fold(r[0]); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0,3); }
function stemOf(w){ w = fold(w); for (const e of ENDS) if (w.length - e.length >= 4 && w.endsWith(e)) return w.slice(0, -e.length); return w; }
function stemOk(w, v){ const a = fold(w), b = fold(v); if (a.length < 3 || b.length < 3) return false; if (a === b) return true; const x = stemOf(w), y = stemOf(v); if (x === y) return true; if (Math.min(x.length, y.length) >= 5 && lev(x, y, 1) <= 1) return true;
  if (Math.abs(a.length-b.length) > 3) return false; let k = 0; while (k < a.length && k < b.length && a[k] === b[k]) k++; return k >= Math.max(3, Math.min(a.length, b.length) - 2); }
function lenient(w, v){ const a = fold(w), b = fold(v); if (a === b) return true; if (b === 'kol' && /^kolon/.test(a)) return true; if (sameStem(w, v)) return true; let k = 0; while (k < a.length && k < b.length && a[k] === b[k]) k++; if (k < 3) return false; const ta = a.slice(k), tb = b.slice(k); if (!TAIL.test(ta) || !TAIL.test(tb)) return false; return k >= Math.min(a.length, b.length) - 3 && k >= Math.max(a.length, b.length) - 5; }
const sameStem = (w, v) => fold(w) === fold(v) || stemOf(w) === stemOf(v);
const ENDS = ['owie','ami','ach','ich','ych','ego','emu','ow','om','em','ie','owi','a','e','y','i','u','o'].sort((x,y) => y.length-x.length);
const MIESG = new Set(['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','wrzesnia','pazdziernika','listopada','grudnia']);
const SLOWA = new Set(['owdowiala','owdowialy','owdowialego','owdowialej','zona','zone','zony','maz','meza','domu','zmarlej','zmarlego','zamezna','zonaty']);
const TAIL = /^(|a|e|i|y|u|o|m|ie|em|ow|owa|owi|ego|emu|iej|ej|ami|ach|om|ka|ek|ec|iec|ca|ce|cu|ku|ki|kow|la|el|le|ela|ia|iem|ia|ow|iow|ska|skiego|skiej|skim|ski|ia|ii|ią|ą|ę|ą|ach|ach|ow)$/;
const QRE = /(?:[\p{L}]+\s?)?\[[^\]]*(?:\?|nieczytel)[^\]]*\]/gu;
function qList(t){ const o = [], c = {}; for (const m of t.matchAll(QRE)) { const k = m[0]; c[k] = c[k] || 0; o.push({s:m.index, e:m.index+k.length, txt:k, key:k+'#'+(c[k]++)}); } return o; }
function qClean(x){ const m = x.match(/^([\s\S]*?)\[([^\]]*)\]$/); if (!m) return x; const inner = m[2].replace(/\?/g,'').trim(); return /nieczytel/i.test(inner) ? m[1].trim() : (inner ? m[1] + inner : m[1].trim()); }
function inflTo(tok, fw){ const m1 = tok.match(/(?:sk|ck|dzk)(ich|iego|iej|iemu|im|ą|ie)$/i), m2 = fw.match(/^(.*(?:sk|ck|dzk))[ai]$/i); if (m1 && m2) return m2[1] + m1[1]; const st0 = stemOf(tok), ft = fold(tok); let end = ''; if (st0 !== ft && ft.startsWith(st0)) end = tok.slice(st0.length); return (end && stemOf(fw) === fold(fw) && !fold(fw).endsWith(fold(end))) ? fw + end : fw; }
function setTxt(a, v){ const old = txtOf(a), s2 = st(a.id); if (v === (a.tekst||'')) delete s2.text; else s2.text = v; save(); syncWitnesses(a, old, v); }
function fixAllTexts(){ let n = 0; ZG().forEach(a => { if (!a.tekst || a.kind) return; const t = txtOf(a), safe = x => !/(_place|_residence)$/.test(x.f) && (/[\[\s]/.test(x.from) || fold(x.from).slice(-3) === fold(x.to).slice(-3)), L = textSugs(a, fieldsOf(a), t).filter(safe).sort((x, y) => y.i - x.i); let r = t, last = Infinity; L.forEach(x => { if (x.e > last) return; r = r.slice(0, x.i) + x.to + r.slice(x.e); last = x.i; }); const g1 = clean(s2x(a).f.informant1?.ok ? s2x(a).f.informant1.v : ''), g2 = clean(s2x(a).f.informant2?.ok ? s2x(a).f.informant2.v : ''); const sm = r.match(/(Staw(?:ili|ił)\s+się:?\s+)(.*?)(,\s+(?:obaj|oba)\b)/i); if (sm && g1 && g2 && !/[,\[]/.test(g1 + g2)) { const cur = sm[2], want = g1 + ' i ' + g2; if (!/\sz\s/.test(cur) && cur !== want && cur.replace(/[?\[\]]/g, '').replace(/\s+/g, ' ').trim() !== want.replace(/\?/g, '')) r = r.slice(0, sm.index + sm[1].length) + want + r.slice(sm.index + sm[1].length + cur.length); }
      if (r !== t) { const s2 = st(a.id); if (r === (a.tekst||'')) delete s2.text; else s2.text = r; n++; } }); return n; }
const s2x = a => st(a.id);
const TF_ORDER = ['informant1','informant2','death_place','deceased_first_name','deceased_last_name','deceased_birth_place','deceased_residence','profession','deceased_status','deceased_spouse','deceased_maiden_name','father_first_name','father_last_name','mother_first_name','mother_last_name','officiant'];
function nextTF(a, FS){ const s = st(a.id); const ids = FS.map(f => f.id); const order = TF_ORDER.filter(f => ids.includes(f)).concat(ids.filter(f => !TF_ORDER.includes(f))); const k = Math.max(0, order.indexOf(TF)); for (let n = 1; n <= order.length; n++) { const f = order[(k+n) % order.length]; const x = s.f[f]; if (!(x?.ok || x?.skip) && (clean(getv(a,f)) || (a.alts?.[f]||[]).length) && appl(a,f)) return f; } return null; }

const hlCls = (a, f) => { const x = S.acts[a.id]?.f?.[f]; return x?.skip ? 'sk' : x?.ok ? (x.unc ? 'un' : 'ok') : isUnc(a,f) ? 'un' : diffState(a,f) === 'ne' ? (S.acts[a.id]?.done && clean(getv(a,f)) ? 'ok' : 'cf') : ''; };   // zatwierdzony akt = przyjęte wartości (bez czerwonego)
function marks(h){ return h.replace(/\[[^\]]*\]/g, q => /\?/.test(q) ? `<span class="mq">${q}</span>` : /nieczytel/i.test(q) ? `<span class="mr">${q}</span>` : `<span class="mg">${q}</span>`); }

// ---- końcówka: setf i start (v3: setf woła keepScroll; normActs i migracja stanu działają przy starcie)
function setf(a,f,v,src){ commit(a,f,v,src); keepScroll(true); }
// migracja zapisanych wcześniej wartości do obecnych zasad (v3, blok po normActs): znaczniki, miejscowości, małżonek, wiek; autoResolve; zatwierdzone akty bez niepewności. Zwraca liczbę zmian.
function startMigracja(){ let ch = 0; ZG().forEach(a => { const sf = S.acts[a.id]?.f; if (!sf) return; Object.values(sf).forEach(x => { if (x && typeof x.v === 'string') { const nv = normMk(x.v); if (nv !== x.v) { x.v = nv; ch++; } } }); ['death_place','deceased_birth_place','deceased_residence','deceased_spouse','age'].forEach(f => { const x = sf[f]; if (x && typeof x.v === 'string' && x.v) { const nv = normFieldVal(a, f, x.v); if (nv !== x.v) { x.v = nv; ch++; } } }); }); ZG().forEach(a => { if (autoResolve(a)) ch++; const sf = S.acts[a.id]; if (sf?.done) Object.values(sf.f || {}).forEach(x => { if (x.unc) { x.unc = false; ch++; } }); }); return ch; }
// zatwierdzone w danych (D.zatw) dostają done raz (S.seeded), jak init() w v3
function startZatwierdzone(){ S.seeded = S.seeded || {}; let n = 0; (D.zatw||[]).forEach(id => { if (!S.seeded[id] && AM[id]) { S.seeded[id] = 1; (S.acts[id] = S.acts[id] || {f:{}}).done = true; n++; } }); return n; }
