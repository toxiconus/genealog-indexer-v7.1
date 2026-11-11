# Multitool – powłoka v2 (2026-11-11)

Stan po przebudowie interfejsu. Budowa: `python3 app/zbuduj_app.py`. Test: `node test/test_krok7_powloka.cjs [katalog_zrzutów]` (17 kontroli) oraz testy kroków 3–6.

## Zakładki
| Zakładka | Moduł | Co robi |
|---|---|---|
| Akty | `ui_akt.js`, `ui_powloka.js`, `ui_skan.js`, `ui_narzedzia.js` | lista (lewa, chowana strzałką ◀ / Alt+L), skan (środek), pola w grupach (prawa), pasek akcji na dole karty |
| Osoby | `ui_osoby.js`, `osoby_rdzen.js` | propozycje scaleń, decyzje, warianty nazwisk (bez zmian) |
| Drzewo | `ui_drzewo.js`, `rodziny_rdzen.js` | osoby i pary rodziców z aktów; przodkowie/potomkowie potwierdzeni; „możliwe…” jako podpowiedzi |
| Raport | `ui_raport.js`, `rodziny_rdzen.js` | stan pracy, spójność zgonów, lista do sprawdzenia na skanie (CSV), wiek i daty, numeracja i duble |
| Narzędzia | `ui_nawigacja.js` | wszystkie funkcje menu jako kafle, motyw, skróty, adresy skanów (CSV), historia (CSV) |

## Zasady, których pilnuje kod
- Potwierdzone jest tylko to, co wynika z jednego aktu albo z decyzji „scal”. Zestawienia wg imion rodziców i propozycje silnika są zawsze opisane jako „możliwe / do sprawdzenia”.
- Akt bez adresu skanu: program pokazuje strony z folderu roku (lub zakresu lat) do przejrzenia; przypisanie następuje wyłącznie po kliknięciu „Przypisz” (`S.acts[id].scan`).
- Nowy akt (`nowe_akty.js`): pusty rekord typ + rok + numer; pola wpisuje użytkownik. Lista w `S.nowe` → magazyn `slowniki/noweAkty` → kopia pełna.
- Kolory tylko z tokenów (`--bg`, `--card`, `--ink`, `--line`, `--acc`, `--accink`, `--note-*`, `--toast-*`, `--skan-bg`); motyw auto/jasny/ciemny przez `data-theme` na `<html>` (pamiętany w `localStorage` jako `mt.motyw`).
- Okno skanu ma `z-index` niższy niż nagłówek i okna dialogowe (wcześniej zasłaniało dialog importu – testy kroków 3 i 4 nie przechodziły).

## Skróty
Enter (następne pole), Alt+J / Alt+K (następny / poprzedni akt), Ctrl+Enter (następny), Alt+Enter (zatwierdź), Ctrl+Shift+Enter (zatwierdź i następny niezatwierdzony), Alt+R (sporne pole), Alt+Z / Alt+Y (cofnij / ponów), Alt+L (lista), Alt+S (skan), Alt+1…5 (zakładki), Esc. Działa lewy Alt; prawy Alt zostaje dla polskich znaków.

## Do zrobienia
- Tabela stron dla LM 1797–1825 i USC 1847–1872 (adresy skanów): do wypełnienia ręcznie przez „Przypisz”, potem eksport „Adresy skanów (CSV)” i wczytanie do danych w repo (brak jeszcze skryptu wczytującego ten CSV do `dane_zgony.json`).
- Cofanie obejmuje pola, tekst i zatwierdzenie aktu z bieżącej sesji; nie obejmuje przypisania skanu, ROI ani dodania/usunięcia aktu.
- Drzewo: brak eksportu GED (krok 11 planu) i brak rysunku wielu pokoleń bez decyzji „scal” – drzewo wydłuża się dopiero po scaleniu wystąpień w zakładce Osoby.
- Raport „Wiek i daty” dla osób scalonych jest pusty, dopóki nie ma decyzji „scal”.
- Ocena próbki 50 par (`test/PROBKA_50_par_do_oceny.csv`) nadal czeka na użytkownika.
