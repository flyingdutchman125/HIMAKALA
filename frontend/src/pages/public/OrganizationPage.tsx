import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DataStateView,
  InitialAvatar,
} from "@/components/shared/DataStateView";
import { getPastelSurfaceClass } from "@/lib/utils";
import { useHimakalaStore } from "@/services/himakala-store";

export function OrganizationPage() {
  const {
    activePeriod,
    divisions,
    members,
    uiState,
    setUiState,
    isKepengurusan,
  } = useHimakalaStore();

  const [selectedDivisiId, setSelectedDivisiId] = useState<string>("all");
  const navigate = useNavigate();

  const periodMembers = members.filter((m) => m.id_periode === activePeriod.id);
  const filteredMembers = periodMembers.filter(
    (m) => selectedDivisiId === "all" || m.id_divisi === selectedDivisiId
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-[#0B1938]">
          6 Divisi Kepengurusan HIMAKALA
        </h1>
      </div>

      {/* Kartu Ringkas 6 Divisi */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {divisions.map((div) => {
          const surface = getPastelSurfaceClass(div.warna_kartu);
          const count = periodMembers.filter(
            (m) => m.id_divisi === div.id
          ).length;
          return (
            <button
              key={div.id}
              type="button"
              onClick={() =>
                setSelectedDivisiId((prev) =>
                  prev === div.id ? "all" : div.id
                )
              }
              className={`ink-card flex flex-col justify-between p-4 text-left transition-transform ${surface} ${
                selectedDivisiId === div.id ? "ring-2 ring-[#0B1938]" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-[#0B1938] px-2.5 py-0.5 text-xs font-bold text-white">
                  {div.nama}
                </span>
                <span className="text-xs font-bold text-[#0B1938]">
                  {count} pengurus
                </span>
              </div>
              <p className="mt-2.5 text-xs text-[#0B1938]">{div.deskripsi}</p>
            </button>
          );
        })}
      </div>

      <DataStateView
        state={uiState}
        isEmpty={filteredMembers.length === 0}
        emptyTitle="Daftar pengurus masih kosong"
        emptyDescription={
          isKepengurusan
            ? "Tambahkan pengurus tiap divisi melalui menu Data Pengurus."
            : "Data pengurus belum diinput oleh kepengurusan."
        }
        emptyActionLabel={isKepengurusan ? "Tambah Pengurus" : undefined}
        onEmptyAction={
          isKepengurusan ? () => navigate("/admin?tab=pengurus") : undefined
        }
        onResetState={() => setUiState("normal")}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredMembers.map((mem) => {
            const div = divisions.find((d) => d.id === mem.id_divisi);
            const surface = getPastelSurfaceClass(div?.warna_kartu || "amber");
            return (
              <article
                key={mem.id}
                className={`ink-card flex flex-col justify-between p-5 ${surface}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-lg bg-[#0B1938] px-2.5 py-1 text-[11px] font-bold text-white">
                    {div?.nama}
                  </span>
                  <span className="text-[11px] font-bold text-[#0B1938]">
                    {mem.prodi === "Teknik Informatika" ? "TI" : "MMB"}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <InitialAvatar name={mem.nama} bg="bg-white" />
                  <div>
                    <h2 className="font-display text-sm font-bold text-[#0B1938]">
                      {mem.nama}
                    </h2>
                    <p className="text-xs text-[#0B1938]/80">{mem.jabatan}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </DataStateView>
    </div>
  );
}
