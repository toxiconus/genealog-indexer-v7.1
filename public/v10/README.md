# Genealog Indexer v10 - README

## 🎯 Projekt

Aplikacja webowa do indeksowania akt genealogicznych (chrzty, małżeństwa, zgony) z możliwościami:
- 📜 Wczytywania obrazów akt
- 👁️ Przeglądania z zoomem/rotacją
- ✏️ Oznaczeń ROI (Region of Interest)
- 📝 Formularzy typu-specyficznych
- 🔤 OCR (rozpoznanie tekstu)
- 💾 Synchronizacji z Firebase
- 📊 Eksportu do CSV/JSON

---

## 📁 Struktura Projektu

```
genealog-indexer-v10/
├── index.html                      Główny plik HTML
├── css/
│   ├── themes.css                 Zmienne, dark/light mode
│   ├── layout.css                 CSS Grid layout
│   ├── toolbar.css                Pasek ikon
│   ├── thumbnails.css             Panel miniatur
│   ├── viewer.css                 OpenSeadragon viewer
│   ├── forms.css                  Wspólne style form
│   ├── form-chrztów.css           Style formularza chrztu
│   ├── form-małżeństw.css         Style formularza małżeństwa
│   ├── form-zgonów.css            Style formularza zgonu
│   └── tables.css                 Style tabel Excel-like
├── js/
│   ├── config.js                  Konfiguracja + stałe
│   ├── app.js                     Bootstrap aplikacji
│   └── modules/
│       ├── toolbar.js             Pasek ikon/akcji
│       ├── thumbnails.js          Panel miniatur
│       ├── viewer.js              OpenSeadragon
│       ├── roi.js                 Rysowanie ROI
│       ├── database.js            Firebase operations
│       ├── forms-base.js          Wspólna logika formularzy
│       ├── form-chrztów.js        Logika formularza chrztu
│       ├── form-małżeństw.js      Logika formularza małżeństwa
│       ├── form-zgonów.js         Logika formularza zgonu
│       ├── tables.js              Tabele CRUD
│       ├── search.js              Szukanie i filtry
│       ├── ocr.js                 Tesseract.js
│       └── keyboard.js            Skróty klawiszowe
├── V10_ARCHITEKTURA.md            Opis architektury
├── PLAN_MIGRACJI_V10.md           Plan migracji z v9
├── V10_QUICK_START.md             Szybki start
└── V10_PODSUMOWANIE.md            To co robiliśmy
```

---

## 🚀 Szybki Start

### 1. Otwórz aplikację
```bash
# W przeglądarce
file:///path/to/v10/index.html
```

### 2. Sprawdź konsolę (F12)
```
🚀 Inicjalizacja aplikacji v10...
✅ Firebase gotowy
📌 Toolbar init
✅ Aplikacja zainicjalizowana
```

### 3. Testuj funkcjonalność
- Drag & drop obrazu na viewer
- Klikaj przyciski w toolbar
- Zmień typ aktu (dropdown prawy panel)
- Rysuj ROI na obrazie (kliknij i przeciągnij)

---

## 📋 Moduły Aplikacji

### Toolbar (`toolbar.js`)
- Pasek ikon u góry
- Przyciski: New, Open, Save, Rotate, Zoom, Export...
- Status indicator (online/offline)

### Thumbnails (`thumbnails.js`)
- Panel miniatur z lewej
- Drag & drop obsługa
- Scroll przez obrazy
- Click = load image

### Viewer (`viewer.js`)
- OpenSeadragon viewer
- Zoom (Ctrl++, Ctrl+-)
- Rotate (Q, E, przyciski)
- Pan (drag myszy)

### ROI (`roi.js`)
- Rysowanie region of interest
- Canvas overlay
- Color coding (active/selected)
- Storage w state aktu

### Database (`database.js`)
- Firebase authentication
- Load/save images
- Save/delete events
- Auto-sync (co 30s)

### Forms (`forms-*.js`)
- 3 specjalne formularze (chrzty, małżeństwa, zgony)
- Validacja pól
- Auto-save (co 5s)
- Color-coding fields (green/yellow/red)

### Tables (`tables.js`)
- Tabela z rekordami
- Sortowanie
- Pagination
- CRUD (add/edit/delete)
- Export (CSV/JSON)

### OCR (`ocr.js`)
- Tesseract.js integration
- Procesowanie całego obrazu
- Procesowanie ROI
- Wynik do pola formularza

### Keyboard (`keyboard.js`)
- Ctrl+S = Save
- Q/E = Rotate
- Ctrl+M = Toggle thumbnails
- Ctrl+L = Toggle acts
- Ctrl+F = Search
- Arrow keys = Navigate

---

## 🎨 Stylizacja

### Zmienne CSS (themes.css)
```css
--color-primary: #0078d4
--color-bg-app: #0a0a0a
--color-text: #ddd
--color-success: #10b981
--color-warning: #fbbf24
--color-error: #ef4444
```

### Dark Mode (Default)
- Ciemne tło
- Jasny tekst
- Niebieskie akcenty

### Light Mode (Future)
```css
@media (prefers-color-scheme: light) {
  :root {
    /* Zmienne light mode */
  }
}
```

---

## 🔐 Bezpieczeństwo & Privacy

### Firebase
- Baza danych: Firestore
- Auth: Firebase Auth
- Storage: Opcjonalnie (dla obrazów)

### Lokalne Storage
- IndexedDB (offline mode)
- Local storage (user preferences)

### Encryption
- HTTPS w produkcji
- Firebase security rules

---

## 📊 Formularze - Struktura Danych

### Chrzty
```json
{
  "id": "evt_001",
  "type": "chrztów",
  "child": {
    "firstName": "Jan",
    "lastName": "Kowalski",
    "baptismDate": "1850-05-15"
  },
  "parents": [
    { "firstName": "Piotr", "lastName": "Kowalski", "role": "ojciec" },
    { "firstName": "Maria", "lastName": "Nowak", "role": "matka" }
  ],
  "godparents": [...],
  "parish": {...},
  "rois": {...}
}
```

### Małżeństwa
```json
{
  "id": "evt_002",
  "type": "małżeństw",
  "groom": {...},
  "bride": {...},
  "witnesses": [...],
  "parish": {...},
  "impediments": {...},
  "dispensa": "..."
}
```

### Zgony
```json
{
  "id": "evt_003",
  "type": "zgonów",
  "deceased": {...},
  "parents": [...],
  "causeOfDeath": "...",
  "deathDate": "1920-03-10",
  "burial": {...},
  "parish": {...}
}
```

---

## ⌨️ Skróty Klawiszowe

| Skrót | Akcja |
|-------|-------|
| **Ctrl+S** | Zapisz |
| **Ctrl+N** | Nowy akt |
| **Ctrl+M** | Toggle miniatury |
| **Ctrl+L** | Toggle akty |
| **Ctrl+J** | Import JSON |
| **Ctrl+E** | Export |
| **Ctrl+F** | Szukaj |
| **Ctrl+R** | OCR |
| **Q** | Rotate left |
| **E** | Rotate right |
| **Arrow Left/Right** | Nawigacja |
| **Ctrl+±** | Zoom |

---

## 🧪 Testing

### Unit Tests (Każdy moduł)
```javascript
// W konsoli
ToolbarModule.getState()         // Check state
DatabaseModule.loadImages()      // Async test
ViewerModule.rotate(90)          // Action test
```

### Integration Tests
```javascript
// Flow: Load Image → Create Event → Save
```

### Manual Testing
```
[ ] UI renders correctly
[ ] Buttons respond to clicks
[ ] Forms validate
[ ] Firebase syncs
[ ] Keyboard shortcuts work
[ ] Export generates files
[ ] Responsive on mobile
```

---

## 🐛 Debugging

### Console Logs
```javascript
log('Message')            // Info
logError('Error', err)    // Error
logWarn('Warning')        // Warning
```

### DevTools
```
F12 → Console
F12 → Network (Firebase calls)
F12 → Storage (IndexedDB, LocalStorage)
Ctrl+Shift+M → Responsive
```

---

## 📦 Dependencies

### External
- OpenSeadragon (viewer)
- Tesseract.js (OCR)
- Firebase SDK (backend)
- Font Awesome (icons)

### Internal
- ACTA v1 Models (acta-v1-models.js)

---

## 🚢 Deployment

### Development
```
file:///path/to/v10/index.html
```

### Production
```
1. Build: (none needed - no build system)
2. Deploy to server:
   yoursite.com/genealog/v10/
3. Update Firebase rules
4. Configure CORS
5. SSL certificate (HTTPS)
```

### Backup v9
```
Rename: viewer-osd-v9.html → v9-backup/
Keep: v10/ as main
```

---

## 📈 Performance

### Optimization Tips
1. Lazy load images
2. Cache Firebase data locally
3. Debounce search input
4. Optimize canvas rendering
5. Minify CSS/JS (production)

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 📚 Dokumentacja

| Dokument | Zawartość |
|----------|-----------|
| **V10_ARCHITEKTURA.md** | Pełny opis architektury |
| **PLAN_MIGRACJI_V10.md** | Szczegółowe kroki migracji |
| **V10_QUICK_START.md** | Szybka instrukcja |
| **V10_PODSUMOWANIE.md** | Podsumowanie co zrobiliśmy |

---

## 🤝 Wspieranie

Jeśli masz pytania:
1. Czytaj komentarze w kodzie
2. Sprawdzaj console (F12)
3. Patrz dokumentację wyżej
4. Testuj moduły osobno

---

## 📝 Licencja

(Ustaw swoją)

---

## 👨‍💻 Autor

Genealog Indexer v10 - Refaktoryzacja 2025-01-09

**Happy Indexing! 📜**
