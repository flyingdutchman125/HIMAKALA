# Direktori Kode Sumber Utama (`src/`)

Direktori `src/` berisi seluruh kode sumber aplikasi frontend **HIMAKALA** yang dibangun dengan **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, dan **shadcn/ui**.

---

## Arsitektur & Alur Data

Aplikasi ini menerapkan arsitektur modular berbasis fitur (*Feature-Sliced Architecture*) untuk memastikan pemisahan tanggung jawab yang jelas dan kemudahan pemeliharaan lintas periode kepengurusan:

```text
[Komponen Halaman (src/pages/)]
       │
       ▼
[Modul Fitur Domain (src/features/<nama-fitur>/)]
       │  (Menggunakan TanStack Query hooks & validasi Zod)
       ▼
[Layanan API & Storage (src/services/)]
       │
       ▼
[Klien Supabase (src/lib/supabase.ts)] ──► Database PostgreSQL / Auth / Storage
```

---

## Peta Sub-Direktori di dalam `src/`

| Sub-Direktori | Tanggung Jawab Utama | Panduan Detail |
| :--- | :--- | :--- |
| [`assets/`](./assets/README.md) | Menyimpan logo resmi HIMAKALA (`himakala-logo.png`), logo PENS (`pens-logo.png`), dan aset visual statis yang diimpor di komponen | [Baca README](./assets/README.md) |
| [`components/`](./components/README.md) | Komponen UI murni yang dapat digunakan ulang di berbagai halaman (`ui/`, `layout/`, `shared/`, `effects/`) | [Baca README](./components/README.md) |
| [`features/`](./features/README.md) | Logika domain bisnis utama sesuai kebutuhan fungsional PRD (`auth`, `organization`, `proker`, `finance`, `documents`, `news`, `aspirations`, `dashboard`) | [Baca README](./features/README.md) |
| [`pages/`](./pages/README.md) | Komponen tingkat rute (`public/` dan `admin/`) yang dipetakan ke `react-router-dom` sesuai Sitemap Bagian 8 PRD | [Baca README](./pages/README.md) |
| [`hooks/`](./hooks/README.md) | Custom React hooks lintas aplikasi (`useAuth`, `useRoleGuard`, `useReducedMotion`, `useMobile`) | [Baca README](./hooks/README.md) |
| [`lib/`](./lib/README.md) | Konfigurasi pustaka pihak ketiga (`supabase.ts`, `query-client.ts`) dan utilitas pemformatan | [Baca README](./lib/README.md) |
| [`services/`](./services/README.md) | Fungsi komunikasi langsung ke tabel Supabase, unggah berkas Storage, dan pencatatan audit log | [Baca README](./services/README.md) |
| [`types/`](./types/README.md) | Kontrak tipe TypeScript untuk 12 entitas utama PRD dan skema database | [Baca README](./types/README.md) |
| [`styles/`](./styles/README.md) | Berkas CSS global, token warna HSL, konfigurasi gradient, dan tipografi | [Baca README](./styles/README.md) |
| [`data/`](./data/README.md) | Konstanta aplikasi, konfigurasi awal 6 divisi, dan matriks izin peran | [Baca README](./data/README.md) |

---

## Berkas Titik Masuk (Entry Points) di Root `src/`

- **`main.tsx`**: Titik masuk aplikasi yang me-mount `<App />` ke DOM `#root`.
- **`App.tsx`**: Mengonfigurasi `QueryClientProvider` (TanStack Query), `AuthProvider`, `TooltipProvider`, `Toaster`, dan `BrowserRouter` (`react-router-dom`).
- **`vite-env.d.ts`**: Deklarasi tipe untuk variabel lingkungan `import.meta.env.VITE_*`.

---

## Aturan Pengembangan di `src/`

1. **Dilarang Menyimpan Data Organisasi di `localStorage`:** Seluruh data dinamis (proker, pengurus, keuangan, dokumen, berita, aspirasi) wajib diambil dan disimpan melalui Supabase menggunakan TanStack Query.
2. **Import Alias (`@/`):** Gunakan alias `@/` untuk merujuk ke `src/` (contoh: `import { Button } from "@/components/ui/button"`).
3. **Tiga Kondisi UI Wajib:** Setiap komponen yang memuat data dari server wajib menangani kondisi **Loading** (skeleton/spinner), **Empty** (pesan saat data belum tersedia), dan **Error** (pesan gagal muat beserta tombol coba lagi).

