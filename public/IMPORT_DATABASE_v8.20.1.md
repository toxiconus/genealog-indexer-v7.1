# 🆕 v8.20.1 - Wczytywanie Lokalnej Bazy z Duplikatami

## Co zostało dodane

### 1. **Nowa struktura bazy danych SQL**
- Dodano nową tabelę `imported_records` (bez UNIQUE constraint na ID)
- Obsługuje zdublowane ID - każdy rekord ma unikalny `row_id`
- Kolumny: `id, rok, nr, nazwisko, imie, miejscowosc, imie_o, nazwisko_o, w_o, im, nm, w_m, uwagi, uwagi_org, status`

### 2. **Funkcje do obsługi importowanych rekordów**
```javascript
// Załaduj rekordy z bazy
loadImportedRecords()

// Zapisz nowy rekord
saveImportedRecord(record)

// Aktualizuj istniejący
updateImportedRecord(rowId, record)

// Usuń rekord
deleteImportedRecord(rowId)

// Wykryj duplikaty po ID
detectDuplicates()
```

### 3. **Funkcje importu CSV/JSON**
- `importDatabase()` - otwiera dialog wyboru pliku (CSV lub JSON)
- `importCSVDatabase(content)` - parsuje CSV i dodaje do bazy
- `importJSONDatabase(content)` - parsuje JSON i dodaje do bazy
- Automatyczne mapowanie kolumn (obsługuje różne nazwy nagłówków)

### 4. **Interfejs użytkownika**
- **Nowy przycisk**: "Importuj DB" w toolbar (obok "JSON")
- **Tabela ze zmienionym schematem**: wyświetla tylko 15 kolumn (importowane rekordy)
- **Wizualne oznaczenie duplikatów**: żółte tło dla wierszy z duplikatem ID
- **Akcje w tabeli**: 
  - Kliknięcie wiersza → edycja w prawym panelu
  - Przycisk ✏️ → edytuj
  - Przycisk 🗑️ → usuń
  - Przycisk "Zapisz" → aktualizuj w bazie

### 5. **Panel edycji (prawy panel)**
Po kliknięciu wiersza pojawia się formularz do edycji wszystkich 14 pól:
- ID, Rok, Nr., Nazwisko, Imię, Miejscowość
- Imię Ojca, Nazwisko Ojca, Wiek Ojca
- Imię Matki, Nazwisko Matki, Wiek Matki
- Uwagi, Uwagi Organizacyjne
- Status zmieniony na "edited" po zapisaniu

### 6. **Obsługa duplikatów**
Duplikaty są automatycznie wykrywane (przy wczytywaniu) i zaznaczane żółtym tłem.
Tooltip pokazuje: "⚠️ Duplikat! Jest X rekordów z ID: [ID]"

## Jak używać

### Import bazy z CSV
1. Przygotuj plik CSV z kolumnami: ID, ROK, Nr., Nazwisko, Imię, Miejscowość, ImięO, NazwiskoO, wO, IM, NM, wM, uwagi, UWAGI ORG
2. Kliknij "Importuj DB" w toolbar
3. Wybierz plik CSV
4. Rekordy zostaną załadowane do bazy i wyświetlone w tabeli

### Edycja duplikatów
1. Duplikaty będą zaznaczone żółtym tłem
2. Kliknij na wiersz duplikatu
3. Edytuj dane w prawym panelu
4. Kliknij "Zapisz"
5. Rekord zostanie zaktualizowany w bazie (status zmieniony na "edited")

### Usuwanie błędów
1. Kliknij 🗑️ na danym wierszu, lub
2. Zaznacz wiersze checkboxami i kliknij "Usuń" w tabeli

## Format CSV
Nagłówki mają być oddzielone TAB, np:
```
ID	ROK	Nr.	Nazwisko	Imię	Miejscowość	ImięO	NazwiskoO	wO	IM	NM	wM	uwagi	UWAGI ORG
CH.LUB.BLIN.1783.001	1783	1	Kowalski	Jan	Blinów	Stanisław	Kowalski	45	Anna	Kowalska	40	Uwagi	Org
```

## Format JSON
```json
[
  {
    "id": "CH.LUB.BLIN.1783.001",
    "rok": "1783",
    "nr": "1",
    "nazwisko": "Kowalski",
    "imie": "Jan",
    ...
  }
]
```

Lub z innym formatem nazw pól (auto-mapowanie):
```json
[
  {
    "ID": "CH.LUB.BLIN.1783.001",
    "ROK": "1783",
    "Nazwisko": "Kowalski",
    ...
  }
]
```

## Test pliku

W folderze `public/` znajduje się `test_database.csv` z 7 rekordami, w tym 3 duplikami ID "CH.LUB.BLIN.1783.001".

Kliknij "Importuj DB" → załaduj `test_database.csv` → powinieneś zobaczyć:
- 7 wierszy w tabeli
- 3 wiersze ze żółtym tłem (duplikaty)
- Tooltip "⚠️ Duplikat! Jest 3 rekordów..."

## TODO na później
- [ ] Dodać obsługę więcej kolumn (inne typy aktów)
- [ ] Merge duplikatów (scal pola z dwóch rekordów)
- [ ] Export zmienionych rekordów (tylko "edited")
- [ ] Historia zmian (log)
