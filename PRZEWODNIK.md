# 📚 Genealog Indexer v3.2 - Przewodnik Użytkownika

## 🎯 Szybki Start

### 1️⃣ Dodaj Obrazy
- Kliknij **"+ Dodaj"** w pasku narzędzi lub przeciągnij obrazy na okno
- Miniatury pojawią się na dole ekranu
- Kliknij miniaturę, aby wybrać obraz

### 2️⃣ Utwórz Nowy Rekord
- W lewym panelu (białe koła) kliknij **"+"**
- Alternatywnie: Ctrl+N
- Rekord zostanie przypisany do bieżącego obrazu

### 3️⃣ Wybierz Typ Aktu
- W prawym panelu wybierz typ: **Urodzenia**, **Małżeństwa** lub **Zgony**
- Formularz zmieni się dostosowując pola

### 4️⃣ Wypełnij Dane
- Wypełnij pola w formularzu
- **Enter** → przechodzi do następnego pola
- **Ostatnie pole + Enter** → zapisuje rekord

---

## 🎨 Zaznaczanie Obszarów (ROI - Region of Interest)

### Jak Działuje ROI

**Przepływ:**
1. Zaznacz **pole w formularzu** (np. "Imię dziecka")
2. Kliknij przycisk **"ROI"** w pasku narzędzi (Ctrl+R)
3. Na obrazie pojawi się wskaźnik: `✏️ ROI dla: Imię dziecka`
4. **Rysuj** prostokąt na obszarze obrazu
5. Puść mysz → ROI zostaje zapisany
6. Pole zmienia kolor (zielona ramka = ma ROI)

### Wizualne Wskaźniki

| Stan | Wygląd | Znaczenie |
|------|--------|-----------|
| 🔵 Aktywne pole | Pomarańczowa ramka (gruba 4px) | Focus na to pole, ROI aktualnie zaznaczane |
| 🟢 Pole z ROI | Zielona ramka | Pole ma zapisany obszar (ROI) |
| 🔷 Najechanie | Żółta ramka (3px) | Najechałeś na ROI innego pola (hover) |
| 🟦 Inne rekordy | Zielona ramka | ROI z innych rekordów tego obrazu |

### Kolory ROI na Canvas

- **Pomarańczowy (#ff9800)** - aktywnie zaznaczane pole
- **Żółty (#ffb300)** - hover na polu
- **Niebieski (#0078d4)** - ROI bieżącego rekordu
- **Zielony (#107c10)** - ROI innych rekordów

---

## 🔍 Zoom do ROI

**Automatycznie:**
- Gdy klikniesz na pole z ROI → obraz **automatycznie przybliży** ten obszar
- Wygodne dla weryfikacji danych

**Ręczne:**
- **Ctrl+0** - reset zoom do całej strony
- Scroll myszy - zoom In/Out
- Przeciąg myszy - pan (przesuwanie)

---

## 💾 Zapisywanie

### Automatyczne
- Każde zmiana (nowy rekord, ROI, dane) → lokalny zapis
- **localStorage** - dane są bezpieczne w przeglądarce

### Ręczne Export
- **Eksport** - pobiera CSV i JSON backup
- Format JSON zawiera całe ROI dane do przywrócenia

### Import
- Przeciągnij plik JSON → rekord zostanie załadowany
- (Funkcja dostępna - przycisk Import w toolbar)

---

## 🎯 Praktyczne Przykłady

### Przykład 1: Indeksacja Aktu Urodzenia

```
1. Otwórz akt urodzenia (obraz)
2. Kliknij "+" → nowy rekord
3. Wybierz "Akt Urodzenia"
4. Kliknij pole "Imię dziecka"
5. Ctrl+R → włącz ROI
6. Zaznacz na obrazie tekst z imieniem
7. Puść mysz
8. Pole zabarwi się na zielono (ma ROI!)
9. Enter → "Nazwisko dziecka"
10. Powtórz krok 5-8
11. Ostatni Enter → rekord zapisany
```

### Przykład 2: Multirekordy na Jednym Obrazie

- Kliknij "+" → drugi rekord
- Rysuj ROI dla drugiej osoby
- Na canvas będą widać **2 wiele ROI** (niebieskie = bieżący, zielone = inne)
- Klikaj między rekordami (lewy panel) → zoom do różnych osób

---

## ⌨️ Skróty Klawiszowe

| Skrót | Akcja |
|-------|-------|
| **Ctrl+O** | Dodaj obrazy |
| **Ctrl+N** | Nowy rekord |
| **Ctrl+R** | Włącz/wyłącz ROI |
| **Ctrl+S** | Eksportuj |
| **Ctrl+0** | Reset zoom |
| **Enter** | Następne pole / Zapisz |
| **Esc** | Wyłącz ROI |
| **F11** | Pełny ekran |
| **←/→** | Poprzedni/Następny obraz |
| **↑/↓** | Poprzedni/Następny rekord (tego obrazu) |

---

## 🔧 Ustawienia i Opcje

### Panele Boczne
- **Formularz** - pokazuje/chowa prawy panel
- **Miniatury** - pokazuje/chowa pasek na dole

### Obrót Obrazu
- Przyciski **↻ / ↺** obrócą obraz o 90°
- Przydatne dla obrazów w pionie

### Pełny Ekran
- **Fullscreen** - maksymalizuje obszar pracy

---

## 📊 Eksport i Backup

### CSV
- Zawiera: ID, Typ, Data, Obraz, Dane JSON
- Otwieralne w Excel/Sheets

### JSON
- Zawiera całe ROI dane
- Można importować z powrotem
- Backup na dysku

---

## 🎓 Porady

1. **Zaznaczaj przyciskami dokładnie** - im dokładniejszy ROI, tym lepszy wynik
2. **Używaj zoom** - przybliż obszar przed zaznaczeniem
3. **Enter zamiast klikania** - szybciej w dialogach
4. **Regularne eksporty** - nie trać danych
5. **Mnógie rekordy** - możesz zaindeksować wiele osób z jednego aktu

---

## 🐛 Problemy?

- Nic się nie zmieniło? → F5 (odśwież stronę)
- ROI się nie rysuje? → Sprawdź czy pole jest aktywne (ma focus)
- Zoom nie działa? → Upewnij się że obraz jest załadowany

---

**Wersja:** 3.2  
**Data:** Grudzień 2025  
**Język:** Polski  
**Status:** Production Ready ✅
