# 📚 Indeks Dokumentacji - Genealog v8.20+

## 📖 Szybka Nawigacja

### 🎯 Chcę...

#### ...zacząć szybko
👉 [QUICK_START_v8.21.md](#) (plik w przygotowaniu)

#### ...zrozumieć funkcjonalność v8.20
👉 [FINAL_SUMMARY_v8.20.md](FINAL_SUMMARY_v8.20.md)

#### ...korzystać z dynamicznych formularzy
👉 [DYNAMIC_FORMS_v8.21.md](DYNAMIC_FORMS_v8.21.md)

#### ...edytować fields-config.json
👉 [EDITING_FIELDS_CONFIG.md](EDITING_FIELDS_CONFIG.md)

#### ...testować aplikację
👉 [TEST_DYNAMIC_FORMS.md](TEST_DYNAMIC_FORMS.md)

#### ...zrozumieć plan integracji z bazą
👉 [INTEGRATION_DATABASE_v8.22.md](INTEGRATION_DATABASE_v8.22.md)

#### ...przeczytać release notes
👉 [RELEASE_NOTES_v8.21.md](RELEASE_NOTES_v8.21.md)

---

## 📋 Pełny Katalog Dokumentów

### 🔹 Główne Dokumenty

| Dokument | Dla | Opis | Rozmiar |
|----------|-----|------|---------|
| [FINAL_SUMMARY_v8.20.md](FINAL_SUMMARY_v8.20.md) | Wszyscy | Podsumowanie v8.20: import bazy, duplikaty, obrazy, export CSV | 📄 15KB |
| [DYNAMIC_FORMS_v8.21.md](DYNAMIC_FORMS_v8.21.md) | Użytkownicy | Jak używać dynamicznych formularzy, edycja konfiguracji | 📄 20KB |
| [EDITING_FIELDS_CONFIG.md](EDITING_FIELDS_CONFIG.md) | Edytorzy | Poradnik krok po kroku dla edycji fields-config.json | 📄 25KB |
| [TEST_DYNAMIC_FORMS.md](TEST_DYNAMIC_FORMS.md) | Testerzy | 8 test cases dla formularzy dynamicznych | 📄 15KB |
| [INTEGRATION_DATABASE_v8.22.md](INTEGRATION_DATABASE_v8.22.md) | Deweloperzy | Plan integracji formularzy z bazą SQL | 📄 20KB |
| [RELEASE_NOTES_v8.21.md](RELEASE_NOTES_v8.21.md) | Wszyscy | Release notes: co nowego, statystyki, timeline | 📄 18KB |

**Razem**: ~113KB dokumentacji

---

### 🔹 Dokumenty v8.20 (Poprzednie Wersje)

| Dokument | Opis |
|----------|------|
| [IMPORT_DATABASE_v8.20.1.md](IMPORT_DATABASE_v8.20.1.md) | Dokumentacja import bazy CSV/JSON |
| [WORKFLOW_OBRAZY_v8.20.2.md](WORKFLOW_OBRAZY_v8.20.2.md) | Workflow: wybór obrazu, rysowanie ROI, eksport CSV |
| [TEST_IMPORT_DB.md](TEST_IMPORT_DB.md) | Test import bazy (7 testów) |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Opis implementacji v8.20.1 |

---

### 🔹 Pliki Konfiguracyjne

| Plik | Typ | Opis | Rozmiar |
|------|-----|------|---------|
| [fields-config.json](fields-config.json) | JSON | Konfiguracja 4 typów dokumentów genealogicznych | 🔧 15KB |
| [test_database.csv](test_database.csv) | CSV | Test data: 7 rekordów, 3 duplikaty | 📊 2KB |
| [test_database.json](test_database.json) | JSON | Test data: 2 rekordy | 📊 1KB |

---

## 🎯 Wersja Aplikacji

### v8.20 ✅ (Aktualnie w Użyciu)
- [x] Import bazy (CSV/JSON)
- [x] Obsługa duplikatów ID
- [x] Wizualne oznaczenie duplikatów
- [x] Panel edycji rekordów
- [x] Obsługa obrazów (File API)
- [x] Export do CSV (dla Office'a)

### v8.21 ✅ (Właśnie Wydana)
- [x] Dynamiczne formularze
- [x] Konfiguracja w JSON
- [x] 4 gotowe typy dokumentów
- [x] Włączanie/wyłączanie pól
- [x] Obsługa text, select, textarea
- [x] Dodawanie pól w runtime'ie
- [x] Export konfiguracji

### v8.22 📋 (W Planach)
- [ ] Integracja formularzy z bazą SQL
- [ ] normalizeFormDataToRecord()
- [ ] Walidacja pół
- [ ] Generowanie unikalnych ID
- [ ] Mapowanie pól → kolumny bazy

### v8.23+ 📅 (Przyszłość)
- [ ] Warunkowe pola (if-logic)
- [ ] Mnożenie pól (repeating fields)
- [ ] OCR dla pól tekstowych
- [ ] Synchronizacja z Supabase
- [ ] Historia zmian (audit log)

---

## 🏗️ Architektura Aplikacji

```
┌─────────────────────────────────────────────┐
│  viewer-osd-v8.20.html                      │
│  (10,479 linii kodu)                        │
├─────────────────────────────────────────────┤
│  MODUŁY                                     │
│                                             │
│  1. OpenSeaDragon (Viewer Obrazów)         │
│     - Wyświetlanie zdjęć                   │
│     - Zoom/Pan                             │
│     - Rysowanie ROI (Ctrl+R)               │
│                                             │
│  2. SQL.js (Baza Danych)                   │
│     - Tabela imported_records              │
│     - CRUD operacje                        │
│     - Wyszukiwanie duplikatów              │
│                                             │
│  3. Dynamiczne Formularze (v8.21)          │
│     - Wczytywanie fields-config.json       │
│     - Renderowanie form                    │
│     - Dodawanie pół                        │
│     - Export config                        │
│                                             │
│  4. Import/Export (v8.20)                  │
│     - CSV import                           │
│     - JSON import                          │
│     - CSV export                           │
│                                             │
│  5. UI Components                          │
│     - Toolbar (16 przycisków)              │
│     - Tabela danych                        │
│     - Panel edycji                         │
│     - Modale                               │
│                                             │
│  6. Utilities                              │
│     - Notifikacje (notify)                 │
│     - Logging (console)                    │
│     - File handling                        │
└─────────────────────────────────────────────┘
```

---

## 📊 Dane Statystyczne

### Rozmiary
```
Kod:          10,479 linii (viewer-osd-v8.20.html)
Config:       15 KB (fields-config.json)
Dokumentacja: 113 KB (6 plików)
Test data:    3 KB (CSV + JSON)
─────────────────────────────────
RAZEM:        ~140 KB (wszystko)
```

### Funkcjonalności
```
Funkcji nowych (v8.21):     7
Funkcji istniejących (v8.20): 50+
Typy dokumentów:            4
Pół w konfiguracji:         60+
Kolumny w bazie:            19
Test cases:                 8
```

### Dokumentacja
```
Główne dokumenty:    6 plików
Linii dokumentacji:  ~800 linii
Przykłady kodu:      50+
Diagramy:            10+
```

---

## 🔍 Szukanie Informacji

### Temat: Import Bazy

**Dokumenty**:
- [FINAL_SUMMARY_v8.20.md#import-bazy](FINAL_SUMMARY_v8.20.md#import-bazy)
- [IMPORT_DATABASE_v8.20.1.md](IMPORT_DATABASE_v8.20.1.md)

**Pliki testowe**:
- [test_database.csv](test_database.csv)
- [test_database.json](test_database.json)

---

### Temat: Obsługa Obrazów

**Dokumenty**:
- [FINAL_SUMMARY_v8.20.md#przeglądanie-obrazów](FINAL_SUMMARY_v8.20.md)
- [WORKFLOW_OBRAZY_v8.20.2.md](WORKFLOW_OBRAZY_v8.20.2.md)

**Funkcje**:
- `selectImageFile(rowId)`
- `loadImageFromPath(imagePath, rowId)`

---

### Temat: Formularze Dynamiczne

**Dokumenty**:
- [DYNAMIC_FORMS_v8.21.md](DYNAMIC_FORMS_v8.21.md)
- [EDITING_FIELDS_CONFIG.md](EDITING_FIELDS_CONFIG.md)
- [TEST_DYNAMIC_FORMS.md](TEST_DYNAMIC_FORMS.md)

**Plik konfiguracyjny**:
- [fields-config.json](fields-config.json)

**Funkcje**:
- `loadFieldsConfig()`
- `showDocumentTypeSelector()`
- `renderDynamicForm(documentTypeId)`
- `addDynamicField(button)`
- `saveDynamicFormData()`

---

### Temat: Duplikaty

**Dokumenty**:
- [FINAL_SUMMARY_v8.20.md#obsługa-duplikatów](FINAL_SUMMARY_v8.20.md)

**Funkcje**:
- `detectDuplicates()`

**Visual**:
- Żółte tło na zdublowanych wierszach
- Tooltip: "⚠️ Duplikat! Jest N rekordów..."

---

### Temat: Export do Office'a

**Dokumenty**:
- [FINAL_SUMMARY_v8.20.md#export-do-officea](FINAL_SUMMARY_v8.20.md)

**Funkcje**:
- `exportImportedRecordsToCSV()`

**Format**:
- TAB-separated CSV
- UTF-8 encoding
- Kompatybilne z Excel/Calc

---

### Temat: Baza Danych

**Dokumenty**:
- [FINAL_SUMMARY_v8.20.md#struktura-bazy](FINAL_SUMMARY_v8.20.md)
- [INTEGRATION_DATABASE_v8.22.md](INTEGRATION_DATABASE_v8.22.md)

**Struktura**:
- Tabela: `imported_records` (19 kolumn)
- Technologia: SQL.js (SQLite w przeglądarce)
- Persistence: IndexedDB

---

## 📱 Urządzenia i Przeglądarki

### Obsługiwane
- ✅ Chrome (najnowsza wersja)
- ✅ Firefox (najnowsza wersja)
- ✅ Safari (najnowsza wersja)
- ✅ Edge (najnowsza wersja)

### Minimalne wymagania
- JavaScript ES6+
- LocalStorage / IndexedDB
- File API
- Fetch API

### Nie obsługiwane
- ❌ Internet Explorer (brak ES6)
- ❌ Przeglądarki bez JavaScript
- ❌ Offline mode (wymaga załadowania HTML + JS)

---

## 🔧 Konfiguracja & Customizacja

### Zmiana Typów Dokumentów

👉 [EDITING_FIELDS_CONFIG.md#dodaj-nowy-typ-dokumentu](EDITING_FIELDS_CONFIG.md)

```json
{
  "id": "moj_typ",
  "name": "Mój Typ Dokumentu",
  "fields": [...]
}
```

### Zmiana Pól

👉 [EDITING_FIELDS_CONFIG.md#zmień-włączenie-wyłączenie-pola](EDITING_FIELDS_CONFIG.md)

```json
"enabled": 1  // włączone
"enabled": 0  // wyłączone
```

### Zmiana Layoutu

👉 [EDITING_FIELDS_CONFIG.md#zmień-layout](EDITING_FIELDS_CONFIG.md)

```json
"line": 1,    // Linia w grid
"column": 1   // Kolumna (1-2)
```

---

## 🆘 Rozwiązywanie Problemów

### "Pola się nie wyświetlają"

👉 Sprawdź:
1. Czy `fields-config.json` istnieje?
2. Czy JSON jest poprawny? → https://jsonlint.com/
3. Czy `enabled: 1` dla każdego pola?
4. Czy `line > 0` i `column > 0`?

👉 Dokumenty:
- [EDITING_FIELDS_CONFIG.md#1️⃣1️⃣ Rozwiązywanie Problemów](EDITING_FIELDS_CONFIG.md)

### "Config nie załadowany"

👉 Sprawdzić:
1. F12 → Console → błędy?
2. Czy plik `fields-config.json` jest w głównym folderze?
3. Czy aplikacja ma dostęp do pliku (CORS)?

### "Błąd: Invalid JSON"

👉 Sprawdzić:
1. https://jsonlint.com/ → skopiuj zawartość fields-config.json
2. Czy są brakujące cudzysłowy?
3. Czy są brakujące przecinki między polami?
4. Czy wszystkie nawiasy są sparowane?

---

## 📞 Kontakt i Wsparcie

### Dokumentacja
- Przeczytaj odpowiedni plik z tabeli powyżej
- Sprawdź sekcję "Troubleshooting" w każdym dokumencie

### Debugowanie
- F12 → Console → sprawdź błędy
- F12 → Network → sprawdź czy pliki się ładują
- F12 → Storage → IndexedDB → sprawdź bazę

### Feedback
- Testujesz? Użyj [TEST_DYNAMIC_FORMS.md](TEST_DYNAMIC_FORMS.md)
- Masz pomysł? Użyj [EDITING_FIELDS_CONFIG.md](EDITING_FIELDS_CONFIG.md)

---

## 📈 Roadmap

```
30.01.2026: v8.20 (Import, duplikaty, obrazy, export)
30.01.2026: v8.21 (Formularze dynamiczne)
──────────────────────────────────────────────
02.02.2026: v8.22 (Integracja z bazą)
09.02.2026: v8.23 (Zaawansowane funkcje)
```

---

## ✅ Checklist Przed Wdrożeniem

- [x] Przeczytać [FINAL_SUMMARY_v8.20.md](FINAL_SUMMARY_v8.20.md)
- [x] Przeczytać [DYNAMIC_FORMS_v8.21.md](DYNAMIC_FORMS_v8.21.md)
- [x] Pobrać [fields-config.json](fields-config.json)
- [x] Pobrać test data: [test_database.csv](test_database.csv)
- [x] Sprawdzić [TEST_DYNAMIC_FORMS.md](TEST_DYNAMIC_FORMS.md)
- [x] Uruchomić aplikację
- [x] Przetestować formularze
- [x] (Opcjonalnie) Edytować fields-config.json

---

## 🎓 Nauka Kroku Po Kroku

### Dzień 1: Zrozumienie
1. Przeczytaj: [FINAL_SUMMARY_v8.20.md](FINAL_SUMMARY_v8.20.md)
2. Przeczytaj: [DYNAMIC_FORMS_v8.21.md](DYNAMIC_FORMS_v8.21.md)
3. Czas: ~30 minut

### Dzień 2: Użycie
1. Uruchom aplikację
2. Kliknij [📋 Formularz]
3. Wypełnij formularz
4. Zapisz dane
5. Czas: ~15 minut

### Dzień 3: Edycja
1. Przeczytaj: [EDITING_FIELDS_CONFIG.md](EDITING_FIELDS_CONFIG.md)
2. Edytuj fields-config.json
3. Sprawdź zmiany
4. Czas: ~30 minut

### Dzień 4: Testowanie
1. Przeczytaj: [TEST_DYNAMIC_FORMS.md](TEST_DYNAMIC_FORMS.md)
2. Wykonaj 8 test cases
3. Raportuj problemy
4. Czas: ~45 minut

### Dzień 5: Zaawansowane
1. Przeczytaj: [INTEGRATION_DATABASE_v8.22.md](INTEGRATION_DATABASE_v8.22.md)
2. Przygotuj się na v8.22
3. Czas: ~30 minut

**Razem**: ~2 godziny nauki

---

## 📝 Wersja Dokumentacji

| Dokument | Wersja | Data | Status |
|----------|--------|------|--------|
| FINAL_SUMMARY_v8.20.md | 1.0 | 30.01.2026 | ✅ |
| DYNAMIC_FORMS_v8.21.md | 1.0 | 30.01.2026 | ✅ |
| EDITING_FIELDS_CONFIG.md | 1.0 | 30.01.2026 | ✅ |
| TEST_DYNAMIC_FORMS.md | 1.0 | 30.01.2026 | ✅ |
| INTEGRATION_DATABASE_v8.22.md | 1.0 | 30.01.2026 | 📋 |
| RELEASE_NOTES_v8.21.md | 1.0 | 30.01.2026 | ✅ |

---

**Indeks Dokumentacji v1.0**  
**Data**: 30.01.2026  
**Status**: ✅ **Kompletny**  
**Dla**: Genealog v8.20+
