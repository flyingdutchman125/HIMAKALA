# Direktori Backend (`backend/`)

Direktori `backend/` menyimpan seluruh skema database **PostgreSQL (Supabase)**, kebijakan keamanan **Row Level Security (RLS)**, konfigurasi **Storage Buckets**, serta **Edge Functions** untuk sistem informasi **HIMAKALA**.

---

## Panduan Setup Cepat di Supabase (Untuk Kolaborator)

### Opsi 1: Setup Sekali Jalan via Dashboard Supabase (Direkomendasikan)
1. Buka proyek Anda di **[https://supabase.com/dashboard](https://supabase.com/dashboard)**.
2. Masuk ke menu **SQL Editor** -> klik **New query**.
3. Salin seluruh isi file **[database/FULL_SETUP_HIMAKALA.sql](./database/FULL_SETUP_HIMAKALA.sql)**, tempel ke editor, lalu klik **Run**.
4. Selesai! Seluruh 12 tabel, tipe enum, 6 divisi resmi, kebijakan akses, dan akun awal di tabel `public.pengguna` langsung aktif.

### Opsi 2: Patch Khusus Tabel `public.pengguna`
Jika Anda sudah pernah menjalankan migrasi tabel awal dan hanya ingin mengaktifkan fitur login Email & Password berbasis tabel `public.pengguna`:
- Jalankan isi file **[database/02_update_auth_pengguna.sql](./database/02_update_auth_pengguna.sql)** di SQL Editor Supabase.

---

## Daftar File SQL & Fungsinya

```text
backend/
├── database/
│   ├── FULL_SETUP_HIMAKALA.sql                 # Gabungan seluruh SQL (enums + tables + triggers + RLS + seed + auth)
│   ├── 02_update_auth_pengguna.sql             # Patch autentikasi tabel `pengguna` & akun awal 6 divisi
│   ├── migrations/
│   │   ├── 0001_enums_and_extensions.sql       # Enum `peran_pengguna`, `status_proker`, `status_izin_proker`, dll.
│   │   ├── 0002_tables_core.sql                # 12 tabel utama (periode, divisi, pengguna, pengurus, proker, dll.)
│   │   └── 0003_audit_log_triggers.sql         # Trigger pencatatan otomatis ke tabel `log_aktivitas`
│   ├── policies/
│   │   └── 0001_rls_policies.sql               # Aturan Row Level Security (RLS)
│   └── seed/
│       └── 01_seed_initial_data.sql            # Data awal periode aktif & 6 divisi resmi (tanpa data dummy)
├── storage/
│   └── 0001_storage_buckets.sql                # Konfigurasi bucket dokumen-publik, dokumen-internal, & media-kegiatan
├── functions/
│   ├── submit-aspiration/index.ts              # Sanitasi identitas aspirasi anonim & kode tiket ASP-YYYY-XXXX
│   ├── track-aspiration/index.ts               # Pelacakan publik tanpa membocorkan kontak pengirim
│   └── sync-pens-news/index.ts                 # Sinkronisasi berita kampus dari sisi server
├── scripts/
│   └── migrate-legacy-localstorage.ts          # Pembersih data placeholder "Entitas" dari web lama
└── tests/
    └── rls_and_constraints.test.sql            # Pengujian batasan SQL
```

---

## Struktur Enum `peran_pengguna` & 6 Divisi

1. **Enam Divisi Resmi (`public.divisi`)**:
   - `bph` (**BPH**)
   - `luar-negeri` (**Luar Negeri**)
   - `dalam-negeri` (**Dalam Negeri**)
   - `medinfo` (**Media dan Informasi**)
   - `psdm` (**PSDM**)
   - `rstek` (**RSTEK**)

2. **Enam Peran Pengguna (`public.peran_pengguna`)**:
   - `anggota`: User biasa (Anggota HIMAKALA), hanya baca (*read-only*).
   - `pengurus_divisi`: Pengurus per divisi, dapat mengajukan CRUD perkembangan proker divisinya (`status_izin = 'menunggu_izin_kabid'`).
   - `ketua_divisi`: Ketua divisi masing-masing, bebas CRUD proker divisinya tanpa izin (`status_izin = 'disetujui'`) dan berhak menyetujui/menolak pengajuan dari `pengurus_divisi`.
   - `sekretaris`: Sekretaris di divisi BPH, bebas CRUD proker & dokumen tanpa izin siapapun.
   - `bendahara`: Bendahara di divisi BPH, bebas CRUD proker & kas/anggaran tanpa izin siapapun.
   - `ketua_himakala`: Ketua HIMAKALA (sekaligus Ketua BPH), memegang akses penuh CRUD di seluruh 6 divisi dan manajemen akun pengguna.
