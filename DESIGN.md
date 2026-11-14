# DESIGN.md: Sistem Desain HIMAKALA (HIMAKALA Official Logo Palette & Crisp Navy Shell)

## Design Read
Reading this as: portal transparansi dan sistem informasi organisasi mahasiswa (**HIMAKALA PENS PSDKU Lamongan**) untuk mahasiswa Teknik Informatika dan Multimedia Broadcasting, pengurus himpunan 6 divisi, dosen pembina, serta mitra eksternal, dengan bahasa visual **HIMAKALA Official Logo Palette & Crisp Navy Shell** yang diturunkan langsung dari warna anatomi logo resmi HIMAKALA (`frontend/src/assets/himakala-logo.png`), dial **ENERGY 2 / RHYTHM 2 / MOTION 1**.

## Tiga Dial Liveliness
- **ENERGY: 2 (Balanced)** - Antarmuka menggunakan kontras tegas antara bingkai **Deep Navy** (`#0B1938` dari roda gigi gelap & tulisan `"HIMAKA"`), kanvas **Cool Ice White** (`#F5F8FC`), kartu kategori berbatas tinta navy (`1.5px solid #0B1938`), lencana aktif **Golden Fish Yellow** (`#FAD956` dari ikan emas pada logo), serta satu aksen tombol utama **HIMAKALA Cyan-Blue** (`#026E9C` dari roda gigi biru muda & tulisan `"LA"`).
- **RHYTHM: 2 (Consistent with deliberate breaks)** - Setiap halaman dibuka dengan baris kartu sorotan 3 kolom (atau ikhtisar metrik nyata), diikuti pembagian asimetris 2/3 (daftar/tabel bernomor `01.`, `02.`, `03.`) dan 1/3 (panel sorotan **Deep Navy** `#0B1938` untuk aksi utama), di dalam bingkai statis dengan hanya area `<main>` yang dapat digulir (*inner scroll only*).
- **MOTION: 1 (Calm / Hover & Focus states only)** - Transisi hanya digunakan pada umpan balik interaksi (`hover`, `active`, `focus-visible`, dan pembukaan dialog) serta mati sepenuhnya pada `prefers-reduced-motion: reduce`.

## Palet Warna Logo HIMAKALA & Bukti Kontras WCAG AA
1. **Kanvas Utama (`#F5F8FC` Cool Ice White) & Teks/Batas Utama (`#0B1938` Deep Navy):** Rasio **16.29:1** (Lulus AAA).
2. **Teks Sekunder (`#3B4E73` Muted Slate-Navy) di atas `#F5F8FC`:** Rasio **7.81:1** (Lulus AAA).
3. **Kartu Golden Fish (`#FAD956` dari Ikan Emas Logo) dengan Teks `#0B1938`:** Rasio **12.50:1** (Lulus AAA).
4. **Kartu Sky Cyan Gear (`#C8ECFA` dari Roda Gigi Cyan & `"LA"`) dengan Teks `#0B1938`:** Rasio **13.91:1** (Lulus AAA).
5. **Kartu Royal Blue Shark (`#D8E4FC` dari Ikan Hiu Biru Logo) dengan Teks `#0B1938`:** Rasio **13.57:1** (Lulus AAA).
6. **Kartu Aqua Mint (`#CCF2EA`) dengan Teks `#0B1938`:** Rasio **14.42:1** (Lulus AAA).
7. **Shell Navigasi & Kartu Sorotan Deep Navy (`#0B1938`) dengan Teks Putih (`#FFFFFF`):** Rasio **17.35:1** (Lulus AAA) dan Teks Sekunder Ice Blue (`#B8CBE8`): Rasio **10.53:1** (Lulus AAA).
8. **Aksen Tombol Utama HIMAKALA Cyan-Blue (`#026E9C`) dengan Teks Putih (`#FFFFFF`):** Rasio **5.66:1** (Lulus AA teks normal & besar) dan state hover `#01587E`: Rasio **7.78:1** (Lulus AAA).

## Alasan Satu Baris untuk Setiap Keputusan Visual (R-31)
- **Mengapa palet warna ini:** Menyelaraskan seluruh komponen UI dengan 4 warna anatomi logo resmi HIMAKALA (Deep Navy `#0B1938` dari `"HIMAKA"` & roda gigi gelap, Cyan-Blue `#026E9C` / `#C8ECFA` dari `"LA"` & roda gigi biru muda, Golden Yellow `#FAD956` dari ikan emas bawah, serta Royal Blue `#152852` / `#D8E4FC` dari ikan hiu atas) sambil menjaga rasio kontras WCAG AA/AAA.
- **Mengapa tata letak ini:** Menggunakan kerangka aplikasi berlapis (`h-screen overflow-hidden`) dengan sidebar navigasi vertikal Deep Navy statis di kiri dan area konten dalam (`<main className="overflow-y-auto">`) di kanan agar navigasi selalu terjangkau saat menggulir daftar proker dan anggaran.
- **Mengapa tipografi ini:** Memadukan `Space Grotesk` pada judul dan angka bernomor (`01.`, `02.`) untuk ketegasan struktural dengan `Outfit` pada teks isi dan tabel agar nyaman dibaca di layar ponsel maupun desktop.
- **Mengapa jarak (spacing) ini:** Menggunakan skala ruang terukur (`16px` pada layar ponsel, `20px–24px` pada tablet dan desktop) untuk memisahkan kelompok informasi secara struktural.
- **Mengapa menggunakan kartu berbatas tinta navy (`1.5px solid #0B1938`):** Garis tepi tegas memisahkan setiap program kerja dan pos anggaran dengan rasio kontras non-teks > 16:1 tanpa bergantung pada bayangan kabur (*soft shadow*).
- **Mengapa menggunakan lencana & ikon ini:** Setiap lencana menampilkan status fungsional nyata (`Direncanakan`, `Sedang Berjalan`, `Selesai`, `Disetujui Ketua`, `Menunggu Izin Ketua Divisi`) yang dipasangkan dengan ikon relevan dan teks eksplisit, bukan sekadar warna.
- **Mengapa menggunakan avatar inisial:** Menghindari foto wajah fiktif/AI sesuai aturan R-18 dan R-23 dengan menampilkan inisial nama pengurus terverifikasi di dalam lingkaran berbatas tegas.
