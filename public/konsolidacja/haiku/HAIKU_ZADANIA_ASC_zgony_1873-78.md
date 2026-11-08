# ZADANIA HAIKU – odczyt zgonów ASC Blinów 1873–1878

> **WYNIK PRÓBY 2026-11-08: Haiku NIE nadaje się do odczytu aktów ASC.** Przy pełnych stronach skanu (4000 px) nie rozpoznaje rosyjskiej kursywy: 1873 i 1874 – zero odczytów, 1875–78 – 73 akty, ale daty puste i prawie wszystkie pola `?`. Nie wnosić tych wyników do aplikacji. Akty ASC czyta Claude (Sonnet) z fragmentami skanów do weryfikacji. Haiku zlecać tylko skany polskojęzyczne (np. akty 1935–45). Poniżej tryb pracy zachowany jako wzór formatu CSV.

Cel: Haiku czyta akty zgonów z prostych, formułkowych skanów i wpisuje je do CSV w formacie aplikacji `narzedzia/weryfikacja_zgonow_ASC_1870-79.html`. Rafał weryfikuje je w aplikacji (skan obok pól), dopiero potem dane idą do GED i opisów. Haiku niczego nie scala i nie dopisuje do GED.

## Charakter skanów (formularz ASC)
- Akty ASC 1873–78 to druk formularzowy: rosyjska kursywa, ale stała kolejność (data, zgłaszający z wiekiem, zmarły, wiek, rodzice z nazwiskiem panieńskim matki, małżonek). Aktu zgonu nie zawiera przyczyny zgonu – wpisz `brak w akcie`.
- Odczytane wcześniej akty (22 w pliku `odczyty_AI_ASC_start.csv`) służą jako wzorzec – nie czytać ich ponownie.
- Trudniejsze (NIE dla Haiku): lata 1870–72 (tylko indeks, brak skanów), akty z lat 1810–1860, łacina.

## Partie (skan → akty)
Skany: `J:\Genealog\Blinów, św. Jana Chrzciciela\Blinów - zgony <rok> (ASC)\` (repo: katalog skanów jak w `REJESTR_ODCZYTANYCH_SKANOW.md`).

| # | Plik skanu | Rok | Akty | Liczba | Format id |
|---|---|---|---|---|---|
| 1 | 1873/01_zgony_1873_akty_01-05.jpg | 1873 | 1–5 | 5 | `asc-1873-NNN` |
| 2 | 1873/02_zgony_1873_akty_06-15.jpg | 1873 | 6–15 | 10 | `asc-1873-NNN` |
| 3 | 1873/03_zgony_1873_akty_16-25.jpg | 1873 | 16–25 | 10 | `asc-1873-NNN` |
| 4 | 1873/04_zgony_1873_akty_26-35.jpg | 1873 | 26–35 | 10 | `asc-1873-NNN` |
| 5 | 1873/05_zgony_1873_akty_46-50_i_spis_alfabetyczny.jpg | 1873 | 46–50 | 5 | `asc-1873-NNN` |
| 6 | 1874/01_zgony_1874_akty_01-05.jpg | 1874 | 1–5 | 5 | `asc-1874-NNN` |
| 7 | 1874/02_zgony_1874_akty_06-15.jpg | 1874 | 6–15 | 10 | `asc-1874-NNN` |
| 8 | 1874/03_zgony_1874_akty_16-25.jpg | 1874 | 16–25 | 10 | `asc-1874-NNN` |
| 9 | 1874/05_zgony_1874_akt_26_i_skorowidz.jpg | 1874 | 26–26 | 1 | `asc-1874-NNN` |
| 10 | 1875/01_zgony_1875_akty_01-05.jpg | 1875 | 1–5 | 5 | `asc-1875-NNN` |
| 11 | 1875/02_zgony_1875_akty_06-15.jpg | 1875 | 6–15 | 10 | `asc-1875-NNN` |
| 12 | 1875/03_zgony_1875_akty_16-25.jpg | 1875 | 16–25 | 10 | `asc-1875-NNN` |
| 13 | 1875/04_skorowidz_1875_i_zgony_1876_akty_01-04.jpg | 1876 | 1–4 | 4 | `asc-1876-NNN` |
| 14 | 1876-78/01_zgony_1876_akty_05-12.jpg | 1876 | 5–12 | 8 | `asc-1876-NNN` |
| 15 | 1876-78/02_zgony_1876_akty_13-20.jpg | 1876 | 13–20 | 8 | `asc-1876-NNN` |
| 16 | 1876-78/03_zgony_1876_akty_21-28.jpg | 1876 | 21–28 | 8 | `asc-1876-NNN` |
| 17 | 1876-78/04_skorowidz_1876_i_zgony_1877_akty_01-05.jpg | 1877 | 1–5 | 5 | `asc-1877-NNN` |
| 18 | 1876-78/05_zgony_1877_akty_06-15.jpg | 1877 | 6–15 | 10 | `asc-1877-NNN` |
| 19 | 1876-78/06_zgony_1877_akty_16-20_i_1878_akty_21-25.jpg | 1877 | 16–20 | 5 | `asc-1877-NNN` |
| 20 | 1876-78/06_zgony_1877_akty_16-20_i_1878_akty_21-25.jpg | 1878 | 21–25 | 5 | `asc-1878-NNN` |
| 21 | 1876-78/07_zgony_1878_akty_26-31_i_skorowidz.jpg | 1878 | 26–31 | 6 | `asc-1878-NNN` |

Kolejność pracy: najpierw akty z nazwiskami naszych rodzin (Kopiwoda, Pudło, Bucoń, Pcion/Pcionek, Bigos, Tupaj, Spryszak, Brzeski, Rębacz), potem reszta. Jedna partia = jedna odpowiedź = jeden plik CSV `haiku_asc_<rok>_<akty>.csv`.

## Format wyjścia
CSV, separator `;`, UTF-8, nagłówek dokładnie jak w `odczyty_AI_ASC_start.csv`:
`id;death_year;death_act_number;deceased_first_name;deceased_last_name;deceased_maiden_name;deceased_sex;death_date;death_time;death_place;age;deceased_status;deceased_spouse;deceased_birth_place;deceased_residence;profession;father_first_name;father_last_name;mother_first_name;mother_last_name;informant1;informant2;cause_of_death;burial_place;officiant;notes;notes_org;verification_status;uncertain_fields;source_office`

Zasady pól:
- `id` = `asc-RRRR-NNN` (np. `asc-1874-007`), wiersz na akt.
- `death_date` w stylu gregoriańskim `RRRR-MM-DD` (data w nawiasie aktu); data starego stylu do `notes` jako `st.st. DD.MM`.
- `age` jak w akcie (`57 l.`, `9 mies.`, `3 dni`); `informant1/2` w formie `Imię Nazwisko, wiek`.
- `cause_of_death` = `brak w akcie`.
- Nazwiska w polskiej pisowni; w rosyjskim brak „ę" (Рембачъ = Rębacz, Рыбаковъ = Rybak). Zapis „(po polsku)" w nawiasie to to samo nazwisko.
- „землевладелец" = gospodarz (`profession`).
- `verification_status` = `ai_haiku`, `source_office` = `ASC Blinów`.

## Zasady (twarde)
1. Nie zgadywać. Wątpliwe pole wpisać z `?` i dodać jego nazwę do `uncertain_fields` (np. `mother_last_name;age`).
2. Nieczytelne pole zostawić puste i wpisać do `uncertain_fields`.
3. Nic nie dopisywać z wiedzy o rodzinach ani z GED.
4. Gdy akt jest uciętym fragmentem lub brak go na skanie – pominąć, wpisać w `notes` partii (osobny wiersz `# pominięto: akt NN – powód`).
5. Do zwrotu: CSV oraz krótka lista aktów, w których ≥2 pola są niepewne (Rafał przejrzy je w pierwszej kolejności).

## Po stronie Rafała / Claude
1. Otworzyć `weryfikacja_zgonow_ASC_1870-79.html` z dysku J:, menu → wczytaj CSV odczytów AI.
2. Poprawić pola w aplikacji (skan obok), zapisać wynik.
3. Claude wnosi zatwierdzone akty do GED/opisów i uzupełnia `REJESTR_ODCZYTANYCH_SKANOW.md`.

## Braki skanów (nie do zlecenia)
1877 akty 21–33 i skorowidz, 1878 akty 1–20, 1873 akty 36–45 – patrz `BRAKI_SKANOW.md`.
