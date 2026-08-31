/**
 * ProductDetails - Product detail page pricing and interaction logic.
 * Reads config from data attributes: <form data-base-price="199.00">
 */
const ProductDetails = {
    basePrice: 0,
    isLoggedIn: false,

    init() {
        const form = document.querySelector('form[data-base-price]');
        if (form) this.basePrice = parseFloat(form.getAttribute('data-base-price')) || 0;
        this.isLoggedIn = Auth.isUserLoggedIn();

        const orderBtn = document.getElementById('order-btn');
        if (orderBtn) {
            orderBtn.addEventListener('click', (event) => {
                if (!this.isLoggedIn) {
                    event.preventDefault();
                    alert('You must be logged in to add items to the cart.');
                }
            });
        }

        document.querySelectorAll('input[name="size"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateTotal());
        });

        document.querySelectorAll('.topping-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                const parentDiv = checkbox.closest('.topping-item');
                if (parentDiv) {
                    parentDiv.classList.toggle('selected', checkbox.checked);
                }
                ProductDetails.updateTotal();
            });
        });

        this.updateTotal();
    },

    updateQuantity(change) {
        const input = document.getElementById('quantity-input');
        if (!input) return;
        const newValue = parseInt(input.value) + change;
        if (newValue >= 1) {
            input.value = newValue;
            this.updateTotal();
        }
    },

    updateTotal() {
        const quantity = parseInt(document.getElementById('quantity-input')?.value) || 1;
        let sizePrice = 0;
        const selectedSize = document.querySelector('input[name="size"]:checked');
        if (selectedSize) sizePrice = parseFloat(selectedSize.dataset.price) || 0;

        let toppingsTotal = 0;
        document.querySelectorAll('.topping-item input[type="checkbox"]:checked').forEach(checkbox => {
            const priceEl = checkbox.closest('.topping-item')?.querySelector('.topping-price');
            if (priceEl) {
                const price = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''));
                if (!isNaN(price)) toppingsTotal += price;
            }
        });

        const total = (this.basePrice + sizePrice + toppingsTotal) * quantity;
        const totalEl = document.getElementById('total-price');
        if (totalEl) totalEl.textContent = total.toFixed(2);
    }
};

window.updateQuantity = function (change) { ProductDetails.updateQuantity(change); };
document.addEventListener('DOMContentLoaded', function () { ProductDetails.init(); });

