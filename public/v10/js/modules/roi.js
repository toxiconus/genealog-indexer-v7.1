/* ===== ROI.JS - Region of Interest ===== */

const ROIModule = (() => {
    let canvas = null;
    let ctx = null;
    let state = {
        rois: [],
        isDrawing: false,
        currentROI: null,
        selectedROI: null,
    };

    const init = async () => {
        log('🎯 ROI init');
        setupCanvas();
        setupEventListeners();
    };

    const setupCanvas = () => {
        canvas = document.getElementById('drawingCanvas');
        if (!canvas) {
            logError('Drawing canvas not found');
            return;
        }
        ctx = canvas.getContext('2d');
        resizeCanvas();
    };

    const resizeCanvas = () => {
        if (!canvas) return;
        const viewer = document.getElementById('viewer-container');
        canvas.width = viewer.offsetWidth;
        canvas.height = viewer.offsetHeight;
    };

    const setupEventListeners = () => {
        if (!canvas) return;

        canvas.addEventListener('mousedown', startDraw);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', endDraw);
        canvas.addEventListener('mouseleave', endDraw);
        
        window.addEventListener('resize', resizeCanvas);
    };

    const startDraw = (e) => {
        state.isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        state.currentROI = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            width: 0,
            height: 0,
            field: null,
        };
        log('ROI drawing started');
    };

    const draw = (e) => {
        if (!state.isDrawing || !state.currentROI) return;

        const rect = canvas.getBoundingClientRect();
        state.currentROI.width = e.clientX - rect.left - state.currentROI.x;
        state.currentROI.height = e.clientY - rect.top - state.currentROI.y;

        redraw();
    };

    const endDraw = () => {
        if (!state.isDrawing || !state.currentROI) return;

        if (Math.abs(state.currentROI.width) > 10 && Math.abs(state.currentROI.height) > 10) {
            state.rois.push(state.currentROI);
            log(`ROI saved: ${state.rois.length}`);
        }

        state.isDrawing = false;
        state.currentROI = null;
        redraw();
    };

    const redraw = () => {
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw existing ROIs
        state.rois.forEach((roi) => {
            ctx.strokeStyle = CONFIG.roi.strokeColor;
            ctx.lineWidth = CONFIG.roi.strokeWidth;
            ctx.strokeRect(roi.x, roi.y, roi.width, roi.height);
            ctx.fillStyle = CONFIG.roi.fillColor;
            ctx.fillRect(roi.x, roi.y, roi.width, roi.height);
        });

        // Draw current ROI being drawn
        if (state.isDrawing && state.currentROI) {
            ctx.strokeStyle = CONFIG.roi.activeColor;
            ctx.lineWidth = CONFIG.roi.strokeWidth + 1;
            ctx.strokeRect(
                state.currentROI.x,
                state.currentROI.y,
                state.currentROI.width,
                state.currentROI.height
            );
            ctx.fillStyle = 'rgba(251, 191, 36, 0.1)';
            ctx.fillRect(
                state.currentROI.x,
                state.currentROI.y,
                state.currentROI.width,
                state.currentROI.height
            );
        }
    };

    const getRois = () => [...state.rois];

    const clearRois = () => {
        state.rois = [];
        redraw();
        log('ROIs cleared');
    };

    return {
        init,
        getRois,
        clearRois,
        getState: () => ({ ...state }),
    };
})();
