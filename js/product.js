// products.js - Specific JavaScript for products.html

$(document).ready(function() {
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

    // Handle Add to Cart button click on Product List (products.html)
    $(document).on('click', '.add-to-cart-btn', function() {
        const productId = $(this).data('product-id');
        window.location.href = `product-detail.html?id=${productId}`;
    });
});