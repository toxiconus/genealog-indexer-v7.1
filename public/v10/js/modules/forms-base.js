/* ===== FORMS-BASE.JS - Wspólna logika formularzy ===== */

const FormsBaseModule = (() => {
    let state = {
        currentAct: null,
        isDirty: false,
    };

    const init = async () => {
        log('📝 Forms Base init');
        renderForms();
        setupEventListeners();
    };

    const renderForms = () => {
        const container = document.getElementById('forms-container');
        if (!container) return;

        container.innerHTML = `
            <!-- Will be populated by specific form modules -->
            <div id="form-chrztów" class="form-section">
                <!-- Populated by FormChrzciuModule -->
            </div>
            <div id="form-małżeństw" class="form-section">
                <!-- Populated by FormMałżeństwaModule -->
            </div>
            <div id="form-zgonów" class="form-section">
                <!-- Populated by FormZgonuModule -->
            </div>
        `;

        // Activate first form
        const firstForm = container.querySelector('.form-section');
        if (firstForm) {
            firstForm.classList.add('active');
        }
    };

    const setupEventListeners = () => {
        // Global form change detection
        document.addEventListener('change', () => {
            state.isDirty = true;
            log('Form marked as dirty');
        });

        document.addEventListener('input', () => {
            state.isDirty = true;
        });
    };

    const validateForm = () => {
        // Base validation logic
        const fields = document.querySelectorAll('.form-group input, .form-group textarea');
        let isValid = true;

        fields.forEach((field) => {
            if (!validateField(field.name, field.value)) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });

        return isValid;
    };

    const saveForm = async () => {
        if (!validateForm()) {
            notify('❌ Wypełnij wymagane pola', 'error');
            return false;
        }

        try {
            log('💾 Saving form...');
            // Implement save logic in specific form modules
            state.isDirty = false;
            notify('✅ Zapisano', 'success');
            return true;
        } catch (error) {
            logError('Error saving form', error);
            notify('❌ Błąd zapisu', 'error');
            return false;
        }
    };

    const resetForm = () => {
        document.querySelectorAll('.form-group input, .form-group textarea').forEach((el) => {
            el.value = '';
            el.classList.remove('error');
        });
        state.isDirty = false;
        log('Form reset');
    };

    return {
        init,
        validateForm,
        saveForm,
        resetForm,
        getState: () => ({ ...state }),
    };
})();
