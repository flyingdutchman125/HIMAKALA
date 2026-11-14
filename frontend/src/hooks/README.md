# Direktori Custom React Hooks (`src/hooks/`)

Direktori ini berisi custom hooks bersifat global yang digunakan di berbagai halaman dan komponen. Hooks yang terikat spesifik pada satu entitas bisnis ditempatkan di `src/features/<nama-fitur>/hooks/`.

---

## Daftar Hooks Global

| Nama Berkas | Status | Fungsi |
| :--- | :--- | :--- |
| `use-mobile.tsx` | Dipertahankan dari repo lama | Mendeteksi apakah ukuran layar berada pada breakpoint seluler (`< 768px`) untuk penyesuaian tata letak responsif. |
| `use-toast.ts` | Dipertahankan dari repo lama | Mengelola notifikasi umpan balik pengguna (*toast notifications*) saat aksi berhasil atau gagal. |
| `useScrollReveal.ts` | Dipertahankan & disesuaikan | Mengatur animasi kemunculan elemen saat digulir dengan menghormati preferensi `prefers-reduced-motion`. |
| `useReducedMotion.ts` | Baru (Bagian 2.1 & 10 PRD) | Memantau media query `(prefers-reduced-motion: reduce)` secara reaktif untuk mematikan `Scene3D`, partikel, dan transisi berat secara otomatis. |
| `useActivePeriod.ts` | Baru (Bagian 9 PRD) | Menyimpan dan menyediakan konteks periode kepengurusan yang sedang dipilih pengguna (default: periode dengan `status_aktif = true`). |
| `useDebounce.ts` | Baru | Menunda eksekusi input pencarian kata kunci pada halaman Pusat Dokumen (`FP-08`) dan Daftar Proker (`FP-04`). |

---

## Catatan Migrasi dari Repo Lama

Pada repositori lama terdapat dua hook berbasis `localStorage`:
- `useAdminData.ts` (menyimpan ke `localStorage.getItem('himakala_admin_data')`)
- `useDivisionsData.ts` (menyimpan ke `localStorage.getItem('himakala_divisions_data')`)

Sesuai **Bagian 2.1 dan 12 PRD**, kedua hook tersebut **tidak lagi digunakan** karena perubahan di `localStorage` hanya terlihat di browser admin lokal. Sebagai gantinya, gunakan hooks berbasis **TanStack Query + Supabase** yang berada di `src/features/organization/hooks/` dan `src/features/dashboard/hooks/`.

