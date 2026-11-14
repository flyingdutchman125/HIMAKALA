-- ============================================================================
-- Pengujian Constraint Database & Kebijakan Keamanan (PRD HIMAKALA v1.1)
-- ============================================================================

BEGIN;

-- 1. Pastikan nama placeholder "Entitas" ditolak oleh constraint tabel pengurus
DO $$
BEGIN
  BEGIN
    INSERT INTO public.pengurus (nama, jabatan, prodi, id_divisi, id_periode)
    VALUES (
      'Entitas',
      'Bendahara',
      'Teknik Informatika',
      'd2222222-2222-2222-2222-222222222222',
      '11111111-1111-1111-1111-111111111111'
    );
    RAISE EXCEPTION 'Constraint gagal menolak nama placeholder Entitas';
  EXCEPTION WHEN check_violation THEN
    -- Berhasil ditolak sesuai temuan audit Bagian 2.1 PRD
    NULL;
  END;
END $$;

-- 2. Pastikan aspirasi anonim yang masih menyertakan kontak_opsional ditolak
DO $$
BEGIN
  BEGIN
    INSERT INTO public.aspirasi (nomor_pelacakan, isi, anonim, kontak_opsional)
    VALUES (
      'ASP-2026-TEST',
      'Pengujian privasi aspirasi anonim harus menolak kontak.',
      true,
      'mahasiswa@pens.ac.id'
    );
    RAISE EXCEPTION 'Constraint privasi gagal menolak kontak pada mode anonim';
  EXCEPTION WHEN check_violation THEN
    -- Berhasil ditolak sesuai kebutuhan privasi Bagian 7 PRD
    NULL;
  END;
END $$;

ROLLBACK;

