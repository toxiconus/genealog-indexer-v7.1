# v10 - Quick Start Guide 🚀

## Co się stało?

Twój kod z v9 (7252 linii w jednym pliku!) został **rozbity na moduły v10**.

```
v9.html (7252 linii) → v10/ (12 modułów + 10 CSS)
```

---

## Struktura v10

```
v10/
├── index.html              ← Główny plik (otwórz ten!)
├── css/
│   ├── themes.css         ← Kolory, zmienne CSS
│   ├── layout.css         ← CSS Grid layout
│   ├── toolbar.css        ← Pasek ikon
│   ├── thumbnails.css     ← Miniatury
│   ├── viewer.css         ← Główne okno
│   ├── forms.css          ← Wspólne style
│   ├── form-chrztów.css   ← Chrzty
│   ├── form-małżeństw.css ← Małżeństwa
│   ├── form-zgonów.css    ← Zgony
│   └── tables.css         ← Dolne tabele
└── js/
    ├── config.js          ← Konfiguracja
    ├── app.js             ← Bootstrap
    └── modules/
        ├── toolbar.js     ← Pasek ikon
        ├── thumbnails.js  ← Miniatury
        ├── viewer.js      ← OpenSeadragon
        ├── roi.js         ← Rysowanie ROI
        ├── database.js    ← Firebase
        ├── forms-base.js  ← Wspólna logika
        ├── form-chrztów.js
        ├── form-małżeństw.js
        ├── form-zgonów.js
        ├── tables.js      ← Tabele
        ├── search.js      ← Szukanie
        ├── ocr.js         ← Tesseract
        └── keyboard.js    ← Skróty
```

---

## 📋 Jak zacząć?

### Krok 1: Otwórz plik
```
v10/index.html
```

### Krok 2: Sprawdź konsolę
```
F12 → Console
```

Powinieneś zobaczyć:
```
🚀 Inicjalizacja aplikacji v10...
✅ Firebase gotowy
📌 Toolbar init
🖼️ Thumbnails init
👁️ Viewer init
🎯 ROI init
💾 Database init
📝 Forms Base init
📊 Tables init
🔍 Search init
🔤 OCR init
⌨️ Keyboard shortcuts init
✅ Aplikacja zainicjalizowana
```

### Krok 3: Testuj funkcjonalność
```
[ ] Toolbar buttons render
[ ] Drag image → loads
[ ] Rotate (Q/E)
[ ] Forms switch type
[ ] Type specific fields
[ ] Bottom tables show
```

---

## 🎯 Faza Migracji

Każdy moduł ma skeleton kodu. Teraz trzeba **przepisać logikę z v9**.

### Kolejność (rekomendowana):
1. **Toolbar** - najprostszy, dużo przycisków
2. **Thumbnails** - panel miniatur
3. **Viewer** - OpenSeadragon
4. **ROI** - rysowanie
5. **Database** - Firebase
6. **Forms** - walidacja, save
7. **Tables** - CRUD, export
8. **Search** - szukanie
9. **OCR** - Tesseract
10. **Keyboard** - skróty

Każdy moduł: ~200-400 linii kodu (łatwy do edycji)

---

## 📝 Przykład: Jak działają moduły?

### Struktura Modułu

```javascript
const ToolbarModule = (() => {
  // PRYWATNE - tylko wewnątrz modułu
  let state = { isVisible: true };
  
  const privateFunction = () => {};
  
  // PUBLICZNE - dostępne na zewnątrz
  return {
    init: async () => {},
    render: () => {},
    setSyncStatus: (status) => {},
    getState: () => ({ ...state }),
  };
})();
```

### Użycie w app.js

```javascript
// Inicjalizacja
await ToolbarModule.init();

// Używanie
ToolbarModule.setSyncStatus('Synchronizowanie...');

// Czytanie state
const state = ToolbarModule.getState();
```

---

## 🔄 Jak przepisać kod z v9?

### Krok 1: Znajdź kod w v9
```
viewer-osd-v9.html → Ctrl+F → setupToolbar()
```

### Krok 2: Skopiuj logikę do modułu
```javascript
// v9: setupToolbar() { ... }
// v10: ToolbarModule.init() { ... }
```

### Krok 3: Dostosuj do modułu
- Używaj `state` zamiast zmiennych globalnych
- Publiczne metody w `return {}`
- Przycisk click → `setupEventListeners()` w init

### Krok 4: Testuj
```
F12 → Console
ToolbarModule.getState()  // Powinna pokazać state
```

---

## 🎨 CSS - Jak działają zmienne?

### themes.css
```css
:root {
  --color-primary: #0078d4;
  --color-text: #ddd;
}
```

### Użycie wszędzie
```css
button {
  background: var(--color-primary);
  color: var(--color-text);
}
```

### Light Mode (przyszłość)
```css
@media (prefers-color-scheme: light) {
  :root {
    --color-primary: #1976d2;
    --color-text: #333;
  }
}
```

---

## 🐛 Debugging

### W konsoli
```javascript
log('Moja wiadomość')       // [Genealog Indexer] Moja wiadomość
logError('Błąd!', error)   // [Genealog Indexer] ❌ Błąd!
logWarn('Ostrzeżenie')     // [Genealog Indexer] ⚠️ Ostrzeżenie

// Sprawdź state modułu
ViewerModule.getState()
FormChrzciuModule.getState()
```

### Ctrl+Shift+J
Otwiera DevTools Console - tam widzisz wszystkie logi

---

## 💾 Firebase - Co trzeba zrobić?

v10 używa **tej samej konfiguracji Firebase** co v9:
```javascript
// v10/js/config.js
const firebaseConfig = {
  apiKey: "...",  // Taki sam jak w v9
  projectId: "acta-9ea64",
  ...
};
```

Nic nie trzeba zmieniać. Działa tak samo.

---

## 🧪 Testy - Szybka Check List

### Po każdym module opublikowanym:
```
[ ] No console errors
[ ] Moduł initializes
[ ] Publiczne metody working
[ ] State updates correctly
[ ] Integruje się z innymi
```

---

## 🚀 Deployment

### Teraz (Development)
- Otwórz `v10/index.html` lokalnie
- Testuj w przeglądarce
- Commit zmian

### Potem (Production)
- Zdeployuj folder `v10/` na serwer
- Klienci przejdą na `yoursite.com/v10/`
- Starego v9 możesz zachować jako backup

---

## 📞 Co Zrobić Teraz?

### Zaraz:
1. Otwórz `v10/index.html` w Chrome/Firefox
2. F12 → Console
3. Sprawdź czy initializes bez errów
4. Klikaj przyciski (toolbar)
5. Sprawdź CSS (czy nie pali się na oczy?)

### Potem:
- Zacznij z **Toolbar Module** 
- Przepisz logikę z v9
- Testuj każdy przycisk
- Commit w git
- Przejdź do **Thumbnails**
- I tak dalej...

---

## 📚 Dokumenty Pomocnicze

| Dokument | Cel |
|----------|-----|
| [V10_ARCHITEKTURA.md](V10_ARCHITEKTURA.md) | Całościowy plan |
| [PLAN_MIGRACJI_V10.md](PLAN_MIGRACJI_V10.md) | Szczegółowe kroki |
| [config.js](v10/js/config.js) | Konfiguracja + constants |
| [app.js](v10/js/app.js) | Bootstrap logika |

---

## ❓ Pytania?

- **"Ale ja nie rozumiem modułów?"**
  → Czytaj `js/modules/toolbar.js` - tam jest примечание jak to działa

- **"Jak testować?"**
  → `F12` → `Console` → klikaj, obserwuj logi

- **"Czy mogę zmieniać CSS?"**
  → TAK! CSS jest w oddzielnych plikach, łatwo edytować

- **"Co z v9 - usunąć?"**
  → Zaczekaj aż v10 będzie 100% gotowy. Potem backup v9.

---

## 🎉 Powodzenia!

**v10 to czysty, modularny kod. Każda zmiana teraz będzie bezpieczna!**

Zaczęliśmy od struktury. Teraz implementujemy moduły po kolei.

**Next step: Toolbar Module** 🚀
