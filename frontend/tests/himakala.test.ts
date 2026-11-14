import { describe, expect, it } from "vitest";
import {
  canCrudProkerWithoutPermission,
  formatRupiah,
  generateTrackingCode,
  getInitials,
  getRoleLabel,
} from "../src/lib/utils";
import {
  INITIAL_ASPIRATIONS,
  INITIAL_BUDGETS,
  INITIAL_DIVISIONS,
  INITIAL_DOCUMENTS,
  INITIAL_MEMBERS,
  INITIAL_NEWS,
  INITIAL_PROKER,
} from "../src/data/initial-data";
import { sanitizeAspirationPayload } from "../../backend/functions/submit-aspiration/index";
import { formatPublicTrackingResponse } from "../../backend/functions/track-aspiration/index";
import { filterVerifiedLegacyMembers } from "../../backend/scripts/migrate-legacy-localstorage";

describe("HIMAKALA Dynamic RBAC & 6 Divisions Verification Suite", () => {
  it("memastikan 6 divisi resmi HIMAKALA terdaftar (BPH, Luar Negeri, Dalam Negeri, Media dan Informasi, PSDM, RSTEK)", () => {
    expect(INITIAL_DIVISIONS).toHaveLength(6);
    const slugs = INITIAL_DIVISIONS.map((d) => d.slug);
    expect(slugs).toEqual([
      "bph",
      "luar-negeri",
      "dalam-negeri",
      "medinfo",
      "psdm",
      "rstek",
    ]);
  });

  it("memulai seluruh tabel operasional tanpa data dummy (kosong & dinamis)", () => {
    expect(INITIAL_PROKER).toHaveLength(0);
    expect(INITIAL_BUDGETS).toHaveLength(0);
    expect(INITIAL_DOCUMENTS).toHaveLength(0);
    expect(INITIAL_NEWS).toHaveLength(0);
    expect(INITIAL_MEMBERS).toHaveLength(0);
    expect(INITIAL_ASPIRATIONS).toHaveLength(0);
  });

  it("memvalidasi aturan hak CRUD proker tanpa izin vs atas izin Ketua Divisi", () => {
    // User biasa (Anggota) & Pengurus Divisi tidak bisa CRUD langsung tanpa izin
    expect(canCrudProkerWithoutPermission("anggota")).toBe(false);
    expect(canCrudProkerWithoutPermission("pengurus_divisi")).toBe(false);

    // Ketua Divisi, Sekretaris, Bendahara, dan Ketua HIMAKALA (Ketua BPH) bebas CRUD tanpa izin siapapun
    expect(canCrudProkerWithoutPermission("ketua_divisi")).toBe(true);
    expect(canCrudProkerWithoutPermission("sekretaris")).toBe(true);
    expect(canCrudProkerWithoutPermission("bendahara")).toBe(true);
    expect(canCrudProkerWithoutPermission("ketua_himakala")).toBe(true);
  });

  it("memetakan label peran Anggota dan Kepengurusan dengan benar", () => {
    expect(getRoleLabel("anggota")).toBe("Anggota HIMAKALA");
    expect(getRoleLabel("pengurus_divisi")).toBe("Pengurus Divisi");
    expect(getRoleLabel("ketua_divisi")).toBe("Ketua Divisi");
    expect(getRoleLabel("sekretaris")).toBe("Sekretaris (BPH)");
    expect(getRoleLabel("bendahara")).toBe("Bendahara (BPH)");
    expect(getRoleLabel("ketua_himakala")).toBe("Ketua HIMAKALA (Ketua BPH)");
  });

  it("menghasilkan nomor pelacakan aspirasi berformat ASP-YYYY-XXXX", () => {
    const code = generateTrackingCode(2026);
    expect(code).toMatch(/^ASP-2026-[A-Z0-9]{4}$/);
  });

  it("memformat nominal anggaran ke mata uang Rupiah", () => {
    const formatted = formatRupiah(1500000);
    expect(formatted).toContain("1.500.000");
  });

  it("menghasilkan inisial 2 huruf untuk avatar pengurus", () => {
    expect(getInitials("Ketua HIMAKALA")).toBe("KH");
    expect(getInitials("Sekretaris BPH")).toBe("SB");
  });

  it("menghapus identitas pengirim saat aspirasi dikirim dalam mode anonim", () => {
    const sanitized = sanitizeAspirationPayload({
      kategori: "Internal",
      isi: "Mohon jadwal kegiatan diumumkan lebih awal untuk seluruh anggota.",
      anonim: true,
      nama_pengirim: "Harus Dihapus",
      kontak_opsional: "rahasia@student.pens.ac.id",
    });

    expect(sanitized.anonim).toBe(true);
    expect(sanitized.nama_pengirim).toBeNull();
    expect(sanitized.kontak_opsional).toBeNull();
  });

  it("menyembunyikan kontak pengirim pada respons pelacakan publik", () => {
    const sample = {
      nomor_pelacakan: "ASP-2026-1R7X",
      kategori: "Internal",
      isi: "Usulan kegiatan baru.",
      status: "diterima" as const,
      tanggapan: null,
      tanggal_kirim: "2026-11-15",
      kontak_opsional: "private@student.pens.ac.id",
    };
    const response = formatPublicTrackingResponse(sample);
    expect(response.nomor_pelacakan).toBe("ASP-2026-1R7X");
    expect("kontak_opsional" in response).toBe(false);
  });

  it("menyaring placeholder 'Entitas' saat migrasi localStorage lama", () => {
    const filtered = filterVerifiedLegacyMembers([
      {
        id: "bph",
        name: "BPH",
        description: "Badan Pengurus Harian",
        members: [
          {
            id: "1",
            name: "Krisna Machmud Irfandi",
            role: "Ketua",
            department: "Teknik Informatika",
            instagram: "https://instagram.com",
          },
          {
            id: "2",
            name: "Entitas",
            role: "Bendahara",
            department: "Multimedia Broadcasting",
          },
        ],
      },
    ]);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe("Krisna Machmud Irfandi");
    expect(filtered[0].instagram).toBeNull();
  });
});
