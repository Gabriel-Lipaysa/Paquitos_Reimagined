/**
 * MenuFilter - Customer menu search and price range filtering.
 */
const MenuFilter = {
    debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    init() {
        const searchInput = document.getElementById('menuSearch');
        const priceButtons = document.querySelectorAll('.price-btn');
        const menuItems = document.querySelectorAll('.box');
        if (!searchInput) return;

        menuItems.forEach(item => {
            item.style.transition = 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out';
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
        });

        const filterMenu = () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            const activePriceBtn = document.querySelector('.price-btn.active');
            const activePrice = activePriceBtn ? activePriceBtn.dataset.price : 'all';

            menuItems.forEach(item => {
                const nameEl = item.querySelector('.name');
                const name = nameEl ? nameEl.textContent.toLowerCase() : '';
                const priceEl = item.querySelector('.price');
                const priceText = priceEl ? priceEl.textContent.replace('₱', '').trim() : '0';
                const price = parseFloat(priceText);
                const matchesSearch = name.includes(searchTerm);
                const matchesPrice = MenuFilter.getPriceRangeMatch(price, activePrice);

                if (matchesSearch && matchesPrice) {
                    item.style.display = 'block';
                    setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => { item.style.display = 'none'; }, 200);
                }
            });
            MenuFilter.updateNoResultsMessage(menuItems);
        };

        searchInput.addEventListener('input', MenuFilter.debounce(() => filterMenu(), 300));
        priceButtons.forEach(button => {
            button.addEventListener('click', () => {
                priceButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                filterMenu();
            });
        });
        filterMenu();
    },

    getPriceRangeMatch(price, activePrice) {
        switch (activePrice) {
            case 'all': return true;
            case '200': return price < 200;
            case '400': return price >= 200 && price < 400;
            case '600': return price >= 400 && price < 600;
            case '601': return price >= 600;
            default: return true;
        }
    },

    updateNoResultsMessage(menuItems) {
        const hasVisible = Array.from(menuItems).some(item => item.style.display !== 'none');
        let noResultsMsg = document.querySelector('.no-results-message');
        if (!hasVisible) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('p');
                noResultsMsg.className = 'no-results-message';
                noResultsMsg.textContent = 'No products match your search criteria';
                const container = document.querySelector('.box-container');
                if (container) container.appendChild(noResultsMsg);
            }
            noResultsMsg.style.display = 'block';
        } else if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    }
};

document.addEventListener('DOMContentLoaded', function () { MenuFilter.init(); });

