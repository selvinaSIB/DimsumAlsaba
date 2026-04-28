import { useEffect, useState } from 'react';
import { Plus, Minus, Save, RefreshCw } from 'lucide-react';
import { supabase, formatRupiah, productImage } from '../../lib/supabase.js';

export default function AdminStok() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adjust, setAdjust] = useState({}); // { [id]: number }
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('category')
      .order('price');
    if (error) setError(error.message);
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setAdj = (id, val) => setAdjust((a) => ({ ...a, [id]: val }));

  const applyDelta = async (p, delta) => {
    const newStock = Math.max(0, p.stock + delta);
    setSavingId(p.id);
    try {
      const { error } = await supabase.rpc('update_product_stock', {
        p_product_id: p.id,
        p_new_stock:  newStock,
      });
      if (error) throw error;
      setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, stock: newStock } : x));
    } catch (e) {
      alert('Gagal update stok: ' + (e?.message || e));
    } finally {
      setSavingId(null);
    }
  };

  const applyAdd = async (p) => {
    const v = Number(adjust[p.id] || 0);
    if (!v || v <= 0) return;
    await applyDelta(p, v);
    setAdj(p.id, '');
  };

  const setExact = async (p, val) => {
    const newStock = Math.max(0, Number(val) || 0);
    if (newStock === p.stock) return;
    setSavingId(p.id);
    try {
      const { error } = await supabase.rpc('update_product_stock', {
        p_product_id: p.id,
        p_new_stock:  newStock,
      });
      if (error) throw error;
      setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, stock: newStock } : x));
    } catch (e) {
      alert('Gagal update stok: ' + (e?.message || e));
    } finally {
      setSavingId(null);
    }
  };

  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock < 10).length;
  const outStock = products.filter((p) => p.stock === 0).length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Kelola Stok</h1>
          <p className="text-sm text-gray-500 mt-2">
            Tambah/kurangi stok per produk. Stok berkurang otomatis saat ada pesanan masuk.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-primary-50 hover:border-primary-200 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        <Stat label="Total Stok" value={totalStock.toString()} accent="primary" />
        <Stat label="Stok Menipis (<10)" value={lowStock.toString()} accent="warning" />
        <Stat label="Stok Habis" value={outStock.toString()} accent="danger" />
      </div>

      {error && (
        <div className="card p-4 mb-6 text-sm text-danger-500">{error}</div>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 bg-cream/60">
                <th className="font-medium px-4 py-3">Produk</th>
                <th className="font-medium px-4 py-3">Harga</th>
                <th className="font-medium px-4 py-3">Stok Saat Ini</th>
                <th className="font-medium px-4 py-3">Cepat ± 1</th>
                <th className="font-medium px-4 py-3">Tambah Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">Memuat...</td></tr>
              ) : products.map((p) => {
                const status = p.stock === 0 ? 'out' : p.stock < 10 ? 'low' : 'ok';
                return (
                  <tr key={p.id} className="hover:bg-cream/60 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          <img src={productImage(p)} alt={p.name} className="w-full h-full object-cover"
                               onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{p.name}</p>
                          <p className="text-[11px] text-gray-500 capitalize">{p.category} · {p.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{formatRupiah(p.price)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={p.stock}
                          onChange={(e) => {
                            const v = e.target.value;
                            setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, stock: Number(v) } : x));
                          }}
                          onBlur={(e) => setExact(p, e.target.value)}
                          className="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-sm font-semibold outline-none focus:border-primary-300"
                        />
                        <span className={`pill text-[10px] ${
                          status === 'out' ? 'bg-gray-100 text-gray-500'
                          : status === 'low' ? 'bg-warning-50 text-warning-500'
                          : 'bg-success-50 text-success-500'
                        }`}>
                          {status === 'out' ? 'Habis' : status === 'low' ? 'Menipis' : 'Aman'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-1">
                        <button
                          disabled={savingId === p.id || p.stock === 0}
                          onClick={() => applyDelta(p, -1)}
                          className="w-8 h-8 rounded-full border border-gray-200 grid place-items-center text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={savingId === p.id}
                          onClick={() => applyDelta(p, 1)}
                          className="w-8 h-8 rounded-full bg-primary-500 grid place-items-center text-white hover:bg-primary-600 disabled:opacity-40"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={adjust[p.id] || ''}
                          onChange={(e) => setAdj(p.id, e.target.value)}
                          placeholder="0"
                          className="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-primary-300"
                        />
                        <button
                          disabled={savingId === p.id || !adjust[p.id]}
                          onClick={() => applyAdd(p)}
                          className="inline-flex items-center gap-1 rounded-full bg-primary-50 hover:bg-primary-100 text-primary-600 px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                        >
                          <Save className="w-3.5 h-3.5" /> Tambah
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, accent = 'primary' }) {
  const accents = {
    primary: 'bg-primary-500 text-white',
    warning: 'bg-warning-50 text-warning-500',
    danger:  'bg-danger-500/10 text-danger-500',
  };
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <span className={`pill text-[10px] ${accents[accent]}`}>•</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
