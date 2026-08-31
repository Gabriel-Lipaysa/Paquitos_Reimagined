/**
 * AdminTable - Shared Admin Table Utilities
 * 
 * Consolidates duplicated code from admin pages.
 */
const AdminTable = {
    initSorting() {
        document.querySelectorAll('th').forEach(headerCell => {
            headerCell.style.cursor = 'pointer';
            headerCell.addEventListener('click', () => {
                const tableElement = headerCell.closest('table');
                if (!tableElement) return;
                const headerIndex = Array.prototype.indexOf.call(
                    headerCell.parentElement.children, headerCell
                );
                const currentIsAscending = headerCell.classList.contains('th-sort-asc');
                AdminTable.sortByColumn(tableElement, headerIndex, !currentIsAscending);
            });
        });
    },

    sortByColumn(table, column, asc = true) {
        const dirModifier = asc ? 1 : -1;
        const tBody = table.tBodies[0];
        if (!tBody) return;
        const rows = Array.from(tBody.querySelectorAll('tr'));

        const sortedRows = rows.sort((a, b) => {
            const aColText = a.querySelector(`td:nth-child(${column + 1})`)?.textContent.trim() || '';
            const bColText = b.querySelector(`td:nth-child(${column + 1})`)?.textContent.trim() || '';
            return aColText > bColText ? (1 * dirModifier) : (-1 * dirModifier);
        });

        while (tBody.firstChild) {
            tBody.removeChild(tBody.firstChild);
        }
        tBody.append(...sortedRows);

        table.querySelectorAll('th').forEach(th =>
            th.classList.remove('th-sort-asc', 'th-sort-desc')
        );
        const targetTh = table.querySelector(`th:nth-child(${column + 1})`);
        if (targetTh) {
            targetTh.classList.toggle('th-sort-asc', asc);
            targetTh.classList.toggle('th-sort-desc', !asc);
        }
    },

    confirmDelete(label, id, baseUrl) {
        if (confirm(`Are you sure you want to delete this ${label}?`)) {
            const url = baseUrl || window.location.pathname;
            window.location.href = `${url}?delete=${id}`;
        }
    },

    previewImage(event, previewElementId) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById(previewElementId);
            if (!preview) return;
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width:100%;max-height:200px;object-fit:contain;">`;
        };
        reader.readAsDataURL(file);
    },

    initSearch(config) {
        const input = document.querySelector(config.inputSelector);
        if (!input) return;
        let debounceTimeout;

        const performSearch = () => {
            const searchTerm = input.value.toLowerCase().trim();
            const rows = document.querySelectorAll(config.rowSelector);
            let visibleCount = 0;

            rows.forEach(row => {
                let matches = false;
                config.searchColumns.forEach(colIndex => {
                    const cell = row.querySelector(`td:nth-child(${colIndex})`);
                    if (cell && cell.textContent.toLowerCase().includes(searchTerm)) {
                        matches = true;
                    }
                });
                row.style.display = matches ? '' : 'none';
                if (matches) visibleCount++;
            });

            if (config.onFilter) config.onFilter(visibleCount);
        };

        input.addEventListener('input', function () {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(performSearch, 300);
        });
        performSearch();
    },

    populateModal(fieldMap) {
        for (const [elementId, value] of Object.entries(fieldMap)) {
            const el = document.getElementById(elementId);
            if (el) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
                    el.value = value;
                } else if (value && typeof value === 'string' && (value.startsWith('http') || value.startsWith('uploads/') || value.startsWith('uploaded_img/'))) {
                    el.innerHTML = `<img src="${value}" alt="Current Image">`;
                } else {
                    el.textContent = value || '';
                }
            }
        }
    }
};

