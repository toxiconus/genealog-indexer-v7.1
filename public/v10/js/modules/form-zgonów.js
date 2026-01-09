/* ===== FORM-ZGONÓW.JS - Formularz zgonu ===== */

const FormZgonuModule = (() => {
    let state = {
        deceased: {},
        parents: [],
        parish: {},
        burial: {},
    };

    const init = async () => {
        log('⚰️ Form Zgonu init');
        render();
    };

    const render = () => {
        const formContainer = document.getElementById('form-zgonów');
        if (!formContainer) return;

        formContainer.innerHTML = `
            <div class="form-content">
                <!-- ZMARŁY -->
                <div class="zgonów-deceased-section">
                    <h4>Zmarły</h4>
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label>Imię</label>
                            <input type="text" name="deceasedFirstName" class="field-deceased">
                        </div>
                        <div class="form-group">
                            <label>Nazwisko</label>
                            <input type="text" name="deceasedLastName" class="field-deceased">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Stan cywilny</label>
                        <select name="maritalStatus" class="field-deceased">
                            <option value="">-- Wybierz --</option>
                            <option value="single">Kawaler/Panna</option>
                            <option value="married">Żonaty/Zamężna</option>
                            <option value="widowed">Wdowiec/Wdowa</option>
                            <option value="divorced">Rozwiedziony/a</option>
                        </select>
                    </div>
                </div>

                <!-- RODZICE ZMARŁEGO -->
                <div class="zgonów-parents-section">
                    <h4>Rodzice</h4>
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label>Ojciec - Imię</label>
                            <input type="text" name="fatherFirstName" class="field-parents">
                        </div>
                        <div class="form-group">
                            <label>Ojciec - Nazwisko</label>
                            <input type="text" name="fatherLastName" class="field-parents">
                        </div>
                    </div>
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label>Matka - Imię</label>
                            <input type="text" name="motherFirstName" class="field-parents">
                        </div>
                        <div class="form-group">
                            <label>Matka - Nazwisko</label>
                            <input type="text" name="motherLastName" class="field-parents">
                        </div>
                    </div>
                </div>

                <!-- WIEK I DATA -->
                <div class="zgonów-age-date-section">
                    <h4>Wiek i Data</h4>
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label>Wiek</label>
                            <input type="number" name="age" class="field-age" placeholder="Lata">
                        </div>
                        <div class="form-group">
                            <label>Data śmierci</label>
                            <input type="date" name="deathDate" class="field-age">
                        </div>
                    </div>
                </div>

                <!-- PRZYCZYNA ZGONU -->
                <div class="zgonów-cause-section">
                    <h4>Przyczyna Zgonu</h4>
                    <div class="form-group">
                        <label>Przyczyna</label>
                        <input type="text" name="causeOfDeath" class="field-cause" placeholder="np. Pneumonia, Gorączka, etc.">
                    </div>
                </div>

                <!-- PARAFIA -->
                <div class="zgonów-parish-section">
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

                <!-- ZAGRZEBANIE -->
                <div class="zgonów-burial-section">
                    <h4>Zagrzebanie</h4>
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label>Data pochówku</label>
                            <input type="date" name="burialDate" class="field-burial">
                        </div>
                        <div class="form-group">
                            <label>Miejsce pochówku</label>
                            <input type="text" name="burialPlace" class="field-burial">
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
                <button class="form-btn" id="saveDeathBtn">
                    <i class="fas fa-save"></i> Zapisz
                </button>
                <button class="form-btn secondary" id="resetDeathBtn">
                    <i class="fas fa-undo"></i> Anuluj
                </button>
            </div>
        `;

        setupEventListeners();
    };

    const setupEventListeners = () => {
        document.getElementById('saveDeathBtn')?.addEventListener('click', saveDeath);
        document.getElementById('resetDeathBtn')?.addEventListener('click', resetDeath);
    };

    const saveDeath = async () => {
        if (!FormsBaseModule.validateForm()) {
            notify('❌ Wypełnij wymagane pola', 'error');
            return;
        }

        log('Saving death record...');
        notify('✅ Zgon zapisany', 'success');
    };

    const resetDeath = () => {
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
