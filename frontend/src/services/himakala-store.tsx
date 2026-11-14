import React, { createContext, useContext, useEffect, useState } from "react";
import {
  INITIAL_ACTIVITY_LOGS,
  INITIAL_ASPIRATIONS,
  INITIAL_BUDGETS,
  INITIAL_DIVISIONS,
  INITIAL_DOCUMENTS,
  INITIAL_GALLERY,
  INITIAL_MEMBERS,
  INITIAL_NEWS,
  INITIAL_PERIODS,
  INITIAL_PROKER,
  INITIAL_REGISTRATIONS,
  INITIAL_USERS,
} from "@/data/initial-data";
import {
  canCrudProkerWithoutPermission,
  canManageMembersAndPengurus,
  detectProdiFromEmail,
  formatNameFromCampusEmail,
  generateTrackingCode,
  isValidNoWa,
  isValidNrp,
  isValidStudentPensEmail,
} from "@/lib/utils";
import { isSupabaseConfigured, supabase } from "@/services/supabase-client";
import type {
  Anggaran,
  Aspirasi,
  Berita,
  Divisi,
  DivisiSlug,
  Dokumen,
  Galeri,
  KategoriDokumen,
  LogAktivitas,
  Pendaftaran,
  Pengguna,
  Pengurus,
  PeranPengguna,
  Periode,
  ProdiLamongan,
  Proker,
  StatusAspirasi,
  StatusPersetujuanAnggaran,
  StatusProker,
  VisibilitasDokumen,
} from "@/types/entities";

export type UIStateSimulation = "normal" | "loading" | "empty" | "error";

const STORAGE_KEY = "himakala_portal_state_v2_dynamic";

interface StoredPortalState {
  users: Pengguna[];
  members: Pengurus[];
  prokers: Proker[];
  budgets: Anggaran[];
  documents: Dokumen[];
  newsList: Berita[];
  gallery: Galeri[];
  aspirations: Aspirasi[];
  registrations: Pendaftaran[];
  activityLogs: LogAktivitas[];
  currentUser: Pengguna | null;
}

function loadStoredState(): Partial<StoredPortalState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<StoredPortalState>;
  } catch {
    return {};
  }
}

interface HimakalaStoreContextValue {
  periods: Periode[];
  selectedPeriodId: string;
  setSelectedPeriodId: (id: string) => void;
  activePeriod: Periode;
  divisions: Divisi[];
  members: Pengurus[];
  prokers: Proker[];
  budgets: Anggaran[];
  documents: Dokumen[];
  newsList: Berita[];
  gallery: Galeri[];
  aspirations: Aspirasi[];
  registrations: Pendaftaran[];
  users: Pengguna[];
  activityLogs: LogAktivitas[];

  searchQuery: string;
  setSearchQuery: (q: string) => void;
  uiState: UIStateSimulation;
  setUiState: (state: UIStateSimulation) => void;

  // Status Supabase
  isCloudConnected: boolean;

  // Sesi Autentikasi User Biasa vs Kepengurusan 6 Divisi (Berdasarkan Enum Database)
  currentUser: Pengguna | null;
  isKepengurusan: boolean;
  canManageMembership: boolean;
  currentDivision: Divisi | null;
  loginWithCredentials: (
    identifier: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string; user?: Pengguna }>;
  registerMemberAccount: (payload: {
    nama?: string;
    nrp: string;
    no_wa: string;
    email: string;
    password: string;
    confirmPassword: string;
    prodi?: ProdiLamongan;
    autoLogin?: boolean;
  }) => Promise<{ ok: boolean; error?: string; user?: Pengguna }>;
  appointMemberAsPengurus: (payload: {
    userId: string;
    peran: Exclude<PeranPengguna, "anggota">;
    id_divisi: string;
    jabatan: string;
    prodi?: ProdiLamongan;
  }) => Promise<{ ok: boolean; error?: string }>;
  toggleMemberActiveStatus: (
    userId: string
  ) => Promise<{ ok: boolean; error?: string }>;
  loginAsUser: (userId: string) => void;
  loginCustom: (nama: string, peran: PeranPengguna, divisiSlug?: DivisiSlug) => void;
  logout: () => void;
  resetAllDynamicData: () => void;
  createUserAccount: (payload: {
    nama: string;
    nrp?: string;
    no_wa?: string;
    email: string;
    password: string;
    confirmPassword?: string;
    peran: PeranPengguna;
    id_divisi: string | null;
  }) => Promise<{ ok: boolean; error?: string }>;
  deleteUserAccount: (userId: string) => Promise<void>;

  // Aksi Publik / Anggota
  submitAspiration: (payload: {
    kategori: string;
    isi: string;
    anonim: boolean;
    nama_pengirim?: string;
    kontak_opsional?: string;
  }) => Aspirasi;
  registerForProker: (payload: {
    id_proker: string;
    nama: string;
    nrp: string;
    prodi: ProdiLamongan;
    peran_dipilih: "Peserta" | "Panitia";
    kontak: string;
    alasan: string;
  }) => Pendaftaran;

  // CRUD Proker (Otomatis cek tanpa izin vs butuh izin Ketua Divisi)
  createProker: (payload: {
    judul: string;
    deskripsi: string;
    tujuan: string;
    target_peserta: string;
    id_divisi: string;
    pic: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    status: StatusProker;
    progres: number;
  }) => Promise<void> | void;
  updateProker: (
    id: string,
    payload: {
      judul: string;
      deskripsi: string;
      pic: string;
      status: StatusProker;
      progres: number;
    }
  ) => Promise<void> | void;
  updateProkerProgress: (id: string, status: StatusProker, progres: number) => Promise<void> | void;
  deleteProker: (id: string) => Promise<void> | void;
  approveProkerPermission: (prokerId: string) => Promise<void> | void;
  rejectProkerPermission: (prokerId: string) => Promise<void> | void;

  // CRUD Modul Divisi Lainnya
  upsertBudgetByTreasurer: (payload: {
    id_proker: string;
    rencana: number;
    realisasi: number;
    keterangan: string;
  }) => Promise<void> | void;
  deleteBudget: (budgetId: string) => Promise<void> | void;
  decideBudgetByChairman: (
    budgetId: string,
    decision: Extract<StatusPersetujuanAnggaran, "disetujui" | "revisi">,
    catatan: string
  ) => Promise<void> | void;
  uploadDocument: (payload: {
    judul: string;
    kategori: KategoriDokumen;
    nomor_dokumen: string;
    ringkasan: string;
    visibilitas: VisibilitasDokumen;
  }) => Promise<void> | void;
  deleteDocument: (docId: string) => Promise<void> | void;
  toggleDocumentVisibility: (docId: string) => Promise<void> | void;
  respondToAspiration: (
    aspirationId: string,
    status: StatusAspirasi,
    tanggapan: string
  ) => Promise<void> | void;
  deleteAspiration: (aspirationId: string) => Promise<void> | void;
  createNewsArticle: (payload: {
    judul: string;
    ringkasan: string;
    isi: string;
    kategori: Berita["kategori"];
  }) => Promise<void> | void;
  deleteNewsArticle: (newsId: string) => Promise<void> | void;
  addMember: (payload: {
    nama: string;
    jabatan: string;
    prodi: ProdiLamongan;
    id_divisi: string;
  }) => Promise<void> | void;
  deleteMember: (memberId: string) => Promise<void> | void;
}

const HimakalaStoreContext = createContext<HimakalaStoreContextValue | null>(null);

export function HimakalaStoreProvider({ children }: { children: React.ReactNode }) {
  const initialStored = loadStoredState();

  const [periods, setPeriods] = useState<Periode[]>(INITIAL_PERIODS);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("periode-2026-2027");
  const [divisions, setDivisions] = useState<Divisi[]>(INITIAL_DIVISIONS);
  const [members, setMembers] = useState<Pengurus[]>(
    initialStored.members ?? INITIAL_MEMBERS
  );
  const [prokers, setProkers] = useState<Proker[]>(
    initialStored.prokers ?? INITIAL_PROKER
  );
  const [budgets, setBudgets] = useState<Anggaran[]>(
    initialStored.budgets ?? INITIAL_BUDGETS
  );
  const [documents, setDocuments] = useState<Dokumen[]>(
    initialStored.documents ?? INITIAL_DOCUMENTS
  );
  const [newsList, setNewsList] = useState<Berita[]>(
    initialStored.newsList ?? INITIAL_NEWS
  );
  const [gallery, setGallery] = useState<Galeri[]>(
    initialStored.gallery ?? INITIAL_GALLERY
  );
  const [aspirations, setAspirations] = useState<Aspirasi[]>(
    initialStored.aspirations ?? INITIAL_ASPIRATIONS
  );
  const [registrations, setRegistrations] = useState<Pendaftaran[]>(
    initialStored.registrations ?? INITIAL_REGISTRATIONS
  );
  const [users, setUsers] = useState<Pengguna[]>(
    initialStored.users && initialStored.users.length > 0
      ? initialStored.users
      : INITIAL_USERS
  );
  const [activityLogs, setActivityLogs] = useState<LogAktivitas[]>(
    initialStored.activityLogs ?? INITIAL_ACTIVITY_LOGS
  );

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [uiState, setUiState] = useState<UIStateSimulation>("normal");
  const [currentUser, setCurrentUser] = useState<Pengguna | null>(
    initialStored.currentUser ?? null
  );

  // Sinkronisasi data awal dari Supabase jika koneksi aktif
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    async function fetchFromSupabase() {
      try {
        const [
          divsRes,
          periodsRes,
          prokersRes,
          budgetsRes,
          docsRes,
          newsRes,
          memsRes,
          aspsRes,
          usersRes,
        ] = await Promise.all([
          supabase!.from("divisi").select("*"),
          supabase!.from("periode").select("*"),
          supabase!.from("proker").select("*"),
          supabase!.from("anggaran").select("*"),
          supabase!.from("dokumen").select("*"),
          supabase!.from("berita").select("*"),
          supabase!.from("pengurus").select("*"),
          supabase!.from("aspirasi").select("*"),
          supabase!.from("pengguna").select("*"),
        ]);

        const loadedDivs =
          divsRes.data && divsRes.data.length > 0
            ? (divsRes.data as Divisi[])
            : INITIAL_DIVISIONS;

        if (divsRes.data && divsRes.data.length > 0) {
          setDivisions(loadedDivs);
        }
        if (periodsRes.data && periodsRes.data.length > 0) {
          setPeriods(periodsRes.data as Periode[]);
          const active = periodsRes.data.find((p) => p.status_aktif);
          if (active) setSelectedPeriodId(active.id);
        }
        if (prokersRes.data) setProkers(prokersRes.data as Proker[]);
        if (budgetsRes.data) setBudgets(budgetsRes.data as Anggaran[]);
        if (docsRes.data) setDocuments(docsRes.data as Dokumen[]);
        if (newsRes.data) setNewsList(newsRes.data as Berita[]);
        if (memsRes.data) setMembers(memsRes.data as Pengurus[]);
        if (aspsRes.data) setAspirations(aspsRes.data as Aspirasi[]);
        if (usersRes.data && usersRes.data.length > 0) {
          const mappedUsers: Pengguna[] = usersRes.data.map((u: Record<string, unknown>) => {
            const matchedDiv = loadedDivs.find((d) => d.id === u.id_divisi);
            const role = (u.peran as PeranPengguna) || "anggota";
            const fallbackSlug: DivisiSlug | undefined =
              role === "ketua_himakala" || role === "sekretaris" || role === "bendahara"
                ? "bph"
                : matchedDiv?.slug;
            const emailStr = String(u.email || "");
            return {
              id: String(u.id),
              nrp: u.nrp ? String(u.nrp) : undefined,
              no_wa: u.no_wa ? String(u.no_wa) : undefined,
              prodi: (u.prodi as ProdiLamongan) || detectProdiFromEmail(emailStr),
              nama: String(u.nama || formatNameFromCampusEmail(emailStr)),
              email: emailStr,
              password: u.password ? String(u.password) : "himakala123",
              peran: role,
              id_divisi: u.id_divisi ? String(u.id_divisi) : null,
              divisi_slug: matchedDiv?.slug || fallbackSlug,
              status: u.status_aktif === false ? "nonaktif" : "aktif",
            };
          });
          setUsers(mappedUsers);
        }
      } catch (err) {
        console.warn("Gagal memuat data dari Supabase, fallback ke state lokal:", err);
      }
    }

    fetchFromSupabase();
  }, []);

  // Simpan ke localStorage sebagai cache offline
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stateToSave: StoredPortalState = {
      users,
      members,
      prokers,
      budgets,
      documents,
      newsList,
      gallery,
      aspirations,
      registrations,
      activityLogs,
      currentUser,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [
    users,
    members,
    prokers,
    budgets,
    documents,
    newsList,
    gallery,
    aspirations,
    registrations,
    activityLogs,
    currentUser,
  ]);

  const activePeriod =
    periods.find((p) => p.id === selectedPeriodId) || periods[0];

  const isKepengurusan =
    currentUser !== null && currentUser.peran !== "anggota";

  const canManageMembership = canManageMembersAndPengurus(currentUser?.peran);

  const currentDivision =
    divisions.find((d) => d.slug === currentUser?.divisi_slug || d.id === currentUser?.divisi_slug) || null;

  function todayStr(): string {
    return new Date().toISOString().slice(0, 10);
  }

  function appendLog(aksi: string, objek: string, actor = currentUser) {
    const user = actor || {
      id: "usr-anggota",
      nama: "Anggota HIMAKALA",
      peran: "anggota" as PeranPengguna,
    };
    const now = new Date();
    const waktu = `${now.toISOString().slice(0, 10)} ${now
      .toTimeString()
      .slice(0, 5)}`;
    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        id_pengguna: user.id,
        nama_pengguna: user.nama,
        peran_pengguna: user.peran,
        aksi,
        objek,
        waktu,
      },
      ...prev,
    ]);
  }

  async function loginWithCredentials(
    identifier: string,
    password: string
  ): Promise<{ ok: boolean; error?: string; user?: Pengguna }> {
    const cleanInput = identifier.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanInput || !cleanPassword) {
      return { ok: false, error: "Email / NRP dan password wajib diisi." };
    }

    // 1. Cek langsung dari tabel `public.pengguna` di Supabase (berdasarkan email atau NRP)
    if (isSupabaseConfigured && supabase) {
      try {
        const isEmail = cleanInput.includes("@");
        const query = isEmail
          ? supabase.from("pengguna").select("*").ilike("email", cleanInput).maybeSingle()
          : supabase.from("pengguna").select("*").eq("nrp", cleanInput).maybeSingle();

        const { data: dbUser } = await query;

        if (dbUser) {
          const dbPass = dbUser.password ? String(dbUser.password) : "himakala123";
          if (dbPass !== cleanPassword) {
            return { ok: false, error: "Password yang dimasukkan salah." };
          }
          if (dbUser.status_aktif === false) {
            return {
              ok: false,
              error: "Akun anggota ini berstatus nonaktif. Hubungi Ketua atau Sekretaris HIMAKALA.",
            };
          }

          const role = (dbUser.peran as PeranPengguna) || "anggota";
          const matchedDiv = divisions.find((d) => d.id === dbUser.id_divisi);
          const resolvedSlug: DivisiSlug | undefined =
            matchedDiv?.slug ||
            (role === "ketua_himakala" ||
            role === "sekretaris" ||
            role === "bendahara"
              ? "bph"
              : undefined);

          const emailStr = String(dbUser.email || cleanInput);
          const loggedUser: Pengguna = {
            id: String(dbUser.id),
            nrp: dbUser.nrp ? String(dbUser.nrp) : undefined,
            no_wa: dbUser.no_wa ? String(dbUser.no_wa) : undefined,
            prodi: (dbUser.prodi as ProdiLamongan) || detectProdiFromEmail(emailStr),
            nama: String(dbUser.nama || formatNameFromCampusEmail(emailStr)),
            email: emailStr,
            peran: role,
            id_divisi: dbUser.id_divisi ? String(dbUser.id_divisi) : null,
            divisi_slug: resolvedSlug,
            status: "aktif",
          };

          setCurrentUser(loggedUser);
          appendLog(
            `Login sebagai ${loggedUser.nama} (${loggedUser.peran})`,
            `divisi: ${resolvedSlug || "anggota"}`,
            loggedUser
          );
          return { ok: true, user: loggedUser };
        }
      } catch (err) {
        console.warn("Pengecekan tabel pengguna Supabase gagal, cek daftar akun:", err);
      }
    }

    // 2. Fallback cek dari daftar pengguna berdasarkan email atau NRP
    const matchedLocal = users.find(
      (u) =>
        u.email.toLowerCase() === cleanInput ||
        (u.nrp && u.nrp.toLowerCase() === cleanInput)
    );
    if (!matchedLocal) {
      return {
        ok: false,
        error: "Email atau NRP belum terdaftar. Silakan registrasi terlebih dahulu jika Anda anggota.",
      };
    }

    if (matchedLocal.status === "nonaktif") {
      return {
        ok: false,
        error: "Status keanggotaan Anda sedang nonaktif. Hubungi Ketua atau Sekretaris HIMAKALA.",
      };
    }

    const expectedPass = matchedLocal.password || "himakala123";
    if (expectedPass !== cleanPassword) {
      return { ok: false, error: "Password yang dimasukkan salah." };
    }

    setCurrentUser(matchedLocal);
    appendLog(
      `Login sebagai ${matchedLocal.nama} (${matchedLocal.peran})`,
      `divisi: ${matchedLocal.divisi_slug || "anggota"}`,
      matchedLocal
    );
    return { ok: true, user: matchedLocal };
  }

  /**
   * Registrasi Anggota Biasa HIMAKALA (NRP, No. WA, Email Kampus @...student.pens.ac.id, Password 2 kali)
   * Dapat digunakan oleh mahasiswa secara mandiri (autoLogin = true) maupun oleh Ketua / Sekretaris (autoLogin = false).
   */
  async function registerMemberAccount(payload: {
    nama?: string;
    nrp: string;
    no_wa: string;
    email: string;
    password: string;
    confirmPassword: string;
    prodi?: ProdiLamongan;
    autoLogin?: boolean;
  }): Promise<{ ok: boolean; error?: string; user?: Pengguna }> {
    const cleanNrp = payload.nrp.trim();
    const cleanWa = payload.no_wa.replace(/[\s-]/g, "").trim();
    const cleanEmail = payload.email.trim().toLowerCase();
    const pass1 = payload.password.trim();
    const pass2 = payload.confirmPassword.trim();

    // Jika dipanggil dari panel admin (autoLogin === false), pastikan hanya Ketua atau Sekretaris yang boleh menambah anggota
    if (payload.autoLogin === false && !canManageMembersAndPengurus(currentUser?.peran)) {
      return {
        ok: false,
        error: "Hanya Ketua HIMAKALA dan Sekretaris yang dapat menambahkan anggota.",
      };
    }

    if (!isValidNrp(cleanNrp)) {
      return {
        ok: false,
        error: "NRP wajib berupa angka 8 hingga 14 digit (contoh: 3125500001).",
      };
    }

    if (!isValidNoWa(cleanWa)) {
      return {
        ok: false,
        error: "Nomor WhatsApp tidak valid (contoh: 081234567890).",
      };
    }

    if (!isValidStudentPensEmail(cleanEmail)) {
      return {
        ok: false,
        error:
          "Wajib menggunakan email kampus mahasiswa PENS (contoh: mozakiibrahim@it.student.pens.ac.id).",
      };
    }

    if (pass1.length < 6) {
      return {
        ok: false,
        error: "Password minimal terdiri dari 6 karakter.",
      };
    }

    if (pass1 !== pass2) {
      return {
        ok: false,
        error: "Konfirmasi password (input password ke-2) tidak sama.",
      };
    }

    const duplicateEmail = users.some(
      (u) => u.email.toLowerCase() === cleanEmail
    );
    if (duplicateEmail) {
      return {
        ok: false,
        error: "Email kampus tersebut sudah terdaftar sebagai anggota.",
      };
    }

    const duplicateNrp = users.some((u) => u.nrp === cleanNrp);
    if (duplicateNrp) {
      return {
        ok: false,
        error: "NRP tersebut sudah terdaftar sebagai anggota.",
      };
    }

    const resolvedNama =
      payload.nama && payload.nama.trim().length >= 2
        ? payload.nama.trim()
        : formatNameFromCampusEmail(cleanEmail);
    const resolvedProdi = payload.prodi || detectProdiFromEmail(cleanEmail);

    const newMember: Pengguna = {
      id: `usr-${Date.now()}`,
      nrp: cleanNrp,
      no_wa: cleanWa,
      prodi: resolvedProdi,
      nama: resolvedNama,
      email: cleanEmail,
      password: pass1,
      peran: "anggota",
      id_divisi: null,
      divisi_slug: undefined,
      status: "aktif",
    };

    setUsers((prev) => [newMember, ...prev]);
    appendLog(
      `Registrasi Anggota Aktif HIMAKALA: ${newMember.nama} (${newMember.nrp})`,
      `anggota: ${newMember.email}`,
      payload.autoLogin === false ? currentUser : newMember
    );

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from("pengguna")
          .insert([
            {
              nama: newMember.nama,
              nrp: newMember.nrp,
              no_wa: newMember.no_wa,
              prodi: newMember.prodi,
              email: newMember.email,
              password: newMember.password,
              peran: "anggota",
              id_divisi: null,
              status_aktif: true,
            },
          ])
          .select("*")
          .maybeSingle();

        if (data?.id) {
          newMember.id = String(data.id);
          setUsers((prev) =>
            prev.map((u) => (u.email === newMember.email ? { ...u, id: String(data.id) } : u))
          );
        }
      } catch (err) {
        console.warn("Insert registrasi anggota ke Supabase fallback ke kolom dasar:", err);
        await supabase
          .from("pengguna")
          .insert([
            {
              nama: newMember.nama,
              email: newMember.email,
              password: newMember.password,
              peran: "anggota",
              id_divisi: null,
              status_aktif: true,
            },
          ]);
      }
    }

    if (payload.autoLogin !== false) {
      setCurrentUser(newMember);
    }

    return { ok: true, user: newMember };
  }

  /**
   * Mengangkat Anggota Aktif HIMAKALA menjadi Pengurus HIMAKALA.
   * Syarat mutlak:
   * 1. Hanya Ketua HIMAKALA (`ketua_himakala`) dan Sekretaris (`sekretaris`) yang berhak mengangkat pengurus.
   * 2. Calon pengurus wajib terdaftar sebagai Anggota Aktif HIMAKALA (`status === "aktif"`).
   */
  async function appointMemberAsPengurus(payload: {
    userId: string;
    peran: Exclude<PeranPengguna, "anggota">;
    id_divisi: string;
    jabatan: string;
    prodi?: ProdiLamongan;
  }): Promise<{ ok: boolean; error?: string }> {
    if (!canManageMembersAndPengurus(currentUser?.peran)) {
      return {
        ok: false,
        error: "Hanya Ketua HIMAKALA dan Sekretaris yang dapat mengangkat pengurus.",
      };
    }

    const candidate = users.find((u) => u.id === payload.userId);
    if (!candidate) {
      return {
        ok: false,
        error: "Calon pengurus tidak ditemukan di daftar Anggota HIMAKALA.",
      };
    }

    if (candidate.status !== "aktif") {
      return {
        ok: false,
        error:
          "Syarat menjadi pengurus HIMAKALA adalah harus berstatus Anggota Aktif HIMAKALA terlebih dahulu.",
      };
    }

    const matchedDiv =
      divisions.find((d) => d.id === payload.id_divisi) || divisions[0];
    const resolvedSlug: DivisiSlug =
      payload.peran === "ketua_himakala" ||
      payload.peran === "sekretaris" ||
      payload.peran === "bendahara"
        ? "bph"
        : matchedDiv?.slug || "bph";
    const resolvedDivId =
      divisions.find((d) => d.slug === resolvedSlug)?.id || payload.id_divisi;
    const resolvedProdi =
      payload.prodi || candidate.prodi || detectProdiFromEmail(candidate.email);
    const resolvedJabatan = payload.jabatan.trim() || "Pengurus Divisi";

    // 1. Perbarui role (`peran_pengguna`) & divisi pada akun anggota aktif
    setUsers((prev) =>
      prev.map((u) =>
        u.id === candidate.id
          ? {
              ...u,
              peran: payload.peran,
              id_divisi: resolvedDivId,
              divisi_slug: resolvedSlug,
              prodi: resolvedProdi,
            }
          : u
      )
    );

    // 2. Tambahkan atau perbarui pada daftar struktur Pengurus 6 Divisi (`public.pengurus`)
    const existingPengurus = members.find(
      (m) =>
        m.id_pengguna === candidate.id ||
        (candidate.nrp && m.nrp === candidate.nrp) ||
        m.nama.toLowerCase() === candidate.nama.toLowerCase()
    );

    if (existingPengurus) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === existingPengurus.id
            ? {
                ...m,
                id_pengguna: candidate.id,
                nrp: candidate.nrp,
                email: candidate.email,
                no_wa: candidate.no_wa,
                nama: candidate.nama,
                jabatan: resolvedJabatan,
                prodi: resolvedProdi,
                id_divisi: resolvedDivId,
              }
            : m
        )
      );
    } else {
      const createdPengurus: Pengurus = {
        id: `mem-${Date.now()}`,
        id_pengguna: candidate.id,
        nrp: candidate.nrp,
        email: candidate.email,
        no_wa: candidate.no_wa,
        nama: candidate.nama,
        jabatan: resolvedJabatan,
        prodi: resolvedProdi,
        id_divisi: resolvedDivId,
        status_verifikasi: true,
        id_periode: selectedPeriodId,
      };
      setMembers((prev) => [...prev, createdPengurus]);

      if (isSupabaseConfigured && supabase) {
        supabase
          .from("pengurus")
          .insert([
            {
              nama: createdPengurus.nama,
              jabatan: createdPengurus.jabatan,
              prodi: createdPengurus.prodi,
              id_divisi: createdPengurus.id_divisi,
              id_periode: createdPengurus.id_periode,
              status_verifikasi: true,
            },
          ])
          .then();
      }
    }

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("pengguna")
        .update({
          peran: payload.peran,
          id_divisi: resolvedDivId,
        })
        .eq("email", candidate.email);
    }

    appendLog(
      `Mengangkat Anggota Aktif ${candidate.nama} (${candidate.nrp || candidate.email}) menjadi ${resolvedJabatan}`,
      `pengurus: ${candidate.email}`
    );

    return { ok: true };
  }

  /**
   * Mengubah status keanggotaan (Aktif <-> Nonaktif) oleh Ketua HIMAKALA atau Sekretaris.
   * Jika anggota dinonaktifkan, jabatan kepengurusannya otomatis dicabut karena syarat pengurus adalah Anggota Aktif.
   */
  async function toggleMemberActiveStatus(
    userId: string
  ): Promise<{ ok: boolean; error?: string }> {
    if (!canManageMembersAndPengurus(currentUser?.peran)) {
      return {
        ok: false,
        error: "Hanya Ketua HIMAKALA dan Sekretaris yang dapat mengubah status keanggotaan.",
      };
    }

    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { ok: false, error: "Data anggota tidak ditemukan." };
    }

    const nextStatus = target.status === "aktif" ? "nonaktif" : "aktif";

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: nextStatus,
              // Bila tidak lagi menjadi anggota aktif, otomatis kembali menjadi anggota biasa
              peran: nextStatus === "nonaktif" ? "anggota" : u.peran,
              id_divisi: nextStatus === "nonaktif" ? null : u.id_divisi,
              divisi_slug: nextStatus === "nonaktif" ? undefined : u.divisi_slug,
            }
          : u
      )
    );

    if (nextStatus === "nonaktif") {
      setMembers((prev) =>
        prev.filter(
          (m) =>
            m.id_pengguna !== userId &&
            m.nama.toLowerCase() !== target.nama.toLowerCase()
        )
      );
    }

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("pengguna")
        .update({
          status_aktif: nextStatus === "aktif",
          ...(nextStatus === "nonaktif" ? { peran: "anggota", id_divisi: null } : {}),
        })
        .eq("email", target.email);
    }

    appendLog(
      `Mengubah status keanggotaan ${target.nama} menjadi ${nextStatus.toUpperCase()}`,
      `anggota: ${target.email}`
    );

    return { ok: true };
  }

  async function createUserAccount(payload: {
    nama: string;
    nrp?: string;
    no_wa?: string;
    email: string;
    password: string;
    confirmPassword?: string;
    peran: PeranPengguna;
    id_divisi: string | null;
  }): Promise<{ ok: boolean; error?: string }> {
    if (!canManageMembersAndPengurus(currentUser?.peran)) {
      return {
        ok: false,
        error: "Hanya Ketua HIMAKALA dan Sekretaris yang dapat menambah anggota.",
      };
    }

    return registerMemberAccount({
      nama: payload.nama,
      nrp: payload.nrp || "",
      no_wa: payload.no_wa || "",
      email: payload.email,
      password: payload.password,
      confirmPassword: payload.confirmPassword ?? payload.password,
      autoLogin: false,
    });
  }

  async function deleteUserAccount(userId: string) {
    if (!canManageMembersAndPengurus(currentUser?.peran)) return;
    const target = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (target) {
      setMembers((prev) =>
        prev.filter(
          (m) =>
            m.id_pengguna !== userId &&
            m.nama.toLowerCase() !== target.nama.toLowerCase()
        )
      );
    }
    appendLog("Menghapus akun anggota", `pengguna: ${userId}`);
    if (isSupabaseConfigured && supabase) {
      await supabase.from("pengguna").delete().eq("id", userId);
    }
  }

  function loginAsUser(userId: string) {
    const found = users.find((u) => u.id === userId);
    if (!found || found.peran === "anggota") {
      setCurrentUser(null);
      return;
    }
    setCurrentUser(found);
    appendLog(
      `Login kepengurusan sebagai ${found.nama}`,
      `divisi: ${found.divisi_slug || "bph"}`,
      found
    );
  }

  function loginCustom(
    nama: string,
    peran: PeranPengguna,
    divisiSlug?: DivisiSlug
  ) {
    if (peran === "anggota") {
      setCurrentUser(null);
      return;
    }
    const effectiveDivisi: DivisiSlug =
      peran === "ketua_himakala" || peran === "sekretaris" || peran === "bendahara"
        ? "bph"
        : divisiSlug || "luar-negeri";

    const customUser: Pengguna = {
      id: `usr-${Date.now()}`,
      nama: nama.trim() || "Pengurus HIMAKALA",
      email: `${peran}@himakala.pens.ac.id`,
      peran,
      divisi_slug: effectiveDivisi,
      status: "aktif",
    };
    setCurrentUser(customUser);
    appendLog(
      `Login kepengurusan sebagai ${customUser.nama}`,
      `divisi: ${effectiveDivisi}`,
      customUser
    );
  }

  function logout() {
    if (currentUser) {
      appendLog("Logout kembali ke mode Anggota (Hanya Baca)", "sesi: auth", currentUser);
    }
    setCurrentUser(null);
  }

  function resetAllDynamicData() {
    setMembers([]);
    setProkers([]);
    setBudgets([]);
    setDocuments([]);
    setNewsList([]);
    setGallery([]);
    setAspirations([]);
    setRegistrations([]);
    setActivityLogs([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  function submitAspiration(payload: {
    kategori: string;
    isi: string;
    anonim: boolean;
    nama_pengirim?: string;
    kontak_opsional?: string;
  }): Aspirasi {
    const code = generateTrackingCode(2026);
    const newRecord: Aspirasi = {
      id: `asp-${Date.now()}`,
      nomor_pelacakan: code,
      kategori: payload.kategori,
      isi: payload.isi.trim(),
      anonim: payload.anonim,
      nama_pengirim: payload.anonim ? null : payload.nama_pengirim?.trim() || null,
      kontak_opsional: payload.anonim ? null : payload.kontak_opsional?.trim() || null,
      status: "diterima",
      tanggapan: null,
      tanggal_kirim: todayStr(),
      tanggal_respon: null,
    };
    setAspirations((prev) => [newRecord, ...prev]);

    if (isSupabaseConfigured && supabase) {
      supabase.from("aspirasi").insert([{
        nomor_pelacakan: newRecord.nomor_pelacakan,
        kategori: newRecord.kategori,
        isi: newRecord.isi,
        anonim: newRecord.anonim,
        nama_pengirim: newRecord.nama_pengirim,
        kontak_opsional: newRecord.kontak_opsional,
        status: newRecord.status,
      }]).then(({ error }) => {
        if (error) console.error("Supabase insert aspirasi error:", error);
      });
    }

    return newRecord;
  }

  function registerForProker(payload: {
    id_proker: string;
    nama: string;
    nrp: string;
    prodi: ProdiLamongan;
    peran_dipilih: "Peserta" | "Panitia";
    kontak: string;
    alasan: string;
  }): Pendaftaran {
    const created: Pendaftaran = {
      id: `reg-${Date.now()}`,
      ...payload,
      tanggal_daftar: todayStr(),
    };
    setRegistrations((prev) => [created, ...prev]);

    if (isSupabaseConfigured && supabase) {
      supabase.from("pendaftaran").insert([{
        id_proker: created.id_proker,
        nama: created.nama,
        nrp: created.nrp,
        prodi: created.prodi,
        peran_dipilih: created.peran_dipilih,
        kontak: created.kontak,
        alasan: created.alasan,
      }]).then(({ error }) => {
        if (error) console.error("Supabase insert pendaftaran error:", error);
      });
    }

    return created;
  }

  // ==========================================================================
  // CRUD PROKER
  // ==========================================================================
  function createProker(payload: {
    judul: string;
    deskripsi: string;
    tujuan: string;
    target_peserta: string;
    id_divisi: string;
    pic: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    status: StatusProker;
    progres: number;
  }) {
    if (!currentUser || currentUser.peran === "anggota") return;

    const bebasIzin = canCrudProkerWithoutPermission(currentUser.peran);
    const slug = payload.judul
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const created: Proker = {
      id: `proker-${Date.now()}`,
      slug: `${slug || "proker"}-${Date.now().toString().slice(-3)}`,
      ...payload,
      tahap_selesai: Math.max(0, Math.round((payload.progres / 100) * 5)),
      total_tahap: 5,
      id_periode: selectedPeriodId,
      terakhir_diperbarui: todayStr(),
      status_izin: bebasIzin ? "disetujui" : "menunggu_izin_kabid",
      aksi_pengajuan: "buat",
      pengusul_nama: currentUser.nama,
      pengusul_peran: currentUser.peran,
    };

    setProkers((prev) => [created, ...prev]);
    appendLog(
      bebasIzin
        ? `Menambah proker (Tanpa Izin): ${created.judul}`
        : `Mengajukan proker baru (Menunggu Izin Ketua Divisi): ${created.judul}`,
      `proker: ${created.judul}`
    );

    if (isSupabaseConfigured && supabase) {
      supabase.from("proker").insert([{
        slug: created.slug,
        judul: created.judul,
        deskripsi: created.deskripsi,
        tujuan: created.tujuan,
        target_peserta: created.target_peserta,
        id_divisi: created.id_divisi,
        pic: created.pic,
        tanggal_mulai: created.tanggal_mulai,
        tanggal_selesai: created.tanggal_selesai,
        status: created.status,
        progres: created.progres,
        tahap_selesai: created.tahap_selesai,
        total_tahap: created.total_tahap,
        id_periode: created.id_periode,
        status_izin: created.status_izin,
        aksi_pengajuan: created.aksi_pengajuan,
        pengusul_nama: created.pengusul_nama,
        pengusul_peran: created.pengusul_peran,
      }]).then(({ error }) => {
        if (error) console.error("Supabase insert proker error:", error);
      });
    }
  }

  function updateProker(
    id: string,
    payload: {
      judul: string;
      deskripsi: string;
      pic: string;
      status: StatusProker;
      progres: number;
    }
  ) {
    if (!currentUser || currentUser.peran === "anggota") return;
    const bebasIzin = canCrudProkerWithoutPermission(currentUser.peran);

    setProkers((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              judul: payload.judul.trim() || item.judul,
              deskripsi: payload.deskripsi.trim(),
              pic: payload.pic.trim() || item.pic,
              status: payload.status,
              progres: payload.progres,
              tahap_selesai: Math.round((payload.progres / 100) * item.total_tahap),
              terakhir_diperbarui: todayStr(),
              status_izin: bebasIzin ? "disetujui" : "menunggu_izin_kabid",
              aksi_pengajuan: "ubah",
              pengusul_nama: currentUser.nama,
              pengusul_peran: currentUser.peran,
            }
          : item
      )
    );

    appendLog(
      bebasIzin
        ? `Memperbarui proker (Tanpa Izin): ${payload.judul}`
        : `Mengajukan update proker (Menunggu Izin Ketua Divisi): ${payload.judul}`,
      `proker: ${id}`
    );

    if (isSupabaseConfigured && supabase) {
      supabase.from("proker").update({
        judul: payload.judul,
        deskripsi: payload.deskripsi,
        pic: payload.pic,
        status: payload.status,
        progres: payload.progres,
        status_izin: bebasIzin ? "disetujui" : "menunggu_izin_kabid",
        aksi_pengajuan: "ubah",
        pengusul_nama: currentUser.nama,
        pengusul_peran: currentUser.peran,
      }).eq("id", id).then(({ error }) => {
        if (error) console.error("Supabase update proker error:", error);
      });
    }
  }

  function updateProkerProgress(id: string, status: StatusProker, progres: number) {
    if (!currentUser || currentUser.peran === "anggota") return;
    const bebasIzin = canCrudProkerWithoutPermission(currentUser.peran);

    setProkers((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              progres,
              tahap_selesai: Math.round((progres / 100) * item.total_tahap),
              terakhir_diperbarui: todayStr(),
              status_izin: bebasIzin ? "disetujui" : "menunggu_izin_kabid",
              aksi_pengajuan: "ubah",
              pengusul_nama: currentUser.nama,
              pengusul_peran: currentUser.peran,
            }
          : item
      )
    );

    appendLog(
      bebasIzin
        ? `Update progres proker (${progres}%)`
        : `Mengajukan update progres (${progres}%) ke Ketua Divisi`,
      `proker: ${id}`
    );
  }

  function deleteProker(id: string) {
    if (!currentUser || currentUser.peran === "anggota") return;
    const bebasIzin = canCrudProkerWithoutPermission(currentUser.peran);

    if (bebasIzin) {
      setProkers((prev) => prev.filter((item) => item.id !== id));
      appendLog("Menghapus proker (Tanpa Izin)", `proker: ${id}`);
      if (isSupabaseConfigured && supabase) {
        supabase.from("proker").delete().eq("id", id).then(({ error }) => {
          if (error) console.error("Supabase delete proker error:", error);
        });
      }
    } else {
      setProkers((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status_izin: "menunggu_izin_kabid",
                aksi_pengajuan: "hapus",
                pengusul_nama: currentUser.nama,
                pengusul_peran: currentUser.peran,
              }
            : item
        )
      );
      appendLog(
        "Mengajukan penghapusan proker (Menunggu Izin Ketua Divisi)",
        `proker: ${id}`
      );
    }
  }

  function approveProkerPermission(prokerId: string) {
    if (!currentUser) return;
    if (
      currentUser.peran !== "ketua_divisi" &&
      currentUser.peran !== "ketua_himakala"
    ) {
      return;
    }

    const target = prokers.find((p) => p.id === prokerId);
    if (!target) return;

    if (target.aksi_pengajuan === "hapus") {
      setProkers((prev) => prev.filter((p) => p.id !== prokerId));
      appendLog(`Menyetujui penghapusan proker: ${target.judul}`, `proker: ${prokerId}`);
      if (isSupabaseConfigured && supabase) {
        supabase.from("proker").delete().eq("id", prokerId).then();
      }
      return;
    }

    setProkers((prev) =>
      prev.map((p) =>
        p.id === prokerId
          ? {
              ...p,
              status_izin: "disetujui",
              terakhir_diperbarui: todayStr(),
            }
          : p
      )
    );
    appendLog(`Menyetujui pengajuan proker divisi: ${target.judul}`, `proker: ${prokerId}`);
    if (isSupabaseConfigured && supabase) {
      supabase.from("proker").update({ status_izin: "disetujui" }).eq("id", prokerId).then();
    }
  }

  function rejectProkerPermission(prokerId: string) {
    if (!currentUser) return;
    if (
      currentUser.peran !== "ketua_divisi" &&
      currentUser.peran !== "ketua_himakala"
    ) {
      return;
    }

    const target = prokers.find((p) => p.id === prokerId);
    if (!target) return;

    if (target.aksi_pengajuan === "buat") {
      setProkers((prev) => prev.filter((p) => p.id !== prokerId));
      if (isSupabaseConfigured && supabase) {
        supabase.from("proker").delete().eq("id", prokerId).then();
      }
    } else {
      setProkers((prev) =>
        prev.map((p) =>
          p.id === prokerId
            ? {
                ...p,
                status_izin: "disetujui",
                aksi_pengajuan: "ubah",
              }
            : p
        )
      );
    }
    appendLog(`Menolak pengajuan proker: ${target.judul}`, `proker: ${prokerId}`);
  }

  // ==========================================================================
  // CRUD MODUL LAINNYA (ANGGARAN, DOKUMEN, BERITA, PENGURUS, ASPIRASI)
  // ==========================================================================
  function upsertBudgetByTreasurer(payload: {
    id_proker: string;
    rencana: number;
    realisasi: number;
    keterangan: string;
  }) {
    setBudgets((prev) => {
      const existing = prev.find((b) => b.id_proker === payload.id_proker);
      if (existing) {
        return prev.map((b) =>
          b.id_proker === payload.id_proker
            ? {
                ...b,
                rencana: payload.rencana,
                realisasi: payload.realisasi,
                keterangan: payload.keterangan,
                status_persetujuan: "disetujui",
                terakhir_diperbarui: todayStr(),
              }
            : b
        );
      }
      return [
        {
          id: `ang-${Date.now()}`,
          id_proker: payload.id_proker,
          rencana: payload.rencana,
          realisasi: payload.realisasi,
          keterangan: payload.keterangan,
          status_persetujuan: "disetujui",
          terakhir_diperbarui: todayStr(),
        },
        ...prev,
      ];
    });
    appendLog("Menyimpan anggaran proker", `anggaran: ${payload.id_proker}`);

    if (isSupabaseConfigured && supabase) {
      supabase.from("anggaran").upsert([{
        id_proker: payload.id_proker,
        rencana: payload.rencana,
        realisasi: payload.realisasi,
        keterangan: payload.keterangan,
        status_persetujuan: "disetujui",
      }]).then();
    }
  }

  function deleteBudget(budgetId: string) {
    setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
    appendLog("Menghapus item anggaran", `anggaran: ${budgetId}`);
    if (isSupabaseConfigured && supabase) {
      supabase.from("anggaran").delete().eq("id", budgetId).then();
    }
  }

  function decideBudgetByChairman(
    budgetId: string,
    decision: Extract<StatusPersetujuanAnggaran, "disetujui" | "revisi">,
    catatan: string
  ) {
    setBudgets((prev) =>
      prev.map((b) =>
        b.id === budgetId
          ? {
              ...b,
              status_persetujuan: decision,
              catatan_ketua: catatan,
              terakhir_diperbarui: todayStr(),
            }
          : b
      )
    );
    appendLog(`Status anggaran: ${decision}`, `anggaran: ${budgetId}`);
  }

  function uploadDocument(payload: {
    judul: string;
    kategori: KategoriDokumen;
    nomor_dokumen: string;
    ringkasan: string;
    visibilitas: VisibilitasDokumen;
  }) {
    const created: Dokumen = {
      id: `dok-${Date.now()}`,
      ...payload,
      ukuran_kb: 512,
      id_periode: selectedPeriodId,
      tanggal_unggah: todayStr(),
    };
    setDocuments((prev) => [created, ...prev]);
    appendLog(`Unggah dokumen ${created.kategori}`, `dokumen: ${created.judul}`);

    if (isSupabaseConfigured && supabase) {
      supabase.from("dokumen").insert([{
        judul: created.judul,
        kategori: created.kategori,
        nomor_dokumen: created.nomor_dokumen,
        ringkasan: created.ringkasan,
        ukuran_kb: created.ukuran_kb,
        visibilitas: created.visibilitas,
        id_periode: created.id_periode,
      }]).then();
    }
  }

  function deleteDocument(docId: string) {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    appendLog("Menghapus dokumen", `dokumen: ${docId}`);
    if (isSupabaseConfigured && supabase) {
      supabase.from("dokumen").delete().eq("id", docId).then();
    }
  }

  function toggleDocumentVisibility(docId: string) {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              visibilitas: d.visibilitas === "publik" ? "internal" : "publik",
            }
          : d
      )
    );
  }

  function respondToAspiration(
    aspirationId: string,
    status: StatusAspirasi,
    tanggapan: string
  ) {
    setAspirations((prev) =>
      prev.map((a) =>
        a.id === aspirationId
          ? {
              ...a,
              status,
              tanggapan: tanggapan.trim(),
              tanggal_respon: todayStr(),
            }
          : a
      )
    );
    appendLog(`Respon aspirasi (${status})`, `aspirasi: ${aspirationId}`);

    if (isSupabaseConfigured && supabase) {
      supabase.from("aspirasi").update({
        status,
        tanggapan: tanggapan.trim(),
        tanggal_respon: todayStr(),
      }).eq("id", aspirationId).then();
    }
  }

  function deleteAspiration(aspirationId: string) {
    setAspirations((prev) => prev.filter((a) => a.id !== aspirationId));
    appendLog("Menghapus aspirasi", `aspirasi: ${aspirationId}`);
    if (isSupabaseConfigured && supabase) {
      supabase.from("aspirasi").delete().eq("id", aspirationId).then();
    }
  }

  function createNewsArticle(payload: {
    judul: string;
    ringkasan: string;
    isi: string;
    kategori: Berita["kategori"];
  }) {
    const slug = payload.judul
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const created: Berita = {
      id: `news-${Date.now()}`,
      slug: `${slug || "berita"}-${Date.now().toString().slice(-3)}`,
      ...payload,
      penulis: currentUser?.nama || "Medinfo HIMAKALA",
      tanggal: todayStr(),
      status_terbit: true,
    };
    setNewsList((prev) => [created, ...prev]);
    appendLog(`Terbit berita: ${created.judul}`, `berita: ${created.slug}`);

    if (isSupabaseConfigured && supabase) {
      supabase.from("berita").insert([{
        slug: created.slug,
        judul: created.judul,
        ringkasan: created.ringkasan,
        isi: created.isi,
        kategori: created.kategori,
        penulis: created.penulis,
      }]).then();
    }
  }

  function deleteNewsArticle(newsId: string) {
    setNewsList((prev) => prev.filter((n) => n.id !== newsId));
    appendLog("Menghapus berita", `berita: ${newsId}`);
    if (isSupabaseConfigured && supabase) {
      supabase.from("berita").delete().eq("id", newsId).then();
    }
  }

  function addMember(payload: {
    nama: string;
    jabatan: string;
    prodi: ProdiLamongan;
    id_divisi: string;
  }) {
    // Hanya Ketua HIMAKALA dan Sekretaris yang dapat menambah pengurus,
    // dan calon pengurus wajib sudah terdaftar sebagai Anggota Aktif HIMAKALA
    if (!canManageMembersAndPengurus(currentUser?.peran)) return;

    const activeMember = users.find(
      (u) =>
        u.status === "aktif" &&
        (u.nama.toLowerCase() === payload.nama.trim().toLowerCase() ||
          u.email.toLowerCase() === payload.nama.trim().toLowerCase() ||
          u.nrp === payload.nama.trim())
    );
    if (!activeMember) return;

    const created: Pengurus = {
      id: `mem-${Date.now()}`,
      id_pengguna: activeMember.id,
      nrp: activeMember.nrp,
      email: activeMember.email,
      no_wa: activeMember.no_wa,
      nama: activeMember.nama,
      jabatan: payload.jabatan.trim(),
      prodi: payload.prodi || activeMember.prodi || "Teknik Informatika",
      id_divisi: payload.id_divisi,
      status_verifikasi: true,
      id_periode: selectedPeriodId,
    };
    setMembers((prev) => [...prev, created]);
    appendLog(`Tambah pengurus dari Anggota Aktif: ${created.nama}`, `pengurus: ${created.nama}`);

    if (isSupabaseConfigured && supabase) {
      supabase.from("pengurus").insert([{
        nama: created.nama,
        jabatan: created.jabatan,
        prodi: created.prodi,
        id_divisi: created.id_divisi,
        id_periode: created.id_periode,
        status_verifikasi: true,
      }]).then();
    }
  }

  function deleteMember(memberId: string) {
    if (!canManageMembersAndPengurus(currentUser?.peran)) return;
    const target = members.find((m) => m.id === memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (target?.id_pengguna) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === target.id_pengguna
            ? { ...u, peran: "anggota", id_divisi: null, divisi_slug: undefined }
            : u
        )
      );
    }
    appendLog("Memberhentikan pengurus kembali menjadi Anggota Aktif", `pengurus: ${memberId}`);
    if (isSupabaseConfigured && supabase) {
      supabase.from("pengurus").delete().eq("id", memberId).then();
    }
  }

  return (
    <HimakalaStoreContext.Provider
      value={{
        periods,
        selectedPeriodId,
        setSelectedPeriodId,
        activePeriod,
        divisions,
        members,
        prokers,
        budgets,
        documents,
        newsList,
        gallery,
        aspirations,
        registrations,
        users,
        activityLogs,
        searchQuery,
        setSearchQuery,
        uiState,
        setUiState,
        isCloudConnected: isSupabaseConfigured,
        currentUser,
        isKepengurusan,
        canManageMembership,
        currentDivision,
        loginWithCredentials,
        registerMemberAccount,
        appointMemberAsPengurus,
        toggleMemberActiveStatus,
        loginAsUser,
        loginCustom,
        logout,
        resetAllDynamicData,
        createUserAccount,
        deleteUserAccount,
        submitAspiration,
        registerForProker,
        createProker,
        updateProker,
        updateProkerProgress,
        deleteProker,
        approveProkerPermission,
        rejectProkerPermission,
        upsertBudgetByTreasurer,
        deleteBudget,
        decideBudgetByChairman,
        uploadDocument,
        deleteDocument,
        toggleDocumentVisibility,
        respondToAspiration,
        deleteAspiration,
        createNewsArticle,
        deleteNewsArticle,
        addMember,
        deleteMember,
      }}
    >
      {children}
    </HimakalaStoreContext.Provider>
  );
}

export function useHimakalaStore() {
  const ctx = useContext(HimakalaStoreContext);
  if (!ctx) {
    throw new Error("useHimakalaStore wajib digunakan di dalam HimakalaStoreProvider");
  }
  return ctx;
}
