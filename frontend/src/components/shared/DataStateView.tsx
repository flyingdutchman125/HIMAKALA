import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FolderOpen,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import type {
  StatusAspirasi,
  StatusPersetujuanAnggaran,
  StatusProker,
} from "@/types/entities";
import type { UIStateSimulation } from "@/services/himakala-store";

interface DataStateViewProps {
  state: UIStateSimulation;
  isEmpty?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  loadingLabel?: string;
  errorLabel?: string;
  onResetState?: () => void;
  children: React.ReactNode;
}

/**
 * R-27: Setiap tampilan data wajib memiliki Empty state, Loading state, dan Error state
 * yang informatif dan dapat ditindaklanjuti (bukan hanya warna atau spinner kosong).
 */
export function DataStateView({
  state,
  isEmpty = false,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  loadingLabel = "Sedang memuat data periode berjalan dari server HIMAKALA...",
  errorLabel = "Gagal mengambil data dari server database. Periksa koneksi jaringan atau muat ulang data.",
  onResetState,
  children,
}: DataStateViewProps) {
  if (state === "loading") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="ink-card bg-white p-8 text-center my-4"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FAD956] ink-border">
          <Loader2 className="h-6 w-6 animate-spin text-[#0B1938]" aria-hidden="true" />
        </div>
        <h2 className="font-display text-lg font-bold text-[#0B1938]">
          Memuat Data...
        </h2>
        <p className="mt-1 text-sm text-[#3B4E73]">{loadingLabel}</p>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 rounded-2xl bg-[#E6EEF8] ink-border p-4 text-left"
            >
              <div className="h-5 w-24 rounded-full bg-[#CBD9EC]" />
              <div className="mt-4 h-4 w-3/4 rounded bg-[#CBD9EC]" />
              <div className="mt-2 h-4 w-1/2 rounded bg-[#CBD9EC]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div
        role="alert"
        className="ink-card bg-[#FEE2E2] p-8 text-center my-4"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white ink-border">
          <AlertTriangle className="h-6 w-6 text-[#0B1938]" aria-hidden="true" />
        </div>
        <h2 className="font-display text-lg font-bold text-[#0B1938]">
          Kendala Pengambilan Data
        </h2>
        <p className="mx-auto mt-1 max-w-lg text-sm text-[#0B1938]">
          {errorLabel}
        </p>
        {onResetState && (
          <button
            type="button"
            onClick={onResetState}
            className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#0B1938] px-5 py-2.5 text-sm font-semibold text-white ink-border hover:bg-[#152852]"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Muat Ulang Data
          </button>
        )}
      </div>
    );
  }

  if (state === "empty" || isEmpty) {
    return (
      <div className="ink-card bg-white p-8 text-center my-4">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#C8ECFA] ink-border">
          <FolderOpen className="h-6 w-6 text-[#0B1938]" aria-hidden="true" />
        </div>
        <h2 className="font-display text-lg font-bold text-[#0B1938]">
          {emptyTitle}
        </h2>
        <p className="mx-auto mt-1 max-w-lg text-sm text-[#3B4E73]">
          {emptyDescription}
        </p>
        {(onEmptyAction || onResetState) && (
          <button
            type="button"
            onClick={onEmptyAction || onResetState}
            className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#026E9C] px-5 py-2.5 text-sm font-semibold text-white ink-border hover:bg-[#01587E]"
          >
            {emptyActionLabel || "Tampilkan Semua Data"}
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Lencana status yang menggabungkan teks eksplisit + ikon (bukan hanya warna, sesuai R-25/C-4).
 */
export function ProkerStatusBadge({ status }: { status: StatusProker }) {
  const config: Record<
    StatusProker,
    { label: string; bg: string; icon: React.ReactNode }
  > = {
    direncanakan: {
      label: "Direncanakan",
      bg: "bg-[#FAD956] text-[#0B1938]",
      icon: <Clock className="h-3.5 w-3.5" aria-hidden="true" />,
    },
    berjalan: {
      label: "Sedang Berjalan",
      bg: "bg-[#C8ECFA] text-[#0B1938]",
      icon: <Loader2 className="h-3.5 w-3.5" aria-hidden="true" />,
    },
    selesai: {
      label: "Selesai",
      bg: "bg-[#CCF2EA] text-[#0B1938]",
      icon: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />,
    },
    batal: {
      label: "Dibatalkan",
      bg: "bg-[#FEE2E2] text-[#0B1938]",
      icon: <XCircle className="h-3.5 w-3.5" aria-hidden="true" />,
    },
  };
  const item = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ink-border ${item.bg}`}
    >
      {item.icon}
      {item.label}
    </span>
  );
}

export function BudgetApprovalBadge({
  status,
}: {
  status: StatusPersetujuanAnggaran;
}) {
  const map: Record<
    StatusPersetujuanAnggaran,
    { label: string; bg: string }
  > = {
    draft: { label: "Draft Bendahara", bg: "bg-[#E6EEF8] text-[#0B1938]" },
    menunggu_persetujuan: {
      label: "Menunggu Persetujuan Ketua",
      bg: "bg-[#FAD956] text-[#0B1938]",
    },
    disetujui: {
      label: "Disetujui Ketua (Publik)",
      bg: "bg-[#CCF2EA] text-[#0B1938]",
    },
    revisi: {
      label: "Perlu Revisi Bendahara",
      bg: "bg-[#FEE2E2] text-[#0B1938]",
    },
  };
  const item = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ink-border ${item.bg}`}
    >
      {item.label}
    </span>
  );
}

export function AspirationStatusBadge({ status }: { status: StatusAspirasi }) {
  const map: Record<StatusAspirasi, { label: string; bg: string }> = {
    diterima: { label: "1. Diterima", bg: "bg-[#FAD956] text-[#0B1938]" },
    diproses: { label: "2. Sedang Diproses", bg: "bg-[#C8ECFA] text-[#0B1938]" },
    selesai: { label: "3. Selesai Ditindaklanjuti", bg: "bg-[#CCF2EA] text-[#0B1938]" },
  };
  const item = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ink-border ${item.bg}`}
    >
      {item.label}
    </span>
  );
}

/**
 * R-23 & R-18: Menggunakan avatar berbasis inisial dengan batas tegas, bukan foto AI fiktif.
 */
export function InitialAvatar({
  name,
  bg = "bg-[#FAD956]",
}: {
  name: string;
  bg?: string;
}) {
  return (
    <span
      title={name}
      aria-hidden="true"
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#0B1938] ink-border ${bg}`}
    >
      {getInitials(name)}
    </span>
  );
}

