import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/auth.jsx';

export default function ProtectedRoute({ children }) {
  const { authed } = useAuth();
  const location = useLocation();

  if (!authed) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
