/* wspolne/norm_zapis.js – normalizacje ZAPISU odczytu (czyste funkcje, bez DOM). Port z narzedzia/buduj_baza_v4.py:
   fold, MALE (budowa), male_surname, psur, parents, parents_pl, polname, polname_ai, is_child, fill_markers.
   Wymaga: wspolne/norm.js (NORM_SLOWNIKI = wspolne/slowniki_imion.json: GEN, PGEN, NPL).
   Zasada: wynik ma być IDENTYCZNY z Pythonem; sprawdza to PROJEKT_multitool/test/parytet_norm.py (uruchom po każdej zmianie tu lub w buildzie).
   Różni się od norm.js: tam są klucze do PORÓWNAŃ (nie zmieniają danych), tu reguły, które ZMIENIAJĄ zapisywaną wartość (nazwiska męskie, imiona PL, rodzice, znaczniki). */

const zapHas = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
// jak Python fold: małe litery, ł→l, ó→o, bez znaków łączących (inny niż fold z tekst.js, który nie zamienia ó)
const zapFold = x => String(x).toLowerCase().replace(/ł/g, 'l').replace(/ó/g, 'o').normalize('NFD').replace(/\p{Mn}/gu, '');
const zapTrimPy = s => String(s).trim();

// słownik nazwisk męskich z list nazwisk (kolejność ma znaczenie: pierwsze wystąpienie wygrywa, jak setdefault)
function zapBudujMale(nazwiska) {
  const M = Object.create(null);
  for (let n of nazwiska) {
    n = zapTrimPy(n || '');
    if (!n || n.includes(' ') || n.includes('?') || n.includes('/')) continue;
    const f = zapFold(n);
    if (/(owa|owna|ina|yna|ska|cka|anka)$/.test(f)) continue;
    for (const k of new Set([f, 'oae'.includes(f[f.length - 1]) ? f.slice(0, -1) : f, f.replace(/e([^aeiouy])$/, '$1')])) if (!(k in M)) M[k] = n;
  }
  return M;
}

const ZAP_FSUF = [['iowna', 'panna'], ['owna', 'panna'], ['ówna', 'panna'], ['ianka', 'panna'], ['anka', 'panna'], ['onka', 'panna'], ['iowa', 'zona'], ['owa', 'zona'], ['ina', 'zona'], ['yna', 'zona']];
// → null | [forma męska, typ] (typ: panna | zona | ska; z '?' na końcu, gdy brak pewnego rdzenia w MALE)
function zapMaleNazwisko(sn, sex, MALE) {
  sn = zapTrimPy(zapTrimPy(sn).replace(/\?+$/, ''));
  if (!sn || sn.includes(' ')) return null;
  const f = zapFold(sn);
  if (f in MALE) return null;
  for (const [suf, typ] of ZAP_FSUF) {
    if (f.endsWith(suf)) {
      const stem = f.slice(0, f.length - suf.length);
      for (const k of [stem, stem + 'a', stem + 'o', stem + 'e']) if (k in MALE) return [MALE[k], typ];
      return [sn.slice(0, sn.length - suf.length), typ + '?'];
    }
  }
  if (/^(.*?)(ska|cka|dzka)$/.test(f) && sex !== 'M') return [sn.slice(0, -1) + 'i', 'ska'];
  return null;
}

// nazwisko ojca z dopełniacza (polskie akta): Kowalskiego/Kowalów → forma męska
function zapPsur(t, MALE) {
  t = zapTrimPy(String(t).replace(/[?()]/g, ''));
  const f = zapFold(t);
  for (const suf of ['iow', 'ow', 'ich', 'ych']) {
    if (f.endsWith(suf)) {
      const stem = f.slice(0, f.length - suf.length);
      for (const k of [stem, stem + 'a', stem + 'o', stem + 'e', stem + 'i']) if (k in MALE) return MALE[k];
      if (suf === 'ich' || suf === 'ych') return t.slice(0, t.length - suf.length) + 'i';
      return t.slice(0, t.length - suf.length);
    }
  }
  if (t.endsWith('ów')) {
    const stem = zapFold(t.slice(0, -2));
    for (const k of [stem, stem + 'a', stem + 'o']) if (k in MALE) return MALE[k];
    return t.slice(0, -2);
  }
  return t;
}

// rodzice z łacińskiego dopełniacza: „Matthaei et Annae Kowalskow” → {father_first_name, mother_first_name, father_last_name}
function zapRodziceLac(pr) {
  const GEN = NORM_SLOWNIKI.GEN;
  const m = /^\s*([A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)(?:\s+et\s+([A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+))?\s*(.*?)\s*$/.exec(pr);
  if (!m || !zapHas(GEN, m[1].toLowerCase())) return {};
  const o = { father_first_name: GEN[m[1].toLowerCase()] };
  if (m[2]) o.mother_first_name = zapHas(GEN, m[2].toLowerCase()) ? GEN[m[2].toLowerCase()] : m[2];
  const sur = zapTrimPy(m[3].replace(/[?()]/g, ''));
  if (sur) o.father_last_name = sur;
  return o;
}
// rodzice z polskiego dopełniacza: „syn Kacpra i Agaty Kowalskich”
function zapRodzicePl(pr, MALE) {
  const PGEN = NORM_SLOWNIKI.PGEN;
  const m = /^\s*(?:(?:syn|córka|dziecko|filia|filius)\s+)?(?:szlachetnych\s+)?(\S+)(?:\s+i\s+(\S+))?\s*(.*?)\s*$/i.exec(pr);
  if (!m || !zapHas(PGEN, m[1].toLowerCase())) return {};
  const o = { father_first_name: PGEN[m[1].toLowerCase()] };
  if (m[2]) o.mother_first_name = zapHas(PGEN, m[2].toLowerCase()) ? PGEN[m[2].toLowerCase()] : m[2];
  if (m[3]) o.father_last_name = zapPsur(m[3].replace(/[?()]/g, ''), MALE);
  return o;
}

// imię z aktu (łacina, dawna pisownia) → dzisiejsze polskie; zwraca [imię, dodatkowe warianty z nawiasu]
function zapPolImie(v) {
  const NPL = NORM_SLOWNIKI.NPL;
  if (!v || v.startsWith('[')) return [v, ''];
  const q = zapTrimPy(v).endsWith('?') ? '?' : '';
  let s = zapTrimPy(zapTrimPy(v).replace(/\?+$/, '')), extra = '', par = '';
  const m = /^(.*?)\s*\((.*?)\)\s*$/.exec(s);
  if (m) { s = zapTrimPy(m[1]); par = zapTrimPy(m[2]); }
  const slowa = t => zapTrimPy(t) ? zapTrimPy(t).split(/\s+/) : [];
  const one = w => { const k = w.toLowerCase().replace(/^[.,]+|[.,]+$/g, ''); return zapHas(NPL, k) ? NPL[k] : w; };
  let main = slowa(s).map(one).filter(Boolean).join(' ');
  if (!main && par) { main = slowa(par.split(',')[0]).map(one).join(' '); par = ''; }
  if (par) {
    for (const x of par.split(',').map(zapTrimPy)) {
      if (!x || zapHas(NPL, x.toLowerCase()) || one(x) === main || x === main) continue;
      extra = (extra ? extra + ', ' : '') + x;
    }
  }
  return [main + q, extra];
}
// zmienia ai w miejscu: imiona PL, Woy→Woj w nazwiskach, dopisek „w akcie też: …” do notes
function zapPolImionaAi(ai) {
  const ex = [];
  for (const f of ['deceased_first_name', 'father_first_name', 'mother_first_name']) {
    const v = ai[f];
    if (v) { const [n, e] = zapPolImie(v); if (n !== v) ai[f] = n; if (e) ex.push(e); }
  }
  for (const f of ['deceased_last_name', 'father_last_name', 'mother_last_name']) {
    const v = ai[f];
    if (v && /^Woy/.test(v)) ai[f] = 'Woj' + v.slice(3);
  }
  if (ex.length) ai.notes = (ai.notes || '') + (ai.notes ? ', ' : '') + 'w akcie też: ' + ex.join('; ');
}

function zapDziecko(age) {
  const a = String(age || '').toLowerCase();
  if (/mies|mens|dies|dn\.|dni|tyg|hebd|m\.\d/.test(a)) return true;
  const m = /\d+/.exec(a);
  return !!(m && parseInt(m[0], 10) < 15);
}
// puste pola → [_] (nie podano w akcie) / [-] (nie dotyczy); zmienia ai w miejscu
function zapZnaczniki(ai) {
  const ch = zapDziecko(ai.age), ln = zapTrimPy(ai.deceased_last_name || '');
  if (ai.father_first_name && !ai.father_last_name && ln && !ln.startsWith('[')) ai.father_last_name = ln;
  for (const f of ['house', 'age', 'deceased_status', 'deceased_last_name', 'profession']) if (!ai[f]) ai[f] = (f === 'profession' && ch) ? '[-]' : '[_]';
  const hasp = !!(ai.parents_raw || ai.father_first_name);
  for (const f of ['father_first_name', 'father_last_name', 'mother_first_name', 'mother_last_name', 'parents_raw'])
    if (!ai[f]) ai[f] = (ch && (['parents_raw', 'father_first_name', 'father_last_name'].includes(f) || !hasp || f.startsWith('mother'))) ? '[_]' : '[-]';
}
