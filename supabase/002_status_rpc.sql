-- =====================================================================
-- 002 — RPC update_order_status + lookup pesanan publik
-- Jalankan di Supabase SQL Editor → New query → Run
-- =====================================================================

create or replace function public.update_order_status(
  p_order_id uuid,
  p_status   text
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
begin
  if p_status not in ('received','preparing','ready','delivered','cancelled') then
    raise exception 'Status tidak valid: %', p_status;
  end if;

  update public.orders
     set status = p_status,
         updated_at = now()
   where id = p_order_id
   returning * into v_order;

  if not found then
    raise exception 'Pesanan tidak ditemukan';
  end if;

  return row_to_json(v_order);
end;
$$;

grant execute on function public.update_order_status(uuid, text) to anon, authenticated;

-- ---------- Lookup pesanan publik via order_code ----------
-- Mengembalikan order + items dalam satu panggilan, tanpa expose semua orders.

create or replace function public.lookup_order(p_order_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_items json;
begin
  select * into v_order from public.orders where order_code = p_order_code;
  if not found then
    return null;
  end if;

  select json_agg(json_build_object(
    'id',           id,
    'product_name', product_name,
    'qty',          qty,
    'price',        price,
    'subtotal',     subtotal
  ))
  into v_items
  from public.order_items
  where order_id = v_order.id;

  return json_build_object(
    'order', row_to_json(v_order),
    'items', coalesce(v_items, '[]'::json)
  );
end;
$$;

grant execute on function public.lookup_order(text) to anon, authenticated;
