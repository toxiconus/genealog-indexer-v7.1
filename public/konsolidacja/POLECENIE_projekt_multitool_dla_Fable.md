# Polecenie dla agenta projektującego „Multitool dla genealoga” (do uruchomienia w piątek)

Uruchomienie: agent na modelu Fable, w tle, w repo `toxiconus/genealog-indexer-v7.1` (gałąź `ocena/ocr-i-plan-2026-10-23`, folder `public/konsolidacja/`). Wynik trafia do `PROJEKT_multitool/` i jest commitowany oraz pushowany na tę gałąź.

## Treść polecenia

Projektujesz jedną, spójną aplikację („Multitool”) do indeksowania i łączenia akt parafii Blinów, Brzozówka i Moczydła (księgi chrztów, małżeństw, zgonów 1797–1945, spisy, inwentarze). Dziś istnieje kilkanaście osobnych plików HTML, które nie dzielą modelu osób. Twoim zadaniem jest **projekt**, nie przepisywanie wszystkiego.

### Najpierw przeczytaj (w tej kolejności)
1. `PRZEKAZANIE_2026-11-10_baza_zgonow_i_plan_scalenia.md`: zasady stałe w pkt 1 obowiązują bezwzględnie; pkt 5 to obecny plan.
2. `ARCHITEKTURA_SYSTEMU_INDEKSACJI.md`, `PLAN_ROZWOJU_GENEALOGA.md`, `INWENTARZ_REPO.md`, `POMYSLY_ulepszen_2026-11-10.md` (zawiera też dwa audyty zewnętrzne).
3. Kod: `wspolne/*.js`, `narzedzia/weryfikacja_szablon_v3.html`, `narzedzia/buduj_baza_v4.py`, `dopasowanie/szablon.html`, `haiku/weryfikacja_malzenstw_szablon.html`, `haiku/SPISY_BLINOW_weryfikacja_mini.html`, `../v6/templates-config.js`.
4. Dane (tylko próbki, nie czytaj całości): `zgony.csv`, `blinow_scalone.csv` (chrzty), `malzenstwa_mal.csv`, `haiku/ODCZYTY/RANKING_scalen_zgony.csv`, `haiku/ODCZYTY/lm/*.csv`, `haiku/ZATWIERDZENIA/`.

### Ograniczenia (twarde)
- Nic nie scala się automatycznie: system tylko proponuje, użytkownik zatwierdza; scalenie można cofnąć bez kasowania źródeł i wystąpień.
- Nie tracić żadnych dotychczasowych funkcji ani danych; najpierw zachować, potem konsolidować.
- Działanie offline, wersja „pojedynczy plik HTML” budowana skryptem z modułów (`wspolne/`, `zbuduj.py`); wersja „folder” do repo.
- Dane w repo publicznym: tylko archiwalne, bez danych osobowych z drzewa GED.
- Każde pole: `value`, `status` (ai/lub/ok), `unc` (niepewne), `source` (plik, skan, strona).
- Wątpliwości trafiają do aplikacji jako „niepewne”, nie do rozmowy.
- Pisać po polsku, zwięźle.
- Przed każdą zmianą klucza stanu przeglądarki: eksport zatwierdzeń CSV (ryzyko utraty).

### Wynik, który masz oddać (w `PROJEKT_multitool/`)
1. `MODEL_DANYCH.md` plus przykład `dane_przyklad.json`: Akt, Źródło, Wystąpienie (rola w akcie), Osoba (klaster wystąpień), Relacja, Decyzja (historia scaleń z cofaniem). Mapowanie istniejących pól: zgony (ORDF/LATF/CAUSEF), chrzty (`chrzest`/`birth` w `templates-config.js`), małżeństwa, spisy.
2. `MODULY.md`: lista modułów (core, db, sources, identity, relations, audit, history, search, import/export, ui) z interfejsami, zależnościami i tym, które istniejące funkcje się do nich przenoszą.
3. `SCALANIE_OSOB.md`: reguły propozycji z uzasadnieniem (zgodności, rozbieżności, braki danych, wniosek), bez jednej liczby punktów; obsługa wariantów nazwisk i imion, wieku niedokładnego, zmian nazw miejscowości; test na próbce z `RANKING_scalen_zgony.csv`.
4. `KONTROLE.md`: sygnały w trzech poziomach (sprzeczność / anomalia / wskazówka), także dla rodziny.
5. `PLAN_WDROZENIA.md`: małe kroki, każdy z działającą wersją i kryterium odbioru; przechowywanie (IndexedDB, kopie bezpieczeństwa, walidacja i wersjonowanie importu); migracja istniejących zatwierdzeń.
6. `RYZYKA.md`: rozmiar pliku, utrata zatwierdzeń, kolizje nazw skanów, escapowanie `innerHTML`.
7. (Opcjonalnie, tylko jeśli został budżet) mały działający rdzeń: `dane.json` z ok. 200 rekordów z prawdziwych danych plus widok osoby z propozycjami scaleń, zbudowany z `wspolne/`.

### Oszczędność
Nie czytaj pełnych CSV ani plików ze skanami; używaj próbek (`head`, losowe wiersze). Nie generuj pełnej aplikacji. Zacznij od dokumentów 1–6, potem zdecyduj o pkt 7.
Po zakończeniu: commit i push, trailery `Co-Authored-By` i `Claude-Session` z przypomnienia sesji, krótkie podsumowanie (do 10 linii) i lista otwartych decyzji dla użytkownika.
