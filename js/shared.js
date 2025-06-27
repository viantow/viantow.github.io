// shared.js - Shared JavaScript for Devianto Store

$(document).ready(function() {
    // Variabel untuk menyimpan ID item yang akan dihapus sementara
    window.itemToDeleteId = null; // Make it global or pass as param

    // --- Helper Functions for LocalStorage Cart ---
    window.getCart = () => {
        const cartString = localStorage.getItem('deviantoCart');
        return cartString ? JSON.parse(cartString) : [];
    };

    window.saveCart = (cart) => {
        localStorage.setItem('deviantoCart', JSON.stringify(cart));
        // These updates will be called from specific page scripts if needed
        if (typeof updateCartDisplay === 'function') updateCartDisplay(); 
        if (typeof updateCheckoutSummary === 'function' && $('#checkout-section').length) updateCheckoutSummary();
        updateCartItemCountNavbar(); // Update cart count in navbar
    };

    window.addToCart = (product) => {
        let cart = getCart();
        
        const cartItemId = `${product.id}-${product.size}-${product.color}`;
        let existingItem = cart.find(item => item.cartItemId === cartItemId);

        if (existingItem) {
            existingItem.quantity += product.quantity;
        } else {
            cart.push({ ...product, cartItemId: cartItemId });
        }
        saveCart(cart);
        showToast('Produk Ditambahkan!', `"${product.name}" telah ditambahkan ke keranjang.`, 'success');
    };

    window.removeFromCart = (cartItemId) => {
        let cart = getCart();
        cart = cart.filter(item => item.cartItemId !== cartItemId);
        saveCart(cart);
        showToast('Item Dihapus!', 'Item berhasil dihapus dari keranjang.', 'info');
    };

    window.updateCartQuantity = (cartItemId, newQuantity) => {
        let cart = getCart();
        let item = cart.find(item => item.cartItemId === cartItemId);
        if (item) {
            item.quantity = newQuantity;
            if (item.quantity <= 0) {
                removeFromCart(cartItemId);
            } else {
                saveCart(cart);
            }
        }
    };

    window.calculateCartTotal = () => {
        let cart = getCart();
        let total = 0;
        let totalItems = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
            totalItems += item.quantity;
        });
        return { total, totalItems };
    };

    window.formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    window.clearCart = () => {
        localStorage.removeItem('deviantoCart');
        if (typeof updateCartDisplay === 'function') updateCartDisplay();
        if (typeof updateCheckoutSummary === 'function' && $('#checkout-section').length) updateCheckoutSummary();
        updateCartItemCountNavbar(); // Update cart count in navbar
    };

    // Update cart item count in navbar
    window.updateCartItemCountNavbar = () => {
        const { totalItems } = calculateCartTotal();
        $('#cart-item-count').text(totalItems);
    };


    // --- Toast Notification Function ---
    window.showToast = (title, message, type = 'info') => {
        const toastContainer = $('.toast-container');
        let iconClass = '';
        let headerBgClass = '';

        switch (type) {
            case 'success':
                iconClass = 'text-success fas fa-check-circle';
                headerBgClass = 'bg-success text-white';
                break;
            case 'error':
                iconClass = 'text-danger fas fa-times-circle';
                headerBgClass = 'bg-danger text-white';
                break;
            case 'warning':
                iconClass = 'text-warning fas fa-exclamation-triangle';
                headerBgClass = 'bg-warning text-dark';
                break;
            case 'info':
            default:
                iconClass = 'text-primary fas fa-info-circle';
                headerBgClass = 'bg-primary text-white';
                break;
        }

        const toastHtml = `
            <div class="toast align-items-center ${headerBgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="5000">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="${iconClass} me-2"></i> <strong>${title}</strong><br>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        const toastElement = $(toastHtml);
        toastContainer.append(toastElement);
        const bsToast = new bootstrap.Toast(toastElement[0]);
        bsToast.show();

        toastElement.on('hidden.bs.toast', function () {
            $(this).remove();
        });
    };

    // Initial cart item count update on page load for navbar
    updateCartItemCountNavbar();
});