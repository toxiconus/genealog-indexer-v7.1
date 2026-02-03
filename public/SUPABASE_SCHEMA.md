# Supabase Database Schema - Pełny opis

**Data aktualizacji:** 3 lutego 2026  
**Źródło:** SQL zapytanie `information_schema.columns`

---

## 📋 Tabela główna: `public.public_imports`

Zawiera 5512+ akty chrztów z Blinowa. **TO JEST NASZA GŁÓWNA TABELA PRACY.**

### Kolumny (44 kolumny)

| Kolumna | Typ | Nullable | Opis |
|---------|-----|----------|------|
| id | uuid | NO | UUID generowany automatycznie |
| original_id | text | YES | **KLUCZOWA KOLUMNA!** Format: `CH.LUB.BLIN.YYYY.NNN` (np. `CH.LUB.BLIN.1785.001`) |
| christening_year | text | YES | Rok chrzczenia: 1878-1889 |
| christening_act_number | text | YES | Numer aktu chrzczenia |
| **Dziecko (chrzestne)** | | | |
| child_first_name | text | YES | Imię dziecka |
| child_last_name | text | YES | Nazwisko dziecka |
| child_birth_date | text | YES | ⭐ Data urodzenia dziecka (NOWA KOLUMNA 3.02.2026) |
| **Ojciec** | | | |
| father_first_name | text | YES | Imię ojca |
| father_last_name | text | YES | Nazwisko ojca |
| father_age | text | YES | ⭐ Wiek ojca (NOWA KOLUMNA 3.02.2026) |
| **Matka** | | | |
| mother_first_name | text | YES | Imię matki |
| mother_last_name | text | YES | Nazwisko matki |
| mother_maiden_name | text | YES | ⭐ Nazwisko panieńskie matki (NOWA KOLUMNA 3.02.2026) |
| mother_age | text | YES | ⭐ Wiek matki (NOWA KOLUMNA 3.02.2026) |
| **Świadkowie** | | | |
| witnesses | text | YES | ⭐ Skonsolidowana lista świadków (NOWA KOLUMNA 3.02.2026) |
| **Inne pola** | | | |
| notes | text | YES | Notatki (czyszczone) |
| notes_org | text | YES | Notatki oryginalne |
| location | text | YES | Miejscowość |
| imageidx | integer | YES | Index obrazu (0-based), NULL = nie przypisany |
| image_path | text | YES | Ścieżka do pliku obrazu |
| **Metadane** | | | |
| actnum | integer | YES | Numer aktu (legacy) |
| type | text | YES | Typ rekordu |
| timestamp | text | YES | Znacznik czasu |
| importedat | text | YES | Data importu |
| source | text | YES | Źródło danych |
| batchid | bigint | YES | ID batchu importu |
| index | integer | YES | Index w batchu |
| created_at | timestamp | YES | Auto-created by Supabase |
| reporting_person_place | varchar | YES | Miejscowość osoby zgłaszającej |
| book_number | varchar | YES | Numer księgi |
| page_number | varchar | YES | Numer strony |
| parish | varchar | YES | Parafia |
| **Świadkowie - szczegółowo** | | | |
| witness_1_place | varchar | YES | Miejscowość świadka 1 |
| witness_1_occupation | varchar | YES | Zawód świadka 1 |
| witness_2_place | varchar | YES | Miejscowość świadka 2 |
| witness_2_occupation | varchar | YES | Zawód świadka 2 |
| witness_3_place | varchar | YES | Miejscowość świadka 3 |
| witness_3_occupation | varchar | YES | Zawód świadka 3 |
| **Kapłan** | | | |
| priest_occupation | varchar | YES | Zawód kapłana |
| **Rodzice chrzestni** | | | |
| godfather_place | varchar | YES | Miejscowość ojca chrzestnego |
| godmother_place | varchar | YES | Miejscowość matki chrzestnej |
| **ROI (Region of Interest)** | | | |
| act_roi | jsonb | YES | ROI dla całego aktu |
| field_rois | jsonb | YES | ROI dla poszczególnych pól (default: `{}`) |
| display_id | text | YES | ID do wyświetlania |

---

## 🔑 Ważne uwagi

### PRIMARY KEY
- `id` (UUID) - wewnętrzny identyfikator Supabase

### UNIQUE CONSTRAINT
- `original_id` - unikatowy identyfikator aktu (`CH.LUB.BLIN.1785.001`)

### UPDATE QUERIES
⚠️ **ZAWSZE używaj `WHERE original_id = '...'` a nie `WHERE id = ...`**

---

## 📊 Inne schematy w bazie

Supabase zawiera wiele wbudowanych schematów (auth, realtime, storage, vault itd.). **Nas interesuje tylko schemat `public`** i tabela `public_imports`.

---

## 💾 Jak korzystać z tych informacji?

1. **Mapowanie kolumn** → patrz tabela wyżej
2. **Update queries** → zawsze `WHERE original_id = '...'`
3. **Nowe kolumny (3.02.2026)**:
   - `child_birth_date`
   - `father_age`
   - `mother_maiden_name`
   - `mother_age`
   - `witnesses`
4. **Nullable Fields** → wszystkie kolumny mogą być NULL
5. **Data Types** → głównie TEXT dla genealogicznych pól

---

## 🔄 Historia zmian

| Data | Zmiana |
|------|--------|
| 2026-01-XX | Pierwotny import 5512 rekordów |
| 2026-02-03 | ⭐ DODANE 5 KOLUMN dla pełnego genealogicznego opisu |

---

## 🧪 Testy

W aplikacji jest funkcja `testMappingDiagnostics()` która pokazuje jak dane są mapowane między app.imageActs a Supabase. Uruchom ją klikając "Test Mapping" aby zobaczyć bieżący stan danych.

---

## 📝 Notatki programisty

- Kolumny `child_birth_date`, `father_age`, `mother_maiden_name`, `mother_age`, `witnesses` zawierają dane tekstowe o różnych formatach
- `imageidx` i `image_path` są zsynchronizowane (gdy jeden się zmienia, drugi też)
- `fieldValues` jest zastarzeły - dane są teraz w poszczególnych kolumnach
- Supabase auto-update `updated_at` przy każdym UPDATE
- Do eksportu używamy `fieldValues` w app.imageActs, a do Supabase wysyłamy rozproszone kolumny
