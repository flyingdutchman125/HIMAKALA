# Direktori Layanan API & Storage (`src/services/`)

Direktori ini menjadi lapisan abstraksi tunggal antara aplikasi React dan backend **Supabase** (PostgreSQL Database, Storage Buckets, dan Edge Functions).

---

## Prinsip Arsitektur `src/services/`

1. **Jangan Memanggil `supabase.from(...)` Langsung di Komponen JSX:**
   Seluruh kueri SQL, filter, unggah berkas, dan pemanggilan fungsi dilakukan di dalam `src/services/` lalu dikonsumsi oleh custom hooks TanStack Query di `src/features/<fitur>/hooks/`.
2. **Penanganan Error Terpusat:**
   Setiap fungsi layanan menerjemahkan kode error PostgreSQL/Supabase menjadi pesan Bahasa Indonesia yang jelas bagi pengguna maupun pengurus.
3. **Pencatatan Audit Log (`FA-09`):**
   Selain trigger otomatis di PostgreSQL, layanan mutasi menyertakan konteks pengguna aktif untuk keperluan pelacakan aktivitas di tabel `log_aktivitas`.

---

## Daftar Berkas Layanan

| Nama Berkas | Tabel / Bucket Terkait | Operasi Utama |
| :--- | :--- | :--- |
| `organization.service.ts` | Tabel `periode`, `divisi`, `pengurus` + Bucket `foto-pengurus` | Mengambil struktur per periode, mengelola periode aktif, unggah foto pengurus |
| `proker.service.ts` | Tabel `proker`, `pendaftaran` | Kueri daftar proker dengan filter multi-kriteria, detail slug, update progres, & simpan pendaftaran |
| `finance.service.ts` | Tabel `anggaran` | Kueri laporan keuangan yang sudah `disetujui` (publik), input anggaran Bendahara, & aksi persetujuan Ketua |
| `document.service.ts` | Tabel `dokumen` + Bucket `dokumen-resmi` | Pencarian dokumen, pembuatan URL unduh publik maupun *Signed URL* internal |
| `news.service.ts` | Tabel `berita`, `galeri` + Bucket `galeri-kegiatan` | CRUD artikel berita/pengumuman, unggah foto dokumentasi kegiatan, & pemicu `sync-pens-news` |
| `aspiration.service.ts` | Tabel `aspirasi` + Edge Function `submit-aspiration` | Kirim aspirasi (anonim/beridentitas), cek status via `nomor_pelacakan`, & simpan balasan pengurus |
| `audit-log.service.ts` | Tabel `log_aktivitas`, `pengguna` | Mengambil riwayat aktivitas pengurus dan manajemen peran akun |
