/**
 * Cart - Cart page logic. Uses PizzaAPI for AJAX quantity updates.
 */
const Cart = {
    async updateQuantity(itemId, change) {
        const input = document.getElementById('qty_' + itemId);
        if (!input) return;
        const newValue = parseInt(input.value) + change;
        if (newValue >= 1) {
            const result = await PizzaAPI.post('cart.php', {
                cart_id: itemId,
                cart_quantity: newValue
            });
            if (result.ok && result.data === 'success') {
                window.location.reload();
            }
        }
    },

    removeItem(itemId) {
        if (confirm('Are you sure you want to remove this item from your cart?')) {
            window.location.href = 'cart.php?delete=' + itemId;
        }
    },

    init() {
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', function () {
                const itemId = this.id.replace('qty_', '');
                const newValue = parseInt(this.value);
                if (newValue >= 1) {
                    const change = newValue - parseInt(this.defaultValue);
                    Cart.updateQuantity(parseInt(itemId), change);
                }
            });
        });
    }
};

window.updateQuantity = function (itemId, change) { Cart.updateQuantity(itemId, change); };
window.removeItem = function (itemId) { Cart.removeItem(itemId); };
document.addEventListener('DOMContentLoaded', function () { Cart.init(); });

