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

