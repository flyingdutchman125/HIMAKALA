import type {
  Anggaran,
  Aspirasi,
  Berita,
  Divisi,
  Dokumen,
  Galeri,
  LogAktivitas,
  Pendaftaran,
  Pengguna,
  Pengurus,
  Periode,
  Proker,
} from "@/types/entities";

// Periode Aktif
export const INITIAL_PERIODS: Periode[] = [
  {
    id: "periode-2026-2027",
    nama: "2026/2027",
    tahun_mulai: 2026,
    tahun_selesai: 2027,
    status_aktif: true,
    ringkasan_capaian: "Periode aktif kepengurusan HIMAKALA.",
  },
];

// 6 Divisi Resmi Kepengurusan HIMAKALA:
// 1. BPH (termasuk Ketua HIMAKALA / Ketua BPH, Sekretaris, Bendahara)
// 2. Luar Negeri
// 3. Dalam Negeri
// 4. Media dan Informasi
// 5. PSDM
// 6. RSTEK
export const INITIAL_DIVISIONS: Divisi[] = [
  {
    id: "div-bph",
    slug: "bph",
    nama: "BPH",
    deskripsi: "Badan Pengurus Harian (Ketua HIMAKALA / Ketua BPH, Sekretaris, Bendahara).",
    warna_kartu: "amber",
  },
  {
    id: "div-ln",
    slug: "luar-negeri",
    nama: "Luar Negeri",
    deskripsi: "Hubungan eksternal, kolaborasi antar-himpunan, dan kemitraan luar kampus.",
    warna_kartu: "sky",
  },
  {
    id: "div-dn",
    slug: "dalam-negeri",
    nama: "Dalam Negeri",
    deskripsi: "Koordinasi internal mahasiswa, aspirasi anggota, dan kegiatan dalam kampus.",
    warna_kartu: "mint",
  },
  {
    id: "div-medinfo",
    slug: "medinfo",
    nama: "Media dan Informasi",
    deskripsi: "Publikasi informasi resmi, media kreatif, dan dokumentasi kegiatan.",
    warna_kartu: "lavender",
  },
  {
    id: "div-psdm",
    slug: "psdm",
    nama: "PSDM",
    deskripsi: "Pengembangan Sumber Daya Mahasiswa, kaderisasi, dan keanggotaan.",
    warna_kartu: "amber",
  },
  {
    id: "div-rstek",
    slug: "rstek",
    nama: "RSTEK",
    deskripsi: "Riset dan Teknologi serta pengembangan karya inovasi mahasiswa.",
    warna_kartu: "sky",
  },
];

// Seluruh data operasional dimulai KOSONG (Tanpa Data Dummy)
// Seluruh isian ditambahkan secara dinamis oleh kepengurusan yang login.
export const INITIAL_MEMBERS: Pengurus[] = [];
export const INITIAL_PROKER: Proker[] = [];
export const INITIAL_BUDGETS: Anggaran[] = [];
export const INITIAL_DOCUMENTS: Dokumen[] = [];
export const INITIAL_NEWS: Berita[] = [];
export const INITIAL_GALLERY: Galeri[] = [];
export const INITIAL_ASPIRATIONS: Aspirasi[] = [];
export const INITIAL_REGISTRATIONS: Pendaftaran[] = [];
export const INITIAL_ACTIVITY_LOGS: LogAktivitas[] = [];

// Daftar Akun berdasarkan Enum `peran_pengguna` di Database
// Seluruh pengurus merupakan Anggota Aktif HIMAKALA yang memiliki NRP, No. WA, dan Email
export const INITIAL_USERS: Pengguna[] = [
  {
    id: "usr-anggota",
    nrp: "3125500001",
    no_wa: "081234567801",
    prodi: "Teknik Informatika",
    nama: "Anggota HIMAKALA",
    email: "anggota@it.student.pens.ac.id",
    password: "himakala123",
    peran: "anggota",
    status: "aktif",
  },
  // Divisi BPH
  {
    id: "usr-ketua-himakala",
    nrp: "3124500001",
    no_wa: "081234567810",
    prodi: "Teknik Informatika",
    nama: "Ketua HIMAKALA",
    email: "ketua@himakala.ac.id",
    password: "himakala123",
    peran: "ketua_himakala",
    divisi_slug: "bph",
    status: "aktif",
  },
  {
    id: "usr-sekretaris",
    nrp: "3124500002",
    no_wa: "081234567811",
    prodi: "Teknik Informatika",
    nama: "Sekretaris BPH",
    email: "sekretaris@himakala.ac.id",
    password: "himakala123",
    peran: "sekretaris",
    divisi_slug: "bph",
    status: "aktif",
  },
  {
    id: "usr-bendahara",
    nrp: "3124500003",
    no_wa: "081234567812",
    prodi: "Multimedia Broadcasting",
    nama: "Bendahara BPH",
    email: "bendahara@himakala.ac.id",
    password: "himakala123",
    peran: "bendahara",
    divisi_slug: "bph",
    status: "aktif",
  },
  // Ketua Divisi (Luar Negeri, Dalam Negeri, Media dan Informasi, PSDM, RSTEK)
  {
    id: "usr-kabid-ln",
    nrp: "3124500004",
    no_wa: "081234567813",
    prodi: "Teknik Informatika",
    nama: "Ketua Divisi Luar Negeri",
    email: "kabid.ln@himakala.ac.id",
    password: "himakala123",
    peran: "ketua_divisi",
    divisi_slug: "luar-negeri",
    status: "aktif",
  },
  {
    id: "usr-kabid-dn",
    nrp: "3124500005",
    no_wa: "081234567814",
    prodi: "Teknik Informatika",
    nama: "Ketua Divisi Dalam Negeri",
    email: "kabid.dn@himakala.ac.id",
    password: "himakala123",
    peran: "ketua_divisi",
    divisi_slug: "dalam-negeri",
    status: "aktif",
  },
  {
    id: "usr-kabid-medinfo",
    nrp: "5124500006",
    no_wa: "081234567815",
    prodi: "Multimedia Broadcasting",
    nama: "Ketua Divisi Media dan Informasi",
    email: "kabid.medinfo@himakala.ac.id",
    password: "himakala123",
    peran: "ketua_divisi",
    divisi_slug: "medinfo",
    status: "aktif",
  },
  {
    id: "usr-kabid-psdm",
    nrp: "3124500007",
    no_wa: "081234567816",
    prodi: "Teknik Informatika",
    nama: "Ketua Divisi PSDM",
    email: "kabid.psdm@himakala.ac.id",
    password: "himakala123",
    peran: "ketua_divisi",
    divisi_slug: "psdm",
    status: "aktif",
  },
  {
    id: "usr-kabid-rstek",
    nrp: "3124500008",
    no_wa: "081234567817",
    prodi: "Teknik Informatika",
    nama: "Ketua Divisi RSTEK",
    email: "kabid.rstek@himakala.ac.id",
    password: "himakala123",
    peran: "ketua_divisi",
    divisi_slug: "rstek",
    status: "aktif",
  },
  // Pengurus Divisi (Butuh izin Ketua Divisi untuk CRUD perkembangan proker)
  {
    id: "usr-staf-ln",
    nrp: "3125500011",
    no_wa: "081234567821",
    prodi: "Teknik Informatika",
    nama: "Pengurus Divisi Luar Negeri",
    email: "pengurus.ln@himakala.ac.id",
    password: "himakala123",
    peran: "pengurus_divisi",
    divisi_slug: "luar-negeri",
    status: "aktif",
  },
  {
    id: "usr-staf-dn",
    nrp: "3125500012",
    no_wa: "081234567822",
    prodi: "Teknik Informatika",
    nama: "Pengurus Divisi Dalam Negeri",
    email: "pengurus.dn@himakala.ac.id",
    password: "himakala123",
    peran: "pengurus_divisi",
    divisi_slug: "dalam-negeri",
    status: "aktif",
  },
  {
    id: "usr-staf-medinfo",
    nrp: "5125500013",
    no_wa: "081234567823",
    prodi: "Multimedia Broadcasting",
    nama: "Pengurus Divisi Media dan Informasi",
    email: "pengurus.medinfo@himakala.ac.id",
    password: "himakala123",
    peran: "pengurus_divisi",
    divisi_slug: "medinfo",
    status: "aktif",
  },
  {
    id: "usr-staf-psdm",
    nrp: "3125500014",
    no_wa: "081234567824",
    prodi: "Teknik Informatika",
    nama: "Pengurus Divisi PSDM",
    email: "pengurus.psdm@himakala.ac.id",
    password: "himakala123",
    peran: "pengurus_divisi",
    divisi_slug: "psdm",
    status: "aktif",
  },
  {
    id: "usr-staf-rstek",
    nrp: "3125500015",
    no_wa: "081234567825",
    prodi: "Teknik Informatika",
    nama: "Pengurus Divisi RSTEK",
    email: "pengurus.rstek@himakala.ac.id",
    password: "himakala123",
    peran: "pengurus_divisi",
    divisi_slug: "rstek",
    status: "aktif",
  },
];
