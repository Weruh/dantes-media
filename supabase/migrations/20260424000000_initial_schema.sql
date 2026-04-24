create extension if not exists pgcrypto;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create table if not exists public.custom_products (
  id text primary key,
  name text not null,
  category text not null,
  short_desc text not null,
  price numeric(12,2) not null check (price > 0),
  specs jsonb not null default '[]'::jsonb,
  image text not null default '/assets/consultacy.jpg',
  featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.quote_requests (
  id text primary key,
  full_name text not null,
  company text not null default '',
  email text not null,
  phone text not null,
  location text not null,
  service_type text not null,
  budget_range text not null default '',
  message text not null,
  created_at timestamptz not null default timezone('utc', now()),
  notification_status text not null default 'pending' check (notification_status in ('pending', 'sent')),
  notification_error text not null default ''
);

create table if not exists public.orders (
  reference text primary key,
  status text not null check (status in ('pending', 'paid')),
  currency text not null,
  amount_minor bigint not null check (amount_minor >= 0),
  totals jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  customer jsonb not null default '{}'::jsonb,
  delivery jsonb not null default '{}'::jsonb,
  payment_phone text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  paid_at timestamptz null,
  paid_via text null,
  email_notified_at timestamptz null,
  customer_email_notified_at timestamptz null,
  whatsapp_notified_at timestamptz null
);

create index if not exists orders_status_created_at_idx
  on public.orders (status, created_at desc);

create index if not exists quote_requests_created_at_idx
  on public.quote_requests (created_at desc);

alter table public.custom_products enable row level security;
alter table public.quote_requests enable row level security;
alter table public.orders enable row level security;

drop policy if exists "custom_products_public_read" on public.custom_products;
create policy "custom_products_public_read"
  on public.custom_products
  for select
  using (true);

drop policy if exists "custom_products_admin_manage" on public.custom_products;
create policy "custom_products_admin_manage"
  on public.custom_products
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "quote_requests_admin_read" on public.quote_requests;
create policy "quote_requests_admin_read"
  on public.quote_requests
  for select
  using (public.is_admin());

drop policy if exists "orders_admin_read" on public.orders;
create policy "orders_admin_read"
  on public.orders
  for select
  using (public.is_admin());

grant usage on schema public to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant select on public.custom_products to anon, authenticated;
grant insert, update, delete on public.custom_products to authenticated;
grant select on public.quote_requests to authenticated;
grant select on public.orders to authenticated;
