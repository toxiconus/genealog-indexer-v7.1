# Haiku – księga zgonów Blinów 1935 (wersja v3)

Obowiązuje `HAIKU_ZALOZENIA.md` i `HAIKU_DYSPOZYCJE_ROCZNIK.md` (oszczędzanie tokenów: każdą stronę oglądasz RAZ, wynik od razu do pliku, w czacie jedno zdanie na stronę). Poniżej tylko różnice dla 1935.

## Wzorzec
Akty 1–2 odczytane przez Sonneta: `ZGONY_1935_ai1_import.csv` (wiersze 001, 002), `ZGONY_1935_ai1_pelny_tekst.md`, `ZGONY_1935_ai1_roi.json`. Zrób identycznie: te same kolumny, ID `ai1-1935-NNN`, `verification_status=ai_v1`, `source_office=USC Blinów`, `death_time` jako `HH:MM`, `officiant` wg podpisu.

## Format aktu 1935 (przedwojenny)
Margines: miejscowość (Blinów / Brzozówka / Moczydła…) + imię i nazwisko zmarłego. Tekst: data aktu, godzina, dwaj świadkowie („pełnoletni rolnicy z …”), data i godzina zgonu („wczorajszego”, „dnia bieżącego” → licz względem daty aktu, zapisz w `notes`), miejsce, imię, „z [rodowych]ów” nazwisko, wiek, zawód / „wdowa po …”, miejsce urodzenia i zamieszkania, rodzice („syn/córka X i Y z Z-ów”), „Pozostawił/a po sobie owdowiałego męża/żonę …” (→ `deceased_spouse` z `(owd.)`), na końcu podpis proboszcza i świadków. Stan cywilny z treści. Dziecko: bez zawodu i małżonka. Nazwisko rodowe kobiety = nazwisko ojca w formie żeńskiej; dla mężczyzn puste.
Znaczniki: `[_]` nie podano, `[-]` nie dotyczy, `[niecz.]`, `[nieznane]`, `[uszk.]`, `[skreśl.]`; niepewne = `?` na końcu wartości i id pola w `uncertain_fields`. Miejscowości w mianowniku.
Podpis proboszcza: akty 1–22 zawijas nieczytelny `[niecz.]`; akty 27–30 „Ks. Bielawski”; 35–36 „Ks. K. Wojtan”; w pozostałych zapisz co widać (podpisy świadków w `notes`). Akt bez „przez Nas i świadków”/z adnotacją „niepiśmienny” – odnotuj w `notes`.

## Skany i ROI
Skany leżą w `/home/claude/skany_v3_1935/` (NIE kopiuj ich do repo). Jedna rozkładówka = 4 akty: lewa góra, lewa dół, prawa góra, prawa dół (numery rosnące w tej kolejności). ROI ułamkowe jak we wzorcu.
Mapa plików: `ade18066-image.jpg` akty 3–6; `ed11c62d` 7–10; `a7e50cb7` 11–14; `7e11233d` 15–18; `3bea73c6` 19–22; `2990abf3` 23–26; `d61d71fb` 27–30; `ba3cfbeb` 31–34; `685f8df8` 35–36 (prawa strona pusta).

## Wyniki (równolegle – każdy agent własne pliki)
Zapisuj do `czesci_1935/<ID_AGENTA>_import.csv` (z nagłówkiem), `<ID_AGENTA>_pelny_tekst.md`, `<ID_AGENTA>_roi.json`; Sonnet je scali. Nie ruszaj plików `ZGONY_1935_ai1_*`.
