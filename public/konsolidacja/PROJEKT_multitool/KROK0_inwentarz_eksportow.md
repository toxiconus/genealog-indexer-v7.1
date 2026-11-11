# Krok 0: inwentarz eksportów (zabezpieczenie)

Stan repo na gałęzi `ocena/ocr-i-plan-2026-10-23` (HEAD `1391ad8` przed raportem). Sprawdzono pliki śledzone przez git (`git ls-files`) oraz kod narzędzi. Daty to daty ostatniego commitu pliku, nie daty eksportu.

## Tabela

| Eksport | Stan | Plik w repo | Data (commit) | Wiersze |
|---|---|---|---|---|
| Zgony: kopia JSON („Wszystko w jednym pliku”) | BRAK | — | — | — |
| Zgony: eksport CSV (zatwierdzenia, nowsza wersja) | JEST | `public/konsolidacja/haiku/ZATWIERDZENIA/ZGONY_zweryfikowane_10.csv` | 2026-11-10 | 881 aktów; `verification_status`: ok 8, ai_v1 440, ai_v1_w_trakcie 433; id unikalne |
| Zgony: eksport CSV (starsza wersja) | JEST | `public/konsolidacja/haiku/ZATWIERDZENIA/ZGONY_zweryfikowane_9.csv` | 2026-11-10 | 881 aktów; ok 4, ai_v1_w_trakcie 435, ai_v1 442 |
| Zgony: nakładka edycji użytkownika (CSV) | JEST | `public/konsolidacja/haiku/ODCZYTY/zatwierdzenia_uzytkownika.csv` | 2026-11-10 | 441 aktów; ok 8, ai_v1_w_trakcie 433 (wejście do `--wszystko`) |
| Małżeństwa: kopia JSON | BRAK | — | — | — |
| Małżeństwa: eksport CSV weryfikacji | BRAK | — | — | — |
| Dopasowanie: decyzje `dop.v1` (acc/rej/none) | BRAK | — | — | — |
| Edytor korekt: `blinow_edytor_v1` | BRAK | — | — | — |

Uwagi:
- `haiku/ZATWIERDZENIA/ROZNICE_zatwierdzenia_vs_dane.md` to raport porównawczy, nie eksport.
- `haiku/MALZENSTWA_1944/1945_ai1_import.csv` to import odczytów AI, nie eksport weryfikacji użytkownika, więc nie liczy się jako kopia małżeństw.
- `haiku/korekty_tekstow_43_44.json` (283 linie, korekty tekstów 1943–44) nie został przypisany do edytora korekt, bo nie ma w repo dowodu jego pochodzenia. Do potwierdzenia przez użytkownika.
- Zamrożenie `D.key='bazazgonow3'` nie jest plikiem repo, więc nie sprawdzano go tutaj.
- Nie znaleziono pliku kopii JSON zgonów ani żadnego pliku `dop.v1`. Stan tych danych istnieje tylko w localStorage przeglądarki.

## Czego brakuje

1. Kopia JSON zgonów („Wszystko w jednym pliku”).
2. Kopia JSON i eksport CSV małżeństw (1944–45).
3. Eksport decyzji dopasowania `dop.v1`.
4. Eksport edytora korekt `blinow_edytor_v1`.
5. Świeży eksport CSV zgonów, jeśli od 2026-11-10 były nowe zatwierdzenia (obecny `_10` ma 881 wierszy i 8 pól `ok`).

## Instrukcja dla użytkownika (tylko braki)

1. Otwórz `public/konsolidacja/narzedzia/baza_zgonow_1797-1945.html` i zrób „Wszystko w jednym pliku”. Zapisz jako `haiku/ZATWIERDZENIA/kopia_zgony_RRRR-MM-DD.json`.
2. W tym samym narzędziu zrób „Eksport CSV” (tylko jeśli są nowe zatwierdzenia). Zapisz jako `haiku/ZATWIERDZENIA/ZGONY_zweryfikowane_RRRR-MM-DD.csv`.
3. Otwórz `public/konsolidacja/haiku/weryfikacja_malzenstw_szablon.html`. Zrób kopię JSON i eksport CSV. Zapisz w `haiku/ZATWIERDZENIA/` z prefiksem `malzenstwa_`.
4. Otwórz `public/konsolidacja/dopasowanie/dopasowanie_osob.html` i wyeksportuj decyzje `dop.v1`. Zapisz jako `haiku/ZATWIERDZENIA/dop_v1_RRRR-MM-DD.json`.
5. Otwórz `public/konsolidacja/narzedzia/edytor_korekt_szablon.html`, wyeksportuj korekty `blinow_edytor_v1` jako JSON do `haiku/ZATWIERDZENIA/edytor_korekt_RRRR-MM-DD.json`. Potem daj znać w czacie. Nazwy przycisków w HTML nie były sprawdzane, więc ich dokładne brzmienie potwierdź na ekranie.
