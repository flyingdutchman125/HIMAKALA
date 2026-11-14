# Direktori Komponen Bersama (`src/components/shared/`)

Direktori ini berisi komponen fungsional tingkat menengah yang digunakan secara berulang oleh lebih dari satu modul di `src/features/`.

---

## Daftar Komponen Bersama

| Nama File | Kegunaan |
| :--- | :--- |
| `EmptyState.tsx` | Tampilan standar ketika daftar data kosong (misal: belum ada proker pada filter divisi tertentu atau belum ada dokumen LPJ), lengkap dengan ikon relevan, pesan jelas, dan tombol aksi opsional. |
| `LoadingState.tsx` | Komponen kerangka muat (*skeleton loader*) terstandarisasi untuk kartu, tabel, dan halaman detail. |
| `ErrorState.tsx` | Tampilan ketika pengambilan data dari Supabase gagal, menampilkan pesan yang ramah pengguna dan tombol **Coba Lagi** (`refetch`). |
| `StatusBadge.tsx` | Lencana status terstandarisasi dengan warna dan ikon yang konsisten (bukan hanya warna saja demi aksesibilitas) untuk status proker (`direncanakan`, `berjalan`, `selesai`, `batal`), status aspirasi (`diterima`, `diproses`, `selesai`), dan status persetujuan anggaran (`draft`, `menunggu_persetujuan`, `disetujui`, `revisi`). |
| `PeriodSelector.tsx` | Pemilih dropdown periode kepengurusan (misal: `2026/2027 (Aktif)`, `2025/2026`) yang digunakan di halaman Struktur, Proker, Keuangan, dan Dokumen. |
| `FileUploader.tsx` | Komponen unggah berkas ke Supabase Storage dengan validasi tipe berkas (PDF untuk dokumen, WebP/PNG/JPG untuk foto) dan batas ukuran maksimal sebelum diunggah. |
| `DataTable.tsx` | Tabel data yang dilengkapi fitur pencarian kata kunci, filter kolom, pengurutan, dan paginasi untuk halaman publik maupun Panel Admin. |
| `ConfirmDialog.tsx` | Dialog konfirmasi sebelum melakukan tindakan krusial (menghapus data, menyetujui laporan keuangan untuk publikasi, atau mengubah periode aktif). |

---

## Contoh Penggunaan

```tsx
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";

if (isLoading) return <LoadingState variant="card-grid" count={6} />;
if (isError) return <ErrorState message="Gagal memuat daftar program kerja." onRetry={refetch} />;
if (!prokerList.length) {
  return (
    <EmptyState
      title="Belum Ada Program Kerja"
      description="Tidak ditemukan program kerja untuk filter periode dan divisi yang dipilih."
    />
  );
}
```

