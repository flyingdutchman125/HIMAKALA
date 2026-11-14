import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { DataStateView } from "@/components/shared/DataStateView";
import { formatTanggal, getPastelSurfaceClass } from "@/lib/utils";
import { useHimakalaStore } from "@/services/himakala-store";
import type { Berita } from "@/types/entities";

export function NewsGalleryPage() {
  const {
    newsList,
    gallery,
    prokers,
    searchQuery,
    setSearchQuery,
    uiState,
    setUiState,
  } = useHimakalaStore();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeArticle, setActiveArticle] = useState<Berita | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveArticle(null);
    }
    if (activeArticle) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeArticle]);

  const categories = ["all", "Transparansi", "Kegiatan", "Pengumuman"];

  const filteredNews = newsList.filter((n) => {
    if (!n.status_terbit) return false;
    const matchCat =
      selectedCategory === "all" || n.kategori === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchQuery = !q || n.judul.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-[#0B1938]">
          Berita &amp; galeri
        </h1>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[36px] rounded-full px-3.5 py-1 text-xs font-bold ink-border ${
                selectedCategory === cat
                  ? "bg-[#0B1938] text-white"
                  : "bg-white text-[#0B1938] hover:bg-[#FAD956]"
              }`}
            >
              {cat === "all" ? "Semua" : cat}
            </button>
          ))}
        </div>
      </div>

      <DataStateView
        state={uiState}
        isEmpty={filteredNews.length === 0}
        emptyTitle="Berita belum tersedia"
        emptyDescription="Pilih kategori lain."
        onResetState={() => {
          setSelectedCategory("all");
          setSearchQuery("");
          setUiState("normal");
        }}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {filteredNews.map((item, idx) => {
            const colors: Array<"amber" | "lavender" | "sky"> = [
              "amber",
              "lavender",
              "sky",
            ];
            const surface = getPastelSurfaceClass(colors[idx % colors.length]);
            return (
              <article
                key={item.id}
                className={`ink-card flex flex-col justify-between p-5 ${surface}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-[#0B1938] px-2.5 py-1 text-xs font-bold text-white">
                      {item.kategori}
                    </span>
                    <span className="text-xs font-semibold text-[#0B1938]">
                      {formatTanggal(item.tanggal)}
                    </span>
                  </div>
                  <h2 className="mt-3.5 font-display text-lg font-bold leading-snug text-[#0B1938]">
                    {item.judul}
                  </h2>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs font-medium text-[#0B1938]">
                    {item.penulis}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveArticle(item)}
                    className="min-h-[36px] rounded-xl bg-[#026E9C] px-3.5 py-1.5 text-xs font-bold text-white ink-border hover:bg-[#01587E]"
                  >
                    Baca
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </DataStateView>

      {/* Galeri Ringkas */}
      <div className="ink-card bg-white p-5">
        <h2 className="font-display text-lg font-bold text-[#0B1938]">
          Dokumentasi kegiatan
        </h2>
        <div className="mt-3 divide-y divide-[#0B1938]/10">
          {gallery.map((g, idx) => {
            const linked = prokers.find((p) => p.id === g.id_proker);
            return (
              <div
                key={g.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div>
                  <p className="font-display text-xs font-bold text-[#0B1938] sm:text-sm">
                    {String(idx + 1).padStart(2, "0")}. {g.judul_kegiatan}
                  </p>
                  <p className="text-xs text-[#3B4E73]">
                    {g.divisi_nama} · {formatTanggal(g.tanggal)}
                  </p>
                </div>
                {linked && (
                  <Link
                    to={`/proker/${linked.slug}`}
                    className="rounded-xl bg-[#FAD956] px-3 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
                  >
                    Proker
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {activeArticle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-news-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1938]/60 p-4"
        >
          <div className="ink-card w-full max-w-md bg-[#F5F8FC] p-6 shadow-[0_10px_0_#0B1938]">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-[#FAD956] px-3 py-1 text-xs font-bold text-[#0B1938] ink-border">
                {activeArticle.kategori}
              </span>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                aria-label="Tutup"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white ink-border"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <h2
              id="modal-news-title"
              className="mt-3 font-display text-lg font-bold text-[#0B1938]"
            >
              {activeArticle.judul}
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-[#0B1938]">
              {activeArticle.isi}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
