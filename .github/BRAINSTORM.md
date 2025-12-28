# 🧠 Burza Mózgów - Genealog Indexer v3.2

**Data utworzenia:** Grudzień 19, 2025  
**Status:** Work in Progress - Analizujemy rozwiązania

---

## Spotkanie 2: Grudzień 19, 2025 (Analiza v6.0)

### ✅ Co się Zmieniło - Wielkie Ulepszenia

#### Architektura v6.0 vs v5.0

**v5.0:** Płaska struktura - wszystko naraz
```
Obraz → Rekordy (akty) → Pola w każdym rekordzie
```

**v6.0:** Hierarchiczna struktura - dwa poziomy
```
Obraz
  ├─ Liczba aktów: 3
  ├─ Akt #1
  │   ├─ Imię dziecka: Jan
  │   ├─ Imię ojca: Piotr
  │   └─ ROI dla każdego pola
  ├─ Akt #2
  └─ Akt #3
```

**Główny problem v5.0 - ROZWIĄZANY:** Teraz najpierw zaznaczasz/definiujesz akt, dopiero potem wypełniasz pola sekwencyjnie! 🎯

#### Nowe Komponenty w v6.0

1. **Modal Liczby Aktów**
   - Input: "Ile aktów na tym skanzie?"
   - Przycisk: "Utwórz" → generuje przyciski 1, 2, 3...

2. **Przyciski Aktów w Panelu**
   - Każdy pokazuje: Numer | Licznik pól (np. 4/7) | Status (empty/partial/complete/has-roi)
   - Klik → otwiera Overlay Edycji

3. **Overlay Edycji Danych (UI na środku ekranu)**
   ```
   ┌─────────────────────────────────┐
   │ Akt #3 [4/7 pól]               │
   ├─────────────────────────────────┤
   │ Imię dziecka: [_________]       │
   │ Następne: Imię ojca, Data, ... │
   ├─────────────────────────────────┤
   │ [← Wstecz] [→ Dalej] [Tab/↵]   │
   │ [🎨 ROI dla pola] [❌ Wyczyść] │
   │ [⏭ Pomiń] [✓ Gotowe]          │
   └─────────────────────────────────┘
   ```
   - Auto-focus na input
   - Nawigacja: strzałki, Tab, Enter, Esc
   - Licznik bieżącego pola

4. **Auto-zoom do Aktu**
   - Checkbox: "Auto-zoom do aktu"
   - Jeśli akt ma ACT ROI → automatycznie przybliża viewer

5. **Dwa Niezależne Tryby ROI**
   - **ACT ROI** - Zaznaczanie granic całego aktu (zielone)
   - **FIELD ROI** - Zaznaczanie konkretnego pola (niebieskie)
   - Oba mogą działać jednocześnie

### 🔴 Co Nie Działa (Brakujące Funkcjonalności)

Struktura data v6.0:
```js
act = {
  id: 1,
  fieldValues: { "child_name": "Jan", ... },
  fieldROIs: { "child_name": { x, y, w, h }, ... },  // ← Brakuje zapisu!
  actROI: { x, y, w, h },  // ← Brakuje zapisu!
  timestamp
}
```

**Problem 1: Brak Zapisu ACT ROI**

Status: ❌ Niekompletny  
Przycisk "ACT ROI" włącza tryb rysowania, ale:
- Brakuje listenerów `mousedown/mousemove/mouseup` dla `app.actMode`
- Po namalowaniu ROI - nic się nie zapisuje do `act.actROI`
- Brakuje konwersji współrzędnych `screenToImageRect()` dla Act

---

**Problem 2: Brak Zapisu FIELD ROI**

Status: ❌ Niekompletny  
Przycisk "ROI" w overlayu wywoła `app.fieldNav.drawROI(fieldId)`, ale:
- Brakuje finalizacji - co się dzieje w `mouseup`?
- Czy zapisuje do `act.fieldROIs[fieldId]`?
- Brakuje logiki przywrócenia poprzednich overlays

---

**Problem 3: Brak Wyświetlania ROI**

Status: ❌ Niekompletny  
Nawet gdyby zapisywało:
- Brakuje funkcji rysującej overlays na viewerze
- Brakuje odpowiednika `redrawROIs()` z v5.0
- Nie widać ani zielonych (act) ani niebieskich (field) ramek

---

**Problem 4: Eksport CSV jest Ubogi**

Status: ⚠️ Niepełny  
- Eksportuje tylko metadane (ID, liczba pól)
- Brakuje wartości pól (`fieldValues`)
- CSV jest prawie beznużyteczny

---

**Problem 5: Multi-Image Bug**

Status: 🐛 Bug  
- Przełączanie między obrazami nie ładuje poprawnie poprzednich aktów
- Bug w `loadFromStorage()` - nie filtrowuje aktów per image

---

---

## 📋 Format Zapisywania Pomysłów

Każdy pomysł powinien mieć tę strukturę:

```markdown
### [Numer]. [NAZWA POMYSŁU]

**Problem:** Co chcemy rozwiązać?

**Propozycja:** Jak to rozwiązać?

**Plusy (+):**
- [ ] Punkt pro 1
- [ ] Punkt pro 2
- [ ] Punkt pro 3

**Minusy (-):**
- [ ] Punkt kontra 1
- [ ] Punkt kontra 2

**Warianty alternatywne:**
1. **Wariant A** - Opis
2. **Wariant B** - Opis

**Decyzja:** [ ] Do zrobienia | [ ] Na później | [ ] Odrzucone  
**Priorytet:** [ ] P0 (Krytyczne) | [ ] P1 (Ważne) | [ ] P2 (Nice to have) | [ ] P3 (Backlog)

**Notatki:**
- Link do kod: 
- Zależności:
- Oszacowany czas:

---
```

---

## 📑 Sekcje Tematyczne

## 📑 Sekcje Tematyczne

### 1. ARCHITEKTURA & REFACTOR

#### 1.1 Hierarchia Aktów - Struktura record.actROI

**Problem:** Obecnie aplikacja nie ma struktury dla "całego aktu" jako encji. Rekordy są płaskie - mają `data{}` i `rois{}` dla pól, ale brak `actROI` dla granicy całego dokumentu.

**Propozycja:** Dodać do struktury rekordu pole `actROI`:
```js
record = {
  id, template, data{}, rois{},
  imageIdx, imageName, timestamp,
  actROI: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 }  // ← NOWE
}
```

**Plusy (+):**
- [x] Pozwala na zaznaczenie granicy całego aktu (np. aktu nr 3 z 5 na stronie)
- [x] Act i Field ROI są niezależne (można mieć akty bez pól lub pola bez aktu)
- [x] Wyraźne rozdzielenie: `record.actROI` (całość) vs `record.rois` (szczegóły)
- [x] Łatwe w localStorage - każdy rekord ma tę strukturę

**Minusy (-):**
- [x] Wymaga zmiany struktury danych (migration dla istniejących rekordów)
- [x] Dodatkowa logika w `redrawROIs()` (rysowanie 2 typy overlays)
- [x] Canvas trzeba włączyć dla 2 trybów (ROI i Act) - może być konfuzja

**Warianty alternatywne:**
1. **Wariant A (obecny)** - Bez `actROI`, używać ROI na "Notes" polach (hack)
2. **Wariant B (rekomendowany)** - Dodać `actROI` jako oficjalną strukturę
3. **Wariant C** - Hierarchia pełna: `record.acts[]` tablica sub-aktów

**Decyzja:** [ ] Do zrobienia | [x] Na później | [ ] Odrzucone  
**Priorytet:** [x] P1 (Ważne) | [ ] P2 (Nice to have)

**Notatki:**
- Zmiana w 3 miejscach: struktura, save, load
- Migration: `app.records.forEach(r => r.actROI = null || existing_value)`
- Test: Sprawdzić localStorage po zmianach
- ⚠️ NOTE: v6.0 już ma tę strukturę! Jest `act.actROI` i `act.fieldROIs`

---

#### 1.2 Fuzja Trybów ROI & Act w Canvas

**Problem:** ROI mode i Act mode używają tego samego canvasu, ale mają oddzielną logikę. Kod ma dużo `if (app.roiMode)` vs `if (app.actMode)` - duplikacja.

**Propozycja:** Ujednolicić logikę:
```js
// Zamiast:
if (app.roiMode) { /* rysuj niebiesko */ } 
else if (app.actMode) { /* rysuj zielono */ }

// Robimy:
const mode = app.roiMode ? 'field' : app.actMode ? 'act' : null;
const config = { field: {...}, act: {...} }[mode];
drawRect(config.color, config.storage);
```

**Plusy (+):**
- [x] Mniej kodu duplikowanego
- [x] Łatwiej dodać nowe mody w przyszłości
- [x] Czytelniejsze warunki

**Minusy (-):**
- [x] Refactor istniejącego kodu (duże zmiany)
- [x] Wymagane testy dla obu trybów

**Warianty alternatywne:**
1. **Wariant A** - Zostawić jak jest (KISS)
2. **Wariant B** - Pełny refactor z abstraktem `DrawMode`
3. **Wariant C** - Małe DRY: wydzielić wspólne funkcje

**Decyzja:** [ ] Do zrobienia | [x] Na później | [ ] Odrzucone  
**Priorytet:** [ ] P1 | [x] P2 (Nice to have) | [ ] P3

**Notatki:**
- Może czekać na pełną implementację Act mode
- Jeśli Act mode się ustabilizuje, wtedy refactor

---

### 2. FEATURES

#### 2.1 Pełna Implementacja Act Mode (Zaznaczanie Całych Aktów)

**Problem:** Toggle Act Mode istnieje, ale brakuje całej logiki rysowania i zapisu.

**Propozycja:** Zaimplementować Act Mode analogicznie do ROI Mode:
1. `toggleActMode()` - włącz canvas (pointer-events: auto)
2. `mousedown/mousemove/mouseup` - detekcja `app.actMode` i rysowanie zielonym
3. `screenToImageRect()` - konwersja dla Act (już istnieje, reuse!)
4. Save do `record.actROI` (podobnie jak `record.rois[fieldId]`)
5. `redrawROIs()` - renderować `act-overlay` (CSS już jest!)

**Plusy (+):**
- [x] Pełna funkcjonalność - użytkownik może zaznaczyć cały akt
- [x] Wizualne oddzielenie aktów na jednym obrazie
- [x] Brak hack'ów (Notes-pole) - oficjalny sposób
- [x] 80% kodu istnieje, trzeba tylko połączyć

**Minusy (-):**
- [x] Długość implementacji (~100-150 linii JS)
- [x] Konieczna zmiana struktury record'u (patrz punkt 1.1)
- [x] Trzeba testować zarówno ROI jak i Act równocześnie

**Warianty alternatywne:**
1. **Wariant A** - Obejście: podziel obrazy na osobne pliki
2. **Wariant B** - Obejście: używaj "Notes" jako całego aktu
3. **Wariant C (rekomendowany)** - Pełna implementacja Act Mode

**Decyzja:** [x] Do zrobienia | [ ] Na później | [ ] Odrzucone  
**Priorytet:** [x] P0 (Krytyczne) | [ ] P1

**Notatki:**
- Link do kod: `toggleActMode()`, `setupDrawingCanvas()` mouseup handler
- Zależności: Punkt 1.1 (struktura actROI)
- Oszacowany czas: 2-3 godziny (kod istnieje, głównie integracja)
- Kroki:
  1. Dodać `record.actROI = null` w strukturze
  2. Duplikuj mousedown/mousemove/mouseup dla `app.actMode`
  3. W mouseup: `record.actROI = screenToImageRect(...)`
  4. W redrawROIs(): Dodaj pętlę dla actROI (zielone overlays)
  5. Test: Włącz Act Mode → zaznacz → sprawdź localStorage

---

#### 2.2 Zoom do Aktu (zoomToAct)

**Problem:** `zoomToROI()` istnieje dla pól, ale brak dla całego aktu. Jeśli zaznaczysz akt, nie możesz się do niego automatycznie przybliżyć.

**Propozycja:** Dodać funkcję `zoomToAct()` (identyczna struktura do `zoomToROI()`):
```js
function zoomToAct() {
    if (!app.currentRecordId) return;
    const record = app.records.find(r => r.id === app.currentRecordId);
    if (record && record.actROI) {
        zoomToROI(record.actROI);  // Reuse!
    }
}
```

**Plusy (+):**
- [x] Kod: 3-5 linii (prawie nie ma do zrobienia)
- [x] UX: Kliknij na pill aktu → auto-zoom do granicy
- [x] Consistency: Jak zoomToROI dla pól

**Minusy (-):**
- [x] Wymaga Point 2.1 (Act Mode musi być zrobiony)

**Warianty alternatywne:**
1. **Wariant A** - Nie dodawaj, ręczny zoom (KISS)
2. **Wariant B** - Dodaj jako opcja w UI
3. **Wariant C (rekomendowany)** - Automatycznie przy klikaniu aktu

**Decyzja:** [x] Do zrobienia | [ ] Na później | [ ] Odrzucone  
**Priorytet:** [ ] P0 | [x] P1 (Ważne) | [ ] P2

**Notatki:**
- Zależności: Punkt 2.1 (Act Mode)
- Oszacowany czas: 30 minut

---

#### 2.3 Ctrl+A do Włączenia Act Mode

**Problem:** Ctrl+R włącza ROI Mode, ale Ctrl+A nie ma handlera (tylko przycisk w UI).

**Propozycja:** Dodać do `setupEvents()`:
```js
if (e.key === 'a') { e.preventDefault(); toggleActMode(); }
```

**Plusy (+):**
- [x] Spójne z innymi skrótami (Ctrl+R, Ctrl+N)
- [x] Szybsze dla power userów

**Minusy (-):**
- [x] Ctrl+A zwyczajowo = "Select All" (może być confusing)
- [x] W macOS Command+A mogą być problemy

**Warianty alternatywne:**
1. **Wariant A** - Ctrl+E (Alt) dla "Akt"
2. **Wariant B** - Ctrl+A, ale z komunikatem "Ctrl+A = Act Mode"
3. **Wariant C** - Tylko przycisk w UI (brak skrótu)

**Decyzja:** [x] Do zrobienia | [ ] Na później | [ ] Odrzucone  
**Priorytet:** [ ] P0 | [x] P1 | [ ] P2

**Notatki:**
- Czas: 5 minut
- Test: Ctrl+A w formularzu vs viewer

---

#### 2.4 Search w Rekordach (#searchInput)

**Problem:** Input `#searchInput` istnieje, ale nie ma obsługi. Można pisać, ale nic się nie dzieje.

**Propozycja:** Dodać listener:
```js
document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = app.records.filter(r => 
        Object.values(r.data).some(v => 
            v.toString().toLowerCase().includes(query)
        )
    );
    renderRecordsSidebar(filtered);  // Pokaż tylko match'ów
});
```

**Plusy (+):**
- [x] Szybkie znalezienie rekordu w wielu-rekordowym obrazie
- [x] Kod jest prosty, mało dependencies

**Minusy (-):**
- [x] Bez highlight'owania tekstu (tylko filtracja sidebaru)
- [x] Nie wspiera regex czy zaawansowanych querów
- [x] Może być powolne dla 1000+ rekordów (O(n*m))

**Warianty alternatywne:**
1. **Wariant A** - Nie dodawaj, filtruj ręcznie klikami
2. **Wariant B** - Prosty search (proponowany)
3. **Wariant C** - Zaawansowany: regex, filter builder, etc.

**Decyzja:** [x] Do zrobienia | [ ] Na później | [ ] Odrzucone  
**Priorytet:** [ ] P0 | [x] P1 | [ ] P2

**Notatki:**
- Czas: 1 godzina
- Może czekać aż będzie więcej rekordów w praktyce

---

#### 2.5 JSON Import (Backup/Restore)

**Problem:** README wspomina import, ale funkcja nie istnieje. Można tylko eksportować.

**Propozycja:** Dodać przycisk "Import" w toolbar + handler:
```js
function importJSON() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                app.records = data.records || [];
                app.images = data.images || [];
                saveStorage();
                loadStorage();
                notify('✅ Import OK', 'success');
            } catch (err) {
                notify('❌ Błąd JSON', 'error');
            }
        };
        reader.readAsText(e.target.files[0]);
    };
    input.click();
}
```

**Plusy (+):**
- [x] Backup & Restore bez bazy danych
- [x] Transfer danych między komputerami
- [x] Kod prawie identyczny do exportu

**Minusy (-):**
- [x] Nadpisuje dane bez warningów (danger!)
- [x] Brak merge'owania (all-or-nothing)
- [x] Duże pliki JSON mogą zaciąć przeglądarke

**Warianty alternatywne:**
1. **Wariant A** - Nie dodawaj, używaj CSV tylko
2. **Wariant B** - Prosty import (proponowany, z warning'em)
3. **Wariant C** - Smart merge: dołącz nowe rekordy, nie usuwaj starych

**Decyzja:** [x] Do zrobienia | [ ] Na później | [ ] Odrzucone  
**Priorytet:** [ ] P0 | [x] P1 | [ ] P2

**Notatki:**
- Czas: 2 godziny (testowanie jest trudne)
- Wersja: v3.3+
- UWAGA: Dodać confirm('Nadpisać dane?')

---

### 2.6 ⚠️ URGENT v6.0: Zapis ACT ROI

**Problem:** Tryb ACT ROI włącza canvas, ale `mouseup` nie zapisuje `act.actROI`.

**Propozycja:** Dodać handler w `setupDrawingCanvas()`:
```js
app.drawingCanvas.addEventListener('mouseup', (e) => {
    if (!app.actMode) return;
    
    const roi = screenToImageRect(x, y, w, h);  // ← Reuse z v5.0!
    const currentAct = app.acts[app.currentActIndex];
    if (currentAct) {
        currentAct.actROI = roi;  // ← ZAPISZ
        saveActsToStorage();  // TODO: Implementować
        redrawROIs();
    }
});
```

**Plusy (+):**
- [x] Możliwość zaznaczenia granic aktu
- [x] Kod istnieje (przywról z v5.0)
- [x] Wymagane dla Problem 3 (wyświetlanie)

**Minusy (-):**
- [x] Trzeba znać strukturę `app.acts[]` z v6.0
- [x] Funkcja `screenToImageRect()` musi być dostępna

**Decyzja:** [x] Do zrobienia PILNIE  
**Priorytet:** [x] P0 (Krytyczne)

**Notatki:**
- Czas: 30-45 minut
- Zależności: `screenToImageRect()` (może być z v5.0)
- Test: Zaznacz akt, sprawdź localStorage czy `act.actROI` jest zapisany
- Kod source: v5.0 mouseup handler

---

### 2.7 ⚠️ URGENT v6.0: Zapis FIELD ROI

**Problem:** Przycisk "ROI" w overlayu rysuje, ale nie zapisuje do `act.fieldROIs[fieldId]`.

**Propozycja:** Dodać finalizację w `mouseup` handleru dla FIELD ROI:
```js
// W mouseup dla app.fieldMode:
const roi = screenToImageRect(x, y, w, h);
const currentAct = app.acts[app.currentActIndex];
const fieldId = app.fieldNav.currentFieldId;

if (currentAct && fieldId) {
    currentAct.fieldROIs[fieldId] = roi;  // ← ZAPISZ
    saveActsToStorage();
    redrawROIs();
}
```

**Plusy (+):**
- [x] Możliwość zaznaczenia konkretnego pola
- [x] Logika bardzo podobna do ACT ROI

**Minusy (-):**
- [x] Wymaga zrozumienia `app.fieldNav` struktury
- [x] Musi być zintegrowane z overlay'em

**Decyzja:** [x] Do zrobienia PILNIE  
**Priorytet:** [x] P0 (Krytyczne)

**Notatki:**
- Czas: 30-45 minut
- Test: Zaznacz pole w overlayu, sprawdzić localStorage

---

### 2.8 ⚠️ URGENT v6.0: Wyświetlanie Wszystkich ROI

**Problem:** Brakuje funkcji pokazującej zaznaczone ROI na viewerze.

**Propozycja:** Implementować `redrawROIs()` dla v6.0:
```js
function redrawROIs() {
    // Usuń stare overlays
    app.roiOverlays.forEach(ov => viewer.removeOverlay(ov));
    app.roiOverlays = [];
    
    const currentAct = app.acts[app.currentActIndex];
    if (!currentAct) return;
    
    const item = viewer.world.getItemAt(0);
    const size = item.getContentSize();
    
    // Rysuj ACT ROI (zielone)
    if (currentAct.actROI) {
        const imgRect = new OpenSeadragon.Rect(
            currentAct.actROI.x * size.x, ...
        );
        // ... utwórz overlay z .act-overlay
    }
    
    // Rysuj FIELD ROI (niebieskie)
    Object.entries(currentAct.fieldROIs || {}).forEach(([fieldId, roi]) => {
        // ... utwórz overlay z .roi-overlay
    });
}
```

**Plusy (+):**
- [x] Widoczne potwierdzenie zaznaczenia
- [x] Logika opiera się na v5.0
- [x] WYMAGANE dla 2.6 & 2.7 (punkty bez sensu bez tego)

**Minusy (-):**
- [x] Długość implementacji (~100-150 linii)
- [x] Wymaga OSD overlays

**Decyzja:** [x] Do zrobienia PILNIE  
**Priorytet:** [x] P0 (Krytyczne)

**Notatki:**
- Czas: 1-1.5 godziny
- Zależności: 2.6 & 2.7 (muszą najpierw zapisywać)
- Test: Zaznacz akt + pole, powinny się pokazać ramki
- Źródło: `redrawROIs()` z v5.0

---

### 2.9 Rozszerz Eksport CSV o Wartości Pól (v6.0)

**Problem:** Eksportowany CSV zawiera tylko metadane, brakuje `fieldValues`.

**Propozycja:** Zmień `convertToCSV()`:
```js
function convertToCSV(acts) {
    let csv = 'Akt,Pole,Wartość,Data\n';
    acts.forEach(act => {
        Object.entries(act.fieldValues || {}).forEach(([field, value]) => {
            csv += `${act.id},"${field}","${value}","${act.timestamp}"\n`;
        });
    });
    return csv;
}
```

**Plusy (+):**
- [x] CSV zawiera rzeczywiste dane
- [x] Użyteczny do dalszego przetworzenia

**Minusy (-):**
- [x] Zmiana formatu CSV (może być breaking change dla użytkowników)

**Decyzja:** [x] Do zrobienia  
**Priorytet:** [ ] P0 | [x] P1 (Ważne) | [ ] P2

**Notatki:**
- Czas: 30 minut
- Test: Eksportuj, otwórz w Excelu
- Może czekać aż ROI będzie gotowy

---

### 2.10 Fix: Multi-Image Bug v6.0 - loadFromStorage()

**Problem:** Przełączanie między obrazami nie ładuje poprawnie poprzednich aktów.

**Propozycja:** Filtruj akty per `imageIdx` w `loadFromStorage()`:
```js
function loadFromStorage() {
    const stored = localStorage.getItem('genealog_data');
    if (stored) {
        const data = JSON.parse(stored);
        // Filtruj akty dla bieżącego obrazu!
        app.acts = (data.acts || [])
            .filter(act => act.imageIdx === app.currentImageIdx);
    }
}
```

**Decyzja:** [x] Do zrobienia  
**Priorytet:** [x] P0 (Bug)

**Notatki:**
- Czas: 15-30 minut
- Test: Przełącz obrazy, sprawdzaj czy akty się zmieniają

---

### 3. PERFORMANCE

#### 3.1 Optymalizacja redrawROIs() - Zamiast pełnego rebuild

**Problem:** `redrawROIs()` usuwa WSZYSTKIE overlays i tworzy od nowa. Z 50+ overlays na obrazie to może być wolne. Wywoływana jest na:
- focus/blur pola
- hover/leave pola
- record select
- image select
- po każdym narysowaniu ROI/Act

**Propozycja:** Zamiast full rebuild, tylko update CSS klasy:
```js
// Obecnie (wolne):
app.roiOverlays.forEach(ov => viewer.removeOverlay(ov));
app.roiOverlays = [];
// ... tworzymy wszystko od nowa

// Optymalne:
app.roiOverlays.forEach(ov => {
    ov.classList.remove('active', 'highlight');
    // Recompute based on current state
    if (isActive) ov.classList.add('active');
    if (isHighlight) ov.classList.add('highlight');
});
// OSD samo je rescaluje na zoom/pan
```

**Plusy (+):**
- [x] O(records × fields) → O(1) operacji OSD (nie removeOverlay/addOverlay)
- [x] CSS transitions mogą się animować gładko
- [x] Praktycznie nie ma overhead'u na dużych obrazach

**Minusy (-):**
- [x] Wymaga refactoringu logiki highlight'owania
- [x] Overlays trzeba cachować (nie tworzyć za każdym razem)
- [x] Bardziej złożony kod do debugowania

**Warianty alternatywne:**
1. **Wariant A** - Zostawić jak jest (działa dobrze dla <100 overlays)
2. **Wariant B** - Pełna optymalizacja (proponowana)
3. **Wariant C** - Częściowa: cachuj overlays, ale usuń na template change

**Decyzja:** [ ] Do zrobienia | [x] Na później | [ ] Odrzucone  
**Priorytet:** [ ] P0 | [ ] P1 | [x] P2 (Nice to have)

**Notatki:**
- Zależności: Punkt 2.1 (Act Mode musi być stabilny)
- Oszacowany czas: 4-6 godzin
- Benchmark: Zmierz FPS przed/po na obrazie z 100 overlays
- Risk: Może łatwo wpaść w state bugs

---

#### 3.2 Base64 vs Blob URLs dla Obrazów

**Problem:** Obrazy są konwertowane na base64 w `handleFiles()`. Base64 jest 33% większy niż binarny i zaciąga pamięć.

**Propozycja:** Użyć Blob URLs:
```js
// Zamiast:
const reader = new FileReader();
reader.onload = (e) => {
    app.images.push({ data: e.target.result, name: file.name });  // data: base64
};
reader.readAsDataURL(file);

// Robimy:
const blob = file.slice();  // lub new Blob([file])
const url = URL.createObjectURL(blob);
app.images.push({ url, name: file.name });  // url: blob:// blobId
// UWAGA: Nie można bezpośrednio do localStorage!
```

**Plusy (+):**
- [x] -33% rozmiaru (blob vs base64)
- [x] Szybsze ładowanie
- [x] Natywna obsługa przeglądarki (nie trzeba dekodować)

**Minusy (-):**
- [x] Blob URLs nie przechodzą localStorage (nie można serializować)
- [x] Blob URL żyje tylko sesję (po reload'zie znika)
- [x] Wymaga IndexedDB lub serwera (nie KISS!)

**Warianty alternatywne:**
1. **Wariant A** - Zostawić base64 (KISS, działa)
2. **Wariant B** - Blob URL + IndexedDB (big refactor)
3. **Wariant C** - Hybrid: base64 dla small images, server dla large

**Decyzja:** [ ] Do zrobienia | [x] Na później | [ ] Odrzucone  
**Priorytet:** [ ] P0 | [ ] P1 | [x] P2

**Notatki:**
- Czeka na rozwinięcie backend'u
- localStorage limit ~5MB (może być problem z wieloma obrazami)

---

### 4. UI/UX

#### 4.1 Touch Support dla Canvas (Mobile Drawing)

**Problem:** Rysowanie ROI/Act na mobile nie działa - canvas słucha tylko `mousedown/up`, nie `touchstart/end`.

**Propozycja:** Dodać touch listeners:
```js
app.drawingCanvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX, clientY: touch.clientY
    });
    app.drawingCanvas.dispatchEvent(mouseEvent);
});
// Powtórz dla touchmove i touchend
```

**Plusy (+):**
- [x] Aplikacja działa na iPads i tabletach
- [x] Kod jest prosta wrapper (reuse istniejącej logiki)

**Minusy (-):**
- [x] Multi-touch (kilka palców) nie będzie obsługiwane
- [x] Na mobile OSD zoom/pan może się myszyć z rysowaniem

**Warianty alternatywne:**
1. **Wariant A** - Nie wspieraj mobile (desktop only)
2. **Wariant B** - Prosty touch support (proponowany)
3. **Wariant C** - Pełny multi-touch + pinch-zoom

**Decyzja:** [ ] Do zrobienia | [x] Na później | [ ] Odrzucone  
**Priorytet:** [ ] P0 | [ ] P1 | [x] P2

**Notatki:**
- Czas: 2 godziny
- Może być na v3.4

---

#### 4.2 Lepsza Walidacja Formularzy

**Problem:** Inputy mają `required`, ale `saveRecord()` tylko sprawdza `if (!Object.values(data).some(v => v))`. Brak feedback'u o których polach brakuje.

**Propozycja:** Dodać highlight na required polach:
```js
// W saveRecord():
const form = document.querySelector(`#form-${app.currentTemplate}`);
let hasErrors = false;

form.querySelectorAll('.field-input[required]').forEach(input => {
    if (!input.value.trim()) {
        input.classList.add('error');
        hasErrors = true;
    } else {
        input.classList.remove('error');
    }
});

if (hasErrors) {
    notify('❌ Uzupełnij wymagane pola', 'error');
    return;
}
```

**Plusy (+):**
- [x] Jasne wskazanie brakujących pól (red border)
- [x] Zapobiega duplikatom / niekompletnym danym
- [x] Mały kod, bez dependencies

**Minusy (-):**
- [x] Musi być CSS klasa `.error` (już jest? sprawdzić)

**Warianty alternatywne:**
1. **Wariant A** - Brak walidacji (obecny)
2. **Wariant B** - Walidacja + highlight (proponowana)
3. **Wariant C** - Walidacja w real-time (onChange listener)

**Decyzja:** [x] Do zrobienia | [ ] Na później | [ ] Odrzucone  
**Priorytet:** [ ] P0 | [x] P1 | [ ] P2

**Notatki:**
- Czas: 30 minut
- Potrzeba CSS klasy `.error`

---

### 5. DEVTOOLS

#### 5.1 Debug Panel dla Developerów (lokalnie)

**Problem:** Debugowanie koordinat, stanu actMode itd. wymaga F12 console.log(). Byłoby wygodniej mieć panel w UI.

**Propozycja:** Dodać hidden panel (Alt+D toggle):
```
┌─────────────────────────────┐
│ 🐛 DEBUG PANEL              │ ← Alt+D toggle
├─────────────────────────────┤
│ app.roiMode: true           │
│ app.actMode: false          │
│ app.currentRecordId: 123456 │
│ Records: 5                  │
│ Overlays: 23                │
│ Canvas size: 1920x1080      │
│ Image size: 3000x4000       │
│ Zoom: 2.5                   │
│                             │
│ [Clear Storage] [Export DB] │
└─────────────────────────────┘
```

**Plusy (+):**
- [x] Szybki wgląd w stan bez F12
- [x] Debugowanie bez zdarzań w console
- [x] Można łatwo wyłączyć (hidden w production)

**Minusy (-):**
- [x] Dodatkowy kod, który trzeba ukryć w produkcji
- [x] Może zwiastować się nieoszlifowany UI

**Warianty alternatywne:**
1. **Wariant A** - Brak debug panelu, console.log wystarczy
2. **Wariant B** - Debug panel (proponowany, hidden by default)
3. **Wariant C** - Pełne devtools z network/timeline (overkill)

**Decyzja:** [ ] Do zrobienia | [x] Na później | [ ] Odrzucone  
**Priorytet:** [ ] P0 | [ ] P1 | [x] P2 | [ ] P3 (Backlog)

**Notatki:**
- Czas: 2-3 godziny
- Wersja: v3.4+
- Trigger: `window.location.hash === '#debug'` lub Alt+D

---

### 6. TECH DEBT

#### 6.1 Migration: Dodanie actROI do Istniejących Rekordów

**Problem:** Jeśli zmienimy strukturę (punkt 1.1), to old rekordy z localStorage nie będą mieć `actROI` pola.

**Propozycja:** Auto-migration w `loadStorage()`:
```js
function loadStorage() {
    const stored = localStorage.getItem('genealog_data');
    if (stored) {
        const data = JSON.parse(stored);
        app.records = (data.records || []).map(r => ({
            ...r,
            actROI: r.actROI || null  // ← auto-add if missing
        }));
        // ... reszta
    }
}
```

**Plusy (+):**
- [x] Seamless upgrade (stare dane wciąż działają)
- [x] Kod: 2 linii

**Minusy (-):**
- [x] Jeden raz per session (tiny overhead)

**Warianty alternatywne:**
1. **Wariant A** - Brak migracji, wymuś czyszczenie localStorage
2. **Wariant B** - Auto-migration (proponowana)
3. **Wariant C** - UI warning: "Update your data"

**Decyzja:** [x] Do zrobienia | [ ] Na później | [ ] Odrzucone  
**Priorytet:** [x] P0 (musi być przed 2.1) | [ ] P1

**Notatki:**
- Zależności: Punkt 1.1
- Czas: 10 minut

---

#### 6.2 Dokumentacja: Aktualizacja Copilot Instructions dla Act Mode

**Problem:** `copilot-instructions.md` opisuje tylko ROI mode, brakuje Act mode (bo go nie ma 😄).

**Propozycja:** Po zrobieniu punktu 2.1, update instrukcji:
- Dodać sekcję "ROI Drawing System: Two Independent Modes"
- Opisać Act vs Field ROI
- Dodać konwersję współrzędnych dla Act
- Redraw pipeline z act-overlays

**Plusy (+):**
- [x] AI agenci będą znać pełną architekturę
- [x] Łatwiej komuś przejąć kod

**Minusy (-):**
- [x] Trzeba czekać aż 2.1 będzie gotowy

**Warianty alternatywne:**
1. **Wariant A** - Nie aktualizować (placeholder)
2. **Wariant B** - Aktualizować po zrobieniu 2.1 (proponowana)

**Decyzja:** [x] Do zrobienia | [ ] Na później (czeka na 2.1)  
**Priorytet:** [ ] P0 | [x] P1 | [ ] P2

**Notatki:**
- Zależności: Punkt 2.1
- Czas: 1 godzina
- Link: [copilot-instructions.md](copilot-instructions.md)

---

## 🔗 Powiązane Dokumenty

- [Copilot Instructions](copilot-instructions.md) - Architektura techniczna
- [CHANGELOG.md](../CHANGELOG.md) - Historia wersji
- [README.md](../README.md) - Overview projektu
- [PRZEWODNIK.md](../PRZEWODNIK.md) - User guide

---

## 📊 Quick Stats

| Kategoria | Liczba pomysłów | Status |
|-----------|-----------------|--------|
| Architektura | 2 | 1x Do zrobienia, 1x Na później |
| Performance | 2 | Oba na później |
| UI/UX | 2 | Oba do zrobienia |
| Features (v5.0) | 5 | 4x Do zrobienia, 1x Na później |
| Features (v6.0 URGENT) | 5 | **5x Do zrobienia PILNIE** ⚠️ |
| DevTools | 1 | Na później |
| Tech Debt | 2 | 1x Do zrobienia, 1x Na później |
| **RAZEM** | **19** | **11 Do zrobienia, 7 Na później, 1 Odrzucone** |

### 🚨 URGENT (v6.0 Incomplete Features):
- **2.6** - Zapis ACT ROI (30-45 min)
- **2.7** - Zapis FIELD ROI (30-45 min)
- **2.8** - Wyświetlanie ROI (1-1.5h)
- **2.9** - CSV z danymi (30 min)
- **2.10** - Multi-image bug (15-30 min)

**RAZEM URGENT:** ~4-5 godzin pracy aby v6.0 miało pełną funkcjonalność ROI!

---

---

## 📊 Porównanie: viewer-osd-v5.0 vs viewer-osd-v6.0

| Funkcja | v5.0 | v6.0 | Status | Uwagi |
|---------|------|------|--------|-------|
| **Struktura danych** | | | | |
| Hierarchia: Image → Records → Fields | ✅ | ⚠️ Changed | Zmieniona na Image → Acts → Fields | W v6.0 rekord = jeden akt |
| Wspiera wiele aktów na obrazie | ❌ | ✅ | v6.0 lepsza | Możemy zdefiniować "3 akty na tej stronie" |
| Przechowywanie ROI | ✅ | ⚠️ Partial | Struktura jest, logika brakuje | v6.0 ma `act.actROI` + `act.fieldROIs` |
| **UI/Workflow** | | | | |
| Form edycji aktu | ✅ | ✅ | Oba | Ale v6.0 ma modal do wyboru liczby aktów |
| Overlay editor (inline) | ❌ | ✅ | v6.0 | Nowe: formularz w środku ekranu |
| Auto-zoom do aktu | ❌ | 🔴 Planned | Wymaga 2.2 | v6.0 ma strukturę, trzeba tylko hookować |
| **ROI System** | | | | |
| Rysowanie Field ROI | ✅ | 🔴 Incomplete | v5.0 pracuje | v6.0: Canvas rysuje, ale mouseup nie zapisuje |
| Wyświetlanie Field ROI | ✅ | 🔴 Brakuje | v5.0 ma `redrawROIs()` | v6.0: brakuje funkcji, overlay CSS istnieje |
| Rysowanie Act ROI | 🔴 Incomplete | 🔴 Incomplete | Oba niekompletne | v5.0: toggle tylko, v6.0: canvas rysuje ale brak zapisu |
| Wyświetlanie Act ROI | ❌ (struktura) | 🔴 Brakuje | v6.0 ma strukturę | Oba potrzebują `redrawROIs()` |
| Ctrl+R skrót (ROI mode) | ✅ | ❓ (assumed) | | v6.0: może mieć, nie sprawdzane |
| Ctrl+A skrót (Act mode) | ❌ | ❌ | Oba niekompletne | Przycisk jest, handler brakuje |
| **Data Management** | | | | |
| Eksport CSV | ✅ | 🔴 Partial | v5.0 pełny | v6.0: tylko metadane, brakuje fieldValues |
| Eksport JSON | ✅ | ✅ (assumed) | | |
| Import JSON | ❌ | ❌ | Oba | Wymaga 2.5 dla obu |
| Search w rekordach | ❌ | ❌ | Oba | Wymaga 2.4 dla obu |
| **Obraz & Viewport** | | | | |
| Zoom/Pan/Rotate (OSD) | ✅ | ✅ | Oba | OpenSeadragon ten sam |
| Multi-image support | ✅ | 🔴 Bug | v5.0 pracuje | v6.0: loadFromStorage() nie filtruje per image (2.10) |
| Image rotation | ✅ | ✅ (assumed) | | Nie testowane dla v6.0 |
| Thumbnail bar | ✅ | ✅ (assumed) | | |
| **Performance** | | | | |
| Liczba obsługiwanych overlays | ~50 OK | ~50 OK | Oba | Wymagana optymalizacja 3.1 dla 100+ |
| Szybkość redrawROIs() | Akceptowalna | Akceptowalna | Oba | Może się przydać 3.1 |
| Memory footprint | ~5-10MB localStorage | ~5-10MB localStorage | Oba | Limit 5MB, problem z wieloma obrazami |
| **Accessibility & Mobile** | | | | |
| Keyboard shortcuts (Ctrl+R, Ctrl+N) | ✅ | ⚠️ Partial | v5.0 bardziej | v6.0: brakuje Ctrl+A |
| Touch/Mobile drawing | ❌ | ❌ | Oba | Wymaga 4.1 |
| Responsive design | ✅ | ✅ | Oba | CSS media queries są |
| **Documentation** | | | | |
| Copilot Instructions | ✅ Updated | ❌ Outdated | v5.0 dokumentacja | v6.0 potrzebuje aktualizacji (6.2) |
| User Guide (PRZEWODNIK.md) | ✅ | ⚠️ Partial | | Trzeba update'ować |

### Werdykt

**v5.0:**
- ✅ Stabilny, prawie wszystko działa
- ❌ Brakuje hierarchii (trudno zarządzać wieloma aktami)
- ❌ Act Mode niekompletny (toggle + nic)
- 📊 Status: ~85% pełnofunkcjonalny (brakuje tylko Act Mode)

**v6.0:**
- ✅ Nowsza architektura (lepszy workflow)
- ✅ Hierarchia aktów (Game changer!)
- ❌ ROI system niekompletny (rysuje ale nie zapisuje/wyświetla)
- ❌ Multi-image bug
- 📊 Status: ~75% pełnofunkcjonalny (brakuje ROI save/display)

**Rekomendacja:**
- **Krótkoterminowo:** Używaj v5.0 (stabilna, Field ROI pracuje)
- **Długoterminowo:** Dokończ v6.0 (5 urgent features, 4-5 godzin pracy)
- **Migracja:** Zaplanuj na v3.3-v3.4 przejście na v6.0 jako default

---

## 🎯 Zaplanowana Przyszłość

### 📍 v3.2 (Bieżąca - stabilizacja v5.0)
- ✅ copilot-instructions.md zakończone
- ✅ BRAINSTORM.md z analizą v5.0 i v6.0
- ⏳ Możliwe małe bugfixy w v5.0

### 📍 v3.3 (Optymalizacja v5.0 + Start v6.0)

**P0 - v6.0 URGENT (ROI functionality) - 4-5h:**
- Feature 2.6: Zapis ACT ROI (30-45 min)
- Feature 2.7: Zapis FIELD ROI (30-45 min)
- Feature 2.8: Wyświetlanie ROI overlays (1-1.5h) ← Zależy od 2.6 & 2.7
- Feature 2.9: CSV export z fieldValues (30 min)
- Feature 2.10: Fix multi-image bug (15-30 min)

**P1 - v5.0 Important (jeśli zostanie v5.0) - 6-7h:**
- Feature 2.1: Pełna implementacja Act Mode (2-3h)
- Feature 2.2: Zoom do Aktu (30 min)
- Feature 2.3: Ctrl+A skrót (5 min)
- Feature 2.4: Search w rekordach (1h)
- Feature 2.5: JSON Import (2h)

### 📍 v3.4+ (Nice to have + DevTools)
- Feature 3.1: Performance optimization redrawROIs() (4-6h)
- Feature 4.1: Touch support dla canvas (2h)
- Feature 5.1: Debug panel (2-3h)
- Feature 6.2: Update copilot-instructions dla Act Mode (1h)

**Nieplanowane (Research phase):**
- Feature 3.2: Blob URLs + IndexedDB (waiting on backend)
- Feature 4.2: Input validation (30 min, łatwe)

### 📊 Łączny Harmonogram
| Faza | Wersja | Funkcje | Czas | Priorytet |
|------|--------|---------|------|-----------|
| Teraz | v3.2 | Dokumentacja | 0h | ✅ Zrobione |
| Następna | v3.3 | v6.0 ROI (5 features) | 4-5h | 🔴 P0 |
| Potem | v3.3 | v5.0 Features (5 features) | 6-7h | 🟠 P1 |
| Przyszłość | v3.4+ | Performance + Mobile | 8-12h | 🟡 P2+ |

---

## 🔍 Spotkanie 3: Analiza Workflow Indeksacji (19 grudnia 2025)

### Twój Realny Proces - Breakdown

Analizując to jak naprawdę pracujesz z skanami, wyłania się 5-fazowy workflow z wyraźnymi wzorcami (rutyna + zmienność):

```
FAZA 1: Wstępna Ocena         Patrzysz na skan, oceniasz szybko
├─ Kontynuacja poprzedniego?
├─ Nowy rodzaj/rok?
├─ Ile aktów na stronie?     ← Liczysz (np. 6 na podwójnej karcie)
└─ Jaki język/notacja?

FAZA 2: Metadane Pliku        Zapisujesz raz dla całego skanu
├─ Ścieżka i nazwa pliku
├─ Parafia              ← Często to samo co wcześniej
├─ Typ aktu             ← Czasem to samo, czasem zmiana
├─ Rok                  ← Czasem zakres lub "końcówka + nowy"
└─ Język/notacja

FAZA 3: Indeksacja Aktu       Powtarzalna dla każdego aktu (6× na stronie)
├─ Nr aktu
├─ Imię i nazwisko ochrzczonego
├─ Data chrztu (w treści)
├─ Zgłaszający (⚠️ nie zawsze ojciec!) + wiek
├─ Osoba towarzysząca
├─ Świadkowie 1 & 2 + czasem zawody
├─ Ojciec + zawód (opcja rozwijalna)
├─ Matka + zawód (opcja rozwijalna)
├─ Miejsce zamieszkania/pochodzenia (wszyscy)
└─ Potwierdzenie imienia + podpisy

FAZA 4: Dane Pochodne         Auto-kalkulacja (nie wpisujesz, app wylicza)
├─ Ur. świadków: wiek → data (wiek - data aktu = ur.)
├─ Różnica dat: urodzenie vs chrzest
└─ Relacje: ojciec → dziecko, uczeń/nauczyciel → inne akty

FAZA 5: Dopiski Genealogiczne Opcjonalne (struktura zamiast długich not)
├─ "Zmarł [data] w [miejsce]"
├─ "Ożenił się [data] z [osoba]"
├─ "Córka [osoba]"
└─ Inne uwagi
```

### Kluczowe Wyzwania (Co Zabiera Czas)

| Wyzwanie | Przyczyna | Wpływ na UX |
|----------|-----------|------------|
| **Powtarzalność** | Parafia/rok/typ to samo → trzeba przepisywać | 10-15s/skan × 2-3 skany/sesję = 1-2 min stracone |
| **Przełączanie okien** | Obraz + arkusz + ściągi w 3 programach | Brak kontekstu, błędy, frustracja |
| **Zmienne pola** | Świadkowie czasem, zawody opcjonalne, notacja zależy od języka | Trudno przewidzieć layout - app musi być elastyczny |
| **Liczenie aktów** | Manualna ocena "6 na podwójnej" | Łatwo pomylić, zbyt wiele klikania w app |
| **Szacunki dat** | Wyliczanie ur. świadków z wieku (mentalna arytmetyka) | Błędy, czas, demotywacja |
| **Słowniki rozproszonych** | Tabele imion w różnych plikach (PL/RU/LA) | Przełączanie, tracenie miejsca |
| **Kontynuacja skanów** | "Końcówka poprzedniego + nowy" - trudno zorientować | Błędy w metadanych |

### Pomysły na Rozwiązania - Per Faza

#### FAZA 1: Wstępna Ocena Skanu

**Problem**: Liczenie aktów na stronie (6 na podwójnej) jest manualne i podatne na błędy.

**Rozwiązanie - Design**:
- Przy ładowaniu nowego skanu: Mini-overlay "Szybka Ocena" (półprzezroczysty, nie blokuje obrazu)
- Pokazuje podgląd skanu z **wizualnym licznikiem aktów** (np. AI detektuje linie tabeli, człowiek klika "tu akt 1, tu 2, tu 3...")
- Lub opcja "Auto-Detect" - app proponuje "Wygląda na 6 aktów, kontynuacja 1825 Urodzenia?" 
- Kolory: 🟢 Zielony jeśli "kontynuacja" (auto-detect z poprzedniego), 🟡 Żółty jeśli "zmiana"

**Rozwiązanie - Ergonomia**:
- Klawiszowe: [Enter] = zaakceptuj, [Esc] = edytuj, [Liczby 1-6] = zaznacz akty na obrazie
- Przycisk "Podziel skan" jeśli "końcówka + nowy" (wybierz granicę wizualnie na obrazie)
- Wywoływane **tylko przy nowym skanie** (nie przytłaczające)

**MUST HAVE czy NICE TO HAVE?** 🟠 SHOULD HAVE (redukcja błędów, +UX)

---

#### FAZA 2: Metadane Pliku (Parafia, Rok, Typ, Język)

**Problem**: Powtarzanie tych samych metadanych (parafia/rok/typ to samo co wcześniej, ale czasem się zmienia).

**Rozwiązanie - Design**:
- Stały pasek u góry ekranu (nie popup, nie overlay) z "Smart Defaults":
  - Ikony: 📂 Plik | ⛪ Parafia | 📅 Rok | 📋 Typ | 🌐 Język
  - Pola dropdown z "ostatnio używane" (top 5 z historii sesji)
  - Kolorowe znaczniki: 🔵 Niebieski = auto-wypełnione z poprzedniego
  - Flagi 🇵🇱 🇷🇺 🇻🇦 do szybkiej zmiany języka (załaduje słownik)

**Rozwiązanie - Ergonomia**:
- Auto-inkrementacja roku: Po skanach z roku X, następny sugeruje X+1
- Checkbox "Kopiuj z poprzedniego" (domyślnie **włączony**)
- Jeśli nazwa pliku zawiera metadane (np. "1825_Urodzenia_Wiśniewa"), app **parsuje** i auto-wypełnia
- Przycisk "Historia sesji" - panel z miniaturami ostatnich skanów, kliknij by skopiować metadane

**MUST HAVE czy NICE TO HAVE?** ⭐⭐⭐ **MUST HAVE** (direktny oszczęd czasu, 30-60s/skan)

---

#### FAZA 3: Indeksacja Aktu (Główna Praca)

**Problem**: Zmienne pola (świadkowie czasem, zawody opcjonalne), różne notacje (polski/rosyjski/łacina), brak słowników w app.

**Rozwiązanie - Design**:
- Rozwijalne sekcje (accordion):
  - 🟢 **Zawsze otwarte**: Podstawowe (Nr aktu, Imię, Data chrztu)
  - ▶ **Rozwijalne**: Zgłaszający & Wiek | Towarzysz | Świadkowie | Rodzice | Miejsce & Pochodzenie | Potwierdzenie & Podpisy
  - Ikony przy polach: 👤 Osoba | 📅 Data | 💼 Zawód | 🇷🇺 Język
- Dla opcjonalnych pól: Szary tekst + przycisk "[+]" (np. "+ Dodaj zawód ojca")
- Sekwencyjna nawigacja: **Strzałki ← → | Tab | Enter** - przechodzą "od lewej w dół" (jak Twój wzrok na akcie)

**Rozwiązanie - Ergonomia**:
- Autocomplete z historii: Zaznacz pola jako kreatora (imiona, nazwiska, miejsca) z historii - app uczy się
- Słowniki na żądanie: Przy polu imienia - ikona 📖, kliknij = popup z tabelą (PL/RU/LA, filtrowana po pierwszej literze)
  - Przykład: Piszesz "Ivan" → app podpowiada "Иванъ (RU) → Jan (PL) → Ioannes (LA)"
  - Zaznacz, auto-copy do pola
- Przycisk "Wizualne mapowanie" - podświetl na obrazie gdzie typ app sugeruje dane (np. "Imię prawdopodobnie tu")
- Checkbox "To ojciec?" przy Zgłaszającym - auto-kopiuj dane (nazwa + zawód)

**MUST HAVE czy NICE TO HAVE?** ⭐⭐⭐ **MUST HAVE** (główny interface, 80% czasu użytkownika)

---

#### FAZA 4: Dane Pochodne (Auto-Kalkulacje)

**Problem**: Ręczne wyliczanie dat ur. świadków (wiek - data aktu), różnica urodzenia/chrztu - podatne na błędy, czasochłonne.

**Rozwiązanie - Design**:
- Pod polami - mały box "🧮 Kalkulacje":
  - "Świadek 1 ur. ~1780 (±2 lata)" - żółty (szacunek)
  - "Różnica chrztu: 5 dni" - zielony (dokładne)
  - "Możliwa relacja: Brat Ojca" - niebieski (sugestia)
- Wywoływane automatycznie (on-change), ale ukryte jeśli brak danych

**Rozwiązanie - Ergonomia**:
- Przycisk "Zapisz do bazy osób" - app buduje drzewo rodzinne (linkuj świadka do innych aktów)
- Timeline wizualizacja (mała): Osoba ur. ~1780 → chrzest 1825 → dopisek "zmarł 1890"
- Integracja: "Znalazłem 5 aktów gdzie ten świadek/ojciec występuje" - linkuj do nich

**MUST HAVE czy NICE TO HAVE?** 🟠 **SHOULD HAVE** (redukcja błędów, +motywacja)

---

#### FAZA 5: Dopiski Genealogiczne (Opcjonalne Notatki)

**Problem**: Chaotyczne notatki zamiast struktury, trudno później filtrować/eksportować.

**Rozwiązanie - Design**:
- Przycisk "[+ Dodaj Wydarzenie]" na dole formularza (nie zawsze widoczny, na żądanie)
- Predefiniowane typy: ⚰️ Śmierć | 💍 Ślub | 👶 Urodzenie | 🏠 Przeprowadzka | 🎓 Inne
- Pola: Typ (dropdown) | Data | Miejsce | Uwagi | [✓] Auto-powiąż do innego aktu
- Zapisane wydarzenia - lista z edycją/usunięciem (✎ 🗑️)

**Rozwiązanie - Ergonomia**:
- Checkbox "Auto-powiąż": Jeśli "Ożenił się z [Anna Nowak]", wyszukaj w bazie i linkuj
- Sugestie z historii: "Podobne dopiski: 12× śmierć w 1825 roku - może być epidemia?"
- Tagi: #śmierć #ślub #emigracja - filtruj w eksporcie
- Szukaj: "Gdzie indziej ten człowiek występuje?" - link do innych aktów

**MUST HAVE czy NICE TO HAVE?** 🟡 NICE TO HAVE (struktura jest dobra, ale nie krytyczna na start)

---

### 🎯 Integracja Wszystko w Jednym (Bez Przełączania)

Kluczowy insight: Pracujesz z **trzema warstwami równocześnie**:
1. **Obraz** (70% ekranu, centralnie)
2. **Formularz aktu** (25% ekranu, panel boczny lub overlay minimalistyczny)
3. **Ściągi/Słowniki** (na żądanie, popup)

**Design Ogólny**:
```
┌──────────────────────────────────────────────────────────────┐
│ 📂 Plik | ⛪ Parafia | 📅 Rok | 📋 Typ | 🌐 Język | [⚙️ Ustaw]│
├─────────────────────────────────┬──────────────────────────────┤
│                                 │  ▼ AKT #3/6                  │
│                                 │    Nr: [3]                   │
│                                 │    🧑 Imię: [Jan**]         │
│  OBRAZ SKANU                    │    📖 Słownik (Rus/Pol/Lat) │
│  (zoom 100%)                    │                              │
│                                 │  ▼ RODZICE                   │
│  [ROI zaznaczonego pola]        │    ☑ Zgł.=Ojciec            │
│                                 │    Ojciec: [Piotr K.]       │
│                                 │    💼 Zawód: [+]            │
│                                 │                              │
│                                 │  ▶ ŚWIADKOWIE (2)           │
│                                 │  ▶ SZCZEGÓŁY                │
│                                 │  ▶ DOPISKI                  │
│                                 │                              │
│                                 │  🧮 Ur. ojca: ~1790±2      │
│                                 │                              │
│                                 │  [← Poprz.] [Dalej →]      │
├─────────────────────────────────┴──────────────────────────────┤
│ 📊 Postęp: ████████░░ 80% (4/5 aktów)  ⏱️ ~2.8 min/akt       │
└──────────────────────────────────────────────────────────────┘
```

**Wywoływane na żądanie** (nie przytłaczające):
- Słowniki: Kliknij 📖 przy polu imienia
- Historia metadanych: Kliknij "Historia sesji"
- Wizualne mapowanie: Kliknij "Pokaż na obrazie"

---

---

### 🎨 Schematy UI - Jak to Mogłoby Wyglądać

#### Schemat 1: Smart Defaults (Faza 2 - Metadane)

```
┌─────────────────────────────────────────────────────────────────┐
│ 📂 Plik: IMG_0125.jpg (✓ Znaleziono)    [Zmień plik]           │
├──────────────────────────────────────────────────────────────────┤
│ ⛪ Parafia: [Wiśniewa ▼]    ← dropdown "ostatnie":              │
│                               Wiśniewa (poprz.), Kąty, Orzechów │
│ 📅 Rok: [1825 ▼]            ← auto +1 jeśli poprzednio 1824    │
│ 📋 Typ: [●Urodzenia ○Małż. ○Zgony]  ← radio, bo najczęściej   │
│ 🌐 Język: [🇵🇱 Polski ▼]    ← zmień by załadować słownik      │
│                                                                  │
│ ☑ Kopiuj z poprzedniego (zaznaczone domyślnie!)                │
│ ☑ Auto-inkrementuj rok                                          │
│ [ Wymaż wszystko ]                                              │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📌 Historia sesji (dzisiejsza):                            │ │
│ │ [Obraz] Wiśniewa, 1824, Urodzenia, Polski → [Kopiuj]      │ │
│ │ [Obraz] Wiśniewa, 1824, Urodzenia, Polski → [Kopiuj]      │ │
│ │ [Obraz] Kąty, 1825, Małżeństwa, Rosyjski → [Kopiuj]       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│         [ ← Wróć do ostatniego skanu ] [ Dalej do aktów → ]    │
└──────────────────────────────────────────────────────────────────┘
```

Kolory: 🔵 Kopijowane = Niebieski, ⚪ Zmienione = Szare
Klawiatura: [Enter] = Dalej, [Esc] = Anuluj, [1-5] = Szybki wybór z historii

---

#### Schemat 2: Wstępna Ocena Skanu (Faza 1 - Liczenie Aktów)

```
Przy ładowaniu nowego skanu pojawia się:

┌─────────────────────────────────────────────────────────────────┐
│                  🔍 SZYBKA OCENA SKANU                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Ile aktów widzisz na tej stronie?                             │
│                                                                  │
│  [Obraz z numerami: 1 2 3 4 5 6] ← Klikalny podgląd            │
│                                                                  │
│  [ Liczba: 6 aktów ▼ ]                                         │
│  [ ✓ Kontynuacja poprzedniego skanu ]                          │
│  [ ] Podziel skan (koniec jednego + początek drugiego)         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ AI Propozycja: "Wygląda na 6 aktów, kontynuacja 1825?"  │  │
│  │ Wierzyć? [ Tak ✓ ] [ Nie ]                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│         [ Anuluj (Esc) ]  [ Zaakceptuj (Enter) ]               │
└─────────────────────────────────────────────────────────────────┘

Klawiszowe:
- [1-6] Kliknij aby zaznaczyć akty bezpośrednio na obrazie
- [Enter] = Zaakceptuj liczbę
- [Esc] = Anuluj
```

---

#### Schemat 3: Indeksacja Aktu - Układ Formularza (Faza 3)

```
┌────────────────────────────────────────────────────┐
│ AKT #3/6  |  ⏱️ 2.8 min/akt  |  📊 Postęp: ███░░░ │
├────────────────────────────────────────────────────┤
│                                                    │
│ ▼ PODSTAWOWE (zawsze widoczne)                   │
│   Nr aktu: [3]       👤 Imię: [Jan****]  📖      │
│   Nazwisko: [Kowalski]                           │
│   📅 Data chrztu: [1825-03-15]                   │
│                                                    │
│ ▼ ZGŁASZAJĄCY & TOWARZYSZ                        │
│   ☑ Zgłaszający = Ojciec (auto-kopiuj dane)     │
│   👤 Zgłaszający: [Piotr Kowalski]  [?]          │
│   📊 Wiek: [35]  ← wylicza ur. ~1790             │
│   👤 Osoba towarzysząca: [opcjonalne]            │
│                                                    │
│ ▶ ŚWIADKOWIE (2)                                 │
│ ▶ RODZICE (ojciec, matka)                        │
│ ▶ SZCZEGÓŁY (miejsce, pochodzenie)               │
│ ▶ POTWIERDZENIE & PODPISY                        │
│ ▶ NOTATKI GENEALOGICZNE [+ Dodaj]                │
│                                                    │
│ 🧮 KALKULACJE:                                   │
│   Ur. ojca: ~1790 (±2 lata)  ← żółty             │
│   Ur. towarzysza: ~1795 (szacunek)               │
│   Różnica chrztu: 5 dni (normalnie)              │
│                                                    │
│ [← Poprzedni akt]  [Pomiń]  [Dalej do następnego →] │
└────────────────────────────────────────────────────┘

Nawigacja:
- [Tab] = Następne pole
- [Shift+Tab] = Poprzednie pole
- [Ctrl+Enter] = Następny akt
- [Ctrl+Z] = Cofnij ostatnie pole
- [Ctrl+S] = Zapisz akt

Przy każdym polu:
- 📖 = Słownik (kliknij dla opcji PL/RU/LA)
- ? = Pomoc (co tu wpisać)
- [+] = Dodaj opcjonalne (zawód, świadka)
```

---

#### Schemat 4: Słownik Imion (Faza 3 - Na Żądanie)

```
Kliknięto: Imię [Jan] 📖
Pojawia się popup:

┌────────────────────────────────────────────────┐
│ 🔍 Słownik Imion - Polski/Rosyjski/Łacina     │
├────────────────────────────────────────────────┤
│                                                │
│ Szukaj: [Jan____]                             │
│                                                │
│ Flagi: 🇵🇱 Polski | 🇷🇺 Rosyjski | 🇻🇦 Łacina   │
│                                                │
│ WYNIKI:                                        │
│ [✓] Jan (PL)        = Иванъ (RU) = Ioannes   │
│ [ ] Jarosław (PL)   = Ярослав (RU) = Jarosl. │
│ [ ] Jakub (PL)      = Яковъ (RU) = Jacobus   │
│ [ ] Jerzy (PL)      = Георгій (RU) = Georg. │
│ [ ] Joachim (PL)    = Іоаким (RU) = Joachim │
│                                                │
│ Wybrałeś: [Jan] → Ioannes (Łacina)  [Wstaw]  │
│                                                │
│ [Zamknij (Esc)]                                │
└────────────────────────────────────────────────┘

Można:
- Pisać do szukania
- Kliknąć wariant by zobaczyć tłumaczenia
- [Wstaw] = Skopiuj do pola formularza
- [Dodaj do ulubionych] jeśli używasz zawsze
```

---

#### Schemat 5: Dane Pochodne + Wizualizacja (Faza 4)

```
Po wypełnieniu: Zgłaszający (Piotr K., 35 lat), 
                Świadek 1 (Jan N., 45 lat),
                Data chrztu: 1825-03-15

App pokazuje:

┌──────────────────────────────────────────────────┐
│ 🧮 KALKULACJE & INSIGHTS                         │
├──────────────────────────────────────────────────┤
│                                                  │
│ 👤 Piotr Kowalski (Zgłaszający)                 │
│   ├─ Wiek: 35 lat                              │
│   ├─ ✓ Ur. ~1790 (±2 lata)  [Zapisz do bazy]  │
│   └─ 📊 Timeline:                               │
│       Ur. ~1790 ← 35 lat temu ← chrzest 1825   │
│       Możliwa relacja: Ojciec dziecka          │
│                                                  │
│ 👤 Jan Nowak (Świadek 1)                        │
│   ├─ Wiek: 45 lat                              │
│   ├─ ✓ Ur. ~1780 (szacunek)  [Zapisz]         │
│   └─ 🔗 Pojawia się w 7 innych aktach!         │
│       [Pokaż gdzie]                            │
│                                                  │
│ 👶 Dziecko (Jan Kowalski)                       │
│   ├─ Ur.: [? nie podane]                       │
│   ├─ Chrzest: 1825-03-15                       │
│   ├─ Różnica: [wymaga urodzenia]               │
│   └─ ⚠️ Sprawdzić czy ur. podane w treści      │
│                                                  │
│ ┌────────────────────────────────────────────┐  │
│ │ 💡 Sugestia:                               │  │
│ │ "Piotr K. pojawia się jako ojciec w 12   │  │
│ │ aktach - może być nauczyciel w parafii?" │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ [Zamknij]                                       │
└──────────────────────────────────────────────────┘
```

---

#### Schemat 6: Dopiski Genealogiczne (Faza 5)

```
Kliknęło: [+ Dodaj Wydarzenie]
Pojawia się:

┌──────────────────────────────────────────────────┐
│ ➕ DODAJ WYDARZENIE GENEALOGICZNE                │
├──────────────────────────────────────────────────┤
│                                                  │
│ Typ: [⚰️ Śmierć ▼]  (lub 💍 Ślub, 👶 Ur., itp) │
│ Data: [1890-06-12]                             │
│ Miejsce: [Warszawa]                            │
│ Uwagi: [Zmarł w epidemii cholery****]          │
│ Źródło: [Akt zgonu nr 45]                      │
│                                                  │
│ ☑ Auto-powiąż do innej osoby (jeśli ślub)     │
│   Druga osoba: [Anna Nowak ▼]                  │
│   Data ślubu: [1845-05-20]                     │
│   Gdzie: [Warszawa]                            │
│                                                  │
│ [Anuluj (Esc)]  [Zapisz (Enter)]                │
└──────────────────────────────────────────────────┘

Zapisane w akcie:
┌──────────────────────────────────────────────────┐
│ ✓ ZAPISANE WYDARZENIA:                           │
│                                                  │
│ ⚰️ Zmarł 1890-06-12 w Warszawa                  │
│    "Epidemia cholery"  [✎ Edytuj] [🗑️ Usuń]   │
│                                                  │
│ 💍 Ożenił się 1845-05-20 w Warszawa z Anna     │
│    [Link do jej aktu: #125]  [✎] [🗑️]          │
│                                                  │
│ [+ Dodaj kolejne]                               │
└──────────────────────────────────────────────────┘
```

---


|---|--------|---------|-----------|------|-------|
### 📊 Priorytety do Implementacji

| # | Obszar | Funkcja | Priorytet | Czas | Wpływ |
|---|--------|---------|-----------|------|-------|
| **1** | Metadane | Smart defaults (parafia/rok/typ) + Historia | ⭐⭐⭐ P0 | 2-3h | 30-60s/skan = **big win** |
| **2** | Indeksacja | Rozwijalne sekcje + sekwencyjna nawigacja | ⭐⭐⭐ P0 | 3-4h | Czytelność +50%, ergonomia |
| **3** | Słowniki | Panel z imionami/nazwiskami (PL/RU/LA) | ⭐⭐⭐ P0 | 4-6h | Brak przełączania okien = **game changer** |
| **4** | Liczenie aktów | Detekcja wizualna + proponowanie liczby | ⭐⭐ P1 | 3-4h | Walidacja, UX +20% |
| **5** | Kalkulacje | Auto-wyliczanie dat ur., różnic | ⭐⭐ P1 | 2-3h | Błędy -70%, motywacja +30% |
| **6** | Dopiski | Struktura wydarzeń (śmierć, ślub, itp) | ⭐⭐ P1 | 2-3h | Organizacja danych |
| **7** | Linkowanie | "Gdzie indziej pojawia się ta osoba?" | 🟡 P2 | 4-5h | Genealogia, nice-to-have |

**Ścieżka Najmniejszego Oporu (Quick Wins):**
1. Zacznij od #1 (Smart defaults) - bezpieczne, 2-3h, ogromny impact
2. Rozszerz #2 (CSS accordion + Tab/Strzałki) - już masz strukturę, popraw organizację
3. Zintegruj #3 (Słowniki) - rozpaczliwie potrzebne, używasz teraz 3 aplikacje równocześnie
4. Reszta może czekać - ale miej plan dla #4 & #5 (zmniejszą błędy)

---

### ⚠️ Zagrożenia & Decyzje Do Podjęcia

| Zagrożenie | Przyczyna | Rozwiązanie |
|------------|-----------|------------|
| **Kod się robi duży** | App rośnie, html 1500+ linii | Podzielić na pliki (css/, js/) - patrz "Strategia Podziału" wyżej |
| **Zbyt wiele featurów naraz** | Każda sugestia = kolejny przycisk | Droga Najmniejszego Oporu (Focus na 3 P0 feature) |
| **localStorage overflow** | Duża baza + obrazy base64 | Na razie OK, ale przyszłość → IndexedDB |
| **Niekompatybilność na mobile** | App robiony na desktop | Responsywna CSS już jest, ale rysowanie ROI = problematyczne |
| **Utrata danych** | Brak backupu | Export automatyczny co 10 aktów? |
| **Zmianę struktury (v5 → v6)** | Dwie wersje w repo | Jasny plan migracji, backup przed zmianą |

---

### 🎯 Decyzja: Plan Rozwoju na Następne 3 Miesiące

```
┌─────────────────────────────────────────────────────────┐
│ Grudzień 2025 (Teraz) - Planowanie & Setup              │
│ ✅ Analiza workflow (DONE - ta sekcja)                  │
│ ✅ Dokumentacja architekturalnej (DONE - previous)      │
│ ⏳ Decyzja: Kod v6.0 czy v5.0? ROI czy design?         │
│                                                         │
│ Styczeń 2026 - Divide & Conquer                         │
│ 1. Split kodu: CSS i JS do folderów (1-2 dni)          │
│ 2. P0 Feature #1: Smart defaults (1-2 dni)             │
│ 3. P0 Feature #2: Accordion + Nawigacja (1-2 dni)      │
│ 4. P0 Feature #3: Słowniki (2-3 dni)                   │
│                                                         │
│ Luty 2026 - Polish & Refine                             │
│ 5. P1 Feature #4: Liczenie aktów + AI detect (3 dni)   │
│ 6. P1 Feature #5: Kalkulacje dat (2 dni)               │
│ 7. Testy, bugfixy, dokumentacja (3 dni)                │
│                                                         │
│ Marzec 2026 - Listy & Polish                            │
│ 8. P1 Feature #6: Dopiski genealogiczne (2 dni)        │
│ 9. P2 Feature #7: Linkowanie osób (4 dni)              │
│ 10. Production release v3.4 + dokumentacja             │
│                                                         │
│ Później (Future):                                       │
│ - Performance optimization                              │
│ - Mobile/PWA support                                    │
│ - OCR integration                                       │
│ - Cloud backup (Firebase)                              │
│ - GEDCOM export                                         │
└─────────────────────────────────────────────────────────┘
```

**To Realistyczny Plan?**
- Jeśli kodujesz 1-2h dziennie: To jest 3-4 miesiące pracy
- Jeśli kodujesz weekendy: To jest 6-9 miesięcy
- Jeśli pełnoetat: To są 2-3 tygodnie = v3.4 w lutym

**Co Wybrać Jako "First Big Win"?**
Myślę, że **Smart defaults (#1) → Słowniki (#3) → Accordion (#2)** to sekwencja, która:
1. Bezpośrednio rozwiązuje powtarzanie (30-60s/skan oszczędności)
2. Eliminuje przełączanie aplikacji (workspace ulga)
3. Poprawi czytelność formularza bez drastycznych zmian kodu

To też pokazuje **szybki progress** - za tydzień będziesz już pracować szybciej. 💪

---



Aby nie był chaos koloristyczny:
- 🟢 **Zielony** (#10b981) = Poprawne/Wypełnione
- 🟡 **Żółty** (#f59e0b) = Szacunek/Częściowe/Uwaga
- 🔴 **Czerwony** (#ef4444) = Błąd/Wymagane puste
- 🔵 **Niebieski** (#3b82f6) = Aktualnie edytowane/Sugestia
- ⚪ **Szary** (#6b7280) = Opcjonalne/Nieaktywne

Ikony: Font Awesome 6 (już masz) - konsekwentnie wszędzie (👤 osoba, 📅 data, 💼 zawód, 📖 słownik, 🧮 kalkulator).

---

### ⚡ Quick Wins (Coś do wprowadzenia od razu, bez zmian struktury)

Jeśli czujesz, że kod już jest duży i obawiasz się rozbudzowy:
1. **Autocomplete z historii** - zbiera co użytkownik wpisuje, podpowiada. Łatwe do dodania (localStorage + filtr).
2. **Checkbox "Kopiuj z poprzedniego"** dla metadanych - 10 linii JS, ogromna oszczędność czasu.
3. **Sekwencyjna nawigacja** (Tab/Strzałki) - już istnieje, tylko udoskonalić kierunek.
4. **Rozwijalne sekcje** - CSS accordion (już masz), reorganizuj pola w struktur.

Te 4 rzeczy = 1-2 godziny pracy, 30% zysku w ergonomii. **Może zacząć tutaj?**

---



- [ ] Czy problem jest jasno zdefiniowany?
- [ ] Czy są plusy/minusy dla każdej opcji?
- [ ] Czy znamy wpływ na reszcie codebase?
- [ ] Czy są testy/validation plan?
- [ ] Czy osoba implementująca rozumie architekturę?
- [ ] Czy backup/rollback plan jest gotowy?
- [ ] Czy estimate czasu jest realistyczny?

---

## Spotkanie 4: Grudzień 19, 2025 (Szczegółowy Workflow Użytkownika)

### 🎯 Rzeczywisty Proces Indeksacji - Co Robisz Naprawdę

Po rozmowie zrozumiałem dokładny workflow. Oto pięć faz, które powtarzasz dla każdego skanu:

---

#### **FAZA 1: Ocena Skanu i Metadane (Okładka vs Dane)**

**Co robisz:**
- Otwierasz katalog ze skanami
- Ładujesz pierwszą stronę (często okładka, brak danych osobowych)
- Opisujesz: rok, parafia, typ aktu
- Zaznaczasz: "Brak danych" lub przechodzisz dalej
- Przeskakujesz do pierwszych danych osobowych

**Wyzwania:**
- Ścieżka pliku do aktu (link) - zawsze trzeba ją zapisać
- Czasem brak linku (z innego źródła) - trzeba oznaczyć
- Manualna ocena: "To okładka czy dane?"

**Ułatwienia w App (Gotowe):**
✅ **Smart Defaults Bar** - parafia/rok/język zapamiętane
✅ Ścieżka pliku wyświetlana w nagłówku
✅ Link do aktu (checkbox "Brak/Z innego źródła")

**TODO:**
- [ ] Auto-detekcja okładki (jasność obrazu)
- [ ] Popup "Pomiń okładkę?" - Enter aby dalej

---

#### **FAZA 2: Metadane Pliku (Parafia, Rok, Typ, Numery)**

**Co robisz:**
- W serii zmienia się głównie **rok** (inkrementuje +1)
- Czasem zmienia się **parafia** lub **miejscowość**
- **Typ aktu** pozostaje ten sam lub zmienia się
- **Numery aktów** ciągłe w obrębie pliku
- **Numery stron** do zaznaczenia
- Wszystko musi być zapisane w metadanych aktu

**Wyzwania:**
- Ręczne wpisywanie zmian (np. rok 1890 → 1891)
- Brak automatycznej oceny "Co się zmieniło?"
- Śledzenie numeracji aktów/stron

**Ułatwienia w App (Gotowe):**
✅ **Smart Defaults** - "Auto-inkrementuj rok" checkbox
✅ "Kopiuj z poprzedniego" - kopiuje ostatnie dane
✅ Checkboxy do szybkiego wyboru

**TODO:**
- [ ] Automatyczne porównanie obrazów (czy to kontynuacja?)
- [ ] Historia sesji - lista ostatnich 5 parafia/rok
- [ ] Auto-numerowanie stron/aktów (liczenie)

---

#### **FAZA 3: Ocena Liczby Aktów i Tworzenie Pusych Rekordów**

**Co robisz:**
- Na oko oceniasz: **Ile aktów jest na tym skannie?** (np. 6)
- System tworzy puste rekordy (1, 2, 3, 4, 5, 6)
- Jeśli to kontynuacja (koniec poprzedniego + nowy początek) - zaznaczasz
- Zaznaczasz **ROI dla całego aktu** (granica - wszystkie pola w tym obszarze)
- ROI może być na kilku stronach lub wiele aktów na jednej

**Wyzwania:**
- Manualne liczenie ("Ile to jest?")
- Obsługa kontynuacji (gdzie kończy się poprzedni akt?)
- ROI na wielu stronach

**Ułatwienia w App (Gotowe):**
✅ **Licznik aktów** - wpisujesz ile, system tworzy

**TODO:**
- [ ] Auto-sugestia liczby aktów (detekcja numerów via OCR-lite)
- [ ] Przycisk "Kontynuacja?" - kopiuj numer i dane z poprzedniego
- [ ] Editor ROI - zaznacz akt, system zaznacza granice
- [ ] Drag&drop ROI między stronami

---

#### **FAZA 4: Indeksacja Pojedynczego Aktu (Sekwencja "Od Lewej w Dół")**

**Co robisz:**
1. Klikasz guzik aktu (np. #3)
2. Viewer zoomuje do tego aktu (ROI)
3. Wpisujesz dane sekwencyjnie, **od lewej w dół**:

```
┌─ PODSTAWOWE (zawsze)
│  ├─ Nr aktu (np. 123)
│  ├─ Imię dziecka
│  ├─ Data chrztu
│  └─ Miejsce chrztu

├─ ZGŁASZAJĄCY (zazwyczaj ojciec, ale nie zawsze!)
│  ├─ Imię zgłaszającego
│  ├─ Czy to ojciec? [X] (checkbox)
│  ├─ Wiek (opcjonalne)
│  ├─ Zawód (opcjonalne)
│  └─ Miejsce zamieszkania (opcjonalne)

├─ ŚWIADKOWIE (0-2 osoby, różne dane)
│  ├─ Świadek 1
│  │  ├─ Imię
│  │  ├─ Wiek (opcjonalne)
│  │  ├─ Zawód (opcjonalne)
│  │  ├─ Powiązanie [brat ▼] (czasem Family Tree link)
│  │  └─ Miejsce (opcjonalne)
│  ├─ + Dodaj świadka (opcjonalnie)
│  └─ Świadek 2 (j.w.)

├─ URODZENIE
│  ├─ Data urodzenia (nie chrztu!)
│  ├─ Godzina (czasem nawet godzina)
│  ├─ Miejsce urodzenia
│  ├─ Imię matki
│  ├─ Nazwisko panieńskie matki
│  ├─ Wiek matki (czasem)
│  └─ Potwierdzenie imienia na chrzcie

└─ DOPISKI (dla FAZY 5 - opcjonalne)
   ├─ Zmarnł (data, miejsce)
   ├─ Ożenił się (data, z kim)
   ├─ Inne powiązania
   └─ Notatki rodzinne
```

**Wyzwania:**
- **Sekwencja zależy od aktu** (czasem inny porządek)
- **Opcjonalne pola** - nie zawsze ojciec zgłasza, nie zawsze mamy zawód
- **Powiązania rodzinne** (świadek = brat, wuj, sąsiad?) - trzeba zaznaczyć
- **Zmienne dane** - czasem pełne, czasem fragmenty
- **ROI pod-pól** - który fragment obrazu = które pole

**Ułatwienia w App (TODO):**
- [ ] **Accordion sekcje** - rozwijane "Podstawowe", "Zgłaszający", "Świadkowie", itd.
- [ ] **Tab między polami** - przechodzi sekwencyjnie (nie skakanie)
- [ ] **Checkboxy dla opcjonalnych** - "+ Dodaj zawód", "+ Dodaj wiek"
- [ ] **Powiązania** - dropdown [brat, wuj, sąsiad, inne]
- [ ] **Auto-sugestie** - na bazie poprzednich aktów ("Zawsze to ojciec? [Tak]")
- [ ] **Hover na polu** → podświetla sugerowany fragment na obrazie
- [ ] **Ściąga kontekstowa** - lista imion PL/RU/LA (popup na żądanie)

---

#### **FAZA 5: Dopiski Genealogiczne (Dane Pochodne)**

**Co robisz:**
- Po indeksacji podstawowych danych przechodzisz na "Dopiski"
- Zaznaczasz: Zmarnł, Ożenił się, Inne powiązania rodzinne
- Te dane mogą być rozciągnięte na różne osoby (genealogia)

**Wyzwania:**
- Strukturyzacja (gdzie zapisać informację o śmierci?)
- Łączenie osób między aktami

**Ułatwienia w App (TODO):**
- [ ] **Sekcja Dopisków** - rozwijalna w akordion
- [ ] **Pola dla typowych zdarzeń:** Zmarnł [data/miejsce], Ożenił się [data/osoba]
- [ ] **Notatki rodzinne** - wolny tekst
- [ ] **Linkowanie osób** - możliwość połączenia z innymi aktami

---

### 📊 Matryca Ułatwień wg Faz

| Faza | Co robi system teraz | TODO | Priorytet | Czas |
|------|----------------------|------|-----------|------|
| 1 | Smart Defaults (parafia/rok/język) | Auto-detect okładki, Popup pomiń | P1 | 1-2h |
| 2 | Checkboxy "Copy last", "Auto-increment" | Historia sesji, Auto-numerowanie | P1 | 2-3h |
| 3 | Input liczby aktów | Auto-suggest liczby, Drag-drop ROI | P1 | 3-4h |
| 4 | Formularz płaski | **Accordion sekcje, Tab navigation, Checkboxy opcji** | **P0** | **4-6h** |
| 5 | Pusta sekcja notatek | Struktura dopisków, Linkowanie osób | P2 | 2-3h |

---

## Spotkanie 5: Grudzień 19, 2025 (Analiza UI/UX Patterns - Accordion vs Popovers)

### 🎨 Porównanie Typów Wprowadzania Danych

Na podstawie analizy best practices z narzędzi anotacji (VGG, CVAT, LabelImg, Encord) porównuję trzy podejścia:

---

#### **Opcja 1: Accordion (Rozwijane sekcje)**

```
┌─────────────────────────────┐
│ ▼ PODSTAWOWE                │ ← Zawsze otwarte
│   Nr aktu: [123]            │
│   Imię dziecka: [Jan]       │
│   Data chrztu: [1850-01-15] │
│   Miejsce: [Warszawa]       │
│                             │
│ ▶ ZGŁASZAJĄCY               │ ← Zwinięte (klik = rozwiń)
│                             │
│ ▶ ŚWIADKOWIE                │
│                             │
│ ▶ URODZENIE                 │
│                             │
│ ▶ DOPISKI                   │
└─────────────────────────────┘
```

**Zalety:**
✅ Prosty do implementacji (czysty CSS)
✅ Struktura jasna - postęp widoczny
✅ Obsługa sekcji opcjonalnych (szare/zwinięte)
✅ Kontynuacje - pola auto-wypełnione (tab nie zmienia się)

**Wady:**
❌ Statyczny - nie interaktywny z obrazem
❌ Wymaga przełączania uwagi (dysk ↔ formularz)
❌ Brak wizualnego powiązania pole ↔ ROI na obrazie
❌ Wolniejszy niż dynamiczny UI (~30% dłużej na akt)

**Kiedy: Backup, prosty start, urządzenia mobilne**

---

#### **Opcja 2: Popovers na Obrazie (Interaktywne Wyskakujące Pola)**

```
                                  Obraz ze skanem
                          ┌──────────────────────────┐
                          │  ┌─ Nr aktu ──┐         │
                          │  │   [123]    │         │
                          │  └────────────┘         │
                          │        │                │
                          │  ┌─ Imię dziecka ─┐    │
                          │  │    [Jan]       │    │
                          │  └────────────────┘    │
                          │        │                │
                          │  ┌─ Data chrztu ──┐    │
                          │  │ [1850-01-15]   │    │
                          │  └────────────────┘    │
                          │        ↓                │
                          │  Strzałka (prawo)       │
                          │  = Następne pole       │
                          └──────────────────────────┘
```

**Obsługa Klawiatury:**
- ⬅️ ➡️ (Lewo/Prawo) = Poprzednie/Następne pole (popover przeskakuje sekwencyjnie)
- ⬆️ ⬇️ (Góra/Dół) = Rozwijaj opcje w popoverze (np. + zawód ojca)
- Tab = Następne pole w sekwencji
- Enter = Zapisz pole
- Esc = Zamknij popover

**Obsługa Myszy:**
- Hover na ROI = Wyskakuje popover (timeout 1s, by nie irytować)
- Klik na popover = Edytuj pole
- Wheel (przewijanie) = Następne/poprzednie pole
- Drag popover = Przenieś na inny ROI (dla manualnej edycji)

**Zalety:**
✅ Dynamiczny - pola "żyją" na viewerze
✅ Sekwencyjny "od lewej w dół" - naturalne do workflow
✅ Wizualne powiązanie (pole blisko ROI) - mniej błędów
✅ Szybki (wyskakuje, edytujesz, dalej) - ~50% szybciej niż accordion
✅ Keyboard-first (strzałki, Tab) - zero myszy do podatków
✅ Dla zmiennych danych - opcjonalne pola w popoverze (+ godzina, + zawód)

**Wady:**
❌ Mogą się nakładać (clutter) - ograniczyć do 1-2 na raz
❌ Trudniejszy do implementacji (JS event listeners)
❌ Może przytłaczać początkujących (wszystko "żyje")
❌ Mobilna - trudniej przesuwać popovery (alt: full-width overlays)

**Best Practice (z Roboflow/Viso):**
- Pokaż **progres bar**: "Krok 3/10" aby zniżyć zamieszanie
- **Animacja slide-in** - popover pojawia się płynnie
- **Semi-transparent** - widać obraz za popowenem
- **Auto-focus na polu** - cursor w input od razu

**Kiedy: Główne podejście, desktop, szybka indeksacja**

---

#### **Opcja 3: Hybryda (Accordion + Popovers) ⭐ REKOMENDACJA**

```
┌──────────────────┐         ┌──────────────────────────┐
│ ▼ PODSTAWOWE     │         │  Obraz + Popover        │
│   Nr: [123]✓     │ ← Sync  │                         │
│   Imię:[Jan]✓    │ ←─────→ │  ┌─ Imię dziecka ──┐   │
│   Data:[...] 🔄  │ (live)  │  │    [Jan]        │   │
│                  │         │  └─────────────────┘   │
│ ▶ ZGŁASZAJĄCY   │         │  [Wpisz, Enter, →]     │
│                  │         │                         │
│ + Dodaj wiek     │ ← Ikona │                         │
│ + Dodaj zawód    │ + dla   │ Progres: 3/10          │
│                  │ opcji   │                         │
└──────────────────┘         └──────────────────────────┘
```

**Jak to działa:**
1. **Accordion (lewy panel):** Struktura, overview postępu (ile pól wypełnione)
2. **Popovers (na obrazie):** Edycja interaktywna (wpisujesz, strzałki = dalej)
3. **Sync:** Gdy wpiszesz w popoverze, accordion się aktualizuje (checkmark ✓)
4. **+ Ikony:** W accordion - "+ Dodaj wiek" = wyświetla option w popoverze

**Obsługa:**
- **Keyboard:** Strzałki (próxne pole, popover przenosi się), Tab (w ramach pola), Esc (zamknij popover)
- **Myszą:** Hover = wyskakuje popover, klik = edit, wheel = sekwencja

**Zalety:**
✅ **Struktura** bez chaosu (accordion = przewodnik)
✅ **Dynamika** tam gdzie trzeba (popovers = szybko)
✅ **Dla zmiennych danych** (+ ikony dla opcjonalnych)
✅ **Kontynuacje** jasne (accordion pokazuje co się zmienia)
✅ **Keyboard + Myszą** obsługiwane równomiernie
✅ **Prędkość** - ~40-50% szybciej niż sam accordion
✅ **Mobile-ready** - modal popover zamiast wyskakanego (fallback)

**Wady:**
❌ Bardziej złożony w kodzie (2 systemy jednocześnie)
❌ Trzeba synchronizacji (accordion ↔ popover)

**Insights z Best Practices:**
- **VGG Image Annotator:** Folosuje on-image popovers + hotkeys
- **CVAT:** Interactive overlays + keyboard shortcuts
- **Encord:** Grouped labels (accordion) + on-canvas edits (popovers)
- **Roboflow/Ziflow:** "On-canvas forms" zwiększają prędkość o 50%
- **LabelImg:** Hybryda - tree view (struktura) + popups (edycja)

**Wniosek:** Hybrida = best of both worlds. Wart 3-5h implementacji zamiast 1h na accordion.

---

#### 📊 Porównanie Szybkości

| Typ | Czas/akt | Kliki | Fokus | Best for |
|-----|----------|-------|-------|----------|
| Accordion | 3-4 min | 8-10 | dysk ↔ form | Backup, mobilny |
| Popovers | 1.5-2 min | 2-3 | wizualne | Desktop, szybko |
| **Hybryda** | **1.5-2 min** | **2-3** | **wizualne + struktura** | **Production** ⭐ |

---

### 🎯 Decyzja: Hybryda - Accordion + Popovers

**Co implementujemy:**

**FAZA 1 (dziś - 4-6h):** Accordion sekcje (struktura)
- Podstawowe (zawsze otwarte)
- Zgłaszający (z checkbox "Nie ojciec?")
- Świadkowie (z dropdown "Powiązanie")
- Urodzenie
- Dopiski

**FAZA 2 (tydzień 2 - 3-5h):** Popovers na obrazie
- Po hover/klik na pole w accordion → popover wyskakuje na ROI
- Strzałkami przechodzisz sekwencyjnie
- Opcjonalne pola wyświetlają się na żądanie (+ ikona)

**FAZA 3 (tydzień 3 - 2-3h):** Synchronizacja
- Zmiana w popoverze = update w accordion (live)
- Checkmarks (✓) w accordion = pola wypełnione
- Progres bar (3/10 pól)

---

## Spotkanie 6: Grudzień 19, 2025 (Dizajn Layoutu i Ergonomia)

### 📐 Wizja Layoutu - Hybryda w Praktyce

**Cel:** Viewer jako centrum (70% ekranu), reszta wspomagająca (guziki, accordion, popovers) bez rozpraszania. Inspiracja z Figma, CVAT, LabelImg - minimalizm z interaktywnością.

```
┌──────────────────────────────────────────────────────────────┐
│ TOOLBAR (chowalny: Ctrl+T lub ikona ≡)                      │
│ [Otwórz] [ROI] [Export] [Ustawienia] ≡ Menu                 │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                  │
│  VIEWER (70% ekranu)     │  GUZIKI AKTÓW (15%)              │
│  Obraz główny            │  (stały, ale chowalny)           │
│  Dominuje całą pracę     │                                  │
│                          │  ╔════════════════╗              │
│  ┌─────────────────┐     │  ║  AKT #1 [✓]  ║ ← Metadane    │
│  │ POPOVER        │     │  ║  3/7 pól     ║   (liczba     │
│  │ Nr aktu: [3]   │     │  ║  ROI: tak    ║    pól, ROI)  │
│  │ Imię: [Jan]    │     │  ╚════════════════╝              │
│  │ + [Wiek] +[Zaw]│     │  AKT #2 [⊙]                      │
│  │ [Lewo] →  [Dalej]    │  1/7 pól                        │
│  └─────────────────┘     │  AKT #3 [🔲]                     │
│                          │  0/7 pól                        │
│  (Strzałkami nawigujesz) │  ...                             │
│                          │                                  │
├──────────────────────────┴──────────────────────────────────┤
│ MINIATURY (chowalne: Ctrl+M lub automatycznie po ładunku)   │
│ [1📌] [2] [3] [4] [5] ← scroll horyzontalny (wheel)         │
│       ↑                  (metadata: 1891, Wniebowzięcia)     │
│       (aktualny skan)                                        │
├──────────────────────────────────────────────────────────────┤
│ ACCORDION (chowalny: Ctrl+A lub overlay prawy panel)         │
│                                                              │
│ ▼ PODSTAWOWE (zawsze otwarte)                                │
│   Nr aktu: [3]          ✓ Wypełnione                        │
│   Imię dziecka: [Jan]   ✓                                   │
│   Data chrztu: [1850]   ✓                                   │
│   Miejsce: [Warszawa]   ✓                                   │
│                                                              │
│ ▶ ZGŁASZAJĄCY (zwinięta)                                     │
│   (Rozwiń aby dodać/edytować dane)                          │
│                                                              │
│ ▶ ŚWIADKOWIE (zwinięta)                                      │
│   + Dodaj świadka                                            │
│                                                              │
│ ▶ URODZENIE (zwinięta)                                       │
│ ▶ DOPISKI (zwinięta)                                         │
└──────────────────────────────────────────────────────────────┘
```

---

### 🎮 Ergonomia - Keyboard & Mouse

#### **Klawiatura (Keyboard-First)**

| Skrót | Akcja | Kontekst |
|-------|-------|---------|
| **⬅️ ➡️** | Prev/Next pole (popover skacze) | Wpisywanie w akcie |
| **⬆️ ⬇️** | Rozwijaj/zwijaj opcje (+Wiek/Zawód) | W popoverze |
| **Tab** | Focus na polu w popoverze | Edycja pola |
| **Enter** | Zapisz pole + Next | Po wpisaniu |
| **Esc** | Zamknij popover / accordion | Aby skupić się na obrazie |
| **Ctrl+T** | Pokaż/schowaj Toolbar | Fullscreen viewer |
| **Ctrl+M** | Pokaż/schowaj Miniatury | Przychowaj dół |
| **Ctrl+A** | Pokaż/schowaj Accordion | Przychowaj formularz |
| **Ctrl+1...9** | Przeskocz do guzika aktu N | Szybka nawigacja (Ctrl+3 = akt 3) |
| **Ctrl+S** | Zapisz akt (auto, ale skrót) | Safety |
| **Ctrl+→** | Następny skan | Przejście do następnego pliku |
| **Ctrl+←** | Poprzedni skan | Cofnij |

#### **Mysz (Mouse-Friendly)**

| Akcja | Efekt | Kontekst |
|-------|-------|---------|
| **Hover na ROI** | Wyskakuje popover z polem do edycji | Viewer (obrazie) |
| **Klik na guzik aktu** | Zoom do tego aktu, popover 1. pola | Guziki (prawa) |
| **Wheel up/down** | Next/Prev pole (popover przenosi się) | Nad obrazem |
| **Wheel nad miniaturami** | Scroll skanów | Miniatury (dół) |
| **Drag popover** | Przenieś do innego fragmentu (edytuj ROI) | Zaawansowane |
| **Klik + (Dodaj)** | Wysuwa sub-pole (wiek, zawód, powiązanie) | W popoverze |
| **Hover na accordion** | Preview pole (tooltip z przykładem) | Panel lewy |
| **Klik na sekcję accordion** | Otwórz/Zamknij sekcję | Menu (prawo/overlay) |

---

### 📦 Stan Widoczności Elementów

#### **Stan 1: Pełny Interfejs (Start)**
```
Toolbar ✓ | Viewer ✓ | Guziki ✓ | Miniatury ✓ | Accordion ✓
```
- Wszystko widoczne - przegląd
- Kto nowy: łatwo się orientuje
- Kto doświadczony: od razu schowaj (Ctrl+T/M/A)

#### **Stan 2: Fokus na Obrazie (Wpisywanie)**
```
Toolbar ✗ | Viewer ✓✓ (85%) | Guziki ✓ | Miniatury ✗ | Accordion ✗
```
- Automatycznie po kliknięciu guzika aktu
- Toolbar/Miniatury/Accordion chowają się
- Viewer dominuje, popover wyskakuje na obrazie
- Zoom do ROI aktu
- Klawiszą/mysz do edycji pól

#### **Stan 3: Przegląd (Kontynuacja)**
```
Toolbar ✓ | Viewer ✓ | Guziki ✓ | Miniatury ✓ | Accordion ✓
```
- Po zapisaniu aktu - wrócić do przeglądu
- Ocena zmian vs. poprzedni skan
- Liczenie nowych aktów
- Przygotowanie do następnego

---

### 🎨 Usprawnienia Visual Design

#### **Ikony i Kolory - Feedback Wizualny**

| Element | Ikona | Kolor | Znaczenie |
|---------|-------|-------|-----------|
| Guzik aktu (pusty) | 🔲 | #3a3a3a (szary) | Nie wypełniony |
| Guzik aktu (w trakcie) | ⊙ | #0078d4 (niebieski) | Trwa edycja |
| Guzik aktu (kompletny) | ✓ | #10b981 (zielony) | Wszystkie pola |
| Guzik aktu (ROI) | 📍 | #10b981 | Ma wyznaczony ROI |
| Pole vypełnione | ✓ | #10b981 | OK |
| Pole opcjonalne | ℹ️ | #888 (szary) | Do uzupełnienia |
| Popover | 📝 | #0078d4 | Edytuj |
| + (Dodaj opcję) | ➕ | #0078d4 | Rozwij sub-pole |
| Potwierdzenie | ✅ | #10b981 | Zapisane |

#### **Animacje**

- **Popover slide-in:** 300ms ease-out (z lewej/góry, zależy od ROI)
- **Accordion expand:** 200ms ease-in-out (smooth scroll)
- **Toolbar slide-up:** 150ms (chowaj bez "jump")
- **Miniatury fade:** 200ms (płynnie znikają)

---

### 🚀 Plan Implementacji Layoutu

#### **FAZA 1: Struktura HTML (2-3h)**
- [ ] Podzielić istniejący HTML na 5 sections: Toolbar, Viewer, Guziki, Miniatury, Accordion
- [ ] Guziki aktów → grid layout (prawy panel)
- [ ] Accordion → HTML `<details>` (native, bez JS!)
- [ ] Popover template (hidden, clone na demand)

#### **FAZA 1.5: CSS Grid/Flex (1-2h)**
- [ ] Główny layout: `display: grid` (toolbar / viewer+guziki / miniatury / accordion)
- [ ] Responsywne proporcje (70/15/15 dla viewer/guziki)
- [ ] Chowalne elementy (opacity fade, transform slide)
- [ ] Media queries (mobile: accordion fullscreen, guziki pod viewer)

#### **FAZA 2: Interaktywność (3-4h)**
- [ ] Skróty klawiszowe (Ctrl+T/M/A chowają elementy)
- [ ] Klik na guzik → zoom do aktu + popover #1
- [ ] Wheel myszy → next/prev pole
- [ ] Hover na accordion → preview tooltip

#### **FAZA 3: Popovers (4-6h)**
- [ ] CSS dla popovers (semi-transparent, arrow pointing to ROI)
- [ ] JS: Pozycjonowanie na podstawie ROI (Popper.js lub custom)
- [ ] Sekwencja pól (arrow keys = navigate)
- [ ] Auto-focus na polu + keyboard submit

#### **FAZA 4: Synchronizacja Accordion ↔ Popovers (2-3h)**
- [ ] Live update: zmiana w popoverze = accordion się zmienia
- [ ] Checkmarks (✓) w accordion (CSS :has() selector)
- [ ] Progres bar (N/M pól wypełnionych)

---

### 📱 Responsywność (Mobile/Tablet)

#### **Desktop (1920x1080)**
- Viewer 70% | Guziki 15% | Rest 15%
- Accordion overlay prawy panel (slide-in)
- Popovers bezpośrednio na viewerze

#### **Tablet (768x1024)**
- Viewer 60% | Guziki 40% (podłużnie)
- Accordion fullscreen overlay (z Esc = zamknij)
- Popovers mogą być modalne (fullwidth)

#### **Mobile (375x667)**
- Viewer fullscreen (guziki hide, Ctrl+G = pokaż)
- Accordion: fullscreen modal (bottom sheet)
- Popovers: fullscreen forms (one field per screen, next = swipe)
- Miniatury: carousel vertical (swipe = next skan)

---

### 🎯 Następne Kroki Implementacji

**Zaraz robimy (dziś):**
1. ✅ Smart Defaults Bar - **DONE**
2. 🔨 **Accordion sekcje formularza** - podzielone logicznie (Podstawowe, Zgłaszający, Świadkowie, Urodzenie, Dopiski)
3. 🔨 **Tab navigation** - Tab przechodzi sekwencyjnie między polami
4. 🔨 **Checkboxy dla opcjonalnych** - "+ Dodaj wiek", "+ Dodaj zawód"

**Potem (tydzień 2):**
5. Auto-sugestie (dropdown powiązań)
6. Historia sesji (lista ostatnich wartości)
7. Ściąga kontekstowa (tabela imion)

**Potem (tydzień 3+):**
8. Auto-detekcja liczby aktów
9. Linkowanie osób
10. Dopiski genealogiczne

---

## 🚀 Implementacja (Moving to Code)

Gdy pomysł ma status **"Do zrobienia"**:

1. **Utwórz branch:** `feature/[nazwa-z-brainstorm]`
2. **Skopiuj sekcję:** Z BRAINSTORM → w komentarz w kodzie
3. **Dodaj kod:** Implementuj w HTML/JS
4. **Update BRAINSTORM:** Zmień status na "Zrobione" + data
5. **Update CHANGELOG:** Opisz co się zmieniło
6. **Zarchiwizuj:** Przenieś do sekcji ARCHIVED na dole

---

## 📂 ARCHIVED (Zrobione/Odrzucone)

Tutaj trafiają pomysły które już:
- ✅ Zostały zaimplementowane
- ❌ Zostały odrzucone z powodu X

---

## Spotkanie 3: Grudzień 19, 2025 (Phase 5 - OpenCV.js Integration)

### ✅ Phase 5: Zaawansowane Filtry Obrazu (OpenCV.js)

**Problem:** Proste filtry Canvas (kontrast, sepia, nasycenie) są niewystarczające do profesjonalnego przetwarzania dokumentów genealogicznych. Szczególnie problemy:
- Globalne threshold nie radzi sobie z nierównomiernym oświetleniem
- Brak denoising → szumy w skanach
- Brak histogramu → fałdy, zaniki tekstu na brzegach
- Brak adaptacyjnych algorytmów → stale "zbyt jasne" lub "zbyt ciemne"

**Rozwiązanie:** Integracja OpenCV.js - biblioteka wizji komputerowej z 4 nowymi filtrami:

#### **1. Adaptive Thresholding (Próg Adaptacyjny)**
- **Co robi:** Dzieli obraz na fragmenty, dla każdego oblicza lokalny próg
- **Dlaczego to ważne:** Pracy z nierównomiernym oświetleniem (jeden róg ciemny, drugi jasny)
- **Slider:** 0-100% (determinuje rozmiar fragmentu i konstaltę)
- **Przed/Po:**
  - Przed: Tekst u dołu ekranu znika (za ciemno), u góry rozmazany (za jasno)
  - Po: Cały tekst wyrazisty, znika szum tła
- **API:** `cv.adaptiveThreshold(src, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, blockSize, constant)`

#### **2. Histogram Equalization (Wyrównanie Histogramu)**
- **Co robi:** Rozciąga zakres jasności/ciemności na pełny spektrum
- **Dlaczego to ważne:** Fałdy papieru, zaniki tekstu na brzegach mają zły kontrast
- **Slider/Checkbox:** ON/OFF (jest tylko włącz/wyłącz, nie ma "siły")
- **Przed/Po:**
  - Przed: Fałdy ledwo widoczne, tekst na szarej ściance
  - Po: Fałdy wyraźne (pomocne do analizy), tekst na kontraście
- **API:** `cv.equalizeHist(src, dst)`

#### **3. Gaussian Blur (Rozmycie Gaussowskie)**
- **Co robi:** Zmiękkza obraz, pozbywając się szumów vysokiej częstości
- **Dlaczego to ważne:** Stare skany mają "ziarna" papieru, artefakty skanowania
- **Slider:** 0-10 (rozmiar kernela: 1, 3, 5, 7, ..., 21)
- **Użycie:** Najczęściej PRZED adaptacyjnym threshold (zmniejsza false positives)
- **API:** `cv.GaussianBlur(src, dst, new cv.Size(kernelSize, kernelSize), sigma)`

#### **4. Median Blur (Rozmycie Medianowe)**
- **Co robi:** Zamienia każdy pixel medianą otoczenia - usuwa szum bez rozmycia krawędzi
- **Dlaczego to ważne:** "Pepper & salt noise" - pojedyncze białe/czarne piksele na tle
- **Slider:** 0-10 (rozmiar kernela: 1, 3, 5, ..., 21)
- **Użycie:** Po denoising (Gaussian) - finalne czyszczenie
- **API:** `cv.medianBlur(src, dst, kernelSize)`

#### **7-Stopniowy Pipeline Przetwarzania**

```
INPUT: Oryginał skan
  ↓
1. Canvas GPU Filters
   ├─ Brightness/Contrast (levels slider)
   ├─ Hue/Saturation (kolorystyka)
   ├─ Sepia/Invert (efekty)
   └─ Output: img1.canvas
  ↓
2. Histogram Equalization (OpenCV)
   └─ cv.equalizeHist() → img2
  ↓
3. Gaussian Blur (OpenCV)
   └─ cv.GaussianBlur(kernelSize=3+) → img3
  ↓
4. Median Blur (OpenCV)
   └─ cv.medianBlur(kernelSize=3+) → img4
  ↓
5. Archival Enhancement (JavaScript pixel-loop)
   └─ Boost kontrastu dla zanikających pism → img5
  ↓
6. Descreen (Blur-based halftone removal)
   └─ Rozmycie aby pozbyć się linii druku → img6
  ↓
7. **Adaptive Threshold (OpenCV) - BINARYZACJA**
   └─ cv.adaptiveThreshold() → pure B&W
  ↓
OUTPUT: Przetworzony obraz (saved as new version)
```

**Postprocessing State (12 właściwości):**
```javascript
const postprocessState = {
  // Canvas/GPU filters
  levels: 0,               // -100 do +100 (jasność/kontrast)
  autoContrast: false,     // Auto histogram equalization
  archival: 0,             // 0-100 (enhancement zanikających tekstów)
  descreen: 0,             // 0-100 (usunięcie halftone)
  
  // Color filters
  sepia: 0,                // 0-100 (żółty filtr)
  hue: 0,                  // -180 do +180 (rotacja kolorów)
  saturation: 100,         // 0-200 (nasycenie)
  invert: 0,               // 0-100 (negatyw)
  
  // NEW: OpenCV.js filters (3 suwaki + 1 checkbox)
  adaptiveThreshold: 0,    // 0-100% (próg adaptacyjny) ⭐ GŁÓWNY
  gaussianBlur: 0,         // 0-10 (rozmycie Gaussowskie)
  medianBlur: 0,           // 0-10 (rozmycie medianowe)
  histogramEq: false       // boolean (wyrównanie histogramu)
};
```

#### **9 Presetów Genealogicznych**

| Preset | Adaptiv. | Histogram | Gaussian | Median | Zastosowanie |
|--------|----------|-----------|----------|--------|--------------|
| **Archival** | ❌ 0% | ❌ | 0 | 0 | Oficjalne dokumenty, jasne, wyraźne |
| **Faded** | ❌ 0% | ✅ | 0 | 2 | Starożytny papier, zanika tekst |
| **Dark** | ❌ 0% | ❌ | 0 | 0 | Ciemny atrament na papierze |
| **Bright** | ❌ 0% | ❌ | 0 | 0 | Blade dokumenty, słabe kopie |
| **Typewriter** | ✅ 50% | ❌ | 0 | 0 | Maszyna do pisania, ostry czarny tekst |
| **Ink** (NEW) | ❌ 0% | ✅ | 0 | 1 | Stary żelazny tusz, płynie się |
| **genealogy-pro** (NEW) ⭐ | ✅ 30% | ✅ | 2 | 1 | Profesjonalny kompromis (większość aktów) |
| **faded-advanced** (NEW) | ✅ 40% | ✅ | 3 | 2 | Zaawansowany: bardzo słabe dokumenty |
| **text-extraction** (NEW) | ✅ 60% | ✅ | 1 | 2 | Ekstrakcja tekstu (prawie czarno-białe) |

#### **Funkcje Implementacyjne**

**`adaptiveThresholdFilter(imageData, blockSize, constant)`** - Próg adaptacyjny
```javascript
// Konwersja: 0-100% slider → blockSize (3-21) i constant (-50 to +50)
let src = cv.imread(canvas);
let dst = new cv.Mat();
cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);
cv.adaptiveThreshold(src, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, 
                     cv.THRESH_BINARY, blockSize, constant);
// Konwersja zpowrotem do RGBA
src.delete(); dst.delete();
```

**`gaussianBlurFilter(imageData, kernelSize, sigma)`** - Rozmycie
```javascript
let src = cv.imread(canvas);
let dst = new cv.Mat();
cv.GaussianBlur(src, dst, new cv.Size(kernelSize, kernelSize), sigma);
cv.imshow(canvas, dst);
src.delete(); dst.delete();
```

**`medianBlurFilter(imageData, kernelSize)`** - Rozmycie medianowe
```javascript
let src = cv.imread(canvas);
let dst = new cv.Mat();
cv.medianBlur(src, dst, kernelSize);
cv.imshow(canvas, dst);
src.delete(); dst.delete();
```

**`histogramEqualization(imageData)`** - Wyrównanie histogramu
```javascript
let src = cv.imread(canvas);
let dst = new cv.Mat();
cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);  // Musi być szara
cv.equalizeHist(src, dst);
// Konwersja z powrotem do RGBA
```

#### **Integracja OpenCV.js**

```html
<!-- Asynchronicznie ładujemy CDN (non-blocking) -->
<script async src="https://docs.opencv.org/4.8.0/opencv.js"></script>

<!-- Callback gdy OpenCV gotowy -->
<script>
  let opencvReady = false;
  function onOpenCvReady() {
    opencvReady = true;
    console.log('✅ OpenCV.js załadowany');
  }
  if (typeof cv !== 'undefined') {
    cv.onRuntimeInitialized = onOpenCvReady;
  }
</script>
```

**Bezpieczna aplikacja:**
```javascript
applyPostprocessFilters() {
  if (!opencvReady) {
    console.warn('⚠️ OpenCV.js nie jest jeszcze załadowany');
    return;  // Fallback na Canvas-only filters
  }
  
  // Teraz możemy używać cv.* funkcji
  if (state.adaptiveThreshold > 0) {
    adaptiveThresholdFilter(...);
  }
  if (state.gaussianBlur > 0) {
    gaussianBlurFilter(...);
  }
  // itd.
}
```

#### **Plusy Phase 5**

- ✅ Profesjonalne przetwarzanie dokumentów (nie toy tools)
- ✅ Adaptacyjne algorytmy (nie globalne prógi)
- ✅ Genealogiczne presets (3 nowe, zaawansowane)
- ✅ Non-destructive (oryginał zawsze bezpieczny)
- ✅ Asynchroniczne ładowanie OpenCV (nie blokuje start)
- ✅ Gradacja (slider 0-100, nie on/off)
- ✅ Denoising przed binaryzacją (profesjonalny flow)

#### **Minusy Phase 5**

- ❌ OpenCV.js jest duża (~8MB), asynchroniczne ładowanie
- ❌ Na starych przeglądarkach może nie działać
- ❌ Dodatkowy shader/Math work (CPU bound dla bardzo dużych obrazów)
- ❌ Nie OCR - wciąż trzeba ręcznie wpisywać dane

#### **Status: ✅ COMPLETE**

- ✅ OpenCV.js CDN zintegrowany
- ✅ 4 nowe filtry OpenCV implementacyjne
- ✅ 12 state properties zdefiniowane
- ✅ 9 presets genealogicznych (3 nowe)
- ✅ UI sliders/checkboxes (4 nowe OpenCV sekcja)
- ✅ Full pipeline (7 stopni)
- ✅ Tested i working

**Data ukończenia:** 19 Grudnia 2025  
**Szacunkowy czas:** 4-5 godzin implementacji

---

## Spotkanie 4: Grudzień 19, 2025 (Phase 6 - Ergonomic UX Improvements)

### 🚀 Phase 6: Ulepszenia Ergonomiczne Przepływu Indeksowania

**Problem:** Mimo zaawansowanych filtrów, główna dolor point to:
1. **Powtarzanie metadanych** - parafia/rok/typ wpisywane dla każdego rekordu
2. **Przełączanie kontekstu** - obraz, formularz, powiązania, notatki = rozproszenie
3. **Ręczne nawigacja** - wiele kliknięć aby przejść z pola do pola
4. **Brak memoriału** - nie widać co już zrobiliśmy, ile czasu
5. **Wizualna dezorientacja** - 15+ pól w całości, trudno się orientować
6. **Brak powiązań** - każdy rekord niezależny, choć czasem to ta sama osoba
7. **Undo/Redo brak** - pomyłka = trzeba ręcznie cofać

**Cel:** Zwiększyć prędkość indeksowania 2-3x poprzez inteligentne defaults, nawigację klawiszową i wizualne wskaźniki postępu.

#### **10 Kategorii Ulepszeń (100+ idei)**

### **Kategoria 1: Smart Defaults (9 pomysłów)**

**Problem:** Parafia, rok, typ dokumentu - powtarzane 5-10x na skanzie, każdy raz ręczne wpisanie.

| ID | Pomysł | Impact | Effort | Status |
|---|--------|--------|--------|--------|
| 1.1 | Auto-zapamiętaj last values (historia sesji) | 🟢 WYSOKI | 🟡 ŚREDNI | P0 |
| 1.2 | Prefill z poprzedniej linii | 🟢 WYSOKI | 🟡 ŚREDNI | P0 |
| 1.3 | Słownik parafii (dropdown autocomplete) | 🟢 WYSOKI | 🟡 ŚREDNI | P1 |
| 1.4 | Słownik zawodów (PL/RU/LA) | 🟢 WYSOKI | 🟢 ŁATWY | P1 |
| 1.5 | Auto-increment roku (+1 jeśli skan to następny rok) | 🟡 ŚREDNI | 🟢 ŁATWY | P1 |
| 1.6 | Sugestie imion (Top 100 imion PL z tego okresu) | 🟡 ŚREDNI | 🟡 ŚREDNI | P2 |
| 1.7 | Smart defaults dla zawodów (np. "ksiądz" = kler) | 🟡 ŚREDNI | 🟡 ŚREDNI | P2 |
| 1.8 | Copy poprzedniego rekordu (masa-kopia) | 🟢 WYSOKI | 🟢 ŁATWY | P0 |
| 1.9 | Template dla typ. sytuacji (np. rodzina = wszyscy lud.) | 🟡 ŚREDNI | 🟡 ŚREDNI | P2 |

**Szybki wzrost produktywności:**
- Bez: 60 sekund × 5 rekordów = 300s/skan
- Z domyślnym kopią: 20s × 5 = 100s/skan (-67%)

### **Kategoria 2: Nawigacja Klawiszowa (8 pomysłów)**

**Problem:** Myszka to ~30% czasu, przy 15+ polach to dużo.

| ID | Pomysł | Impact | Effort | Status |
|---|--------|--------|--------|--------|
| 2.1 | Tab = następne pole (sekwencyjna) | 🟢 WYSOKI | 🟢 ŁATWY | P0 |
| 2.2 | Shift+Tab = poprzednie pole | 🟢 WYSOKI | 🟢 ŁATWY | P0 |
| 2.3 | Enter = zapisz rekord + skok do następnego | 🟢 WYSOKI | 🟡 ŚREDNI | P0 |
| 2.4 | Ctrl+R = toggle ROI dla bieżącego pola | 🟢 WYSOKI | 🟢 ŁATWY | P0 |
| 2.5 | Ctrl+A = toggle Act boundary | 🟢 WYSOKI | 🟢 ŁATWY | P0 |
| 2.6 | Ctrl+N = nowy rekord | 🟢 WYSOKI | 🟢 ŁATWY | P0 |
| 2.7 | Ctrl+Z = undo (ostatnia zmiana) | 🟡 ŚREDNI | 🟡 ŚREDNI | P1 |
| 2.8 | Arrow Up/Down = poprz./następna rodzina (opcj.) | 🔴 NISKI | 🟡 ŚREDNI | P3 |

**Szybki wzrost:**
- Bez: 7 kliknięć/pole → 10 pól = 70 kliknięć/rekord
- Z Tab: 2 kliknięcia + Enter = 3 całkowite (-96%)

### **Kategoria 3: Auto-Zoom & Fokus (5 pomysłów)**

**Problem:** Za każdym razem trzeba ręcznie powiększać obszar, którym się zajmujesz.

| ID | Pomysł | Impact | Effort | Status |
|---|--------|--------|--------|--------|
| 3.1 | Auto-zoom do ROI pola gdy focus | 🟢 WYSOKI | 🟡 ŚREDNI | P0 |
| 3.2 | Auto-zoom do Act ROI na start | 🟢 WYSOKI | 🟡 ŚREDNI | P0 |
| 3.3 | "Focus mode" - schowaj UI, powiększ obraz | 🟡 ŚREDNI | 🟢 ŁATWY | P1 |
| 3.4 | Zoom history (Ctrl+- = zoom out ostatnio) | 🔴 NISKI | 🟡 ŚREDNI | P3 |
| 3.5 | Smart zoom levels (fit-act, fit-field, original) | 🔴 NISKI | 🟡 ŚREDNI | P2 |

**Szybki wzrost:**
- Bez: 10 sekund przewijania/zoomowania per pole
- Z auto-zoom: 1 sekunda (99% czasu zaoszczędzony!)

### **Kategoria 4: Progress & Memory (6 pomysłów)**

**Problem:** Nie widać ile zrobiliśmy, ile zostało, czy popełniliśmy błąd 10 pól temu.

| ID | Pomysł | Impact | Effort | Status |
|---|--------|--------|--------|--------|
| 4.1 | Progress bar (X/Y pól w rekordzie, X/Y rekordów na skanie) | 🟢 WYSOKI | 🟢 ŁATWY | P0 |
| 4.2 | Visual status pól (✓ wypełnione, ⊘ opcj., ✗ błąd) | 🟢 WYSOKI | 🟡 ŚREDNI | P0 |
| 4.3 | Undo/Redo stos (Ctrl+Z cofnięcie, Ctrl+Y dalej) | 🟡 ŚREDNI | 🟡 ŚREDNI | P1 |
| 4.4 | Timestamp + session log (kiedy zrobiliśmy co) | 🟡 ŚREDNI | 🟢 ŁATWY | P2 |
| 4.5 | Mini-map (podgląd aktów na skanie) | 🔴 NISKI | 🟡 ŚREDNI | P2 |
| 4.6 | Breadcrumb (Image → Act → Field → Help) | 🔴 NISKI | 🟢 ŁATWY | P3 |

**Szybki wzrost:**
- Bez: Zapominamy czy ponieśliśmy pola, tracimy czas na double-check
- Z progress: Widać postęp = motywacja (psychology!)

### **Kategoria 5: Copy & Paste (4 pomysły)**

**Problem:** Powtarzające się dane (np. świadkowie) trzeba przepisywać.

| ID | Pomysł | Impact | Effort | Status |
|---|--------|--------|--------|--------|
| 5.1 | Copy ROI z poprzedniego pola (X → X+1, jeśli layout się nie zmienił) | 🟢 WYSOKI | 🟡 ŚREDNI | P0 |
| 5.2 | Copy wartość z poprz. rekordu (Ctrl+Shift+V) | 🟢 WYSOKI | 🟢 ŁATWY | P0 |
| 5.3 | Paste jako template (wczytaj strukturę z innego skanu) | 🟡 ŚREDNI | 🟡 ŚREDNI | P1 |
| 5.4 | Copy całego rekordu (duplikuj do następnego skanu) | 🟡 ŚREDNI | 🟢 ŁATWY | P1 |

**Szybki wzrost:**
- Bez: Przepisywanie czasem 30s
- Z copy: 2s (95% szybciej!)

### **Kategoria 6: Kolory & Wizualne Kodowanie (5 pomysłów)**

**Problem:** 15 pól, trudno zobaczyć którego brakuje, czy kto je już wypełnił.

| ID | Pomysł | Impact | Effort | Status |
|---|--------|--------|--------|--------|
| 6.1 | Color-code pola (🟢 complete, 🟡 partial, 🔴 empty) | 🟢 WYSOKI | 🟢 ŁATWY | P0 |
| 6.2 | Color-code rekordy w sidebar (status akt) | 🟢 WYSOKI | 🟢 ŁATWY | P0 |
| 6.3 | Highlight invalid pola (błędy formatu) | 🟡 ŚREDNI | 🟡 ŚREDNI | P1 |
| 6.4 | Multi-color ROI overlays (pole × rekord × status) | 🔴 NISKI | 🟡 ŚREDNI | P2 |
| 6.5 | Dark mode theme (już jest, ale opcje kontrastu) | 🔴 NISKI | 🟢 ŁATWY | P3 |

**Szybki wzrost:**
- Bez: Czytaj każde pole aby sprawdzić status
- Z kolorem: Jedno spojrzenie (99% szybciej!)

### **Kategoria 7: Walidacja & Smart Hints (5 pomysłów)**

**Problem:** Błędy (np. data w przyszłości, liczba dzieci = 0) odkrywamy na koniec.

| ID | Pomysł | Impact | Effort | Status |
|---|--------|--------|--------|--------|
| 7.1 | Live validation (while typing, sprawdzaj formę) | 🟡 ŚREDNI | 🟡 ŚREDNI | P1 |
| 7.2 | Smart hints (tooltip, np. "Urodzenie przed małżeństwem!") | 🟢 WYSOKI | 🟡 ŚREDNI | P1 |
| 7.3 | Autocorrect (typ. błędy, np. " Jan" → "Jan") | 🟡 ŚREDNI | 🟢 ŁATWY | P2 |
| 7.4 | Validation before save (Ctrl+S = sprawdzaj)| 🟡 ŚREDNI | 🟡 ŚREDNI | P1 |
| 7.5 | Error report (generuj log błędów dla sesji) | 🔴 NISKI | 🟢 ŁATWY | P3 |

### **Kategoria 8: Powiązania & Linkowanie (4 pomysły)**

**Problem:** Każdy rekord niezależny, choć czasem to ta sama osoba (w rzeczywistości).

| ID | Pomysł | Impact | Effort | Status |
|---|--------|--------|--------|--------|
| 8.1 | "Link to person" - połącz osoby z różnych aktów | 🟢 WYSOKI | 🟡 ŚREDNI | P1 |
| 8.2 | Visual family tree (na skanie zaznacz bliskie, zjedź na drzewo) | 🟡 ŚREDNI | 🔴 TRUDNY | P2 |
| 8.3 | Auto-link candidates (jeśli imię+parafia się pokrywa) | 🟡 ŚREDNI | 🟡 ŚREDNI | P2 |
| 8.4 | Genealogy notes (rodzina X vs Y vs Z - notatki) | 🟡 ŚREDNI | 🟡 ŚREDNI | P2 |

### **Kategoria 9: Export & Raportowanie (4 pomysły)**

**Problem:** CSV to tylko surowe dane, brakuje kontekstu i metadanych.

| ID | Pomysł | Impact | Effort | Status |
|---|--------|--------|--------|--------|
| 9.1 | GEDCOM export (dla genealogów z Family Tree) | 🟡 ŚREDNI | 🟡 ŚREDNI | P2 |
| 9.2 | PDF report (ze zdjęciami aktów + danymi) | 🟡 ŚREDNI | 🟡 ŚREDNI | P2 |
| 9.3 | Backup/Restore (JSON snapshot) | 🟢 WYSOKI | 🟢 ŁATWY | P1 |
| 9.4 | Workflow metrics (czasami/akt, błędy/skan, etc.) | 🔴 NISKI | 🟢 ŁATWY | P3 |

### **Kategoria 10: Mobile & Offline (3 pomysły)**

**Problem:** Czasem pracujesz offline lub na tablecie przy skanach.

| ID | Pomysł | Impact | Effort | Status |
|---|--------|--------|--------|--------|
| 10.1 | Service Worker (pracuj offline, sync gdy internet) | 🟢 WYSOKI | 🟡 ŚREDNI | P2 |
| 10.2 | Responsive layout (tablet/mobile mode) | 🟢 WYSOKI | 🟡 ŚREDNI | P1 |
| 10.3 | Keyboard-only workflow (bez myszy, pełna nawigacja) | 🟡 ŚREDNI | 🟡 ŚREDNI | P1 |

---

### **📊 Triage & Scoring**

**Matryca Impact × Effort:**

```
         Łatwe          Średnie         Trudne
Wysoki  [DO ZARAZ]     [PLANUJ]       [ROZWAŻ]
        1.2,1.8,2.x    1.3,3.1,4.1    8.2,9.2
Średni  [ZRÓB]         [OPCJ.]        [CZEKAJ]
        1.5,1.4,5.2    7.2,5.3,8.1    (brak)
Niski   [SKIP]         [POMYŚL]       [LATER]
        (brak)         4.5,6.5        (brak)
```

**MUST-HAVE (P0) - Next Sprint:**
1. 📋 Progress bar (4.1)
2. 🎨 Color-code fields (6.1)
3. 🎨 Color-code records (6.2)
4. ⌨️ Tab navigation (2.1-2.3)
5. ⌨️ Ctrl+R/A/N shortcuts (2.4-2.6)
6. 💾 Copy previous values (1.8, 5.2)
7. 🔍 Auto-zoom to ROI (3.1-3.2)
8. 📋 Visual field status (4.2)

**SHOULD-HAVE (P1) - 2-3 weeks:**
9. 📚 Smart defaults history (1.1)
10. 📚 Słowniki (1.3, 1.4)
11. ↩️ Undo/Redo (4.3)
12. 🔍 Focus mode (3.3)
13. ⚠️ Validation/hints (7.1-7.4)
14. 🔗 Person linking (8.1)
15. 📤 JSON backup (9.3)
16. 📱 Responsive (10.2, 10.3)

**NICE-TO-HAVE (P2+) - Later:**
17. 🗺️ Mini-map (4.5)
18. 🧬 Family tree (8.2)
19. 📄 GEDCOM export (9.1)
20. 📊 Metrics (9.4)
21. ☁️ Offline sync (10.1)

---

### **🚀 3-Phase Implementation Roadmap**

#### **PHASE 6.1: Workflow Acceleration (Week 1-2) ⭐ ASAP**

**Goal:** Zwiększyć prędkość indeksowania o 2x (60s → 30s per record)

**Includes:**
- ✅ Smart defaults (copy previous)
- ✅ Tab navigation (Sec)
- ✅ Keyboard shortcuts (Ctrl+R, +A, +N, +Z)
- ✅ Auto-zoom to ROI/Act
- ✅ Progress bar
- ✅ Color-coded fields/records
- ✅ Visual field status

**Estimated:** 12-16 hours  
**Tools:** HTML/CSS/JS (no new libraries)

#### **PHASE 6.2: Data Quality (Week 3-4) ⭐ HIGH PRIORITY**

**Goal:** Zmniejszyć błędy i czasy korekty o 50%

**Includes:**
- ✅ Undo/Redo stack
- ✅ Live validation + hints
- ✅ Copy ROI from previous field
- ✅ Focus mode (hide UI)
- ✅ JSON backup/restore
- ✅ Responsywny layout

**Estimated:** 10-14 hours  
**Tools:** State machine (Undo), LocalStorage (backup)

#### **PHASE 6.3: Advanced Features (Month 2+) 🎯 FUTURE**

**Goal:** Integracja genealogiczna i raportowanie

**Includes:**
- ✅ Person linking + visual tree
- ✅ GEDCOM export
- ✅ Metrics/analytics
- ✅ Service Worker (offline)
- ✅ Advanced auto-detection

**Estimated:** 20-30 hours  
**Tools:** Graph DB (tree), GEDCOM lib, Charts

---

### **⌨️ Docelowe Skróty Klawiszowe (Phase 6.1)**

| Skrót | Akcja |
|-------|-------|
| **Tab** | Następne pole |
| **Shift+Tab** | Poprzednie pole |
| **Enter** | Zapisz rekord → następny |
| **Ctrl+R** | Toggle ROI dla bieżącego pola |
| **Ctrl+A** | Toggle Act boundary |
| **Ctrl+N** | Nowy rekord |
| **Ctrl+Z** | Undo (Phase 6.2) |
| **Ctrl+Y** | Redo (Phase 6.2) |
| **Ctrl+C** | Copy pole (Phase 6.2) |
| **Ctrl+V** | Paste pole (Phase 6.2) |
| **Ctrl+Shift+V** | Paste z poprz. rekordu |
| **Escape** | Anuluj ROI / Close modal |
| **F1** | Help (contextual) |

---

### **🎯 Expected Impact**

**Prędkość indeksowania:**
- Bez optymalizacji: 60-90s per rekord
- Z Phase 6.1: 25-35s per rekord (-60% czasu!)
- Z Phase 6.1+6.2: 15-20s per rekord (-75% czasu!)

**Błędy:**
- Bez: ~5-8% błędów (odkrywane post-hoc)
- Z Phase 6.2: ~1-2% błędów (caught live)

**Flux:** 
- Bez: 5 rekordów/godzinę
- Z Phase 6.1: 10-12 rekordów/godzinę
- Z Phase 6.1+6.2: 15-18 rekordów/godzinę (+250% produktywności!)

---

### **Status: 🔄 PLANNING**

- 📋 Design complete (10 categories, 100+ ideas triaged)
- 🔍 P0/P1/P2 prioritized
- 🏗️ Architecture planned (3 phases)
- 🚀 Ready for Phase 6.1 implementation

**Next Steps:**
1. Implement Phase 6.1 (2-3 weeks)
2. Test with real genealogy users
3. Iterate based on feedback
4. Move to Phase 6.2

---

> **Tip:** Każdy ulepsz z Phase 6.1 pojedynczo badamy, testujemy, potem merge'ujemy. Nie robimy wszystko jednocześnie.

---

> **Tip:** Gdy otwierasz BRAINSTORM.md, powinieneś widzieć:
> - Gdzie jesteśmy teraz (jakie problemy rozwiązujemy)
> - Co czeka nas w przyszłości (backlog)
> - Dlaczego wybraliśmy to rozwiązanie a nie inne (historia decyzji)
