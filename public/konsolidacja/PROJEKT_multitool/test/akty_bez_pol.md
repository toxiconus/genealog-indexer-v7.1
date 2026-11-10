# Akty bez pól (dane_pelne.json, D['akty'] z pustym `pola`)

Źródło: `python3 prototyp/zbuduj_dane.py --wszystko` (dane_pelne.json, 9051 aktów).
Analiza tylko do odczytu; żadne pliki źródłowe nie zostały zmienione.

## Liczby

- Aktów ogółem: 9051
- Aktów z pustym `pola`: **24** (wszystkie chrzty, wszystkie 1908, wszystkie `zr:indeks-chrzty`, stan `z_indeksu`)
- Według typu: chrzest 24, zgon 0, małżeństwo 0
- Według źródła: `zr:indeks-chrzty` (plik `blinow_akty.csv`) 24
- Według powodu: wiersz źródłowy zawiera tylko id, rok, nr, linię i `id_oryg`; wszystkie pola osób i miejsca puste (24 z 24)

## Tabela

| id | typ | rok | nr | powód |
|---|---|---|---|---|
| CH.LUB.BLIN.1908.073 | chrzest | 1908 | 73 | wiersz cały pusty; brak nazwiska dziecka (problemy.csv) |
| CH.LUB.BLIN.1908.074 | chrzest | 1908 | 74 | j.w. |
| CH.LUB.BLIN.1908.075 | chrzest | 1908 | 75 | j.w. |
| CH.LUB.BLIN.1908.076 | chrzest | 1908 | 76 | j.w. |
| CH.LUB.BLIN.1908.077 | chrzest | 1908 | 77 | j.w. |
| CH.LUB.BLIN.1908.078 | chrzest | 1908 | 78 | j.w. |
| CH.LUB.BLIN.1908.079 | chrzest | 1908 | 79 | j.w. |
| CH.LUB.BLIN.1908.080 | chrzest | 1908 | 80 | j.w. |
| CH.LUB.BLIN.1908.081 | chrzest | 1908 | 81 | j.w. |
| CH.LUB.BLIN.1908.082 | chrzest | 1908 | 82 | j.w. |
| CH.LUB.BLIN.1908.083 | chrzest | 1908 | 83 | j.w. |
| CH.LUB.BLIN.1908.084 | chrzest | 1908 | 84 | j.w. |
| CH.LUB.BLIN.1908.085 | chrzest | 1908 | 85 | j.w. |
| CH.LUB.BLIN.1908.086 | chrzest | 1908 | 86 | j.w. |
| CH.LUB.BLIN.1908.087 | chrzest | 1908 | 87 | j.w. |
| CH.LUB.BLIN.1908.088 | chrzest | 1908 | 88 | j.w. |
| CH.LUB.BLIN.1908.089 | chrzest | 1908 | 89 | j.w. |
| CH.LUB.BLIN.1908.090 | chrzest | 1908 | 90 | j.w. |
| CH.LUB.BLIN.1908.091 | chrzest | 1908 | 91 | j.w. |
| CH.LUB.BLIN.1908.092 | chrzest | 1908 | 92 | j.w. |
| CH.LUB.BLIN.1908.093 | chrzest | 1908 | 93 | j.w. |
| CH.LUB.BLIN.1908.094 | chrzest | 1908 | 94 | j.w. |
| CH.LUB.BLIN.1908.095 | chrzest | 1908 | 95 | j.w. |
| CH.LUB.BLIN.1908.096 | chrzest | 1908 | 96 | j.w. |

Wszystkie 24 wiersze (`blinow_akty.csv`, linie 5459 i dalej w bloku 1908) mają tylko numer i identyfikatory. W `blinow_problemy.csv` każdy ma wpis „brak nazwiska dziecka”. W `partie/akty_wiersze_5841_5990.csv` każdy ma typ `akt` i flagę „brak daty w kol. F”, bez żadnych danych osób.

## Obserwacje

- Archiwum ODS `blinow_1908_archiwum_ods.csv` kończy się na nr 72 (Szubstarska). Nr 73–96 nie mają żadnego rekordu archiwalnego.
- Sąsiednie akty 1908 (nr 72 i niżej) mają pełne pola, więc brak nie wynika z ogólnej luki w danych.
- Dla każdego z 24 aktów istnieje wpis w `blinow_scalone.csv` (`wariant_TXT`, „wiersz z TXT różny od oryginału”). Ten wpis nie wnosi danych osób.
- Brak aktów z pustym `pola` wśród zgonów i małżeństw (`zgony.csv`, `malzenstwa_mal.csv`); w `malzenstwa_mal.csv` nie ma żadnego wiersza z rokiem 1908.

## Rekomendacja

Zostawić te 24 akty jako rekordy „do uzupełnienia” (stan `brak_danych`, flaga `do_uzupelnienia`), ale wyłączyć je z dopasowań i statystyk osób, bo mają tylko numer i ID bez danych, a z samego indeksu nie wynika, czy akty 73–96 istnieją w księdze; po sprawdzeniu skanu (strona z nr 73) trzeba je uzupełnić albo usunąć.
