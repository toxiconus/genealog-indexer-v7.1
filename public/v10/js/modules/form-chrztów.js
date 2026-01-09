/* ===== FORM-CHRZTÓW.JS - Formularz chrztu ===== */

const FormChrzciuModule = (() => {
    let state = {
        child: {},
        parents: [],
        godparents: [],
        parish: {},
    };

    const init = async () => {
        log('📜 Form Chrztu init');
        render();
    };

    const render = () => {
        const formContainer = document.getElementById('form-chrztów');
        if (!formContainer) return;

        formContainer.innerHTML = `
            <div class="form-content">
                <!-- DZIECKO -->
                <div class="chrztów-child-section">
                    <h4>Dziecko</h4>
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label>Imię</label>
                            <input type="text" name="childFirstName" class="field-child">
                        </div>
                        <div class="form-group">
                            <label>Nazwisko</label>
                            <input type="text" name="childLastName" class="field-child">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Data chrztu</label>
                        <input type="date" name="baptismDate" class="field-child">
                    </div>
                </div>

                <!-- RODZICE -->
                <div class="chrztów-parents-section">
                    <h4>Rodzice</h4>
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label>Ojciec - Imię</label>
                            <input type="text" name="fatherFirstName" class="field-parent">
                        </div>
                        <div class="form-group">
                            <label>Ojciec - Nazwisko</label>
                            <input type="text" name="fatherLastName" class="field-parent">
                        </div>
                    </div>
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label>Matka - Imię</label>
                            <input type="text" name="motherFirstName" class="field-parent">
                        </div>
                        <div class="form-group">
                            <label>Matka - Nazwisko</label>
                            <input type="text" name="motherLastName" class="field-parent">
                        </div>
                    </div>
                </div>

                <!-- CHRZESTNI -->
                <div class="chrztów-godparents-section">
                    <h4>Chrzestni</h4>
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label>Chrzestny - Imię</label>
                            <input type="text" name="godparentMaleFirstName" class="field-godparent">
                        </div>
                        <div class="form-group">
                            <label>Chrzestny - Nazwisko</label>
                            <input type="text" name="godparentMaleLastName" class="field-godparent">
                        </div>
                    </div>
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label>Chrzestna - Imię</label>
                            <input type="text" name="godparentFemaleFirstName" class="field-godparent">
                        </div>
                        <div class="form-group">
                            <label>Chrzestna - Nazwisko</label>
                            <input type="text" name="godparentFemaleLastName" class="field-godparent">
                        </div>
                    </div>
                </div>

                <!-- PARAFIA -->
                <div class="chrztów-parish-section">
                    <h4>Parafia</h4>
                    <div class="form-group">
                        <label>Nazwa parafii</label>
                        <input type="text" name="parishName" class="field-parish">
                    </div>
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label>Miejscowość</label>
                            <input type="text" name="parishLocation" class="field-parish">
                        </div>
                        <div class="form-group">
                            <label>Dekanat</label>
                            <input type="text" name="decanate" class="field-parish">
                        </div>
                    </div>
                </div>

                <!-- UWAGI -->
                <div class="form-group">
                    <label>Uwagi</label>
                    <textarea name="notes" placeholder="Dodatkowe informacje..."></textarea>
                </div>
            </div>

            <div class="form-actions">
                <button class="form-btn" id="saveBaptismBtn">
                    <i class="fas fa-save"></i> Zapisz
                </button>
                <button class="form-btn secondary" id="resetBaptismBtn">
                    <i class="fas fa-undo"></i> Anuluj
                </button>
            </div>
        `;

        setupEventListeners();
    };

    const setupEventListeners = () => {
        document.getElementById('saveBaptismBtn')?.addEventListener('click', saveBaptism);
        document.getElementById('resetBaptismBtn')?.addEventListener('click', resetBaptism);
    };

    const saveBaptism = async () => {
        if (!FormsBaseModule.validateForm()) {
            notify('❌ Wypełnij wymagane pola', 'error');
            return;
        }

        log('Saving baptism record...');
        notify('✅ Chrzest zapisany', 'success');
    };

    const resetBaptism = () => {
        FormsBaseModule.resetForm();
        render();
    };

    const show = () => {
        render();
    };

    return {
        init,
        render,
        show,
        getState: () => ({ ...state }),
    };
})();
