# Direktori Efek Visual (`src/components/effects/`)

Direktori ini menampung komponen efek visual dekoratif (`Scene3D` berbasis `three.js` dan `ParticleBackground` berbasis `tsparticles`) yang diadaptasi dari repositori lama dengan pengoptimalan performa ketat sesuai **Bagian 2.1, 7, dan 10 PRD**.

---

## Masalah pada Repo Lama & Aturan Baru di Rebuild

- **Masalah Lama:** Pada repositori lama, `Scene3D.tsx` dan `ParticleBackground.tsx` dimuat secara sinkron di bundel utama dan selalu aktif di seluruh halaman, menyebabkan beban CPU/GPU tinggi serta waktu muat lambat pada ponsel dan perangkat lama.
- **Aturan Wajib pada Rebuild:**
  1. **Lazy Loading (`React.lazy`):** Komponen di dalam folder ini **dilarang** diimpor secara statis di halaman utama. Wajib menggunakan `React.lazy(() => import("@/components/effects/Scene3D"))` di dalam `<Suspense fallback={null}>`.
  2. **Hanya di Bagian Hero Beranda:** Efek 3D dan partikel hanya boleh dipasang pada bagian Hero di halaman Beranda (`/`), tidak boleh dipasang di halaman tabel transparansi, dokumen, maupun Panel Admin.
  3. **Mati Otomatis pada `prefers-reduced-motion` & Perangkat Lemah:**
     - Wajib memeriksa hook `useReducedMotion()` (`window.matchMedia("(prefers-reduced-motion: reduce)")`).
     - Wajib memeriksa kemampuan perangkat (misal: `navigator.hardwareConcurrency <= 4` atau layar ponsel kecil jika frame rate turun) dan merender latar gradient CSS ringan (`bg-gradient-hero`) sebagai gantinya.
  4. **Kontrol Pause / Sakelar Opsional:** Sediakan kontrol untuk menghentikan animasi yang berjalan terus-menerus demi kenyamanan aksesibilitas pengguna.

---

## Daftar Komponen

| Nama File | Deskripsi |
| :--- | :--- |
| `Scene3D.tsx` | Kanvas `@react-three/fiber` untuk elemen geometris interaktif di latar Hero Beranda (dimuat secara *async chunk*). |
| `ParticleBackground.tsx` | Latar partikel ringan menggunakan `@tsparticles/slim` dengan jumlah partikel dibatasi maksimal 25 titik. |
| `HeroVisualWrapper.tsx` | Komponen pembungkus cerdas yang mengevaluasi `prefers-reduced-motion`, variabel lingkungan `VITE_ENABLE_3D_HERO`, dan ukuran layar sebelum memutuskan apakah akan memuat `Scene3D` atau menampilkan latar CSS statis. |

---

## Contoh Implementasi Lazy Loading yang Benar

```tsx
import { lazy, Suspense } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const Scene3D = lazy(() => import("@/components/effects/Scene3D"));

export function HeroBackground() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className="absolute inset-0 bg-gradient-hero" aria-hidden="true" />;
  }

  return (
    <Suspense fallback={<div className="absolute inset-0 bg-gradient-hero" aria-hidden="true" />}>
      <Scene3D />
    </Suspense>
  );
}
```

