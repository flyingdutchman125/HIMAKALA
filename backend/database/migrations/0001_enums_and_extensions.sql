-- ============================================================================
-- MIGRATION 0001: Enums & Extensions (HIMAKALA Dynamic RBAC)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Peran Pengguna (User Biasa vs Kepengurusan 6 Divisi)
-- - anggota          : User biasa (Anggota HIMAKALA), hanya baca (Read-Only)
-- - pengurus_divisi  : Staf/Anggota kepengurusan divisi, CRUD proker divisinya atas izin Ketua Divisi
-- - ketua_divisi     : Ketua Divisi (Luar Negeri, Dalam Negeri, Medinfo, PSDM, RSTEK), CRUD proker divisinya tanpa izin & menyetujui pengajuan pengurus divisinya
-- - sekretaris       : BPH Sekretaris, CRUD proker & dokumen tanpa izin siapapun
-- - bendahara        : BPH Bendahara, CRUD proker & anggaran tanpa izin siapapun
-- - ketua_himakala   : Ketua HIMAKALA (sekaligus Ketua BPH), akses penuh CRUD seluruh divisi & fitur
DO $$ BEGIN
  CREATE TYPE public.peran_pengguna AS ENUM (
    'anggota',
    'pengurus_divisi',
    'ketua_divisi',
    'sekretaris',
    'bendahara',
    'ketua_himakala'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Status Siklus Hidup Program Kerja
DO $$ BEGIN
  CREATE TYPE public.status_proker AS ENUM (
    'direncanakan',
    'berjalan',
    'selesai',
    'ditunda',
    'dibatalkan'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Status Perizinan CRUD Proker (Khusus Pengurus Divisi -> Ketua Divisi)
DO $$ BEGIN
  CREATE TYPE public.status_izin_proker AS ENUM (
    'menunggu_izin_kabid',
    'disetujui',
    'ditolak'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 4. Jenis Pengajuan CRUD Proker oleh Pengurus Divisi
DO $$ BEGIN
  CREATE TYPE public.jenis_aksi_proker AS ENUM (
    'buat',
    'ubah',
    'hapus'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 5. Status Persetujuan Laporan Anggaran
DO $$ BEGIN
  CREATE TYPE public.status_persetujuan_anggaran AS ENUM (
    'draf',
    'menunggu_persetujuan',
    'disetujui',
    'revisi'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 6. Kategori & Visibilitas Dokumen Organisasi
DO $$ BEGIN
  CREATE TYPE public.kategori_dokumen AS ENUM (
    'AD_ART',
    'SK',
    'SOP_PEDOMAN',
    'LPJ',
    'NOTULEN'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.visibilitas_dokumen AS ENUM (
    'publik',
    'internal'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 7. Status Tindak Lanjut Aspirasi
DO $$ BEGIN
  CREATE TYPE public.status_aspirasi AS ENUM (
    'diterima',
    'diproses',
    'selesai'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 8. Warna Kartu UI
DO $$ BEGIN
  CREATE TYPE public.warna_kartu_ui AS ENUM (
    'amber',
    'lavender',
    'sky',
    'mint',
    'coral'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
