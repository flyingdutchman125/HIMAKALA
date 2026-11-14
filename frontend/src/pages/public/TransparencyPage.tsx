import React, { useEffect, useState } from "react";
import { Download, Lock, X } from "lucide-react";
import {
  BudgetApprovalBadge,
  DataStateView,
} from "@/components/shared/DataStateView";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import { useHimakalaStore } from "@/services/himakala-store";
import type { Dokumen } from "@/types/entities";

export function TransparencyPage() {
  const {
    activePeriod,
    prokers,
    budgets,
    documents,
    currentUser,
    searchQuery,
    setSearchQuery,
    uiState,
    setUiState,
  } = useHimakalaStore();

  const [selectedDocCategory, setSelectedDocCategory] = useState<string>("all");
  const [selectedDocModal, setSelectedDocModal] = useState<Dokumen | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedDocModal(null);
    }
    if (selectedDocModal) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDocModal]);

  const periodProkers = prokers.filter((p) => p.id_periode === activePeriod.id);

  const visibleBudgets = budgets.filter((b) => {
    const inPeriod = periodProkers.some((p) => p.id === b.id_proker);
    if (!inPeriod) return false;
    return currentUser ? true : b.status_persetujuan === "disetujui";
  });

  const approvedBudgets = visibleBudgets.filter(
    (b) => b.status_persetujuan === "disetujui"
  );
  const totalRencana = approvedBudgets.reduce((sum, b) => sum + b.rencana, 0);
  const totalRealisasi = approvedBudgets.reduce(
    (sum, b) => sum + b.realisasi,
    0
  );
  const selisihKas = totalRencana - totalRealisasi;

  const visibleDocuments = documents.filter((d) => {
    if (d.id_periode !== activePeriod.id) return false;
    if (!currentUser && d.visibilitas !== "publik") return false;
    const matchCategory =
      selectedDocCategory === "all" || d.kategori === selectedDocCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch = !q || d.judul.toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-[#0B1938]">
        Transparansi kas &amp; dokumen
      </h1>

      {/* 3 Kartu Pastel Ringkas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="ink-card bg-[#FAD956] p-5">
          <span className="rounded-lg bg-[#0B1938] px-3 py-1 text-xs font-bold text-white">
            Rencana Kas
          </span>
          <p className="mt-3.5 font-display text-2xl font-bold text-[#0B1938]">
            {formatRupiah(totalRencana)}
          </p>
        </div>

        <div className="ink-card bg-[#D8E4FC] p-5">
          <span className="rounded-lg bg-[#0B1938] px-3 py-1 text-xs font-bold text-white">
            Realisasi Terpakai
          </span>
          <p className="mt-3.5 font-display text-2xl font-bold text-[#0B1938]">
            {formatRupiah(totalRealisasi)}
          </p>
        </div>

        <div className="ink-card bg-[#C8ECFA] p-5">
          <span className="rounded-lg bg-[#0B1938] px-3 py-1 text-xs font-bold text-white">
            Sisa Anggaran
          </span>
          <p className="mt-3.5 font-display text-2xl font-bold text-[#0B1938]">
            {formatRupiah(selisihKas)}
          </p>
        </div>
      </div>

      {/* Bawah: Kiri (7/12) Rincian Anggaran Proker + Kanan (5/12) Pusat Dokumen */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <section
          aria-labelledby="heading-rincian-kas"
          className="ink-card bg-white p-5 lg:col-span-7"
        >
          <h2
            id="heading-rincian-kas"
            className="font-display text-lg font-bold text-[#0B1938]"
          >
            Rencana vs realisasi per proker
          </h2>

          <DataStateView
            state={uiState}
            isEmpty={visibleBudgets.length === 0}
            emptyTitle="Belum ada anggaran"
            emptyDescription="Menunggu persetujuan Ketua."
            onResetState={() => setUiState("normal")}
          >
            <div className="mt-3 divide-y divide-[#0B1938]/10">
              {visibleBudgets.map((item, idx) => {
                const proker = prokers.find((p) => p.id === item.id_proker);
                const pct =
                  item.rencana > 0
                    ? Math.min(
                        100,
                        Math.round((item.realisasi / item.rencana) * 100)
                      )
                    : 0;
                return (
                  <div key={item.id} className="py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-xs font-bold text-[#0B1938] sm:text-sm">
                        {String(idx + 1).padStart(2, "0")}. {proker?.judul}
                      </span>
                      <span className="text-xs font-bold text-[#026E9C]">
                        {formatRupiah(item.realisasi)} /{" "}
                        {formatRupiah(item.rencana)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#0B1938]/15">
                      <div
                        className="h-full rounded-full bg-[#0B1938]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </DataStateView>
        </section>

        <section
          aria-labelledby="heading-dokumen"
          className="ink-card bg-white p-5 lg:col-span-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="heading-dokumen"
              className="font-display text-lg font-bold text-[#0B1938]"
            >
              Dokumen resmi
            </h2>
            <select
              aria-label="Filter kategori dokumen"
              value={selectedDocCategory}
              onChange={(e) => setSelectedDocCategory(e.target.value)}
              className="min-h-[34px] rounded-full bg-[#F5F8FC] px-3 py-1 text-xs font-bold text-[#0B1938] ink-border"
            >
              <option value="all">Semua</option>
              <option value="AD_ART">AD/ART</option>
              <option value="SK">SK</option>
              <option value="LPJ">LPJ</option>
              <option value="NOTULEN">Notulen</option>
            </select>
          </div>

          <div className="mt-3 divide-y divide-[#0B1938]/10">
            {visibleDocuments.map((doc, idx) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-[#FAD956] px-2 py-0.5 text-[10px] font-bold text-[#0B1938] ink-border">
                      {doc.kategori}
                    </span>
                    {doc.visibilitas === "internal" && (
                      <Lock className="h-3 w-3 text-[#026E9C]" aria-hidden="true" />
                    )}
                  </div>
                  <p className="mt-1 font-display text-xs font-bold text-[#0B1938]">
                    {String(idx + 1).padStart(2, "0")}. {doc.judul}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDocModal(doc)}
                  className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-xl bg-[#026E9C] px-3 py-1.5 text-xs font-bold text-white ink-border hover:bg-[#01587E]"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Unduh
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {selectedDocModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-doc-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1938]/60 p-4"
        >
          <div className="ink-card w-full max-w-md bg-[#F5F8FC] p-6 shadow-[0_10px_0_#0B1938]">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-[#FAD956] px-3 py-1 text-xs font-bold text-[#0B1938] ink-border">
                {selectedDocModal.kategori}
              </span>
              <button
                type="button"
                onClick={() => setSelectedDocModal(null)}
                aria-label="Tutup"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white ink-border"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <h2
              id="modal-doc-title"
              className="mt-3 font-display text-lg font-bold text-[#0B1938]"
            >
              {selectedDocModal.judul}
            </h2>
            <p className="mt-1 text-xs text-[#3B4E73]">
              No: {selectedDocModal.nomor_dokumen} ·{" "}
              {formatTanggal(selectedDocModal.tanggal_unggah)}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedDocModal(null)}
                className="min-h-[38px] rounded-xl bg-white px-4 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([selectedDocModal.judul], {
                    type: "text/plain;charset=utf-8",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${selectedDocModal.kategori}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                  setSelectedDocModal(null);
                }}
                className="min-h-[38px] rounded-xl bg-[#026E9C] px-4 py-1.5 text-xs font-bold text-white ink-border hover:bg-[#01587E]"
              >
                Unduh PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
