-- =============================================================================
-- Undangan Digital — Pembaruan fitur (batch)
--  4) photo_mode: tambah opsi 'tiga' (1 foto gabung + 2 foto terpisah)
--  1) Selaraskan tabel themes dengan 20 tema sistem gaya (src/lib/themes.ts)
--     agar tema yang dipilih klien tampil dengan palet/ornamen yang benar.
--  9) themes.config menyimpan override cover/isi/background + animasi (jsonb,
--     kolom sudah ada — tanpa perubahan skema).
-- Aman dijalankan berkali-kali (idempotent).
-- =============================================================================

-- ---- 4) photo_mode: izinkan 'tiga' -----------------------------------------
alter table public.invitations
  drop constraint if exists invitations_photo_mode_check;
alter table public.invitations
  add constraint invitations_photo_mode_check
  check (photo_mode in ('gabung', 'pisah', 'tiga'));

-- ---- 1) Tema selaras dengan sistem gaya (5 konsep × 4 paket = 20 tema) ------
-- Nonaktifkan tema contoh lama (slug lama) agar tidak membingungkan katalog.
update public.themes
  set is_active = false
  where slug in ('classic-rose', 'elegant-gold', 'royal-luxury', 'motion-bloom');

-- Sisipkan 20 tema yang slug-nya cocok dengan src/lib/themes.ts.
insert into public.themes (package_id, slug, name, description, sort_order, is_active)
select p.id, t.slug, t.name, t.description, t.sort_order, true
from public.packages p
join (values
  ('basic',   'basic-jawa',      'Adat Jawa',        'Nuansa batik sogan, coklat & emas',        1),
  ('basic',   'basic-padang',    'Adat Padang',      'Songket Minang, marun & emas',             2),
  ('basic',   'basic-ceria',     'Ceria & Hangat',   'Warna coral & peach yang hangat',          3),
  ('basic',   'basic-modern',    'Modern',           'Minimalis charcoal & silver',              4),
  ('basic',   'basic-artistik',  'Artistik Ornamen', 'Mewah artistik, plum & emas',              5),
  ('premium', 'premium-jawa',     'Adat Jawa',        'Nuansa batik sogan, coklat & emas',        1),
  ('premium', 'premium-padang',   'Adat Padang',      'Songket Minang, marun & emas',             2),
  ('premium', 'premium-ceria',    'Ceria & Hangat',   'Warna coral & peach yang hangat',          3),
  ('premium', 'premium-modern',   'Modern',           'Minimalis charcoal & silver',              4),
  ('premium', 'premium-artistik', 'Artistik Ornamen', 'Mewah artistik, plum & emas',              5),
  ('luxury',  'luxury-jawa',      'Adat Jawa',        'Nuansa batik sogan, coklat & emas',        1),
  ('luxury',  'luxury-padang',    'Adat Padang',      'Songket Minang, marun & emas',             2),
  ('luxury',  'luxury-ceria',     'Ceria & Hangat',   'Warna coral & peach yang hangat',          3),
  ('luxury',  'luxury-modern',    'Modern',           'Minimalis charcoal & silver',              4),
  ('luxury',  'luxury-artistik',  'Artistik Ornamen', 'Mewah artistik, plum & emas',              5),
  ('motion',  'motion-jawa',      'Adat Jawa',        'Nuansa batik sogan, coklat & emas',        1),
  ('motion',  'motion-padang',    'Adat Padang',      'Songket Minang, marun & emas',             2),
  ('motion',  'motion-ceria',     'Ceria & Hangat',   'Warna coral & peach yang hangat',          3),
  ('motion',  'motion-modern',    'Modern',           'Minimalis charcoal & silver',              4),
  ('motion',  'motion-artistik',  'Artistik Ornamen', 'Mewah artistik, plum & emas',              5)
) as t(pslug, slug, name, description, sort_order) on t.pslug = p.slug
on conflict (slug) do update set
  package_id = excluded.package_id,
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true;
