import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { RasajiLogo } from './RasajiLogo';
import './AuthModal.css';

interface AuthModalProps {
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'forgot';
}

export function AuthModal({ onClose, initialTab = 'login' }: AuthModalProps) {
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>(initialTab);
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Front-end Validations
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      showToast("Format email tidak valid.", "error");
      setIsLoading(false);
      return;
    }

    if (activeTab === 'register') {
      const trimmedName = name.trim();
      const nameRegex = /^[a-zA-Z\s.'-]+$/;
      const hasLetter = /[a-zA-Z]/;

      if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 50 || !hasLetter.test(trimmedName) || !nameRegex.test(trimmedName)) {
        showToast("Nama harus berisi huruf dan minimal 2 karakter.", "error");
        setIsLoading(false);
        return;
      }

      if (!password || password.length < 6) {
        showToast("Password baru minimal 6 karakter.", "error");
        setIsLoading(false);
        return;
      }
    }

    try {
      if (activeTab === 'login') {
        await login(trimmedEmail, password);
        showToast("Berhasil masuk.", "success");
      } else {
        await register(name.trim(), trimmedEmail, password);
        showToast("Akun berhasil dibuat.", "success");
      }
      onClose();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.";
      showToast(errMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const switchTab = (tab: 'login' | 'register' | 'forgot') => {
    setActiveTab(tab);
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal animate-slide-up" onClick={e => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose} aria-label="Tutup">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <RasajiLogo showWordmark={false} size={48} className="auth-brand-mark" />
          </div>
          <h2 className="auth-title">
            {activeTab === 'login' ? 'Masuk ke Rasaji' : activeTab === 'register' ? 'Buat Akun Baru' : 'Lupa Password?'}
          </h2>
          <p className="auth-subtitle">
            {activeTab === 'login'
              ? 'Masuk untuk lanjut explore resep.'
              : activeTab === 'register'
              ? 'Mulai pakai Rasaji dengan akunmu sendiri.'
              : 'Pemulihan password belum tersedia otomatis. Silakan hubungi Rasaji lewat halaman Kontak.'}
          </p>
        </div>

        {activeTab !== 'forgot' && (
          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => switchTab('login')}
            >
              Masuk
            </button>
            <button
              className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => switchTab('register')}
            >
              Daftar
            </button>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {activeTab === 'register' && (
            <div className="auth-field">
              <label htmlFor="auth-name">Nama</label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nama lengkapmu"
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@contoh.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={activeTab === 'register' ? 'Minimal 6 karakter' : 'Password kamu'}
                required
                minLength={activeTab === 'register' ? 6 : undefined}
                autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {activeTab === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={() => {
                    setActiveTab('forgot');
                    showToast("Pemulihan password belum tersedia otomatis.", "info");
                  }}
                  style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer', background: 'none', border: 'none', padding: '2px 0' }}
                >
                  Lupa password?
                </button>
              </div>
            )}
          </div>

          {activeTab !== 'forgot' && (
            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <div className="auth-spinner"></div>
              ) : activeTab === 'login' ? (
                'Masuk'
              ) : (
                'Daftar Sekarang'
              )}
            </button>
          )}
        </form>

        {activeTab === 'forgot' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <button 
              type="button" 
              className="auth-submit-btn" 
              onClick={() => {
                onClose();
                navigate('/kontak');
              }}
            >
              Hubungi Rasaji
            </button>
            
            <button 
              type="button" 
              onClick={() => setActiveTab('login')}
              style={{ width: '100%', background: 'rgba(15, 23, 42, 0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', textAlign: 'center' }}
            >
              Kembali ke Login
            </button>
          </div>
        )}

        {activeTab !== 'forgot' && (
          <div className="auth-footer">
            {activeTab === 'login' ? (
              <p>Belum punya akun? <button onClick={() => switchTab('register')}>Daftar gratis</button></p>
            ) : (
              <p>Sudah punya akun? <button onClick={() => switchTab('login')}>Masuk</button></p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
