-- seenjaba — Schéma initial PostgreSQL / Supabase
-- À exécuter demain dans Supabase SQL Editor après revue.
create extension if not exists pgcrypto;

create type public.user_role as enum ('customer','admin');
create type public.order_status as enum ('pending','confirmed','preparing','ready','shipped','delivered','cancelled');
create type public.payment_status as enum ('pending','paid','failed','refunded');
create type public.payment_method as enum ('cash_on_delivery','wave','orange_money','card');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  sku text unique,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= price),
  unit text not null default 'piece',
  image_url text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.inventory (
  product_id uuid primary key references public.products(id) on delete cascade,
  quantity numeric(12,3) not null default 0 check (quantity >= 0),
  low_stock_threshold numeric(12,3) not null default 5,
  updated_at timestamptz not null default now()
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  changed_by uuid references public.profiles(id) on delete set null,
  movement_type text not null check (movement_type in ('in','out','adjustment','sale','return')),
  quantity numeric(12,3) not null,
  note text,
  created_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  label text,
  recipient_name text not null,
  phone text not null,
  address_line text not null,
  city text not null default 'Dakar',
  area text,
  delivery_note text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- Une commande peut être passée en invité : customer_id est donc nullable.
-- Le snapshot d'adresse et le téléphone restent dans la commande même sans compte.
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  delivery_address text not null,
  delivery_city text not null default 'Dakar',
  delivery_area text,
  delivery_note text,
  status public.order_status not null default 'pending',
  payment_method public.payment_method not null default 'cash_on_delivery',
  payment_status public.payment_status not null default 'pending',
  subtotal numeric(12,2) not null check (subtotal >= 0),
  delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  total numeric(12,2) not null check (total >= 0),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_sku text,
  product_image_url text,
  unit text not null,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity numeric(12,3) not null check (quantity > 0),
  line_total numeric(12,2) not null check (line_total >= 0)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  method public.payment_method not null,
  status public.payment_status not null default 'pending',
  amount numeric(12,2) not null check (amount >= 0),
  provider_reference text,
  provider_payload jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  discount_type text not null check (discount_type in ('percentage','fixed')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.promotion_products (
  promotion_id uuid not null references public.promotions(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  primary key (promotion_id, product_id)
);

create table public.store_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create index products_category_active_idx on public.products(category_id,is_active);
create index orders_status_created_idx on public.orders(status,created_at desc);
create index orders_customer_idx on public.orders(customer_id);
create index order_items_order_idx on public.order_items(order_id);
create index addresses_customer_idx on public.addresses(customer_id);

-- RLS activé partout. Les politiques admin s'appuient sur profiles.role.
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.promotions enable row level security;
alter table public.promotion_products enable row level security;
alter table public.store_settings enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;

-- Catalogue public en lecture seule pour les visiteurs.
create policy "public read active categories" on public.categories for select using (is_active = true or public.is_admin());
create policy "public read active products" on public.products for select using (is_active = true or public.is_admin());
create policy "public read product images" on public.product_images for select using (
  exists(select 1 from public.products p where p.id=product_id and p.is_active=true) or public.is_admin()
);
create policy "public read active promotions" on public.promotions for select using (is_active=true or public.is_admin());
create policy "public read promotion products" on public.promotion_products for select using (true);

-- Profil : l'utilisateur lit/modifie son profil, rôle admin réservé à l'administration.
create policy "profile read own or admin" on public.profiles for select using (id=auth.uid() or public.is_admin());
create policy "profile update own" on public.profiles for update using (id=auth.uid()) with check (id=auth.uid() and role='customer');
create policy "admin manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create policy "admin manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage product images" on public.product_images for all using (public.is_admin()) with check (public.is_admin());
create policy "public read inventory for active products" on public.inventory for select using (exists(select 1 from public.products p where p.id=product_id and p.is_active=true) or public.is_admin());
create policy "admin manage inventory" on public.inventory for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage inventory movements" on public.inventory_movements for all using (public.is_admin()) with check (public.is_admin());

create policy "customer manage own addresses" on public.addresses for all using (customer_id=auth.uid() or public.is_admin()) with check (customer_id=auth.uid() or public.is_admin());
create policy "customer read own orders" on public.orders for select using (customer_id=auth.uid() or public.is_admin());
create policy "admin manage orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "customer read own order items" on public.order_items for select using (
  exists(select 1 from public.orders o where o.id=order_id and o.customer_id=auth.uid()) or public.is_admin()
);
create policy "admin manage order items" on public.order_items for all using (public.is_admin()) with check (public.is_admin());
create policy "customer read own payments" on public.payments for select using (
  exists(select 1 from public.orders o where o.id=order_id and o.customer_id=auth.uid()) or public.is_admin()
);
create policy "admin manage payments" on public.payments for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage promotions" on public.promotions for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage promotion products" on public.promotion_products for all using (public.is_admin()) with check (public.is_admin());
create policy "public read store settings" on public.store_settings for select using (true);
create policy "admin manage store settings" on public.store_settings for all using (public.is_admin()) with check (public.is_admin());

-- IMPORTANT :
-- 1) Ne jamais exposer la clé service_role dans Angular.
-- 2) La création de commande invité et la décrémentation atomique du stock
--    devront passer par une fonction SQL RPC ou une Edge Function sécurisée.
-- 3) Créer le premier admin via un processus serveur contrôlé, jamais depuis le navigateur.
-- 4) Les politiques RLS ci-dessus sont un socle initial à valider avant production.
