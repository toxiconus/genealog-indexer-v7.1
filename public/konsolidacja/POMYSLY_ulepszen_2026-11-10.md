# Pomysły na ulepszenia (z audytu zewnętrznego, 2026-11-10) – do przemyślenia na potem

Źródło: uwagi z zewnętrznego modelu, który oglądał tylko `baza_zgonow_1797-1945_MINI_bez_skanow.html`. Nic z tego nie jest jeszcze wdrożone ani zatwierdzone. Zasady stałe z `PRZEKAZANIE_2026-11-10_*.md` pkt 1 mają pierwszeństwo (m.in. nic nie scala się samo).

## Już w planie (pkt 5 przekazania)
- Model Osoba / Wystąpienie / Relacja; propozycje scaleń z punktacją, zatwierdzane przez użytkownika (kroki b, e).
- Eksport GED z zatwierdzonych klastrów (krok f).
- Historia zmian, import/eksport CSV (powłoka, krok c).
- Priorytet zewnętrzny (Osoba + łączenie, warianty nazwisk i dat, raport sprzeczności) jest zgodny z kolejnością planu.

## Nowe, warte rozważenia
1. **Raport sprzeczności genealogicznych**: dziecko starsze od rodzica lub po jego śmierci, ślub przed realnym wiekiem, zgon przed ślubem, różne daty urodzenia tej samej osoby, brak ojca/matki gdy inne akty je podają. Rozszerzenie istniejących „Sygnałów i kontroli”.
2. **„Pytania do rozwiązania”**: lista wątpliwych przypadków z powodem (zgodne z zasadą: wątpliwości do aplikacji, nie do czatu).
3. **Pasek „tożsamość osoby”** przy akcie: szac. rok urodzenia, małżonek, rodzice, poprzednie i późniejsze akty tej osoby; karta osoby.
4. **Wyszukiwanie**: fonetyczne i wieloznaczne (`Kow*ski`), warianty historyczne nazwisk, przedziały dat i wieku, słownik zawodów (rolnik / włościanin / kmieć), słownik miejscowości z wariantami, filtr „ma skan”.
5. **Wyszukiwanie brakującego małżonka** (kobiety o nazwisku X zmarłe w latach Y–Z, mąż mógł być Y).
6. **Kolejka pracy**: Do transkrypcji / Do weryfikacji / Wymaga skanu / Konflikt danych / Gotowe; skróty klawiszowe (zatwierdź pole, następny/poprzedni akt, „do weryfikacji”, przełącz skan).
7. **Skan**: stałe powiązanie pole ↔ fragment obrazu (rozwinięcie ROI), powiększenie, kontrast.
8. **Mini-drzewo wokół aktu** (rodzice, małżonek, dzieci) z oznaczeniem pewności relacji.
9. **Statystyki zbioru** (akty, lata, nazwiska, zawody, rozkład wieku zgonu, braki).
10. **Kreator poszukiwań** (co i gdzie szukać dla brakującej daty) – zgodnie z zasadą trzymać poza GED, w plikach `HIPOTEZY_*`.
11. Tryb mobilny ze zdjęciem aktu; automatyczne kopie zapasowe z przywracaniem wersji (częściowo pokrywa eksport CSV przed podbiciem `D.key`).

## Uwaga
Zewnętrzny model nie widział repo ani skanów; część pozycji (historia zmian, warianty pisowni) może już być w aplikacji. Przed wdrożeniem sprawdzić w szablonie `weryfikacja_szablon_v3.html`, co istnieje.

## Audyt paczki narzędzi (2026-11-10, drugi przebieg)
Audytor dostał zip narzędzi (bez CSV). Zalecenia, ocenione względem planu:
- **Zgodne z planem:** wspólny model Akt → Wystąpienie → Osoba → Relacja; nie scalać automatycznie; najpierw model na prawdziwych rekordach (chrzty, małżeństwa, zgony), potem przenoszenie narzędzi.
- **Nowe:**
  1. Kandydat do scalenia ma **uzasadnienie**, nie jedną liczbę: zgodności, rozbieżności, braki danych, wniosek (sprawdź / możliwe / konflikt / odrzucone).
  2. Sygnały w 3 poziomach: **sprzeczność logiczna**, **anomalia**, **wskazówka** (także dla rodziny, nie tylko aktu).
  3. Historia zmian jako dziennik wszystkiego (słowniki, propozycje tożsamości, relacje, scalenia) z cofaniem scalenia bez kasowania źródeł i wystąpień.
  4. Trwały rejestr wystąpień i osób (`os:<akt>:<rola>` w `model.js` to nadal osobne obiekty); `mAttr()` zapisuje tylko wartość i status, brak `unc` i `source` z architektury.
  5. Wszystkie narzędzia budowane z `wspolne/` przez `zbuduj.py`, z kontrolą, czy wstawiono wymagane moduły (`weryfikacja_szablon_v3.html` ma kopie modułów wklejone na stałe).
  6. `templates-config.js`: równoległe typy `chrzest` i `birth`; najpierw mapowanie pól do jednego modelu, bez usuwania.
  7. Skany identyfikowane samą nazwą pliku (kolizja przy takich samych nazwach).
  8. Przeniesienie stanu roboczego z localStorage do IndexedDB; walidacja i wersjonowanie importu JSON; kopia bezpieczeństwa z przypomnieniem; eksport CSV nie powinien oznaczać „zapisano”, bo nie obejmuje historii.
  9. Audyt `innerHTML` pod kątem escapowania danych z importu.
- **Sprawdzone i naprawione w kodzie (2026-11-10):** `dzien()` w `wspolne/raport.js` przyjmowała nieistniejące daty (2020-02-31); import CSV odczytu AI używał `split(';')` zamiast `parseCsv()`.
- **Do sprawdzenia:** ranking scaleń zgonów ma 13 „mocnych” (A), 223 + 77 jedynych (B), 584 wielu kandydatów (C), 226 bez kandydata (D); skuteczność algorytmu ocenić po dołączeniu CSV i kodu generującego.
- **Poprawki `dzien()` nie wprowadzono** do wygenerowanych plików: `dopasowanie_osob.html`, `weryfikacja_zgonow_ASC_1870-79.html`, `dane/zgony_1935_mini.html`, `dane/zgony_1943-45_mini.html` (przebudować ich skryptami).
