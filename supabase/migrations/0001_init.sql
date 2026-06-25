-- FOOD RESCUE — initial schema, RLS policies, auth trigger, and seed data.
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query → Run),
-- or via `supabase db push` if the project is linked to the CLI.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.stores (
  id text primary key,
  name text not null,
  category text not null check (category in ('bakery', 'cafe', 'restaurant', 'grocery', 'deli')),
  address text not null,
  description text not null default '',
  image text not null default '',
  distance_km numeric not null default 0,
  rating numeric not null default 4.5,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key default ('product-' || replace(gen_random_uuid()::text, '-', '')),
  store_id text not null references public.stores(id) on delete cascade,
  title text not null,
  description text not null default '',
  image text not null default '',
  normal_price integer not null check (normal_price >= 0),
  rescue_price integer not null check (rescue_price >= 0),
  quantity_total integer not null check (quantity_total >= 0),
  quantity_left integer not null check (quantity_left >= 0),
  pickup_start text not null,
  pickup_end text not null,
  status text not null default 'active' check (status in ('active', 'soldout', 'ended')),
  surprise_bag boolean not null default false,
  surprise_hint text,
  created_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id text primary key default ('reservation-' || replace(gen_random_uuid()::text, '-', '')),
  product_id text not null references public.products(id) on delete cascade,
  store_id text not null references public.stores(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  quantity integer not null check (quantity > 0),
  status text not null default 'confirmed' check (status in ('confirmed', 'picked_up', 'cancelled')),
  pickup_code text not null,
  pickup_start text not null,
  pickup_end text not null,
  created_at timestamptz not null default now()
);

-- One row per auth user. Created automatically on signup (incl. anonymous sign-in).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'store_owner', 'admin')),
  store_id text references public.stores(id) on delete set null,
  display_name text,
  created_at timestamptz not null default now()
);

create index if not exists products_store_id_idx on public.products(store_id);
create index if not exists reservations_product_id_idx on public.reservations(product_id);
create index if not exists reservations_store_id_idx on public.reservations(store_id);
create index if not exists reservations_user_id_idx on public.reservations(user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- AUTH TRIGGER — auto-create a profile row whenever a new auth user appears
-- (this fires for anonymous sign-ins too, so every session gets a role).
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
--
-- Catalog data (stores/products) is public read. Writes and reservation
-- access require a signed-in session (the app signs every visitor in
-- anonymously, so "signed-in" effectively means "not a raw, unauthenticated
-- REST call"). Reservation rows are tagged with the creating user's id.
--
-- This is the right baseline for the current MVP, which doesn't yet have
-- separate store-owner/admin login screens. Tightening writes to
-- "auth.uid() matches profiles.store_id owner" or "profiles.role = 'admin'"
-- is the natural next step once those login flows exist.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.reservations enable row level security;
alter table public.profiles enable row level security;

create policy "stores_select_public" on public.stores
  for select using (true);

create policy "stores_write_authenticated" on public.stores
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "products_select_public" on public.products
  for select using (true);

create policy "products_write_authenticated" on public.products
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "reservations_select_authenticated" on public.reservations
  for select using (auth.uid() is not null);

create policy "reservations_insert_own" on public.reservations
  for insert with check (auth.uid() is not null and (user_id is null or user_id = auth.uid()));

create policy "reservations_update_authenticated" on public.reservations
  for update using (auth.uid() is not null);

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────────────
-- SEED DATA — mirrors the app's mock data so the UI has content immediately.
-- ─────────────────────────────────────────────────────────────────────────

insert into public.stores (id, name, category, address, description, image, distance_km, rating) values
  ('store-1', 'BAKERY MORI', 'bakery', '東京都渋谷区神南1-2-3', '毎朝焼き上げる発酵パンの専門店', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', 0.6, 4.8),
  ('store-2', 'GREEN TABLE DELI', 'deli', '東京都渋谷区代々木2-4-1', '野菜中心の惣菜とサラダのデリ', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', 1.1, 4.6),
  ('store-3', 'CAFE LUMEN', 'cafe', '東京都渋谷区富ヶ谷1-1-8', '自家焙煎コーヒーと焼き菓子のカフェ', 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80', 1.8, 4.7),
  ('store-4', 'TRATTORIA SOLE', 'restaurant', '東京都渋谷区桜丘町5-3', '本日仕込みのパスタとお惣菜', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80', 2.4, 4.5),
  ('store-5', 'MARKET FRESH', 'grocery', '東京都渋谷区上原3-6-2', '地元農家直送の青果店', 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80', 0.9, 4.4)
on conflict (id) do nothing;

insert into public.products (id, store_id, title, description, image, normal_price, rescue_price, quantity_total, quantity_left, pickup_start, pickup_end, status, surprise_bag, surprise_hint) values
  ('product-1', 'store-1', '本日の焼き菓子セット', '当日仕込みのクロワッサンとマフィンを詰め合わせたセットです。内容は日によって異なります。', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=80', 1200, 480, 6, 3, '18:30', '19:30', 'active', true, '何が入っているかは、開けてからのお楽しみ！'),
  ('product-2', 'store-1', 'バゲット・カンパーニュ詰め合わせ', '閉店前に余った人気のバゲットとカンパーニュをセットでお届けします。', 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=1000&q=80', 900, 350, 4, 1, '19:00', '19:45', 'active', false, null),
  ('product-3', 'store-2', '本日の惣菜デリボックス', '野菜たっぷりの惣菜を5品ほど詰め合わせたデリボックスです。', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80', 1500, 600, 5, 5, '20:00', '21:00', 'active', true, '今日の人気惣菜をシェフがランダムにセレクト！'),
  ('product-4', 'store-3', '焼き菓子とドリップバッグセット', '本日分のスコーンとパウンドケーキ、ドリップバッグ2袋のセットです。', 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=1000&q=80', 1100, 450, 3, 2, '17:30', '18:30', 'active', false, null),
  ('product-5', 'store-4', '本日のパスタ2食セット', '仕込み過ぎたソースと生パスタの組み合わせセットです。温めるだけでお召し上がりいただけます。', 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=80', 2200, 900, 4, 0, '21:00', '21:30', 'soldout', false, null),
  ('product-6', 'store-5', '訳あり野菜セット', '形が不揃いなだけの新鮮な野菜を詰め合わせました。', 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=1000&q=80', 1000, 400, 8, 6, '16:00', '19:00', 'active', false, null)
on conflict (id) do nothing;

insert into public.reservations (id, product_id, store_id, quantity, status, pickup_code, pickup_start, pickup_end, created_at) values
  ('reservation-1', 'product-3', 'store-2', 1, 'confirmed', 'FR-7421', '20:00', '21:00', '2026-06-23T11:20:00+09:00'),
  ('reservation-2', 'product-1', 'store-1', 2, 'picked_up', 'FR-3816', '18:30', '19:30', '2026-06-18T10:15:00+09:00'),
  ('reservation-3', 'product-4', 'store-3', 1, 'picked_up', 'FR-9153', '17:30', '18:30', '2026-06-11T14:40:00+09:00'),
  ('reservation-4', 'product-6', 'store-5', 1, 'picked_up', 'FR-5274', '16:00', '19:00', '2026-06-04T09:05:00+09:00')
on conflict (id) do nothing;
