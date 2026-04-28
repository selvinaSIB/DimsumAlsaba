import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Plus, Minus, Trash2, ShoppingCart, CheckCircle2, Copy,
} from 'lucide-react';
import PublicHeader from '../components/PublicHeader.jsx';
import {
  supabase, formatRupiah, productImage,
  BRANCHES, PAYMENT_METHODS,
} from '../lib/supabase.js';
import { useCart } from '../store/cart.jsx';

export default function PesanPage() {
  const navigate = useNavigate();
  const { items, updateQty, removeItem, clearCart, totalItems, totalPrice } = useCart();
  const [form, setForm] = useState({
    name: '', phone: '', address: '',
    branch: BRANCHES[0],
    payment: 'cash',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    if (items.length === 0) return 'Keranjang masih kosong.';
    if (!form.name.trim()) return 'Nama wajib diisi.';
    if (!form.phone.trim()) return 'No HP wajib diisi.';
    if (!form.address.trim()) return 'Alamat wajib diisi.';
    if (!form.branch) return 'Cabang wajib dipilih.';
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setSubmitting(true);
    setError(null);

    const { data, error } = await supabase.rpc('place_order', {
      p_customer_name:    form.name.trim(),
      p_customer_phone:   form.phone.trim(),
      p_customer_address: form.address.trim(),
      p_branch:           form.branch,
      p_payment_method:   form.payment,
      p_notes:            form.notes.trim() || null,
      p_items: items.map((i) => ({ product_id: i.product_id, qty: i.qty })),
    });

    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    clearCart();
    setSuccess(data);
  };

  if (success) {
    return (
      <div className="min-h-screen pt-4 pb-12">
        <PublicHeader />
        <main className="mx-auto max-w-2xl px-4 md:px-8 mt-16">
          <div className="card p-8 md:p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-success-50 grid place-items-center mb-5">
              <CheckCircle2 className="w-8 h-8 text-success-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Pesananmu sudah masuk!
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Tim cabang akan langsung menyiapkan dimsum-mu.
            </p>

            <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/60 p-5 mt-8 text-left">
              <p className="text-xs uppercase tracking-[0.18em] text-primary-500 font-semibold">
                Kode Pesanan
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-2xl font-bold text-gray-900">{success.order_code}</p>
                <button
                  onClick={() => navigator.clipboard?.writeText(success.order_code)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary-500 hover:text-primary-600"
                >
                  <Copy className="w-3.5 h-3.5" /> Salin
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Total: <strong>{formatRupiah(success.total)}</strong>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link to="/produk" className="btn-ghost flex-1 justify-center">
                Pesan Lagi
              </Link>
              <Link
                to={`/cek?code=${success.order_code}`}
                className="btn-primary flex-1 justify-center"
              >
                Cek Status Pesanan
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-4 pb-12">
      <PublicHeader />

      <main className="mx-auto max-w-7xl px-4 md:px-8 mt-10">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 grid place-items-center rounded-full bg-white shadow-card hover:bg-primary-50 transition"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Form Pesanan</h1>
            <p className="text-sm text-gray-500 mt-1">
              Lengkapi data pengantaran dan konfirmasi pesananmu.
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="card p-10 text-center">
            <ShoppingCart className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <h2 className="text-lg font-semibold text-gray-900">Keranjang masih kosong</h2>
            <p className="text-sm text-gray-500 mt-2">
              Yuk pilih varian dimsum dulu di halaman produk.
            </p>
            <Link to="/produk" className="btn-primary mt-6">Lihat Menu</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* DATA PELANGGAN */}
              <section className="card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Data Pelanggan</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Nama Lengkap" required>
                    <input
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="Nama kamu"
                      className="input"
                    />
                  </Field>
                  <Field label="No HP / WhatsApp" required>
                    <input
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      placeholder="0812..."
                      className="input"
                    />
                  </Field>
                  <Field label="Alamat" required className="sm:col-span-2">
                    <textarea
                      value={form.address}
                      onChange={(e) => update('address', e.target.value)}
                      placeholder="Alamat lengkap (jalan, no rumah, patokan)"
                      rows={3}
                      className="input resize-none"
                    />
                  </Field>
                  <Field label="Cabang Pengambilan / Pengantaran" required className="sm:col-span-2">
                    <select
                      value={form.branch}
                      onChange={(e) => update('branch', e.target.value)}
                      className="input"
                    >
                      {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </Field>
                </div>
              </section>

              {/* METODE BAYAR */}
              <section className="card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Metode Pembayaran</h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.id}
                      className={`cursor-pointer rounded-2xl border p-4 transition ${
                        form.payment === m.id
                          ? 'border-primary-500 bg-primary-50/60 shadow-card'
                          : 'border-gray-200 bg-white hover:border-primary-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={form.payment === m.id}
                        onChange={() => update('payment', m.id)}
                        className="sr-only"
                      />
                      <p className="font-semibold text-sm text-gray-900">{m.label}</p>
                    </label>
                  ))}
                </div>
              </section>

              {/* CATATAN */}
              <section className="card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Catatan (Opsional)</h2>
                <textarea
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  placeholder="Mis. extra spicy, jangan pakai daun ketumbar, dll"
                  rows={3}
                  className="input resize-none"
                />
              </section>
            </div>

            {/* RINGKASAN */}
            <aside className="lg:col-span-1">
              <div className="sticky top-28 space-y-4">
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900">Ringkasan Pesanan</h2>
                    <span className="text-xs text-gray-500">{totalItems} pcs</span>
                  </div>

                  <ul className="divide-y divide-gray-100 mb-5">
                    {items.map((it) => (
                      <li key={it.product_id} className="flex items-center gap-3 py-3 first:pt-0">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                          <img
                            src={productImage(it)}
                            alt={it.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{it.name}</p>
                          <p className="text-xs text-gray-500">{formatRupiah(it.price)}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateQty(it.product_id, it.qty - 1)}
                            className="w-7 h-7 rounded-full border border-gray-200 grid place-items-center hover:bg-gray-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-5 text-center">{it.qty}</span>
                          <button
                            type="button"
                            disabled={it.qty >= it.stock}
                            onClick={() => updateQty(it.product_id, it.qty + 1)}
                            className="w-7 h-7 rounded-full bg-primary-500 grid place-items-center text-white hover:bg-primary-600 disabled:opacity-40"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(it.product_id)}
                            className="w-7 h-7 rounded-full text-gray-400 hover:text-danger-500 grid place-items-center"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-dashed border-gray-200 pt-4 flex items-end justify-between mb-5">
                    <span className="text-sm text-gray-500">Total Bayar</span>
                    <span className="text-2xl font-bold text-gray-900">{formatRupiah(totalPrice)}</span>
                  </div>

                  {error && (
                    <p className="text-xs text-danger-500 mb-3">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full justify-center disabled:opacity-60"
                  >
                    {submitting ? 'Memproses...' : 'Kirim Pesanan'}
                  </button>
                </div>

                <div className="card p-5 bg-primary-50/50 border border-primary-100">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-primary-500 mt-0.5" />
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Stok dipotong otomatis saat pesanan masuk. Status pesanan
                      bisa dipantau lewat kode pesananmu.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </form>
        )}
      </main>
    </div>
  );
}

function Field({ label, required, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-medium text-gray-700">
        {label} {required && <span className="text-danger-500">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
