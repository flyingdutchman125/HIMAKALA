# Panduan Operasional Kepengurusan HIMAKALA

Dokumen ini adalah panduan operasional bagi pengurus **HIMAKALA PSDKU Lamongan (PENS)** dalam menggunakan sistem informasi dan transparansi berbasis **6 Divisi** dan **Database Supabase**.

---

## 1. Cara Login Kepengurusan

1. Klik tombol **Login** di pojok kiri bawah *sidebar* atau di bagian kanan atas *header*.
2. Masukkan **Email** dan **Password** akun Anda (tanpa perlu memilih *dropdown* divisi atau jabatan).
3. Sistem secara otomatis membaca kolom `peran` (enum `peran_pengguna`) dan `id_divisi` Anda dari tabel `public.pengguna` di database Supabase, lalu menampilkan menu *sidebar* yang sesuai dengan fungsi divisi Anda.

---

## 2. Pembagian 6 Divisi & Hak Akses (`peran_pengguna`)

| Peran (`peran_pengguna`) | Divisi | Hak CRUD Proker | Menu Sidebar yang Muncul |
| :--- | :--- | :--- | :--- |
| **Anggota (`anggota`)** | - | Tidak bisa mengedit (Hanya melihat web) | `Beranda`, `Program Kerja`, `Kas & Dokumen`, `6 Divisi`, `Berita`, `Aspirasi` |
| **Ketua HIMAKALA (`ketua_himakala`)** | **BPH** (Ketua BPH) | **Bebas CRUD Tanpa Izin** untuk seluruh 6 divisi | `Proker 6 Divisi`, `Izin Proker`, `Kas & Anggaran`, `Dokumen & SK`, `Data Pengurus`, `Berita Medinfo`, `Aspirasi Anggota`, `Akun Pengguna` |
| **Sekretaris (`sekretaris`)** | **BPH** | **Bebas CRUD Tanpa Izin** | `CRUD Proker`, `Dokumen & SK`, `Data Pengurus` |
| **Bendahara (`bendahara`)** | **BPH** | **Bebas CRUD Tanpa Izin** | `CRUD Proker`, `Kas & Anggaran` |
| **Ketua Divisi (`ketua_divisi`)** | **Luar Negeri, Dalam Negeri, Media dan Informasi, PSDM, RSTEK** | **Bebas CRUD Tanpa Izin** untuk divisinya + **Memberi Izin** pengajuan pengurus divisinya | `CRUD Proker <Divisi>`, `Izin <Divisi>`, serta menu fungsional divisinya |
| **Pengurus Divisi (`pengurus_divisi`)** | **BPH, Luar Negeri, Dalam Negeri, Media dan Informasi, PSDM, RSTEK** | **CRUD Atas Izin Ketua Divisi** (`menunggu_izin_kabid`) | `Proker <Divisi> (Izin)`, serta menu fungsional divisinya |

---

## 3. Alur Perizinan CRUD Proker per Divisi

1. **Pengajuan oleh Pengurus Divisi (`pengurus_divisi`)**:
   - Saat Pengurus Divisi menambah proker baru, memperbarui persentase progres, atau mengajukan penghapusan proker, sistem menyimpannya dengan status `menunggu_izin_kabid`.
   - Perubahan tersebut belum tampil ke pengunjung umum/anggota sebelum disetujui.
2. **Persetujuan oleh Ketua Divisi (`ketua_divisi`) atau Ketua HIMAKALA (`ketua_himakala`)**:
   - Ketua Divisi melihat lencana (*badge*) jumlah pengajuan pada menu **`Izin <Nama Divisi>`** di *sidebar*.
   - Klik **Beri Izin** untuk langsung mempublikasikan perubahan (`status_izin = 'disetujui'`), atau klik **Tolak** untuk membatalkan pengajuan.

---

## 4. Mengelola Akun Pengguna Baru

Penambahan atau perubahan role pengurus dapat dilakukan melalui 2 cara:
1. **Langsung dari Web (Khusus `ketua_himakala`)**:
   - Buka menu **Akun Pengguna** di *sidebar* (`/admin?tab=pengguna`).
   - Isi Nama, Email, Password, pilih `peran_pengguna`, dan pilih Divisi, lalu klik **Simpan Akun**.
2. **Melalui Dashboard Supabase**:
   - Buka menu **Table Editor** -> pilih tabel **`pengguna`**.
   - Tambah atau ubah baris dengan memilih nilai kolom `peran` dari dropdown enum `peran_pengguna` dan `id_divisi` dari relasi tabel `divisi`.
