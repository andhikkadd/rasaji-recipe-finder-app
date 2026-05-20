import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Footer.css';

export function Footer() {
  const { user } = useAuth();

  return (
    <footer className="rasaji-footer">
      <div className="footer-content">

        <div className="footer-top">
          <div className="footer-brand">
            <span className="brand-name">Rasaji</span>
            <span className="brand-dash"> - </span>
            <span className="brand-tagline">Bingung makan apa? Temukan di Rasaji.</span>
          </div>

          <div className="footer-links">
            <Link to="/tentang" className="footer-link">Tentang</Link>
            <span className="footer-dot">·</span>
            <Link to="/kontak" className="footer-link">Kontak</Link>
            <span className="footer-dot">·</span>
            <Link to="/bantuan" className="footer-link">Bantuan</Link>
            <span className="footer-dot">·</span>
            <Link to="/privasi" className="footer-link">Privasi</Link>
            {user?.role === 'admin' && (
              <>
                <span className="footer-dot">·</span>
                <a href="/admin" onClick={(e) => { e.preventDefault(); window.location.href = '/admin'; }} className="footer-link" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Admin</a>
              </>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          &copy; 2026 Rasaji. Dibuat untuk yang sering bingung makan apa.
        </div>

      </div>
    </footer>
  );
}
