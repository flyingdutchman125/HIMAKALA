# Direktori Aset Media Terbundel (`src/assets/`)

Direktori ini berisi aset gambar resmi dan media identitas visual yang diimpor langsung ke dalam komponen React dan diproses oleh bundel Vite.

---

## Aset Resmi yang Dipertahankan (Bagian 2.1 & 12 PRD)

| Berkas | Deskripsi | Penggunaan Utama |
| :--- | :--- | :--- |
| `himakala-logo.png` | Logo resmi Himpunan Mahasiswa PSDKU Lamongan (HIMAKALA) | Navbar, Hero Beranda, Footer, Halaman Profil, Halaman Login Admin |
| `pens-logo.png` | Logo resmi Politeknik Elektronika Negeri Surabaya (PENS) | Header pendamping, Footer, Halaman Profil & Kerja Sama |

---

## Panduan Penggunaan & Optimasi Performa

### 1. Cara Mengimpor Aset di Komponen
Selalu sertakan atribut `width`, `height`, dan teks alternatif `alt` yang deskriptif untuk memenuhi kebutuhan non-fungsional aksesibilitas dan mencegah pergeseran tata letak (*Cumulative Layout Shift*):

```tsx
import himakalaLogo from "@/assets/himakala-logo.png";
import pensLogo from "@/assets/pens-logo.png";

export function BrandLogos() {
  return (
    <div className="flex items-center gap-3">
      <img
        src={himakalaLogo}
        alt="Logo HIMAKALA PSDKU Lamongan"
        width={44}
        height={44}
        className="h-11 w-11 object-contain"
      />
      <img
        src={pensLogo}
        alt="Logo Politeknik Elektronika Negeri Surabaya"
        width={44}
        height={44}
        className="h-11 w-11 object-contain"
      />
    </div>
  );
}
```

### 2. Pemisahan Aset Statis vs Konten Dinamis
- **Simpan di `src/assets/`:** Hanya untuk aset identitas tetap yang menjadi bagian dari kode antarmuka (logo himpunan, logo kampus, ikon vektor khusus).
- **Simpan di Supabase Storage:** Foto pengurus tiap periode, poster kegiatan/proker, dokumentasi galeri, dan berkas PDF dokumen resmi **tidak boleh** dimasukkan ke `src/assets/` agar pengurus dapat memperbaruinya dari Panel Admin tanpa harus mengubah kode dan melakukan *re-deploy*.

