// ============================================================================
// Edge Function: sync-pens-news (Bagian 2.1 & 10 PRD)
// Mengambil berita dari server PENS di sisi backend (bebas masalah CORS)
// dan menyimpannya sebagai draf untuk ditinjau Editor HIMAKALA.
// ============================================================================

export interface ExternalNewsDraft {
  judul: string;
  ringkasan: string;
  kategori: "Kampus PENS";
  sumber_url: string;
  status_terbit: false;
}

export function buildPensNewsDraft(item: {
  title: string;
  excerpt: string;
  link: string;
}): ExternalNewsDraft {
  return {
    judul: item.title.trim(),
    ringkasan: item.excerpt.trim(),
    kategori: "Kampus PENS",
    sumber_url: item.link.trim(),
    status_terbit: false, // Wajib ditinjau admin/editor sebelum tayang publik
  };
}

