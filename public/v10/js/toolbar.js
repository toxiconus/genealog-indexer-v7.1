// js/toolbar.js
import { app, notify } from './app-state.js';

export function renderToolbar() {
  console.log('renderToolbar() - started');
  
  const toolbar = document.getElementById('toolbar');
  if (!toolbar) {
    console.error('ERROR: No #toolbar element in HTML');
    return;
  }

  toolbar.innerHTML = `
    <div class="toolbar-left">
      <input type="file" id="fileInput" accept="image/*" style="display:none;">
      <button id="btnOpen">Open Image</button>
      <button id="btnAddActs">Add Acts</button>
      <button id="btnRotateLeft">Rotate Left</button>
      <button id="btnRotateRight">Rotate Right</button>
      <button id="btnZoomIn">Zoom In</button>
      <button id="btnZoomOut">Zoom Out</button>
      <button id="btnFitView">Fit View</button>
      <button id="btnExport">Export</button>
      
      <select id="templateSelect">
        <option value="chrzest">Chrzest</option>
        <option value="malzenstvo">Malzenstvo</option>
        <option value="zgon">Zgon</option>
      </select>
    </div>
    <div class="toolbar-right">
      <button id="btnSearch">Search</button>
      <button id="btnSettings">Settings</button>
      <button id="btnFirebase">Firebase</button>
      <button id="btnSave">Save</button>
    </div>
  `;

  // Events
  document.getElementById('btnOpen')?.addEventListener('click', () => {
    console.log('Click: Open image');
    document.getElementById('fileInput')?.click();
  });

  document.getElementById('fileInput')?.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        app.currentImage = event.target.result;
        notify('Image loaded', 'success');
        document.dispatchEvent(new Event('imageLoaded'));
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('btnAddActs')?.addEventListener('click', () => {
    notify('Add acts - in progress', 'info');
  });

  document.getElementById('btnRotateLeft')?.addEventListener('click', () => {
    notify('Rotate left - in progress', 'info');
  });

  document.getElementById('btnRotateRight')?.addEventListener('click', () => {
    notify('Rotate right - in progress', 'info');
  });

  document.getElementById('btnZoomIn')?.addEventListener('click', () => {
    notify('Zoom in - in progress', 'info');
  });

  document.getElementById('btnZoomOut')?.addEventListener('click', () => {
    notify('Zoom out - in progress', 'info');
  });

  document.getElementById('btnFitView')?.addEventListener('click', () => {
    notify('Fit view - in progress', 'info');
  });

  document.getElementById('btnExport')?.addEventListener('click', () => {
    notify('Export - in progress', 'info');
  });

  document.getElementById('btnSearch')?.addEventListener('click', () => {
    notify('Search - in progress', 'info');
  });

  document.getElementById('btnSettings')?.addEventListener('click', () => {
    notify('Settings - in progress', 'info');
  });

  document.getElementById('templateSelect')?.addEventListener('change', (e) => {
    app.currentTemplate = e.target.value;
    notify('Template changed: ' + e.target.value, 'success');
    import('./forms.js').catch(() => {
      console.log('forms.js not yet available');
    }).then(m => {
      if (m?.renderFloatingForm) m.renderFloatingForm();
    });
  });

  document.getElementById('btnSave')?.addEventListener('click', () => {
    notify('Saving data...', 'info');
  });

  document.getElementById('btnFirebase')?.addEventListener('click', () => {
    notify('Firebase - in progress', 'info');
  });

  console.log('Toolbar rendered OK');
}