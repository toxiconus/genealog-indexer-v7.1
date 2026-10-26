# wspolne – moduły wspólne narzędzi HTML

Narzędzia (`haiku/weryfikacja_szablon.html`, `dopasowanie/szablon.html`, `narzedzia/edytor_korekt_szablon.html`) pozostają
**pojedynczymi plikami HTML działającymi offline**. Wspólny kod leży tu, a skrypty `build*.py` wklejają go do wyniku
w miejsce znacznika `/*MODULE:nazwa*/` (patrz `zbuduj.py`). Nie edytuj kodu wspólnego w wygenerowanych plikach.

| moduł | zawartość |
|---|---|
| `tekst.js` | `fold`, `esc`, `lev(a,b[,max])`, `csvCell` |
| `plik.js` | `dl(nazwa, tekst[, typ, bom])` – pobieranie pliku (BOM UTF-8 oprócz `.ged`) |

Planowane: `skan.js` (przybliżanie i zaznaczenia), `raport.js` (raport spójności), `szukaj.js`, `wykresy.js`, `rodzina.js`.
Zasada: po każdej zmianie modułu przebudować wszystkie narzędzia i porównać wyniki z poprzednią wersją.
