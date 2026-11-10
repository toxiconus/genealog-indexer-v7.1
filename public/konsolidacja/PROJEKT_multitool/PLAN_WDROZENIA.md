# Multitool – plan wdrożenia

Zasady każdego kroku: (1) najpierw kopia stanu użytkownika, (2) stare narzędzia działają dalej, dopóki nowe nie przejdzie porównania, (3) krok kończy się działającym plikiem HTML, testem Playwright (telefon 420 px i desktop), commitem i pushem, (4) nic nie jest usuwane z repo przed decyzją użytkownika.

Punkt wyjścia: w tym folderze jest działający rdzeń (`prototyp/`, `moduly/`, `test/`), więc kroki 2–6 rozszerzają istniejący kod.

## 1. Kroki

| Nr | Co powstaje | Kryterium odbioru |
|---|---|---|
| 0 | **Zabezpieczenie.** W każdym obecnym narzędziu: kopia JSON i eksport CSV zrobione przez użytkownika i odłożone do `haiku/ZATWIERDZENIA/` (zgony: „Wszystko w jednym pliku”, „Eksport CSV”; małżeństwa, dopasowanie, edytor: ich eksporty). Zamrożenie `D.key='bazazgonow3'`. | Pliki kopii z datą w repo lub na dysku użytkownika; spis kluczy i liczba zatwierdzonych aktów w każdym. |
| 1 | **`norm.js` wspólny dla buildera i aplikacji.** Port z Pythona: `MALE`/`male_surname`, `NPL`/`polname`, `GEN`/`PGEN`/`parents`, wiek, znaczniki. Test parytetu: te same wejścia → te same wyjścia co `buduj_baza_v4.py`. | Skrypt porównuje wynik JS i Pythona na wszystkich wierszach `lm/*.csv`: 0 różnic albo lista różnic zaakceptowana przez użytkownika. Baza zgonów zbudowana jak dotąd, bajt w bajt poza wstawionym modułem. |
| 2 | **`zbuduj_dane.py` → pełny `dane.json`** (zgony z nakładkami, chrzty, małżeństwa) w formacie z `MODEL_DANYCH.md`, z tabelą skanów (sha256) i `id_dawne`. Budowa obecnych narzędzi bez zmian. | Liczby aktów zgodne ze źródłami (zgony 2624 z indeksu + akty z odczytów i ASC jak w bazie zgonów, chrzty 5488 z `blinow_akty.csv` z wariantami z `blinow_scalone.csv` jako `alt`, małżeństwa 721); każdy akt bazy zgonów ma odpowiednik po `id_dawne`; walidator schematu: 0 błędów; raport kolizji nazw skanów. |
| 3 | **Powłoka + moduł „Akt” dla zgonów.** Silnik v3 czyta `dane.json` (adapter Pole ↔ `a.ai/a.lub/S.f`), moduły wstawiane znacznikami (koniec kopii wklejonych na stałe), łatki `sub()` buildera przeniesione do kodu. Stan w IndexedDB (pkt 2). | Porównanie przed/po na 30 aktach z trzech epok: te same pola, wartości, ostrzeżenia, eksport CSV identyczny co do bajta dla tego samego stanu. Lista kontrolna z `MODULY.md` §4 odhaczona. Import `ZGONY_zweryfikowane_10.csv`: 881 aktów, 8 ze statusem `ok`. |
| 4 | **Migracja stanu** ze starych kluczy (pkt 3). | Po migracji liczba pól `ok`, aktów „gotowe”, wpisów historii i tekstów równa liczbie sprzed migracji; raport migracji zapisany; stare klucze nietknięte. |
| 5 | **Typy `malzenstwo` i `chrzest`** jako konfiguracja w `typy_aktow.js` (zestawy pól, role, kolejność), bez kopii silnika. Weryfikator małżeństw 1944–45 przechodzi na wspólny silnik. | Akty 1944–45: te same pola i eksport co w starym weryfikatorze; chrzty i małżeństwa z indeksów widoczne i edytowalne; `chrzest`/`birth` zmapowane, żaden szablon nie usunięty. |
| 6 | **Zakładka „Osoby”** z prototypu na pełnych danych: propozycje z uzasadnieniem, decyzje, cofanie, klasy wariantów nazwisk, liczenie w tle (Web Worker), import decyzji z dopasowania (`dop.v1`: `acc` → `scal`, `rej` → `odrzuc`, `none` → `brak`). | Na próbce 50 par ocenionych przez użytkownika: żadna para uznana za tę samą osobę nie ma wniosku „konflikt” bez wyjaśnienia; scalenie i cofnięcie nie zmienia liczby aktów, wystąpień, źródeł; odrzucona para nie wraca. |
| 7 | **Kontrole w trzech poziomach** (`KONTROLE.md`): akt (przeniesione z `raport.js`), osoba, rodzina; kolejka „Pytania do rozwiązania”. | Każdy sygnał wskazuje akty i pola; test na przypadkach wzorcowych (po jednym na kod); ignorowanie cofalne. |
| 8 | **Rodziny i oś czasu** (z dopasowania: `buildBirthFamilies`, `bridgeBuild`, `timeline`), mini-drzewo przy akcie, pasek tożsamości. | Dla rodziny wzorcowej (np. jedno nazwisko przez cały zasób) widok zgodny z dopasowaniem; każda kreska ma źródło i status. |
| 9 | **Spisy i inwentarze** jako typ aktu; widok „nazwisko przez lata” ze `SPISY_BLINOW_weryfikacja_mini.html`. | Te same wiersze i grupowanie co w mini; osadnik jest wystąpieniem i pojawia się w propozycjach jako wskazówka. |
| 10 | **Wyszukiwarka** (`szukaj.js`) na wspólnych kluczach: warianty, `*`, przedziały lat i wieku, rola, „ma skan”. | Zapytania wzorcowe (np. `Pcion*`, kobiety zmarłe 1850–1860 z mężem Janem) zwracają te same akty co ręczne filtrowanie CSV. |
| 11 | **Eksport GED** z zatwierdzonych osób, ze źródłami i przyczyną zgonu; notatki zwięzłe; hipotezy poza GED. | Plik przechodzi wczytanie w dopasowaniu (`gedParse`); liczba osób = liczba klastrów + wybrane wystąpienia pojedyncze; żadnej osoby z samej propozycji. |
| 12 | **Porządki**: stare pliki HTML do `archiwum/` po decyzji użytkownika; `v6` zostaje panelem indeksacji na tych samych danych. | Lista plików do archiwum zatwierdzona; nic nie usunięte z historii git. |

Kolejność 1 → 4 jest sztywna (bez niej nie ma jednego modelu). Kroki 5–10 można zamieniać; 6 daje największą wartość i ma już działający rdzeń.

## 2. Przechowywanie

### 2.1 Podział
| Co | Gdzie | Dlaczego |
|---|---|---|
| Dane archiwalne (`dane.json`, skany) | repo; w pliku HTML jako dane wbudowane | przebudowywane skryptem, publiczne |
| Stan roboczy użytkownika (pola, teksty, decyzje, historia, ustawienia, dodane skany) | IndexedDB, baza `multitool` | większy limit niż localStorage, zapis częściowy, pliki binarne |
| Kopia bezpieczeństwa | plik JSON u użytkownika (pobranie albo autozapis do wskazanego pliku, jak dziś `autoPick`) | jedyna ochrona przed wyczyszczeniem przeglądarki |
| Zatwierdzenia jako dane źródłowe | `haiku/ZATWIERDZENIA/*.csv` w repo, wczytywane przez `zbuduj_dane.py` | zatwierdzone pola wracają do danych i przestają zależeć od przeglądarki |

### 2.2 IndexedDB
- **Jedna baza `multitool`, nazwa stała.** Wersja schematu w `onupgradeneeded`; zmiana danych w repo nie zmienia nazwy bazy ani kluczy. Koniec podbijania `D.key`.
- Magazyny: `pola` (klucz `idAktu|pole`), `teksty`, `akty` (stan, robocze), `decyzje` (klucz `n`), `historia` (klucz `n`, bez limitu 4000 wpisów), `slowniki`, `skany` (pliki dodane z telefonu, klucz = sha256), `kopie` (5 ostatnich migawek), `meta`.
- Stan zapisuje się **względem danych**: pole w stanie pamięta wartość bazową, którą użytkownik widział (`baza`). Gdy po przebudowie baza się zmieni, pole trafia do kolejki „dane źródłowe się zmieniły” zamiast cicho przykrywać nową wartość albo znikać. To zastępuje dzisiejszy mechanizm „nowy klucz = czysty stan”.
- Tryb awaryjny: gdy IndexedDB jest niedostępne (tryb prywatny, blokada), aplikacja działa w pamięci i pokazuje stały czerwony pasek „stan nie jest zapisywany, zrób kopię” (tak działa prototyp).
- `navigator.storage.persist()` przy pierwszym zapisie, żeby przeglądarka nie usunęła bazy przy braku miejsca.

### 2.3 Kopie bezpieczeństwa
- **Pełna kopia = jeden JSON** `{format:{nazwa:'multitool-kopia', wersja}, dane:{wersja, suma}, zapisano, pola, teksty, decyzje, historia, slowniki, ustawienia}`. Skany dodane przez użytkownika osobno (ZIP lub pliki), bo są duże.
- Wskaźnik w nagłówku: „decyzji i zmian bez kopii: N”. Eksport CSV **nie** zeruje wskaźnika (CSV nie zawiera historii ani decyzji); zeruje go tylko pełna kopia.
- Przypomnienie: po 20 zmianach bez kopii albo po 7 dniach; przy zamykaniu karty z niezapisanymi zmianami.
- Autozapis do pliku (File System Access, Chromium): po każdej zmianie z opóźnieniem, do pliku wskazanego raz przez użytkownika; na telefonie i w Firefoksie zostaje pobieranie.
- 5 ostatnich migawek w `kopie` (przed każdym importem i przed każdą migracją) z przyciskiem „Przywróć”.

### 2.4 Import: walidacja i wersjonowanie
Każdy import (kopia, decyzje, CSV zatwierdzeń, CSV odczytu AI, GED) przechodzi te same etapy:
1. **Rozpoznanie**: `format.nazwa` i `format.wersja`; CSV po nagłówku. Nieznany format: odmowa z komunikatem. Wersja nowsza niż aplikacja: odmowa. Starsza: funkcja migrująca `v1→v2→…`.
2. **Walidacja schematu**: typy, dozwolone wartości (`status`, `typ`), długości; odwołania do istniejących aktów i wystąpień (także po `id_dawne`). Wpisy błędne są pomijane i wypisane; reszta przechodzi. Tak działa `decWaliduj` w prototypie.
3. **Podgląd różnic przed zapisem**: ile pól dojdzie, ile jest w konflikcie z polami `ok`, ile decyzji nowych. Domyślny tryb „dopisz” (nie rusza pól `ok`); „zastąp” wymaga potwierdzenia, jak dziś `mVerOvw`.
4. **Migawka** obecnego stanu do `kopie`, potem zapis w jednej transakcji.
5. **Wpis w historii** z nazwą pliku i liczbami; import można cofnąć w całości.

Wartości z importu są tekstem: nigdy nie trafiają do `innerHTML` bez `esc()` (patrz `RYZYKA.md` §4). `Object.assign(S, JSON.parse(plik))` z obecnego „Wczytaj kopię roboczą” znika.

## 3. Migracja istniejących zatwierdzeń

| Źródło | Zawartość | Dokąd |
|---|---|---|
| `haiku/ZATWIERDZENIA/ZGONY_zweryfikowane_9.csv`, `_10.csv` | 881 aktów; `verification_status=ok` w 8; `uncertain_fields`, `verification_notes`, `act_text`, `scan_path` | pola (`ok` tylko dla aktów `ok`; reszta zostaje `ai` z `by=csv`), `unc`, `note`, `akt.tekst`, skan |
| przeglądarka: `bazazgonow3` (oraz starsze `wz1`, `bazazgonow1/2`, jeśli istnieją) | `S.acts[id] = {f, done, text, qs, par, hid, scan, roi, notesOrg}`, `S.hist`, `S.rel`, `S.repIgn`, `S.fixes`, ustawienia; IndexedDB o tej samej nazwie: skany dodane ręcznie | pola, akty, teksty, historia, decyzje `relacja`, słownik poprawek, magazyn `skany` |
| przeglądarka: `wm1` | weryfikacja małżeństw 1944–45 | jak wyżej, typ `malzenstwo` |
| przeglądarka: `dop.v1`, `dop.zm`, `dop.tree.v1` | decyzje dopasowania (`acc`/`rej`/`none`), ustawienia, drzewo z GED | decyzje `scal`/`odrzuc`/`brak`; drzewo zostaje lokalnie (dane prywatne) |
| przeglądarka: `blinow_edytor_v1` | korekty, formy imion, słownik | słowniki, historia |

Procedura (krok 4 planu):
1. **Eksport przed migracją**: użytkownik robi w starych narzędziach kopię JSON i CSV (krok 0). Bez tych plików migracja się nie zaczyna.
2. **Źródłem migracji jest plik kopii, nie pamięć przeglądarki.** Nowa aplikacja jest innym plikiem HTML, a przeglądarki różnie przydzielają pamięć plikom lokalnym (osobno dla każdego pliku albo wspólnie dla wszystkich; do sprawdzenia w kroku 0 na przeglądarkach użytkownika). Wczytanie pliku kopii działa wszędzie tak samo.
3. `migrujStaryStan(plik)` rozpoznaje format (kopia v3, kopia małżeństw, decyzje dopasowania), mapuje id aktów przez `id_dawne` i tworzy raport: zmapowane / niezmapowane / konflikty z danymi.
4. Niezmapowane wpisy nie przepadają: trafiają do magazynu `osierocone` z pełną treścią i są widoczne w zakładce „Ustawienia → Migracja”.
5. Kontrola liczb (kryterium kroku 4) i dopiero wtedy zapis.
6. Stare klucze i stare pliki HTML zostają nietknięte co najmniej do końca kroku 6.
7. Po migracji zatwierdzone pola wracają do repo: eksport CSV → `haiku/ZATWIERDZENIA/` → `zbuduj_dane.py` nakłada je jako `status=ok`. Od tej chwili utrata pamięci przeglądarki kosztuje najwyżej zmiany od ostatniego eksportu.

## 4. Budowa
```
python3 zbuduj_dane.py            # CSV i odczyty → dane.json (+ raport liczb i kolizji)
python3 zbuduj.py --plik          # multitool.html: wszystko w jednym pliku, offline
python3 zbuduj.py --plik --skany  # jak wyżej + skany base64 (duży plik, do pracy bez dysku ze skanami)
python3 zbuduj.py --folder        # multitool/index.html + js/ + dane.js + skany/ (do repo)
python3 test/…                    # Playwright: telefon i desktop
```
`zbuduj.py` sprawdza: obecność wymaganych modułów, brak niewstawionych znaczników, format danych, rozmiar wyniku (ostrzeżenie powyżej progu). Wersja „folder” ładuje dane przez `<script src="dane.js">`, bo `fetch` nie działa z `file://`.

## 5. Co już jest w tym folderze
| Plik | Rola |
|---|---|
| `moduly/norm.js`, `identity.js`, `wystapienia.js`, `decyzje.js`, `db.js` | rdzeń kroków 1 i 6 |
| `prototyp/zbuduj_dane.py` → `dane.json` | zalążek kroku 2 (271 aktów: chrzty, zgony z nakładką `lm`, małżeństwa) |
| `prototyp/szablon.html` + `zbuduj.py` → `multitool_prototyp.html` | zalążek powłoki i zakładki „Osoby” |
| `test/test_scalanie.mjs`, `test/test_prototyp.py` | test reguł na rankingu; test dymny aplikacji |

## 6. Stan realizacji (2026-11-10)
- Krok 1: wspólne słowniki imion (`wspolne/slowniki_imion.json`) i `wspolne/norm.js`; test reguł scalania i prototyp bez zmian wyników. Brak jeszcze: port `MALE`/`polname`/`parents` i test parytetu JS↔Python.
- Krok 2 (część): `python3 prototyp/zbuduj_dane.py --wszystko` buduje pełny `prototyp/dane_pelne.json` (16,6 MB, w `.gitignore`): 8833 aktów (chrzty 5488, zgony 2624, małżeństwa 721), 23356 wystąpień, 18444 relacji; spójność referencji sprawdzona (0 sierot), 24 akty bez pól (do przejrzenia). Brak jeszcze: akty z ASC 1870–79 i mini 1935/1943–45, nakładka zatwierdzeń `zatwierdzenia_uzytkownika.csv`, tabela skanów (sha256), `id_dawne`.
- Krok 2 (zgony spoza CSV, `--wszystko`): ASC 1870–79 dopasowany do 323 wierszy `zgony.csv` (rok+nazwisko+imię; 4 pary przy zduplikowanym kluczu w kolejności) z nakładką odczytu AI (22 akty); mini 1935 (36 aktów) i 1943–45 (170) jako nowe akty `ai1-…`. Zgony 2624 → 2830; baza ma 2842 aktów bez rejestrów i protokołów (2953 − 111), różnica 12 to odczyty ksiąg `lm-…` bez wpisu w indeksie, poza zakresem tego kroku.
- Krok 2 (tabele, `--wszystko`): `skany` (28 plików `haiku/skany_lm`: nazwa, bajty, sha256, N; bez duplikatów sha; wpis „uwaga” dla str. 16–17 niezapisany, bo skan blinow_lm-10 nie ma w git, więc sha nie da się sprawdzić) i `id_dawne` (9039 wpisów, 2624 zgonów z dwoma id dawnymi, 32 chrzty `#2` z `id_oryg`). Stan: 9039 aktów (chrzty 5488, zgony 2830, małżeństwa 721), 24021 wystąpień, 18903 relacji, 0 sierot i 0 relacji z brakującym wystąpieniem; domyślny `dane.json` bez zmian (md5 d1e27e1e…), `--wszystko` 1,1 s. Nie włączono `zatwierdzenia_uzytkownika.csv` (441 wierszy edycji użytkownika), bo to decyzja, czy nakładka ma wchodzić do danych archiwalnych.
- (2026-11-10, krok 2 dokończony) `--wszystko` nakłada też dane z głównej bazy zgonów (`narzedzia/baza_zgonow_1797-1945.html`, wymaga jej zbudowania): pełny zakres pól odczytów ksiąg łacińskich (ok. 22 pola zamiast 9), wartości z eksportu użytkownika (`zatwierdzenia_uzytkownika.csv`, 441 aktów) i 12 aktów `lm-*` spoza indeksu; 8 zatwierdzonych aktów ma pola ze statusem ok (wartość główna). Wynik: 9051 aktów (zgony 2842), 24735 wystąpień, 19605 relacji, spójność OK, próbka `dane.json` bez zmian (md5 d1e27e1e…). Pozostaje: port `MALE`/`polname`/`parents` do JS z testem parytetu (krok 1).
