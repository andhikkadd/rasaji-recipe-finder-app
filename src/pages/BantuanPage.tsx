import { useState } from 'react';
import { Link } from 'react-router-dom';
import { InfoPageLayout } from '../components/InfoPageLayout';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqGroup {
  id: string;
  category: string;
  items: FaqItem[];
}

const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'menggunakan-rasaji',
    category: 'Menggunakan Rasaji',
    items: [
      {
        id: 'cari-resep',
        question: 'Bagaimana cara mencari resep?',
        answer: 'Ketik nama masakan, bahan, atau kategori di kolom pencarian. Rasaji akan menampilkan resep yang paling sesuai dari data resep yang tersedia.'
      },
      {
        id: 'cari-bahan',
        question: 'Apakah saya bisa mencari berdasarkan bahan?',
        answer: 'Bisa. Kamu bisa mengetik bahan seperti ayam, telur, tahu, tempe, mie, santan, atau bahan lain yang ingin kamu gunakan.'
      },
      {
        id: 'cari-kosong',
        question: 'Kenapa hasil pencarian saya kosong?',
        answer: 'Resep yang kamu cari mungkin belum tersedia di database Rasaji. Coba gunakan kata kunci yang lebih umum, misalnya ayam, mie, telur, sambal, atau nasi.'
      },
      {
        id: 'beda-tab',
        question: 'Apa bedanya Eksplor, Populer, dan Tersimpan?',
        answer: 'Eksplor menampilkan resep yang bisa kamu jelajahi. Populer berisi resep yang banyak dilihat atau disukai. Tersimpan berisi resep yang kamu simpan setelah login.'
      }
    ]
  },
  {
    id: 'resep-dan-data',
    category: 'Resep dan Data',
    items: [
      {
        id: 'gambar-sesuai',
        question: 'Kenapa ada resep yang gambarnya kurang sesuai?',
        answer: 'Rasaji terus merapikan data resep agar gambar, judul, dan isi resep lebih cocok. Jika kamu menemukan gambar yang kurang sesuai, kamu bisa melaporkannya lewat halaman Kontak.'
      },
      {
        id: 'resep-kurasi',
        question: 'Apakah semua resep di Rasaji sudah dikurasi?',
        answer: 'Rasaji berusaha menampilkan resep yang rapi dan mudah dibaca. Namun, data resep bisa terus diperbarui agar semakin akurat dan nyaman digunakan.'
      },
      {
        id: 'langkah-kurang-jelas',
        question: 'Bagaimana jika bahan atau langkah resep terasa kurang jelas?',
        answer: 'Kamu bisa membaca halaman resep lengkap untuk melihat bahan dan langkah secara lebih detail. Jika masih ada informasi yang kurang sesuai, kirim masukan melalui halaman Kontak.'
      },
      {
        id: 'porsi-takaran',
        question: 'Apakah porsi dan takaran resep harus diikuti persis?',
        answer: 'Tidak selalu. Kamu bisa menyesuaikan takaran dengan kebutuhan, jumlah porsi, dan selera masing-masing.'
      }
    ]
  },
  {
    id: 'akun-dan-resep',
    category: 'Akun dan Resep Tersimpan',
    items: [
      {
        id: 'perlu-login',
        question: 'Kenapa saya perlu login?',
        answer: 'Login digunakan agar fitur personal seperti menyukai dan menyimpan resep bisa terhubung dengan akunmu.'
      },
      {
        id: 'cara-simpan',
        question: 'Bagaimana cara menyimpan resep?',
        answer: 'Masuk ke akunmu, lalu tekan ikon simpan pada kartu resep atau halaman detail resep. Resep tersebut akan muncul di menu Tersimpan.'
      },
      {
        id: 'tersimpan-tidak-muncul',
        question: 'Kenapa resep tersimpan saya tidak muncul?',
        answer: 'Pastikan kamu sudah masuk ke akun yang sama. Jika masih belum muncul, coba muat ulang halaman atau login kembali.'
      },
      {
        id: 'cara-keluar',
        question: 'Bagaimana cara keluar dari akun?',
        answer: 'Klik menu profil di navbar, lalu pilih Keluar.'
      }
    ]
  },
  {
    id: 'masalah-teknis',
    category: 'Masalah Teknis',
    items: [
      {
        id: 'tidak-memuat',
        question: 'Halaman tidak memuat data resep, harus bagaimana?',
        answer: 'Coba muat ulang halaman dan pastikan koneksi internet stabil. Jika masalah masih terjadi, laporkan lewat halaman Kontak.'
      },
      {
        id: 'gagal-login',
        question: 'Saya tidak bisa login atau daftar, apa yang harus dilakukan?',
        answer: 'Pastikan email dan password sudah diisi dengan benar. Jika masih bermasalah, coba muat ulang halaman atau hubungi kami lewat halaman Kontak.'
      },
      {
        id: 'tampilan-berbeda',
        question: 'Kenapa tampilan di perangkat saya berbeda?',
        answer: 'Rasaji dibuat responsif untuk berbagai ukuran layar. Jika ada bagian yang terlihat tidak rapi di perangkat tertentu, kamu bisa melaporkannya agar kami perbaiki.'
      }
    ]
  }
];

export function BantuanPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const scrollToElement = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filter FAQs locally
  const queryLower = searchQuery.toLowerCase().trim();
  
  const filteredGroups = FAQ_GROUPS.map(group => {
    const matchedItems = group.items.filter(item => 
      item.question.toLowerCase().includes(queryLower) || 
      item.answer.toLowerCase().includes(queryLower)
    );
    return {
      ...group,
      items: matchedItems
    };
  }).filter(group => group.items.length > 0);

  const totalMatches = filteredGroups.reduce((acc, curr) => acc + curr.items.length, 0);

  return (
    <InfoPageLayout
      title="Pusat Bantuan Rasaji"
      subtitle="Temukan panduan singkat untuk mencari resep, menyimpan menu favorit, dan mengelola akunmu di Rasaji."
    >
      {/* Search Bar UI */}
      <div className="help-search-container">
        <div className="help-search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input
          type="text"
          className="help-search-input"
          placeholder="Cari bantuan, misalnya simpan resep atau lupa password..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Quick Help Cards */}
      {searchQuery === '' && (
        <div className="help-cards-grid">
          <div className="help-card" onClick={() => scrollToElement('menggunakan-rasaji')}>
            <span className="help-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <h3 className="help-card-title">Mulai mencari resep</h3>
            <p className="help-card-desc">Cari menu berdasarkan nama masakan, bahan, atau kategori.</p>
          </div>

          <div className="help-card" onClick={() => scrollToElement('akun-dan-resep')}>
            <span className="help-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </span>
            <h3 className="help-card-title">Simpan resep favorit</h3>
            <p className="help-card-desc">Login lalu simpan resep yang ingin kamu coba lagi nanti.</p>
          </div>

          <div className="help-card" onClick={() => scrollToElement('akun-dan-resep')}>
            <span className="help-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <h3 className="help-card-title">Kelola akun</h3>
            <p className="help-card-desc">Masuk, daftar, dan keluar akun dari menu profil.</p>
          </div>

          <div className="help-card" onClick={() => scrollToElement('resep-dan-data')}>
            <span className="help-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </span>
            <h3 className="help-card-title">Laporkan data resep</h3>
            <p className="help-card-desc">Bantu kami memperbaiki resep, gambar, atau info yang kurang sesuai.</p>
          </div>
        </div>
      )}

      {/* Main FAQ Content Section */}
      <div className="info-content" style={{ marginTop: searchQuery === '' ? '1.5rem' : '2.5rem' }}>
        {totalMatches === 0 ? (
          <div className="empty-search-state animate-fade-in">
            <span className="empty-search-icon">🔍</span>
            <p className="empty-search-text">
              Belum ada bantuan yang cocok dengan kata kunci <strong>"{searchQuery}"</strong>. 
              Coba kata kunci lain atau hubungi kami lewat halaman Kontak.
            </p>
          </div>
        ) : (
          filteredGroups.map(group => (
            <section key={group.id} id={group.id} className="faq-group scroll-margin-top">
              <h2 className="faq-group-title">{group.category}</h2>
              <div className="accordion-container">
                {group.items.map(item => {
                  // If query is active, automatically show matches open.
                  const isOpen = searchQuery !== '' ? true : !!openAccordions[item.id];
                  
                  return (
                    <div key={item.id} className={`accordion-item ${isOpen ? 'active' : ''}`}>
                      <button
                        className="accordion-header"
                        onClick={() => toggleAccordion(item.id)}
                        aria-expanded={isOpen}
                      >
                        <h3 className="accordion-question">{item.question}</h3>
                        <svg
                          className="accordion-icon"
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                      <div
                        className="accordion-collapse"
                        style={{ maxHeight: isOpen ? '300px' : '0px' }}
                      >
                        <div className="accordion-content">
                          <p>{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Contact CTA Section */}
      <div className="support-cta-section">
        <h3 className="support-cta-title">Masih butuh bantuan?</h3>
        <p className="support-cta-desc">
          Kalau kamu menemukan bug, data resep yang kurang tepat, atau punya saran untuk menyempurnakan Rasaji, 
          kirimkan masukan lewat halaman Kontak kami.
        </p>
        <Link to="/kontak" className="support-cta-btn">
          Hubungi Rasaji
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
      </div>
    </InfoPageLayout>
  );
}
