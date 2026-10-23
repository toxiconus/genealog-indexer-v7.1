# Założenia: poprawiony arkusz osobowy Blinowa

Status: PROJEKT do akceptacji. Nic jeszcze nie przepisane.

Źródło: `869f3f66-arkusze_osobowe.ods` (oryginał NIETKNIĘTY).
Wynik: nowy plik `arkusze_osobowe_poprawione.ods`.

## 1. Zasady ogólne

1. **Jeden wiersz wejściowy = jeden wiersz wyjściowy.** Nic nie usuwam. Każdy wiersz ma numer wiersza źródłowego (kolumna `wiersz_zrodlo`), żeby dało się sprawdzić.
2. **Przepisuję ręcznie, nie parserem.** Odmiana przez przypadki i skróty („córka Jana”, „wd.”, „kaw.”) są za różnorodne. Przepisuję partiami po ~150 wierszy i sprawdzam liczbę wierszy po każdej partii.
3. **Nazwisk i imion NIE poprawiam**, z dwoma wyjątkami:
   - oczywista literówka (np. `Woyciech` → `Wojciech`) — poprawiam i zapisuję w `Log_zmian` z wartością przed i po,
   - nazwisko/imię z małej litery na początku (np. `osidłowna`) — poprawiam i loguję.
   Wszystko inne (warianty pisowni `Bucon`/`Bucoń`, `Kosidło`/`Kosidlak`, `?`, dwie formy `Bajdas / Baldas`) zostaje takie jak jest, a wiersz dostaje flagę.
4. **Skróty i odmiana zostają w kolumnie surowej.** Pola z wartościami wyciągam tylko, gdy są jednoznaczne.
5. **Niepewne oznaczam**, nie zgaduję. Znak `?` w oryginale zostaje, a wiersz idzie do `Do_sprawdzenia`.

## 2. Znaczenie skrótów

| Skrót | Znaczenie | Gdzie |
|---|---|---|
| `k` | kawaler | stan pana młodego |
| `p` | panna | stan panny młodej |
| `w` | wdowiec (pan młody) / wdowa (panna młoda) | zależnie od pozycji w wierszu, nie od imienia |
| `.` | brak danych | |
| `-----` | pusta rubryka w oryginale | zostaje jako surowe, bez wartości |
| `brak akt` | brak aktu w księdze | kolumna chrztów, flaga |
| `około RRRR` | przybliżony rok urodzenia | kolumny `*_rok_ur_przyb` |
| `nr karty N` | numer karty indeksowej | karty 1783–1796 |

Odmiana: „córka”, „syn”, „wd.”, „kaw.”, „panna” itp. zapisuję w kolumnie `uwagi_surowe`, żeby nie zgubić informacji. Nie wyciągam z nich pól, o ile nie są jednoznaczne.

## 3. Układ kolumn wejściowych

### Ur (chrzty, ID `U000001`…)

- **Karty indeksowe, lata 1783–1796** (wiersze z „nr karty” w kolumnie 6): imię i nazwisko dziecka, nr, rok. Brak rodziców w arkuszu.
- **Akty, lata 1796–1908** (reszta): kolumna 6 = imię ojca, 7 nazwisko ojca, 8 wiek ojca, 9 przybliżony rok urodzenia ojca, 10 miejscowość, 11 imię matki, 12 nazwisko matki, 13 wiek matki, 14 przybliżony rok urodzenia matki, 16 znacznik `V`.
- Kolumna 5 = data (`dd.mm.rrrr`), albo `brak akt`, albo błędna wartość (`-26925`). Błędne zostawiam surowe i flaguję.

### Mał (małżeństwa)

- Kolumny 0–2: rok, nr, data (`dd.mm`).
- Pan młody, kol. 3–15: 3 nazwisko, 4 imię, 5 stan, 6–8 pola `-----`/`?` (surowe), 9–10 ojciec imię/nazwisko, 11–12 matka imię/nazwisko, 13 miejscowość, 14 wiek, 15 przybliżony rok urodzenia.
- Panna młoda, kol. 16–30: 16 rok i 17 nr (powtórzone), 18 imię, 19 nazwisko (kolejność w arkuszu: **imię przed nazwiskiem**, zostawiam jak jest), 20 stan, 21–23 pola `-----`/`?` (surowe), 24–25 ojciec, 26–27 matka, 28 miejscowość, 29 wiek, 30 przybliżony rok urodzenia.

  **Mapowanie:** każda wartość trafia do kolumny według treści, nie według kolejności w arkuszu. Dla panny młodej: kol. 18 (`Anna`) → `panna_imie`, kol. 19 (`Kurczak`) → `panna_nazwisko`. Dla pana młodego: kol. 3 → `pan_nazwisko`, kol. 4 → `pan_imie`.
- Świadkowie, kol. 31–37: 31 data (powtórzona), 32–33 świadek 1 imię/nazwisko, 34 wiek, 35–36 świadek 2 imię/nazwisko, 37 wiek.

### Zg (zgony)

- Kol. 0 ID `Z00001…`, 1 nazwisko, 2 imię, 3 źródło (`liber` albo numer księgi), 4 rok, 6 wpis miejsca i numeru.
- Kolumna 6 ma trzy formy: `Miejscowość, nr. wpisu N`, `karta N`, sama miejscowość. Rozbijam na `miejscowosc`, `nr_wpisu`, `karta`, a oryginał zostaje w `surowe_kol_6`.

## 4. Kolejność kolumn w arkuszach wyjściowych

**Chrzty:** `id_archiwalne`, `wiersz_zrodlo`, `typ_wpisu` (akt/karta), `rok`, `nr`, `nazwisko_dziecka`, `imie_dziecka`, `data_tekst`, `data_iso`, `ojciec_imie`, `ojciec_nazwisko`, `ojciec_wiek`, `ojciec_rok_ur_przyb`, `miejscowosc`, `matka_imie`, `matka_nazwisko`, `matka_wiek`, `matka_rok_ur_przyb`, `karta_nr`, `uwagi_surowe`, `flagi`.

**Małżeństwa:** `rok`, `nr`, `wiersz_zrodlo`, `data_tekst`, `data_iso`, `pan_nazwisko`, `pan_imie`, `pan_stan`, `pan_ojciec_imie`, `pan_ojciec_nazwisko`, `pan_matka_imie`, `pan_matka_nazwisko`, `pan_miejscowosc`, `pan_wiek`, `pan_rok_ur_przyb`, `panna_imie`, `panna_nazwisko`, `panna_stan`, `panna_ojciec_imie`, `panna_ojciec_nazwisko`, `panna_matka_imie`, `panna_matka_nazwisko`, `panna_miejscowosc`, `panna_wiek`, `panna_rok_ur_przyb`, `swiadek1_imie`, `swiadek1_nazwisko`, `swiadek1_wiek`, `swiadek2_imie`, `swiadek2_nazwisko`, `swiadek2_wiek`, `surowe_kol_6_8`, `surowe_kol_21_23`, `flagi`.

**Zgony:** `id_archiwalne`, `wiersz_zrodlo`, `nazwisko`, `imie`, `zrodlo`, `rok`, `miejscowosc`, `nr_wpisu`, `karta`, `surowe_kol_6`, `flagi`.

**Pomocnicze:** `Do_sprawdzenia` (arkusz, id, flaga, wartość), `Log_zmian` (wiersz, pole, przed, po, powód), `Liczby` (wejście i wyjście per arkusz), `README`, `tekst_surowy`, `rody_surowe` (bez zmian).

## 4a. Wpisy bez numeru (`liber`, nr 0)

- `liber` (w Zg w kol. 3, w Ur w kol. 3) oraz `nr 0` to **brak numeru w księdze**, a nie błąd. Księga często nie numerowała stron ani aktów, więc wpisywano `liber`.
- Pod jednym `liber` mogą być **kilka aktów**: bliźnięta, dodatkowe wpisy, albo mało czytelny inny akt. Każdy wiersz zostaje osobnym rekordem.
- Nie nadaję numeru, którego nie ma w źródle. Dla grupy takich wpisów zachowuję kolejność wierszy w arkuszu (`kolejnosc_w_grupie`) i flagę `bez numeru w księdze`.
- Jeśli w oryginale jest powiązanie (np. „bliźniaki” w uwagach albo sąsiedni akt), zapisuję je w `uwagi_surowe`.

## 5. Wiek i przybliżony rok urodzenia

Przybliżony rok urodzenia był liczony w oryginalnym arkuszu funkcją: **rok aktu − wiek**. Zapisuję ten wynik jako `~RRRR` (tylda oznacza przybliżenie), np. akt 1841, wiek 19 → `~1822`.

- `*_rok_ur_przyb` — wynik `~RRRR`, tylko gdy da się go policzyć (jest rok aktu i wiek liczbowy),
- `*_rok_ur_przyb_surowe` — oryginalny tekst z arkusza, np. `około 1822`, bez zmian.

Jeśli wartość w oryginale nie zgadza się z wynikiem funkcji, nie poprawiam jej, tylko flaguję (`rok_ur_przyb_rozni_sie`). Dotyczy to kolumn: ojciec, matka (chrzty), pan i panna (małżeństwa). Wiek (`*_wiek`) zostaje liczbą, a wartości nieliczbowe (np. `40?`) idą do surowego tekstu i flagi.

## 6. Do decyzji

**Ustalone:**
- Dwie pisownie (`Bajdas / Baldas`) zostają w jednym polu, w oryginalnej postaci.
- Przepisywanie zaczyna się od najstarszych wpisów: karty indeksowe Ur, 1783, wiersz 1.
