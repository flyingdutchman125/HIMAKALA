# Modul Aspirasi & Pelacakan Tindak Lanjut (`src/features/aspirations/`)

Modul ini menyediakan kanal resmi bagi mahasiswa untuk menyampaikan aspirasi, saran, maupun pengaduan kepada pengurus HIMAKALA (termasuk opsi **100% anonim**) serta memantau perkembangan tindak lanjutnya secara transparan menggunakan nomor pelacakan unik.

---

## Kebutuhan Fungsional yang Dicakup

- **`FP-11` (Tinggi):** Formulir aspirasi dan pengaduan (dengan opsi anonim) yang menghasilkan nomor pelacakan (*tracking number*).
- **`FP-12` (Sedang):** Halaman pelacakan status aspirasi (`diterima`, `diproses`, `selesai`) beserta tanggapan resmi himpunan.
- **`FA-06` (Tinggi):** Manajemen aspirasi di Panel Admin: membaca aspirasi masuk, mengubah status tindak lanjut, dan menulis balasan/tanggapan resmi.

---

## Jaminan Privasi & Keamanan (Bagian 7 PRD)

1. **Opsi Anonim Sejati:**
   - Saat mahasiswa mengaktifkan sakelar **Kirim Sebagai Anonim**, field nama dan kontak disembunyikan serta dikosongkan (`null`) sebelum dikirim ke server.
   - Sistem tidak mengaitkan pengiriman anonim dengan akun, cookie pelacak, ataupun alamat IP pengirim.
2. **Nomor Pelacakan Unik:**
   - Setiap aspirasi yang berhasil dikirim menghasilkan kode tiket unik (contoh: `ASP-2026-9K4M`) yang dapat disalin dengan satu klik untuk dicek kapan saja di halaman `/aspirasi/lacak`.
3. **Pembatasan Laju (*Rate Limiting*):**
   - Pengiriman form dilindungi *cooldown* dan validasi server pada Edge Function `submit-aspiration` untuk mencegah spam atau penyalahgunaan.

---

## Struktur Berkas yang Direkomendasikan

```text
src/features/aspirations/
├── README.md
├── components/
│   ├── AspirationSubmitForm.tsx    # Form pengiriman aspirasi dengan sakelar Anonim (FP-11)
│   ├── TrackingCodeReceipt.tsx     # Kartu bukti pengiriman berisi Nomor Pelacakan & tombol Salin Kode
│   ├── AspirationTrackerView.tsx   # Pencarian nomor pelacakan & linimasa status tindak lanjut (FP-12)
│   └── AdminAspirationInbox.tsx    # Kotak masuk aspirasi bagi pengurus untuk membalas & ubah status (FA-06)
├── hooks/
│   ├── useTrackAspiration.ts       # Query status aspirasi berdasarkan `nomor_pelacakan`
│   └── useManageAspirations.ts     # Query & Mutation tindak lanjut aspirasi untuk pengurus (target respons < 7 hari)
└── schemas/
    └── aspiration.schema.ts        # Skema Zod dengan aturan kondisional anonim vs non-anonim
```

