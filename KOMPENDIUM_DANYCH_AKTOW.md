# Kompendium Modelu Danych dla Formularzy Wprowadzania Aktów Metrykalnych

## 📋 Spis treści
1. [Filozofia projektowania](#filozofia-projektowania)
2. [Struktura danych](#struktura-danych)
3. [Schematy dla typów aktów](#schematy-dla-typów-aktów)
4. [Walidacja i inteligentne pola](#walidacja-i-inteligentne-pola)
5. [Słowniki historyczne](#słowniki-historyczne)
6. [Praktyczne wskazówki](#praktyczne-wskazówki)
7. [Plany rozwoju](#plany-rozwoju)

---

## 🎯 Filozofia projektowania

### Zasada: **Maksymalna elastyczność, minimalne wymagania**

Każda informacja w akcie metrykalnym może, ale **nie musi być podana**:
- Może być data bez dnia (`styczeń 1924`)
- Może być imię bez nazwiska
- Może być wiek bez konkretnej daty urodzenia
- Może być zawód bez pełnych danych osobowych

**Cel**: Formularz dopasowuje się do rzeczywistości dokumentu, nie odwrotnie.

### Poziomy precyzji danych

```
Poziom 5: KOMPLETNE DANE
├─ Imię(na), nazwisko, wiek, zawód, miejsce zamieszkania, wszystko znane

Poziom 4: DANE GŁÓWNE
├─ Imię, nazwisko, wiek lub data urodzenia
├─ Zawód i miejsce zamieszkania znane

Poziom 3: DANE KLUCZOWE
├─ Imię i nazwisko znane
├─ Wiek OR data urodzenia (jedno z nich)
├─ Miejsce znane

Poziom 2: DANE MINIMALNE
├─ Imię lub nazwisko (czasem jedno)
├─ Wiek przybliżony lub okres

Poziom 1: FRAGMENT INFORMACJI
├─ Pojedyncze słowo lub liczba
├─ Trzeba odgadnąć kontekst
```

### Elastyczność pól

- **Brak "obowiązkowych" pól** - wszystko jest opcjonalne
- **Pola powiązane** - pojawienie się jednego może sugerować inne
- **Pola alternatywne** - jeśli nie ma daty, może być tylko miesiąc/rok
- **Pola wrażliwe na kontekst** - zawód dla mężczyzny vs. kobieta

---

## 🏗️ Struktura danych

### Model relacyjny (uproszczony)

```
RECORDS (rekordy/akty)
├── record_id (UUID)
├── record_type (BIRTH, MARRIAGE, DEATH)
├── archive_number (np. "UR.1926.No.01")
├── book_page (nr księgi, strona)
├── event_date (ISO 8601 lub partial)
├── event_location_id
├── source_notes (tekst długi dla notatek)
└── last_modified (timestamp)

PERSONS (osoby)
├── person_id (UUID)
├── record_id (klucz obcy)
├── role_type (CHILD, FATHER, MOTHER, GROOM, BRIDE, GROOM_WITNESS, DECEASED, etc.)
└── person_data (JSON)

PERSON_DATA (JSON struktura)
{
  "name": {
    "first_name": ["Jan", "Józef"],  // lista dla wielorazowych imion
    "last_name": "Kowalski",
    "maiden_name": "Nowak",  // dla kobiet
    "aliases": ["Jan Józef", "Piotr"]  // warianty pisowni
  },
  "life": {
    "birth_date": "1850-06-15",  // ISO, ale może być też "1850-06" lub "1850"
    "birth_place": {
      "place_id": "...",
      "place_name": "Warszawa"
    },
    "death_date": "1924-12-10",
    "death_place": {...},
    "age": 74  // jeśli znany
  },
  "social": {
    "gender": "M|F|?",
    "occupation": "Robotnik",
    "occupation_category": "WORKER|ARTISAN|MERCHANT|...",
    "civil_status": "SINGLE|MARRIED|WIDOWED|DIVORCED",
    "residence": {...}
  },
  "relations": {
    "spouse": "person_id",
    "parents": ["person_id", "person_id"],
    "children": ["person_id", ...],
    "godparents": ["person_id", ...]
  },
  "metadata": {
    "confidence": 0.95,  // Jak pewne dane (0-1)
    "source_text": "Jan Kowalski, robotnik...",  // oryginalne słowa
    "notes": "Możliwy syn tego Jana z 1850"
  }
}

PLACES (miejsca)
├── place_id
├── name
├── historical_hierarchy (Warszawa → Mazowieckie → Królestwo Polskie)
├── coordinates (jeśli znane)
└── aliases (poprzednie nazwy)
```

### Elastyczność daty

```javascript
// Wszystkie te formaty są akceptowane:
{
  "date": "1850-06-15",     // Dokładna data
  "date": "1850-06",        // Roku i miesiąc
  "date": "1850",           // Tylko rok
  "date": "~1850",          // Przybliżona (~, około)
  "date": null,             // Nieznana
  "season": "spring",       // Jesienna 1850
  "description": "Po wielkanocy 1850"  // Opisowe
}
```

---

## 📑 Schematy dla typów aktów

### A. AKT URODZENIA/CHRZTU

#### Wymagane od użytkownika (minimum sensowne):
- **Typ aktu** (Urodzenie / Chrzest / Oba)
- **Dziecko: imię** (może być kilka imion)
- **Dziecko: nazwisko** (jeśli znane)

#### Dane główne (jeśli dostępne):
```
DZIECKO:
├─ Imiona (może być 1-5)
├─ Nazwisko (może być panieńskie jeśli dziewczyna)
├─ Płeć (M/K/?)
├─ Data urodzenia (pełna lub partial: rok/miesiąc/dzień)
├─ Czy urodzone w małżeństwie? (status)
└─ Miejsce urodzenia

RDZICE:
├─ Ojciec: Imiona + Nazwisko (lub "nieznany")
├─ Ojciec: Zawód (z słownika lub custom)
├─ Ojciec: Wiek (na moment urodzenia)
├─ Matka: Imiona + Nazwisko (lub "nieznana")
├─ Matka: Nazwisko panieńskie (jeśli inna niż obecne)
├─ Matka: Zawód (rzadko)
├─ Matka: Wiek (na moment urodzenia)
├─ Rodzice: Miejsce zamieszkania
└─ Rodzice: Notki (np. "wdowiec z drugiego małżeństwa")

CHRZEST:
├─ Data chrztu (jeśli inna niż urodzenia)
├─ Miejsce chrztu
├─ Ojciec chrzestny: Imiona + Nazwisko
├─ Matka chrzestna: Imiona + Nazwisko
└─ Chrzestni: Zawód / Status (opcjonalnie)

DANE URZĘDOWE:
├─ Numer aktu
├─ Numer księgi/strony
├─ Data sporządzenia aktu (jeśli inna)
├─ Duchowny/Urzędnik podpisujący
└─ Świadkowie (1-2 osób)

DODATKOWE:
├─ Bliźnięta / Wieloraczki (zaznaczenie)
├─ Komplikacje przy porodzie (tekst)
├─ Informacje szczególne (tekst długi)
└─ Zmiana imion (jeśli była)
```

#### Przykłady elastyczności:

**Przykład 1**: Ubogi akt
```
Dziecko: Łucjan
Ojciec: nieznany
Matka: Marianna (bez nazwiska)
Data urodzenia: 1890 (bez miesiąca)
Miejsce: Warszawa
```

**Przykład 2**: Bliźnięta
```
Dziecko 1: Jan Józef Kowalski
Dziecko 2: Piotr Piotrowski
Data urodzenia: 1895-05-10
Rodzice: Stanisław Kowalski & Łucja Nowak
Status: Urodzone w małżeństwie
Notatka: "Bliźnięta, jedno chłopcem, drugie dziewczynką (Róża)"
```

**Przykład 3**: Zgubny akt
```
Dziecko: (imię nieczytelne - może być "Józef" lub "Jozef")
Ojciec: Walenty (bez nazwiska)
Data: ~1855 (rozmyte w tekście)
Notatka: "Zapis jest całkowicie wytarty, przeczytano co się dało"
```

---

### B. AKT MAŁŻEŃSTWA

#### Wymagane od użytkownika (minimum sensowne):
- **Pan młody: imię + nazwisko**
- **Panna młoda: imię + nazwisko**
- **Data ślubu** (rok wystarczy)

#### Dane główne:
```
PAN MŁODY:
├─ Imiona + Nazwisko
├─ Wiek (na moment ślubu) OR Data urodzenia
├─ Zawód
├─ Stan cywilny (kawaler/wdowiec/rozwiedziony)
├─ Miejsce zamieszkania
└─ Wyznanie (jeśli inna niż dominujące)

PANNA MŁODA:
├─ Imiona + Nazwisko
├─ Nazwisko panieńskie (jeśli inna)
├─ Wiek OR Data urodzenia
├─ Zawód (rzadko)
├─ Stan cywilny (panna/wdowa/rozwiedziona)
├─ Miejsce zamieszkania
└─ Wyznanie

ŚLUB:
├─ Data ślubu (dokładna lub tylko rok)
├─ Miejsce ślubu
├─ Typ ślubu (Cywilny / Kościelny / Obydwa)
├─ Dyspensa (jeśli była, np. z powodu pokrewieństwa)
└─ Zapowiedzi (daty i miejsca, jeśli wymienione)

RODZICE:
├─ Ojciec pana młodego: Imiona + Nazwisko
├─ Matka pana młodego: Imiona + Nazwisko
├─ Ojciec panny młodej: Imiona + Nazwisko
├─ Matka panny młodej: Imiona + Nazwisko
└─ Status rodziców (żywy/wdowa/brak informacji)

ŚWIADKOWIE:
├─ Świadek 1: Imiona + Nazwisko + Zawód (opcjonalnie)
├─ Świadek 2: Imiona + Nazwisko + Zawód (opcjonalnie)
└─ Relationship to couple (jeśli znane)

DANE URZĘDOWE:
├─ Numer aktu
├─ Numer księgi/strony
├─ Duchowny/Urzędnik
└─ Data sporządzenia

DODATKOWE:
├─ Preferencje: Kto prosił kogo?
├─ Konwersja religii (jeśli była)
├─ Warunki małżeństwa (jeśli wymienione)
└─ Bezpłodność / inne problemy (jeśli wymienione)
```

#### Walidacja kontekstowa:
- Jeśli stan cywilny = "wdowiec", wyświetl opcję dla danych poprzedniego małżeństwa
- Jeśli typ = "Cywilny", schowaj pola dla chrzestnych
- Jeśli jest dyspensa, wymagaj wyjaśnienia (np. "pokrewieństwo 3 stopnia")

---

### C. AKT ZGONU

#### Wymagane od użytkownika (minimum sensowne):
- **Zmarły: imię + nazwisko**
- **Data zgonu** (rok wystarczy)
- **Wiek** (lub data urodzenia)

#### Dane główne:
```
ZMARŁY:
├─ Imiona + Nazwisko
├─ Płeć
├─ Data urodzenia (pełna lub partial) OR Wiek w momencie zgonu
├─ Data zgonu (pełna lub partial)
├─ Miejsce zgonu
├─ Zawód
├─ Stan cywilny (żonaty/wdowiec/panna)
├─ Ostatnie miejsce zamieszkania
└─ Wyznanie (jeśli inne)

PRZYCZYNA ŚMIERCI:
├─ Główna przyczyna (z słownika chorób lub opisowo)
├─ Rozpoznanie (np. "zapalenie płuc")
├─ Ile czasu chorowała? (jeśli wiadomo)
└─ Okoliczności (np. wypadek, niespodziewana śmierć)

RODZINA:
├─ Małżonek (jeśli był): Imiona + Nazwisko
├─ Status małżonka (wdowiec lub wciąż żonaty)
├─ Rodzice (jeśli znane): Imiona + Nazwisko
├─ Dzieci (liczba lub lista)
└─ Zgłaszający zgon: Imiona + Nazwisko + Stosunek

POGRZEB:
├─ Data pogrzebu (jeśli inna)
├─ Miejsce pogrzebu (kościół, cmentarz)
├─ Typ pochówku (tradycyjny, katakumby, inne)
└─ Msze żałobne (jeśli wymienione)

DANE URZĘDOWE:
├─ Numer aktu
├─ Numer księgi/strony
├─ Lekarz (jeśli podpisany)
├─ Duchowny
├─ Urzędnik
└─ Świadkowie (zwykle 2)

DODATKOWE:
├─ Czy była sekcja zwłok?
├─ Pochowanie przed aktem (noworodek)
├─ Zmarły w więzieniu / szpitalu / domu
└─ Testator (jeśli wymieniony)
```

#### Specjalny kontekst: Dzieci
```
Jeśli wiek < 5 lat:
├─ Chrzest (jeśli był)
├─ Imiona chrzestne (mogą być inne)
├─ Przyczyna zgonu (często szczególnie istotna)
└─ Liczba dni/godzin życia (jeśli znana)
```

---

## 🔄 Walidacja i inteligentne pola

### Reguły warunkowe

```javascript
// Przykład: Pan młody
if (civil_status === "WIDOWED") {
  show("spouse_name");        // Poprzedni małżonek
  show("marriage_date");      // Kiedy się ożenił
  show("date_of_death");      // Kiedy wdowił
  ask("children_from_previous_marriage");
}

if (civil_status === "DIVORCED") {
  show("previous_spouse_name");
  ask("custody_of_children");
}

// Jeśli brak daty urodzenia, pytaj o wiek
if (!birth_date && !age) {
  require("age");  // Wiek jest zastępnikiem
}

// Walidacja czasu
if (birth_date && death_date) {
  age_calculated = death_date.year - birth_date.year;
  if (age_calculated < 0) warning("Data zgonu przed urodzeniem");
  if (age_calculated > 150) warning("Ponad 150 lat - możliwy błąd");
}

// Dla małżeństwa
if (marriage_date && birth_date_groom) {
  groom_age_at_marriage = marriage_date.year - birth_date_groom.year;
  if (groom_age_at_marriage < 15) warning("Panna młoda poniżej wieku");
}

// Dla urodzenia
if (birth_date && marriage_date_parents) {
  months_between = (birth_date - marriage_date_parents) / months;
  if (months_between < 6) suggest("Możliwe bliźnięta");
  if (months_between < 0) warning("Dziecko urodzone przed ślubem");
}
```

### Podpowiedzi kontekstowe

```javascript
// Jeśli rok = 1918-1921
suggest({
  "zawód": "Żołnierz",
  "stan_cywilny": "Wdowiec mogliśmy być",
  "notatka": "Era międzywojenna - możliwe zmiany nazwisk"
});

// Jeśli rok < 1850
suggest({
  "cechy": [
    "Czcionka gotycka - weryfikuj litery",
    "Łacina - terminy mogą być skrócone",
    "Mniej informacji o zawodach"
  ]
});

// Jeśli znajduje się w Warszawie
suggest({
  "miejsca": ["Warszawa", "Praga", "Wawer"],
  "zawody": ["Robotnik fabryk", "Handlarz", "Krawiec"]
});
```

---

## 📚 Słowniki historyczne

### Zawody (XIX-XX wiek)

```json
{
  "WORKER": ["Robotnik", "Robotnik fabryki", "Robotnik budowlany", "Górnik"],
  "ARTISAN": ["Krawiec", "Kucharz", "Cieśla", "Murarz", "Złotnik"],
  "MERCHANT": ["Handlarz", "Kupiec", "Sklepikarz", "Peddler"],
  "FARMER": ["Chłop", "Chłopka", "Rolnik", "Gospodarz"],
  "OFFICIAL": ["Urzędnik", "Sekretarz", "Radca"],
  "CLERGY": ["Ksiądz", "Zakonnik", "Katecheta"],
  "MILITARY": ["Żołnierz", "Oficer", "Szeregowiec"],
  "TEACHER": ["Nauczyciel", "Nauczycielka", "Profesor"],
  "DOCTOR": ["Lekarz", "Felczer", "Akuszerka"],
  "SERVANT": ["Służąca", "Lokaj", "Pachołek"],
  "OTHER": ["...", "Inne"]
}
```

### Choroby (przyczyny zgonu)

```json
{
  "RESPIRATORY": ["Zapalenie płuc", "Gruźlica", "Chrypka", "Kaszel"],
  "INFECTIOUS": ["Dur brzuszny", "Cholera", "Ospa", "Wrzód"],
  "HEART": ["Choroba serca", "Uderzenie", "Atak serca"],
  "CANCER": ["Nowotwór", "Rak"],
  "ACCIDENT": ["Wypadek", "Utonięcie", "Zatrucie"],
  "CHILDBED": ["Gorączka połogowa", "Powikłania porodu"],
  "SENILITY": ["Starość", "Omdlenie ze starości"],
  "UNKNOWN": ["Przyczyna nieznana", "Bezduszny"]
}
```

### Stan cywilny

```json
{
  "SINGLE": ["Panna", "Kawaler", "Bezżenny"],
  "MARRIED": ["Żonaty", "Zamężna", "Małżonek/Małżonka"],
  "WIDOWED": ["Wdowiec", "Wdowa"],
  "DIVORCED": ["Rozwiedziony", "Rozwiedziona"],
  "ANNULLED": ["Pozbawiony praw małżeńskich"],
  "UNKNOWN": ["Stan nieznany"]
}
```

---

## 💡 Praktyczne wskazówki

### 1. Strategie wprowadzania danych

#### Metoda "od razu":
- Wprowadź wszystko co widzisz
- Zaznacz co jest niepewne (confidence score)
- Dodaj notki do zamieszających fragmentów

#### Metoda "minimum + uzupełnianie":
- Wpisz minimum (imiona, nazwisko, rok)
- Kliknij "Dokończ później"
- Wróć z powiększalnikiem lub ekspertem

#### Metoda "iteracyjna":
- Pierwsze przejście: Transfer główne dane
- Drugie przejście: Uzupełnij brakujące pola
- Trzecie przejście: Walidacja i porównanie

### 2. Znaczniki niepewności

```
[?] = Tego nie jestem pewny
[~] = Przybliżone, rozmyte
[S] = Skan, trudne do czytania
[G] = Guess - upatrywanie
[X] = Sprzeczne informacje w akcie
```

### 3. Notatki dla przyszłych badaczy

```
Zawsze dodaj:
├─ "Zkseroal dokument xyz" → Gdzie dokument jest archiwalny
├─ "Porównać z aktem ślubu z 1880" → Linki do powiązanych dokumentów
├─ "Niedojrzały pismo, mogą być błędy w nazwach" → Kontekst czytania
└─ "Potwierdzono przez ..." → Gdzie potwierdzono dane
```

### 4. Radzenie sobie z wieloma wariantami

Jeśli nazwisko ma kilka możliwych czytań:
```
last_name: "Kowalski|Kawalski|Kawalczyk"
aliases: ["Kowalski", "Kawalski", "Kawalczyk"]
notes: "Niewyraźne - mogą być litery K, K, K"
```

---

## 🎯 Plany rozwoju

### Faza 1 (MVP): Kluczowe dane
- [x] Typ aktu (3 opcje)
- [x] Osoby główne (imię, nazwisko, wiek/data)
- [x] Daty główne (rok, miesiąc, dzień - elastycznie)
- [x] Miejsca
- [ ] Szybkie słowniki (zawody, choroby)

### Faza 2: Inteligencja
- [ ] Walidacja warunkowa (data > data, wiek realistyczny)
- [ ] Sugestie (np. "bliźnięta" jeśli mały przedział między urodzeniami)
- [ ] Auto-uzupełnianie (zawody dla regionu/okresu)
- [ ] Linkowanie osób (ten "Piotr" to syn tamtego "Stanisława"?)

### Faza 3: Analityka
- [ ] Statystyki (ile dzieci na parę, wiek ślubu, przyczyny zgonu)
- [ ] Duplikaty (czy ten akt jest już w bazie?)
- [ ] Genealogia (wizualizacja powiązań między aktami)
- [ ] Export (GEDCOM, CSV, JSON)

### Faza 4: Zaawansowane
- [ ] OCR dla rękopiśmiennych aktów
- [ ] Transliteracja (cyrylica → łacina)
- [ ] Czasoprzestrzenne mapy (gdzie się rodzili, umierali)
- [ ] Integracja z archiwami (czy istnieje oryginał?)

---

## 📋 Checklist implementacji

### Po każdym polu ask:
- [ ] Czy pole jest jasno opisane?
- [ ] Czy są przykłady?
- [ ] Czy jest help/tooltip?
- [ ] Czy walidacja jest logiczna?
- [ ] Czy pojawia się tylko gdy sensowne?

### Po każdym akcie:
- [ ] Czy są wymagane dane?
- [ ] Czy można zapisać niedokończony akt?
- [ ] Czy dane są poprawnie parsowane?
- [ ] Czy walidacja ostrzega o błędach?

### Przed wydaniem wersji:
- [ ] Testowanie na rzeczywistych aktach
- [ ] Feedback od genealogów
- [ ] Testowanie archiwów (różne regiony)
- [ ] Testowanie czasów (XVI-XXI wiek)

---

## 🔗 Referencje i inspiracje

- ACTA v1 - dokumentacja POLIN
- Genealogical Data Communication (GEDCOM)
- EAD (Encoded Archival Description)
- Standardy archiwalne ISO 26162

---

**Ostatnia aktualizacja**: 4 stycznia 2026
**Status**: Koncepcja do implementacji
**Autor**: Projekt genealogiczny v8
