# Direktori Modul Fitur Domain (`src/features/`)

Direktori ini mengorganisasikan logika bisnis aplikasi HIMAKALA ke dalam modul-modul domain independen yang memetakan secara langsung **Kebutuhan Fungsional Situs Publik (`FP-01` s.d. `FP-15`)** dan **Kebutuhan Fungsional Panel Admin (`FA-01` s.d. `FA-10`)** pada Bagian 6 PRD.

---

## Pemetaan Modul terhadap Kebutuhan Fungsional PRD

| Modul Direktori | Cakupan Domain | ID Kebutuhan PRD | Entitas Database Utama |
| :--- | :--- | :--- | :--- |
| [`auth/`](./auth/README.md) | Login, sesi pengguna, dan kontrol akses berbasis 6 peran (RBAC) | `FA-01` | `pengguna`, `auth.users` |
| [`organization/`](./organization/README.md) | Profil organisasi, visi-misi, struktur kepengurusan 6 divisi, arsip periode, & kontak kerja sama | `FP-02`, `FP-03`, `FP-14`, `FP-15`, `FA-07` | `periode`, `divisi`, `pengurus` |
| [`proker/`](./proker/README.md) | Daftar & filter program kerja, detail proker, kalender kegiatan, dan form pendaftaran kepanitiaan/peserta | `FP-04`, `FP-05`, `FP-06`, `FP-13`, `FA-02` | `proker`, `pendaftaran` |
| [`finance/`](./finance/README.md) | Transparansi kas himpunan, anggaran vs realisasi per proker, input khusus Bendahara, dan persetujuan Ketua | `FP-09`, `FA-05`, `FA-10` | `anggaran` |
| [`documents/`](./documents/README.md) | Pusat dokumen resmi (AD/ART, SK, LPJ, notulen), pencarian, unduhan, dan pengaturan visibilitas publik/internal | `FP-08`, `FA-04` | `dokumen` |
| [`news/`](./news/README.md) | Berita & pengumuman berkategori serta galeri dokumentasi kegiatan | `FP-07`, `FP-10`, `FA-03` | `berita`, `galeri` |
| [`aspirations/`](./aspirations/README.md) | Form pengiriman aspirasi (opsi anonim), generator nomor pelacakan, cek status tindak lanjut, dan balasan admin | `FP-11`, `FP-12`, `FA-06` | `aspirasi` |
| [`dashboard/`](./dashboard/README.md) | Ringkasan statistik beranda, dashboard transparansi publik, peringatan internal admin, dan log aktivitas | `FP-01`, `FA-08`, `FA-09` | `log_aktivitas` + agregasi lintas tabel |

---

## Struktur Internal Standar Setiap Modul Fitur

Setiap sub-folder di dalam `src/features/<nama-fitur>/` mengikuti pola struktur yang seragam agar pengembang baru mudah menavigasi kode:

```text
src/features/<nama-fitur>/
├── README.md               # Spesifikasi domain, aturan bisnis, dan panduan komponen fitur
├── components/             # Komponen UI spesifik fitur tersebut (Publik & Admin)
├── hooks/                  # Custom hooks berbasis TanStack Query (useQuery & useMutation)
├── schemas/                # Skema validasi form menggunakan Zod
└── index.ts                # Barrel file untuk mengekspor komponen dan hooks publik fitur
```

