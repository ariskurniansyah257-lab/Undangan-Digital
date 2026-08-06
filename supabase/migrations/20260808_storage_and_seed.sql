-- =============================================================================
-- Storage buckets untuk bukti pembayaran & aset undangan + seed rekening admin.
-- Aman dijalankan ulang.
-- =============================================================================

-- ---- Buckets (publik agar mudah ditampilkan) ----
insert into storage.buckets (id, name, public)
values ('payments', 'payments', true), ('invitations', 'invitations', true)
on conflict (id) do nothing;

-- ---- Policies storage.objects ----
drop policy if exists "public_read_uploads" on storage.objects;
create policy "public_read_uploads" on storage.objects
  for select using (bucket_id in ('payments', 'invitations'));

drop policy if exists "authenticated_upload" on storage.objects;
create policy "authenticated_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('payments', 'invitations'));

drop policy if exists "owner_update_objects" on storage.objects;
create policy "owner_update_objects" on storage.objects
  for update to authenticated using (owner = auth.uid());

drop policy if exists "owner_delete_objects" on storage.objects;
create policy "owner_delete_objects" on storage.objects
  for delete to authenticated using (owner = auth.uid());

-- ---- Rekening admin tujuan pembayaran (contoh awal) ----
insert into public.banks_admin (bank_name, account_number, account_name, sort_order)
select * from (values
  ('Bank BCA', '8880001111', 'PT Undangan Digital', 1),
  ('Bank Mandiri', '1230004567', 'PT Undangan Digital', 2)
) as v(bank_name, account_number, account_name, sort_order)
where not exists (select 1 from public.banks_admin);

-- ---- Produk contoh (opsional) ----
insert into public.products (name, description, price, is_active)
select * from (values
  ('Undangan Wedding Elegant', 'Template pernikahan elegan siap pakai', 99000, true),
  ('Undangan Aqiqah Ceria', 'Template aqiqah warna ceria', 49000, true)
) as v(name, description, price, is_active)
where not exists (select 1 from public.products);
