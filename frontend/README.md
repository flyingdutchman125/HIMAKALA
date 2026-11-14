# Direktori Frontend (`frontend/`)

Direktori `frontend/` berisi aplikasi antarmuka web **HIMAKALA** berbasis **React 18 + TypeScript + Vite + Tailwind CSS** yang terhubung langsung ke database PostgreSQL di **Supabase**.

---

## Tumpukan Teknologi Utama

- **Framework & Build Tool:** React 18 + TypeScript + Vite 5
- **Styling & Desain:** Tailwind CSS (Tema *Warm Editorial Canvas* `#FBF9F5`, *Ink Frame* `#222222`, kartu pastel `#FCE296` / `#DFC9FB` / `#C7E8FD` / `#D1F0D9`, dan aksen CTA `#C83E1D`)
- **Routing:** `react-router-dom` v6
- **Database Client:** `@supabase/supabase-js` v2
- **Testing:** Vitest (`npm run test`)

---

## Cara Build & Menjalankan bagi Kolaborator

### 1. Instalasi Paket
```bash
cd frontend
npm install
```

### 2. Konfigurasi `.env`
Salin `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Pastikan variabel berikut terisi dengan kredensial proyek Supabase:
```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```
*(Catatan: Gunakan URL dasar `https://<project-ref>.supabase.co` tanpa akhiran `/rest/v1/`).*

### 3. Perintah Pengembangan, Pengujian, & Produksi
| Perintah | Kegunaan |
| :--- | :--- |
| `npm run dev` | Menjalankan server pengembangan Vite di `http://127.0.0.1:5173` |
| `npm run test` | Menjalankan 10 pengujian otomatis di `tests/himakala.test.ts` |
| `npm run build` | Memeriksa tipe TypeScript (`tsc -b`) dan mem-build bundel produksi ke `dist/` |
| `npm run preview` | Menjalankan pratinjau hasil build produksi secara lokal |

---

## Arsitektur Komponen Penting

1. **`src/components/layout/AppShell.tsx`**:
   - Mengatur tata letak utama dengan `h-screen w-screen overflow-hidden`.
   - **Sidebar Kiri Statis**: Tidak ikut ter-scroll, otomatis menampilkan menu spesifik divisi saat pengurus login.
   - **Area Scroll Dalam (`<main id="main-content">`)**: Satu-satunya area yang dapat di-scroll (`overflow-y-auto`).
   - **Modal Login Biasa**: Hanya meminta `Email` dan `Password`, lalu mencocokkan akun ke tabel `public.pengguna` di Supabase untuk membaca enum `peran_pengguna` dan `id_divisi`.
2. **`src/services/himakala-store.tsx`**:
   - Mengelola state global aplikasi dan sinkronisasi baca/tulis (CRUD) ke tabel-tabel Supabase (`divisi`, `periode`, `pengguna`, `pengurus`, `proker`, `anggaran`, `dokumen`, `berita`, `aspirasi`, `pendaftaran`).
   - Menerapkan aturan perizinan otomatis:
     - `ketua_himakala`, `sekretaris`, `bendahara`, dan `ketua_divisi` langsung menyimpan proker dengan `status_izin = 'disetujui'`.
     - `pengurus_divisi` menyimpan pengajuan CRUD proker dengan `status_izin = 'menunggu_izin_kabid'` hingga disetujui oleh `ketua_divisi` atau `ketua_himakala`.
3. **`src/pages/admin/AdminPanelPage.tsx`**:
   - Workspace kerja kepengurusan berdasarkan tab query URL (`?tab=proker`, `?tab=izin`, `?tab=keuangan`, `?tab=dokumen`, `?tab=pengurus`, `?tab=berita`, `?tab=aspirasi`, `?tab=pengguna`).
