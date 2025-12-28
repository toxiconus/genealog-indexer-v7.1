# 📚 Index Dokumentów Projektowych

**Genealog Indexer v3.2** | **Data:** 20 grudnia 2025 | **Status:** Completa

---

## 📖 Dokumenty w Katalogu `.github/`

### 🎯 **copilot-instructions.md** (GŁÓWNY)
- **Cel:** Instrukcje dla AI agentów (GitHub Copilot, Claude, itp.)
- **Zawartość:**
  - TL;DR: Szybki start dla nowych deweloperów
  - Architektura: Komponenty, data model, koordinaty
  - Wersje: Porównanie v5 vs v7.1, kiedy używać której
  - Patterns: Form delegation, ROI system, canvas drawing
  - Testing: Debugowanie, localStorage inspection, checklista
- **Dla kogo:** Programiści, AI agents, zespoły refactoringu
- **Zakres:** ~1300 linii, komprehensywny

### 📋 **WACHLARZ-SPECIFICATION.md** (NOWY - v7.2)
- **Cel:** Szczegółowa specyfikacja ergonomicznego wachlarza podpowiedzi
- **Zawartość:**
  - Podsumowanie: Kluczowe cechy finalnej wersji (v1.5)
  - Matematyka: Wzory, przykłady obliczeniowe, kod JavaScript
  - Ergonomia: Zalety, porównanie z innymi wzorcami UI
  - Implementacja: Canvas/SVG/HTML, event handling, kalibracja
  - Roadmap: 4 fazy do v7.2 (2-4 dni pracy)
- **Dla kogo:** Implementerzy v7.2, UX designerzy, badacze ergonomii
- **Zakres:** ~500 linii, specjalistyczna

### 🧠 **BRAINSTORM.md** (HISTORYCZNY)
- **Cel:** Burza mózgów i dyskusje architektoniczne
- **Zawartość:**
  - Spotkania 1-5: Iteracje na v6.0, v7.0 decisions
  - Problemy: Czemu v6 nie wyszła (hierarchia zbyt złożona)
  - Rozwiązania: Rewertu do v5 (flat), dodaj OCR zamiast hierarchii
  - Idee: OCR, post-processing, keyboard shortcuts (teraz Features D-B w v7.1)
- **Dla kogo:** Historyk projektu, decyzje architektoniczne
- **Zakres:** ~2800 linii, trudne do nawigacji (archiwalne)

### 📊 **WORKFLOW_SUMMARY.md** (STATUS)
- **Cel:** Podsumowanie stanu prac (Phase 5 Complete, Phase 6 Planning)
- **Zawartość:**
  - Bieżący stan: v7.0 production-ready, Phase 5 complete
  - Coś zbudziliśmy: Foundation (v1-4), OpenCV integration (v5)
  - Plany: v7.1 Features A-E (teraz gotowe!)
- **Dla kogo:** Menadżerowie projektów, stakeholdry
- **Zakres:** ~400 linii, executive summary

---

## 📚 Dokumenty w Katalogu Głównym

### 📘 **README.md**
- **Cel:** Główna dokumentacja projektu (po polsku)
- **Zawartość:** Opis, szybki start, struktura, tutorial
- **Dla kogo:** Użytkownicy końcowi, nowi developerzy

### 📗 **PRZEWODNIK.md**
- **Cel:** Instrukcja użytkownika (po polsku, szczegółowa)
- **Zawartość:** Workflow, scenariusze, FAQ
- **Dla kogo:** Genealodzy, indeksatorzy

### 📙 **CHANGELOG.md**
- **Cel:** Historia zmian wersji (v1.0 → v3.2.0)
- **Zawartość:** Features per version, bug fixes, breaking changes
- **Dla kogo:** Użytkownicy, deweloperzy sprawdzający kompatybilność

### 📕 **V7.1-CHANGELOG.md**
- **Cel:** Szczegółowy changelog v7.1 (Features A-E)
- **Zawartość:** Każda feature (A: Suggestions, B: Shortcuts, C: Clipboard, D: OCR, E: Post-proc)
- **Dla kogo:** Testerzy, implementerzy, prowerzy kodu

### 🎯 **NAJPROSTSZE-ZADANIA.md** (ROOT - NOWY!)
- **Cel:** Ranking 10 najprostszych zadań z roadmapy, gotowych do implementacji
- **Zawartość:**
  - Top 10 zadań wg effort (< 1h do 2-4 dni)
  - Tier 1-4: Najmniejszy → Największy effort
  - Snippety kodu gotowe do copy-paste
  - Gdzie wstawiać w pliku, jak testować
- **Dla kogo:** Programiści szukający "od czego zacząć"
- **Ranking:**
  1. Ctrl+A (< 1h) - ZRÓB DZISIAJ
  2. Search input (1h) - ZRÓB DZISIAJ
  3. JSON import (1h) - ZRÓB DZISIAJ
  4. Tab navigation (2h) - ZRÓB TEN TYDZIEŃ
  5. Copy prev record (1h) - ZRÓB TEN TYDZIEŃ
  6. Progress bar (2-3h) - TEN TYDZIEŃ
  7. Color-coded fields (2h) - TEN TYDZIEŃ
  8. Auto-zoom ROI (1h) - ZRÓB DZISIAJ
  9. Auto-zoom Act (1h) - ZRÓB DZISIAJ
  10. Wachlarz v1.5 (2-4d) - NASTĘPNY MIESIĄC

---

## 🗂️ Mapa Dokumentów: Dla Różnych Ról

### 👨‍💻 **Deweloper: "Chcę coś szybko zrobić"**
1. Czytaj: `NAJPROSTSZE-ZADANIA.md` (15 min) 👈 **START TUTAJ**
2. Wybierz zadanie z Tier 1-2
3. Copy-paste kod ze snippetu
4. Testuj (2-5 min)
5. Commit & push

### 👨‍💻 **Nowy Developer** (Pierwszy dzień)
1. Przeczytaj: `README.md` (5 min)
2. Przeczytaj: `copilot-instructions.md` → TL;DR (2 min)
3. Run: `npm install && npm run dev` (1 min)
4. Test: Otwórz `http://localhost:5173/public/viewer-osd-v7.html` (1 min)
5. Reference: `copilot-instructions.md` → Architecture (keep open)

### 🧪 **Tester v7.1**
1. Czytaj: `V7.1-CHANGELOG.md` (5 min)
2. Czytaj: `copilot-instructions.md` → Testing Checklist (10 min)
3. Run: Testy manualne (15-30 min)
4. Report: Bugs w GitHub Issues

### 🚀 **Implementer v7.2 (Wachlarz)**
1. Czytaj: `WACHLARZ-SPECIFICATION.md` (20 min)
2. Czytaj: `copilot-instructions.md` → Feature A section (5 min)
3. Code: 4 phases w `WACHLARZ-SPECIFICATION.md` (2-4 dni)
4. Test: Tablica ewaluacyjna (phase 3)

### 📊 **Project Manager / Stakeholder**
1. Czytaj: `WORKFLOW_SUMMARY.md` (10 min)
2. Czytaj: `CHANGELOG.md` (15 min)
3. Reference: `copilot-instructions.md` → Version Status (kiedy używać co)

### 🤖 **AI Agent (GitHub Copilot, Claude)**
1. **Context:** Czytaj: `copilot-instructions.md` → Całość (30 min)
2. **Reference:** Podczas kodu, klikaj sekcje odpowiednie do zadania
3. **Fallback:** Jeśli zagubiony, czytaj: `copilot-instructions.md` → Critical Patterns

### 🏛️ **Historian Projektu / Decyzyje Architektoniczne**
1. Czytaj: `BRAINSTORM.md` (30-60 min) - ale trudne do czytania sekwencyjnie
2. Czytaj: `WORKFLOW_SUMMARY.md` (10 min) - lepszy overview
3. Czytaj: `CHANGELOG.md` (15 min) - faktyczne zmiany

---

## 🔄 Workflow: Jak Dokumenty Się Łączą

```
Nowy Feature Request (np. Wachlarz v7.2)
    ↓
Idea dyskusja w: BRAINSTORM.md (dodaj nowy "Spotkanie")
    ↓
Specyfikacja techniczna: WACHLARZ-SPECIFICATION.md (stwórz lub edytuj)
    ↓
Integracja z kodem: copilot-instructions.md → Feature section
    ↓
Implementacja: edyt public/viewer-osd-v7.html
    ↓
Testing: copilot-instructions.md → Testing Checklist
    ↓
Release: V7.1-CHANGELOG.md lub V7.2-CHANGELOG.md (nowy)
    ↓
Historia: CHANGELOG.md (update z release date)
```

---

## 📝 Format Dokumentów

### Wersja v1.5: Markdown + Emoji

Każdy dokument:
- ✅ Nagłówki hierarchiczne (H1-H4)
- ✅ Spisy treści (Table of Contents) - dla >300 linii
- ✅ Emoji dla szybkiej identyfikacji:
  - 🎯 Cel
  - 🚀 Start
  - 💻 Kod
  - ⚠️ Ostrzeżenie
  - ✅ Done
  - 🔧 Setup
  - 📚 Reference
- ✅ Bloki kodu z language syntax highlighting
- ✅ Tabele dla porównań
- ✅ Inline code (backticks) dla symbolów

### Konwencje

| Element | Przykład | Gdzie |
|---------|----------|-------|
| **Ścieżki plików** | `public/viewer-osd-v7.html` | Inline code |
| **Zmienne JS** | `app.records[]`, `app.roiMode` | Inline code |
| **Funkcje** | `saveRecord()`, `redrawROIs()` | Inline code |
| **Klawiatury** | Ctrl+S, Escape | `Ctrl+S` |
| **UI komponenty** | `#suggestionsWachlarz`, `.field-input` | Inline code |
| **Linki do plików** | [copilot-instructions.md](../copilot-instructions.md) | Markdown links |

---

## 🎓 Style Guide: Rozumienie Dokumentów

### Poziomy Szczegółowości

**Level 1: TL;DR (1-2 min)**
- Przydatne dla: Szybkie pytania, przypomnienie
- Przykład: `copilot-instructions.md` → TL;DR section
- Styl: Ultra-concise, bullet points

**Level 2: Overview (5-10 min)**
- Przydatne dla: Nowe osoby na projekcie
- Przykład: `copilot-instructions.md` → Project Overview
- Styl: Koherentna narracja, wymienione główne koncepty

**Level 3: Deep Dive (30-60 min)**
- Przydatne dla: Implementerzy, debugujący
- Przykład: `WACHLARZ-SPECIFICATION.md` → Całość
- Styl: Matematyczne wzory, kod, testy, edge cases

**Level 4: Historical Context (60+ min)**
- Przydatne dla: Architektury decyzji, dlaczego coś tak działa
- Przykład: `BRAINSTORM.md`
- Styl: Dyskusji, próby-błędy, iteracje

---

## 🔍 Jak Wyszukiwać w Dokumentach

### Szybko Znaleźć Coś:

| Szukam... | Plik | Sekcja |
|-----------|------|--------|
| Jak zacząć développing | copilot-instructions.md | Quick Start |
| Rozumienie ROI system | copilot-instructions.md | Critical Patterns |
| v7.1 feature checklist | copilot-instructions.md | Testing Checklist |
| Specyfikacja wachlarza | WACHLARZ-SPECIFICATION.md | Całość |
| Czy v6.0 jest Production? | copilot-instructions.md | Version Status |
| Historia v5 vs v7.1 | BRAINSTORM.md + CHANGELOG.md | Spotkania + entries |
| Jak zmieniła się architektura | WORKFLOW_SUMMARY.md | Phase descriptions |
| Instrukcja użytkownika | PRZEWODNIK.md | Całość |

---

## 📌 Najważniejsze Dokumenty (Ranking)

| Rank | Dokument | Powód | Link |
|------|----------|-------|------|
| 1️⃣ | copilot-instructions.md | Główne źródło dla developerów i AI | [link](./copilot-instructions.md) |
| 2️⃣ | README.md | Dla nowych osób na projekcie | [link](../README.md) |
| 3️⃣ | V7.1-CHANGELOG.md | Feature details, co jest teraz w produkcji | [link](../V7.1-CHANGELOG.md) |
| 4️⃣ | WACHLARZ-SPECIFICATION.md | Dla v7.2 implementation | [link](./WACHLARZ-SPECIFICATION.md) |
| 5️⃣ | PRZEWODNIK.md | Dla end-users (genealodzy) | [link](../PRZEWODNIK.md) |
| 6️⃣ | WORKFLOW_SUMMARY.md | Status projektowy, Phase tracking | [link](./WORKFLOW_SUMMARY.md) |
| 7️⃣ | BRAINSTORM.md | Historyczne dyskusje, architektura | [link](./BRAINSTORM.md) |
| 8️⃣ | CHANGELOG.md | Release history, version timeline | [link](../CHANGELOG.md) |

---

## 🤝 Contributing: Jak Edytować Dokumenty

### Dodawanie Nowego Dokumentu

1. **Nazwa:** `NAZWA-DOKUMENTU.md` (caps, hyphens)
2. **Lokalizacja:** 
   - Jeśli dla developerów/AI: `.github/NAZWA.md`
   - Jeśli dla użytkowników: root `/NAZWA.md`
3. **Format:** Markdown + emoji (patrz Style Guide wyżej)
4. **Zawartość:** Minimum level 1 (TL;DR) + level 2 (overview)
5. **Link:** Dodaj wpis tutaj w `DOKUMENTY-INDEX.md`

### Aktualizowanie Dokumentu

1. **Zmiana**: Edytuj bezpośrednio plik `.md`
2. **Backup:** Git commit dla historii
3. **Sync:** Jeśli zmiana dotyczy v7.1 → update zarówno `copilot-instructions.md` jak i `V7.1-CHANGELOG.md`
4. **Versioning:** Zaktualizuj datę w header: `**Last Updated:** DD MMMM YYYY`

### Struktura Nowego Dokumentu

```markdown
# 📚 Tytuł Dokumentu

**Version:** X.Y | **Last Updated:** DD miesiąca YYYY | **Status:** Development/Production

## 🎯 TL;DR (1-2 min)
- Punkt 1
- Punkt 2

## 📖 Overview (10 min)
Opis, co jest w dokumencie

## [Sections...]

## 📚 Referencje
Links do powiązanych docs
```

---

**Koniec.** Ten dokument jest metadata-layer dla wszystkich dokumentów projektowych. Aktualizuj go, gdy dodajesz nowe dokumenty! 🎯
