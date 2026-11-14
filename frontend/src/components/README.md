# Direktori Komponen UI (`src/components/`)

Direktori ini menyimpan seluruh komponen antarmuka yang bersifat lintas halaman atau lintas fitur. Komponen yang spesifik terhadap satu domain bisnis (misalnya tabel rincian anggaran atau kartu proker) ditempatkan di dalam `src/features/<nama-fitur>/components/`.

---

## Struktur Sub-Direktori

```text
src/components/
├── README.md               # Panduan umum arsitektur komponen (file ini)
├── ui/                     # Komponen dasar primitif shadcn/ui + Radix UI
│   └── README.md
├── layout/                 # Kerangka tata letak halaman publik & admin (Navbar, Footer, Sidebar)
│   └── README.md
├── shared/                 # Komponen fungsional bersama lintas fitur (StatusBadge, EmptyState, dll.)
│   └── README.md
└── effects/                # Efek visual 3D & partikel yang dimuat secara lazy
    └── README.md
```

---

## Aturan Desain & Aksesibilitas Komponen (Bagian 7 PRD)

1. **Mobile-First & Target Sentuh:**
   - Mayoritas mahasiswa mengakses situs melalui ponsel. Pastikan tidak ada elemen yang meluap secara horizontal (*horizontal overflow*).
   - Setiap tombol dan tautan interaktif wajib memiliki ukuran area sentuh minimal `44x44px` pada layar seluler.
2. **Navigasi Keyboard & Indikator Fokus:**
   - Seluruh elemen interaktif (`Button`, `Dialog`, `Select`, `Tabs`, `DropdownMenu`) wajib dapat dioperasikan dengan tombol `Tab`, `Enter`/`Space`, dan `Escape`.
   - Jangan menghapus indikator `focus-visible` tanpa menggantinya dengan cincin fokus yang jelas (`focus-visible:ring-2 focus-visible:ring-ring`).
3. **Kontras Warna Memadai:**
   - Pastikan rasio kontras teks terhadap latar belakang memenuhi standar WCAG AA (minimal `4.5:1` untuk teks normal dan `3:1` untuk teks besar).

