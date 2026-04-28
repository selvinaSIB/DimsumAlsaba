-- =====================================================================
-- 002 — Semua RPC untuk admin + user (ganti direct PATCH/DELETE)
-- Jalankan di Supabase SQL Editor → New query → Run
-- =====================================================================

-- ---------- 1. Update status pesanan (admin) ----------
create or replace function public.update_order_status(
  p_order_id uuid,
  p_status   text
) returns json
language plpgsql security definer set search_path = public
as $$
declare v_order record;
begin
  if p_status not in ('received','preparing','ready','delivered','cancelled') then
    raise exception 'Status tidak valid: %', p_status;
  end if;
  update public.orders
     set status = p_status, updated_at = now()
   where id = p_order_id
   returning * into v_order;
  if not found then raise exception 'Pesanan tidak ditemukan'; end if;
  return row_to_json(v_order);
end;
$$;
grant execute on function public.update_order_status(uuid, text) to anon, authenticated;

-- ---------- 2. Lookup pesanan by order_code (user cek pesanan) ----------
create or replace function public.lookup_order(p_order_code text)
returns json
language plpgsql security definer set search_path = public
as $$
declare
  v_order record;
  v_items json;
begin
  select * into v_order from public.orders where order_code = p_order_code;
  if not found then return null; end if;

  select json_agg(json_build_object(
    'id',           id,
    'product_name', product_name,
    'qty',          qty,
    'price',        price,
    'subtotal',     subtotal
  ))
  into v_items
  from public.order_items where order_id = v_order.id;

  return json_build_object(
    'order', row_to_json(v_order),
    'items', coalesce(v_items, '[]'::json)
  );
end;
$$;
grant execute on function public.lookup_order(text) to anon, authenticated;

-- ---------- 3. Update stok produk (admin) ----------
create or replace function public.update_product_stock(
  p_product_id uuid,
  p_new_stock  integer
) returns json
language plpgsql security definer set search_path = public
as $$
declare v_prod record;
begin
  if p_new_stock < 0 then raise exception 'Stok tidak boleh negatif'; end if;
  update public.products
     set stock = p_new_stock, updated_at = now()
   where id = p_product_id
   returning * into v_prod;
  if not found then raise exception 'Produk tidak ditemukan'; end if;
  return row_to_json(v_prod);
end;
$$;
grant execute on function public.update_product_stock(uuid, integer) to anon, authenticated;

-- ---------- 4. Upsert produk — insert kalau p_id null, update kalau ada (admin) ----------
create or replace function public.upsert_product(
  p_id          uuid,
  p_name        text,
  p_category    text,
  p_variant     text,
  p_size        text,
  p_price       integer,
  p_stock       integer,
  p_description text,
  p_image_url   text,
  p_is_active   boolean
) returns json
language plpgsql security definer set search_path = public
as $$
declare v_prod record;
begin
  if p_id is null then
    insert into public.products (name, category, variant, size, price, stock, description, image_url, is_active)
    values (p_name, p_category, p_variant, p_size, p_price, coalesce(p_stock,0), p_description, p_image_url, coalesce(p_is_active, true))
    returning * into v_prod;
  else
    update public.products
       set name        = p_name,
           category    = p_category,
           variant     = p_variant,
           size        = p_size,
           price       = p_price,
           stock       = coalesce(p_stock, 0),
           description = p_description,
           image_url   = p_image_url,
           is_active   = coalesce(p_is_active, true),
           updated_at  = now()
     where id = p_id
     returning * into v_prod;
    if not found then raise exception 'Produk tidak ditemukan'; end if;
  end if;
  return row_to_json(v_prod);
end;
$$;
grant execute on function public.upsert_product(uuid,text,text,text,text,integer,integer,text,text,boolean) to anon, authenticated;

-- ---------- 5. Hapus produk (admin) ----------
create or replace function public.delete_product(p_product_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  delete from public.products where id = p_product_id;
end;
$$;
grant execute on function public.delete_product(uuid) to anon, authenticated;
