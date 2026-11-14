-- ============================================================================
-- Konfigurasi Bucket Penyimpanan Berkas (Supabase Storage)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('foto-pengurus', 'foto-pengurus', true, 2097152, ARRAY['image/webp', 'image/jpeg', 'image/png']),
  ('galeri-kegiatan', 'galeri-kegiatan', true, 5242880, ARRAY['image/webp', 'image/jpeg', 'image/png']),
  ('dokumen-resmi', 'dokumen-resmi', false, 15728640, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

