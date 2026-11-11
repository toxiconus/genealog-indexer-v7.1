/* app/moduly/typy_aktow.js – konfiguracja typów aktów (krok 3: tylko `zgon`). Jedno miejsce zamiast ORDF/LATF/CAUSEF zaszytych łatkami `sub()` w buduj_baza_v4.py.
   TYPY[typ] = {zestawy:{nazwa:[pola]|funkcja}, zestawDla(akt), etykiety:{zestaw:{pole:etykieta}}}. Kolejność ORDF pochodzi z D.ord (konfiguracja danych). */
const TYPY = {
  zgon: {
    zestawy: {
      LATF: ['death_place','house','deceased_last_name','deceased_first_name','death_date','deceased_sex','age','deceased_status','profession','parents_raw','father_first_name','father_last_name','mother_first_name','mother_last_name','cause_of_death','notes'],   // < 1826 (księgi łacińskie)
      CAUSEF: () => [...ORDF.slice(0,-1), FIELDS.find(f => f.id === 'cause_of_death'), ORDF[ORDF.length-1]].filter(Boolean),   // 1870–79: ORDF + przyczyna zgonu przed uwagami
      ORDF: () => ORDF,                                                                                                          // reszta
    },
    etykiety: {LATF: {death_date: 'Data zgonu / zgłoszenia'}},   // w aktach łacińskich to zwykle data zgłoszenia (A-21)
    zestawDla: a => a.year < 1826 ? 'LATF' : (a.year >= 1870 && a.year <= 1879 ? 'CAUSEF' : 'ORDF'),
  },
};
const ZESTAW_CACHE = {};
function zestawPola(typ, nazwa){ const k = typ + ':' + nazwa; if (ZESTAW_CACHE[k]) return ZESTAW_CACHE[k]; const T = TYPY[typ], z = T.zestawy[nazwa], et = (T.etykiety || {})[nazwa] || {};
  let L = typeof z === 'function' ? z() : z.map(id => FIELDS.find(f => f.id === id)).filter(Boolean);
  L = L.map(f => et[f.id] ? Object.assign({}, f, {l: et[f.id], label: et[f.id], n: et[f.id]}) : f); return ZESTAW_CACHE[k] = L; }
