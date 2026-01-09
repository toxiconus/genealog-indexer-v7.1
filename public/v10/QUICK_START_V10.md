# v10 – QUICK START 🚀

## Wdrożona struktura modularna

✅ **Toolbar** – toolbar.js  
✅ **ThumbsBar** – thumbs.js  
✅ **App State** – app-state.js (centralne zarządzanie stanem)  
✅ **Main** – main.js (inicjalizacja)  

## Jak uruchomić v10

### 1. Serwer lokalny
```bash
# Opcja 1: Python
cd v10
python -m http.server 8000

# Opcja 2: Node + http-server
npx http-server v10 -p 8000

# Opcja 3: VS Code Live Server
# Kliknij prawym przyciskiem na index.html → Open with Live Server
```

### 2. Otwórz w przeglądarce
```
http://localhost:8000/v10/index.html
```

### 3. Sprawdź konsolę
Otwórz DevTools (F12) → Console – powinny być:
```
🚀 Inicjalizacja v10 – modularna wersja
📊 renderToolbar() – rozpoczęto
✅ Toolbar renderowany
🎬 updateThumbs() – początek, aktów: 0
✅ Thumbs renderowane: 0
✅ Aplikacja zainicjalizowana
```

## Załadowanie danych testowych

W konsoli (F12) wpisz:
```javascript
// Załaduj dane testowe
testData.load()

// Lub wyloguj co jest w localStorage
testData.log()

// Lub wyczyść wszystkie dane
testData.clear()
```

Po `testData.load()` powinieneś zobaczyć **3 miniatury** na lewym panelu.

## Struktura plików

```
v10/
├── index.html              # Szkielet HTML
├── test-data.js            # Dane testowe + helpers
├── css/
│   ├── themes.css          # Zmienne CSS i global styles
│   ├── layout.css          # Flex layout
│   ├── toolbar.css         # Style toolbara
│   ├── thumbnails.css      # Style miniatur
│   └── ...
└── js/
    ├── main.js             # Inicjalizacja (entry point)
    ├── app-state.js        # Centralny state
    ├── toolbar.js          # Moduł toolbar (renderToolbar)
    ├── thumbs.js           # Moduł thumbs (updateThumbs)
    ├── config.js           # Konfiguracja
    └── modules/            # Inne moduły (do zaimplementowania)
```

## Najczęstsze problemy

### ❌ "ReferenceError: testData is not defined"
**Rozwiązanie:** Czekaj aż strona się całkowicie załaduje (DevTools powinny pokazać komunikaty o inicjalizacji)

### ❌ "Cannot find module './forms.js'"
**To jest OK** – moduł forms.js jeszcze nie istnieje. W konsoli zobaczymy:
```
forms.js jeszcze nie istnieje
```

### ❌ Toolbar/Thumbs się nie renderują
1. Sprawdź konsolę DevTools (F12 → Console)
2. Szukaj błędów w kolorze czerwonym
3. Sprawdź czy elementy `#toolbar` i `#thumbsBar` istnieją w HTML

### ❌ Elementy CSS (kolory/czcionka) źle wyglądają
- Sprawdź czy są ładowane wszystkie pliki CSS (DevTools → Network)
- Upewnij się, że zmienne CSS w `themes.css` są prawidłowo zdefiniowane

## Następne kroki

1. ✅ **Moduł formy** (`forms.js`) – renderowanie pól formularza
2. ✅ **Moduł viewer** (`viewer.js`) – OpenSeadragon + wyświetlanie obrazu
3. ✅ **Moduł przechowywania** (`storage.js`) – Firebase/LocalStorage
4. ✅ **Moduł OCR** (`ocr.js`) – Tesseract
5. ✅ **Moduł tabeli** (`table.js`) – wyświetlanie danych

## Debugowanie

### Wyloguj cały state aplikacji
```javascript
import { app } from './js/app-state.js';
console.log(app);
```

### Dodaj testowy akt ręcznie
```javascript
import { app } from './js/app-state.js';
import { updateThumbs } from './js/thumbs.js';

app.imageActs.push({
  id: 'test-act',
  type: 'chrzest',
  year: 1890,
  nr: 1,
  thumbnail: 'data:image/svg+xml,...'
});

updateThumbs();
```

## Obserwacja zmian w localStorage
```javascript
// Wyloguj zawartość localStorage
JSON.parse(localStorage.getItem('actaData_v10'))

// Lub użyj helper
testData.log()
```

---

**Status:** ✅ Moduł toolbar i thumbs gotowy do testów  
**Ostatnia aktualizacja:** 9 stycznia 2026  
**V10 Progress:** 🟢 20% (toolbar + thumbs kompletne)
