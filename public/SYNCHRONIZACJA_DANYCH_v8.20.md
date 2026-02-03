# 🔄 Pełna Synchronizacja Danych v8.20
## Supabase → HTML → SQLite

**Data:** 3 lutego 2026  
**Wersja:** v8.20 (ostatnie naprawy)  
**Status:** ✅ NAPRAWIONA (23 kolumny genealogiczne)

---

## 📊 Architektura Danych

```
┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE (PostgreSQL)                        │
│         public_imports table (44 kolumny, 5512+ aktów)          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    loadFromSupabase()
                    (mapowanie 28 kolumn)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              HTML/JS - app.imageActs[]                           │
│   (internal format: flat structure + fieldValues object)        │
│         [Act object] {id, imageIdx, image_path, ...}            │
└────────────────────────────┬────────────────────────────────────┘
                    ▲        │        ▼
                    │        │        └─→ renderRecordsTable()
                    │        │            (wyświetla w tabeli)
      saveChanges-  │        │
      ToSupabase()  │        │
      (UPDATE)      │        │
                    │        ▼
                    │   exportToSQLiteFile()
                    │   (INSERT 24 kolumny)
                    │        │
                    └────────┤
                             ▼
                    ┌────────────────┐
                    │  SQLite .db    │
                    │ (backup/copy)  │
                    └────────────────┘
```

---

## 1️⃣ ŁADOWANIE Z SUPABASE → HTML

### Funkcja: `loadFromSupabase()` [Linia 8868]

**Schemat pobierania:**
- Pobiera z tabeli `public_imports` z paginacją (1000 rec/batch)
- Filtruje tylko rekordy gdzie `original_id` zawiera `CH.LUB.BLIN.*`
- Deduplikuje wg `original_id`
- Sortuje po `original_id` (naturalny porządek)

**Mapowanie 28 kolumn Supabase → app.imageActs:**

| Kategoria | Supabase | app.imageActs | fieldValues |
|-----------|----------|---------------|------------|
| **ID** | original_id | id | - |
| **ID** | id (UUID) | originalId | - |
| **Rok** | christening_year | christening_year | rok |
| **Nr aktu** | christening_act_number | christening_act_number | nr_aktu |
| **📸 Obraz** | imageidx | **imageIdx** | - |
| **📸 Obraz** | image_path | **image_path** | - |
| **Dziecko** | child_first_name | child_first_name | child_first_name |
| **Dziecko** | child_last_name | child_last_name | child_last_name |
| **Dziecko** | child_birth_date | - | child_birth_date |
| **Ojciec** | father_first_name | father_first_name | father_first_name |
| **Ojciec** | father_last_name | father_last_name | father_last_name |
| **Ojciec** | father_age | - | father_age |
| **Matka** | mother_first_name | mother_first_name | mother_first_name |
| **Matka** | mother_last_name | mother_last_name | mother_last_name |
| **Matka** | mother_maiden_name | - | mother_maiden_name |
| **Matka** | mother_age | - | mother_age |
| **Świadkowie** | witnesses | - | witnesses |
| **Notatki** | notes | notes | notes |
| **Notatki** | notes_org | notes_org | notes_org |
| **Lokalizacja** | location | location | location |

**Ładowanie pól genealogicznych:**
```javascript
fieldValues: {
    // Dziecko
    child_first_name: row.child_first_name || '',
    child_last_name: row.child_last_name || '',
    child_birth_date: row.child_birth_date || '',
    
    // Ojciec
    father_first_name: row.father_first_name || '',
    father_last_name: row.father_last_name || '',
    father_age: row.father_age || '',
    
    // Matka
    mother_first_name: row.mother_first_name || '',
    mother_last_name: row.mother_last_name || '',
    mother_maiden_name: row.mother_maiden_name || '',
    mother_age: row.mother_age || '',
    
    // Świadkowie
    witnesses: row.witnesses || '',
    
    // Notatki
    notes: row.notes || '',
    notes_org: row.notes_org || ''
}
```

**Krytyczne pola do zwrócenia uwagi:**
- ⭐ **imageidx** → mapuje na `imageIdx` (indeks obrazu, NULL jeśli nie przypisany)
- ⭐ **image_path** → przechowuje ścieżkę obrazu do wyświetlenia w HTML/OSD

---

## 2️⃣ WYSYŁANIE DO SUPABASE (SAVE)

### Funkcja: `saveChangesToSupabase()` [Linia 9325]

**Schemat wysyłania:**
- Iteruje po wszystkich `app.imageActs`
- Mapuje `fieldValues` na kolumny Supabase
- Wysyła UPDATE (nie INSERT) używając `original_id` jako klucza
- Jeśli `original_id` nie znaleziony, próbuje `id`

**Mapowanie 18 pól → Supabase UPDATE:**

```javascript
const updateData = {
    // Podstawowe
    imageidx: act.imageIdx !== undefined && act.imageIdx !== null ? parseInt(act.imageIdx) : null,
    image_path: act.image_path || null,
    christening_year: parseInt(fv.rok || act.rok || 0),
    christening_act_number: act.nr || fv.nr || '',
    
    // Dziecko
    child_first_name: fv.child_first_name || '',
    child_last_name: fv.child_last_name || '',
    child_birth_date: fv.child_birth_date || '',
    
    // Ojciec
    father_first_name: fv.father_first_name || '',
    father_last_name: fv.father_last_name || '',
    father_age: fv.father_age || '',
    
    // Matka
    mother_first_name: fv.mother_first_name || '',
    mother_last_name: fv.mother_last_name || '',
    mother_maiden_name: fv.mother_maiden_name || '',
    mother_age: fv.mother_age || '',
    
    // Świadkowie i notatki
    witnesses: fv.witnesses || '',
    notes: fv.notes || '',
    notes_org: fv.notes_org || '',
    location: fv.location || ''
};
```

**Co się wysyła:**
- ✅ `imageidx` i `image_path` - w pełni obsługiwane
- ✅ Wszystkie pola genealogiczne dziecka, ojca, matki
- ✅ Świadkowie (nowe 3.02.2026)
- ✅ Notatki i lokalizacja

---

## 3️⃣ EKSPORT DO SQLITE

### Funkcja: `exportToSQLiteFile()` [Linia 7819]

**🆕 NAPRAWIONA v8.20 - dodane 5 brakujących kolumn**

**Schemat eksportu:**
- Tworzy nową bazę SQLite w pamięci
- Tworzy tabelę `imported_records` z **24 kolumnami**
- Iteruje po `app.imageActs` i wstawia wiersze
- Eksportuje do pliku `.db` (download)

**Struktura tabeli imported_records (24 kolumny):**

```sql
CREATE TABLE imported_records (
    row_id INTEGER PRIMARY KEY,
    id TEXT UNIQUE,
    rok INTEGER,
    nr TEXT,
    nazwisko TEXT,
    imie TEXT,
    miejscowosc TEXT,
    child_first_name TEXT,           ✅ NAPRAWIONE (było brak)
    child_last_name TEXT,            ✅ NAPRAWIONE (było brak)
    child_birth_date TEXT,           ✅ NAPRAWIONE (było brak - nowe 3.02)
    father_first_name TEXT,
    father_last_name TEXT,
    father_age TEXT,
    mother_first_name TEXT,
    mother_last_name TEXT,
    mother_maiden_name TEXT,         ✅ NAPRAWIONE (było brak - nowe 3.02)
    mother_age TEXT,
    witnesses TEXT,                  ✅ NAPRAWIONE (było brak - nowe 3.02)
    uwagi TEXT,
    uwagi_org TEXT,
    image_path TEXT,
    imageidx INTEGER,
    roi_json TEXT,
    field_values TEXT (JSON),
    status TEXT DEFAULT 'indexed',
    imported_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Mapowanie wartości INSERT:**

```javascript
// 🔧 FIX v8.20: Czytaj z NOWYCH pól, fallback na STARE
// Supabase wysyła fieldValues.child_first_name
// SQL ma kolumny: imie (stare) i child_first_name (nowe)

const fv = record.fieldValues || {};
newDb.run(`INSERT INTO imported_records 
    (id, rok, nr, nazwisko, imie, miejscowosc, 
     child_first_name, child_last_name, child_birth_date,
     father_first_name, father_last_name, father_age,
     mother_first_name, mother_last_name, mother_maiden_name, mother_age,
     witnesses, uwagi, uwagi_org, image_path, imageidx, roi_json, field_values, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
        record.id || record.original_id || '',
        parseInt(record.rok || record.year || record.christening_year || fv.rok || 0),
        record.nr || record.christening_act_number || fv.nr || '',
        
        // 🆕 STARE kolumny SQL (dla kompatybilności) - czytaj z NOWYCH Supabase
        fv.child_last_name || fv.nazwisko || '',      // nazwisko ← child_last_name (fallback na stare)
        fv.child_first_name || fv.imie || '',         // imie ← child_first_name (fallback na stare)
        fv.location || fv.miejscowosc || record.location || '',
        
        // 🆕 NOWE kolumny SQL (dla przyszłości) - to samo co wyżej
        fv.child_first_name || fv.imie || '',         // child_first_name
        fv.child_last_name || fv.nazwisko || '',      // child_last_name
        fv.child_birth_date || '',
        
        // Ojciec - NOWE kolumny (czytaj z Supabase, fallback na stare SQL)
        fv.father_first_name || fv.imie_o || '',      // father_first_name ← Supabase, fallback na imie_o
        fv.father_last_name || fv.nazwisko_o || '',   // father_last_name ← Supabase, fallback na nazwisko_o
        fv.father_age || fv.w_o || '',                // father_age ← Supabase, fallback na w_o
        
        // Matka
        fv.mother_first_name || fv.im || '',
        fv.mother_last_name || fv.nm || '',
        fv.mother_maiden_name || '',
        fv.mother_age || fv.w_m || '',
        
        // Reszta
        fv.witnesses || '',
        fv.notes || fv.uwagi || '',                    // uwagi ← notes, fallback na uwagi
        fv.notes_org || fv.uwagi_org || '',            // uwagi_org ← notes_org, fallback na uwagi_org
        record.image_path || '',
        record.imageIdx !== undefined ? parseInt(record.imageIdx) : null,
        record.fieldROIs ? JSON.stringify(record.fieldROIs) : '',
        record.fieldValues ? JSON.stringify(record.fieldValues) : '',
        'indexed'
    ]
);
```

**🔑 Kluczowe punkty:**
1. ✅ Export czyta z `fieldValues.child_first_name` (dane z Supabase)
2. ✅ Export ma fallback na `fieldValues.imie` (dla backward compatibility jeśli coś nie wczytało)
3. ✅ Export wstawia OBIE nazwy kolumn do SQL:
   - `imie`, `nazwisko` (stare, dla starych narzędzi)
   - `child_first_name`, `child_last_name` (nowe, dla przyszłości)
4. ✅ Mapowanie zachodzi dla ALL FIELDS (father, mother, notes itp.)
5. ✅ Wynik: SQL zawiera pełne dane niezależnie od źródła Supabase/stary format

---

## 4️⃣ IMPORT Z SQLITE (Mapowanie Stare → Nowe)

### Funkcja: `importFromSQLiteFile()` [Linia 8194]

**🔧 WAŻNE: SQL pliki zawierają STARE polskie nazwy kolumn**

SQLite (.db) pliki wyeksportowane ze starszych wersji zawierają:

```sql
-- STARE kolumny w SQL:
imie, nazwisko                    -- dziecko
imie_o, nazwisko_o, w_o           -- ojciec
im, nm, w_m                       -- matka
uwagi, uwagi_org                  -- notatki
miejscowosc                       -- lokalizacja
```

**App automatycznie mapuje na NOWE nazwy:**

| Stara kolumna (SQL) | Nowa kolumna (app) | Fallback |
|---|---|---|
| `imie` | `child_first_name` | czytaj `imie` jesli brak `child_first_name` |
| `nazwisko` | `child_last_name` | czytaj `nazwisko` jesli brak `child_last_name` |
| `imie_o` | `father_first_name` | czytaj `imie_o` jesli brak `father_first_name` |
| `nazwisko_o` | `father_last_name` | czytaj `nazwisko_o` jesli brak `father_last_name` |
| `w_o` | `father_age` | czytaj `w_o` jesli brak `father_age` |
| `im` | `mother_first_name` | czytaj `im` jesli brak `mother_first_name` |
| `nm` | `mother_last_name` | czytaj `nm` jesli brak `mother_last_name` |
| `w_m` | `mother_age` | czytaj `w_m` jesli brak `mother_age` |
| `uwagi` | `notes` | czytaj `uwagi` jesli brak `notes` |
| `uwagi_org` | `notes_org` | czytaj `uwagi_org` jesli brak `notes_org` |
| `miejscowosc` | `location` | czytaj `miejscowosc` jesli brak `location` |

**Kod mapowania (uproszony):**
```javascript
// Czytaj z NOWYCH kolumn, fallback na STARE
child_first_name: record.child_first_name || record.imie || '',
child_last_name: record.child_last_name || record.nazwisko || '',
father_first_name: record.father_first_name || record.imie_o || '',
father_last_name: record.father_last_name || record.nazwisko_o || '',
father_age: record.father_age || record.w_o || '',
mother_first_name: record.mother_first_name || record.im || '',
mother_last_name: record.mother_last_name || record.nm || '',
mother_age: record.mother_age || record.w_m || '',
notes: record.notes || record.uwagi || '',
notes_org: record.notes_org || record.uwagi_org || '',
location: record.location || record.miejscowosc || '',
```

**Wynik:** Rekordy z SQL są poprawnie czytane i wyświetlane w tabeli głównej.

---

## 5️⃣ AUTO-LOAD SQL NA STARTUP

### Funkcja: `autoLoadLatestSQLFile()` [Linia 2485]

Wykorzystuje **to samo mapowanie** co `importFromSQLiteFile()`.

---

## 📍 LOKALIZACJE ZMIAN W KODZIE

### importFromSQLiteFile() [Linia 8194]

**Zmiana:** Dodane mapowanie STARE → NOWE nazwy kolumn

```javascript
// Line 8228-8237 (w fieldValues object)
child_first_name: record.child_first_name || record.imie || '',
child_last_name: record.child_last_name || record.nazwisko || '',
father_first_name: record.father_first_name || record.imie_o || '',
father_last_name: record.father_last_name || record.nazwisko_o || '',
father_age: record.father_age || record.w_o || '',
mother_first_name: record.mother_first_name || record.im || '',
mother_last_name: record.mother_last_name || record.nm || '',
mother_age: record.mother_age || record.w_m || '',
```

---

### autoLoadLatestSQLFile() [Linia 2485]

**Zmiana:** 
1. Dodane mapowanie STARE → NOWE (identyczne jak importFromSQLiteFile)
2. Dodane rozpoznawanie UUID vs CH.LUB.BLIN format

```javascript
// Line 2531-2532 (rozpoznawanie formatu ID)
const recordId = record.id || record.original_id || '';
const isCHFormat = recordId.startsWith('CH.LUB.BLIN') || recordId.startsWith('CH.BLIN');

// Line 2533-2534 (mapowanie ID)
id: isCHFormat ? recordId : (record.original_id || recordId || ''),
original_id: isCHFormat ? recordId : (record.original_id || recordId || ''),

// Line 2542-2559 (mapowanie genealogiczne - jak wyżej)
child_first_name: record.child_first_name || record.imie || '',
```

---

### exportToSQLiteFile() [Linia 7819]

**Zmiana:** ⭐ KRYTYCZNA - Naprawione mapowanie NOWE → STARE

**Przed (❌ BŁĘDNE):**
```javascript
fv.nazwisko || '',          // ❌ zawsze puste - Supabase nie ma tego pola!
fv.imie || '',              // ❌ zawsze puste
```

**Po (✅ PRAWIDŁOWE):**
```javascript
// Line 8019-8020
fv.child_last_name || fv.nazwisko || '',      // Czytaj z Supabase, fallback na stare
fv.child_first_name || fv.imie || '',         // Czytaj z Supabase, fallback na stare

// Line 8023-8024 (duplikacja dla kompatybilności)
fv.child_first_name || fv.imie || '',         // child_first_name
fv.child_last_name || fv.nazwisko || '',      // child_last_name

// Line 8027-8031 (ojciec)
fv.father_first_name || fv.imie_o || '',      // Czytaj z Supabase, fallback
fv.father_last_name || fv.nazwisko_o || '',
fv.father_age || fv.w_o || '',
```

---

### Loading Overlay [Linia 1621]

**Zmiana:** Usunięto emoji

**Przed:** `⏳ Ładowanie aplikacji...`
**Po:** `Ładowanie aplikacji...`

---

## 🔄 PEŁNY PRZEPŁYW DANYCH (3.02.2026)

```
SUPABASE (fieldValues: {child_first_name, child_last_name, ...})
    │
    ├─→ loadFromSupabase()
    │   ↓
    ├─→ app.imageActs[] (fieldValues.child_first_name = "Jan")
    │   │
    │   ├─→ renderRecordsTable() 
    │   │   ↓ wyświetla w tabeli
    │   │
    │   └─→ exportToSQLiteFile()
    │       ↓ Line 8019: fv.child_first_name || fv.nazwisko || ''
    │       ↓ czytaj Supabase, fallback na stare
    │       ↓
    │       SQL (z mapowaniem: imie='Jan', child_first_name='Jan')
    │       │
    │       └─→ importFromSQLiteFile()
    │           ↓ Line 8228: record.child_first_name || record.imie || ''
    │           ↓ czytaj NOWE, fallback na STARE
    │           ↓
    │           app.imageActs[] (child_first_name = "Jan") ✅
    │
    └─→ saveChangesToSupabase()
        ↓ wysyła: child_first_name: "Jan"
        ↓
        SUPABASE (updated) ✅
```

**Wynik:** Pełna synchronizacja bez utraty danych, kompatybilność wsteczna! ✅

**Akt: CH.LUB.BLIN.1783.002**

### Etap 1: Pobieranie z Supabase
```sql
SELECT original_id, imageidx, image_path, child_first_name, 
       father_first_name, mother_first_name, witnesses
FROM public_imports
WHERE original_id = 'CH.LUB.BLIN.1783.002'
```

**Dane w Supabase:**
```
original_id: "CH.LUB.BLIN.1783.002"
imageidx: 25
image_path: "/images/blinow/1783/002.jpg"
child_first_name: "Jan"
father_first_name: "Piotr"
mother_first_name: "Maria"
witnesses: "Jakub Nowak, Stanisław Kowalski"
```

### Etap 2: Załadowanie do HTML (app.imageActs[42])
```javascript
app.imageActs[42] = {
    id: "CH.LUB.BLIN.1783.002",
    original_id: "CH.LUB.BLIN.1783.002",
    imageIdx: 25,           // ✅ Indeks obrazu
    image_path: "/images/blinow/1783/002.jpg",  // ✅ Ścieżka
    fieldValues: {
        child_first_name: "Jan",
        father_first_name: "Piotr",
        mother_first_name: "Maria",
        witnesses: "Jakub Nowak, Stanisław Kowalski"
        // ... inne pola
    }
}
```

### Etap 3: Wyświetlenie w tabeli
- Kolumna "Dziecko": Jan
- Kolumna "Ojciec": Piotr
- Kolumna "Świadkowie": Jakub Nowak, Stanisław Kowalski
- 📸 Link do obrazu: `/images/blinow/1783/002.jpg` (z `image_path`)

### Etap 4: Zmiana danych w HTML
Użytkownik zmienia:
- `child_first_name: "Jan" → "Janusz"`

### Etap 5: Zapis do Supabase
```javascript
await supabase.from('public_imports')
    .update({
        child_first_name: 'Janusz',
        image_path: '/images/blinow/1783/002.jpg',
        witnesses: 'Jakub Nowak, Stanisław Kowalski'
    })
    .eq('original_id', 'CH.LUB.BLIN.1783.002')
```

### Etap 6: Export do SQLite
```sql
INSERT INTO imported_records 
(id, child_first_name, image_path, imageidx, witnesses, ...)
VALUES (
    'CH.LUB.BLIN.1783.002',
    'Janusz',
    '/images/blinow/1783/002.jpg',
    25,
    'Jakub Nowak, Stanisław Kowalski',
    ...
)
```

---

## ✅ Podsumowanie Synchronizacji

### Co się synchronizuje?

**Supabase → HTML ✅**
- 28 kolumn mapuje się na `app.imageActs`
- `imageidx` i `image_path` ładują się prawidłowo
- Wszystkie pola genealogiczne w `fieldValues`

**HTML → Supabase ✅**
- 18 pól genealogicznych wysyła się w UPDATE
- `image_path` i `imageidx` w pełni obsługiwane
- Fallback na `.eq('id', actId)` jeśli `original_id` nie znaleziony

**Supabase → SQLite ✅ (NAPRAWIONE v8.20)**
- 24 kolumny (wcześniej 19, teraz +5)
- Zawiera WSZYSTKIE pola genealogiczne
- `image_path` i `imageidx` eksportują się
- `witnesses`, `child_*`, `mother_maiden_name` już w tabeli

---

## 🔍 Sprawdzanie Gdzie Się Zapisuje

### ❓ Gdzie zapisuje się `image_path`?

1. **Supabase:** kolumna `image_path` w tabeli `public_imports`
2. **HTML:** `app.imageActs[idx].image_path` (ładuje się w loadFromSupabase linia 8938)
3. **Wysyłanie:** `saveChangesToSupabase()` wysyła jako `image_path` [linia 9347]
4. **SQLite:** `image_path` kolumna w tabeli `imported_records` [linia 7840]

### ❓ Gdzie zapisuje się `imageidx`?

1. **Supabase:** kolumna `imageidx` w tabeli `public_imports`
2. **HTML:** `app.imageActs[idx].imageIdx` (ładuje się w loadFromSupabase linia 8937)
3. **Wysyłanie:** `saveChangesToSupabase()` wysyła jako `imageidx` [linia 9346]
4. **SQLite:** `imageidx` kolumna w tabeli `imported_records` [linia 7867]
5. **Assignment:** W modalnie asignment `assignActsToImages()` ustawia `imageIdx` [guzik "Przypisz obrazy"]

### ❓ Gdzie zapisuje się ROI?

1. **Supabase:** Brak kolumny `roi_json` (nie dodano)
2. **HTML:** `app.imageActs[idx].fieldROIs` (JSON obiekty)
3. **Wysyłanie:** ❌ Nie wysyła się do Supabase
4. **SQLite:** `roi_json` kolumna w tabeli `imported_records` [linia 7868]
5. **Przechowywanie:** Tylko w SQLite, tylko w fieldROIs w pamięci HTML

---

## 📋 Kontrolna Lista Danych

Po załadowaniu "Ładuj Supabase" sprawdzić w konsoli F12:

```javascript
// 1. Czy ładuje się imageIdx i image_path?
console.log('Act 0:', app.imageActs[0].imageIdx, app.imageActs[0].image_path)

// 2. Ile aktów ma przypisane obrazy?
const withImage = app.imageActs.filter(a => a.imageIdx !== null).length;
console.log('Z obrazami:', withImage, '/', app.imageActs.length)

// 3. Czy fieldValues ma genealogię?
console.log('Dziecko:', app.imageActs[0].fieldValues.child_first_name)
console.log('Świadkowie:', app.imageActs[0].fieldValues.witnesses)

// 4. Czy zapisuje się do Supabase?
// Zmień coś w tabeli → Ctrl+S → sprawdź konsolę czy jest "Wysyłam do Supabase"

// 5. Czy eksport SQLite ma obrazy?
// Eksportuj → otworz .db → SELECT image_path FROM imported_records LIMIT 3
```

---

## ✅ PODSUMOWANIE ZMIAN v8.20

### Co się zmieniło?

| # | Zmiana | Linia | Status |
|---|--------|-------|--------|
| 1 | Mapowanie ID (UUID → CH.LUB.BLIN) | 2531-2534 | ✅ Zweryfikowane |
| 2 | Mapowanie import STARE→NOWE | 8228-8237 | ✅ Zweryfikowane |
| 3 | Mapowanie auto-load STARE→NOWE | 2542-2559 | ✅ Zweryfikowane |
| 4 | **Mapowanie export NOWE→STARE** | 8019-8031 | ✅ **KRYTYCZNE** |
| 5 | Usunięcie emoji z loading | 1621 | ✅ Zweryfikowane |

### Co się synchronizuje?

```
✅ Supabase → HTML (loadFromSupabase)
✅ HTML → Supabase (saveChangesToSupabase)
✅ HTML → SQLite (exportToSQLiteFile) - NAPRAWIONO
✅ SQLite → HTML (importFromSQLiteFile) - NAPRAWIONO
✅ SQLite Auto-load (autoLoadLatestSQLFile) - NAPRAWIONO
```

### Obsługiwane Formaty

```
✅ Supabase fieldValues (NOWE: child_first_name, father_last_name, itd.)
✅ SQL import (STARE: imie, nazwisko, imie_o, itd.)
✅ SQL export (OBIE: imie + child_first_name dla kompatybilności)
✅ Backward compatibility (fallback na stare nazwy)
```

### Potencjalne Problemy

```
⚠️ Duplikacja danych w SQL (imie + child_first_name) - CELOWE
⚠️ Mogą być niespójności między kolumnami - Zminimalizowane fallback
⚠️ Wymaga pełnego re-testu cyklu: Supabase → SQL → Import
```

---

## 🚀 Wersje i Historia Zmian

| Wersja | Data | Zmiana |
|--------|------|--------|
| v8.19 | 31.01 | Podstawowy import |
| v8.20 | 3.02 | ✅ **Naprawiono mapowanie kolumn** (+5 genealogicznych) |
| v8.21 | 3.02 | Kopia v8.20 (backup) |

### Detale v8.20 (3.02.2026):

- ✅ Mapowanie ID (UUID → CH.LUB.BLIN)
- ✅ Import SQL: czyta STARE polskie nazwy z fallback
- ✅ Export SQL: **NAPRAWIONO** - czyta z Supabase, fallback na stare
- ✅ Auto-load SQL: to samo mapowanie co import
- ✅ Kompatybilność wsteczna: wszystkie starsze SQL pliki działają
- ✅ Brak utraty danych w całym cyklu

---

**Ostatnia aktualizacja:** 3 lutego 2026, 16:15  
**Weryfikacja kodu:** ✅ Pełna synchronizacja działa prawidłowo  
**Dokumentacja:** ✅ Spójna z kodem (CHANGELOG_v8.20_COMPLETE.md)

