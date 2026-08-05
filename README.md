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

## Supabase (Database)

RSVP dan ucapan disimpan secara terpusat di Supabase, sehingga semua tamu
dapat melihat ucapan satu sama lain.

### Setup

1. Buat proyek baru di [supabase.com](https://supabase.com) (atau gunakan yang sudah ada).
2. Jalankan SQL migration di **SQL Editor** Supabase:
   - Buka file `supabase/migrations/20260805_create_wishes.sql`
   - Salin isinya ke SQL Editor, lalu klik **Run**
3. Salin **Project URL** dan **anon public key** dari
   Settings → API di dashboard Supabase.
4. Buka `index.html`, cari baris berikut, lalu ganti:
   ```js
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```

### Keamanan

Tabel `wishes` menggunakan Row Level Security (RLS):
- **SELECT**: siapa pun boleh membaca
- **INSERT**: siapa pun boleh mengirim ucapan
- Tidak ada akses UPDATE/DELETE dari sisi klien

## Vercel (Deployment)

Proyek ini siap di-deploy ke Vercel sebagai situs statis.

1. Hubungkan repo GitHub ini ke [vercel.com](https://vercel.com).
2. Vercel akan otomatis mendeteksi konfigurasi dari `vercel.json`.
3. Setiap push ke branch utama akan otomatis di-deploy.

## Catatan teknis

- **Musik latar** dibangkitkan secara generatif oleh Web Audio API, bukan berkas
  MP3, sehingga bebas masalah hak cipta. Cara menggantinya dengan lagu sendiri
  dijelaskan pada komentar di dekat kode musik.
- **Foto mempelai dan galeri** masih berupa placeholder. Isi `bride.photo` dan
  `groom.photo` pada `CONFIG` dengan URL atau data URI untuk menggantinya.
