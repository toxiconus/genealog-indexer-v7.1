/* Wspólny ładowacz silnika zakładki „Osoby” (krok 6) dla testów w Node: te same moduły co w aplikacji i Workerze (kolejność jak w zbuduj_app.py), dane z app/dane_*.json.
   Używają go test_krok6_osoby.cjs i probka_50_par.cjs. Nic nie zapisuje w repo. */
const fs = require('fs'), vm = require('vm'), path = require('path'), crypto = require('crypto');
const T = __dirname, H = path.join(T, '..'), K = path.join(H, '..');
const MODULY = ['wspolne/tekst.js', 'wspolne/raport.js', 'wspolne/norm.js', 'wspolne/norm_zapis.js', 'PROJEKT_multitool/moduly/wystapienia.js', 'PROJEKT_multitool/moduly/identity.js', 'PROJEKT_multitool/moduly/decyzje.js', 'PROJEKT_multitool/app/moduly/osoby_rdzen.js'];
function silnik(){ const src = MODULY.map(f => fs.readFileSync(path.join(K, f), 'utf8')).join('\n').replace('/*JSON:slowniki_imion*/', fs.readFileSync(path.join(K, 'wspolne/slowniki_imion.json'), 'utf8'));
  const X = {setTimeout, clearTimeout}; vm.createContext(X); vm.runInContext(src + '\nthis.api = {osModel, osPodpis, osSilnik, osKandydaci, osPoWyst, osPrzeliczPorcja, osWarianty, osKlasy, osDecyduj, osCofnij, osWaliduj, osDopiszDecyzje, osImportDop, osDopZastosuj, osObsluz, osCzyscDec, osUzas, decKlastry, decAktywne, decKlucz, decNowa, decKolizje, decCsv, idPorzadek, idZdanie, porNazwiska, kluczNazwiska, porownajProfile, OS_WN, wystProfile, wystEtykieta, normCzysc};', X);
  return X.api; }
function dane(){ const akty = []; for (const f of ['dane_zgony', 'dane_chrzty', 'dane_malzenstwa']) JSON.parse(fs.readFileSync(path.join(H, 'app', f + '.json'), 'utf8')).akty.forEach(a => akty.push(a));
  return akty.map(a => ({id: a.id, typ: a.typ, year: a.rok, pola: a.pola})); }
const wart = (a, f) => a.pola[f] ? a.pola[f].v : '';
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
// pełny przebieg (bez Workera) – do porównań; zwraca {E, wyniki, licz}
function przelicz(A, E){ const wyniki = {}, licz = {}; let od = 0; while (od < E.PL.length) od = A.osPrzeliczPorcja(E, od, 1000, wyniki, licz); return {wyniki, licz}; }
module.exports = {silnik, dane, wart, sha, przelicz, T, H, K};
