import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn('[Supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diisi di .env');
}

export const supabase = createClient(url, anonKey);

export const formatRupiah = (value) =>
  'Rp' + Math.round(value || 0).toLocaleString('id-ID');

export const PLACEHOLDER_IMAGE = {
  mentai: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&q=80&auto=format&fit=crop',
  tartar: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80&auto=format&fit=crop',
};

export const productImage = (p) => p?.image_url || PLACEHOLDER_IMAGE[p?.category] || PLACEHOLDER_IMAGE.mentai;

export const BRANCHES = [
  'Cabang Rumbai (Jl. Yos Sudarso)',
  'Cabang Paus (Jl. Paus)',
  'Cabang Durian (Jl. Durian)',
  'Cabang Panam (Jl. Delima)',
  'Cabang Marpoyan (Jl. Air Dingin)',
];

export const PAYMENT_METHODS = [
  { id: 'cash',     label: 'Bayar di Tempat (COD)' },
  { id: 'qris',     label: 'QRIS' },
  { id: 'transfer', label: 'Transfer Bank' },
];

export const ORDER_STATUSES = [
  { id: 'received',  label: 'Diterima' },
  { id: 'preparing', label: 'Diproses' },
  { id: 'ready',     label: 'Siap Diambil' },
  { id: 'delivered', label: 'Selesai' },
  { id: 'cancelled', label: 'Dibatalkan' },
];

export const formatDate = (iso) =>
  new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
