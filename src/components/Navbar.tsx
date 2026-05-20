import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { AuthModal } from './AuthModal';
import { RasajiLogo } from './RasajiLogo';
import './Navbar.css';

interface NavbarProps {
  activeTab?: 'explore' | 'saved' | 'ai-search';
  onTabChange?: (tab: 'explore' | 'saved' | 'ai-search') => void;
}

export function Navbar({}: NavbarProps) {
  const auth = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  // User Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openAuth = useCallback((tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setShowAuthModal(true);
  }, []);

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      const hero = document.getElementById('home-hero');
      if (hero) {
        hero.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="logo-container" onClick={handleLogoClick}>
          <RasajiLogo />
        </div>

        <div className="auth-section">
          {auth.isLoggedIn ? (
            <div className="user-menu" ref={dropdownRef}>
              <button 
                className="user-profile-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {auth.user?.avatarUrl ? (
                  <img src={auth.user.avatarUrl} alt="Avatar" className="user-avatar" style={{ objectFit: 'cover' }} />
                ) : (
                  <div className="user-avatar">
                    {auth.user?.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="user-name">{auth.user?.name}</span>
                <svg className={`user-chevron ${isDropdownOpen ? 'open' : ''}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              
              {isDropdownOpen && (
                <div className="user-dropdown animate-slide-up-fast">
                  <button className="dropdown-item" onClick={() => { navigate('/profil'); setIsDropdownOpen(false); }}>Profil Saya</button>
                  <button className="dropdown-item" onClick={() => { navigate('/pengaturan-akun'); setIsDropdownOpen(false); }}>Pengaturan Akun</button>
                  <button className="dropdown-item" onClick={() => { navigate('/tersimpan'); setIsDropdownOpen(false); }}>Resep Tersimpan</button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item text-danger" onClick={async () => {
                    try {
                      sessionStorage.setItem('just_logged_out', 'true');
                      await auth.logout();
                      navigate('/');
                      showToast("Berhasil keluar.", "success");
                    } catch {
                      showToast("Gagal keluar. Coba lagi.", "error");
                    }
                    setIsDropdownOpen(false);
                  }}>Keluar</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="auth-nav-btn login-btn" onClick={() => openAuth('login')}>
                Masuk
              </button>
              <button className="auth-nav-btn register-btn" onClick={() => openAuth('register')}>
                Daftar
              </button>
            </div>
          )}
        </div>
      </header>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          initialTab={authModalTab}
        />
      )}
    </>
  );
}
