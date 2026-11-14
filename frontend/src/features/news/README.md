# Modul Berita, Pengumuman & Galeri (`src/features/news/`)

Modul ini mengelola publikasi artikel berita himpunan, pengumuman resmi kegiatan, serta galeri dokumentasi visual kegiatan mahasiswa Teknik Informatika dan Multimedia Broadcasting PSDKU Lamongan.

---

## Kebutuhan Fungsional yang Dicakup

- **`FP-07` (Tinggi):** Berita dan pengumuman dengan pengelompokan kategori (`Pengumuman`, `Kegiatan`, `Prestasi`, `Akademik`, `Kampus PENS`).
- **`FP-10` (Sedang):** Galeri dokumentasi kegiatan yang terhubung dengan program kerja terkait.
- **`FA-03` (Tinggi):** CRUD berita, pengumuman, dan galeri dokumentasi di Panel Admin.

---

## Respons terhadap Temuan Audit Repo Lama (Bagian 2.1 & 10 PRD)

Pada repositori lama (`src/components/BeritaSection.tsx`), berita diambil dengan melakukan `fetch` langsung ke `https://www.pens.ac.id` dari browser lalu mem-parsing HTML menggunakan `DOMParser`, yang sering gagal akibat kebijakan CORS dan menampilkan berita umum kampus, bukan berita HIMAKALA.

Pada arsitektur baru ini:
1. Berita utama dikelola langsung oleh `Editor` / pengurus HIMAKALA melalui Panel Admin dan disimpan di tabel `berita`.
2. Jika pengurus ingin menautkan berita dari situs utama PENS, tersedia field `sumber_eksternal_url` atau tombol sinkronisasi yang memanggil Supabase Edge Function `sync-pens-news` (berjalan di server, bebas kendala CORS).

---

## Struktur Berkas yang Direkomendasikan

```text
src/features/news/
├── README.md
├── components/
│   ├── NewsCategoryTabs.tsx        # Filter kategori berita dan pengumuman
│   ├── NewsCard.tsx                # Kartu berita dengan gambar sampul teroptimasi, tanggal, dan kategori
│   ├── NewsArticleDetail.tsx       # Halaman baca berita lengkap dengan tombol bagikan tautan
│   ├── GalleryMasonryGrid.tsx      # Grid galeri dokumentasi kegiatan dengan filter per proker/periode (FP-10)
│   ├── GalleryLightboxModal.tsx    # Tampilan perbesaran foto dokumentasi beserta keterangan kegiatan
│   └── AdminNewsGalleryManager.tsx # Editor artikel berita dan pengunggah foto galeri (FA-03)
├── hooks/
│   ├── useNews.ts                  # Query daftar berita terbit & detail berita berdasarkan `slug`
│   ├── useGallery.ts               # Query daftar dokumentasi foto dari tabel `galeri`
│   └── useManageNews.ts            # Mutation CRUD berita & unggah gambar ke bucket `galeri-kegiatan`
└── schemas/
    └── news.schema.ts              # Validasi Zod untuk artikel berita dan item galeri
```

