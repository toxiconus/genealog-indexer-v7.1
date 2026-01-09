/* ===== TOOLBAR.JS - Pasek ikon i akcji ===== */

const ToolbarModule = (() => {
    let state = {
        imageCount: 0,
        currentImageIndex: 0,
        progressValue: 0,
        progressMax: 0,
    };

    const render = () => {
        const toolbar = document.getElementById('toolbar');
        if (!toolbar) return;

        toolbar.innerHTML = `
            <span id="imageCounter" style="color: #999; font-size: 11px; margin-right: 10px;">0/0</span>
            
            <div id="progressBar">
                <span class="progress-text">Pola:</span>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill" style="width: 0%"></div>
                    </div>
                    <span class="progress-text" id="progressText">0/0</span>
                </div>
            </div>
            
            <div class="toolbar-sep"></div>
            
            <button class="toolbar-btn" id="openBtn" title="Dodaj obrazy (Ctrl+O)">
                <i class="fas fa-folder-open"></i> Otwórz
            </button>
            <button class="toolbar-btn" id="sortBtn" title="Sortuj obrazy">
                <i class="fas fa-sort-alpha-down"></i> Sort
            </button>
            <button class="toolbar-btn" id="exportBtn" title="Eksport CSV">
                <i class="fas fa-download"></i> Export
            </button>
            <button class="toolbar-btn" id="importCsvBtn" title="Import CSV">
                <i class="fas fa-upload"></i> CSV
            </button>
            <button class="toolbar-btn" id="importJsonBtn" title="Import JSON">
                <i class="fas fa-file-import"></i> JSON
            </button>
            
            <div class="toolbar-sep"></div>
            
            <button class="toolbar-btn" id="roiBtn" title="Zaznacz granice aktu (Ctrl+R)">
                <i class="fas fa-expand"></i> Granice aktu
            </button>
            <button class="toolbar-btn" id="actBtn" title="Zaznacz pola (Ctrl+A)">
                <i class="fas fa-crop-alt"></i> Pola w akcie
            </button>
            <button class="toolbar-btn" id="clearRoiBtn" title="Usuń zaznaczenia">
                <i class="fas fa-trash-alt"></i> Clear
            </button>
            
            <div class="toolbar-sep"></div>
            
            <button class="toolbar-btn" id="toggleThumbsBtn" title="Miniatury">
                <i class="fas fa-images"></i> Thumbs
            </button>
            <button class="toolbar-btn" id="toggleActsBtn" title="Akty">
                <i class="fas fa-list"></i> Acts
            </button>
            
            <div class="toolbar-sep"></div>
            
            <button class="toolbar-btn" id="zoomFitBtn" title="Dopasuj">
                <i class="fas fa-expand-arrows-alt"></i> Fit
            </button>
            <button class="toolbar-btn" id="fullscreenBtn" title="Fullscreen">
                <i class="fas fa-expand"></i> FS
            </button>
            
            <div class="toolbar-sep"></div>
            
            <button class="toolbar-btn" id="formBtn" title="Formularz">
                <i class="fas fa-edit"></i> Form
            </button>
            <button class="toolbar-btn" id="pinsBtn" title="Pinupy">
                <i class="fas fa-thumbtack"></i> PIN
            </button>
            <button class="toolbar-btn" id="clearPinsBtn" title="Zamknij PIN">
                <i class="fas fa-times"></i> ✕PIN
            </button>
            
            <div class="toolbar-sep"></div>
            
            <button class="toolbar-btn" id="postprocessBtn" title="Filtry">
                <i class="fas fa-sliders-h"></i> Filtry
            </button>
            
            <div class="toolbar-sep"></div>
            
            <button class="toolbar-btn" id="firebaseBtn" title="Firebase">
                <i class="fas fa-cloud-upload-alt"></i> FB
            </button>
            <button class="toolbar-btn" id="clearStorageBtn" title="Wyczyść" style="color: #e74c3c;">
                <i class="fas fa-trash-alt"></i> Wyczyść
            </button>
            
            <div class="toolbar-sep"></div>
            
            <input type="text" id="searchInput" placeholder="🔍 Szukaj..." style="margin-left: auto; padding: 6px 10px; border: 1px solid var(--color-border); background: var(--color-bg-dark); color: var(--color-text); border-radius: 4px; font-size: 11px; width: 160px; flex-shrink: 0;">
        `;
    };

    const setupEventListeners = () => {
        // FILE OPS
        document.getElementById('openBtn')?.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = 'image/*';
            input.onchange = (e) => handleFilesSelected(e.target.files);
            input.click();
        });

        document.getElementById('sortBtn')?.addEventListener('click', () => {
            const thumbnails = Array.from(document.querySelectorAll('.thumbnail'));
            thumbnails.sort((a, b) => {
                const aAlt = a.querySelector('img')?.alt || '';
                const bAlt = b.querySelector('img')?.alt || '';
                return aAlt.localeCompare(bAlt);
            });
            const panel = document.getElementById('thumbnails-panel');
            thumbnails.forEach(t => panel.appendChild(t));
            console.log('✅ Sorted');
        });

        document.getElementById('exportBtn')?.addEventListener('click', () => {
            exportToCSV();
        });

        document.getElementById('importCsvBtn')?.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.csv';
            input.onchange = (e) => importCSV(e.target.files[0]);
            input.click();
        });

        document.getElementById('importJsonBtn')?.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => importJSON(e.target.files[0]);
            input.click();
        });

        // ROI & ACT
        document.getElementById('roiBtn')?.addEventListener('click', () => {
            if (typeof RoiModule !== 'undefined') {
                RoiModule.toggleMode('roi');
            }
        });

        document.getElementById('actBtn')?.addEventListener('click', () => {
            if (typeof RoiModule !== 'undefined') {
                RoiModule.toggleMode('act');
            }
        });

        document.getElementById('clearRoiBtn')?.addEventListener('click', () => {
            if (typeof RoiModule !== 'undefined') {
                RoiModule.clearAll();
            }
        });

        // PANELS
        document.getElementById('toggleThumbsBtn')?.addEventListener('click', () => {
            const container = document.getElementById('thumbnails-container');
            container?.classList.toggle('collapsed');
            const main = document.getElementById('main-content');
            main?.classList.toggle('thumbs-collapsed');
        });

        document.getElementById('toggleActsBtn')?.addEventListener('click', () => {
            const panel = document.getElementById('acts-panel');
            panel?.classList.toggle('collapsed');
            const main = document.getElementById('main-content');
            main?.classList.toggle('acts-collapsed');
        });

        // VIEW
        document.getElementById('zoomFitBtn')?.addEventListener('click', () => {
            if (typeof ViewerModule !== 'undefined') {
                ViewerModule.fitToScreen();
            }
        });

        document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
            if (typeof ViewerModule !== 'undefined') {
                ViewerModule.toggleFullscreen();
            }
        });

        // FORMS
        document.getElementById('formBtn')?.addEventListener('click', () => {
            const rightPanel = document.getElementById('right-panel');
            rightPanel?.classList.toggle('collapsed');
        });

        document.getElementById('pinsBtn')?.addEventListener('click', () => {
            if (typeof RoiModule !== 'undefined') {
                RoiModule.togglePins();
            }
        });

        document.getElementById('clearPinsBtn')?.addEventListener('click', () => {
            if (typeof RoiModule !== 'undefined') {
                RoiModule.clearPins();
            }
        });

        // PROCESS
        document.getElementById('postprocessBtn')?.addEventListener('click', () => {
            const postPanel = document.getElementById('postprocess-panel');
            if (postPanel) postPanel.classList.toggle('visible');
        });

        // ADVANCED
        document.getElementById('firebaseBtn')?.addEventListener('click', () => {
            if (typeof DatabaseModule !== 'undefined') {
                DatabaseModule.syncToFirebase();
            }
        });

        document.getElementById('clearStorageBtn')?.addEventListener('click', () => {
            if (confirm('Wyczyścić wszystkie dane?')) {
                localStorage.clear();
                location.reload();
            }
        });

        // SEARCH
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            if (typeof SearchModule !== 'undefined') {
                SearchModule.search(e.target.value);
            }
        });
    };

    const handleFilesSelected = (files) => {
        console.log(`📂 Załadowano ${files.length} plików`);
        Array.from(files).forEach((file, idx) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (typeof ThumbnailsModule !== 'undefined') {
                        ThumbnailsModule.addThumbnail(idx, e.target.result);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        updateImageCounter(files.length, files.length);
    };

    const exportToCSV = () => {
        if (typeof TablesModule !== 'undefined' && TablesModule.exportCSV) {
            TablesModule.exportCSV();
        }
    };

    const importCSV = (file) => {
        console.log('📤 Import CSV:', file.name);
        // TODO: Migrate from v9
    };

    const importJSON = (file) => {
        console.log('📤 Import JSON:', file.name);
        // TODO: Migrate from v9
    };

    const updateProgress = (current, max) => {
        state.progressValue = current;
        state.progressMax = max;
        const percent = max > 0 ? (current / max) * 100 : 0;
        const fill = document.getElementById('progressFill');
        const text = document.getElementById('progressText');
        if (fill) fill.style.width = percent + '%';
        if (text) text.textContent = `${current}/${max}`;
    };

    const updateImageCounter = (current, total) => {
        state.imageCount = total;
        state.currentImageIndex = current;
        const counter = document.getElementById('imageCounter');
        if (counter) counter.textContent = `${current}/${total}`;
    };

    const init = async () => {
        console.log('✅ ToolbarModule');
        render();
        setupEventListeners();
    };

    return { init, render, updateProgress, updateImageCounter, setState: (s) => { state = { ...state, ...s }; }, getState: () => state };
})();
