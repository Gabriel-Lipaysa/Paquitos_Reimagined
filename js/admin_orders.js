/**
 * AdminOrders - Admin orders page logic. Uses PizzaAPI for async payment updates.
 */
const AdminOrders = {
    debounceTimeout: null,

    init() {
        const searchInput = document.querySelector('input[name="search_query"]');
        const statusFilter = document.querySelector('select[name="payment_status_filter"]');
        if (!searchInput || !statusFilter) return;

        searchInput.addEventListener('input', () => {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => this.performSearch(searchInput, statusFilter), 300);
        });

        statusFilter.addEventListener('change', () => this.performSearch(searchInput, statusFilter));
        this.performSearch(searchInput, statusFilter);
    },

    performSearch(searchInput, statusFilter) {
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = statusFilter.value.toLowerCase();
        const rows = document.querySelectorAll('table tbody tr');

        rows.forEach(row => {
            const nameCell = row.querySelector('td:nth-child(3)');
            const addressCell = row.querySelector('td:nth-child(5)');
            const statusCell = row.querySelector('td:nth-child(9)');
            if (!nameCell || !addressCell || !statusCell) return;

            const name = nameCell.textContent.toLowerCase();
            const address = addressCell.textContent.toLowerCase();
            const completedButton = statusCell.querySelector('.completed-btn');
            const pendingButton = statusCell.querySelector('.mark-completed-btn');
            let currentStatus = completedButton ? 'completed' : (pendingButton ? 'pending' : '');

            const matchesSearch = name.includes(searchTerm) || address.includes(searchTerm);
            const matchesFilter = !filterValue || currentStatus === filterValue;
            row.style.display = matchesSearch && matchesFilter ? '' : 'none';
        });
        this.updateTotalCount();
    },

    updateTotalCount() {
        const allRows = document.querySelectorAll('table tbody tr');
        const visibleRows = Array.from(allRows).filter(row => row.style.display !== 'none');
        const totalEl = document.querySelector('.total-items');
        if (totalEl) totalEl.textContent = `Total: ${visibleRows.length}`;
    },

    async updatePaymentStatus(button) {
        try {
            if (!confirm('Are you sure? Once marked as completed, this cannot be changed.')) return;
            const form = button.closest('form');
            const orderID = form.querySelector('input[name="order_id"]').value;
            const cell = button.closest('td');

            button.disabled = true;
            button.textContent = 'Processing...';

            const result = await PizzaAPI.post(window.location.href, {
                order_id: orderID, update_payment: '1', ajax: '1'
            });

            if (!result.ok) throw new Error(`HTTP error! status: ${result.status}`);
            const data = result.data;
            if (data.status === 'success') {
                const completedBtn = document.createElement('button');
                completedBtn.className = 'completed-btn';
                completedBtn.disabled = true;
                completedBtn.textContent = 'Completed';
                cell.innerHTML = '';
                cell.appendChild(completedBtn);
                alert(data.message || 'Payment status updated!');
            } else {
                throw new Error(data.message || 'Failed to update');
            }
        } catch (error) {
            button.disabled = false;
            button.textContent = 'Mark as Completed';
            alert('Error: ' + error.message);
        }
    },

    alertUserEmail(email) {
        alert("The email that will be sent is to: " + email);
    }
};

window.updatePaymentStatus = function (button) { AdminOrders.updatePaymentStatus(button); };
window.alertUserEmail = function (email) { AdminOrders.alertUserEmail(email); };
document.addEventListener('DOMContentLoaded', function () { AdminOrders.init(); });

