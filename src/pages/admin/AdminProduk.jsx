import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase, formatRupiah, productImage } from '../../lib/supabase.js';

const emptyForm = {
  name: '', category: 'mentai', variant: 'Original', size: '8pcs',
  price: '', stock: 0, description: '', image_url: '', is_active: true,
};

export default function AdminProduk() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('category').order('price');
    if (error) setError(error.message);
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing('new'); setForm(emptyForm); setError(null); };
  const openEdit = (p) => {
    setEditing(p.id);
    setForm({
      name: p.name, category: p.category, variant: p.variant, size: p.size,
      price: p.price, stock: p.stock, description: p.description || '',
      image_url: p.image_url || '', is_active: p.is_active,
    });
    setError(null);
  };
  const close = () => { setEditing(null); setForm(emptyForm); setError(null); };

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.price === '' || Number(form.price) < 0) {
      setError('Nama dan harga wajib diisi.');
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase.rpc('upsert_product', {
        p_id:          editing === 'new' ? null : editing,
        p_name:        form.name.trim(),
        p_category:    form.category,
        p_variant:     form.variant.trim(),
        p_size:        form.size,
        p_price:       Number(form.price),
        p_stock:       Number(form.stock) || 0,
        p_description: form.description.trim() || null,
        p_image_url:   form.image_url.trim() || null,
        p_is_active:   form.is_active,
      });
      if (error) throw error;
      close();
      load();
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!confirm(`Hapus produk "${p.name}"?`)) return;
    try {
      const { error } = await supabase.rpc('delete_product', { p_product_id: p.id });
      if (error) throw error;
      load();
    } catch (e) {
      alert('Gagal hapus: ' + (e?.message || e));
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Kelola Produk</h1>
          <p className="text-sm text-gray-500 mt-2">{products.length} produk · CRUD lengkap.</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Tambah Produk
        </button>
      </div>

      {error && !editing && (
        <div className="card p-4 mb-6 text-sm text-danger-500">{error}</div>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 bg-cream/60">
                <th className="font-medium px-4 py-3">Produk</th>
                <th className="font-medium px-4 py-3">Kategori</th>
                <th className="font-medium px-4 py-3">Ukuran</th>
                <th className="font-medium px-4 py-3">Harga</th>
                <th className="font-medium px-4 py-3">Stok</th>
                <th className="font-medium px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">Memuat...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">Belum ada produk.</td></tr>
              ) : products.map((p) => (
                <tr key={p.id} className="hover:bg-cream/60 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        <img src={productImage(p)} alt={p.name} className="w-full h-full object-cover"
                             onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{p.name}</p>
                        <p className="text-[11px] text-gray-500 line-clamp-1">{p.description || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="pill bg-primary-50 text-primary-500 text-[10px] capitalize">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{p.size}</td>
                  <td className="px-4 py-3 text-gray-900 font-semibold">{formatRupiah(p.price)}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{p.stock}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => openEdit(p)}
                              className="w-8 h-8 grid place-items-center rounded-full hover:bg-primary-50 text-gray-500 hover:text-primary-500 transition">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(p)}
                              className="w-8 h-8 grid place-items-center rounded-full hover:bg-danger-500/10 text-gray-500 hover:text-danger-500 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-gray-900/40 backdrop-blur-sm p-4">
          <form
            onSubmit={save}
            className="bg-white rounded-3xl shadow-card-hover w-full max-w-2xl max-h-[90vh] overflow-auto"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-gray-900">
                {editing === 'new' ? 'Tambah Produk Baru' : 'Edit Produk'}
              </h2>
              <button type="button" onClick={close} className="w-8 h-8 grid place-items-center rounded-full hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-4">
              <Field label="Nama Produk" required className="sm:col-span-2">
                <input value={form.name} onChange={(e) => update('name', e.target.value)}
                       placeholder="Contoh: Dimsum Mentai Original" className="input" />
              </Field>
              <Field label="Kategori" required>
                <select value={form.category} onChange={(e) => update('category', e.target.value)} className="input">
                  <option value="mentai">Mentai</option>
                  <option value="tartar">Tar-Tar</option>
                </select>
              </Field>
              <Field label="Varian" required>
                <select value={form.variant} onChange={(e) => update('variant', e.target.value)} className="input">
                  <option>Original</option>
                  <option>Spicy</option>
                  <option>Mix</option>
                  <option>Cheese</option>
                  <option>Cheese Melt</option>
                  <option>Mozarella</option>
                </select>
              </Field>
              <Field label="Ukuran" required>
                <select value={form.size} onChange={(e) => update('size', e.target.value)} className="input">
                  <option value="8pcs">8 pcs</option>
                  <option value="16pcs">16 pcs</option>
                  <option value="25pcs">25 pcs</option>
                </select>
              </Field>
              <Field label="Status">
                <select value={form.is_active ? 'active' : 'inactive'}
                        onChange={(e) => update('is_active', e.target.value === 'active')} className="input">
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </Field>
              <Field label="Harga (Rp)" required>
                <input type="number" min={0} value={form.price}
                       onChange={(e) => update('price', e.target.value)}
                       placeholder="25000" className="input" />
              </Field>
              <Field label="Stok Awal">
                <input type="number" min={0} value={form.stock}
                       onChange={(e) => update('stock', e.target.value)}
                       placeholder="50" className="input" />
              </Field>
              <Field label="URL Gambar (opsional)" className="sm:col-span-2">
                <input value={form.image_url} onChange={(e) => update('image_url', e.target.value)}
                       placeholder="https://..." className="input" />
              </Field>
              <Field label="Deskripsi" className="sm:col-span-2">
                <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
                          rows={3} placeholder="Deskripsi singkat produk..."
                          className="input resize-none" />
              </Field>
            </div>
            {error && (
              <p className="px-6 text-xs text-danger-500">{error}</p>
            )}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
              <button type="button" onClick={close} className="btn-ghost text-sm">Batal</button>
              <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-60">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
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
