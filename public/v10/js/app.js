/* ===== APP.JS - Bootstrap aplikacji ===== */

const AppModule = (() => {
    let state = { isInitialized: false, currentActType: 'chrztów' };

    const init = async () => {
        try {
            console.log('🚀 App init v10');
            ToolbarModule.init();
            ThumbnailsModule.init();
            ViewerModule.init();
            RoiModule.init();
            DatabaseModule.init();
            FormsBaseModule.init();
            FormChrzciuModule.init();
            FormMałżeństwaModule.init();
            FormZgonuModule.init();
            TablesModule.init();
            SearchModule.init();
            OcrModule.init();
            KeyboardModule.init();
            setupEventListeners();
            state.isInitialized = true;
            console.log('✅ Aplikacja zainicjalizowana');
            return true;
        } catch (error) {
            console.error('❌ Błąd:', error);
            return false;
        }
    };

    const setupEventListeners = () => {
        document.getElementById('actTypeSelector')?.addEventListener('change', (e) => {
            state.currentActType = e.target.value;
            console.log(`Zmieniono typ: ${state.currentActType}`);
        });
    };

    return { init, getState: () => state };
})();

document.addEventListener('DOMContentLoaded', () => AppModule.init());
window.AppModule = AppModule;
