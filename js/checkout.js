// checkout.js - Specific JavaScript for checkout.html

$(document).ready(function() {
    // --- Update Checkout Summary (for checkout.html) ---
    window.updateCheckoutSummary = () => {
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
    // The original script indicated this page is no longer used, so its specific logic is removed.
    if ($('#order-confirmation-section').length) {
        $('#order-confirmation-section .card').html(`
            <i class="fas fa-info-circle text-info mb-4" style="font-size: 4rem;"></i>
            <h3 class="mb-3">Halaman ini tidak lagi digunakan.</h3>
            <p class="lead mb-4">Anda akan otomatis dialihkan ke WhatsApp setelah checkout.</p>
            <a href="products.html" class="btn btn-primary btn-lg">Mulai Belanja</a>
        `);
    }
});