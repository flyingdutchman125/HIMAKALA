import React, { useState } from "react";
import { Copy, Search } from "lucide-react";
import { AspirationStatusBadge } from "@/components/shared/DataStateView";
import { formatTanggal } from "@/lib/utils";
import { useHimakalaStore } from "@/services/himakala-store";
import type { Aspirasi } from "@/types/entities";

export function AspirationPage() {
  const { aspirations, submitAspiration } = useHimakalaStore();

  const [kategori, setKategori] = useState("Akademik & Organisasi");
  const [isi, setIsi] = useState("");
  const [anonim, setAnonim] = useState(true);
  const [namaPengirim, setNamaPengirim] = useState("");
  const [formError, setFormError] = useState("");
  const [createdTicket, setCreatedTicket] = useState<Aspirasi | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const [trackingInput, setTrackingInput] = useState("ASP-2026-4K9M");
  const [trackedResult, setTrackedResult] = useState<Aspirasi | null>(
    aspirations[0] || null
  );

  function handleSubmitAspiration(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (isi.trim().length < 15) {
      setFormError("Isi aspirasi minimal 15 karakter.");
      return;
    }
    const created = submitAspiration({
      kategori,
      isi,
      anonim,
      nama_pengirim: anonim ? undefined : namaPengirim,
    });
    setCreatedTicket(created);
    setTrackingInput(created.nomor_pelacakan);
    setTrackedResult(created);
    setIsi("");
  }

  function handleSearchTicket(e: React.FormEvent) {
    e.preventDefault();
    const found = aspirations.find(
      (a) =>
        a.nomor_pelacakan.toUpperCase() === trackingInput.trim().toUpperCase()
    );
    setTrackedResult(found || null);
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-[#0B1938]">
        Aspirasi mahasiswa
      </h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Kiri (7/12): Form Kirim Aspirasi */}
        <section
          aria-labelledby="heading-kirim-aspirasi"
          className="ink-card bg-white p-6 lg:col-span-7"
        >
          <div className="flex items-center justify-between">
            <h2
              id="heading-kirim-aspirasi"
              className="font-display text-lg font-bold text-[#0B1938]"
            >
              Kirim aspirasi
            </h2>
            <label
              htmlFor="toggle-anonim"
              className="inline-flex items-center gap-2 rounded-full bg-[#FAD956] px-3 py-1 text-xs font-bold text-[#0B1938] ink-border"
            >
              <input
                id="toggle-anonim"
                type="checkbox"
                checked={anonim}
                onChange={(e) => setAnonim(e.target.checked)}
                className="h-4 w-4 accent-[#0B1938]"
              />
              <span>Mode Anonim</span>
            </label>
          </div>

          <form onSubmit={handleSubmitAspiration} className="mt-4 space-y-3.5">
            {!anonim && (
              <div>
                <label
                  htmlFor="asp-nama"
                  className="block text-xs font-bold text-[#0B1938]"
                >
                  Nama Pengirim
                </label>
                <input
                  id="asp-nama"
                  type="text"
                  value={namaPengirim}
                  onChange={(e) => setNamaPengirim(e.target.value)}
                  placeholder="Nama Anda"
                  className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3.5 py-2 text-xs text-[#0B1938] ink-border"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="asp-kategori"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Kategori
              </label>
              <select
                id="asp-kategori"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3.5 py-2 text-xs font-bold text-[#0B1938] ink-border"
              >
                <option value="Akademik & Organisasi">
                  Akademik &amp; Organisasi
                </option>
                <option value="Transparansi Keuangan">
                  Transparansi Keuangan
                </option>
                <option value="Fasilitas & Kegiatan">
                  Fasilitas &amp; Kegiatan
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="asp-isi"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Pesan Aspirasi
              </label>
              <textarea
                id="asp-isi"
                rows={3}
                value={isi}
                onChange={(e) => setIsi(e.target.value)}
                placeholder="Tuliskan saran atau masukan Anda..."
                className="mt-1 w-full rounded-xl bg-[#F5F8FC] p-3 text-xs text-[#0B1938] ink-border"
              />
            </div>

            {formError && (
              <p
                role="alert"
                className="rounded-xl bg-[#FEE2E2] p-2.5 text-xs font-bold text-[#0B1938]"
              >
                {formError}
              </p>
            )}

            <button
              type="submit"
              className="w-full min-h-[42px] rounded-xl bg-[#026E9C] px-4 py-2 text-xs font-bold text-white ink-border hover:bg-[#01587E]"
            >
              Kirim Aspirasi
            </button>
          </form>

          {createdTicket && (
            <div
              role="status"
              className="mt-4 flex items-center justify-between rounded-xl bg-[#CCF2EA] p-3 ink-border"
            >
              <span className="font-display text-sm font-bold text-[#0B1938]">
                Kode Tiket: {createdTicket.nomor_pelacakan}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(createdTicket.nomor_pelacakan);
                  setCopiedCode(true);
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-[#0B1938] ink-border"
              >
                <Copy className="h-3 w-3" aria-hidden="true" />
                {copiedCode ? "Tersalin" : "Salin"}
              </button>
            </div>
          )}
        </section>

        {/* Kanan (5/12): Lacak Status Tiket */}
        <section
          aria-labelledby="heading-lacak-tiket"
          className="ink-card bg-[#0B1938] p-6 text-white lg:col-span-5"
        >
          <h2
            id="heading-lacak-tiket"
            className="font-display text-lg font-bold text-white"
          >
            Lacak nomor tiket
          </h2>

          <form onSubmit={handleSearchTicket} className="mt-3 flex gap-2">
            <label htmlFor="input-nomor-tiket" className="sr-only">
              Nomor Tiket
            </label>
            <input
              id="input-nomor-tiket"
              type="text"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              placeholder="ASP-2026-4K9M"
              className="flex-1 min-h-[40px] rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
            />
            <button
              type="submit"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#026E9C] px-3.5 py-1.5 text-xs font-bold text-white ink-border hover:bg-[#01587E]"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              Cek
            </button>
          </form>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {aspirations.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTrackingInput(item.nomor_pelacakan);
                  setTrackedResult(item);
                }}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  trackedResult?.id === item.id
                    ? "bg-[#FAD956] text-[#0B1938]"
                    : "bg-[#152852] text-[#B8CBE8]"
                }`}
              >
                {item.nomor_pelacakan}
              </button>
            ))}
          </div>

          {trackedResult ? (
            <div className="mt-4 rounded-2xl bg-white p-4 text-[#0B1938] ink-border">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm font-bold">
                  {trackedResult.nomor_pelacakan}
                </span>
                <AspirationStatusBadge status={trackedResult.status} />
              </div>
              <p className="mt-2 text-xs text-[#0B1938]">{trackedResult.isi}</p>
              <div className="mt-3 rounded-xl bg-[#CCF2EA] p-2.5 text-xs font-medium ink-border">
                <strong>Balasan:</strong>{" "}
                {trackedResult.tanggapan ||
                  `Diterima (${formatTanggal(trackedResult.tanggal_kirim)}), sedang ditinjau pengurus.`}
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-[#FEE2E2] p-3 text-xs font-bold text-[#0B1938]">
              Tiket tidak ditemukan.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
