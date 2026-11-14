# Modul Program Kerja, Kalender & Pendaftaran (`src/features/proker/`)

Modul ini merupakan salah satu inti transparansi HIMAKALA yang memungkinkan mahasiswa memantau seluruh rencana, progres, jadwal, dan hasil program kerja himpunan serta mendaftar pada kegiatan atau kepanitiaan yang sedang dibuka.

---

## Kebutuhan Fungsional yang Dicakup

- **`FP-04` (Tinggi):** Daftar program kerja dengan filter `periode`, `divisi`, dan `status` (`direncanakan`, `berjalan`, `selesai`, `batal`).
- **`FP-05` (Tinggi):** Halaman detail proker: tujuan, PIC, tanggal pelaksanaan, target peserta, ringkasan anggaran & realisasi, dokumentasi galeri, serta hasil/LPJ.
- **`FP-06` (Sedang):** Kalender dan linimasa (*timeline*) kegiatan himpunan.
- **`FP-13` (Sedang):** Pendaftaran kegiatan atau rekrutmen kepanitiaan melalui formulir terintegrasi.
- **`FA-02` (Tinggi):** CRUD proker di Panel Admin, termasuk pembaruan status dan persentase progres (`0%` s.d. `100%`).

---

## Struktur Berkas yang Direkomendasikan

```text
src/features/proker/
├── README.md
├── components/
│   ├── ProkerFilterBar.tsx         # Filter berdasarkan Periode, Divisi, Status, dan kata kunci
│   ├── ProkerCard.tsx              # Kartu ringkasan proker dengan StatusBadge & Progress bar
│   ├── ProkerDetailView.tsx        # Tampilan lengkap detail proker, anggaran terkait, dan galeri
│   ├── ProkerCalendar.tsx          # Tampilan kalender bulanan & linimasa kegiatan (FP-06)
│   ├── EventRegistrationForm.tsx   # Formulir pendaftaran peserta/panitia kegiatan (FP-13)
│   └── AdminProkerForm.tsx         # Form CRUD proker & update cepat progres oleh pengurus (FA-02)
├── hooks/
│   ├── useProkerList.ts            # Query daftar proker terfilter dengan TanStack Query
│   ├── useProkerDetail.ts          # Query satu proker beserta relasi divisi, anggaran disetujui, & galeri
│   └── useManageProker.ts          # Mutation buat/ubah/hapus proker & ekspor daftar pendaftar
└── schemas/
    └── proker.schema.ts            # Skema Zod untuk form proker dan form pendaftaran mahasiswa
```

---

## Indikator Keberhasilan (SLA Bagian 3 PRD)

- **100% Proker Tercatat:** Seluruh program kerja periode berjalan wajib dimasukkan ke modul ini pada awal periode.
- **Batas Waktu Pembaruan 7 Hari:** Komponen di Panel Admin memberikan penanda visual (*warning badge*) apabila sebuah proker yang sedang `berjalan` atau telah melewati `tanggal_selesai` belum diperbarui statusnya lebih dari **7 hari**.

