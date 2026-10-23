# Genealog Indexer v10 - Architektura Modularyzowana

## 📋 Przegląd zmian

Przejście z v9 (monolityczny HTML) na v10 (modułowa architektura) rozwiązuje problemy z błędami podczas edycji i ułatwia utrzymanie kodu.

---

## 🏗️ Struktura katalogów v10

```
projekt-akta-v2/public/
├── v10/
│   ├── index.html                    [GŁÓWNY - Layout strony]
│   ├── css/
│   │   ├── layout.css               [Grid, responsywność]
│   │   ├── toolbar.css              [Pasek ikon/akcji - górny]
│   │   ├── thumbnails.css           [Panel miniatur]
│   │   ├── viewer.css               [Główne okno, zdjęcie, rysowanie]
│   │   ├── forms.css                [Formularze ogólne]
│   │   ├── form-chrztów.css         [Formularz specyficzny dla chrztu]
│   │   ├── form-małżeństw.css       [Formularz specyficzny dla małżeństwa]
│   │   ├── form-zgonów.css          [Formularz specyficzny dla zgonu]
│   │   ├── tables.css               [Dolne tabele Excel-like]
│   │   └── themes.css               [Zmienne kolorów, dark mode]
│   ├── js/
│   │   ├── config.js                [Konfiguracja Firebase, stałe]
│   │   ├── modules/
│   │   │   ├── toolbar.js           [Logika paska ikon]
│   │   │   ├── thumbnails.js        [Zarządzanie miniaturami, ScrollBar]
│   │   │   ├── viewer.js            [OpenSeadragon, rotacja, zoom, drag-drop]
│   │   │   ├── roi.js               [Region of Interest - rysowanie, zapisywanie]
│   │   │   ├── forms-base.js        [Wspólna logika formularzy]
│   │   │   ├── form-chrztów.js      [Logika formularza chrztu]
│   │   │   ├── form-małżeństw.js    [Logika formularza małżeństwa]
│   │   │   ├── form-zgonów.js       [Logika formularza zgonu]
│   │   │   ├── tables.js            [Dolne tabele - CRUD, eksport]
│   │   │   ├── database.js          [Firebase operations, synchronizacja]
│   │   │   ├── search.js            [Szukanie, filtry]
│   │   │   ├── ocr.js               [Tesseract.js integracja]
│   │   │   └── keyboard.js          [Skróty klawiszowe]
│   │   └── app.js                   [Bootstrap, inicjalizacja, routing]
│   └── templates/
│       ├── toolbar.html             [HTML paska ikon]
│       ├── thumbnails.html          [HTML panelu miniatur]
│       ├── viewer.html              [HTML głównego okna]
│       ├── form-chrztów.html        [HTML formularza chrztu]
│       ├── form-małżeństw.html      [HTML formularza małżeństwa]
│       ├── form-zgonów.html         [HTML formularza zgonu]
│       └── tables.html              [HTML dolnych tabel]
```

---

## 🎯 Zasady architektury

### 1. **Główny plik: index.html**
- Zawiera layout zdefiniowany przez CSS Grid
- Brak logiki biznesowej, tylko struktura
- Importuje wszystkie moduły JS
- Łączy szablony HTML z modułów

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/toolbar.css">
  <!-- ... więcej CSS ... -->
</head>
<body>
  <div id="app">
    <div id="toolbar"></div>
    <div id="main-content">
      <div id="thumbnails"></div>
      <div id="viewer"></div>
      <div id="right-panel"></div>
    </div>
    <div id="bottom-tables"></div>
  </div>
  
  <script src="js/config.js"></script>
  <script src="js/modules/toolbar.js"></script>
  <!-- ... więcej skryptów ... -->
  <script src="js/app.js"></script>
</body>
</html>
```

### 2. **Moduły JS - Wzorzec**
Każdy moduł to IIFE (Immediately Invoked Function Expression) z publicznym interfejsem:

```javascript
// js/modules/toolbar.js
const ToolbarModule = (() => {
  // Prywatne zmienne
  let state = {};
  
  // Prywatne funkcje
  const initUI = () => { /* ... */ };
  const setupEventListeners = () => { /* ... */ };
  
  // Publiczny interfejs
  return {
    init: (config) => { /* ... */ },
    render: () => { /* ... */ },
    setState: (newState) => { state = { ...state, ...newState }; },
    getState: () => state,
    // ... publiczne metody
  };
})();
```

### 3. **Formularze typów aktów**
Każdy typ aktu ma własny formularz:
- **Chrzty**: rodzice, chrzestni, parafia
- **Małżeństwa**: dwaj małżonkowie, świadkowie, parafia
- **Zgony**: zmarły, wiek, przyczyna, parafia

Selektor w górnym panelu:
```html
<select id="actTypeSelector">
  <option value="chrztów">Chrzty</option>
  <option value="małżeństw">Małżeństwa</option>
  <option value="zgonów">Zgony</option>
</select>
```

Dynamicznie ładuje odpowiedni formularz ze wzoru.

### 4. **CSS - Osobne pliki**
- `layout.css` - CSS Grid, responsywność (WSPÓLNY)
- `forms.css` - Style wspólne dla wszystkich formularzy
- `form-[typ].css` - Style specyficzne dla typu aktu
- `toolbar.css`, `thumbnails.css`, `viewer.css` itd. - Style modułów

Zmienne CSS w `themes.css`:
```css
:root {
  --color-primary: #0078d4;
  --color-bg-dark: #0a0a0a;
  --color-text: #ddd;
  --color-border: #2a2a2a;
}
```

### 5. **Zmiana formularza**
```javascript
// W form-base.js
const switchFormType = (actType) => {
  // Ukryj wszystkie formularze
  document.querySelectorAll('.form-section').forEach(el => {
    el.classList.remove('active');
  });
  
  // Pokaż właściwy formularz
  document.getElementById(`form-${actType}`).classList.add('active');
  
  // Załaduj odpowiedni moduł logiki
  const moduleMap = {
    chrztów: FormChrzciuModule,
    małżeństw: FormMałżeństwaModule,
    zgonów: FormZgonuModule,
  };
  
  currentFormModule = moduleMap[actType];
  currentFormModule.init();
};
```

---

## 🔄 Plan migracji kodu z v9 na v10

### Faza 1: Przygotowanie struktury (ZARAZ)
1. Utwórz katalog `v10/` z podkatalogami
2. Stwórz `index.html` z layoutem
3. Stwórz stubs dla wszystkich CSS i JS

### Faza 2: Migracja modułów (Po kolei)
1. **Krok 1**: `toolbar.js` + `toolbar.css`
   - Wytnij z v9 kod inicjalizacji toolbara
   - Zmień na moduł IIFE
   - Testuj w przeglądarce

2. **Krok 2**: `thumbnails.js` + `thumbnails.css`
   - Migruj panel miniatur
   - Testuj scroll, kliknięcia

3. **Krok 3**: `viewer.js` + `viewer.css` + `roi.js`
   - OpenSeadragon, rotacja, zoom
   - Rysowanie ROI
   - Testuj drag-drop, rysowanie

4. **Krok 4**: `database.js`
   - Firebase operations
   - Synchronizacja

5. **Krok 5**: Formularze
   - `form-base.js` - wspólna logika
   - `form-[typ].js` - specyficzne
   - `forms.css` + `form-[typ].css`

6. **Krok 6**: Dolne tabele
   - `tables.js` + `tables.css`

7. **Krok 7**: Pozostałe moduły
   - `ocr.js`, `search.js`, `keyboard.js`

### Faza 3: Testowanie (Całość)
- Każda akcja w UI
- Skróty klawiszowe
- Zapis/wczytanie z Firebase
- Responsywność

### Faza 4: Cleanup
- Usuń stare wersje (v1-v9)
- Lub zachowaj jako backup

---

## 💾 Struktura danych - bez zmian

Model ACTA v1 pozostaje taki sam:
- `Event` - akt (chrzest, małżeństwo, zgon)
- `Person` - osoba
- `Role` - rola osoby w akcie (ojciec, matka, świadek)
- `Relationship` - relacja między osobami

---

## ✅ Korzyści tego podejścia

| Problem | Rozwiązanie |
|---------|------------|
| Błędy po każdej zmianie | Testowanie każdego modułu osobno |
| Trudna edycja dużych plików | Każdy moduł to max 300-400 linii |
| Mieszany HTML/CSS/JS | Rozdzielone szablony i logika |
| Uniwersalny formularz dla wszystkich aktów | Specjalne formularze dla każdego typu |
| Trudny CSS | Osobne pliki, zmienne CSS, BEM |
| Brak elastyczności | Łatwo dodać nowy typ aktu |

---

## 📝 Następne kroki

Chcesz, aby:
1. Przygotowała pełny `index.html` z layoutem?
2. Stworzył szablon dla każdego formularza (HTML)?
3. Zaczął migrację konkretnego modułu (np. toolbar)?

Polecam kolejność: **layout** → **toolbar** → **thumbnails** → **viewer** → **formularze**

Każdy krok będzie testowany i confirmowany zanim przejdziemy do następnego! 🚀
