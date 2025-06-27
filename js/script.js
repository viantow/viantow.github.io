// Custom JavaScript for Devianto Store

// productsData sekarang diasumsikan sudah ada dari products-data.js
// Anda TIDAK perlu mendeklarasikan productsData di sini lagi.

$(document).ready(function() {
    // Variabel untuk menyimpan ID item yang akan dihapus sementara
    let itemToDeleteId = null; 

    // --- Helper Functions for LocalStorage Cart ---
    const getCart = () => {
        const cartString = localStorage.getItem('deviantoCart');
        return cartString ? JSON.parse(cartString) : [];
    };

    const saveCart = (cart) => {
        localStorage.setItem('deviantoCart', JSON.stringify(cart));
        updateCartDisplay(); 
        if ($('#checkout-section').length) {
            updateCheckoutSummary();
        }
        updateCartItemCountNavbar(); // Update cart count in navbar
    };

    const addToCart = (product) => {
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

    const removeFromCart = (cartItemId) => {
        let cart = getCart();
        cart = cart.filter(item => item.cartItemId !== cartItemId);
        saveCart(cart);
        showToast('Item Dihapus!', 'Item berhasil dihapus dari keranjang.', 'info');
    };

    const updateCartQuantity = (cartItemId, newQuantity) => {
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

    const calculateCartTotal = () => {
        let cart = getCart();
        let total = 0;
        let totalItems = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
            totalItems += item.quantity;
        });
        return { total, totalItems };
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    const clearCart = () => {
        localStorage.removeItem('deviantoCart');
        updateCartDisplay();
        if ($('#checkout-section').length) {
            updateCheckoutSummary();
        }
        updateCartItemCountNavbar(); // Update cart count in navbar
    };

    // Update cart item count in navbar
    const updateCartItemCountNavbar = () => {
        const { totalItems } = calculateCartTotal();
        $('#cart-item-count').text(totalItems);
    };


    // --- Toast Notification Function ---
    const showToast = (title, message, type = 'info') => {
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


    // --- Update Cart Display (for cart.html) ---
    const updateCartDisplay = () => {
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

    // --- Update Checkout Summary (for checkout.html) ---
    const updateCheckoutSummary = () => {
        const cart = getCart();
        const summaryContainer = $('#checkout-cart-summary');
        if (summaryContainer.length === 0) return; 

        summaryContainer.empty();

        if (cart.length === 0) {
            summaryContainer.html('<p class="text-center text-muted">Keranjang kosong. Silakan belanja terlebih dahulu.</p>');
            $('#place-order-btn').prop('disabled', true); 
        } else {
            $('#place-order-btn').prop('disabled', false); 
            cart.forEach(item => {
                const itemHtml = `
                    <div class="d-flex align-items-center mb-2">
                        <img src="${item.image || '../img/placeholder.jpg'}" class="me-2 rounded" style="width: 50px; height: 50px; object-fit: cover;" alt="${item.name}">
                        <div class="flex-grow-1">
                            <p class="mb-0 fw-bold">${item.name}</p>
                            <p class="mb-0 small text-muted">${item.quantity} x ${formatRupiah(item.price)} ${item.size && item.size !== 'Default' ? ' (Uk: ' + item.size + ')' : ''}${item.color && item.color !== 'Default' ? ' (Wr: ' + item.color + ')' : ''}</p>
                        </div>
                        <span class="fw-bold">${formatRupiah(item.price * item.quantity)}</span>
                    </div>
                `;
                summaryContainer.append(itemHtml);
            });
        }

        const { total, totalItems } = calculateCartTotal();
        $('#total-items-summary').text(totalItems);
        $('#cart-total-summary').text(formatRupiah(total));
    };


    // --- Event Listeners ---

    // Smooth scroll for nav links (on index.html only)
    $('a.nav-link').on('click', function(event) {
        const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
        const isInternalSectionLink = this.hash !== "" && $(this.hash).length;

        if (isIndexPage && isInternalSectionLink) {
            event.preventDefault();
            var hash = this.hash;
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 800, function(){
                window.location.hash = hash;
            });
        }
    });

    // Handle Add to Cart button click on Product List (products.html) and Featured Products (index.html)
    // Sekarang akan mengarahkan ke halaman detail, karena tombol 'Tambah' di products.html
    // juga punya data-product-id.
    $(document).on('click', '.add-to-cart-btn', function() {
        const productId = $(this).data('product-id');
        window.location.href = `product-detail.html?id=${productId}`;
    });
    
    // --- NEW: Function to load and display products dynamically for products.html ---
    const loadProductsToPage = () => {
        const productListContainer = $('#product-list-container');
        if (productListContainer.length === 0) return; // Only run if on products.html

        productListContainer.empty(); // Clear existing content

        // Convert productsData object to an array to sort by ID, if desired
        const productsArray = Object.keys(productsData).map(key => ({
            id: key,
            ...productsData[key]
        }));

        productsArray.forEach(product => {
            const productHtml = `
                <div class="col-md-4 mb-4 product-item ${product.category}">
                    <div class="card shadow-sm h-100">
                        <img src="${product.images[0] || '../img/placeholder.jpg'}" class="card-img-top" alt="${product.name}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title text-maroon">${product.name}</h5>
                            <p class="card-price fw-bold text-dark fs-5">${formatRupiah(product.price)}</p>
                            <div class="mt-3 d-flex justify-content-center">
                                <a href="product-detail.html?id=${product.id}" class="btn btn-outline-primary btn-sm rounded-pill me-2">Lihat Detail</a>
                                <button class="btn btn-maroon btn-sm rounded-pill add-to-cart-btn" 
                                    data-product-id="${product.id}"
                                    data-product-name="${product.name}"
                                    data-product-price="${product.price}">
                                    <i class="fas fa-shopping-cart me-1"></i> Tambah
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            productListContainer.append(productHtml);
        });
    };

    // --- Logic for filtering products (modified for query parameter) ---
    // Function to apply category filter and update UI
    const applyCategoryFilter = (category) => {
        $('.category-filter-list .list-group-item').removeClass('active');
        if (category === 'all' || !category) {
            $('.product-item').show();
            // Ensure "Semua Kategori" is active when 'all' or no category is selected
            $('.category-filter-list .list-group-item[data-filter="all"]').addClass('active');
        } else {
            $('.product-item').hide();
            // Show products that have the matching category class
            $(`.product-item.${category}`).show(); 
            // Activate the corresponding filter item in the sidebar
            $('.category-filter-list .list-group-item[data-filter="' + category + '"]').addClass('active');
        }
    };

    // Event listener for category filter click in products.html sidebar
    // This will update the URL and apply the filter
    $('.category-filter-list .list-group-item').on('click', function(e) {
        e.preventDefault();
        const filter = $(this).data('filter');
        const newUrl = new URL(window.location.href);
        if (filter === 'all') {
            newUrl.searchParams.delete('category');
        } else {
            newUrl.searchParams.set('category', filter);
        }
        window.history.pushState({ path: newUrl.href }, '', newUrl.href); // Change URL without reloading
        applyCategoryFilter(filter); // Apply filter immediately
    });

    // Initial filter application when products.html loads
    // This is the crucial part that handles direct URL access or navigation from index.html
    if ($('#all-products').length) { // Menggunakan #all-products sesuai dengan ID section di products.html
        loadProductsToPage(); // NEW: Load products when products.html is ready
        const urlParams = new URLSearchParams(window.location.search);
        const categoryFromUrl = urlParams.get('category');
        // Call applyCategoryFilter with the category from the URL, or 'all' if not present
        applyCategoryFilter(categoryFromUrl || 'all');
    }

    // --- Function to Load Product Detail ---
    const loadProductDetail = (productId) => { 
        const product = productsData?.[productId]; // Gunakan productsData global

        if (product) {
            $('#product-name').text(product.name);
            $('#product-price').text(formatRupiah(product.price));
            $('#product-description').html(product.description.replace(/\n/g, '<br>')); // Handle newlines
            
            // Set main image
            $('#main-product-image').attr('src', product.images[0] || '../img/placeholder.jpg');

            // Clear previous thumbnails
            $('#product-thumbnails').empty();
            // Generate thumbnails
            if (product.images && product.images.length > 0) {
                product.images.forEach((imgSrc, index) => {
                    const thumbnailClass = index === 0 ? 'active' : ''; // Mark first as active
                    const thumbnailHtml = `
                        <div class="col-3 col-md-2 mb-3">
                            <img src="${imgSrc}" class="img-fluid rounded border thumbnail-image ${thumbnailClass}" alt="Thumbnail ${index + 1}" data-full-image="${imgSrc}">
                        </div>
                    `;
                    $('#product-thumbnails').append(thumbnailHtml);
                });

                // Add click listener for thumbnails to change main image
                // Ensure this event listener is attached only once
                $(document).off('click', '.thumbnail-image').on('click', '.thumbnail-image', function() {
                    const fullImageUrl = $(this).data('full-image');
                    $('#main-product-image').attr('src', fullImageUrl);
                    $('.thumbnail-image').removeClass('active'); // Remove active from all
                    $(this).addClass('active'); // Add active to clicked
                });
            } else {
                // If no images are specified, show a placeholder
                $('#product-thumbnails').append(`
                    <div class="col-12 text-center text-muted">Tidak ada gambar tambahan.</div>
                `);
            }

            $('#product-size').empty().append('<option selected disabled>Pilih Ukuran</option>');
            product.sizes?.forEach(size => {
                $('#product-size').append(`<option value="${size}">${size}</option>`);
            });

            $('#product-color').empty().append('<option selected disabled>Pilih Warna</option>');
            product.colors?.forEach(color => {
                $('#product-color').append(`<option value="${color}">${color}</option>`);
            });
            
            $('#buy-now-btn').data({
                'product-id': productId,
                'product-name': product.name,
                'product-price': product.price,
                'product-image': product.images[0] || '../img/placeholder.jpg'
            });
            $('#add-to-cart-btn').data({
                'product-id': productId,
                'product-name': product.name,
                'product-price': product.price,
                'product-image': product.images[0] || '../img/placeholder.jpg'
            });

        } else {
            $('#product-detail-section .container').html('<div class="alert alert-danger text-center" role="alert">Produk tidak ditemukan!</div><div class="text-center"><a href="products.html" class="btn btn-primary mt-3">Kembali ke Daftar Produk</a></div>');
        }
    };

    // --- Inisialisasi Logika yang bergantung pada productsData ---
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId && $('#product-detail-section').length) { 
        loadProductDetail(productId); 
    }
    
    // Handle Add to Cart & Buy Now button click on Product Detail Page (product-detail.html)
    $(document).on('click', '#add-to-cart-btn, #buy-now-btn', function() {
        const productId = $(this).data('product-id');
        const productName = $(this).data('product-name');
        const productPrice = $(this).data('product-price');
        const selectedSize = $('#product-size').val();
        const selectedColor = $('#product-color').val();
        const quantity = parseInt($('#product-quantity').val());
        const productImage = $('#main-product-image').attr('src'); 

        if (!selectedSize || selectedSize === 'Pilih Ukuran' || !selectedColor || selectedColor === 'Pilih Warna' || isNaN(quantity) || quantity < 1) {
            showToast('Peringatan!', 'Mohon lengkapi pilihan ukuran, warna, dan kuantitas.', 'warning'); 
            return;
        }

        const product = {
            id: productId,
            name: productName,
            price: productPrice,
            quantity: quantity,
            size: selectedSize,
            color: selectedColor,
            image: productImage 
        };

        addToCart(product);

        if ($(this).attr('id') === 'buy-now-btn') {
            window.location.href = 'cart.html'; 
        }
    });


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

    // --- Checkout Page Specific Logic ---
    if ($('#checkout-section').length) {
        updateCheckoutSummary(); 

        $('#checkout-form').on('submit', function(e) {
            e.preventDefault(); 

            const customerName = $('#customerName').val();
            const customerPhone = $('#customerPhone').val();
            const customerAddress = $('#customerAddress').val();
            const customerNotes = $('#customerNotes').val();
            const paymentMethod = $('input[name="paymentMethod"]:checked').val();

            const cart = getCart();
            if (cart.length === 0) {
                showToast('Keranjang Kosong!', 'Keranjang belanja kamu kosong. Tidak ada yang bisa di pesan!', 'warning'); 
                return;
            }
            
            if (!customerPhone.match(/^\d+$/) || customerPhone.length < 9) { 
                showToast('Input Tidak Valid!', 'Nomor telepon harus angka dan minimal 9 digit.', 'error');
                return;
            }
            if (!customerName || !customerAddress || !paymentMethod) {
                showToast('Form Belum Lengkap!', 'Mohon lengkapi semua informasi pengiriman dan metode pembayaran.', 'warning');
                return;
            }

            const { total } = calculateCartTotal();

            let orderDetails = `*Pesanan Baru Devianto Store*\n\n`;
            orderDetails += `*Nama:* ${customerName}\n`;
            orderDetails += `*No. HP (WA):* ${customerPhone}\n`;
            orderDetails += `*Alamat:* ${customerAddress}\n`;
            if (customerNotes) {
                orderDetails += `*Catatan:* ${customerNotes}\n`;
            }
            orderDetails += `*Metode Pembayaran:* ${paymentMethod}\n\n`;
            orderDetails += `*Detail Pesanan:*\n`;

            cart.forEach((item, index) => {
                orderDetails += `${index + 1}. ${item.name} (${item.size && item.size !== 'Default' ? 'Uk: ' + item.size + ', ' : ''}${item.color && item.color !== 'Default' ? 'Wr: ' + item.color : ''})\n`;
                orderDetails += `   Qty: ${item.quantity} x ${formatRupiah(item.price)} = ${formatRupiah(item.price * item.quantity)}\n`;
            });

            orderDetails += `\n*Total Belanja:* ${formatRupiah(total)}\n\n`;
            orderDetails += `Terima kasih telah berbelanja di Devianto Store!`;

            clearCart();
            showToast('Pesanan Berhasil!', 'Mengarahkan Anda ke WhatsApp dalam 2 detik...', 'success');

            const encodedMessage = encodeURIComponent(orderDetails);
            const whatsappNumber = '6281326914169'; 
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

            setTimeout(() => {
                window.open(whatsappUrl, '_blank'); 
                window.location.href = '../index.html'; 
            }, 2000); 
        });
    }

    // --- Order Confirmation Page Specific Logic (dikosongkan/dihilangkan karena tidak lagi digunakan) ---
    if ($('#order-confirmation-section').length) {
        $('#order-confirmation-section .card').html(`
            <i class="fas fa-info-circle text-info mb-4" style="font-size: 4rem;"></i>
            <h3 class="mb-3">Halaman ini tidak lagi digunakan.</h3>
            <p class="lead mb-4">Anda akan otomatis dialihkan ke WhatsApp setelah checkout.</p>
            <a href="products.html" class="btn btn-primary btn-lg">Mulai Belanja</a>
        `);
    }

    // Initial cart item count update on page load for navbar
    updateCartItemCountNavbar();
});