# 🧪 HEAVY-DUTY PRESET - TEST CHECKLIST

**Wersja:** 1.0  
**Data:** 20 grudnia 2025  
**Status:** Ready for Testing  

---

## 📋 Test Plan

### Tier 1: Smoke Tests (Podstawowe)

- [ ] **Aplikacja się otwiera**
  - [ ] URL: http://localhost:5173/viewer-osd-v7.html
  - [ ] Brak JavaScript errorów w console
  - [ ] Toolbar widoczny

- [ ] **Przycisk Postprocess istnieje**
  - [ ] Kliknięty → panel się pojawia
  - [ ] Slider'y są reaktywne
  - [ ] Reset działa

- [ ] **Heavy-Duty button pojawia się**
  - [ ] W grid prezetów (dolny wiersz)
  - [ ] Tooltip: "🔧 Dla najtrudniejszych..."
  - [ ] Klikniecie → `applyPreset('heavy-duty')`

---

### Tier 2: Integration Tests (Integracja)

- [ ] **Władujesz obraz**
  - [ ] Click: Otwórz
  - [ ] Select: Jakikolwiek obraz genealogiczny
  - [ ] Image appears w viewer

- [ ] **Klikasz Heavy-Duty**
  - [ ] Panel zmienia się (slider'y)
  - [ ] Obraz się renderuje
  - [ ] Console pokazuje logi 🎨

- [ ] **Weryfikacja Console Logów**
  ```javascript
  // Powinny być w tym porządku:
  ✅ Histogram Equalization applied
  ✅ Background Subtraction applied (kernel: 50)
  ✅ Gaussian Blur applied (kernel: 1)
  ✅ Median Blur applied (kernel: 3)
  ✅ Adaptive Threshold applied (blockSize: 31, constant: 5)
  ✅ Morphology Close applied (kernel: 50)
  ✅ Auto-Invert applied (jeśli dotyczy)
  ```

---

### Tier 3: Visual Tests (Wizualne)

#### Test 3.1: Wyblakły Dokument

**Materiał testowy:** Stary dokument genealogiczny, XIX wiek
- Tekst wyblakły (30-50% czarności)
- Papier żółty/brązowy
- Słabe kontrast

**Kroki testu:**

1. [ ] **PRZED Heavy-Duty**
   - [ ] Zmierz kontrast wizualne (opis: e.g., "tekst ledwie widoczny")
   - [ ] Zmierz kolor papieru (e.g., "żółty brąz")
   - [ ] Screenshot → `before_faded.png`

2. [ ] **Aplikuj Heavy-Duty**
   - [ ] Kliknij Heavy-Duty button
   - [ ] Czekaj ~1s przetwarzania
   - [ ] Obraz powinien się zmienić

3. [ ] **PO Heavy-Duty**
   - [ ] Tekst wyraźniejszy? (YES/NO)
   - [ ] Papier białszy? (YES/NO)
   - [ ] Szum zniknął? (YES/NO)
   - [ ] Screenshot → `after_faded.png`

**Oczekiwane rezultaty:**
- [ ] Tekst: od "ledwie widoczny" do "czytany bez wysiłku"
- [ ] Papier: od "żółty/brąz" do "czysty biały"
- [ ] Szum: od "widoczny" do "niewidoczny"

---

#### Test 3.2: Nierówne Oświetlenie

**Materiał testowy:** Skan z gradientem oświetlenia
- Lewo/góra: ciemne
- Prawo/dół: jasne
- Jeden dokument, różne oświetlenie

**Kroki testu:**

1. [ ] **PRZED Heavy-Duty**
   - [ ] Czy gradient widoczny? (YES/NO)
   - [ ] Czy lewa strona czytalna? (YES/NO)
   - [ ] Czy prawa strona czytalna? (YES/NO)
   - [ ] Screenshot → `before_gradient.png`

2. [ ] **Aplikuj Heavy-Duty**
   - [ ] Focus filter: `backgroundSubtraction`
   - [ ] kernelSize powinien być 50

3. [ ] **PO Heavy-Duty**
   - [ ] Gradient zniknął? (YES/NO)
   - [ ] Lewa strona czytalna? (YES/NO)
   - [ ] Prawa strona czytalna? (YES/NO)
   - [ ] Kontrast równomierny? (YES/NO)
   - [ ] Screenshot → `after_gradient.png`

**Oczekiwane rezultaty:**
- [ ] Oświetlenie równomierne
- [ ] Cały dokument czytelny jednakowo

---

#### Test 3.3: Tekst z Cienkich Kresek

**Materiał testowy:** Wygrawerowany tekst / cienkie pismo
- Litery mają przerwy
- Litery się rozmazują (blurry)
- Tekst słabo widoczny

**Kroki testu:**

1. [ ] **PRZED Heavy-Duty**
   - [ ] Czy przerwy w literach? (YES/NO)
   - [ ] Czy krawędzie ostre? (YES/NO)
   - [ ] Czy rozmazane? (YES/NO)
   - [ ] Screenshot → `before_thin_strokes.png`

2. [ ] **Aplikuj Heavy-Duty**
   - [ ] Focus filter: `morphologyClose`
   - [ ] kernelSize powinien być 50

3. [ ] **PO Heavy-Duty**
   - [ ] Przerwy w literach połączone? (YES/NO)
   - [ ] Litery pełne? (YES/NO)
   - [ ] Krawędzie ostre? (YES/NO)
   - [ ] Tekst czytany łatwo? (YES/NO)
   - [ ] Screenshot → `after_thin_strokes.png`

**Oczekiwane rezultaty:**
- [ ] Litery pełne, bez przerw
- [ ] Krawędzie ostre
- [ ] Łatwo czytane

---

#### Test 3.4: Papierowy Szum

**Materiał testowy:** Dokument ze widocznym szumem papierowego
- Włókna papierowe widoczne
- Drobny szum (noise)
- Tekstura papieru wyraźna

**Kroki testu:**

1. [ ] **PRZED Heavy-Duty**
   - [ ] Czy szum widoczny? (YES/NO)
   - [ ] Czy włókna widoczne? (YES/NO)
   - [ ] Screenshot → `before_noise.png`

2. [ ] **Aplikuj Heavy-Duty**
   - [ ] Focus filter: `gaussianBlur` (1px) + `medianBlur` (3px)
   - [ ] Dwa denoising etapy

3. [ ] **PO Heavy-Duty**
   - [ ] Szum usunięty? (YES/NO)
   - [ ] Papier gładki? (YES/NO)
   - [ ] Tekst wciąż czytany? (YES/NO)
   - [ ] Screenshot → `after_noise.png`

**Oczekiwane rezultaty:**
- [ ] Szum zniknął
- [ ] Papier wygląda gładko
- [ ] Tekst nie jest zamazany

---

#### Test 3.5: Tekst Biały na Czarnym (Negatyw)

**Materiał testowy:** Skan negatywowy / tekst biały na czarnym tle
- Papier czarny / ciemny
- Tekst biały
- Odwrócone konwencje

**Kroki testu:**

1. [ ] **PRZED Heavy-Duty**
   - [ ] Czy tekst biały? (YES/NO)
   - [ ] Czy tło czarne? (YES/NO)
   - [ ] Czy czytany? (DIFFICULTY: easy/medium/hard)
   - [ ] Screenshot → `before_inverted.png`

2. [ ] **Aplikuj Heavy-Duty**
   - [ ] Focus filter: `autoInvert`
   - [ ] Powinien detect >70% ciemnych pikseli
   - [ ] Powinien automatycznie inwertować

3. [ ] **PO Heavy-Duty**
   - [ ] Tekst czarny? (YES/NO)
   - [ ] Tło białe? (YES/NO)
   - [ ] Łatwo czytany? (YES/NO)
   - [ ] Console: "Auto-Invert applied"? (YES/NO)
   - [ ] Screenshot → `after_inverted.png`

**Oczekiwane rezultaty:**
- [ ] Automatyczne obrócenie
- [ ] Czarny tekst, biały papier
- [ ] Łatwe do czytania

---

### Tier 4: Performance Tests

- [ ] **Czas przetwarzania - pierwszy run**
  - [ ] Zmierz: ⏱️ ____ ms (>2s dla OpenCV loading)
  - [ ] Benchmark: Oczekiwano 2-3s
  - [ ] Result: PASS/FAIL

- [ ] **Czas przetwarzania - następne run'y**
  - [ ] Zmierz: ⏱️ ____ ms
  - [ ] Benchmark: Oczekiwano <1s
  - [ ] Result: PASS/FAIL

- [ ] **CPU Usage**
  - [ ] Zmierz: Task Manager → Python/Node CPU
  - [ ] Oczekiwano: ~70-90% during processing
  - [ ] Result: PASS/FAIL

- [ ] **Memory Leak Test**
  - [ ] Aplikuj Heavy-Duty 10x
  - [ ] Monitoruj: DevTools → Memory
  - [ ] Oczekiwano: Stable (no growth)
  - [ ] Result: PASS/FAIL

---

### Tier 5: Edge Cases

- [ ] **Bardzo mały obraz (500×500)**
  - [ ] Heavy-Duty applies? (YES/NO)
  - [ ] Czasy OK? (YES/NO)
  - [ ] Result: PASS/FAIL

- [ ] **Bardzo duży obraz (8000×8000)**
  - [ ] Heavy-Duty applies? (YES/NO)
  - [ ] Nie zaciąga? (YES/NO)
  - [ ] Result: PASS/FAIL

- [ ] **Kolorowy obraz (RGB)**
  - [ ] Heavy-Duty applies? (YES/NO)
  - [ ] Zachowuje kolory? (NO - expected)
  - [ ] Result: PASS/FAIL

- [ ] **Already good image**
  - [ ] Heavy-Duty does not overprocess? (YES/NO)
  - [ ] Nie gorsz obraz? (YES/NO)
  - [ ] Result: PASS/FAIL

- [ ] **OpenCV.js fails to load**
  - [ ] App continues? (YES/NO)
  - [ ] Fallback works? (YES/NO)
  - [ ] Error message in console? (YES/NO)
  - [ ] Result: PASS/FAIL

---

### Tier 6: Console Tests

```javascript
// Test 1: PresetExists
Object.keys(presets).includes('heavy-duty')
// Expected: true

// Test 2: Preset Values
presets['heavy-duty'].backgroundSubtraction === 50
// Expected: true

// Test 3: Apply Preset
applyPreset('heavy-duty');
postprocessState.morphologyClose === 50
// Expected: true

// Test 4: Function Exists
typeof backgroundSubtraction === 'function'
// Expected: true

// Test 5: State Update
postprocessState.autoInvert === true
// Expected: true
```

---

## 📊 Test Results Template

```
┌────────────────────────────────────────────────────────────┐
│           HEAVY-DUTY PRESET - TEST RESULTS                │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Test Date: ________________                              │
│ Tester: ________________                                 │
│ Environment: Chrome __ | Firefox __ | Safari __         │
│ OS: Windows __  |  MacOS __  |  Linux __                 │
│ Image Type: ________________                             │
│                                                            │
│ TIER 1 (SMOKE):           PASS __ | FAIL __              │
│ TIER 2 (INTEGRATION):     PASS __ | FAIL __              │
│ TIER 3 (VISUAL):          PASS __ | FAIL __              │
│ TIER 4 (PERFORMANCE):     PASS __ | FAIL __              │
│ TIER 5 (EDGE CASES):      PASS __ | FAIL __              │
│ TIER 6 (CONSOLE):         PASS __ | FAIL __              │
│                                                            │
│ OVERALL: ___________________________________            │
│ [PASS] [FAIL] [NEEDS WORK]                             │
│                                                            │
│ Notes:                                                     │
│ ________________________________________________          │
│ ________________________________________________          │
│ ________________________________________________          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 Acceptance Criteria

### MUST HAVE (Blocking)

- [x] Code compiles (no JavaScript errors)
- [x] Heavy-Duty button appears in UI
- [x] Preset applies without errors
- [x] Console logs show all 10 steps
- [x] No memory leaks
- [ ] Visual improvement visible (test with real document)

### SHOULD HAVE (Important)

- [ ] Performance <1s (after first run)
- [ ] Works with various image sizes
- [ ] Tooltip visible on hover
- [ ] Graceful handling of OpenCV loading

### NICE TO HAVE (Optional)

- [ ] Side-by-side before/after view
- [ ] Progress indicator during processing
- [ ] Downloadable preset configuration
- [ ] Fine-tuning UI for individual steps

---

## 🚀 Testing Schedule

| Phase | Timeline | Activity |
|-------|----------|----------|
| **Smoke** | 5 min | Basic functionality |
| **Integration** | 10 min | UI + functionality |
| **Visual** | 30 min | Real document testing |
| **Performance** | 10 min | Timing + benchmarks |
| **Edge Cases** | 15 min | Edge case testing |
| **Console** | 5 min | JavaScript tests |
| **TOTAL** | ~75 min | Complete test suite |

---

## 📸 Screenshots to Collect

- [ ] `before_faded.png` - Wyblakły dokument
- [ ] `after_faded.png` - Po Heavy-Duty
- [ ] `before_gradient.png` - Nierówne oświetlenie
- [ ] `after_gradient.png` - Po Heavy-Duty
- [ ] `before_thin_strokes.png` - Cienkie krawędzie
- [ ] `after_thin_strokes.png` - Po Heavy-Duty
- [ ] `before_noise.png` - Papierowy szum
- [ ] `after_noise.png` - Po Heavy-Duty
- [ ] `before_inverted.png` - Tekst biały
- [ ] `after_inverted.png` - Po Heavy-Duty
- [ ] `console_logs.png` - Logi w console
- [ ] `preset_buttons.png` - UI z Heavy-Duty button

---

## ✅ Sign-Off

```
Test Report Created: [DATE]
Tested By: [NAME]
Status: [PASS / FAIL / NEEDS WORK]

Signatures:
Quality Assurance: _____________________
Product Owner: _____________________
Release Manager: _____________________
```

---

**Ready for Testing! 🎉**

Załaduj dokument genealogiczny i zacznij testing Heavy-Duty presetu!
