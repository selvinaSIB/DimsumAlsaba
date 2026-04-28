import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../store/cart.jsx';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/produk', label: 'Produk' },
  { to: '/pesan', label: 'Pesan' },
  { to: '/cek', label: 'Cek Pesanan' },
];

export default function PublicHeader() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-4 z-30 mx-auto max-w-7xl px-4">
      <div className="flex items-center justify-between gap-4 rounded-full bg-white/95 backdrop-blur px-5 py-3 shadow-card">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo_dimsum.jpeg" alt="Logo" className="w-8 h-8" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition ${isActive
                  ? 'text-primary-500 underline underline-offset-8 decoration-2'
                  : 'text-gray-700 hover:text-primary-500'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/pesan"
            className="relative w-9 h-9 grid place-items-center rounded-full bg-primary-50 hover:bg-primary-100 transition"
            aria-label="Keranjang"
          >
            <ShoppingCart className="w-4 h-4 text-primary-500" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary-500 text-white text-[10px] grid place-items-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>
          <Link
            to="/login"
            className="hidden sm:inline-flex text-xs font-semibold text-gray-700 hover:text-primary-500 px-3 py-2 rounded-full border border-gray-200 hover:border-primary-200 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
