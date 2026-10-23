# Plan wdrożenia: praca na danych i skanach jednocześnie (2026-10-23)

Gałąź: `ocena/ocr-i-plan-2026-10-23`. To jest plan i inwentarz. Kod nie został zmieniony.

## 1. Cel (wg autora)

Pracować na tabeli danych i jednocześnie oglądać skan aktu. Poprawiać pola, a na obrazie zaznaczać pole albo słowo, które ma trafić do rubryki. Dane mają być trwałe: ma być można je bezpiecznie wczytać ponownie po zmianach w kodzie.

## 2. Co już jest w repo

| Plik | Co to jest | Uwagi |
|---|---|---|
| `public/CH BLIN.txt` (~787 KB) | Dane TSV (nagłówki w pierwszej linii) | Wejście dla `import-ch-blin.html`, który przyjmuje wklejone dane. To działało wcześniej. |
| `public/chrzty_cleaned.txt` (~774 KB) | Chrzty po czyszczeniu | Prawdopodobnie nowsza wersja danych. Do porównania z `CH BLIN.txt`. |
| `public/CH_BLIN_FIRESTORE.json` (~4,7 MB) | Dane w formacie Firestore | Do porównania z TSV. |
| `public/genealogia_2026-02-03.db` (~483 KB) i `(5).db` (~3,5 MB) | SQLite z rekordami | Dwie różne kopie, do porównania. |
| `public/duplikaty_only.txt` (~76 KB) | Wykryte duplikaty | Przydatne przy weryfikacji. |
| `public/test_database.csv/json` | Małe dane testowe | Do testów importu. |
| Pliki XLS | **Nie ma ich w repo** | Trzeba wgrać. |
| Skany aktów (obrazy) | **Nie ma ich w repo** | Trzeba wskazać, gdzie leżą. |

## 3. Model danych: decyzja robocza

- **ACTA v3.2** (`acta-v1-models.js`, ~2600 linii, `ACTA-v3-Documentation.md`) to rozbudowany model osób, ról i relacji (ACTACOM 1.0). Jest bardzo kompletny, ale dane wejściowe są płaskie (jeden wiersz = jeden akt).
- **Propozycja:** prawdą jest płaski rekord aktu, czyli kolumny z `CH BLIN.txt`. Ten sam układ przechodzi w eksport. ACTA jest opcjonalnym eksportem, dodawanym później. Dzięki temu nie blokuje się pracy na danych.
- Definicje pól (kolumny, typy, wymagane) trzymać w `fields-config.json`, jedno źródło.

## 4. Proponowane etapy

**E1 – Import powtarzalny.** Parser TSV z walidacją i raportem: liczba wierszy, puste pola, duplikaty po ID, różnice względem poprzedniego importu. Ten sam wejściowy plik zawsze daje ten sam wynik.
- Kryterium: liczba rekordów zgodna z plikiem; raport bez niewyjaśnionych różnic.

**E2 – Widok: tabela + skan.** Wybór wiersza ładuje skan (ścieżka w rekordzie albo wskazany folder). Edycja pola w tym samym ekranie.
- Kryterium: zmiana wiersza zmienia obraz w jednym kliknięciu.

**E3 – Zaznaczanie na skanie.** Dwa sposoby:
- (a) ROI przypisane do pola (już działa w v8.21).
- (b) Klik w słowo: Tesseract zwraca pozycje słów (bbox) dla całej strony po jednym przebiegu. Klik w słowo wpisuje je do aktywnego pola.
- Kryterium: klik w słowo wypełnia właściwe pole w co najmniej 3 z 5 testowych skanów.

**E4 – Zapis i eksport w tym samym układzie co wejście.** Test "round-trip": import → edycja → eksport → ponowny import daje identyczne dane.
- Kryterium: test round-trip przechodzi.

**E5 (później, opcjonalnie) – eksport ACTA.**

## 5. Ryzyka i problemy zauważone w repo

1. **KRYTYCZNE – reguła Firestore.** `public/firestore.rules`: `public_imports` ma `allow read, write: if true`. Każdy może czytać i zmieniać te dane. Są w nich dane osób. **Zalecam natychmiast zamknąć ten dostęp** (np. wymagać logowania) albo przenieść dane lokalnie. Nie zmieniałem tego, bo to Twój projekt Firebase. Decyzja należy do Ciebie.
2. **Klucze Firebase w kodzie** (`import-ch-blin.html`, `viewer-osd-v8.11.html`, dokumentacja). Klucz web sam w sobie nie jest tajny, ale wraz z otwartymi regułami daje dostęp do danych. Problem wynika z reguł, nie z samego klucza.
3. **Kilka źródeł danych i brak wiedzy, które jest najnowsze** (TSV, `chrzty_cleaned`, JSON, dwa `.db`). Najpierw trzeba je porównać.
4. **Dokumentacja jest w kilku wersjach** (ACTA v1, v3.0–3.2, KOMPENDIUM, roadmapa). Ten plan zastępuje je jako punkt startowy.

## 6. Pytania do autora

1. Które źródło danych jest najnowsze i prawdziwe: `CH BLIN.txt`, `chrzty_cleaned.txt`, `CH_BLIN_FIRESTORE.json`, czy XLS? Można wgrać XLS na czat.
2. Gdzie leżą skany aktów?
3. Czy dane mogą pozostać tylko lokalnie (IndexedDB), czy mają być w chmurze? Jeśli w chmurze, reguły trzeba zamknąć przed dalszą pracą.
4. Czy zgadzasz się na etapy E1–E4 w tej kolejności?
