# Direktori Halaman Panel Admin (`src/pages/admin/`)

Direktori ini berisi halaman-halaman pengelolaan internal pengurus sesuai **Sitemap Bagian 8 PRD** dan **Kebutuhan Fungsional `FA-01` s.d. `FA-10`**.

---

## Pemetaan Rute & Berkas Halaman Admin

| Jalur URL (Route) | Nama Berkas Halaman | ID PRD | Peran yang Diizinkan | Deskripsi Fungsi |
| :--- | :--- | :--- | :--- | :--- |
| `/admin/login` | `AdminLoginPage.tsx` | `FA-01` | Publik (Belum Login) | Halaman masuk pengurus menggunakan email & password Supabase Auth |
| `/admin` | `AdminDashboardPage.tsx` | `FA-08` | Semua Peran Pengurus | Ringkasan internal: peringatan proker terlambat update (> 7 hari), anggaran menunggu persetujuan, & aspirasi belum ditangani |
| `/admin/proker` | `AdminProkerPage.tsx` | `FA-02` | `super_admin`, `ketua`, `sekretaris`, `kepala_divisi` | CRUD program kerja, update status & persentase progres, serta daftar pendaftar kegiatan |
| `/admin/berita` | `AdminNewsGalleryPage.tsx` | `FA-03` | `super_admin`, `ketua`, `sekretaris`, `kepala_divisi`, `editor` | CRUD artikel berita, pengumuman, dan unggah foto dokumentasi ke galeri |
| `/admin/dokumen` | `AdminDocumentsPage.tsx` | `FA-04` | `super_admin`, `ketua`, `sekretaris`, `bendahara`, `kepala_divisi` | Unggah dokumen PDF (AD/ART, SK, LPJ, Notulen) dan atur visibilitas (`publik` atau `internal`) |
| `/admin/keuangan` | `AdminFinancePage.tsx` | `FA-05`, `FA-10` | Input: `bendahara`, `super_admin`<br>Setujui: `ketua`, `super_admin` | Input rencana & realisasi anggaran oleh Bendahara serta antrean persetujuan publikasi oleh Ketua |
| `/admin/aspirasi` | `AdminAspirationsPage.tsx` | `FA-06` | `super_admin`, `ketua`, `sekretaris`, `kepala_divisi` | Membaca aspirasi mahasiswa yang masuk, mengubah status (`diproses`, `selesai`), dan menulis tanggapan resmi |
| `/admin/struktur` | `AdminStructurePage.tsx` | `FA-07` | `super_admin`, `ketua`, `sekretaris` | Mengelola daftar periode kepengurusan (aktif/arsip), 6 divisi, dan profil anggota pengurus |
| `/admin/pengguna` | `AdminUsersPage.tsx` | `FA-01` | `super_admin`, `ketua` | Mengelola akun pengurus, menetapkan peran (Role), dan menonaktifkan akun pengurus demisioner |
| `/admin/log` | `AdminActivityLogPage.tsx` | `FA-09` | `super_admin`, `ketua`, `sekretaris` | Menampilkan riwayat log aktivitas sistem (siapa mengubah objek apa dan kapan) |

