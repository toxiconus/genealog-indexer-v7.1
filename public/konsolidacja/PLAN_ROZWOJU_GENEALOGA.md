# Plan rozwoju warsztatu genealoga (konsolidacja)

Stan: 2026-10-26. Źródła: audyt trzech narzędzi (weryfikacja zgonów, dopasowanie osób, edytor korekt), `ARCHITEKTURA_SYSTEMU_INDEKSACJI.md` i zewnętrzna lista pomysłów (12 punktów). Zasady z architektury obowiązują dalej: nic nie ginie, odczyt maszynowy to propozycja, nazwisk nie poprawiamy bez pewności, skan jest dowodem, hipoteza ≠ fakt, dane drzewa nigdy w repo.

## 1. Zrobione

| Co | Gdzie |
|---|---|
| Moduły wspólne wklejane przy budowaniu (pojedyncze pliki HTML offline) | `wspolne/`: `tekst.js`, `plik.js`, `raport.js`, `historia.js`, `model.js`, `zbuduj.py` |
| Tryby tekstu (pola w tekście, czysty, poprawa, lista), `[?]` z OK/edytuj/pomiń, panel pod kciuk, kolejka | weryfikacja zgonów |
| Zatwierdzanie spójne: pole + powiązane `[?]` + identyczne wartości; odmiany nazwisk po rdzeniach (Dobrzańska ≠ Dobrzyńska: ostrzeżenie, bez scalania) | weryfikacja zgonów |
| Skan: auto-przybliżenie (ramka dokładna lub pasmo orientacyjne), ukrywanie zaznaczeń, ☰ menu | weryfikacja zgonów |
| Kalendarz wieczny, lata przestępne, dzień tygodnia, stary styl (juliański ↔ gregoriański) | weryfikacja zgonów |
| Raport spójności (błąd / ostrzeżenie / uwaga, ignorowanie, CSV) | weryfikacja zgonów, dopasowanie (indeks zgonów) |
| **Wspólna historia zmian z cofaniem** (każda zmiana pola, tekstu, `[?]`, zatwierdzenia aktu; cofnięcie jest nowym wpisem) | weryfikacja zgonów (menu „Historia zmian”) |
| **Wspólny model v1** (osoba, zdarzenie, źródło, relacja ze statusem dowodowym; tożsamość osób z różnych aktów „nierozstrzygnięta”) + eksport JSON | weryfikacja zgonów (menu „Eksport modelu”) |

## 2. Do zrobienia (kolejność)

### P0 – fundament
1. **Historia i model w pozostałych narzędziach.** Podpiąć `historia.js` do dopasowania (decyzje przyjmij/odrzuć/brak) i edytora korekt (zastąpić własny `logChange` wspólnym formatem). Format wpisu: `{n, t, id, k, f, before, after, why}`. *Kryterium:* cofnięcie dowolnej decyzji w każdym narzędziu, ten sam CSV historii.
2. **Model dla chrztów i małżeństw** (`modelZChrztu`, `modelZMalzenstwa` obok `modelZZgonu`) i **jeden plik modelu** scalany z trzech źródeł bez łączenia osób. *Kryterium:* eksport z dopasowania czyta ten sam schemat.

### P1 – wartość z całego zbioru
3. **Uzasadnienie kandydata** w dopasowaniu w formie: zgodności / rozbieżności / brak danych / wniosek („sprawdź, nie scalaj”). Kryteria z `grade()` już istnieją – do sprawdzenia i pokazania. *Kryterium:* każdy kandydat ma trzy listy i zdanie wniosku.
4. **Graf osób i dowodów:** węzły = osoby z modelu, krawędzie = relacje ze statusem (dokument / hipoteza / poszlaka / wskazówka / konflikt / odrzucone) i odsyłaczem do źródła; wycofanie hipotezy nie rusza reszty. Powtarzający się świadek jako wskazówka. *Kryterium:* każda kreska ma źródło.
5. **Powiązanie tekstu ze skanem:** ramki słów (pola, daty, godziny, wiek, rodzice, `[?]`) dla wszystkich aktów – zlecić Haiku (HAIKU_ZALOZENIA §5b), z kontrolą próbki. Do czasu ukończenia zostaje pasmo orientacyjne. *Decyzja do podjęcia:* wszystkie 41 aktów czy tylko pola niepewne i daty.
6. **Silnik chronologii życia** (`chronologia.js`): kontrole na poziomie osoby, nie aktu – dziecko po śmierci ojca, ślub po śmierci małżonka, niemożliwa kolejność, wiek a data urodzenia, krótkie odstępy między dziećmi. Dwa poziomy: **błąd logiczny** (niemożliwe) i **anomalia** (możliwe, nietypowe). Podejrzana konwersja stylu jako osobna reguła.
7. **„Co zależy od tego ustalenia”:** po zmianie daty/pola lista powiązanych wniosków (raport + relacje + kandydaci), bez cichego przepisywania.

### P2 – badania
8. **Rekonstrukcja rodzin i „Rodzina w czasie”:** oś czasu rodziny (urodzenia, śluby, zgony, drugie małżeństwa, przeprowadzki); kandydaci zamiast dopisywania. Wykorzystać istniejące: `buildBirthFamilies`, `bridgeBuild`, `timeline`, `fmRender` z dopasowania.
9. **Wyszukiwarka po tekstach** (`szukaj.js`, gwiazdka/wildcard, także świadkowie i rodzice).
10. **Brakujące dokumenty:** kolejka hipotez badawczych (sprawdzić indeks, rocznik, wariant nazwiska, odrzucić z uzasadnieniem); nigdy „akt istnieje”, zawsze „warto poszukać”.
11. **Mapa i oś zgonów** (`wykresy.js`): zgony miesiąc po miesiącu, schemat wsi parafii; **słownik nazw miejscowości w czasie** (nazwa z dokumentu osobno od współczesnej, bez automatycznego łączenia po podobieństwie).
12. **Transkrypcja dyplomatyczna i czytelna jako dwie warstwy** z informacją o zmianach (rozszerzenie trybów tekstu).

### P3 – wyniki i współpraca
13. **Raporty:** osoby, rodziny, parafii, dowodowy (twierdzenie → dokumenty wspierające i sprzeczne → tok rozumowania → pewność).
14. **GEDCOM z zachowaniem źródeł i alternatywnych odczytów** w zakresie, jaki pozwala format (część danych niestandardowych nie przeniesie się bezstratnie – opisać w eksporcie).
15. **Scalanie kopii roboczych** dwóch osób z listą konfliktów.
16. **Ustawienia:** jasność i wysokość pasma na skanie, tryb prawa/lewa ręka, gesty, wibracja.
17. **Pole „zapis oryginalny daty”** (np. „1 (13) maja”) obok daty gregoriańskiej.

## 3. Zasady wdrażania (każdy krok)
- Najpierw porównanie przed/po wszystkich trzech narzędzi (widoki, pliki eksportu), potem nowa funkcja.
- Nowy kod do `wspolne/`, w narzędziach tylko podpięcie.
- Skan, transkrypcja, dane osoby i relacje to osobne obiekty i nie nadpisują sobie wartości.
- Testy regresyjne weryfikacji zgonów po każdej zmianie; commit i push po każdym kroku.

## 4. Otwarte pytania
- Zakres ramek słów (pkt 5).
- Czy historia ma też obejmować zmiany słowników i korekt w edytorze (pkt 1).
- Gdzie przechowywać model scalony (plik w repo bez danych drzewa vs. tylko lokalnie).
