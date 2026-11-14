# Modul Organisasi, Struktur & Arsip Periode (`src/features/organization/`)

Modul ini mengelola informasi identitas HIMAKALA, sejarah, visi dan misi, struktur kepengurusan 6 divisi per periode, arsip kepengurusan lintas tahun, serta informasi kontak dan kerja sama.

---

## Kebutuhan Fungsional yang Dicakup

- **`FP-02` (Tinggi):** Halaman profil: visi, misi, sejarah, nilai organisasi.
- **`FP-03` (Tinggi):** Struktur kepengurusan per periode lengkap dengan foto, program studi (`Teknik Informatika` atau `Multimedia Broadcasting`), dan jabatan.
- **`FP-14` (Sedang):** Arsip kepengurusan periode sebelumnya.
- **`FP-15` (Rendah):** Halaman kontak dan kerja sama bagi pihak luar (sponsor/mitra).
- **`FA-07` (Tinggi):** Manajemen periode kepengurusan dan struktur pengurus di Panel Admin.

---

## Struktur Berkas yang Direkomendasikan

```text
src/features/organization/
├── README.md
├── components/
│   ├── VisionMissionSection.tsx    # Tampilan visi, misi, sejarah, dan nilai HIMAKALA
│   ├── DivisionGrid.tsx            # Kartu 6 divisi beserta daftar anggota (diadaptasi dari MembersSection lama)
│   ├── MemberDetailDialog.tsx      # Modal profil lengkap pengurus (diadaptasi dari MembersModal lama)
│   ├── PeriodArchiveList.tsx       # Daftar perbandingan dan histori kepengurusan periode terdahulu
│   ├── PartnershipContactCard.tsx  # Informasi kontak resmi & alur kerja sama sponsor/mitra
│   └── AdminStructureManager.tsx   # Form CRUD periode aktif/arsip dan data pengurus per divisi
├── hooks/
│   ├── usePeriods.ts               # Query daftar periode & periode aktif dari tabel `periode`
│   ├── useDivisions.ts             # Query 6 divisi beserta relasi `pengurus` berdasarkan `id_periode`
│   └── useManageOrganization.ts    # Mutation tambah/ubah pengurus, unggah foto ke bucket `foto-pengurus`
└── schemas/
    └── organization.schema.ts      # Validasi Zod (melarang nama placeholder "Entitas" dan URL sosmed kosong)
```

---

## Aturan Data & Migrasi dari Repo Lama

1. **Enam Divisi Awal:** Mempertahankan konfigurasi visual 6 divisi dari repo lama (`Kepemimpinan`, `Keuangan`, `Acara & Program`, `Media & Komunikasi`, `IT & Teknologi`, `Public Relations`).
2. **Validasi Anti-Placeholder:** Skema `organization.schema.ts` wajib menolak input nama `"Entitas"` dan memastikan tautan Instagram/LinkedIn opsional yang diisi merupakan URL profil spesifik (bukan sekadar `https://instagram.com`).

