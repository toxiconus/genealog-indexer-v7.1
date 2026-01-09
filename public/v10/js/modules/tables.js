/* ===== TABLES.JS - Dolne tabele z danymi ===== */

const TablesModule = (() => {
    let state = {
        data: [],
        sortBy: 'id',
        sortOrder: 'asc',
        currentPage: 1,
        pageSize: 25,
    };

    const init = async () => {
        log('📊 Tables init');
        render();
    };

    const render = () => {
        const container = document.getElementById('bottom-tables');
        if (!container) return;

        container.innerHTML = `
            <div class="tables-header">
                <h3 class="tables-title">Rekordy</h3>
                <div class="tables-controls">
                    <input type="text" class="tables-search-input" placeholder="Szukaj...">
                    <button class="tables-btn export">
                        <i class="fas fa-download"></i> Eksport
                    </button>
                </div>
            </div>

            <div class="tables-tabs">
                <div class="table-tab active" data-table="all">
                    📊 Wszystkie (0)
                </div>
                <div class="table-tab" data-table="chrztów">
                    📜 Chrzty (0)
                </div>
                <div class="table-tab" data-table="małżeństw">
                    💍 Małżeństwa (0)
                </div>
                <div class="table-tab" data-table="zgonów">
                    ⚰️ Zgony (0)
                </div>
            </div>

            <div class="table-content active" id="table-all">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th class="sortable" data-field="id">ID</th>
                            <th class="sortable" data-field="type">Typ</th>
                            <th class="sortable" data-field="name">Osoba</th>
                            <th class="sortable" data-field="date">Data</th>
                            <th class="sortable" data-field="status">Status</th>
                            <th>Akcje</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody-all">
                        <tr>
                            <td colspan="6" style="text-align: center; padding: 40px;">
                                <div class="table-empty">
                                    <div class="table-empty-icon">📁</div>
                                    <div class="table-empty-text">Brak danych</div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="table-footer">
                <div class="table-stats">
                    <span>Razem: <strong id="totalRecords">0</strong></span>
                    <span>Strona: <strong id="currentPageInfo">1</strong></span>
                </div>
                <div class="table-pagination">
                    <button class="pagination-btn" id="prevPageBtn">←</button>
                    <span class="pagination-info" id="pageInfo">1 / 1</span>
                    <button class="pagination-btn" id="nextPageBtn">→</button>
                </div>
            </div>
        `;

        setupEventListeners();
    };

    const setupEventListeners = () => {
        // Tab switching
        document.querySelectorAll('.table-tab').forEach((tab) => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.table-tab').forEach((t) => t.classList.remove('active'));
                document.querySelectorAll('.table-content').forEach((t) => t.classList.remove('active'));
                e.target.classList.add('active');
                const tableId = `table-${e.target.dataset.table}`;
                document.getElementById(tableId)?.classList.add('active');
            });
        });

        // Column sorting
        document.querySelectorAll('th.sortable').forEach((th) => {
            th.addEventListener('click', () => {
                const field = th.dataset.field;
                if (state.sortBy === field) {
                    state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    state.sortBy = field;
                    state.sortOrder = 'asc';
                }
                renderTable();
            });
        });

        // Pagination
        document.getElementById('prevPageBtn')?.addEventListener('click', () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                renderTable();
            }
        });

        document.getElementById('nextPageBtn')?.addEventListener('click', () => {
            state.currentPage++;
            renderTable();
        });

        // Export
        document.querySelector('.tables-btn.export')?.addEventListener('click', () => {
            exportData();
        });
    };

    const renderTable = () => {
        log('Rendering table...');
        // Implement table rendering
    };

    const addRow = (data) => {
        state.data.push(data);
        renderTable();
    };

    const updateRow = (id, data) => {
        const index = state.data.findIndex((row) => row.id === id);
        if (index !== -1) {
            state.data[index] = { ...state.data[index], ...data };
            renderTable();
        }
    };

    const deleteRow = (id) => {
        state.data = state.data.filter((row) => row.id !== id);
        renderTable();
    };

    const exportData = () => {
        log('Exporting data...');
        notify('📤 Eksportowanie...', 'info');
        // Implement CSV/JSON export
    };

    return {
        init,
        render,
        addRow,
        updateRow,
        deleteRow,
        exportData,
        getState: () => ({ ...state }),
    };
})();
