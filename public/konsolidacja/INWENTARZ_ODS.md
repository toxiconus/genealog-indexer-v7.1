# Inwentarz zakładek: `869f3f66-arkusze_osobowe.ods`

Stan: 2026-10-23. Źródło nietknięte. Liczby z odczytu `content.xml`, bez parsowania treści.
Typ: **D** = dane wpisane ręcznie, **F** = wartości liczone formułami (cache), **P** = pochodna (odtwarzalna z D), **X** = nie dotyczy genealogii.

## 1. Zakładki

| Zakładka | Wiersze | Typ | Co zawiera | Status |
|---|---|---|---|---|
| `Ur` | ~6016 | D + F | Chrzty 1783–1908 (akty i karty indeksowe) | Źródło główne. Kol. J i O to formuły `około = rok − wiek` (ojciec/matka). Kol. H to część formuł `=wiersz X` (kopia wartości). |
| `Mał` | ~774 | D + F | Małżeństwa | Źródło główne. Kol. G–I i V–X to formuły pól `-----`/`?` zależnych od stanu. Kol. P, AE to `około`. Kol. Q, R, Z to kopie z innych wierszy. Kol. AF to wygenerowany tekst aktu. |
| `Zg` | ~2624 | D + F | Zgony | Źródło główne. Kilka formuł `około` i kopii. |
| `Obl` | ~9616 | D | Indeks osób w czterech sekcjach (patrz §2) | **Nie tylko duplikat.** Ma wiersze bez odpowiednika w `Ur`/`Zg`/`Mał` i notki o rodzicach w wolnym tekście. Do przepisania. |
| `A.Os` | ~14 | D + F | Drzewo rodzinne jednej rodziny (Kopiwoda), wyszukiwanie w `Ur` | Dane osobowe, unikalne. Zachować. |
| `rody` | ~88 | D | Rody i nazwiska z odmianami | Zachować bez zmian (jak w arkuszu planu). |
| `tekst` | ~942 | F/P | Tekst opisu aktu, składany z `oblicz` | Pochodna. Nie przepisuję. |
| `oblicz` | ~1132 | F/P | Składanie tekstu i `rok − wiek` z `Mał` | Pochodna. |
| `l.genobl` | ~1332 | F/P | Lista osób i rodzin z `Mał` | Pochodna. |
| `l.gen` | ~943 | F/P | Lista z `l.genobl` | Pochodna. |
| `exp` | ~2502 | F/P | Eksport tekstu z `Ur` (`nazwisko imię`, `rok akt nr.`) | Pochodna. |
| `Arkusz13` | ~6 | X | Linki do źródeł (FamilySearch, księgi) | Zachować jako `zrodla_linki` w README. |
| `stat` | ~1348 | X | Kalkulator finansowy | Pomijam (jak wcześniej). |

## 2. Zakładka `Obl`: sekcje (wg numeru wiersza)

| Wiersze | Sekcja | Układ | Dopasowanie do `Ur`/`Zg`/`Mał` (klucz: nazwisko, imię, rok) |
|---|---|---|---|
| 1–689, 691–740 | A: karty indeksowe 1783–1796 | nazwisko, imię, nr, rok, `nr karty N` | 716 z 739 w `Ur`. 20 bez dopasowania (A). |
| 690, 741–6100 | B: chrzty 1796–1906 | nazwisko, imię, nr, rok, notka o rodzicach | 4141 w `Ur`, 80 w `Zg`. **1200 bez dopasowania.** |
| 6101–7999 | C: mieszana (patrz niżej) | jak B; w bloku `liber` notka `Miejscowość, nr. wpisu N` | 974 wiersze `liber` (6245–6353, 6357–7221): 0 w `Ur`. Pozostałe wiersze C (bez `liber`): 1820–1859 (778), 1900–1908 (140), 4 bez roku. |
| 8000–8999 | D: 1856–1857 | jak B | 616 w `Zg`, 21 w `Ur`. 5 bez dopasowania. |
| 9000–9616 | E: małżeństwa | nazw. pana, imię pana, nazw. panny, imię panny, nr, rok, notka (wiek, rodzice) | 237 z 607 w `Mał`. **370 bez dopasowania.** |

Uwaga: "bez dopasowania" nie znaczy "nowy akt". Może to być inna pisownia, rok lub nr. Trzeba porównać ręcznie, zanim cokolwiek uznam za duplikat.

### 2a. Blok `liber` w `Obl` (wiersze 6245–7221)

- 974 wiersze, lata 1797–1824 (1797–1809: 432; 1810–1819: 424; 1820–1824: 118; daty w tym bloku są w kolumnie D).
- Kolumna `nr` = `liber`. Numer wpisu jest w notce: `Miejscowość, nr. wpisu N`. Wszystkie 974 mają taką notkę.
- Numery `N` tworzą jeden zbiór bez duplikatów, zakres 1–~980. Histogram po 50 numerach: przedziały 0–250 to lata 1790–1804, 250–550 to lata 1810–1815, 550–850 to lata 1815–1823, ale 850–980 zawiera lata 1797–1812 i 1820–1824 naraz. To może być druga seria numeracji albo błąd roku. Do rozstrzygnięcia przed przypisaniem do księgi.
- Brak dopasowania do `Ur` po nazwisku i roku (0 z 974). Nie są to duplikaty.
- Decyzja zgodna z `ZALOZENIA_ARKUSZE.md` §4a: `liber` zostaje w kolumnie `nr`, `typ_ksiegi = do ustalenia`. Numer z notki warto zapisać w osobnej kolumnie, nie w `nr`.

## 3. Wnioski i propozycja

1. Do przepisywania włączam: `Ur`, `Mał`, `Zg` (D), `Obl` sekcje A–E, `A.Os`, `rody`, `Arkusz13`.
2. Pomijam jako pochodne: `tekst`, `oblicz`, `l.genobl`, `l.gen`, `exp`. Ich wartości sprawdzam po przepisaniu, nie kopiuję.
3. Pomijam `stat` (finanse, nie genealogia).
4. Duplikaty nie są kasowane. Wiersz z `Obl` dopasowany do `Ur`/`Zg`/`Mał` trafia do `Do_sprawdzenia` z odwołaniem do obu wierszy. Wiersz bez dopasowania idzie normalnie.
5. Formuły typu `=wiersz X` (kopie) traktuję jak wartość tego wiersza i zapisuję w `flagi: kopia z wiersza X`, żeby nie zgubić informacji o źródle.
