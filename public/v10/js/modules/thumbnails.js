/* ===== THUMBNAILS.JS - Panel miniatur ===== */

const ThumbnailsModule = (() => {
    let state = { thumbnails: [], activeIndex: 0 };

    const render = () => {
        const container = document.getElementById('thumbnails-container');
        if (!container) return;
        container.innerHTML = '<div id="thumbnails-panel" class="thumbnails-panel"></div>';
    };

    const addThumbnail = (index, src) => {
        const panel = document.getElementById('thumbnails-panel');
        if (!panel) return;
        const thumb = document.createElement('div');
        thumb.className = 'thumbnail';
        if (index === state.activeIndex) thumb.classList.add('active');
        thumb.innerHTML = `<img src="${src}" alt="Miniatura ${index}">`;
        thumb.addEventListener('click', () => {
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            state.activeIndex = index;
            ViewerModule.loadImage(src);
            ToolbarModule.updateImageCounter(index + 1, state.thumbnails.length);
            console.log(`📸 Loaded: ${index}`);
        });
        panel.appendChild(thumb);
        state.thumbnails.push(src);
    };

    const init = () => {
        console.log('✅ ThumbnailsModule');
        render();
    };

    return { init, render, addThumbnail, getState: () => state };
})();
