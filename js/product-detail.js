// product-detail.js - Specific JavaScript for product-detail.html

$(document).ready(function() {
    // --- Function to Load Product Detail ---
    const loadProductDetail = (productId) => { 
        const product = productsData?.[productId]; // Gunakan productsData global

        if (product) {
            $('#product-name').text(product.name);
            $('#product-price').text(formatRupiah(product.price));
            $('#product-description').html(product.description.replace(/\n/g, '<br>')); // Handle newlines
            
            // Set main image
            $('#main-product-image')
                .attr('src', product.images[0] || '../img/placeholder.jpg')
                .attr('alt', product.name || 'Product Image');

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
});