# Fungsi Sinkronisasi Berita PENS (`backend/functions/sync-pens-news/`)

Fungsi ini menggantikan mekanisme pengambilan berita di browser pada repositori lama (`BeritaSection.tsx`) sesuai **Bagian 2.1 dan Bagian 10 PRD**.

---

## Latar Belakang Masalah pada Repo Lama

Pada repositori lama, browser pengunjung melakukan `fetch` langsung ke `https://www.pens.ac.id/` lalu mem-parsing HTML di sisi klien. Pendekatan tersebut memiliki dua kelemahan fatal:
1. Sering terblokir oleh aturan **CORS** browser.
2. Berita yang tampil adalah berita umum kampus, bukan berita resmi yang dikurasi oleh HIMAKALA PSDKU Lamongan.

---

## Cara Kerja Fungsi `sync-pens-news`

1. Hanya dapat dipanggil oleh pengurus dengan peran `editor`, `sekretaris`, `ketua`, atau `super_admin` dari Panel Admin.
2. Mengambil feed/halaman berita resmi PENS dari sisi server (bebas kendala CORS).
3. Menyimpan berita yang relevan dengan kata kunci `PSDKU Lamongan`, `Teknik Informatika`, atau `Multimedia Broadcasting` ke tabel `berita` dengan `status_terbit = false` (sebagai **draf**).
4. Editor HIMAKALA meninjau draf tersebut di Panel Admin (`/admin/berita`) sebelum menerbitkannya ke halaman publik.

