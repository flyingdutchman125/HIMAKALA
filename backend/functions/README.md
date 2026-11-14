# Direktori Endpoint & Edge Functions (`backend/functions/`)

Direktori ini menyimpan fungsi *serverless* (Supabase Edge Functions berbasis Deno/TypeScript) yang menangani logika bisnis sisi server yang membutuhkan keamanan ekstra, pemrosesan bebas CORS, atau pembatasan laju (*rate limiting*).

---

## Daftar Fungsi

| Sub-Direktori Fungsi | ID PRD | Tujuan Utama |
| :--- | :--- | :--- |
| [`submit-aspiration/`](./submit-aspiration/README.md) | `FP-11`, Bagian 7 | Menerima pengiriman aspirasi mahasiswa, menerapkan *rate-limiting*, menghapus metadata identitas jika anonim, dan menerbitkan kode unik `nomor_pelacakan`. |
| [`track-aspiration/`](./track-aspiration/README.md) | `FP-12` | Mengambil status tindak lanjut (`diterima`, `diproses`, `selesai`) dan tanggapan resmi berdasarkan `nomor_pelacakan` tanpa membuka akses baca seluruh tabel `aspirasi`. |
| [`sync-pens-news/`](./sync-pens-news/README.md) | Bagian 2.1 & 10 | Mengambil dan menyinkronkan berita resmi dari situs PENS di sisi server sehingga bebas dari blokir CORS browser. |

---

## Panduan Menjalankan & Deploy Fungsi

```bash
cd backend

# Menjalankan seluruh fungsi di lingkungan lokal (http://localhost:54321/functions/v1/<nama-fungsi>)
npx supabase functions serve

# Deploy fungsi ke proyek produksi
npx supabase functions deploy submit-aspiration
npx supabase functions deploy track-aspiration
npx supabase functions deploy sync-pens-news
```

