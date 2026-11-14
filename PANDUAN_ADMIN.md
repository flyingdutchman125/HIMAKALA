# Panduan Operasional Kepengurusan & Keanggotaan HIMAKALA

Dokumen ini adalah panduan operasional bagi anggota dan pengurus **HIMAKALA PSDKU Lamongan (PENS)** dalam menggunakan sistem informasi dan transparansi berbasis **6 Divisi** dan **Database Supabase**.

---

## 1. Registrasi Anggota Biasa & Cara Login

### A. Registrasi Mandiri Anggota Biasa (`anggota`)
Mahasiswa PSDKU Lamongan PENS dapat mendaftar langsung sebagai **Anggota Aktif HIMAKALA** dengan langkah berikut:
1. Klik tombol **Registrasi** di bagian kanan atas *Top Bar* atau tab **Registrasi Anggota** pada jendela autentikasi.
2. Isi formulir pendaftaran wajib:
   - **NRP Mahasiswa** (`8-14` digit angka, contoh: `3124500021`)
   - **No. WhatsApp (WA)** aktif (contoh: `081234567890`)
   - **Email Kampus PENS** (`@*.student.pens.ac.id` atau `@student.pens.ac.id`, contoh: `mozakiibrahim@it.student.pens.ac.id`)
   - **Nama Lengkap** (opsional, otomatis terformat dari email kampus jika dikosongkan)
   - **Password** & **Konfirmasi Password (2 kali)** (minimal 6 karakter dan wajib sama persis)
3. Setelah berhasil mendaftar, akun otomatis berstatus **Anggota Aktif HIMAKALA (`anggota`)**.

### B. Cara Login (Anggota & Pengurus)
1. Klik tombol **Login** di pojok kiri bawah *sidebar* atau di bagian kanan atas *Top Bar*.
2. Masukkan **Email Kampus / Email Pengurus** atau **NRP** beserta **Password** akun Anda.
3. Sistem secara otomatis membaca kolom `peran` (enum `peran_pengguna`), `status_aktif`, dan `id_divisi` dari tabel `public.pengguna` di database Supabase.

---

## 2. Pembagian 6 Divisi & Hak Akses (`peran_pengguna`)

| Peran (`peran_pengguna`) | Divisi | Hak CRUD Proker | Hak Kelola Anggota & Pengurus | Menu Sidebar yang Muncul |
| :--- | :--- | :--- | :--- | :--- |
| **Anggota (`anggota`)** | - | Tidak bisa mengedit (Hanya melihat web) | Tidak ada | `Beranda`, `Program Kerja`, `Kas & Dokumen`, `6 Divisi`, `Berita`, `Aspirasi` |
| **Ketua HIMAKALA (`ketua_himakala`)** | **BPH** (Ketua BPH) | **Bebas CRUD Tanpa Izin** untuk seluruh 6 divisi | **Dapat menambah Anggota & mengangkat Pengurus** | `Proker 6 Divisi`, `Izin Proker`, `Kas & Anggaran`, `Dokumen & SK`, `Angkat Pengurus`, `Anggota Aktif`, `Berita Medinfo`, `Aspirasi Anggota` |
| **Sekretaris (`sekretaris`)** | **BPH** | **Bebas CRUD Tanpa Izin** | **Dapat menambah Anggota & mengangkat Pengurus** | `CRUD Proker`, `Dokumen & SK`, `Angkat Pengurus`, `Anggota Aktif` |
| **Bendahara (`bendahara`)** | **BPH** | **Bebas CRUD Tanpa Izin** | Tidak ada | `CRUD Proker`, `Kas & Anggaran` |
| **Ketua Divisi (`ketua_divisi`)** | **Luar Negeri, Dalam Negeri, Media dan Informasi, PSDM, RSTEK** | **Bebas CRUD Tanpa Izin** untuk divisinya + **Memberi Izin** pengajuan pengurus divisinya | Tidak ada | `CRUD Proker <Divisi>`, `Izin <Divisi>`, serta menu fungsional divisinya |
| **Pengurus Divisi (`pengurus_divisi`)** | **BPH, Luar Negeri, Dalam Negeri, Media dan Informasi, PSDM, RSTEK** | **CRUD Atas Izin Ketua Divisi** (`menunggu_izin_kabid`) | Tidak ada | `Proker <Divisi> (Izin)`, serta menu fungsional divisinya |

---

## 3. Syarat & Alur Pengangkatan Pengurus HIMAKALA

1. **Hanya Ketua HIMAKALA dan Sekretaris BPH yang Berwenang**:
   - Hanya akun dengan role `ketua_himakala` dan `sekretaris` yang memiliki akses ke menu **Anggota Aktif** (`/admin?tab=pengguna`) dan **Angkat Pengurus** (`/admin?tab=pengurus`).
   - Role lain (`bendahara`, `ketua_divisi`, `pengurus_divisi`) tidak dapat menambah anggota maupun mengangkat pengurus.
2. **Syarat Wajib Menjadi Pengurus Adalah Anggota Aktif HIMAKALA**:
   - Calon pengurus **wajib terdaftar lebih dulu sebagai Anggota Aktif HIMAKALA** (`status_aktif = true`, memiliki NRP, No. WA, dan Email Kampus).
   - Pada menu **Angkat Pengurus** (`/admin?tab=pengurus`), Ketua HIMAKALA atau Sekretaris memilih kandidat dari daftar **Anggota Aktif HIMAKALA**, menentukan `peran_pengguna`, memilih **Divisi**, dan mengisi **Nama Jabatan Struktur** (contoh: *Kadiv RSTEK* atau *Staf PSDM*).
   - Jika status keanggotaan seseorang dinonaktifkan (`nonaktif`) pada menu **Anggota Aktif**, maka jabatan kepengurusannya otomatis dicabut dan perannya dikembalikan menjadi `anggota`.
