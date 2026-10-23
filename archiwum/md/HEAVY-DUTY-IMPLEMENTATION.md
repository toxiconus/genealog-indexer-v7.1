# 🔧 HEAVY-DUTY PRESET - EKSPERYMENT POTOKU

**Data:** 20 grudnia 2025  
**Status:** ✅ IMPLEMENTACJA UKOŃCZONA

## 📋 Co zostało zaimplementowane

### 1. **Nowe Funkcje Przetwarzania (OpenCV.js)**

#### A. Background Subtraction
```javascript
function backgroundSubtraction(imageData, kernelSize = 21)
```
- **Cel:** Wyrównanie nierównego oświetlenia tła
- **Metoda:** Estimacja tła za pomocą morphology opening, następnie subtraction
- **Benefit:** Usuwa efekt "gradientu" - gdy oświetlenie zmienia się na stronie
- **Czytnik dokumentów:** Czysta biały papier bez cieni

#### B. Morphology Close
```javascript
function morphologyClose(imageData, kernelSize = 5)
```
- **Cel:** Połączenie przerwanych kresek liter
- **Metoda:** Dylatacja + erozja (MORPH_CLOSE w OpenCV)
- **Benefit:** Przetłumaczony tekst ma gładsze krawędzie
- **OCR:** Lepsze rozpoznanie słów z przerwanymi literami (np. "folgowlce" → "folgowlce")

#### C. Auto-Invert Detection
```javascript
function autoInvert(imageData) → boolean
function invertColors(imageData)
```
- **Cel:** Detekcja tekstu białego na czarnym tle
- **Metoda:** Analiza > 70% pikseli ciemnych → inwertuj
- **Benefit:** Automatycznie ustawi czarny tekst na białym
- **Use case:** Stare druki negatywowe, teksty wygrawerowane

### 2. **Nowy Preset: 'heavy-duty'**

```javascript
'heavy-duty': {
    levels: 40,                    // Zwiększony kontrast
    autoContrast: true,            // Auto histogram
    archival: 100,                 // MAX: wzmocnienie wyblakłych
    descreen: 50,                  // Usunięcie sitowia
    sepia: 10,                     // Lekkie ciepłe tony
    hue: 0,                        // Bez rotacji barwy
    saturation: 70,                // Zmniejszona nasycenie
    invert: 0,                     // Brak początkowej inwersji
    adaptiveThreshold: 80,         // Agresywna binaryzacja (blockSize=31, C=5)
    gaussianBlur: 1,               // Słaby blur (radius=1)
    medianBlur: 3,                 // Median kernel=3
    histogramEq: true,             // Wyrównanie histogramu
    backgroundSubtraction: 50,     // ← NOWE: wyrównanie tła
    morphologyClose: 50,           // ← NOWE: połączenie kresek
    autoInvert: true               // ← NOWE: auto-detect
}
```

### 3. **Rozszerzona Pipeline (10 kroków)**

```
STEP 1: Canvas GPU Filters
├─ Levels: 40 (brightness boost)
├─ AutoContrast: ON (contrast 1.3x)
├─ Sepia: 10%
└─ Saturation: 70%

STEP 2: Histogram Equalization (OpenCV)
└─ Rozszerza zakres dynamiczny

STEP 3: Background Subtraction (OpenCV) ← NOWE
└─ kernelSize: 50 → wyrównanie nierównego tła

STEP 4: Gaussian Blur (OpenCV)
└─ kernelSize: 1 → słaby blur (denoising)

STEP 5: Median Blur (OpenCV)
└─ kernelSize: 3 → usunięcie salt-pepper noise

STEP 6: Archival Enhancement
└─ strength: 100 → boost kontrastu dla wyblakłych

STEP 7: Descreen (removes halftone)
└─ strength: 50 → blur do 15px (removes scanlines)

STEP 8: Adaptive Threshold (OpenCV)
└─ blockSize: 31, C: 5 → lokalna binaryzacja

STEP 9: Morphology Close (OpenCV) ← NOWE
└─ kernelSize: 50 → połączenie przerwanych kresek

STEP 10: Auto-Invert (OpenCV) ← NOWE
└─ Jeśli >70% ciemnych → inwertuj dla OCR
```

## 🎯 Kiedy Użyć Heavy-Duty?

| Dokument | Heavy-Duty? | Czemu |
|----------|:-----------:|-------|
| Słaby/wyblakły tekst | ✅ | archival: 100 + histogram eq |
| Nierówne oświetlenie | ✅ | background subtraction |
| Rozmazane krawędzie | ✅ | morphology close |
| Papierowy szum | ✅ | gaussian + median blur |
| Tekst do OCR | ✅ | adaptive threshold 80% |
| Jasny obraz (dobry contrast) | ❌ | Za agresywny |
| Dokument nowoczesny (kolorowy) | ❌ | Stracimy kolory |

## 📊 Oczekiwane Rezultaty

### Przed Heavy-Duty:
```
Dokument genealogiczny XIX wieku
- Tekst wyblakły (~40% czarności)
- Papier żółty/brązowy
- Nierówne oświetlenie (ciemniej u góry)
- Papierowy szum (widoczne włókna)
- Wygrawerowane słowa (cienkie kreski)
```

### Po Heavy-Duty:
```
- ✅ Tekst wyraźny (kontrast: 100)
- ✅ Papier = czysty biały (background subtraction)
- ✅ Oświetlenie równomierne
- ✅ Szum usunięty
- ✅ Krawędzie liter ostre (morphology)
- ✅ Gotowy do OCR (adaptive threshold)
```

## 🧪 Instrukcje Testowania

### 1. Uruchom aplikację
```bash
npm run dev
# Otwórz http://localhost:5173/viewer-osd-v7.html
```

### 2. Wgraj testowy obraz
- Kliknij **Otwórz** (Upload imagen)
- Wybierz trudny dokument genealogiczny (wyblakły, żółty, nierówne oświetlenie)

### 3. Zastosuj Heavy-Duty
- Kliknij **Postprocess** (guzik w toolbar)
- Pojawi się panel z preset buttonami
- Kliknij **HEAVY-DUTY** ← NOWY PRESET
- Efekt powinien być widoczny w czasie rzeczywistym

### 4. Sprawdź Console (F12)
Powinny być logi:
```
🎨 Background Subtraction: Wyrównanie nierównego tła...
✅ Background Subtraction applied (kernel: 50)
🎨 Gaussian Blur: ...
✅ Gaussian Blur applied (kernel: 1)
✅ Median Blur applied (kernel: 3)
✅ Adaptive Threshold applied (blockSize: 31, constant: 5)
🎨 Morphology Close: Połączenie przerwanych kresek...
✅ Morphology Close applied (kernel: 50)
🎨 Auto-Invert: 75.3% ciemnych pikseli - INWERTUJ
✅ Auto-Invert applied (tekst był biały na czarnym)
```

### 5. Porównaj Efekty
- Oryginał vs Heavy-Duty (z i bez presetu)
- Tekst powinien być czytelniejszy
- Papier powinien być białszy
- Shadows powinny być równomierne

## 📈 Czasy Przetwarzania (Szacunki)

| Filtry | Czas |
|--------|------|
| Canvas GPU (step 1-2) | <50ms |
| Background Subtraction | ~100-200ms |
| Gaussian + Median | ~50-100ms |
| Adaptive Threshold | ~200-300ms |
| Morphology Close | ~150-250ms |
| Auto-Invert | ~30ms |
| **RAZEM** | **~700-1100ms** |

*Czasy dla obrazu 3000x4000px na nowoczesnym procesorze*

Pierwsza klawiatura OpenCV (loading WASM): ~2-3s
Następne uruchomienia: ~500-800ms

## ⚙️ Konfiguracja Presetów

### Aby Dostosować Heavy-Duty:
Edytuj w `viewer-osd-v7.html` linia ~2710:

```javascript
'heavy-duty': {
    levels: 40,                    // ← Zwiększ dla jaśniejszych img
    archival: 100,                 // ← 0-100 (niezmiennie 100)
    descreen: 50,                  // ← 0-100 (dla sitowia)
    adaptiveThreshold: 80,         // ← 0-100 (dla binaryzacji)
    gaussianBlur: 1,               // ← 0-10 (denoising)
    medianBlur: 3,                 // ← 0-10 (salt-pepper)
    backgroundSubtraction: 50,     // ← 0-100 (tło)
    morphologyClose: 50,           // ← 0-100 (krawędzie)
    autoInvert: true               // ← true/false
}
```

## 🔍 Debugowanie Problemów

### Problem: Tekst znika (zaciemnia się)
```javascript
// Zmniejsz archival:
archival: 50  // zamiast 100
// LUB zmniejsz adaptiveThreshold:
adaptiveThreshold: 60  // zamiast 80
```

### Problem: Tło jest szare (nie białe)
```javascript
// Zwiększ backgroundSubtraction:
backgroundSubtraction: 70  // zamiast 50
```

### Problem: Krawędzie liter nadal rozmazane
```javascript
// Zwiększ morphologyClose:
morphologyClose: 70  // zamiast 50
```

### Problem: Pola się nie renderują / timeout
- OpenCV.js się ładuje pierwszy raz (~2-3s)
- Druga próba będzie szybsza (~500ms)
- Jeśli problem trwa → otwórz console (F12) i sprawdzić błędy

## 📂 Pliki Zmienione

- `public/viewer-osd-v7.html` (3500+ linii)
  - +70 linii: `backgroundSubtraction()`, `morphologyClose()`, `autoInvert()`, `invertColors()`
  - +50 linii: Rozszerzenie `applyPostprocessFilters()` (STEP 3, 9, 10)
  - +30 linii: Nowy preset `'heavy-duty'` z 15 parametrami
  - +5 linii: Tooltip dla presetu w UI

## ✅ Checklist Implementacji

- [x] Funkcja `backgroundSubtraction()` - wyrównanie tła
- [x] Funkcja `morphologyClose()` - połączenie kresek
- [x] Funkcja `autoInvert()` - detekcja jasnego tekstu
- [x] Funkcja `invertColors()` - inwersja pikseli
- [x] Preset `'heavy-duty'` z 15 parametrami
- [x] Integracja w `applyPostprocessFilters()` (STEP 3, 9, 10)
- [x] Aktualizacja `postprocessState` init
- [x] Aktualizacja `resetPostprocessing()`
- [x] Aktualizacja `applyPreset()` dla nowych zmiennych
- [x] UI button automatycznie pojawi się w preset grid
- [x] Tooltip "🔧 Dla najtrudniejszych..."
- [x] Console logi z 🎨 emoji
- [x] Backup v7 prije zmian

## 🚀 Następne Kroki (Opcjonalne)

1. **Fine-tune parametrów** - based na rzeczywistych dokumentach
2. **Performance optimization** - cache intermediate results
3. **Profiling** - which step takes longest?
4. **Nowe presets oparte na heavy-duty:**
   - `heavy-duty-lite` (szybsza wersja, bez background subtraction)
   - `heavy-duty-pro` (bardziej agresywna morphology)
5. **Exportuj heavy-duty jako preset** - do JSON dla import/export

---

**Autor:** AI Assistant | **Test:** Pending (czeka na testowanie z rzeczywistymi dokumentami)
