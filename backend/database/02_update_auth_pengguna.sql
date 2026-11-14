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

