# Direktori Data Konstanta Awal (`src/data/`)

Direktori ini berisi konfigurasi statis dan konstanta referensi yang digunakan oleh antarmuka (seperti daftar 6 divisi awal, label status, kategori dokumen, dan matriks hak akses peran).

> **Penting:** Berbeda dengan repositori lama, direktori `src/data/` pada versi rebuild **tidak lagi digunakan sebagai penyimpanan utama data pengurus atau konten halaman**. Seluruh data dinamis wajib dibaca dari database Supabase.

---

## Daftar Berkas Konstanta

| Nama Berkas | Isi & Kegunaan |
| :--- | :--- |
| `initial-divisions.ts` | Metadata 6 divisi yang dipertahankan dari repo lama (`id`, `slug`, `nama`, `deskripsi`, `warna_gradient`) sebagai referensi tampilan dan *seed* awal. |
| `role-permissions.ts` | Definisi matriks izin untuk 6 peran (`super_admin`, `ketua`, `sekretaris`, `bendahara`, `kepala_divisi`, `editor`) sesuai `FA-01`, `FA-05`, dan `FA-10`. |
| `constants.ts` | Daftar opsi filter status proker, kategori berita, kategori dokumen resmi (`AD/ART`, `SK`, `LPJ`, `Notulen`), serta daftar Program Studi PSDKU Lamongan (`Teknik Informatika` dan `Multimedia Broadcasting`). |
| `navigation.ts` | Struktur item menu navigasi publik dan menu sidebar Panel Admin sesuai Sitemap Bagian 8 PRD. |

---

## Struktur 6 Divisi yang Dipertahankan (`initial-divisions.ts`)

1. **Kepemimpinan (`leadership`)** - Tim Pemimpin Organisasi (`from-purple-500 to-pink-500`)
2. **Keuangan (`finance`)** - Manajemen Keuangan & Administrasi (`from-green-500 to-emerald-500`)
3. **Acara & Program (`events`)** - Pengelola Event dan Program Organisasi (`from-blue-500 to-cyan-500`)
4. **Media & Komunikasi (`media`)** - Pengelola Media Sosial dan Publikasi (`from-orange-500 to-red-500`)
5. **IT & Teknologi (`it`)** - Infrastruktur dan Pengembangan Digital (`from-indigo-500 to-blue-500`)
6. **Public Relations (`pr`)** - Hubungan Publik dan Kemitraan (`from-rose-500 to-pink-500`)

