# Modul Autentikasi & Hak Akses Peran (`src/features/auth/`)

Modul ini menangani autentikasi pengurus dan sistem otorisasi berbasis peran (*Role-Based Access Control* / RBAC) untuk memenuhi kebutuhan **`FA-01`** serta menutup celah keamanan pintasan `Ctrl+Shift+A` tanpa login pada repositori lama.

---

## Kebutuhan Fungsional yang Dicakup

- **`FA-01` (Prioritas Tinggi):** Login aman dengan 6 peran resmi:
  1. `super_admin` (Super Admin)
  2. `ketua` (Ketua Himpunan)
  3. `sekretaris` (Sekretaris)
  4. `bendahara` (Bendahara)
  5. `kepala_divisi` (Kepala Divisi / Koordinator Divisi)
  6. `editor` (Editor Media & Publikasi)

---

## Struktur Berkas yang Direkomendasikan

```text
src/features/auth/
├── README.md
├── components/
│   ├── LoginForm.tsx           # Form login email & password dengan validasi Zod
│   ├── ProtectedRoute.tsx      # Pembungkus rute /admin/* yang memeriksa sesi login & peran
│   ├── RoleGate.tsx            # Komponen kondisional untuk menyembunyikan tombol aksi di luar wewenang peran
│   └── UserRoleManager.tsx     # Tabel manajemen akun pengurus & status aktif (khusus Super Admin & Ketua)
├── hooks/
│   ├── useAuthSession.ts       # Hook pemantau sesi Supabase Auth & profil tabel `pengguna`
│   └── usePermissions.ts       # Hook pemeriksa izin spesifik (misal: `canInputBudget`, `canApproveFinance`)
└── schemas/
    └── auth.schema.ts          # Skema Zod untuk login dan pembuatan akun pengurus
```

---

## Aturan Keamanan & Penggunaan

1. **Verifikasi Ganda (UI + Database RLS):**
   - Komponen `<ProtectedRoute allowedRoles={[...]} />` dan `<RoleGate />` mencegah akses di tingkat tampilan React.
   - Kebijakan Row Level Security (RLS) di PostgreSQL Supabase tetap wajib memverifikasi peran pengguna pada setiap operasi tulis (`INSERT`/`UPDATE`/`DELETE`).
2. **Contoh Penggunaan `<RoleGate />`:**
   ```tsx
   import { RoleGate } from "@/features/auth/components/RoleGate";

   // Hanya Ketua dan Super Admin yang melihat tombol Setujui Publikasi Keuangan (FA-10)
   <RoleGate allowedRoles={["super_admin", "ketua"]}>
     <Button onClick={handleApproveFinance}>Setujui & Publikasikan</Button>
   </RoleGate>
   ```

