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
-- ============================================================================
-- Migrasi 0003: Trigger Otomatis Pencatatan Log Aktivitas (FA-09)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_catat_log_aktivitas()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_name TEXT := 'Sistem Otomatis';
  v_user_role public.peran_pengguna := 'super_admin';
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NOT NULL THEN
    SELECT nama, peran INTO v_user_name, v_user_role
    FROM public.pengguna
    WHERE id = v_user_id;
  END IF;

  INSERT INTO public.log_aktivitas (
    id_pengguna,
    nama_pengguna,
    peran_pengguna,
    aksi,
    objek,
    waktu
  ) VALUES (
    v_user_id,
    COALESCE(v_user_name, 'Pengurus Terautentikasi'),
    COALESCE(v_user_role, 'editor'),
    TG_OP,
    TG_TABLE_NAME,
    now()
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_proker ON public.proker;
CREATE TRIGGER trg_log_proker
AFTER INSERT OR UPDATE OR DELETE ON public.proker
FOR EACH ROW EXECUTE FUNCTION public.fn_catat_log_aktivitas();

DROP TRIGGER IF EXISTS trg_log_anggaran ON public.anggaran;
CREATE TRIGGER trg_log_anggaran
AFTER INSERT OR UPDATE OR DELETE ON public.anggaran
FOR EACH ROW EXECUTE FUNCTION public.fn_catat_log_aktivitas();

DROP TRIGGER IF EXISTS trg_log_dokumen ON public.dokumen;
CREATE TRIGGER trg_log_dokumen
AFTER INSERT OR UPDATE OR DELETE ON public.dokumen
FOR EACH ROW EXECUTE FUNCTION public.fn_catat_log_aktivitas();

DROP TRIGGER IF EXISTS trg_log_aspirasi ON public.aspirasi;
CREATE TRIGGER trg_log_aspirasi
AFTER UPDATE ON public.aspirasi
FOR EACH ROW EXECUTE FUNCTION public.fn_catat_log_aktivitas();

-- ============================================================================
-- RLS POLICIES 0001: Hak Akses User Biasa (Anggota) & Kepengurusan 6 Divisi
-- ============================================================================
-- Aturan Utama:
-- 1. User biasa ('anggota' / anonim) HANYA bisa melihat (SELECT) web tanpa bisa mengedit.
-- 2. Kepengurusan terdiri dari 6 divisi: BPH, Luar Negeri, Dalam Negeri, Media dan Informasi, PSDM, RSTEK.
-- 3. Ketua HIMAKALA ('ketua_himakala', berada di divisi BPH & Ketua BPH) memiliki hak akses PENUH (CRUD) ke seluruh divisi & tabel.
-- 4. Sekretaris ('sekretaris') & Bendahara ('bendahara') di BPH memiliki hak CRUD Proker tanpa izin siapapun.
-- 5. Ketua Divisi ('ketua_divisi') memiliki hak CRUD Proker divisinya tanpa izin siapapun, serta menyetujui CRUD dari Pengurus Divisi.
-- 6. Pengurus Divisi ('pengurus_divisi') memiliki hak CRUD perkembangan proker divisinya atas perizinan Ketua Divisi (status_izin = 'menunggu_izin_kabid').

ALTER TABLE public.periode ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengguna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengurus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anggaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dokumen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aspirasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pendaftaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_aktivitas ENABLE ROW LEVEL SECURITY;

-- Fungsi bantu untuk mengambil peran & divisi user yang sedang login
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.peran_pengguna AS $$
  SELECT COALESCE(
    (SELECT peran FROM public.pengguna WHERE id = auth.uid() AND status_aktif = true),
    'anggota'::public.peran_pengguna
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.current_user_division()
RETURNS UUID AS $$
  SELECT id_divisi FROM public.pengguna WHERE id = auth.uid() AND status_aktif = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- 1. KEBIJAKAN BACA (SELECT) UNTUK USER BIASA (ANGGOTA HIMAKALA) & PUBLIK
-- ============================================================================
CREATE POLICY "Anggota hanya baca periode" ON public.periode FOR SELECT USING (true);
CREATE POLICY "Anggota hanya baca 6 divisi" ON public.divisi FOR SELECT USING (true);
CREATE POLICY "Anggota hanya baca pengurus" ON public.pengurus FOR SELECT USING (true);

-- User biasa hanya melihat proker yang sudah disetujui (atau pengurus melihat proker divisinya yang menunggu izin)
CREATE POLICY "Baca proker disetujui atau internal divisi" ON public.proker
  FOR SELECT USING (
    status_izin = 'disetujui'
    OR public.current_user_role() IN ('ketua_himakala', 'sekretaris', 'bendahara')
    OR (
      public.current_user_role() IN ('ketua_divisi', 'pengurus_divisi')
      AND id_divisi = public.current_user_division()
    )
  );

CREATE POLICY "Anggota baca anggaran" ON public.anggaran FOR SELECT USING (true);
CREATE POLICY "Anggota baca berita" ON public.berita FOR SELECT USING (true);
CREATE POLICY "Anggota baca dokumen" ON public.dokumen FOR SELECT USING (
  visibilitas = 'publik' OR public.current_user_role() <> 'anggota'
);
CREATE POLICY "Anggota baca galeri" ON public.galeri FOR SELECT USING (true);
CREATE POLICY "Anggota baca aspirasi" ON public.aspirasi FOR SELECT USING (true);

-- ============================================================================
-- 2. KEBIJAKAN CRUD PROKER (TANPA IZIN VS ATAS PERIZINAN KETUA DIVISI)
-- ============================================================================

-- A. Ketua HIMAKALA, Sekretaris, dan Bendahara: Bebas CRUD Proker seluruh divisi tanpa perizinan siapapun
CREATE POLICY "BPH (Ketua HIMAKALA, Sekretaris, Bendahara) bebas CRUD proker" ON public.proker
  FOR ALL USING (
    public.current_user_role() IN ('ketua_himakala', 'sekretaris', 'bendahara')
  )
  WITH CHECK (
    public.current_user_role() IN ('ketua_himakala', 'sekretaris', 'bendahara')
  );

-- B. Ketua Divisi: Bebas CRUD Proker divisinya sendiri tanpa perizinan siapapun & menyetujui pengajuan pengurus divisinya
CREATE POLICY "Ketua Divisi bebas CRUD proker divisinya tanpa izin" ON public.proker
  FOR ALL USING (
    public.current_user_role() = 'ketua_divisi'
    AND id_divisi = public.current_user_division()
  )
  WITH CHECK (
    public.current_user_role() = 'ketua_divisi'
    AND id_divisi = public.current_user_division()
  );

-- C. Pengurus Divisi: CRUD perkembangan proker divisinya ATAS PERIZINAN Ketua Divisi (status_izin wajib 'menunggu_izin_kabid')
CREATE POLICY "Pengurus Divisi ajukan tambah proker divisinya" ON public.proker
  FOR INSERT WITH CHECK (
    public.current_user_role() = 'pengurus_divisi'
    AND id_divisi = public.current_user_division()
    AND status_izin = 'menunggu_izin_kabid'
  );

CREATE POLICY "Pengurus Divisi ajukan update/hapus proker divisinya" ON public.proker
  FOR UPDATE USING (
    public.current_user_role() = 'pengurus_divisi'
    AND id_divisi = public.current_user_division()
  )
  WITH CHECK (
    public.current_user_role() = 'pengurus_divisi'
    AND id_divisi = public.current_user_division()
    AND status_izin = 'menunggu_izin_kabid'
  );

-- ============================================================================
-- 3. KEBIJAKAN MODUL FUNGSIONAL TIAP DIVISI & KETUA HIMAKALA
-- ============================================================================

-- Ketua HIMAKALA memiliki hak akses penuh (CRUD) ke seluruh tabel
CREATE POLICY "Ketua HIMAKALA akses penuh semua tabelperiode" ON public.periode FOR ALL USING (public.current_user_role() = 'ketua_himakala');
CREATE POLICY "Ketua HIMAKALA akses penuh divisi" ON public.divisi FOR ALL USING (public.current_user_role() = 'ketua_himakala');
CREATE POLICY "Ketua HIMAKALA akses penuh pengguna" ON public.pengguna FOR ALL USING (public.current_user_role() = 'ketua_himakala');

-- Anggaran: Bendahara & Ketua HIMAKALA
CREATE POLICY "Bendahara & Ketua HIMAKALA kelola anggaran" ON public.anggaran
  FOR ALL USING (public.current_user_role() IN ('bendahara', 'ketua_himakala'));

-- Dokumen: Sekretaris & Ketua HIMAKALA
CREATE POLICY "Sekretaris & Ketua HIMAKALA kelola dokumen" ON public.dokumen
  FOR ALL USING (public.current_user_role() IN ('sekretaris', 'ketua_himakala'));

-- Pengurus: Sekretaris, PSDM, & Ketua HIMAKALA
CREATE POLICY "Sekretaris, PSDM, & Ketua HIMAKALA kelola pengurus" ON public.pengurus
  FOR ALL USING (
    public.current_user_role() IN ('sekretaris', 'ketua_himakala')
    OR (
      public.current_user_role() IN ('ketua_divisi', 'pengurus_divisi')
      AND public.current_user_division() = (SELECT id FROM public.divisi WHERE slug = 'psdm')
    )
  );

-- Berita & Galeri: Divisi Media dan Informasi (Medinfo) & Ketua HIMAKALA
CREATE POLICY "Medinfo & Ketua HIMAKALA kelola berita" ON public.berita
  FOR ALL USING (
    public.current_user_role() = 'ketua_himakala'
    OR (
      public.current_user_role() IN ('ketua_divisi', 'pengurus_divisi')
      AND public.current_user_division() = (SELECT id FROM public.divisi WHERE slug = 'medinfo')
    )
  );

CREATE POLICY "Medinfo & Ketua HIMAKALA kelola galeri" ON public.galeri
  FOR ALL USING (
    public.current_user_role() = 'ketua_himakala'
    OR (
      public.current_user_role() IN ('ketua_divisi', 'pengurus_divisi')
      AND public.current_user_division() = (SELECT id FROM public.divisi WHERE slug = 'medinfo')
    )
  );
-- ============================================================================
-- SEED 01: Struktur Dasar 6 Divisi HIMAKALA (Tanpa Data Dummy)
-- ============================================================================
-- Hanya menginisialisasi periode aktif dan 6 divisi resmi HIMAKALA:
-- 1. BPH (Badan Pengurus Harian - termasuk Ketua HIMAKALA/Ketua BPH, Sekretaris, Bendahara)
-- 2. Luar Negeri
-- 3. Dalam Negeri
-- 4. Media dan Informasi
-- 5. PSDM
-- 6. RSTEK

INSERT INTO public.periode (nama, tahun_mulai, tahun_selesai, status_aktif, ringkasan_capaian)
VALUES
  ('2026/2027', 2026, 2027, true, 'Periode aktif kepengurusan HIMAKALA PSDKU Lamongan.')
ON CONFLICT (nama) DO NOTHING;

INSERT INTO public.divisi (slug, nama, deskripsi, warna_kartu)
VALUES
  ('bph', 'BPH', 'Badan Pengurus Harian (Ketua HIMAKALA / Ketua BPH, Sekretaris, dan Bendahara).', 'amber'),
  ('luar-negeri', 'Luar Negeri', 'Hubungan eksternal, kolaborasi antar-himpunan, dan kemitraan luar kampus.', 'sky'),
  ('dalam-negeri', 'Dalam Negeri', 'Harmoni internal mahasiswa, aspirasi anggota, dan koordinasi kegiatan dalam kampus.', 'mint'),
  ('medinfo', 'Media dan Informasi', 'Publikasi informasi resmi, pengelolaan media kreatif, dan dokumentasi kegiatan.', 'lavender'),
  ('psdm', 'PSDM', 'Pengembangan Sumber Daya Mahasiswa, kaderisasi, dan pemetaan potensi anggota.', 'amber'),
  ('rstek', 'RSTEK', 'Riset dan Teknologi, inovasi karya mahasiswa TI & MMB, serta pengembangan teknologi.', 'sky')
ON CONFLICT (slug) DO UPDATE SET
  nama = EXCLUDED.nama,
  deskripsi = EXCLUDED.deskripsi,
  warna_kartu = EXCLUDED.warna_kartu;
-- ============================================================================
-- PATCH SQL: Login Biasa (Email & Password) Berdasarkan Tabel & Enum `pengguna`
-- Jalankan di SQL Editor Supabase
-- ============================================================================

-- 1. Lepas ketergantungan wajib ke auth.users agar tabel `pengguna` bisa diisi langsung
--    melalui Table Editor Supabase maupun dari aplikasi, serta tambahkan kolom password.
ALTER TABLE public.pengguna DROP CONSTRAINT IF EXISTS pengguna_id_fkey;
ALTER TABLE public.pengguna ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.pengguna ADD COLUMN IF NOT EXISTS password TEXT NOT NULL DEFAULT 'himakala123';

-- 2. Perbarui Kebijakan RLS agar aplikasi web dapat membaca profil & peran (`peran_pengguna`)
--    saat proses login dan menyimpan perubahan sesuai hak akses di database.
DROP POLICY IF EXISTS "Baca pengguna untuk autentikasi" ON public.pengguna;
CREATE POLICY "Baca pengguna untuk autentikasi" ON public.pengguna
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Kelola pengguna" ON public.pengguna;
CREATE POLICY "Kelola pengguna" ON public.pengguna
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Kelola proker dinamis" ON public.proker;
CREATE POLICY "Kelola proker dinamis" ON public.proker
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Kelola anggaran dinamis" ON public.anggaran;
CREATE POLICY "Kelola anggaran dinamis" ON public.anggaran
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Kelola dokumen dinamis" ON public.dokumen;
CREATE POLICY "Kelola dokumen dinamis" ON public.dokumen
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Kelola pengurus dinamis" ON public.pengurus;
CREATE POLICY "Kelola pengurus dinamis" ON public.pengurus
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Kelola berita dinamis" ON public.berita;
CREATE POLICY "Kelola berita dinamis" ON public.berita
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Kelola galeri dinamis" ON public.galeri;
CREATE POLICY "Kelola galeri dinamis" ON public.galeri
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Kelola aspirasi dinamis" ON public.aspirasi;
CREATE POLICY "Kelola aspirasi dinamis" ON public.aspirasi
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Kelola pendaftaran dinamis" ON public.pendaftaran;
CREATE POLICY "Kelola pendaftaran dinamis" ON public.pendaftaran
  FOR ALL USING (true) WITH CHECK (true);

-- 3. Masukkan akun pengguna awal berdasarkan enum `peran_pengguna` dan 6 divisi
--    (Password default: himakala123 - dapat diubah langsung di Table Editor -> pengguna)
INSERT INTO public.pengguna (nama, email, password, peran, id_divisi, status_aktif)
VALUES
  (
    'Anggota HIMAKALA',
    'anggota@himakala.ac.id',
    'himakala123',
    'anggota',
    NULL,
    true
  ),
  (
    'Ketua HIMAKALA',
    'ketua@himakala.ac.id',
    'himakala123',
    'ketua_himakala',
    (SELECT id FROM public.divisi WHERE slug = 'bph' LIMIT 1),
    true
  ),
  (
    'Sekretaris BPH',
    'sekretaris@himakala.ac.id',
    'himakala123',
    'sekretaris',
    (SELECT id FROM public.divisi WHERE slug = 'bph' LIMIT 1),
    true
  ),
  (
    'Bendahara BPH',
    'bendahara@himakala.ac.id',
    'himakala123',
    'bendahara',
    (SELECT id FROM public.divisi WHERE slug = 'bph' LIMIT 1),
    true
  ),
  (
    'Ketua Divisi Luar Negeri',
    'kabid.ln@himakala.ac.id',
    'himakala123',
    'ketua_divisi',
    (SELECT id FROM public.divisi WHERE slug = 'luar-negeri' LIMIT 1),
    true
  ),
  (
    'Pengurus Divisi Luar Negeri',
    'pengurus.ln@himakala.ac.id',
    'himakala123',
    'pengurus_divisi',
    (SELECT id FROM public.divisi WHERE slug = 'luar-negeri' LIMIT 1),
    true
  ),
  (
    'Ketua Divisi Dalam Negeri',
    'kabid.dn@himakala.ac.id',
    'himakala123',
    'ketua_divisi',
    (SELECT id FROM public.divisi WHERE slug = 'dalam-negeri' LIMIT 1),
    true
  ),
  (
    'Pengurus Divisi Dalam Negeri',
    'pengurus.dn@himakala.ac.id',
    'himakala123',
    'pengurus_divisi',
    (SELECT id FROM public.divisi WHERE slug = 'dalam-negeri' LIMIT 1),
    true
  ),
  (
    'Ketua Divisi Medinfo',
    'kabid.medinfo@himakala.ac.id',
    'himakala123',
    'ketua_divisi',
    (SELECT id FROM public.divisi WHERE slug = 'medinfo' LIMIT 1),
    true
  ),
  (
    'Pengurus Divisi Medinfo',
    'pengurus.medinfo@himakala.ac.id',
    'himakala123',
    'pengurus_divisi',
    (SELECT id FROM public.divisi WHERE slug = 'medinfo' LIMIT 1),
    true
  ),
  (
    'Ketua Divisi PSDM',
    'kabid.psdm@himakala.ac.id',
    'himakala123',
    'ketua_divisi',
    (SELECT id FROM public.divisi WHERE slug = 'psdm' LIMIT 1),
    true
  ),
  (
    'Pengurus Divisi PSDM',
    'pengurus.psdm@himakala.ac.id',
    'himakala123',
    'pengurus_divisi',
    (SELECT id FROM public.divisi WHERE slug = 'psdm' LIMIT 1),
    true
  ),
  (
    'Ketua Divisi RSTEK',
    'kabid.rstek@himakala.ac.id',
    'himakala123',
    'ketua_divisi',
    (SELECT id FROM public.divisi WHERE slug = 'rstek' LIMIT 1),
    true
  ),
  (
    'Pengurus Divisi RSTEK',
    'pengurus.rstek@himakala.ac.id',
    'himakala123',
    'pengurus_divisi',
    (SELECT id FROM public.divisi WHERE slug = 'rstek' LIMIT 1),
    true
  )
ON CONFLICT (email) DO UPDATE SET
  peran = EXCLUDED.peran,
  id_divisi = EXCLUDED.id_divisi,
  password = EXCLUDED.password;
