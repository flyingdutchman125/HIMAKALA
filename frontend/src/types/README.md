# Direktori Definisi Tipe TypeScript (`src/types/`)

Direktori ini menyimpan seluruh kontrak tipe data TypeScript untuk menjamin keamanan tipe (*type-safety*) dari lapisan database PostgreSQL hingga ke komponen UI React.

---

## Daftar Berkas Tipe

| Nama Berkas | Deskripsi |
| :--- | :--- |
| `database.types.ts` | Tipe skema tabel, view, dan enum yang di-generate otomatis oleh Supabase CLI (`npm run db:types`). |
| `entities.ts` | Definisi antarmuka (*interfaces*) untuk **12 Entitas Utama** sesuai **Bagian 9 PRD**. |
| `rbac.ts` | Tipe peran pengguna (`UserRole`), izin aksi (`PermissionAction`), dan struktur sesi pengurus. |
| `api.ts` | Tipe pembungkus respons paginasi, parameter filter kueri, dan struktur error standar. |

---

## Kontrak 12 Entitas Utama (`src/types/entities.ts` - Bagian 9 PRD)

```ts
export type PeranPengguna =
  | "super_admin"
  | "ketua"
  | "sekretaris"
  | "bendahara"
  | "kepala_divisi"
  | "editor";

export type StatusProker = "direncanakan" | "berjalan" | "selesai" | "batal";

export type StatusPersetujuanAnggaran =
  | "draft"
  | "menunggu_persetujuan"
  | "disetujui"
  | "revisi";

export type VisibilitasDokumen = "publik" | "internal";

export type StatusAspirasi = "diterima" | "diproses" | "selesai";

export interface Periode {
  id: string;
  nama: string;
  tahun_mulai: number;
  tahun_selesai: number;
  status_aktif: boolean;
}

export interface Divisi {
  id: string;
  slug: string;
  nama: string;
  deskripsi: string;
  ikon?: string;
  warna_gradient?: string;
}

export interface Pengurus {
  id: string;
  nama: string;
  jabatan: string;
  prodi: "Teknik Informatika" | "Multimedia Broadcasting";
  id_divisi: string;
  foto_url?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  id_periode: string;
}

export interface Proker {
  id: string;
  slug: string;
  judul: string;
  deskripsi: string;
  tujuan: string;
  target_peserta?: string;
  id_divisi: string;
  pic: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: StatusProker;
  progres: number; // 0 - 100
  id_periode: string;
}

export interface Anggaran {
  id: string;
  id_proker: string;
  rencana: number;
  realisasi: number;
  keterangan: string;
  status_persetujuan: StatusPersetujuanAnggaran;
}

export interface Berita {
  id: string;
  slug: string;
  judul: string;
  isi: string;
  kategori: string;
  penulis: string;
  tanggal: string;
  status_terbit: boolean;
}

export interface Dokumen {
  id: string;
  judul: string;
  kategori: "AD_ART" | "SK" | "LPJ" | "NOTULEN" | "SOP_PEDOMAN";
  berkas_url: string;
  visibilitas: VisibilitasDokumen;
  id_periode: string;
}

export interface Galeri {
  id: string;
  id_proker: string;
  berkas_url: string;
  keterangan: string;
}

export interface Aspirasi {
  id: string;
  nomor_pelacakan: string;
  isi: string;
  anonim: boolean;
  kontak_opsional?: string | null;
  status: StatusAspirasi;
  tanggapan?: string | null;
}

export interface Pendaftaran {
  id: string;
  id_proker: string;
  data_pendaftar: {
    nama: string;
    nrp: string;
    prodi: "Teknik Informatika" | "Multimedia Broadcasting";
    kontak: string;
    alasan?: string;
  };
}

export interface Pengguna {
  id: string;
  nama: string;
  email: string;
  peran: PeranPengguna;
  status: "aktif" | "nonaktif";
}

export interface LogAktivitas {
  id: string;
  id_pengguna: string;
  aksi: string;
  objek: string;
  waktu: string;
}
```

