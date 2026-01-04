# ACTA v1 - Quick Start Guide

Szybki start dla integracji modelu ACTA v1 z aplikacją.

---

## 📦 Co się zmienia?

### Przed (v7.1):
```javascript
app.imageActs = [
  { id: 'chrzest.1', type: 'chrzest', fieldValues: {...} }
];
```

### Po (ACTA v1):
```javascript
app.imageActs = new Map([
  ['CH.1890.No.01', EventModel { roles: [...], relationships: [...] }]
]);
```

---

## 🚀 5 kroków do wdrożenia

### Krok 1: Dodaj plik z modelami
```html
<!-- W <head> viewer-osd-v8.html: -->
<script src="acta-v1-models.js"></script>
```

### Krok 2: Inicjalizuj w `initApp()`
```javascript
app.personDb = new ACTA.PersonDatabase();
app.imageActs = new Map(); // Zamiast []
```

### Krok 3: Zmień tworzenie aktów
```javascript
// Zamiast: app.imageActs.push({...})
const event = new ACTA.EventModel('chrzest', 1890, 1);
initializeEventRoles(event, 'chrzest');
app.imageActs.set(event.id, event);
```

### Krok 4: Zmień dostęp do danych
```javascript
// Zamiast: app.imageActs[0].fieldValues.child_name
const event = app.imageActs.get('CH.1890.No.01');
const childName = event.getChild().person.firstName;
```

### Krok 5: Aktualizuj zapis/ładowanie
```javascript
// saveStorage(): konwertuj Map na array
const actsArray = Array.from(app.imageActs.values()).map(e => e.toJSON());

// loadStorage(): konwertuj array na Map
data.imageActs.forEach(eData => {
  const event = ACTA.EventModel.fromJSON(eData);
  app.imageActs.set(event.id, event);
});
```

---

## 📚 Klasy ACTA v1

| Klasa | Opis | Użycie |
|-------|------|--------|
| `PersonModel` | Osoba (genealog) | `event.getChild().person` |
| `EventModel` | Akt metryki | `app.imageActs.get('CH.1890.No.01')` |
| `PersonRoleModel` | Rola osoby w akcie | `event.roles[0]` (np. ojciec) |
| `RelationshipModel` | Relacja między ludźmi | `event.relationships[0]` |
| `PersonDatabase` | Baza osób i aktów | `app.personDb` |
| `HistoricalDate` | Data z precyzją | `person.birthDate` |
| `HistoricalPlace` | Miejsce historyczne | `event.place` |

---

## 🎯 Mapy i Listy w Kodzie

### EventModel.roles (PersonRoleModel[])
```javascript
event.roles = [
  PersonRoleModel { roleType: 'dziecko', person: PersonModel {...} },
  PersonRoleModel { roleType: 'ojciec', person: PersonModel {...} },
  PersonRoleModel { roleType: 'matka', person: PersonModel {...} }
];

// Dostęp:
event.getChild(); // -> PersonRoleModel
event.getFather().person.firstName; // -> imię ojca
```

### EventModel.relationships (RelationshipModel[])
```javascript
event.relationships = [
  RelationshipModel { type: 'rodzic-dziecko', person1: ..., person2: ... },
  RelationshipModel { type: 'rodzic-dziecko', person1: ..., person2: ... }
];

// Dostęp:
event.relationships[0].type; // -> 'rodzic-dziecko'
```

### app.imageActs (Map)
```javascript
app.imageActs = Map {
  'CH.1890.No.01' => EventModel {...},
  'CH.1890.No.02' => EventModel {...},
  'MA.1910.No.05' => EventModel {...}
};

// Dostęp:
app.imageActs.get('CH.1890.No.01'); // -> EventModel
app.imageActs.set(event.id, event); // Dodaj
app.imageActs.forEach((event, id) => {...}); // Iteruj
```

### app.personDb.persons (Map)
```javascript
app.personDb.persons = Map {
  'uuid-1' => PersonModel { firstName: 'Jan', ... },
  'uuid-2' => PersonModel { firstName: 'Łucja', ... }
};

// Dostęp:
app.personDb.getPerson('uuid-1');
app.personDb.getPersonByName('Jan', 'Kowalski');
```

---

## 💾 JSON Format (dla Storage)

### Jak wygląda zserializowany EventModel:
```json
{
  "id": "CH.1890.No.01",
  "type": "chrzest",
  "year": 1890,
  "number": 1,
  "date": {
    "date": "1890-05-15T00:00:00.000Z",
    "precision": "day",
    "confidence": 100,
    "notes": "",
    "season": null
  },
  "place": {
    "name": "Warszawa",
    "type": "town",
    "coordinates": null,
    "confidence": 100,
    "notes": "",
    "historicalName": null,
    "country": "Polska"
  },
  "roles": [
    {
      "id": "role-uuid",
      "person": "person-uuid",
      "roleType": "dziecko",
      "properties": {},
      "roiId": null,
      "confidence": 100,
      "sourceText": ""
    }
  ],
  "relationships": [],
  "sources": [],
  "archiveReference": "AR/WA/1850/No.123",
  "confidence": 100,
  "notes": "Bliźnięta",
  "tags": ["bliźnięta"],
  "lastModified": "2026-01-04T12:00:00.000Z"
}
```

---

## 🔧 Najczęstsze operacje

### Dodaj nowy akt
```javascript
const event = new ACTA.EventModel('chrzest', 1890, 1);
initializeEventRoles(event, 'chrzest');
app.imageActs.set(event.id, event);
saveStorage();
```

### Pobierz akt
```javascript
const event = app.imageActs.get('CH.1890.No.01');
```

### Zmień dane osoby w akcie
```javascript
const event = app.imageActs.get('CH.1890.No.01');
const childRole = event.getChild();
childRole.person.firstName = 'Józef';
childRole.person.lastName = 'Nowak';
saveStorage();
```

### Dodaj relację
```javascript
event.addRelationship(
  fatherRole.person,
  childRole.person,
  ACTA.RelationshipTypes.PARENT_CHILD
);
```

### Wyszukaj osobę
```javascript
const person = app.personDb.getPersonByName('Jan', 'Kowalski');
const events = app.personDb.getEventsByPerson(person.id);
```

### Wyszukaj akty typu
```javascript
const baptisms = app.personDb.getEventsByType('chrzest');
```

---

## 🐛 Debugging

Wklej do konsoli (F12):
```javascript
// Pokaż wszystkie akty
app.imageActs.forEach((e, id) => console.log(id, e.type, e.roles.length, 'osób'));

// Pokaż aktualny akt
const curr = app.imageActs.get(app.currentEventId);
console.log(curr);

// Pokaż osobę
const person = curr.getChild().person;
console.log(person.getFullName(), person.birthDate.getDisplayString());

// Pokaż rozmiar storage
const data = localStorage.getItem('genealog-indexer-v8');
console.log('Storage:', Math.round(data.length / 1024), 'KB');
```

---

## ✅ Checklist przed wdrożeniem

- [ ] `acta-v1-models.js` załadowany w HTML
- [ ] `app.personDb` zainicjalizowany
- [ ] `app.imageActs` zmieniony na Map
- [ ] `addNewActFromModal()` tworzy EventModel
- [ ] `loadActToForm()` czyta z event.roles
- [ ] `saveRecord()` zapisuje do role.person
- [ ] `saveStorage()` konwertuje Map na array
- [ ] `loadStorage()` konwertuje array na Map
- [ ] Test: dodaj akt → zapisz → przeładuj stronę
- [ ] Sprawdź F12 Console → brak błędów

---

**Więcej szczegółów**: Patrz `INTEGRACJA_ACTA_V1.md`
