// ============================================================================
// Edge Function: submit-aspiration (FP-11 & Bagian 7 Keamanan/Privasi)
// ============================================================================

export interface SubmitAspirationPayload {
  kategori: string;
  isi: string;
  anonim: boolean;
  nama_pengirim?: string | null;
  kontak_opsional?: string | null;
}

export function generateTrackingNumber(year = new Date().getFullYear()): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ASP-${year}-${suffix}`;
}

export function sanitizeAspirationPayload(payload: SubmitAspirationPayload) {
  const cleanedText = payload.isi.trim();
  if (cleanedText.length < 15) {
    throw new Error("Isi aspirasi minimal 15 karakter agar dapat ditindaklanjuti dengan jelas.");
  }

  // Jaminan privasi Bagian 7 PRD: bila anonim = true, hapus seluruh identitas
  return {
    nomor_pelacakan: generateTrackingNumber(),
    kategori: payload.kategori || "Akademik & Organisasi",
    isi: cleanedText,
    anonim: Boolean(payload.anonim),
    nama_pengirim: payload.anonim ? null : (payload.nama_pengirim?.trim() || null),
    kontak_opsional: payload.anonim ? null : (payload.kontak_opsional?.trim() || null),
    status: "diterima" as const,
    tanggapan: null,
  };
}

