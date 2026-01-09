/* ===== KEYBOARD.JS - Skróty klawiszowe ===== */

const KeyboardModule = (() => {
    let state = {
        isEnabled: true,
    };

    const init = async () => {
        log('⌨️ Keyboard shortcuts init');
        setupShortcuts();
    };

    const setupShortcuts = () => {
        document.addEventListener('keydown', (e) => {
            if (!state.isEnabled) return;

            const isCtrlCmd = e.ctrlKey || e.metaKey;
            const isShift = e.shiftKey;
            const key = e.key.toLowerCase();

            // Ctrl+S = Save
            if (isCtrlCmd && key === 's') {
                e.preventDefault();
                if (typeof FormsBaseModule !== 'undefined') {
                    FormsBaseModule.saveForm();
                }
                log('⌨️ Ctrl+S → Save');
                return;
            }

            // Ctrl+N = New act
            if (isCtrlCmd && key === 'n') {
                e.preventDefault();
                notify('✨ Nowy akt', 'info');
                log('⌨️ Ctrl+N → New Act');
                return;
            }

            // Ctrl+M = Toggle thumbnails
            if (isCtrlCmd && key === 'm') {
                e.preventDefault();
                const mainContent = document.getElementById('main-content');
                mainContent.classList.toggle('thumbs-collapsed');
                log('⌨️ Ctrl+M → Toggle Thumbnails');
                return;
            }

            // Ctrl+L = Toggle acts panel
            if (isCtrlCmd && key === 'l') {
                e.preventDefault();
                const mainContent = document.getElementById('main-content');
                mainContent.classList.toggle('acts-collapsed');
                log('⌨️ Ctrl+L → Toggle Acts');
                return;
            }

            // Q = Rotate left
            if (key === 'q' && !isCtrlCmd) {
                const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
                if (!isInput) {
                    e.preventDefault();
                    if (typeof ViewerModule !== 'undefined') {
                        ViewerModule.rotate(-90);
                    }
                    log('⌨️ Q → Rotate Left');
                }
                return;
            }

            // E = Rotate right
            if (key === 'e' && !isCtrlCmd) {
                const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
                if (!isInput) {
                    e.preventDefault();
                    if (typeof ViewerModule !== 'undefined') {
                        ViewerModule.rotate(90);
                    }
                    log('⌨️ E → Rotate Right');
                }
                return;
            }

            // Ctrl+J = Import JSON
            if (isCtrlCmd && key === 'j') {
                e.preventDefault();
                if (typeof DatabaseModule !== 'undefined') {
                    // Trigger import
                }
                log('⌨️ Ctrl+J → Import');
                return;
            }

            // Ctrl+E = Export
            if (isCtrlCmd && key === 'e') {
                e.preventDefault();
                if (typeof DatabaseModule !== 'undefined') {
                    DatabaseModule.exportData();
                }
                log('⌨️ Ctrl+E → Export');
                return;
            }

            // Ctrl+F = Search
            if (isCtrlCmd && key === 'f') {
                e.preventDefault();
                notify('🔍 Szukaj', 'info');
                log('⌨️ Ctrl+F → Search');
                return;
            }

            // Ctrl+R = OCR
            if (isCtrlCmd && key === 'r') {
                e.preventDefault();
                notify('🔤 OCR', 'info');
                log('⌨️ Ctrl+R → OCR');
                return;
            }

            // Tab = Next field
            if (key === 'tab') {
                // Allow default tab behavior
                return;
            }

            // Arrow keys = Navigate
            if (key.startsWith('arrow')) {
                const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
                if (isInput) return; // Allow in forms

                if (key === 'arrowleft' || key === 'arrowright') {
                    e.preventDefault();
                    log(`⌨️ ${key} → Navigate`);
                }
                return;
            }
        });
    };

    const enable = () => {
        state.isEnabled = true;
    };

    const disable = () => {
        state.isEnabled = false;
    };

    return {
        init,
        enable,
        disable,
        getState: () => ({ ...state }),
    };
})();
