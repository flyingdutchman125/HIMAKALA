# Modul Dashboard Transparansi & Audit Log (`src/features/dashboard/`)

Modul ini menyajikan ringkasan metrik utama untuk pengunjung publik (Beranda dan Dashboard Transparansi) sekaligus menyediakan pusat kendali internal bagi pengurus (peringatan operasional `FA-08` dan jejak audit `FA-09`).

---

## Kebutuhan Fungsional yang Dicakup

- **`FP-01` (Tinggi):** Beranda berisi ringkasan pengumuman terbaru, kegiatan mendatang, dan statistik program kerja periode aktif.
- **`FP-09` (Tinggi):** Visualisasi ikhtisar dashboard transparansi (persentase penyelesaian proker per divisi & total serapan anggaran).
- **`FA-08` (Sedang):** Dashboard internal admin yang menyoroti:
  - Program kerja yang terlambat diperbarui (> 7 hari setelah perubahan/tenggat).
  - Peringatan anggaran proker yang hampir habis atau menunggu persetujuan Ketua.
  - Aspirasi mahasiswa yang belum ditangani mendekati batas SLA 7 hari.
- **`FA-09` (Sedang):** Log aktivitas sistem (*audit trail*) yang mencatat siapa mengubah data apa dan kapan.

---

## Struktur Berkas yang Direkomendasikan

```text
src/features/dashboard/
├── README.md
├── components/
│   ├── PublicHeroSummary.tsx           # Hero beranda dengan metrik nyata dari database (bukan angka statis palsu)
│   ├── TransparencyOverviewCharts.tsx  # Grafik progres proker per divisi & ringkasan serapan dana publik
│   ├── AdminOperationalAlerts.tsx      # Panel peringatan proker terlambat, anggaran, & aspirasi belum dibalas (FA-08)
│   └── ActivityLogTable.tsx            # Tabel audit trail riwayat aksi pengurus dilengkapi filter waktu & pengguna (FA-09)
└── hooks/
    ├── usePublicStats.ts               # Query agregasi jumlah proker per status & pengumuman terbaru
    ├── useAdminAlerts.ts               # Query item kerja yang memerlukan perhatian segera dari pengurus
    └── useActivityLogs.ts              # Query tabel `log_aktivitas` terpaginasi
```

---

## Aturan Kejujuran Data Statistik

Sesuai prinsip transparansi pada PRD, seluruh angka statistik yang ditampilkan pada Beranda dan Dashboard Transparansi **wajib dihitung langsung dari data nyata di database Supabase** (misal: `COUNT` proker periode aktif). Jika periode baru saja dimulai dan belum ada data anggaran yang disetujui, tampilkan status kosong (*Empty State*) yang jujur dan jangan menampilkan angka dummy/fiktif.

