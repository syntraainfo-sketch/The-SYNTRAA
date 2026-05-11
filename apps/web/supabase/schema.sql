-- SYNTRAA cinematic ecommerce (minimal schema)
-- Apply in Supabase SQL editor. Then enable RLS policies below.

create extension if not exists "pgcrypto";

-- Profiles (role-based access)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'customer' check (role in ('customer','admin','superAdmin')),
  created_at timestamptz not null default now()
);

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  description text,
  price_usd numeric not null default 0,
  compare_at_usd numeric,
  inventory int not null default 0,
  featured boolean not null default false,
  ingredients text[] default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  public_url text not null,
  alt text,
  sort_order int not null default 0
);

-- Cart + wishlist
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity int not null default 1 check (quantity >= 1),
  created_at timestamptz not null default now()
);

create unique index if not exists cart_user_product on public.cart_items(user_id, product_id);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  created_at timestamptz not null default now()
);

create unique index if not exists wish_user_product on public.wishlist_items(user_id, product_id);

-- Orders (UI-ready)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  status text not null default 'draft' check (status in ('draft','pending_payment','paid','fulfilled','cancelled')),
  subtotal_usd numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  title text not null,
  unit_price_usd numeric not null default 0,
  quantity int not null default 1 check (quantity >= 1)
);

-- RLS
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Policies (customer-owned rows)
create policy "profiles: read own" on public.profiles for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id);

create policy "products: read all" on public.products for select using (true);
create policy "product_images: read all" on public.product_images for select using (true);

create policy "cart: read own" on public.cart_items for select using (auth.uid() = user_id);
create policy "cart: upsert own" on public.cart_items for insert with check (auth.uid() = user_id);
create policy "cart: update own" on public.cart_items for update using (auth.uid() = user_id);
create policy "cart: delete own" on public.cart_items for delete using (auth.uid() = user_id);

create policy "wishlist: read own" on public.wishlist_items for select using (auth.uid() = user_id);
create policy "wishlist: insert own" on public.wishlist_items for insert with check (auth.uid() = user_id);
create policy "wishlist: delete own" on public.wishlist_items for delete using (auth.uid() = user_id);

create policy "orders: read own" on public.orders for select using (auth.uid() = user_id);
create policy "orders: insert own" on public.orders for insert with check (auth.uid() = user_id);
create policy "order_items: read via order" on public.order_items
  for select using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- Admin writes: recommended to use service role via Route Handlers for product CRUD.

