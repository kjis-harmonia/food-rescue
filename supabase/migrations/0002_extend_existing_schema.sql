-- FOOD RESCUE — additive extension of the tables that already exist on this
-- Supabase project (stores, products, orders, payments, tickets).
--
-- This does NOT drop or rename anything you already have. It only adds the
-- columns the app needs to show full store/product detail, and opens up
-- write access (insert/update) to signed-in users via RLS policies, since
-- the existing tables currently reject anonymous/authenticated writes.
--
-- Safe to run multiple times. Run in Supabase Dashboard → SQL Editor.

-- ─────────────────────────────────────────────────────────────────────────
-- stores: currently only has (id, name, updated_at)
-- ─────────────────────────────────────────────────────────────────────────
alter table public.stores
  add column if not exists category text not null default 'deli',
  add column if not exists address text not null default '',
  add column if not exists description text not null default '',
  add column if not exists image text not null default '',
  add column if not exists distance_km numeric not null default 1.0,
  add column if not exists rating numeric not null default 4.5,
  add column if not exists created_at timestamptz not null default now();

-- ─────────────────────────────────────────────────────────────────────────
-- products: currently has (id, store_id, name, image, price, stock, updated_at)
-- ─────────────────────────────────────────────────────────────────────────
alter table public.products
  add column if not exists description text not null default '',
  add column if not exists normal_price integer,
  add column if not exists quantity_total integer,
  add column if not exists pickup_start text not null default '18:00',
  add column if not exists pickup_end text not null default '20:00',
  add column if not exists status text not null default 'active',
  add column if not exists surprise_bag boolean not null default false,
  add column if not exists surprise_hint text,
  add column if not exists created_at timestamptz not null default now();

-- ─────────────────────────────────────────────────────────────────────────
-- orders: currently has (id, product_id, store_id, status, created_at)
-- "status" is driven by the app: 'confirmed' | 'picked_up' | 'cancelled'
-- ─────────────────────────────────────────────────────────────────────────
alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists quantity integer not null default 1,
  add column if not exists pickup_code text,
  add column if not exists pickup_start text,
  add column if not exists pickup_end text;

-- ─────────────────────────────────────────────────────────────────────────
-- payments: currently has (id, order_id, amount, status)
-- ─────────────────────────────────────────────────────────────────────────
alter table public.payments
  add column if not exists method text not null default 'card',
  add column if not exists currency text not null default 'jpy',
  add column if not exists created_at timestamptz not null default now();

-- ─────────────────────────────────────────────────────────────────────────
-- tickets: currently has (id, order_id, status)
-- "status" is driven by the app: 'unused' | 'used'
-- ─────────────────────────────────────────────────────────────────────────
alter table public.tickets
  add column if not exists code text,
  add column if not exists picked_up_at timestamptz,
  add column if not exists created_at timestamptz not null default now();

create index if not exists products_store_id_idx on public.products(store_id);
create index if not exists orders_product_id_idx on public.orders(product_id);
create index if not exists orders_store_id_idx on public.orders(store_id);
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists payments_order_id_idx on public.payments(order_id);
create index if not exists tickets_order_id_idx on public.tickets(order_id);

-- ─────────────────────────────────────────────────────────────────────────
-- RLS — open up writes. SELECT already works for everyone (confirmed via
-- the live API), so we leave existing select policies untouched and only
-- add write policies under new names.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.tickets enable row level security;

drop policy if exists "stores_select_public" on public.stores;
create policy "stores_select_public" on public.stores for select using (true);
drop policy if exists "stores_write_authenticated" on public.stores;
create policy "stores_write_authenticated" on public.stores
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "products_select_public" on public.products;
create policy "products_select_public" on public.products for select using (true);
drop policy if exists "products_write_authenticated" on public.products;
create policy "products_write_authenticated" on public.products
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "orders_select_public" on public.orders;
create policy "orders_select_public" on public.orders for select using (true);
drop policy if exists "orders_write_authenticated" on public.orders;
create policy "orders_write_authenticated" on public.orders
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "payments_select_public" on public.payments;
create policy "payments_select_public" on public.payments for select using (true);
drop policy if exists "payments_write_authenticated" on public.payments;
create policy "payments_write_authenticated" on public.payments
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "tickets_select_public" on public.tickets;
create policy "tickets_select_public" on public.tickets for select using (true);
drop policy if exists "tickets_write_authenticated" on public.tickets;
create policy "tickets_write_authenticated" on public.tickets
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- ─────────────────────────────────────────────────────────────────────────
-- IMPORTANT MANUAL STEP (cannot be done via SQL):
-- Dashboard → Authentication → Sign In / Providers → Anonymous Sign-Ins → Enable.
-- Without this, every write from the app will keep failing RLS (42501) because
-- there is no signed-in user, and the app will keep working purely off its
-- local optimistic state / mock data fallback.
-- ─────────────────────────────────────────────────────────────────────────
