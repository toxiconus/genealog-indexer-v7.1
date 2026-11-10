# wspolne – moduły wspólne narzędzi HTML

Narzędzia (`haiku/weryfikacja_szablon.html`, `dopasowanie/szablon.html`, `narzedzia/edytor_korekt_szablon.html`) pozostają
**pojedynczymi plikami HTML działającymi offline**. Wspólny kod leży tu, a skrypty `build*.py` wklejają go do wyniku
w miejsce znacznika `/*MODULE:nazwa*/` (patrz `zbuduj.py`). Nie edytuj kodu wspólnego w wygenerowanych plikach.

| moduł | zawartość |
|---|---|
| `tekst.js` | `fold`, `esc`, `lev(a,b[,max])`, `csvCell` |
| `plik.js` | `dl(nazwa, tekst[, typ, bom])` – pobieranie pliku (BOM UTF-8 oprócz `.ged`) |
| `raport.js` | `raportSpojnosci(wiersze[, opcje])`, `wiekLat`, `raportCsv` – raport spójności aktów zgonu |
| `historia.js` | `histSnap`, `histDiff`, `histApply`, `histCsv` – wspólna historia zmian z cofaniem |
| `model.js` | `modelZZgonu` + `MODEL_STATUS` – wspólny model: osoba, zdarzenie, źródło, relacja (status dowodowy) |

Planowane: `skan.js` (przybliżanie i zaznaczenia), `szukaj.js`, `wykresy.js`, `rodzina.js` – szczegóły w `../PLAN_ROZWOJU_GENEALOGA.md`.
Zasada: po każdej zmianie modułu przebudować wszystkie narzędzia i porównać wyniki z poprzednią wersją.

## Dane wspólne
- `slowniki_imion.json` – słowniki `GEN` (łacińskie dopełniacze), `PGEN` (polskie dopełniacze), `NPL` (łacina/dawna pisownia → dzisiejsze polskie imię). Źródło prawdy dla `narzedzia/buduj_baza_v4.py` (wczytuje je przy budowie; wynik budowy bez zmian). Docelowo czytane też przez moduł JS `norm.js` (prototyp w `PROJEKT_multitool/moduly/norm.js` ma własną, krótszą mapę imion do porównań – do zastąpienia tym plikiem).
