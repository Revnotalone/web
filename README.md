# TOKO AIPI

Toko online sepatu, sandal, tas, kaos kaki, dan sabuk. Next.js 14 + Supabase + Vercel (semua ada paket gratis).

## Isi
- Toko: beranda, filter kategori, cari produk, detail produk (ukuran, warna, stok), keranjang, checkout, lacak pesanan
- Pembayaran: COD (bisa pakai biaya tambahan), transfer manual + upload bukti, QRIS dinamis + hitung mundur 15 menit
- Admin `/admin`: ringkasan omset 7 hari, stok menipis, kelola pesanan (status, resi, konfirmasi lunas, chat WA), kelola produk (multi foto), pengaturan toko/ongkir/rekening/QRIS
- Stok berkurang otomatis saat pesanan dibuat dan kembali bila pesanan dibatalkan

## Cara pasang (sekitar 15 menit)

### 1. Database (Supabase)
1. Buat project di supabase.com
2. SQL Editor -> tempel isi `supabase/schema.sql` -> Run (ini juga membuat bucket foto `uploads`)
3. Project Settings -> API: salin **Project URL** dan **service_role key**

### 2. Jalankan di laptop
```bash
npm install
cp .env.example .env.local     # isi nilainya
npm run dev
```
Buka http://localhost:3000 (toko) dan http://localhost:3000/admin (admin).

### 3. Atur QRIS
1. Login `/admin` -> Pengaturan
2. Scan QR statis tokomu dengan pemindai QR biasa (Google Lens / pemindai bawaan kamera, bukan aplikasi e-wallet)
3. Salin teks hasilnya (diawali `000201`) ke kolom "Kode QRIS statis toko" -> Simpan. Kode yang salah akan ditolak.

### 4. Online gratis (Vercel)
Push ke GitHub -> vercel.com -> Add New Project -> isi 4 variabel dari `.env.example` -> Deploy.

## Penting soal QRIS dinamis
- Sistem mengubah QRIS statis menjadi QRIS dengan nominal otomatis (tag 01 = 12, tag 54 = total, CRC dihitung ulang). Aplikasi bayar akan menampilkan nominal terkunci.
- Ini BUKAN konfirmasi bayar otomatis. Uang masuk ke akun Dana Bisnis kamu, tapi toko tidak diberi tahu. Cek mutasi/notifikasi Dana Bisnis, lalu klik "Konfirmasi lunas" di admin.
- Konfirmasi otomatis butuh payment gateway (misalnya Midtrans atau Xendit) dengan persetujuan merchant dan biaya per transaksi.
- Baca syarat penggunaan penyedia QRIS-mu soal pemakaian QR statis dengan nominal diubah.

## Batasan versi ini
- Stok dihitung per produk, bukan per ukuran/warna
- Kategori diatur lewat SQL (tabel `categories`), belum ada halaman admin-nya
- Belum ada: kupon, banner slider, ekspor Excel, akun pelanggan, ongkir per kota
- Kode belum dikompilasi di lingkungan pembuatnya (tanpa internet). Logika QRIS sudah diuji. Bila `npm run build` memberi error, kirim pesan errornya ke saya.
