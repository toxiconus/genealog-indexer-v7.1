# Multitool – powłoka v2 (2026-11-11)

Stan po przebudowie interfejsu. Budowa: `python3 app/zbuduj_app.py`. Test: `node test/test_krok7_powloka.cjs [katalog_zrzutów]` (28 kontroli) oraz testy kroków 3–6.

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

## Praca genealoga (dodane 2026-11-11, druga tura)
- **Karta aktu → „W innych aktach”** (`ui_powiazania.js`): dla każdej osoby z aktu akty połączone decyzją (z kontrolą wieku i dat) oraz propozycje silnika; przyciski „ta sama osoba” / „różne osoby” zapisują decyzję w dzienniku. Pola aktu nie są uzupełniane z innych aktów.
- **Imiona rodziców w dopełniaczu** (`rodziny_rdzen.js: imieMianownik`): podpowiedź „mianownik: …” pod polem i widok w Raporcie z poprawką zbiorczą (migawka, jedna grupa cofania). Reguła: zapis nie jest znanym imieniem, a forma bez końcówki jest imieniem znanym ze słownika bazy (≥ 3 wystąpienia).
- **Roczniki** (Raport): tabela lat z postępem; klik otwiera akty rocznika.
- **Szukajka w nagłówku** (Alt+F): osoby we wszystkich aktach, także rodzice i małżonkowie → zakładka Drzewo.
- **Wklejka z Lubgens** (`import_indeks.js`, Narzędzia → Import): tekst strony wyników → akty z indeksu, także innych parafii (`a.parafia`, `a.zIndeksu`), wartości jako „indeks” (src `lub`), niezatwierdzone. Z uwag brane są tylko jawne „O:”, „M:” i miejscowość na początku; nazwisko ojca nie jest dopisywane. Akty już obecne są pomijane (klucz: typ + rok + nazwisko i imię + parafia). Filtr „Parafia” na liście aktów.
- **Wpisywanie**: listy podpowiedzi imion / nazwisk / miejscowości z bazy, Ctrl+D = wartość z poprzedniego aktu, w oknie nowego aktu informacja „w bazie do nr N”.

## Indeksowanie parafii i budowa drzewa (dodane 2026-11-11, trzecia tura)
- **Osoby → Kolejka łączenia** (`ui_kolejka.js`): mocne propozycje para po parze, klawisze T / R / O / strzałki. „Pewne” = brak rozbieżności, brak drugiego kandydata, zgodni oboje rodzice, nazwisko rodowe matki i rok urodzenia; nigdy para chrzest+chrzest ani zgon+zgon. Scalenie zbiorcze pewnych: migawka, powód w decyzji.
- **Osoby → Rodziny: rodzice ↔ ślub** (`rodziny_rdzen.js: rdzPropozycjeSlubow`): rodzice z aktów dzieci łączeni z własnym aktem ślubu. To ten krok wydłuża drzewo (akt ślubu podaje rodziców młodych). „Jednoznaczne” = jeden pasujący ślub, nazwisko panny = nazwisko rodowe matki, dzieci od roku przed ślubem do 32 lat po.
- **Skan → indeksowanie strony** (`ui_skan.js`): „Przypisz zakresowi” (strona dla aktów nr od–do) i „＋ Nowy akt na tej stronie” (następny numer, skan, kursor w pierwszym polu).
- **Raport → Stan pracy**: kolumna „akty z osobą połączoną w drzewie”.
- **Zgon ↔ ślub po współmałżonku** (`rdzPropozycjeZgonSlub`), **Wywód przodków (TXT)** w karcie osoby w Drzewie, **Plan pracy: od skanów do drzewa** na górze Raportu (8 kroków z licznikami).
- **Odczyt starych skanów** (`ui_skan.js`, sekcja „Obraz: obrót i filtry”): obrót co 90° i prostowanie ±10° (pamiętane dla pliku), filtry: szarość, mocny kontrast, kanał niebieski (wyblakły brązowy atrament), kanał czerwony (plamy), negatyw, próg; kontrast, jasność, wyostrzenie (pamiętane w `S.skObraz`). Wskaźnik jest „odkręcany” (`skanOdkrec`), więc ROI i ramki pól działają na obróconym obrazie.
- **Słowniczek** (`ui_slowniczek.js`): łacina, rosyjski, dawne zawody, choroby, podwójne daty – panel boczny, nie blokuje skrótów.
- Dane: imiona rodziców z dopełniacza na mianownik w `buduj_baza_v4.py` (469 poprawek, `narzedzia/POPRAWKI_imiona_dopelniacz.csv`).

## Do zrobienia
- Tabela stron dla LM 1797–1825 i USC 1847–1872 (adresy skanów): do wypełnienia ręcznie przez „Przypisz”, potem eksport „Adresy skanów (CSV)” i wczytanie do danych w repo (brak jeszcze skryptu wczytującego ten CSV do `dane_zgony.json`).
- Cofanie obejmuje pola, tekst i zatwierdzenie aktu z bieżącej sesji; nie obejmuje przypisania skanu, ROI ani dodania/usunięcia aktu.
- Drzewo: brak eksportu GED (krok 11 planu) i brak rysunku wielu pokoleń bez decyzji „scal” – drzewo wydłuża się dopiero po scaleniu wystąpień w zakładce Osoby.
- Raport „Wiek i daty” dla osób scalonych jest pusty, dopóki nie ma decyzji „scal”.
- Ocena próbki 50 par (`test/PROBKA_50_par_do_oceny.csv`) nadal czeka na użytkownika.

## Skan → akty (pojedynczy skan, ustawienia folderu)
- Narzędzia → Skany → „Skan → akty (pojedynczy skan)…” albo przycisk „Skan → akty…” w oknie skanu (bieżąca strona).
- Folder skanu = nazwa folderu albo wspólny początek nazw plików (`urodzenia_1890-1897_0150.jpg` → `urodzenia_1890-1897`). Dla folderu zapamiętują się: typ aktu (format pól), rok, ile aktów zwykle jest na skanie, numer pierwszego skanu z aktami (wcześniejsze to okładka/karta filmu), ostatni obsłużony skan i numer aktu (stąd domyślny numer pierwszego aktu na następnym skanie). Zapis: `S.skProf` (IndexedDB, kopia pełna).
- Plan skanu: brak aktu w bazie → dopisze nowy (pusty, ze skanem); akt bez skanu → dobierze skan; akt z innym skanem → bez zmian, chyba że zaznaczono „zastąp skan”. Skan bez aktów (okładka) – „Ten skan bez aktów, następny”.
- Suma kontrolna (SHA-256, 16 znaków) zapisuje się przy aktach (`scanH`; IndexedDB i kopia pełna). Skan o zmienionej nazwie rozpozna się po zawartości po wybraniu folderu (indeks sum liczony w tle). Zmieni ją dopiero ponowny zapis obrazu (przeskalowanie, kompresja).
- Test: `test/test_krok8_skan_akty.cjs` (10 kontroli).
- Nazwa skanu w danych bywa bez rozszerzenia („M1944_01”), a plik ma rozszerzenie – porównanie nazw pomija rozszerzenie (`skanStem`).
- Okno otwarte z karty aktu dotyczy oglądanego aktu (typ, rok, numer). Skan z bazy, którego nie ma w wczytanych plikach, jest domyślnie zastępowany wczytanym (pole „zastąp skan” zaznaczone, można odznaczyć; przypisanie cofa „Zmień / usuń przypisanie”). Test: 12 kontroli.
- Pliki z samych cyfr („001.jpg”) nie mówią nic o folderze (przeglądarka nie podaje ścieżki): okno ma pole „Nazwa folderu / zbioru”, z którego odgaduje typ i rok (np. „Małżeństwa 1944-1945 USC Szastarka”); wspólny zbiór `S.skProfNum`. Plan pokazuje typ, rok, numer i nazwę aktu z bazy, a po zastosowaniu otwiera akt o numerze pierwszego aktu na skanie. Test: 13 kontroli.

## Sumy kontrolne skanów w danych i pełne ścieżki (małżeństwa 1944–45)
- `app/skany_zbiory.json` opisuje zbiór skanów (folder, klucz skanu → plik, suma SHA-256 [16 znaków] każdego pliku, skany bez aktów: okładka, protokół, odpisy). Builder danych wpisuje do `scanFiles` pełną ścieżkę względną (`Małżeństwa/1944-1945 USC Szastarka/001.jpg`), a do `scanHash` sumy – aplikacja scala je do `D.scanHash`.
- Plik o tej samej nazwie w innym folderze (`001.jpg` jest w wielu) rozstrzyga suma kontrolna; sumy liczą się tylko dla plików o pasującej nazwie albo – przy ≤ 300 wczytanych plikach – dla wszystkich (zmieniona nazwa).
- Odczyt AI małżeństw 1945 akty 13–22: `haiku/MALZENSTWA_1945_cz2_ai1_import.csv` + `_roi.json` (kolejne części roku buduje ten sam builder; skany 010, 012, 016, 017, 018; 011/013/014/015 to odpisy i korekty). Odczyt wstępny, wiele pól oznaczonych jako niepewne.

## Multitool mini (telefon): trzy pliki z całą bazą
- `app/multitool_mini_zgony.html` (ok. 0,9 MB), `_malzenstwa.html` (0,5 MB), `_urodzenia.html` (1,4 MB): jeden plik, offline, z wbudowaną całą bazą danego typu (zgony 2842, małżeństwa 745, urodzenia 5456; bez aktów obcych parafii; przy powtórzonym roku i numerze zostaje pierwszy akt) wraz z odczytami AI (881 zgonów, 25 małżeństw 1944–45) i podglądem odczytów Haiku urodzeń 1896–97 (77). Budowa: `node app/mini/zbuduj_pola.cjs`, `node app/mini/zbuduj_dane_mini.cjs` (wymagają zbudowanego `multitool_v1.html`), potem `python3 app/mini/zbuduj_mini.py`.
- Zakładka „Baza”: szukanie (nazwisko, imię, miejscowość, `1890/12`), filtr roku, lista z oznaczeniem „odczyt AI / zmieniony / nowy”, edycja akt po akcie (pola w grupach jak w Multitoolu, `[_]` `[-]` `?`), nowy akt (numer podpowiada się sam). Zakładka „Skany”: „＋ Zdjęcia” (wiele naraz), podgląd, „＋ Akt na skanie”; skan można też przypisać z karty aktu („Skan…”).
- Suma kontrolna = pierwsze 16 znaków SHA-256 zawartości pliku (jak `skpHash`) + rozmiar; plik zdjęcia nie jest zmieniany. Zmiany i zdjęcia zapisują się w IndexedDB telefonu (osobna baza dla każdego z trzech plików).
- „⋮” → Eksport paczki (`multitool-mini` wersja 2): tylko zmienione pola (z wartością z bazy `b`), akty ze skanem, sumy skanów, bez obrazów.
- Multitool: Narzędzia → „Paczka z telefonu (mini)…” (`import_mini.js`, `ui_import_mini.js`): podgląd; nowy akt dopisany; w istniejącym wypełnia puste pola i zmienia te poprawione na telefonie, jeśli w Multitoolu nikt ich w międzyczasie nie zmienił (`cur == b`), pozostałe różnice zostają bez zmian i są policzone; wartości z telefonu to odczyt do sprawdzenia (ok: false); migawka przed importem. Potem „Wskaż folder i znajdź pliki”: filtr po rozmiarze (`scanSz`), potem suma; ścieżka z dysku (ostatnie 3 segmenty) trafia do aktu. Test: `test/test_krok9_mini.cjs`.
- Przeglądarka skanu w mini (`przegladarka` w `szablon_mini.html`): skan jest przypięty u góry (pod paskiem zakładek), pola przewijają się pod nim – skan i dane widać jednocześnie. Przeciąganie, szczypanie i podwójne stuknięcie, przyciski „Akt” (obcięcie do obszaru aktu z ROI odczytu AI), „Całość”, „+”, „−”, „⇕” (wysokość podglądu 30/40/60% ekranu, zapamiętywana). Test: `test/test_krok9b_podglad.cjs [obraz] [zrzut]`.
- Z przeglądu zewnętrznych narzędzi (GenScriber, Transcript, Ancestris) wzięte do mini: filtr obrazu „☀” (normalny / jasny z mocnym kontrastem / szary z kontrastem / negatyw – do wyblakłych skanów, zapamiętywany), układ skan z lewej i formularz z prawej na szerokim ekranie (tablet, komputer), przyciski ◂ ▸ do poprzedniego i następnego aktu bez wracania do listy. Świadomie nie brane: edytor szablonów pól (pola są z konfiguracji Multitoola), eksport GEDCOM z mini (robi go Multitool po zatwierdzeniu), transkrypcja całego tekstu aktu w mini (do rozważenia: edytowalne „Tekst aktu” z importem do Multitoola).
