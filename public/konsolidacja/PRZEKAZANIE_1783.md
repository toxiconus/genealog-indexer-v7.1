# Przekazanie: akty chrztu Blinów 1783 (zdjęcie strony + edytor)

Gałąź: `ocena/ocr-i-plan-2026-10-23`. Repo: `/home/claude/genealog-indexer-v7.1`.

## Cel
Użytkownik chce zestawić wpisy z księgi chrztów Blinowa z 1783 roku (łacina, ręczny odczyt, bez OCR)
i utrzymać spójność między edytorem HTML, plikami TXT i CSV. Zasada nadrzędna: nie tracić danych.

## Źródła
- `public/konsolidacja/blinow_scalone.csv`: oryginalne akty 1783 z rodzicami (48 wierszy, z ojcem u 47). Nie edytować.
- `public/konsolidacja/akty_1783_scalone.csv`: kopia 48 aktów 1783 z pierwszą kolumną `wiersz_zrodlo` = id aktu (`CH.LUB.BLIN.1783.xxx`). Ta kopia jest źródłem edytora.
- `public/konsolidacja/partie/chrzty_partia01_karty_1783_1785.csv`: 44 wpisy 1783, ale typu `karta` (karty osobowe). Nie mają rodziców i nie są aktami. NIE scalać z aktami po nazwisku (tylko 29 wspólnych par nazwisko+imię).
- `public/chrzty orginał Blinów.txt`, `CH BLIN.txt`, `chrzty_cleaned.txt`: kopie tekstowe. Nie edytować bez potwierdzenia, rozbieżności wypisywać w raporcie.
- Zdjęcie strony: `/mnt/user-data/attachments/3e7ce577-16ba-54bc-8dbe-e2ba98a801b3/97f6da85-image.jpg` (w sesji; w repo go nie ma). Nagłówek: „Liber primus Baptisatorum … ANNUS 1783”, Blinów, łacina. Użytkownik potwierdził rok 1783 (nie 1703).

## Edytor
- Szablon: `public/konsolidacja/narzedzia/edytor_korekt_szablon.html`. Build: `cd public/konsolidacja/narzedzia && python3 -I build.py <plik_wyjściowy>`. Wynik nie jest w repo.
- Księgi: `ch` (partie), `mal`, `zg`, `ak` (Akty 1783 — 48 aktów z rodzicami, dodana w `a992884`).
- Zakładka „Skan i kreator” (commit `9ccc8e6`): przesuwanie, zoom, obrót, zaznaczanie wielu aktów na skanie, kreator pól (tryb po aktach / po polach dla zaznaczonych aktów), eksport `ksiega_1783_akty.csv`. Zapis w localStorage (`ST.skan`). Składnia sprawdzona, NIE przetestowana w przeglądarce, eksport nie sprawdzony.

## Dotychczasowe zmiany w danych
- Akt 17 (Elżbieta Szopa): ojciec `Szopówna` → `Szopa` (łacina „Josephi Szopa”). Commit po `a992884`. Oryginał w `blinow_scalone.csv`.
- Pomyłka wcześniejsza: „konflikt” w wierszu 1 (Wojciech/Zofia vs Adalbertus/Sophia) NIE istnieje: Adalbertus = Wojciech, Sophia = Zofia.

## Odczyt zdjęcia, wpisy 1–19 (ręczny, niepewny)
Porównanie z danymi (`akty_1783_scalone.csv`) — zgodne: 1, 2, 3, 4, 5, 6, 7a/7b (bliźnięta), 10, 11, 12, 13, 14, 15, 16, 17, 19 (imiona, ojcowie, matki).
Do sprawdzenia:
- **2b** (Agnieszka, Blinów, bliźnięta z 2) — na zdjęciu nie widać.
- **8 / 9** — na zdjęciu „8” to notatka „Brzyska omnes de Maydan”, akt Kudrelka jest oznaczony 9; w danych nr 8. Rozstrzygnąć na oryginale.
- **9** (Blinów 31, Pcionek?) — dolny róg nieczytelny.
- **18** — ojciec Simon: na zdjęciu „Lastyga/Laszyga?”, w danych „Pastyga”. Pierwsza litera niepewna. Dotyczy też 19.
- **Chrzestni** — większość nieczytelna lub częściowa; w danych tylko w kolumnie surowej łacińskiej.
- **Daty dni** (np. „ij 2 Januarij”, „ij 7”, „ij 16”) — na zdjęciu są, w CSV pola daty puste. Do uzupełnienia.
- **Miejscowość 11** — w danych „Majdan Moczydła”, na zdjęciu „Maydan”.

Potwierdzone przez użytkownika: „Josephi Szopa”. Resztę użytkownik sprawdzi na komputerze.

## Reguły obowiązujące (od użytkownika)
- Najpierw czytać z obrazu, dopiero potem szukać w danych (kolejność wpisów nie jest alfabetyczna, to kolejność aktów).
- Nie poprawiać nazwisk i imion bez pewności; oczywiste literówki i małe litery na początku poprawiać i logować. Zachować obie pisownie.
- Wiek: `~RRRR` (rok aktu − wiek) z surowym tekstem; liczba bez jednostki = lata; `t.` = tygodnie, `m.`/`mcy` = miesiące.
- `liber` = brak numeru księgi; `typ_ksiegi` = „Liber primus Baptisatorum” dla tej księgi (dla zgonów „Liber mortuorum”).
- Pracować od najstarszych wpisów. Po każdej zmianie: commit i push na tę gałąź, z trailerami Co-Authored-By i Claude-Session.
- Przy wolnym tekście nie używać parserów do ręcznego przepisywania. Przy niepewnych odczytach zaznaczać jako niepewne.

## Otwarte decyzje / następne kroki
1. Użytkownik sprawdza resztę na komputerze (pozycje powyżej).
2. Przetestować zakładkę „Skan i kreator” w przeglądarce na obrazie testowym (`scratchpad/edytor/skan_testowy_001.png`) oraz eksport CSV.
3. Ustalić, czy wpisy z odczytu zdjęcia mają trafić do osobnego pliku (np. `akty_1783_zdjecie.csv`) i porównać je z `akty_1783_scalone.csv` pozycja po pozycji.
4. Strony z późniejszymi rocznikami i brakiem numeracji — przyjdą później, najpierw ustalić zasady dla nich.
5. Wizard z przeszłości użytkownika nie zachował się w sesji; „Kreator” jest moją rekonstrukcją. Użytkownik ma potwierdzić, czy odpowiada.
