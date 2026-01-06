/**
 * ACTA v3.2 - Model Danych dla Akt Genealogicznych (Rozszerzony ACTACOM 1.0)
 * Klasy do zarządzania osobami, relacjami, rolami i zdarzeniami metrykalnym
 * 
 * Wersja: 3.2 - Rozszerzona o ACTACOM 1.0 (hipotezy, luki, teorie, wzorce, DNA, kontekst historyczny)
 * Data: 6 stycznia 2026
 * Inspiracje: GEDCOM 7.0, GENTECH, AI-wspomagana genealogia, ACTACOM 1.0, posty X
 * Kompatybilność wsteczna z ACTA v1/v2/v3.0/v3.1
 */

// ============================================================================
// ENUMY ACTACOM 1.0 - Typy Rekordów, Wydarzeń, Ról
// ============================================================================

const RecordTypes = {  // Główne typy rekordów ACTACOM
  HEADER: 'ACTA',
  PERSON: 'PERS',
  EVENT: 'EVNT',
  PLACE: 'PLAC',
  SOURCE: 'SRCE',
  RELATION: 'RELA',
  REPOSITORY: 'REPO',
  INDEX: 'INDX',
  META: 'META',
  PROJECT: 'PROJ',
  GROUP: 'GRUP',
  HIST_CONTEXT: 'HIST',
  USER: 'USER',
  COLLECTION: 'COLL',
  ANOMALY: 'ANOM',
  TRANSCRIPTION: 'TRNS',
  DNA: 'DNAS'
};

const EventTypes = {  // Rozszerzone typy wydarzeń
  URODZENIE: 'URODZENIE',
  CHRZEST: 'CHRZEST',
  MALZENSTWO: 'MAŁŻEŃSTWO',
  ZAPOWIEDZI: 'ZAPOWIEDZI',
  SLUB_CYWILNY: 'ŚLUB_CYWILNY',
  SLUB_KOSCIELNY: 'ŚLUB_KOŚCIELNY',
  ROZWOD: 'ROZWÓD',
  ZGON: 'ZGON',
  POGRZEB: 'POGRZEB',
  BIERZMOWANIE: 'BIERZMOWANIE',
  KOMUNIA: 'KOMUNIA',
  SPIS_LUDNOSCI: 'SPIS_LUDNOSCI',
  EMIGRACJA: 'EMIGRACJA',
  IMIGRACJA: 'IMIGRACJA',
  ADOPCJA: 'ADOPCJA',
  ZAMIESZKANIE: 'ZAMIESZKANIE',
  SLUZBA_WOJSKOWA: 'SŁUŻBA_WOJSKOWA',
  KONWERSJA: 'KONWERSJA',
  KARA_SADOWA: 'KARA_SĄDOWA',
  TESTAMENT: 'TESTAMENT',
  INWENTARZ_POSMIERTNY: 'INWENTARZ_POŚMIERTNY'
};

const RoleTypes = {  // Rozszerzone role
  DZIECKO: 'DZIECKO',
  OJCIEC: 'OJCIEC',
  MATKA: 'MATKA',
  PAN_MLODY: 'PAN_MŁODY',
  PANNA_MLODA: 'PANNA_MŁODA',
  SWIADEK: 'ŚWIADEK',
  RODZIC_CHRZESTNY: 'RODZIC_CHRZESTNY',
  AKUSZERKA: 'AKUSZERKA',
  URZEDNIK: 'URZĘDNIK',
  ZMARLY: 'ZMARŁY',
  ADOPTOWANY: 'ADOPTOWANY',
  RODZIC_ADOPTUJACY: 'RODZIC_ADOPTUJĄCY',
  SPADKODAWCA: 'SPADKODAWCA',
  SPADKOBIERCA: 'SPADKOBIERCA',
  OSKARZONY: 'OSKARŻONY',
  POWOD: 'POWÓD',
  DZIADEK: 'DZIADEK',
  BABCIA: 'BABCIA'
};

const SourceTypes = {
  KSIEGA_PARAFIALNA: 'KSIĘGA_PARAFIALNA',
  REJESTR_CYWILNY: 'REJESTR_CYWILNY',
  SPIS_LUDNOSCI: 'SPIS_LUDNOSCI',
  AKTA_WOJSKOWE: 'AKTA_WOJSKOWE',
  GAZETA: 'GAZETA',
  NAGROBEK: 'NAGROBEK',
  FOTOGRAFIA: 'FOTOGRAFIA',
  AKTA_SADOWE: 'AKTA_SĄDOWE',
  BIBLIA_RODZINNA: 'BIBLIA_RODZINNA'
};

const DeathCategories = {
  CHOROBA: 'CHOROBA',
  WYPADKOWA: 'WYPADKOWA',
  STAROSC: 'STAROŚĆ',
  EPIDEMIA: 'EPIDEMIA',
  INNE: 'INNE'
};

const RelationTypes = {
  DZIECKO_RODZIC: 'DZIECKO_RODZIC',
  MALZENSTWO: 'MAŁŻEŃSTWO',
  RODZENSTWO: 'RODZEŃSTWO',
  PRZYRODNIE_RODZENSTWO: 'PRZYRODNIE_RODZEŃSTWO',
  PARTNER_NIEFORMALNY: 'PARTNER_NIEFORMALNY',
  DZIADEK_WNUK: 'DZIADEK_WNUK'
};

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
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.gedcomId = data.gedcomId || null; // @I123@ dla eksportu GEDCOM
    
    this.names = data.names || [];  // NazwyOsoby[] – {given: [], surname: [], type: 'primary'|'maiden'|'alias'|'religious', period?: {from, to}}
    this.sex = data.sex || 'U';     // M/F/U
    this.birth = data.birth || null; // {date: HistoricalDate, placeId: string, sourceIds: [string], confidence: number}
    this.death = data.death || null; // {date: HistoricalDate, placeId: string, cause: {detailed, category, modernEq, epidemicInfo?}, ageAtDeath?, sourceIds: [string]}
    
    this.occupations = data.occupations || []; // [{occupation: string, from?, to?, placeId?, confidence}]
    this.religions = data.religions || [];     // [{religion: string, from?, to?, confidence}]
    this.residences = data.residences || [];   // [{placeId: string, from?, to?, type: 'permanent'|'temporary'}]
    this.education = data.education || [];     // [{level: string, institution?, from?, to?}]
    
    this.relations = data.relations || [];     // [{type: RelationTypes, personId: string, role: 'father'|'mother'|'spouse'|'child'|'godparent', confidence: number}]
    
    this.sources = data.sources || [];         // sourceId[]
    this.dnaTests = data.dnaTests || [];       // dnaTestId[]
    this.photos = data.photos || [];           // [{path: string, description: string, date?}]
    this.notes = data.notes || '';
    
    this.overallConfidence = data.overallConfidence || 100; // 0-100
    
    // **NOWE: Proweniencja jako tablica (w Firestore będzie podkolekcja)**
    this.provenance = data.provenance || [];   // [{field: string, sourceId: string, extractionMethod: 'OCR'|'TRANSCRIPTION'|'MANUAL', extractionConfidence: number, interpretationConfidence: number, extractedBy: string, extractedAt: timestamp}]
    
    // Kompatybilność wsteczna - stare pola
    this.firstName = data.firstName || (this.names.length > 0 ? this.names[0].given.join(' ') : null);
    this.lastName = data.lastName || (this.names.length > 0 ? this.names[0].surname : null);
    this.gender = data.gender || (this.sex === 'M' ? 'MALE' : this.sex === 'F' ? 'FEMALE' : 'UNKNOWN');
    this.birthDate = data.birthDate || (this.birth ? this.birth.date : new HistoricalDate());
    this.birthPlace = data.birthPlace || new HistoricalPlace();
    this.deathDate = data.deathDate || (this.death ? this.death.date : new HistoricalDate());
    this.deathPlace = data.deathPlace || new HistoricalPlace();
    this.occupation = data.occupation || (this.occupations.length > 0 ? this.occupations[0].occupation : null);
    this.religion = data.religion || (this.religions.length > 0 ? this.religions[0].religion : null);
    this.nationality = data.nationality || data.ethnicOrigin || '';
    this.parents = data.parents || [];
    this.children = data.children || [];
    this.spouse = data.spouse || null;
    
    // **NOWE: Zdrowie i Genetyka**
    this.medicalConditions = []; // Historia zdrowotna: [{condition, onsetDate, source, certainty}]
    
    // **NOWE: Migracje i Mobilność**
    this.migrations = []; // Historia migracji: [{fromPlace, toPlace, date, reason, source, certainty}]
    
    // **NOWE: Dane Genetyczne/DNA**
    this.dnaData = { 
      tests: [], // [{type: 'autosomal', results: [...], haplogroup, source, certainty}]
      haplogroup: null // Główna haplogrupa
    };
    
    // **NOWE: Majątek i Status Ekonomiczny**
    this.assets = []; // Własność: [{assetType, value, date, source, certainty}]
    
    // Relacje (Firestore: tablice referencji z opcjami)
    this.parents = []; // [{personId: string, type: "father"|"mother"|"adoptive", confidence: number}]
    this.spouse = null; // ID małżonka (string lub null)
    this.children = []; // [personId: string, ...] - referencje
    this.godparents = { father: null, mother: null }; // ID chrzestnych
    this.godchildren = []; // IDs chrzczenników
    this.siblings = []; // IDs rodzeństwa
    
    // **NOWE: Persystencja Rodzinna**
    this.familyPatterns = { // Dziedziczne wzorce
      inheritedOccupation: null, // Zawód odziedziczony od przodków
      migrationPatterns: [], // Wzorce migracyjne rodziny
      healthPatterns: [] // Dziedziczne choroby/warunki
    };
    
    // **NOWE: AI-Wspomagana Weryfikacja**
    this.aiGenerated = false; // Czy dane wygenerowane przez AI?
    this.probabilityScores = {}; // Punkty prawdopodobieństwa: {parentMatch: 0.85, nameMatch: 0.92}
    
    // **NOWE: Timeline dla Walidacji Chronologicznej**
    this.timelineEvents = []; // Chronologiczna lista wydarzeń życiowych
    
    // **NOWE: Conflict Resolution**
    this.conflicts = []; // [{field: 'birthDate', alternatives: [...], resolvedValue, reason}]
    
    // **NOWE ACTACOM 1.0: System Hipotez Genealogicznych**
    this.hypothesis = {
      isHypo: false, // HYPO Y/N - czy to hipoteza
      conf: 100, // CONF - stopień pewności hipotezy
      just: '', // JUST - uzasadnienie hipotezy
      altTheoryId: null, // ALT_THEORY - link do alternatywnej teorii
      evid: 'PRIMARY' // EVID - typ dowodu (DEDUCED/PRIMARY/SECONDARY)
    };
    
    // **NOWE ACTACOM 1.0: System Weryfikacji Wieku**
    this.ageAnalysis = {
      expected: 80, // EXPECTED - oczekiwana długość życia
      variance: 0, // VARIANCE - odchylenie od normy
      flag: 'OK', // FLAG - status (OK/QUESTIONABLE/UNLIKELY/IMPOSSIBLE)
      histContext: '', // HIST_CONTEXT - kontekst historyczny
      familyPattern: '' // FAMILY_PATTERN - wzorce rodzinne
    };
    
    // **NOWE ACTACOM 1.0: Śledzenie Zmian w Danych**
    this.changeLog = []; // Tablica zmian: {date, userId, field, oldValue, newValue, reason, sourceId, confidence}
    this.researchLog = []; // Tablica badań: {date, userId, action, result, sourceId}
    
    // **ROZSZERZONE: DNA Data z matches**
    this.dnaData.matches = []; // Matches DNA: {matchName, haplogroup, distance, cert, commonAncestorId, certAncestor}
    
    // Metadata
    this.confidence = 100; // 0-100
    this.sourceText = ''; // Oryginalne słowa z aktu
    this.notes = ''; // Notatki genealoga
    this.lastModified = new Date();
  }

  // Metody dla relacji rodzinnych (Firestore: denormalizacja)
  addParent(parentId, type = 'father', confidence = 100) {
    // type: 'father', 'mother', 'adoptive'
    // Unikaj duplikatów
    if (!this.parents.some(p => p.personId === parentId && p.type === type)) {
      this.parents.push({ personId: parentId, type: type, confidence: confidence });
    }
    return this;
  }

  removeParent(parentId, type = null) {
    this.parents = this.parents.filter(p => p.personId !== parentId || (type && p.type !== type));
    return this;
  }

  getParents(type = null) {
    return type ? this.parents.filter(p => p.type === type) : this.parents;
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

  // **NOWE METODY: Migracje**
  addMigration(fromPlace, toPlace, date, reason, source, certainty = 100) {
    this.migrations.push({
      from: fromPlace, // HistoricalPlace
      to: toPlace, // HistoricalPlace
      date: date, // HistoricalDate
      reason: reason, // np. "wojna", "ekonomiczna", "ucieczka"
      source: source, // Źródło informacji
      certainty: certainty // 0-100
    });
    return this;
  }

  // **NOWE METODY: Dane DNA**
  addDnaTest(testType, results, haplogroup, source, certainty = 100) {
    this.dnaData.tests.push({
      type: testType, // 'autosomal', 'Y-DNA', 'mtDNA'
      results: results, // tablica markerów lub wyniki
      haplogroup: haplogroup, // np. 'R1a', 'H1a'
      source: source, // Źródło testu
      certainty: certainty // 0-100
    });
    if (haplogroup && !this.dnaData.haplogroup) {
      this.dnaData.haplogroup = haplogroup; // Główna haplogrupa
    }
    return this;
  }

  // **NOWE METODY: Warunki Zdrowotne**
  addMedicalCondition(condition, onsetDate, source, certainty = 100) {
    this.medicalConditions.push({
      condition: condition, // np. "gruźlica", "dur brzuszny"
      onsetDate: onsetDate, // HistoricalDate
      source: source, // Źródło informacji
      certainty: certainty // 0-100
    });
    return this;
  }

  // **NOWE METODY: Majątek**
  addAsset(assetType, value, date, source, certainty = 100) {
    this.assets.push({
      assetType: assetType, // 'nieruchomość', 'pieniądze', 'narzędzia'
      value: value, // wartość lub opis
      date: date, // HistoricalDate
      source: source, // Źródło informacji
      certainty: certainty // 0-100
    });
    return this;
  }

  // **NOWE METODY: Persystencja Rodzinna**
  setInheritedOccupation(occupation, inheritedFrom = 'ancestor') {
    this.familyPatterns.inheritedOccupation = {
      occupation: occupation,
      inheritedFrom: inheritedFrom, // 'father', 'mother', 'ancestor'
      certainty: 100
    };
    return this;
  }

  // **NOWE METODY: Timeline dla Walidacji Chronologicznej**
  buildTimeline() {
    this.timelineEvents = [];

    // Dodaj kluczowe wydarzenia życiowe
    if (this.birthDate.date) {
      this.timelineEvents.push({
        event: 'birth',
        date: this.birthDate,
        description: `Urodzenie w ${this.birthPlace.getDisplayString()}`
      });
    }

    if (this.confirmationDate.date) {
      this.timelineEvents.push({
        event: 'confirmation',
        date: this.confirmationDate,
        description: 'Chrzest święty/potwierdzenie'
      });
    }

    // Migracje
    this.migrations.forEach((migration, index) => {
      this.timelineEvents.push({
        event: 'migration',
        date: migration.date,
        description: `Migracja z ${migration.from.getDisplayString()} do ${migration.to.getDisplayString()}`,
        details: migration
      });
    });

    // Warunki zdrowotne
    this.medicalConditions.forEach((condition, index) => {
      this.timelineEvents.push({
        event: 'medical',
        date: condition.onsetDate,
        description: `Warunek zdrowotny: ${condition.condition}`,
        details: condition
      });
    });

    // Majątek
    this.assets.forEach((asset, index) => {
      this.timelineEvents.push({
        event: 'asset',
        date: asset.date,
        description: `Nabycie majątku: ${asset.assetType}`,
        details: asset
      });
    });

    if (this.deathDate.date) {
      this.timelineEvents.push({
        event: 'death',
        date: this.deathDate,
        description: `Zgon w ${this.deathPlace.getDisplayString()}${this.causeOfDeath ? ` - ${this.causeOfDeath}` : ''}`
      });
    }

    // Sortuj chronologicznie
    this.timelineEvents.sort((a, b) => {
      if (!a.date.date && !b.date.date) return 0;
      if (!a.date.date) return 1;
      if (!b.date.date) return -1;
      return a.date.date - b.date.date;
    });

    // Walidacja: sprawdź konflikty chronologiczne
    this.validateTimeline();

    return this.timelineEvents;
  }

  validateTimeline() {
    // Prosta walidacja chronologiczna
    const birth = this.timelineEvents.find(e => e.event === 'birth');
    const death = this.timelineEvents.find(e => e.event === 'death');

    if (birth && death && birth.date.date > death.date.date) {
      this.conflicts.push({
        field: 'timeline',
        type: 'chronological',
        description: 'Data zgonu wcześniejsza niż data urodzenia',
        alternatives: [birth.date, death.date],
        resolvedValue: null,
        reason: 'Wymaga weryfikacji źródeł'
      });
    }

    // Sprawdź wiek przy zgonie vs. oczekiwany
    if (birth && death && birth.date.date && death.date.date) {
      const calculatedAge = Math.floor((death.date.date - birth.date.date) / (365.25 * 24 * 60 * 60 * 1000));
      if (this.age && Math.abs(calculatedAge - this.age) > 2) {
        this.conflicts.push({
          field: 'age',
          type: 'consistency',
          description: `Wiek przy zgonie (${this.age}) nie zgadza się z obliczeniami (${calculatedAge})`,
          alternatives: [this.age, calculatedAge],
          resolvedValue: null,
          reason: 'Sprawdź dokładność dat'
        });
      }
    }
  }

  // **ROZSZERZONA METODA: Alternatywne Nazwy z Typami**
  addAlternativeName(firstName, lastName, type = 'alias', period = null, source = null, certainty = 100) {
    // type: 'alias', 'pseudonym', 'military_alias', 'adoption_name', 'marriage_name'
    this.aliases.push({
      firstName: firstName,
      lastName: lastName,
      type: type,
      period: period, // {from: HistoricalDate, to: HistoricalDate}
      source: source,
      certainty: certainty
    });
    return this;
  }

  // **NOWA METODA: Conflict Resolution**
  resolveConflict(field, resolvedValue, reason) {
    const conflict = this.conflicts.find(c => c.field === field && !c.resolvedValue);
    if (conflict) {
      conflict.resolvedValue = resolvedValue;
      conflict.reason = reason;
    }
    return this;
  }

  // **NOWA METODA: Historia zawodowa dla persistencji rodzinnej**
  addOccupationHistory(occupation, fromDate, toDate = null, inheritedFrom = null, certainty = 100) {
    this.occupationHistory.push({
      occupation: occupation,
      fromDate: fromDate, // HistoricalDate
      toDate: toDate, // HistoricalDate, null jeśli aktualne
      inheritedFrom: inheritedFrom, // 'father', 'mother', 'ancestor', null
      certainty: certainty
    });
    // Aktualizuj obecny zawód jeśli to najnowszy
    if (!this.occupation || this.occupationHistory.length === 1) {
      this.occupation = occupation;
    }
    return this;
  }

  // **ROZSZERZONA METODA: Alternatywne nazwy z rozszerzonymi typami**
  addAlternativeName(firstName, lastName, type = 'alias', period = null, source = null, certainty = 100) {
    // type: 'alias', 'pseudonym', 'military_alias', 'adoption_name', 'marriage_name', 'stage_name', 'religious_name'
    this.aliases.push({
      firstName: firstName,
      lastName: lastName,
      type: type,
      period: period, // {from: HistoricalDate, to: HistoricalDate}
      source: source,
      certainty: certainty
    });
    return this;
  }

  // **NOWA METODA: Sprawdź persistencję rodzinną (np. podobieństwo zawodów)**
  checkFamilyPersistence() {
    const warnings = [];
    if (this.occupation && this.familyPatterns.inheritedOccupation) {
      const inherited = this.familyPatterns.inheritedOccupation.occupation;
      if (this.occupation !== inherited) {
        warnings.push(`Zawód ${this.occupation} różni się od dziedzicznego ${inherited}`);
      }
    }
    return warnings;
  }

  // **NOWE ACTACOM 1.0: System Hipotez Genealogicznych**
  setHypothesis(isHypo, conf, just, evid = 'DEDUCED', altTheoryId = null) {
    this.hypothesis = {
      isHypo: isHypo, // boolean
      conf: conf, // 0-100
      just: just, // uzasadnienie
      altTheoryId: altTheoryId, // ID alternatywnej teorii
      evid: evid // 'DEDUCED', 'PRIMARY', 'SECONDARY'
    };
    return this;
  }

  // **NOWE ACTACOM 1.0: System Weryfikacji Wieku**
  verifyAge() {
    if (!this.birthDate.date || !this.deathDate.date) {
      this.ageAnalysis.flag = 'MISSING_DATA';
      return this.ageAnalysis;
    }

    const lifespan = Math.floor((this.deathDate.date - this.birthDate.date) / (365.25 * 24 * 60 * 60 * 1000));
    this.ageAnalysis.variance = lifespan - this.ageAnalysis.expected;

    // Sprawdź parent-child age consistency
    if (this.children && this.children.length > 0) {
      // Logika sprawdzania wieku rodziców przy urodzeniu dzieci
      // TODO: zaimplementować pełną walidację
    }

    // Sprawdź marriage age
    if (this.spouse && this.birthDate.date) {
      // Logika sprawdzania wieku przy małżeństwie
      // TODO: zaimplementować pełną walidację
    }

    // Ustaw flagę na podstawie wariancji
    if (Math.abs(this.ageAnalysis.variance) > 20) {
      this.ageAnalysis.flag = 'QUESTIONABLE';
    } else if (Math.abs(this.ageAnalysis.variance) > 10) {
      this.ageAnalysis.flag = 'UNLIKELY';
    } else if (lifespan < 0) {
      this.ageAnalysis.flag = 'IMPOSSIBLE';
    } else {
      this.ageAnalysis.flag = 'OK';
    }

    return this.ageAnalysis;
  }

  // **NOWE ACTACOM 1.0: Śledzenie Zmian w Danych**
  logChange(field, oldValue, newValue, reason, sourceId, userId = 'system') {
    this.changeLog.push({
      date: new Date(),
      userId: userId,
      field: field,
      oldValue: oldValue,
      newValue: newValue,
      reason: reason,
      sourceId: sourceId,
      confidence: this.confidence
    });
    this.lastModified = new Date();
    return this;
  }

  // **NOWE ACTACOM 1.0: Log badań**
  logResearch(action, result, sourceId, userId = 'system') {
    this.researchLog.push({
      date: new Date(),
      userId: userId,
      action: action, // 'searched_archives', 'contacted_relative', etc.
      result: result, // opis wyniku
      sourceId: sourceId
    });
    return this;
  }

  // **ROZSZERZONE ACTACOM 1.0: DNA Matches**
  addDnaMatch(matchName, haplogroup, distance, cert, commonAncestorId, certAncestor = 'MEDIUM') {
    this.dnaData.matches.push({
      matchName: matchName,
      haplogroup: haplogroup,
      distance: distance,
      cert: cert, // certainty of match
      commonAncestorId: commonAncestorId,
      certAncestor: certAncestor // certainty of common ancestor
    });
    return this;
  }

  // Serializacja (Firestore: gotowa na kolekcję 'persons')
  toJSON() {
    return {
      id: this.id,
      gedcomId: this.gedcomId,
      names: this.names,
      sex: this.sex,
      birth: this.birth ? {
        date: this.birth.date.toJSON(),
        placeId: this.birth.placeId,
        sourceIds: this.birth.sourceIds || [],
        confidence: this.birth.confidence
      } : null,
      death: this.death ? {
        date: this.death.date.toJSON(),
        placeId: this.death.placeId,
        cause: this.death.cause,
        ageAtDeath: this.death.ageAtDeath,
        sourceIds: this.death.sourceIds || []
      } : null,
      occupations: this.occupations,
      religions: this.religions,
      residences: this.residences,
      education: this.education,
      relations: this.relations,
      sources: this.sources,
      dnaTests: this.dnaTests,
      photos: this.photos,
      notes: this.notes,
      overallConfidence: this.overallConfidence,
      
      // Firestore: podkolekcja provenance
      provenance: this.provenance.map(p => ({
        ...p,
        extractedAt: p.extractedAt.toISOString()
      })),
      
      // Kompatybilność wsteczna
      firstName: this.firstName,
      lastName: this.lastName,
      gender: this.gender,
      birthDate: this.birthDate.toJSON(),
      birthPlace: this.birthPlace.toJSON(),
      deathDate: this.deathDate.toJSON(),
      deathPlace: this.deathPlace.toJSON(),
      occupation: this.occupation,
      religion: this.religion,
      nationality: this.nationality,
      parents: this.parents,
      children: this.children,
      spouse: this.spouse,
      
      confidence: this.confidence,
      lastModified: this.lastModified.toISOString()
    };
  }

  static fromJSON(data) {
    const person = new PersonModel(data);
    person.id = data.id;
    person.gedcomId = data.gedcomId;
    person.names = data.names || [];
    person.sex = data.sex || 'U';
    
    // **NOWE: Kulturowe/Histor.**
    person.patronymic = data.patronymic || null;
    person.clanOrTribe = data.clanOrTribe || null;
    
    person.gender = data.gender;
    person.birthDate = HistoricalDate.fromJSON(data.birthDate);
    person.birthPlace = HistoricalPlace.fromJSON(data.birthPlace);
    person.confirmationDate = data.confirmationDate ? HistoricalDate.fromJSON(data.confirmationDate) : new HistoricalDate();
    person.deathDate = HistoricalDate.fromJSON(data.deathDate);
    person.deathPlace = HistoricalPlace.fromJSON(data.deathPlace);
    person.causeOfDeath = data.causeOfDeath || null;
    person.age = data.age;
    person.occupation = data.occupation;
    person.occupationCategory = data.occupationCategory;
    person.occupationHistory = data.occupationHistory ? data.occupationHistory.map(h => ({
      ...h,
      fromDate: HistoricalDate.fromJSON(h.fromDate),
      toDate: h.toDate ? HistoricalDate.fromJSON(h.toDate) : null
    })) : [];
    person.civilStatus = data.civilStatus;
    person.residence = HistoricalPlace.fromJSON(data.residence);
    person.religion = data.religion;
    person.nationality = data.nationality || null;
    person.citizenship = data.citizenship || null;
    person.education = data.education || null;
    person.socialStatus = data.socialStatus || null;
    
    // **NOWE: Zdrowie i Genetyka**
    person.medicalConditions = data.medicalConditions ? data.medicalConditions.map(c => ({
      ...c,
      onsetDate: HistoricalDate.fromJSON(c.onsetDate)
    })) : [];
    
    // **NOWE: Migracje**
    person.migrations = data.migrations ? data.migrations.map(m => ({
      ...m,
      from: HistoricalPlace.fromJSON(m.from),
      to: HistoricalPlace.fromJSON(m.to),
      date: HistoricalDate.fromJSON(m.date)
    })) : [];
    
    // **NOWE: DNA z matches**
    person.dnaData = data.dnaData || { tests: [], haplogroup: null, matches: [] };
    if (data.dnaData && data.dnaData.matches) {
      person.dnaData.matches = data.dnaData.matches;
    }
    
    // **NOWE: Majątek**
    person.assets = data.assets ? data.assets.map(a => ({
      ...a,
      date: HistoricalDate.fromJSON(a.date)
    })) : [];
    
    // Migracja parents: stary format {father: id, mother: id} → nowy [{personId, type, confidence}]
    if (data.parents) {
      if (Array.isArray(data.parents)) {
        person.parents = data.parents; // Nowy format
      } else {
        // Stary format: konwertuj
        person.parents = [];
        if (data.parents.father) person.parents.push({ personId: data.parents.father, type: 'father', confidence: 100 });
        if (data.parents.mother) person.parents.push({ personId: data.parents.mother, type: 'mother', confidence: 100 });
      }
    } else {
      person.parents = [];
    }
    
    person.spouse = data.spouse;
    person.children = data.children;
    person.godparents = data.godparents;
    person.godchildren = data.godchildren;
    person.siblings = data.siblings;
    
    // **NOWE: Persystencja Rodzinna**
    person.familyPatterns = data.familyPatterns || {
      inheritedOccupation: null,
      migrationPatterns: [],
      healthPatterns: []
    };
    
    // **NOWE: AI i Walidacja**
    person.aiGenerated = data.aiGenerated || false;
    person.probabilityScores = data.probabilityScores || {};
    person.timelineEvents = data.timelineEvents ? data.timelineEvents.map(e => ({
      ...e,
      date: HistoricalDate.fromJSON(e.date)
    })) : [];
    person.conflicts = data.conflicts || [];
    
    // **NOWE ACTACOM 1.0: System Hipotez**
    person.hypothesis = data.hypothesis || {
      isHypo: false,
      conf: 100,
      just: '',
      altTheoryId: null,
      evid: 'PRIMARY'
    };
    
    // **NOWE ACTACOM 1.0: Weryfikacja Wieku**
    person.ageAnalysis = data.ageAnalysis || {
      expected: 80,
      variance: 0,
      flag: 'OK',
      histContext: '',
      familyPattern: ''
    };
    
    // **NOWE ACTACOM 1.0: Śledzenie Zmian**
    person.changeLog = data.changeLog ? data.changeLog.map(entry => ({
      ...entry,
      date: new Date(entry.date)
    })) : [];
    person.researchLog = data.researchLog ? data.researchLog.map(entry => ({
      ...entry,
      date: new Date(entry.date)
    })) : [];
    
    person.confidence = data.confidence;
    person.sourceText = data.sourceText;
    person.notes = data.notes;
    person.lastModified = new Date(data.lastModified);
    return person;
  }

  // **NOWA METODA: Eksport do GEDCOM**
  toGEDCOM(level = 0) {
    const indent = '  '.repeat(level);
    let gedcom = '';

    // INDI record
    gedcom += `${indent}0 @I${this.id}@ INDI\n`;

    // NAME
    if (this.firstName || this.lastName) {
      gedcom += `${indent}1 NAME ${this.firstName || ''} /${this.lastName || ''}/\n`;
      if (this.maidenName) {
        gedcom += `${indent}2 GIVN ${this.firstName}\n`;
        gedcom += `${indent}2 SURN ${this.lastName}\n`;
        gedcom += `${indent}2 _MARN ${this.maidenName}\n`;
      }
    }

    // SEX
    if (this.gender === 'MALE') gedcom += `${indent}1 SEX M\n`;
    else if (this.gender === 'FEMALE') gedcom += `${indent}1 SEX F\n`;

    // BIRT
    if (this.birthDate.date) {
      gedcom += `${indent}1 BIRT\n`;
      gedcom += `${indent}2 DATE ${this.birthDate.getDisplayString()}\n`;
      if (this.birthPlace.getDisplayString()) {
        gedcom += `${indent}2 PLAC ${this.birthPlace.getDisplayString()}\n`;
      }
    }

    // CHR (confirmation/baptism)
    if (this.confirmationDate.date) {
      gedcom += `${indent}1 CHR\n`;
      gedcom += `${indent}2 DATE ${this.confirmationDate.getDisplayString()}\n`;
    }

    // DEAT
    if (this.deathDate.date) {
      gedcom += `${indent}1 DEAT\n`;
      gedcom += `${indent}2 DATE ${this.deathDate.getDisplayString()}\n`;
      if (this.deathPlace.getDisplayString()) {
        gedcom += `${indent}2 PLAC ${this.deathPlace.getDisplayString()}\n`;
      }
      if (this.causeOfDeath) {
        gedcom += `${indent}2 CAUS ${this.causeOfDeath}\n`;
      }
    }

    // OCCU
    if (this.occupation) {
      gedcom += `${indent}1 OCCU ${this.occupation}\n`;
    }

    // RELI
    if (this.religion) {
      gedcom += `${indent}1 RELI ${this.religion}\n`;
    }

    // RESI
    if (this.residence.getDisplayString()) {
      gedcom += `${indent}1 RESI\n`;
      gedcom += `${indent}2 PLAC ${this.residence.getDisplayString()}\n`;
    }

    // Custom extensions for ACTA v3
    if (this.patronymic) {
      gedcom += `${indent}1 _PATRN ${this.patronymic}\n`;
    }

    if (this.clanOrTribe) {
      gedcom += `${indent}1 _CLAN ${this.clanOrTribe}\n`;
    }

    // DNA data
    if (this.dnaData.haplogroup) {
      gedcom += `${indent}1 _DNA\n`;
      gedcom += `${indent}2 HGRP ${this.dnaData.haplogroup}\n`;
    }

    // Medical conditions
    this.medicalConditions.forEach(condition => {
      gedcom += `${indent}1 _MDCL ${condition.condition}\n`;
      if (condition.onsetDate.date) {
        gedcom += `${indent}2 DATE ${condition.onsetDate.getDisplayString()}\n`;
      }
    });

    // Migrations
    this.migrations.forEach(migration => {
      gedcom += `${indent}1 _MIGR\n`;
      gedcom += `${indent}2 DATE ${migration.date.getDisplayString()}\n`;
      gedcom += `${indent}2 FROM ${migration.from.getDisplayString()}\n`;
      gedcom += `${indent}2 TO ${migration.to.getDisplayString()}\n`;
      if (migration.reason) {
        gedcom += `${indent}2 REAS ${migration.reason}\n`;
      }
    });

    // Assets
    this.assets.forEach(asset => {
      gedcom += `${indent}1 _ASSET ${asset.assetType}\n`;
      if (asset.value) {
        gedcom += `${indent}2 VALU ${asset.value}\n`;
      }
      if (asset.date.date) {
        gedcom += `${indent}2 DATE ${asset.date.getDisplayString()}\n`;
      }
    });

    // AI flags
    if (this.aiGenerated) {
      gedcom += `${indent}1 _AI Y\n`;
      Object.entries(this.probabilityScores).forEach(([key, value]) => {
        gedcom += `${indent}2 _PROB ${key} ${value}\n`;
      });
    }

    // Notes
    if (this.notes) {
      gedcom += `${indent}1 NOTE ${this.notes.replace(/\n/g, '\n' + indent + '2 CONT ')}\n`;
    }

    return gedcom;
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
 * Firestore: kolekcja 'records' z recordType, involvedPersons[], details{}
 */
class EventModel {
  constructor(recordType = 'unknown', year = null, number = null) {
    this.id = crypto.randomUUID();
    this.recordType = recordType; // EventTypes
    this.gedcomMapped = false; // czy już zmapowany do persons/families
    this.sourceId = null;
    this.recordId = null; // np. 'LIN1789_CHR_042'
    this.year = year;
    this.recordNumber = number || 1;
    this.parish = null;
    this.date = new HistoricalDate();
    this.placeId = null;
    
    // Uczestnicy
    this.involvedPersons = []; // [{personId?: string, role: RoleTypes, name: string, surname: string, confidence?: number}]
    
    // Szczegóły specyficzne dla typu
    this.details = {}; // pola specyficzne dla typu aktu
    
    // Transkrypcja
    this.transcription = null; // {author: string, date: timestamp, difficulties: string, alternativeReadings: [{text: string, confidence: number}], toolsUsed: [string], confidence: number}
    
    this.notes = '';
    
    // 3-poziomowa wiarygodność
    this.reliability = {
      source: 100,
      extraction: 100, 
      interpretation: 100,
      total: 100
    };
    
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.fieldROIs = {}; // Mapa {fieldId: ROI}
    
    // Proweniencja - Firestore: podkolekcja 'provenance'
    this.provenance = []; // [{date, userId, action, sourceId, confidence, notes}]
    
    // Metadane
    this.confidence = 100;
    this.notes = '';
    this.tags = []; // Np. ['bliźnięta', 'druga żona']
    this.lastModified = new Date();
    
    // ACTACOM: Przyczyna zgonu dla aktów zgonu
    this.deathCause = null; // Szczegóły przyczyny zgonu (tylko dla recordType === 'zgon')
  }

  // Getter dla kompatybilności wstecznej
  get type() {
    return this.recordType;
  }

  // Metody do zarządzania rolami (Firestore: denormalizacja)
  addPersonWithRole(personId, roleType, properties = {}) {
    const role = new PersonRoleModel();
    role.personId = personId;
    role.roleType = roleType;
    role.properties = properties;
    this.roles.push(role);
    
    // Firestore: dodaj do involvedPersons dla szybkich zapytań
    if (!this.involvedPersons.includes(personId)) {
      this.involvedPersons.push(personId);
    }
    
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

  // ACTACOM: Metoda do ustawiania przyczyny zgonu
  setDeathCause(mainCategory, detailed = '', options = {}) {
    if (this.recordType !== EventTypes.ZGON && this.recordType !== 'zgon') {
      throw new Error('Death cause can only be set for death records');
    }
    
    this.deathCause = {
      mainCategory: mainCategory,
      detailed: detailed,
      epidemicInfo: options.epidemicInfo || null,
      medicalDetails: options.medicalDetails || null,
      circumstances: options.circumstances || null,
      ageAtDeath: options.ageAtDeath || null,
      timeOfDeath: options.timeOfDeath || null,
      placeOfDeath: options.placeOfDeath || null,
      burialInfo: options.burialInfo || null
    };
    return this;
  }

  // Firestore: metody dla proweniencji
  addProvenance(date, userId, action, sourceId, confidence = 100, notes = '') {
    this.provenance.push({
      date: date || new Date(),
      userId: userId,
      action: action, // 'created', 'modified', 'verified'
      sourceId: sourceId,
      confidence: confidence,
      notes: notes
    });
    return this;
  }

  // Serializacja (Firestore: gotowa na kolekcję 'records')
  toJSON() {
    return {
      id: this.id,
      recordType: this.recordType, // Zamiast type
      year: this.year,
      number: this.number,
      date: this.date.toJSON(),
      place: this.place.toJSON(),
      
      // Firestore: denormalizacja
      involvedPersons: this.involvedPersons,
      roles: this.roles.map(r => r.toJSON()),
      details: this.details,
      
      relationships: this.relationships.map(r => r.toJSON()),
      sources: this.sources,
      archiveReference: this.archiveReference,
      bookNumber: this.bookNumber,
      pageNumber: this.pageNumber,
      officialName: this.officialName,
      actROI: this.actROI,
      fieldROIs: this.fieldROIs,
      
      // Firestore: podkolekcja provenance
      provenance: this.provenance.map(p => ({
        ...p,
        date: p.date.toISOString()
      })),
      
      confidence: this.confidence,
      notes: this.notes,
      tags: this.tags,
      lastModified: this.lastModified.toISOString(),
      
      // ACTACOM: Przyczyna zgonu
      deathCause: this.deathCause ? {
        mainCategory: this.deathCause.mainCategory,
        detailed: this.deathCause.detailed,
        epidemicInfo: this.deathCause.epidemicInfo ? {
          epidemicName: this.deathCause.epidemicInfo.epidemicName,
          waveNumber: this.deathCause.epidemicInfo.waveNumber,
          location: this.deathCause.epidemicInfo.location
        } : null,
        medicalDetails: this.deathCause.medicalDetails ? {
          immediateCause: this.deathCause.medicalDetails.immediateCause,
          underlyingCause: this.deathCause.medicalDetails.underlyingCause,
          contributingFactors: this.deathCause.medicalDetails.contributingFactors || []
        } : null,
        circumstances: this.deathCause.circumstances ? {
          accidentDetails: this.deathCause.circumstances.accidentDetails,
          violenceDetails: this.deathCause.circumstances.violenceDetails,
          suicideDetails: this.deathCause.circumstances.suicideDetails,
          otherCircumstances: this.deathCause.circumstances.otherCircumstances
        } : null,
        ageAtDeath: this.deathCause.ageAtDeath,
        timeOfDeath: this.deathCause.timeOfDeath,
        placeOfDeath: this.deathCause.placeOfDeath,
        burialInfo: this.deathCause.burialInfo ? {
          date: this.deathCause.burialInfo.date.toJSON(),
          place: this.deathCause.burialInfo.place.toJSON(),
          cemetery: this.deathCause.burialInfo.cemetery
        } : null
      } : null
    };
  }

  static fromJSON(data) {
    // Migracja: stary type → nowy recordType
    const recordType = data.recordType || data.type || 'unknown';
    const event = new EventModel(recordType, data.year, data.number);
    event.id = data.id;
    event.date = HistoricalDate.fromJSON(data.date);
    event.place = HistoricalPlace.fromJSON(data.place);
    
    // Firestore: denormalizacja
    event.involvedPersons = data.involvedPersons || [];
    event.roles = data.roles ? data.roles.map(r => PersonRoleModel.fromJSON(r)) : [];
    event.details = data.details || {};
    
    event.relationships = data.relationships ? data.relationships.map(r => RelationshipModel.fromJSON(r)) : [];
    event.sources = data.sources || [];
    event.archiveReference = data.archiveReference;
    event.bookNumber = data.bookNumber;
    event.pageNumber = data.pageNumber;
    event.officialName = data.officialName;
    event.actROI = data.actROI;
    event.fieldROIs = data.fieldROIs;
    
    // Firestore: podkolekcja provenance
    event.provenance = data.provenance ? data.provenance.map(p => ({
      ...p,
      date: new Date(p.date)
    })) : [];
    
    event.confidence = data.confidence;
    event.notes = data.notes;
    event.tags = data.tags;
    event.lastModified = new Date(data.lastModified);
    
    // ACTACOM: Przyczyna zgonu
    event.deathCause = data.deathCause ? {
      mainCategory: data.deathCause.mainCategory,
      detailed: data.deathCause.detailed,
      epidemicInfo: data.deathCause.epidemicInfo ? {
        epidemicName: data.deathCause.epidemicInfo.epidemicName,
        waveNumber: data.deathCause.epidemicInfo.waveNumber,
        location: data.deathCause.epidemicInfo.location
      } : null,
      medicalDetails: data.deathCause.medicalDetails ? {
        immediateCause: data.deathCause.medicalDetails.immediateCause,
        underlyingCause: data.deathCause.medicalDetails.underlyingCause,
        contributingFactors: data.deathCause.medicalDetails.contributingFactors || []
      } : null,
      circumstances: data.deathCause.circumstances ? {
        accidentDetails: data.deathCause.circumstances.accidentDetails,
        violenceDetails: data.deathCause.circumstances.violenceDetails,
        suicideDetails: data.deathCause.circumstances.suicideDetails,
        otherCircumstances: data.deathCause.circumstances.otherCircumstances
      } : null,
      ageAtDeath: data.deathCause.ageAtDeath,
      timeOfDeath: data.deathCause.timeOfDeath,
      placeOfDeath: data.deathCause.placeOfDeath,
      burialInfo: data.deathCause.burialInfo ? {
        date: HistoricalDate.fromJSON(data.deathCause.burialInfo.date),
        place: HistoricalPlace.fromJSON(data.deathCause.burialInfo.place),
        cemetery: data.deathCause.burialInfo.cemetery
      } : null
    } : null;
    
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
    
    // **NOWE ACTACOM 1.0: Rejestry rozszerzone**
    this.gaps = new Map(); // Mapa: gapId -> GapModel (luki genealogiczne)
    this.theories = new Map(); // Mapa: theoryId -> TheoryModel (teorie genealogiczne)
    this.patterns = new Map(); // Mapa: patternId -> PatternModel (wzorce)
    this.histEvents = new Map(); // Mapa: histEventId -> HistEventModel (wydarzenia historyczne)
    this.sources = new Map(); // Mapa: sourceId -> SourceModel (źródła rozszerzone)
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

  // **NOWE ACTACOM 1.0: Metody zarządzania lukami genealogicznymi**
  addGap(gap) {
    this.gaps.set(gap.id, gap);
    return gap;
  }

  getGap(gapId) {
    return this.gaps.get(gapId);
  }

  getGapsByType(type) {
    return Array.from(this.gaps.values()).filter(g => g.type === type);
  }

  getGapsByPriority(priority) {
    return Array.from(this.gaps.values()).filter(g => g.priority === priority);
  }

  // **NOWE ACTACOM 1.0: Metody zarządzania teoriami**
  addTheory(theory) {
    this.theories.set(theory.id, theory);
    return theory;
  }

  getTheory(theoryId) {
    return this.theories.get(theoryId);
  }

  getTheoriesByPerson(personId) {
    return Array.from(this.theories.values()).filter(t => t.personIds.includes(personId));
  }

  getConflictingTheories(theoryId) {
    const theory = this.theories.get(theoryId);
    if (!theory) return [];
    return Array.from(this.theories.values()).filter(t => 
      theory.relTheory[t.id] === 'contradicts' || t.relTheory[theoryId] === 'contradicts'
    );
  }

  // **NOWE ACTACOM 1.0: Metody zarządzania wzorcami**
  addPattern(pattern) {
    this.patterns.set(pattern.id, pattern);
    return pattern;
  }

  getPattern(patternId) {
    return this.patterns.get(patternId);
  }

  getPatternsByType(type) {
    return Array.from(this.patterns.values()).filter(p => p.type === type);
  }

  // **NOWE ACTACOM 1.0: Metody zarządzania wydarzeniami historycznymi**
  addHistEvent(histEvent) {
    this.histEvents.set(histEvent.id, histEvent);
    return histEvent;
  }

  getHistEvent(histEventId) {
    return this.histEvents.get(histEventId);
  }

  getHistEventsByPerson(personId) {
    return Array.from(this.histEvents.values()).filter(h => h.personIds.includes(personId));
  }

  getHistEventsByDateRange(fromDate, toDate) {
    return Array.from(this.histEvents.values()).filter(h => {
      const eventDate = h.date.date;
      return eventDate >= fromDate && eventDate <= toDate;
    });
  }

  // **NOWE ACTACOM 1.0: Metody zarządzania źródłami rozszerzonymi**
  addSource(source) {
    this.sources.set(source.id, source);
    return source;
  }

  getSource(sourceId) {
    return this.sources.get(sourceId);
  }

  getSourcesByType(type) {
    return Array.from(this.sources.values()).filter(s => s.type === type);
  }

  // Serializacja (dla LocalStorage / Firestore)
  toJSON() {
    return {
      persons: Array.from(this.persons.values()).map(p => p.toJSON()),
      events: Array.from(this.events.values()).map(e => e.toJSON()),
      relationships: Array.from(this.relationships.values()).map(r => r.toJSON()),
      
      // **NOWE ACTACOM 1.0: Serializacja rejestrów rozszerzonych**
      gaps: Array.from(this.gaps.values()).map(g => g.toJSON()),
      theories: Array.from(this.theories.values()).map(t => t.toJSON()),
      patterns: Array.from(this.patterns.values()).map(p => p.toJSON()),
      histEvents: Array.from(this.histEvents.values()).map(h => h.toJSON()),
      sources: Array.from(this.sources.values()).map(s => s.toJSON())
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
    
    // **NOWE ACTACOM 1.0: Deserializacja rejestrów rozszerzonych**
    if (data.gaps) {
      data.gaps.forEach(gData => {
        db.addGap(GapModel.fromJSON(gData));
      });
    }
    
    if (data.theories) {
      data.theories.forEach(tData => {
        db.addTheory(TheoryModel.fromJSON(tData));
      });
    }
    
    if (data.patterns) {
      data.patterns.forEach(pData => {
        db.addPattern(PatternModel.fromJSON(pData));
      });
    }
    
    if (data.histEvents) {
      data.histEvents.forEach(hData => {
        db.addHistEvent(HistEventModel.fromJSON(hData));
      });
    }
    
    if (data.sources) {
      data.sources.forEach(sData => {
        db.addSource(SourceModel.fromJSON(sData));
      });
    }

    return db;
  }
}

// ============================================================================
// NOWE MODELE ACTACOM 1.0 - Hipotezy, Anomalie
// ============================================================================

class HypothesisModel {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.title = data.title || '';
    this.description = data.description || '';
    this.confidence = data.confidence || 50;
    this.status = data.status || 'DRAFT';
    this.linkedPersons = data.linkedPersons || [];
    this.linkedRecords = data.linkedRecords || [];
    this.evidence = data.evidence || [];
    this.author = data.author || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
  
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      confidence: this.confidence,
      status: this.status,
      linkedPersons: this.linkedPersons,
      linkedRecords: this.linkedRecords,
      evidence: this.evidence.map(e => ({
        ...e,
        addedAt: e.addedAt.toISOString()
      })),
      author: this.author,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
  
  static fromJSON(data) {
    const hypothesis = new HypothesisModel(data);
    hypothesis.evidence = data.evidence ? data.evidence.map(e => ({
      ...e,
      addedAt: new Date(e.addedAt)
    })) : [];
    hypothesis.createdAt = new Date(data.createdAt);
    hypothesis.updatedAt = new Date(data.updatedAt);
    return hypothesis;
  }
}

class AnomalyModel {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.type = data.type || 'LOGICAL_ERROR';
    this.level = data.level || 'DIRECT';
    this.description = data.description || '';
    this.linkedPersons = data.linkedPersons || [];
    this.linkedRecords = data.linkedRecords || [];
    this.conflictingSources = data.conflictingSources || [];
    this.status = data.status || 'OPEN';
    this.resolution = data.resolution || null;
    this.resolutionConfidence = data.resolutionConfidence || null;
    this.detectedAt = data.detectedAt || new Date();
    this.resolvedAt = data.resolvedAt || null;
  }
  
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      level: this.level,
      description: this.description,
      linkedPersons: this.linkedPersons,
      linkedRecords: this.linkedRecords,
      conflictingSources: this.conflictingSources,
      status: this.status,
      resolution: this.resolution,
      resolutionConfidence: this.resolutionConfidence,
      detectedAt: this.detectedAt.toISOString(),
      resolvedAt: this.resolvedAt ? this.resolvedAt.toISOString() : null
    };
  }
  
  static fromJSON(data) {
    const anomaly = new AnomalyModel(data);
    anomaly.detectedAt = new Date(data.detectedAt);
    anomaly.resolvedAt = data.resolvedAt ? new Date(data.resolvedAt) : null;
    return anomaly;
  }
}

// ============================================================================
// NOWE KLASY ACTACOM 1.0 - ROZSZERZONE MODELE
// ============================================================================

/**
 * TranscriptionModel - Metadane transkrypcji
 * Śledzi kto, kiedy i jak transkrybował tekst źródłowy
 */
class TranscriptionModel {
  constructor() {
    this.author = ''; // USER ID lub tekst
    this.date = new Date();
    this.difficulties = ''; // trudności interpretacyjne
    this.alternativeReadings = []; // {text: '', conf: ConfidenceLevels}
    this.verification = { verified: false, verifier: '', date: null };
    this.toolsUsed = []; // np. 'Tesseract', 'AI'
    this.confidence = ConfidenceLevels.WYSOKI;
  }

  toJSON() {
    return {
      author: this.author,
      date: this.date.toISOString(),
      difficulties: this.difficulties,
      alternativeReadings: this.alternativeReadings,
      verification: this.verification,
      toolsUsed: this.toolsUsed,
      confidence: this.confidence
    };
  }

  static fromJSON(data) {
    const obj = new TranscriptionModel();
    obj.author = data.author;
    obj.date = new Date(data.date);
    obj.difficulties = data.difficulties;
    obj.alternativeReadings = data.alternativeReadings || [];
    obj.verification = data.verification || { verified: false, verifier: '', date: null };
    obj.toolsUsed = data.toolsUsed || [];
    obj.confidence = data.confidence;
    return obj;
  }
}

/**
 * DnaDataModel - Rozszerzone dane genetyczne
 * Obsługuje różne typy testów DNA i matches
 */
class DnaDataModel {
  constructor() {
    this.testId = '';
    this.type = 'YDNA'; // YDNA, MTDNA, AUTOSOMAL
    this.haplogroup = '';
    this.testDate = new HistoricalDate();
    this.sourceMaterial = ''; // np. ślina żyjącej osoby
    this.platform = ''; // np. FTDNA, Ancestry
    this.matches = []; // jak wcześniej w PersonModel
    this.specialMarkers = [];
  }

  toJSON() {
    return {
      testId: this.testId,
      type: this.type,
      haplogroup: this.haplogroup,
      testDate: this.testDate.toJSON(),
      sourceMaterial: this.sourceMaterial,
      platform: this.platform,
      matches: this.matches,
      specialMarkers: this.specialMarkers
    };
  }

  static fromJSON(data) {
    const obj = new DnaDataModel();
    obj.testId = data.testId;
    obj.type = data.type;
    obj.haplogroup = data.haplogroup;
    obj.testDate = HistoricalDate.fromJSON(data.testDate);
    obj.sourceMaterial = data.sourceMaterial;
    obj.platform = data.platform;
    obj.matches = data.matches || [];
    obj.specialMarkers = data.specialMarkers || [];
    return obj;
  }
}

// ============================================================================
// ROZSZERZENIE ISTNIEJĄCYCH KLAS ACTACOM 1.0
// ============================================================================

// Rozszerz EventModel o szczegóły zgonu
EventModel.prototype.addDeathDetails = function(specificCause, mainCategory, modernEquivalent, epidemicInfo, ageAtDeath, confidence = ConfidenceLevels.WYSOKI) {
  if (this.type !== EventTypes.ZGON && this.type !== 'zgon') return this;
  
  this.deathDetails = {
    specificCause: specificCause,
    mainCategory: mainCategory,
    modernEquivalent: modernEquivalent,
    epidemicInfo: epidemicInfo,
    ageAtDeath: ageAtDeath,
    confidence: confidence
  };
  return this;
};

// Rozszerz PersonModel o testy DNA
PersonModel.prototype.addDnaTest = function(testId, type, haplogroup, testDate, platform) {
  if (!this.dnaTests) this.dnaTests = [];
  
  const dnaTest = new DnaDataModel();
  dnaTest.testId = testId;
  dnaTest.type = type;
  dnaTest.haplogroup = haplogroup;
  dnaTest.testDate = testDate instanceof HistoricalDate ? testDate : new HistoricalDate(testDate);
  dnaTest.platform = platform;
  
  this.dnaTests.push(dnaTest);
  return this;
};

// Rozszerz PersonDatabase o anomalie
PersonDatabase.prototype.addAnomaly = function(anomaly) {
  if (!this.anomalies) this.anomalies = new Map();
  this.anomalies.set(anomaly.id, anomaly);
  return anomaly;
};

PersonDatabase.prototype.getAnomaliesByType = function(type) {
  if (!this.anomalies) return [];
  return Array.from(this.anomalies.values()).filter(a => a.type === type);
};

PersonDatabase.prototype.getAnomaliesByPerson = function(personId) {
  if (!this.anomalies) return [];
  return Array.from(this.anomalies.values()).filter(a => a.linkedPersonIds.includes(personId));
};

// ============================================================================
// PRZYKŁADY ZASTOSOWANIA ACTA v3 - NOWE FUNKCJE
// ============================================================================

/*
// **PRZYKŁAD 1: Osoba z danymi DNA i migracją (inspirowane GEDCOM 7.0 + DNA)**
const ivan = new ACTA.PersonModel('Ivan', 'Petrov');
ivan.patronymic = 'Ivanovich'; // Otczestwo dla kultur słowiańskich
ivan.addMigration(
  new ACTA.HistoricalPlace('Rosja', 'country'),
  new ACTA.HistoricalPlace('Polska', 'country'),
  new ACTA.HistoricalDate('1917-01-01'),
  'rewolucja bolszewicka',
  'Akt emigracyjny nr 123'
);
ivan.addDnaTest('Y-DNA', ['DYS393:13', 'DYS390:24'], 'R1a', 'Test DNA 2023');
ivan.aiGenerated = false; // Dane z rzeczywistych źródeł
ivan.probabilityScores.parentMatch = 0.95; // Wysoka pewność

// **PRZYKŁAD 2: Persystencja rodzinna (z postów X o dziedzicznych wzorcach)**
const smith = new ACTA.PersonModel('John', 'Smith');
smith.setInheritedOccupation('kowal', 'father'); // Dziedziczny zawód
smith.familyPatterns.migrationPatterns = ['Europa → Ameryka']; // Wzorce migracyjne rodziny
smith.addMedicalCondition('gruźlica', new ACTA.HistoricalDate('1850'), 'Akt zgonu ojca');

// **PRZYKŁAD 3: Timeline i conflict resolution (z X [post:20] o timelines)**
const person = new ACTA.PersonModel('Anna', 'Kowalska');
person.buildTimeline(); // Automatyczna budowa chronologii
// Sprawdzenie konfliktów: np. zgon przed urodzeniem
if (person.conflicts.length > 0) {
  person.resolveConflict('timeline', 'Poprawiono datę urodzenia', 'Źródło priorytetowe');
}

// **PRZYKŁAD 4: Eksport do GEDCOM z rozszerzeniami ACTA v3**
const gedcomOutput = person.toGEDCOM();
// Wynik zawiera standard GEDCOM + rozszerzenia:
// 0 @I123@ INDI
// 1 NAME Anna /Kowalska/
// 1 _PATRN (jeśli patronymic)
// 1 _DNA (dane genetyczne)
// 1 _MIGR (migracje)
// 1 _AI Y (flaga AI)

// **PRZYKŁAD 5: Historia zawodowa i persistencja rodzinna (z X [post:24])**
const blacksmith = new ACTA.PersonModel('Jan', 'Kowalewski');
blacksmith.addOccupationHistory('kowal', new ACTA.HistoricalDate('1820'), new ACTA.HistoricalDate('1860'), 'father', 90);
blacksmith.addOccupationHistory('emeryt', new ACTA.HistoricalDate('1860'), null, null, 100);
blacksmith.setInheritedOccupation('kowal', 'father'); // Dziedziczne
const persistenceWarnings = blacksmith.checkFamilyPersistence(); // Sprawdza zgodność

// **PRZYKŁAD 6: Alternatywne nazwy z rozszerzonymi typami (z X [post:13])**
const spy = new ACTA.PersonModel('Jan', 'Tajemniczy');
spy.addAlternativeName('Hans', 'Schmidt', 'pseudonym', {from: new ACTA.HistoricalDate('1939'), to: new ACTA.HistoricalDate('1945')}, 'akta wywiadowcze');
spy.addAlternativeName('kapitan', null, 'military_alias', {from: new ACTA.HistoricalDate('1940'), to: new ACTA.HistoricalDate('1945')}, 'akta wojskowe');
spy.addAlternativeName('Jan', 'Nowak', 'adoption_name', {from: new ACTA.HistoricalDate('1920')}, 'akt adopcji');

// **PRZYKŁAD 7: Rozszerzone dane społeczne (narodowość, wykształcenie, status)**
const immigrant = new ACTA.PersonModel('Maria', 'Wójcik');
immigrant.nationality = 'polska';
immigrant.citizenship = 'rosyjskie'; // Przed 1918
immigrant.education = 'średnie';
immigrant.socialStatus = 'mieszczaństwo';
immigrant.religion = 'katolickie';

// **PRZYKŁAD 8: AI-wspomagana genealogia z probability scores (z web results o ChatGPT)**
const aiPerson = new ACTA.PersonModel('Anna', 'AI-generowana');
aiPerson.aiGenerated = true;
aiPerson.probabilityScores = {
  parentMatch: 0.87,
  nameMatch: 0.92,
  locationMatch: 0.78,
  timelineConsistency: 0.95
};
// Ostrzeżenie: dane mogą wymagać weryfikacji
*/

// ============================================================================
// PRZYKŁADY UŻYCIA ACTACOM 1.0 - NOWE FUNKCJE ROZSZERZONE
// ============================================================================

/*
// **PRZYKŁAD ACTACOM 1.0: System Hipotez Genealogicznych**
const uncertainPerson = new ACTA.PersonModel('Jan', 'Niepewny');
uncertainPerson.setHypothesis(true, 30, 'Przypuszczalna tożsamość na podstawie nazwiska', 'DEDUCED', 'TH1');
// Teraz person.hypothesis.isHypo = true, conf = 30

// **PRZYKŁAD ACTACOM 1.0: Oznaczanie Luk Genealogicznych**
const gap = new ACTA.GapModel();
gap.id = 'GAP001';
gap.type = 'MISSING_GENERATION';
gap.dateRange = { from: new ACTA.HistoricalDate('1800'), to: new ACTA.HistoricalDate('1850') };
gap.reason = 'Brak aktów metrykalnych z okresu wojen napoleońskich';
gap.priority = 'HIGH';
app.database.addGap(gap);

// **PRZYKŁAD ACTACOM 1.0: System Różnych Teorii**
const theory1 = new ACTA.TheoryModel();
theory1.id = 'TH1';
theory1.name = 'Teoria migracji z Niemiec';
theory1.just = 'Podobieństwo nazwisk i dat';
theory1.conf = 75;
theory1.personIds = ['P001', 'P002'];
theory1.addRelTheory('TH2', 'contradicts'); // Sprzeczna z TH2
app.database.addTheory(theory1);

// **PRZYKŁAD ACTACOM 1.0: Weryfikacja Wieku**
const person = new ACTA.PersonModel('Anna', 'Kowalska');
person.birthDate = new ACTA.HistoricalDate('1850-01-01');
person.deathDate = new ACTA.HistoricalDate('1930-01-01');
person.verifyAge(); // Sprawdza wiek, ustawia flagi
console.log(person.ageAnalysis.flag); // 'OK' lub 'QUESTIONABLE'

// **PRZYKŁAD ACTACOM 1.0: Śledzenie Zmian w Danych**
person.logChange('occupation', 'chłop', 'robotnik', 'Nowe źródło archiwalne', 'SRC001');
person.logResearch('searched_archives', 'Znaleziono akta fabryczne', 'ARCH001');

// **PRZYKŁAD ACTACOM 1.0: Rozszerzone Źródła**
const source = new ACTA.SourceModel();
source.id = 'SRC001';
source.type = 'CHURCH_REGISTER';
source.subtype = 'BAPTISM';
source.qual = 'PRIMARY';
source.cond = 'GOOD';
source.digit = true;
source.digitQual = 'HIGH';
app.database.addSource(source);

// **PRZYKŁAD ACTACOM 1.0: Wykrywanie Wzorców**
const pattern = new ACTA.PatternModel();
pattern.id = 'PAT001';
pattern.type = 'NAME_PATTERN';
pattern.desc = 'Nazwiska kończące się na -ski w tej linii';
pattern.personIds = ['P001', 'P002', 'P003'];
pattern.conf = 90;
app.database.addPattern(pattern);

// **PRZYKŁAD ACTACOM 1.0: Integracja z DNA (rozszerzona)**
person.addDnaMatch('John Smith', 'R1a', 0.85, 95, 'P_COMMON_001', 'HIGH');

// **PRZYKŁAD ACTACOM 1.0: Odniesienia do Kontekstu Historycznego**
const histEvent = new ACTA.HistEventModel();
histEvent.id = 'HE001';
histEvent.name = 'Powstanie Styczniowe';
histEvent.date = new ACTA.HistoricalDate('1863');
histEvent.desc = 'Powstanie przeciwko Imperium Rosyjskiemu';
histEvent.impact = 'Duże straty wśród młodzieży, migracje';
histEvent.addPerson('P001', 'uczestnik');
app.database.addHistEvent(histEvent);

// **PRZYKŁAD ACTACOM 1.0: Eksport do ACTACOM/GEDCOM**
const actacomString = person.toACTACOM(); // Nowa metoda eksportu
console.log(actacomString);
// Wynik zawiera rozszerzenia ACTACOM:
// 0 @I123@ INDI
// 1 NAME Jan /Niepewny/
// 1 HYPO Y
// 1 CONF 30
// 1 JUST Przypuszczalna tożsamość...
// 1 _DNA_MATCH John Smith
// 1 _GAP_REF @GAP001@
// 1 _THEORY_REF @TH1@
*/

// ============================================================================
// NOWE KLASY ACTA v3.2 - ACTACOM 1.0 INSPIRED EXTENSIONS
// ============================================================================

/**
 * GapModel - Oznaczanie luk genealogicznych
 * Umożliwia planowanie badań nad brakującymi danymi
 */
class GapModel {
  constructor() {
    this.id = null; // Unikalne ID luki
    this.type = ''; // MISSING_GENERATION, MISSING_SIBLING, MISSING_SPOUSE, MISSING_CHILD, MISSING_PLACE, MISSING_DATE, MISSING_EVENT, MISSING_SOURCE
    this.dateRange = { from: null, to: null }; // HistoricalDate - zakres czasowy luki
    this.placeId = null; // Ref do HistoricalPlace
    this.persBeforeId = null; // Person ID przed luką
    this.persAfterId = null; // Person ID po luce
    this.reason = ''; // REASON - powód luki
    this.implic = ''; // IMPLIC - implikacje luki
    this.priority = 'HIGH'; // PRIORITY (HIGH/MEDIUM/LOW)
    this.sources = []; // Źródła potwierdzające istnienie luki
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      dateRange: {
        from: this.dateRange.from ? this.dateRange.from.toJSON() : null,
        to: this.dateRange.to ? this.dateRange.to.toJSON() : null
      },
      placeId: this.placeId,
      persBeforeId: this.persBeforeId,
      persAfterId: this.persAfterId,
      reason: this.reason,
      implic: this.implic,
      priority: this.priority,
      sources: this.sources
    };
  }

  static fromJSON(data) {
    const gap = new GapModel();
    gap.id = data.id;
    gap.type = data.type;
    gap.dateRange = {
      from: data.dateRange.from ? HistoricalDate.fromJSON(data.dateRange.from) : null,
      to: data.dateRange.to ? HistoricalDate.fromJSON(data.dateRange.to) : null
    };
    gap.placeId = data.placeId;
    gap.persBeforeId = data.persBeforeId;
    gap.persAfterId = data.persAfterId;
    gap.reason = data.reason;
    gap.implic = data.implic;
    gap.priority = data.priority;
    gap.sources = data.sources || [];
    return gap;
  }
}

/**
 * TheoryModel - System różnych teorii genealogicznych
 * Zarządza alternatywnymi hipotezami badawczymi
 */
class TheoryModel {
  constructor() {
    this.id = null; // @TH1@ - unikalne ID teorii
    this.name = ''; // NAME - nazwa teorii
    this.authId = null; // AUTH - ID autora teorii
    this.date = new HistoricalDate(); // DATE - data utworzenia teorii
    this.just = ''; // JUST - uzasadnienie teorii
    this.conf = 100; // CONF - stopień pewności teorii (0-100)
    this.oppoId = null; // OPPO - ID konkurencyjnej teorii
    this.relTheory = {}; // {theoryId: 'contradicts|supports|extends|refines'} - relacje z innymi teoriami
    this.personIds = []; // PERS - osoby związane z teorią
    this.relaIds = []; // RELA - relacje związane z teorią
    this.sources = []; // Źródła wspierające teorię
    this.notes = ''; // Dodatkowe notatki
  }

  // Dodaj relację do innej teorii
  addRelTheory(otherTheoryId, relationType) {
    // relationType: 'contradicts', 'supports', 'extends', 'refines'
    this.relTheory[otherTheoryId] = relationType;
    return this;
  }

  // Sprawdź czy teoria jest sprzeczna z inną
  contradicts(otherTheoryId) {
    return this.relTheory[otherTheoryId] === 'contradicts';
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      authId: this.authId,
      date: this.date.toJSON(),
      just: this.just,
      conf: this.conf,
      oppoId: this.oppoId,
      relTheory: this.relTheory,
      personIds: this.personIds,
      relaIds: this.relaIds,
      sources: this.sources,
      notes: this.notes
    };
  }

  static fromJSON(data) {
    const theory = new TheoryModel();
    theory.id = data.id;
    theory.name = data.name;
    theory.authId = data.authId;
    theory.date = HistoricalDate.fromJSON(data.date);
    theory.just = data.just;
    theory.conf = data.conf;
    theory.oppoId = data.oppoId;
    theory.relTheory = data.relTheory || {};
    theory.personIds = data.personIds || [];
    theory.relaIds = data.relaIds || [];
    theory.sources = data.sources || [];
    theory.notes = data.notes;
    return theory;
  }
}

/**
 * PatternModel - Wykrywanie powtarzających się wzorców
 * Analiza AI-podobna dla genealogicznych regularności
 */
class PatternModel {
  constructor() {
    this.id = null; // Unikalne ID wzorca
    this.type = ''; // NAME_PATTERN, DATE_PATTERN, PLACE_PATTERN, RELATIONSHIP_PATTERN
    this.desc = ''; // DESC - opis wzorca
    this.personIds = []; // PERS - osoby wykazujące wzorzec
    this.conf = 100; // CONF - pewność wzorca (0-100)
    this.exceptions = []; // {id, note} - wyjątki od wzorca
  }

  // Dodaj osobę do wzorca
  addPerson(personId) {
    if (!this.personIds.includes(personId)) {
      this.personIds.push(personId);
    }
    return this;
  }

  // Dodaj wyjątek
  addException(personId, note) {
    this.exceptions.push({ id: personId, note });
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      desc: this.desc,
      personIds: this.personIds,
      conf: this.conf,
      exceptions: this.exceptions
    };
  }

  static fromJSON(data) {
    const pattern = new PatternModel();
    pattern.id = data.id;
    pattern.type = data.type;
    pattern.desc = data.desc;
    pattern.personIds = data.personIds || [];
    pattern.conf = data.conf;
    pattern.exceptions = data.exceptions || [];
    return pattern;
  }
}

/**
 * HistEventModel - Odniesienia do kontekstu historycznego
 * Łączy genealogię z wydarzeniami historycznymi
 */
class HistEventModel {
  constructor() {
    this.id = null; // Unikalne ID wydarzenia historycznego
    this.name = ''; // NAME - nazwa wydarzenia
    this.date = new HistoricalDate(); // DATE - data wydarzenia
    this.placeId = null; // PLAC - miejsce wydarzenia
    this.desc = ''; // DESC - opis wydarzenia
    this.impact = ''; // IMPACT - wpływ na populację/region
    this.personIds = []; // PERS_INV - osoby zaangażowane
    this.roles = {}; // {personId: 'rola'} - role osób w wydarzeniu
    this.sources = []; // Źródła historyczne
  }

  // Dodaj osobę zaangażowaną w wydarzenie
  addPerson(personId, role = '') {
    if (!this.personIds.includes(personId)) {
      this.personIds.push(personId);
      this.roles[personId] = role;
    }
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      date: this.date.toJSON(),
      placeId: this.placeId,
      desc: this.desc,
      impact: this.impact,
      personIds: this.personIds,
      roles: this.roles,
      sources: this.sources
    };
  }

  static fromJSON(data) {
    const event = new HistEventModel();
    event.id = data.id;
    event.name = data.name;
    event.date = HistoricalDate.fromJSON(data.date);
    event.placeId = data.placeId;
    event.desc = data.desc;
    event.impact = data.impact;
    event.personIds = data.personIds || [];
    event.roles = data.roles || {};
    event.sources = data.sources || [];
    return event;
  }
}

/**
 * SourceModel - Rozszerzone kategorie źródeł i wiarygodności
 * Szczegółowa klasyfikacja źródeł genealogicznych
 */
class SourceModel {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.type = data.type || SourceTypes.KSIEGA_PARAFIALNA;
    this.title = data.title || '';
    this.repository = data.repository || null; // ref do RepositoryModel lub string
    this.creationDate = data.creationDate || null; // HistoricalDate
    this.page = data.page || '';
    this.originalText = data.originalText || '';
    this.translations = data.translations || [];
    this.reliability = data.reliability || ConfidenceLevels.WYSOKI;
    this.digitalization = data.digitalization || { exists: false, ref: '', quality: '' };
    this.transcription = data.transcription || null; // TranscriptionModel
    
    // Kompatybilność wsteczna
    this.subtype = data.subtype || '';
    this.qual = data.qual || 'PRIMARY';
    this.cond = data.cond || 'GOOD';
    this.acc = data.acc || 'MEDIUM';
    this.avail = data.avail || 'ARCHIVE';
    this.loc = data.loc || '';
    this.digit = data.digit || false;
    this.digitQual = data.digitQual || '';
    this.digitRef = data.digitRef || '';
    this.transcr = data.transcr || false;
    this.transcrAuthId = data.transcrAuthId || null;
    this.transcrDate = data.transcrDate || null;
    
    // Firestore: podkolekcje
    this.images = data.images || []; // [{imageId, path, pageNumber, thumbnailPath, description}]
    this.provenance = data.provenance || []; // [{date, userId, action, confidence, notes}]
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      subtype: this.subtype,
      qual: this.qual,
      cond: this.cond,
      acc: this.acc,
      avail: this.avail,
      loc: this.loc,
      digit: this.digit,
      digitQual: this.digitQual,
      digitRef: this.digitRef,
      transcr: this.transcr,
      transcrAuthId: this.transcrAuthId,
      transcrDate: this.transcrDate,
      
      // Firestore: podkolekcje
      images: this.images,
      provenance: this.provenance.map(p => ({
        ...p,
        date: p.date.toISOString()
      }))
    };
  }

  static fromJSON(data) {
    const source = new SourceModel();
    source.id = data.id;
    source.type = data.type;
    source.subtype = data.subtype;
    source.qual = data.qual;
    source.cond = data.cond;
    source.acc = data.acc;
    source.avail = data.avail;
    source.loc = data.loc;
    source.digit = data.digit;
    source.digitQual = data.digitQual;
    source.digitRef = data.digitRef;
    source.transcr = data.transcr;
    source.transcrAuthId = data.transcrAuthId;
    source.transcrDate = data.transcrDate;
    
    // Firestore: podkolekcje
    source.images = data.images || [];
    source.provenance = data.provenance ? data.provenance.map(p => ({
      ...p,
      date: new Date(p.date)
    })) : [];
    
    return source;
  }

  // Firestore: metody dla podkolekcji
  addImage(path, pageNumber, thumbnailPath = '', description = '') {
    const imageId = crypto.randomUUID();
    this.images.push({
      imageId: imageId,
      path: path,
      pageNumber: pageNumber,
      thumbnailPath: thumbnailPath,
      description: description
    });
    return this;
  }

  addProvenance(date, userId, action, confidence = 100, notes = '') {
    this.provenance.push({
      date: date || new Date(),
      userId: userId,
      action: action,
      confidence: confidence,
      notes: notes
    });
    return this;
  }
}

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

const Nationalities = {
  POLISH: 'polska',
  GERMAN: 'niemiecka',
  RUSSIAN: 'rosyjska',
  UKRAINIAN: 'ukraińska',
  BELARUSIAN: 'białoruska',
  LITHUANIAN: 'litewska',
  JEWISH: 'żydowska',
  OTHER: 'inna'
};

const Citizenships = {
  POLISH: 'polskie',
  GERMAN: 'niemieckie',
  RUSSIAN: 'rosyjskie',
  AUSTRIAN: 'austriackie',
  PRUSSIAN: 'pruskie',
  OTHER: 'inne'
};

const EducationLevels = {
  NONE: 'brak',
  BASIC: 'podstawowe',
  SECONDARY: 'średnie',
  HIGHER: 'wyższe',
  UNIVERSITY: 'uniwersyteckie'
};

const SocialStatuses = {
  NOBILITY: 'szlachta',
  CLERGY: 'duchowieństwo',
  BURGHER: 'mieszczaństwo',
  PEASANT: 'chłopi',
  WORKER: 'robotnicy',
  MERCHANT: 'kupcy',
  OFFICIAL: 'urzędnicy',
  MILITARY: 'wojsko'
};

// ============================================================================
// EXPORT (dla CommonJS / ES6)
// ============================================================================

module.exports = {
  HistoricalDate,
  HistoricalPlace,
  PersonModel,
  RelationshipModel,
  EventModel,
  PersonDatabase,
  SourceModel,
  TranscriptionModel,
  HypothesisModel,
  AnomalyModel,
  
  // **NOWE ACTACOM 1.0: Enumy**
  EventTypes,
  RoleTypes,
  SourceTypes,
  DeathCategories,
  RelationTypes,
  RecordTypes
};

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
    
    // **NOWE ACTACOM 1.0: Klasy rozszerzone**
    GapModel,
    TheoryModel,
    PatternModel,
    HistEventModel,
    TranscriptionModel,
    HypothesisModel,
    AnomalyModel,
    
    // **NOWE ACTACOM 1.0: Enumy**
    EventTypes,
    RoleTypes,
    SourceTypes,
    DeathCategories,
    RelationTypes,
    RecordTypes,
    
    // **STARE enumy (zachowane dla kompatybilności)**
    Occupations,
    Diseases,
    CivilStatus,
    Nationalities,
    Citizenships,
    EducationLevels,
    SocialStatuses
  };
}
