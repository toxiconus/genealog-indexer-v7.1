# 📖 Poradnik Edycji fields-config.json

## 🎯 Szybki Start

Musisz edytować `fields-config.json` aby zmienić pola w formularzach genealogicznych.

---

## 1️⃣ Otwórz plik

### W VS Code
```
Ctrl+O → fields-config.json
```

### W edytorze tekstowym
```
Prawy klik → Otwórz z → Notatnik
```

### W webzie (przeglądarce)
```
Nie da się edytować bezpośrednio
(Export → edytuj → wgraj ponownie w v8.22)
```

---

## 2️⃣ Zrozum Strukturę

```json
{
  "documentTypes": [
    {
      "id": "chrzest_1700",           // ← Unikalny ID (używaj w kodzie)
      "name": "Chrzest (1700-1750)",  // ← Widoczna nazwa w aplikacji
      "description": "...",            // ← Opis widoczny w modalu
      "fields": [
        {
          "name": "rok",               // ← ID pola dla HTML (input name="rok")
          "label": "Rok",              // ← Etykieta wyświetlana użytkownikowi
          "type": "text",              // ← Typ pola: text, select, textarea
          "enabled": 1,                // ← 1 = włączone (widoczne), 0 = wyłączone
          "line": 1,                   // ← Linia w siatce (1, 2, 3...)
          "column": 1,                 // ← Kolumna w siatce (1, 2)
          "required": true             // ← true = obowiązkowe, false = opcjonalne
        }
      ]
    }
  ]
}
```

---

## 3️⃣ Zmień Włączenie/Wyłączenie Pola

### Włącz pole (pokaż w formularzu)

**Znajdź:**
```json
{
  "name": "uwagi",
  "enabled": 0,          // ← Wyłączone
  "line": 0,
  "column": 0
}
```

**Zmień na:**
```json
{
  "name": "uwagi",
  "enabled": 1,          // ← Włączone!
  "line": 8,             // ← Podaj linię
  "column": 1            // ← Podaj kolumnę
}
```

### Wyłącz pole (ukryj w formularzu)

**Zmień:**
```json
"enabled": 1  →  "enabled": 0
"line": 2     →  "line": 0
"column": 1   →  "column": 0
```

---

## 4️⃣ Zmień Layout (Pozycję Pola)

Pola są ułożone w siatce 2-kolumnowej:

```
┌──────────────────┬──────────────────┐
│ line:1, col:1    │ line:1, col:2    │  ← Linia 1
├──────────────────┼──────────────────┤
│ line:2, col:1    │ line:2, col:2    │  ← Linia 2
├──────────────────┼──────────────────┤
│ line:3, col:1    │ line:3, col:2    │  ← Linia 3
└──────────────────┴──────────────────┘
```

### Przenieś pole na inny wiersz

**Chcę:** Przenieść "Imię ojca" z linii 3 na linię 5

**Znajdź:**
```json
{
  "name": "ojciec_imie",
  "line": 3,   // ← Było tutaj
  "column": 1
}
```

**Zmień na:**
```json
{
  "name": "ojciec_imie",
  "line": 5,   // ← Teraz tutaj
  "column": 1
}
```

---

## 5️⃣ Zmień Typ Pola

### text (pole tekstowe)
```json
{
  "type": "text",
  "label": "Rok"
}
```
Wynik: `<input type="text" />`

### select (lista rozwijana)
```json
{
  "type": "select",
  "label": "Płeć",
  "options": ["Mężczyzna", "Kobieta", "Nieznane"]
}
```
Wynik: Dropdown z wyborem

### textarea (wiele wierszy)
```json
{
  "type": "textarea",
  "label": "Uwagi"
}
```
Wynik: Duże pole tekstowe (80px wysokości)

---

## 6️⃣ Zmień Opcje dla SELECT

```json
{
  "name": "plec",
  "label": "Płeć",
  "type": "select",
  "options": ["M", "K"],  // ← Tutaj są opcje
  "enabled": 1,
  "line": 2,
  "column": 3
}
```

### Dodaj nową opcję
```json
"options": ["M", "K", "Nieznane"]  // ← Dodana "Nieznane"
```

### Zmień tekst opcji
```json
"options": ["M", "K"]  →  "options": ["Mężczyzna", "Kobieta"]
```

### Usuń opcję
```json
"options": ["M", "K", "Nieznane"]  →  "options": ["M", "K"]
```

---

## 7️⃣ Dodaj Nowe Pole

### Przykład: Dodaj pole "Zawód ojca" do "Chrzest 1800"

**Krok 1:** Znajdź sekcję `chrzest_1800`

```json
{
  "id": "chrzest_1800",
  "fields": [
    { "name": "rok", ... },
    { "name": "miesiac", ... },
    ...
    { "name": "uwagi", "enabled": 0, ... }  // ← Ostatnie pole
  ]
}
```

**Krok 2:** Dodaj nowe pole za ostatnim polem

```json
{ "name": "uwagi", "enabled": 0, ... },
{
  "name": "zaowod_ojca",              // ← Nowe pole!
  "label": "Zawód ojca",
  "type": "text",
  "enabled": 1,
  "line": 8,
  "column": 2,
  "required": false
}
```

**Pamiętaj:** Dodaj przecinek `,` między polami!

---

## 8️⃣ Usuń Pole

Znajdź cały blok pola (od `{` do `}`) i usuń go:

```json
// ❌ USUŃ CAŁE TO:
{
  "name": "zaowod_ojca",
  "label": "Zawód ojca",
  "type": "text",
  "enabled": 1,
  "line": 8,
  "column": 2,
  "required": false
},  // ← Usuń również przecinek
```

---

## 9️⃣ Stwórz Nowy Typ Dokumentu

### Chcesz dodać typ "Rocznice"

**Krok 1:** Dodaj nowy typ do `documentTypes`

```json
{
  "documentTypes": [
    { "id": "chrzest_1700", ... },
    { "id": "chrzest_1800", ... },
    { "id": "malzenstwo", ... },
    { "id": "zgon", ... },
    {
      "id": "rocznice",                 // ← Nowy typ!
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
          "name": "osoba",
          "label": "Osoba",
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

**Krok 2:** Przeładuj aplikację (F5) - nowy typ pojawi się w modalu

---

## 🔟 Walidacja JSON

Jeśli coś pójdzie nie tak, aplikacja pokaże błąd w konsoli (F12).

### Typowe błędy:

❌ **Brak cudzysłowu**
```json
{ name: "rok" }  // ❌ Źle
{ "name": "rok" }  // ✅ Dobrze
```

❌ **Brak przecinka między polami**
```json
{ "name": "rok", "enabled": 1 }
{ "name": "miesiac", "enabled": 1 }  // ❌ Brak przecinka wyżej
```

✅ **Prawidłowo:**
```json
{ "name": "rok", "enabled": 1 },     // ← Przecinek!
{ "name": "miesiac", "enabled": 1 }
```

❌ **Brakujący nawias**
```json
{ "name": "rok", ... ]  // ❌ Źle (brak }
[ "name": "rok", ... ]  // ❌ Źle (powinien być {)
```

### Jak sprawdzić JSON?
```
1. Otwórz: https://jsonlint.com/
2. Wklej zawartość fields-config.json
3. Kliknij "Validate JSON"
4. Jeśli "Valid JSON" - OK! ✅
```

---

## 1️⃣1️⃣ Zapisz Zmiany

### W VS Code
```
Ctrl+S  (automatycznie)
```

### W Notatniku
```
Plik → Zapisz (Ctrl+S)
Upewnij się że typ pliku to "Wszystkie pliki"
(nie .txt!)
```

---

## 1️⃣2️⃣ Przeładuj Aplikację

### W Przeglądarce
```
F5  (Odśwież)
Lub Ctrl+Shift+R  (Wyczyszcz cache)
```

### Przycisk w Aplikacji
```
[⚙️ Config]  → Wczytaj konfigurację ponownie
```

---

## 📝 Komplety Przykład: Zmiana "Chrzest 1700"

**Cel:** Włączyć pole "Uwagi" i przenieść "Chrzestna" na nowy wiersz

### Znajdź to:
```json
{
  "id": "chrzest_1700",
  "name": "Chrzest (1700-1750)",
  "fields": [
    { "name": "rok", "enabled": 1, "line": 1, "column": 1 },
    { "name": "miesiac", "enabled": 1, "line": 1, "column": 2 },
    { "name": "dzien", "enabled": 1, "line": 1, "column": 3 },
    { "name": "dziecko_imie", "enabled": 1, "line": 2, "column": 1 },
    { "name": "dziecko_nazwisko", "enabled": 1, "line": 2, "column": 2 },
    { "name": "dziecko_plec", "enabled": 1, "line": 2, "column": 3 },
    { "name": "ojciec_imie", "enabled": 1, "line": 3, "column": 1 },
    { "name": "ojciec_nazwisko", "enabled": 1, "line": 3, "column": 2 },
    { "name": "matka_imie", "enabled": 1, "line": 4, "column": 1 },
    { "name": "matka_nazwisko", "enabled": 1, "line": 4, "column": 2 },
    { "name": "chrzestny_imie", "enabled": 1, "line": 5, "column": 1 },
    { "name": "chrzestny_nazwisko", "enabled": 1, "line": 5, "column": 2 },
    { "name": "chrzestna_imie", "enabled": 1, "line": 6, "column": 1 },
    { "name": "chrzestna_nazwisko", "enabled": 1, "line": 6, "column": 2 },
    { "name": "miejsce", "enabled": 1, "line": 7, "column": 1 },
    { "name": "ksiadz", "enabled": 0, "line": 0, "column": 0 },
    { "name": "uwagi", "enabled": 0, "line": 0, "column": 0 }  // ← Wyłączone
  ]
}
```

### Zmień na to:
```json
{
  "id": "chrzest_1700",
  "name": "Chrzest (1700-1750)",
  "fields": [
    { "name": "rok", "enabled": 1, "line": 1, "column": 1 },
    { "name": "miesiac", "enabled": 1, "line": 1, "column": 2 },
    { "name": "dzien", "enabled": 1, "line": 1, "column": 3 },
    { "name": "dziecko_imie", "enabled": 1, "line": 2, "column": 1 },
    { "name": "dziecko_nazwisko", "enabled": 1, "line": 2, "column": 2 },
    { "name": "dziecko_plec", "enabled": 1, "line": 2, "column": 3 },
    { "name": "ojciec_imie", "enabled": 1, "line": 3, "column": 1 },
    { "name": "ojciec_nazwisko", "enabled": 1, "line": 3, "column": 2 },
    { "name": "matka_imie", "enabled": 1, "line": 4, "column": 1 },
    { "name": "matka_nazwisko", "enabled": 1, "line": 4, "column": 2 },
    { "name": "chrzestny_imie", "enabled": 1, "line": 5, "column": 1 },
    { "name": "chrzestny_nazwisko", "enabled": 1, "line": 5, "column": 2 },
    { "name": "chrzestna_imie", "enabled": 1, "line": 8, "column": 1 },  // ← Zmieniono line: 6 → 8
    { "name": "chrzestna_nazwisko", "enabled": 1, "line": 8, "column": 2 },  // ← Zmieniono line: 6 → 8
    { "name": "miejsce", "enabled": 1, "line": 7, "column": 1 },
    { "name": "ksiadz", "enabled": 0, "line": 0, "column": 0 },
    { "name": "uwagi", "enabled": 1, "line": 9, "column": 1 }  // ← Zmieniono: enabled: 0 → 1, dodano line i column
  ]
}
```

---

## 🆘 Pomoc

### "Plik się nie zapisał"
- Upewnij się że masz uprawnienia do edycji
- Spróbuj "Zapisz jako" w innym miejscu
- Sprawdź czy plik nie jest otwarty w innym programie

### "Zmiany się nie pokazują"
- Przeładuj aplikację (F5)
- Wczyść cache (Ctrl+Shift+R)
- Sprawdź konsolę (F12) pod kątem błędów

### "Błąd: Invalid JSON"
- Skopiuj tekst do https://jsonlint.com/
- Napraw błędy (brakujące przecinki, nawiasy, cudzysłowy)
- Spróbuj ponownie

---

## 📚 Ścieżka Edycji (Pełny Workflow)

```
1. Otwórz:        fields-config.json
                  ↓
2. Edytuj:        Zmień enabled, line, column, dodaj pola
                  ↓
3. Sprawdź JSON:  https://jsonlint.com/
                  ↓
4. Zapisz:        Ctrl+S
                  ↓
5. Przeładuj:     F5 (w przeglądarce)
                  ↓
6. Testuj:        Kliknij [📋 Formularz]
                  ↓
7. Wybierz typ:   Powinny być zmienione pola
                  ↓
8. OK! ✅
```

---

**Wersja Poradnika**: 1.0  
**Data**: 30.01.2026  
**Dla**: fields-config.json (v8.21)
