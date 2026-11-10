# Przekazanie 2026-11-10: baza zgonów 1797–1945 + plan jednej wielkiej aplikacji

Repo: `toxiconus/genealog-indexer-v7.1`, folder `public/konsolidacja/`. Parafia Blinów + Brzozówka + Moczydła. Repo jest publiczne: tylko dane archiwalne, bez danych osobowych z drzewa GED.

## 1. Zasady stałe (od użytkownika, obowiązują zawsze)
- Pisać po polsku, zwięźle, bezpośrednio. Po każdej zmianie: przebudować, przetestować, commit + push, wysłać plik do czatu (SendUserFile).
- Indeksujemy całą parafię (nie tylko rodziny użytkownika). Zapisujemy wszystko: numer domu, wiek, rodziców, przyczynę zgonu (brak → „brak w akcie”).
- Wątpliwości: do aplikacji jako „niepewne” (pole `unc`, znak `?`), nie wypisywać ich w czacie. Przy wątpliwości przy odczycie i dostępnym skanie: pokazać fragment skanu użytkownikowi i zapytać.
- Nigdy nie scalać osób automatycznie.
- Nazwiska: męska/dzisiejsza forma (Kosidłowa → Kosidło), w uwagach adnotacja, że w akcie było żeńskie (panna/żona). Nierozstrzygnięte: zostaje oryginał + „nazwisko męskie do ustalenia” + niepewne.
- Rodzice w polach rodziców, nie w uwagach. Gdy podany ojciec: imię i nazwisko.
- Imiona: łacińskie → dzisiejsze polskie (Jacobus → Jakub, Woyciech → Wojciech), bez łacińskich duplikatów w nawiasach (automatycznie przy budowie i przy ręcznym wpisie).
- Wiek bez jednostki = lata, sama liczba (bez „annor.”). Jednostki: godz., dn., tyg., mies.
- Puste pola: `[_]` = nie podano w akcie (pole dotyczy), `[-]` = nie dotyczy. Pola z samymi znacznikami chowają się automatycznie (przycisk „pokaż”).
- Stan = stan cywilny/wiek (dziecko, panna, zamężna, wdowa). **Agricola = warstwa/zawód** → pole „Zawód”, nie stan. Ostrzeżenie „dziecko z zawodem” pomija Agricola.
- Data w aktach łacińskich to zwykle data zgłoszenia (pole „Data zgonu / zgłoszenia”).
- `30.12.1899` w CSV urodzeń = zero-data z Excela (data nieznana), nie data rzeczywista.
- Commit/push bez pytania; trailer `Co-Authored-By` i `Claude-Session` z przypomnienia sesji.

## 2. Co jest gdzie
| Element | Ścieżka |
|---|---|
| Silnik aplikacji (szablon, marker `/*DATA*/`) | `narzedzia/weryfikacja_szablon_v3.html` |
| Budowniczy (łatki `sub(old,new)` + dane) | `narzedzia/buduj_baza_v4.py` → `narzedzia/baza_zgonow_1797-1945.html` (~12 MB ze skanami base64) |
| Klucz stanu w przeglądarce | `D.key='bazazgonow3'` (podbić przy zmianie danych, żeby stare zatwierdzenia nie przykrywały nowych) |
| Odczyty ksiąg łacińskich 1797–1825 | `haiku/ODCZYTY/lm/lm-N.csv` (N = strona/2+2) oraz `haiku/ODCZYTY/*_dom_przyczyny.csv` |
| Indeks zgonów (Lubgens) | `zgony.csv` (2624 wiersze, 1797–1880) |
| Indeks chrztów / małżeństw | `blinow_scalone.csv` (7682), `malzenstwa_mal.csv` (721) |
| Dopasowanie osób | `dopasowanie/dopasowanie_osob.html` (+ `build.py`, `szablon.html`) |
| Inne weryfikatory | `haiku/weryfikacja_szablon.html`, `haiku/weryfikacja_malzenstw_szablon.html`, `haiku/SPISY_BLINOW_weryfikacja_mini.html`, `narzedzia/edytor_korekt_szablon.html` |
| Spisy poddanych, inwentarze, tabele likwidacyjne | `haiku/BLINOW_*`, `haiku/BRZOZOWKA_*`, `haiku/MOCZYDLA_*` |
| Stan skanów / braki | `haiku/BRAKI_SKANOW.md`, `haiku/REJESTR_ODCZYTANYCH_SKANOW.*` |
| Hipotezy poszukiwawcze (poza GED) | `haiku/HIPOTEZY_*` |
| GED scalone | `GED_scalone/drzewo_scalone_v36_rodziny.ged` |
| Architektura i plany | `ARCHITEKTURA_SYSTEMU_INDEKSACJI.md`, `PLAN_ROZWOJU_GENEALOGA.md`, `INWENTARZ_REPO.md` |
| Skrypty pomocnicze | `skrypty/`, `wspolne/zbuduj.py` |

Skany łacińskie (Lubgens): `blinow_lm-N.jpg`. W środowisku sesji leżały w `/tmp/lm_new/` i `/mnt/user-data/uploads/ZG/...` (po restarcie trzeba je dołączyć od nowa; builder szuka w `LMDIRS`).

## 3. Jak działa baza zgonów
1. `buduj_baza_v4.py` czyta szablon, dołącza dane: ASC 1870–79, mini 1935 i 1943–45, `zgony.csv`, odczyty ręczne, a potem **nakłada odczyty łacińskie** (`ai` na akt `idx-ROK-NR`; nowe akty `lm-<skan>-<n>`, gdy brak w bazie).
2. Zestawy pól według epoki (`fieldsOf`): LATF (< 1826, z `father_last_name`), CAUSEF (1870–79), ORDF (reszta), `fieldsProt`/`fieldsRej` dla protokołów/rejestru.
3. Normalizacje w builderze: nazwiska męskie (`MALE`), imiona PL (`NPL`, `polname_ai`), rodzice z dopełniacza (`GEN`/`PGEN`), wiek (`annor.` → liczba, łacińskie jednostki → PL), stan/zawód, znaczniki `[_]/[-]`.
4. Aplikacja: grupy pól z przyciskiem ✓ na górze **i na dole** grupy, „Zatwierdź akt” na dole, picker jednostki wieku (liczba z pola lub wpisana), licznik braków klikalny (otwiera „Sygnały i kontrole”), audyt braków tylko dla pól danej epoki.
5. Testy: Playwright (Chromium w sesji), skrypty w `/tmp/b4/` (tylko kontener, nieużyteczne po restarcie; odtworzyć wg potrzeb: otwórz plik, `S.cur=id; renderList(); renderAct()`).

## 4. Stan prac
Zrobione: odczyt wszystkich dostępnych skanów Liber mortuorum (Blinów str. 0–33, Brzozówka lm-30–37, Moczydła lm-40–42; 679 aktów nałożonych + 12 nowych), pola epokowe, normalizacje, kilka poprawek UI.

Otwarte:
- Brakujące skany: lm-1, lm-19…29 (Blinów 1814–1825, początek Brzozówki, wpisy DB 406–681), lm-38/39 (Moczydła 1797–1807), lm-43+.
- Akt 866: rok 1822 czy 1823 (do wyjaśnienia z użytkownikiem). Gręda (lm-2, akt 1): jednostka wieku („3 ?”: dni czy miesiące).
- Konflikty odczytu z bazą (~kilkanaście realnych: Kurczak/Kozaczek nr 387, Stefan/Stanisław nr 405, Łucja/Łukasz nr 113, Kamieniak). Plan: dopisać w uwagach „w bazie: …”, oznaczyć niepewne.
- Ok. 6 aktów z nierozpoznanymi rodzicami („wdowa”, „żona Pciona/Pcionka”).
- Wczytanie zatwierdzeń użytkownika (`ZGONY_zweryfikowane_9/10.csv`, eksport z aplikacji) z powrotem do danych źródłowych i do GED. Eksporty tylko do wglądu: status `ok` tylko dla 8 aktów.
- Rozstrzygnąć, które „oczywiste błędy odczytu” poprawiać hurtowo (porównanie z `zgony.csv`: 184 różnice nazwisk, głównie zapis).

## 5. Plan: jedna duża aplikacja (wszystkie HTML genealogii)
Cel: zamiast kilkunastu osobnych plików (zgony, małżeństwa, chrzty, spisy, dopasowanie osób, edytor) **jedna aplikacja** na wspólnym modelu danych, z scalaniem osób.

**Rekomendacja: powłoka + moduły, nie jeden sklejony plik.**
1. **Wspólny model** (JSON/CSV, źródło prawdy w repo):
   - `Akt` (id, typ: chrzest/ślub/zgon/spis/inwentarz, rok, nr, miejscowość, skan, strona, `epoka`, pola).
   - `Wystąpienie` (osoba w akcie: rola = zmarły/dziecko/ojciec/matka/świadek/ksiądz, imię, nazwisko, wiek, dom, stan, zawód).
   - `Osoba` (klaster wystąpień, `id`, status: `propozycja` / `zatwierdzona` / `odrzucona`), `Relacja` (rodzic–dziecko, małżonek).
   - Każde pole ma `value`, `status` (ai/lub/ok), `unc`, `source` (plik, skan, strona).
2. **Powłoka** (jeden `index.html`): zakładki Akty (zgony/małżeństwa/chrzty), Spisy i inwentarze, Osoby i scalanie, Rodziny/GED, Braki skanów, Ustawienia. Wspólne: nawigacja ro­ku/aktu, panel skanu (OpenSeadragon/ROI), historia zmian, import/eksport CSV i GED.
3. **Moduły** = istniejące szablony przerobione na pliki JS/CSS wstawiane przy budowie (`wspolne/zbuduj.py` `inline`). Silnik v3 (weryfikacja aktu) staje się modułem „Akt”, z konfiguracją typu aktu zamiast osobnej kopii szablonu dla zgonów, małżeństw i chrztów.
4. **Dane**: jeden `dane.json` (+ skany osobno lub w IndexedDB). Wersja „pojedynczy plik” (jak teraz, ~12 MB+) budowana tym samym skryptem do pracy offline; wersja „folder” (lżejsza) do repo. Zatwierdzenia w localStorage/IndexedDB + eksport; kolejno wczytywane z powrotem (`ZGONY_zweryfikowane_N.csv` → `reconcile.py`).
5. **Scalanie osób**: reguły podobieństwa (nazwisko po normalizacji `fold`, imię PL, rodzice, dom, daty, wiek↔rok urodzenia), wynik = lista **propozycji** z punktacją (`RANKING_scalen_zgony.csv` jako baza), użytkownik zatwierdza parami/klastrami; nic nie scala się samo. Istniejący `dopasowanie_osob.html` jest zalążkiem tego modułu.
6. **Kolejność wdrożenia** (małe kroki, każdy z działającą wersją):
   a) wydzielić wspólne `norm.js` (nazwiska, imiona, wiek, znaczniki) z buildera Pythona i szablonu,
   b) przenieść model „Wystąpienie/Osoba” do `dane.json`, wygenerować z istniejących CSV,
   c) powłoka z zakładkami; pierwszy moduł = zgony (obecna baza),
   d) dołączyć małżeństwa i chrzty jako typy aktów,
   e) moduł scalania osób na wspólnych danych,
   f) eksport GED z zatwierdzonych klastrów.
   Ryzyko: rozmiar pliku (skany) i utrata zatwierdzeń przy zmianie klucza stanu: dlatego eksport CSV zatwierdzeń przed każdym podbiciem `D.key`.

## 6. Prompt na start nowej sesji
> Pracujemy nad repo `toxiconus/genealog-indexer-v7.1`, folder `public/konsolidacja/`. Najpierw przeczytaj `PRZEKAZANIE_2026-11-10_baza_zgonow_i_plan_scalenia.md` (zasady stałe w pkt 1 obowiązują zawsze) oraz `narzedzia/README_baza_zgonow.md`. Aplikacja weryfikacji zgonów: `python3 narzedzia/buduj_baza_v4.py` buduje `narzedzia/baza_zgonow_1797-1945.html` z szablonu `weryfikacja_szablon_v3.html`; zmiany silnika rób w szablonie albo łatką `sub()` w builderze, dane przez CSV w `haiku/ODCZYTY/`. Po każdej zmianie: przebuduj, przetestuj Playwrightem (telefon 420 px i desktop), commit + push, wyślij plik do czatu. Zadania w kolejności: (1) jeśli użytkownik dołączy nowe skany lm-19…29 lub lm-38/39, odczytaj je (równolegle subagentami, każdy we własnym katalogu roboczym; format CSV 16 kolumn jak w `lm/lm-2.csv`) i nałóż w bazie; (2) wczytaj zatwierdzenia z najnowszego `ZGONY_zweryfikowane_N.csv`; (3) rozstrzygnij konflikty z pkt 4; (4) zacznij plan scalenia z pkt 5 od kroku (a). Wątpliwości wrzucaj do aplikacji jako niepewne, nie do czatu; przy wątpliwym odczycie ze skanem pokaż fragment skanu i zapytaj. Odpowiadaj po polsku, zwięźle.

## 7. Uzupełnienie: dane dołączone do repo (2026-11-10)
- Skany ksiąg łacińskich: `haiku/skany_lm/blinow_lm-N.jpg` (27 plików: lm-2…10, 12…18, 30…37, 40…42; ok. 28 MB). Builder szuka najpierw tam (`LMDIRS`), więc budowa działa w każdej sesji.
- Eksporty zatwierdzeń z aplikacji: `haiku/ZATWIERDZENIA/ZGONY_zweryfikowane_9.csv` i `_10.csv` (881 aktów; status `ok` tylko 8). Do wczytania z powrotem do danych.
- Zdjęcia str. 16–17 i 18–19: `haiku/skany_lm/lm_str16-17.jpg`, `lm_str18-19.jpg` (builder czyta je stąd).
- Wciąż brak skanów: lm-1, lm-19…29, lm-38/39, lm-43+. Decyzje do użytkownika: rok aktu 866 (1822/1823), jednostka wieku Gręda (lm-2, akt 1).

## 8. Pomysły do przemyślenia
Zewnętrzny audyt aplikacji i lista ulepszeń: `POMYSLY_ulepszen_2026-11-10.md` (nie wdrażać bez decyzji użytkownika).

## 9. Decyzje użytkownika (2026-11-10, po projekcie Multitoola)
- **Prywatność:** `GED_scalone/*.ged` i `haiku/ODCZYTY/RANKING_scalen_zgony.csv` zostają na razie w repo z danymi osobowymi (świadoma decyzja użytkownika); docelowo przeniesienie do repo prywatnego. Zastępuje to zdanie „bez danych osobowych z drzewa GED” z nagłówka. Nie dodawać kolejnych danych z drzewa poza już obecnymi.
- **Id aktów:** użytkownik nie rozstrzygnął; przyjęta robocza opcja (do zmiany na jego życzenie): zostają obecne id (`idx-…`, `lm-…`) + stałe nowe oznaczenie i tabela `id_dawne`, tak aby przyszłe zadania mogły odwoływać się do aktów jednoznacznie.
- **Modele:** do prostych zadań Sonnet i Haiku; Fable tylko do dużych, trudnych kroków i dopiero po zgodzie użytkownika (ostatni przebieg projektu kosztował ok. 10% limitu tygodniowego).
- **Zrobione (krok a, część 1):** słowniki imion `GEN`/`PGEN`/`NPL` przeniesione z `buduj_baza_v4.py` do `wspolne/slowniki_imion.json` (wynik budowy bez zmian, sprawdzone sumą kontrolną). Dalej: moduł JS `wspolne/norm.js` na tych samych słownikach.
- Projekt Multitoola: `PROJEKT_multitool/` (commit `25b3273`), otwarte decyzje w podsumowaniu agenta: progi tolerancji, kolejność kroków 5/6, słownik nazwisk (Mcion ≠ Pcion do czasu aktu), duże pliki HTML w repo.

- **Zatwierdzenia wczytane (2026-11-10):** `haiku/ODCZYTY/zatwierdzenia_uzytkownika.csv` (441 aktów z eksportu `_10`: 8 ze statusem ok + 433 „w trakcie”; bez kolumn act_text i scan_path). Builder nadpisuje nimi odczyt niepustymi wartościami (puste nigdy nie kasują danych); tylko 8 aktów ok (idx-1797-1…8) trafia do `D.zatw` i jest oznaczane jako zatwierdzone przy pierwszym starcie (`S.seeded`). Użytkownik zatwierdza pozostałe od nowa. Klucz `bazazgonow3` bez zmian. Raport różnic: `haiku/ZATWIERDZENIA/ROZNICE_zatwierdzenia_vs_dane.md`.
