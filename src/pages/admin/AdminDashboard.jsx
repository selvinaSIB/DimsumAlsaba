import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, ShoppingBag, Flame, ArrowUpRight, RefreshCw, Receipt,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge.jsx';
import { supabase, formatRupiah, formatDate } from '../../lib/supabase.js';

const ranges = [
  { id: 'today',   label: 'Hari Ini',   days: 0 },
  { id: 'week',    label: '7 Hari',     days: 7 },
  { id: 'month',   label: '30 Hari',    days: 30 },
  { id: 'all',     label: 'Semua',      days: null },
];

const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export default function AdminDashboard() {
  const [range, setRange] = useState('week');
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    const [{ data: o, error: eo }, { data: i, error: ei }] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('order_items').select('*, product:products(category)'),
    ]);
    if (eo || ei) setError((eo || ei).message);
    setOrders(o || []);
    setItems(i || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = useMemo(() => {
    const cfg = ranges.find((r) => r.id === range);
    if (!cfg || cfg.days === null) return orders;
    const cutoff = cfg.days === 0
      ? startOfDay()
      : new Date(Date.now() - cfg.days * 24 * 60 * 60 * 1000);
    return orders.filter((o) => new Date(o.created_at) >= cutoff && o.status !== 'cancelled');
  }, [orders, range]);

  const filteredOrderIds = useMemo(() => new Set(filtered.map((o) => o.id)), [filtered]);
  const filteredItems = useMemo(
    () => items.filter((i) => filteredOrderIds.has(i.order_id)),
    [items, filteredOrderIds]
  );

  const stats = useMemo(() => {
    const totalRevenue = filtered.reduce((s, o) => s + (o.total || 0), 0);
    const totalOrders = filtered.length;

    let mentaiRevenue = 0, mentaiQty = 0;
    let tartarRevenue = 0, tartarQty = 0;
    const productMap = new Map();

    for (const it of filteredItems) {
      const cat = it.product?.category;
      if (cat === 'mentai') { mentaiRevenue += it.subtotal; mentaiQty += it.qty; }
      else if (cat === 'tartar') { tartarRevenue += it.subtotal; tartarQty += it.qty; }

      const key = it.product_name;
      const cur = productMap.get(key) || { name: key, qty: 0, revenue: 0 };
      cur.qty += it.qty;
      cur.revenue += it.subtotal;
      productMap.set(key, cur);
    }

    const topProducts = [...productMap.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
    return { totalRevenue, totalOrders, mentaiRevenue, mentaiQty, tartarRevenue, tartarQty, topProducts };
  }, [filtered, filteredItems]);

  const recentOrders = orders.slice(0, 6);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Dashboard <span className="italic text-primary-500">Alsaba</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Ringkasan penjualan dan pesanan harian.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-white border border-gray-200 p-1">
            {ranges.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  range === r.id
                    ? 'bg-primary-500 text-white shadow-card'
                    : 'text-gray-600 hover:text-primary-500'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={fetchAll}
            className="w-10 h-10 grid place-items-center rounded-full bg-white border border-gray-200 hover:bg-primary-50 hover:border-primary-200 transition"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 text-gray-700 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="card p-4 mb-6 text-sm text-danger-500">Gagal memuat: {error}</div>
      )}

      {/* METRIC CARDS */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <Metric
          label="Penjualan Mentai"
          value={formatRupiah(stats.mentaiRevenue)}
          sub={`${stats.mentaiQty} pcs terjual`}
          accent="primary"
          icon={Flame}
        />
        <Metric
          label="Penjualan Tar-Tar"
          value={formatRupiah(stats.tartarRevenue)}
          sub={`${stats.tartarQty} pcs terjual`}
          accent="warning"
          icon={Flame}
        />
        <MetricDark
          label="Total Penjualan"
          value={formatRupiah(stats.totalRevenue)}
          sub={`${stats.totalOrders} pesanan`}
        />
        <Metric
          label="Total Pesanan"
          value={stats.totalOrders.toString()}
          sub="Periode terpilih"
          accent="success"
          icon={ShoppingBag}
        />
      </div>

      {/* TOP PRODUCTS + RECENT ORDERS */}
      <div className="grid xl:grid-cols-3 gap-6">
        <section className="card p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900">Produk Terlaris</h2>
              <p className="text-xs text-gray-500 mt-0.5">Top 5 produk pada periode terpilih</p>
            </div>
            <Link
              to="/admin/produk"
              className="text-xs font-semibold text-primary-500 inline-flex items-center gap-1 hover:gap-2 transition-all"
            >
              Kelola Produk <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-gray-500 py-10 text-center">
              Belum ada penjualan pada periode ini.
            </p>
          ) : (
            <ul className="space-y-3">
              {stats.topProducts.map((p, idx) => {
                const max = stats.topProducts[0].qty || 1;
                const pct = (p.qty / max) * 100;
                return (
                  <li key={p.name} className="rounded-xl border border-gray-100 p-3">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-primary-50 text-primary-500 grid place-items-center text-xs font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{p.qty} pcs</p>
                        <p className="text-[11px] text-gray-500">{formatRupiah(p.revenue)}</p>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900">Pesanan Terbaru</h2>
              <p className="text-xs text-gray-500 mt-0.5">6 pesanan terakhir</p>
            </div>
            <Link
              to="/admin/pesanan"
              className="text-xs font-semibold text-primary-500 inline-flex items-center gap-1 hover:gap-2 transition-all"
            >
              Semua <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500 py-10 text-center">
              Belum ada pesanan.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentOrders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 hover:border-primary-200 p-3 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-50 grid place-items-center text-primary-500 font-bold text-xs shrink-0">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-gray-900 truncate">{o.customer_name}</p>
                      <span className="text-[10px] text-gray-400">{o.order_code}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {formatDate(o.created_at)} · {formatRupiah(o.total)}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Metric({ label, value, sub, accent = 'primary', icon: Icon }) {
  const accents = {
    primary: 'bg-primary-50 text-primary-500',
    success: 'bg-success-50 text-success-500',
    warning: 'bg-warning-50 text-warning-500',
  };
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <span className={`pill ${accents[accent]} text-[10px]`}>
          {Icon ? <Icon className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}

function MetricDark({ label, value, sub }) {
  return (
    <div className="rounded-2xl bg-primary-800 text-white p-6 shadow-card relative overflow-hidden">
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary-500/30 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-primary-200">{label}</span>
          <Flame className="w-4 h-4 text-primary-300" />
        </div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-primary-200 mt-1">{sub}</p>
      </div>
    </div>
  );
}
