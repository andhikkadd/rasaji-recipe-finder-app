import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '../components/PageLayout';

export function KontakPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;
    
    // Simulate submission locally
    setIsSubmitted(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');

    // Hide success alert after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };

  return (
    <PageShell 
      title="Hubungi Kami" 
      subtitle="Kirim masukan, saran, atau pertanyaan seputar aplikasi Rasaji."
      breadcrumbItems={[{ label: 'Kontak' }]}
    >
      <div className="contact-page-wrapper animate-fade-in" style={{ marginTop: 0 }}>
        <div className="contact-layout">
          
          {/* Left Column: Hero, Intro & Compact Channels */}
          <div className="contact-hero-left">
            <div className="contact-hero-title-group">
              <h1 className="contact-hero-kicker">Ada yang ingin dibantu?</h1>
              <h2 className="contact-hero-accent">Kirim aja.</h2>
            </div>
            
            <p className="contact-hero-subtitle">
              Punya pertanyaan, masukan, atau hal yang ingin dibahas soal Rasaji? Tulis lewat formulir ini atau hubungi kami via email.
            </p>

            <div className="contact-channels-section">
              
              {/* Email Link Channel */}
              <a href="mailto:support@rasaji.com" className="contact-channel-item">
                <div className="contact-channel-icon-bg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div className="contact-channel-info">
                  <span className="contact-channel-label">Email</span>
                  <span className="contact-channel-value">support@rasaji.com</span>
                </div>
              </a>

            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-form-card card">
            {isSubmitted && (
              <div className="success-message-card" style={{ marginBottom: '1.25rem' }}>
                <div className="success-icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <h4 className="success-title">Pesan Terkirim</h4>
                  <p className="success-desc">Terima kasih atas masukannya!</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="contact-name" className="form-label">Nama</label>
                <input
                  id="contact-name"
                  type="text"
                  className="form-input"
                  placeholder="Nama lengkap Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-email" className="form-label">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  className="form-input"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-subject" className="form-label">Subjek</label>
                <input
                  id="contact-subject"
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Masukan untuk Rasaji"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-message" className="form-label">Pesan</label>
                <textarea
                  id="contact-message"
                  className="form-textarea"
                  placeholder="Tulis pesanmu di sini..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="form-submit-btn" style={{ marginTop: '0.25rem' }}>
                Kirim pesan
              </button>
            </form>

            <p className="contact-form-helper-text">
              Butuh bantuan cepat?{' '}
              <Link to="/bantuan" className="contact-form-helper-link">
                Buka Bantuan
              </Link>
              .
            </p>
          </div>

        </div>
      </div>
    </PageShell>
  );
}
