/**
 * ACTA v1 - Model Danych dla Akt Genealogicznych
 * Klasy do zarządzania osobami, relacjami, rolami i zdarzeniami metrykalnym
 * 
 * Wersja: 1.0
 * Data: 4 stycznia 2026
 * Integracja z: viewer-osd-v8.html (v7.1+)
 */

// ============================================================================
// KLASY WSPOMAGAJĄCE - Daty i Miejsca
// ============================================================================

/**
 * HistoricalDate - Data z precyzją i pewnością
 * Obsługuje: pełne daty, miesiące, lata, okresy
 */
class HistoricalDate {
  constructor(dateString = null, precision = 'day') {
    // precision: 'year' (1850), 'month' (1850-06), 'day' (1850-06-15)
    this.date = dateString ? new Date(dateString) : null;
    this.precision = precision; // 'year' | 'month' | 'day'
    this.confidence = 100; // 0-100, ile % pewności
    this.notes = ''; // Np. "przybliżona", "~1850"
    this.season = null; // Np. 'spring', 'summer', 'autumn', 'winter'
  }

  getDisplayString() {
    if (!this.date) return 'nieznana';
    
    const d = this.date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    let result = '';
    if (this.precision === 'year') result = year.toString();
    if (this.precision === 'month') result = `${month}-${year}`;
    if (this.precision === 'day') result = `${day}-${month}-${year}`;

    if (this.notes.includes('~')) result = `~${result}`;
    if (this.season) result = `${this.season} ${year}`;

    return result;
  }

  toJSON() {
    return {
      date: this.date ? this.date.toISOString() : null,
      precision: this.precision,
      confidence: this.confidence,
      notes: this.notes,
      season: this.season
    };
  }

  static fromJSON(data) {
    const obj = new HistoricalDate(data.date, data.precision);
    obj.confidence = data.confidence;
    obj.notes = data.notes;
    obj.season = data.season;
    return obj;
  }
}

/**
 * HistoricalPlace - Miejsce z kontekstem historycznym
 */
class HistoricalPlace {
  constructor(name = null, type = 'town') {
    // type: 'parish', 'town', 'county', 'region', 'country'
    this.name = name;
    this.type = type;
    this.coordinates = null; // {lat, lon}
    this.confidence = 100;
    this.notes = ''; // Np. "Warszawa (wtedy Carstvo Rosyjskie)"
    this.historicalName = null; // Poprzednia nazwa miejsca
    this.country = null; // Nazwa kraju (dla kontekstu)
  }

  getDisplayString() {
    if (!this.name) return 'nieznane';
    if (this.historicalName) return `${this.name} (niegdyś ${this.historicalName})`;
    return this.name;
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      coordinates: this.coordinates,
      confidence: this.confidence,
      notes: this.notes,
      historicalName: this.historicalName,
      country: this.country
    };
  }

  static fromJSON(data) {
    const obj = new HistoricalPlace(data.name, data.type);
    obj.coordinates = data.coordinates;
    obj.confidence = data.confidence;
    obj.notes = data.notes;
    obj.historicalName = data.historicalName;
    obj.country = data.country;
    return obj;
  }
}

// ============================================================================
// KLASA GŁÓWNA - PersonModel
// ============================================================================

/**
 * PersonModel - Reprezentacja osoby w genealogii
 * Przechowuje pełne dane osobowe, relacje rodzinne, życiowe itp.
 */
class PersonModel {
  constructor(firstName = null, lastName = null) {
    // Identyfikacja
    this.id = null; // Set by registry
    this.firstName = firstName;
    this.lastName = lastName;
    this.maidenName = null; // Dla kobiet
    this.aliases = []; // Warianty pisowni imienia/nazwiska
    
    // Dados osobowe
    this.gender = 'UNKNOWN'; // 'MALE', 'FEMALE', 'UNKNOWN'
    this.birthDate = new HistoricalDate();
    this.birthPlace = new HistoricalPlace();
    this.deathDate = new HistoricalDate();
    this.deathPlace = new HistoricalPlace();
    this.age = null; // Wiek (jeśli znany zamiast daty)
    
    // Społeczne
    this.occupation = null; // Zawód
    this.occupationCategory = null; // WORKER, ARTISAN, MERCHANT, FARMER, OFFICIAL, CLERGY, MILITARY, TEACHER, DOCTOR, SERVANT
    this.civilStatus = 'UNKNOWN'; // SINGLE, MARRIED, WIDOWED, DIVORCED, ANNULLED
    this.residence = new HistoricalPlace(); // Miejsce zamieszkania
    this.religion = null; // Wyznanie (jeśli znane)
    
    // Relacje (przechowują ID osób)
    this.parents = { father: null, mother: null }; // ID ojca/matki
    this.spouse = null; // ID małżonka
    this.children = []; // IDs dzieci
    this.godparents = { father: null, mother: null }; // ID chrzestnych
    this.godchildren = []; // IDs chrzczenników
    this.siblings = []; // IDs rodzeństwa
    
    // Metadata
    this.confidence = 100; // 0-100
    this.sourceText = ''; // Oryginalne słowa z aktu
    this.notes = ''; // Notatki genealoga
    this.lastModified = new Date();
  }

  // Metody dla relacji rodzinnych
  addParent(parentId, type = 'father') {
    // type: 'father', 'mother'
    if (type === 'father') this.parents.father = parentId;
    if (type === 'mother') this.parents.mother = parentId;
    return this;
  }

  addSpouse(spouseId) {
    this.spouse = spouseId;
    return this;
  }

  addChild(childId) {
    if (!this.children.includes(childId)) {
      this.children.push(childId);
    }
    return this;
  }

  addGodparent(godparentId, type = 'father') {
    // type: 'father', 'mother'
    if (type === 'father') this.godparents.father = godparentId;
    if (type === 'mother') this.godparents.mother = godparentId;
    return this;
  }

  addGodchild(godchildId) {
    if (!this.godchildren.includes(godchildId)) {
      this.godchildren.push(godchildId);
    }
    return this;
  }

  addSibling(siblingId) {
    if (!this.siblings.includes(siblingId)) {
      this.siblings.push(siblingId);
    }
    return this;
  }

  // Gettery dla wygody
  getFullName() {
    const first = this.firstName ? this.firstName : '';
    const last = this.lastName ? this.lastName : '';
    return `${first} ${last}`.trim();
  }

  getAgeAtDate(date = null) {
    // Oblicz wiek na konkretną datę
    if (!this.birthDate.date && !this.age) return null;
    const refDate = date || new Date();
    if (this.birthDate.date) {
      return Math.floor((refDate - this.birthDate.date) / (365.25 * 24 * 60 * 60 * 1000));
    }
    return this.age;
  }

  // Serializacja
  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      maidenName: this.maidenName,
      aliases: this.aliases,
      gender: this.gender,
      birthDate: this.birthDate.toJSON(),
      birthPlace: this.birthPlace.toJSON(),
      deathDate: this.deathDate.toJSON(),
      deathPlace: this.deathPlace.toJSON(),
      age: this.age,
      occupation: this.occupation,
      occupationCategory: this.occupationCategory,
      civilStatus: this.civilStatus,
      residence: this.residence.toJSON(),
      religion: this.religion,
      parents: this.parents,
      spouse: this.spouse,
      children: this.children,
      godparents: this.godparents,
      godchildren: this.godchildren,
      siblings: this.siblings,
      confidence: this.confidence,
      sourceText: this.sourceText,
      notes: this.notes,
      lastModified: this.lastModified.toISOString()
    };
  }

  static fromJSON(data) {
    const person = new PersonModel(data.firstName, data.lastName);
    person.id = data.id;
    person.maidenName = data.maidenName;
    person.aliases = data.aliases;
    person.gender = data.gender;
    person.birthDate = HistoricalDate.fromJSON(data.birthDate);
    person.birthPlace = HistoricalPlace.fromJSON(data.birthPlace);
    person.deathDate = HistoricalDate.fromJSON(data.deathDate);
    person.deathPlace = HistoricalPlace.fromJSON(data.deathPlace);
    person.age = data.age;
    person.occupation = data.occupation;
    person.occupationCategory = data.occupationCategory;
    person.civilStatus = data.civilStatus;
    person.residence = HistoricalPlace.fromJSON(data.residence);
    person.religion = data.religion;
    person.parents = data.parents;
    person.spouse = data.spouse;
    person.children = data.children;
    person.godparents = data.godparents;
    person.godchildren = data.godchildren;
    person.siblings = data.siblings;
    person.confidence = data.confidence;
    person.sourceText = data.sourceText;
    person.notes = data.notes;
    person.lastModified = new Date(data.lastModified);
    return person;
  }

  // Utility
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// ============================================================================
// KLASA - PersonRoleModel (Rola osoby w akcie)
// ============================================================================

/**
 * PersonRoleModel - Rola osoby w konkretnym akcie metrykalnym
 * Np. dziecko w chrzcie, ojciec w chrzcie, świadek, itp.
 */
class PersonRoleModel {
  constructor() {
    this.id = this.generateUUID();
    this.personId = null; // ID osoby z registry
    this.roleType = null; // 'dziecko', 'ojciec', 'matka', 'małżonek', 'świadek', 'chrzestny', itp.
    this.properties = {}; // Dodatkowe właściwości (np. zawód, wiek, status cywilny w momencie aktu)
    this.roiId = null; // ID powiązanego ROI w obrazie (dla OCR)
    this.confidence = 100;
    this.sourceText = ''; // Oryginalna notacja z aktu
  }

  getDisplayRole() {
    const roleLabels = {
      'dziecko': '👶 Dziecko',
      'ojciec': '👨 Ojciec',
      'matka': '👩 Matka',
      'małżonek': '💍 Małżonek',
      'świadek': '👁️ Świadek',
      'chrzestny_ojciec': '⚜️ Chrzestny (ojciec)',
      'chrzestna_matka': '✨ Chrzestna (matka)',
      'brat': '👦 Brat',
      'siostra': '👧 Siostra',
      'dziadek': '👴 Dziadek',
      'babcia': '👵 Babcia',
      'rodzicom': '🏘️ Rodzicom',
      'urzędnik': '📋 Urzędnik',
      'duchowny': '✝️ Duchowny'
    };
    return roleLabels[this.roleType] || this.roleType;
  }

  toJSON() {
    return {
      id: this.id,
      personId: this.personId,
      roleType: this.roleType,
      properties: this.properties,
      roiId: this.roiId,
      confidence: this.confidence,
      sourceText: this.sourceText
    };
  }

  static fromJSON(data) {
    const role = new PersonRoleModel();
    role.id = data.id;
    role.personId = data.personId || data.person; // Backward compatibility
    role.roleType = data.roleType;
    role.properties = data.properties;
    role.roiId = data.roiId;
    role.confidence = data.confidence;
    role.sourceText = data.sourceText;
    return role;
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// ============================================================================
// KLASA - RelationshipModel (Relacja między dwiema osobami)
// ============================================================================

/**
 * RelationshipModel - Reprezentacja relacji między dwiema osobami
 * Np. rodzic-dziecko, małżonek-małżonek, brat-siostra
 */
class RelationshipModel {
  constructor() {
    this.id = this.generateUUID();
    this.person1 = null; // ID lub instancja PersonModel
    this.person2 = null; // ID lub instancja PersonModel
    this.type = null; // 'rodzic-dziecko', 'małżeństwo', 'rodzeństwo', 'chrzcin', itp.
    this.startDate = new HistoricalDate(); // Rozpoczęcie relacji (np. ślub)
    this.endDate = new HistoricalDate(); // Koniec relacji (np. śmierć, rozwód)
    this.confidence = 100;
    this.notes = '';
  }

  getDisplayType() {
    const typeLabels = {
      'rodzic-dziecko': 'Rodzic-dziecko',
      'małżeństwo': 'Małżeństwo',
      'rodzeństwo': 'Rodzeństwo',
      'chrzcin': 'Chrzcin (chrzestny-chrzczennik)',
      'powinowactwo': 'Powinowactwo (teść-zięć itp.)'
    };
    return typeLabels[this.type] || this.type;
  }

  toJSON() {
    return {
      id: this.id,
      person1: this.person1 instanceof PersonModel ? this.person1.id : this.person1,
      person2: this.person2 instanceof PersonModel ? this.person2.id : this.person2,
      type: this.type,
      startDate: this.startDate.toJSON(),
      endDate: this.endDate.toJSON(),
      confidence: this.confidence,
      notes: this.notes
    };
  }

  static fromJSON(data) {
    const rel = new RelationshipModel();
    rel.id = data.id;
    rel.person1 = data.person1;
    rel.person2 = data.person2;
    rel.type = data.type;
    rel.startDate = HistoricalDate.fromJSON(data.startDate);
    rel.endDate = HistoricalDate.fromJSON(data.endDate);
    rel.confidence = data.confidence;
    rel.notes = data.notes;
    return rel;
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// ============================================================================
// KLASA - EventModel (Zdarzenie metrykalne - akt)
// ============================================================================

/**
 * EventModel - Reprezentacja aktu metrykalnego (chrzest, małżeństwo, zgon)
 * Zawiera danych uczestników (PersonRoleModel) i relacji wywnioskowanych
 */
class EventModel {
  constructor(type = 'unknown', year = null, number = null) {
    // type: 'chrzest', 'małżeństwo', 'zgon', itp.
    this.id = this.generateEventId(type, year, number);
    this.type = type;
    this.year = year;
    this.number = number || 1;
    
    // Data i miejsce zdarzenia
    this.date = new HistoricalDate();
    this.place = new HistoricalPlace();
    
    // Uczestnicy i ich role
    this.roles = []; // Tablica PersonRoleModel
    
    // Relacje wywnioskowane z aktu
    this.relationships = []; // Tablica RelationshipModel
    
    // Źródła i dokumentacja
    this.sources = [];
    this.archiveReference = null; // Np. "AR/WA/1850/No.123"
    this.bookNumber = null;
    this.pageNumber = null;
    this.officialName = null; // Imiędnik/urzędnik
    
    // ROI i obrazy
    this.actROI = null; // ROI dla całego aktu {rect: {x,y,w,h}, imageIndex: 0}
    this.fieldROIs = {}; // Mapa {fieldId: ROI}
    
    // Metadane
    this.confidence = 100;
    this.notes = '';
    this.tags = []; // Np. ['bliźnięta', 'druga żona']
    this.lastModified = new Date();
  }

  // Metody do zarządzania rolami
  addPersonWithRole(personId, roleType, properties = {}) {
    const role = new PersonRoleModel();
    role.personId = personId;
    role.roleType = roleType;
    role.properties = properties;
    this.roles.push(role);
    return this;
  }

  getPersonsWithRole(roleType) {
    return this.roles.filter(r => r.roleType === roleType);
  }

  getRolePerson(roleType, index = 0) {
    const roles = this.getPersonsWithRole(roleType);
    return roles.length > index ? roles[index] : null;
  }

  // Metody do zarządzania relacjami
  addRelationship(person1, person2, type, startDate = null) {
    const rel = new RelationshipModel();
    rel.person1 = person1 instanceof PersonModel ? person1.id : person1;
    rel.person2 = person2 instanceof PersonModel ? person2.id : person2;
    rel.type = type;
    if (startDate) rel.startDate = startDate;
    this.relationships.push(rel);
    return this;
  }

  // Gettery dla wygody (zwracają role)
  getChild() {
    return this.getRolePerson('dziecko', 0);
  }

  getFather() {
    return this.getRolePerson('ojciec', 0);
  }

  getMother() {
    return this.getRolePerson('matka', 0);
  }

  getGroom() {
    return this.getRolePerson('ženich', 0) || this.getRolePerson('pan_młody', 0);
  }

  getBride() {
    return this.getRolePerson('nevěsta', 0) || this.getRolePerson('panna_młoda', 0);
  }

  getDeceased() {
    return this.getRolePerson('zmarły', 0);
  }

  // Serializacja
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      year: this.year,
      number: this.number,
      date: this.date.toJSON(),
      place: this.place.toJSON(),
      roles: this.roles.map(r => r.toJSON()),
      relationships: this.relationships.map(r => r.toJSON()),
      sources: this.sources,
      archiveReference: this.archiveReference,
      bookNumber: this.bookNumber,
      pageNumber: this.pageNumber,
      officialName: this.officialName,
      actROI: this.actROI,
      fieldROIs: this.fieldROIs,
      confidence: this.confidence,
      notes: this.notes,
      tags: this.tags,
      lastModified: this.lastModified.toISOString()
    };
  }

  static fromJSON(data) {
    const event = new EventModel(data.type, data.year, data.number);
    event.id = data.id;
    event.date = HistoricalDate.fromJSON(data.date);
    event.place = HistoricalPlace.fromJSON(data.place);
    event.roles = data.roles.map(r => PersonRoleModel.fromJSON(r));
    event.relationships = data.relationships.map(r => RelationshipModel.fromJSON(r));
    event.sources = data.sources;
    event.archiveReference = data.archiveReference;
    event.bookNumber = data.bookNumber;
    event.pageNumber = data.pageNumber;
    event.officialName = data.officialName;
    event.actROI = data.actROI;
    event.fieldROIs = data.fieldROIs;
    event.confidence = data.confidence;
    event.notes = data.notes;
    event.tags = data.tags;
    event.lastModified = new Date(data.lastModified);
    return event;
  }

  generateEventId(type, year, number) {
    const typePrefix = {
      'chrzest': 'CH',
      'urodzenie': 'UR',
      'małżeństwo': 'MA',
      'zgon': 'ZG',
      'inne': 'XX'
    };
    const prefix = typePrefix[type] || 'XX';
    const yr = year || new Date().getFullYear();
    const num = String(number || 1).padStart(2, '0');
    return `${prefix}.${yr}.No.${num}`;
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// ============================================================================
// KLASA - PersonDatabase (Baza danych osób)
// ============================================================================

/**
 * PersonDatabase - Przechowuje i zarządza kolekcją osób i zdarzeń
 * Umożliwia wyszukiwanie, filtrowanie, linki między danymi
 */
class PersonDatabase {
  constructor() {
    this.persons = new Map(); // Mapa: personId -> PersonModel
    this.events = new Map(); // Mapa: eventId -> EventModel
    this.relationships = new Map(); // Mapa: relationshipId -> RelationshipModel
  }

  // Osoby
  addPerson(person) {
    this.persons.set(person.id, person);
    return person;
  }

  getPerson(personId) {
    return this.persons.get(personId);
  }

  getPersonByName(firstName, lastName) {
    for (const person of this.persons.values()) {
      if (person.firstName === firstName && person.lastName === lastName) {
        return person;
      }
    }
    return null;
  }

  getAllPersons() {
    return Array.from(this.persons.values());
  }

  removePerson(personId) {
    this.persons.delete(personId);
  }

  // Zdarzenia
  addEvent(event) {
    this.events.set(event.id, event);
    return event;
  }

  getEvent(eventId) {
    return this.events.get(eventId);
  }

  getEventsByPerson(personId) {
    const result = [];
    for (const event of this.events.values()) {
      for (const role of event.roles) {
        if (role.person === personId) {
          result.push(event);
          break;
        }
      }
    }
    return result;
  }

  getEventsByType(type) {
    return Array.from(this.events.values()).filter(e => e.type === type);
  }

  getAllEvents() {
    return Array.from(this.events.values());
  }

  removeEvent(eventId) {
    this.events.delete(eventId);
  }

  // Relacje
  addRelationship(relationship) {
    this.relationships.set(relationship.id, relationship);
    return relationship;
  }

  getRelationships(personId1, personId2 = null) {
    const result = [];
    for (const rel of this.relationships.values()) {
      if (rel.person1 === personId1 || rel.person2 === personId1) {
        if (personId2 === null || rel.person1 === personId2 || rel.person2 === personId2) {
          result.push(rel);
        }
      }
    }
    return result;
  }

  // Serializacja (dla LocalStorage / Firestore)
  toJSON() {
    return {
      persons: Array.from(this.persons.values()).map(p => p.toJSON()),
      events: Array.from(this.events.values()).map(e => e.toJSON()),
      relationships: Array.from(this.relationships.values()).map(r => r.toJSON())
    };
  }

  static fromJSON(data) {
    const db = new PersonDatabase();
    
    // Załaduj osoby
    if (data.persons) {
      data.persons.forEach(pData => {
        db.addPerson(PersonModel.fromJSON(pData));
      });
    }

    // Załaduj zdarzenia
    if (data.events) {
      data.events.forEach(eData => {
        db.addEvent(EventModel.fromJSON(eData));
      });
    }

    // Załaduj relacje
    if (data.relationships) {
      data.relationships.forEach(rData => {
        db.addRelationship(RelationshipModel.fromJSON(rData));
      });
    }

    return db;
  }
}

// ============================================================================
// SŁOWNIKI I KONSTANT
// ============================================================================

const EventTypes = {
  BAPTISM: 'chrzest',
  BIRTH: 'urodzenie',
  MARRIAGE: 'małżeństwo',
  DEATH: 'zgon'
};

const RoleTypes = {
  CHILD: 'dziecko',
  FATHER: 'ojciec',
  MOTHER: 'matka',
  SPOUSE: 'małżonek',
  WITNESS: 'świadek',
  GODFATHER: 'chrzestny_ojciec',
  GODMOTHER: 'chrzestna_matka',
  BROTHER: 'brat',
  SISTER: 'siostra',
  GRANDFATHER: 'dziadek',
  GRANDMOTHER: 'babcia',
  OFFICIAL: 'urzędnik',
  CLERGY: 'duchowny'
};

const RelationshipTypes = {
  PARENT_CHILD: 'rodzic-dziecko',
  MARRIAGE: 'małżeństwo',
  SIBLING: 'rodzeństwo',
  GODPARENT: 'chrzcin',
  AFFINITY: 'powinowactwo'
};

const Occupations = {
  WORKER: 'Robotnik',
  ARTISAN: 'Rzemieślnik',
  MERCHANT: 'Kupiec',
  FARMER: 'Rolnik',
  OFFICIAL: 'Urzędnik',
  CLERGY: 'Duchowny',
  MILITARY: 'Żołnierz',
  TEACHER: 'Nauczyciel',
  DOCTOR: 'Lekarz',
  SERVANT: 'Służący'
};

const Diseases = {
  PNEUMONIA: 'Zapalenie płuc',
  TUBERCULOSIS: 'Gruźlica',
  TYPHUS: 'Dur brzuszny',
  CHOLERA: 'Cholera',
  SMALLPOX: 'Ospa',
  DYSENTERY: 'Czerwonka',
  INFLUENZA: 'Grypa',
  CHILDBED_FEVER: 'Gorączka połogowa',
  CANCER: 'Nowotwór',
  ACCIDENT: 'Wypadek'
};

const CivilStatus = {
  SINGLE: 'panna/kawaler',
  MARRIED: 'żonaty/zamężna',
  WIDOWED: 'wdowiec/wdowa',
  DIVORCED: 'rozwiedziony/rozwiedziona',
  ANNULLED: 'pozbawiony praw małżeńskich'
};

// ============================================================================
// EXPORT (dla CommonJS / ES6)
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    HistoricalDate,
    HistoricalPlace,
    PersonModel,
    PersonRoleModel,
    RelationshipModel,
    EventModel,
    PersonDatabase,
    EventTypes,
    RoleTypes,
    RelationshipTypes,
    Occupations,
    Diseases,
    CivilStatus
  };
}

// Dla globalnego scope (HTML <script>)
if (typeof window !== 'undefined') {
  window.ACTA = {
    HistoricalDate,
    HistoricalPlace,
    PersonModel,
    PersonRoleModel,
    RelationshipModel,
    EventModel,
    PersonDatabase,
    EventTypes,
    RoleTypes,
    RelationshipTypes,
    Occupations,
    Diseases,
    CivilStatus
  };
}
