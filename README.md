# Undangan Pernikahan Digital — Ayu & Bagas

Undangan pernikahan digital satu halaman. Seluruhnya berupa satu berkas
`index.html` yang berdiri sendiri: font ter-embed sebagai base64, ilustrasi
memakai SVG inline, dan musik latar dibangkitkan lewat Web Audio API. Tidak ada
CDN, tidak ada berkas gambar/audio terpisah, tidak ada proses build.

## Menjalankan

Buka `index.html` langsung di browser, atau jalankan server statis:

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

## Nama tamu otomatis

Tambahkan parameter `?to=` pada URL untuk menampilkan nama tamu di halaman sampul:

```
index.html?to=Bapak%20Budi%20Santoso
```

Tanpa parameter, yang tampil adalah teks bawaan "Tamu Undangan Kami".

## Bagian halaman

| Bagian | Isi |
| --- | --- |
| `#hero` | Nama mempelai dan hitung mundur ke hari-H |
| `#quote` | Salam pembuka dan kutipan Q.S. Ar-Rum : 21 |
| `#couple` | Profil kedua mempelai beserta nama orang tua |
| `#events` | Ijab Kabul dan Ramah Tamah, dengan tautan Google Calendar |
| `#venue` | Nama dan alamat lokasi, tautan Google Maps |
| `#story` | Lini masa perjalanan hubungan |
| `#gallery` | Galeri foto |
| `#gift` | Rekening dan e-wallet untuk hadiah, dengan tombol salin |
| `#rsvp` | Formulir konfirmasi kehadiran |
| `#wishes` | Ucapan dan doa dari tamu |
| `#closing` | Penutup dan tagar |

## Mengubah isi undangan

Hampir semua teks diatur lewat objek `CONFIG` di dalam blok `<script>` pada
`index.html` — cari `const CONFIG = {`. Di sana tersimpan nama mempelai, nama
orang tua, akun Instagram, tanggal dan jam acara, lokasi, tagar, batas RSVP,
lini masa, serta daftar rekening hadiah.

Elemen bertanda `data-bind="..."` pada HTML terisi otomatis dari `CONFIG`,
jadi cukup ubah `CONFIG` dan seluruh halaman ikut menyesuaikan.

## Catatan teknis

- **RSVP dan ucapan** disimpan di `localStorage` browser masing-masing tamu,
  sehingga hanya terlihat oleh tamu itu sendiri. Untuk mengumpulkan data secara
  terpusat diperlukan backend atau layanan formulir.
- **Musik latar** dibangkitkan secara generatif oleh Web Audio API, bukan berkas
  MP3, sehingga bebas masalah hak cipta. Cara menggantinya dengan lagu sendiri
  dijelaskan pada komentar di dekat kode musik.
- **Foto mempelai dan galeri** masih berupa placeholder. Isi `bride.photo` dan
  `groom.photo` pada `CONFIG` dengan URL atau data URI untuk menggantinya.
