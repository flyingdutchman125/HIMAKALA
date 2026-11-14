// ============================================================================
// Edge Function: track-aspiration (FP-12)
// Mengembalikan status tindak lanjut berdasarkan nomor_pelacakan tanpa
// mengekspos data kontak pengirim ke publik.
// ============================================================================

export interface PublicAspirationStatus {
  nomor_pelacakan: string;
  kategori: string;
  isi: string;
  status: "diterima" | "diproses" | "selesai";
  tanggapan: string | null;
  tanggal_kirim: string;
}

export function formatPublicTrackingResponse(record: {
  nomor_pelacakan: string;
  kategori: string;
  isi: string;
  status: "diterima" | "diproses" | "selesai";
  tanggapan?: string | null;
  tanggal_kirim: string;
}): PublicAspirationStatus {
  return {
    nomor_pelacakan: record.nomor_pelacakan.toUpperCase(),
    kategori: record.kategori,
    isi: record.isi,
    status: record.status,
    tanggapan: record.tanggapan ?? null,
    tanggal_kirim: record.tanggal_kirim,
  };
}

