# Direktori Database PostgreSQL (`backend/database/`)

Direktori ini berisi seluruh definisi skema database PostgreSQL untuk **12 Entitas Utama** sesuai **Bagian 9 PRD**, kebijakan keamanan Row Level Security (RLS), serta data awal (*seed*).

---

## Struktur Sub-Direktori

```text
backend/database/
├── README.md               # Dokumentasi 12 entitas utama dan relasi tabel (file ini)
├── migrations/             # Skrip DDL pembuatan tabel, enum, indeks, dan trigger audit log
│   └── README.md
├── policies/               # Skrip kebijakan keamanan Row Level Security (RLS) 6 peran & publik
│   └── README.md
└── seed/                   # Data awal 6 divisi, periode kepengurusan, dan contoh data
    └── README.md
```

---

## Spesifikasi 12 Entitas Utama (Bagian 9 PRD)

| No | Tabel | Atribut Inti | Relasi & Keterangan |
| :--- | :--- | :--- | :--- |
| 1 | `periode` | `id`, `nama`, `tahun_mulai`, `tahun_selesai`, `status_aktif` | Hanya satu baris yang boleh memiliki `status_aktif = true` pada satu waktu (dijaga via partial unique index). |
| 2 | `divisi` | `id`, `slug`, `nama`, `deskripsi`, `ikon`, `warna_gradient` | Menyimpan 6 divisi HIMAKALA. |
| 3 | `pengurus` | `id`, `nama`, `jabatan`, `prodi`, `id_divisi`, `foto_url`, `instagram`, `linkedin`, `id_periode` | `FK` ke `divisi(id)` dan `periode(id)`. |
| 4 | `proker` | `id`, `slug`, `judul`, `deskripsi`, `tujuan`, `target_peserta`, `id_divisi`, `pic`, `tanggal_mulai`, `tanggal_selesai`, `status`, `progres`, `id_periode` | Status: `direncanakan`, `berjalan`, `selesai`, `batal`. Progres: `0..100`. |
| 5 | `anggaran` | `id`, `id_proker`, `rencana`, `realisasi`, `keterangan`, `status_persetujuan`, `disetujui_oleh` | Status persetujuan: `draft`, `menunggu_persetujuan`, `disetujui`, `revisi` (`FA-10`). |
| 6 | `berita` | `id`, `slug`, `judul`, `isi`, `kategori`, `sampul_url`, `penulis_id`, `tanggal`, `status_terbit` | `FK` ke `pengguna(id)`. |
| 7 | `dokumen` | `id`, `judul`, `kategori`, `berkas_url`, `visibilitas`, `id_periode` | Visibilitas: `publik` atau `internal` (`FA-04`). |
| 8 | `galeri` | `id`, `id_proker`, `berkas_url`, `keterangan` | Dokumentasi visual kegiatan yang terhubung ke `proker(id)`. |
| 9 | `aspirasi` | `id`, `nomor_pelacakan`, `isi`, `anonim`, `kontak_opsional`, `status`, `tanggapan` | Status: `diterima`, `diproses`, `selesai` (`FP-11`, `FP-12`). |
| 10 | `pendaftaran` | `id`, `id_proker`, `data_pendaftar` (`jsonb`) | Menyimpan pendaftaran kegiatan/kepanitiaan mahasiswa (`FP-13`). |
| 11 | `pengguna` | `id`, `nama`, `email`, `peran`, `id_divisi`, `status` | Peran: `super_admin`, `ketua`, `sekretaris`, `bendahara`, `kepala_divisi`, `editor` (`FA-01`). |
| 12 | `log_aktivitas` | `id`, `id_pengguna`, `aksi`, `objek`, `waktu` | Dicatat otomatis melalui trigger database (`FA-09`). |

