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
