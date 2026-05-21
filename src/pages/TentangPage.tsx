import { Link } from 'react-router-dom';
import { PageShell } from '../components/PageLayout';
import '../components/InfoPageLayout.css';

export function TentangPage() {
  return (
    <PageShell 
      title="Tentang Kami" 
      subtitle="Rasaji hadir untuk membantu kamu menemukan ide masak harian dengan cara yang lebih rapi, sederhana, dan nyaman."
      breadcrumbItems={[{ label: 'Tentang' }]}
    >
      <div className="about-wrapper animate-fade-in">
        
        {/* 1. Story Section */}
        <section className="about-story" style={{ marginTop: 0 }}>
          <h2 className="about-section-heading">Kenapa Rasaji dibuat?</h2>
          <p className="about-story-text">
            Rasaji berangkat dari kebiasaan sederhana: ingin masak, tapi bingung mulai dari mana. 
            Dengan tampilan yang bersih dan data resep yang lebih tertata, Rasaji membantu proses mencari 
            ide masak terasa lebih ringan.
          </p>
        </section>

        {/* 2. What Rasaji Helps With (Elegant Feature Cards) */}
        <section className="about-features-grid" style={{ marginTop: '2.5rem' }}>
          
          <div className="about-feature-card">
            <div className="about-feature-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3 className="about-feature-title">Cari ide masak lebih cepat</h3>
            <p className="about-feature-desc">
              Cari resep berdasarkan nama menu, bahan utama, atau kategori hidangan Nusantara yang tersedia.
            </p>
          </div>

          <div className="about-feature-card">
            <div className="about-feature-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <h3 className="about-feature-title">Bahan & Langkah Terstruktur</h3>
            <p className="about-feature-desc">
              Setiap resep disusun dengan urutan langkah yang mudah dibaca langsung saat kamu berada di dapur.
            </p>
          </div>

          <div className="about-feature-card">
            <div className="about-feature-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="about-feature-title">Simpan resep pilihanmu</h3>
            <p className="about-feature-desc">
              Simpan resep-resep andalanmu agar bisa kamu akses lagi dengan mudah kapan saja.
            </p>
          </div>

        </section>

        {/* 3. High Focus Principles */}
        <section className="about-focus-section" style={{ marginTop: '3.5rem' }}>
          <h2 className="about-section-heading" style={{ textAlign: 'center', marginBottom: 0 }}>Fokus Utama Rasaji</h2>
          
          <div className="about-focus-list">
            <div className="about-focus-item">
              <div className="about-focus-number">1</div>
              <span className="about-focus-text">Kemudahan membaca bumbu dan bahan</span>
            </div>
            
            <div className="about-focus-item">
              <div className="about-focus-number">2</div>
              <span className="about-focus-text">Navigasi bersih tanpa iklan yang menutupi langkah masak</span>
            </div>

            <div className="about-focus-item">
              <div className="about-focus-number">3</div>
              <span className="about-focus-text">Pencarian resep pintar yang responsif</span>
            </div>

            <div className="about-focus-item">
              <div className="about-focus-number">4</div>
              <span className="about-focus-text">Desain bernuansa hangat dan nyaman di mata</span>
            </div>

            <div className="about-focus-item">
              <div className="about-focus-number">5</div>
              <span className="about-focus-text">Tampilan responsif di seluruh perangkat</span>
            </div>
          </div>
        </section>

        {/* 4. Data Note / Honesty Section */}
        <section className="about-data-section" style={{ marginTop: '3.5rem' }}>
          <div className="about-data-content">
            <h2 className="about-section-heading" style={{ marginBottom: '0.75rem' }}>Tentang data resep</h2>
            <p className="about-data-desc">
              Rasaji terus merapikan data resep agar judul, gambar, bahan, dan langkah masak terasa konsisten. 
              Jika kamu menemukan informasi yang kurang sesuai, kamu bisa mengirim masukan melalui halaman Kontak.
            </p>
          </div>
          <Link to="/kontak" className="about-data-btn">
            <span>Kirim Masukan</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12,5 19,12 12,19"></polyline>
            </svg>
          </Link>
        </section>

        {/* 5. CTA Bottom Section */}
        <section className="about-cta-section" style={{ marginTop: '3.5rem', marginBottom: 0 }}>
          <h2 className="about-cta-title">Siap cari ide masak hari ini?</h2>
          <p className="about-cta-desc">
            Mulai jelajahi resep dan temukan menu yang paling cocok untuk dapurmu.
          </p>
          
          <div className="about-cta-buttons">
            <Link to="/" className="about-cta-primary">
              Jelajahi Resep
            </Link>
            <Link to="/kontak" className="about-cta-secondary">
              Hubungi Rasaji
            </Link>
          </div>
        </section>

      </div>
    </PageShell>
  );
}
