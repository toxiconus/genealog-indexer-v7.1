# 📚 Genealog Indexer v7.1 Professional

**Profesjonalne narzędzie do indeksacji i edycji genealogicznych aktów metryki z OCR i post-processingiem.**

[![GitHub](https://img.shields.io/badge/GitHub-toxiconus/genealog--indexer--v7.1-blue)](https://github.com/toxiconus/genealog-indexer-v7.1)
![Status](https://img.shields.io/badge/status-production-brightgreen)
![Version](https://img.shields.io/badge/version-7.1.0-blue)
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
- 🟢 **Status Pól** - kolorowe ramki pól (zielona = ma ROI, żółta = ROI bez wartości, czerwona = puste)

### Zaawansowane Funkcje v7.1
- 🤖 **OCR** - rozpoznawanie tekstu z obrazów (Tesseract.js)
- 🎨 **Post-processing** - zaawansowane filtry obrazu (OpenCV.js)
- 💡 **Suggestions Fan** - wachlarz podpowiedzi z poprzednich rekordów
- ⌨️ **Keyboard Shortcuts** - rozszerzone skróty klawiszowe
- 📊 **Statistics** - statystyki postępu indeksacji
- 🧙 **Wizard Mode** - asystent krok-po-kroku
- 📌 **Pinups** - pływające formularze pól
- 🔄 **Enhanced Copy** - inteligentne kopiowanie między aktami

### Workflow
- ✅ Wielorekordy na jednym obrazie
- ✅ Automatyczne powiązanie ROI-pole
- ✅ Zoom do ROI przy focus
- ✅ Nawigacja klawiszowa (Enter = następne pole)
- ✅ Szybki export CSV + JSON
- ✅ Progress bar - wizualny postęp indeksacji

### UI/UX
- 🌙 **Dark Mode** - profesjonalny wygląd (Twitter/X style)
- 📱 **Responsive** - działa na desktopie i mobilnie
- ⌨️ **Keyboard Shortcuts** - Ctrl+N, Ctrl+R, Ctrl+S, ←→ nawigacja itp.
- 💾 **LocalStorage** - automatyczne zapisywanie
- 🎨 **Post-processing Panel** - filtry obrazu w czasie rzeczywistym
- 💡 **Suggestions Fan** - wachlarz podpowiedzi przy wpisywaniu
- 📊 **Progress Bar** - wizualny wskaźnik kompletności pól
- 🧙 **Wizard Prompts** - instrukcje dla bieżącego pola

---

## 🚀 Szybki Start

### FAQ: Czy asystent może sam utworzyć nowe repozytorium?

Nie. Asystent może przygotować zmiany w tym repozytorium, ale nie może samodzielnie zakładać nowych repozytoriów GitHub.
Jeśli chcesz, podaj wymagania, a przygotujemy strukturę i pliki do łatwego skopiowania do nowego repo.

### Wymagania
- Node.js 16+
- npm 8+
- Nowoczesna przeglądarka (Chrome, Firefox, Safari, Edge)

### Instalacja

```bash
# 1. Klonuj projekt z GitHub
git clone https://github.com/toxiconus/genealog-indexer-v7.1.git
cd genealog-indexer-v7.1

# 2. Zainstaluj zależności
npm install

# 3. Uruchom dev server
npm run dev

# 4. Otwórz w przeglądarce
# Główna wersja: http://localhost:5173/public/viewer-osd-v8.html
# Stabilna wersja: http://localhost:5173/public/viewer-osd-v5.html
```

### Synchronizacja z GitHub

```bash
# Po wprowadzeniu zmian:
git add .
git commit -m "Opis zmian"
git push origin master

# Pobranie najnowszych zmian:
git pull origin master
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
│   ├── viewer-osd-v8.html       # 🎯 GŁÓWNA APLIKACJA v8.0 (Firebase + OCR + Post-processing)
│   ├── viewer-osd-v5.html       # ✅ STABILNA WERSJA v5.0 (fallback)
│   ├── viewer-osd-v6.html       # ❌ EKSPERYMENTALNA (NIE UŻYWAĆ)
│   ├── viewer-osd-v4.html       # 📚 LEGACY (referencyjna)
│   ├── viewer-osd.html          # 🔄 KOPIA v5 (nieużywana)
│   ├── *.backup-*.html          # 🗂️ BACKUPY (nieużywane)
│   ├── tesseract.min.js         # 🤖 OCR engine
│   ├── opencv.js                # 🎨 Post-processing (ładowane asynchronicznie)
│   └── inne pliki...
├── start-v7.1.bat               # 🚀 LAUNCHER dla v7.1
├── start-server.bat             # 🔄 ALTERNATYWNY launcher
├── package.json                 # 📦 Zależności (Vite)
├── vite.config.js               # ⚙️ Konfiguracja serwera dev
├── README.md                    # 📖 Ten plik
├── PRZEWODNIK.md                # 📚 Instrukcja użytkownika (PL)
├── CHANGELOG.md                 # 📝 Historia wersji
├── .github/copilot-instructions.md # 🤖 Instrukcje dla AI
└── .gitignore
```

### Aktywne Pliki Aplikacji
- **`public/viewer-osd-v8.html`** (~3500 linii) - **GŁÓWNA WERSJA**
  - Single-file application z OCR i post-processingiem
  - Wszystkie nowe funkcje v7.1
  - Zalecana dla nowych projektów
  
- **`public/viewer-osd-v5.html`** (~2200 linii) - **STABILNA WERSJA**
  - Bez OCR, podstawowy system ROI
  - Używać jeśli v7.1 ma problemy
  
- **`start-v7.1.bat`** - **REKOMENDOWANY LAUNCHER**
  - Uruchamia v7.1 z opisem funkcji
  - Sprawdza zależności

### Nieużywane Pliki (Backup/Eksperymenty)
- Wszystkie pliki `*.backup-*.html` - automatyczne kopie zapasowe
- `viewer-osd-v6.html` - porzucona wersja hierarchiczna
- `viewer-osd-v4*.html` - starsze wersje referencyjne
- Pliki w `launchers/` - alternatywne launchery (opcjonalne)

---

## ⚙️ Architektura

### Frontend
- **HTML5** - struktura
- **CSS3** - dark mode, responsive, animations
- **Vanilla JavaScript** - no frameworks (intentional)

### Biblioteki Zewnętrzne
- **OpenSeadragon** 2.4.8 - image viewer (CDN)
- **Font Awesome** 6.5.0 - ikony (CDN)
- **Tesseract.js** 5.1.0 - OCR engine (CDN)
- **OpenCV.js** 4.8.0 - image processing (CDN, asynchroniczne)
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

## 🔑 Funkcje v7.1 (Nowe)

✨ **OCR Integration**
- Rozpoznawanie tekstu z obrazów aktów
- Automatyczne wypełnianie pól formularza
- Wizualny progress bar podczas przetwarzania

✨ **Image Post-processing Pipeline**
- 12 filtrów: brightness, contrast, sepia, histogram equalization
- OpenCV.js: adaptive threshold, gaussian blur, median blur
- Presety genealogiczne (genealogy-pro, faded-advanced, text-extraction)
- Podgląd w czasie rzeczywistym

✨ **Suggestions Fan (Wachlarz Podpowiedzi)**
- Fan-shaped suggestions z poprzednich rekordów
- Ergonomiczny layout dla szybkiego wyboru
- Aktywacja przy wpisywaniu w pola

✨ **Enhanced UX**
- Color-coded fields: 🟢 zielona (wypełnione), 🟡 żółta (ROI bez wartości), 🔴 czerwona (puste)
- Progress bar kompletności pól
- Floating forms i pinups dla pól
- Wizard mode z instrukcjami krok-po-kroku

✨ **Keyboard Shortcuts**
- Ctrl+S: zapisz, Ctrl+D: usuń, Ctrl+C: kopiuj poprzedni
- ←→: nawigacja między aktami
- Ctrl+N: nowe akty (z promptem ilości)

Więcej: [CHANGELOG.md](CHANGELOG.md)

---

## ⌨️ Skróty

| Skrót | Akcja |
|-------|-------|
| Ctrl+O | Dodaj obrazy |
| Ctrl+N | Nowe akty (z promptem ilości) |
| Ctrl+R | Toggle ROI dla aktywnego pola |
| Ctrl+A | Toggle Act ROI (granica aktu) |
| Ctrl+S | Zapisz rekord |
| Ctrl+D | Usuń rekord (z potwierdzeniem) |
| Ctrl+C | Kopiuj dane z poprzedniego aktu |
| ← → | Nawigacja między aktami |
| Enter | Następne pole / Zapisz |
| Esc | Wyłącz ROI / Zamknij wachlarz |
| F11 | Fullscreen |
| Ctrl+0 | Reset zoom |

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

- ⚠️ **OCR Performance** - Pierwsze uruchomienie pobiera ~70MB Tesseract (cache'owane potem)
- ⚠️ **OpenCV.js Loading** - Post-processing wymaga asynchronicznego ładowania OpenCV
- ❌ **Backend Integration** - Brak bazy danych (użyj localStorage lub JSON export)
- ⚠️ **Large Images** - Post-processing może być wolny dla bardzo dużych plików
- ❌ **Multi-user Support** - Brak synchronizacji między użytkownikami

---

## 🚀 Future Plans (v7.2+)

- [ ] **Parabolic Suggestions Fan** - ergonomiczny wachlarz (v1.5)
- [ ] **Database Backend** - SQLite/PostgreSQL integracja
- [ ] **Tauri Desktop App** - natywna aplikacja .exe
- [ ] **REST API** - API dla danych genealogicznych
- [ ] **Multi-user Collaboration** - współdzielenie projektów
- [ ] **Advanced OCR** - poprawiona dokładność rozpoznawania
- [ ] **Cloud Sync** - synchronizacja z chmurą
- [ ] **Custom Templates** - plugin system dla szablonów
- [ ] **Mobile PWA** - progressive web app
- [ ] **Batch Processing** - przetwarzanie wielu obrazów

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
- 🐙 **GitHub:** [toxiconus/genealog-indexer-v7.1](https://github.com/toxiconus/genealog-indexer-v7.1)
- 📝 **Issues:** [Report Bug](https://github.com/toxiconus/genealog-indexer-v7.1/issues)
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

**v7.1.0** | December 2025 | Production Ready ✅
