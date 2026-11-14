# Direktori Sistem Desain & Gaya Visual (`src/styles/`)

Direktori ini menyimpan konfigurasi CSS global, variabel warna HSL, token gradient, dan aturan tipografi yang **dipertahankan dari repositori lama** sesuai **Bagian 2.1 dan 12 PRD**, disertai penyempurnaan kontras aksesibilitas dan dukungan `prefers-reduced-motion`.

---

## Identitas Visual yang Dipertahankan dari Repo Lama

### 1. Tipografi
- **Heading (`font-display`):** `Space Grotesk` (bobot 500, 600, 700) untuk memberikan karakter teknologi dan kreatif yang mewakili mahasiswa Teknik Informatika dan Multimedia Broadcasting.
- **Body (`font-sans`):** `Outfit` (bobot 300, 400, 500, 600) untuk keterbacaan optimal pada tabel keuangan, daftar proker, dan dokumen panjang di layar ponsel.

### 2. Palet Warna Inti (HSL Tokens)
| Token Variabel CSS | Nilai HSL | Kegunaan |
| :--- | :--- | :--- |
| `--background` | `220 20% 10%` | Latar belakang utama aplikasi |
| `--foreground` | `210 40% 98%` | Warna teks utama (rasio kontras tinggi > 14:1) |
| `--card` | `220 20% 14%` | Latar kartu komponen dan panel tabel |
| `--primary` | `210 80% 45%` | Warna biru identitas utama HIMAKALA / PENS |
| `--primary-glow` | `195 85% 55%` | Warna aksen sian pendamping gradient |
| `--accent` | `45 95% 58%` | Warna kuning/emas aksen sorotan utama |
| `--muted-foreground` | `215 20% 70%` | Teks sekunder (disesuaikan agar memenuhi kontras WCAG AA >= 4.5:1 di atas `--card`) |

### 3. Token Gradient Resmi
- `--gradient-primary`: `linear-gradient(135deg, hsl(210 80% 45%) 0%, hsl(195 85% 55%) 100%)`
- `--gradient-accent`: `linear-gradient(135deg, hsl(45 95% 58%) 0%, hsl(35 90% 50%) 100%)`
- `--gradient-hero`: `linear-gradient(180deg, hsl(220 20% 8%) 0%, hsl(220 20% 12%) 50%, hsl(220 20% 10%) 100%)`

---

## Aturan Aksesibilitas & Reduced Motion Wajib (Bagian 7 PRD)

Di dalam `src/styles/globals.css` (atau `src/index.css`), blok berikut wajib disertakan untuk mematikan animasi dekoratif pada perangkat pengguna yang mengaktifkan pengurangan gerak:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

