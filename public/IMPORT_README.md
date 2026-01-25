# 📥 Import danych CH Blinów do Genealog Indexer

## 🔥 Firebase/Firestore Setup

### 1. Projekt Firebase
- **Nazwa**: ACTA
- **ID**: acta-9ea64
- **Numer**: 1031481893980

### 2. Konfiguracja SDK (już ustawiona)
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyAZ-d9kxHrijCW9P8ZXbZORvUPai0uzOXY",
    authDomain: "acta-9ea64.firebaseapp.com",
    projectId: "acta-9ea64",
    storageBucket: "acta-9ea64.firebasestorage.app",
    messagingSenderId: "1031481893980",
    appId: "1:1031481893980:web:1598979629a824fdf0b299",
    measurementId: "G-E6J3J4P41P"
};
```

### 3. Jak pobrać prawdziwe klucze:
1. Przejdź: https://console.firebase.google.com/project/acta-9ea64/settings/general
2. W sekcji "Your apps" → kliknij swoją aplikację webową
3. Skopiuj `apiKey` i `appId`
4. Wklej do obu plików:
   - `viewer-osd-v8.11.html`
   - `import-ch-blin.html`

```
projekt-akta-v2/public/
├── start-latest.bat              ← Uruchamia ostatnią wersję viewera
├── viewer-osd-v8.11.html        ← Główna aplikacja do wprowadzania danych
├── import-ch-blin.html          ← NEW: Importer danych genealogicznych
└── CH BLIN.txt                  ← Dane do zaimportowania
```

---

## 🚀 Szybki start

### 1. Uruchom importer
1. Otwórz `start-latest.bat` - serwer uruchomi się na `http://localhost:8000`
2. Przejdź do: `http://localhost:8000/import-ch-blin.html`

### 2. Zaimportuj dane
1. Otwórz `CH BLIN.txt` w edytorze
2. Zaznacz całą zawartość (`Ctrl+A`)
3. Wklej do importera
4. Kliknij "📊 Przeanalizuj dane"

### 3. Mapowanie kolumn
System automatycznie mapuje kolumny:
- `Imię` → **child_first_name** (Imię dziecka)
- `Nazwisko` → **child_last_name** (Nazwisko dziecka)  
- `ROK` → **christening_year** (Rok chrztu)
- `Nr.` → **christening_act_number** (Numer aktu)
- `ImięO` → **father_first_name** (Imię ojca)
- `NazwiskoO` → **father_last_name** (Nazwisko ojca)
- `wO` → **father_age** (Wiek ojca)
- `IM` → **mother_first_name** (Imię matki)
- `NM` → **mother_last_name** (Nazwisko matki)
- `wM` → **mother_age** (Wiek matki)
- `uwagi` → **notes** (Uwagi)
- `UWAGI ORG` → **notes_org** (Uwagi organizacyjne)

### 4. Eksportuj dane
Wybierz format:
- **💾 Export JSON** - Załaduj do localStorage (localStorage w przeglądarce)
- **📋 Export CSV** - Edytuj w Excel/LibreOffice
- **🔥 Export do Firestore** - Wysyła bezpośrednio do bazy danych
- **🎯 Załaduj do Indexer'a** - Bezpośrednio do aplikacji

---

## 🔥 Firebase/Firestore Integration

### W Viewer'e (viewer-osd-v8.11.html):
- **<i class="fab fa-google"></i> Login** - Zaloguj się przez Google
- **⬇️ Ładuj FB** - Załaduj dane z Firestore do aplikacji (tylko po zalogowaniu)
- **⬆️ Zapisz FB** - Wyślij dane z aplikacji do Firestore (tylko po zalogowaniu)

### W Importerze (import-ch-blin.html):
- **🔥 Export do Firestore** - Wysyła dane bezpośrednio do bazy

### Struktura danych w Firestore:
```
firestore/
  records/
    CH.LUB.BLIN.0/
      child_first_name: "Agata"
      child_last_name: "Rembacz"
      christening_year: "1783"
      father_first_name: "Wojciech"
      father_last_name: "Rembacz"
      father_age: "35"
      mother_first_name: "Zofia"
      mother_last_name: "Kowalska"
      mother_age: "32"
      notes: "bliźniaki"
      ...
```

---

## 📊 Mapowanie pól

### Dane source (CH BLIN.txt)
```
ID | ROK | Nr. | Nazwisko | Imię | Miejscowość | ImięO | NazwiskoO | wO | IM | NM | wM | uwagi | UWAGI ORG
```

### Pola docelowe (viewer-osd-v8.11.html)
```javascript
Akt Chrztu (Christening Record):
- record_id: "CH.LUB.BLIN.1783.001"        // ID aktu
- christening_year: "1783"                 // Rok
- christening_act_number: "1"              // Numer aktu
- child_first_name: "Agata"                // Imię dziecka
- child_last_name: "Rembacz"               // Nazwisko dziecka
- child_location: "Majdan"                 // Miejscowość
- father_first_name: "Wojciech"            // Imię ojca
- father_last_name: "Rembacz"              // Nazwisko ojca
- father_age: "35"                         // Wiek ojca
- mother_first_name: "Zofia"               // Imię matki
- mother_last_name: "Kowalska"             // Nazwisko matki
- mother_age: "32"                         // Wiek matki
- notes: "bliźniaki"                       // Uwagi
- notes_org: "Str 1 Fot 1"                 // Uwagi organizacyjne
```
- witness2_info
- christening_name
```

---

## 🔄 Przepływ danych

```
CH BLIN.txt (TSV)
      ↓
   IMPORTER
      ↓
  Mapowanie kolumn
      ↓
   Konwersja JSON
      ↓
    localStorage  (🎯 Załaduj do Indexer'a)
      ↓
VIEWER-OSD (imageActs array)
      ↓
  Wyświetlanie w tabeli
      ↓
   Edycja ręczna
      ↓
   Export (CSV/JSON/Firestore)
```

---

## 💾 localStorage struktura

```javascript
{
  "genealog_data": {
    "imageActs": [
      {
        "id": "CH.LUB.BLIN.0",
        "imageIdx": 0,
        "actNum": 1,
        "type": "christening",
        "timestamp": "2025-01-25T10:30:00.000Z",
        "fieldValues": {
          "child_first_name": "Agata",
          "child_last_name": "Rembacz",
          "christening_year": "1783",
          "christening_act_number": "1",
          ...
        },
        "fieldROIs": {},
        "actROI": null
      }
    ],
    "images": [
      {
        "name": "akta_scan_001.jpg",
        "data": "base64...data..."
      }
    ]
  }
}
```

---

## 🔥 Firebase Firestore struktura

Jeśli chcesz synchronizować z Firebase:

```
firestore/
  records/
    CH.LUB.BLIN.0/
      child_first_name: "Agata"
      child_last_name: "Rembacz"
      christening_year: "1783"
      father_first_name: "Wojciech"
      father_last_name: "Rembacz"
      father_age: "35"
      mother_first_name: "Zofia"
      mother_last_name: "Kowalska"
      mother_age: "32"
      notes: "bliźniaki"
      ...
```

---

## ⌨️ Klawisze skrótów w Viewer'e

```
Ctrl+O    → Dodaj obrazy
Ctrl+N    → Nowy akt
Ctrl+S    → Zapisz akt
Ctrl+Shift+V → Skopiuj poprzedni akt
Enter     → Otwórz/zamknij formularz
Escape    → Zamknij pinupy / formularz
```

---

## 📝 Jak używać danych w Viewer'e

### Po załadowaniu danych:

1. **Otwórz viewer**: `http://localhost:8000/viewer-osd-v8.11.html`
2. **Dodaj obrazy**: Ctrl+O (zeskanowane akta)
3. **Tabela pojawi się** z załadowanymi danymi w dolnej części
4. **Edytuj dane**: Kliknij na komórkę w tabeli
5. **Dodaj ROI**: Narysuj prostokąt na obrazie (dla OCR)
6. **Zapisz**: Ctrl+S

### Tabela wyświetla:
- Checkbox
- Imię dziecka (edytowalne)
- Nazwisko dziecka (edytowalne)
- Data urodzenia (edytowalne)
- Notatki (edytowalne)

---

## 🐛 Troubleshooting

### Problem: Importer pokazuje puste dane
**Rozwiązanie**: Sprawdź czy plik CH BLIN.txt używa separatorów TAB (nie spacji)

### Problem: Dane nie pojawiają się w Viewer'e
**Rozwiązanie**: 
1. Otwórz DevTools (F12)
2. Konsola → sprawdź localStorage
3. `JSON.parse(localStorage.getItem('genealog_data'))`

### Problem: Chcę dodać więcej pól
**Rozwiązanie**: Zmodyfikuj `fieldMapping` w importerze i dodaj pola w sekacji "Mapowanie kolumn"
### Problem: Firebase nie działa
**Rozwiązanie**: 
1. Sprawdź czy wkleiłeś prawdziwe klucze API
2. Upewnij się że Firestore jest włączony
3. Sprawdź reguły bezpieczeństwa Firestore
4. **Sprawdź czy jesteś zalogowany** - przyciski Firebase są widoczne tylko po zalogowaniu przez Google

### Problem: Przyciski Firebase nie są widoczne
**Rozwiązanie**: 
1. Kliknij przycisk "Login" i zaloguj się przez Google
2. Po zalogowaniu przyciski "Ładuj FB" i "Zapisz FB" powinny się pojawić
3. Jeśli nie, odśwież stronę
---

## 📚 Pliki do edycji

### Jeśli chcesz zmienić strukturę:

1. **import-ch-blin.html** - Dodaj więcej pól mapowania
2. **viewer-osd-v8.11.html** - Zmień pola w tabeli (linie ~4374)
3. **CH BLIN.txt** - Dodaj nowe kolumny z danymi

---

## 🔗 Linki

- Viewer: `http://localhost:8000/viewer-osd-v8.11.html`
- Importer: `http://localhost:8000/import-ch-blin.html`
- Firebase Console: https://console.firebase.google.com/project/acta-9ea64
- Firestore: https://console.firebase.google.com/project/acta-9ea64/firestore
- Start skrypt: `start-latest.bat`

---

**Autor**: Genealog Indexer v8.11  
**Data**: Styczeń 2025  
**Projekt Firebase**: ACTA (acta-9ea64)  
**Format**: CH Blinów (Lublin) - Akta Chrztu  
**Format**: CH Blinów (Lublin) - Akta Chrztu
