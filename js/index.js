// index.js - Specific JavaScript for index.html

$(document).ready(function() {
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

    // --- Function to load and display featured products dynamically for index.html ---
    const loadFeaturedProductsToPage = () => {
        const featuredProductListContainer = $('#featured-product-list-container');
        if (featuredProductListContainer.length === 0) return; // Only run if on index.html

        featuredProductListContainer.empty(); // Clear existing content

        // Ensure recommendedProductsData is available globally
        if (typeof recommendedProductsData === 'undefined') {
            console.error("recommendedProductsData is not loaded. Make sure product-recommendation.js is included.");
            return;
        }

        const productsArray = Object.keys(recommendedProductsData).map(key => ({
            id: key,
            ...recommendedProductsData[key]
        }));

        productsArray.forEach(product => {
            const productHtml = `
                <div class="col-lg-3 col-md-4 col-sm-6 mb-2 product-item ${product.category}">
                    <div class="card product-card h-100 shadow-sm">
                        <img src="${product.images[0] || 'img/placeholder.jpg'}" class="card-img-top" alt="${product.name}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title text-maroon">${product.name}</h5>
                            <p class="card-price fw-bold text-dark fs-5">${formatRupiah(product.price)}</p>
                            <div class="mt-3 d-flex justify-content-center">
                                <a href="pages/product-detail.html?id=${product.id}" class="btn btn-outline-primary btn-sm rounded-pill me-2">
                                    Lihat Detail
                                </a>
                                <button
                                    class="btn btn-maroon btn-sm rounded-pill add-to-cart-btn"
                                    data-product-id="${product.id}"
                                    data-product-name="${product.name}"
                                    data-product-price="${product.price}"
                                >
                                    <i class="fas fa-shopping-cart me-1"></i> Tambah
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            featuredProductListContainer.append(productHtml);
        });
    };

    // Initial load for featured products on index.html
    if ($('#featured-products').length) {
        loadFeaturedProductsToPage();
    }

    // Handle Add to Cart button click on Product List (products.html) and Featured Products (index.html)
    // Sekarang akan mengarahkan ke halaman detail, karena tombol 'Tambah' di products.html
    // juga punya data-product-id.
    $(document).on('click', '.add-to-cart-btn', function() {
        const productId = $(this).data('product-id');
        window.location.href = `pages/product-detail.html?id=${productId}`;
    });
});