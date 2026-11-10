# Konflikty: odczyty ksiąg vs indeks Lubgens (zgony.csv)

Plik danych: `KONFLIKTY_odczyt_vs_indeks.csv` (39 wierszy, separator `;`, UTF-8 z BOM).
Analiza tylko czytająca. Pliki źródłowe nie zostały zmienione.

## Zakres i metoda

- Odczyty: `haiku/ODCZYTY/lm/lm-*.csv` oraz `haiku/ODCZYTY/blinow_zgony_1803-1806_Blinow_dom_przyczyny.csv`.
- Dopasowanie: (rok, nr_wpisu_DB == nr_wpisu). Gdy brak dopasowania w tym samym roku, akceptowano rok ±1 przy unikalnym numerze w indeksie.
- Imiona: łacińskie tłumaczone słownikiem `wspolne/slowniki_imion.json` (sekcje NPL, PGEN, GEN).
- Nazwisko: normalizacja (małe litery, bez ogonków), końcówki żeńskie -owa/-owna i -ska→-ski ignorowane, Levenshtein ≥ 2. Alternatywy w indeksie (po `/`) traktowane jako dopuszczalne warianty.
- Płeć: M/F/K (także `K?`) porównywana z m/k z indeksu, gdy obie strony są podane.
- Wiek: porównywany tylko przy podanym wieku w indeksie (różnica > 5 lat).

## Liczby

| Pozycja | Wartość |
|---|---|
| Wiersze odczytu (dane) | 667 |
| Unikalne pary (rok, nr) | 666 (1 duplikat: 1814, nr 790, w lm-33 i lm-34) |
| Dopasowane do indeksu | 667 (w tym 6 przez rok ±1) |
| Bez dopasowania | 0 |
| Konflikty ogółem (wiersze w CSV) | 39 |
| – rodzaj: nazwisko | 26 |
| – rodzaj: imie | 13 |
| – rodzaj: plec | 0 |
| – rodzaj: wiek | 0 |
| Konflikty z „?” w odczycie lub indeksie | 15 (wymagają ręcznej weryfikacji) |

Ograniczenie porównania: w indeksie płeć jest pusta w 2312 z 2624 wierszy, a wiek w 2288. Zgodność płci i wieku oznacza tu głównie brak danych, nie potwierdzenie.

Różnice zapisu miejscowości (np. „Brzozówka” vs „Brzozówka /z moczydeł”) nie są konfliktami, ale w 30 dopasowaniach zapis się różni. Warto to sprawdzić przy okazji scalania.

## Pierwsze 15 konfliktów (kolejność z CSV)

| plik | wiersz | rok | nr | odczyt | indeks | rodzaj |
|---|---|---|---|---|---|---|
| lm-5 | 4 | 1799 | 38 | Sobothowna? | Landobothowna? | nazwisko |
| lm-7 | 5 | 1799 | 73 | Matheus (Piech) | Maciej | imie |
| lm-7 | 25 | 1800 | 93 | Blasius (Kurczak) | Bazyliusz | imie |
| lm-8 | 5 | 1801 | 101 | Kozakowna | Kozaczkowna | nazwisko |
| lm-8 | 15 | 1801 | 111 | Marcin | Mateusz | imie |
| lm-8 | 17 | 1801 | 113 | Łucja | Łukasz | imie |
| lm-9 | 27 | 1803 | 152 | Mateusz (Kurczak) | Maciej | imie |
| lm-12 | 21 | 1807 | 227 | Piech | z Puckow ? | nazwisko |
| lm-13 | 13 | 1808 | 246 | Besacka? | B...ka | nazwisko |
| lm-14 | 8 | 1808 | 268 | Francisca Virgo | Franciszka | imie |
| lm-14 | 16 | 1809 | 275 | Krupina | Krupa | nazwisko |
| lm-14 | 20 | 1809 | 279 | Kurcielowa? | ...kurelakowa | nazwisko |
| lm-15 | 7 | 1810 | 295 | Blasius (Michałek) | Bazyliusz | imie |
| lm-15 | 22 | 1810 | 310 | Pepesonów? | Nieczytelne | nazwisko |
| lm-15 | 26 | 1811 | 314 | Samolów | Samol /Samal | nazwisko |

## Znane przypadki z przekazania

| przypadek | wynik |
|---|---|
| Łucja / Łukasz, nr 113 (1801) | Potwierdzony konflikt imienia (wiersz 17 w lm-8, pozycja 6 w tabeli). |
| Kurczak? / Kozaczek, nr 387 (1814) | Potwierdzony konflikt nazwiska, lm-18 wiersz 11 (poza pierwszymi 15). Odczyt zawiera znak „?”. |
| Stefan / Stanisław, nr 405 (1814) | Potwierdzony konflikt imienia, lm-18 wiersz 29 (poza pierwszymi 15). |
| Kamieniak (nr 779, 862, 866) | Brak konfliktu. Nazwisko i imię zgodne z indeksem (Kamieniak Tomasz; Kamieniak Wojciech/Adalbert; Kamieniak Franciszka). Nr 866 dopasowany przez rok ±1 (odczyt 1822, indeks 1823). |

## Uwagi do weryfikacji

- Część konfliktów imienia wynika z rozbieżności słownika i indeksu, nie z odczytu: np. Blasius jest w słowniku tłumaczony na Błażej, a indeks ma Bazyliusz (nr 93, 295, 831). Trzeba ustalić, który zapis jest właściwy.
- Słownik nie zna wszystkich form (np. „Matheus” jest w NPL jako Mateusz, a indeks ma Maciej). Te przypadki wymagają decyzji, czy to błąd odczytu, czy indeksu.
- Dwa odczyty dla nr 790 (1814) są w lm-33 i lm-34 (duplikat do scalenia lub rozstrzygnięcia).
- Przypadki z „?” w odczycie (15) nie powinny być rozstrzygane automatycznie. Dla tych wpisów zalecana jest weryfikacja skanów.
