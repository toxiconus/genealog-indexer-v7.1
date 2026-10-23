// DEBUG_CONSOLE.md - Polecenia do testowania w konsoli (F12)

## ZAŁADUJ W KONSOLI (COPY & PASTE)

### 1️⃣ Załaduj dane testowe
```javascript
testData.load()
```

### 2️⃣ Wyloguj zawartość localStorage
```javascript
testData.log()
```

### 3️⃣ Wyczyść wszystko
```javascript
testData.clear()
```

---

## DOSTĘP DO STANU APLIKACJI

### Wyloguj cały state
```javascript
import { app } from './js/app-state.js';
console.log(app);
```

### Wyloguj aktualny akt
```javascript
import { app, getCurrentAct } from './js/app-state.js';
console.log(getCurrentAct());
```

### Wyloguj listę aktów
```javascript
import { app } from './js/app-state.js';
console.log(app.imageActs);
```

### Wyloguj aktualny template
```javascript
import { app } from './js/app-state.js';
console.log('Template:', app.currentTemplate);
```

---

## RĘCZNE DODAWANIE AKTÓW

### Dodaj testowy akt
```javascript
import { app } from './js/app-state.js';
import { updateThumbs } from './js/thumbs.js';

app.imageActs.push({
  id: 'test-akt-1',
  type: 'chrzest',
  year: 1900,
  nr: 99,
  thumbnail: 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22100%22%20height=%22140%22%3E%3Crect%20fill=%22%23666%22%20width=%22100%22%20height=%22140%22/%3E%3Ctext%20x=%2250%22%20y=%2270%22%20text-anchor=%22middle%22%20fill=%22%23fff%22%20font-size=%2212%22%3ETEST%3C/text%3E%3C/svg%3E',
  data: { childName: 'Test Akt Ręczny' }
});

updateThumbs();
console.log('Dodano akt! Razem:', app.imageActs.length);
```

### Wyczyść wszystkie akty
```javascript
import { app } from './js/app-state.js';
import { updateThumbs } from './js/thumbs.js';

app.imageActs = [];
updateThumbs();
console.log('Wyczyszczono akty!');
```

---

## ZMIANA STANU APLIKACJI

### Zmień szablon
```javascript
import { app, notify } from './js/app-state.js';
app.currentTemplate = 'malzenstwo';
notify(`Zmieniono template na: ${app.currentTemplate}`, 'info');
```

### Zmień aktualny akt
```javascript
import { app, notify } from './js/app-state.js';
app.currentEventId = 'act-002';
notify('Zmieniono akt', 'info');
```

### Wymuś renderowanie thumbów
```javascript
import { updateThumbs } from './js/thumbs.js';
updateThumbs();
```

### Wymuś renderowanie toolbar'a
```javascript
import { renderToolbar } from './js/toolbar.js';
renderToolbar();
```

---

## LOCALSTORAGE OPERACJE

### Wyloguj localStorage jako JSON
```javascript
JSON.parse(localStorage.getItem('actaData_v10'));
```

### Wyloguj sformatowany localStorage
```javascript
const data = JSON.parse(localStorage.getItem('actaData_v10'));
console.table(data.imageActs);
```

### Ręcznie zapisz dane
```javascript
import { app } from './js/app-state.js';
localStorage.setItem('actaData_v10', JSON.stringify({
  imageActs: app.imageActs,
  currentEventId: app.currentEventId,
  currentTemplate: app.currentTemplate
}));
console.log('Zapisano!');
```

---

## PERFORMANCE & DEBUGGING

### Wyloguj rozmiar localStorage
```javascript
const data = localStorage.getItem('actaData_v10');
console.log('Rozmiar:', (data.length / 1024).toFixed(2), 'KB');
```

### Wyloguj czas inicjalizacji
```javascript
console.time('App Init');
// ... kod ...
console.timeEnd('App Init');
```

### Przeszukaj akty po typie
```javascript
import { app } from './js/app-state.js';
const chrzty = app.imageActs.filter(a => a.type === 'chrzest');
console.log('Chrztów:', chrzty.length);
```

### Przeszukaj akty po roku
```javascript
import { app } from './js/app-state.js';
const rok1890 = app.imageActs.filter(a => a.year === 1890);
console.log('Aktów z 1890:', rok1890.length);
```

---

## NOTYFIKACJE I LOGI

### Wyloguj jako notyfikacja
```javascript
import { notify } from './js/app-state.js';
notify('Test wiadomości', 'success');
```

### Wyloguj tabelę
```javascript
import { app } from './js/app-state.js';
console.table(app.imageActs);
```

### Wyloguj strukturę obiektu
```javascript
import { app } from './js/app-state.js';
console.dir(app);
```

---

## SZYBKIE TESTY

### Test 1: Załaduj dane, kliknij miniaturę, zmień template
```javascript
testData.load();  // Załaduj
// Czekaj ~1s na reload, potem:
testData.log();   // Wyloguj
```

### Test 2: Dodaj nowy akt, renderuj thumby
```javascript
import { app } from './js/app-state.js';
import { updateThumbs } from './js/thumbs.js';

app.imageActs.push({
  id: 'test-' + Date.now(),
  type: 'zgon',
  year: 1885,
  nr: 1,
  data: {}
});
updateThumbs();
```

### Test 3: Wyczyść i przeładuj
```javascript
testData.clear();  // Czeka reload
// Potem:
testData.load();   // Znowu załaduj
```

---

## UWAGI

- ⚠️ Copypaste cały blok (od ``` do ```) do konsoli
- ⚠️ Jeśli błąd "Cannot find module" – czekaj aż strona się załaduje
- ⚠️ `testData.*` funkcje działają tylko jeśli załadował się test-data.js
- ⚠️ Po `testData.clear()` strona się reloaduje – czekaj ~2s
- ⚠️ localStorage persists między sessionami – może trzeba `testData.clear()` żeby sprawdzić od zera

---

**Ostatnia aktualizacja:** 9 stycznia 2026  
**Kompatybilność:** Chrome, Firefox, Edge (wszystkie nowoczesne przeglądarki)  
**Wymagania:** Serwer lokalny (nie działa z `file://`)
