# Undangan Digital — Platform SaaS

Platform undangan digital multi-acara (pernikahan, aqiqah, khitanan, ulang
tahun, seminar) bergaya SaaS. Client membuat undangan dari tema per paket,
mengelola tamu dengan tautan personal, dan membayar via transfer; admin
mengelola paket, tema, lagu, produk, dan approval pembayaran.

> Sebelumnya proyek ini berupa satu berkas `index.html` statis. Kini
> dimigrasikan ke **Next.js + Supabase + Vercel**.

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS**
- **Supabase** — Postgres, Auth, Storage
- **Vercel** — hosting & CI/CD

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local   # isi kredensial Supabase
npm run dev                  # http://localhost:3000
```

### Variabel lingkungan

| Nama | Keterangan |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |

Ambil keduanya dari **Settings → API** di dashboard Supabase.

## Setup database

Jalankan migrasi di **SQL Editor** Supabase secara berurutan:

1. `supabase/migrations/20260806_saas_schema.sql` — skema inti + RLS
2. `supabase/migrations/20260807_seed_data.sql` — paket, tema, pengaturan awal

### Registrasi tanpa konfirmasi email

Di dashboard Supabase: **Authentication → Providers → Email**, matikan
**Confirm email**. Dengan begitu user langsung punya sesi setelah daftar.

### Menjadikan akun sebagai admin

Setelah registrasi, jalankan di SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'email-anda@contoh.com';
```

Peran tersedia: `client`, `sub_admin`, `admin`.

### Storage (untuk fase upload foto/video/bukti bayar)

Buat bucket publik `invitations` dan `payments` di **Storage** (dipakai Fase 3–4).

## Struktur proyek

```
src/
├── app/
│   ├── page.tsx              # Landing: hero, jenis acara, paket
│   ├── (auth)/               # login, register
│   ├── dashboard/            # area client (undangan, pesanan, akun)
│   ├── admin/                # panel admin (client, bayar, paket, tema, dll.)
│   └── u/[slug]/             # renderer undangan publik (?to=NamaTamu)
├── components/               # SiteHeader, SidebarNav, dll.
└── lib/
    ├── supabase/             # client, server, middleware
    ├── constants.ts          # jenis acara, status, formatter
    └── types.ts              # tipe TypeScript entitas DB
supabase/migrations/          # skema SQL + seed
```

## Model data (Supabase)

`profiles`, `packages`, `package_features`, `themes`, `songs`, `products`,
`banks_admin`, `site_settings`, `orders`, `order_items`, `invitations`, dan
anak-tabelnya: `invitation_events` (max 3), `invitation_banks` (max 6),
`invitation_gallery` (max 20), `invitation_story`, `guests` (max 1000), `rsvps`.

Batas jumlah ditegakkan lewat trigger DB; akses diatur Row Level Security.

## Roadmap

| Fase | Status | Isi |
| --- | --- | --- |
| **1** | ✅ | Scaffold Next.js, skema DB + RLS, auth, landing + paket, shell dashboard & admin |
| **2** | ⏳ | Editor undangan (mempelai, acara 1–3, ayat/kutipan, gift, lagu), manajemen tamu + auto-link |
| **3** | ⏳ | Galeri/our journey, upload foto & video, renderer undangan publik per tema, RSVP |
| **4** | ⏳ | Keranjang + checkout + bukti bayar, approval admin, kelola lagu/tema/produk/paket, sub-admin |

## Deploy ke Vercel

1. Hubungkan repo ke Vercel (Framework: Next.js — terdeteksi otomatis).
2. Isi environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. Setiap push ke branch produksi otomatis ter-deploy.
