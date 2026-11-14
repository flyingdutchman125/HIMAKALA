# Modul Transparansi Keuangan (`src/features/finance/`)

Modul ini menyajikan transparansi pengelolaan keuangan himpunan kepada mahasiswa, mulai dari ringkasan kas periode berjalan, perbandingan rencana anggaran terhadap realisasi per program kerja, hingga alur kontrol internal antara **Bendahara** dan **Ketua Himpunan**.

---

## Kebutuhan Fungsional yang Dicakup

- **`FP-09` (Tinggi):** Halaman transparansi keuangan publik: ringkasan kas, grafik serapan anggaran, dan tabel rencana vs realisasi per proker.
- **`FA-05` (Tinggi):** Input rencana anggaran dan realisasi penggunaan dana dengan pembatasan akses khusus untuk peran **Bendahara** (dan `Super Admin`).
- **`FA-10` (Sedang):** Alur persetujuan (*approval workflow*): data keuangan sensitif hanya tampil di halaman publik setelah disetujui oleh **Ketua Himpunan**.

---

## Alur Status Persetujuan Keuangan (`FA-10`)

```text
[Bendahara Input/Update Anggaran]
              │
              ▼
        Status: draft
              │ (Bendahara ajukan verifikasi)
              ▼
   Status: menunggu_persetujuan
        ┌─────┴─────┐
        │           │
(Ketua Tolak/Revisi) (Ketua Setujui)
        │           │
        ▼           ▼
  Status: revisi  Status: disetujui ──► Tampil di Halaman Publik (/transparansi/keuangan)
```

---

## Struktur Berkas yang Direkomendasikan

```text
src/features/finance/
├── README.md
├── components/
│   ├── FinanceSummaryCards.tsx     # Ringkasan Total Rencana, Total Realisasi, dan Persentase Serapan
│   ├── BudgetVsActualChart.tsx     # Grafik batang perbandingan rencana vs realisasi per divisi/proker (Recharts)
│   ├── PublicFinanceTable.tsx      # Tabel rincian anggaran proker yang telah berstatus `disetujui`
│   ├── TreasurerBudgetForm.tsx     # Form input/edit anggaran khusus Bendahara (FA-05)
│   └── ChairmanApprovalQueue.tsx   # Antrean verifikasi dan tombol persetujuan khusus Ketua (FA-10)
├── hooks/
│   ├── usePublicFinance.ts         # Query data anggaran yang memiliki `status_persetujuan = 'disetujui'`
│   └── useManageFinance.ts         # Query & Mutation internal untuk Bendahara dan persetujuan Ketua
└── schemas/
    └── finance.schema.ts           # Skema Zod (memastikan nominal >= 0 dan keterangan wajib diisi)
```

