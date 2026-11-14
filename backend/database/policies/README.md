# Direktori Kebijakan Keamanan RLS (`backend/database/policies/`)

Direktori ini berisi skrip SQL untuk aturan **Row Level Security (RLS)** PostgreSQL yang menegakkan kontrol akses berbasis peran (`FA-01`, `FA-04`, `FA-05`, `FA-10`) langsung di lapisan database.

---

## Matriks Kebijakan RLS Utama

| Tabel | Akses Publik (`anon`) | Akses Pengurus (`authenticated`) |
| :--- | :--- | :--- |
| `periode`, `divisi`, `pengurus` | `SELECT` diizinkan untuk semua baris | `INSERT`/`UPDATE`/`DELETE` hanya untuk `super_admin`, `ketua`, `sekretaris` |
| `proker` | `SELECT` diizinkan untuk semua baris | `INSERT`/`UPDATE` untuk `super_admin`, `ketua`, `sekretaris`, dan `kepala_divisi` (sesuai divisinya) |
| `anggaran` | `SELECT` **hanya jika** `status_persetujuan = 'disetujui'` (`FA-10`) | Input/Edit `rencana` & `realisasi` khusus `bendahara` & `super_admin` (`FA-05`); Update `status_persetujuan = 'disetujui'` khusus `ketua` & `super_admin` (`FA-10`) |
| `dokumen` | `SELECT` **hanya jika** `visibilitas = 'publik'` (`FA-04`) | `SELECT` semua dokumen (`publik` & `internal`); `INSERT`/`UPDATE` untuk pengurus berwenang |
| `berita`, `galeri` | `SELECT` hanya berita dengan `status_terbit = true` dan seluruh galeri | `INSERT`/`UPDATE`/`DELETE` untuk `editor`, `kepala_divisi`, `sekretaris`, `ketua`, `super_admin` |
| `aspirasi` | Akses melalui Edge Function (`submit-aspiration` & `track-aspiration`) | `SELECT` & `UPDATE` (`status`, `tanggapan`) untuk `super_admin`, `ketua`, `sekretaris`, `kepala_divisi` |
| `log_aktivitas` | Ditolak (`DENY`) | `SELECT` hanya untuk `super_admin`, `ketua`, `sekretaris`; tidak ada yang boleh melakukan `UPDATE`/`DELETE` |

---

## Fungsi Pembantu Otorisasi SQL

Kebijakan di direktori ini menggunakan fungsi SQL `public.get_current_user_role()` yang membaca kolom `peran` dari tabel `public.pengguna` berdasarkan `auth.uid()` pengguna yang sedang login.

