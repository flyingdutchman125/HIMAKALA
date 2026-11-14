# Direktori Pustaka Inti & Utilitas (`src/lib/`)

Direktori ini berisi inisialisasi klien pihak ketiga (*singleton instances*) dan fungsi pembantu murni (*pure utility functions*) yang dipakai di seluruh aplikasi.

---

## Daftar Berkas

| Nama Berkas | Fungsi Utama |
| :--- | :--- |
| `supabase.ts` | Inisialisasi klien resmi `@supabase/supabase-js` dengan tipe generik `Database` dari `src/types/database.types.ts`. |
| `query-client.ts` | Konfigurasi `QueryClient` untuk `@tanstack/react-query` (pengaturan `staleTime`, `retry`, dan penanganan error global). |
| `utils.ts` | Fungsi `cn()` (`clsx` + `tailwind-merge`) untuk penggabungan kelas Tailwind CSS secara kondisional (dipertahankan dari repo lama). |
| `formatters.ts` | Fungsi pemformatan mata uang Rupiah (`formatRupiah`), tanggal Bahasa Indonesia (`formatTanggalIndo` dengan `date-fns/locale/id`), dan ukuran berkas (`formatFileSize`). |
| `tracking-code.ts` | Fungsi pembangkit dan validator format nomor pelacakan aspirasi (`ASP-YYYY-XXXX`). |
| `animation-variants.ts` | Konfigurasi varian animasi `framer-motion` yang diadaptasi dari repo lama dengan dukungan `reducedMotion`. |

---

## Contoh Konfigurasi `src/lib/supabase.ts`

```ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Variabel lingkungan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY wajib diisi.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

