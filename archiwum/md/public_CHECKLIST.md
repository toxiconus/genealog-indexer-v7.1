# ✅ CHECKLIST ZMIAN - v8.17 FIX

## 📝 Co się zmieniło?

### 1. SQL.js CDN dodany
- [ ] Linia ~49: `<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.5.0/sql-wasm.min.js"></script>`

### 2. const app rozszerzony
- [ ] Linia ~1855-1857: Dodane pola
  - `idMap: new Map()`
  - `currentImagePath: null`
  - `localDb: null`

### 3. Funkcje SQL.js dodane
- [ ] Linia ~1870-2000:
  - `initLocalDB()` ✅
  - `saveActToLocalDB(act)` ✅
  - `loadActsFromLocalDB(filters)` ✅
  - `searchActByDisplayId(displayId)` ✅

### 4. autoGenerateID() zmieniony
- [ ] Linia ~5250-5320: Zwraca obiekt z `{ originalId, displayId, id }`

### 5. handleFiles() naprawiony
- [ ] Linia ~6280-6295: Czyta `file.webkitRelativePath`

### 6. selectImage() naprawiony
- [ ] Linia ~6010-6015: Ustawia `app.currentImagePath`

### 7. selectAct() naprawiony
- [ ] Linia ~5575-5580: Przypisuje `act.imagePath = app.currentImagePath`

### 8. showAdvancedActModal() zmieniony
- [ ] Linia ~2430-2445: Obsługuje oba typy ID
- [ ] Linia ~5750-5770: Generuje `originalId` i `displayId`
- [ ] Linia ~5780-5790: Zapisuje do SQL.js (`saveActToLocalDB`)

### 9. Kopia aktów zmieniona (copyPreviousActs)
- [ ] Linia ~5800-5845: Obsługuje oba typy ID

### 10. saveStorage() zmieniony
- [ ] Linia ~6970-6985: Zapisuje do SQL.js na początku

### 11. initApp() zmieniony
- [ ] Linia ~2107-2108: Inicjalizuje `await initLocalDB()`

---

## 🧪 Testy do wykonania

### Test A: Dual ID
- [ ] Załaduj folder
- [ ] Utwórz akty
- [ ] W Console: `app.imageActs[0].displayId` → powinno być `CH.LUB.1783.XXX`
- [ ] W Console: `app.imageActs[0].originalId` → powinno być UUID

### Test B: Image Path
- [ ] W Console: `app.currentImagePath` → powinno być pełna ścieżka
- [ ] Każdy akt powinien mieć `act.imagePath`

### Test C: SQL.js
- [ ] W Console: `localDb` → powinno być obiektem
- [ ] W Console: `loadActsFromLocalDB()` → powinno zwrócić array

### Test D: Offline
- [ ] Wyłącz internet (DevTools → Network → Offline)
- [ ] Załaduj folder, utwórz akty, edytuj pola
- [ ] Powinno działać bez błędów

### Test E: Baza offline
- [ ] W Console: `loadActsFromLocalDB({ type: 'christening' })`
- [ ] Powinno zwrócić akty z bazy, nie z app.imageActs

---

## 📊 Przed i po

| Funkcja | Przed | Po |
|---------|-------|-----|
| autoGenerateID | Zwraca string | Zwraca `{ originalId, displayId, id }` |
| imagePath | Brak (tylko app.currentImageIdx) | Pełna ścieżka w każdym akcie |
| Offline | Wymaga Supabase | Pracuje w SQL.js |
| Duplikaty | Wiele (id, original_id, ...) | Jasne: displayId (UI) + originalId (DB) |
| Backup | localStorage (limit 5MB) | SQL.js (bez limitu) |

---

## 🔗 Powiązane pliki

- `viewer-osd-v8.17.html` - główny plik (zmieniony)
- `FIX_ID_PATHS_DATABASE_v8.17.md` - pełna dokumentacja
- `TESTING_GUIDE.md` - poradnik testowania
- `CHECKLIST.md` - ten plik

---

## 📋 Status

- [x] SQL.js CDN dodany
- [x] Funkcje SQL.js zaimplementowane
- [x] autoGenerateID() zmieniony
- [x] handleFiles() naprawiony
- [x] selectImage() naprawiony
- [x] selectAct() naprawiony
- [x] Modal zmieniony
- [x] saveStorage() zmieniony
- [x] initApp() zmieniony
- [ ] Testy wykonane
- [ ] Dokumentacja przeczytana
- [ ] Backup danych wykonany

---

## 🚀 Następne kroki

1. **Otwórz** `viewer-osd-v8.17.html` w przeglądarce
2. **Testuj** Follow TESTING_GUIDE.md
3. **Eksportuj** Akty do JSON (dla bezpieczeństwa)
4. **Migruj** Na produkcję (jeśli testy przeszły)
5. **Dokumentuj** Wszelkie problemy

---

**Ostatnia aktualizacja:** 29.01.2026  
**Autor:** AI Assistant  
**Wersja:** v8.17+FIX
