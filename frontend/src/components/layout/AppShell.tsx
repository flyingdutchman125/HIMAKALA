import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  CheckSquare,
  FileText,
  FolderKanban,
  LayoutGrid,
  LogIn,
  LogOut,
  MessageSquarePlus,
  Newspaper,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";
import himakalaLogo from "@/assets/himakala-logo.png";
import pensLogo from "@/assets/pens-logo.png";
import { InitialAvatar } from "@/components/shared/DataStateView";
import { cn, getRoleLabel } from "@/lib/utils";
import {
  useHimakalaStore,
  type UIStateSimulation,
} from "@/services/himakala-store";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const PUBLIC_NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Beranda", icon: LayoutGrid },
  { to: "/proker", label: "Program Kerja", icon: FolderKanban },
  { to: "/transparansi", label: "Kas & Dokumen", icon: Wallet },
  { to: "/organisasi", label: "6 Divisi", icon: Users },
  { to: "/berita", label: "Berita", icon: Newspaper },
  { to: "/aspirasi", label: "Aspirasi", icon: MessageSquarePlus },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    prokers,
    searchQuery,
    setSearchQuery,
    uiState,
    setUiState,
    currentUser,
    isKepengurusan,
    currentDivision,
    loginWithCredentials,
    registerMemberAccount,
    logout,
  } = useHimakalaStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  // State Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // State Registrasi Anggota Biasa (NRP, No WA, Email Kampus, Password 2x)
  const [regNama, setRegNama] = useState("");
  const [regNrp, setRegNrp] = useState("");
  const [regWa, setRegWa] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass1, setRegPass1] = useState("");
  const [regPass2, setRegPass2] = useState("");
  const [regError, setRegError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLoginModalOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Hitung pengajuan proker yang menunggu izin Ketua Divisi
  const pendingCount = prokers.filter((p) => {
    if (p.status_izin !== "menunggu_izin_kabid") return false;
    if (currentUser?.peran === "ketua_himakala") return true;
    if (currentUser?.peran === "ketua_divisi" && currentDivision) {
      return p.id_divisi === currentDivision.id;
    }
    return false;
  }).length;

  // Menu Sidebar Dinamis berdasarkan Enum `peran_pengguna` & Divisi dari Database
  function getDivisionSidebarMenus(): NavItem[] {
    if (!currentUser || currentUser.peran === "anggota") return [];

    const role = currentUser.peran;
    const divSlug = currentUser.divisi_slug || "bph";
    const divName = currentDivision?.nama || "BPH";

    // 1. Ketua HIMAKALA (Divisi BPH - Ketua BPH): Akses penuh seluruh divisi & fungsi
    if (role === "ketua_himakala") {
      return [
        { to: "/admin?tab=proker", label: "Proker 6 Divisi", icon: FolderKanban },
        {
          to: "/admin?tab=izin",
          label: "Izin Proker",
          icon: CheckSquare,
          badge: pendingCount,
        },
        { to: "/admin?tab=keuangan", label: "Kas & Anggaran", icon: Wallet },
        { to: "/admin?tab=dokumen", label: "Dokumen & SK", icon: FileText },
        { to: "/admin?tab=pengguna", label: "Anggota Aktif", icon: ShieldCheck },
        { to: "/admin?tab=pengurus", label: "Angkat Pengurus", icon: Users },
        { to: "/admin?tab=berita", label: "Berita Medinfo", icon: Newspaper },
        {
          to: "/admin?tab=aspirasi",
          label: "Aspirasi Anggota",
          icon: MessageSquarePlus,
        },
      ];
    }

    // 2. Sekretaris (Divisi BPH): Bebas CRUD Proker + Dokumen + Tambah Anggota & Angkat Pengurus
    if (role === "sekretaris") {
      return [
        { to: "/admin?tab=proker", label: "CRUD Proker", icon: FolderKanban },
        { to: "/admin?tab=dokumen", label: "Dokumen & SK", icon: FileText },
        { to: "/admin?tab=pengguna", label: "Anggota Aktif", icon: ShieldCheck },
        { to: "/admin?tab=pengurus", label: "Angkat Pengurus", icon: Users },
      ];
    }

    // 3. Bendahara (Divisi BPH): Bebas CRUD Proker + Kas & Anggaran
    if (role === "bendahara") {
      return [
        { to: "/admin?tab=proker", label: "CRUD Proker", icon: FolderKanban },
        { to: "/admin?tab=keuangan", label: "Kas & Anggaran", icon: Wallet },
      ];
    }

    // 4. Ketua Divisi / Pengurus Divisi (Luar Negeri, Dalam Negeri, Media dan Informasi, PSDM, RSTEK, BPH)
    const items: NavItem[] = [
      {
        to: "/admin?tab=proker",
        label:
          role === "ketua_divisi"
            ? `CRUD Proker ${divName}`
            : `Proker ${divName} (Izin)`,
        icon: FolderKanban,
      },
    ];

    if (role === "ketua_divisi") {
      items.push({
        to: "/admin?tab=izin",
        label: `Izin ${divName}`,
        icon: CheckSquare,
        badge: pendingCount,
      });
    }

    // Fungsi spesifik tiap divisi (Penambahan anggota & pengurus hanya oleh Ketua & Sekretaris):
    if (divSlug === "medinfo") {
      items.push({
        to: "/admin?tab=berita",
        label: "Publikasi Medinfo",
        icon: Newspaper,
      });
    } else if (divSlug === "dalam-negeri") {
      items.push({
        to: "/admin?tab=aspirasi",
        label: "Aspirasi Internal",
        icon: MessageSquarePlus,
      });
    }

    return items;
  }

  const divisionMenus = getDivisionSidebarMenus();

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (location.pathname !== "/proker") {
      navigate("/proker");
    }
  }

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const res = await loginWithCredentials(loginEmail, loginPassword);
      if (!res.ok) {
        setLoginError(res.error || "Login gagal.");
        return;
      }
      setLoginModalOpen(false);
      setLoginEmail("");
      setLoginPassword("");
      if (res.user && res.user.peran !== "anggota") {
        navigate("/admin?tab=proker");
      } else {
        navigate("/");
      }
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRegError("");
    setIsRegistering(true);
    try {
      const res = await registerMemberAccount({
        nama: regNama,
        nrp: regNrp,
        no_wa: regWa,
        email: regEmail,
        password: regPass1,
        confirmPassword: regPass2,
        autoLogin: true,
      });
      if (!res.ok) {
        setRegError(res.error || "Registrasi gagal.");
        return;
      }
      setLoginModalOpen(false);
      setRegNama("");
      setRegNrp("");
      setRegWa("");
      setRegEmail("");
      setRegPass1("");
      setRegPass2("");
      navigate("/");
    } finally {
      setIsRegistering(false);
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#DCE7F3] p-1.5 sm:p-3">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-[#FAD956] focus:px-4 focus:py-2 focus:font-bold focus:text-[#0B1938]"
      >
        Lewati ke konten utama
      </a>

      {/* FRAME UTAMA FIXED VIEWPORT: Tidak ikut ter-scroll (Deep Navy Logo HIMAKALA #0B1938) */}
      <div className="mx-auto flex h-full max-w-[1420px] flex-col overflow-hidden rounded-[26px] bg-[#0B1938] p-2 shadow-xl md:flex-row md:p-2.5">
        {/* SIDEBAR STATIS (TIDAK BISA DI-SCROLL) */}
        <aside
          aria-label="Navigasi Utama"
          className={cn(
            "flex shrink-0 flex-row items-center justify-between overflow-hidden px-2 py-1.5 text-[#F5F8FC] md:h-full md:flex-col md:items-stretch md:justify-between md:py-3",
            isKepengurusan ? "md:w-[215px] md:px-3" : "md:w-[180px] md:px-2.5"
          )}
        >
          <div className="flex items-center gap-2 md:flex-col md:items-stretch md:gap-2.5">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-2xl bg-[#152852] p-1.5 border border-[#233A6E]"
            >
              <img
                src={himakalaLogo}
                alt="Logo HIMAKALA"
                className="h-8 w-8 rounded-xl bg-white p-0.5 object-contain"
              />
              <div className="hidden md:block">
                <p className="font-display text-xs font-bold leading-tight text-white">
                  HIMAKALA
                </p>
                <p className="text-[10px] text-[#B8CBE8]">
                  {isKepengurusan
                    ? `Divisi ${currentDivision?.nama || "BPH"}`
                    : "Mode Anggota"}
                </p>
              </div>
            </Link>

            {/* Menu Lihat Web (Tersedia untuk Anggota & Pengurus) */}
            <div className="hidden md:block">
              <p className="px-2 text-[9px] font-bold uppercase tracking-wider text-[#8CA6CC]">
                Menu Web
              </p>
            </div>
            <nav
              aria-label="Menu Publik"
              className="flex items-center gap-1 md:flex-col md:items-stretch md:gap-0.5"
            >
              {PUBLIC_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition-colors",
                        isActive
                          ? "bg-[#FAD956] text-[#0B1938]"
                          : "text-[#B8CBE8] hover:bg-[#152852] hover:text-white"
                      )
                    }
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="hidden md:inline">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Menu Kepengurusan Divisi (HANYA MUNCUL SAAT KEPENGURUSAN LOGIN) */}
            {isKepengurusan && divisionMenus.length > 0 && (
              <div className="hidden border-t border-[#233A6E] pt-2 md:block">
                <p className="px-2 text-[9px] font-bold uppercase tracking-wider text-[#FAD956]">
                  Menu {currentDivision?.nama || "BPH"}
                </p>
                <nav
                  aria-label="Menu Kepengurusan Divisi"
                  className="mt-1 flex flex-col gap-0.5"
                >
                  {divisionMenus.map((item) => {
                    const Icon = item.icon;
                    const currentFullUrl = `${location.pathname}${location.search}`;
                    const isActive =
                      currentFullUrl === item.to ||
                      (location.pathname === "/admin" &&
                        !location.search &&
                        item.to === "/admin?tab=proker");
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition-colors",
                          isActive
                            ? "bg-[#026E9C] text-white"
                            : "bg-[#152852] text-[#F5F8FC] hover:bg-[#233A6E]"
                        )}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Icon
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="rounded-full bg-[#FAD956] px-1.5 py-0.2 text-[10px] font-bold text-[#0B1938]">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            )}
          </div>

          {/* Tombol Bawah Sidebar: Login/Registrasi atau Logout */}
          <div className="flex shrink-0 items-center gap-2 md:flex-col md:items-stretch">
            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  if (location.pathname === "/admin") navigate("/");
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#152852] px-3 py-2 text-[11px] font-bold text-[#FEE2E2] hover:bg-[#233A6E]"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden md:inline">Logout</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setLoginError("");
                  setRegError("");
                  setAuthTab("login");
                  setLoginModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#FAD956] px-3 py-2 text-[11px] font-bold text-[#0B1938] hover:bg-[#F2C922]"
              >
                <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden md:inline">Login / Daftar</span>
              </button>
            )}
          </div>
        </aside>

        {/* KANVAS UTAMA (#F5F8FC): HANYA BAGIAN DALAM (<main>) YANG BISA DI-SCROLL */}
        <div className="flex h-full flex-1 flex-col overflow-hidden rounded-[20px] bg-[#F5F8FC] p-4 sm:p-5">
          {/* TOP BAR STATIS */}
          <header className="flex shrink-0 flex-col gap-3 border-b border-[#0B1938]/15 pb-3.5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={pensLogo}
                alt="Logo PENS"
                className="h-7 w-7 object-contain"
              />
              <span className="text-sm font-medium text-[#3B4E73]">
                HIMAKALA{" "}
                <strong className="font-display text-base font-bold text-[#026E9C]">
                  PSDKU Lamongan
                </strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <form
                onSubmit={handleSearchSubmit}
                role="search"
                className="flex flex-1 items-center overflow-hidden rounded-full bg-white ink-border sm:w-52 sm:flex-initial"
              >
                <label htmlFor="global-search" className="sr-only">
                  Cari proker
                </label>
                <input
                  id="global-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari proker..."
                  className="w-full bg-transparent px-3.5 py-1.5 text-xs text-[#0B1938] placeholder:text-[#3B4E73] focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Cari"
                  className="m-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#026E9C] text-white hover:bg-[#01587E]"
                >
                  <Search className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </form>

              {/* Status Sesi Saat Ini */}
              {currentUser ? (
                <div className="flex items-center gap-2 rounded-full bg-[#FAD956] px-3 py-1 ink-border">
                  <InitialAvatar name={currentUser.nama} bg="bg-white" />
                  <div className="text-left leading-tight">
                    <p className="text-xs font-bold text-[#0B1938]">
                      {currentUser.nama}
                    </p>
                    <p className="text-[10px] font-bold text-[#3B4E73]">
                      {isKepengurusan
                        ? `${getRoleLabel(currentUser.peran)} • ${
                            currentDivision?.nama || "BPH"
                          }`
                        : `Anggota Aktif${
                            currentUser.nrp ? ` • NRP ${currentUser.nrp}` : ""
                          }`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginError("");
                      setRegError("");
                      setAuthTab("register");
                      setLoginModalOpen(true);
                    }}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-[#C8ECFA] px-3.5 py-1 text-xs font-bold text-[#0B1938] ink-border hover:bg-[#FAD956]"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-[#0B1938]" />
                    <span>Registrasi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginError("");
                      setRegError("");
                      setAuthTab("login");
                      setLoginModalOpen(true);
                    }}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-[#0B1938] ink-border hover:bg-[#FAD956]"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-[#026E9C]" />
                    <span>Login</span>
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* AREA KONTEN DALAM YANG BISA DI-SCROLL */}
          <main
            id="main-content"
            className="mt-4 flex-1 overflow-y-auto pr-1"
          >
            <div className="pb-4">{children}</div>

            {/* FOOTER DI DALAM AREA SCROLL */}
            <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-[#0B1938]/15 pt-3 text-xs text-[#3B4E73] sm:flex-row sm:items-center">
              <p className="font-semibold text-[#0B1938]">
                HIMAKALA PENS • 6 Divisi (BPH, Luar Negeri, Dalam Negeri, Media
                dan Informasi, PSDM, RSTEK)
              </p>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="ui-state-select"
                  className="text-[11px] font-bold"
                >
                  State UI:
                </label>
                <select
                  id="ui-state-select"
                  value={uiState}
                  onChange={(e) =>
                    setUiState(e.target.value as UIStateSimulation)
                  }
                  className="rounded-lg bg-white px-2 py-1 text-[11px] font-bold text-[#0B1938] ink-border"
                >
                  <option value="normal">Normal</option>
                  <option value="loading">Loading</option>
                  <option value="empty">Kosong</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </footer>
          </main>
        </div>
      </div>

      {/* MODAL LOGIN & REGISTRASI ANGGOTA BIASA */}
      {loginModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-login-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1938]/65 p-4"
        >
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[24px] bg-[#F5F8FC] p-6 ink-card">
            <div className="flex items-center justify-between">
              <h2
                id="modal-login-title"
                className="font-display text-lg font-bold text-[#0B1938]"
              >
                {authTab === "login"
                  ? "Masuk Portal HIMAKALA"
                  : "Registrasi Anggota HIMAKALA"}
              </h2>
              <button
                type="button"
                onClick={() => setLoginModalOpen(false)}
                aria-label="Tutup"
                className="rounded-xl bg-white p-1.5 text-[#0B1938] ink-border"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Tab Switcher: Login vs Registrasi Anggota */}
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-white p-1 ink-border">
              <button
                type="button"
                onClick={() => {
                  setAuthTab("login");
                  setLoginError("");
                }}
                className={cn(
                  "min-h-[36px] rounded-xl text-xs font-bold transition-colors",
                  authTab === "login"
                    ? "bg-[#0B1938] text-white"
                    : "text-[#0B1938] hover:bg-[#FAD956]"
                )}
              >
                Masuk (Login)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab("register");
                  setRegError("");
                }}
                className={cn(
                  "min-h-[36px] rounded-xl text-xs font-bold transition-colors",
                  authTab === "register"
                    ? "bg-[#0B1938] text-white"
                    : "text-[#0B1938] hover:bg-[#FAD956]"
                )}
              >
                Registrasi Anggota
              </button>
            </div>

            {authTab === "login" ? (
              <>
                <p className="mt-2.5 text-xs text-[#3B4E73]">
                  Masuk menggunakan Email Kampus / Email Akun atau NRP. Role
                  dan akses divisi disesuaikan otomatis dari database.
                </p>

                <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3.5">
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block text-xs font-bold text-[#0B1938]"
                    >
                      Email Kampus / NRP
                    </label>
                    <input
                      id="login-email"
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="mozakiibrahim@it.student.pens.ac.id atau NRP"
                      className="mt-1 w-full min-h-[42px] rounded-xl bg-white px-3.5 py-2 text-xs text-[#0B1938] ink-border"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-bold text-[#0B1938]"
                    >
                      Password
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1 w-full min-h-[42px] rounded-xl bg-white px-3.5 py-2 text-xs text-[#0B1938] ink-border"
                    />
                  </div>

                  {loginError && (
                    <p
                      role="alert"
                      className="rounded-xl bg-[#FEE2E2] p-2.5 text-xs font-bold text-[#0B1938]"
                    >
                      {loginError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setLoginModalOpen(false)}
                      className="min-h-[40px] rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#0B1938] ink-border"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="min-h-[40px] rounded-xl bg-[#026E9C] px-5 py-2 text-xs font-bold text-white ink-border hover:bg-[#01587E] disabled:opacity-60"
                    >
                      {isLoggingIn ? "Memeriksa..." : "Masuk"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <p className="mt-2.5 text-xs text-[#3B4E73]">
                  Registrasi mandiri untuk menjadi{" "}
                  <strong className="text-[#0B1938]">
                    Anggota Aktif HIMAKALA
                  </strong>
                  . Untuk pengangkatan Pengurus HIMAKALA hanya dapat dilakukan
                  oleh Ketua dan Sekretaris dari daftar Anggota Aktif.
                </p>

                <form
                  onSubmit={handleRegisterSubmit}
                  className="mt-3.5 space-y-3"
                >
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="modal-reg-nrp"
                        className="block text-xs font-bold text-[#0B1938]"
                      >
                        NRP Mahasiswa
                      </label>
                      <input
                        id="modal-reg-nrp"
                        type="text"
                        required
                        value={regNrp}
                        onChange={(e) => setRegNrp(e.target.value)}
                        placeholder="3125500001"
                        className="mt-1 w-full min-h-[40px] rounded-xl bg-white px-3 py-1.5 text-xs text-[#0B1938] ink-border"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="modal-reg-wa"
                        className="block text-xs font-bold text-[#0B1938]"
                      >
                        No. WhatsApp
                      </label>
                      <input
                        id="modal-reg-wa"
                        type="tel"
                        required
                        value={regWa}
                        onChange={(e) => setRegWa(e.target.value)}
                        placeholder="081234567890"
                        className="mt-1 w-full min-h-[40px] rounded-xl bg-white px-3 py-1.5 text-xs text-[#0B1938] ink-border"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="modal-reg-email"
                      className="block text-xs font-bold text-[#0B1938]"
                    >
                      Email Kampus PENS
                    </label>
                    <input
                      id="modal-reg-email"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="mozakiibrahim@it.student.pens.ac.id"
                      className="mt-1 w-full min-h-[40px] rounded-xl bg-white px-3.5 py-1.5 text-xs text-[#0B1938] ink-border"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="modal-reg-nama"
                      className="block text-xs font-bold text-[#0B1938]"
                    >
                      Nama Lengkap (Opsional)
                    </label>
                    <input
                      id="modal-reg-nama"
                      type="text"
                      value={regNama}
                      onChange={(e) => setRegNama(e.target.value)}
                      placeholder="Mozaki Ibrahim"
                      className="mt-1 w-full min-h-[40px] rounded-xl bg-white px-3.5 py-1.5 text-xs text-[#0B1938] ink-border"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="modal-reg-pass1"
                        className="block text-xs font-bold text-[#0B1938]"
                      >
                        Password
                      </label>
                      <input
                        id="modal-reg-pass1"
                        type="password"
                        required
                        value={regPass1}
                        onChange={(e) => setRegPass1(e.target.value)}
                        placeholder="Min. 6 karakter"
                        className="mt-1 w-full min-h-[40px] rounded-xl bg-white px-3 py-1.5 text-xs text-[#0B1938] ink-border"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="modal-reg-pass2"
                        className="block text-xs font-bold text-[#0B1938]"
                      >
                        Ulangi Password
                      </label>
                      <input
                        id="modal-reg-pass2"
                        type="password"
                        required
                        value={regPass2}
                        onChange={(e) => setRegPass2(e.target.value)}
                        placeholder="Ketik ulang password"
                        className="mt-1 w-full min-h-[40px] rounded-xl bg-white px-3 py-1.5 text-xs text-[#0B1938] ink-border"
                      />
                    </div>
                  </div>

                  {regError && (
                    <p
                      role="alert"
                      className="rounded-xl bg-[#FEE2E2] p-2.5 text-xs font-bold text-[#0B1938]"
                    >
                      {regError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setLoginModalOpen(false)}
                      className="min-h-[40px] rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#0B1938] ink-border"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isRegistering}
                      className="min-h-[40px] rounded-xl bg-[#026E9C] px-5 py-2 text-xs font-bold text-white ink-border hover:bg-[#01587E] disabled:opacity-60"
                    >
                      {isRegistering ? "Mendaftarkan..." : "Daftar Anggota"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
