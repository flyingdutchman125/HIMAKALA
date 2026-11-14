-- ============================================================================
-- PATCH SQL 03: Registrasi Anggota Biasa (NRP, No. WA, Email Kampus PENS)
-- & Syarat Pengurus Wajib Anggota Aktif HIMAKALA
-- Jalankan di SQL Editor Supabase
-- ============================================================================

-- 1. Tambahkan kolom NRP, No. WA, dan Program Studi pada tabel `public.pengguna`
ALTER TABLE public.pengguna
  ADD COLUMN IF NOT EXISTS nrp TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS no_wa TEXT,
  ADD COLUMN IF NOT EXISTS prodi TEXT DEFAULT 'Teknik Informatika' CHECK (prodi IN ('Teknik Informatika', 'Multimedia Broadcasting'));

-- 2. Tambahkan constraint: Syarat menjadi Pengurus HIMAKALA (`peran != 'anggota'`)
--    adalah wajib berstatus Anggota Aktif HIMAKALA (`status_aktif = true`).
ALTER TABLE public.pengguna
  DROP CONSTRAINT IF EXISTS chk_pengurus_wajib_anggota_aktif;

ALTER TABLE public.pengguna
  ADD CONSTRAINT chk_pengurus_wajib_anggota_aktif
  CHECK (peran = 'anggota' OR status_aktif = true);

-- 3. Trigger otomatis: Pastikan setiap entri baru di `public.pengurus` memiliki
--    `id_pengguna` yang berstatus Anggota Aktif (`status_aktif = true`) di `public.pengguna`.
CREATE OR REPLACE FUNCTION public.fn_validasi_pengurus_anggota_aktif()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_aktif BOOLEAN;
BEGIN
  IF NEW.id_pengguna IS NOT NULL THEN
    SELECT status_aktif INTO v_aktif
    FROM public.pengguna
    WHERE id = NEW.id_pengguna;

    IF v_aktif IS DISTINCT FROM true THEN
      RAISE EXCEPTION 'Syarat menjadi Pengurus HIMAKALA adalah harus berstatus Anggota Aktif HIMAKALA terlebih dahulu.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validasi_pengurus_anggota_aktif ON public.pengurus;
CREATE TRIGGER trg_validasi_pengurus_anggota_aktif
  BEFORE INSERT OR UPDATE ON public.pengurus
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_validasi_pengurus_anggota_aktif();

-- 4. Lengkapi data NRP & No. WA pada akun pengurus dan anggota awal
UPDATE public.pengguna SET nrp = '3124500001', no_wa = '081234560001', prodi = 'Teknik Informatika' WHERE email = 'ketua@himakala.ac.id' AND nrp IS NULL;
UPDATE public.pengguna SET nrp = '3124500002', no_wa = '081234560002', prodi = 'Teknik Informatika' WHERE email = 'sekretaris@himakala.ac.id' AND nrp IS NULL;
UPDATE public.pengguna SET nrp = '3124500003', no_wa = '081234560003', prodi = 'Multimedia Broadcasting' WHERE email = 'bendahara@himakala.ac.id' AND nrp IS NULL;
UPDATE public.pengguna SET nrp = '3124500004', no_wa = '081234560004', prodi = 'Teknik Informatika' WHERE email = 'kabid.ln@himakala.ac.id' AND nrp IS NULL;
UPDATE public.pengguna SET nrp = '3124500005', no_wa = '081234560005', prodi = 'Multimedia Broadcasting' WHERE email = 'pengurus.ln@himakala.ac.id' AND nrp IS NULL;
UPDATE public.pengguna SET nrp = '3124500006', no_wa = '081234560006', prodi = 'Teknik Informatika' WHERE email = 'kabid.dn@himakala.ac.id' AND nrp IS NULL;
UPDATE public.pengguna SET nrp = '3124500007', no_wa = '081234560007', prodi = 'Multimedia Broadcasting' WHERE email = 'pengurus.dn@himakala.ac.id' AND nrp IS NULL;
UPDATE public.pengguna SET nrp = '3124500008', no_wa = '081234560008', prodi = 'Multimedia Broadcasting' WHERE email = 'kabid.medinfo@himakala.ac.id' AND nrp IS NULL;
UPDATE public.pengguna SET nrp = '3124500009', no_wa = '081234560009', prodi = 'Multimedia Broadcasting' WHERE email = 'pengurus.medinfo@himakala.ac.id' AND nrp IS NULL;
UPDATE public.pengguna SET nrp = '3124500010', no_wa = '081234560010', prodi = 'Teknik Informatika' WHERE email = 'kabid.psdm@himakala.ac.id' AND nrp IS NULL;
UPDATE public.pengguna SET nrp = '3124500011', no_wa = '081234560011', prodi = 'Teknik Informatika' WHERE email = 'pengurus.psdm@himakala.ac.id' AND nrp IS NULL;
UPDATE public.pengguna SET nrp = '3124500012', no_wa = '081234560012', prodi = 'Teknik Informatika' WHERE email = 'kabid.rstek@himakala.ac.id' AND nrp IS NULL;
UPDATE public.pengguna SET nrp = '3124500013', no_wa = '081234560013', prodi = 'Multimedia Broadcasting' WHERE email = 'pengurus.rstek@himakala.ac.id' AND nrp IS NULL;
UPDATE public.pengguna SET nrp = '3124500099', no_wa = '081234560099', prodi = 'Teknik Informatika' WHERE email IN ('anggota@himakala.ac.id', 'anggota@it.student.pens.ac.id') AND nrp IS NULL;
