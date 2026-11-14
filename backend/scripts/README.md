# Direktori Skrip Utilitas Backend (`backend/scripts/`)

Direktori ini menyimpan skrip otomasi administrasi database, penyelamatan data dari repositori lama, dan pembuatan tipe TypeScript.

---

## Daftar Skrip

| Nama Skrip | Kegunaan |
| :--- | :--- |
| `migrate-legacy-localstorage.ts` | Membaca ekspor JSON dari `localStorage` browser admin lama (`himakala_admin_data` dan `himakala_divisions_data`), membuang data placeholder `"Entitas"`, lalu mengubahnya menjadi perintah SQL `INSERT` untuk `backend/database/seed/` (menjawab Bagian 12 PRD). |
| `generate-db-types.sh` | Meng-generate kontrak tipe TypeScript dari skema PostgreSQL di `backend/` dan menyimpannya langsung ke `frontend/src/types/database.types.ts`. |
| `backup-database.sh` | Melakukan pencadangan (*backup* `pg_dump`) rutin seluruh data lintas periode kepengurusan sesuai kebutuhan non-fungsional Bagian 7 PRD. |

---

## Cara Menjalankan Skrip

```bash
cd backend

# Konversi backup JSON localStorage lama menjadi SQL seed
npx tsx scripts/migrate-legacy-localstorage.ts ./legacy-backup.json > database/seed/99_legacy_migrated.sql

# Generate tipe database ke frontend
sh scripts/generate-db-types.sh
```

