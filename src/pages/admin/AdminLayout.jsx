import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, ClipboardList, ExternalLink, LogOut,
} from 'lucide-react';
import { useAuth } from '../../store/auth.jsx';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/produk', label: 'Produk', icon: ShoppingBag },
  { to: '/admin/stok', label: 'Stok', icon: Package },
  { to: '/admin/pesanan', label: 'Pesanan', icon: ClipboardList },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="flex">
        {/* SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 min-h-screen sticky top-0 bg-white border-r border-gray-100 px-5 py-6">
          <Link to="/" className="flex items-center gap-2 mb-10">
            <img src="/logo_dimsum.jpeg" alt="Logo" className="w-8 h-8" />
            <div>
              <p className="font-bold text-gray-900 tracking-tight leading-tight">Dimsum Alsaba</p>
              <p className="text-[10px] text-gray-500">Admin Panel</p>
            </div>
          </Link>

          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 font-semibold mb-3 px-3">
            Workspace
          </p>
          <nav className="flex flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive
                    ? 'bg-primary-500 text-white shadow-card'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-500'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-2">
            <Link
              to="/"
              className="flex items-center justify-between gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-xs font-medium text-gray-700 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-500 transition"
            >
              Lihat Halaman User
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-xs font-medium text-gray-700 hover:border-danger-500/30 hover:bg-danger-500/5 hover:text-danger-500 transition"
            >
              Logout
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>

        {/* MOBILE TOP NAV */}
        <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-500 grid place-items-center text-white text-sm font-bold">A</span>
              <span className="text-sm font-bold text-gray-900">Admin Alsaba</span>
            </Link>
            <button onClick={handleLogout} className="text-xs text-gray-500 inline-flex items-center gap-1 hover:text-danger-500">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
          <nav className="flex items-center gap-1 overflow-x-auto px-3 pb-2">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${isActive ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <main className="flex-1 min-w-0 px-4 md:px-10 py-6 mt-24 lg:mt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
