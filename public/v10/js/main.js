// js/main.js
import { renderToolbar } from './toolbar.js';
import { updateThumbs } from './thumbs.js';
import { app } from './app-state.js';

export function initApp() {
  console.log('App init v10 - modular version');

  loadStorage();

  renderToolbar();
  updateThumbs();

  document.addEventListener('imageLoaded', () => {
    updateThumbs();
  });

  window.addEventListener('beforeunload', () => {
    saveStorage();
  });

  console.log('App initialized OK');
}

function loadStorage() {
  try {
    const data = localStorage.getItem('actaData_v10');
    if (data) {
      const parsed = JSON.parse(data);
      app.imageActs = parsed.imageActs || [];
      app.currentEventId = parsed.currentEventId || null;
      app.currentTemplate = parsed.currentTemplate || 'chrzest';
      console.log('Data loaded from localStorage');
    }
  } catch (e) {
    console.error('Error loading data:', e);
  }
}

function saveStorage() {
  try {
    const data = {
      imageActs: app.imageActs,
      currentEventId: app.currentEventId,
      currentTemplate: app.currentTemplate
    };
    localStorage.setItem('actaData_v10', JSON.stringify(data));
    console.log('Data saved to localStorage');
  } catch (e) {
    console.error('Error saving data:', e);
  }
}