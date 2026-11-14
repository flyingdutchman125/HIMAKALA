# Direktori Halaman Situs Publik (`src/pages/public/`)

Direktori ini menyimpan seluruh komponen halaman publik sesuai **Sitemap Bagian 8 PRD** dan **Kebutuhan Fungsional `FP-01` s.d. `FP-15`**.

---

## Pemetaan Rute & Berkas Halaman Publik

| Jalur URL (Route) | Nama Berkas Halaman | ID PRD | Deskripsi Konten Utama |
| :--- | :--- | :--- | :--- |
| `/` | `HomePage.tsx` | `FP-01` | Beranda: Hero HIMAKALA, ringkasan statistik proker periode berjalan, pengumuman terbaru, dan kegiatan mendatang |
| `/tentang` | `AboutProfilePage.tsx` | `FP-02` | Profil organisasi, sejarah HIMAKALA PSDKU Lamongan, visi, misi, dan nilai himpunan |
| `/tentang/struktur` | `StructurePage.tsx` | `FP-03` | Struktur kepengurusan periode aktif lengkap dengan foto, jabatan, dan filter 6 divisi |
| `/tentang/arsip` | `PeriodArchivePage.tsx` | `FP-14` | Arsip struktur kepengurusan, ringkasan proker, dan capaian periode sebelumnya |
| `/proker` | `ProkerListPage.tsx` | `FP-04` | Katalog seluruh program kerja dengan filter periode, divisi, dan status (`direncanakan`, `berjalan`, `selesai`, `batal`) |
| `/proker/:slug` | `ProkerDetailPage.tsx` | `FP-05`, `FP-13` | Detail tujuan, PIC, jadwal, target peserta, anggaran vs realisasi, dokumentasi, LPJ, dan form pendaftaran kegiatan |
| `/proker/kalender` | `ProkerCalendarPage.tsx` | `FP-06` | Kalender bulanan dan linimasa kegiatan himpunan |
| `/transparansi` | `TransparencyDashboardPage.tsx` | `FP-09` | Dashboard visual progres seluruh divisi dan ringkasan serapan anggaran periode berjalan |
| `/transparansi/keuangan` | `FinanceTransparencyPage.tsx` | `FP-09` | Laporan kas dan rincian anggaran vs realisasi per proker yang telah disetujui Ketua |
| `/transparansi/dokumen` | `DocumentCenterPage.tsx` | `FP-08` | Pusat pencarian dan unduhan dokumen resmi publik (`AD/ART`, `SK`, `LPJ`, `Notulen`) |
| `/berita` | `NewsListPage.tsx` | `FP-07` | Daftar berita dan pengumuman resmi dengan filter kategori |
| `/berita/:slug` | `NewsDetailPage.tsx` | `FP-07` | Halaman baca artikel berita atau pengumuman lengkap |
| `/galeri` | `GalleryPage.tsx` | `FP-10` | Galeri dokumentasi kegiatan mahasiswa TI & MMB PSDKU Lamongan |
| `/aspirasi/kirim` | `AspirationSubmitPage.tsx` | `FP-11` | Formulir pengiriman aspirasi/pengaduan mahasiswa (opsi anonim) yang menerbitkan nomor pelacakan |
| `/aspirasi/lacak` | `AspirationTrackPage.tsx` | `FP-12` | Halaman pemeriksaan status tindak lanjut (`diterima`, `diproses`, `selesai`) dan balasan resmi pengurus |
| `/kontak` | `ContactPartnershipPage.tsx` | `FP-15` | Informasi sekretariat, kanal media sosial resmi, dan kontak kerja sama sponsor/mitra |
| `*` | `NotFoundPage.tsx` | - | Halaman 404 dengan navigasi kembali ke Beranda |

