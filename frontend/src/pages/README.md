# Direktori Halaman Rute (`src/pages/`)

Direktori ini berisi komponen tingkat halaman (*Route-level Pages*) yang dipetakan ke URL aplikasi menggunakan **`react-router-dom` v6** sesuai **Bagian 8 PRD (Struktur Halaman / Sitemap)**.

---

## Perbaikan dari Repositori Lama (Bagian 2.1 PRD)

Pada repositori lama, hanya terdapat satu rute (`/`) di `src/pages/Index.tsx` yang menumpuk seluruh bagian (`Hero`, `About`, `Berita`, `Members`, `Links`, `Footer`), sehingga pengunjung tidak dapat membagikan tautan spesifik ke suatu program kerja, berita, atau dokumen.

Pada arsitektur rebuild ini:
- Setiap halaman memiliki URL mandiri yang dapat dibagikan (*shareable URL*) dan memiliki `<title>` serta meta deskripsi masing-masing untuk mendukung SEO dasar (Bagian 7 PRD).
- Halaman dibagi menjadi dua kelompok utama:
  - [`public/`](./public/README.md): Halaman yang dapat diakses oleh seluruh mahasiswa, dosen/pembina, dan mitra luar tanpa perlu login.
  - [`admin/`](./admin/README.md): Halaman manajemen internal pengurus yang dilindungi oleh autentikasi dan otorisasi peran (`ProtectedRoute`).

---

## Panduan Penggunaan Code-Splitting pada Rute

Gunakan `React.lazy()` pada definisi router utama (`src/App.tsx`) untuk memisahkan bundel halaman Admin dari bundel halaman Publik agar pengunjung umum di jaringan seluler tidak perlu mengunduh kode Panel Admin:

```tsx
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { LoadingState } from "@/components/shared/LoadingState";

// Rute Admin dimuat secara lazy hanya ketika pengguna mengakses /admin/*
const AdminLayout = lazy(() => import("@/components/layout/AdminLayout"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
```

