# 🎯 NAJPROSTSZE ZADANIA Z ROADMAPY

**Wygenerowano:** 20 grudnia 2025  
**Źródło:** Analiza WORKFLOW_SUMMARY.md, BRAINSTORM.md, WACHLARZ-SPECIFICATION.md

---

## 📊 TOP 10: Najprostsze Zadania (Gotowe do Implementacji Natychmiast)

### 🟢 **TIER 1: Najmniejszy Effort (< 2 godziny)**

#### 1. **Ctrl+A: Keyboard Shortcut dla Act Mode**
- **Opis:** Dodaj obsługę klawisza Ctrl+A (Mac: Cmd+A) aby włączyć tryb zaznaczania całych aktów
- **Plik:** `public/viewer-osd-v7.html`
- **Kod do zmian:** W funkcji `setupKeyboardShortcuts()`
- **Linia referencyjna:** ~2750 (tam już są inne skróty Ctrl+S, Ctrl+D, itd)
- **Rozmiar kodu:** ~5 linii
- **Testowanie:** 2 minuty (wciśnij Ctrl+A, sprawdź czy `app.actMode` zmienia się)
- **Zależności:** Brak
- **Status:** Kod już istnieje w `toggleActMode()`, tylko brakuje keyboard handler

```javascript
// DODAJ W setupKeyboardShortcuts():
if (isCtrl && e.key.toLowerCase() === 'a') {
    e.preventDefault();
    toggleActMode();
}
```

**Dlaczego proste:**
- Funkcja `toggleActMode()` już istnieje i działa
- Wzorzec do skopiowania z `Ctrl+S` (2 linijki różnicy)
- Brak zmian w UI ani logice

---

#### 2. **Search Input: Podstawowa Wyszukiwarka Rekordów**
- **Opis:** Wyszukiwarka już ma input (`#searchInput`), tylko brakuje logiki
- **Plik:** `public/viewer-osd-v7.html`
- **Kod do zmian:** Nowa funkcja `setupSearchInput()` + event listener
- **Rozmiar kodu:** ~15 linii
- **Testowanie:** 3 minuty (wpisz coś, sprawdź czy rekordy się filtrują)
- **Zależności:** Istniejący `renderRecordsSidebar()`
- **Status:** HTML istnieje, JavaScript brakuje

```javascript
// DODAJ:
function setupSearchInput() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (!query) {
            renderRecordsSidebar();  // pokaż wszystko
            return;
        }
        
        // Filtruj rekordy po wartościach w data{}
        const filtered = app.records.filter(r => 
            Object.values(r.data || {}).some(v => 
                v.toString().toLowerCase().includes(query)
            )
        );
        renderRecordsSidebar(filtered);
    });
}
```

**Dlaczego proste:**
- HTML już istnieje (`#searchInput`)
- Logika filtrowania jest trywialna (2x `.filter()`)
- Można skopiować/dostosować z istniejącej logiki

---

#### 3. **JSON Import: Odczyt Pliku i Przywrócenie Sesji**
- **Opis:** Przycisk "Import JSON" ładuje wcześniej wyeksportowany plik
- **Plik:** `public/viewer-osd-v7.html`
- **Kod do zmian:** Funkcja `importFromJSON()`
- **Rozmiar kodu:** ~20 linii
- **Testowanie:** 5 minut (eksportuj, zamknij, importuj, sprawdź dane)
- **Zależności:** Istniejący `exportToJSON()` i `loadStorage()`
- **Status:** Eksport istnieje, import brakuje

```javascript
// DODAJ:
function importFromJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                app.records = data.records || [];
                app.images = data.images || [];
                app.currentTemplate = data.currentTemplate || 'births';
                saveStorage();
                location.reload();  // reload UI
                notify('✅ Import zakończony', 'success');
            } catch (err) {
                notify('❌ Błąd parsowania JSON', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}
```

**Dlaczego proste:**
- Zerkotypowy wzór (file picker → JSON parse → save)
- Istniejące funkcje do ponownego użycia
- Zero zmian w UI (przycisk już istnieje)

---

### 🟡 **TIER 2: Mały Effort (2-4 godziny)**

#### 4. **Tab Navigation: Poruszanie Się Po Polach Klawiszem Tab**
- **Opis:** Tab idzie do następnego pola, Shift+Tab do poprzedniego
- **Plik:** `public/viewer-osd-v7.html`
- **Kod do zmian:** Funkcja `setupTabNavigation()`, override default Tab behavior
- **Rozmiar kodu:** ~30 linii
- **Testowanie:** 10 minut (Tab po polach, Shift+Tab wstecz)
- **Zależności:** Istniejący `setupFormEvents()`
- **Status:** HTML formularza istnieje, trzeba tylko interceptować Tab keydown
- **Effort:** ~2 godziny

```javascript
// DODAJ w setupFormEvents():
container.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && e.target.classList.contains('field-input')) {
        e.preventDefault();
        const fields = Array.from(container.querySelectorAll('.field-input'));
        const currentIdx = fields.indexOf(e.target);
        const nextIdx = e.shiftKey ? currentIdx - 1 : currentIdx + 1;
        if (nextIdx >= 0 && nextIdx < fields.length) {
            fields[nextIdx].focus();
        }
    }
}, true);
```

**Dlaczego proste:**
- Logika: znaleźć indeks, przejść do następnego/poprzedniego
- Wzorzec do skopiowania z istniejącego arrow-key handlingu
- Testowanie jest oczywiste

---

#### 5. **Progress Bar: Licznik Pól Wypełnionych**
- **Opis:** UI pokazuje "4/7 pól" dla bieżącego rekordu, "2/5 rekordów" dla obrazu
- **Plik:** `public/viewer-osd-v7.html`
- **Kod do zmian:** Funkcja `updateProgressBar()` + HTML progress element
- **Rozmiar kodu:** ~40 linii (25 JS + 15 CSS)
- **Testowanie:** 5 minut (wypełnij pola, obserwuj progress)
- **Zależności:** Istniejący `selectRecord()`
- **Status:** Brakuje całkowicie
- **Effort:** ~2-3 godziny

```javascript
function updateProgressBar() {
    if (!app.currentRecordId) return;
    
    const record = app.records.find(r => r.id === app.currentRecordId);
    if (!record) return;
    
    // Licznik pól
    const fieldsTotal = Object.keys(record.rois || {}).length;
    const fieldsCompleted = Object.keys(record.data || {}).filter(k => record.data[k]).length;
    
    // Licznik rekordów
    const recordsTotal = app.records.filter(r => r.imageIdx === app.currentImageIdx).length;
    const recordsIdx = app.records.filter(r => r.imageIdx === app.currentImageIdx).indexOf(record);
    
    document.getElementById('progressBar').textContent = 
        `${fieldsCompleted}/${fieldsTotal} pól | Akt ${recordsIdx + 1}/${recordsTotal}`;
}
```

**Dlaczego proste:**
- Logika: policzyć true values w `record.data`
- Dwa proste liczniki (`filter().length`)
- CSS: jeden prosty `<div>` na dole ekranu

---

#### 6. **Color-Coded Fields: Zielony Pasek Po Lewej dla "Wypełnione"**
- **Opis:** Inputy z `has-roi` mają już zielony pasek - rozszerz na wszystkie status (🟢 done, 🟡 partial, 🔴 empty)
- **Plik:** `public/viewer-osd-v7.html`
- **Kod do zmian:** CSS + funkcja `updateFieldColors()`
- **Rozmiar kodu:** ~30 linii (10 CSS + 20 JS)
- **Testowanie:** 3 minuty (wizualne - sprawdzić kolory)
- **Zależności:** Istniejący `.form-group input` CSS
- **Status:** Brakuje logiki (CSS klasys już mogą być)
- **Effort:** ~2 godziny

```css
/* DODAJ/ZMIEŃ: */
.form-group input.field-complete {
    border-left: 4px solid #10b981;  /* zielony */
}
.form-group input.field-partial {
    border-left: 4px solid #f59e0b;  /* żółty */
}
.form-group input.field-empty {
    border-left: 4px solid #ef4444;  /* czerwony */
}
```

```javascript
function updateFieldColors() {
    if (!app.currentRecordId) return;
    const record = app.records.find(r => r.id === app.currentRecordId);
    if (!record) return;
    
    document.querySelectorAll('.field-input').forEach(input => {
        const fieldId = input.dataset.field;
        const value = record.data?.[fieldId];
        const hasROI = !!record.rois?.[fieldId];
        
        input.classList.remove('field-complete', 'field-partial', 'field-empty');
        if (value && hasROI) input.classList.add('field-complete');
        else if (value || hasROI) input.classList.add('field-partial');
        else input.classList.add('field-empty');
    });
}
```

**Dlaczego proste:**
- CSS: 3 proste klasy z kolorami
- Logika: sprawdzić czy `value` i czy `ROI` istnieje
- Wywoływać po każdej zmianie (już masz `selectRecord()`)

---

### 🔵 **TIER 3: Średni Effort (4-8 godzin) - ALE BARDZO WARTE**

#### 7. **Copy Previous Record: Ctrl+C Duplikuje Poprzedni Akt**
- **Opis:** Ctrl+C kopiuje wartości z poprzedniego rekordu na tej stronie do bieżącego
- **Plik:** `public/viewer-osd-v7.html`
- **Kod do zmian:** Funkcja `copyPreviousRecord()` + keyboard handler
- **Rozmiar kodu:** ~20 linii
- **Testowanie:** 5 minut (utwórz 2 rekordy, Ctrl+C, sprawdź czy skopiował)
- **Zależności:** Istniejące `app.records`, `selectRecord()`
- **Status:** Logika już istnieje (v7.1 Feature C)
- **Effort:** ~1 godzina (ale wymaga debugowania współpracy z resztą)

```javascript
function copyPreviousRecord() {
    if (!app.currentRecordId) {
        notify('❌ Nie ma aktywnego rekordu', 'error');
        return;
    }
    
    const records = app.records.filter(r => r.imageIdx === app.currentImageIdx);
    const currentIdx = records.findIndex(r => r.id === app.currentRecordId);
    
    if (currentIdx <= 0) {
        notify('⚠️ Brak poprzedniego aktu', 'warning');
        return;
    }
    
    const previousRecord = records[currentIdx - 1];
    const currentRecord = records[currentIdx];
    
    // Kopiuj data{}
    currentRecord.data = { ...previousRecord.data };
    
    // Opcjonalnie kopiuj ROI (jeśli na tej samej stronie)
    currentRecord.rois = { ...previousRecord.rois };
    
    saveStorage();
    selectRecord(app.currentRecordId);  // refresh UI
    notify(`✅ Skopiowano z poprzedniego aktu`, 'success');
}
```

**Dlaczego proste (ale warte):**
- Logika: znaleźć poprzedni rekord → spread operator
- Savings: 30-60 sekund per rekord (!)
- Już implementacja w v7.1, trzeba tylko test

---

#### 8. **Auto-Zoom to ROI: Po Kliknięciu Pola, Zoom do Jego ROI**
- **Opis:** Gdy user kliknie pole w formularzu, obraz automatycznie zoomuje do tego ROI
- **Plik:** `public/viewer-osd-v7.html`
- **Kod do zmian:** Funkcja `zoomToROI()` już istnieje, trzeba tylko wołać z focusin
- **Rozmiar kodu:** ~5 linii zmian
- **Testowanie:** 2 minuty (kliknij pole, sprawdzą czy zoom się dzieje)
- **Zależności:** Istniejący `zoomToROI()`, `setupFormEvents()`
- **Status:** Funkcja istnieje, handler musi zawoła
- **Effort:** ~1 godzina (głównie testy)

```javascript
// ZMIEŃ w setupFormEvents() focusin handler:
if (e.target.classList.contains('field-input')) {
    app.activeField = e.target;
    const fieldId = e.target.dataset.field;
    const roi = app.records.find(r => r.id === app.currentRecordId)?.rois?.[fieldId];
    
    if (roi) {
        zoomToROI(roi);  // AUTO-ZOOM!
    }
    redrawROIs();
}
```

**Dlaczego proste:**
- Funkcja `zoomToROI()` już działa (testowana)
- Jedna linijka warunkowa
- Zero zmian w UI

---

#### 9. **Auto-Zoom to Act: Na Starcie Rekordu, Zoom do ActROI Granicy**
- **Opis:** Gdy user wybierze rekord, obraz zoomuje do całego `actROI`
- **Plik:** `public/viewer-osd-v7.html`
- **Kod do zmian:** Funkcja `selectRecord()` + wołaj `zoomToAct()` jeśli istnieje
- **Rozmiar kodu:** ~5 linii zmian
- **Testowanie:** 2 minuty
- **Zależności:** Istniejący `zoomToAct()` (trzeba sprawdzić czy istnieje)
- **Status:** `zoomToAct()` może nie istnieć, trzeba sprawdzić
- **Effort:** ~1 godzina

```javascript
// ZMIEŃ w selectRecord():
function selectRecord(recordId) {
    app.currentRecordId = recordId;
    const record = app.records.find(r => r.id === recordId);
    
    // ... istniejący kod populating form ...
    
    // DODAJ:
    if (record.actROI) {
        zoomToAct(record.actROI);
    }
    
    redrawROIs();
}
```

**Dlaczego proste:**
- Jedna warunkowa + jedna funkcja
- Ulepsza UX znośnie

---

### 🔴 **TIER 4: Większy Effort (8+ godzin) - Ale Wartościowe**

#### 10. **Wachlarz Podpowiedzi v1.5: Implementacja Paraboli**
- **Opis:** Zamień listę sugestii na ergonomiczny wachlarz paraboli
- **Plik:** `public/viewer-osd-v7.html`
- **Kod do zmian:** 4 fazy (zobacz `WACHLARZ-SPECIFICATION.md`)
- **Rozmiar kodu:** ~200 linii (HTML + CSS + JS)
- **Testowanie:** 1-2 godziny
- **Zależności:** Istnieje `showSuggestionsForField()`
- **Status:** Wymaga całkowitego przepisania
- **Effort:** **2-4 DNI** (ale plan jest gotowy!)
  - Phase 1: Prototyp Canvas (1-2 dni)
  - Phase 2: Integracja (1-2 dni)
  - Phase 3: Kalibracja (1 dzień)
  - Phase 4: Polish (1 dzień)

**Dlaczego warte:**
- -60% czasu wyboru sugestii (< 1s vs 2-3s)
- Jeden tylko ruch nadgarstkiem (ergonomia)
- Plan + kod do skopiowania już gotowe

---

## 📈 Ranking Według Priorytetu & Effortu

| Lp | Zadanie | Effort | Impact | Priorytet | Czym Zacząć |
|----|---------|--------|--------|-----------|------------|
| 1 | Ctrl+A keyboard | <1h | Mały | HIGH | Copy z Ctrl+S pattern |
| 2 | Search input | 1-2h | Średni | HIGH | Filter + renderSidebar |
| 3 | JSON import | 1-2h | Średni | MEDIUM | Odzerkać export |
| 4 | Tab navigation | 2h | Duży | HIGH | DOM traversal + focus |
| 5 | Progress bar | 2-3h | Mały | MEDIUM | Counter logic |
| 6 | Color-coded fields | 2h | Mały | LOW | CSS + classList |
| 7 | Copy prev record | 1h | **Duży** | **HIGH** | Spread operator |
| 8 | Auto-zoom ROI | 1h | Duży | MEDIUM | One-liner call |
| 9 | Auto-zoom Act | 1h | Średni | MEDIUM | One-liner call |
| 10 | Wachlarz v1.5 | 2-4d | **Ogromny** | **FUTURE** | Cała spec gotowa |

---

## 🎯 REKOMENDACJA: GDY ZACZĄĆ?

### **Dzisiaj (< 5 godzin):**
1. ✅ **Ctrl+A** (15 min)
2. ✅ **Search input** (1h)
3. ✅ **JSON import** (1h)
4. ✅ **Auto-zoom ROI** (30 min)
5. ✅ **Auto-zoom Act** (30 min)

**Razem:** Właściwie lepiej zintegrowany UI, bez większych zmian

### **Ten Tydzień (16-20 godzin):**
1. ✅ **Tab navigation** (2h) ← KEY FEATURE
2. ✅ **Copy prev record** (1h) ← KEY FEATURE, huge time savings
3. ✅ **Progress bar** (2h)
4. ✅ **Color-coded fields** (2h)
5. ✅ **Testy & bugfixes** (4h)

**Razem:** Phase 6.1 ready (Workflow Acceleration) - 60% faster!

### **Następny Miesiąc (v7.2+):**
1. **Wachlarz v1.5** (2-4 dni) ← Super rewarding
2. **Undo/Redo** (Phase 6.2, ~3 dni)
3. **Live Validation** (Phase 6.2)

---

## 📍 GDY CHCESZ SKOPIOWAĆ KOD

Każde zadanie ma:
- 📄 Snippet gotowy do copy-paste
- 📍 Dokładna lokalizacja w pliku (linia, sekcja)
- 🧪 Jak testować (3-5 minut max)
- ✅ Czeki do zrobienia

Wszystkie snippety są **już bezpośrednio w tym dokumencie** - wystarczy skopiować!

---

**Czy chcesz, bym pokazał ci dokładnie gdzie w `viewer-osd-v7.html` wstawić każdy snippet?**
