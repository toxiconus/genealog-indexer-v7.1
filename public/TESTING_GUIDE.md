# 🧪 Poradnik testowania FIX v8.17

## 🚀 Quick Start

### 1. Otwórz plik
```
viewer-osd-v8.17.html
```

### 2. Otwórz Developer Console
**F12** lub **Ctrl+Shift+I** → zakładka **Console**

### 3. Załaduj folder z obrazami
Kliknij **[+ Otwórz]** → wybierz folder (np. `obraz 1/`, `obraz 2/`, itd.)

---

## ✅ Test 1: Dual ID system

```javascript
// W Console, po wczytaniu obrazów:

// Pokaż pierwszy akt
const act = app.imageActs[0];
console.log('=== TEST 1: DUAL ID ===');
console.log('displayId:', act.displayId);      // Powinno być: CH.LUB.1783.002
console.log('originalId:', act.originalId);    // Powinno być: uuid-xxx-xxx
console.log('act.id:', act.id);                // Powinno być = displayId
console.log('imagePath:', act.imagePath);      // Powinno być: folder/image.jpg
```

**Oczekiwany wynik:**
```
displayId: CH.LUB.1783.002
originalId: 8f3c2b1a-9e4d-4c5f-8b2a-7d1e3f4c9a5b
act.id: CH.LUB.1783.002
imagePath: CH BLIN/obraz_001.jpg
```

---

## ✅ Test 2: Image Path tracking

```javascript
// Sprawdź czy każdy obraz ma relativePath:
console.log('=== TEST 2: IMAGE PATHS ===');
app.images.forEach((img, idx) => {
  console.log(`[${idx}] name: ${img.name}, relativePath: ${img.relativePath}`);
});

// Sprawdź czy currentImagePath jest ustawiony:
console.log('Current image path:', app.currentImagePath);
```

**Oczekiwany wynik:**
```
[0] name: obraz_001.jpg, relativePath: CH BLIN/obraz_001.jpg
[1] name: obraz_002.jpg, relativePath: CH BLIN/obraz_002.jpg
Current image path: CH BLIN/obraz_001.jpg
```

---

## ✅ Test 3: Local Database (SQL.js)

```javascript
// Sprawdź czy baza jest inicjalizowana:
console.log('=== TEST 3: LOCAL DATABASE ===');
console.log('localDb initialized:', !!localDb);

// Załaduj wszystkie akty z bazy:
const allActs = loadActsFromLocalDB();
console.log('Total acts in DB:', allActs.length);

// Wyświetl pierwsze 3:
allActs.slice(0, 3).forEach(act => {
  console.log(`- ${act.displayId}: ${act.type} (${act.year})`);
});

// Wyszukaj po displayId:
const found = searchActByDisplayId('CH.LUB.1783.002');
console.log('Search result:', found ? found.displayId : 'NOT FOUND');
```

**Oczekiwany wynik:**
```
localDb initialized: true
Total acts in DB: 5
- CH.LUB.1783.001: christening (1783)
- CH.LUB.1783.002: christening (1783)
- CH.LUB.1783.003: christening (1783)
Search result: CH.LUB.1783.002
```

---

## ✅ Test 4: Offline mode (bez Supabase)

```javascript
// Sprawdź czy możesz pracować bez internetu:
1. Otwórz DevTools → Network → Offline (zaznacz checkbox)
2. Załaduj folder z obrazami
3. Utwórz nowe akty (modal)
4. Edytuj formularz
5. Kliknij [💾 Zapisz record]

// W Console:
console.log('Last image acts count:', app.imageActs.length);

// Powinno działać bez błędów - wszystko zapisuje się w SQL.js
```

**Oczekiwany wynik:**
- Brak błędów o Supabase
- Akty są zapisywane w lokalnej bazie
- Po włączeniu internetu - synchronizacja z Supabase

---

## ✅ Test 5: Auto-link obrazu do aktu

```javascript
// Po załadowaniu obrazu i stworzeniu aktów:
1. Kliknij na pierwszy akt (w lewym panelu)
2. Powinno wyświetlić formularz

// W Console, sprawdź powiązanie:
const currentAct = app.imageActs.find(a => a.actNum === app.currentActNum);
console.log('=== TEST 5: AUTO-LINK ===');
console.log('Act:', currentAct.displayId);
console.log('Image path:', currentAct.imagePath);
console.log('Current image path:', app.currentImagePath);
console.log('Match:', currentAct.imagePath === app.currentImagePath);
```

**Oczekiwany wynik:**
```
Act: CH.LUB.1783.001
Image path: CH BLIN/obraz_001.jpg
Current image path: CH BLIN/obraz_001.jpg
Match: true
```

---

## ✅ Test 6: Edytuj i zapisz

```javascript
// Po otwarciu aktu:
1. Wpisz dane w pola formularza (np. imię dziecka)
2. Kliknij [💾 Zapisz record]
3. Poczekaj na notyfikację "Akt ... zapisany"

// W Console, sprawdź czy dane są w bazie:
const acts = loadActsFromLocalDB({ displayId: 'CH.LUB.1783.001' });
console.log('Saved fieldValues:', acts[0].fieldValues);
```

**Oczekiwany wynik:**
```javascript
{
  dziecko_imie: "Jan",      // Wartość którą wpisałeś
  ojciec_imie: "",
  ...
}
```

---

## 🐛 Debug: Jak znaleźć błędy

### Jeśli akt nie ma imagePath:
```javascript
const badActs = app.imageActs.filter(a => !a.imagePath);
console.log('Acts without imagePath:', badActs.length);
badActs.forEach(a => {
  console.log(`- ${a.displayId}: imageIdx=${a.imageIdx}`);
});
```

### Jeśli baza nie inicjalizuje:
```javascript
console.log('SQL.js loaded:', typeof SQL !== 'undefined');
console.log('localDb:', localDb);
// Jeśli null → problem w initLocalDB()
```

### Jeśli duplikaty w bazie:
```javascript
const allActs = loadActsFromLocalDB();
const byDisplayId = {};
allActs.forEach(a => {
  if (byDisplayId[a.displayId]) {
    console.log('DUPLICATE:', a.displayId);
  }
  byDisplayId[a.displayId] = true;
});
```

---

## 📊 Export aktów do JSON (dla migracji)

```javascript
// W Console:
function exportActsToJson() {
  const allActs = loadActsFromLocalDB();
  const json = JSON.stringify(allActs, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `akty_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}

exportActsToJson();
// Pobierze plik: akty_backup_2026-01-29.json
```

---

## ⚠️ Znane problemy

### Problem 1: "Original_id not unique"
- Jeśli migrować stare akty bez UUID
- **Fix:** Najpierw wygeneruj UUID: `act.originalId = crypto.randomUUID()`

### Problem 2: SQL.js nie ładuje
- Sprawdź czy CDN działa: https://cdnjs.cloudflare.com/ajax/libs/sql.js/
- **Fix:** Użyj innego CDN lub download sql.js lokalnie

### Problem 3: Pusta baza
- Jeśli stare dane były w localStorage
- **Fix:** Otwórz DevTools → Application → Local Storage → Usuń `genealog_*`

---

## 📞 Wsparcie

Jeśli coś nie działa:
1. Otwórz Console (F12)
2. Skopiuj błąd
3. Sprawdź czy są komunikaty `console.error()`
4. Uruchom testy z sekcji wyżej

---

**Ostatnia aktualizacja:** 29.01.2026  
**Wersja:** v8.17+FIX
