# Fungsi Pengiriman Aspirasi (`backend/functions/submit-aspiration/`)

Fungsi ini menangani endpoint `POST /functions/v1/submit-aspiration` untuk memenuhi kebutuhan **`FP-11`** (Form aspirasi dan pengaduan dengan opsi anonim serta nomor pelacakan) dan kebutuhan non-fungsional **Bagian 7 (Keamanan & Privasi)**.

---

## Alur Kerja Fungsi

1. **Validasi Rate Limiting:**
   Memeriksa batas pengiriman per jam (`ASPIRATION_RATE_LIMIT_MAX_PER_HOUR`) untuk mencegah spam pada formulir aspirasi publik.
2. **Validasi Input & Sanitasi XSS:**
   Memastikan panjang isi aspirasi valid (minimal 20 karakter, maksimal 2000 karakter) dan bersih dari injeksi skrip.
3. **Jaminan Privasi Anonim Sejati:**
   Jika payload memiliki `anonim: true`, fungsi ini secara eksplisit membuang field `nama_pengirim`, `kontak_opsional`, serta tidak menyimpan header alamat IP maupun *User-Agent* pengirim ke database.
4. **Pembangkitan Nomor Pelacakan Unik:**
   Menghasilkan kode unik berformat `ASP-YYYY-XXXX` (contoh: `ASP-2026-7M2P`), menyimpan baris ke tabel `aspirasi` dengan status awal `'diterima'`, lalu mengembalikan `nomor_pelacakan` ke frontend.

---

## Kontrak Request & Response

**Request (`POST`):**
```json
{
  "isi": "Mohon jadwal pelatihan workshop divisi IT diumumkan minimal 5 hari sebelum acara.",
  "anonim": true,
  "kontak_opsional": null
}
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "nomor_pelacakan": "ASP-2026-7M2P",
  "status": "diterima",
  "created_at": "2026-11-14T15:00:00Z"
}
```

