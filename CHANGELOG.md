# CHANGELOG - Genealog Indexer

## v3.2 - ROI Enhancement & Ergonomy Update
**Data:** Grudzień 2025

### ✨ Nowe Funkcje

#### 1. **Inteligentne Zaznaczanie ROI**
- Powiązanie ROI z polem w formularzu
- Workflow: Wybierz pole → Włącz ROI → Rysuj → Automatycznie przypisz
- Walidacja: Wymagane aktywne pole przed rysowaniem ROI
- Status pola: Zielona ramka = ma ROI

#### 2. **Wizualne Wskaźniki ROI**
- **Aktywne pole:** Pomarańczowa ramka (4px)
- **Hover na polu:** Żółta ramka (3px) + podświetlenie ROI
- **Focus na polu:** Automatycznie zoom do ROI
- **Różne kolory:** Bieżący rekord (niebieski) vs Inne rekordy (zielony)

#### 3. **Interaktywne Formularze**
- **Enter** w polu = przejście do następnego
- **Enter** w ostatnim polu = zapis rekorda
- **Focus/Blur** = dynamiczne odświeżanie ROI canvas
- **Hover** na polu = podświetlenie odpowiedniego ROI

#### 4. **Zoom do ROI**
- Kliknięcie na pole z ROI = automatyczny zoom do tego obszaru
- Função zoomToROI() - kompatybilna z OpenSeadragon
- Wygodne dla weryfikacji danych

#### 5. **Enhanced setupFormEvents()**
- Obsługa mouseenter/mouseleave (hover)
- Focus handler z zoom
- Blur handler z refresh
- Keydown handler (Enter navigation)
- Bezpieczne klonowanie elementów do czyszczenia listenerów

### 🎯 Ulepszona Ergonomia

#### toggleROI()
- Walidacja: Wymaga aktywnego pola przed włączeniem
- Komunikaty: `✏️ ROI dla: [nazwa pola]`
- Lepsze feedback dla użytkownika

#### mouseup Handler (ROI Canvas)
- Walidacja: Sprawdzenie rekordów przed zapisem
- Better error messages
- Informacyjne notyfikacje: `✅ ROI zapisany dla: [pole]`

#### redrawROIs(highlightField)
- Parametr `highlightField` do podświetlania
- Dynamiczne kolory bazowane na stanie
- Lepsza czytelność canvas z wieloma ROI

### 🔧 Techniczne

#### Nowe Metody
```javascript
zoomToROI(roi) // Zoom do obszaru ROI
```

#### Ulepszone Metody
```javascript
setupFormEvents()      // +hover, +focus with zoom, +keydown
toggleROI()            // +validation, +status message
redrawROIs(highlight)  // +highlight parameter, +dynamic colors
```

#### CSS Nowy
```css
.form-group input.has-roi,
.form-group textarea.has-roi {
    border-left: 4px solid #10b981;
    box-shadow: 0 0 8px rgba(16,185,129,0.3);
}
```

### 📋 Checklist Funkcji

- [x] CSS dla has-roi klasy
- [x] Enhanced setupFormEvents (hover, focus, enter)
- [x] Improved toggleROI (validation, status)
- [x] Enhanced mouseup handler (validation, feedback)
- [x] Enhanced redrawROIs (highlight, colors)
- [x] New zoomToROI function
- [x] Full documentation (PRZEWODNIK.md)
- [x] Testing in browser

### 🐛 Bug Fixes
- (Brak błędów zgłoszonych w v3.1)

### 📚 Dokumentacja
- Dodany PRZEWODNIK.md (Polski)
- Skróty klawiszowe
- Praktyczne przykłady
- Porady dla użytkowników

### 🚀 Performance
- Bez zmian w performance (optimized rendering)
- LocalStorage nadal działa efektywnie

### 💾 Backward Compatibility
- ✅ Pełna kompatybilność z danymi v3.1
- ✅ LocalStorage bez zmian
- ✅ JSON export/import bez zmian

---

## v3.1 - Initial Release
**Data:** Grudzień 2025

### ✨ Funkcje Bazowe
- OpenSeadragon image viewer
- 3 szablony: Urodzenia, Małżeństwa, Zgony
- ROI Canvas drawing
- LocalStorage persistence
- CSV + JSON export
- Dark mode UI
- Responsive design

---

## Roadmap v3.3+

### Planowane:
- [ ] OCR text recognition
- [ ] Advanced field validation
- [ ] Tauri desktop app (.exe)
- [ ] Multi-user collaboration
- [ ] Database backend (SQLite/Postgres)
- [ ] Keyboard-only mode (accessibility)
- [ ] Batch operations
- [ ] Advanced search/filter
- [ ] Data sync across devices
- [ ] Plugin system for custom templates
