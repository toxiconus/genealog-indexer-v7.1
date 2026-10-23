# SPEC – Genealog Indexer (jedyny aktualny plan)

Status: plan, bez zmian kodu. Gałąź: `ocena/ocr-i-plan-2026-10-23`.
Zastępuje: `OCENA_I_PLAN_2026-10-23.md`, `PLAN_WDROZENIA_2026-10-23.md` i wszystkie dokumenty wymienione w sekcji 12 (przeniesione do `archiwum/md/`).

---

## 1. Cel

Indeksowanie aktów metrykalnych (chrzty, śluby, zgony) z jednoczesnym oglądaniem skanu.
- Praca na tabeli rekordów, obok skanu aktu.
- Wartości wpisuje się w rubryki ręcznie albo przez zaznaczenie na skanie (ROI pola albo pojedyncze słowo).
- Dane mają być trwałe: ponowny import tego samego pliku daje ten sam wynik, a zmiana kodu nie kasuje istniejących rekordów.

Użytkownik: genealog-amator, indeksuje akty z parafii (głównie Blinów, chrzty 1878–1889 w obecnej bazie). Pracuje seriami skanów.

---

## 2. Prawdziwy workflow (z BRAINSTORM sp. 4 i WORKFLOW_SUMMARY)

Dla każdego skanu:

- **F1 – ocena skanu:** okładka czy dane? Jeśli dane: parafia, rok, typ aktu. Ścieżka do pliku musi być zapisana.
- **F2 – metadane serii:** zwykle zmienia się rok (+1), czasem parafia. Numery aktów są ciągłe. Metadane nie mogą być wpisywane 5–10 razy na skan.
- **F3 – granice aktów:** ile aktów jest na skanie, które są kontynuacją z poprzedniej strony. Rekordy tworzone z licznika, ROI na cały akt.
- **F4 – indeksacja aktu,** kolejność „od lewej w dół”: podstawowe (nr, dziecko, data, miejsce) → zgłaszający (zwykle ojciec, nie zawsze) → świadkowie 0–2 (z powiązaniem) → matka/urodzenie → dopiski.
- **F5 – dopiski:** zmarł, ożenił się, powiązania. Mogą dotyczyć innych osób.

Pain pointy do rozwiązania: powtarzanie metadanych, przełączanie obraz ↔ formularz, za dużo pól naraz, brak postępu i cofania, błędy wykrywane za późno.

---

## 3. Dane

### 3.1 Co istnieje (inwentarz)

| Źródło | Gdzie | Rola |
|---|---|---|
| `public_imports` | Supabase (44 kolumny, 5512+ rekordów, ID `CH.LUB.BLIN.YYYY.NNN`) | **Główna tabela pracy** wg dokumentacji. Źródło referencyjne dla pól. |
| `imported_records` | `public/genealogia_2026-02-03.db` (483 KB): **5515 wierszy, stary układ kolumn** (`imie`, `nazwisko_o`…), unikalne `id`. `public/genealogia_2026-02-03 (3).db` i `(5).db` (po 3,5 MB): **5512 wierszy, nowy układ** (`child_first_name`…), unikalne `id`. Różnica 3 rekordów i zawartość `(5)` do zweryfikowania. | Płaska kopia do pracy offline. |
| `CH BLIN.txt` | `public/` (~787 KB, TSV) | Dane wejściowe wklejane w `import-ch-blin.html`. Działało. |
| `chrzty_cleaned.txt` | `public/` (~774 KB) | Prawdopodobnie najnowsze czyszczenie. Do porównania. |
| `CH_BLIN_FIRESTORE.json` | `public/` (~4,7 MB) | Eksport do Firestore. Do porównania. |
| `duplikaty_only.txt` | `public/` (~76 KB) | Lista duplikatów ID. |
| `genealog_data` | localStorage (format v5, płaski `app.records[]`) | Najstarszy działający kontrakt. |
| Firestore `persons/records/sources/anomalies` | Firebase `acta-9ea64` | Model ACTA (EventModel/PersonModel). **Osobny model, nie zsynchronizowany z `public_imports`.** |
| XLS | **brak w repo** | Do dostarczenia przez autora. |
| Skany aktów | **brak w repo** | Do wskazania (ścieżka lub folder). |

### 3.2 Kontrakt rekordu (proposed, zgodny z `public_imports`)

Zasada: **rekord płaski jak w `public_imports`**, z rozszerzeniem listowym tylko dla świadków i wielokrotnych wartości. Dzięki temu 5512 istniejących wierszy mapuje się 1:1.

```
{
  schemaVersion: 1,
  id: "CH.LUB.BLIN.1785.001",        // unikalne, patrz 3.4
  typ: "chrzest" | "slub" | "zgon",
  rok: "1785",                        // tekst, zachowuje niepewność
  nr_aktu: "1",
  ksiega: "", strona: "",
  parafia: "", miejscowosc: "",
  dziecko:  { imiona: "", nazwisko: "", data_ur: "", miejsce: "" },
  ojciec:   { imiona: "", nazwisko: "", wiek: "", zawod: "", miejsce: "" },
  matka:    { imiona: "", nazwisko: "", nazwisko_panienskie: "", wiek: "", miejsce: "" },
  swiadkowie: [ { imiona, nazwisko, wiek, zawod, miejsce, powiazanie } ],   // 0–2 (lista)
  chrzestni:  [ { imiona, nazwisko, miejsce } ],
  kaplan_zawod: "",
  uwagi: "", uwagi_org: "",
  dopiski: [ { typ: "zmarl"|"ozenil"|"inne", data, miejsce, osoba, tekst } ],  // F5
  obraz: { path: "", roi: { "<pole>": {x, y, w, h} } },   // ROI znormalizowane 0..1
  wartosci_alternatywne: { "<pole>": [ { v, zrodlo, pewnosc } ] },  // warianty imion itd.
  status: "new" | "edited" | "verified",
  updated_at: ""
}
```

Uwagi:
- Pole główne (np. `dziecko.imiona`) to wartość używana w rubryce. Alternatywy są w osobnej liście, nie zastępują pola.
- Daty niepełne (rok / rok+miesiąc / pełna) zapisywane jako tekst jak na akcie. Znormalizowana data to osobne, opcjonalne pole.
- Nieczytelne: `?` plus flaga. **Nie zgadujemy.**
- ROI zawsze znormalizowane (ułamki 0..1), żeby działały przy zoomie i rotacji (kontrakt z v5).

### 3.3 Mapowanie nazw

Stare polskie nazwy kolumn (`imie`, `nazwisko_o`, `w_m`…) i nowe nazwy (`child_first_name`…) są mapowane **w jednym miejscu** (tabela mapowania w kodzie, wzór: `EXPORT_IMPORT_MAPPING.md`). Dziś mapowanie jest rozproszone w wielu funkcjach, co jest jedną z przyczyn rozsypywania się bazy.

### 3.4 Identyfikatory i duplikaty

- ID aktu: `CH.LUB.BLIN.YYYY.NNN`. Schemat unikalności musi być zgodny z tym, co robi UPSERT (dziś rozjazd: constraint na `original_id`, upsert na `id` – `FIX_SUPABASE_CONSTRAINT.md`).
- Duplikaty: **oznaczać, nie usuwać.** Porównanie w `duplikaty_only.txt`. Usuwanie tylko przez świadomą decyzję autora.

---

## 4. Niezawodność (dlaczego baza się sypała)

### 4a. Ograniczenia i rozjazdy Supabase (ustalenia z kodu i dokumentów)

- **Limit wierszy na zapytanie.** Serwer Supabase/PostgREST zwraca domyślnie najwyżej 1000 wierszy na żądanie. Kod paginuje po 1000 (`.range(offset, offset+999)`, `viewer-osd-v8.21.html` ok. linii 9200), więc działa. **Ale nie ma `.order()`**: bez stałego sortowania między stronami mogą się powtórzyć albo zgubić wiersze. Naprawa: sortować po `original_id` i sprawdzać liczbę wczytanych rekordów z `count`.
- **Klucz unikalny.** `SUPABASE_SCHEMA.md` mówi: unikalność na `original_id`, a aktualizacje zawsze `WHERE original_id = ...`. Kod robi jednak `upsert(..., { onConflict: 'id' })` (linie ok. 9538, 9598) i `.eq('id', ...)` (ok. 4779, 9460), czyli po wewnętrznym UUID. Stąd błąd `duplicate key value violates unique constraint "unique_original_id"`: nowy wiersz bez zgodnego `id` dubluje `original_id`. Naprawa: jeden klucz (`original_id`) w każdym zapisie.
- **Limity planu i pamięci przeglądarki.** Nie sprawdziłem limitów planu Supabase (storage, liczba zapytań) – do potwierdzenia w panelu. Wiadomo z historii pracy: `localStorage` ma ok. 5 MB, a dane były ok. 7,7 MB, co wymusiło przejście na bazę. Firestore przyjmuje paczki zapisów do 500 dokumentów.
- **Stan danych nieznany.** Nie wiadomo, ile wierszy faktycznie jest w `public_imports` (dokumentacja: 5512+). Do sprawdzenia: `select count(*)` w panelu Supabase (SQL Editor).

Ustalenia z kodu (`public/acta-v1-models.js`, `viewer-osd-v8.21.html`):
1. `fromJSON` czyta zagnieżdżone pola bez sprawdzania (np. `HistoricalDate.fromJSON(data.birthDate)`). Brak pola = wyjątek = nieudane wczytanie całości.
2. Brak `schemaVersion` i migracji. Zmiana pola kasuje kompatybilność.
3. Dane w czterech magazynach naraz (localStorage 48 odwołań, Supabase 45, Firebase 12, IndexedDB 2), każdy w innym kształcie.
4. Dwa modele: płaski (v5/v8/public_imports) i ACTA (Map/EventModel w v8.21/v9). Zmiana z jednego na drugi bez migracji rozwala dane.

Zasady, które mają to zatrzymać:
- **Jedno źródło prawdy: IndexedDB** w przeglądarce (już jest w trybie offline v8.21). Supabase/Firestore to eksport/sync, nie równoległa prawda.
- `schemaVersion` w każdym rekordzie i w pliku eksportu. Migracje są funkcjami `v1→v2` itd., testowanymi na plikach z repo.
- Każde `fromJSON` tolerancyjne: wartości domyślne, `data?.pole`, nigdy wyjątek przez brak pola.
- **Raport importu:** ile wczytano, ile odrzucono i dlaczego, ile duplikatów. Bez ciszy.
- **Test round-trip** w CI: import → eksport → import = identyczne dane (dla każdego pliku wejściowego).
- Zmiana schematu wymaga wpisu w migracjach i wersji. Bez tego nie wchodzi.

---

## 5. Interfejs (MVP)

Układ trzy kolumny:
- **Lewa:** tabela rekordów (filtr: parafia, rok, typ, status), wybór wiersza ładuje skan.
- **Środek:** skan (OpenSeadragon), ROI pól, podświetlenie aktywnego pola.
- **Prawa:** formularz w sekcjach (accordion) wg F4. Pola używane 80% czasu zawsze widoczne; reszta zwinięta, dodawana przyciskiem.

Funkcje obowiązkowe w MVP:
- Metadane serii: „kopiuj z poprzedniego” (parafia, rok, typ), auto-inkrement roku (checkbox).
- Licznik aktów na skanie (F3) tworzy puste rekordy.
- Tab przechodzi sekwencyjnie po polach aktywnej sekcji. Enter = następne pole. Ctrl+S zapis.
- Zapis odporny: autozapis w IndexedDB przy każdej zmianie, cofnij (Ctrl+Z) dla ostatnich 20 zmian.
- Wskaźnik postępu (pola wypełnione / wymagane).
- Pola wymagane oznaczone `*` (wg konfiguracji, nie w kodzie).

Funkcje P2 (po MVP): hover na polu podświetla ROI, podpowiedzi z poprzednich aktów (wachlarz – `WACHLARZ-SPECIFICATION.md` opisuje krzywą paraboliczną, ΔY = 38 px, 15 pozycji), ściąga imion PL/RU/LA, linkowanie osób między aktami.

---

## 6. Zaznaczanie na skanie i OCR

- **ROI → pole:** działa w v8.21. Zachowujemy.
- **Klik w słowo:** Tesseract zwraca bbox każdego słowa dla całej strony po **jednym** przebiegu. Słowa na skanie są klikalne i wpisują się do aktywnego pola. To spełnia prośbę „zaznaczać słowa na obrazie”.
- Pewność i surowy tekst pokazywane zawsze. Brak wyniku = jasny komunikat z powodem (silnik, język, obraz, niska pewność).
- **Nie wpisywać automatycznie.** Zawsze kliknięcie użytkownika.
- Silnik i dane językowe `pol`/`eng` **lokalnie** (bez CDN), gotowe do użycia offline.
- Odręczne pismo: Tesseract słabo. Dla tych akt praca ręczna jest poprawna. Przyszły krok (P3): model z wizją zwraca propozycje wartości do rubryk, zatwierdzane ręcznie. Wymaga zgody na wysyłanie skanów do zewnętrznego API.

Preprocessing (HEAVY-DUTY: tło, kontrast, morfologia, auto-invert) – działa na wyblakłych skanach, ale to eksperyment. Opcjonalny przycisk, OpenCV ładowany leniwie, nie domyślnie. Wynik porównywać z oryginałem.

---

## 7. Eksport i import

- **CSV/TSV w układzie wejścia** (kolumny jak w `CH BLIN.txt` i `public_imports`). Round-trip gwarantowany testem.
- **JSON** z `schemaVersion` i pełnym kontraktem z 3.2.
- Eksport do ACTA (EventModel/PersonModel) dopiero po ustabilizowaniu płaskiego kontraktu. To osobny, opcjonalny konwerter, nie źródło prawdy.

---

## 8. Bezpieczeństwo

- **Reguła Firestore `public_imports`: `allow read, write: if true`** (`public/firestore.rules`). **Decyzja autora (2026-10-23):** pozostaje otwarta na etap rozwoju, bo dane pochodzą z publicznych baz genealogicznych. **Przed szerszym udostępnieniem** – logowanie. Do tego czasu bez zmian reguł bez zgody autora.
- Klucze Firebase w kodzie: klucz web nie jest sekretem, ale bezpieczeństwo zależy od reguł. Nie dokładać nowych kluczy do plików HTML.
- Dane osobowe osób żyjących: nie publikować poza repo bez zgody. Eksporty nie trafiają do publicznego katalogu.

---

## 9. Etapy

**E0 – konsolidacja dokumentów (ta gałąź).** Jeden SPEC, reszta w archiwum. Kryterium: `ls *.md` w głównym katalogu pokazuje README, SPEC, CHANGELOG, PRZEWODNIK.

**E1 – kontrakt i import (bez UI).** Parser TSV/CSV/`.db` do kontraktu 3.2, mapowanie nazw w jednym miejscu, raport importu, testy na plikach z repo.
- Kryterium: 5512 rekordów z `public_imports` i `CH BLIN.txt` daje raport zgodny z liczbami; test round-trip przechodzi.

**E2 – magazyn IndexedDB + migracje.** Zapis/odczyt w jednym formacie z `schemaVersion`. Migracja v5 `genealog_data` → v1.
- Kryterium: stary eksport v5 wczytuje się bez utraty pól; reload strony nie gubi danych.

**E3 – UI: tabela + skan + formularz (F1–F4).** Smart defaults, licznik aktów, tab, autozapis, postęp.
- Kryterium: indeksacja 10 aktów z jednego skanu bez powtarzania metadanych.

**E4 – klik w słowo na skanie.** Tesseract lokalnie, word bboxes, klik wpisuje do pola.
- Kryterium: na 5 testowych skanach klik wypełnia właściwe pole w co najmniej 3 przypadkach.

**E5 – dopiski (F5) i powiązania osób.**

**P2/P3 – wachlarz, preprocessing, LLM z wizją (po zgodzie na dane).**

---

## 10. Co wycięto (i dlaczego)

- ROADMAP część 2028–2030 (blockchain, quantum, AR, marketplace, 1M użytkowników): wizja bez związku z indeksowaniem aktów.
- Pełny model ACTA w formularzu (DNA, zdrowie, majątek, migracje, dopisy kulturowe w każdym akcie): formularz ma być szybki. Model ACTA zostaje jako opcjonalna warstwa eksportu, nie jako UI.
- Dwa równoległe magazyny (Supabase + Firestore) jako źródło prawdy: wybieramy IndexedDB.
- Gałąź v10 (modularny szkielet ~20%) wstrzymana. Wracamy do rozważenia po E3.

---

## 11. Otwarte pytania do autora

1. Najnowsza prawda: `CH BLIN.txt`, `chrzty_cleaned.txt`, `CH_BLIN_FIRESTORE.json`, `.db` czy XLS? (Wgrać XLS na czat.)
2. Gdzie są skany aktów?
3. Czy zgoda na listę wartości alternatywnych (`wartosci_alternatywne`) zamiast jednego pola?
4. Czy zgoda na E1 przed UI?

---

## 12. Mapa dokumentów

**Aktywne (zostają w repo):**
- `README.md` – wejście do projektu (do aktualizacji po E3).
- `SPEC.md` – ten plik.
- `CHANGELOG.md` – historia.
- `PRZEWODNIK.md` – instrukcja użytkownika (do aktualizacji po E3).
- `KOMPENDIUM_DANYCH_AKTOW.md` – wymagania pól dla akt (domena).
- `ACTA-v3-Documentation.md` – referencja modelu opcjonalnego eksportu.
- `launchers/README.md` – jak uruchomić serwer.
- `.github/copilot-instructions.md` – instrukcje dla agentów (do aktualizacji wg SPEC).
- `.github/BRAINSTORM.md`, `.github/WORKFLOW_SUMMARY.md`, `.github/WACHLARZ-SPECIFICATION.md` – źródło wymagań workflow i specyfikacja wachlarza (P2).
- `public/EXPORT_IMPORT_MAPPING.md` – mapowanie nazw kolumn (potrzebne w E1).
- `public/SUPABASE_SCHEMA.md` – opis `public_imports` (referencja).
- `public/EDITING_FIELDS_CONFIG.md` – jak edytować `fields-config.json` (źródło pól).

**Przeniesione do `archiwum/md/`** (63 pliki, `git mv`, nic nie skasowano). Nazwa pliku w archiwum = ścieżka z `/` zamienioną na `_`, np. `public/v10/README.md` → `archiwum/md/public_v10_README.md`. Sprinty, eksperymenty HEAVY-DUTY, dokumenty wersyjne v8.x, starsze plany, v10 i zdublowane indeksy.

---

## 12a. Moje założenia (do weryfikacji przez autora)

Autor poprosił, żebym przyjął własne założenia. Oto one, z uzasadnieniem. Każde można odwrócić.

1. **Źródłem prawdy jest `public_imports` (Supabase), a nie Firestore.** Dokumentacja nazywa ją „główną tabelą pracy” i ma 5512 rekordów. Firestore ma osobny model ACTA.
2. **Pierwszy cel to płaski rekord, nie ACTA.** Pełny model ACTA (DNA, zdrowie, migracje) nie jest potrzebny do indeksowania akt, a psuje UI.
3. **IndexedDB jako magazyn lokalny.** Mam to jako jedyny działający tryb offline (v8.21). Chmura jako sync, nie prawda.
4. **Odręczne akta: praca ręczna + klik w słowo, nie automat.** Tesseract słabo czyta odręczne pismo, więc nie obiecuję wyników OCR.
5. **Nic nie usuwam, tylko oznaczam duplikaty.** Usuwanie zostawiam autorowi.
6. **Firestore otwarty do czasu dopracowania** (decyzja autora, zapisana w sekcji 8).
7. **Najpierw E1 (import + testy), potem UI.** Bez powtarzalnego importu każdy eksperyment z UI psuje dane.
8. **Nie zmieniam kodu w tej gałęzi.** To plan. Kod zaczyna się w E1 po akceptacji.
9. **Zakres wizualizacji: ROI + klik w słowo, bez wachlarza w MVP.** Wachlarz to P2.
10. **Pliki danych w repo traktuję jako wejście, nie jako wzorzec.** Które jest najnowsze – nie wiem; porównanie w E1.

---

## 13. Stan w tej gałęzi

- Zrobione: SPEC.md jako jedyny plan; dokumenty dublujące przeniesione do archiwum (git mv, nic nie skasowano).
- Nie zrobione: zmiany kodu, uruchomienie aplikacji, testy OCR, porównanie plików danych.
- Przeczytane w całości: README, KOMPENDIUM (schematy), WORKFLOW_SUMMARY, BRAINSTORM (sp. 4), PROJEKTY_FORMULARZY, PROJECT-STATUS, ROADMAP, copilot-instructions (sekcje projektowe i migracje), EXPORT_IMPORT_MAPPING, SUPABASE_SCHEMA, FIRESTORE_MIGRATION_ROADMAP (struktura), SYNCHRONIZACJA (fragmenty), ACTA-v3 (struktura i pola).
- Przejrzane nagłówkami i początkami: pozostałe dokumenty z listy (HEAVY-DUTY x5, sprinty, testy, checklisty, v10, start/przewodniki, ZADANIA-6-7, EKSPERYMENT x2, indeksy).
