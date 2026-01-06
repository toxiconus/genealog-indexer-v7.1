# ACTA v3 - Model Danych Genealogicznych

**Rozszerzony Model Osobowy dla Systemów Genealogicznych**

*Wersja: 3.2 | Data: 6 stycznia 2026 | Kompatybilny z ACTA v1/v2/v3.0/v3.1*

---

## 📋 Spis Treści

1. [Wstęp](#wstęp)
2. [Filozofia Modelu](#filozofia-modelu)
3. [Podstawowe Pola Danych](#podstawowe-pola-danych)
4. [Rozszerzone Pola ACTA v3](#rozszerzone-pola-acta-v3)
5. **🆕 [Rozszerzenia ACTACOM 1.0](#rozszerzenia-actacom-10)**
6. [Metody i Funkcjonalności](#metody-i-funkcjonalności)
7. [Przykłady Zastosowania](#przykłady-zastosowania)
8. [Kompatybilność i Migracja](#kompatybilność-i-migracja)
9. [Eksport i Integracja](#eksport-i-integracja)

---

## 🎯 Wstęp

**ACTA v3** to rozszerzony model danych dla systemów genealogicznych, inspirowany standardami GEDCOM 7.0, GENTECH oraz nowoczesnymi praktykami AI-wspomaganej genealogii. Model zachowuje pełną kompatybilność wsteczną z ACTA v1/v2, dodając jednocześnie zaawansowane funkcje dla współczesnych zastosowań genealogicznych.

### Kluczowe Cechy ACTA v3:
- ✅ **Persystencja Rodzinna** - śledzenie dziedzicznych wzorców
- ✅ **AI-Integracja** - wsparcie dla danych generowanych przez AI
- ✅ **DNA i Genetyka** - integracja wyników testów genetycznych
- ✅ **Migracje Historyczne** - kompleksowe śledzenie ruchów populacji
- ✅ **Timeline & Walidacja** - chronologiczna weryfikacja danych
- ✅ **Kulturowa Elastyczność** - wsparcie dla różnorodności kulturowej

---

## 🧠 Filozofia Modelu

ACTA v3 opiera się na trzech filarach:

### 1. **Historyczna Dokładność**
- Obsługa różnych kalendarzy i systemów datowania
- Precyzyjne miejsce z hierarchią administracyjną
- Wielopoziomowa pewność danych (confidence scores)

### 2. **Kulturowa Wszechstronność**
- Wsparcie dla nazwisk patronimicznych (otczestwo)
- Elastyczne systemy pokrewieństwa
- Różnorodność kulturowa i regionalna

### 3. **Technologiczna Przyszłość**
- Integracja z AI i uczeniem maszynowym
- Wsparcie dla danych genetycznych
- Automatyczna walidacja i wykrywanie konfliktów

---

## 📊 Podstawowe Pola Danych

### Identyfikacja Osoby

| Pole | Typ | Opis | Przykład |
|------|-----|------|----------|
| `id` | `string` | Unikalny identyfikator w rejestrze | `"person-123"` |
| `firstName` | `string` | Imię osoby | `"Jan"` |
| `lastName` | `string` | Nazwisko osoby | `"Kowalski"` |
| `maidenName` | `string` | Nazwisko panieńskie (dla kobiet) | `"Nowak"` |
| `aliases` | `array` | Alternatywne formy imienia/nazwiska | `["Johann", "Janusz"]` |

### Dane Życiowe

| Pole | Typ | Opis | Przykład |
|------|-----|------|----------|
| `gender` | `enum` | Płeć: `MALE`, `FEMALE`, `UNKNOWN`, `NON_BINARY`, `OTHER` | `"MALE"` |
| `birthDate` | `HistoricalDate` | Data urodzenia z precyzją | `new HistoricalDate("1850-06-15")` |
| `birthPlace` | `HistoricalPlace` | Miejsce urodzenia | `new HistoricalPlace("Warszawa", "city")` |
| `deathDate` | `HistoricalDate` | Data zgonu | `new HistoricalDate("1920-03-10")` |
| `deathPlace` | `HistoricalPlace` | Miejsce zgonu | `new HistoricalPlace("Kraków", "city")` |
| `age` | `number` | Wiek (jeśli znany bez daty) | `75` |

### Społeczne i Zawodowe

| Pole | Typ | Opis | Przykład |
|------|-----|------|----------|
| `occupation` | `string` | Zawód/profesja | `"kowal"` |
| `occupationCategory` | `enum` | Kategoria zawodu | `"ARTISAN"` |
| `civilStatus` | `enum` | Stan cywilny | `"MARRIED"` |
| `residence` | `HistoricalPlace` | Miejsce zamieszkania | `new HistoricalPlace("Gdańsk", "city")` |
| `religion` | `string` | Wyznanie religijne | `"katolickie"` |

### Relacje Rodzinne

| Pole | Typ | Opis | Przykład |
|------|-----|------|----------|
| `parents` | `object` | ID rodziców | `{father: "person-456", mother: "person-789"}` |
| `spouse` | `string` | ID małżonka | `"person-101"` |
| `children` | `array` | IDs dzieci | `["person-202", "person-303"]` |
| `godparents` | `object` | ID rodziców chrzestnych | `{father: "person-404", mother: "person-505"}` |
| `siblings` | `array` | IDs rodzeństwa | `["person-606", "person-707"]` |

### Metadata

| Pole | Typ | Opis | Przykład |
|------|-----|------|----------|
| `confidence` | `number` | Pewność danych (0-100) | `85` |
| `sourceText` | `string` | Oryginalny tekst ze źródła | `"Akt chrztu nr 123/1850"` |
| `notes` | `string` | Notatki genealoga | `"Potrzebna weryfikacja daty"` |

---

## 🚀 Rozszerzone Pola ACTA v3

### Kulturowe i Historyczne Wariacje

| Pole | Typ | Opis | Kulturowy Kontekst | Przykład |
|------|-----|------|-------------------|----------|
| `patronymic` | `string` | Otczestwo (imię ojca) | Słowiański, rosyjski | `"Ivanovich"` |
| `clanOrTribe` | `string` | Klan/plemię | Kultury plemienne | `"Sioux"` |
| `confirmationDate` | `HistoricalDate` | Data chrztu/świętego potwierdzenia | Chrześcijański | `new HistoricalDate("1850-07-01")` |
| `causeOfDeath` | `string` | Przyczyna zgonu | Medyczny/histor. | `"gruźlica"` |

### Zdrowie i Genetyka

| Pole | Typ | Opis | Szczegóły | Przykład |
|------|-----|------|-----------|----------|
| `medicalConditions` | `array` | Historia chorób | `[{condition, onsetDate, source, certainty}]` | `[{condition: "gruźlica", onsetDate: HistoricalDate(...), source: "akt zgonu", certainty: 90}]` |
| `dnaData` | `object` | Dane genetyczne | `{tests: [...], haplogroup: string}` | `{tests: [{type: "Y-DNA", results: ["DYS393:13"], haplogroup: "R1a"}], haplogroup: "R1a"}` |

### Migracje i Mobilność

| Pole | Typ | Opis | Szczegóły | Przykład |
|------|-----|------|-----------|----------|
| `migrations` | `array` | Historia migracji | `[{from, to, date, reason, source, certainty}]` | `[{from: HistoricalPlace("Rosja"), to: HistoricalPlace("Polska"), date: HistoricalDate("1917"), reason: "wojna", source: "dokument emigracyjny"}]` |

### Majątek Ekonomiczny

| Pole | Typ | Opis | Szczegóły | Przykład |
|------|-----|------|-----------|----------|
| `assets` | `array` | Własność/majątek | `[{assetType, value, date, source, certainty}]` | `[{assetType: "nieruchomość", value: "dom w centrum", date: HistoricalDate("1900"), source: "akt własności"}]` |

### Persystencja Rodzinna

| Pole | Typ | Opis | Szczegóły | Przykład |
|------|-----|------|-----------|----------|
| `familyPatterns` | `object` | Dziedziczne wzorce | `{inheritedOccupation, migrationPatterns, healthPatterns}` | `{inheritedOccupation: {occupation: "kowal", inheritedFrom: "father"}, migrationPatterns: ["Europa→Ameryka"], healthPatterns: ["gruźlica dziedziczna"]}` |

### Społeczne i Demograficzne (ACTA v3.0)

| Pole | Typ | Opis | Szczegóły | Przykład |
|------|-----|------|-----------|----------|
| `occupationHistory` | `array` | Historia zawodowa | `[{occupation, startDate, endDate, place, source, certainty}]` | `[{occupation: "kowal", startDate: HistoricalDate("1850"), endDate: HistoricalDate("1880"), place: HistoricalPlace("Warszawa"), source: "akta miejskie"}]` |
| `nationality` | `string` | Narodowość | Zgodnie ze słownikiem Nationalities | `"polska"` |
| `citizenship` | `string` | Obywatelstwo | Zgodnie ze słownikiem Citizenships | `"Imperium Rosyjskie"` |
| `education` | `string` | Wykształcenie | Zgodnie ze słownikiem EducationLevels | `"średnie"` |
| `socialStatus` | `string` | Status społeczny | Zgodnie ze słownikiem SocialStatuses | `"mieszczanin"` |

---

## 🔧 Metody i Funkcjonalności

### Metody do Zarządzania Danymi

```javascript
// Migracje
person.addMigration(fromPlace, toPlace, date, reason, source, certainty = 100)

// Dane DNA
person.addDnaTest(testType, results, haplogroup, source, certainty = 100)

// Warunki zdrowotne
person.addMedicalCondition(condition, onsetDate, source, certainty = 100)

// Majątek
person.addAsset(assetType, value, date, source, certainty = 100)

// Persystencja rodzinna
person.setInheritedOccupation(occupation, inheritedFrom = 'ancestor')

// Alternatywne nazwy (rozszerzone)
person.addAlternativeName(firstName, lastName, type = 'alias', period, source, certainty = 100)
// Typy: 'alias', 'pseudonym', 'maiden', 'religious', 'immigration', 'marriage', 'adoption'

// Historia zawodowa
person.addOccupationHistory(occupation, startDate, endDate, place, source, certainty = 100)

// Sprawdzanie persystencji rodzinnej
const persistence = person.checkFamilyPersistence(database, criteria)
// Zwraca: {occupationPersistence, migrationPersistence, healthPersistence, score}
```

## 🆕 Rozszerzenia ACTACOM 1.0

ACTA v3.2 wprowadza zaawansowane rozszerzenia inspirowane formatem ACTACOM 1.0, skupiające się na niepewności danych genealogicznych, lukach badawczych i złożonych relacjach między informacjami.

### System Hipotez Genealogicznych

| Pole | Typ | Opis | Zastosowanie |
|------|-----|------|-------------|
| `hypothesis.isHypo` | `boolean` | Czy dane to hipoteza | Oznaczanie przypuszczeń |
| `hypothesis.conf` | `number` | Stopień pewności (0-100) | Ocena wiarygodności hipotezy |
| `hypothesis.just` | `string` | Uzasadnienie hipotezy | Tekstowy opis podstaw |
| `hypothesis.altTheoryId` | `string` | Link do alternatywnej teorii | Referencja ID TheoryModel |
| `hypothesis.evid` | `enum` | Typ dowodu | 'DEDUCED', 'PRIMARY', 'SECONDARY' |

### Oznaczanie Luk Genealogicznych

| Typ Luki | Opis | Zastosowanie |
|----------|------|-------------|
| `MISSING_GENERATION` | Brakujące pokolenie | Planowanie badań genealogicznych |
| `MISSING_SIBLING` | Brakujące rodzeństwo | Identyfikacja nieznanych krewnych |
| `MISSING_SPOUSE` | Brakujący małżonek | Uzupełnianie relacji małżeńskich |
| `MISSING_CHILD` | Brakujące dziecko | Rekonstrukcja rodzin |
| `MISSING_PLACE` | Nieznane miejsce | Geograficzne luki w danych |
| `MISSING_DATE` | Nieznana data | Chronologiczne braki |
| `MISSING_EVENT` | Brakujące wydarzenie | Uzupełnianie biografii |
| `MISSING_SOURCE` | Brak źródła | Potrzeba nowych materiałów |

### System Różnych Teorii

| Pole | Typ | Opis | Zastosowanie |
|------|-----|------|-------------|
| `id` | `string` | Unikalne ID teorii (@TH1@) | Identyfikacja teorii |
| `name` | `string` | Nazwa teorii | Opisowa etykieta |
| `authId` | `string` | ID autora teorii | Śledzenie pochodzenia |
| `date` | `HistoricalDate` | Data utworzenia | Chronologia teorii |
| `just` | `string` | Uzasadnienie teorii | Szczegółowe podstawy |
| `conf` | `number` | Pewność teorii (0-100) | Ocena wiarygodności |
| `oppoId` | `string` | ID teorii konkurencyjnej | Link do alternatyw |
| `relTheory` | `object` | Relacje z innymi teoriami | 'contradicts', 'supports', 'extends' |
| `personIds` | `array` | Osoby związane z teorią | Zakres zastosowania |
| `sources` | `array` | Źródła wspierające | Materiały dowodowe |

### Weryfikacja Wieku

| Pole | Typ | Opis | Zastosowanie |
|------|-----|------|-------------|
| `ageAnalysis.expected` | `number` | Oczekiwana długość życia | Historyczny kontekst |
| `ageAnalysis.variance` | `number` | Odchylenie od normy | Statystyczna analiza |
| `ageAnalysis.flag` | `enum` | Status weryfikacji | 'OK', 'QUESTIONABLE', 'UNLIKELY', 'IMPOSSIBLE' |
| `ageAnalysis.histContext` | `string` | Kontekst historyczny | Czynniki wpływające |
| `ageAnalysis.familyPattern` | `string` | Wzorce rodzinne | Dziedziczne cechy |

### Śledzenie Zmian w Danych

| Pole | Typ | Opis | Zastosowanie |
|------|-----|------|-------------|
| `changeLog[]` | `array` | Historia zmian | Audit trail modyfikacji |
| `researchLog[]` | `array` | Historia badań | Dokumentacja postępów |

### Rozszerzone Źródła i Wiarygodność

| Pole | Typ | Opis | Zastosowanie |
|------|-----|------|-------------|
| `type` | `string` | Typ źródła | 'CHURCH_REGISTER', 'CIVIL_REGISTER' |
| `subtype` | `string` | Podtyp źródła | 'BAPTISM', 'MARRIAGE', 'DEATH' |
| `qual` | `enum` | Jakość źródła | 'PRIMARY', 'SECONDARY', 'TERTIARY' |
| `cond` | `enum` | Stan zachowania | 'EXCELLENT', 'GOOD', 'FAIR', 'POOR' |
| `acc` | `enum` | Dostępność | 'HIGH', 'MEDIUM', 'LOW' |
| `digit` | `boolean` | Czy zdigitalizowane | Status digitalizacji |
| `transcr` | `boolean` | Czy transkrybowane | Status transkrypcji |

### Wykrywanie Wzorców

| Pole | Typ | Opis | Zastosowanie |
|------|-----|------|-------------|
| `type` | `string` | Typ wzorca | 'NAME_PATTERN', 'DATE_PATTERN' |
| `desc` | `string` | Opis wzorca | Szczegółowa charakterystyka |
| `personIds` | `array` | Osoby wykazujące wzorzec | Zakres występowania |
| `conf` | `number` | Pewność wzorca (0-100) | Statystyczna ocena |
| `exceptions` | `array` | Wyjątki od wzorca | Anomalie i odstępstwa |

### Rozszerzona Integracja DNA

| Pole | Typ | Opis | Zastosowanie |
|------|-----|------|-------------|
| `dnaData.matches[]` | `array` | Matches DNA | Lista zgodności genetycznych |
| `matchName` | `string` | Nazwa matcha | Identyfikacja osoby |
| `haplogroup` | `string` | Haplogrupa | Klasyfikacja genetyczna |
| `distance` | `number` | Odległość genetyczna | Miara pokrewieństwa |
| `cert` | `number` | Pewność matcha | Ocena wiarygodności |
| `commonAncestorId` | `string` | ID wspólnego przodka | Łącze genealogiczne |
| `certAncestor` | `enum` | Pewność przodka | 'HIGH', 'MEDIUM', 'LOW' |

### Kontekst Historyczny

| Pole | Typ | Opis | Zastosowanie |
|------|-----|------|-------------|
| `name` | `string` | Nazwa wydarzenia | Identyfikacja zdarzenia |
| `date` | `HistoricalDate` | Data wydarzenia | Chronologia |
| `placeId` | `string` | Miejsce wydarzenia | Geografia |
| `desc` | `string` | Opis wydarzenia | Szczegółowa charakterystyka |
| `impact` | `string` | Wpływ na populację | Kontekst społeczny |
| `personIds` | `array` | Osoby zaangażowane | Bezpośredni udział |
| `roles` | `object` | Role osób | Funkcje w wydarzeniu |

### Metody ACTACOM 1.0

```javascript
// System Hipotez
person.setHypothesis(isHypo, conf, just, evid, altTheoryId)

// Weryfikacja Wieku
person.verifyAge() // Zwraca analysis object

// Śledzenie Zmian
person.logChange(field, oldValue, newValue, reason, sourceId)
person.logResearch(action, result, sourceId)

// Rozszerzone DNA
person.addDnaMatch(matchName, haplogroup, distance, cert, commonAncestorId, certAncestor)

// Zarządzanie Lukami (w PersonDatabase)
database.addGap(gap)
database.getGapsByType('MISSING_GENERATION')
database.getGapsByPriority('HIGH')

// Zarządzanie Teoriami
database.addTheory(theory)
database.getConflictingTheories(theoryId)

// Zarządzanie Wzorcami
database.addPattern(pattern)
database.getPatternsByType('NAME_PATTERN')

// Wydarzenia Historyczne
database.addHistEvent(histEvent)
database.getHistEventsByPerson(personId)

// Rozszerzone Źródła
database.addSource(source)
database.getSourcesByType('CHURCH_REGISTER')
```

---

### Metody Walidacji i Analizy

```javascript
// Budowa timeline'u
person.buildTimeline() // Zwraca chronologię wydarzeń

// Rozwiązywanie konfliktów
person.resolveConflict(field, resolvedValue, reason)

// Serializacja
const jsonData = person.toJSON()
const restoredPerson = PersonModel.fromJSON(jsonData)

// Eksport do GEDCOM
const gedcomString = person.toGEDCOM()
```

---

## 💡 Przykłady Zastosowania

### Przykład 1: Osoba z Tradycją Słowiańską i Migracją

```javascript
const ivan = new ACTA.PersonModel('Ivan', 'Petrov');
ivan.patronymic = 'Ivanovich'; // Otczestwo
ivan.clanOrTribe = 'kozacki'; // Tradycja kulturowa

// Migracja historyczna
ivan.addMigration(
  new ACTA.HistoricalPlace('Rosja', 'country'),
  new ACTA.HistoricalPlace('Polska', 'country'),
  new ACTA.HistoricalDate('1917-01-01'),
  'rewolucja bolszewicka',
  'Akt emigracyjny nr 123',
  95 // 95% pewności
);

// Dane genetyczne
ivan.addDnaTest(
  'Y-DNA',
  ['DYS393:13', 'DYS390:24', 'DYS19:14'],
  'R1a',
  'Test DNA 2023',
  100
);

// Persystencja rodzinna
ivan.setInheritedOccupation('kozak', 'father');
ivan.familyPatterns.migrationPatterns = ['stepy → miasta'];
```

### Przykład 2: Osoba z Danymi Zdrowotnymi i Timeline

```javascript
const anna = new ACTA.PersonModel('Anna', 'Kowalska');

// Warunki zdrowotne
anna.addMedicalCondition(
  'gruźlica',
  new ACTA.HistoricalDate('1895'),
  'Akt zgonu',
  90
);

// Budowa timeline'u
anna.buildTimeline();

// Sprawdzenie konfliktów
if (anna.conflicts.length > 0) {
  console.log('Znaleziono konflikty:', anna.conflicts);
  anna.resolveConflict(
    'medical_timeline',
    'Potwierdzono datę zachorowania',
    'Źródło medyczne priorytetowe'
  );
}
```

### Przykład 4: Historia Zawodowa i Status Społeczny

```javascript
const janusz = new ACTA.PersonModel('Janusz', 'Kowalski');

// Status społeczny i demografia
janusz.nationality = 'polska';
janusz.citizenship = 'Królestwo Polskie';
janusz.education = 'podstawowe';
janusz.socialStatus = 'chłop';

// Historia zawodowa
janusz.addOccupationHistory(
  'chłop pańszczyźniany',
  new ACTA.HistoricalDate('1840'),
  new ACTA.HistoricalDate('1864'),
  new ACTA.HistoricalPlace('Wieś Kowalowa', 'village'),
  'Akta uwłaszczeniowe',
  95
);

janusz.addOccupationHistory(
  'robotnik fabryczny',
  new ACTA.HistoricalDate('1865'),
  new ACTA.HistoricalDate('1890'),
  new ACTA.HistoricalPlace('Łódź', 'city'),
  'Akta fabryczne',
  90
);

// Sprawdzanie persystencji rodzinnej
const persistence = janusz.checkFamilyPersistence(database, {
  checkOccupation: true,
  checkMigration: true,
  generations: 3
});

console.log('Persystencja rodzinna:', persistence);
```

### Przykład 5: Rozszerzone Alternatywne Nazwy

```javascript
const maria = new ACTA.PersonModel('Maria', 'Nowak');

// Różne typy alternatywnych nazw
maria.addAlternativeName('Mary', 'Nowak', 'immigration', {
  from: new ACTA.HistoricalDate('1880'),
  to: new ACTA.HistoricalDate('1920')
}, 'Dokumenty emigracyjne USA', 85);

maria.addAlternativeName('Maria', 'Schmidt', 'marriage', {
  from: new ACTA.HistoricalDate('1905')
}, 'Akt ślubu', 100);

maria.addAlternativeName('Siostra Teresa', 'Nowak', 'religious', {
  from: new ACTA.HistoricalDate('1925')
}, 'Akta zakonne', 95);

maria.addAlternativeName('Masha', 'Nowakova', 'pseudonym', {
  from: new ACTA.HistoricalDate('1910'),
  to: new ACTA.HistoricalDate('1918')
}, 'Dokumenty rewolucyjne', 70);
```

### Przykład 6: Integracja z AI i Walidacja

```javascript
const adam = new ACTA.PersonModel('Adam', 'Wiśniewski');

// Dane częściowo wygenerowane przez AI
adam.aiGenerated = true;
adam.probabilityScores = {
  parentMatch: 0.87,
  nameMatch: 0.94,
  locationMatch: 0.82,
  occupationMatch: 0.76
};

// Historia zawodowa z walidacją AI
adam.addOccupationHistory(
  'nauczyciel',
  new ACTA.HistoricalDate('1870'),
  new ACTA.HistoricalDate('1900'),
  new ACTA.HistoricalPlace('Warszawa', 'city'),
  'AI-generowane na podstawie akt szkolnych',
  78 // Niższa pewność dla danych AI
);

// Sprawdzanie konfliktów
adam.buildTimeline();
if (adam.conflicts.length > 0) {
  adam.resolveConflict(
    'occupation_timeline',
    'Potwierdzono okres zatrudnienia',
    'Weryfikacja krzyżowa z aktami miejskimi'
  );
}
```

### Przykład 7: Kompleksowa Persystencja Rodzinna

```javascript
const familyDatabase = new ACTA.PersonDatabase();

// Dodanie członków rodziny
const father = new ACTA.PersonModel('Stanisław', 'Kowalski');
father.occupation = 'kowal';
father.nationality = 'polska';
father.socialStatus = 'rzemieślnik';

const son = new ACTA.PersonModel('Jan', 'Kowalski');
son.addOccupationHistory('kowal', new ACTA.HistoricalDate('1900'), new ACTA.HistoricalDate('1930'));
son.nationality = 'polska';
son.socialStatus = 'rzemieślnik';

// Sprawdzanie persystencji
const persistence = son.checkFamilyPersistence(familyDatabase, {
  checkOccupation: true,
  checkSocialStatus: true,
  checkNationality: true,
  generations: 2
});

console.log('Ocena persystencji rodzinnej:', persistence.score);
// persystencja.score > 0.8 wskazuje na silną persystencję rodzinną
```

### Przykład 8: Migracja z Danymi Społeczno-Demograficznymi

```javascript
const immigrant = new ACTA.PersonModel('Giovanni', 'Rossi');

// Dane demograficzne przed migracją
immigrant.nationality = 'włoska';
immigrant.citizenship = 'Królestwo Włoch';
immigrant.education = 'średnie';
immigrant.socialStatus = 'robotnik';
immigrant.occupation = 'murarz';

// Migracja
immigrant.addMigration(
  new ACTA.HistoricalPlace('Neapol', 'city', 'Włochy'),
  new ACTA.HistoricalPlace('Nowy Jork', 'city', 'USA'),
  new ACTA.HistoricalDate('1905-03-15'),
  'ekonomiczna',
  'Lista pasażerów SS Italia',
  100
);

// Zmiana statusu po migracji
immigrant.addOccupationHistory(
  'murarz',
  new ACTA.HistoricalDate('1906'),
  new ACTA.HistoricalDate('1930'),
  new ACTA.HistoricalPlace('Nowy Jork', 'city', 'USA'),
  'Akta związkowe',
  95
);

// Zmiana obywatelstwa
immigrant.citizenship = 'USA';
immigrant.addAlternativeName('John', 'Ross', 'immigration', {
  from: new ACTA.HistoricalDate('1905')
}, 'Dokumenty naturalizacyjne', 100);
```

---

## 🔄 Kompatybilność i Migracja

### Wsteczna Kompatybilność
- ✅ Wszystkie pola ACTA v1/v2 są obsługiwane
- ✅ Istniejące metody działają bez zmian
- ✅ Dane JSON z v1/v2 są automatycznie migracji

### Migracja Danych
```javascript
// Automatyczna migracja z v1 do v3
const oldPersonData = loadFromV1Format();
const person = ACTA.PersonModel.fromJSON(oldPersonData);
// Nowe pola są automatycznie inicjalizowane wartościami domyślnymi
```

### Wersjonowanie
- **ACTA v1**: Podstawowy model genealogiczny
- **ACTA v2**: Ulepszenia strukturalne
- **ACTA v3**: Rozszerzenia nowoczesne (DNA, AI, migracje)

---

## 🌐 Eksport i Integracja

### Formaty Eksportu

#### GEDCOM (Rozszerzony)
```javascript
const gedcom = person.toGEDCOM();
// Zawiera:
// - Standard GEDCOM 5.5.1
// - Rozszerzenia ACTA v3: _PATRN, _DNA, _MIGR, _MDCL, _AI
```

#### JSON (Kompletny)
```javascript
const json = person.toJSON();
// Zawiera wszystkie pola ACTA v3
// Kompatybilny z importem fromJSON()
```

### Integracja z Systemami Zewnętrznymi

#### AI i ChatGPT
```javascript
// Oznaczanie danych z AI
person.aiGenerated = true;
person.probabilityScores.aiConfidence = 0.73;
```

#### Bazy DNA
```javascript
// Integracja z GEDmatch, MyHeritage, etc.
person.addDnaTest('autosomal', resultsFromAPI, null, 'GEDmatch');
```

#### Systemy Migracyjne
```javascript
// Integracja z danymi historycznymi migracji
person.migrations = historicalMigrationData.map(m => ({
  from: new ACTA.HistoricalPlace(m.origin),
  to: new ACTA.HistoricalPlace(m.destination),
  date: new ACTA.HistoricalDate(m.date),
  reason: m.reason,
  source: 'history_database'
}));
```

---

## 📚 Dodatkowe Zasoby

### Słowniki Referencyjne ACTA v3

ACTA v3 zawiera następujące słowniki referencyjne dla standaryzacji danych:

#### Nationalities (Narodowości)
- `polska`, `niemiecka`, `ukraińska`, `białoruska`, `litewska`, `rosyjska`, `żydowska`, `czecka`, `słowacka`, `węgierska`
- `francuska`, `angielska`, `hiszpańska`, `włoska`, `portugalska`, `grecka`, `turecka`
- `arabska`, `perska`, `hinduska`, `chińska`, `japońska`, `koreańska`

#### Citizenships (Obywatelstwa Historyczne)
- `Królestwo Polskie`, `Imperium Rosyjskie`, `Cesarstwo Austro-Węgierskie`, `Cesarstwo Niemieckie`
- `Królestwo Prus`, `Wielkie Księstwo Litewskie`, `Rzeczpospolita Obojga Narodów`
- `USA`, `Kanada`, `Australia`, `Brazylia`, `Argentyna`
- `Imperium Osmańskie`, `Imperium Brytyjskie`, `Francja`, `Włochy`

#### EducationLevels (Poziomy Wykształcenia)
- `żadne`, `podstawowe`, `średnie`, `zawodowe`, `wyższe`, `akademickie`
- `tradycyjne` (nauczanie domowe), `religijne`, `specjalistyczne`

#### SocialStatuses (Status Społeczny)
- `szlachta`, `mieszczanin`, `chłop`, `robotnik`, `rzemieślnik`, `kupiec`, `urzędnik`
- `duchowny`, `wojskowy`, `artysta`, `naukowiec`, `przedsiębiorca`
- `niewolnik`, `parobek`, `służący`, `emigrant`, `uciekinier`

### Zasoby Zewnętrzne
- [GEDCOM 7.0 Specification](https://gedcom.io/specifications/)
- [GENTECH Model Standards](https://gentech.org/)
- [DNA Testing Standards](https://www.familytreedna.com/)
- [Historical Place Standards](https://www.geonames.org/)

---

*ACTA v3 - Przyszłość Genealogii w Twoich Rękach* 🎉</content>
<parameter name="filePath">j:\projekt 2025\projekt-akta-v2\ACTA-v3-Documentation.md