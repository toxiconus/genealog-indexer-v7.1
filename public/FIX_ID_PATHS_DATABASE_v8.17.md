# 🔧 FIX: Problemy z ID, ścieżkami do obrazów i bazą danych (v8.17)

**Data:** 29 stycznia 2026  
**Wersja:** v8.17 + FIX (baza na v8.17.html)  
**Status:** ✅ Wdrożone

---

## 📋 Podsumowanie zmian

Rozwiązano 3 główne problemy, które uniemożliwiały prawidłowe łączenie aktów, zarządzanie obrazami i pracę offline:

### 1️⃣ Problem: ID (3 rodzaje, nie łączy aktów)
**Co było nie tak?**
- Modal generował akty z długim UUID, które nie pasowały do skrótowych ID (np. `CH.LUB.BLIN.1783.002`)
- Tabela/panel szukały po długim ID, ale nigdy nie znalazły dopasowania
- Duplikaty wynikały z niezgodności `original_id` vs `id` vs `display_id`

**Rozwiązanie:**
- ✅ Każdy akt ma teraz **DWA ID**:
  - `originalId`: UUID (główny klucz, immutable, unikalny dla Supabase)
  - `displayId`: Krótkie ID (typ.rok.nr.sufiks – dla UI i łątwego debugowania)
- ✅ `autoGenerateID()` zwraca teraz obiekt: `{ originalId, displayId, id }`
- ✅ Wyszukiwanie po `displayId` zamiast ID

**Kod:**
```javascript
// Stare - single ID
act.id = await autoGenerateID(actData);  // Generowało string

// Nowe - dual ID
const idObj = await autoGenerateID(actData);
act.originalId = idObj.originalId;   // UUID
act.displayId = idObj.displayId;     // CH.LUB.1783.002
act.id = idObj.displayId;            // Dla kompatybilności
```

---

### 2️⃣ Problem: Ścieżki do obrazów (tylko nazwa, nie pełna ścieżka)
**Co było nie tak?**
- File API nie pozwala pobrać pełną ścieżkę dysku
- Zapisywano tylko `file.name` (np. `obraz_001.jpg`), bez informacji gdzie jest
- Przy ponownym załadowaniu – niemożliwe znalezienie obrazu

**Rozwiązanie:**
- ✅ `app.currentImagePath` przechowuje pełną ścieżkę (relative path z folderu)
- ✅ `handleFiles()` czyta `file.webkitRelativePath` (dostępne, gdy user uploaduje folder)
- ✅ Każdy akt ma `imagePath` powiązane z bieżącym obrazem
- ✅ `selectImage()` ustawia `app.currentImagePath` przed wyświetleniem

**Kod:**
```javascript
// W handleFiles()
const relativePath = file.webkitRelativePath || file.name;
app.images.push({
  name: file.name,
  relativePath: relativePath,  // Pełna ścieżka (np. 'folder/subfolder/image.jpg')
  data: e.target.result
});

// W selectImage()
app.currentImagePath = app.images[idx].relativePath || app.images[idx].name;

// W selectAct()
act.imagePath = app.currentImagePath;  // Powiąż z bieżącym obrazem
```

---

### 3️⃣ Problem: Baza offline (Supabase online, ale potrzeba testów na dysku)
**Co było nie tak?**
- Testowanie wymagało dostępu do internetu (Supabase)
- Brak backup-u danych lokalnie
- Migracja z dysku do chmury – skomplikowana

**Rozwiązanie:**
- ✅ Dodano **lokalną bazę SQLite (sql.js)** dla pracy offline
- ✅ `initLocalDB()` tworzy tabelę `records` z pełną strukturą
- ✅ `saveActToLocalDB(act)` zapisuje każdy akt przy edycji
- ✅ `loadActsFromLocalDB(filters)` wyszukuje po `displayId`, `type`, `year`
- ✅ `searchActByDisplayId(displayId)` – szybkie wyszukiwanie

**Struktura SQL:**
```sql
CREATE TABLE records (
  original_id TEXT PRIMARY KEY,      -- UUID (główny klucz)
  display_id TEXT UNIQUE NOT NULL,  -- CH.LUB.1783.002 (unikalny indeks)
  type TEXT,                        -- christening, birth, marriage, death
  year INTEGER,                     -- 1783
  nr INTEGER,                       -- Numer aktu
  image_path TEXT,                  -- Pełna ścieżka do obrazu
  field_values TEXT,                -- JSON z polami formularza
  roi TEXT,                         -- JSON z ROI
  created_at DATETIME,
  updated_at DATETIME
)
```

---

## 🚀 Funkcje dodane

### Funkcje lokalnej bazy (SQL.js)

#### `initLocalDB()`
```javascript
await initLocalDB();
// Inicjalizuje SQL.js i tworzy tabelę 'records'
// Wywoływane automatycznie w initApp()
```

#### `saveActToLocalDB(act)`
```javascript
saveActToLocalDB(act);
// Zapisuje/aktualizuje akt (UPSERT na original_id)
// Wywoływane:
// - W selectAct() (po każdej edycji)
// - W saveStorage() (automatyczne backup)
// - Po każdym createNewActFromModal
```

#### `loadActsFromLocalDB(filters)`
```javascript
// Wyszukiwanie z filtrami
const acts = loadActsFromLocalDB({ 
  displayId: 'CH.LUB.1783.002' 
});

const acts = loadActsFromLocalDB({ 
  type: 'christening', 
  year: 1783 
});
```

#### `searchActByDisplayId(displayId)`
```javascript
const act = searchActByDisplayId('CH.LUB.1783.002');
// Szybkie wyszukiwanie pojedynczego aktu
```

---

## 🔄 Przepływ danych (nowy)

```
┌─ User uploads folder ─────────────────┐
│  (handleFiles)                        │
│  - Czyta relativePath (pełna)         │
│  - Zapisuje do app.images             │
└──────────────┬────────────────────────┘
               │
               v
┌─ User wybiera obraz ─────────────────┐
│  (selectImage)                        │
│  - Ustawia app.currentImagePath       │
│  - Otwiera obraz w OSD                │
└──────────────┬────────────────────────┘
               │
               v
┌─ User tworzy nowe akty ──────────────┐
│  (showAdvancedActModal → createActs)  │
│  - Generuje originalId (UUID)         │
│  - Generuje displayId (CH.LUB.1783)   │
│  - Powiązuje z imagePath              │
│  - Zapisuje do SQL.js                 │
└──────────────┬────────────────────────┘
               │
               v
┌─ User edytuje formularze ────────────┐
│  (selectAct → renderFormSections)     │
│  - Pobiera akt ze SQL.js              │
│  - Edytuje pola                       │
│  - Zapisuje w saveStorage()           │
│  - Aktualizuje SQL.js                 │
│  - Wysyła do Supabase (jeśli online)  │
└──────────────┬────────────────────────┘
               │
               v
┌─ Migracja do Supabase ───────────────┐
│  (offline → online)                   │
│  - Eksportuj JSON z SQL.js            │
│  - Importuj w Supabase Console        │
│  - Lub batch INSERT via API           │
└──────────────────────────────────────┘
```

---

## 📝 Szczegóły zmian w kodzie

### A. `const app` – dodane pola (linia ~1860)
```javascript
idMap: new Map(),           // Mapuje displayId -> act
currentImagePath: null,     // Pełna ścieżka bieżącego obrazu
localDb: null              // Odkaz do SQL.js
```

### B. Funkcje SQL.js (linia ~1880-2000)
- `initLocalDB()` – inicjalizacja
- `saveActToLocalDB(act)` – UPSERT
- `loadActsFromLocalDB(filters)` – SELECT z filtrami
- `searchActByDisplayId(displayId)` – szybkie wyszukiwanie

### C. `autoGenerateID()` – zmiana (linia ~5250)
```javascript
// STARE: zwracało string
return `${typ}.${woj}.${rok}.${nr}`;

// NOWE: zwraca obiekt
return {
  originalId: crypto.randomUUID(),
  displayId: `${typ}.${woj}.${rok}.${nr}`,
  id: `${typ}.${woj}.${rok}.${nr}`  // dla kompatybilności
};
```

### D. `handleFiles()` – przechwyć pełną ścieżkę (linia ~6280)
```javascript
const relativePath = file.webkitRelativePath || file.name;
app.images.push({
  name: file.name,
  relativePath: relativePath,  // NOWE
  data: e.target.result
});
```

### E. `selectImage()` – ustaw currentImagePath (linia ~6010)
```javascript
app.currentImagePath = app.images[idx].relativePath || app.images[idx].name;
```

### F. `selectAct()` – powiąż z obrazem (linia ~5570)
```javascript
act.imagePath = app.currentImagePath;  // NOWE
```

### G. `showAdvancedActModal()` – generuj obu ID (linia ~5750)
```javascript
// Dla każdego nowego aktu:
const idObj = await autoGenerateID(actData);
act.originalId = idObj.originalId;
act.displayId = idObj.displayId;
act.imagePath = app.currentImagePath;
saveActToLocalDB(act);  // NOWE – zapisz od razu
```

### H. `saveStorage()` – backup do SQL.js (linia ~6970)
```javascript
if (currentAct) {
  saveActToLocalDB(currentAct);  // NOWE – zawsze backup
}
```

### I. `initApp()` – inicjalizuj SQL.js (linia ~2104)
```javascript
await initLocalDB();  // NOWE – zaraz na początku
```

---

## 🧪 Testowanie

### Test 1: Dual ID
```javascript
// Console:
const act = app.imageActs[0];
console.log('displayId:', act.displayId);  // CH.LUB.1783.002
console.log('originalId:', act.originalId);  // UUID
console.log('act.id:', act.id);  // = displayId
```

### Test 2: Ścieżka do obrazu
```javascript
// Console:
console.log('currentImagePath:', app.currentImagePath);  // folder/image.jpg
const act = app.imageActs[0];
console.log('act.imagePath:', act.imagePath);  // = currentImagePath
```

### Test 3: Baza offline
```javascript
// Console (offline mode):
const acts = loadActsFromLocalDB({ type: 'christening', year: 1783 });
console.log('Loaded from SQL:', acts.length, 'acts');
console.log('First act:', acts[0].displayId);
```

### Test 4: Migracja do Supabase
```javascript
// Eksport z SQL.js do JSON:
const stmt = localDb.prepare('SELECT * FROM records');
const results = [];
while (stmt.step()) {
  results.push(stmt.getAsObject());
}
stmt.free();
const json = JSON.stringify(results, null, 2);
// Wklej do Supabase (batch insert)
```

---

## 📊 Struktura aktów (nowa)

```javascript
{
  // Numery
  actNum: 1,           // Numer sekwencyjny w app.imageActs
  nr: 42,              // Numer aktu w dokumencie
  
  // ID (dual system)
  id: 'CH.LUB.1783.002',        // displayId (dla UI)
  displayId: 'CH.LUB.1783.002',  // Krótkie ID
  originalId: 'uuid...',          // UUID (dla bazy)
  
  // Obrazy
  imageIdx: 0,                // Index w app.images
  imagePath: 'folder/img.jpg',  // Pełna ścieżka (NOWE)
  
  // Dane
  type: 'christening',
  year: 1783,
  parish: 'BLINÓW',
  woj: 'LUB',
  
  // Pola
  fieldValues: { dziecko_imie: 'Jan', ... },
  fieldROIs: { dziecko_imie: { x, y, w, h }, ... },
  
  // Granice aktu
  actROI: { x, y, w, h },      // Całe aktu
  
  // Metadata
  timestamp: '2026-01-29T...',
  incomplete: false
}
```

---

## ⚠️ Uwagi o kompatybilności

### Wstecz kompatybilność
- ✅ Stary kod używający `act.id` zadziała (`act.id === act.displayId`)
- ✅ `app.imageActs` może zawierać stare akty bez `originalId` (będą dodge'ować)
- ⚠️ Starze akty bez `imagePath` mogą nie załadować obrazów

### Migracja starych danych
```javascript
// Jeśli masz stare akty bez originalId:
app.imageActs.forEach(act => {
  if (!act.originalId) {
    act.originalId = crypto.randomUUID();
    act.displayId = act.id || 'UNKNOWN';
  }
  saveActToLocalDB(act);
});
```

---

## 🎯 Następne kroki

1. **Testuj offline** – załaduj folder obrazów, utwórz akty, pracuj bez internetu
2. **Eksportuj do SQL** – Console: `exportActsToJson()` (napisz funkcję helper)
3. **Migruj do Supabase** – Batch insert via CLI lub Dashboard
4. **Usuń duplikaty** – Jeśli ma stare akty, usuń po `originalId`
5. **Backup regularnie** – Staraj się co dzień eksportować JSON

---

## 📚 Dokumentacja

- [Supabase docs](https://supabase.com/docs)
- [SQL.js docs](https://sql.js.org/)
- [OpenSeadragon docs](https://openseadragon.github.io/)
- [Tesseract.js docs](https://github.com/naptha/tesseract.js)

---

**Status:** ✅ Wdrożone w v8.17  
**Ostatnia aktualizacja:** 29.01.2026
