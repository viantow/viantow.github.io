// products.js - Specific JavaScript for products.html
  $(document).ready(function() {
    // Function to load and display products dynamically
    const loadProductsToPage = () => {
        const productListContainer = $('#product-list-container');
        if (productListContainer.length === 0) return;

        productListContainer.empty(); // Clear existing content

        const productsArray = Object.keys(productsData).map(key => ({
            id: key,
            ...productsData[key]
        }));

        productsArray.forEach(product => {
            const productHtml = `
<div class="col-md-4 mb-4 product-item ${product.category}">
   <div class="card shadow-sm h-100">
     <a href="product-detail.html?id=${ product.id }"> <img src="${product.images[0] || '../img/placeholder.jpg'}" class="card-img-top" alt="${product.name}"></a>
      <div class="card-body d-flex flex-column">
         <h5 class="card-title text-maroon">${product.name}</h5>
         <p class="card-price fw-bold text-dark fs-5">${formatRupiah(product.price)}</p>
         <div class="mt-auto">
            <a href="product-detail.html?id=${ product.id }" class="btn btn-outline-primary btn-sm rounded-pill w-100">
            Lihat Detail
            </a>
         </div>
      </div>
   </div>
</div>
            `;
            productListContainer.append(productHtml);
        });
    };

    // Function to apply category filter and update UI
    const applyCategoryFilter = (category) => {
        $('.dropdown-menu .dropdown-item').removeClass('active');
        if (category === 'all' || !category) {
            $('.product-item').show();
            $('.dropdown-menu .dropdown-item[data-filter="all"]').addClass('active');
            $('#categoryDropdown').text('Semua Kategori');
        } else {
            $('.product-item').hide();
            $(`.product-item.${category}`).show();
            $('.dropdown-menu .dropdown-item[data-filter="' + category + '"]').addClass('active');
            $('#categoryDropdown').text($(`.dropdown-menu .dropdown-item[data-filter="${category}"]`).text());
        }
    };

    // Event listener for dropdown item click
    $('.dropdown-menu .dropdown-item').on('click', function(e) {
        e.preventDefault();
        const filter = $(this).data('filter');
        const newUrl = new URL(window.location.href);
        if (filter === 'all') {
            newUrl.searchParams.delete('category');
        } else {
            newUrl.searchParams.set('category', filter);
        }
        window.history.pushState({ path: newUrl.href }, '', newUrl.href);
        applyCategoryFilter(filter);
    });

    // Initial filter application when products.html loads
    if ($('#all-products').length) {
        loadProductsToPage();
        const urlParams = new URLSearchParams(window.location.search);
        const categoryFromUrl = urlParams.get('category');
        applyCategoryFilter(categoryFromUrl || 'all');
    }

    // Handle Add to Cart button click
    $(document).on('click', '.add-to-cart-btn', function() {
        const productId = $(this).data('product-id');
        window.location.href = `product-detail.html?id=${productId}`;
    });
  });
