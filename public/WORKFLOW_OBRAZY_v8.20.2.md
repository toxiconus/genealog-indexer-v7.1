# 🆕 v8.20.2 - Przeglądanie i Uzupełnianie Obrazów

## Co zostało dodane

### 1. **Kolumny w bazie danych**
- `image_path` - pełna ścieżka do obrazu (lub data URL)
- `roi_json` - zapisany ROI jako JSON

### 2. **Panel edycji - nowa sekcja "Obraz i ROI"**
Po kliknięciu wiersza w tabeli pojawia się:
- **Ścieżka obrazu** (readonly)
- **Przycisk "Wybierz obraz"** - dialog wyboru pliku z dysku
- **Przycisk "Podgląd obrazu"** - załaduj obraz do viewer
- **Pole ROI JSON** - do ręcznego edytowania lub automatycznego zapisu

### 3. **Funkcje**
```javascript
selectImageFile(rowId)                    // Dialog wyboru pliku
loadImageFromPath(imagePath, rowId)       // Załaduj do viewer
exportImportedRecordsToCSV()              // Eksport do CSV
```

### 4. **UI w Toolbar**
- **Nowy przycisk "Eksport CSV"** - pobierz wszystkie rekordy do Excel'a
- CSV jest TAB-separated (natywnie obsługiwane przez Excel/Calc)

### 5. **Workflow Pracy**
```
1. Załaduj bazę (CSV/JSON)
   ↓
2. Kliknij wiersz (edycja)
   ↓
3. Kliknij "Wybierz obraz" → wybierz plik z dysku
   ↓
4. Kliknij "Podgląd obrazu" → załaduje się do viewer'a
   ↓
5. Rysuj ROI (jak przed) - będzie zapisane jako JSON
   ↓
6. Kliknij "Zapisz" → zapisze ścieżkę + ROI do bazy
   ↓
7. Powtórz dla innych rekordów
   ↓
8. Kliknij "Eksport CSV" → pobierz plik do Office'a
```

## Kolumny w Eksportowanym CSV

| Kolumna | Zawartość |
|---------|-----------|
| ID | Identyfikator rekordu |
| Rok | Rok chrzctu |
| Nr. | Numer aktu |
| Nazwisko | Nazwisko dziecka |
| Imię | Imię dziecka |
| Miejscowość | Miejsce chrzctu |
| Imię Ojca | |
| Nazwisko Ojca | |
| Wiek Ojca | |
| Imię Matki | |
| Nazwisko Matki | |
| Wiek Matki | |
| Uwagi | Pole notatek |
| Uwagi Org | Uwagi organizacyjne |
| Ścieżka Obrazu | Pełna ścieżka do pliku obrazu |
| Status | 'new' lub 'edited' |
| ROI (JSON) | Zapisany ROI jako JSON (np. `{"x":100,"y":50,"w":200,"h":150}`) |

## Funkcje do Eksportu

### Automatyczne zapisywanie ROI
Gdy narysujesz ROI w viewer'ze:
1. ROI zostaje zapisany w pamięci aplikacji
2. Po kliknięciu "Zapisz" → przesyłane do bazy
3. CSV zawiera pełny JSON ROI'ego

### Format ROI w JSON
```json
{
  "x": 100,
  "y": 50,
  "width": 200,
  "height": 150,
  "rotation": 0
}
```

## Struktura Bazy (zaktualizowana)

```sql
CREATE TABLE imported_records (
  row_id INTEGER PRIMARY KEY AUTOINCREMENT,
  id TEXT,
  rok TEXT,
  nr TEXT,
  nazwisko TEXT,
  imie TEXT,
  miejscowosc TEXT,
  imie_o TEXT,
  nazwisko_o TEXT,
  w_o TEXT,
  im TEXT,
  nm TEXT,
  w_m TEXT,
  uwagi TEXT,
  uwagi_org TEXT,
  image_path TEXT,           -- 🆕 Ścieżka/Data URL obrazu
  roi_json TEXT,             -- 🆕 ROI jako JSON
  imported_at DATETIME,
  status TEXT
)
```

## Test Case: Pełny Workflow

### TC: Import → Obraz → ROI → Export
1. **Import**: Załaduj `test_database.csv`
2. **Wybór obrazu**:
   - Kliknij wiersz 1
   - Kliknij "Wybierz obraz" → wybierz plik JPG/PNG
   - Powinna się wyświetlić nazwa pliku
3. **Podgląd**:
   - Kliknij "Podgląd obrazu"
   - Powinien się załadować w viewer'ze
4. **ROI** (opcjonalnie):
   - Narysuj ROI na obrazie (jak dotychczas)
5. **Zapis**:
   - Kliknij "Zapisz"
   - Powinna być wiadomość "✅ Rekord zaktualizowany"
   - Tabela się odświeży - kolumna "Obraz" pokaże nazwę pliku (zielony kolor)
6. **Export**:
   - Kliknij "Eksport CSV" w toolbar
   - Pobierze się plik `genealogia_YYYY-MM-DD.csv`
   - Otwórz w Excel/Calc
   - Powinien zawierać wszystkie dane + ścieżkę + ROI JSON

## Przydatne Sztuczki

### 1. Szybki Import Obrazów
```
1. Stwórz folder z obrazami (np. C:\genealogia\1783\)
2. W dialogu wyboru - wskaż folder
3. Każdy wiersz dostanie ścieżkę (np. C:\genealogia\1783\blin_001.jpg)
```

### 2. Export → Excel → Analiza
```
CSV → Excel → Pivot Table → podsumowanie po parafiach/latach
```

### 3. Backup Bazy
```javascript
// W konsoli (F12):
const records = loadImportedRecords();
console.log(JSON.stringify(records, null, 2));
// Skopiuj do test_database.json
```

## Znane Ograniczenia

1. **File API** - pliki muszą być wybrane przez użytkownika (bezpieczeństwo przeglądarki)
2. **Ścieżka bezwzględna** - w przeglądarce web obowiązkowy data URL (działa lepiej)
3. **Rozmiar ROI** - zapisywany jako JSON (max kilka KB per rekord)
4. **Encoding CSV** - UTF-8, może wymagać konwersji na Windows-1250 dla starszego Excela

## Plan v8.20.3+

- [ ] Obsługa wielostronicowych obrazów (pole "Strona X/Y")
- [ ] Batch import obrazów z folderu
- [ ] OCR dla opisu ROI
- [ ] Synchronizacja ROI między rekordem duplikatem
- [ ] Import z Excel'a (obowiązkowe kolumny)

## Architektura

```
┌─────────────────────────────────────────────────────┐
│          Tabela importowanych_records               │
│  ID, Rok, Nr., Nazwisko, Imię, ..., image_path,   │
│  roi_json, status                                   │
└─────────────────────────────────────────────────────┘
         ↓ (kliknięcie wiersza)
┌─────────────────────────────────────────────────────┐
│      Panel Edycji (prawy panel)                      │
│  - Formularz 14 pól                                 │
│  - Przycisk "Wybierz obraz"                         │
│  - Przycisk "Podgląd"                               │
│  - Pole ROI JSON (readonly)                         │
└─────────────────────────────────────────────────────┘
         ↓ (po wyborze obrazu)
┌─────────────────────────────────────────────────────┐
│      Viewer (OpenSeaDragon)                         │
│  - Wyświetlanie obrazu                              │
│  - Rysowanie ROI (jak poprzednio)                   │
└─────────────────────────────────────────────────────┘
         ↓ (po kliknięciu Zapisz)
┌─────────────────────────────────────────────────────┐
│      updateImportedRecord()                          │
│  - Zapisz ścieżkę do image_path                     │
│  - Zapisz ROI do roi_json                           │
│  - Zmień status na "edited"                         │
└─────────────────────────────────────────────────────┘
         ↓ (po kliknięciu Eksport CSV)
┌─────────────────────────────────────────────────────┐
│      exportImportedRecordsToCSV()                    │
│  - Pobierz wszystkie rekordy                        │
│  - Stwórz CSV TAB-separated                         │
│  - Pobierz plik genealogia_YYYY-MM-DD.csv           │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│      Excel / Calc / Office                           │
│  - Analiza danych                                    │
│  - Pivot Table                                       │
│  - Drukowanie                                        │
└─────────────────────────────────────────────────────┘
```

---

**Wersja**: 8.20.2  
**Data**: 30.01.2026  
**Status**: ✅ Gotowy do testowania
