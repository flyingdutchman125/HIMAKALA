export type DivisiSlug =
  | "bph"
  | "luar-negeri"
  | "dalam-negeri"
  | "medinfo"
  | "psdm"
  | "rstek";

export type PeranPengguna =
  | "anggota"
  | "pengurus_divisi"
  | "ketua_divisi"
  | "sekretaris"
  | "bendahara"
  | "ketua_himakala";

export type StatusProker = "direncanakan" | "berjalan" | "selesai" | "batal";

export type StatusIzinProker =
  | "menunggu_izin_kabid"
  | "disetujui"
  | "ditolak";

export type AksiPengajuanProker = "buat" | "ubah" | "hapus";

export type StatusPersetujuanAnggaran =
  | "draft"
  | "menunggu_persetujuan"
  | "disetujui"
  | "revisi";

export type VisibilitasDokumen = "publik" | "internal";

export type KategoriDokumen = "AD_ART" | "SK" | "LPJ" | "NOTULEN" | "SOP_PEDOMAN";

export type StatusAspirasi = "diterima" | "diproses" | "selesai";

export type WarnaKartuPastel = "amber" | "lavender" | "sky" | "mint";

export type ProdiLamongan = "Teknik Informatika" | "Multimedia Broadcasting";

export interface Periode {
  id: string;
  nama: string;
  tahun_mulai: number;
  tahun_selesai: number;
  status_aktif: boolean;
  ringkasan_capaian: string;
}

export interface Divisi {
  id: string;
  slug: DivisiSlug;
  nama: string;
  deskripsi: string;
  warna_kartu: WarnaKartuPastel;
}

export interface Pengurus {
  id: string;
  nama: string;
  jabatan: string;
  prodi: ProdiLamongan;
  id_divisi: string;
  status_verifikasi: boolean;
  id_periode: string;
}

export interface Proker {
  id: string;
  slug: string;
  judul: string;
  deskripsi: string;
  tujuan: string;
  target_peserta: string;
  id_divisi: string;
  pic: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: StatusProker;
  progres: number; // 0 s.d. 100
  tahap_selesai: number;
  total_tahap: number;
  id_periode: string;
  terakhir_diperbarui: string;
  hasil_kegiatan?: string;
  // Status perizinan CRUD (khusus Pengurus Divisi -> Ketua Divisi)
  status_izin: StatusIzinProker;
  aksi_pengajuan?: AksiPengajuanProker;
  pengusul_nama?: string;
  pengusul_peran?: PeranPengguna;
}

export interface Anggaran {
  id: string;
  id_proker: string;
  rencana: number;
  realisasi: number;
  keterangan: string;
  status_persetujuan: StatusPersetujuanAnggaran;
  catatan_ketua?: string;
  terakhir_diperbarui: string;
}

export interface Berita {
  id: string;
  slug: string;
  judul: string;
  ringkasan: string;
  isi: string;
  kategori: "Pengumuman" | "Kegiatan" | "Prestasi" | "Transparansi" | "Kampus PENS";
  penulis: string;
  tanggal: string;
  status_terbit: boolean;
}

export interface Dokumen {
  id: string;
  judul: string;
  kategori: KategoriDokumen;
  nomor_dokumen: string;
  ringkasan: string;
  ukuran_kb: number;
  visibilitas: VisibilitasDokumen;
  id_periode: string;
  tanggal_unggah: string;
}

export interface Galeri {
  id: string;
  id_proker: string;
  judul_kegiatan: string;
  divisi_nama: string;
  keterangan: string;
  tanggal: string;
  warna_kartu: WarnaKartuPastel;
}

export interface Aspirasi {
  id: string;
  nomor_pelacakan: string;
  kategori: string;
  isi: string;
  anonim: boolean;
  nama_pengirim?: string | null;
  kontak_opsional?: string | null;
  status: StatusAspirasi;
  tanggapan?: string | null;
  tanggal_kirim: string;
  tanggal_respon?: string | null;
}

export interface Pendaftaran {
  id: string;
  id_proker: string;
  nama: string;
  nrp: string;
  prodi: ProdiLamongan;
  peran_dipilih: "Peserta" | "Panitia";
  kontak: string;
  alasan: string;
  tanggal_daftar: string;
}

export interface Pengguna {
  id: string;
  nama: string;
  email: string;
  password?: string;
  peran: PeranPengguna;
  id_divisi?: string | null;
  divisi_slug?: DivisiSlug;
  status: "aktif" | "nonaktif";
}

export interface LogAktivitas {
  id: string;
  id_pengguna: string;
  nama_pengguna: string;
  peran_pengguna: PeranPengguna;
  aksi: string;
  objek: string;
  waktu: string;
}
