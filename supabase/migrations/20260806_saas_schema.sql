-- =============================================================================
-- Undangan Digital SaaS — Skema inti
-- Menjalankan: salin ke Supabase SQL Editor lalu Run, atau `supabase db push`.
-- Idempotent: dapat dijalankan berkali-kali dengan hasil sama.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- RESET (idempotent) — bersihkan objek yang DIKELOLA migrasi ini terlebih
-- dahulu, agar sisa dari percobaan yang gagal sebelumnya (mis. tabel setengah
-- jadi tanpa kolom tertentu) tidak menyebabkan "create table if not exists"
-- melewatinya dan memicu error kolom saat membuat policy.
--
-- ⚠️  Menghapus tabel di bawah beserta ISINYA. AMAN untuk proyek baru yang
--     belum punya data. Bila kelak sudah ada data produksi, hapus/komentari
--     blok RESET ini sebelum menjalankan migrasi.
-- ---------------------------------------------------------------------------
drop table if exists
  public.rsvps, public.guests, public.invitation_story,
  public.invitation_gallery, public.invitation_banks, public.invitation_events,
  public.invitations, public.order_items, public.orders, public.banks_admin,
  public.site_settings, public.products, public.songs, public.package_features,
  public.themes, public.packages, public.profiles
  cascade;

drop function if exists public.is_admin() cascade;
drop function if exists public.is_super_admin() cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.enforce_child_limit() cascade;

-- ---------------------------------------------------------------------------
-- PROFILES — memperluas auth.users
-- Dibuat PALING AWAL agar fungsi helper di bawah (yang mereferensikannya)
-- lolos validasi body saat pembuatan.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  role text not null default 'client' check (role in ('client', 'admin', 'sub_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helper: cek role admin/sub_admin tanpa memicu rekursi RLS di tabel profiles.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'sub_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Izinkan user membuat baris profilnya sendiri (fallback bila trigger
-- auth.users tidak dapat dipasang karena keterbatasan hak akses).
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- Buat profil otomatis saat user registrasi (tanpa konfirmasi email).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Pasang trigger di auth.users. Pada sebagian proyek Supabase, role postgres
-- tidak boleh membuat trigger di auth.users ("must be owner of relation users").
-- Bungkus agar kegagalan izin TIDAK menggagalkan seluruh migrasi — aplikasi
-- akan membuat profil sebagai fallback (lihat policy profiles_insert_own).
do $$
begin
  drop trigger if exists on_auth_user_created on auth.users;
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
exception
  when insufficient_privilege then
    raise notice 'Trigger auth.users dilewati (hak akses tidak cukup). Profil akan dibuat dari aplikasi.';
end $$;

-- ---------------------------------------------------------------------------
-- PACKAGES — Basic, Premium, Luxury, Motion
-- ---------------------------------------------------------------------------
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text,
  price integer not null default 0,
  discount_price integer,
  currency text not null default 'IDR',
  -- kemampuan yang dipakai UI untuk toggle fitur
  max_guests integer not null default 100,
  max_gallery integer not null default 8,
  max_events integer not null default 1,
  max_banks integer not null default 2,
  allow_video boolean not null default false,
  allow_auto_slide boolean not null default false,
  allow_motion boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Baris komparasi fitur (editable admin) — ditampilkan di tabel perbandingan.
create table if not exists public.package_features (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  label text not null,
  value text,
  included boolean not null default true,
  sort_order integer not null default 0
);

-- ---------------------------------------------------------------------------
-- THEMES / TEMPLATES — per paket
-- ---------------------------------------------------------------------------
create table if not exists public.themes (
  id uuid primary key default gen_random_uuid(),
  package_id uuid references public.packages(id) on delete set null,
  slug text unique not null,
  name text not null,
  description text,
  preview_image text,
  demo_url text,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- SONGS — dikelola admin, dipilih client
-- ---------------------------------------------------------------------------
create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text,
  url text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- PRODUCTS — katalog produk (gambar, nama, template) dikelola admin
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image text,
  price integer not null default 0,
  package_id uuid references public.packages(id) on delete set null,
  theme_id uuid references public.themes(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- BANKS_ADMIN — rekening tujuan pembayaran (admin), max ditampilkan di checkout
-- ---------------------------------------------------------------------------
create table if not exists public.banks_admin (
  id uuid primary key default gen_random_uuid(),
  bank_name text not null,
  account_number text not null,
  account_name text not null,
  logo text,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

-- ---------------------------------------------------------------------------
-- SITE_SETTINGS — key/value (kontak WhatsApp, dsb.)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ORDERS + ORDER_ITEMS — keranjang & checkout
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  invoice_no text unique not null default ('INV-' || to_char(now(), 'YYYYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 6)),
  status text not null default 'menunggu' check (status in ('menunggu', 'diproses', 'berhasil', 'ditolak')),
  total integer not null default 0,
  payment_bank_id uuid references public.banks_admin(id) on delete set null,
  payment_proof_url text,
  paid_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  package_id uuid references public.packages(id) on delete set null,
  name text not null,
  price integer not null default 0,
  qty integer not null default 1
);

-- ---------------------------------------------------------------------------
-- INVITATIONS — dokumen undangan (multi-event)
-- ---------------------------------------------------------------------------
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  package_id uuid references public.packages(id) on delete set null,
  theme_id uuid references public.themes(id) on delete set null,
  song_id uuid references public.songs(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  event_type text not null default 'wedding'
    check (event_type in ('wedding', 'aqiqah', 'khitanan', 'ulang_tahun', 'seminar')),
  slug text unique not null,
  title text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  -- Ayat/kutipan: mode 'ayat' (agama) atau 'custom'
  quote_mode text not null default 'ayat',
  quote_text text,
  quote_source text,
  -- Foto mempelai: 'gabung' atau 'pisah'
  photo_mode text not null default 'pisah' check (photo_mode in ('gabung', 'pisah')),
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invitations_user_idx on public.invitations(user_id);

-- Rangkaian acara (min 1, max 3) — dibatasi di aplikasi + trigger
create table if not exists public.invitation_events (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  name text not null,
  event_date date,
  start_time time,
  end_time time,
  location_name text,
  location_address text,
  map_url text,
  sort_order integer not null default 0
);

-- Rekening/gift (max 6)
create table if not exists public.invitation_banks (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  bank_name text not null,
  account_number text not null,
  account_name text not null,
  sort_order integer not null default 0
);

-- Galeri foto (max 20)
create table if not exists public.invitation_gallery (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order integer not null default 0
);

-- Our journey / story
create table if not exists public.invitation_story (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  title text not null,
  story text,
  image_url text,
  story_date date,
  sort_order integer not null default 0
);

-- Tamu (max 1000) — link auto ?to=slug
create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  name text not null,
  slug text not null,
  category text,
  is_opened boolean not null default false,
  created_at timestamptz not null default now(),
  unique (invitation_id, slug)
);

create index if not exists guests_invitation_idx on public.guests(invitation_id);

-- RSVP & ucapan (menggantikan peran tabel wishes, per undangan)
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  guest_id uuid references public.guests(id) on delete set null,
  name text not null,
  attendance text not null check (attendance in ('hadir', 'tidak', 'ragu')),
  guests_count smallint not null default 1 check (guests_count between 1 and 10),
  message text,
  created_at timestamptz not null default now()
);

create index if not exists rsvps_invitation_idx on public.rsvps(invitation_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS: konten publik (baca semua, tulis admin)
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'packages','package_features','themes','songs','products','banks_admin','site_settings'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "%s_public_read" on public.%I;', t, t);
    execute format('create policy "%s_public_read" on public.%I for select using (true);', t, t);
    execute format('drop policy if exists "%s_admin_write" on public.%I;', t, t);
    execute format('create policy "%s_admin_write" on public.%I for all using (public.is_admin()) with check (public.is_admin());', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- RLS: orders & order_items (pemilik + admin)
-- ---------------------------------------------------------------------------
alter table public.orders enable row level security;
drop policy if exists "orders_owner_select" on public.orders;
create policy "orders_owner_select" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders_owner_insert" on public.orders;
create policy "orders_owner_insert" on public.orders
  for insert with check (user_id = auth.uid());
drop policy if exists "orders_owner_update" on public.orders;
create policy "orders_owner_update" on public.orders
  for update using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders_admin_delete" on public.orders;
create policy "orders_admin_delete" on public.orders
  for delete using (public.is_admin());

alter table public.order_items enable row level security;
drop policy if exists "order_items_access" on public.order_items;
create policy "order_items_access" on public.order_items
  for all using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  ) with check (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );

-- ---------------------------------------------------------------------------
-- RLS: invitations (pemilik CRUD; publik baca yang published; admin semua)
-- ---------------------------------------------------------------------------
alter table public.invitations enable row level security;
drop policy if exists "invitations_read" on public.invitations;
create policy "invitations_read" on public.invitations
  for select using (status = 'published' or user_id = auth.uid() or public.is_admin());
drop policy if exists "invitations_owner_write" on public.invitations;
create policy "invitations_owner_write" on public.invitations
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- Anak-tabel invitation: baca jika undangan published atau milik user/admin; tulis pemilik/admin.
do $$
declare t text;
begin
  foreach t in array array[
    'invitation_events','invitation_banks','invitation_gallery','invitation_story','guests'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "%s_read" on public.%I;', t, t);
    execute format($f$create policy "%s_read" on public.%I for select using (
      exists (select 1 from public.invitations i where i.id = invitation_id
        and (i.status = 'published' or i.user_id = auth.uid() or public.is_admin())));$f$, t, t);
    execute format('drop policy if exists "%s_write" on public.%I;', t, t);
    execute format($f$create policy "%s_write" on public.%I for all using (
      exists (select 1 from public.invitations i where i.id = invitation_id
        and (i.user_id = auth.uid() or public.is_admin())))
      with check (
      exists (select 1 from public.invitations i where i.id = invitation_id
        and (i.user_id = auth.uid() or public.is_admin())));$f$, t, t);
  end loop;
end $$;

-- RSVP: siapa pun boleh baca & kirim untuk undangan yang published; pemilik/admin kelola.
alter table public.rsvps enable row level security;
drop policy if exists "rsvps_public_read" on public.rsvps;
create policy "rsvps_public_read" on public.rsvps
  for select using (
    exists (select 1 from public.invitations i where i.id = invitation_id
      and (i.status = 'published' or i.user_id = auth.uid() or public.is_admin()))
  );
drop policy if exists "rsvps_public_insert" on public.rsvps;
create policy "rsvps_public_insert" on public.rsvps
  for insert with check (
    exists (select 1 from public.invitations i where i.id = invitation_id and i.status = 'published')
  );
drop policy if exists "rsvps_owner_manage" on public.rsvps;
create policy "rsvps_owner_manage" on public.rsvps
  for delete using (
    exists (select 1 from public.invitations i where i.id = invitation_id
      and (i.user_id = auth.uid() or public.is_admin()))
  );

-- ---------------------------------------------------------------------------
-- Batasan jumlah: rangkaian acara max 3, gift max 6, galeri max 20, tamu max 1000
-- ---------------------------------------------------------------------------
create or replace function public.enforce_child_limit()
returns trigger
language plpgsql
as $$
declare
  cnt integer;
  lim integer;
begin
  if tg_argv[0] = 'invitation_events' then lim := 3;
  elsif tg_argv[0] = 'invitation_banks' then lim := 6;
  elsif tg_argv[0] = 'invitation_gallery' then lim := 20;
  elsif tg_argv[0] = 'guests' then lim := 1000;
  else lim := 1000000;
  end if;

  execute format('select count(*) from public.%I where invitation_id = $1', tg_argv[0])
    into cnt using new.invitation_id;

  if cnt >= lim then
    raise exception 'Batas maksimum % untuk % telah tercapai', lim, tg_argv[0];
  end if;
  return new;
end;
$$;

drop trigger if exists limit_events on public.invitation_events;
create trigger limit_events before insert on public.invitation_events
  for each row execute function public.enforce_child_limit('invitation_events');

drop trigger if exists limit_banks on public.invitation_banks;
create trigger limit_banks before insert on public.invitation_banks
  for each row execute function public.enforce_child_limit('invitation_banks');

drop trigger if exists limit_gallery on public.invitation_gallery;
create trigger limit_gallery before insert on public.invitation_gallery
  for each row execute function public.enforce_child_limit('invitation_gallery');

drop trigger if exists limit_guests on public.guests;
create trigger limit_guests before insert on public.guests
  for each row execute function public.enforce_child_limit('guests');
