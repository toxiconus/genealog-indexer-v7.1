/* ===== CONFIG.JS - Konfiguracja i stałe ===== */

const CONFIG = {
    // ===== APP CONFIG =====
    version: '10.0.0',
    appName: 'Genealog Indexer',
    debug: true,
    
    // ===== VIEWER CONFIG =====
    viewer: {
        defaultZoom: 1,
        minZoom: 0.1,
        maxZoom: 10,
        animationTime: 500,
        rotationEnabled: true,
    },
    
    // ===== ROI CONFIG =====
    roi: {
        strokeColor: '#0078d4',
        fillColor: 'rgba(0, 120, 212, 0.1)',
        activeColor: '#fbbf24',
        selectedColor: '#10b981',
        strokeWidth: 2,
        minSize: 10, // pixels
    },
    
    // ===== FORM CONFIG =====
    forms: {
        autoSave: true,
        autoSaveInterval: 5000, // ms
        validationOnBlur: true,
        showProgressBar: true,
    },
    
    // ===== OCR CONFIG =====
    ocr: {
        enabled: true,
        languages: ['pol', 'eng'],
        workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.0/dist/',
        confidence: 0.8,
    },
    
    // ===== STORAGE CONFIG =====
    storage: {
        type: 'firebase', // 'firebase' | 'indexeddb' | 'localstorage'
        syncInterval: 30000, // ms
        offlineMode: true,
    },
    
    // ===== ACT TYPES =====
    actTypes: {
        chrztów: {
            label: '📜 Chrzty',
            color: '#e91e63',
            icon: 'fa-book',
        },
        małżeństw: {
            label: '💍 Małżeństwa',
            color: '#2196F3',
            icon: 'fa-ring',
        },
        zgonów: {
            label: '⚰️ Zgony',
            color: '#9C27B0',
            icon: 'fa-cross',
        },
    },
    
    // ===== KEYBOARD SHORTCUTS =====
    shortcuts: {
        'ctrl+s': 'save',
        'ctrl+n': 'newAct',
        'ctrl+m': 'toggleThumbnails',
        'ctrl+l': 'toggleActs',
        'ctrl+j': 'importJSON',
        'ctrl+e': 'exportJSON',
        'q': 'rotateLeft',
        'e': 'rotateRight',
        'arrowleft': 'previousAct',
        'arrowright': 'nextAct',
    },
    
    // ===== API ENDPOINTS =====
    api: {
        firebase: true,
        baseUrl: 'https://acta-9ea64.firebaseapp.com',
    },
    
    // ===== NOTIFICATIONS =====
    notifications: {
        position: 'top-right',
        duration: 4000, // ms
        maxVisible: 5,
    },
    
    // ===== TABLE CONFIG =====
    tables: {
        pageSize: 25,
        sortable: true,
        filterable: true,
        exportable: true,
    },
};

// ===== UTILITY FUNCTIONS =====

/**
 * Log debug messages
 */
const log = (message, data = null) => {
    if (CONFIG.debug) {
        console.log(`[${CONFIG.appName}] ${message}`, data || '');
    }
};

/**
 * Log errors
 */
const logError = (message, error = null) => {
    console.error(`[${CONFIG.appName}] ❌ ${message}`, error || '');
};

/**
 * Log warnings
 */
const logWarn = (message, data = null) => {
    console.warn(`[${CONFIG.appName}] ⚠️ ${message}`, data || '');
};

/**
 * Get act type config
 */
const getActTypeConfig = (actType) => {
    return CONFIG.actTypes[actType] || CONFIG.actTypes.chrztów;
};

/**
 * Check if feature is enabled
 */
const isFeatureEnabled = (feature) => {
    return CONFIG[feature] && CONFIG[feature].enabled !== false;
};

// Make CONFIG globally available
window.CONFIG = CONFIG;
window.log = log;
window.logError = logError;
window.logWarn = logWarn;
window.getActTypeConfig = getActTypeConfig;
window.isFeatureEnabled = isFeatureEnabled;
