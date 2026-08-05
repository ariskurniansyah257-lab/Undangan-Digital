-- =============================================================================
-- Seed data awal: paket, fitur komparasi, tema contoh, pengaturan situs.
-- Aman dijalankan ulang (on conflict do nothing / update).
-- =============================================================================

-- ---- PACKAGES ----
insert into public.packages
  (slug, name, tagline, price, max_guests, max_gallery, max_events, max_banks, allow_video, allow_auto_slide, allow_motion, sort_order)
values
  ('basic',   'Basic',   'Undangan digital esensial',        49000,  200,  8,  1, 3, false, false, false, 1),
  ('premium', 'Premium', 'Lebih lengkap dengan galeri geser', 99000,  500, 12, 2, 4, false, true,  false, 2),
  ('luxury',  'Luxury',  'Video, galeri geser, dan lebih',   199000, 1000, 20, 3, 6, true,  true,  false, 3),
  ('motion',  'Motion',  'Animasi bergerak premium',         299000, 1000, 20, 3, 6, true,  true,  true,  4)
on conflict (slug) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  max_guests = excluded.max_guests,
  max_gallery = excluded.max_gallery,
  max_events = excluded.max_events,
  max_banks = excluded.max_banks,
  allow_video = excluded.allow_video,
  allow_auto_slide = excluded.allow_auto_slide,
  allow_motion = excluded.allow_motion,
  sort_order = excluded.sort_order;

-- ---- PACKAGE FEATURES (komparasi, editable admin) ----
delete from public.package_features;
insert into public.package_features (package_id, label, value, included, sort_order)
select p.id, f.label, f.value, f.included, f.sort_order
from public.packages p
join (values
  ('basic',   'Maksimum tamu',        '200',       true,  1),
  ('basic',   'Galeri foto',          '8 foto',    true,  2),
  ('basic',   'Rangkaian acara',      '1 acara',   true,  3),
  ('basic',   'Galeri geser otomatis','',          false, 4),
  ('basic',   'Upload video',         '',          false, 5),
  ('basic',   'Animasi Motion',       '',          false, 6),
  ('premium', 'Maksimum tamu',        '500',       true,  1),
  ('premium', 'Galeri foto',          '12 foto',   true,  2),
  ('premium', 'Rangkaian acara',      '2 acara',   true,  3),
  ('premium', 'Galeri geser otomatis','',          true,  4),
  ('premium', 'Upload video',         '',          false, 5),
  ('premium', 'Animasi Motion',       '',          false, 6),
  ('luxury',  'Maksimum tamu',        '1000',      true,  1),
  ('luxury',  'Galeri foto',          '20 foto',   true,  2),
  ('luxury',  'Rangkaian acara',      '3 acara',   true,  3),
  ('luxury',  'Galeri geser otomatis','',          true,  4),
  ('luxury',  'Upload video',         '',          true,  5),
  ('luxury',  'Animasi Motion',       '',          false, 6),
  ('motion',  'Maksimum tamu',        '1000',      true,  1),
  ('motion',  'Galeri foto',          '20 foto',   true,  2),
  ('motion',  'Rangkaian acara',      '3 acara',   true,  3),
  ('motion',  'Galeri geser otomatis','',          true,  4),
  ('motion',  'Upload video',         '',          true,  5),
  ('motion',  'Animasi Motion',       'Premium',   true,  6)
) as f(pslug, label, value, included, sort_order) on f.pslug = p.slug;

-- ---- THEMES (contoh, satu per paket) ----
insert into public.themes (package_id, slug, name, description, sort_order)
select p.id, t.slug, t.name, t.description, t.sort_order
from public.packages p
join (values
  ('basic',   'classic-rose',   'Classic Rose',   'Tema klasik elegan nuansa mawar',  1),
  ('premium', 'elegant-gold',   'Elegant Gold',   'Sentuhan emas mewah dengan galeri geser', 2),
  ('luxury',  'royal-luxury',   'Royal Luxury',   'Mewah dengan dukungan video',      3),
  ('motion',  'motion-bloom',   'Motion Bloom',   'Animasi bunga bergerak premium',   4)
) as t(pslug, slug, name, description, sort_order) on t.pslug = p.slug
on conflict (slug) do nothing;

-- ---- SITE SETTINGS ----
insert into public.site_settings (key, value) values
  ('whatsapp_number', '6281234567890'),
  ('site_name', 'Undangan Digital'),
  ('hero_tagline', 'Buat undangan digital untuk setiap momen berharga')
on conflict (key) do nothing;
