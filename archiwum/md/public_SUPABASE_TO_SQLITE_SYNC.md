# Synchronizacja: Supabase → HTML → SQLite

**Data:** 3 lutego 2026  
**Wersja:** v8.20/v8.21 (ze wsparciem dla starych baz SQL)

---

## 🔧 MAPOWANIE KOLUMN: Stare SQL → Nowe App

SQL pliki mają **STARE polskie nazwy**. Import automatycznie mapuje na **NOWE angielskie**:

| Stara (SQL) | Nowa (app) | Typ | Opis |
|---|---|---|---|
| `imie` | `child_first_name` | TEXT | Imię dziecka |
| `nazwisko` | `child_last_name` | TEXT | Nazwisko dziecka |
| `imie_o` | `father_first_name` | TEXT | Imię ojca |
| `nazwisko_o` | `father_last_name` | TEXT | Nazwisko ojca |
| `w_o` | `father_age` | TEXT | Wiek ojca |
| `im` | `mother_first_name` | TEXT | Imię matki |
| `nm` | `mother_last_name` | TEXT | Nazwisko matki |
| `w_m` | `mother_age` | TEXT | Wiek matki |
| `uwagi` | `notes` | TEXT | Notatki |
| `uwagi_org` | `notes_org` | TEXT | Notatki org. |
| `miejscowosc` | `location` | TEXT | Parafia/lokacja |

**Logika mappingu:**
```javascript
// Priorytet: nowa kolumna, fallback na starą
field = record.new_column || record.old_column || ''
```

---

## 🔄 Przepływ danych

```
Supabase (public_imports)
    ↓
    loadFromSupabase() → app.imageActs
    ↓
    [Edycje w HTML]
    ↓
    saveChangesToSupabase() → Supabase UPDATE
    exportToSQLiteFile() → SQLite .db file
```

---

## 📊 PORÓWNANIE: Supabase vs SQLite Export

### Supabase kolumny (44 kolumny)
```
Główne ID:
  - id (UUID)
  - original_id (CH.LUB.BLIN.YYYY.NNN)

Genealogiczne:
  - child_first_name, child_last_name, child_birth_date
  - father_first_name, father_last_name, father_age
  - mother_first_name, mother_last_name, mother_maiden_name, mother_age
  - witnesses
  - notes, notes_org, location

Obrazy:
  - imageidx, image_path
  - (+ act_roi, field_rois - JSONB)

Metadane:
  - christening_year, christening_act_number
  - created_at, updated_at
  - [+ 20+ dodatkowych pól - witness_1_place, priest_occupation, itp.]
```

### SQLite tabela (20 kolumn)
```
CREATE TABLE imported_records (
    row_id INTEGER PRIMARY KEY,           ← auto
    id TEXT UNIQUE,                       ← Supabase id/original_id
    rok INTEGER,                          ← christening_year
    nr TEXT,                              ← christening_act_number
    nazwisko TEXT,                        ← ojciec_nazwisko / father_last_name
    imie TEXT,                            ← ojciec_imie / father_first_name
    miejscowosc TEXT,                     ← location
    imie_o TEXT,                          ← mother_first_name
    nazwisko_o TEXT,                      ← mother_last_name
    w_o TEXT,                             ← mother_age / matka_lata
    im TEXT,                              ← mother_first_name (duplikat?)
    nm TEXT,                              ← mother_last_name (duplikat?)
    w_m TEXT,                             ← mother_age (duplikat?)
    uwagi TEXT,                           ← notes / uwagi
    uwagi_org TEXT,                       ← notes_org / uwagi_org
    image_path TEXT,                      ← image_path
    imageidx INTEGER,                     ← imageidx
    roi_json TEXT,                        ← fieldROIs (JSON string)
    field_values TEXT,                    ← fieldValues (JSON string)
    status TEXT,                          ← 'indexed'
    imported_at DATETIME                  ← CURRENT_TIMESTAMP
)
```

---

## 🔍 MAPOWANIE: Co się zmienia na drodze Supabase → SQLite?

| Supabase | → | SQLite | Status | Uwagi |
|----------|---|--------|--------|-------|
| **child_first_name** | → | (BRAK!) | ⚠️ **BRAKUJE** | Nie ma osobnej kolumny dla dziecka! |
| **child_last_name** | → | (BRAK!) | ⚠️ **BRAKUJE** | |
| **child_birth_date** | → | (BRAK!) | ⚠️ **BRAKUJE** | |
| **father_first_name** | → | **imie** | ✅ OK | `field_values?.ojciec_imie \|\| father_first_name` |
| **father_last_name** | → | **nazwisko** | ✅ OK | `field_values?.ojciec_nazwisko \|\| father_last_name` |
| **father_age** | → | **w_o** | ✅ OK | `field_values?.w_o \|\| father_age` |
| **mother_first_name** | → | **imie_o** + **im** | ⚠️ DUPLIKAT | Dwie kolumny! |
| **mother_last_name** | → | **nazwisko_o** + **nm** | ⚠️ DUPLIKAT | Dwie kolumny! |
| **mother_maiden_name** | → | (BRAK!) | ⚠️ **BRAKUJE** | Nie ma w SQLite |
| **mother_age** | → | **w_m** + **w_o** | ⚠️ KONFLIKT | `w_o` to też father_age? |
| **witnesses** | → | (BRAK!) | ⚠️ **BRAKUJE** | Nie ma w SQLite |
| **notes** | → | **uwagi** | ✅ OK | `field_values?.uwagi \|\| notes` |
| **notes_org** | → | **uwagi_org** | ✅ OK | `field_values?.uwagi_org \|\| notes_org` |
| **location** | → | **miejscowosc** | ✅ OK | `field_values?.miejscowosc \|\| location` |
| **imageidx** | → | **imageidx** | ✅ OK | Bezpośrednio |
| **image_path** | → | **image_path** | ✅ OK | Bezpośrednio |
| **christening_year** | → | **rok** | ✅ OK | Konwersja do INTEGER |
| **christening_act_number** | → | **nr** | ✅ OK | Bezpośrednio |
| (fieldValues) | → | **field_values** | ✅ OK | Całe JSON |
| (fieldROIs) | → | **roi_json** | ✅ OK | JSON string |

---

## ⚠️ PROBLEMY ZNALEZIONE!

### 🔴 PROBLEM 1: Brakujące kolumny dla dziecka
```
Supabase:
  child_first_name ✅
  child_last_name ✅
  child_birth_date ✅

SQLite:
  (ŻADNA!) ❌
```

**Konsekwencja:** Dane o dziecku są GUBIĄCE się przy eksporcie do SQLite!

---

### 🔴 PROBLEM 2: Duplikaty kolumn matki
```
SQLite ma:
  imie_o    → mother_first_name
  im        → mother_first_name (DUPLIKAT!)
  
  nazwisko_o → mother_last_name
  nm        → mother_last_name (DUPLIKAT!)
  
  w_o       → father_age / mother_age ??? (KONFLIKT!)
  w_m       → mother_age
```

**Konsekwencja:** Niejasnością jakiego pola używać, może być błąd danych!

---

### 🔴 PROBLEM 3: Brakująca kolumna mother_maiden_name
```
Supabase: mother_maiden_name ✅ (NOWA KOLUMNA 3.02.2026)
SQLite:   (BRAK!) ❌
```

**Konsekwencja:** Dane o panieńskim nazwisku matki się GUBIĄ!

---

### 🔴 PROBLEM 4: Brakująca kolumna witnesses
```
Supabase: witnesses ✅ (NOWA KOLUMNA 3.02.2026)
SQLite:   (BRAK!) ❌
```

**Konsekwencja:** Lista świadków się GUBI!

---

## ✅ Co się PRAWIDŁOWO przenosi?

- ✅ ID (`id` / `original_id`)
- ✅ Rok (`rok`)
- ✅ Numer aktu (`nr`)
- ✅ Ojciec: imię, nazwisko, wiek (`imie`, `nazwisko`, `w_o`)
- ✅ Matka: imię, nazwisko, wiek (`imie_o`, `nazwisko_o`, `w_m`)
- ✅ Miejscowość (`miejscowosc`)
- ✅ Notatki (`uwagi`, `uwagi_org`)
- ✅ Obrazy (`imageidx`, `image_path`)
- ✅ JSON fields (`field_values`, `roi_json`)

---

## 💾 SQLite Export - kod [Line 7819]

```javascript
// Kolumny SQLite:
(id, rok, nr, nazwisko, imie, miejscowosc, imie_o, nazwisko_o, 
 w_o, im, nm, w_m, uwagi, uwagi_org, image_path, imageidx, 
 roi_json, field_values)

// Mapowanie:
id:              record.id || record.original_id
rok:             parseInt(record.rok || record.christening_year || 0)
nr:              record.nr || record.christening_act_number
nazwisko:        record.fieldValues?.ojciec_nazwisko || father_last_name
imie:            record.fieldValues?.ojciec_imie || father_first_name
miejscowosc:     record.fieldValues?.miejscowosc || location
imie_o:          record.fieldValues?.imie_o || mother_first_name
nazwisko_o:      record.fieldValues?.nazwisko_o || mother_last_name
w_o:             record.fieldValues?.w_o || father_age       ← ⚠️ KONFLIKT!
im:              record.fieldValues?.im || mother_first_name  ← DUPLIKAT
nm:              record.fieldValues?.nm || mother_last_name   ← DUPLIKAT
w_m:             record.fieldValues?.w_m || mother_age
imageidx:        record.imageIdx
image_path:      record.image_path
roi_json:        JSON.stringify(record.fieldROIs)
field_values:    JSON.stringify(record.fieldValues)
```

---

## 📋 REKOMENDACJE

### 1. Dodaj brakujące kolumny do SQLite
```sql
ALTER TABLE imported_records ADD COLUMN child_first_name TEXT;
ALTER TABLE imported_records ADD COLUMN child_last_name TEXT;
ALTER TABLE imported_records ADD COLUMN child_birth_date TEXT;
ALTER TABLE imported_records ADD COLUMN mother_maiden_name TEXT;
ALTER TABLE imported_records ADD COLUMN witnesses TEXT;
```

### 2. Wyczyść duplikaty i konflikty
```
Usuń kolumny:  im, nm (są duplikatami)
Wyjaśnij:      w_o - czy to father_age czy mother_age?
```

### 3. Zaktualizuj mapowanie w exportToSQLiteFile()
```javascript
// Dodaj do INSERT:
child_first_name: record.fieldValues?.child_first_name || '',
child_last_name: record.fieldValues?.child_last_name || '',
child_birth_date: record.fieldValues?.child_birth_date || '',
mother_maiden_name: record.fieldValues?.mother_maiden_name || '',
witnesses: record.fieldValues?.witnesses || '',

// Usuń duplikaty:
// im, nm - nie wstawiaj
```

---

## 🎯 WERDYKT

| Aspekt | Status | Szczegóły |
|--------|--------|-----------|
| **Supabase → HTML** | ✅ OK | Wszystkie pola się ładują |
| **HTML → Supabase** | ✅ OK | Wszystkie pola się wysyłają |
| **Supabase → SQLite** | ⚠️ PROBLEMY | Brakuje 5 kolumn, duplikaty, konflikty |
| **Spójność danych** | 🔴 ZŁA | Dane się GUBIĄ przy eksporcie do SQLite |

### Główny problem:
**SQLite schemat jest STARY i nie zawiera nowych pól dodanych 3.02.2026!**

Potrzebna aktualizacja struktury SQLite aby w pełni zsynchronizować wszystkie dane.
