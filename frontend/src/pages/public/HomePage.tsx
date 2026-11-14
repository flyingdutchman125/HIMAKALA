import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark } from "lucide-react";
import {
  DataStateView,
  InitialAvatar,
} from "@/components/shared/DataStateView";
import {
  formatRupiah,
  formatTanggal,
  getPastelSurfaceClass,
} from "@/lib/utils";
import { useHimakalaStore } from "@/services/himakala-store";

export function HomePage() {
  const {
    activePeriod,
    divisions,
    prokers,
    budgets,
    registrations,
    searchQuery,
    uiState,
    setUiState,
    isKepengurusan,
  } = useHimakalaStore();

  const [selectedDivisiId, setSelectedDivisiId] = useState<string>("all");
  const navigate = useNavigate();

  // Anggota HIMAKALA hanya melihat proker yang sudah disetujui
  const approvedProkers = prokers.filter(
    (p) => p.id_periode === activePeriod.id && p.status_izin === "disetujui"
  );

  const filteredProkers = approvedProkers.filter((p) => {
    const matchDiv =
      selectedDivisiId === "all" || p.id_divisi === selectedDivisiId;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      p.judul.toLowerCase().includes(q) ||
      p.pic.toLowerCase().includes(q);
    return matchDiv && matchSearch;
  });

  const approvedBudgets = budgets.filter((b) => {
    const prokerInPeriod = approvedProkers.some((p) => p.id === b.id_proker);
    return prokerInPeriod && b.status_persetujuan === "disetujui";
  });
  const totalRealisasiApproved = approvedBudgets.reduce(
    (acc, item) => acc + item.realisasi,
    0
  );

  return (
    <div className="space-y-6">
      <section aria-labelledby="heading-proker-utama">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h1
            id="heading-proker-utama"
            className="font-display text-2xl font-bold text-[#0B1938]"
          >
            Program kerja
          </h1>

          <div
            role="group"
            aria-label="Filter 6 divisi"
            className="flex flex-wrap items-center gap-1.5"
          >
            <button
              type="button"
              onClick={() => setSelectedDivisiId("all")}
              className={`min-h-[36px] rounded-full px-3.5 py-1 text-xs font-bold transition-colors ink-border ${
                selectedDivisiId === "all"
                  ? "bg-[#0B1938] text-white"
                  : "bg-white text-[#0B1938] hover:bg-[#FAD956]"
              }`}
            >
              Semua
            </button>
            {divisions.map((div) => (
              <button
                key={div.id}
                type="button"
                onClick={() => setSelectedDivisiId(div.id)}
                className={`min-h-[36px] rounded-full px-3.5 py-1 text-xs font-bold transition-colors ink-border ${
                  selectedDivisiId === div.id
                    ? "bg-[#0B1938] text-white"
                    : "bg-white text-[#0B1938] hover:bg-[#FAD956]"
                }`}
              >
                {div.nama}
              </button>
            ))}
          </div>
        </div>

        <DataStateView
          state={uiState}
          isEmpty={filteredProkers.length === 0}
          emptyTitle="Belum ada program kerja"
          emptyDescription={
            isKepengurusan
              ? "Tambahkan program kerja pertama dari menu Kepengurusan di sidebar."
              : "Kepengurusan belum mempublikasikan program kerja pada divisi ini."
          }
          emptyActionLabel={isKepengurusan ? "Tambah Proker" : undefined}
          onEmptyAction={
            isKepengurusan ? () => navigate("/admin?tab=proker") : undefined
          }
          onResetState={() => setUiState("normal")}
        >
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProkers.slice(0, 3).map((proker, index) => {
              const divisi = divisions.find((d) => d.id === proker.id_divisi);
              const cardColors: Array<"amber" | "lavender" | "sky"> = [
                "amber",
                "lavender",
                "sky",
              ];
              const surfaceClass = getPastelSurfaceClass(
                cardColors[index % cardColors.length]
              );
              const regCount = registrations.filter(
                (r) => r.id_proker === proker.id
              ).length;

              return (
                <article
                  key={proker.id}
                  className={`ink-card flex flex-col justify-between p-5 ${surfaceClass}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-lg px-3 py-1 text-xs font-bold ink-border ${
                          index === 0
                            ? "bg-[#0B1938] text-white"
                            : index === 1
                            ? "bg-[#FAD956] text-[#0B1938]"
                            : "bg-[#D8E4FC] text-[#0B1938]"
                        }`}
                      >
                        {divisi?.nama}
                      </span>
                      <Bookmark
                        className="h-4 w-4 text-[#0B1938]"
                        aria-hidden="true"
                      />
                    </div>

                    <h2 className="mt-3.5 line-clamp-2 font-display text-lg font-bold leading-snug text-[#0B1938]">
                      {proker.judul}
                    </h2>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#0B1938]">
                      <span>Progres</span>
                      <span>
                        {proker.tahap_selesai}/{proker.total_tahap} tahap
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={proker.progres}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Progres ${proker.judul}`}
                      className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#0B1938]/15"
                    >
                      <div
                        className="h-full rounded-full bg-[#0B1938]"
                        style={{ width: `${proker.progres}%` }}
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <div className="flex items-center -space-x-2">
                        <InitialAvatar name={proker.pic} bg="bg-white" />
                        <InitialAvatar
                          name={divisi?.nama || "HM"}
                          bg="bg-[#F5F8FC]"
                        />
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0B1938] text-[11px] font-bold text-white ink-border">
                          +{regCount}
                        </span>
                      </div>

                      <Link
                        to={`/proker/${proker.slug}`}
                        className="inline-flex min-h-[38px] items-center justify-center rounded-xl bg-[#026E9C] px-4 py-1.5 text-xs font-bold text-white ink-border hover:bg-[#01587E]"
                      >
                        Detail
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </DataStateView>
      </section>

      <section
        aria-label="Agenda dan Sorotan"
        className="grid grid-cols-1 gap-5 lg:grid-cols-12"
      >
        <div className="ink-card bg-white p-5 sm:p-6 lg:col-span-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-[#0B1938]">
              Agenda kegiatan
            </h2>
            <Link
              to="/proker"
              className="text-xs font-bold text-[#026E9C] hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          {approvedProkers.length === 0 ? (
            <p className="mt-4 rounded-xl bg-[#F5F8FC] p-6 text-center text-xs text-[#3B4E73] ink-border">
              Agenda kegiatan masih kosong.
            </p>
          ) : (
            <div className="mt-3 divide-y divide-[#0B1938]/10">
              {approvedProkers.slice(0, 5).map((item, idx) => {
                const nomor = String(idx + 1).padStart(2, "0");
                const div = divisions.find((d) => d.id === item.id_divisi);
                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 items-center gap-2 py-3 sm:grid-cols-12"
                  >
                    <div className="sm:col-span-6">
                      <Link
                        to={`/proker/${item.slug}`}
                        className="font-display text-xs font-bold text-[#0B1938] hover:text-[#026E9C] sm:text-sm"
                      >
                        {nomor}. {item.judul}
                      </Link>
                      <p className="text-[11px] text-[#3B4E73]">{div?.nama}</p>
                    </div>

                    <div className="flex items-center gap-2 sm:col-span-4">
                      <InitialAvatar name={item.pic} bg="bg-[#FAD956]" />
                      <span className="text-xs font-medium text-[#0B1938]">
                        {item.pic}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-[#0B1938] sm:col-span-2 sm:text-right">
                      {formatTanggal(item.tanggal_mulai)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside className="ink-card flex flex-col justify-between bg-[#0B1938] p-6 text-white lg:col-span-4">
          <div>
            <p className="text-xs text-[#B8CBE8]">6 Divisi HIMAKALA</p>

            <span className="mt-4 inline-block rounded-lg bg-[#FAD956] px-3 py-1 text-xs font-bold text-[#0B1938] ink-border">
              Transparansi Kas
            </span>

            <h2 className="mt-3.5 font-display text-xl font-bold leading-snug text-white">
              Realisasi: {formatRupiah(totalRealisasiApproved)}
            </h2>
          </div>

          <div className="mt-6">
            <p className="text-xs text-[#B8CBE8]">
              BPH • LN • DN • Medinfo • PSDM • RSTEK
            </p>
            <div className="mt-2.5 flex items-center -space-x-2">
              {divisions.slice(0, 4).map((d) => (
                <InitialAvatar key={d.id} name={d.nama} bg="bg-[#C8ECFA]" />
              ))}
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FAD956] text-xs font-bold text-[#0B1938] ink-border">
                6
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/transparansi")}
              className="mt-5 w-full min-h-[44px] rounded-xl bg-[#026E9C] px-4 py-2.5 text-xs font-bold text-white ink-border hover:bg-[#01587E]"
            >
              Rincian kas
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}
