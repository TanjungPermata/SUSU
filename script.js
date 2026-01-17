document.addEventListener('DOMContentLoaded', () => {
    // 1. Ambil Elemen Penting
    const inputForm = document.querySelector('.input-form');
    const itemTableBody = document.querySelector('#itemTable tbody');
    const displayItemBody = document.querySelector('#displayItemBody');
    const addItemBtn = document.getElementById('addItemBtn');

    // 2. Event Listener untuk Input Header
    inputForm.addEventListener('input', updateInvoiceHeader);

    function updateInvoiceHeader() {
        // --- Update Detail Invoice ---
        document.getElementById('displayInvoiceNum').textContent = document.getElementById('invoiceNum').value;
        document.getElementById('displayClientName').textContent = document.getElementById('clientName').value;
        
        // Format Tanggal
        const dateInput = document.getElementById('invoiceDate').value;
        const date = new Date(dateInput + 'T00:00:00');
        const formattedDate = date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        document.getElementById('displayInvoiceDate').textContent = formattedDate;
    }
    
    updateInvoiceHeader();

    // 3. Fungsi Tambah Item Baru
    addItemBtn.addEventListener('click', addItem);

    function addItem() {
        const newRow = itemTableBody.insertRow();
        newRow.innerHTML = `
            <td><input type="text" class="item-description" value="Kaos"></td>
            <td><input type="number" class="item-qty" value="1" min="1"></td>
            <td><input type="number" class="item-price" value="100000" min="0"></td>
            <td class="item-total">${formatCurrency(100000)}</td>
            <td><button class="remove-item-btn">Hapus</button></td>
        `;
        newRow.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', calculateInvoice);
        });
        newRow.querySelector('.remove-item-btn').addEventListener('click', removeItem);

        calculateInvoice();
    }
    
    // 4. Fungsi Hapus Item
    function removeItem(event) {
        event.target.closest('tr').remove();
        calculateInvoice();
    }

    // 5. Fungsi Utama Perhitungan Invoice (TOTAL = SUB TOTAL)
    function calculateInvoice() {
        let subtotal = 0;
        let invoiceItemsHtml = '';

        itemTableBody.querySelectorAll('tr').forEach(row => {
            const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const description = row.querySelector('.item-description').value;
            
            const total = qty * price;
            subtotal += total;

            // Update Total per Item di Kolom Input
            row.querySelector('.item-total').textContent = formatCurrency(total);
            
            // Build HTML untuk tampilan Invoice
            invoiceItemsHtml += `
                <tr>
                    <td>${description}</td>
                    <td>${formatCurrency(price)}</td>
                    <td>${qty}</td>
                    <td>${formatCurrency(total)}</td>
                </tr>
            `;
        });

        // Tampilkan Item di Preview Invoice
        displayItemBody.innerHTML = invoiceItemsHtml;

        // Perhitungan Akhir (TOTAL = SUB TOTAL)
        const grandTotal = subtotal; 

        // Tampilkan Hasil Perhitungan
        document.getElementById('subtotalDisplay').textContent = formatCurrency(subtotal);
        document.getElementById('totalDisplay').textContent = formatCurrency(grandTotal);
    }
    
    // 6. Fungsi Helper Format Mata Uang Indonesia (Memastikan Angka Penuh)
    function formatCurrency(amount) {
        const formatted = new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2 
        }).format(amount).replace('IDR', 'Rp ').trim();

        // Hapus ',00' jika angkanya bulat dan hapus spasi
        return formatted.replace(',00', '').replace(/\s/g, ''); 
    }
    
    // Tambahkan item awal (3 item) saat load
    addItem();
    addItem();
    addItem();

    // 7. Fungsi untuk Download PDF (Tidak Berubah)
    window.generatePDF = function() {
        const { jsPDF } = window.jspdf;
        const element = document.getElementById('invoicePreview');
        
        // Sembunyikan Input Form sementara
        document.querySelector('.input-form').style.display = 'none';

        html2canvas(element, { 
            scale: 2, 
            scrollY: -window.scrollY 
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps= pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Invoice_${document.getElementById('invoiceNum').value.replace(/\//g, '-')}.pdf`);

            // Tampilkan kembali Input Form
            document.querySelector('.input-form').style.display = 'block';
        });
    }

});