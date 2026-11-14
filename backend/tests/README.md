# Direktori Pengujian Backend (`backend/tests/`)

Direktori ini berisi pengujian otomatis untuk memverifikasi keamanan database, kebijakan Row Level Security (RLS) untuk ke-6 peran pengurus, serta keandalan Edge Functions.

---

## Cakupan Pengujian Backend Wajib

1. **Uji Otorisasi Keuangan (`FA-05` & `FA-10`):**
   - Memastikan pengguna dengan peran `editor` atau `kepala_divisi` ditolak saat mencoba melakukan `INSERT`/`UPDATE` pada tabel `anggaran`.
   - Memastikan baris `anggaran` dengan `status_persetujuan = 'menunggu_persetujuan'` tidak muncul saat dikueri oleh pengguna publik (`anon`).
   - Memastikan hanya peran `ketua` (dan `super_admin`) yang berhasil mengubah `status_persetujuan` menjadi `'disetujui'`.
2. **Uji Visibilitas Dokumen (`FA-04`):**
   - Memastikan dokumen dengan `visibilitas = 'internal'` tidak dapat dibaca oleh peran `anon`, tetapi dapat dibaca oleh pengurus yang terautentikasi.
3. **Uji Privasi Aspirasi Anonim (`FP-11` & Bagian 7):**
   - Memastikan pengiriman aspirasi dengan `anonim = true` tetapi menyertakan `kontak_opsional` ditolak oleh constraint database atau dibersihkan oleh fungsi `submit-aspiration`.
4. **Uji Otomasi Log Aktivitas (`FA-09`):**
   - Memastikan setiap perubahan pada tabel `proker` dan `anggaran` secara otomatis menghasilkan baris baru di tabel `log_aktivitas`.

---

## Cara Menjalankan Pengujian Backend

```bash
cd backend

# Menjalankan pengujian database pgTAP / Supabase test
npx supabase test db
```

