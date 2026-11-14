# HIMAKALA: Website Transparansi dan Informasi Himpunan Mahasiswa PSDKU Lamongan (PENS)

Platform informasi resmi dan pusat transparansi **Himpunan Mahasiswa PSDKU Lamongan Politeknik Elektronika Negeri Surabaya (PENS)** untuk mahasiswa Program Studi **Teknik Informatika (TI)** dan **Multimedia Broadcasting (MMB)**.

Repositori ini dipisahkan menjadi dua bagian utama: **`frontend/`** (React 18 + TypeScript + Vite + Tailwind CSS) dan **`backend/`** (PostgreSQL / Supabase + Row Level Security + Edge Functions).

---

## Panduan Cepat untuk Kolaborator (Quick Start)

Ikuti 4 langkah berikut untuk menjalankan dan mem-build proyek ini di komputer lokal Anda:

### 1. Prasyarat
- **Node.js** `>= 18.x` dan **npm** `>= 9.x`
- Akun atau akses proyek **Supabase** (untuk database PostgreSQL terpusat)

### 2. Setup Database Supabase (`backend/`)
Jika proyek Supabase baru dibuat, jalankan **satu file gabungan SQL** berikut di menu **SQL Editor** Dashboard Supabase:
- Buka [backend/database/FULL_SETUP_HIMAKALA.sql](./backend/database/FULL_SETUP_HIMAKALA.sql), salin seluruh isinya, tempel ke **SQL Editor** Supabase, lalu klik **Run**.
- File ini otomatis membuat 12 tabel utama, tipe enum (`peran_pengguna`, `status_izin_proker`, dll.), 6 divisi resmi HIMAKALA, aturan keamanan RLS, serta akun awal di tabel `public.pengguna`.

*(Catatan: Jika Anda sebelumnya sudah menjalankan migrasi awal dan hanya ingin memperbarui tabel `public.pengguna` untuk login Email & Password, cukup jalankan [backend/database/02_update_auth_pengguna.sql](./backend/database/02_update_auth_pengguna.sql)).*

### 3. Konfigurasi Environment Variable (`frontend/.env`)
Masuk ke direktori `frontend/` dan salin template `.env.example` menjadi `.env`:
```bash
cd frontend
cp .env.example .env
```
Isi dengan **Project URL** dan **anon public key** dari Dashboard Supabase (**Project Settings -> API**):
```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

### 4. Instalasi, Menjalankan Dev Server, Test, & Build (`frontend/`)
```bash
cd frontend
npm install

# Menjalankan server pengembangan lokal (http://127.0.0.1:5173)
npm run dev

# Menjalankan unit test (Vitest)
npm run test

# Mem-build aplikasi untuk produksi (TypeScript check + Vite bundle)
npm run build
```

---

## Arsitektur 6 Divisi & Hak Akses (`peran_pengguna`)

Sistem menggunakan autentikasi **Email & Password** biasa tanpa *dropdown* pemilih peran di form login. Peran pengguna (`peran`) dan divisi (`id_divisi`) dibaca langsung dari tabel `public.pengguna` di database berdasarkan tipe enum `public.peran_pengguna`:

### 1. Enam Divisi Resmi HIMAKALA (`public.divisi`)
1. **BPH (`bph`)**: Badan Pengurus Harian (Ketua HIMAKALA sekaligus Ketua BPH, Sekretaris, dan Bendahara).
2. **Luar Negeri (`luar-negeri`)**: Hubungan eksternal, kolaborasi antar-himpunan, dan kemitraan luar kampus.
3. **Dalam Negeri (`dalam-negeri`)**: Koordinasi internal mahasiswa, aspirasi anggota, dan kegiatan dalam kampus.
4. **Media dan Informasi (`medinfo`)**: Publikasi berita resmi, media kreatif, dan dokumentasi kegiatan.
5. **PSDM (`psdm`)**: Pengembangan Sumber Daya Mahasiswa, kaderisasi, dan pendataan pengurus.
6. **RSTEK (`rstek`)**: Riset dan Teknologi serta pengembangan karya inovasi mahasiswa TI & MMB.

### 2. Matriks Peran Database (`public.peran_pengguna`) & Hak CRUD
| Enum `peran_pengguna` | Divisi | Hak Akses CRUD Proker | Fungsi Tambahan di Sidebar |
| :--- | :--- | :--- | :--- |
| `anggota` | - | **Hanya Baca (Read-Only)**: Melihat web tanpa bisa mengedit isiannya | Menu lihat web publik |
| `pengurus_divisi` | Sesuai Divisi | **CRUD Atas Izin Ketua Divisi**: Tambah/ubah/hapus proker divisinya masuk status `menunggu_izin_kabid` | Modul spesifik divisinya (`Medinfo`, `PSDM`, `Dalam Negeri`) |
| `ketua_divisi` | Sesuai Divisi | **CRUD Tanpa Izin Siapapun** untuk proker divisinya + **Memberi Izin (Setujui/Tolak)** pengajuan dari `pengurus_divisi` | Menu `Izin Divisi` + Modul spesifik divisinya |
| `sekretaris` | `BPH` | **CRUD Proker Tanpa Izin Siapapun** | Kelola `Dokumen & SK` serta `Data Pengurus` |
| `bendahara` | `BPH` | **CRUD Proker Tanpa Izin Siapapun** | Kelola `Kas & Anggaran` |
| `ketua_himakala` | `BPH` (Ketua BPH) | **Akses Penuh (Full CRUD) Tanpa Izin Siapapun** di seluruh 6 divisi | Semua modul + `Izin Proker` + `Akun Pengguna` |

### 3. Akun Awal untuk Pengujian Kolaborator
Setelah menjalankan [FULL_SETUP_HIMAKALA.sql](./backend/database/FULL_SETUP_HIMAKALA.sql) atau [02_update_auth_pengguna.sql](./backend/database/02_update_auth_pengguna.sql), kolaborator dapat mencoba login dengan password bawaan `himakala123`:
- **Ketua HIMAKALA (Ketua BPH)**: `ketua@himakala.ac.id`
- **Sekretaris BPH**: `sekretaris@himakala.ac.id`
- **Bendahara BPH**: `bendahara@himakala.ac.id`
- **Ketua Divisi**: `kabid.ln@himakala.ac.id`, `kabid.dn@himakala.ac.id`, `kabid.medinfo@himakala.ac.id`, `kabid.psdm@himakala.ac.id`, `kabid.rstek@himakala.ac.id`
- **Pengurus Divisi**: `pengurus.ln@himakala.ac.id`, `pengurus.dn@himakala.ac.id`, `pengurus.medinfo@himakala.ac.id`, `pengurus.psdm@himakala.ac.id`, `pengurus.rstek@himakala.ac.id`
- **Anggota Biasa (Read-Only)**: `anggota@himakala.ac.id`

---

## Struktur Direktori Proyek

```text
HIMAKALA/
├── README.md                                   # Panduan utama kolaborator & arsitektur proyek
├── PANDUAN_ADMIN.md                            # Panduan operasional pengurus per peran & divisi
├── DESIGN.md                                   # Dokumentasi sistem desain & palet warna
│
├── frontend/                                   # Aplikasi Web Client (React 18, TypeScript, Vite, Tailwind)
│   ├── README.md                               # Panduan build & arsitektur komponen Frontend
│   ├── .env.example                            # Template environment variable Supabase
│   ├── public/                                 # Aset statis publik (favicon, robots.txt)
│   ├── src/
│   │   ├── assets/                             # Logo resmi HIMAKALA & PENS
│   │   ├── components/
│   │   │   ├── layout/AppShell.tsx             # Frame utama statis, sidebar dinamis 6 divisi, & modal login
│   │   │   └── shared/DataStateView.tsx        # Komponen status (Loading/Empty/Error), Badge, & InitialAvatar
│   │   ├── data/initial-data.ts                # Definisi 6 divisi resmi & state awal kosong (tanpa dummy)
│   │   ├── lib/utils.ts                        # Formatter Rupiah, tanggal, inisial, & helper izin peran
│   │   ├── pages/
│   │   │   ├── public/                         # Halaman Beranda, Proker, Transparansi, 6 Divisi, Berita, Aspirasi
│   │   │   └── admin/AdminPanelPage.tsx        # Workspace CRUD kepengurusan & antrean izin Ketua Divisi
│   │   ├── services/
│   │   │   ├── supabase-client.ts              # Inisialisasi klien @supabase/supabase-js
│   │   │   └── himakala-store.tsx              # State & sinkronisasi CRUD ke Supabase PostgreSQL
│   │   └── types/entities.ts                   # Kontrak tipe TypeScript untuk 12 entitas database
│   └── tests/himakala.test.ts                  # Suite pengujian otomatis (Vitest)
│
└── backend/                                    # Database PostgreSQL, Kebijakan RLS, & Serverless Functions
    ├── README.md                               # Panduan database & deployment Backend
    ├── .env.example                            # Template variabel lingkungan Backend
    ├── database/
    │   ├── FULL_SETUP_HIMAKALA.sql             # Skrip SQL gabungan sekali jalan untuk Supabase SQL Editor
    │   ├── 02_update_auth_pengguna.sql         # Skrip patch autentikasi tabel `pengguna` & enum role
    │   ├── migrations/                         # File DDL terpisah (0001 enums, 0002 tables, 0003 triggers)
    │   ├── policies/0001_rls_policies.sql      # Kebijakan Row Level Security (RLS) PostgreSQL
    │   └── seed/01_seed_initial_data.sql       # Seed 6 divisi resmi & periode aktif (tanpa data dummy)
    ├── storage/0001_storage_buckets.sql        # Konfigurasi bucket penyimpanan berkas
    ├── functions/                              # Edge Functions (submit-aspiration, track-aspiration, sync-pens-news)
    ├── scripts/migrate-legacy-localstorage.ts  # Utilitas migrasi data dari web lama
    └── tests/rls_and_constraints.test.sql      # Pengujian constraint SQL
```

---

## Panduan Kontribusi untuk Kolaborator

1. **Aturan Antarmuka & Tata Letak (`frontend/`)**:
   - **Sidebar Statis & Scroll Bagian Dalam**: Frame luar dan *sidebar* kiri (`<aside>` di `AppShell.tsx`) terkunci statis (`h-screen overflow-hidden`) dan tidak boleh ikut ter-scroll. Hanya area konten dalam (`<main id="main-content">`) yang menggunakan `overflow-y-auto`.
   - **Teks Ringkas**: Hindari paragraf deskripsi panjang di dalam kartu; pertahankan kepadatan maksimal 4 titik data per kartu dan kontras warna sesuai [DESIGN.md](./DESIGN.md).
   - **Tanpa Data Dummy**: Jangan memasukkan data *dummy* ke `initial-data.ts`. Biarkan array operasional kosong (`[]`) agar seluruh data dikelola secara dinamis dari database Supabase.
2. **Verifikasi Sebelum Pull Request / Commit**:
   Jalankan perintah berikut di dalam folder `frontend/` dan pastikan semuanya lulus tanpa error:
   ```bash
   cd frontend
   npm run test
   npm run build
   ```
