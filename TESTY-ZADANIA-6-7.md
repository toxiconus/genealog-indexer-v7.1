# 🧪 TESTY: ZADANIA 6 & 7

**Czas:** 5-10 minut  
**Narzędzia:** Przeglądarka (Chrome/Firefox), v7.1

---

## 📋 TEST 1: Color-Coded Fields

### Setup
1. Otwórz: `http://localhost:5173/public/viewer-osd-v7.html`
2. Dodaj zdjęcie (test image)
3. Utwórz 1 rekord (Ctrl+N)

### Test Case 1.1: Pole Puste (🔴 Red)
- [ ] Wszystkie inputy w formie powinny być **CZERWONE** (border-left 4px solid #ef4444)
- [ ] Obserwuj box-shadow (lekko widoczny)

**Expected:**
```
┌─────────────────────┐
│🔴 child_name       │
│🔴 father_name      │
│🔴 mother_name      │
└─────────────────────┘
```

### Test Case 1.2: Pole z Wartością (🟢 Green)
- [ ] Wpisz coś w "imię dziecka": `Jan`
- [ ] Pole natychmiast zmieni się na **ZIELONE**
- [ ] Inne pola pozostają **CZERWONE**

**Expected:**
```
┌─────────────────────┐
│🟢 child_name: Jan  │
│🔴 father_name      │
│🔴 mother_name      │
└─────────────────────┘
```

### Test Case 1.3: Pole z ROI Tylko (🟡 Yellow)
- [ ] Kliknij na pole "father_name"
- [ ] Wciśnij Ctrl+R (zaznacz ROI)
- [ ] Narysuj prostokąt na obrazie
- [ ] Pole zmieni się na **ŻÓŁTE** (value puste, ale ROI istnieje)

**Expected:**
```
┌─────────────────────┐
│🟢 child_name: Jan  │
│🟡 father_name      │ (ROI marked, no value)
│🔴 mother_name      │
└─────────────────────┘
```

### Test Case 1.4: Pole Wypełnione z ROI (🟢 Green)
- [ ] Wpisz w "father_name": `Piotr`
- [ ] Pole pozostanie **ZIELONE** (bo wartość > ROI)
- [ ] Obserwuj console: powinno być `🟢 updateFieldStatus()`

**Expected:**
```
┌─────────────────────┐
│🟢 child_name: Jan  │
│🟢 father_name:Piotr│ (Both value & ROI)
│🔴 mother_name      │
└─────────────────────┘
```

### Test Case 1.5: Usunięcie Wartości (Back to Yellow)
- [ ] Wyczyść "father_name" (delete value)
- [ ] Pole zmieni się z 🟢 na 🟡 (ROI jest, ale value puste)

**Expected:**
```
Back to:
│🟡 father_name      │
```

### Test Case 1.6: Progress Bar Update
- [ ] W pasku na dole powinno być: `2/3 pól` (2 wypełnone, 3 razem)
- [ ] Po każdej zmianie wartości progress powinno się updateować

**Expected Console Output:**
```
⭐ Update progress on focus change
💡 A: Show suggestions fan when typing
🟢 updateFieldStatus() whenever value changes
```

---

## 📋 TEST 2: Copy Previous Record (Ctrl+C)

### Setup
1. Pamiętaj poprzedni setup (Jan, Piotr, itd.)
2. Dodaj **drugi rekord** (Ctrl+N)

### Test Case 2.1: Drugi Rekord Pusty
- [ ] Kliknij na "Akt 2" w panelu lewo
- [ ] Formularz powinien być pusty (wszystkie pola 🔴 red)
- [ ] Progress bar: `0/3`

**Expected:**
```
Notification: 📋 Akt 2 | 0/3 pól | 0 ROI
```

### Test Case 2.2: Ctrl+C Copy Data
- [ ] Mając focus na jakimkolwiek polu
- [ ] Wciśnij **Ctrl+C** (lub Cmd+C na Mac)
- [ ] Wszystkie pola powinny się automatycznie wypełnić danymi z Akt 1

**Expected:**
```
✨ Skopiowano z Aktu 1
📋 D: Copy Previous - Akt 2 ← Akt 1

child_name: Jan   (🟢 zielone)
father_name: Piotr (🟡 żółte - bo ROI tam było)
mother_name: [pusty] (🔴 czerwone)

Progress: 2/3 pól
```

### Test Case 2.3: Ctrl+C w Textarea (Normal Copy)
- [ ] Jeśli masz tekstareę w formularzu
- [ ] Wciśnij Ctrl+C
- [ ] Powinno być zwykłe copy (nie copyPrevious)
- [ ] Funkcja sprawdza `!isTextarea` przed vykoananiem

**Expected:** Zwykły system copy browser'a (nie notification)

### Test Case 2.4: Ctrl+C na Pierwszym Akcie (No Prev)
- [ ] Kliknij na "Akt 1"
- [ ] Wciśnij Ctrl+C
- [ ] Powinna być informacja: "ℹ️ Brak poprzedniego aktu do skopiowania"

**Expected Notification:**
```
ℹ️ Brak poprzedniego aktu do skopiowania
```

### Test Case 2.5: ROI Copy
- [ ] Jeśli Akt 1 miał zaznaczone ROI
- [ ] Po Ctrl+C, Akt 2 powinien mieć te ROI
- [ ] Obserwuj `redrawROIs()` - powinny się pojawić overlays

**Expected:**
```
✨ Skopiowano z Aktu 1
[ROI overlays pojawią się na obrazie]
```

### Test Case 2.6: Multiple Copy
- [ ] Skopiuj z Akt 1 → Akt 2 ✓
- [ ] Zmień wartość w Akt 2
- [ ] Skopiuj z Akt 2 → Akt 3 (trzeba najpierw utworzyć)
- [ ] Powinny być dane z Akt 2, nie Akt 1

**Expected:** Ostatni copy bierze z bezpośrednio poprzedniego

---

## 🖥️ Console Checks

Otwórz **DevTools (F12)** i sprawdzaj logi:

### Dla Testu 1:
```javascript
// Powinno być takie logi:
🟢 updateFieldStatus() // Po każdej zmianie
📑 Act overlay drawn: // Przy zmianach
💡 A: Show suggestions fan when typing // Jeśli Wpisz
⭐ Update progress on focus change
```

### Dla Testu 2:
```javascript
// Powinno być takie logi:
⌨️ B: Ctrl+C → Copy Previous // Wciśniecie Ctrl+C
📋 D: Copy Previous - Akt 2 ← Akt 1 // Wykonanie copy
✨ Skopiowano z Aktu 1 // Notification message
🟢 updateFieldStatus() // Update kolorów
```

---

## 🎯 Success Criteria

### ✅ Test 1 (Color-Coded) - PASS jeśli:
- [ ] Puste pola są 🔴 CZERWONE
- [ ] Pola z wartością są 🟢 ZIELONE
- [ ] Pola tylko z ROI są 🟡 ŻÓŁTE
- [ ] Progress bar zmienia się dynamicznie
- [ ] Kolory się zmieniają NATYCHMIAST (bez refresh)
- [ ] Box-shadow jest widoczny (efekt)

### ✅ Test 2 (Copy Previous) - PASS jeśli:
- [ ] Ctrl+C kopuje dane z poprzedniego aktu
- [ ] ROI też się kopiują (jeśli istnieją)
- [ ] Pola updateują się z nowymi danymi
- [ ] Progress bar się updateuje
- [ ] Kolory się automatycznie zmieniają
- [ ] Notification pojawia się
- [ ] Nie działa na textarea (zwykły copy)
- [ ] Nie działa na pierwszym akcie (info message)
- [ ] Console pokazuje prawidłowe logi

---

## 🐛 Common Issues & Fixes

| Problem | Powód | Fix |
|---------|-------|-----|
| Kolory się nie zmieniają | `updateFieldStatus()` nie jest wywoływana | Check linijki 1283, 1346, 1958, 2003 |
| Ctrl+C nie działa | Handler nie jest zaregistrowany | Check linijka 3763 |
| Ctrl+C kopuje w textarea | `isTextarea` nie jest checked | Powinno być checked w lin 3766 |
| ROI się nie kopiują | `JSON.parse(JSON.stringify())` deep copy | Check linijka 3845 |
| Progress bar się nie zmienia | `updateProgressBar()` nie wywoływana | Check integracja |

---

## 📝 Report Template

```markdown
## TEST REPORT: Zadania 6 & 7

**Date:** [DATA]
**Tester:** [IMIĘ]
**Browser:** [CHROME/FIREFOX]

### Test 1: Color-Coded Fields
- [ ] 1.1 Puste pola red - **PASS/FAIL**
- [ ] 1.2 Pole z wartością green - **PASS/FAIL**
- [ ] 1.3 Pole z ROI yellow - **PASS/FAIL**
- [ ] 1.4 Pole z Both - **PASS/FAIL**
- [ ] 1.5 Progress bar - **PASS/FAIL**

**Overall:** PASS / FAIL

### Test 2: Copy Previous
- [ ] 2.1 Drugi rekord pusty - **PASS/FAIL**
- [ ] 2.2 Ctrl+C data copy - **PASS/FAIL**
- [ ] 2.3 Ctrl+C w textarea - **PASS/FAIL**
- [ ] 2.4 Ctrl+C pierwszy akt - **PASS/FAIL**
- [ ] 2.5 ROI copy - **PASS/FAIL**
- [ ] 2.6 Multiple copy - **PASS/FAIL**

**Overall:** PASS / FAIL

### Issues Found:
[Lista bugów jeśli będą]

### Notes:
[Dodatkowe obserwacje]
```

---

## 🎬 Screen Recording

Opcjonalnie: Nagrań ekran (np. OBS) aby:
1. Pokazać jak kolory się zmieniają
2. Pokazać Ctrl+C copy w akcji
3. Udowodnić że działa dla konsultanta

---

**Gotowe do testów?** ✅ Testy trwają max 10 minut!
