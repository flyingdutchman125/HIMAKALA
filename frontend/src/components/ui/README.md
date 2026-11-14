# Direktori Komponen Primitif (`src/components/ui/`)

Direktori ini menyimpan komponen antarmuka dasar berbasis **shadcn/ui** dan **Radix UI** yang dipertahankan dari repositori lama serta digunakan sebagai blok pembangun (*building blocks*) di seluruh halaman publik dan panel admin.

---

## Daftar Komponen Utama & Kegunaannya di Proyek HIMAKALA

| Komponen | Kegunaan pada Fitur PRD |
| :--- | :--- |
| `button.tsx`, `input.tsx`, `textarea.tsx`, `label.tsx`, `select.tsx`, `checkbox.tsx`, `switch.tsx` | Elemen dasar formulir pendaftaran kegiatan (`FP-13`), pengiriman aspirasi (`FP-11`), dan form CRUD Admin (`FA-02` s.d. `FA-07`) |
| `form.tsx` | Integrasi `react-hook-form` + `zod` untuk validasi input aman dengan pesan kesalahan yang jelas |
| `table.tsx`, `pagination.tsx` | Tabel daftar dokumen resmi (`FP-08`), rincian anggaran keuangan (`FP-09`), dan log aktivitas (`FA-09`) |
| `card.tsx`, `badge.tsx`, `progress.tsx` | Kartu program kerja (`FP-04`), indikator status proker, dan batang persentase progres/serapan anggaran |
| `dialog.tsx`, `alert-dialog.tsx`, `sheet.tsx`, `drawer.tsx` | Modal detail pengurus (`FP-03`), konfirmasi persetujuan laporan keuangan oleh Ketua (`FA-10`), dan navigasi seluler |
| `tabs.tsx`, `accordion.tsx`, `collapsible.tsx` | Pengelompokan struktur divisi, arsip periode (`FP-14`), dan rincian proker (`FP-05`) |
| `calendar.tsx`, `popover.tsx` | Kalender kegiatan himpunan (`FP-06`) dan pemilih tanggal pelaksanaan proker di Panel Admin |
| `chart.tsx` | Pembungkus grafik `recharts` untuk visualisasi serapan anggaran dan statistik proker di Dashboard Transparansi (`FP-01`, `FP-09`) |
| `skeleton.tsx`, `alert.tsx`, `sonner.tsx`, `toast.tsx` | Penanganan status muat (*loading skeleton*), pesan peringatan error, dan notifikasi umpan balik aksi pengguna |
| `sidebar.tsx`, `breadcrumb.tsx`, `dropdown-menu.tsx`, `avatar.tsx` | Kerangka navigasi Panel Admin berbasis peran (`FA-01`) |

---

## Panduan Menambah atau Memperbarui Komponen

Konfigurasi `shadcn/ui` diatur melalui berkas `components.json` di root proyek. Untuk menambahkan komponen baru:

```bash
npx shadcn@latest add <nama-komponen>
```

**Catatan Penting:** Jangan memasukkan logika pemanggilan API atau state bisnis spesifik HIMAKALA langsung ke dalam file di `src/components/ui/`. Buat komponen pembungkus di `src/components/shared/` atau `src/features/<fitur>/components/`.

