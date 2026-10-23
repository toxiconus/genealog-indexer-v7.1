# 🔧 NAPRAW CONSTRAINT W SUPABASE - Fehler "duplicate key value violates unique constraint"

## 🎯 Problem

```
[Zapis] Błąd: duplicate key value violates unique constraint "unique_original_id"
```

**Przyczyna:** 
- Constraint jest na `unique_original_id` ale UPSERT robi na `id` (displayId)
- Kilka akt zapisuje się z tym samym `original_id` co powoduje konflikt

---

## ✅ Rozwiązanie

### Krok 1: Sprawdź strukturę tabeli w Supabase

1. Otwórz [Supabase Dashboard](https://app.supabase.com)
2. Przejdź do **SQL Editor**
3. Uruchom:

```sql
-- Sprawdź strukturę tabeli
\d public_imports

-- Lub alternatywnie:
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'public_imports';

-- Wyświetl constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'public_imports';
```

---

### Krok 2: Zmieniamy schemat tabeli

**Backup danych (WAŻNE!):**
```sql
-- Stwórz backup istniejących danych
CREATE TABLE public_imports_backup AS
SELECT * FROM public_imports;

-- Lub eksportuj CSV z UI (Database → public_imports → Export)
```

**Dodaj kolumny jeśli brakuje:**
```sql
-- Dodaj original_id_uuid jeśli brakuje
ALTER TABLE public_imports 
ADD COLUMN original_id_uuid UUID DEFAULT gen_random_uuid() UNIQUE;

-- Dodaj display_id jeśli brakuje  
ALTER TABLE public_imports 
ADD COLUMN display_id TEXT;

-- Dodaj index na display_id dla szybkiego wyszukiwania
CREATE INDEX idx_public_imports_display_id ON public_imports(display_id);
```

---

### Krok 3: Migruj dane (Jeśli już są akty w bazie)

```sql
-- Jeśli original_id zawiera "CH.LUB.BLIN" (to jest displayId, nie UUID)
-- Przenieś go do display_id i wygeneruj nowe UUID

UPDATE public_imports 
SET 
  display_id = original_id,
  original_id_uuid = gen_random_uuid()
WHERE original_id LIKE 'CH.LUB.BLIN.%';

-- Następnie zmień column original_id na UUID
ALTER TABLE public_imports 
DROP COLUMN original_id;

ALTER TABLE public_imports 
RENAME COLUMN original_id_uuid TO original_id;

-- Dodaj UNIQUE constraint na original_id
ALTER TABLE public_imports 
ADD CONSTRAINT unique_original_id UNIQUE (original_id);
```

---

### Krok 4: Sprawdź czy wszystko OK

```sql
-- Sprawdź strukturę
\d public_imports

-- Powinieneś zobaczyć:
-- original_id | uuid | unique ← UUID, unikalny
-- display_id  | text | ← CH.LUB.BLIN.1783.002
-- ... inne kolumny

-- Sprawdź czy są duplikaty (powinno być 0)
SELECT COUNT(*) as duplicates 
FROM (
  SELECT original_id, COUNT(*) 
  FROM public_imports 
  GROUP BY original_id 
  HAVING COUNT(*) > 1
) t;
```

---

## 🐍 Alternatywnie: Stwórz nową tabelę (bez danych)

Jeśli migracja nie działa, stwórz nową tabelę:

```sql
-- Stwórz nową tabelę z prawidłowym schematem
CREATE TABLE public_imports_v2 (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  original_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  display_id TEXT UNIQUE NOT NULL,
  
  -- Pola genealogiczne
  christening_year TEXT,
  christening_act_number TEXT,
  child_first_name TEXT,
  child_last_name TEXT,
  child_birth_date TEXT,
  child_gender TEXT,
  child_legitimacy_status TEXT,
  
  father_first_name TEXT,
  father_last_name TEXT,
  father_age TEXT,
  father_occupation TEXT,
  father_civil_status TEXT,
  
  mother_first_name TEXT,
  mother_last_name TEXT,
  mother_maiden_name TEXT,
  mother_age TEXT,
  mother_occupation TEXT,
  mother_civil_status TEXT,
  
  godfather_first_name TEXT,
  godfather_last_name TEXT,
  godfather_place TEXT,
  godmother_first_name TEXT,
  godmother_last_name TEXT,
  godmother_place TEXT,
  
  priest_first_name TEXT,
  priest_last_name TEXT,
  
  christening_date TEXT,
  
  reporting_person_first_name TEXT,
  reporting_person_last_name TEXT,
  reporting_person_occupation TEXT,
  reporting_person_age TEXT,
  reporting_person_place TEXT,
  
  witness_1_first_name TEXT,
  witness_1_last_name TEXT,
  witness_1_occupation TEXT,
  witness_1_place TEXT,
  
  witness_2_first_name TEXT,
  witness_2_last_name TEXT,
  witness_2_occupation TEXT,
  witness_2_place TEXT,
  
  witness_3_first_name TEXT,
  witness_3_last_name TEXT,
  witness_3_occupation TEXT,
  witness_3_place TEXT,
  
  notes TEXT,
  notes_org TEXT,
  location TEXT,
  image_path TEXT,
  imageidx INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_original_id UNIQUE (original_id),
  CONSTRAINT unique_display_id UNIQUE (display_id)
);

-- Stwórz indeksy
CREATE INDEX idx_display_id ON public_imports_v2(display_id);
CREATE INDEX idx_christening_year ON public_imports_v2(christening_year);
CREATE INDEX idx_child_last_name ON public_imports_v2(child_last_name);

-- Skopiuj dane ze starej tabeli (jeśli mają być)
-- INSERT INTO public_imports_v2 (...)
-- SELECT ... FROM public_imports;

-- Zmień nazwę
-- DROP TABLE public_imports;
-- ALTER TABLE public_imports_v2 RENAME TO public_imports;
```

---

## 🔄 Po zmianach: Ustaw RLS (Row Level Security)

```sql
-- Włącz RLS na tabeli (jeśli public)
ALTER TABLE public_imports ENABLE ROW LEVEL SECURITY;

-- Pozwól wszystkim czytać
CREATE POLICY "Allow public read" ON public_imports
FOR SELECT
TO anon, authenticated
USING (true);

-- Pozwól wszystkim pisać (jeśli chcesz)
CREATE POLICY "Allow public write" ON public_imports
FOR INSERT, UPDATE, DELETE
TO anon, authenticated
WITH CHECK (true);
```

---

## 📝 W kodzie aplikacji - zmiany już wdrożone

Kod teraz robi:

```javascript
// FIX w saveStorage() - linia ~6970
if (!currentAct.originalId) {
    currentAct.originalId = crypto.randomUUID();  // ← Generuj UUID jeśli brak
}

// Wysyłaj oba pola
supabase.from('public_imports').upsert({
    original_id: currentAct.originalId,     // UUID ← UPSERT po tym
    display_id: currentAct.displayId,       // CH.LUB.BLIN.1783.002
    ...supabaseData
}, {
    onConflict: 'original_id'  // ← Konflikt na original_id (UUID)
});

// FIX w loadFromSupabase() - linia ~6625
// Wczytuj stare akty i generuj UUID jeśli brak
let originalId = row.original_id_uuid || row.originalId;
if (!originalId || originalId.includes('CH.LUB.BLIN')) {
    originalId = crypto.randomUUID();  // ← UUID dla każdego
}

return {
    originalId: originalId,           // UUID
    displayId: row.original_id,       // CH.LUB.BLIN.1783.002
    ...
};
```

---

## ✅ Test po zmianach

```javascript
// W Console po zmianach Supabase:

// Test 1: Sprawdź czy saveStorage działa bez błędów
// 1. Załaduj folder z obrazami
// 2. Utwórz nowe akty
// 3. Edytuj jedno pole w formularzu
// 4. Kliknij [💾 Zapisz record]
// Powinno być OK bez duplikatów

// Test 2: Edytuj ten sam akt drugi raz
// Kliknij [💾 Zapisz record] znowu
// Powinno być UPSERT, nie INSERT

console.log('Last save successful:', !!app.imageActs[0].originalId);
```

---

## 📞 Troubleshooting

### Błąd: "column original_id does not exist"
- Kolumna `original_id` nie istnieje
- **Fix:** Dodaj ją: `ALTER TABLE public_imports ADD COLUMN original_id UUID UNIQUE;`

### Błąd: "column original_id is of type text not uuid"
- Kolumna `original_id` jest TEXT, a jest UUID
- **Fix:** Zmień typ: `ALTER TABLE public_imports ALTER COLUMN original_id TYPE UUID;`

### Błąd: "constraint unique_original_id does not exist"
- Constraint nie istnieje
- **Fix:** Dodaj go: `ALTER TABLE public_imports ADD CONSTRAINT unique_original_id UNIQUE (original_id);`

---

## 🎯 Docelowy schemat

```
public_imports
├── id (BIGINT) - primary key
├── original_id (UUID) - UNIQUE, główny klucz logiczny
├── display_id (TEXT) - UNIQUE, CH.LUB.BLIN.1783.002 dla UI
├── christening_year (TEXT)
├── christening_act_number (TEXT)
├── child_first_name (TEXT)
├── ...inne pola genealogiczne...
├── notes (TEXT)
├── image_path (TEXT)
├── imageidx (INTEGER)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

Constraints:
├── UNIQUE (original_id) ← UUID - głowny
├── UNIQUE (display_id)  ← Czytelny dla UI
└── Indexes: display_id, christening_year, child_last_name
```

---

**Status:** ✅ Napraw ten schemat, a błąd powinien zniknąć  
**Ostatnia aktualizacja:** 29.01.2026
