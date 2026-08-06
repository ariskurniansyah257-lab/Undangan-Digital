-- =============================================================================
-- Rekening tujuan pembayaran (admin) + dukungan QRIS.
-- Aman dijalankan berkali-kali (idempotent).
-- =============================================================================

-- Rekening: Bank Mandiri & Seabank a.n. Rizki Kurniansyah.
insert into public.banks_admin (bank_name, account_number, account_name, sort_order)
select v.bank_name, v.account_number, v.account_name, v.sort_order
from (values
  ('Bank Mandiri', '1140029067850', 'Rizki Kurniansyah', 1),
  ('Seabank',      '901988064747',  'Rizki Kurniansyah', 2)
) as v(bank_name, account_number, account_name, sort_order)
where not exists (
  select 1 from public.banks_admin b where b.account_number = v.account_number
);

-- Slot gambar QRIS (diunggah admin lewat panel Pengaturan).
insert into public.site_settings (key, value) values ('qris_image', '')
on conflict (key) do nothing;
