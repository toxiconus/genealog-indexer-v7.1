// js/app-state.js
export const app = {
  currentImage: null,
  currentEventId: null,
  currentTemplate: 'chrzest',  // domyślny
  imageActs: [],               // tablica EventModel
  personsRegistry: new Map(),  // centralny rejestr osób
  nextPersonId: 1,
  viewMode: 'indexing',        // nowy: fullViewer, editing, analysis
  // ... reszta stanu
};

export function getCurrentAct() {
  return app.imageActs.find(e => e.id === app.currentEventId);
}

export function notify(message, type = 'info') {
  // Twoja funkcja powiadomień
  console.log(`[${type.toUpperCase()}] ${message}`);
}