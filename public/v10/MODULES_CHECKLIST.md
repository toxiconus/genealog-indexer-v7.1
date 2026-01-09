# v10 – CHECKLIST MODUŁÓW

## ✅ FAZA 1: TOOLBAR + THUMBS (ZAKOŃCZONA)

- [x] **app-state.js** – Stan centralny
  - [x] Obiekt `app` z kluczowymi polami
  - [x] Funkcja `getCurrentAct()`
  - [x] Funkcja `notify()`

- [x] **toolbar.js** – Górny panel
  - [x] Renderowanie przycisków
  - [x] Event listenery dla przycisków
  - [x] Zmiana szablonu (chrzest/małżeństwo/zgon)
  - [x] Obsługa przycisków (Save, Firebase itp.)
  - [x] Logs do konsoli

- [x] **thumbs.js** – Miniatury aktów
  - [x] Renderowanie miniatur na podstawie `app.imageActs`
  - [x] Zaznaczanie aktywnej miniatury
  - [x] Event listener dla kliknięcia na miniaturę
  - [x] Placeholder gdy brak aktów
  - [x] Logs do konsoli

- [x] **main.js** – Inicjalizacja
  - [x] Import wszystkich modułów
  - [x] Funkcja `initApp()`
  - [x] Ładowanie danych z localStorage
  - [x] Zapisywanie danych do localStorage
  - [x] Event handlers

- [x] **test-data.js** – Dane testowe
  - [x] Tablica testowych aktów
  - [x] Funkcja `loadTestData()`
  - [x] Funkcja `clearTestData()`
  - [x] Funkcja `logStorageData()`
  - [x] Udostępnienie w `window.testData`

- [x] **HTML** – Szkielet
  - [x] Kontenery: toolbar, thumbsBar, viewer, rightPanel
  - [x] Linki do CSS
  - [x] Import test-data.js i main.js (type="module")
  - [x] Firebase init

---

## 🔄 FAZA 2: FORMS (PRZYGOTOWYWANIE)

- [ ] **forms.js** – Moduł formularza
  - [ ] Funkcja `renderFloatingForm()`
  - [ ] Dynamiczne pola na podstawie `app.currentTemplate`
  - [ ] Validacja pól
  - [ ] Zapisywanie do `app.imageActs[currentEventId].data`
  - [ ] Auto-save

- [ ] **form-chrzest.js** (lub część forms.js)
  - [ ] Pola: imię dziecka, ojciec, matka, świadkowie
  - [ ] Validacja
  - [ ] Rendering

- [ ] **form-malzenstwo.js** (lub część forms.js)
  - [ ] Pola: pan, pani, świadkowie
  - [ ] Validacja
  - [ ] Rendering

- [ ] **form-zgon.js** (lub część forms.js)
  - [ ] Pola: zmarły, wiek, przyczyna
  - [ ] Validacja
  - [ ] Rendering

---

## 🖼️ FAZA 3: VIEWER (PRZYGOTOWYWANIE)

- [ ] **viewer.js** – OpenSeadragon
  - [ ] Inicjalizacja OSD
  - [ ] Ładowanie obrazu
  - [ ] Zoom, pan, rotate
  - [ ] Wyświetlanie informacji o obrazie

- [ ] **roi.js** – Regiony zainteresowania
  - [ ] Rysowanie ROI
  - [ ] Edycja ROI
  - [ ] Eksport ROI
  - [ ] Podgląd ROI w miniaturach

---

## 📊 FAZA 4: TABELA + DANE (PRZYGOTOWYWANIE)

- [ ] **table.js** – Wyświetlanie danych
  - [ ] Renderowanie tabeli z danymi aktualnego aktu
  - [ ] Edytowanie komórek
  - [ ] Dodawanie nowych rekordów
  - [ ] Usuwanie rekordów

- [ ] **persons-registry.js** – Rejestr osób
  - [ ] Deduplikacja osób
  - [ ] Łączenie wariantów imion
  - [ ] Rejestr globalny

---

## 💾 FAZA 5: STORAGE (PRZYGOTOWYWANIE)

- [ ] **storage.js** – Przechowywanie
  - [ ] Ładowanie z Firebase
  - [ ] Zapisywanie do Firebase
  - [ ] Fallback do localStorage
  - [ ] Sync w tle

- [ ] **firebase-sync.js** (jeśli oddzielony moduł)
  - [ ] Auth
  - [ ] Firestore operations
  - [ ] Real-time listeners

---

## 🔍 FAZA 6: OCR + UTILS (PRZYGOTOWYWANIE)

- [ ] **ocr.js** – Tesseract
  - [ ] Inicjalizacja workera
  - [ ] OCR obrazu
  - [ ] Wynik w tekstowe pole

- [ ] **utils.js** – Funkcje pomocnicze
  - [ ] Walidacja
  - [ ] Formatowanie danych
  - [ ] Konwersje

- [ ] **keyboard.js** – Skróty
  - [ ] Alt+O: Otwórz obraz
  - [ ] Alt+S: Zapisz
  - [ ] Alt+N: Nowy akt
  - [ ] Strzałki: Nawigacja aktów

---

## 🎯 METRYKI UKOŃCZENIA

| Faza | Moduły | Status | % |
|------|--------|--------|---|
| 1    | 5      | ✅     | 100% |
| 2    | 4      | 🔄     | 0% |
| 3    | 2      | 🔄     | 0% |
| 4    | 2      | 🔄     | 0% |
| 5    | 2      | 🔄     | 0% |
| 6    | 3      | 🔄     | 0% |

**Całość:** 🟢 20% (5/25 modułów)

---

## 🐛 ZNANE PROBLEMY

### Aktualnie rozwiązane:
- ✅ Import modułów ES6 – pracuje prawidłowo
- ✅ localStorage – testowe dane ładują się bez problemu
- ✅ CSS – wszystkie zmienne zdefiniowane

### Do śledzenia:
- 🟡 Brak forms.js – powoduje warning w konsoli (ale app pracuje)
- 🟡 Brak viewer.js – trzeba będzie dodać po testowaniu toolbar+thumbs

---

## 📝 NOTATKI DLA PROGRAMISTY

1. **Importy zawsze z `./` lub `../`** – nie absolutne ścieżki
2. **type="module"** w HTML jest obowiązkowy dla ES6 modułów
3. **Console.log** we wszystkich kluczowych funkcjach – ułatwia debug
4. **Shadows i transitions** w CSS – sprzyja responsywności
5. **localStorage** na razie wystarczy – Firebase przychodzi w Fazie 5

---

**Ostatnia aktualizacja:** 9 stycznia 2026  
**Autor:** Genealog Indexer v10 Team  
