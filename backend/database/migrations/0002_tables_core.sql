-- ============================================================================
-- MIGRATION 0002: Tabel Utama Sistem Informasi HIMAKALA (6 Divisi & RBAC)
-- ============================================================================

-- 1. Tabel Periode Kepengurusan
CREATE TABLE IF NOT EXISTS public.periode (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL UNIQUE,
  tahun_mulai INTEGER NOT NULL CHECK (tahun_mulai >= 2020),
  tahun_selesai INTEGER NOT NULL CHECK (tahun_selesai >= tahun_mulai),
  status_aktif BOOLEAN NOT NULL DEFAULT false,
  ringkasan_capaian TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabel 6 Divisi HIMAKALA (BPH, Luar Negeri, Dalam Negeri, Media dan Informasi, PSDM, RSTEK)
CREATE TABLE IF NOT EXISTS public.divisi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug IN ('bph', 'luar-negeri', 'dalam-negeri', 'medinfo', 'psdm', 'rstek')),
  nama TEXT NOT NULL,
  deskripsi TEXT NOT NULL DEFAULT '',
  warna_kartu public.warna_kartu_ui NOT NULL DEFAULT 'amber',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabel Pengguna (Anggota & Kepengurusan 6 Divisi)
-- Catatan: Ketua HIMAKALA berada di divisi BPH (sekaligus Ketua BPH)
CREATE TABLE IF NOT EXISTS public.pengguna (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  peran public.peran_pengguna NOT NULL DEFAULT 'anggota',
  id_divisi UUID REFERENCES public.divisi(id) ON DELETE SET NULL,
  status_aktif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabel Struktur Pengurus per Divisi
CREATE TABLE IF NOT EXISTS public.pengurus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  prodi TEXT NOT NULL CHECK (prodi IN ('Teknik Informatika', 'Multimedia Broadcasting')),
  id_divisi UUID NOT NULL REFERENCES public.divisi(id) ON DELETE RESTRICT,
  id_periode UUID NOT NULL REFERENCES public.periode(id) ON DELETE RESTRICT,
  status_verifikasi BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabel Program Kerja (Proker) dengan Mekanisme Perizinan Ketua Divisi
-- - Jika dibuat/diubah oleh Ketua HIMAKALA, Sekretaris, Bendahara, atau Ketua Divisi -> status_izin = 'disetujui' (tanpa izin siapapun)
-- - Jika dibuat/diubah/dihapus oleh Pengurus Divisi -> status_izin = 'menunggu_izin_kabid' (butuh izin Ketua Divisi / Ketua HIMAKALA)
CREATE TABLE IF NOT EXISTS public.proker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  judul TEXT NOT NULL,
  deskripsi TEXT NOT NULL DEFAULT '',
  tujuan TEXT NOT NULL DEFAULT '',
  target_peserta TEXT NOT NULL DEFAULT '',
  id_divisi UUID NOT NULL REFERENCES public.divisi(id) ON DELETE RESTRICT,
  pic TEXT NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL CHECK (tanggal_selesai >= tanggal_mulai),
  status public.status_proker NOT NULL DEFAULT 'direncanakan',
  progres INTEGER NOT NULL DEFAULT 0 CHECK (progres >= 0 AND progres <= 100),
  tahap_selesai INTEGER NOT NULL DEFAULT 0 CHECK (tahap_selesai >= 0),
  total_tahap INTEGER NOT NULL DEFAULT 1 CHECK (total_tahap >= 1),
  id_periode UUID NOT NULL REFERENCES public.periode(id) ON DELETE RESTRICT,
  hasil_kegiatan TEXT,
  status_izin public.status_izin_proker NOT NULL DEFAULT 'disetujui',
  aksi_pengajuan public.jenis_aksi_proker NOT NULL DEFAULT 'buat',
  pengusul_nama TEXT,
  pengusul_peran public.peran_pengguna,
  catatan_izin TEXT,
  terakhir_diperbarui DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Tabel Anggaran & Kas Proker
CREATE TABLE IF NOT EXISTS public.anggaran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_proker UUID NOT NULL REFERENCES public.proker(id) ON DELETE CASCADE,
  rencana BIGINT NOT NULL DEFAULT 0 CHECK (rencana >= 0),
  realisasi BIGINT NOT NULL DEFAULT 0 CHECK (realisasi >= 0),
  keterangan TEXT NOT NULL DEFAULT '',
  status_persetujuan public.status_persetujuan_anggaran NOT NULL DEFAULT 'disetujui',
  catatan_ketua TEXT,
  terakhir_diperbarui DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Tabel Berita & Publikasi (Dikelola Medinfo / BPH)
CREATE TABLE IF NOT EXISTS public.berita (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  judul TEXT NOT NULL,
  ringkasan TEXT NOT NULL DEFAULT '',
  isi TEXT NOT NULL DEFAULT '',
  kategori TEXT NOT NULL DEFAULT 'Kegiatan',
  penulis TEXT NOT NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  status_terbit BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Tabel Pusat Dokumen (Dikelola Sekretaris / BPH)
CREATE TABLE IF NOT EXISTS public.dokumen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul TEXT NOT NULL,
  kategori public.kategori_dokumen NOT NULL,
  nomor_dokumen TEXT NOT NULL,
  ringkasan TEXT NOT NULL DEFAULT '',
  ukuran_kb INTEGER NOT NULL DEFAULT 100,
  visibilitas public.visibilitas_dokumen NOT NULL DEFAULT 'publik',
  id_periode UUID NOT NULL REFERENCES public.periode(id) ON DELETE RESTRICT,
  tanggal_unggah DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Tabel Galeri Dokumentasi (Dikelola Medinfo / BPH)
CREATE TABLE IF NOT EXISTS public.galeri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_proker UUID REFERENCES public.proker(id) ON DELETE SET NULL,
  judul_kegiatan TEXT NOT NULL,
  divisi_nama TEXT NOT NULL,
  keterangan TEXT NOT NULL DEFAULT '',
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  warna_kartu public.warna_kartu_ui NOT NULL DEFAULT 'sky',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Tabel Aspirasi Mahasiswa (Ditindaklanjuti Dalam Negeri / BPH)
CREATE TABLE IF NOT EXISTS public.aspirasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_pelacakan TEXT NOT NULL UNIQUE CHECK (nomor_pelacakan ~ '^ASP-[0-9]{4}-[A-Z0-9]{4}$'),
  kategori TEXT NOT NULL,
  isi TEXT NOT NULL,
  anonim BOOLEAN NOT NULL DEFAULT true,
  nama_pengirim TEXT,
  kontak_opsional TEXT,
  status public.status_aspirasi NOT NULL DEFAULT 'diterima',
  tanggapan TEXT,
  tanggal_kirim DATE NOT NULL DEFAULT CURRENT_DATE,
  tanggal_respon DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Tabel Pendaftaran Kegiatan / Kepanitiaan (Dikelola PSDM / Divisi Terkait)
CREATE TABLE IF NOT EXISTS public.pendaftaran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_proker UUID NOT NULL REFERENCES public.proker(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  nrp TEXT NOT NULL,
  prodi TEXT NOT NULL CHECK (prodi IN ('Teknik Informatika', 'Multimedia Broadcasting')),
  peran_dipilih TEXT NOT NULL CHECK (peran_dipilih IN ('Peserta', 'Panitia')),
  kontak TEXT NOT NULL,
  alasan TEXT NOT NULL,
  tanggal_daftar DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Tabel Log Aktivitas (Audit Trail)
CREATE TABLE IF NOT EXISTS public.log_aktivitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_pengguna UUID REFERENCES public.pengguna(id) ON DELETE SET NULL,
  nama_pengguna TEXT NOT NULL,
  peran_pengguna public.peran_pengguna NOT NULL,
  aksi TEXT NOT NULL,
  objek TEXT NOT NULL,
  waktu TIMESTAMPTZ NOT NULL DEFAULT now()
);
