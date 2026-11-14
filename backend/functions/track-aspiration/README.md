# Fungsi Pelacakan Status Aspirasi (`backend/functions/track-aspiration/`)

Fungsi ini menangani endpoint `GET /functions/v1/track-aspiration?code=ASP-YYYY-XXXX` untuk memenuhi kebutuhan **`FP-12`** (Halaman pelacakan status aspirasi: `diterima`, `diproses`, `selesai`).

---

## Tujuan Keamanan & Privasi

Tabel `aspirasi` tidak dibuka untuk operasi `SELECT` publik secara bebas agar isi pengaduan mahasiswa yang bersifat sensitif tidak dapat di-scraping seluruhnya oleh pihak luar. Melalui fungsi ini:
- Pengunjung hanya dapat melihat detail aspirasi jika menyertakan `nomor_pelacakan` yang tepat.
- Respons yang dikembalikan hanya mencakup `nomor_pelacakan`, `status` (`diterima`, `diproses`, `selesai`), ringkasan waktu pembaruan, serta `tanggapan` resmi dari pengurus (tidak pernah mengembalikan `kontak_opsional` ke publik).

---

## Kontrak Response (`200 OK`)

```json
{
  "nomor_pelacakan": "ASP-2026-7M2P",
  "status": "diproses",
  "tanggapan": "Terima kasih atas masukannya. Divisi Acara & IT telah menyepakati publikasi poster H-7 kegiatan.",
  "updated_at": "2026-11-16T09:30:00Z"
}
```

