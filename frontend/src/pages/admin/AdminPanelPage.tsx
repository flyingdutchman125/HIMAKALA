import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Edit3, Plus, Trash2, X } from "lucide-react";
import { canCrudProkerWithoutPermission, formatRupiah, getRoleLabel } from "@/lib/utils";
import { useHimakalaStore } from "@/services/himakala-store";
import type {
  Berita,
  KategoriDokumen,
  PeranPengguna,
  ProdiLamongan,
  Proker,
  StatusAspirasi,
  StatusProker,
  VisibilitasDokumen,
} from "@/types/entities";

type AdminTab =
  | "proker"
  | "izin"
  | "keuangan"
  | "dokumen"
  | "pengurus"
  | "berita"
  | "aspirasi"
  | "pengguna";

export function AdminPanelPage() {
  const {
    divisions,
    prokers,
    budgets,
    documents,
    aspirations,
    members,
    newsList,
    users,
    currentUser,
    isKepengurusan,
    currentDivision,
    loginWithCredentials,
    createUserAccount,
    deleteUserAccount,
    createProker,
    updateProker,
    deleteProker,
    approveProkerPermission,
    rejectProkerPermission,
    upsertBudgetByTreasurer,
    deleteBudget,
    uploadDocument,
    deleteDocument,
    toggleDocumentVisibility,
    respondToAspiration,
    deleteAspiration,
    createNewsArticle,
    deleteNewsArticle,
    addMember,
    deleteMember,
  } = useHimakalaStore();

  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as AdminTab) || "proker";

  // State Login Biasa (Email & Password)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // State Kelola Akun Pengguna (Tabel `pengguna` & Enum `peran_pengguna`)
  const [usrNama, setUsrNama] = useState("");
  const [usrEmail, setUsrEmail] = useState("");
  const [usrPassword, setUsrPassword] = useState("");
  const [usrPeran, setUsrPeran] = useState<PeranPengguna>("pengurus_divisi");
  const [usrDivisi, setUsrDivisi] = useState("");

  // State CRUD Proker
  const [editingProkerId, setEditingProkerId] = useState<string | null>(null);
  const [prokerJudul, setProkerJudul] = useState("");
  const [prokerDivisi, setProkerDivisi] = useState("div-bph");
  const [prokerPic, setProkerPic] = useState("");
  const [prokerDeskripsi, setProkerDeskripsi] = useState("");
  const [prokerStatus, setProkerStatus] = useState<StatusProker>("direncanakan");
  const [prokerProgres, setProkerProgres] = useState(0);

  // State Keuangan
  const [budgetProkerId, setBudgetProkerId] = useState("");
  const [budgetRencana, setBudgetRencana] = useState(0);
  const [budgetRealisasi, setBudgetRealisasi] = useState(0);
  const [budgetKeterangan, setBudgetKeterangan] = useState("");

  // State Dokumen
  const [docJudul, setDocJudul] = useState("");
  const [docKategori, setDocKategori] = useState<KategoriDokumen>("SK");
  const [docNomor, setDocNomor] = useState("");
  const [docVisibilitas, setDocVisibilitas] =
    useState<VisibilitasDokumen>("publik");

  // State Pengurus
  const [memNama, setMemNama] = useState("");
  const [memJabatan, setMemJabatan] = useState("");
  const [memProdi, setMemProdi] = useState<ProdiLamongan>("Teknik Informatika");
  const [memDivisi, setMemDivisi] = useState("div-bph");

  // State Berita Medinfo
  const [newsJudul, setNewsJudul] = useState("");
  const [newsKategori, setNewsKategori] =
    useState<Berita["kategori"]>("Kegiatan");
  const [newsIsi, setNewsIsi] = useState("");

  // State Respon Aspirasi
  const [aspResponseMap, setAspResponseMap] = useState<Record<string, string>>(
    {}
  );
  const [feedbackBanner, setFeedbackBanner] = useState("");

  // Jika User Biasa (Anggota HIMAKALA) mengakses /admin -> Tampilkan Form Login Biasa (Email & Password)
  if (!isKepengurusan || !currentUser) {
    return (
      <div className="mx-auto max-w-sm rounded-[24px] bg-white p-6 ink-card">
        <span className="rounded-full bg-[#FAD956] px-3 py-1 text-xs font-bold text-[#0B1938] ink-border">
          Login Kepengurusan
        </span>
        <h1 className="mt-3 font-display text-xl font-bold text-[#0B1938]">
          Masuk ke Workspace
        </h1>
        <p className="mt-1 text-xs text-[#3B4E73]">
          Role (`peran_pengguna`) dan akses divisi ditentukan otomatis dari
          database.
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoginError("");
            const res = await loginWithCredentials(loginEmail, loginPassword);
            if (!res.ok) {
              setLoginError(res.error || "Login gagal.");
            }
          }}
          className="mt-4 space-y-3"
        >
          <div>
            <label
              htmlFor="page-login-email"
              className="block text-xs font-bold text-[#0B1938]"
            >
              Email
            </label>
            <input
              id="page-login-email"
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="nama@himakala.ac.id"
              className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-2 text-xs text-[#0B1938] ink-border"
            />
          </div>

          <div>
            <label
              htmlFor="page-login-password"
              className="block text-xs font-bold text-[#0B1938]"
            >
              Password
            </label>
            <input
              id="page-login-password"
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-2 text-xs text-[#0B1938] ink-border"
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

          <button
            type="submit"
            className="w-full min-h-[42px] rounded-xl bg-[#026E9C] px-4 py-2 text-xs font-bold text-white ink-border"
          >
            Masuk
          </button>
        </form>
      </div>
    );
  }

  const defaultDivisiId = divisions[0]?.id || "div-bph";
  const resolvedProkerDivisi = divisions.some((d) => d.id === prokerDivisi)
    ? prokerDivisi
    : defaultDivisiId;
  const resolvedMemDivisi = divisions.some((d) => d.id === memDivisi)
    ? memDivisi
    : defaultDivisiId;

  // Hak Akses Pengurus yang Sedang Login
  const role = currentUser.peran;
  const isBphFullProker =
    role === "ketua_himakala" || role === "sekretaris" || role === "bendahara";
  const isKetuaHima = role === "ketua_himakala";
  const bebasIzinProker = canCrudProkerWithoutPermission(role);
  const lockedDivisiId = isBphFullProker
    ? resolvedProkerDivisi
    : currentDivision?.id || defaultDivisiId;

  // Filter proker yang boleh dikelola user saat ini
  const manageableProkers = prokers.filter((p) => {
    if (isBphFullProker) return true;
    return p.id_divisi === currentDivision?.id;
  });

  // Antrean perizinan untuk Ketua Divisi atau Ketua HIMAKALA
  const pendingApprovals = prokers.filter((p) => {
    if (p.status_izin !== "menunggu_izin_kabid") return false;
    if (isKetuaHima) return true;
    if (role === "ketua_divisi" && currentDivision) {
      return p.id_divisi === currentDivision.id;
    }
    return false;
  });

  function startEditProker(p: Proker) {
    setEditingProkerId(p.id);
    setProkerJudul(p.judul);
    setProkerDivisi(p.id_divisi);
    setProkerPic(p.pic);
    setProkerDeskripsi(p.deskripsi);
    setProkerStatus(p.status);
    setProkerProgres(p.progres);
  }

  function resetProkerForm() {
    setEditingProkerId(null);
    setProkerJudul("");
    setProkerPic("");
    setProkerDeskripsi("");
    setProkerStatus("direncanakan");
    setProkerProgres(0);
  }

  function handleSaveProker(e: React.FormEvent) {
    e.preventDefault();
    if (!prokerJudul.trim()) return;

    if (editingProkerId) {
      updateProker(editingProkerId, {
        judul: prokerJudul,
        deskripsi: prokerDeskripsi,
        pic: prokerPic || currentUser?.nama || "Pengurus",
        status: prokerStatus,
        progres: prokerProgres,
      });
      setFeedbackBanner(
        bebasIzinProker
          ? "Proker langsung diperbarui (Tanpa Izin)."
          : "Perubahan proker diajukan dan menunggu izin Ketua Divisi."
      );
    } else {
      createProker({
        judul: prokerJudul,
        deskripsi: prokerDeskripsi,
        tujuan: prokerDeskripsi,
        target_peserta: "Anggota HIMAKALA",
        id_divisi: lockedDivisiId,
        pic: prokerPic || currentUser?.nama || "Pengurus",
        tanggal_mulai: new Date().toISOString().slice(0, 10),
        tanggal_selesai: new Date().toISOString().slice(0, 10),
        status: prokerStatus,
        progres: prokerProgres,
      });
      setFeedbackBanner(
        bebasIzinProker
          ? "Proker baru langsung tayang (Tanpa Izin)."
          : "Proker baru diajukan dan menunggu izin Ketua Divisi."
      );
    }
    resetProkerForm();
  }

  return (
    <div className="space-y-5">
      {/* Header Status Hak Akses Kepengurusan */}
      <section className="ink-card flex flex-col justify-between gap-3 bg-[#0B1938] p-5 text-white sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#FAD956] px-3 py-0.5 text-xs font-bold text-[#0B1938]">
              Divisi {currentDivision?.nama || "BPH"}
            </span>
            <span className="rounded-full bg-[#152852] px-3 py-0.5 text-xs font-bold text-[#B8CBE8]">
              {getRoleLabel(role)}
            </span>
          </div>
          <h1 className="mt-2 font-display text-xl font-bold">
            Workspace Kepengurusan {currentDivision?.nama || "BPH"}
          </h1>
        </div>
        <div className="rounded-xl bg-[#152852] px-3.5 py-2 text-xs text-[#B8CBE8]">
          {bebasIzinProker ? (
            <span>
              Hak Akses:{" "}
              <strong className="text-[#FAD956]">
                CRUD Tanpa Perizinan Siapapun
              </strong>
            </span>
          ) : (
            <span>
              Hak Akses:{" "}
              <strong className="text-[#FAD956]">
                CRUD Atas Izin Ketua Divisi {currentDivision?.nama}
              </strong>
            </span>
          )}
        </div>
      </section>

      {feedbackBanner && (
        <div
          role="status"
          className="flex items-center justify-between rounded-xl bg-[#CCF2EA] px-4 py-2.5 text-xs font-bold text-[#0B1938] ink-border"
        >
          <span>{feedbackBanner}</span>
          <button
            type="button"
            onClick={() => setFeedbackBanner("")}
            className="underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* TAB 1: CRUD PROKER */}
      {activeTab === "proker" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <form
            onSubmit={handleSaveProker}
            className="ink-card space-y-3 bg-white p-5 lg:col-span-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#0B1938]">
                {editingProkerId ? "Edit Proker" : "Tambah Proker Baru"}
              </h2>
              {editingProkerId && (
                <button
                  type="button"
                  onClick={resetProkerForm}
                  className="text-xs font-bold text-[#026E9C] underline"
                >
                  Batal Edit
                </button>
              )}
            </div>

            <div>
              <label
                htmlFor="proker-divisi"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Divisi
              </label>
              <select
                id="proker-divisi"
                value={lockedDivisiId}
                disabled={!isBphFullProker}
                onChange={(e) => setProkerDivisi(e.target.value)}
                className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs font-bold text-[#0B1938] ink-border disabled:opacity-70"
              >
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="proker-judul"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Nama Program Kerja
              </label>
              <input
                id="proker-judul"
                type="text"
                required
                value={prokerJudul}
                onChange={(e) => setProkerJudul(e.target.value)}
                placeholder="Nama proker..."
                className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs text-[#0B1938] ink-border"
              />
            </div>

            <div>
              <label
                htmlFor="proker-pic"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Penanggung Jawab (PIC)
              </label>
              <input
                id="proker-pic"
                type="text"
                value={prokerPic}
                onChange={(e) => setProkerPic(e.target.value)}
                placeholder={currentUser.nama}
                className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs text-[#0B1938] ink-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label
                  htmlFor="proker-status"
                  className="block text-xs font-bold text-[#0B1938]"
                >
                  Status
                </label>
                <select
                  id="proker-status"
                  value={prokerStatus}
                  onChange={(e) =>
                    setProkerStatus(e.target.value as StatusProker)
                  }
                  className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
                >
                  <option value="direncanakan">Direncanakan</option>
                  <option value="berjalan">Berjalan</option>
                  <option value="selesai">Selesai</option>
                  <option value="batal">Dibatalkan</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="proker-progres"
                  className="block text-xs font-bold text-[#0B1938]"
                >
                  Progres ({prokerProgres}%)
                </label>
                <input
                  id="proker-progres"
                  type="number"
                  min={0}
                  max={100}
                  value={prokerProgres}
                  onChange={(e) => setProkerProgres(Number(e.target.value))}
                  className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="proker-desc"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Deskripsi Singkat
              </label>
              <textarea
                id="proker-desc"
                rows={2}
                value={prokerDeskripsi}
                onChange={(e) => setProkerDeskripsi(e.target.value)}
                placeholder="Ringkasan perkembangan proker..."
                className="mt-1 w-full rounded-xl bg-[#F5F8FC] p-2.5 text-xs text-[#0B1938] ink-border"
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full min-h-[42px] items-center justify-center gap-1.5 rounded-xl bg-[#026E9C] px-4 py-2 text-xs font-bold text-white ink-border"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {bebasIzinProker
                ? editingProkerId
                  ? "Simpan Perubahan (Tanpa Izin)"
                  : "Tambah Proker (Tanpa Izin)"
                : editingProkerId
                ? "Ajukan Update ke Ketua Divisi"
                : "Ajukan Proker ke Ketua Divisi"}
            </button>
          </form>

          <div className="ink-card space-y-3 bg-white p-5 lg:col-span-7">
            <h2 className="font-display text-base font-bold text-[#0B1938]">
              Daftar Proker ({manageableProkers.length})
            </h2>

            {manageableProkers.length === 0 ? (
              <p className="rounded-xl bg-[#F5F8FC] p-6 text-center text-xs text-[#3B4E73] ink-border">
                Belum ada program kerja. Silakan tambahkan melalui formulir di
                samping.
              </p>
            ) : (
              <div className="space-y-2.5">
                {manageableProkers.map((p) => {
                  const div = divisions.find((d) => d.id === p.id_divisi);
                  return (
                    <div
                      key={p.id}
                      className="rounded-2xl bg-[#F5F8FC] p-3.5 ink-border"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-full bg-[#0B1938] px-2.5 py-0.5 text-[10px] font-bold text-white">
                              {div?.nama || "Divisi"}
                            </span>
                            {p.status_izin === "menunggu_izin_kabid" ? (
                              <span className="rounded-full bg-[#FAD956] px-2.5 py-0.5 text-[10px] font-bold text-[#0B1938] ink-border">
                                Menunggu Izin Ketua Divisi ({p.aksi_pengajuan})
                              </span>
                            ) : (
                              <span className="rounded-full bg-[#CCF2EA] px-2.5 py-0.5 text-[10px] font-bold text-[#0B1938] ink-border">
                                Aktif / Disetujui
                              </span>
                            )}
                          </div>
                          <p className="mt-1 font-display text-sm font-bold text-[#0B1938]">
                            {p.judul}
                          </p>
                          <p className="text-[11px] text-[#3B4E73]">
                            PIC: {p.pic} • Progres: {p.progres}% ({p.status})
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEditProker(p)}
                            className="inline-flex min-h-[34px] items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-[#0B1938] ink-border hover:bg-[#FAD956]"
                          >
                            <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteProker(p.id);
                              setFeedbackBanner(
                                bebasIzinProker
                                  ? "Proker dihapus."
                                  : "Penghapusan proker diajukan ke Ketua Divisi."
                              );
                            }}
                            className="inline-flex min-h-[34px] items-center gap-1 rounded-xl bg-[#FEE2E2] px-2.5 py-1 text-xs font-bold text-[#0B1938] ink-border"
                          >
                            <Trash2
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PERIZINAN PROKER DIVISI (KHUSUS KETUA DIVISI & KETUA HIMAKALA) */}
      {activeTab === "izin" && (
        <div className="ink-card space-y-3 bg-white p-5">
          <h2 className="font-display text-base font-bold text-[#0B1938]">
            Antrean Perizinan CRUD Proker Pengurus Divisi (
            {pendingApprovals.length})
          </h2>

          {pendingApprovals.length === 0 ? (
            <p className="rounded-xl bg-[#F5F8FC] p-6 text-center text-xs text-[#3B4E73] ink-border">
              Tidak ada pengajuan CRUD proker yang menunggu perizinan.
            </p>
          ) : (
            <div className="space-y-2.5">
              {pendingApprovals.map((p) => {
                const div = divisions.find((d) => d.id === p.id_divisi);
                return (
                  <div
                    key={p.id}
                    className="flex flex-col justify-between gap-3 rounded-2xl bg-[#FAD956]/50 p-4 ink-border sm:flex-row sm:items-center"
                  >
                    <div>
                      <span className="rounded-full bg-[#0B1938] px-2.5 py-0.5 text-[10px] font-bold text-white">
                        {div?.nama} • Pengajuan:{" "}
                        {p.aksi_pengajuan?.toUpperCase()}
                      </span>
                      <p className="mt-1 font-display text-sm font-bold text-[#0B1938]">
                        {p.judul} ({p.progres}% • {p.status})
                      </p>
                      <p className="text-xs text-[#3B4E73]">
                        Diajukan oleh: {p.pengusul_nama || "Pengurus Divisi"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          approveProkerPermission(p.id);
                          setFeedbackBanner(
                            `Pengajuan proker "${p.judul}" telah disetujui.`
                          );
                        }}
                        className="inline-flex min-h-[38px] items-center gap-1 rounded-xl bg-[#CCF2EA] px-3.5 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        Beri Izin
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          rejectProkerPermission(p.id);
                          setFeedbackBanner(
                            `Pengajuan proker "${p.judul}" ditolak.`
                          );
                        }}
                        className="inline-flex min-h-[38px] items-center gap-1 rounded-xl bg-[#FEE2E2] px-3.5 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                        Tolak
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: KEUANGAN & ANGGARAN (BPH BENDAHARA & KETUA HIMAKALA) */}
      {activeTab === "keuangan" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!budgetProkerId) return;
              upsertBudgetByTreasurer({
                id_proker: budgetProkerId,
                rencana: budgetRencana,
                realisasi: budgetRealisasi,
                keterangan: budgetKeterangan,
              });
              setBudgetKeterangan("");
              setFeedbackBanner("Data anggaran berhasil disimpan.");
            }}
            className="ink-card space-y-3 bg-white p-5 lg:col-span-5"
          >
            <h2 className="font-display text-base font-bold text-[#0B1938]">
              Input Kas &amp; Anggaran Proker
            </h2>
            <div>
              <label
                htmlFor="ang-proker"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Pilih Proker
              </label>
              <select
                id="ang-proker"
                value={budgetProkerId}
                onChange={(e) => setBudgetProkerId(e.target.value)}
                required
                className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
              >
                <option value="">-- Pilih Proker --</option>
                {prokers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.judul}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label
                  htmlFor="ang-rencana"
                  className="block text-xs font-bold text-[#0B1938]"
                >
                  Rencana (Rp)
                </label>
                <input
                  id="ang-rencana"
                  type="number"
                  min={0}
                  value={budgetRencana}
                  onChange={(e) => setBudgetRencana(Number(e.target.value))}
                  className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
                />
              </div>
              <div>
                <label
                  htmlFor="ang-realisasi"
                  className="block text-xs font-bold text-[#0B1938]"
                >
                  Realisasi (Rp)
                </label>
                <input
                  id="ang-realisasi"
                  type="number"
                  min={0}
                  value={budgetRealisasi}
                  onChange={(e) => setBudgetRealisasi(Number(e.target.value))}
                  className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="ang-ket"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Keterangan Penggunaan
              </label>
              <input
                id="ang-ket"
                type="text"
                value={budgetKeterangan}
                onChange={(e) => setBudgetKeterangan(e.target.value)}
                placeholder="Rincian kas..."
                className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs text-[#0B1938] ink-border"
              />
            </div>
            <button
              type="submit"
              className="w-full min-h-[40px] rounded-xl bg-[#026E9C] px-4 py-2 text-xs font-bold text-white ink-border"
            >
              Simpan Anggaran
            </button>
          </form>

          <div className="ink-card space-y-2.5 bg-white p-5 lg:col-span-7">
            <h2 className="font-display text-base font-bold text-[#0B1938]">
              Daftar Anggaran ({budgets.length})
            </h2>
            {budgets.length === 0 ? (
              <p className="rounded-xl bg-[#F5F8FC] p-6 text-center text-xs text-[#3B4E73] ink-border">
                Belum ada data anggaran. Tambahkan proker terlebih dahulu lalu
                input anggarannya.
              </p>
            ) : (
              budgets.map((b) => {
                const prok = prokers.find((p) => p.id === b.id_proker);
                return (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-2xl bg-[#F5F8FC] p-3.5 ink-border"
                  >
                    <div>
                      <p className="font-display text-sm font-bold text-[#0B1938]">
                        {prok?.judul || "Proker"}
                      </p>
                      <p className="text-xs text-[#3B4E73]">
                        Rencana: {formatRupiah(b.rencana)} • Realisasi:{" "}
                        {formatRupiah(b.realisasi)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteBudget(b.id)}
                      className="rounded-xl bg-[#FEE2E2] px-2.5 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
                    >
                      Hapus
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DOKUMEN & SK (BPH SEKRETARIS & KETUA HIMAKALA) */}
      {activeTab === "dokumen" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!docJudul.trim()) return;
              uploadDocument({
                judul: docJudul,
                kategori: docKategori,
                nomor_dokumen: docNomor || "001/HIMAKALA/2026",
                ringkasan: docJudul,
                visibilitas: docVisibilitas,
              });
              setDocJudul("");
              setDocNomor("");
              setFeedbackBanner("Dokumen ditambahkan.");
            }}
            className="ink-card space-y-3 bg-white p-5 lg:col-span-5"
          >
            <h2 className="font-display text-base font-bold text-[#0B1938]">
              Tambah Dokumen / SK
            </h2>
            <div>
              <label
                htmlFor="doc-judul"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Judul Dokumen
              </label>
              <input
                id="doc-judul"
                type="text"
                required
                value={docJudul}
                onChange={(e) => setDocJudul(e.target.value)}
                className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs text-[#0B1938] ink-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label
                  htmlFor="doc-kat"
                  className="block text-xs font-bold text-[#0B1938]"
                >
                  Kategori
                </label>
                <select
                  id="doc-kat"
                  value={docKategori}
                  onChange={(e) =>
                    setDocKategori(e.target.value as KategoriDokumen)
                  }
                  className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
                >
                  <option value="AD_ART">AD/ART</option>
                  <option value="SK">SK</option>
                  <option value="LPJ">LPJ</option>
                  <option value="NOTULEN">Notulen</option>
                  <option value="SOP_PEDOMAN">SOP</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="doc-vis"
                  className="block text-xs font-bold text-[#0B1938]"
                >
                  Akses
                </label>
                <select
                  id="doc-vis"
                  value={docVisibilitas}
                  onChange={(e) =>
                    setDocVisibilitas(e.target.value as VisibilitasDokumen)
                  }
                  className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
                >
                  <option value="publik">Publik</option>
                  <option value="internal">Internal</option>
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor="doc-no"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Nomor Surat
              </label>
              <input
                id="doc-no"
                type="text"
                value={docNomor}
                onChange={(e) => setDocNomor(e.target.value)}
                placeholder="001/SK/HIMAKALA/2026"
                className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs text-[#0B1938] ink-border"
              />
            </div>
            <button
              type="submit"
              className="w-full min-h-[40px] rounded-xl bg-[#026E9C] px-4 py-2 text-xs font-bold text-white ink-border"
            >
              Simpan Dokumen
            </button>
          </form>

          <div className="ink-card space-y-2.5 bg-white p-5 lg:col-span-7">
            <h2 className="font-display text-base font-bold text-[#0B1938]">
              Daftar Dokumen ({documents.length})
            </h2>
            {documents.length === 0 ? (
              <p className="rounded-xl bg-[#F5F8FC] p-6 text-center text-xs text-[#3B4E73] ink-border">
                Belum ada dokumen yang diunggah.
              </p>
            ) : (
              documents.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-2xl bg-[#F5F8FC] p-3.5 ink-border"
                >
                  <div>
                    <p className="font-display text-sm font-bold text-[#0B1938]">
                      {d.judul}
                    </p>
                    <p className="text-xs text-[#3B4E73]">
                      {d.kategori} • {d.nomor_dokumen} ({d.visibilitas})
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleDocumentVisibility(d.id)}
                      className="rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-[#0B1938] ink-border"
                    >
                      Ubah Visibilitas
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteDocument(d.id)}
                      className="rounded-xl bg-[#FEE2E2] px-2.5 py-1 text-xs font-bold text-[#0B1938] ink-border"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: DATA PENGURUS 6 DIVISI (SEKRETARIS, PSDM, & KETUA HIMAKALA) */}
      {activeTab === "pengurus" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!memNama.trim() || !memJabatan.trim()) return;
              addMember({
                nama: memNama,
                jabatan: memJabatan,
                prodi: memProdi,
                id_divisi: resolvedMemDivisi,
              });
              setMemNama("");
              setMemJabatan("");
              setFeedbackBanner("Pengurus berhasil ditambahkan.");
            }}
            className="ink-card space-y-3 bg-white p-5 lg:col-span-5"
          >
            <h2 className="font-display text-base font-bold text-[#0B1938]">
              Tambah Pengurus Divisi
            </h2>
            <div>
              <label
                htmlFor="mem-divisi"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Divisi
              </label>
              <select
                id="mem-divisi"
                value={resolvedMemDivisi}
                onChange={(e) => setMemDivisi(e.target.value)}
                className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
              >
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="mem-nama"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Nama Lengkap
              </label>
              <input
                id="mem-nama"
                type="text"
                required
                value={memNama}
                onChange={(e) => setMemNama(e.target.value)}
                className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs text-[#0B1938] ink-border"
              />
            </div>
            <div>
              <label
                htmlFor="mem-jabatan"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Jabatan (Misal: Ketua BPH / Ketua Divisi / Staf)
              </label>
              <input
                id="mem-jabatan"
                type="text"
                required
                value={memJabatan}
                onChange={(e) => setMemJabatan(e.target.value)}
                className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs text-[#0B1938] ink-border"
              />
            </div>
            <div>
              <label
                htmlFor="mem-prodi"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Program Studi
              </label>
              <select
                id="mem-prodi"
                value={memProdi}
                onChange={(e) => setMemProdi(e.target.value as ProdiLamongan)}
                className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
              >
                <option value="Teknik Informatika">Teknik Informatika</option>
                <option value="Multimedia Broadcasting">
                  Multimedia Broadcasting
                </option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full min-h-[40px] rounded-xl bg-[#026E9C] px-4 py-2 text-xs font-bold text-white ink-border"
            >
              Simpan Pengurus
            </button>
          </form>

          <div className="ink-card space-y-2.5 bg-white p-5 lg:col-span-7">
            <h2 className="font-display text-base font-bold text-[#0B1938]">
              Daftar Pengurus ({members.length})
            </h2>
            {members.length === 0 ? (
              <p className="rounded-xl bg-[#F5F8FC] p-6 text-center text-xs text-[#3B4E73] ink-border">
                Belum ada pengurus yang ditambahkan.
              </p>
            ) : (
              members.map((m) => {
                const div = divisions.find((d) => d.id === m.id_divisi);
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-2xl bg-[#F5F8FC] p-3.5 ink-border"
                  >
                    <div>
                      <p className="font-display text-sm font-bold text-[#0B1938]">
                        {m.nama}
                      </p>
                      <p className="text-xs text-[#3B4E73]">
                        {m.jabatan} • Divisi {div?.nama} ({m.prodi})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteMember(m.id)}
                      className="rounded-xl bg-[#FEE2E2] px-2.5 py-1 text-xs font-bold text-[#0B1938] ink-border"
                    >
                      Hapus
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 6: PUBLIKASI BERITA (MEDINFO & KETUA HIMAKALA) */}
      {activeTab === "berita" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newsJudul.trim()) return;
              createNewsArticle({
                judul: newsJudul,
                ringkasan: newsIsi.slice(0, 100),
                isi: newsIsi,
                kategori: newsKategori,
              });
              setNewsJudul("");
              setNewsIsi("");
              setFeedbackBanner("Berita diterbitkan.");
            }}
            className="ink-card space-y-3 bg-white p-5 lg:col-span-5"
          >
            <h2 className="font-display text-base font-bold text-[#0B1938]">
              Terbitkan Berita Medinfo
            </h2>
            <div>
              <label
                htmlFor="news-judul"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Judul Berita
              </label>
              <input
                id="news-judul"
                type="text"
                required
                value={newsJudul}
                onChange={(e) => setNewsJudul(e.target.value)}
                className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs text-[#0B1938] ink-border"
              />
            </div>
            <div>
              <label
                htmlFor="news-kat"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Kategori
              </label>
              <select
                id="news-kat"
                value={newsKategori}
                onChange={(e) =>
                  setNewsKategori(e.target.value as Berita["kategori"])
                }
                className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
              >
                <option value="Kegiatan">Kegiatan</option>
                <option value="Pengumuman">Pengumuman</option>
                <option value="Prestasi">Prestasi</option>
                <option value="Transparansi">Transparansi</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="news-isi"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Isi Berita
              </label>
              <textarea
                id="news-isi"
                rows={3}
                required
                value={newsIsi}
                onChange={(e) => setNewsIsi(e.target.value)}
                className="mt-1 w-full rounded-xl bg-[#F5F8FC] p-2.5 text-xs text-[#0B1938] ink-border"
              />
            </div>
            <button
              type="submit"
              className="w-full min-h-[40px] rounded-xl bg-[#026E9C] px-4 py-2 text-xs font-bold text-white ink-border"
            >
              Terbitkan
            </button>
          </form>

          <div className="ink-card space-y-2.5 bg-white p-5 lg:col-span-7">
            <h2 className="font-display text-base font-bold text-[#0B1938]">
              Daftar Berita ({newsList.length})
            </h2>
            {newsList.length === 0 ? (
              <p className="rounded-xl bg-[#F5F8FC] p-6 text-center text-xs text-[#3B4E73] ink-border">
                Belum ada berita.
              </p>
            ) : (
              newsList.map((n) => (
                <div
                  key={n.id}
                  className="flex items-center justify-between rounded-2xl bg-[#F5F8FC] p-3.5 ink-border"
                >
                  <div>
                    <p className="font-display text-sm font-bold text-[#0B1938]">
                      {n.judul}
                    </p>
                    <p className="text-xs text-[#3B4E73]">
                      {n.kategori} • {n.tanggal}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteNewsArticle(n.id)}
                    className="rounded-xl bg-[#FEE2E2] px-2.5 py-1 text-xs font-bold text-[#0B1938] ink-border"
                  >
                    Hapus
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 7: ASPIRASI INTERNAL (DALAM NEGERI & KETUA HIMAKALA) */}
      {activeTab === "aspirasi" && (
        <div className="ink-card space-y-3 bg-white p-5">
          <h2 className="font-display text-base font-bold text-[#0B1938]">
            Daftar Aspirasi Anggota ({aspirations.length})
          </h2>
          {aspirations.length === 0 ? (
            <p className="rounded-xl bg-[#F5F8FC] p-6 text-center text-xs text-[#3B4E73] ink-border">
              Belum ada aspirasi yang dikirimkan anggota.
            </p>
          ) : (
            aspirations.map((asp) => (
              <div
                key={asp.id}
                className="rounded-2xl bg-[#F5F8FC] p-4 ink-border"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-[#0B1938]">
                    {asp.nomor_pelacakan} ({asp.kategori})
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteAspiration(asp.id)}
                    className="text-xs font-bold text-[#026E9C] underline"
                  >
                    Hapus
                  </button>
                </div>
                <p className="mt-1 text-xs text-[#0B1938]">{asp.isi}</p>
                <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
                  <label htmlFor={`resp-${asp.id}`} className="sr-only">
                    Tanggapan
                  </label>
                  <input
                    id={`resp-${asp.id}`}
                    type="text"
                    value={aspResponseMap[asp.id] ?? asp.tanggapan ?? ""}
                    onChange={(e) =>
                      setAspResponseMap((prev) => ({
                        ...prev,
                        [asp.id]: e.target.value,
                      }))
                    }
                    placeholder="Tulis tanggapan..."
                    className="flex-1 min-h-[38px] rounded-xl bg-white px-3 py-1.5 text-xs ink-border"
                  />
                  {(["diproses", "selesai"] as StatusAspirasi[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        respondToAspiration(
                          asp.id,
                          st,
                          aspResponseMap[asp.id] ?? asp.tanggapan ?? "Ditindaklanjuti."
                        );
                        setFeedbackBanner("Tanggapan aspirasi disimpan.");
                      }}
                      className="min-h-[38px] rounded-xl bg-[#0B1938] px-3 py-1.5 text-xs font-bold text-white"
                    >
                      Set {st}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 8: KELOLA AKUN PENGGUNA DATABASE (`public.pengguna` & Enum `peran_pengguna`) */}
      {activeTab === "pengguna" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!usrNama.trim() || !usrEmail.trim() || !usrPassword.trim())
                return;
              const resolvedDivId =
                usrPeran === "anggota"
                  ? null
                  : usrDivisi || divisions[0]?.id || null;
              await createUserAccount({
                nama: usrNama,
                email: usrEmail,
                password: usrPassword,
                peran: usrPeran,
                id_divisi: resolvedDivId,
              });
              setUsrNama("");
              setUsrEmail("");
              setUsrPassword("");
              setFeedbackBanner("Akun pengguna berhasil disimpan ke database.");
            }}
            className="ink-card space-y-3 bg-white p-5 lg:col-span-5"
          >
            <h2 className="font-display text-base font-bold text-[#0B1938]">
              Tambah Akun Pengguna
            </h2>
            <div>
              <label
                htmlFor="usr-nama"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Nama Pengguna
              </label>
              <input
                id="usr-nama"
                type="text"
                required
                value={usrNama}
                onChange={(e) => setUsrNama(e.target.value)}
                className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs text-[#0B1938] ink-border"
              />
            </div>
            <div>
              <label
                htmlFor="usr-email"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Email Login
              </label>
              <input
                id="usr-email"
                type="email"
                required
                value={usrEmail}
                onChange={(e) => setUsrEmail(e.target.value)}
                className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs text-[#0B1938] ink-border"
              />
            </div>
            <div>
              <label
                htmlFor="usr-pass"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Password Login
              </label>
              <input
                id="usr-pass"
                type="text"
                required
                value={usrPassword}
                onChange={(e) => setUsrPassword(e.target.value)}
                className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs text-[#0B1938] ink-border"
              />
            </div>
            <div>
              <label
                htmlFor="usr-peran"
                className="block text-xs font-bold text-[#0B1938]"
              >
                Role Pengguna (Database)
              </label>
              <select
                id="usr-peran"
                value={usrPeran}
                onChange={(e) => setUsrPeran(e.target.value as PeranPengguna)}
                className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
              >
                <option value="anggota">anggota (User Biasa)</option>
                <option value="pengurus_divisi">
                  pengurus_divisi (Pengurus Divisi)
                </option>
                <option value="ketua_divisi">ketua_divisi (Ketua Divisi)</option>
                <option value="sekretaris">sekretaris (Sekretaris BPH)</option>
                <option value="bendahara">bendahara (Bendahara BPH)</option>
                <option value="ketua_himakala">
                  ketua_himakala (Ketua HIMAKALA / Ketua BPH)
                </option>
              </select>
            </div>
            {usrPeran !== "anggota" && (
              <div>
                <label
                  htmlFor="usr-divisi"
                  className="block text-xs font-bold text-[#0B1938]"
                >
                  Divisi
                </label>
                <select
                  id="usr-divisi"
                  value={usrDivisi || divisions[0]?.id || ""}
                  onChange={(e) => setUsrDivisi(e.target.value)}
                  className="mt-1 w-full min-h-[40px] rounded-xl bg-[#F5F8FC] px-3 py-1.5 text-xs font-bold text-[#0B1938] ink-border"
                >
                  {divisions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nama}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="submit"
              className="w-full min-h-[40px] rounded-xl bg-[#026E9C] px-4 py-2 text-xs font-bold text-white ink-border"
            >
              Simpan Akun
            </button>
          </form>

          <div className="ink-card space-y-2.5 bg-white p-5 lg:col-span-7">
            <h2 className="font-display text-base font-bold text-[#0B1938]">
              Daftar Akun Pengguna ({users.length})
            </h2>
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-2xl bg-[#F5F8FC] p-3.5 ink-border"
              >
                <div>
                  <p className="font-display text-sm font-bold text-[#0B1938]">
                    {u.nama} ({u.email})
                  </p>
                  <p className="text-xs text-[#3B4E73]">
                    Enum Role: <strong>{u.peran}</strong> • Divisi:{" "}
                    {u.divisi_slug || "-"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteUserAccount(u.id)}
                  className="rounded-xl bg-[#FEE2E2] px-2.5 py-1 text-xs font-bold text-[#0B1938] ink-border"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
