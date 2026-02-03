# ✅ Test Dynamicznych Formularzy (v8.21)

## 🎯 Plan Testowania

Sprawdzić czy dynamiczne formularze działają prawidłowo

---

## 📋 Test Case 1: Wczytanie Konfiguracji

### Kroki:
1. Otwórz `viewer-osd-v8.20.html` w przeglądarce
2. Otwórz konsolę (F12 → Console)

### Oczekiwany wynik:
```
✅ Konfiguracja pól załadowana: 4 typów dokumentów
```

### Co sprawdzać:
- [ ] Console nie pokazuje błędów
- [ ] Komunikat "Konfiguracja pól załadowana" pojawia się
- [ ] W toolbar'u pojawia się przycisk [📋 Formularz]

---

## 📋 Test Case 2: Otwarcie Selectora Typu

### Kroki:
1. Kliknij przycisk **[📋 Formularz]** w toolbar'u

### Oczekiwany wynik:
```
Modal z 4 kartami:
- Chrzest (1700-1750)
- Chrzest (1800-1850)
- Małżeństwo
- Zgon
```

### Co sprawdzać:
- [ ] Modal pojawia się
- [ ] Widoczne są 4 typy dokumentów
- [ ] Każda karta ma opis
- [ ] Przycisk [✕ Zamknij] działa

---

## 📋 Test Case 3: Załadowanie Formularza "Chrzest 1700"

### Kroki:
1. Z poprzedniego testu, kliknij kartę **"Chrzest (1700-1750)"**

### Oczekiwany wynik:
```
Formularz z polami:
- Rok, Miesiąc, Dzień
- Imię dziecka, Nazwisko dziecka, Płeć
- Imię ojca, Nazwisko ojca
- Imię matki, Nazwisko matki
- Imię chrzestnego, Nazwisko chrzestnego
- Imię chrzestnej, Nazwisko chrzestnej
- Miejsce chrztu

Oraz:
- Dropdown "➕ Dodaj pole" z wyłączonymi polami
- Przyciski [💾 Zapisz] [⬇️ Pobierz konfigurację]
```

### Co sprawdzać:
- [ ] Formularz jest widoczny
- [ ] Pola są ułożone w 2 kolumnach
- [ ] Każde pole ma poprawną etykietę
- [ ] Dropdown "Dodaj pole" istnieje
- [ ] Przyciski działają

---

## 📋 Test Case 4: Dodanie Nowego Pola

### Kroki:
1. Z poprzedniego testu, otwórz dropdown **"➕ Dodaj pole"**
2. Wybierz **"Imię księdza"**
3. Kliknij **"✓ Dodaj"**

### Oczekiwany wynik:
```
✅ Dodano pole: Imię księdza

Formularz ma teraz nowe pole:
[Imię księdza]
```

### Co sprawdzać:
- [ ] Powiadomienie o dodaniu pola pojawia się
- [ ] Nowe pole pojawia się w formularzu
- [ ] Pole ma poprawną etykietę
- [ ] Dropdown powraca do "-- Wybierz pole do dodania --"

---

## 📋 Test Case 5: Zapisanie Danych Formularza

### Kroki:
1. Z poprzedniego testu, wypełnij kilka pól:
   - Rok: `1750`
   - Imię dziecka: `Jan`
   - Nazwisko dziecka: `Kowalski`
2. Kliknij **[💾 Zapisz]**

### Oczekiwany wynik:
```
✅ Dane formularza przygotowane (integracja z bazą w v8.21)

Console pokaże:
📋 Dane formularza: { rok: "1750", dziecko_imie: "Jan", ... }
✅ Gotowe do zapisania w bazie...
```

### Co sprawdzać:
- [ ] Powiadomienie pojawia się
- [ ] Console pokazuje dane formularza
- [ ] Dane zawierają wszystkie wypełnione pola

---

## 📋 Test Case 6: Export Konfiguracji

### Kroki:
1. Otwórz formularz (Test Case 3)
2. Kliknij **[⬇️ Pobierz konfigurację]**

### Oczekiwany wynik:
```
Plik pobiera się:
fields-config_2026-01-30.json

✅ Konfiguracja pobrana
```

### Co sprawdzać:
- [ ] Plik się pobiera
- [ ] Nazwa pliku to `fields-config_YYYY-MM-DD.json`
- [ ] Plik można otworzyć w edytorze
- [ ] Zawiera poprawny JSON

---

## 📋 Test Case 7: Testowanie Wszystkich Typów Dokumentów

### Kroki:
1. Kliknij [📋 Formularz]
2. Dla każdego typu dokumentu (Chrzest 1700, Chrzest 1800, Małżeństwo, Zgon):
   - Kliknij kartę
   - Sprawdź czy formularz się załaduje
   - Sprawdź czy dropdown "Dodaj pole" zawiera pola

### Oczekiwany wynik:
```
Wszystkie 4 typy ładują się bez błędów
Każdy ma inne liczby pól włączonych
```

### Co sprawdzać:
- [ ] Chrzest 1700 - ~15 pól włączonych
- [ ] Chrzest 1800 - ~15 pól włączonych
- [ ] Małżeństwo - ~18 pól włączonych
- [ ] Zgon - ~12 pól włączonych
- [ ] Każdy ma własne wyłączone pola do dodania

---

## 📋 Test Case 8: Edycja fields-config.json (Zaawansowany)

### Kroki:
1. Pobierz konfigurację (Test Case 6)
2. Otwórz plik w edytorze (Notatnik lub VS Code)
3. Zmień jedno pole, np. "Rok" w "Chrzest 1700":
   ```json
   "enabled": 1  →  "enabled": 0
   "line": 1     →  "line": 0
   "column": 1   →  "column": 0
   ```
4. Zapisz plik
5. W aplikacji, kliknij **[⚙️ Config]** aby wczytać ponownie
6. Kliknij **[📋 Formularz]** → **"Chrzest (1700-1750)"**

### Oczekiwany wynik:
```
✅ Konfiguracja pól załadowana: 4 typów dokumentów

Formularz "Chrzest 1700" teraz ma:
- Brak pola "Rok"
- Pole pojawia się w dropdown "Dodaj pole"
```

### Co sprawdzać:
- [ ] Pole "Rok" znika z formularza
- [ ] Pojawia się w "➕ Dodaj pole"
- [ ] Można je dodać ponownie

---

## 🐛 Problemy i Rozwiązania

| Problem | Przyczyna | Rozwiązanie |
|---------|-----------|------------|
| "Config nie załadowany" | Brak fields-config.json | Sprawdź czy plik istnieje w głównym folderze |
| "Invalid JSON" | Błąd w fields-config.json | Sprawdź JSON na https://jsonlint.com/ |
| Pola się nie wyświetlają | enabled = 0 lub line/column = 0 | Ustaw enabled = 1 i proper line/column |
| Zmiany się nie pokazują | Cache przeglądarki | Wciśnij Ctrl+Shift+R (wyczyszczenie cache) |
| Modal się nie otwiera | JS error | Sprawdź konsolę (F12) |
| Przycisk "Dodaj" nie działa | enabled pole nie istnieje | Dodaj pole do arrays w JSON |

---

## 📊 Coverage Checklist

- [x] Wczytanie konfiguracji (Test 1)
- [x] Otwarcie selectora (Test 2)
- [x] Załadowanie formularza (Test 3)
- [x] Dodanie pola (Test 4)
- [x] Zapis danych (Test 5)
- [x] Export konfiguracji (Test 6)
- [x] Testowanie wszystkich typów (Test 7)
- [x] Edycja JSON (Test 8)

---

## 🎓 Expected Behavior (Pełny Workflow)

```
Aplikacja start:
  ↓
  ✅ fields-config.json wczytany
  ↓
  [📋 Formularz] widoczny w toolbar'u
  ↓
Kliknięcie [📋 Formularz]:
  ↓
  Modal z 4 typami dokumentów
  ↓
Kliknięcie typu (np. "Chrzest 1700"):
  ↓
  Formularz z 15 włączonymi polami
  ↓
  Dropdown "Dodaj pole" z wyłączonymi polami
  ↓
Wypełnienie pól + [💾 Zapisz]:
  ↓
  ✅ Dane formularza przygotowane
  Console pokazuje dane
  ↓
[⬇️ Pobierz konfigurację]:
  ↓
  Plik JSON pobiera się
  ↓
OK! ✅
```

---

## 📝 Notatki Testera

### Podczas testowania:
- Otwórz konsolę (F12) - może być przydatna do debugowania
- Przycisk [⚙️ Config] wczytuje config ponownie (przydatny po edycji)
- Każdy typ dokumentu jest niezależny - zmiany w jednym nie wpływają na inne

### Znane Ograniczenia (v8.21):
- Dane formularza nie są jeszcze zapisywane w bazie (integracja w v8.22)
- Nie ma walidacji pól
- Nie ma warunkowych pól (if-logic)

---

## ✅ Kryteria Sukcesu

- ✅ Konfiguracja się wczytuje bez błędów
- ✅ Modal wyboru typów pojawia się
- ✅ Formularz się renderuje prawidłowo
- ✅ Pola można dodawać i usuwać
- ✅ Dane formularza można exportować
- ✅ Konfiguracja JSON działa prawidłowo
- ✅ Brak JavaScript error'ów w konsoli
- ✅ UI jest responsywne i intuicyjna

---

**Status Testu**: 🔄 **W trakcie**  
**Data**: 30.01.2026  
**Wersja**: 8.21
