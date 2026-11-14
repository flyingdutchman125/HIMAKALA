# Direktori Aset Publik Statis (`public/`)

Direktori ini berisi berkas statis yang disajikan langsung dari akar domain (`/`) tanpa melalui proses transformasi bundel Vite.

---

## Daftar Berkas

| Berkas | Status | Fungsi |
| :--- | :--- | :--- |
| `favicon.ico` | Dipertahankan dari repo lama | Ikon tab browser resmi HIMAKALA |
| `robots.txt` | Dipertahankan & disesuaikan | Pengaturan perayapan mesin pencari (mengizinkan halaman publik, menutup `/admin`) |
| `placeholder.svg` | Dipertahankan dari repo lama | Gambar cadangan (*fallback*) untuk sampul proker atau dokumen yang belum memiliki gambar |
| `sitemap.xml` | Baru (SEO Dasar - Bagian 7 PRD) | Peta situs halaman publik untuk indeks mesin pencari |

---

## Panduan Build & Penggunaan

### 1. Cara Mengakses Berkas di Kode
Berkas di dalam `public/` direferensikan menggunakan jalur absolut mulai dari `/`:

```tsx
// Contoh penggunaan di HTML atau JSX
<link rel="icon" href="/favicon.ico" />
<img src="/placeholder.svg" alt="Ilustrasi cadangan kegiatan" width={400} height={250} />
```

### 2. Kapan Menggunakan `public/` vs `src/assets/`?
- **Gunakan `public/`** untuk berkas yang harus mempertahankan nama tetap di URL akar (`robots.txt`, `favicon.ico`, `sitemap.xml`, `manifest.webmanifest`, gambar OpenGraph `og-image.png`).
- **Gunakan `src/assets/`** untuk logo organisasi (`himakala-logo.png`, `pens-logo.png`) dan ilustrasi komponen agar dioptimasi dan diberi *hash* otomatis oleh Vite saat proses `npm run build`.

### 3. Aturan SEO & Keamanan pada `robots.txt`
Pastikan `public/robots.txt` selalu memblokir indeks mesin pencari ke rute internal admin:

```txt
User-agent: *
Allow: /
Disallow: /admin/
Sitemap: https://himakala.pens.ac.id/sitemap.xml
```

