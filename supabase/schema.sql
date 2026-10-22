-- Jalankan sekali di Supabase -> SQL Editor
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null, slug text unique not null
);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text unique not null, description text,
  price integer not null check (price >= 0), discount_price integer,
  stock integer not null default 0,
  category_id uuid references categories(id) on delete set null,
  images text[] default '{}', sizes text[] default '{}', colors text[] default '{}',
  is_featured boolean default false, created_at timestamptz default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique not null,
  customer_name text not null, customer_wa text not null, customer_address text not null, note text,
  items jsonb not null,
  subtotal integer not null, shipping_cost integer not null default 0, cod_fee integer not null default 0,
  total_amount integer not null,
  payment_method text not null,                 -- COD | TRANSFER | QRIS
  payment_status text not null default 'PENDING', -- PENDING | PAID | FAILED
  order_status text not null default 'PENDING',   -- PENDING | DIPROSES | DIKIRIM | SELESAI | BATAL
  tracking_number text, proof_image text, qris_string text,
  expires_at timestamptz, created_at timestamptz default now()
);

create table settings (key text primary key, value text not null);

-- Stok dikurangi atomik saat pesanan dibuat
create or replace function decrement_stock(p_id uuid, p_qty int) returns boolean
language plpgsql as $$
begin
  update products set stock = stock - p_qty where id = p_id and stock >= p_qty;
  return found;
end $$;

create or replace function increment_stock(p_id uuid, p_qty int) returns void
language sql as $$ update products set stock = stock + p_qty where id = p_id $$;

-- Semua akses lewat server (service key), jadi tutup akses langsung dari browser
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table settings enable row level security;
create policy "katalog publik" on categories for select using (true);
create policy "produk publik" on products for select using (true);

insert into categories (name, slug) values
 ('Sepatu','sepatu'),('Sandal','sandal'),('Tas Ransel','tas-ransel'),
 ('Tas Selempang','tas-selempang'),('Kaos Kaki','kaos-kaki'),('Sabuk','sabuk');

insert into storage.buckets (id, name, public) values ('uploads','uploads',true) on conflict do nothing;
