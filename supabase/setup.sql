-- =====================================================================
-- Dimsum Alsaba — Supabase Setup
-- Jalankan satu kali di Supabase Dashboard → SQL Editor → New query → Run
-- =====================================================================

-- ---------- TABEL ----------

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null check (category in ('mentai','tartar')),
  variant     text not null,
  size        text not null default '8pcs',
  price       integer not null check (price >= 0),
  description text,
  image_url   text,
  stock       integer not null default 0 check (stock >= 0),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_code      text not null unique,
  customer_name   text not null,
  customer_phone  text not null,
  customer_address text not null,
  branch          text,
  payment_method  text not null default 'cash',
  notes           text,
  subtotal        integer not null,
  total           integer not null,
  status          text not null default 'received'
                  check (status in ('received','preparing','ready','delivered','cancelled')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,
  qty          integer not null check (qty > 0),
  price        integer not null,
  subtotal     integer not null
);

create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_status     on public.orders(status);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_products_category on public.products(category);

-- ---------- RLS ----------
-- Demo: semua role anon boleh baca/tulis. Untuk produksi, batasi tulis ke admin saja.

alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "products read all"   on public.products;
drop policy if exists "products write all"  on public.products;
drop policy if exists "orders read all"     on public.orders;
drop policy if exists "orders write all"    on public.orders;
drop policy if exists "items read all"      on public.order_items;
drop policy if exists "items write all"     on public.order_items;

create policy "products read all"  on public.products    for select using (true);
create policy "products write all" on public.products    for all    using (true) with check (true);
create policy "orders read all"    on public.orders      for select using (true);
create policy "orders write all"   on public.orders      for all    using (true) with check (true);
create policy "items read all"     on public.order_items for select using (true);
create policy "items write all"    on public.order_items for all    using (true) with check (true);

-- ---------- RPC: place_order (transaksional, decrement stok) ----------

create or replace function public.place_order(
  p_customer_name    text,
  p_customer_phone   text,
  p_customer_address text,
  p_branch           text,
  p_payment_method   text,
  p_notes            text,
  p_items            jsonb  -- [{"product_id":"...", "qty":2}, ...]
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id   uuid;
  v_order_code text;
  v_subtotal   integer := 0;
  v_total      integer;
  v_item       jsonb;
  v_product    record;
  v_qty        integer;
  v_count      integer;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Keranjang kosong';
  end if;

  -- lock & validate stok
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'qty')::int;
    select * into v_product
      from public.products
     where id = (v_item->>'product_id')::uuid
     for update;

    if not found then
      raise exception 'Produk tidak ditemukan';
    end if;
    if v_product.stock < v_qty then
      raise exception 'Stok % tidak cukup (tersisa %)', v_product.name, v_product.stock;
    end if;
    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;

  v_total := v_subtotal;

  -- generate order code
  select count(*)+1 into v_count from public.orders;
  v_order_code := 'ALS-' || lpad(v_count::text, 5, '0');

  insert into public.orders (
    order_code, customer_name, customer_phone, customer_address,
    branch, payment_method, notes, subtotal, total
  ) values (
    v_order_code, p_customer_name, p_customer_phone, p_customer_address,
    p_branch, coalesce(p_payment_method,'cash'), p_notes, v_subtotal, v_total
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'qty')::int;
    select * into v_product from public.products where id = (v_item->>'product_id')::uuid;

    insert into public.order_items (order_id, product_id, product_name, qty, price, subtotal)
    values (v_order_id, v_product.id, v_product.name, v_qty, v_product.price, v_product.price * v_qty);

    update public.products
       set stock = stock - v_qty, updated_at = now()
     where id = v_product.id;
  end loop;

  return json_build_object(
    'order_id',   v_order_id,
    'order_code', v_order_code,
    'total',      v_total
  );
end;
$$;

grant execute on function public.place_order(text,text,text,text,text,text,jsonb) to anon, authenticated;

-- ---------- SEED PRODUK (20 varian dari pricelist Dimsum Alsaba) ----------

insert into public.products (name, category, variant, size, price, description, stock) values
  ('Dimsum Mentai Original',           'mentai', 'Original',     '8pcs',  25000, 'Dimsum signature dengan saus mentai creamy yang di-torch.',                  50),
  ('Dimsum Mentai Spicy',              'mentai', 'Spicy',        '8pcs',  27000, 'Mentai pedas — perpaduan creamy dan kick cabai khas Alsaba.',                50),
  ('Dimsum Mentai Mix',                'mentai', 'Mix',          '8pcs',  35000, 'Campuran tiga varian Mentai favorit dalam satu porsi.',                      40),
  ('Dimsum Mentai Cheese',             'mentai', 'Cheese',       '8pcs',  30000, 'Mentai topping keju gurih melimpah.',                                        50),
  ('Dimsum Mentai Cheese Melt',        'mentai', 'Cheese Melt',  '8pcs',  32000, 'Mentai dengan keju leleh ekstra creamy.',                                    40),
  ('Dimsum Mentai Mozarella',          'mentai', 'Mozarella',    '8pcs',  30000, 'Mentai dengan mozarella stretchy yang gurih.',                               40),
  ('Dimsum Mentai 16pcs Original',     'mentai', 'Original',     '16pcs', 75000, 'Paket 16 pcs Mentai Original — pas untuk berbagi.',                           20),
  ('Dimsum Mentai 16pcs Mix',          'mentai', 'Mix',          '16pcs', 80000, 'Paket 16 pcs campur varian Mentai favorit.',                                  20),
  ('Dimsum Mentai 16pcs Cheese',       'mentai', 'Cheese',       '16pcs', 85000, 'Paket 16 pcs Mentai Cheese.',                                                 15),
  ('Dimsum Mentai 25pcs Mix',          'mentai', 'Mix',          '25pcs',150000, 'Paket besar 25 pcs Mentai Mix — cocok untuk acara.',                          10),

  ('Dimsum Tar-Tar Original',          'tartar', 'Original',     '8pcs',  27000, 'Tar-tar premium dengan saus mayonnaise gurih.',                              50),
  ('Dimsum Tar-Tar Spicy',             'tartar', 'Spicy',        '8pcs',  29000, 'Tar-tar pedas dengan kombinasi creamy & spicy.',                             50),
  ('Dimsum Tar-Tar Mix',               'tartar', 'Mix',          '8pcs',  37000, 'Campuran tiga varian Tar-Tar terbaik.',                                      40),
  ('Dimsum Tar-Tar Cheese',            'tartar', 'Cheese',       '8pcs',  32000, 'Tar-tar dengan topping keju parut.',                                         50),
  ('Dimsum Tar-Tar Cheese Melt',       'tartar', 'Cheese Melt',  '8pcs',  34000, 'Tar-tar dengan keju leleh.',                                                 40),
  ('Dimsum Tar-Tar Mozarella',         'tartar', 'Mozarella',    '8pcs',  32000, 'Tar-tar dengan mozarella melar.',                                            40),
  ('Dimsum Tar-Tar 16pcs Original',    'tartar', 'Original',     '16pcs', 80000, 'Paket 16 pcs Tar-Tar Original.',                                              20),
  ('Dimsum Tar-Tar 16pcs Mix',         'tartar', 'Mix',          '16pcs', 85000, 'Paket 16 pcs campur varian Tar-Tar.',                                         20),
  ('Dimsum Tar-Tar 16pcs Cheese',      'tartar', 'Cheese',       '16pcs', 90000, 'Paket 16 pcs Tar-Tar Cheese.',                                                15),
  ('Dimsum Tar-Tar 25pcs Mix',         'tartar', 'Mix',          '25pcs',155000, 'Paket besar 25 pcs Tar-Tar Mix — cocok untuk acara.',                         10)
on conflict do nothing;
