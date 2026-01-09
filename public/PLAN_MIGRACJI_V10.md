# Plan Przejścia z v9 na v10 - Szczegółowe Kroki

## 🎯 Cel
Rozdzielić monolityczny kod v9 na moduły v10, aby każda zmiana była testowalna osobno, bez błędów kaskadowych.

---

## 📊 Status

| Faza | Status | Opis |
|------|--------|------|
| **1. Struktura & Layout** | ✅ DONE | index.html + CSS layout |
| **2. Moduły Stub** | ✅ DONE | Wszystkie moduły JS mają skeleton |
| **3. Migracja Kodu** | ⏳ TODO | Przepisać logikę z v9 |
| **4. Testowanie** | ⏳ TODO | Każdy moduł + integracja |
| **5. Cleanup** | ⏳ TODO | Usunąć v9, backup |

---

## 🚀 Faza 1: STRUKTURA & LAYOUT ✅

### Co zostało zrobione:
- [x] Katalog `v10/` z podkatalogami
- [x] `index.html` z pełnym layoutem CSS Grid
- [x] `css/` - 10 plików CSS
- [x] `js/modules/` - stubs dla wszystkich 12 modułów
- [x] `js/config.js` - konfiguracja centralna
- [x] `js/app.js` - bootstrap

### Pliki Created:
```
v10/
├── index.html ✅
├── css/
│   ├── themes.css ✅
│   ├── layout.css ✅
│   ├── toolbar.css ✅
│   ├── thumbnails.css ✅
│   ├── viewer.css ✅
│   ├── forms.css ✅
│   ├── form-chrztów.css ✅
│   ├── form-małżeństw.css ✅
│   ├── form-zgonów.css ✅
│   └── tables.css ✅
├── js/
│   ├── config.js ✅
│   ├── app.js ✅
│   └── modules/
│       ├── toolbar.js ✅
│       ├── thumbnails.js ✅
│       ├── viewer.js ✅
│       ├── roi.js ✅
│       ├── database.js ✅
│       ├── forms-base.js ✅
│       ├── form-chrztów.js ✅
│       ├── form-małżeństw.js ✅
│       ├── form-zgonów.js ✅
│       ├── tables.js ✅
│       ├── search.js ✅
│       ├── ocr.js ✅
│       └── keyboard.js ✅
```

---

## 🔧 Faza 2: MIGRACJA KODU (Kolejność)

### 2.1 Toolbar Module
**Plik:** `v10/js/modules/toolbar.js`

Co przepisać z v9:
- `setupToolbar()` → główna logika inicjalizacji
- Wszystkie click listenersy do przycisków
- Ikony i nazwy przycisków
- Status indicator (sync status)

**Czek lista:**
- [ ] Renderuje wszystkie przyciski
- [ ] Kliknięcia działają
- [ ] Toggle panels działa (thumbs, acts, right)
- [ ] Status wskazuje online/offline

---

### 2.2 Thumbnails Module
**Plik:** `v10/js/modules/thumbnails.js`

Co przepisać z v9:
- `initThumbnails()` - inicjalizacja panelu
- Drag & drop obsługa
- Click na thumbnail → load image
- Scroll i renderowanie
- ROI count badges

**Czek lista:**
- [ ] Drag & drop obrazów działa
- [ ] Miniatury się renderują
- [ ] Scroll smooth
- [ ] Klikniecie -> otwiera obraz

---

### 2.3 Viewer Module
**Plik:** `v10/js/modules/viewer.js`

Co przepisać z v9:
- OpenSeadragon inicjalizacja
- `openImage()` - otwarcie obrazu
- Rotation (Q, E, przyciski)
- Zoom (Ctrl++, Ctrl+-)
- Event listeners dla viewer

**Czek lista:**
- [ ] OpenSeadragon renders
- [ ] Image can be loaded
- [ ] Rotate Q/E works
- [ ] Zoom buttons work
- [ ] Drag pan works

---

### 2.4 ROI Module
**Plik:** `v10/js/modules/roi.js`

Co przepisać z v9:
- Canvas setup
- `startDraw()`, `draw()`, `endDraw()`
- Drawing state machine
- ROI storage
- Color coding (active, selected)

**Czek lista:**
- [ ] Can draw rectangle
- [ ] Colors change correctly
- [ ] ROIs are stored
- [ ] Clear ROIs works

---

### 2.5 Database Module
**Plik:** `v10/js/modules/database.js`

Co przepisać z v9:
- Firebase auth
- `loadImages()` - Firestore query
- `saveEvent()` - event write
- `deleteEvent()` - event delete
- Auto-sync logic

**Czek lista:**
- [ ] Firebase connects
- [ ] Can load images list
- [ ] Can save events
- [ ] Can delete events
- [ ] Auto-sync works

---

### 2.6 Forms Base Module
**Plik:** `v10/js/modules/forms-base.js`

Co przepisać z v9:
- Common form validation
- Form state management
- Progress bar logic
- Auto-save interval

**Czek lista:**
- [ ] Validation works
- [ ] Progress bar updates
- [ ] Auto-save fires
- [ ] Error highlighting works

---

### 2.7-2.9 Form Modules (Chrzty, Małżeństwa, Zgony)
**Pliki:**
- `v10/js/modules/form-chrztów.js`
- `v10/js/modules/form-małżeństw.js`
- `v10/js/modules/form-zgonów.js`

Co przepisać z v9:
- HTML templates dla każdego typu
- Field handling (tie to ROI)
- Type-specific validation
- Save logic per type

**Czek lista (dla każdego):**
- [ ] Form renders correctly
- [ ] All fields populate
- [ ] Type selector switches forms
- [ ] Save button works
- [ ] Fields color-code (green/yellow/red)

---

### 2.10 Tables Module
**Plik:** `v10/js/modules/tables.js`

Co przepisać z v9:
- Table rendering
- Sorting
- Pagination
- Export (CSV/JSON)
- Row CRUD

**Czek lista:**
- [ ] Table renders
- [ ] Sorting works
- [ ] Pagination works
- [ ] Export works
- [ ] Can add/edit/delete rows

---

### 2.11 Search Module
**Plik:** `v10/js/modules/search.js`

Co przepisać z v9:
- Search input handling
- Search results formatting
- Filter logic

**Czek lista:**
- [ ] Search input works
- [ ] Results appear
- [ ] Filter works

---

### 2.12 OCR Module
**Plik:** `v10/js/modules/ocr.js`

Co przepisać z v9:
- Tesseract.js init
- `processImage()` 
- ROI OCR processing

**Czek lista:**
- [ ] OCR initializes
- [ ] Can process image
- [ ] Results appear in form

---

### 2.13 Keyboard Module
**Plik:** `v10/js/modules/keyboard.js`

Co przepisać z v9:
- All keyboard shortcuts
- Event delegation
- Prevent conflicts

**Czek lista:**
- [ ] Ctrl+S saves
- [ ] Q/E rotate
- [ ] Ctrl+M toggles
- [ ] Arrow keys navigate

---

## 🧪 Faza 3: TESTOWANIE

### Test Checklist per Module

#### Toolbar
```
[ ] Wszystkie przyciski renderują
[ ] Click na button uruchamia akcję
[ ] Toggle panels collapse/expand
[ ] Status indicator zmienia się
[ ] Ikony wyświetlają się prawidłowo
```

#### Viewer
```
[ ] OpenSeadragon loaduje się
[ ] Drag & drop image works
[ ] Zoom in/out
[ ] Rotate left/right
[ ] Pan image with mouse
[ ] Double-click zoom
```

#### Forms
```
[ ] Zmiana typu aktu przełącza formy
[ ] Wszystkie pola się renderują
[ ] Validacja działa
[ ] Save zapisuje dane
[ ] Auto-save fires every 5s
[ ] Color-coding fields (green/yellow/red)
[ ] Progress bar updates
```

#### Tables
```
[ ] Wyświetla rekordy
[ ] Sortowanie działa
[ ] Pagination działa
[ ] Export CSV/JSON
[ ] Add/Edit/Delete rows
[ ] Search w tabelach
```

#### ROI
```
[ ] Można rysować ROI na obrazie
[ ] ROI zmienia kolor gdy active
[ ] ROI привязany do pola formularza
[ ] Clear ROI works
[ ] ROI persists przy zmianach pola
```

#### Database
```
[ ] Firebase zalogowany
[ ] Można załadować obrazy
[ ] Można zapisać event
[ ] Można usunąć event
[ ] Auto-sync co 30s
[ ] Offline mode działa
```

#### OCR
```
[ ] OCR initializes
[ ] Przetwarza obraz
[ ] Wynik trafia do pola
[ ] ROI OCR works
```

#### Keyboard
```
[ ] Ctrl+S saves
[ ] Ctrl+N new act
[ ] Q/E rotate
[ ] Ctrl+M toggle
[ ] Ctrl+L toggle
[ ] Arrow keys navigate
[ ] Shortcuts don't fire w formach
```

---

## ✅ Faza 4: INTEGRACJA

### Integration Tests
```
[ ] Load app -> toolbar ready
[ ] Load app -> viewer ready
[ ] Load app -> forms ready
[ ] Load image -> displays
[ ] Create event -> saved to Firebase
[ ] Edit event -> updates table
[ ] Delete event -> removed from table
[ ] Type switch -> form changes
[ ] Form save -> updates table
[ ] Table row click -> loads form
[ ] Export -> file downloads
```

---

## 🧹 Faza 5: CLEANUP

Gdy v10 będzie w pełni działać:
- [ ] Backup v9 (rename na `v9-backup-[date]`)
- [ ] Usuń stare versjie (v1-v8)
- [ ] Aktualizuj links/references
- [ ] Update documentation
- [ ] Final testing na produkcji

---

## 📝 Rekomendacje

### CSS - Czy oddzielne dla każdego typu aktu?

**Odpowiedź: TAK, ale z deklaratywnie**

Każdy typ ma **własny plik** (`form-chrztów.css` etc.), ale:
1. **Wspólne style** w `forms.css`
2. **Sekcje kolorowe** - jeden kolor border dla każdej sekcji:
   - Chrzty: różne kolory dla dziecka, rodziców, chrzestnych
   - Małżeństwa: kolor dla żenicha, panny młodej, świadków
   - Zgony: kolor dla zmarłego, rodziców, przyczyny
3. **Klasy pomocnicze** do kolorowania pól:
   ```css
   .field-child { --field-color: #e91e63; }
   .field-groom { --field-color: #1976D2; }
   .field-deceased { --field-color: #9C27B0; }
   ```

### Formularz - Czy budować dynamicznie czy stubs?

**Odpowiedź: Zaczać ze STUBS (HTML), potem opcjonalnie podać validatorem**

Każdy formularz ma:
- ✅ HTML template (statyczny)
- ✅ Form Module (logika)
- ✅ CSS (styles)
- (opcj) Validator schema (JSON Schema)

---

## 🎓 Wzorce Kodowania v10

### Każdy moduł = IIFE
```javascript
const ModuleNameModule = (() => {
  let state = { /* prywatny */ };
  
  const privateFunction = () => {};
  
  return {
    init: async () => {},
    publicMethod: () => {},
    getState: () => ({ ...state }),
  };
})();
```

### Event Handling
```javascript
element.addEventListener('click', (e) => {
  e.preventDefault();
  log('Action happened');
  // Do something
});
```

### Async Operations
```javascript
const asyncFunction = async () => {
  try {
    const result = await somePromise();
    log('Success');
    return result;
  } catch (error) {
    logError('Error', error);
    return null;
  }
};
```

---

## 🚀 Jak zacząć?

1. **Test struktura**: Otwórz `v10/index.html` w przeglądarce
   - Powinno wyświetlić layout (toolbar, panels, tables)
   - Brak błędów w konsoli

2. **Zacznij z Toolbar**:
   - Implementuj `toolbar.js`
   - Testuj każdy przycisk
   - Commit po ukończeniu

3. **Idź dalej**: Thumbnails → Viewer → Forms → Tables

4. **Testuj integracyjnie**: Gdy wszystkie moduły gotowe

---

## 📚 Dokumentacja Pomocnicza

- [MDN Web Docs](https://developer.mozilla.org/)
- [OpenSeadragon Docs](https://openseadragon.github.io/)
- [Tesseract.js Docs](https://tesseract.projectnaptha.com/)
- [Firebase Docs](https://firebase.google.com/docs)

---

## 💬 Pytania do rozważenia

1. **Database**: Czy używać Firestore (jak v9) czy zmienić na lokalny storage?
   → Polecam: Firestore + IndexedDB (offline)

2. **State Management**: Czy CentralStore (Redux-like) czy rozproszone state?
   → Polecam: Rozproszone (każdy moduł zarządza swoim state)

3. **Testing**: Czy jednostkowe testy (Jest) czy tylko manual?
   → Polecam: Manual testing teraz, testy potem

4. **Deployment**: v10 obok v9 czy replace?
   → Polecam: Bok obok (`/v10/` i `/v9-backup/`)

---

**Powodzenia! 🚀**
