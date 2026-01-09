/* ===== OCR.JS - Tesseract.js integration ===== */

const OCRModule = (() => {
    let worker = null;
    let state = {
        isInitialized: false,
        isProcessing: false,
        progress: 0,
        lastResult: null,
    };

    const init = async () => {
        log('🔤 OCR init');
        if (!CONFIG.ocr.enabled) {
            logWarn('OCR disabled in config');
            return;
        }

        try {
            // Initialize Tesseract worker
            if (typeof Tesseract !== 'undefined') {
                worker = await Tesseract.createWorker(CONFIG.ocr.languages[0]);
                await worker.load();
                state.isInitialized = true;
                log('✅ OCR worker initialized');
            } else {
                logWarn('Tesseract.js not loaded');
            }
        } catch (error) {
            logError('OCR initialization error', error);
        }
    };

    const processImage = async (imageUrl) => {
        if (!state.isInitialized || !worker) {
            logError('OCR not initialized');
            return null;
        }

        try {
            state.isProcessing = true;
            state.progress = 0;
            log(`Processing image for OCR: ${imageUrl}`);

            worker.setParameters({
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ąćęłńóśźżĄĆĘŁŃÓŚŹŻ,.:;-( )',
            });

            const result = await worker.recognize(imageUrl);
            state.lastResult = result.data.text;
            state.isProcessing = false;
            state.progress = 100;

            log(`OCR complete. Confidence: ${result.data.confidence}`);
            return state.lastResult;
        } catch (error) {
            logError('OCR processing error', error);
            state.isProcessing = false;
            return null;
        }
    };

    const processROI = async (imageUrl, roi) => {
        // Process specific ROI (Region of Interest)
        log(`Processing ROI: ${JSON.stringify(roi)}`);
        // Implement ROI extraction and OCR
        return null;
    };

    const terminate = async () => {
        if (worker) {
            await worker.terminate();
            state.isInitialized = false;
            log('OCR worker terminated');
        }
    };

    return {
        init,
        processImage,
        processROI,
        terminate,
        getState: () => ({ ...state }),
    };
})();
