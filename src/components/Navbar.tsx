import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { AuthModal } from './AuthModal';
import './Navbar.css';

interface NavbarProps {
  activeTab?: 'explore' | 'popular' | 'saved' | 'ai-search';
  onTabChange?: (tab: 'explore' | 'popular' | 'saved' | 'ai-search') => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
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

  const handleTabClick = (tab: 'explore' | 'popular' | 'saved' | 'ai-search') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      // If we are on another page, navigate to '/' with state so HomeView knows which tab to activate
      navigate('/', { state: { activeTab: tab } });
    }
  };

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      if (activeTab === 'explore' && onTabChange) {
        const hero = document.getElementById('home-hero');
        if (hero) {
          hero.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (onTabChange) {
        onTabChange('explore');
      }
    } else {
      navigate('/');
    }
  };

  const savedCount = auth.isLoggedIn
    ? auth.user?.bookmarkedIds?.length || 0
    : (() => {
        const saved = localStorage.getItem('rasaji_bookmarks');
        return saved ? JSON.parse(saved).length : 0;
      })();

  return (
    <>
      <header className="app-header">
        <div className="logo-container" onClick={handleLogoClick}>
          <svg className="brand-logo-mark" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            {/* Fluid Bowl */}
            <path d="M 6 15 C 6 25 26 25 26 15" fill="none" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Mixing Swirl */}
            <path d="M 12 18 C 10 12 14 6 20 7" fill="none" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
            {/* Leaf Accent */}
            <path d="M 20 7 Q 24 3 27 7 Q 23 11 20 7 Z" fill="#10B981" />
            {/* Warm Seasoning Dot */}
            <circle cx="10" cy="9" r="2" fill="#F59E0B" />
          </svg>
          <h1 className="logo-text">Rasa<span className="text-accent">j</span>i</h1>
        </div>

        <div className="nav-tabs">
          <button className={`nav-tab ${activeTab === 'explore' ? 'active' : ''}`} onClick={() => handleTabClick('explore')}>
            Eksplor
          </button>
          <button className={`nav-tab ${activeTab === 'popular' ? 'active' : ''}`} onClick={() => handleTabClick('popular')}>
            Populer
          </button>
          <button className={`nav-tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => handleTabClick('saved')}>
            Tersimpan ({savedCount})
          </button>
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
