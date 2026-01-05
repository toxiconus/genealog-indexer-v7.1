# ACTA v1 Integration - Kroki zmian dla viewer-osd-v8.html

## ✅ Zrobione:
1. ✅ Tytuł HTML zmieniony na "v8 - ACTA v1 Integration"

## 🔄 Do zrobienia (w kolejności):

### Krok 2: Inicjalizacja w initApp() [LINIA ~1200]
```javascript
// ✅ NOWE: Inicjalizuj bazę danych ACTA v1
app.personDb = new ACTA.PersonDatabase();

// ✅ NOWE: Zmień app.imageActs na mapę
app.imageActs = new Map(); // ID -> EventModel
```

### Krok 3: Funkcja getCurrentAct() [LINIA ~2800]
```javascript
function getCurrentAct() {
    if (!app.currentEventId) return null;
    return app.imageActs.get(app.currentEventId);
}
```

### Krok 4: Funkcja selectAct(eventId) [LINIA ~2850]
```javascript
function selectAct(eventId) {
    const event = app.imageActs.get(eventId);
    if (!event) return;
    app.currentEventId = eventId;
    loadActToForm(event);
    renderActButtons();
    renderRecordsTable();
}
```

### Krok 5: Funkcja renderActButtons() [LINIA ~3200]
```javascript
function renderActButtons() {
    const actsPanel = document.getElementById('actsPanel');
    if (!actsPanel) return;
    actsPanel.innerHTML = '';
    
    app.imageActs.forEach((event, id) => {
        const btn = document.createElement('button');
        btn.className = 'act-button';
        if (app.currentEventId === id) btn.classList.add('active');
        btn.textContent = id;
        btn.onclick = () => selectAct(id);
        actsPanel.appendChild(btn);
    });
}
```

### Krok 6: Funkcja renderRecordsTable() [LINIA ~3800]
```javascript
function renderRecordsTable() {
    const tableBody = document.getElementById('dataTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    
    app.imageActs.forEach((event, eventId) => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = event.id;
        row.insertCell().textContent = event.type;
        // ... więcej komórek
    });
}
```

### Krok 7: Funkcja loadActToForm(event) [LINIA ~3400]
Zmienić na czytanie z event.roles i event.fieldROIs

### Krok 8: Funkcja saveRecord() [LINIA ~3300]
Zmienić na zapis do event.roles[i].person (PersonModel)

### Krok 9: saveStorage() [LINIA ~5000]
```javascript
const actsArray = Array.from(app.imageActs.values()).map(e => e.toJSON());
```

### Krok 10: loadStorage() [LINIA ~5100]
```javascript
data.imageActs.forEach(eventData => {
    const event = ACTA.EventModel.fromJSON(eventData);
    app.imageActs.set(event.id, event);
});
```

## Status
- Edycja: W trakcie
- Łącznie linii: 5669
- Zmianę dotychczasowe: 1/10
