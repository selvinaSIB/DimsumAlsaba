import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, Phone, MapPin, Search } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge.jsx';
import { supabase, formatRupiah, formatDate, ORDER_STATUSES } from '../../lib/supabase.js';

const statusFilters = [
  { id: 'all',       label: 'Semua' },
  { id: 'received',  label: 'Diterima' },
  { id: 'preparing', label: 'Diproses' },
  { id: 'ready',     label: 'Siap' },
  { id: 'delivered', label: 'Selesai' },
  { id: 'cancelled', label: 'Batal' },
];

export default function AdminPesanan() {
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [savingStatus, setSavingStatus] = useState(null);

  const load = async () => {
    setLoading(true);
    const [{ data: o, error: eo }, { data: i, error: ei }] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('order_items').select('*'),
    ]);
    if (eo || ei) setError((eo || ei).message);
    setOrders(o || []);
    setItems(i || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter !== 'all' && o.status !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!o.order_code.toLowerCase().includes(q)
            && !o.customer_name.toLowerCase().includes(q)
            && !o.customer_phone.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [orders, filter, search]);

  const itemsFor = (orderId) => items.filter((it) => it.order_id === orderId);

  const updateStatus = async (orderId, status) => {
    setSavingStatus(orderId);
    try {
      const { error } = await supabase.rpc('update_order_status', {
        p_order_id: orderId,
        p_status:   status,
      });
      if (error) throw error;
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    } catch (e) {
      console.error('[updateStatus] gagal:', e);
      alert('Gagal ubah status: ' + (e?.message || e));
    } finally {
      setSavingStatus(null);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Daftar Pesanan</h1>
          <p className="text-sm text-gray-500 mt-2">{filtered.length} pesanan · ubah status di sini.</p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-primary-50 hover:border-primary-200 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* FILTER */}
      <div className="card p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[220px] rounded-full bg-cream px-4 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode, nama, atau no HP..."
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-1 rounded-full bg-cream p-1 overflow-x-auto">
          {statusFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${
                filter === f.id
                  ? 'bg-primary-500 text-white shadow-card'
                  : 'text-gray-600 hover:text-primary-500'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="card p-4 mb-6 text-sm text-danger-500">{error}</div>
      )}

      {/* LIST */}
      <div className="space-y-3">
        {loading ? (
          <div className="card p-10 text-center text-sm text-gray-500">Memuat...</div>
        ) : filtered.length === 0 ? (
          <div className="card p-10 text-center text-sm text-gray-500">Tidak ada pesanan.</div>
        ) : filtered.map((o) => {
          const isOpen = expanded === o.id;
          const orderItems = itemsFor(o.id);
          return (
            <div key={o.id} className="card p-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{o.customer_name}</p>
                    <span className="text-xs text-gray-400">{o.order_code}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" /> {o.customer_phone}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {o.branch}</span>
                    <span>· {formatDate(o.created_at)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatRupiah(o.total)}</p>
                  <p className="text-[11px] text-gray-500 capitalize">{o.payment_method}</p>
                </div>

                <select
                  value={o.status}
                  disabled={savingStatus === o.id}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 outline-none focus:border-primary-300 disabled:opacity-50"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>

                <button
                  onClick={() => setExpanded(isOpen ? null : o.id)}
                  className="w-9 h-9 grid place-items-center rounded-full hover:bg-gray-100 text-gray-500"
                >
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {isOpen && (
                <div className="mt-5 pt-5 border-t border-dashed border-gray-200 grid md:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Alamat</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{o.customer_address}</p>
                    {o.notes && (
                      <>
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mt-4 mb-2">Catatan</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{o.notes}</p>
                      </>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Item ({orderItems.length})</p>
                    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
                      {orderItems.map((it) => (
                        <li key={it.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{it.product_name}</p>
                            <p className="text-[11px] text-gray-500">{it.qty} × {formatRupiah(it.price)}</p>
                          </div>
                          <p className="font-semibold text-gray-900">{formatRupiah(it.subtotal)}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
