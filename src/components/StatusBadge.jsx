const map = {
  active:    { label: 'Aktif',         cls: 'bg-success-50 text-success-500' },
  low_stock: { label: 'Stok Menipis',  cls: 'bg-warning-50 text-warning-500' },
  inactive:  { label: 'Nonaktif',      cls: 'bg-gray-100 text-gray-500' },
  received:  { label: 'Diterima',      cls: 'bg-primary-50 text-primary-500' },
  preparing: { label: 'Diproses',      cls: 'bg-warning-50 text-warning-500' },
  ready:     { label: 'Siap Diambil',  cls: 'bg-blue-50 text-blue-500' },
  delivered: { label: 'Selesai',       cls: 'bg-success-50 text-success-500' },
  cancelled: { label: 'Dibatalkan',    cls: 'bg-danger-500/10 text-danger-500' },
};

export default function StatusBadge({ status, children }) {
  const cfg = map[status] || { label: children || status, cls: 'bg-gray-100 text-gray-600' };
  return <span className={`pill ${cfg.cls}`}>{cfg.label}</span>;
}
