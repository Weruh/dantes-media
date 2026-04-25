create table if not exists public.deleted_catalog_products (
  product_id text primary key,
  deleted_at timestamptz not null default timezone('utc', now()),
  deleted_by uuid null default auth.uid()
);

alter table public.deleted_catalog_products enable row level security;

drop policy if exists "deleted_catalog_products_public_read" on public.deleted_catalog_products;
create policy "deleted_catalog_products_public_read"
  on public.deleted_catalog_products
  for select
  using (true);

drop policy if exists "deleted_catalog_products_admin_manage" on public.deleted_catalog_products;
create policy "deleted_catalog_products_admin_manage"
  on public.deleted_catalog_products
  for all
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.deleted_catalog_products to anon, authenticated;
grant insert, update, delete on public.deleted_catalog_products to authenticated;
