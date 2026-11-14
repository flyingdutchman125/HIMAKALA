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
import { canCrudProkerWithoutPermission, generateTrackingCode } from "@/lib/utils";
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
  currentDivision: Divisi | null;
  loginWithCredentials: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string; user?: Pengguna }>;
  loginAsUser: (userId: string) => void;
  loginCustom: (nama: string, peran: PeranPengguna, divisiSlug?: DivisiSlug) => void;
  logout: () => void;
  resetAllDynamicData: () => void;
  createUserAccount: (payload: {
    nama: string;
    email: string;
    password: string;
    peran: PeranPengguna;
    id_divisi: string | null;
  }) => Promise<void>;
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
  const [users, setUsers] = useState<Pengguna[]>(INITIAL_USERS);
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
            return {
              id: String(u.id),
              nama: String(u.nama || ""),
              email: String(u.email || ""),
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
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string; user?: Pengguna }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return { ok: false, error: "Email dan password wajib diisi." };
    }

    // 1. Cek langsung dari tabel `public.pengguna` di Supabase (berdasarkan enum `peran_pengguna`)
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbUser } = await supabase
          .from("pengguna")
          .select("*")
          .ilike("email", cleanEmail)
          .maybeSingle();

        if (dbUser) {
          const dbPass = dbUser.password ? String(dbUser.password) : "himakala123";
          if (dbPass !== cleanPassword) {
            return { ok: false, error: "Password yang dimasukkan salah." };
          }
          if (dbUser.status_aktif === false) {
            return { ok: false, error: "Akun pengguna sedang dinonaktifkan." };
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

          const loggedUser: Pengguna = {
            id: String(dbUser.id),
            nama: String(dbUser.nama || cleanEmail),
            email: String(dbUser.email),
            peran: role,
            id_divisi: dbUser.id_divisi ? String(dbUser.id_divisi) : null,
            divisi_slug: resolvedSlug,
            status: "aktif",
          };

          if (role === "anggota") {
            setCurrentUser(null);
            return { ok: true, user: loggedUser };
          }

          setCurrentUser(loggedUser);
          appendLog(
            `Login sebagai ${loggedUser.nama} (${loggedUser.peran})`,
            `divisi: ${resolvedSlug || "bph"}`,
            loggedUser
          );
          return { ok: true, user: loggedUser };
        }
      } catch (err) {
        console.warn("Pengecekan tabel pengguna Supabase gagal, cek daftar akun:", err);
      }
    }

    // 2. Fallback cek dari daftar pengguna berdasarkan enum `peran_pengguna`
    const matchedLocal = users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );
    if (!matchedLocal) {
      return {
        ok: false,
        error: "Email tidak terdaftar di tabel pengguna.",
      };
    }

    const expectedPass = matchedLocal.password || "himakala123";
    if (expectedPass !== cleanPassword) {
      return { ok: false, error: "Password yang dimasukkan salah." };
    }

    if (matchedLocal.peran === "anggota") {
      setCurrentUser(null);
      return { ok: true, user: matchedLocal };
    }

    setCurrentUser(matchedLocal);
    appendLog(
      `Login sebagai ${matchedLocal.nama} (${matchedLocal.peran})`,
      `divisi: ${matchedLocal.divisi_slug || "bph"}`,
      matchedLocal
    );
    return { ok: true, user: matchedLocal };
  }

  async function createUserAccount(payload: {
    nama: string;
    email: string;
    password: string;
    peran: PeranPengguna;
    id_divisi: string | null;
  }) {
    const matchedDiv = divisions.find((d) => d.id === payload.id_divisi);
    const resolvedSlug: DivisiSlug | undefined =
      matchedDiv?.slug ||
      (payload.peran === "ketua_himakala" ||
      payload.peran === "sekretaris" ||
      payload.peran === "bendahara"
        ? "bph"
        : undefined);

    const newUser: Pengguna = {
      id: `usr-${Date.now()}`,
      nama: payload.nama.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password.trim() || "himakala123",
      peran: payload.peran,
      id_divisi: payload.id_divisi,
      divisi_slug: resolvedSlug,
      status: "aktif",
    };

    setUsers((prev) => [...prev, newUser]);
    appendLog(
      `Tambah akun pengguna: ${newUser.email} (${newUser.peran})`,
      `pengguna: ${newUser.email}`
    );

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from("pengguna")
        .insert([
          {
            nama: newUser.nama,
            email: newUser.email,
            password: newUser.password,
            peran: newUser.peran,
            id_divisi: payload.id_divisi,
            status_aktif: true,
          },
        ])
        .select("*")
        .maybeSingle();

      if (data?.id) {
        setUsers((prev) =>
          prev.map((u) => (u.email === newUser.email ? { ...u, id: String(data.id) } : u))
        );
      }
    }
  }

  async function deleteUserAccount(userId: string) {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    appendLog("Menghapus akun pengguna", `pengguna: ${userId}`);
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
    const created: Pengurus = {
      id: `mem-${Date.now()}`,
      nama: payload.nama.trim(),
      jabatan: payload.jabatan.trim(),
      prodi: payload.prodi,
      id_divisi: payload.id_divisi,
      status_verifikasi: true,
      id_periode: selectedPeriodId,
    };
    setMembers((prev) => [...prev, created]);
    appendLog(`Tambah pengurus: ${created.nama}`, `pengurus: ${created.nama}`);

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
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    appendLog("Menghapus pengurus", `pengurus: ${memberId}`);
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
        currentDivision,
        loginWithCredentials,
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
