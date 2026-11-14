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
