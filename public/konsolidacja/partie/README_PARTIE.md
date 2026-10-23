# Partie: stan przepisywania zakładki `Ur`

Źródło: `869f3f66-arkusze_osobowe.ods`, zakładka `Ur`, 6017 niepustych wierszy (1–6017). Oryginał nietknięty.

## Wynik kontroli kompletności

Każdy wiersz 1–6017 występuje dokładnie raz we wszystkich partiach (sprawdzone skryptem).

## Pliki

| Plik | Wiersze | Zakres | Układ | Stan |
|---|---|---|---|---|
| `chrzty_partia01_karty_1783_1785.csv` | 150 | 1–150 | karty | przepisane, flagi |
| `chrzty_partia02_karty_1785_1789.csv` | 150 | 151–300 | karty | mechanicznie wg kolumn, flagi |
| `chrzty_partia03_karty_1789_1791.csv` | 150 | 301–450 | karty | mechanicznie wg kolumn, flagi |
| `chrzty_partia04_karty_1791_1793.csv` | 150 | 451–600 | karty | mechanicznie wg kolumn, flagi |
| `chrzty_partia05_karty_1793_1796.csv` | 140 | 601–740 | karty | mechanicznie wg kolumn, flagi |
| `akty_wiersze_0741_*` … `akty_wiersze_5991_6017.csv` | 5277 | 741–6017 | akty i indeksy | **pierwszy przebieg mechaniczny, NIE przepisany ręcznie** (patrz niżej) |

## Układy w zakładce `Ur` (wiersze 741–6017)

| Typ | Wiersze (ok.) | Ile | Co jest w kolumnach | W partiach |
|---|---|---|---|---|
| `F_struct` | 741–826 i rozproszone | 261 | data w F, ojciec G/H/I, matka L/M/N | pola zmapowane wg kolumn |
| `free_slash` | 2424–5887 (wiele bloków) | 2656 | G = „Miejscowość / Ojciec i Matka l.wiek”, bez F | G zachowane w `uwagi_surowe`, rodzice puści, flaga |
| `G_other` | 892–950, 2348–4555 (bloki) | 1033 | G = rodzice w wolnym tekście, bez F | jak wyżej |
| `index_only` | 1077–2271 (bloki) | 1258 | tylko ID, nazwisko, imię, nr, rok | pola zmapowane, bez rodziców (brak w źródle) |
| `id_only` | 5949–6017 | 69 | tylko ID | wiersz zachowany, bez danych |

## Co jest do zrobienia

1. Wiersze `free_slash` i `G_other` (3689 wierszy) wymagają ręcznego przepisania. Nie parsuję ich, bo tekst jest niejednolity (`Blinów / Józef l.28 i Marianna Paciorek l.30`, `Maciey i Maryanna Męczenska`, `Woyciech i Anastazya Bogoń,Boguń`).
2. Wiersze `index_only` i `id_only` wymagają tylko przeglądu.
3. Pole `ID` nie zawsze zgadza się z numerem wiersza (np. wiersz 741 ma `U000761`). Klucz to `wiersz_zrodlo`, ID zachowane jak w arkuszu.
4. Daty ujemne (`-26925`) zachowane surowo i oznaczone, nie konwertowane.
5. Formuły `około RRRR` z arkusza zapisane w `uwagi_surowe`. `~RRRR` wyliczone z roku wpisu i wieku, tylko gdy wiek jest liczbą.
