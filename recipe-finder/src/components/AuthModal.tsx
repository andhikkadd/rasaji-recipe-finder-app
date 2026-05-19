import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AuthModal.css';

interface AuthModalProps {
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export function AuthModal({ onClose, initialTab = 'login' }: AuthModalProps) {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setError('');
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal animate-slide-up" onClick={e => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="auth-header">
          <h2 className="auth-title">
            {activeTab === 'login' ? 'Masuk ke Racikin' : 'Buat Akun Baru'}
          </h2>
          <p className="auth-subtitle">
            {activeTab === 'login'
              ? 'Simpan resep favoritmu dan akses dari mana saja.'
              : 'Gratis dan cuma butuh 30 detik!'}
          </p>
        </div>

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
          </div>

          {error && (
            <div className="auth-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? (
              <div className="auth-spinner"></div>
            ) : activeTab === 'login' ? (
              'Masuk'
            ) : (
              'Daftar Sekarang'
            )}
          </button>
        </form>

        <div className="auth-footer">
          {activeTab === 'login' ? (
            <p>Belum punya akun? <button onClick={() => switchTab('register')}>Daftar gratis</button></p>
          ) : (
            <p>Sudah punya akun? <button onClick={() => switchTab('login')}>Masuk</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
