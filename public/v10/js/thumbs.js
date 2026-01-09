// js/thumbs.js
import { app, getCurrentAct, notify } from './app-state.js';

export function updateThumbs() {
  console.log('updateThumbs() - start, acts count:', app.imageActs.length);
  
  const thumbsBar = document.getElementById('thumbsBar');
  if (!thumbsBar) {
    console.error('ERROR: No #thumbsBar element in HTML');
    return;
  }

  thumbsBar.innerHTML = '';

  if (app.imageActs.length === 0) {
    thumbsBar.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #999;">
        <p>No acts loaded</p>
        <p style="font-size: 12px;">Add new acts using button above</p>
      </div>
    `;
    return;
  }

  app.imageActs.forEach((act, index) => {
    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    thumb.dataset.actId = act.id;
    if (app.currentEventId === act.id) {
      thumb.classList.add('active');
    }

    const label = `${(act.type || 'act').toUpperCase().slice(0, 2)}.${act.year || '?'}.No.${act.nr || index}`;
    thumb.innerHTML = `
      <div class="thumb-image">
        <img src="${act.thumbnail || 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22100%22%20height=%22140%22%3E%3Crect%20fill=%22%23eee%22%20width=%22100%22%20height=%22140%22/%3E%3C/svg%3E'}" 
             alt="${label}"
             onerror="this.style.display='none'">
      </div>
      <div class="thumb-label">${label}</div>
    `;

    thumb.addEventListener('click', () => {
      document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');

      app.currentEventId = act.id;
      notify('Act selected: ' + label, 'info');
      console.log('Act selected: ' + act.id);
      
      import('./forms.js').catch(() => {
        console.log('forms.js not yet available');
      }).then(m => {
        if (m?.renderFloatingForm) {
          m.renderFloatingForm();
        }
      });
    });

    thumbsBar.appendChild(thumb);
  });

  console.log('Thumbs rendered OK, count:', app.imageActs.length);
}