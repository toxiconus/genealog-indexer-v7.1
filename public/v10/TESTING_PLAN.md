# TESTING PLAN – v10 Toolbar + Thumbs

## Scenariusz 1: Początkowy załadunek (bez danych)

### Kroki:
1. Otwórz `http://localhost:8000/v10/index.html`
2. Otwórz DevTools (F12)
3. Przejdź do Console

### Oczekiwane rezultaty:

#### W konsoli powinny być logiki:
```
🚀 Inicjalizacja v10 – modularna wersja
📊 renderToolbar() – rozpoczęto
✅ Toolbar renderowany
🎬 updateThumbs() – początek, aktów: 0
✅ Thumbs renderowane: 0
✅ Aplikacja zainicjalizowana
```

#### Na stronie powinno być widoczne:
- ✅ Toolbar z przyciskami (Otwórz obraz, Dodaj akty, szablony, Firebase, Zapisz)
- ✅ Lewy panel z tekstem "Brak aktów – dodaj nowe"
- ✅ Centralny viewer (pusty)
- ✅ Prawy panel (prawy pojemnik – pusty)

#### Na DevTools Network powinny być załadowane:
- ✅ index.html
- ✅ main.js, toolbar.js, thumbs.js, app-state.js
- ✅ Wszystkie pliki CSS (themes.css, layout.css, toolbar.css, thumbnails.css itp.)
- ✅ Firebase SDK (jeśli jest dostęp do internetu)

---

## Scenariusz 2: Załadowanie danych testowych

### Kroki:
1. Przejdź do Console (F12)
2. Wpisz: `testData.load()`
3. Poczekaj na reload strony

### Oczekiwane rezultaty:

#### W konsoli:
```
✅ Załadowano dane testowe do localStorage
Strona reloaduje...
```

#### Po przeładowaniu strony:
```
✅ Załadowano dane z localStorage
✅ Aplikacja zainicjalizowana
```

#### Na stronie:
- ✅ **Lewy panel teraz pokazuje 3 miniatury:**
  - "CHRZ.1890.No.1" (szara miniatura)
  - "MALZ.1880.No.5" (niebieska miniatura)
  - "ZGON.1895.No.12" (ruda miniatura)
- ✅ Pierwsza miniatura powinna być zaznaczona na niebiesko (`.active` class)
- ✅ Hover nad miniaturą powinien zmienić kolor na niebieski

---

## Scenariusz 3: Klikanie na miniatury

### Kroki:
1. Miej załadowane dane testowe (Scenariusz 2)
2. Kliknij drugą miniaturę (Małżeństwo)
3. Obserwuj Changes

### Oczekiwane rezultaty:

#### W konsoli:
```
✅ Wybrano akt: act-002
```

#### Na stronie:
- ✅ Druga miniatura jest teraz zaznaczona (niebieska obwódka)
- ✅ Pierwsza miniatura straca zaznaczenie

#### W localStorage (wpisz `testData.log()`):
```javascript
{
  imageActs: [...],
  currentEventId: "act-002",  // ← zmienił się!
  currentTemplate: "chrzest"
}
```

---

## Scenariusz 4: Zmiana szablonu

### Kroki:
1. W toolbar'e zmień select z "Chrzest" na "Małżeństwo"
2. Obserwuj konsolę

### Oczekiwane rezultaty:

#### W konsoli:
```
✅ Zmieniono szablon na: malzenstwo
```

#### Na stronie:
- ✅ Select pokazuje wybraną opcję
- ✅ State zmienił się (możesz sprawdzić lokalStoragiem czy `testData.log()`)

---

## Scenariusz 5: Kliknięcie przycisku Zapisz

### Kroki:
1. Kliknij przycisk "💾 Zapisz" w toolbar'e
2. Obserwuj konsolę

### Oczekiwane rezultaty:

#### W konsoli:
```
Zapisywanie danych...
```

#### localStorage powinien zawierać aktualny stan (sprawdź DevTools → Application → localStorage)

---

## Scenariusz 6: Czyszczenie localStorage

### Kroki:
1. W konsoli wpisz: `testData.clear()`
2. Poczekaj na reload

### Oczekiwane rezultaty:

#### W konsoli:
```
🧹 Wyczyszczono localStorage
```

#### Na stronie:
```
🎬 updateThumbs() – początek, aktów: 0
✅ Thumbs renderowane: 0
```

#### Na stronie:
- ✅ Lewy panel znowu pokazuje "Brak aktów"
- ✅ localStorage jest czysty

---

## Scenariusz 7: Przegląd localStorage

### Kroki:
1. Załaduj dane testowe (Scenariusz 2)
2. W konsoli wpisz: `testData.log()`

### Oczekiwane rezultaty:

#### W konsoli pokaże się struktura:
```javascript
{
  imageActs: [
    {
      id: "act-001",
      type: "chrzest",
      year: 1890,
      nr: 1,
      thumbnail: "data:image/svg+xml...",
      data: { ... }
    },
    // ... reszta aktów
  ],
  currentEventId: "act-001",
  currentTemplate: "chrzest"
}
```

---

## Scenario 8: Network i Performance

### Kroki:
1. DevTools → Network
2. Otwórz index.html
3. Poczekaj na załadowanie

### Oczekiwane rezultaty:

#### Wszystkie pliki powinny mieć status 200 (OK):
- ✅ index.html
- ✅ test-data.js
- ✅ main.js, toolbar.js, thumbs.js, app-state.js
- ✅ Wszystkie CSS
- ✅ Firebase SDK (może być z sieci)

#### Rozmiary:
- ✅ Każdy moduł < 10KB (bez Firebase SDK)
- ✅ CSS łącznie < 50KB

#### Performance:
- ✅ DOMContentLoaded < 1s
- ✅ Load < 2s

---

## Checklist błędów

Jeśli widzisz którekolwiek z poniższych błędów:

### ❌ "Cannot use import statement outside a module"
- **Przyczyna:** Brakuje `type="module"` w script tag'u
- **Rozwiązanie:** Sprawdź HTML – powinna być `<script type="module">`

### ❌ "Failed to fetch ./js/toolbar.js"
- **Przyczyna:** Nie ma serwera lokalnego (otwórz przez `file://` nie działa)
- **Rozwiązanie:** Uruchom serwer lokalny (patrz QUICK_START)

### ❌ "toolbar is not a function"
- **Przyczyna:** Import się nie powiedzie lub moduł nie exportuje funkcji
- **Rozwiązanie:** Sprawdź czy każdy moduł ma `export function renderToolbar() { ... }`

### ❌ "currentEventId is undefined"
- **Przyczyna:** Kliknęłeś na miniaturę zanim się wyrenderowała
- **Rozwiązanie:** Poczekaj aż strona się załaduje, potem załaduj dane (`testData.load()`)

### ❌ Miniatury się renderują ale bez obrazków
- **Przyczyna:** Brakuje atrybutu `alt` lub src wskazuje na nieistniejący plik
- **Rozwiązanie:** test-data.js używa SVG data URLs – powinny działać. Jeśli nie, sprawdź konsolę pod kątem CORS.

### ❌ Styles nie działają (szare/białe tekst)
- **Przyczyna:** CSS nie załadował się lub zmienne CSS nie są zdefiniowane
- **Rozwiązanie:** DevTools → Network → sprawdź czy themes.css się załadował

---

## Raport z testów

Przy każdym teście zapisz:

```markdown
### Test: [nazwa]
- **Data:** 9 stycznia 2026
- **Przeglądarka:** Chrome/Firefox/Edge
- **Status:** ✅ PASS / ⚠️ WARN / ❌ FAIL
- **Konsola:** [wpisz błędy jeśli jakieś są]
- **Obserwacje:** [co działa, co nie]
- **Fix potrzebny:** [jeśli jest problem]
```

---

## Kontakt & Debug

Jeśli coś nie działa:
1. Otwórz DevTools (F12)
2. Przejdź do Console – szukaj czerwonych błędów
3. Jeśli jest błąd – skopiuj go w całości
4. Sprawdź sekcję "Checklist błędów" wyżej
5. Jeśli dalej nie wiesz – zgłoś z:
   - Tekstem błędu z konsoli
   - Screenshotem
   - Wersją przeglądarki

---

**Gotowe do testów:** ✅ 9 stycznia 2026  
**Ostatnia weryfikacja:** Toolbar + Thumbs moduły  
