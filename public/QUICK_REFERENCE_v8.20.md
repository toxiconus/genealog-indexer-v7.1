# 🎯 QUICK REFERENCE: v8.20 Zmiany

**Data:** 3 lutego 2026  
**Status:** ✅ Wszystkie zmiany Zweryfikowane i Przetestowane

---

## ⚡ TL;DR - Najważniejsze

### Zmiana #1: Import SQL Mapowanie
```javascript
// SQL stare nazwy → App nowe nazwy
child_first_name: record.child_first_name || record.imie || ''
```
📍 **Gdzie:** `importFromSQLiteFile()` linia 8228, `autoLoadLatestSQLFile()` linia 2542  
✅ **Status:** Działa - fallback na stare nazwy

---

### Zmiana #2: Export SQL Mapowanie ⭐ KRYTYCZNA
```javascript
// ❌ BYŁO:   fv.imie || ''  (zawsze puste!)
// ✅ JEST:   fv.child_first_name || fv.imie || ''  (czyta Supabase!)
```
📍 **Gdzie:** `exportToSQLiteFile()` linia 8019-8024  
✅ **Status:** NAPRAWIONO - teraz eksport ma dane genealogiczne

---

### Zmiana #3: ID Format Rozpoznawanie
```javascript
const isCHFormat = recordId.startsWith('CH.LUB.BLIN') || recordId.startsWith('CH.BLIN');
id: isCHFormat ? recordId : (record.original_id || recordId || '')
```
📍 **Gdzie:** `autoLoadLatestSQLFile()` linia 2531-2534  
✅ **Status:** Działa - automatycznie rozpoznaje UUID vs CH.LUB.BLIN

---

## 📊 Tabela Zmian

| # | Co | Gdzie | Linia | Co Się Zmieniło |
|---|-----|-------|-------|-----------------|
| 1 | 🔄 Import | importFromSQLiteFile | 8228 | Dodano fallback: `\|\| record.imie` |
| 2 | 🔄 Import | autoLoadLatestSQLFile | 2542 | Dodano fallback: `\|\| record.imie` |
| 3 | 🔄 Export | exportToSQLiteFile | 8019 | **FIX:** `fv.child_first_name \|\| fv.imie` |
| 4 | 🆔 ID | autoLoadLatestSQLFile | 2531 | Dodano sprawdzenie formatu ID |
| 5 | 🎨 UI | Loading | 1621 | Usunięto emoji `⏳` |

---

## 🔐 Mapowanie Tabelka (szybka referacja)

| Supabase (NOWE) | SQL (STARE) | Import (czyta) | Export (pisze) |
|---|---|---|---|
| child_first_name | imie | ✅ `\|\| record.imie` | ✅ `fv.child_first_name \|\| fv.imie` |
| child_last_name | nazwisko | ✅ `\|\| record.nazwisko` | ✅ `fv.child_last_name \|\| fv.nazwisko` |
| father_first_name | imie_o | ✅ `\|\| record.imie_o` | ✅ `fv.father_first_name \|\| fv.imie_o` |
| father_last_name | nazwisko_o | ✅ `\|\| record.nazwisko_o` | ✅ `fv.father_last_name \|\| fv.nazwisko_o` |
| father_age | w_o | ✅ `\|\| record.w_o` | ✅ `fv.father_age \|\| fv.w_o` |
| mother_first_name | im | ✅ `\|\| record.im` | ✅ `fv.mother_first_name \|\| fv.im` |
| mother_last_name | nm | ✅ `\|\| record.nm` | ✅ `fv.mother_last_name \|\| fv.nm` |
| mother_age | w_m | ✅ `\|\| record.w_m` | ✅ `fv.mother_age \|\| fv.w_m` |
| notes | uwagi | ✅ `\|\| record.uwagi` | ✅ `fv.notes \|\| fv.uwagi` |
| notes_org | uwagi_org | ✅ `\|\| record.uwagi_org` | ✅ `fv.notes_org \|\| fv.uwagi_org` |
| location | miejscowosc | ✅ `\|\| record.miejscowosc` | ✅ `fv.location \|\| fv.miejscowosc` |

---

## ✅ Checklist Implementacji

- [x] Kod zawiera mapowanie STARE→NOWE
- [x] Kod zawiera mapowanie NOWE→STARE
- [x] Mapowanie ma fallback (`||`)
- [x] Export mapuje z Supabase (nie z pól "stare")
- [x] Import mapuje z obu źródeł (NOWE + STARE)
- [x] ID rozpoznaje UUID vs CH.LUB.BLIN
- [x] Emoji usunięte z loading tekstu
- [x] v8.20 i v8.21 zsynchronizowane

---

## 🧪 Testowanie (3 scenariusze)

### Test 1: Auto-load SQL na startup
```
1. Otwórz stronę
2. Czekaj na auto-load
3. Sprawdź konsolę: "✅ Znaleziono SQL: genealogia_2026-02-03.db"
4. Sprawdź tabelę: Powinny być dane genealogiczne
```
✅ **Oczekiwany wynik:** Dane z SQL są prawidłowo załadowane

### Test 2: Load Supabase → Export SQL
```
1. Kliknij "Ładuj Supabase"
2. Czekaj: "📂 Loaded from Supabase: 5512 records"
3. Kliknij "Eksportuj do SQLite"
4. Sprawdź pobrany plik .db
```
✅ **Oczekiwany wynik:** SQL zawiera genealogiczne dane (child_first_name itp.)

### Test 3: Import SQL
```
1. Kliknij "Import SQL"
2. Wybierz plik .db
3. Sprawdź konsolę: "✅ Zaimportowano X rekordów"
4. Sprawdź tabelę: Powinny być dane genealogiczne
```
✅ **Oczekiwany wynik:** Dane z SQL są prawidłowo załadowane

---

## 🔧 Troubleshooting

### Problem: Tabela pusta po imporcie SQL
**Przyczyna:** Fallback nie zadziałał, SQL ma złe nazwy kolumn  
**Rozwiązanie:** Sprawdzić `PRAGMA table_info(imported_records)` - czy są kolumny `imie`, `child_first_name`?

### Problem: Dane genealogiczne puste
**Przyczyna:** fieldValues nie załadowały się prawidłowo  
**Rozwiązanie:** Sprawdzić w F12: `console.log(app.imageActs[0].fieldValues)`

### Problem: UUID zamiast CH.LUB.BLIN
**Przyczyna:** ID rozpoznawanie nie zadziałało  
**Rozwiązanie:** Sprawdzić czy recordId zaczyna się `CH.LUB.BLIN`

---

## 📚 Dokumentacja Pełna

- **SYNCHRONIZACJA_DANYCH_v8.20.md** - Pełny opis mapowania
- **CHANGELOG_v8.20_COMPLETE.md** - Detale zmian i weryfikacja
- **EXPORT_IMPORT_MAPPING.md** - Tabela mapowania
- **SUPABASE_TO_SQLITE_SYNC.md** - Przepływ synchronizacji

---

**Ostatnia aktualizacja:** 3 lutego 2026, 16:20  
**Weryfikacja:** ✅ Kod i dokumentacja spójne
