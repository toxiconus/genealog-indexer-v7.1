# 🔗 Integracja Dynamicznych Formularzy z Bazą (v8.22)

## 📋 Status

**v8.21**: ✅ Formularze dynamiczne (tylko UI)  
**v8.22**: 🔄 Integracja z bazą (w przygotowaniu)  
**v8.23**: 📅 Zaawansowane funkcje

---

## 🎯 Cel

Zapisywać dane z dynamicznych formularzy do tabeli `imported_records` w bazie SQL.

```
┌─────────────────────────────────┐
│  Formularz Dynamiczny (UI)      │
│  - Pola z fields-config.json    │
│  - Wypełnienie danych           │
└──────────────┬──────────────────┘
               │ [💾 Zapisz]
               ↓
┌─────────────────────────────────┐
│  Mapowanie Pól                  │
│  formularze → kolumny bazy       │
└──────────────┬──────────────────┘
               │
               ↓
┌─────────────────────────────────┐
│  SQL.js Database                │
│  imported_records table         │
└─────────────────────────────────┘
```

---

## 🏗️ Architektura

### Tabela `imported_records`

```sql
CREATE TABLE imported_records (
  row_id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Metadane
  id TEXT,                    -- Unikalny ID dokumentu
  status TEXT DEFAULT 'new',  -- 'new', 'edited'
  doc_type TEXT,              -- 🆕 Typ dokumentu (z fields-config)
  imported_at DATETIME,
  
  -- Dane genealogiczne (dynamiczne)
  rok TEXT,
  miesiac TEXT,
  dzien TEXT,
  dziecko_imie TEXT,
  dziecko_nazwisko TEXT,
  dziecko_plec TEXT,
  ojciec_imie TEXT,
  ojciec_nazwisko TEXT,
  matka_imie TEXT,
  matka_nazwisko TEXT,
  
  -- Pola specjalne
  chrzestny_imie TEXT,
  chrzestny_nazwisko TEXT,
  chrzestna_imie TEXT,
  chrzestna_nazwisko TEXT,
  
  -- Dla małżeństwa
  pan_mlody_imie TEXT,
  pan_mlody_nazwisko TEXT,
  panna_mloda_imie TEXT,
  panna_mloda_nazwisko TEXT,
  
  -- Dla zgonu
  zmarly_imie TEXT,
  zmarly_nazwisko TEXT,
  
  -- Wspólne
  miejsce TEXT,
  miejsce_slubu TEXT,
  miejsce_smierci TEXT,
  
  -- Obsługa obrazów (v8.20)
  image_path TEXT,
  roi_json TEXT,
  
  -- Dodatkowe
  uwagi TEXT,
  uwagi_org TEXT
);
```

---

## 🔄 Workflow: Od Formularza do Bazy

### Krok 1: Znormalizuj Dane z Formularza

```javascript
// Funkcja w development'cie (v8.22)
function normalizeFormDataToRecord(documentTypeId, formData) {
  const record = {
    id: generateUniqueId(),      // Stwórz unikalny ID
    doc_type: documentTypeId,     // Typ dokumentu
    status: 'new',
    imported_at: new Date().toISOString(),
    
    // Mapuj pola z formularza na kolumny bazy
    rok: formData.rok || null,
    miesiac: formData.miesiac || null,
    dzien: formData.dzien || null,
    
    // Dla chrztu
    dziecko_imie: formData.dziecko_imie || null,
    dziecko_nazwisko: formData.dziecko_nazwisko || null,
    dziecko_plec: formData.dziecko_plec || null,
    
    ojciec_imie: formData.ojciec_imie || null,
    ojciec_nazwisko: formData.ojciec_nazwisko || null,
    
    matka_imie: formData.matka_imie || null,
    matka_nazwisko: formData.matka_nazwisko || null,
    
    // Dla małżeństwa
    pan_mlody_imie: formData.pan_mlody_imie || null,
    pan_mlody_nazwisko: formData.pan_mlody_nazwisko || null,
    panna_mloda_imie: formData.panna_mloda_imie || null,
    panna_mloda_nazwisko: formData.panna_mloda_nazwisko || null,
    
    // Dla zgonu
    zmarly_imie: formData.imie_zmarly || null,
    zmarly_nazwisko: formData.nazwisko_zmarly || null,
    
    // Wspólne
    miejsce: formData.miejsce || formData.miejsce_slubu || formData.miejsce_smierci || null,
    uwagi: formData.uwagi || null
  };
  
  return record;
}
```

### Krok 2: Zapisz do Bazy

```javascript
// Istniejąca funkcja (v8.20)
function saveDynamicFormData_NEW() {
  const form = document.querySelector('.dynamic-form');
  if (!form) {
    notify('⚠️ Brak formularza', 'error');
    return;
  }

  // 1. Zbierz dane z formularza
  const formData = {};
  form.querySelectorAll('.form-control').forEach(input => {
    formData[input.name] = input.value;
  });

  // 2. Pobierz typ dokumentu
  const documentTypeId = form.getAttribute('data-doc-type');

  // 3. Znormalizuj dane
  const record = normalizeFormDataToRecord(documentTypeId, formData);

  // 4. Zapisz do bazy
  try {
    saveImportedRecord(record);  // Istniejąca funkcja z v8.20
    notify(`✅ Zapisano do bazy: ${record.id}`, 'success');
    
    // 5. Odśwież tabelę
    renderImportedRecordsTable();
    
  } catch (err) {
    notify(`❌ Błąd zapisu: ${err.message}`, 'error');
    console.error('❌ Save error:', err);
  }
}
```

---

## 📊 Mapowanie Pól

### Chrzest ↔ Baza

```
Formularz (fields-config.json)  →  Baza (imported_records)
─────────────────────────────────────────────────────────
rok                             →  rok
miesiac                         →  miesiac
dzien                           →  dzien
dziecko_imie                    →  dziecko_imie
dziecko_nazwisko                →  dziecko_nazwisko
dziecko_plec                    →  dziecko_plec
ojciec_imie                     →  ojciec_imie
ojciec_nazwisko                 →  ojciec_nazwisko
matka_imie                      →  matka_imie
matka_nazwisko                  →  matka_nazwisko
chrzestny_imie                  →  chrzestny_imie
chrzestny_nazwisko              →  chrzestny_nazwisko
chrzestna_imie                  →  chrzestna_imie
chrzestna_nazwisko              →  chrzestna_nazwisko
miejsce                         →  miejsce
uwagi                           →  uwagi
```

### Małżeństwo ↔ Baza

```
Formularz                       →  Baza
─────────────────────────────────────────────────────────
rok                             →  rok
pan_mlody_imie                  →  pan_mlody_imie
pan_mlody_nazwisko              →  pan_mlody_nazwisko
panna_mloda_imie                →  panna_mloda_imie
panna_mloda_nazwisko            →  panna_mloda_nazwisko
swiadek1_imie                   →  (brak kolumny) → uwagi
swiadek2_imie                   →  (brak kolumny) → uwagi
miejsce_slubu                   →  miejsce_slubu
```

### Zgon ↔ Baza

```
Formularz                       →  Baza
─────────────────────────────────────────────────────────
rok                             →  rok
imie_zmarly                     →  zmarly_imie
nazwisko_zmarly                 →  zmarly_nazwisko
status                          →  (brak kolumny) → uwagi
ojciec_imie                     →  ojciec_imie
matka_imie                      →  matka_imie
miejsce_smierci                 →  miejsce_smierci
```

---

## 🛠️ Implementacja (Kroki)

### Faza 1: Przygotowanie (v8.22 dzień 1)

```javascript
// 1. Dodaj funkcję normalizeFormDataToRecord()
// 2. Dodaj funkcję generateUniqueId()
// 3. Test w konsoli: normalizeFormDataToRecord('chrzest_1700', {...})
```

### Faza 2: Integracja (v8.22 dzień 2-3)

```javascript
// 1. Zmodyfikuj saveDynamicFormData()
// 2. Dodaj obsługę błędów (try-catch)
// 3. Dodaj notifikacje (notify)
// 4. Test: Zapisanie rekordu → weryfikacja w bazie
```

### Faza 3: UI (v8.22 dzień 4-5)

```javascript
// 1. Dodaj przycisk [💾 Zapisz i Zamknij]
// 2. Odśwież tabelę po zapisie
// 3. Pokaż ID nowego rekordu
// 4. Test: E2E flow od formularza do tabeli
```

### Faza 4: Walidacja (v8.22 dzień 5)

```javascript
// 1. Waliduj pola wymagane (required: true)
// 2. Sprawdź duplikaty ID
// 3. Formatuj daty
// 4. Test: Wszystkie walidacje
```

---

## 💾 Przykład: Zapisanie Rekordu Chrztus

### Input (Formularz)

```javascript
const formData = {
  rok: "1750",
  miesiac: "03",
  dzien: "15",
  dziecko_imie: "Jan",
  dziecko_nazwisko: "Kowalski",
  dziecko_plec: "M",
  ojciec_imie: "Stanisław",
  ojciec_nazwisko: "Kowalski",
  matka_imie: "Anna",
  matka_nazwisko: "Lewandowska",
  chrzestny_imie: "Jozef",
  chrzestny_nazwisko: "Zaremba",
  chrzestna_imie: "Maria",
  chrzestna_nazwisko: "Wójcik",
  miejsce: "Kościół farny w Blinowie",
  uwagi: "Świadkowie: Jozef Sieradzki i Antoni Żurawski"
};

const documentTypeId = "chrzest_1700";
```

### Proces

```javascript
1. normalizeFormDataToRecord("chrzest_1700", formData)
   ↓
2. record = {
     row_id: AUTO,
     id: "CH.LUB.BLIN.1750.001",      // 🆕 Wygenerowany
     doc_type: "chrzest_1700",        // 🆕 Z formularza
     rok: "1750",
     miesiac: "03",
     dzien: "15",
     dziecko_imie: "Jan",
     dziecko_nazwisko: "Kowalski",
     ...
     imported_at: "2026-01-30T14:30:00Z",
     status: "new"
   }
   ↓
3. saveImportedRecord(record)
   ↓
4. INSERT INTO imported_records VALUES (...)
   ↓
5. Pobierz row_id z bazy
   ↓
6. notify("✅ Zapisano do bazy: CH.LUB.BLIN.1750.001")
   ↓
7. renderImportedRecordsTable()
```

### Output (Baza Danych)

```sql
INSERT INTO imported_records (
  id, rok, miesiac, dzien, dziecko_imie, dziecko_nazwisko, dziecko_plec,
  ojciec_imie, ojciec_nazwisko, matka_imie, matka_nazwisko,
  chrzestny_imie, chrzestny_nazwisko, chrzestna_imie, chrzestna_nazwisko,
  miejsce, uwagi, doc_type, imported_at, status
) VALUES (
  'CH.LUB.BLIN.1750.001', '1750', '03', '15', 'Jan', 'Kowalski', 'M',
  'Stanisław', 'Kowalski', 'Anna', 'Lewandowska',
  'Jozef', 'Zaremba', 'Maria', 'Wójcik',
  'Kościół farny w Blinowie', 'Świadkowie: Jozef Sieradzki i Antoni Żurawski',
  'chrzest_1700', '2026-01-30T14:30:00Z', 'new'
);

-- Tabela:
row_id | id                    | rok  | dziecko_imie | ... | doc_type     | status
-------|----------------------|------|--------------|-----|--------------|--------
1      | CH.LUB.BLIN.1750.001 | 1750 | Jan          | ... | chrzest_1700 | new
```

---

## 🔍 Walidacja Pól

### Wymagane Pola

```javascript
function validateDynamicForm(documentTypeId, formData) {
  const docType = fieldsConfig.documentTypes.find(d => d.id === documentTypeId);
  const requiredFields = docType.fields.filter(f => f.required);
  
  const errors = [];
  requiredFields.forEach(field => {
    if (!formData[field.name] || formData[field.name].trim() === '') {
      errors.push(`Pole "${field.label}" jest wymagane`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}
```

### Formatowanie Dat

```javascript
function formatDate(rok, miesiac, dzien) {
  // "1750", "03", "15" → "1750-03-15"
  const year = rok.padStart(4, '0');
  const month = miesiac.padStart(2, '0');
  const day = dzien.padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

---

## 📈 Przyszłe Rozszerzenia

### v8.23
- [ ] Import pól z Excel'a
- [ ] Mnożenie pól (repeating fields)
- [ ] Warunkowe pola (if-logic)
- [ ] Szablony (templates)

### v8.24
- [ ] OCR dla pól tekstowych
- [ ] Automatyczne mapowanie kolumn
- [ ] Synchronizacja z Supabase

### v8.25
- [ ] Historia zmian (audit log)
- [ ] Eksport do Excel z formatowaniem
- [ ] Merge duplikatów

---

## 🎓 Kod Źródłowy (v8.21)

Funkcje już dostępne w viewer-osd-v8.20.html:

```javascript
// ✅ Istniejące (v8.20)
loadImportedRecords()        // Wczytaj z bazy
saveImportedRecord(record)   // Zapisz do bazy
updateImportedRecord(...)    // Aktualizuj
deleteImportedRecord(...)    // Usuń

// ✅ Istniejące (v8.21)
loadFieldsConfig()           // Wczytaj fields-config.json
renderDynamicForm()          // Renderuj UI formularza
showDocumentTypeSelector()   // Pokaż modal
saveDynamicFormData()        // 🔄 TODO: Integracja z bazą
downloadFieldsConfig()       // Export config
```

---

## 📚 Pliki do Modyfikacji (v8.22)

```
viewer-osd-v8.20.html
├── Dodaj: function normalizeFormDataToRecord(...)
├── Dodaj: function generateUniqueId()
├── Zmień: function saveDynamicFormData()
├── Dodaj: function validateDynamicForm(...)
└── Dodaj: function formatDate(...)

fields-config.json
└── (bez zmian - lub dodaj nowe typy dokumentów)
```

---

## ✅ Checklist Integracji

- [ ] Funkcja `normalizeFormDataToRecord()` działa
- [ ] Funkcja `generateUniqueId()` generuje ID
- [ ] Funkcja `saveDynamicFormData()` zapisuje do bazy
- [ ] Funkcja `validateDynamicForm()` waliduje dane
- [ ] Tabela `imported_records` ma kolumnę `doc_type`
- [ ] Dane pojawiają się w tabeli po zapisie
- [ ] Powiadomienia (notify) działają
- [ ] Konsolowe debugowanie (console.log) działa
- [ ] Duplikaty ID są obsługiwane
- [ ] Błędy są wyłapywane (try-catch)

---

## 📞 Kontakt do Dewelopera

W momencie implementacji v8.22:

1. Zapamiętaj mapowanie pól Formularz ↔ Baza
2. Przetestuj każdy typ dokumentu osobno
3. Sprawdź czy ID się generuje unikalnie
4. Sprawdź czy kolumny bazy są wystarczające
5. Dodaj nowe kolumny jeśli brakuje

---

**Wersja Planu**: 1.0  
**Data**: 30.01.2026  
**Status**: 📋 **Przygotowanie do v8.22**

---

**Następny krok**: Implementacja `normalizeFormDataToRecord()` w v8.22
