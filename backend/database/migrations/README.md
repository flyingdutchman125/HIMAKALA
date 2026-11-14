# Direktori Migrasi Tabel (`backend/database/migrations/`)

Direktori ini menyimpan skrip SQL berurutan untuk membangun struktur tabel, tipe `ENUM`, *constraint* integritas data, dan *trigger* pencatatan `log_aktivitas`.

---

## Urutan Berkas Migrasi

1. **`0001_enums_and_extensions.sql`**
   - Mengaktifkan `pgcrypto` dan mendefinisikan enum `peran_pengguna`, `status_proker`, `status_persetujuan_anggaran`, `visibilitas_dokumen`, serta `status_aspirasi`.
2. **`0002_tables_core.sql`**
   - Membuat ke-12 tabel utama beserta Foreign Key dan indeks pencarian (`idx_proker_periode_divisi_status`, `idx_dokumen_periode_kategori`, `idx_aspirasi_nomor_pelacakan`).
   - Menambahkan *check constraint* privasi anonim pada tabel `aspirasi`:
     ```sql
     CONSTRAINT chk_aspirasi_anonim CHECK (
       (anonim = true AND kontak_opsional IS NULL) OR (anonim = false)
     )
     ```
3. **`0003_audit_log_triggers.sql`**
   - Membuat fungsi trigger `fn_record_activity_log()` yang secara otomatis mengisi tabel `log_aktivitas` setiap kali pengguna terautentikasi melakukan `INSERT`, `UPDATE`, atau `DELETE` pada tabel `proker`, `anggaran`, `berita`, `dokumen`, `pengurus`, dan `aspirasi`.

---

## Panduan Menjalankan Migrasi

```bash
cd backend

# Membuat berkas migrasi baru
npx supabase migration new <nama_migrasi>

# Menguji seluruh migrasi dari awal pada database lokal
npx supabase db reset

# Menerapkan migrasi ke database produksi
npx supabase db push
```

