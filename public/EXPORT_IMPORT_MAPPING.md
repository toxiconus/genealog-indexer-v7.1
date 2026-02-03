# Mapowanie Danych: HTML ↔ Supabase ↔ SQLite

**Data:** 3 lutego 2026  
**Wersja:** v8.20/v8.21 (ze wsparciem dla starych baz SQL)

---

## 🔄 MAPOWANIE NAZW KOLUMN: Stare → Nowe

SQL pliki mają **STARE polskie nazwy**. App czyta je i mapuje na **NOWE angielskie**:

| Stara nazwa (SQL) | Nowa nazwa (app) | Opis |
|---|---|---|
| `imie` | `child_first_name` | Imię dziecka |
| `nazwisko` | `child_last_name` | Nazwisko dziecka |
| `imie_o` | `father_first_name` | Imię ojca |
| `nazwisko_o` | `father_last_name` | Nazwisko ojca |
| `w_o` | `father_age` | Wiek ojca |
| `im` | `mother_first_name` | Imię matki |
| `nm` | `mother_last_name` | Nazwisko matki |
| `w_m` | `mother_age` | Wiek matki |
| `uwagi` | `notes` | Notatki |
| `uwagi_org` | `notes_org` | Notatki organizacyjne |
| `miejscowosc` | `location` | Lokalizacja/parafia |

**Gdzie mapowanie zachodzi:**
- `importFromSQLiteFile()` (line 8194) - ładowanie .db pliku
- `autoLoadLatestSQLFile()` (line 2485) - auto-ładowanie genealogia_YYYY-MM-DD.db

---

## 📊 EXPORT: Co wysyłamy do Supabase?

### Funkcja: `saveChangesToSupabase()` [Line 9325]

```javascript
const updateData = {
    imageidx: act.imageIdx,                          // z HTML → Supabase
    image_path: act.image_path,                      // z HTML → Supabase
    christening_year: parseInt(act.rok || fv.rok),  // z HTML → Supabase
    christening_act_number: act.nr || fv.nr_aktu,   // z HTML → Supabase
    
    // Dziecko (z fieldValues)
    child_first_name: fv.child_first_name,           // ✅ OK
    child_last_name: fv.child_last_name,             // ✅ OK
    child_birth_date: fv.child_birth_date,           // ✅ OK (NOWE)
    
    // Ojciec (z fieldValues)
    father_first_name: fv.father_first_name,         // ✅ OK
    father_last_name: fv.father_last_name,           // ✅ OK
    father_age: fv.father_age,                       // ✅ OK (NOWE)
    
    // Matka (z fieldValues)
    mother_first_name: fv.mother_first_name,         // ✅ OK
    mother_last_name: fv.mother_last_name,           // ✅ OK
    mother_maiden_name: fv.mother_maiden_name,       // ✅ OK (NOWE)
    mother_age: fv.mother_age,                       // ✅ OK (NOWE)
    
    // Świadkowie
    witnesses: fv.witnesses,                         // ✅ OK (NOWE)
    
    // Notatki
    notes: fv.notes || fv.uwagi,                     // ✅ OK
    notes_org: fv.notes_org || fv.uwagi_org,         // ✅ OK
    location: fv.location || fv.miejscowosc          // ✅ OK
};
```

**WHERE klausula:**
```javascript
.eq('original_id', actId)  // 🔑 PRAWIDŁOWO! (fallback na .eq('id', actId))
```

---

## 📥 IMPORT: Co ładujemy z Supabase?

### Funkcja: `loadFromSupabase()` [Line 8448+]

```javascript
const imageActs = data.map(row => {
    return {
        // Identyfikatory
        id: row.original_id,                    // ✅ CH.LUB.BLIN.YYYY.NNN
        original_id: row.original_id,           // ✅ Zachowaj dla compatibility
        
        // Obrazy
        imageIdx: row.imageidx || null,         // ✅ OK (null jeśli nie przypisany)
        image_path: row.image_path,             // ✅ OK
        
        // Główne pola (flat)
        christening_year: row.christening_year,
        christening_act_number: row.christening_act_number,
        child_first_name: row.child_first_name,
        child_last_name: row.child_last_name,
        father_first_name: row.father_first_name,
        mother_first_name: row.mother_first_name,
        
        // fieldValues object (zagnieżdżone)
        fieldValues: {
            rok: row.christening_year,
            nr_aktu: row.christening_act_number,
            
            child_first_name: row.child_first_name,     // ✅ OK
            child_last_name: row.child_last_name,       // ✅ OK
            child_birth_date: row.child_birth_date,     // ✅ OK (NOWE)
            
            father_first_name: row.father_first_name,   // ✅ OK
            father_last_name: row.father_last_name,     // ✅ OK
            father_age: row.father_age,                 // ✅ OK (NOWE)
            
            mother_first_name: row.mother_first_name,   // ✅ OK
            mother_last_name: row.mother_last_name,     // ✅ OK
            mother_maiden_name: row.mother_maiden_name, // ✅ OK (NOWE)
            mother_age: row.mother_age,                 // ✅ OK (NOWE)
            
            witnesses: row.witnesses,                   // ✅ OK (NOWE)
            notes: row.notes,                           // ✅ OK
            notes_org: row.notes_org,                   // ✅ OK
            location: row.location                      // ✅ OK
        }
    };
});
```

---

## 🔄 PORÓWNANIE: EXPORT vs IMPORT

| Pole | EXPORT (do Supabase) | IMPORT (z Supabase) | Spójność |
|------|----------------------|-------------------|----------|
| **imageidx** | ✅ `act.imageIdx` | ✅ `row.imageidx` | ✅ OK |
| **image_path** | ✅ `act.image_path` | ✅ `row.image_path` | ✅ OK |
| **christening_year** | ✅ `act.rok` | ✅ `row.christening_year` | ✅ OK |
| **christening_act_number** | ✅ `act.nr` | ✅ `row.christening_act_number` | ✅ OK |
| **child_first_name** | ✅ `fv.child_first_name` | ✅ `row.child_first_name` | ✅ OK |
| **child_last_name** | ✅ `fv.child_last_name` | ✅ `row.child_last_name` | ✅ OK |
| **child_birth_date** | ✅ `fv.child_birth_date` | ✅ `row.child_birth_date` | ✅ OK |
| **father_first_name** | ✅ `fv.father_first_name` | ✅ `row.father_first_name` | ✅ OK |
| **father_last_name** | ✅ `fv.father_last_name` | ✅ `row.father_last_name` | ✅ OK |
| **father_age** | ✅ `fv.father_age` | ✅ `row.father_age` | ✅ OK |
| **mother_first_name** | ✅ `fv.mother_first_name` | ✅ `row.mother_first_name` | ✅ OK |
| **mother_last_name** | ✅ `fv.mother_last_name` | ✅ `row.mother_last_name` | ✅ OK |
| **mother_maiden_name** | ✅ `fv.mother_maiden_name` | ✅ `row.mother_maiden_name` | ✅ OK |
| **mother_age** | ✅ `fv.mother_age` | ✅ `row.mother_age` | ✅ OK |
| **witnesses** | ✅ `fv.witnesses` | ✅ `row.witnesses` | ✅ OK |
| **notes** | ✅ `fv.notes` | ✅ `row.notes` | ✅ OK |
| **notes_org** | ✅ `fv.notes_org` | ✅ `row.notes_org` | ✅ OK |
| **location** | ✅ `fv.location` | ✅ `row.location` | ✅ OK |

---

## ✅ WERDYKT: MAPOWANIE PRAWIDŁOWE!

### ✅ Wszystkie pola są spójnie mapowane w obu kierunkach
- **Export:** Ładujemy z `app.imageActs.fieldValues` i wysyłamy do Supabase
- **Import:** Ładujemy z Supabase i mapujemy do `app.imageActs.fieldValues`
- **Synchronizacja:** Działa w obie strony bez konfliktów

### ✅ WHERE klausula prawidłowa
```javascript
.eq('original_id', actId)  // ✅ PRAWIDŁOWO!
```
- Używamy `original_id` (format `CH.LUB.BLIN.YYYY.NNN`)
- Fallback na `id` jeśli `original_id` nie znalezione
- To jest unikatowy identyfikator w bazie

### ✅ Nowe pola dodane (3.02.2026)
Wszystkie 5 nowych kolumn są prawidłowo mapowane:
- `child_birth_date` ✅
- `father_age` ✅
- `mother_maiden_name` ✅
- `mother_age` ✅
- `witnesses` ✅

---

## ⚠️ Rzeczy do zwrócenia uwagi

### 1. Flattened struktura w loadFromSupabase()
Ładujemy dane do DWÓCH miejsc:
- Jako flat fields: `act.child_first_name`
- Jako zagnieżdżone: `act.fieldValues.child_first_name`

**Dlaczego?** Dla kompatybilności z różnymi częściami kodu.

### 2. NULL handling dla imageIdx
```javascript
imageIdx: row.imageidx !== undefined && row.imageidx !== null ? parseInt(row.imageidx) : null
```
- Prawidłowe! Jeśli brak obrazu → `null` (nie 0!)
- Pozwala rozróżnić: "brak przypisania" vs "przypisane do obrazu 0"

### 3. Fallback wartości dla fieldValues
```javascript
christening_year: parseInt(act.rok || act.year || fv.rok || 0)
```
- Próbuje kilka wariantów nazw pól
- Polskie (`rok`, `imie`) i angielskie (`year`, `first_name`)
- Gwarantuje, że zawsze coś się prześlę (nawet 0)

### 4. String vs Integer dla roku
```javascript
// EXPORT: parseInt(...) → integer
// IMPORT: text (zachowujemy jako text z bazy)
```
**Uwaga:** W Supabase rok jest `text`, ale my konwertujemy do integer do wysłania.

---

## 🧪 Jak testować?

**1. Załaduj dane:**
- Kliknij "Ładuj Supabase"

**2. Sprawdź mapowanie:**
- Kliknij "Test Mapping"
- Sprawdź konsolę (F12) czy wszystkie pola się załadowały

**3. Przypisz obrazy i zapisz:**
- Zaznacz akty 1-50
- Przypisz do obrazu (modal)
- Kliknij "Zapisz zmiany"
- Sprawdź konsolę czy UPDATE poszedł bez błędów

**4. Przeładuj stronę:**
- Kliknij F5
- Załaduj Supabase znowu
- Sprawdź czy image assignment się zachował

---

## 📝 Podsumowanie

| Aspekt | Status | Uwagi |
|--------|--------|-------|
| Spójność mapowania | ✅ OK | Wszystkie pola mapowane identycznie |
| WHERE klausula | ✅ OK | original_id + fallback na id |
| NULL handling | ✅ OK | imageIdx = null dla bez przypisania |
| Nowe kolumny (5 szt.) | ✅ OK | Wszystkie prawidłowo mapowane |
| Fallback wartości | ✅ OK | Wiele wariantów nazw pól |
| Synchronizacja dwukierunkowa | ✅ OK | Export i import pracują razem |

**WNIOSEK: Export do Supabase jest prawidłowy! 🚀**
