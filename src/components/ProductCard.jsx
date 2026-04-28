import { Plus, Minus, Check } from 'lucide-react';
import { formatRupiah, productImage } from '../lib/supabase.js';
import { useCart } from '../store/cart.jsx';

export default function ProductCard({ product }) {
  const { items, addItem, updateQty } = useCart();
  const inCart = items.find((i) => i.product_id === product.id);
  const outOfStock = product.stock <= 0;

  return (
    <div className="card p-5 flex flex-col gap-4 hover:shadow-card-hover transition">
      <div className="aspect-[5/4] rounded-xl bg-gray-100 overflow-hidden relative">
        <img
          src={productImage(product)}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <span
          className={`absolute top-3 right-3 pill text-[10px] ${
            outOfStock
              ? 'bg-gray-100 text-gray-500'
              : product.stock < 10
                ? 'bg-warning-50 text-warning-500'
                : 'bg-success-50 text-success-500'
          }`}
        >
          {outOfStock ? 'Habis' : `Stok ${product.stock}`}
        </span>
      </div>
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">{product.name}</h3>
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mt-0.5">
              {product.category} · {product.size}
            </p>
          </div>
          <span className="text-primary-500 font-bold text-base whitespace-nowrap">
            {formatRupiah(product.price)}
          </span>
        </div>
        {product.description && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{product.description}</p>
        )}
      </div>

      {inCart ? (
        <div className="flex items-center justify-between gap-2 rounded-full bg-primary-50 border border-primary-200 px-2 py-1.5">
          <button
            onClick={() => updateQty(product.id, inCart.qty - 1)}
            className="w-8 h-8 rounded-full bg-white grid place-items-center text-primary-500 hover:bg-primary-100"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-sm font-semibold text-primary-700 inline-flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            {inCart.qty} di keranjang
          </span>
          <button
            disabled={inCart.qty >= product.stock}
            onClick={() => updateQty(product.id, inCart.qty + 1)}
            className="w-8 h-8 rounded-full bg-primary-500 grid place-items-center text-white hover:bg-primary-600 disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          disabled={outOfStock}
          onClick={() => addItem(product, 1)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-500 hover:border-primary-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          {outOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}
        </button>
      )}
    </div>
  );
}
