# Direktori Komponen Tata Letak (`src/components/layout/`)

Direktori ini berisi komponen kerangka halaman (*page shells*) dan navigasi utama untuk memisahkan tata letak **Situs Publik** dan **Panel Admin**.

---

## Daftar Komponen yang Direkomendasikan

| Nama File | Fungsi & Perbaikan dari Repo Lama |
| :--- | :--- |
| `PublicLayout.tsx` | Membungkus seluruh halaman publik dengan `Navbar`, `<main id="main-content">`, `Footer`, dan tautan *Skip to Content* untuk aksesibilitas keyboard. |
| `Navbar.tsx` | Navigasi utama multi-halaman menggunakan `<NavLink>` dari `react-router-dom`. Memperbaiki temuan audit Bagian 2.1 (menghapus link kosong dan mengganti anchor satu halaman menjadi rute nyata sesuai Sitemap Bagian 8). |
| `Footer.tsx` | Menampilkan identitas HIMAKALA & PENS, tautan cepat yang valid, kontak resmi, serta tahun hak cipta dinamis (`new Date().getFullYear()`, memperbaiki tahun statis `© 2024` pada repo lama). |
| `AdminLayout.tsx` | Kerangka halaman internal pengurus (`/admin/*`) yang memeriksa sesi login dan menyusun `AdminSidebar` + `AdminHeader`. |
| `AdminSidebar.tsx` | Menu samping Panel Admin yang menyaring daftar menu secara otomatis sesuai peran pengguna yang sedang login (`Super Admin`, `Ketua`, `Sekretaris`, `Bendahara`, `Kepala Divisi`, `Editor`). |
| `PageHeader.tsx` | Header standar untuk setiap halaman dalam (menampilkan judul halaman, deskripsi singkat, dan jejak `Breadcrumb`). |

---

## Struktur Menu Navigasi Publik (`Navbar.tsx`)

Sesuai Sitemap pada Bagian 8 PRD, item navigasi yang ditampilkan di `Navbar` wajib mengarah ke rute yang benar-benar aktif:

1. **Beranda** (`/`)
2. **Tentang** (`/tentang` - mencakup Profil, Struktur Kepengurusan, dan Arsip Periode)
3. **Program Kerja** (`/proker` - mencakup Daftar Proker dan Kalender Kegiatan)
4. **Transparansi** (`/transparansi` - mencakup Dashboard Progres, Keuangan, dan Pusat Dokumen)
5. **Berita & Galeri** (`/berita`, `/galeri`)
6. **Aspirasi** (`/aspirasi/kirim` & `/aspirasi/lacak`)
7. **Kontak** (`/kontak`)

