import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart } from 'lucide-react';
import PublicHeader from '../components/PublicHeader.jsx';
import Footer from '../components/Footer.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { supabase, formatRupiah } from '../lib/supabase.js';
import { useCart } from '../store/cart.jsx';

const filters = [
  { id: 'all',    label: 'Semua' },
  { id: 'mentai', label: 'Mentai' },
  { id: 'tartar', label: 'Tar-Tar' },
];

const sizes = [
  { id: 'all',   label: 'Semua Ukuran' },
  { id: '8pcs',  label: '8 pcs' },
  { id: '16pcs', label: '16 pcs' },
  { id: '25pcs', label: '25 pcs' },
];

export default function ProdukPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('all');
  const [size, setSize] = useState('all');
  const [search, setSearch] = useState('');
  const { totalItems, totalPrice } = useCart();

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('price', { ascending: true });
      if (!alive) return;
      if (error) setError(error.message);
      else setProducts(data || []);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (size !== 'all' && p.size !== size) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, category, size, search]);

  return (
    <div className="min-h-screen pt-4 pb-8">
      <PublicHeader />

      <main className="mx-auto max-w-7xl px-4 md:px-8 mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary-500 font-semibold mb-2">
              Menu
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Semua Varian <span className="italic text-primary-500">Dimsum</span>
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              {filtered.length} produk · pilih varian, tambahkan ke keranjang.
            </p>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="card p-4 mb-8 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[220px] rounded-full bg-cream px-4 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama produk..."
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>

          <div className="flex items-center gap-1 rounded-full bg-cream p-1">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setCategory(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  category === f.id
                    ? 'bg-primary-500 text-white shadow-card'
                    : 'text-gray-600 hover:text-primary-500'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="rounded-full bg-cream px-4 py-2 text-xs font-medium text-gray-700 outline-none border-none cursor-pointer"
          >
            {sizes.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>

        {error && (
          <div className="card p-6 mb-6 text-sm text-danger-500">
            Gagal memuat produk: {error}
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-5 h-72 animate-pulse">
                <div className="w-full h-full bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-sm text-gray-500">Tidak ada produk yang cocok dengan filter.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>

      {/* FLOATING CART CTA */}
      {totalItems > 0 && (
        <Link
          to="/pesan"
          className="fixed bottom-6 right-6 inline-flex items-center gap-3 rounded-full bg-primary-500 hover:bg-primary-600 transition text-white px-5 py-3 shadow-card-hover"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="text-sm font-semibold">{totalItems} item</span>
          <span className="text-sm font-bold">{formatRupiah(totalPrice)}</span>
          <span className="text-xs opacity-80">— Lanjut Pesan</span>
        </Link>
      )}

      <Footer />
    </div>
  );
}
