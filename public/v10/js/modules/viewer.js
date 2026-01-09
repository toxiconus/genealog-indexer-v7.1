/* ===== VIEWER.JS - OpenSeadragon viewer ===== */

const ViewerModule = (() => {
    let viewer = null;
    let state = { isInitialized: false, zoom: 1, rotation: 0, currentImage: null };

    const init = async () => {
        console.log('👁️ ViewerModule init');
        initializeViewer();
    };

    const initializeViewer = () => {
        const viewerElement = document.getElementById('viewer');
        if (!viewerElement) return;

        viewer = OpenSeadragon({
            id: 'viewer',
            prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',
            showNavigationControl: false,
            autoHideControls: false,
            navigatorPosition: 'BOTTOM_RIGHT',
            gestureSettingsMouse: { clickToZoom: true, scrollToZoom: true, pinchToZoom: true, flick: true },
        });

        setupViewerEvents();
        setupDragDrop();
        state.isInitialized = true;
        console.log('✅ Viewer ready');
    };

    const setupViewerEvents = () => {
        if (!viewer) return;
        viewer.addHandler('zoom', (e) => { state.zoom = viewer.viewport.getZoom(); });
        viewer.addHandler('pan', (e) => { /* handle pan */ });
    };

    const setupDragDrop = () => {
        const container = document.getElementById('viewer-container');
        if (!container) return;
        
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('drag-over');
        });
        
        container.addEventListener('dragleave', () => {
            container.classList.remove('drag-over');
        });
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('drag-over');
            handleImageDrop(e.dataTransfer.files);
        });
    };

    const handleImageDrop = (files) => {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => loadImage(e.target.result);
                reader.readAsDataURL(file);
            }
        });
    };

    const loadImage = (src) => {
        state.currentImage = src;
        if (viewer) {
            viewer.open(src);
        }
    };

    const rotate = (degrees) => {
        if (!viewer) return;
        state.rotation = (state.rotation + degrees) % 360;
        const viewport = viewer.viewport;
        viewport.setRotation(state.rotation);
    };

    const fitToScreen = () => {
        if (viewer) viewer.viewport.fitBounds(viewer.world.getHomeBounds());
    };

    const toggleFullscreen = () => {
        const elem = document.getElementById('viewer-container');
        if (!elem) return;
        
        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(err => console.error('FS error:', err));
        } else {
            document.exitFullscreen();
        }
    };

    const onResize = () => {
        if (viewer) viewer.forceRedraw();
    };

    return { init, loadImage, rotate, fitToScreen, toggleFullscreen, onResize, getState: () => state };
})();
