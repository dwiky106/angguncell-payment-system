document.addEventListener('DOMContentLoaded', () => {
    // URL WEB APP GOOGLE APPS SCRIPT ANDA
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxTrg67EkG9j1ebQTbkCrb4_4_eYtLw-1ccd0qBzDszrw9V-yW0TJeRN9RN68kwnx7SgQ/exec'; 

    const form = document.getElementById('financeForm');
    const jenisTransaksi = document.getElementById('jenisTransaksi');
    const statusPembayaran = document.getElementById('statusPembayaran');
    const eWalletGroup = document.getElementById('eWalletGroup');
    const terhutangGroup = document.getElementById('terhutangGroup');
    const inputButton = document.getElementById('inputButton');
    const statusMessage = document.getElementById('statusMessage');

    // --- Logika Tampilan Bersyarat ---

    // 1. Tampilkan/Sembunyikan Pilihan E-Wallet
    jenisTransaksi.addEventListener('change', () => {
        const jenisEwallet = document.getElementById('jenisEwallet');
        if (jenisTransaksi.value === 'TOP UP E-Wallet') {
            eWalletGroup.classList.remove('hidden');
            jenisEwallet.setAttribute('required', 'required');
        } else {
            eWalletGroup.classList.add('hidden');
            jenisEwallet.removeAttribute('required');
            jenisEwallet.value = ''; // Reset nilai
        }
    });

    // 2. Tampilkan/Sembunyikan Nominal Terhutang
    statusPembayaran.addEventListener('change', () => {
        const nominalTerhutang = document.getElementById('nominalTerhutang');
        if (statusPembayaran.value === 'Terhutang') {
            terhutangGroup.classList.remove('hidden');
            nominalTerhutang.setAttribute('required', 'required');
        } else {
            terhutangGroup.classList.add('hidden');
            nominalTerhutang.removeAttribute('required');
            nominalTerhutang.value = 0; // Set ke 0
        }
    });

    // --- Logika Pengiriman Data ke Google Apps Script ---
    form.addEventListener('submit', function(e) {
        e.preventDefault(); 
        
        // Tampilkan status "Loading"
        displayMessage('loading', '⏳ Mengirim data...');
        inputButton.disabled = true;

        // Ambil data formulir
        const formData = new FormData(this);
        const data = {};
        formData.forEach((value, key) => {
            // Logika untuk memastikan hanya data yang relevan yang dikirim
            if (key === 'jenisEwallet' && jenisTransaksi.value !== 'TOP UP E-Wallet') {
                return; // Jangan masukkan E-Wallet jika bukan transaksi E-Wallet
            }
            if (key === 'nominalTerhutang' && statusPembayaran.value !== 'Terhutang') {
                data[key] = 0; // Set ke 0 jika status Lunas
                return;
            }
            
            data[key] = value;
        });
        
        // Pastikan nominalTerhutang diset 0 jika kosong (saat Lunas)
        if (data.nominalTerhutang === '') {
            data.nominalTerhutang = 0;
        }


        // Kirim data menggunakan Fetch API
        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            // Ubah objek data menjadi string URL-encoded
            body: new URLSearchParams(data).toString()
        })
        .then(response => {
            // Karena menggunakan 'no-cors', respons tidak bisa dibaca.
            // Kita anggap sukses jika tidak ada error jaringan.
            displayMessage('success', '✅ Data Berhasil Dicatat!', 5000);
            form.reset(); 
            
            // Sembunyikan kembali grup bersyarat setelah reset
            eWalletGroup.classList.add('hidden');
            terhutangGroup.classList.add('hidden');
            
            // Reset nilai e-wallet (jika ada)
            document.getElementById('jenisEwallet').value = '';
            // Pastikan Nominal Terhutang diset 0 setelah reset form
            document.getElementById('nominalTerhutang').value = 0; 

        })
        .catch(error => {
            console.error('Error:', error);
            displayMessage('error', '❌ Gagal Mencatat Data! Cek kembali koneksi atau URL Apps Script.', 8000);
        })
        .finally(() => {
            inputButton.disabled = false;
        });
    });

    // Fungsi utilitas untuk menampilkan pesan status
    function displayMessage(type, message, duration) {
        statusMessage.className = `status-message ${type}`;
        statusMessage.textContent = message;
        
        if (duration) {
            setTimeout(() => {
                statusMessage.textContent = '';
                statusMessage.className = 'status-message';
            }, duration);
        }
    }
});
