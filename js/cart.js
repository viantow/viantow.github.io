// cart.js - Specific JavaScript for cart.html

$(document).ready(function() {
    // --- Update Cart Display (for cart.html) ---
    window.updateCartDisplay = () => {
        const cart = getCart();
        const cartContainer = $('#cart-items-container');
        if (cartContainer.length === 0) return; 

        cartContainer.empty(); 

        if (cart.length === 0) {
            cartContainer.html('<p class="text-center text-muted" id="empty-cart-message">Keranjang kamu kosong. <a href="products.html">Mulai belanja sekarang!</a></p>');
        } else {
            $('#empty-cart-message').remove(); 
            cart.forEach(item => {
                const itemHtml = `
                    <div class="cart-item d-flex align-items-center mb-3 p-3 border rounded shadow-sm-sm">
                        <img src="${item.image || '../img/placeholder.jpg'}" class="cart-item-img me-3 rounded" alt="${item.name}">
                        <div class="flex-grow-1">
                            <h5 class="mb-1">${item.name}</h5>
                            <p class="text-muted mb-1 small">${item.size && item.size !== 'Default' ? 'Ukuran: ' + item.size : ''}${item.color && item.color !== 'Default' ? ', Warna: ' + item.color : ''}</p>
                            <p class="text-maroon fw-bold mb-1">${formatRupiah(item.price)}</p>
                            <div class="d-flex align-items-center">
                                <button class="btn btn-sm btn-outline-secondary update-quantity-btn" data-cart-item-id="${item.cartItemId}" data-action="decrease">-</button>
                                <input type="number" class="form-control form-control-sm mx-2 text-center" style="width: 60px;" value="${item.quantity}" min="1" data-cart-item-id="${item.cartItemId}">
                                <button class="btn btn-sm btn-outline-secondary update-quantity-btn" data-cart-item-id="${item.cartItemId}" data-action="increase">+</button>
                            </div>
                        </div>
                        <button class="btn btn-danger btn-sm remove-from-cart-btn" data-cart-item-id="${item.cartItemId}" data-bs-toggle="modal" data-bs-target="#confirmDeleteModal" data-item-name="${item.name}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                cartContainer.append(itemHtml);
            });
        }

        const { total, totalItems } = calculateCartTotal();
        $('#total-items-count').text(totalItems);
        $('#cart-total-amount').text(formatRupiah(total));
    };

    // --- Cart Page Specific Logic ---
    if ($('#shopping-cart-section').length) { 
        updateCartDisplay();

        $(document).on('click', '.remove-from-cart-btn', function() {
            itemToDeleteId = $(this).data('cart-item-id');
            const itemName = $(this).data('item-name'); 
            $('#itemToDeleteName').text(itemName); 
        });

        $('#confirmDeleteBtn').on('click', function() {
            if (itemToDeleteId) {
                removeFromCart(itemToDeleteId);
                itemToDeleteId = null; 
                $('#confirmDeleteModal').modal('hide'); 
            }
        });

        $(document).on('click', '.update-quantity-btn', function() {
            const cartItemId = $(this).data('cart-item-id');
            const action = $(this).data('action');
            const quantityInput = $(this).siblings('input[type="number"]');
            let currentQuantity = parseInt(quantityInput.val());

            if (action === 'increase') {
                currentQuantity++;
            } else if (action === 'decrease') {
                currentQuantity--;
            }
            updateCartQuantity(cartItemId, currentQuantity);
        });

        $(document).on('change', '#cart-items-container input[type="number"]', function() {
            const cartItemId = $(this).data('cart-item-id');
            const newQuantity = parseInt($(this).val());
            updateCartQuantity(cartItemId, newQuantity);
        });

        $('#checkout-btn').on('click', function() {
            const cart = getCart();
            if (cart.length === 0) {
                showToast('Keranjang Kosong!', 'Keranjang kamu masih kosong. Tambahkan produk sebelum checkout!', 'warning'); 
                return;
            }
            window.location.href = 'checkout.html';
        });
    }
});