# Direktori Data Awal Database (`backend/database/seed/`)

Direktori ini berisi skrip SQL untuk mengisi data awal (*seed data*) ke database PostgreSQL saat inisialisasi lingkungan pengembangan maupun produksi awal.

---

## Data Awal yang Dipertahankan dari Repo Lama (Bagian 2.1 & 12 PRD)

Skrip `01_seed_divisions.sql` mempertahankan struktur **6 Divisi HIMAKALA** dari repositori lama (`src/data/divisions.ts`):

1. **`leadership`** - Kepemimpinan (`from-purple-500 to-pink-500`)
2. **`finance`** - Keuangan (`from-green-500 to-emerald-500`)
3. **`events`** - Acara & Program (`from-blue-500 to-cyan-500`)
4. **`media`** - Media & Komunikasi (`from-orange-500 to-red-500`)
5. **`it`** - IT & Teknologi (`from-indigo-500 to-blue-500`)
6. **`pr`** - Public Relations (`from-rose-500 to-pink-500`)

---

## Aturan Verifikasi Data Sebelum Rilis Produksi

Sesuai temuan audit pada **Bagian 2.1 PRD**:
- Dilarang menyertakan nama pengurus placeholder `"Entitas"` pada seed produksi.
- Seluruh tautan Instagram dan LinkedIn pengurus harus mengarah ke profil valid atau dikosongkan (`NULL`), bukan tautan generik `https://instagram.com`.
- Pastikan minimal satu periode kepengurusan aktif (misal: `Periode 2026/2027`) telah dibuat di `02_seed_periods.sql`.

