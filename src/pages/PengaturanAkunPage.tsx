/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { PageShell } from '../components/PageLayout';
import './PengaturanAkunPage.css';

export function PengaturanAkunPage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  // Profile Form States
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Password Toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sync user info on load
  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatar(user.avatarUrl || null);
    }
  }, [user]);

  if (!user) {
    return null;
  }

  // Handle avatar upload / local file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("Ukuran foto maksimal 2MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Display Name & Avatar updates
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    const trimmedName = name.trim();
    const nameRegex = /^[a-zA-Z\s.'-]+$/;
    const hasLetter = /[a-zA-Z]/;

    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 50 || !hasLetter.test(trimmedName) || !nameRegex.test(trimmedName)) {
      showToast("Nama harus berisi huruf dan minimal 2 karakter.", "error");
      setIsUpdatingProfile(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, avatarUrl: avatar }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(data?.error || "Gagal memperbarui profil.");
      }

      await refreshUser();
      showToast("Profil berhasil diperbarui.", "success");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Gagal memperbarui profil.";
      showToast(errMsg, "error");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Password Change
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPassword(true);

    if (!currentPassword) {
      showToast("Password lama wajib diisi.", "error");
      setIsUpdatingPassword(false);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      showToast("Password baru minimal 6 karakter.", "error");
      setIsUpdatingPassword(false);
      return;
    }

    if (newPassword === currentPassword) {
      showToast("Password baru harus berbeda dengan password lama.", "error");
      setIsUpdatingPassword(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast("Konfirmasi password tidak sama.", "error");
      setIsUpdatingPassword(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(data?.error || "Gagal memperbarui password.");
      }

      showToast("Password berhasil diperbarui.", "success");
      
      // Reset forms
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Gagal memperbarui password.";
      showToast(errMsg, "error");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <PageShell 
      title="Pengaturan Akun" 
      subtitle="Perbarui informasi profil dan keamanan akunmu."
      breadcrumbItems={[{ label: 'Pengaturan Akun' }]}
    >
      <div className="settings-container animate-fade-in">
        
        {/* Profile Info Section */}
        <section className="settings-section card">
          <h3 className="settings-section-title">Informasi Profil</h3>
          <p className="settings-section-desc">Nama ini akan ditampilkan di akun Rasaji kamu.</p>
          
          <div className="avatar-settings-wrapper">
            <h4 className="avatar-settings-title">Foto Profil</h4>
            <p className="avatar-settings-desc">Gunakan foto atau biarkan Rasaji menampilkan inisial namamu.</p>
            
            <div className="avatar-settings-content">
              <div className="avatar-preview-box">
                {avatar ? (
                  <img src={avatar} alt="Preview Avatar" className="avatar-preview-img" />
                ) : (
                  <div className="avatar-preview-placeholder">{initial}</div>
                )}
              </div>
              <div className="avatar-actions-box">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
                <button type="button" className="avatar-btn select-btn" onClick={handleSelectPhoto}>
                  Ganti Foto
                </button>
                {avatar && (
                  <button type="button" className="avatar-btn remove-btn" onClick={handleRemovePhoto}>
                    Hapus Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="settings-form">
            <div className="settings-field">
              <label htmlFor="settings-name">Nama Tampilan</label>
              <input
                id="settings-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkapmu"
                required
              />
            </div>

            <div className="settings-field">
              <label htmlFor="settings-email">Email (Tidak dapat diubah)</label>
              <input
                id="settings-email"
                type="email"
                value={user.email}
                disabled
                className="input-disabled"
              />
            </div>

            <button type="submit" className="settings-submit-btn" disabled={isUpdatingProfile}>
              {isUpdatingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </section>

        {/* Change Password Section */}
        <section className="settings-section card">
          <h3 className="settings-section-title">Keamanan Akun</h3>
          <p className="settings-section-desc">Ubah password secara berkala untuk menjaga akun tetap aman.</p>
          
          <form onSubmit={handleUpdatePassword} className="settings-form">
            <div className="settings-field">
              <label htmlFor="settings-current-password">Password Lama</label>
              <div className="settings-password-wrapper">
                <input
                  id="settings-current-password"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan password lama"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowCurrent(!showCurrent)}
                  aria-label={showCurrent ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showCurrent ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="settings-new-password">Password Baru</label>
              <div className="settings-password-wrapper">
                <input
                  id="settings-new-password"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password baru minimal 6 karakter"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNew(!showNew)}
                  aria-label={showNew ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showNew ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="settings-confirm-password">Konfirmasi Password Baru</label>
              <div className="settings-password-wrapper">
                <input
                  id="settings-confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showConfirm ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <p className="settings-helper-text">
              Gunakan password yang mudah kamu ingat, tapi sulit ditebak.
            </p>

            <button type="submit" className="settings-submit-btn" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? 'Memperbarui...' : 'Perbarui Password'}
            </button>
          </form>
        </section>

      </div>
    </PageShell>
  );
}
