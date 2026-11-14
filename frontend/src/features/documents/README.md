# Modul Pusat Dokumen Resmi (`src/features/documents/`)

Modul ini menyediakan repositori terpusat untuk pengarsipan, pencarian, dan pengunduhan dokumen resmi organisasi lintas periode kepengurusan.

---

## Kebutuhan Fungsional yang Dicakup

- **`FP-08` (Tinggi):** Pusat dokumen publik: AD/ART, Surat Keputusan (SK), Laporan Pertanggungjawaban (LPJ), dan notulen publik yang dapat dicari dan diunduh oleh mahasiswa.
- **`FA-04` (Tinggi):** Unggah dan kelola dokumen di Panel Admin dengan pengaturan visibilitas (`publik` atau `internal`).

---

## Kategori Dokumen Standar

1. **`AD_ART`**: Anggaran Dasar dan Anggaran Rumah Tangga HIMAKALA.
2. **`SK`**: Surat Keputusan pengangkatan pengurus, kepanitiaan, atau penetapan organisasi.
3. **`LPJ`**: Laporan Pertanggungjawaban kegiatan/proker maupun akhir periode.
4. **`SOP_PEDOMAN`**: Standar Operasional Prosedur dan pedoman administrasi himpunan.
5. **`NOTULEN`**: Notulen rapat umum anggota atau musyawarah mahasiswa yang bersifat terbuka.

---

## Struktur Berkas yang Direkomendasikan

```text
src/features/documents/
├── README.md
├── components/
│   ├── DocumentSearchFilter.tsx    # Pencarian judul dokumen, filter kategori, dan filter periode
│   ├── DocumentListTable.tsx       # Daftar dokumen publik dilengkapi ukuran berkas & tombol unduh PDF
│   ├── DocumentPreviewModal.tsx    # Pratinjau dokumen PDF langsung di dalam halaman
│   └── AdminDocumentUploader.tsx   # Form unggah berkas ke bucket `dokumen-resmi` & sakelar visibilitas (FA-04)
├── hooks/
│   ├── useDocuments.ts             # Query daftar dokumen sesuai hak akses (publik vs pengurus login)
│   └── useManageDocuments.ts       # Mutation unggah berkas ke Supabase Storage & simpan metadata tabel `dokumen`
└── schemas/
    └── document.schema.ts          # Validasi tipe berkas (wajib PDF) dan ukuran maksimum berkas
```

---

## Aturan Keamanan Visibilitas (`FA-04`)

- Dokumen dengan `visibilitas = 'publik'` menggunakan URL unduhan publik dari bucket `dokumen-resmi`.
- Dokumen dengan `visibilitas = 'internal'` hanya muncul di Panel Admin dan diunduh menggunakan *Signed URL* berbatas waktu (`createSignedUrl`) yang diverifikasi oleh sesi Supabase Auth pengurus.

