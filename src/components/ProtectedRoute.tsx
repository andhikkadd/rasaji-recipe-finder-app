import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface ProtectedRouteProps {
  element: React.ReactElement;
}

export function ProtectedRoute({ element }: ProtectedRouteProps) {
  const { isLoggedIn, isLoading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      const justLoggedOut = sessionStorage.getItem('just_logged_out');
      if (justLoggedOut) {
        sessionStorage.removeItem('just_logged_out');
      } else {
        showToast("Masuk dulu untuk membuka halaman akun.", "error");
      }
    }
  }, [isLoggedIn, isLoading, showToast]);

  if (isLoading) {
    return (
      <div className="app-shell" style={{ justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Memuat sesi...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return element;
}
