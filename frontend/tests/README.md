# Direktori Pengujian (`tests/`)

Direktori ini menampung seluruh pengujian otomatis aplikasi HIMAKALA menggunakan **Vitest** dan **React Testing Library**. Direktori ini dibuat untuk menjawab temuan audit pada **Bagian 2.1 dan Bagian 10 PRD** (repositori lama tidak memiliki skrip maupun berkas pengujian).

---

## Struktur Pengujian

```text
tests/
├── README.md                   # Panduan eksekusi dan cakupan pengujian (file ini)
├── setup.ts                    # Konfigurasi global Vitest & jest-dom matchers
├── unit/                       # Pengujian fungsi murni, kalkulasi anggaran, generator kode tiket
├── schemas/                    # Pengujian validasi skema Zod (form aspirasi, proker, keuangan)
└── features/                   # Pengujian integrasi komponen per fitur & matriks hak akses peran
```

---

## Cakupan Pengujian Wajib (Prioritas PRD)

1. **Validasi Privasi Aspirasi Anonim (`FP-11` & Bagian 7):**
   - Memastikan skema validasi dan payload pengiriman aspirasi menghapus field `nama_pengirim` dan `kontak_opsional` ketika opsi `anonim` bernilai `true`.
2. **Kalkulasi Transparansi Keuangan (`FP-09` & `FA-05`):**
   - Menguji fungsi perhitungan persentase serapan anggaran (`realisasi / rencana * 100`), selisih sisa kas, dan pemformatan mata uang Rupiah.
3. **Matriks Hak Akses Berbasis Peran (`FA-01`, `FA-05`, `FA-10`):**
   - Menguji helper otorisasi bahwa hanya `Bendahara` (dan `Super Admin`) yang dapat menginput anggaran, dan hanya `Ketua` (dan `Super Admin`) yang dapat menyetujui publikasi laporan keuangan.
4. **Filter & Status Program Kerja (`FP-04`):**
   - Menguji logika pemfilteran daftar proker berdasarkan kombinasi `periode`, `divisi`, dan `status` (`direncanakan`, `berjalan`, `selesai`, `batal`).
5. **Kondisi UI Wajib (Empty, Loading, Error):**
   - Memastikan komponen daftar proker, dokumen, dan berita menampilkan tampilan *Empty State*, *Loading Skeleton*, dan *Error State* dengan benar.

---

## Panduan Menjalankan Pengujian

```bash
# Menjalankan seluruh test sekali jalan (cocok untuk CI/CD)
npm run test -- --run

# Menjalankan test dalam mode watch saat pengembangan
npm run test

# melihat laporan cakupan kode (coverage)
npm run test -- --coverage
```

