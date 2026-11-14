import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PeranPengguna, WarnaKartuPastel } from "@/types/entities";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(nominal: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(nominal);
}

export function formatTanggal(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getInitials(name: string): string {
  const clean = name.replace(/\[.*?\]/g, "").trim();
  if (!clean) return "HM";
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function generateTrackingCode(year = 2026): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ASP-${year}-${suffix}`;
}

export function getPastelSurfaceClass(warna: WarnaKartuPastel): string {
  switch (warna) {
    case "amber":
      return "bg-[#FAD956] text-[#0B1938]";
    case "lavender":
      return "bg-[#D8E4FC] text-[#0B1938]";
    case "sky":
      return "bg-[#C8ECFA] text-[#0B1938]";
    case "mint":
      return "bg-[#CCF2EA] text-[#0B1938]";
  }
}

export function getRoleLabel(role: PeranPengguna): string {
  const map: Record<PeranPengguna, string> = {
    anggota: "Anggota HIMAKALA",
    pengurus_divisi: "Pengurus Divisi",
    ketua_divisi: "Ketua Divisi",
    sekretaris: "Sekretaris (BPH)",
    bendahara: "Bendahara (BPH)",
    ketua_himakala: "Ketua HIMAKALA (Ketua BPH)",
  };
  return map[role];
}

export function canCrudProkerWithoutPermission(role: PeranPengguna): boolean {
  return (
    role === "ketua_himakala" ||
    role === "sekretaris" ||
    role === "bendahara" ||
    role === "ketua_divisi"
  );
}
