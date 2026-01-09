/* ===== DATABASE.JS - Firebase operations ===== */

const DatabaseModule = (() => {
    let state = {
        isConnected: false,
        lastSync: null,
        images: [],
    };

    const init = async () => {
        log('💾 Database init');
        await waitForFirebase();
        setupListeners();
    };

    const waitForFirebase = () => {
        return new Promise((resolve) => {
            if (window.db && window.auth) {
                state.isConnected = true;
                resolve();
            } else {
                window.addEventListener('firebaseReady', () => {
                    state.isConnected = true;
                    resolve();
                });
            }
        });
    };

    const setupListeners = () => {
        if (!window.db) return;

        // Listen to auth state
        window.auth.onAuthStateChanged((user) => {
            if (user) {
                log(`✅ User logged in: ${user.email}`);
                loadImages();
            } else {
                log('⚠️ User logged out');
            }
        });
    };

    const loadImages = async () => {
        try {
            if (!window.db) return;
            
            log('📂 Loading images from Firebase...');
            // Implement Firestore query
            state.lastSync = new Date();
            return state.images;
        } catch (error) {
            logError('Error loading images', error);
            return [];
        }
    };

    const saveEvent = async (event) => {
        try {
            if (!window.db) {
                logError('Firebase not initialized');
                return false;
            }

            log(`💾 Saving event: ${event.id}`);
            // Implement Firestore write
            return true;
        } catch (error) {
            logError('Error saving event', error);
            return false;
        }
    };

    const deleteEvent = async (eventId) => {
        try {
            if (!window.db) return false;
            
            log(`🗑️ Deleting event: ${eventId}`);
            // Implement Firestore delete
            return true;
        } catch (error) {
            logError('Error deleting event', error);
            return false;
        }
    };

    const exportData = async () => {
        try {
            log('📤 Exporting data...');
            // Implement export logic
            return { images: state.images };
        } catch (error) {
            logError('Error exporting data', error);
            return null;
        }
    };

    const importData = async (data) => {
        try {
            log('📥 Importing data...');
            // Implement import logic
            return true;
        } catch (error) {
            logError('Error importing data', error);
            return false;
        }
    };

    return {
        init,
        loadImages,
        saveEvent,
        deleteEvent,
        exportData,
        importData,
        getState: () => ({ ...state }),
    };
})();
