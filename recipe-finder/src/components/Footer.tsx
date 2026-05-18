import { useAuth } from '../contexts/AuthContext';
import './Footer.css';

export function Footer() {
  const { user } = useAuth();

  return (
    <footer className="racikin-footer">
      <div className="footer-content">

        <div className="footer-top">
          <div className="footer-brand">
            <span className="brand-name">Racikin</span>
            <span className="brand-dash"> - </span>
            <span className="brand-tagline">Bingung makan apa? Sini diracikin.</span>
          </div>

          <div className="footer-links">
            <a href="#" onClick={(e) => e.preventDefault()} className="footer-link">Tentang</a>
            <span className="footer-dot">·</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="footer-link">Kontak</a>
            <span className="footer-dot">·</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="footer-link">Bantuan</a>
            <span className="footer-dot">·</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="footer-link">Privasi</a>
            {user?.role === 'admin' && (
              <>
                <span className="footer-dot">·</span>
                <a href="/admin" onClick={(e) => { e.preventDefault(); window.location.href = '/admin'; }} className="footer-link" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Admin</a>
              </>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          &copy; 2026 Racikin. Dibuat untuk yang sering bingung makan apa.
        </div>

      </div>
    </footer>
  );
}
