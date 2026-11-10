# Multitool – moduły

Zasada budowy: moduły to pliki JS z czystymi funkcjami (bez DOM, poza `ui/*` i `skan`). `zbuduj.py` wkleja je w miejsce znaczników i **przerywa budowę**, gdy brakuje wymaganego modułu albo został niewstawiony znacznik (tak działa już `prototyp/zbuduj.py`). Powstają dwie wersje z tych samych źródeł: pojedynczy plik HTML (offline) i folder (`index.html` + `js/*.js` + `dane.js`).

Gotowe w tym folderze (działają w prototypie i testach): `moduly/norm.js`, `identity.js`, `wystapienia.js`, `decyzje.js`, `db.js`. Reszta to plan.

## 1. Lista

| Moduł | Pliki | Zależy od | Zadanie |
|---|---|---|---|
| core | `tekst.js`, `plik.js`, `norm.js`, `daty.js`, `typy_aktow.js` | – | tekst, pliki, normalizacja, kalendarz, konfiguracja typów aktów i zestawów pól |
| db | `db.js`, `kopie.js` | core | stan roboczy w IndexedDB, kopie bezpieczeństwa, migracja ze starych kluczy |
| sources | `zrodla.js`, `skan.js` | core, db | źródła, skany (id z sumy kontrolnej), podgląd, ROI, ramki pól |
| acts | `akt.js`, `tekst_aktu.js` | core, db, sources, history | silnik weryfikacji aktu: pola, zatwierdzanie, tryby tekstu, kreator |
| identity | `wystapienia.js`, `identity.js`, `decyzje.js` | core | profile wystąpień, propozycje z uzasadnieniem, dziennik decyzji, klastry |
| relations | `relacje.js`, `rodzina.js` | identity | relacje z aktów, rodziny, oś czasu, mini-drzewo |
| audit | `raport.js`, `chronologia.js`, `kontrole.js` | core, identity, relations | sygnały: sprzeczność / anomalia / wskazówka (`KONTROLE.md`) |
| history | `historia.js` | core, db | dziennik zmian pól, tekstów, decyzji, słowników; cofanie |
| search | `szukaj.js` | core, identity | wyszukiwanie z wariantami, wildcard, przedziały |
| import/export | `import.js`, `eksport.js`, `ged.js` | wszystkie powyżej | CSV, JSON, GED; walidacja i wersjonowanie |
| ui | `powloka.js`, `ui_akt.js`, `ui_osoba.js`, `ui_kontrole.js`, `ui_spisy.js`, CSS | wszystkie | zakładki, listy, karty; jedyne miejsce z `innerHTML` |

Kierunek zależności jest jeden: `core ← db ← sources ← acts`, `core ← identity ← relations ← audit`, `ui` na końcu. Moduł niższy nie woła wyższego.

## 2. Interfejsy

### core
- `tekst.js` (jest): `fold(s)`, `esc(s)`, `lev(a,b[,max])`, `csvCell(v)`. Dojdzie `parseCsv(txt)` (dziś w szablonie v3 i osobno w małżeństwach, edytorze).
- `plik.js` (jest): `dl(nazwa, tekst[, typ, bom])`.
- `norm.js` (jest w `moduly/`): `normBrak(v)`, `normCzysc(v)`, `kluczNazwiska(s) → {k1,k2}`, `porNazwiska(a,b[,klasy])`, `kluczImienia(s)`, `porImiona(a,b)`, `przedzialUr(rok, wiek) → [min,max]`, `kluczMiejsca(s)`, `porMiejsca(a,b)`. Dojdą porty z Pythona: `nazwiskoMeskie(s, plec)`, `imiePolskie(s)`, `rodziceZDopelniacza(s)`, `wiekNorm(s)`, `znaczniki(akt)`.
- `daty.js`: `dzien(s)`, `jdnG/jdnJ`, `julToGreg`, `gregToJul`, `dwParse`, `isoOf`, `normDate`, `normTime`, `dateShort`.
- `typy_aktow.js`: `TYPY[typ] = {zestawy:{nazwa:[pola]}, zestawDla(akt), role:[{rola, mapa}], etykiety}`; jedno miejsce zamiast `ORDF/LATF/CAUSEF` w łatkach buildera i kopii szablonu dla małżeństw.

### db
- `db.js` (jest): `dbGet(klucz, domyslna)`, `dbPut(klucz, wartosc)`, `DB_TRYB` (`idb` / `pamiec`). Dojdą magazyny: `stan` (pola i teksty per akt), `decyzje`, `historia`, `skany` (pliki dodane przez użytkownika), `kopie` (ostatnie 5 migawek).
- `kopie.js`: `kopiaPelna() → JSON`, `kopiaWczytaj(obj) → {ok, bledy, roznice}`, `kopiaPrzypomnij()`, `migrujStaryStan(klucz) → raport`.

### sources
- `zrodla.js`: `zrodlo(id)`, `skan(id)`, `skanPoNazwie(nazwa) → [skany]` (lista, bo nazwy się powtarzają), `skanUrl(id)`.
- `skan.js`: `skanPokaz(el, skanId, roi)`, `skanRoiEdytuj()`, `skanFokusPola(akt, pole)`, `skanPasmo(akt, klucz)`; transformacje (obrót, prostowanie) osobno od ROI.

### acts
- `akt.js`: `aktPole(akt, f) → Pole`, `aktUstaw(akt, f, wartosc, by[, extra])`, `aktZatwierdz(akt)`, `aktPostep(akt)`, `aktBraki(akt)`, `aktRoznice(akt, f)`, `aktDotyczy(akt, f)`.
- `tekst_aktu.js`: `tekstAktu(akt)`, `tekstUstaw`, `tekstPodpowiedzi`, `tekstPytania` (`[?]`), `tekstSwiadkowie`.

### identity
- `wystapienia.js` (jest): `wystProfile(D) → {idWyst: profil}`, `wystEtykieta(p)`.
- `identity.js` (jest): `porownajProfile(a, b[, opt]) → {zgodnosci, rozbieznosci, sprzecznosci, braki, wniosek, rdzen}`, `idIndeks(profile[, klasy])`, `idKandydaci(p, indeks[, opt])`, `idZdanie(u)`, `idPorzadek(x, y)`.
- `decyzje.js` (jest): `decNowa(L, d)`, `decAktywne(L)`, `decKlastry(L) → {osoby, czyja, odrzucone, odlozone}`, `decKolizje(L, a, b)`, `decWaliduj(obj, znane)`, `decCsv(L)`.

### relations
- `relacje.js`: `relacjeZAktu(akt) → [Relacja]`, `relacjeOsoby(osoba, klastry)`, `relacjaStatus(rel)`.
- `rodzina.js`: `rodzinyZChrztow()`, `rodzinaOsoby(id) → {rodzice, malzonkowie, dzieci, rodzenstwo}`, `osCzasu(osoba)`, `pomosty()`.

### audit
- `raport.js` (jest): `raportSpojnosci(wiersze[, opt])`, `wiekLat(t)`, `raportCsv(items)`.
- `chronologia.js`: `chronoOsoby(osoba) → [sygnal]`, `chronoRodziny(rodzina) → [sygnal]`.
- `kontrole.js`: `kontrole(zakres) → [{id, poziom, kod, opis, akty, osoby}]`, `kontrolaIgnoruj(id, powod)`.

### history
- `historia.js` (jest): `histSnap`, `histDiff`, `histApply`, `histCsv`. Rozszerzenie: rodzaje `k='dec'` (decyzja), `k='sl'` (słownik), `k='rel'` (relacja); format wpisu bez zmian.

### search
- `szukaj.js`: `szukaj(zapytanie, opcje) → [trafienie]`; zapytanie: tekst z `*`, przedział lat, rola, typ aktu, miejscowość, „ma skan”, „niepewne”. Trafienie wskazuje akt i pole.

### import/export
- `import.js`: `importCsvZatwierdzen(txt, tryb)`, `importCsvOdczytu(txt)`, `importKopii(obj)`, `importWaliduj(obj, schemat) → {ok, bledy}`.
- `eksport.js`: `eksportCsv(typ)`, `eksportModel()`, `eksportDecyzje()`, `eksportHistoria()`, `eksportRoi()`.
- `ged.js`: `gedZOsob(klastry, opcje)`; tylko zatwierdzone osoby, źródła jako `SOUR`/`PAGE`, przyczyna zgonu w `CAUS`.

## 3. Skąd przenoszą się istniejące funkcje

| Dziś | Funkcje | → moduł |
|---|---|---|
| `wspolne/tekst.js`, `plik.js` | fold, esc, lev, csvCell, dl | core (bez zmian) |
| `weryfikacja_szablon_v3.html` (kopie wklejone na stałe) | fold, esc, lev, csvCell, dl, wiekLat, dzien, raportSpojnosci, hist*, modelZZgonu | usunąć kopie, wstawiać znacznikami |
| v3 | parseCsv, rows, csvText, import `fVer`/`fAi`/`fLoad`, eksporty `mCsv`, `mLog`, `mRoi`, `mRej`, `mModel`, `mRel`, `mFix` | import/export |
| v3 | getv, commit, setf, st, diffState, hasDiff, isUnc, aiWarn, progOf, missingAudit, lubMissing, lubGuard, autoResolve, doAll, doDone, clearUnc, noQ, isMk, normMk, stripQ | acts (`akt.js`) |
| v3 | txtOf, setTxt, assignTok, hlHtml, qList, qClean, qNext, textSugs, witParts, syncWitnesses, applyWitText, fixAllTexts, stemOf, lenient, sameStem | acts (`tekst_aktu.js`) |
| v3 | wiz* (kreator pól), renderAct, renderList, renderTabs, inScope, visible, step, nextTodo, chipsFor, tagsFor, catHtml, toast, menu | ui |
| v3 | appl, isChild, minor, isSingle, warnsOf, repRows, repAll, repMarks, renderRep, dateBad | audit (reguły) + ui (widok) |
| v3 | jdnG, jdnJ, julToGreg, gregToJul, dwParse, dwBase, dwLabel, dwHtml, dwApply, dim, isoOf, normDate, normTime, dateShort | core (`daty.js`) + ui (widżet) |
| v3 | scanUrls, allScans, scanOf, roiOf, drawRoi, focusField, approxFocus, fit, zoom, showScan, idb, loadExtra, `mScan`, `mBase` | sources |
| v3 | histCommit, histShow, histLabel, renderHist, undoToast | history + ui |
| v3 | save, lsPut, saveBanner, autoPick, autoQueue, markSaved, DIRTY | db |
| v3 | relIndex, relFor, relHtml, relCsv, famKey, lastTok | relations |
| v3 | spellScan, spellApply, renderSpell, near, countOf, learnFix, `D.fix`, `D.counts` | core (słowniki) + search |
| v3 | modelAll, modelZZgonu, mAttr | identity (`wystapienia.js` zastępuje; eksport modelu v1 zostaje jako format zgodności) |
| `buduj_baza_v4.py` | MALE, addm, male_surname, FSUF, NPL, polname, polname_ai, GEN, PGEN, parents, parents_pl, psur, is_child, fill_markers, normalizacja wieku | core (`norm.js`), wspólne dla buildera i aplikacji |
| `buduj_baza_v4.py` | łatki `sub()` (ukrywanie `[_]`/`[-]`, nawigacja stulecie/dekada/rok, LATF/CAUSEF, `latName`) | na stałe do `akt.js`, `typy_aktow.js`, ui |
| `buduj_baza_v4.py` | take, lmscan, rd, nakładka odczytów | skrypt `zbuduj_dane.py` (generuje `dane.json`) |
| `dopasowanie/szablon.html` | snm, fnm, sim, sSn, sFn, sYear, sInc | core (`norm.js`; `kluczNazwiska` zawiera reguły `snm`) |
| dopasowanie | grade, bad, candBirth, candDeath, candKids, candMar, candOwnMar, candKidsOf, candSib | identity: scenariusze zostają jako generatory kandydatów, `grade` (procent) zastępuje uzasadnienie |
| dopasowanie | cleanDecision, validateDecisions, dset, usedElsewhere (`dop.v1`) | identity (`decyzje.js`): `acc` → `scal`, `rej` → `odrzuc`, `none` → `brak` |
| dopasowanie | timeline, factsHtml, buildBirthFamilies, renderFamilies, bridge*, pi* (indeks osób), networkEdges, renderNetwork | relations + ui |
| dopasowanie | treeLoad, gedParse, gedText, tb*, fm* (rodziny z drzewa, dzieci do dopisania, duble), fmGed, `dop.tree.v1` | import/export (`ged.js`) + relations; drzewo użytkownika zostaje tylko lokalnie |
| dopasowanie | repRowsD, renderRepD | audit |
| dopasowanie `build.py` | B, D, M, G (gospodarze z tabel likwidacyjnych) | `zbuduj_dane.py` |
| `weryfikacja_malzenstw_szablon.html` | commit, status, warns, chipsFor, near, learn, dw*, genRow, blockHtml, renderForm, fitRoi, drawOv, showScan, rows, parseCsv, importCsv (`wm1`) | acts + `typy_aktow.js` (typ `malzenstwo`); duplikaty do wspólnych |
| `SPISY_BLINOW_weryfikacja_mini.html` | `D.spisy`, `D.akty`, n, chips, show | `zbuduj_dane.py` (typ `spis`) + ui (`ui_spisy.js`: nazwisko przez lata) |
| `edytor_korekt_szablon.html` | nameType, genderOf, stem, translit, buildGroups, groupCanon, dictFind, formOf | core (słowniki, klasy wariantów → decyzje `wariant_*`) |
| edytor | logChange, saveRec, restoreRec | history |
| edytor | exportKorekty, exportWersje, exportFormy, exportSlownik, importKorekty | import/export |
| edytor | sk* (wycinki skanu, obrót, punkty), kr* (korekty) | sources + ui |
| `v6/index.html` | ROI, prostowanie, filtry czytelności, tabela z wirtualizacją | zostaje osobnym panelem; wspólne są tylko `dane.json`, `typy_aktow.js` i id skanów |
| `v6/templates-config.js` | chrzest, birth, marriage, death | `typy_aktow.js` czyta ten plik; mapowanie w `MODEL_DANYCH.md` §10 |

## 4. Czego nie wolno zgubić (lista kontrolna do porównania przed/po)
Tryby tekstu i `[?]`; kreator pól; zatwierdzanie grupy na górze i na dole; picker jednostki wieku; kalendarz i stary styl; ukrywanie pól `[_]`/`[-]`; licznik braków; nawigacja stulecie → dekada → rok; „Tylko ze skanem”; filtr „Rejestr + protokoły”; słownik poprawek; autozapis do pliku; import CSV w trybie „dopisz” i „zastąp”; eksport ROI; raport spójności z ignorowaniem; hipotezy powiązań rodzinnych; w dopasowaniu: oś czasu, rodziny, pomosty, indeks osób, drzewo z GED, „dzieci do dopisania”, „duble”; w edytorze: wycinki skanu i formy imion; w spisach: nazwisko przez lata.
