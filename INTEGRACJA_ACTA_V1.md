# Integracja ACTA v1 z viewer-osd-v8.html - Przewodnik Implementacji

**Data**: 4 stycznia 2026  
**Status**: Instrukcje do wdrożenia  
**Typ**: Refaktoryzacja struktury danych i funkcji

---

## 📋 Spis treści

1. [Kroki przygotowawcze](#kroki-przygotowawcze)
2. [Zmiana struktury app](#zmiana-struktury-app)
3. [Refaktoryzacja funkcji kluczowych](#refaktoryzacja-funkcji-kluczowych)
4. [Integracja formularzy](#integracja-formularzy)
5. [Aktualizacja tabelki](#aktualizacja-tabelki)
6. [Zapisywanie i ładowanie](#zapisywanie-i-ładowanie)
7. [Testing i debugging](#testing-i-debugging)

---

## 🚀 Kroki przygotowawcze

### 1. Dodaj plik modeli do HTML

W sekcji `<head>` pliku `viewer-osd-v8.html`, **przed** zamykającym `</head>`, dodaj:

```html
<!-- ACTA v1 - Model danych genealogicznych -->
<script src="acta-v1-models.js"></script>
```

Upewnij się, że plik `acta-v1-models.js` jest w tym samym katalogu co `viewer-osd-v8.html`.

### 2. Inicjalizuj bazę danych w `initApp()`

W funkcji `initApp()` (linia ~1623), dodaj na początku:

```javascript
function initApp() {
    // ✅ NOWE: Inicjalizuj bazę danych ACTA v1
    app.personDb = new ACTA.PersonDatabase();
    
    // ✅ NOWE: Zamień app.imageActs na mapę EventModel zamiast zwykłych obiektów
    app.imageActs = new Map(); // ID -> EventModel
    
    // Reszta istniejącego kodu...
    loadStorage();
    // ...
}
```

---

## 🔧 Zmiana struktury `app`

### Stara struktura (viewer-osd-v7):
```javascript
app.imageActs = [
  {
    id: 'chrzest.1890.01',
    type: 'chrzest',
    fieldValues: {
      child_first_name: 'Jan',
      child_last_name: 'Kowalski',
      father_first_name: 'Stanisław',
      // ... płaskie pole
    },
    rois: {...}
  }
];
```

### Nowa struktura (ACTA v1):
```javascript
app.imageActs = new Map([
  ['CH.1890.No.01', EventModel {
    id: 'CH.1890.No.01',
    type: 'chrzest',
    roles: [
      PersonRoleModel { roleType: 'dziecko', person: PersonModel {...} },
      PersonRoleModel { roleType: 'ojciec', person: PersonModel {...} },
      PersonRoleModel { roleType: 'matka', person: PersonModel {...} }
    ],
    relationships: [
      RelationshipModel { type: 'rodzic-dziecko', person1: ..., person2: ... }
    ]
  }]
]);
```

---

## 📝 Refaktoryzacja funkcji kluczowych

### 1. `addNewActFromModal()` - Tworzenie nowego aktu

**ZMIANA: Zamiast prostego obiektu, twórz EventModel**

```javascript
function addNewActFromModal() {
  const type = document.getElementById('modalType').value.toLowerCase();
  const year = parseInt(document.getElementById('modalYear').value);
  const firstNr = parseInt(document.getElementById('modalFirstNr').value);
  const count = parseInt(document.getElementById('modalCount').value);

  // Mapowanie dla ID - typ skrót
  const typeMap = {
    'chrzest': 'CH',
    'urodzenie': 'UR',
    'małżeństwo': 'MA',
    'zgon': 'ZG'
  };

  for (let i = 0; i < count; i++) {
    const nr = firstNr + i;
    
    // ✅ NOWE: Utwórz EventModel
    const event = new ACTA.EventModel(type, year, nr);
    
    // ✅ NOWE: Dodaj domyślne role dla typu aktu
    initializeEventRoles(event, type);
    
    // Dodaj do mapy (zmiast array.push)
    app.imageActs.set(event.id, event);
    
    // Dodaj do bazy danych osób
    event.roles.forEach(role => {
      if (role.person && role.person instanceof ACTA.PersonModel) {
        app.personDb.addPerson(role.person);
      }
    });
  }

  saveStorage();
  renderActButtons();
  renderRecordsTable();
  closeModal();
}

// ✅ NOWA FUNKCJA: Inicjalizuj domyślne role
function initializeEventRoles(event, type) {
  if (type === 'chrzest') {
    const child = new ACTA.PersonModel();
    const father = new ACTA.PersonModel();
    const mother = new ACTA.PersonModel();
    
    event.addPersonWithRole(child, ACTA.RoleTypes.CHILD);
    event.addPersonWithRole(father, ACTA.RoleTypes.FATHER);
    event.addPersonWithRole(mother, ACTA.RoleTypes.MOTHER);
    
    // Dodaj relacje rodzinne
    event.addRelationship(father, child, ACTA.RelationshipTypes.PARENT_CHILD);
    event.addRelationship(mother, child, ACTA.RelationshipTypes.PARENT_CHILD);
  }
  
  if (type === 'małżeństwo') {
    const groom = new ACTA.PersonModel();
    const bride = new ACTA.PersonModel();
    
    event.addPersonWithRole(groom, 'pan_młody');
    event.addPersonWithRole(bride, 'panna_młoda');
    
    event.addRelationship(groom, bride, ACTA.RelationshipTypes.MARRIAGE);
  }
  
  if (type === 'zgon') {
    const deceased = new ACTA.PersonModel();
    
    event.addPersonWithRole(deceased, 'zmarły');
  }
  
  if (type === 'urodzenie') {
    const child = new ACTA.PersonModel();
    const father = new ACTA.PersonModel();
    const mother = new ACTA.PersonModel();
    
    event.addPersonWithRole(child, ACTA.RoleTypes.CHILD);
    event.addPersonWithRole(father, ACTA.RoleTypes.FATHER);
    event.addPersonWithRole(mother, ACTA.RoleTypes.MOTHER);
    
    event.addRelationship(father, child, ACTA.RelationshipTypes.PARENT_CHILD);
    event.addRelationship(mother, child, ACTA.RelationshipTypes.PARENT_CHILD);
  }
}
```

### 2. `selectAct(actNum)` - Załaduj akt do formularza

**ZMIANA: Z tablicy na mapę, dostęp przez ID**

```javascript
// STARA WERSJA:
function selectAct(actNum) {
  app.currentActIndex = actNum;
  const act = app.imageActs[actNum];
  loadActToForm(act);
  renderActButtons();
}

// ✅ NOWA WERSJA:
function selectAct(eventId) {
  // eventId to np. 'CH.1890.No.01'
  const event = app.imageActs.get(eventId);
  
  if (!event) {
    console.error(`Event not found: ${eventId}`);
    return;
  }
  
  app.currentEventId = eventId; // Zamiast app.currentActIndex
  loadActToForm(event);
  renderActButtons();
}
```

### 3. `loadActToForm(event)` - Pobierz dane aktu do formularza

**ZMIANA: Czytaj z PersonModel zamiast fieldValues**

```javascript
// ✅ NOWA WERSJA:
function loadActToForm(event) {
  if (!event || !(event instanceof ACTA.EventModel)) {
    clearForm();
    return;
  }

  clearForm();
  
  const form = document.getElementById('form-' + event.type);
  if (!form) return;

  // Wypełnij pola na podstawie roli w akcie
  
  // Dla chrztu:
  if (event.type === 'chrzest') {
    const childRole = event.getChild();
    const fatherRole = event.getFather();
    const motherRole = event.getMother();
    
    if (childRole && childRole.person) {
      form.querySelector('[name="child_first_name"]').value = childRole.person.firstName || '';
      form.querySelector('[name="child_last_name"]').value = childRole.person.lastName || '';
      form.querySelector('[name="child_birth_date"]').value = childRole.person.birthDate.getDisplayString();
      form.querySelector('[name="child_place"]').value = childRole.person.birthPlace.getDisplayString();
      if (childRole.person.gender) {
        form.querySelector(`[value="${childRole.person.gender}"]`).checked = true;
      }
    }
    
    if (fatherRole && fatherRole.person) {
      form.querySelector('[name="father_first_name"]').value = fatherRole.person.firstName || '';
      form.querySelector('[name="father_last_name"]').value = fatherRole.person.lastName || '';
      form.querySelector('[name="father_occupation"]').value = fatherRole.person.occupation || '';
      form.querySelector('[name="father_age"]').value = fatherRole.person.age || '';
    }
    
    if (motherRole && motherRole.person) {
      form.querySelector('[name="mother_first_name"]').value = motherRole.person.firstName || '';
      form.querySelector('[name="mother_maiden_name"]').value = motherRole.person.maidenName || '';
      form.querySelector('[name="mother_occupation"]').value = motherRole.person.occupation || '';
      form.querySelector('[name="mother_age"]').value = motherRole.person.age || '';
    }
  }
  
  // Podobnie dla małżeństwa, zgonu, urodzenia...
  
  // Notatki
  form.querySelector('[name="notes"]').value = event.notes || '';
  form.querySelector('[name="archive_ref"]').value = event.archiveReference || '';
  form.querySelector('[name="page"]').value = event.pageNumber || '';
  
  // Pokaż formę
  const formSection = form.closest('.form-section');
  document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
  formSection.classList.add('active');

  updateProgressBar();
  updateFieldStatus();
  focusFirstField();
}
```

### 4. `saveRecord()` - Zapisz zmiany z formularza

**ZMIANA: Wpisuj do PersonModel zamiast fieldValues**

```javascript
// ✅ NOWA WERSJA:
function saveRecord() {
  if (!app.currentEventId) {
    notify('Nie wybrany akt', 'error');
    return;
  }

  const event = app.imageActs.get(app.currentEventId);
  if (!event) return;

  const form = document.getElementById('form-' + event.type);
  if (!form) return;

  // Dla chrztu:
  if (event.type === 'chrzest') {
    const childRole = event.getChild();
    const fatherRole = event.getFather();
    const motherRole = event.getMother();

    if (childRole && childRole.person) {
      childRole.person.firstName = form.querySelector('[name="child_first_name"]').value;
      childRole.person.lastName = form.querySelector('[name="child_last_name"]').value;
      childRole.person.birthDate.date = new Date(form.querySelector('[name="child_birth_date"]').value);
      childRole.person.birthPlace.name = form.querySelector('[name="child_place"]').value;
      childRole.person.gender = form.querySelector('[name="child_gender"]:checked')?.value || 'UNKNOWN';
    }

    if (fatherRole && fatherRole.person) {
      fatherRole.person.firstName = form.querySelector('[name="father_first_name"]').value;
      fatherRole.person.lastName = form.querySelector('[name="father_last_name"]').value;
      fatherRole.person.occupation = form.querySelector('[name="father_occupation"]').value;
      fatherRole.person.age = parseInt(form.querySelector('[name="father_age"]').value) || null;
    }

    if (motherRole && motherRole.person) {
      motherRole.person.firstName = form.querySelector('[name="mother_first_name"]').value;
      motherRole.person.maidenName = form.querySelector('[name="mother_maiden_name"]').value;
      motherRole.person.occupation = form.querySelector('[name="mother_occupation"]').value;
      motherRole.person.age = parseInt(form.querySelector('[name="mother_age"]').value) || null;
    }
  }

  // Notatki i metadane
  event.notes = form.querySelector('[name="notes"]').value || '';
  event.archiveReference = form.querySelector('[name="archive_ref"]').value || '';
  event.pageNumber = parseInt(form.querySelector('[name="page"]').value) || null;
  event.lastModified = new Date();

  // Zapisz
  saveStorage();
  updateProgressBar();
  updateFieldStatus();
  notify('Akt zapisany', 'success');
}
```

### 5. `redrawROIs()` - Rysuj nakładki z nowymi ID

**ZMIANA: Użyj event.id (np. "CH.1890.No.01") zamiast liczby**

```javascript
// ✅ NOWA WERSJA (fragment):
function redrawROIs() {
  const container = document.querySelector('.viewer-container');
  
  // Usuń stare nakładki
  container.querySelectorAll('.roi-overlay, .act-overlay').forEach(o => o.remove());

  if (!app.currentImageIndex !== undefined && app.imageData[app.currentImageIndex]) {
    const image = app.imageData[app.currentImageIndex];
    
    app.imageActs.forEach((event, eventId) => {
      // Rysuj nakładkę dla całego aktu
      if (event.actROI) {
        const overlay = document.createElement('div');
        overlay.className = 'act-overlay';
        overlay.id = `act-overlay-${eventId}`;
        
        const rect = event.actROI.rect;
        const viewportRect = screenToImageRect(rect.x, rect.y, rect.w, rect.h);
        
        overlay.style.left = viewportRect.x + '%';
        overlay.style.top = viewportRect.y + '%';
        overlay.style.width = viewportRect.w + '%';
        overlay.style.height = viewportRect.h + '%';
        
        // Etykieta z nowymi ID (np. "CH.1890.No.01")
        const label = document.createElement('div');
        label.className = 'roi-label';
        label.textContent = eventId; // Wyświetl ID aktu
        label.style.textDecoration = 'overline'; // Linia nad tekstem
        overlay.appendChild(label);
        
        overlay.onclick = () => selectAct(eventId);
        container.appendChild(overlay);
      }

      // Rysuj nakładki dla pól (jeśli przypisane)
      event.roles.forEach(role => {
        if (role.roiId && event.fieldROIs[role.roiId]) {
          // ... rysuj ROI dla pola
        }
      });
    });
  }
}
```

---

## 📑 Integracja formularzy

### Struktura HTML dla pola z PersonModel

```html
<!-- Formularz chrztu (seria) -->
<div id="form-chrzest" class="form-section">
  <div class="form-header">
    <h3>Formularz Chrztu</h3>
    <span class="record-counter" id="counter-chrzest">0/0</span>
  </div>

  <!-- PRIMARY FIELDS - zawsze widoczne -->
  <div class="form-group">
    <label>Imię dziecka*</label>
    <input type="text" name="child_first_name" data-field="child.firstName" placeholder="Jan, Józef...">
  </div>

  <div class="form-group">
    <label>Nazwisko dziecka</label>
    <input type="text" name="child_last_name" data-field="child.lastName" placeholder="Kowalski">
  </div>

  <div class="form-group">
    <label>Płeć</label>
    <div>
      <input type="radio" name="child_gender" value="MALE" id="male"> <label for="male">Chłopiec</label>
      <input type="radio" name="child_gender" value="FEMALE" id="female"> <label for="female">Dziewczyna</label>
      <input type="radio" name="child_gender" value="UNKNOWN" id="unknown"> <label for="unknown">?</label>
    </div>
  </div>

  <div class="form-group">
    <label>Data urodzenia</label>
    <input type="text" name="child_birth_date" placeholder="15-05-1890" data-field="child.birthDate">
  </div>

  <div class="form-group">
    <label>Imię ojca*</label>
    <input type="text" name="father_first_name" placeholder="Stanisław" data-field="father.firstName">
  </div>

  <div class="form-group">
    <label>Imię matki*</label>
    <input type="text" name="mother_first_name" placeholder="Łucja" data-field="mother.firstName">
  </div>

  <!-- SECONDARY - Ctrl+E -->
  <div id="secondary-chrzest" style="display:none;">
    <h4>Rozszerzone pola (Ctrl+E)</h4>
    
    <div class="form-group">
      <label>Nazwisko ojca</label>
      <input type="text" name="father_last_name" data-field="father.lastName">
    </div>

    <div class="form-group">
      <label>Zawód ojca</label>
      <input type="text" name="father_occupation" data-field="father.occupation">
    </div>

    <div class="form-group">
      <label>Wiek ojca</label>
      <input type="number" name="father_age" data-field="father.age">
    </div>

    <div class="form-group">
      <label>Nazwisko panieńskie matki</label>
      <input type="text" name="mother_maiden_name" data-field="mother.maidenName">
    </div>

    <div class="form-group">
      <label>Zawód matki</label>
      <input type="text" name="mother_occupation" data-field="mother.occupation">
    </div>

    <div class="form-group">
      <label>Wiek matki</label>
      <input type="number" name="mother_age" data-field="mother.age">
    </div>
  </div>

  <!-- ACCORDION - historia -->
  <div class="accordion-item">
    <div class="accordion-header">
      <span>≡ Historia rodziny</span>
    </div>
    <div class="accordion-content">
      <div class="form-group">
        <label>Czy rodzice żonaci?</label>
        <select name="parents_married" data-field="event.tags">
          <option value="">?</option>
          <option value="yes">Tak</option>
          <option value="no">Nie</option>
        </select>
      </div>
      <div class="form-group">
        <label>Czy matka później zmarła? (data)</label>
        <input type="text" name="mother_death_date">
      </div>
      <div class="form-group">
        <label>Czy matka wyszła zamąż ponownie? (rok)</label>
        <input type="number" name="mother_remarriage_year">
      </div>
    </div>
  </div>

  <!-- NOTATKI ORG (zawsze) -->
  <div class="form-group">
    <label>Notatki ORG:</label>
    <textarea name="notes" placeholder="Uwagi z aktu, możliwe bliźnięta..." rows="4"></textarea>
  </div>

  <!-- AKCJE -->
  <div class="form-actions">
    <button onclick="saveRecord()" class="form-btn">Zapisz</button>
    <button onclick="copyPreviousRecord()" class="form-btn">Kopiuj poprzedni</button>
    <button onclick="deleteCurrentRecord()" class="form-btn danger">Usuń</button>
  </div>
</div>
```

---

## 📊 Aktualizacja tabelki

### Nowa funkcja `renderRecordsTable()`

```javascript
function renderRecordsTable() {
  const dataTable = document.getElementById('dataTable');
  if (!dataTable) return;

  dataTable.innerHTML = '';

  // Nagłówek
  const headerRow = dataTable.insertRow();
  const headers = ['Akt', 'Typ', 'Główne osoby', 'Data', 'Miejsce', 'Akcje'];
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });

  // Wiersze dla każdego zdarzenia
  app.imageActs.forEach((event, eventId) => {
    const row = dataTable.insertRow();
    row.id = `row-${eventId}`;
    if (app.currentEventId === eventId) row.classList.add('selected');

    // ID aktu
    row.insertCell().textContent = eventId;

    // Typ
    row.insertCell().textContent = event.type.toUpperCase();

    // Główne osoby
    const personsCell = row.insertCell();
    event.roles.forEach(role => {
      const personName = role.person?.getFullName() || '?';
      const roleEmoji = getEmojiForRole(role.roleType);
      personsCell.innerHTML += `${roleEmoji} ${role.roleType}: <strong>${personName}</strong><br>`;
    });

    // Data
    row.insertCell().textContent = event.date.getDisplayString();

    // Miejsce
    row.insertCell().textContent = event.place.getDisplayString();

    // Akcje
    const actionsCell = row.insertCell();
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️ Edytuj';
    editBtn.className = 'table-action-btn';
    editBtn.onclick = () => selectAct(eventId);
    actionsCell.appendChild(editBtn);
  });
}

function getEmojiForRole(roleType) {
  const emojis = {
    'dziecko': '👶',
    'ojciec': '👨',
    'matka': '👩',
    'pan_młody': '🤵',
    'panna_młoda': '👰',
    'zmarły': '⚰️',
    'świadek': '👁️',
    'chrzestny_ojciec': '⚜️',
    'chrzestna_matka': '✨'
  };
  return emojis[roleType] || '👤';
}
```

---

## 💾 Zapisywanie i ładowanie

### Modyfikacja `saveStorage()`

```javascript
// ✅ NOWA WERSJA:
function saveStorage() {
  try {
    // Konwertuj imageActs (Map) na array do JSON
    const actsArray = Array.from(app.imageActs.values()).map(event => event.toJSON());

    const storageData = {
      version: '1.0-acta',
      imageData: app.imageData.map(img => ({
        url: img.url,
        name: img.name,
        rotation: img.rotation || 0
      })),
      imageActs: actsArray,
      // Dodaj całą bazę osób
      personDb: app.personDb.toJSON(),
      currentImageIndex: app.currentImageIndex || 0,
      currentEventId: app.currentEventId || null
    };

    localStorage.setItem('genealog-indexer-v8', JSON.stringify(storageData));
    console.log('✓ Dane zapisane do LocalStorage');
  } catch (e) {
    console.error('Błąd zapisu:', e);
    notify('Błąd zapisu danych', 'error');
  }
}
```

### Modyfikacja `loadStorage()`

```javascript
// ✅ NOWA WERSJA:
function loadStorage() {
  try {
    const stored = localStorage.getItem('genealog-indexer-v8');
    if (!stored) {
      console.log('Brak danych w LocalStorage');
      return;
    }

    const data = JSON.parse(stored);

    // Załaduj obrazy
    if (data.imageData) {
      app.imageData = data.imageData;
      updateThumbs();
    }

    // Załaduj akty
    if (data.imageActs && Array.isArray(data.imageActs)) {
      app.imageActs.clear(); // Wyczyść mapę
      
      data.imageActs.forEach(eventData => {
        const event = ACTA.EventModel.fromJSON(eventData);
        app.imageActs.set(event.id, event);
      });
    }

    // Załaduj bazę osób
    if (data.personDb) {
      app.personDb = ACTA.PersonDatabase.fromJSON(data.personDb);
    }

    // Przywróć stan
    app.currentImageIndex = data.currentImageIndex || 0;
    app.currentEventId = data.currentEventId || null;

    if (app.currentImageIndex !== undefined) {
      selectImage(app.currentImageIndex);
    }

    renderActButtons();
    renderRecordsTable();
    console.log('✓ Dane załadowane z LocalStorage');
  } catch (e) {
    console.error('Błąd ładowania:', e);
    notify('Błąd ładowania danych', 'error');
  }
}
```

---

## 🧪 Testing i debugging

### Funkcja diagnostyczna

```javascript
function debugACTA() {
  console.log('=== ACTA v1 Debug Info ===');
  console.log('Liczba aktów:', app.imageActs.size);
  console.log('Liczba osób:', app.personDb.persons.size);
  console.log('Liczba relacji:', app.personDb.relationships.size);
  
  console.log('\n--- Akty ---');
  app.imageActs.forEach((event, id) => {
    console.log(`${id}: ${event.type}, role: ${event.roles.length}, rels: ${event.relationships.length}`);
  });

  console.log('\n--- Osoby ---');
  app.personDb.getAllPersons().forEach(person => {
    console.log(`${person.id}: ${person.getFullName()} (${person.gender})`);
  });

  console.log('\n--- Aktualna selekcja ---');
  console.log('Event ID:', app.currentEventId);
  if (app.currentEventId) {
    const event = app.imageActs.get(app.currentEventId);
    console.log('Event:', event);
  }
}

// Wywołaj w konsoli (F12): debugACTA()
```

### Checklist po zmianach:

- [ ] HTML zawiera `<script src="acta-v1-models.js"></script>`
- [ ] `initApp()` zawiera `app.personDb = new ACTA.PersonDatabase()`
- [ ] `app.imageActs` zmienione na `new Map()`
- [ ] `addNewActFromModal()` zwraca `EventModel`
- [ ] `loadActToForm()` czyta z `event.roles[i].person`
- [ ] `saveRecord()` zapisuje do `role.person`
- [ ] `renderRecordsTable()` używa `app.imageActs.forEach()`
- [ ] `saveStorage()` konwertuje Map -> array
- [ ] `loadStorage()` tworzy `EventModel` z JSON
- [ ] Formularze mają pola dla wszystkich roli
- [ ] Test: dodaj akt, wypełnij formularz, zapisz, przeładuj stronę

---

## 🎯 Następne kroki

1. **Implementacja etapowa**: Zamiast zmienić cały kod naraz, rób sekcję po sekcji (formularze, tabela, zapis)
2. **Backward compatibility**: Jeśli masz stare dane, napisz migrator z v7 do v1
3. **Relacje między aktami**: Funkcja do linkowania aktów (np. chrzest -> małżeństwo -> zgon)
4. **Export do GEDCOM**: Możliwość eksportu do standardu genealogii

---

**Status**: Gotowe do wdrożenia  
**Następny etap**: Implementacja zmian w `viewer-osd-v8.html` sekcja po sekcji
