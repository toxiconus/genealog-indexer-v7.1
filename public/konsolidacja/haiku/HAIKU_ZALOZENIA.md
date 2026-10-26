# Haiku – odczyt zgonów (eksperyment „AI v1”) – założenia i ustalenia

Parafia Blinów, księgi zgonów. Wynik to **propozycje do oceny człowieka**, nie fakty.

## 1. Co dostajesz / co oddajesz
Wejście: skan rozkładówki (+ opcjonalnie surowy indeks Lubgens: NAZWISKO, IMIĘ, AKT, ROK, UWAGI).
Wyjście – **trzy pliki rosnące, jedne na wszystkie skany** (nie tworzyć nowych na każdą stronę; dopisywać na końcu, nigdy nie zmieniać ani nie usuwać wcześniejszych wpisów):
1. `ZGONY_ai1_pelny_tekst.md` – dosłowna transkrypcja każdego aktu, numerowana, z ID; każdy skan zaczyna sekcja `## Skan: <plik>`.
2. `ZGONY_ai1_import.csv` – pola szablonu „zgon” (UTF-8 BOM, `;`, CRLF) do Importu w indeksatorze; nowe wiersze na końcu.
3. `ZGONY_ai1_roi.json` – tablica obszarów aktów; nowe obiekty na końcu.
Przed dopisaniem sprawdź, czy ID już nie istnieje (duplikatu nie dodawaj; nowa próba = `ai2-…`).

## 2. ID
`ai1-<rok>-<nr aktu>` (np. `ai1-1943-026`). Kolejna próba tej samej strony = `ai2-…`. Nigdy nie nadpisuj ID z bazy ręcznej. Pole `verification_status` = `ai_v1` (po ocenie człowieka: `ok`).

## 3. Zasady odczytu
- Pisownia dosłowna w `*_pelny_tekst.md`; pola CSV znormalizowane. Niepewne miejsce: `[?]` w tekście, `?` za wartością w CSV, kolumna `uncertain_fields` (lista id pól).
- Niczego nie zgaduj ani nie „poprawiaj” nazwisk bez pewności. Nieczytelne = puste + uwaga.
- **Nazwiska panieńskie zawsze w mianowniku**: „Zofia z Panków” → `Panek`; „Anastazja z Gochów” → `Goch`; „Zofia z Brzeskich” → `Brzeska`; „Zofia z Chudych” → `Chuda`. Gdy nie wiesz jak odmienić: forma najbardziej prawdopodobna + `?` (np. `Pank?`). Nie zapisuj form dopełniacza.
- Stan cywilny z treści aktu: panna / mężatka (`żona …`) / wdowa (`owdowiała`, `pozostawiwszy owdowiałą żonę/męża …`) / żonaty / wdowiec / kawaler. Do `deceased_status`; współmałżonek do `deceased_spouse` (wdowa po … / żona …).
- Wiek: `age` = liczba lat albo `~RRRR` gdy znany tylko rok urodzenia; dla niemowląt tekst („1 miesiąc”). Surowy tekst zawsze w `notes_org`.
- Daty: `RRRR-MM-DD`, godzina `HH:MM` (słowna → liczba: „osiemnastej” = 18:00). Gdy akt mówi „wczorajszego”/„dnia bieżącego” policz względem daty spisania aktu i zanotuj w `notes`.
- Pola: death_year, death_act_number, deceased_first_name, deceased_last_name, deceased_maiden_name, deceased_sex (M/K), death_date, death_time, death_place, age, deceased_status, deceased_spouse, deceased_birth_place, deceased_residence, profession, father_first_name, father_last_name, mother_first_name, mother_last_name, informant1, informant2, cause_of_death, burial_place, officiant, notes, notes_org, verification_status.
- Dopasowanie do bazy: przy niepewności sprawdź imię/nazwisko w `slownik_nazwisk.csv` i `data/imiona_wszystkie.json`, `data/nazwiska_wszystkie.json`. Forma ze słownika = wskazówka, nie dowód; zapisz jak w skanie i dopisz `?`.
- Indeks Lubgens (UWAGI: „O: ojciec, M: matka zd. panieńskie, miejscowość, l. wiek, zm. data, ż./mąż …”) to **drugie źródło**. Rozbieżność skan↔indeks: wartość ze skanu, rozbieżność w `notes`. Zgodność też odnotuj (`indeks: zgodny`). „zd.” w indeksie jest już w mianowniku.
- Akt z indeksu, którego nie ma na skanie: nie twórz rekordu z pełnymi polami; tylko wiersz z indeksu, status `indeks`.

## 4. ROI
`*_roi.json`: dla każdego aktu `{id, plik, strona, roi:{x,y,w,h}}`, współrzędne **ułamkowe 0–1** względem całego obrazu (lewy górny róg), prostokąt obejmuje tekst aktu **z numerem i nazwą miejscowości w marginesie**. Podaj też `plik` (nazwa skanu). Przybliżenie wystarczy – człowiek poprawi w indeksatorze.

## 5. Format `*_pelny_tekst.md`
```
## ai1-1943-026 · Akt 26 · margines: „Moczydła, Józef Brzuszkiewicz”
Skan: <plik>, ROI: x..y..
> dosłowny tekst…
Uwagi odczytu: …
```

## 6. Czego nie wolno
Nie łączyć ani nie scalać z bazą; nie zmieniać istniejących rekordów; nie uzupełniać z wiedzy ogólnej; nie pomijać aktów (puste/skreślone też zanotuj).
