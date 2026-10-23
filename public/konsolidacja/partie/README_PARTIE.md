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

## Stan ręcznego przepisania wierszy wolnego tekstu

Każda partia to 150 wierszy wolnego tekstu (kolejność z listy `free_rows`). Pliki w `reczne/` to przepis ręczny w formacie `wiersz | ojc=… | ojcw=… | mat=… | matw=… | nazw=… | miejsc=… | fl=…`. Skrypt `build_free2.py` scala je z kolumnami arkusza i sprawdza pokrycie (każdy wiersz z zakresu dokładnie raz).

| Plik ręczny | Wiersze arkusza | Pliki CSV | Stan |
|---|---|---|---|
| `hand_01_wiersze_827_1522.txt` | 827–1522 | `akty_free_01_…` | zrobione, commit `b66df2d` |
| `hand_02_wiersze_1545_2415.txt` | 1545–2415 | `akty_free_02_…` | zrobione, commit `b66df2d` |
| `hand_03_wiersze_2416_2596.txt` | 2416–2596 | `akty_free_03_…` | zrobione, commit `f20355d` |
| `hand_04_wiersze_2597_2748.txt` | 2597–2748 | `akty_free_04_…` | zrobione, commit `f20355d` |
| `hand_05_wiersze_2749_2899.txt` | 2749–2899 | `akty_free_05_…` | zrobione, commit `f20355d` |
| `hand_06_wiersze_2900_3051.txt` | 2900–3051 | `akty_free_06_…` | zrobione |
| `hand_07_wiersze_3052_3205.txt` | 3052–3205 | `akty_free_07_…` | zrobione, commit `fa87da9` |
| `hand_08_wiersze_3206_3359.txt` | 3206–3359 | `akty_free_08_…` | zrobione, commit `daf90e2` |
| `hand_09_wiersze_3360_3512.txt` | 3360–3512 | `akty_free_09_…` | zrobione, commit `daf90e2` |
| `hand_10_wiersze_3513_3667.txt` | 3513–3667 | `akty_free_10_…` | zrobione, commit `e2adf74` |
| `hand_11_wiersze_3668_3824.txt` | 3668–3824 | `akty_free_11_…` | zrobione, commit `e2adf74` |
| `hand_12_wiersze_3825_3975.txt` | 3825–3975 | `akty_free_12_…` | zrobione, commit `e2adf74` |
| `hand_13_wiersze_3976_4135.txt` | 3976–4135 | `akty_free_13_…` | zrobione, commit `e2adf74` |
| `hand_14_wiersze_4136_4291.txt` | 4136–4291 | `akty_free_14_…` | zrobione, commit `e2adf74` |
| `hand_15_wiersze_4292_4450.txt` | 4292–4450 | `akty_free_15_…` | zrobione, commit `2b72e0f` |
| `hand_16_wiersze_4451_4604.txt` | 4451–4604 | `akty_free_16_…` | zrobione, commit `2b72e0f` |
| `hand_17_wiersze_4605_4761.txt` | 4605–4761 | `akty_free_17_…` | zrobione, commit `2b72e0f` |
| `hand_18_wiersze_4762_4914.txt` | 4762–4914 | `akty_free_18_…` | zrobione, commit `2b72e0f` |
| `hand_19_wiersze_4915_5068.txt` | 4915–5068 | `akty_free_19_…` | zrobione, commit `f972411` |
| `hand_20_wiersze_5069_5221.txt` | 5069–5221 | `akty_free_20_…` | zrobione (ta sama gałąź, commit z partią 20–25) |
| `hand_21_wiersze_5222_5388.txt` | 5222–5388 | `akty_free_21_…` | zrobione (ta sama gałąź) |
| `hand_22_wiersze_5389_5540.txt` | 5389–5540 | `akty_free_22_…` | zrobione (ta sama gałąź) |
| `hand_23_wiersze_5541_5694.txt` | 5541–5694 | `akty_free_23_…` | zrobione (ta sama gałąź) |
| `hand_24_wiersze_5695_5853.txt` | 5695–5853 | `akty_free_24_…` | zrobione (ta sama gałąź) |
| `hand_25_wiersze_5854_5947.txt` | 5854–5947 | `akty_free_25_…` | zrobione (ostatnia partia, 89 wierszy) |

Stan: cały wolny tekst arkusza `Ur` (wiersze 827–5947, 3689 wierszy) przepisany ręcznie i scalony; każdy wiersz z zakresu pokrywa się dokładnie raz. Wiersze powyżej 5947 w `Ur` nie należą do wolnego tekstu; opisane są w sekcji o typach wierszy niżej.

Pozostałe do zrobienia (nie ruszane): arkusze `Mał` (774 wiersze) i `Zg` (2624 wiersze); decyzja, do której księgi należą zakresy `liber` w `Obl`.

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

## Arkusz `Zg` (zgony, wiersze 1–2624)

- `konsolidacja/zgony.csv`: 2624 wierszy, z czego 2257 prostych (`skrypty/build_zgony.py`, wiersze z samym miejscem/numerem lub kartą) i 367 wolnego tekstu przepisanego ręcznie (`reczne/zgony/hand_zg_01..03.txt`). Pokrycie każdego wiersza wolnego sprawdzone skryptem (dokładnie raz).
- `typ_ksiegi` = `Liber mortuorum` (z nazwy arkusza). `zrodlo` = numer z kolumny D (`liber` = brak numeru księgi).
- Kolumny rozszerzone: `wiek` + `jednostka_wieku` (lat/mies/tyg), `stan` (wd. = zmarły był wdowcem/wdową), `zyjacy_malzonek` (z „owd. X”: zmarły owdowił X, czyli X żyje), `rodowe` (zd./z domu), `rok_ur_wyliczony` (`~RRRR` = rok wpisu − wiek, tylko przy wieku w latach), `surowe_pozostale` (kolumny F, H–S zachowane surowo).
- Znaczenie „owd.” potwierdzone składnią biernika (owd. Katarzynę = owdowił Katarzynę).
- Pozostałe do zrobienia: arkusze Obl, A.Os, rody, Arkusz13; decyzja o zakresach `liber`.
