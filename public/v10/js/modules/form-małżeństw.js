/* ===== FORM-MAŁŻEŃSTW.JS - Formularz małżeństwa ===== */

const FormMałżeństwaModule = (() => {
    let state = {
        groom: {},
        bride: {},
        witnesses: [],
        parish: {},
        impediments: [],
    };

    const init = async () => {
        log('💍 Form Małżeństwa init');
        render();
    };

    const render = () => {
        const formContainer = document.getElementById('form-małżeństw');
        if (!formContainer) return;

        formContainer.innerHTML = `
            <div class="form-content">
                <!-- ŽENICH -->
                <div class="małżeństwa-groom-section">
                    <h4>Ženich</h4>
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label>Imię</label>
                            <input type="text" name="groomFirstName" class="field-groom">
                        </div>
                        <div class="form-group">
                            <label>Nazwisko</label>
                            <input type="text" name="groomLastName" class="field-groom">
                        </div>
                    </div>
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label>Wiek / Data urodzenia</label>
                            <input type="text" name="groomAge" class="field-groom">
                        </div>
                        <div class="form-group">
                            <label>Pochodzenie</label>
                            <input type="text" name="groomOrigin" class="field-groom">
                        </div>
                    </div>
                </div>

                <!-- PANNA MŁODA -->
                <div class="małżeństwa-bride-section">
                    <h4>Panna Młoda</h4>
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label>Imię</label>
                            <input type="text" name="brideFirstName" class="field-bride">
                        </div>
                        <div class="form-group">
                            <label>Nazwisko</label>
                            <input type="text" name="brideLastName" class="field-bride">
                        </div>
                    </div>
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label>Wiek / Data urodzenia</label>
                            <input type="text" name="brideAge" class="field-bride">
                        </div>
                        <div class="form-group">
                            <label>Pochodzenie</label>
                            <input type="text" name="brideOrigin" class="field-bride">
                        </div>
                    </div>
                </div>

                <!-- ŚWIADKOWIE -->
                <div class="małżeństwa-witnesses-section">
                    <h4>Świadkowie</h4>
                    <div id="witnessesContainer" class="witnesses-list"></div>
                    <button class="add-witness-btn" id="addWitnessBtn" type="button">
                        <i class="fas fa-plus"></i> Dodaj świadka
                    </button>
                </div>

                <!-- PARAFIA -->
                <div class="małżeństwa-parish-section">
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
                            <label>Data małżeństwa</label>
                            <input type="date" name="marriageDate" class="field-parish">
                        </div>
                    </div>
                </div>

                <!-- PRZESZKODY -->
                <div class="małżeństwa-impediments-section">
                    <h4>Przeszkody i Dyspensa</h4>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="consanguinity"> Pokrewieństwo
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="affinity"> Powinowactwo
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="dispensa"> Dyspensa
                        </label>
                    </div>
                    <div class="form-group">
                        <label>Treść dypensy</label>
                        <textarea name="dispensaText" placeholder="Opis dypensy..."></textarea>
                    </div>
                </div>

                <!-- UWAGI -->
                <div class="form-group">
                    <label>Uwagi</label>
                    <textarea name="notes" placeholder="Dodatkowe informacje..."></textarea>
                </div>
            </div>

            <div class="form-actions">
                <button class="form-btn" id="saveMarriageBtn">
                    <i class="fas fa-save"></i> Zapisz
                </button>
                <button class="form-btn secondary" id="resetMarriageBtn">
                    <i class="fas fa-undo"></i> Anuluj
                </button>
            </div>
        `;

        setupEventListeners();
    };

    const setupEventListeners = () => {
        document.getElementById('saveMarriageBtn')?.addEventListener('click', saveMarriage);
        document.getElementById('resetMarriageBtn')?.addEventListener('click', resetMarriage);
        document.getElementById('addWitnessBtn')?.addEventListener('click', addWitness);
    };

    const addWitness = () => {
        log('Adding witness');
        notify('Dodaj świadka', 'info');
    };

    const saveMarriage = async () => {
        if (!FormsBaseModule.validateForm()) {
            notify('❌ Wypełnij wymagane pola', 'error');
            return;
        }

        log('Saving marriage record...');
        notify('✅ Małżeństwo zapisane', 'success');
    };

    const resetMarriage = () => {
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
