import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, Calendar as CalendarIcon } from "lucide-react";
import {
  DataStateView,
  InitialAvatar,
  ProkerStatusBadge,
} from "@/components/shared/DataStateView";
import {
  formatRupiah,
  formatTanggal,
  getPastelSurfaceClass,
} from "@/lib/utils";
import { useHimakalaStore } from "@/services/himakala-store";
import type { ProdiLamongan } from "@/types/entities";

export function ProkerPage() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const {
    activePeriod,
    divisions,
    prokers,
    budgets,
    registrations,
    registerForProker,
    searchQuery,
    uiState,
    setUiState,
    isKepengurusan,
  } = useHimakalaStore();

  const [selectedDivisi, setSelectedDivisi] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "calendar">("cards");

  const [regNama, setRegNama] = useState("");
  const [regNrp, setRegNrp] = useState("");
  const [regProdi, setRegProdi] = useState<ProdiLamongan>("Teknik Informatika");
  const [regPeran, setRegPeran] = useState<"Peserta" | "Panitia">("Peserta");
  const [regKontak, setRegKontak] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const approvedProkers = prokers.filter(
    (p) => p.id_periode === activePeriod.id && p.status_izin === "disetujui"
  );

  if (slug) {
    const detail = approvedProkers.find((p) => p.slug === slug);
    if (!detail) {
      return (
        <div className="ink-card bg-white p-6 text-center">
          <h1 className="font-display text-xl font-bold text-[#0B1938]">
            Proker tidak ditemukan
          </h1>
          <Link
            to="/proker"
            className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-full bg-[#0B1938] px-4 py-2 text-xs font-bold text-white ink-border"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali
          </Link>
        </div>
      );
    }

    const divisi = divisions.find((d) => d.id === detail.id_divisi);
    const budget = budgets.find(
      (b) =>
        b.id_proker === detail.id && b.status_persetujuan === "disetujui"
    );
    const prokerRegistrations = registrations.filter(
      (r) => r.id_proker === detail.id
    );

    function handleRegistrationSubmit(e: React.FormEvent) {
      e.preventDefault();
      setRegError("");
      setRegSuccess("");

      if (regNama.trim().length < 3 || regNrp.trim().length < 6 || !regKontak.trim()) {
        setRegError("Lengkapi Nama, NRP, dan Kontak aktif.");
        return;
      }

      registerForProker({
        id_proker: detail!.id,
        nama: regNama.trim(),
        nrp: regNrp.trim(),
        prodi: regProdi,
        peran_dipilih: regPeran,
        kontak: regKontak.trim(),
        alasan: "Pendaftaran kegiatan",
      });

      setRegSuccess(`Terdaftar sebagai ${regPeran}.`);
      setRegNama("");
      setRegNrp("");
      setRegKontak("");
    }

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Link
            to="/proker"
            className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-[#0B1938] ink-border hover:bg-[#FAD956]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Semua proker
          </Link>
          <ProkerStatusBadge status={detail.status} />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="ink-card bg-[#FAD956] p-6 lg:col-span-8">
            <span className="rounded-lg bg-[#0B1938] px-3 py-1 text-xs font-bold text-white">
              Divisi {divisi?.nama}
            </span>
            <h1 className="mt-3 font-display text-2xl font-bold text-[#0B1938]">
              {detail.judul}
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-[#0B1938]">
              {detail.deskripsi || detail.tujuan}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 text-xs ink-border sm:grid-cols-4">
              <div>
                <span className="text-[#3B4E73]">PIC</span>
                <p className="mt-0.5 font-bold text-[#0B1938]">{detail.pic}</p>
              </div>
              <div>
                <span className="text-[#3B4E73]">Jadwal</span>
                <p className="mt-0.5 font-bold text-[#0B1938]">
                  {formatTanggal(detail.tanggal_mulai)}
                </p>
              </div>
              <div>
                <span className="text-[#3B4E73]">Progres</span>
                <p className="mt-0.5 font-bold text-[#0B1938]">
                  {detail.tahap_selesai}/{detail.total_tahap} tahap ({detail.progres}%)
                </p>
              </div>
              <div>
                <span className="text-[#3B4E73]">Realisasi Kas</span>
                <p className="mt-0.5 font-bold text-[#026E9C]">
                  {budget ? formatRupiah(budget.realisasi) : "Rp 0"}
                </p>
              </div>
            </div>
          </div>

          <aside className="ink-card bg-[#0B1938] p-6 text-white lg:col-span-4">
            <span className="rounded-lg bg-[#FAD956] px-3 py-1 text-xs font-bold text-[#0B1938] ink-border">
              Daftar Kegiatan ({prokerRegistrations.length})
            </span>

            <form onSubmit={handleRegistrationSubmit} className="mt-4 space-y-3">
              <div>
                <label htmlFor="reg-nama" className="block text-xs font-semibold">
                  Nama Lengkap
                </label>
                <input
                  id="reg-nama"
                  type="text"
                  value={regNama}
                  onChange={(e) => setRegNama(e.target.value)}
                  placeholder="Nama Anda"
                  className="mt-1 w-full min-h-[40px] rounded-xl bg-white px-3 py-1.5 text-xs text-[#0B1938] ink-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="reg-nrp" className="block text-xs font-semibold">
                    NRP
                  </label>
                  <input
                    id="reg-nrp"
                    type="text"
                    value={regNrp}
                    onChange={(e) => setRegNrp(e.target.value)}
                    placeholder="31255000XX"
                    className="mt-1 w-full min-h-[40px] rounded-xl bg-white px-3 py-1.5 text-xs text-[#0B1938] ink-border"
                  />
                </div>
                <div>
                  <label htmlFor="reg-peran" className="block text-xs font-semibold">
                    Peran
                  </label>
                  <select
                    id="reg-peran"
                    value={regPeran}
                    onChange={(e) =>
                      setRegPeran(e.target.value as "Peserta" | "Panitia")
                    }
                    className="mt-1 w-full min-h-[40px] rounded-xl bg-white px-2.5 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
                  >
                    <option value="Peserta">Peserta</option>
                    <option value="Panitia">Panitia</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="reg-prodi" className="block text-xs font-semibold">
                  Program Studi
                </label>
                <select
                  id="reg-prodi"
                  value={regProdi}
                  onChange={(e) => setRegProdi(e.target.value as ProdiLamongan)}
                  className="mt-1 w-full min-h-[40px] rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
                >
                  <option value="Teknik Informatika">Teknik Informatika</option>
                  <option value="Multimedia Broadcasting">
                    Multimedia Broadcasting
                  </option>
                </select>
              </div>

              <div>
                <label htmlFor="reg-kontak" className="block text-xs font-semibold">
                  Kontak Email / WA
                </label>
                <input
                  id="reg-kontak"
                  type="text"
                  value={regKontak}
                  onChange={(e) => setRegKontak(e.target.value)}
                  placeholder="email@student.pens.ac.id"
                  className="mt-1 w-full min-h-[40px] rounded-xl bg-white px-3 py-1.5 text-xs text-[#0B1938] ink-border"
                />
              </div>

              {regError && (
                <p role="alert" className="rounded-lg bg-[#FEE2E2] p-2 text-xs font-bold text-[#0B1938]">
                  {regError}
                </p>
              )}
              {regSuccess && (
                <p role="status" className="rounded-lg bg-[#CCF2EA] p-2 text-xs font-bold text-[#0B1938]">
                  {regSuccess}
                </p>
              )}

              <button
                type="submit"
                className="w-full min-h-[42px] rounded-xl bg-[#026E9C] px-4 py-2 text-xs font-bold text-white ink-border hover:bg-[#01587E]"
              >
                Daftar Sekarang
              </button>
            </form>
          </aside>
        </div>
      </div>
    );
  }

  const filtered = approvedProkers.filter((p) => {
    const matchDiv = selectedDivisi === "all" || p.id_divisi === selectedDivisi;
    const matchStatus = selectedStatus === "all" || p.status === selectedStatus;
    const q = searchQuery.trim().toLowerCase();
    const matchQuery =
      !q ||
      p.judul.toLowerCase().includes(q) ||
      p.pic.toLowerCase().includes(q);
    return matchDiv && matchStatus && matchQuery;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-[#0B1938]">
          Katalog program kerja
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter status proker"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="min-h-[38px] rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
          >
            <option value="all">Semua status</option>
            <option value="direncanakan">Direncanakan</option>
            <option value="berjalan">Berjalan</option>
            <option value="selesai">Selesai</option>
          </select>

          <button
            type="button"
            onClick={() =>
              setViewMode((v) => (v === "cards" ? "calendar" : "cards"))
            }
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full bg-[#0B1938] px-4 py-1.5 text-xs font-bold text-white ink-border"
          >
            <CalendarIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {viewMode === "cards" ? "Linimasa" : "Kartu"}
          </button>
        </div>
      </div>

      {/* Pill 6 Divisi */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedDivisi("all")}
          className={`min-h-[36px] rounded-full px-3.5 py-1 text-xs font-bold ink-border ${
            selectedDivisi === "all"
              ? "bg-[#0B1938] text-white"
              : "bg-white text-[#0B1938] hover:bg-[#FAD956]"
          }`}
        >
          Semua ({approvedProkers.length})
        </button>
        {divisions.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setSelectedDivisi(d.id)}
            className={`min-h-[36px] rounded-full px-3.5 py-1 text-xs font-bold ink-border ${
              selectedDivisi === d.id
                ? "bg-[#0B1938] text-white"
                : "bg-white text-[#0B1938] hover:bg-[#FAD956]"
            }`}
          >
            {d.nama}
          </button>
        ))}
      </div>

      <DataStateView
        state={uiState}
        isEmpty={filtered.length === 0}
        emptyTitle="Belum ada program kerja"
        emptyDescription={
          isKepengurusan
            ? "Silakan tambahkan program kerja dari menu Kepengurusan."
            : "Belum ada program kerja yang dipublikasikan."
        }
        emptyActionLabel={isKepengurusan ? "Kelola Proker" : undefined}
        onEmptyAction={
          isKepengurusan ? () => navigate("/admin?tab=proker") : undefined
        }
        onResetState={() => setUiState("normal")}
      >
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item, idx) => {
              const divisi = divisions.find((d) => d.id === item.id_divisi);
              const variants: Array<"amber" | "lavender" | "sky" | "mint"> = [
                "amber",
                "lavender",
                "sky",
                "mint",
              ];
              const surface = getPastelSurfaceClass(
                variants[idx % variants.length]
              );
              return (
                <article
                  key={item.id}
                  className={`ink-card flex flex-col justify-between p-5 ${surface}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-lg bg-[#0B1938] px-3 py-1 text-xs font-bold text-white">
                        {divisi?.nama}
                      </span>
                      <Bookmark className="h-4 w-4 text-[#0B1938]" aria-hidden="true" />
                    </div>
                    <h2 className="mt-3.5 line-clamp-2 font-display text-lg font-bold leading-snug text-[#0B1938]">
                      {item.judul}
                    </h2>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#0B1938]">
                      <span>Progres</span>
                      <span>
                        {item.tahap_selesai}/{item.total_tahap} tahap
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#0B1938]/15">
                      <div
                        className="h-full rounded-full bg-[#0B1938]"
                        style={{ width: `${item.progres}%` }}
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <InitialAvatar name={item.pic} bg="bg-white" />
                        <span className="text-xs font-bold text-[#0B1938]">
                          {item.pic.split(" ")[0]}
                        </span>
                      </div>
                      <Link
                        to={`/proker/${item.slug}`}
                        className="inline-flex min-h-[38px] items-center rounded-xl bg-[#026E9C] px-4 py-1.5 text-xs font-bold text-white ink-border hover:bg-[#01587E]"
                      >
                        Detail
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="ink-card bg-white p-5">
            <div className="divide-y divide-[#0B1938]/10">
              {filtered.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <Link
                      to={`/proker/${item.slug}`}
                      className="font-display text-sm font-bold text-[#0B1938] hover:text-[#026E9C]"
                    >
                      {String(idx + 1).padStart(2, "0")}. {item.judul}
                    </Link>
                    <p className="text-xs text-[#3B4E73]">
                      {formatTanggal(item.tanggal_mulai)} · {item.pic}
                    </p>
                  </div>
                  <ProkerStatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </DataStateView>
    </div>
  );
}
