-- =============================================================================
-- Tautkan tema pada item pesanan, agar tema yang dibeli mengalir ke undangan
-- (produk/tema yang sudah dibayar tampil otomatis di "Undangan Saya").
-- Aman dijalankan berkali-kali.
-- =============================================================================

alter table public.order_items
  add column if not exists theme_id uuid references public.themes(id) on delete set null;
