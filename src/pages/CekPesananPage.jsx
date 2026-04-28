import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Receipt, Check, ChefHat, PackageCheck, Truck, X,
  MapPin, Phone, RefreshCw, AlertCircle,
} from 'lucide-react';
import PublicHeader from '../components/PublicHeader.jsx';
import Footer from '../components/Footer.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { supabase, formatRupiah, formatDate } from '../lib/supabase.js';

const FLOW = [
  { key: 'received',  label: 'Diterima',     icon: Check },
  { key: 'preparing', label: 'Diproses',     icon: ChefHat },
  { key: 'ready',     label: 'Siap Diambil', icon: PackageCheck },
  { key: 'delivered', label: 'Selesai',      icon: Truck },
];

const indexOf = (status) => {
  const i = FLOW.findIndex((s) => s.key === status);
  return i === -1 ? -1 : i;
};

export default function CekPesananPage() {
  const [params, setParams] = useSearchParams();
  const [code, setCode] = useState(params.get('code') || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const lookup = async (theCode) => {
    const c = (theCode || code).trim().toUpperCase();
    if (!c) { setError('Masukkan kode pesanan dulu.'); return; }
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const { data, error } = await supabase.rpc('lookup_order', { p_order_code: c });
      if (error) throw error;
      if (!data) {
        setData(null);
        setError(`Pesanan dengan kode "${c}" tidak ditemukan.`);
      } else {
        setData(data);
        setParams({ code: c }, { replace: true });
      }
    } catch (e) {
      console.error(e);
      setError('Gagal memuat: ' + (e?.message || e));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-lookup kalau ?code=... ada di URL
  useEffect(() => {
    const c = params.get('code');
    if (c && !data && !searched) lookup(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const order = data?.order;
  const items = data?.items || [];
  const cancelled = order?.status === 'cancelled';
  const currentIdx = order ? indexOf(order.status) : -1;

  return (
    <div className="min-h-screen pt-4 pb-12">
      <PublicHeader />

      <main className="mx-auto max-w-4xl px-4 md:px-8 mt-10">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.22em] text-primary-500 font-semibold mb-2">
            Cek Pesanan
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Pantau Status <span className="italic text-primary-500">Pesananmu</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            Masukkan kode pesanan yang kamu dapat setelah submit form pesan
            (contoh: <span className="font-mono text-primary-500">ALS-00001</span>).
          </p>
        </div>

        {/* SEARCH BOX */}
        <form
          onSubmit={(e) => { e.preventDefault(); lookup(); }}
          className="card p-3 flex items-center gap-2 mb-8"
        >
          <div className="flex items-center gap-2 flex-1 rounded-full bg-cream px-4 py-2.5">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ALS-00001"
              className="flex-1 bg-transparent text-sm font-mono uppercase outline-none placeholder:font-sans placeholder:normal-case"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary text-sm disabled:opacity-60">
            {loading ? 'Memuat...' : 'Cek Status'}
          </button>
        </form>

        {error && (
          <div className="card p-5 mb-6 flex items-start gap-3 border border-danger-500/20 bg-danger-500/5">
            <AlertCircle className="w-5 h-5 text-danger-500 shrink-0 mt-0.5" />
            <p className="text-sm text-danger-500">{error}</p>
          </div>
        )}

        {order && (
          <>
            {/* HEADER ORDER */}
            <div className="card p-6 md:p-8 mb-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400 font-semibold">
                    Kode Pesanan
                  </p>
                  <p className="text-2xl md:text-3xl font-bold font-mono text-gray-900 mt-1">
                    {order.order_code}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Dibuat {formatDate(order.created_at)} · oleh {order.customer_name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <button
                    onClick={() => lookup(order.order_code)}
                    title="Refresh"
                    className="w-10 h-10 grid place-items-center rounded-full bg-cream hover:bg-primary-50 transition"
                  >
                    <RefreshCw className={`w-4 h-4 text-gray-700 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* TIMELINE */}
              <div className="mt-8">
                {cancelled ? (
                  <div className="rounded-2xl border border-danger-500/20 bg-danger-500/5 p-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-danger-500 grid place-items-center text-white shrink-0">
                      <X className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Pesanan dibatalkan</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Pesanan ini sudah dibatalkan oleh admin. Silakan hubungi cabang
                        atau buat pesanan baru.
                      </p>
                    </div>
                  </div>
                ) : (
                  <ol className="grid grid-cols-4 gap-2 relative">
                    <div className="absolute left-5 right-5 top-5 h-0.5 bg-gray-200" />
                    <div
                      className="absolute left-5 top-5 h-0.5 bg-primary-500 transition-all"
                      style={{
                        width:
                          currentIdx <= 0
                            ? '0%'
                            : `calc((${(currentIdx) / (FLOW.length - 1)} * (100% - 40px)))`,
                      }}
                    />
                    {FLOW.map(({ key, label, icon: Icon }, idx) => {
                      const done   = currentIdx > idx;
                      const active = currentIdx === idx;
                      return (
                        <li key={key} className="relative flex flex-col items-center text-center">
                          <span
                            className={`relative z-10 w-10 h-10 rounded-full grid place-items-center ring-4 ring-white transition ${
                              done
                                ? 'bg-primary-500 text-white'
                                : active
                                  ? 'bg-primary-500 text-white ring-primary-100'
                                  : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </span>
                          <span
                            className={`mt-3 text-xs font-medium ${
                              done || active ? 'text-gray-900' : 'text-gray-400'
                            }`}
                          >
                            {label}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            </div>

            {/* DETAIL ORDER */}
            <div className="grid md:grid-cols-2 gap-5">
              <section className="card p-6">
                <h2 className="font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary-500" />
                  Item Pesanan
                </h2>
                <ul className="divide-y divide-gray-100">
                  {items.map((it) => (
                    <li key={it.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{it.product_name}</p>
                        <p className="text-xs text-gray-500">{it.qty} × {formatRupiah(it.price)}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{formatRupiah(it.subtotal)}</p>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-dashed border-gray-200 mt-4 pt-4 flex items-end justify-between">
                  <span className="text-sm text-gray-500">Total Bayar</span>
                  <span className="text-xl font-bold text-gray-900">{formatRupiah(order.total)}</span>
                </div>
              </section>

              <section className="card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Detail Pengiriman</h2>
                <dl className="space-y-3 text-sm">
                  <Detail icon={MapPin} label="Cabang">{order.branch}</Detail>
                  <Detail icon={MapPin} label="Alamat">{order.customer_address}</Detail>
                  <Detail icon={Phone}  label="No HP">{order.customer_phone}</Detail>
                  <Detail label="Pembayaran" capitalize>{order.payment_method}</Detail>
                  {order.notes && <Detail label="Catatan">{order.notes}</Detail>}
                </dl>
              </section>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

function Detail({ icon: Icon, label, children, capitalize }) {
  return (
    <div className="flex items-start gap-3">
      {Icon ? <Icon className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" /> : <span className="w-4 h-4 shrink-0" />}
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">{label}</dt>
        <dd className={`text-sm text-gray-900 mt-0.5 leading-relaxed ${capitalize ? 'capitalize' : ''}`}>
          {children}
        </dd>
      </div>
    </div>
  );
}
