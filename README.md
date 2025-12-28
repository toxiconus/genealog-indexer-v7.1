# 📚 Genealog Indexer v3.2 Professional

**Profesjonalne narzędzie do indeksacji i edycji genealogicznych aktów metryki.**

![Status](https://img.shields.io/badge/status-production-brightgreen)
![Version](https://img.shields.io/badge/version-3.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Language](https://img.shields.io/badge/language-Polish-red)

---

## 🎯 Funkcjonalność

### Viewer
- 🖼️ **OpenSeadragon** - profesjonalny viewer do dużych obrazów
- 🔍 **Zoom/Pan** - intuicyjne nawigowanie
- 🔄 **Rotacja** - obrót obrazu o 90°
- 📌 **Navigator** - minimap w rogu

### Indeksacja
- 📋 **3 Szablony** - Urodzenia, Małżeństwa, Zgony
- ✏️ **Formularze** - dostosowane pola genealogiczne
- 📍 **ROI Canvas** - zaznaczanie obszarów (Region of Interest)
- 🟢 **Status Pól** - zielona ramka = ma ROI

### Workflow
- ✅ Wielorekordy na jednym obrazie
- ✅ Automatyczne powiązanie ROI-pole
- ✅ Zoom do ROI przy focus
- ✅ Nawigacja klawiszowa (Enter = następne pole)
- ✅ Szybki export CSV + JSON

### UI/UX
- 🌙 **Dark Mode** - profesjonalny wygląd (Twitter/X style)
- 📱 **Responsive** - działa na desktopie i mobilnie
- ⌨️ **Keyboard Shortcuts** - Ctrl+N, Ctrl+R, Ctrl+S itp.
- 💾 **LocalStorage** - automatyczne zapisywanie

---

## 🚀 Szybki Start

### Wymagania
- Node.js 16+
- npm 8+
- Nowoczesna przeglądarka (Chrome, Firefox, Safari, Edge)

### Instalacja

```bash
# 1. Klonuj lub pobierz projekt
cd "j:\projekt 2025\projekt-akta-v2"

# 2. Zainstaluj zależności
npm install

# 3. Uruchom dev server
npm run dev

# 4. Otwórz w przeglądarce
# Zazwyczaj: http://localhost:5173 lub http://localhost:5174
```

### Pierwsze Kroki

1. **Dodaj Obrazy** - Kliknij "Dodaj" lub przeciągnij pliki
2. **Utwórz Rekord** - Kliknij "+" w lewym panelu
3. **Wybierz Typ** - Urodzenia / Małżeństwa / Zgony
4. **Wypełnij Dane** - Wpisz informacje
5. **Zaznacz ROI** - Ctrl+R, zaznacz obszar, Enter
6. **Eksportuj** - Kliknij "Eksport" dla backup

👉 **Pełny przewodnik:** [PRZEWODNIK.md](PRZEWODNIK.md)

---

## 📂 Struktura Projektu

```
projekt-akta-v2/
├── public/
│   └── viewer-osd.html          # Główna aplikacja (HTML + CSS + JS)
├── package.json                  # Zależności (Vite)
├── vite.config.js               # Konfiguracja serwera dev
├── README.md                     # Ten plik
├── PRZEWODNIK.md                # Instrukcja użytkownika (PL)
├── CHANGELOG.md                 # Historia wersji
└── .gitignore
```

### Główny Plik
- **`viewer-osd.html`** (~1450 linii)
  - Single-file application
  - HTML + CSS + JavaScript w jednym pliku
  - Żadnych zewnętrznych zależności oprócz CDN (OpenSeadragon, Font Awesome)
  - LocalStorage do persystencji danych

---

## ⚙️ Architektura

### Frontend
- **HTML5** - struktura
- **CSS3** - dark mode, responsive, animations
- **Vanilla JavaScript** - no frameworks (intentional)

### Biblioteki Zewnętrzne
- **OpenSeadragon** 2.4.8 - image viewer (CDN)
- **Font Awesome** 6.0.0 - ikony (CDN)
- **Vite** 5.0+ - bundler dla development

### Dane
- **LocalStorage** - przechowywanie rekordów i ROI
- **JSON Format** - eksport/import backup
- **CSV Format** - eksport do Excel/Sheets

---

## 🎨 Design System

### Kolory
```css
Background:    #0a0a0a (very dark)
Panel:         #1a1a1a (dark)
Border:        #2a2a2a (medium dark)
Text:          #ddd (light)
Accent:        #0078d4 (blue)
Success:       #107c10 (green)
Warning:       #ff9800 (orange)
Highlight:     #ffb300 (yellow)
```

### Komponenty
- Toolbar - narzędzia
- Sidebar - listy rekordów
- Viewer - OpenSeadragon + Canvas
- Right Panel - formularze
- Thumbnails Bar - miniatury obrazów

---

## 🔑 Funkcje v3.2 (Nowe)

✨ **ROI Enhancement**
- Powiązanie ROI z polami formularza
- Wizualne wskaźniki (zielona ramka dla pól z ROI)
- Zoom do ROI przy focus
- Hover highlight na canvas

✨ **Better UX**
- Enter nawigacja w formularzach
- Toggle ROI wymaga aktywnego pola
- Status messages z emojami
- Bezpieczne zarządzanie listenerami

Więcej: [CHANGELOG.md](CHANGELOG.md)

---

## ⌨️ Skróty

| Skrót | Akcja |
|-------|-------|
| Ctrl+O | Dodaj obrazy |
| Ctrl+N | Nowy rekord |
| Ctrl+R | Toggle ROI |
| Ctrl+S | Eksportuj |
| Ctrl+0 | Reset zoom |
| Enter | Następne pole / Zapisz |
| Esc | Wyłącz ROI |
| F11 | Fullscreen |

---

## 📊 Eksport/Import

### CSV Export
```
ID, Typ, Data, Obraz, Dane JSON
1234567890, "birth", "2025-12-18T10:30:00Z", "akt1.jpg", "{...}"
```

### JSON Backup
```json
{
  "version": "3.2",
  "exportDate": "2025-12-18T10:30:00Z",
  "totalRecords": 42,
  "records": [
    {
      "id": 1234567890,
      "template": "birth",
      "data": {
        "child_first_name": "Jan",
        "child_last_name": "Kowalski",
        ...
      },
      "rois": {
        "child_first_name": {
          "x": 0.1,
          "y": 0.2,
          "w": 0.3,
          "h": 0.05
        }
      },
      "imageIdx": 0,
      "imageName": "akt1.jpg",
      "timestamp": "2025-12-18T10:30:00Z"
    }
  ]
}
```

---

## 🔄 Build & Deployment

### Development
```bash
npm run dev
# Serwer: http://localhost:5173
# Hot-reload: włączony
```

### Production Build
```bash
npm run build
# Output: dist/
# Otwórz: dist/index.html
```

### Preview Built Version
```bash
npm run preview
# Testowanie production buildu lokalnie
```

---

## 🐛 Known Issues & Limitations

- ❌ OCR nie jest dostępna (planned v3.3+)
- ❌ Nie ma backendu (użyj localStorage lub JSON export)
- ❌ Brak database integracji (planned v3.3+)
- ⚠️ Tauri desktop app nie jest zintegrowana (można dodać później)

---

## 🚀 Future Plans (v3.3+)

- [ ] **OCR Integration** - text recognition
- [ ] **Database** - SQLite/PostgreSQL backend
- [ ] **Tauri Desktop** - .exe packaging
- [ ] **API** - REST API dla danych
- [ ] **Multi-user** - collaboration features
- [ ] **Advanced Search** - full-text search
- [ ] **Plugins** - custom templates
- [ ] **Sync** - cloud sync support
- [ ] **Accessibility** - keyboard-only mode
- [ ] **Mobile App** - React Native/Flutter

---

## 📜 Licencja

**MIT License** - Wolne do użytku komercyjnego i prywatnego

Copyright (c) 2025 Genealog Indexer Contributors

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🤝 Wspieranie Projektu

### Jak Pomóc?
1. **Report Issues** - znalazłeś bug? Daj znać!
2. **Feature Requests** - masz pomysł? Zaproponuj!
3. **Contribute Code** - chcesz kodować? Pull request!
4. **Share Feedback** - jak się używa? Podziel się doświadczeniem!

---

## 📞 Kontakt & Support

- 📧 Email: (available upon request)
- 🐙 GitHub: (coming soon)
- 📝 Issues: (use GitHub Issues)
- 💬 Discussions: (planned)

---

## 🙏 Dziękujemy

Projekt korzysta z:
- **OpenSeadragon** - magnificent image viewer
- **Font Awesome** - awesome icons
- **Vite** - lightning fast build tool

---

**Made with ❤️ for genealogy enthusiasts**

---

**v3.2.0** | December 2025 | Production Ready ✅
