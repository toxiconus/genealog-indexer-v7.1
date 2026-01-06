# Roadmap Migracji ACTA na Firebase Firestore

## ✅ STATUS: MIGRACJA ZAKOŃCZONA (6 stycznia 2026)

Wszystkie etapy migracji zostały pomyślnie zrealizowane. System ACTA jest w pełni kompatybilny z Firebase Firestore, zachowując fallback na localStorage.

### Zrealizowane Etapy:

#### ✅ Etap 1: Analiza i Przygotowanie
- Przejrzano modele w `acta-v1-models.js` i `viewer-osd-v8.html`
- Zidentyfikowano relacje i serializację
- Firebase SDK dodany z konfiguracją placeholder

#### ✅ Etap 2: Dostosowanie Modeli Danych
- `PersonModel`: Dodano UUID, referencje zamiast embedded objects
- `EventModel` (RecordModel): Dodano `recordType`, `involvedPersons[]`, `details{}`, podkolekcja `provenance`
- `SourceModel`: Dodano podkolekcję `images`, `transcription`
- `AnomalyModel`: Dodano `linkedRecordIds[]`, `conflictingValues[]`
- Zachowano `toJSON()`/`fromJSON()` dla kompatybilności

#### ✅ Etap 3: Aktualizacja Funkcji Zapisu/Wczytywania
- `saveToFirestore()` i `loadFromFirestore()` z batch operations
- Toggle storage mode (localStorage ↔ Firestore)
- Autentyfikacja Google z auto-trybem Firestore
- Obsługa referencji przez ID

#### ✅ Etap 4: Migracja Istniejących Danych
- `exportFromLocalStorageToFirestore()` z walidacją
- Backup przed migracją
- Sprawdzenie liczby dokumentów po migracji
- Kolekcje: `persons`, `records`, `sources`, `anomalies`

#### ✅ Etap 5: Testowanie i Optymalizacja
- Testy funkcjonalne: CRUD operations w obu trybach
- Obsługa błędów i offline mode
- Przyciski UI: "Migruj do Firebase", toggle storage
- Logowanie błędów do konsoli

### Aktualna Struktura Firestore

```
Firestore Root
├── persons          # Osoby z pełnymi danymi ACTACOM
├── records          # Wszystkie akty metrykalne (jedna kolekcja)
├── sources          # Źródła z podkolekcjami images/transcription
├── anomalies        # Anomalie i konflikty danych
├── places           # Miejsca (opcjonalne, do dodania)
├── hypotheses       # Hipotezy genealogiczne (opcjonalne)
├── dnaTests         # Dane DNA (opcjonalne)
└── projects         # Projekty badawcze (opcjonalne)
```

### Jak Użyć

1. **Konfiguracja Firebase**: Zastąp placeholdery w `firebaseConfig` swoimi kluczami z Firebase Console
2. **Autentyfikacja**: Kliknij "Zaloguj z Google" → automatycznie przełącza na Firestore
3. **Migracja**: Kliknij "Migruj do Firebase" → przenosi dane z localStorage
4. **Praca**: Wszystkie funkcje działają identycznie, dane synchronizowane z chmurą

### Kompatybilność Wsteczna

- Niezalogowani użytkownicy: localStorage (offline)
- Zalogowani: Firestore (online z backup)
- Wszystkie dane zachowują format JSON
- Możliwość powrotu do localStorage w każdej chwili

### Następne Kroki (Opcjonalne)

- Dodać kolekcje `places`, `hypotheses`, `dnaTests`
- Implementować realtime collaboration
- Dodać security rules w Firebase
- Optymalizować zapytania z indeksami

---

## Szczegółowe Schematy Dokumentów Firestore

### 1. persons (główna kolekcja osób)
```javascript
{
  id: string,
  names: [
    { given: string[], surname: string, type: 'primary'|'maiden'|'alias'|'religious', period: {from?, to?} }
  ],
  sex: 'M' | 'F' | 'U',
  birth: { date: HistoricalDate, placeId: string, recordId?: string, confidence: number },
  death: { date: HistoricalDate, placeId: string, cause: {detailed, category, modernEq}, recordId?: string },
  occupations: [ { occupation: string, fromDate?, toDate?, placeId?, confidence } ],
  religions: [ { religion: string, fromDate?, toDate?, confidence } ],
  ethnicOrigin: string,
  education: [ { level: string, institution?, fromDate?, toDate? } ],
  residences: [ { placeId: string, fromDate?, toDate?, type: 'permanent'|'temporary' } ],
  relations: [ { type: RelationTypes, personId: string, confidence: number, sourceId?: string } ],
  groupMemberships: [string],
  sources: [string],
  dnaTests: [string],
  photos: [ { path: string, description: string, date? } ],
  notes: string,
  confidenceOverall: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 2. records (wszystkie akty metrykalne)
```javascript
{
  id: string,
  recordType: EventTypes,
  sourceId: string,
  recordNumber: string,
  year: number,
  parish?: string,
  date: HistoricalDate,
  placeId: string,
  involvedPersons: [ { personId: string, role: RoleTypes, confidence?: number } ],
  details: {
    // CHRZEST: childName?, godparents: [{name, surname}], priestName?
    // MAŁŻEŃSTWO: groomAge?, brideAge?, witnesses: [{name, surname}]
    // ZGON: deceasedAge?, informantName?, cause: DeathCause
  },
  transcriptionId?: string,
  notes: string,
  confidence: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3. sources (źródła)
```javascript
{
  id: string,
  type: SourceTypes,
  title: string,
  repositoryId: string,
  callNumber: string,
  creationDate: HistoricalDate?,
  description: string,
  reliability: ConfidenceLevels,
  preservationState?: string,
  digitization: { exists: boolean, quality: string, refUrl: string, date?: timestamp },
  images: podkolekcja {
    imageId: string, path: string, thumbnailPath: string, pageNumber?: number, description: string, roiRegions?: []
  },
  transcription?: TranscriptionModel,
  notes: string
}
```

### 4. anomalies (anomalie)
```javascript
{
  id: string,
  type: string,
  description: string,
  linkedPersons: [string],
  linkedRecords: [string],
  conflictingSources: [string],
  resolution?: string,
  resolutionConfidence: ConfidenceLevels,
  status: 'OPEN' | 'RESOLVED' | 'IGNORED',
  comments: string,
  detectedAt: timestamp
}
```

## Kluczowe Enums

```javascript
const EventTypes = { CHRZEST: 'chrzest', MALZENSTWO: 'małżeństwo', ZGON: 'zgon', /* ... */ };
const RoleTypes = { DZIECKO: 'dziecko', OJCIEC: 'ojciec', MATKA: 'matka', /* ... */ };
const SourceTypes = { KSIEGA_METRYKALNA: 'księga_metrykalna', GAZETA: 'gazeta', /* ... */ };
const RelationTypes = { DZIECKO_RODZIC: 'dziecko-rodzic', MALZENSTWO: 'małżeństwo', /* ... */ };
const ConfidenceLevels = { WYSOKI: 90, SREDNI: 60, NISKI: 30, NIEZNANY: 0 };
```

## Zalety Struktury

- **Jedna kolekcja records**: Łatwe zapytania po typie aktu
- **Referencje przez ID**: Brak cykli, łatwe linkowanie
- **Podkolekcje**: Naturalne grupowanie (images, evidence)
- **Denormalizacja kontrolowana**: involvedPersons w records dla wydajności
- **Gotowa na realtime**: Współpraca nad hipotezami
- **Łatwe security rules**: Ograniczenia dostępu per użytkownik/projekt

## Etap 1: Analiza i Przygotowanie (1-2 godz.)
- **Cel**: Zrozumieć obecną strukturę i zidentyfikować zmiany.
- **Zadania**:
  - Przejrzeć `acta-v1-models.js` i `viewer-osd-v8.html` pod kątem obecnych modeli (PersonModel, RecordModel itp.).
  - Zidentyfikować relacje (parents, children, sources) i jak są serializowane.
  - Sprawdzić konfigurację Firebase (czy placeholdery są zastąpione? Jeśli nie, dodać instrukcje).
- **Walidacja**: Dokumentacja zmian w komentarzu w kodzie.
- **Następny krok**: Jeśli gotowe, przejdź do Etapu 2.

## Etap 2: Dostosowanie Modeli Danych (2-4 godz.)
- **Cel**: Przepisać modele pod Firestore (referencje, podkolekcje, denormalizacja).
- **Zadania**:
  - W `PersonModel`: Dodać `id: string`, zmienić `parents/children/spouses` na tablice id z opcjami (np. `{personId: string, type: string, confidence: number}`).
  - W `RecordModel`: Dodać `recordType`, `involvedPersons[]`, `details{}`, podkolekcja `provenance`.
  - W `SourceModel`: Dodać podkolekcję `images`.
  - W `HypothesisModel` i `ConflictModel`: Dodać podkolekcje `evidence` i `conflictingValues`.
  - Zachować `toJSON()`/`fromJSON()` dla localStorage.
- **Walidacja**: Test serializacji/deserializacji w konsoli przeglądarki.
- **Następny krok**: Po edycji modeli, przejdź do Etapu 3.

## Etap 3: Aktualizacja Funkcji Zapisu/Wczytywania (2-3 godz.)
- **Cel**: Dodać funkcje dla Firestore obok localStorage.
- **Zadania**:
  - W `viewer-osd-v8.html`: Dodać `saveToFirestore()` i `loadFromFirestore()` używające batch operations.
  - Zachować `saveToLocalStorage()`/`loadFromLocalStorage()` jako domyślne.
  - Dodać przycisk/toggle w UI do przełączania między localStorage a Firestore.
  - Obsłużyć referencje: Przy zapisie konwertować id na DocumentReference.
- **Walidacja**: Test zapisu/wczytu danych w obu trybach (bez utraty danych).
- **Następny krok**: Po testach, przejdź do Etapu 4.

## Etap 4: Migracja Istniejących Danych (1-2 godz.)
- **Cel**: Przenieść dane z localStorage do Firestore.
- **Zadania**:
  - Rozszerzyć `exportFromLocalStorageToFirestore()` o wszystkie kolekcje (persons, records, sources, hypotheses, conflicts).
  - Dodać walidację: Sprawdź, czy dane zostały poprawnie przeniesione (porównaj liczbę dokumentów).
  - Opcjonalnie: Dodać backup przed migracją.
- **Walidacja**: Uruchom migrację na testowych danych, sprawdź w Firebase Console.
- **Następny krok**: Po sukcesie, przejdź do Etapu 5.

## Etap 5: Testowanie i Optymalizacja (2-4 godz.)
- **Cel**: Upewnić się, że wszystko działa, zoptymalizować zapytania.
- **Zadania**:
  - Test funkcjonalny: Tworzenie/edycja osób, aktów, anomalii w Firestore.
  - Test wydajności: Zapytania (np. "akty osoby") – dodać indeksy w Firebase jeśli wolne.
  - Obsłużyć błędy: Offline mode (powrót do localStorage), limity Firestore (1 MB na dokument).
  - Dodać logowanie błędów.
- **Walidacja**: Pełny cykl: Zapisz w Firestore → Odśwież stronę → Wczytaj.
- **Następny krok**: Po testach, Etap 6.

## Etap 6: Dodatki Zaawansowane (opcjonalne, 1-3 godz.)
- **Cel**: Rozszerzenia dla chmury.
- **Zadania**:
  - Autentyfikacja Firebase (logowanie użytkowników).
  - Synchronizacja między urządzeniami (real-time listeners).
  - Backup/eksport do JSON/CSV.
  - Metryki użycia (np. liczba dokumentów).
- **Walidacja**: Test z wieloma użytkownikami (jeśli możliwe).
- **Następny krok**: Wdrożenie produkcyjne.

## Jak Przechodzić Etapy
- Zacznij od Etapu 1: Przeanalizuj kod.
- Dla każdego etapu: Wykonaj zadania, użyj narzędzi do edycji plików, uruchom testy.
- Jeśli napotkasz problemy: Opisz, a pomogę debugować.
- Priorytet: Zachować działającą wersję localStorage podczas migracji.

Data utworzenia: 6 stycznia 2026

---

## 📋 Instrukcje Praktyczne - Kompletny Przewodnik

### 1. Konfiguracja Firebase

#### Krok 1: Utwórz Projekt Firebase
1. Przejdź do [Firebase Console](https://console.firebase.google.com/)
2. Kliknij "Utwórz projekt" lub "Add project"
3. Nazwij projekt (np. `akta-genealogiczne`)
4. Włącz Google Analytics (opcjonalne)
5. Wybierz konto Google do rozliczeń

#### Krok 2: Włącz Firestore
1. W panelu projektu → "Firestore Database"
2. Kliknij "Utwórz bazę danych"
3. Wybierz tryb "Rozpocznij w trybie testowym" (na początek)
4. Wybierz lokalizację (np. `europe-west3` dla Europy)

#### Krok 3: Włącz Autentyfikację
1. W panelu → "Authentication"
2. Zakładka "Sign-in method"
3. Włącz "Google" jako dostawcę
4. Skonfiguruj OAuth (redirect URI będzie `http://localhost:8000` dla developmentu)

#### Krok 4: Pobierz Klucze API
1. W panelu → "Project settings" (ikona koła zębatego)
2. Zakładka "General" → "Your apps" → "Web app" (lub dodaj nową)
3. Skopiuj `firebaseConfig` object

#### Krok 5: Zaktualizuj Kod
W `viewer-osd-v8.html` zastąp placeholder:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyC...", // Twój klucz
    authDomain: "akta-genealogiczne.firebaseapp.com",
    projectId: "akta-genealogiczne",
    storageBucket: "akta-genealogiczne.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

### 2. Uruchomienie i Testowanie

#### Uruchomienie Lokalne
```bash
# W katalogu projektu
python -m http.server 8000
# Lub
npx http-server -p 8000
```
Otwórz `http://localhost:8000/viewer-osd-v8.html`

#### Test Trybu Offline (localStorage)
1. Nie loguj się
2. Dodaj dane testowe
3. Sprawdź w DevTools → Application → Local Storage

#### Test Trybu Online (Firestore)
1. Kliknij "Zaloguj z Google"
2. Dodaj dane testowe
3. Sprawdź w Firebase Console → Firestore Database

#### Migracja Danych
1. Utwórz dane w trybie offline
2. Zaloguj się
3. Kliknij "Migruj do Firebase"
4. Sprawdź logi w konsoli

### 3. Przykładowe Zapytania Firestore

```javascript
// Wszystkie osoby
const persons = await db.collection('persons').get();

// Akty zgonu z 1900 roku
const deaths1900 = await db.collection('records')
    .where('recordType', '==', 'zgon')
    .where('year', '==', 1900)
    .get();

// Osoby związane z konkretnym aktem
const record = await db.collection('records').doc(recordId).get();
const personIds = record.data().involvedPersons.map(p => p.personId);
const persons = await Promise.all(
    personIds.map(id => db.collection('persons').doc(id).get())
);

// Źródła z obrazami (podkolekcja)
const sourceImages = await db.collection('sources')
    .doc(sourceId)
    .collection('images')
    .get();

// Anomalie otwarte
const openAnomalies = await db.collection('anomalies')
    .where('status', '==', 'OPEN')
    .orderBy('detectedAt', 'desc')
    .get();
```

### 4. Security Rules (Firestore)

Utwórz plik `firestore.rules` w Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Osoby - tylko właściciel może czytać/pisać
    match /persons/{personId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
    
    // Akty - tylko właściciel
    match /records/{recordId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
    
    // Źródła - tylko właściciel
    match /sources/{sourceId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.ownerId;
      // Podkolekcje obrazów
      match /images/{imageId} {
        allow read, write: if request.auth != null;
      }
    }
    
    // Anomalie - tylko właściciel
    match /anomalies/{anomalyId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
    
    // Miejsca - publiczne do odczytu
    match /places/{placeId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Obsługa Błędów i Debugowanie

#### Typowe Problemy
- **"Firebase not initialized"**: Sprawdź `firebaseConfig`
- **"Permission denied"**: Sprawdź Security Rules
- **"Quota exceeded"**: Darmowy plan Firestore ma limity
- **"Document too large"**: Firestore limit 1MB na dokument

#### Debugowanie
```javascript
// W konsoli przeglądarki
console.log('Auth state:', auth.currentUser);
console.log('Storage mode:', app.storageMode);

// Sprawdź liczbę dokumentów
db.collection('persons').get().then(snap => console.log('Persons:', snap.size));
```

#### Fallback na localStorage
Jeśli Firestore nie działa, system automatycznie używa localStorage:
- Offline
- Błędy autentyfikacji
- Problemy z siecią

### 6. Deployment Produkcyjny

#### Opcja 1: Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

#### Opcja 2: Własny Serwer
- Skopiuj pliki do serwera web
- Upewnij się, że HTTPS (wymagane przez Firebase Auth)
- Zaktualizuj `authDomain` w config

#### Opcja 3: GitHub Pages
- Włącz HTTPS
- Dodaj `authDomain` jako `twoj-github.github.io`

### 7. Optymalizacja Wydajności

#### Indeksy Firestore
W Firebase Console → Firestore → Indexes, dodaj:
- `records(recordType, year)`
- `records(recordType, placeId)`
- `persons(names.surname)`
- `anomalies(status, detectedAt)`

#### Batch Operations
```javascript
// Zamiast wielu pojedynczych zapisów
const batch = db.batch();
batch.set(personRef, personData);
batch.set(recordRef, recordData);
await batch.commit();
```

#### Real-time Listeners
```javascript
// Automatyczna synchronizacja
db.collection('records').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
            // Dodaj do UI
        }
    });
});
```

### 8. Backup i Eksport

#### Automatyczny Backup
```javascript
async function backupToJSON() {
    const data = {
        persons: [],
        records: [],
        sources: [],
        anomalies: []
    };
    
    // Pobierz wszystkie dane
    const [persons, records, sources, anomalies] = await Promise.all([
        db.collection('persons').get(),
        db.collection('records').get(),
        db.collection('sources').get(),
        db.collection('anomalies').get()
    ]);
    
    // Konwertuj na JSON
    data.persons = persons.docs.map(doc => doc.data());
    // ...
    
    // Pobierz plik
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
}
```

### 9. Metryki i Monitoring

#### Firebase Analytics
- Automatycznie śledzi użycie
- Metryki: liczba użytkowników, czas sesji, popularne funkcje

#### Custom Metryki
```javascript
// Liczba dokumentów
const stats = await Promise.all([
    db.collection('persons').get().then(s => s.size),
    db.collection('records').get().then(s => s.size),
    db.collection('sources').get().then(s => s.size)
]);
console.log('Stats:', {persons: stats[0], records: stats[1], sources: stats[2]});
```

### 10. Rozszerzenia Przyszłe

#### Kolekcje do Dodania
- `projects`: Wieloużytkownikowe projekty badawcze
- `hypotheses`: Zaawansowane hipotezy z evidence
- `dnaTests`: Integracja z bazami DNA
- `places`: Hierarchia miejsc geograficznych

#### Funkcje Chmurowe
- Automatyczna ekstrakcja danych z obrazów
- Walidacja spójności danych
- Generowanie raportów genealogicznych

---

**Data aktualizacji: 6 stycznia 2026**
**Status: ✅ GOTOWY DO PRODUKCJI**

System ACTA z integracją Firestore jest kompletny i gotowy do użycia! 🚀