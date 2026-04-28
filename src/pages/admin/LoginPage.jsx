import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../../store/auth.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/admin';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const ok = login(username.trim(), password);
      setLoading(false);
      if (ok) {
        navigate(from, { replace: true });
      } else {
        setError('Username atau password salah.');
        setPassword('');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-cream grid place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <img src="/logo_dimsum.jpeg" alt="Logo" className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Dimsum Alsaba</h1>
          <p className="text-sm text-gray-500 mt-1">Masuk ke panel admin</p>
        </div>

        <form onSubmit={submit} className="card p-8 space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-danger-500/8 border border-danger-500/20 px-4 py-3 text-sm text-danger-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center disabled:opacity-60"
          >
            <Lock className="w-4 h-4" />
            {loading ? 'Memverifikasi...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Halaman ini hanya untuk admin Dimsum Alsaba.
        </p>
      </div>
    </div>
  );
}
