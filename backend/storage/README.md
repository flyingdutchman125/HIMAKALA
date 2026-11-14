# Direktori Konfigurasi Penyimpanan Berkas (`backend/storage/`)

Direktori ini berisi konfigurasi dan kebijakan akses untuk **3 Storage Buckets** yang menyimpan berkas gambar dan dokumen resmi HIMAKALA.

---

## Daftar Bucket & Aturan Keamanan

| Nama Bucket | Sifat Akses | Batas Ukuran | Format Diizinkan | Kegunaan (ID PRD) |
| :--- | :--- | :--- | :--- | :--- |
| `foto-pengurus` | Publik (Baca), Admin (Tulis) | Maks 2 MB | `image/webp`, `image/jpeg`, `image/png` | Menyimpan foto struktur kepengurusan per periode (`FP-03`, `FA-07`) |
| `galeri-kegiatan` | Publik (Baca), Admin (Tulis) | Maks 5 MB | `image/webp`, `image/jpeg`, `image/png` | Menyimpan foto dokumentasi proker, galeri kegiatan, & sampul berita (`FP-05`, `FP-07`, `FP-10`, `FA-03`) |
| `dokumen-resmi` | Hibrida: Publik & Internal (`FA-04`) | Maks 15 MB | `application/pdf` | Menyimpan berkas AD/ART, SK, LPJ, dan notulen (`FP-08`, `FA-04`) |

---

## Pemisahan Folder di dalam Bucket `dokumen-resmi`

Untuk mendukung kebutuhan **`FA-04`** (visibilitas dokumen `publik` vs `internal`):
- **`dokumen-resmi/publik/<id_periode>/<nama-berkas>.pdf`**: Dapat diunduh oleh seluruh pengunjung melalui halaman Pusat Dokumen (`/transparansi/dokumen`).
- **`dokumen-resmi/internal/<id_periode>/<nama-berkas>.pdf`**: Dilindungi oleh kebijakan RLS Storage sehingga hanya dapat diakses menggunakan *Signed URL* oleh pengurus yang telah login di Panel Admin.

