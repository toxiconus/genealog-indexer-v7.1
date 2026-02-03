# 🆕 Dynamiczne Formularze Genealogiczne (v8.21)

## 📋 Przegląd

Nowa funkcjonalność umożliwia konfigurację pól formularza genealogicznego z pliku JSON **bez zmian w kodzie HTML/JS**. Pozwala na elastyczne zarządzanie polami dla różnych typów dokumentów genealogicznych.

## 🎯 Główne Cechy

✅ **Konfiguracja w JSON** - Edytuj `fields-config.json` w edytorze tekstowym  
✅ **Wiele typów dokumentów** - Chrzest (1700), Chrzest (1800), Małżeństwo, Zgon  
✅ **Włączanie/wyłączanie pól** - Bez edycji kodu  
✅ **Dynamiczny layout** - Pola ułożone w grid (line/column)  
✅ **Dodawanie pól** - Aktywuj wyłączone pola w runtime'ie  
✅ **Export konfiguracji** - Pobierz zmienioną konfigurację  
✅ **Obsługa typów** - text, select, textarea

---

## 📂 Struktura Pliku `fields-config.json`

```json
{
  "documentTypes": [
    {
      "id": "chrzest_1700",              // Unikalny ID typu
      "name": "Chrzest (1700-1750)",    // Wyświetlana nazwa
      "description": "...",              // Opis
      "fields": [
        {
          "name": "rok",                 // Nazwa pola (dla formy)
          "label": "Rok",                // Etykieta wyświetlana
          "type": "text",                // Typ: text, select, textarea
          "enabled": 1,                  // 1 = włączone, 0 = wyłączone
          "line": 1,                     // Linia w grid
          "column": 1,                   // Kolumna w grid
          "required": true,              // Pole obowiązkowe?
          "options": [...]               // Dla type=select
        },
        ...
      ]
    },
    ...
  ],
  "metadata": {
    "version": "1.0",
    "lastUpdated": "2026-01-30"
  }
}
```

---

## 🚀 Jak Zacząć

### 1. Wczytaj formularz
Kliknij przycisk **📋 Formularz** w toolbar'u

↓

### 2. Wybierz typ dokumentu
Modal pokaże dostępne typy:
- Chrzest (1700-1750)
- Chrzest (1800-1850)
- Małżeństwo
- Zgon

↓

### 3. Uzupełnij pola
Wszystkie włączone pola będą już wyświetlone w formularzu

↓

### 4. Dodaj pola (opcjonalnie)
Kliknij "➕ Dodaj pole" aby aktywować wyłączone pola

↓

### 5. Zapisz dane
Kliknij **💾 Zapisz**

---

## 🔧 Edycja Konfiguracji

### Metoda 1: Bezpośrednia edycja JSON
```bash
# W edytorze tekstowym otwórz:
fields-config.json

# Zmień:
"enabled": 0  →  "enabled": 1  (włącz pole)
"enabled": 1  →  "enabled": 0  (wyłącz pole)

# Zmień layout (grid):
"line": 1, "column": 1  →  "line": 2, "column": 1
```

### Metoda 2: Export i ponowny import
```javascript
// W aplikacji:
1. Kliknij ⚙️ Config
2. Podejmij plik fields-config.json
3. Edytuj w notatniku
4. Wczytaj ponownie (F5 lub ⚙️ Config)
```

---

## 📋 Przykład: Zmiana Pól dla "Chrzest 1700"

**Przed** (5 pól aktywnych):
```json
"enabled": 1  → rok, miesiac, dzien, dziecko_imie, dziecko_nazwisko
"enabled": 0  → ojciec_imie, matka_imie, chrzestny_imie, uwagi
```

**Po** (8 pól aktywnych):
```json
// Edytuj fields-config.json:
{
  "name": "ojciec_imie",
  "enabled": 0  →  1        // Włącz
}
{
  "name": "matka_imie",
  "enabled": 0  →  1        // Włącz
}
{
  "name": "uwagi",
  "enabled": 0  →  1        // Włącz
}
```

**Rezultat**: Formularz będzie miał 8 pól zamiast 5

---

## 🎨 Layout Grid

Pola są ułożone w siatce 2-kolumnowej:

```
┌──────────────────┬──────────────────┐
│ Linia 1, Kol 1   │ Linia 1, Kol 2   │
├──────────────────┼──────────────────┤
│ Linia 2, Kol 1   │ Linia 2, Kol 2   │
├──────────────────┼──────────────────┤
│ Linia 3, Kol 1   │ Linia 3, Kol 2   │
└──────────────────┴──────────────────┘
```

**Zmiana pozycji pola**:
```json
{
  "name": "roku",
  "line": 1,      // Przenieś na linię 5
  "column": 1     // Lewa kolumna
}
```

---

## ✏️ Typy Pól

### text (input)
```json
{
  "type": "text",
  "label": "Rok"
}
```
HTML: `<input type="text" />`

### select (dropdown)
```json
{
  "type": "select",
  "label": "Płeć",
  "options": ["M", "K"]
}
```
HTML: `<select><option>M</option><option>K</option></select>`

### textarea (wieloliniowy)
```json
{
  "type": "textarea",
  "label": "Uwagi"
}
```
HTML: `<textarea></textarea>` (wysokość: 80px)

---

## 🆕 Nowe Typy Dokumentów

### Dodaj nowy typ

```json
{
  "documentTypes": [
    ...,
    {
      "id": "rocznice",
      "name": "Rocznice",
      "description": "Formularz dla rocznic",
      "fields": [
        {
          "name": "rok",
          "label": "Rok rocznicy",
          "type": "text",
          "enabled": 1,
          "line": 1,
          "column": 1,
          "required": true
        },
        {
          "name": "osoba_imie",
          "label": "Imię osoby",
          "type": "text",
          "enabled": 1,
          "line": 2,
          "column": 1,
          "required": true
        },
        {
          "name": "rodzaj_rocznicy",
          "label": "Rodzaj",
          "type": "select",
          "options": ["Urodziny", "Śmierć", "Ślub"],
          "enabled": 1,
          "line": 2,
          "column": 2,
          "required": false
        }
      ]
    }
  ]
}
```

Nowy typ pojawi się w modalu wyboru dokumentu.

---

## 🎛️ Pola Obowiązkowe

Oznacz pola z gwiazdką `*`:

```json
{
  "name": "dziecko_imie",
  "label": "Imię dziecka",
  "required": true  // Pokaże gwiazdkę
}
```

HTML: `Imię dziecka *`

---

## 📊 Integracja z Bazą Danych (v8.22+)

Aktualnie dane z formularza są przygotowywane, ale nie zapisywane w bazie. W przyszłej wersji:

```javascript
// v8.22
function saveDynamicFormData() {
  const formData = getFormValues();
  const newRecord = {
    // Mapuj pola z formularza na kolumny bazy
    id: formData.id,
    rok: formData.rok,
    imie: formData.dziecko_imie,
    // ...
  };
  saveImportedRecord(newRecord);
}
```

---

## 🔐 Bezpieczeństwo Konfiguracji

**Plik fields-config.json**:
- ✅ Przechowywany lokalnie (brak wysyłania na serwer)
- ✅ Format JSON (łatwa edycja)
- ✅ Backup przy exportcie
- ✅ Brak poufnych danych

**Dane formularza**:
- ✅ Przechowywane w localStorage/IndexedDB
- ✅ Nigdy nie wysyłane bez zgody
- ✅ Możliwość exportu do CSV/JSON

---

## 🛠️ Funkcje JavaScript

### `loadFieldsConfig()`
Wczytaj fields-config.json z serwera
```javascript
await loadFieldsConfig()
// → fieldsConfig zmienna globalna
```

### `showDocumentTypeSelector()`
Pokaż modal wyboru typu dokumentu
```javascript
showDocumentTypeSelector()
// → Modal z przyciskami dla każdego typu
```

### `selectDocumentType(documentTypeId)`
Załaduj formularz dla wybranego typu
```javascript
selectDocumentType('chrzest_1700')
// → Renderuj formularz w kontenerze
```

### `renderDynamicForm(documentTypeId)`
Generuj HTML formularza
```javascript
const html = renderDynamicForm('malzenstwo')
// → HTML z polami i przyciskami
```

### `addDynamicField(button)`
Dodaj wyłączone pole do formularza
```javascript
addDynamicField(event.target)
// → Pole pojawi się w grid
```

### `saveDynamicFormData()`
Zapisz dane z formularza
```javascript
saveDynamicFormData()
// → Przygotuj dane, wyświetl log
// → (integracja z bazą w v8.22)
```

### `downloadFieldsConfig()`
Pobierz zmienioną konfigurację
```javascript
downloadFieldsConfig()
// → fields-config_2026-01-30.json
```

---

## 📱 Interfejs Użytkownika

### Toolbar
```
[📋 Formularz] [⚙️ Config] [Eksport CSV] [JSON]
```

- **📋 Formularz**: Otwórz modal wyboru typu
- **⚙️ Config**: Wczytaj/odśwież konfigurację

### Modal Wyboru Typu
```
┌─────────────────────────────────────────┐
│  📚 Wybierz typ dokumentu               │
├─────────────────────────────────────────┤
│ ┌────────────────┐ ┌────────────────┐  │
│ │ Chrzest (1700) │ │ Chrzest (1800) │  │
│ │ Formularz dla  │ │ Formularz dla  │  │
│ │ chrztów...     │ │ chrztów...     │  │
│ └────────────────┘ └────────────────┘  │
│ ┌────────────────┐ ┌────────────────┐  │
│ │ Małżeństwo     │ │ Zgon           │  │
│ │ Formularz dla  │ │ Formularz dla  │  │
│ │ rejestracji... │ │ rejestracji... │  │
│ └────────────────┘ └────────────────┘  │
│              [✕ Zamknij]                │
└─────────────────────────────────────────┘
```

### Formularz Dynamiczny
```
┌─────────────────────────────────────────┐
│ 📋 Chrzest (1700-1750)                  │
│ Formularz dla chrztów z epoki...        │
├─────────────────────────────────────────┤
│ [Rok] [Miesiąc]                         │
│ [Imię dziecka] [Nazwisko dziecka]       │
│ [Imię ojca] [Nazwisko ojca]             │
│ [Imię matki] [Nazwisko matki]           │
│ [Imię chrzestnego] [Nazwisko...]        │
│ [Imię chrzestnej] [Nazwisko...]         │
│ [Miejsce chrztu]                        │
├─────────────────────────────────────────┤
│ ➕ Dodaj pole:                          │
│ [Wybierz pole do dodania ▼] [✓ Dodaj]   │
├─────────────────────────────────────────┤
│ [💾 Zapisz] [⬇️ Pobierz konfigurację]   │
└─────────────────────────────────────────┘
```

---

## 🐛 Rozwiązywanie Problemów

### "Config nie załadowany"
```
Rozwiązanie:
1. Sprawdź czy fields-config.json istnieje
2. Otwórz plik w edytorze - czy JSON jest poprawny?
3. Wciśnij F5 aby przeładować aplikację
4. Sprawdź konsolę (F12 → Console) pod kątem błędów
```

### "Pola się nie wyświetlają"
```
Rozwiązanie:
1. Sprawdź "enabled": 1 dla każdego pola
2. Sprawdź "line" i "column" (powinny być > 0)
3. Otwórz nowy typ dokumentu
```

### "Formularz nie zapisuje"
```
Rozwiązanie:
1. Integracja z bazą dostępna w v8.22
2. Aktualnie dane są tylko przygotowywane (console.log)
3. Będą zapisane do bazy w następnej wersji
```

---

## 📈 Przyszłe Rozszerzenia (v8.22+)

- [ ] Automatyczne mapowanie pól formularza na kolumny bazy
- [ ] Walidacja pól na podstawie typu
- [ ] Warunkowe wyświetlanie pól (if-logic)
- [ ] Szablony pól (templates)
- [ ] Mnożenie pól (powtarzające się sekcje)
- [ ] Import pól z Excel'a
- [ ] Obsługa multilanguage
- [ ] Historyczne wersje formularzy

---

## 📚 Przykłady Konfiguracji

### Minimalny Formularz
```json
{
  "documentTypes": [
    {
      "id": "prosty",
      "name": "Prosty Formularz",
      "fields": [
        {
          "name": "imie",
          "label": "Imię",
          "type": "text",
          "enabled": 1,
          "line": 1,
          "column": 1,
          "required": true
        },
        {
          "name": "nazwisko",
          "label": "Nazwisko",
          "type": "text",
          "enabled": 1,
          "line": 1,
          "column": 2,
          "required": true
        }
      ]
    }
  ]
}
```

### Zaawansowany Formularz
```json
{
  "id": "zaawansowany",
  "name": "Zaawansowany",
  "fields": [
    {
      "name": "typ",
      "label": "Typ dokumentu",
      "type": "select",
      "options": ["Chrzest", "Ślub", "Zgon"],
      "enabled": 1,
      "required": true
    },
    {
      "name": "notatki",
      "label": "Notatki",
      "type": "textarea",
      "enabled": 1,
      "required": false
    }
  ]
}
```

---

## 🔗 Powiązane Funkcjonalności

- **Importuj DB** (v8.20) - Wczytaj dane z CSV/JSON
- **Eksport CSV** (v8.20) - Pobierz dane dla Office'a
- **Editor ROI** - Narysuj regiony na obrazach
- **Duplikaty** - Zarządzaj zdublowanymi ID

---

## 📞 Wsparcie

**Błędy:**
- F12 → Console → sprawdź error messages
- Pliki: fields-config.json, viewer-osd-v8.20.html

**Dokumentacja:**
- [FINAL_SUMMARY_v8.20.md](FINAL_SUMMARY_v8.20.md) - Poprzednie wersje
- [fields-config.json](fields-config.json) - Bieżąca konfiguracja

---

**Wersja**: 8.21  
**Data**: 30.01.2026  
**Status**: ✅ **Gotowy do testowania**
