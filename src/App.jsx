import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import ProdukPage from './pages/ProdukPage.jsx';
import PesanPage from './pages/PesanPage.jsx';
import CekPesananPage from './pages/CekPesananPage.jsx';
import LoginPage from './pages/admin/LoginPage.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProduk from './pages/admin/AdminProduk.jsx';
import AdminStok from './pages/admin/AdminStok.jsx';
import AdminPesanan from './pages/admin/AdminPesanan.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      {/* User routes */}
      <Route path="/"       element={<HomePage />} />
      <Route path="/produk" element={<ProdukPage />} />
      <Route path="/pesan"  element={<PesanPage />} />
      <Route path="/cek"    element={<CekPesananPage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin routes — dilindungi ProtectedRoute */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index           element={<AdminDashboard />} />
        <Route path="produk"   element={<AdminProduk />} />
        <Route path="stok"     element={<AdminStok />} />
        <Route path="pesanan"  element={<AdminPesanan />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
