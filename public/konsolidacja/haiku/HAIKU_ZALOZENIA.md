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

## 5a. Nazwy miejscowości
W polach CSV i w nagłówkach: mianownik „Moczydła” (nie „Mocydła”). W cytowanym tekście aktu: forma z aktu (np. „z Moczydeł”).

## 6. Czego nie wolno
Nie łączyć ani nie scalać z bazą; nie zmieniać istniejących rekordów; nie uzupełniać z wiedzy ogólnej; nie pomijać aktów (puste/skreślone też zanotuj).

## 5b. Pozycje pól (czwarty rosnący plik: `ZGONY_ai1_pola.json`)
Dla każdego aktu, oprócz tekstu, CSV i ROI aktu, podaj położenie pól na skanie, żeby weryfikator mógł od razu przybliżyć obraz na dane słowo (z kontekstem wokół).
- Format: `{"akty": {"ai1-1943-062": {"plik": "...jpg", "pola": {"death_date": [[x,y,w,h]], "age": [[...],[...]]}}}}`; współrzędne to **ułamki całego skanu** (0–1), jak w ROI; pole łamane na wiersze = kilka prostokątów.
- Obowiązkowo: pola niepewne (`uncertain_fields`) oraz nazwiska, imiona, data i godzina zgonu, wiek, rodzice, świadkowie. Reszta opcjonalnie.
- Prostokąt ma obejmować tylko to słowo/frazę (ciasno). Narzędzie samo doda margines. Błąd rzędu 1–2% skanu jest dopuszczalny, ale sprawdzaj położenie na siatce lub przy małym wycinku, nie „na oko”.
- Nazwa pola = nazwa kolumny CSV. Dopisuj nowe akty na końcu (bez duplikatów).
- Test v0: akty 62–63 (wykonał Sonnet z siatką współrzędnych) — trafność dobra; zadanie dla Haiku to zweryfikować tę trafność na kilku aktach.

## 5c. Poprawki po teście (daty, miejsca, reguły)
- **Data zgonu ≠ data aktu.** Akt zaczyna się datą spisania („Działo się … dnia …”), a data zgonu jest w zdaniu „oświadczyli, że dnia … umarł”. „Dnia wczorajszego” = data aktu minus 1 dzień, „dzisiejszego” = data aktu. Zawsze sprawdzaj to z numerem aktu w sąsiednich aktach (daty rosną z numerem) i z datą w Lubgens.
- **Miejsce urodzenia i zamieszkania bierz z tekstu** („tamże urodzony i zamieszkały”, „urodzona w …”), nie z marginesu. Margines bywa miejscem zgonu albo zamieszkania; „tamże” = miejsce zgonu z początku zdania. Gdy w tekście jest tylko „urodzony”, zamieszkanie oznacz jako niepewne.
- **Miejsce zgonu** wypełniaj zawsze (nie zostawiaj pustego); szpital: `Szpital Janów Lubelski` jako miejsce zgonu, a zamieszkanie osobno.
- **Reguły:** panna/kawaler – bez małżonka; mężczyzna – nazwisko rodowe puste (nazwisko jest rodowe); dziecko – bez zawodu, chyba że wymieniony.
- **Pisownia przyimków:** „umarł w Blinowie / w kolonii X / w Kacyńcu / w Brzozówce” (nie „z Blinowa”).
