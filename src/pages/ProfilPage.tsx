import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { InfoPageLayout } from '../components/InfoPageLayout';
import './ProfilPage.css';

export function ProfilPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If session is still loading/null
  if (!user) {
    return null;
  }

  // Get initial character for Avatar
  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  // Format joined date
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    : '-';

  return (
    <InfoPageLayout 
      title="Profil Saya" 
      subtitle="Kelola identitas akunmu dan lihat ringkasan aktivitasmu di Rasaji."
    >
      <div className="profile-container animate-fade-in">
        
        {/* Profile Card */}
        <div className="profile-card card">
          <div className="profile-header-info">
            <div className="profile-avatar-large">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="profile-avatar-img" />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <div className="profile-user-details">
              <h2 className="profile-user-name">{user.name}</h2>
              <p className="profile-user-email">{user.email}</p>
              <div className="profile-joined-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>Bergabung sejak {joinedDate}</span>
              </div>
            </div>
          </div>

          <div className="profile-action-bar">
            <button className="profile-edit-btn" onClick={() => navigate('/pengaturan-akun')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Edit Profil</span>
            </button>
          </div>
        </div>

        {/* Activity Summary Section */}
        <div className="profile-activity-section">
          <h3 className="section-title">Aktivitas Memasak</h3>
          <div className="profile-stats-grid">
            
            {/* Stat Card 1: Liked Recipes */}
            <div className="stat-card card">
              <div className="stat-icon-wrapper liked">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{user.likedIds?.length || 0}</span>
                <span className="stat-label">Resep Disukai</span>
              </div>
            </div>

            {/* Stat Card 2: Bookmarked/Saved Recipes */}
            <div className="stat-card card">
              <div className="stat-icon-wrapper bookmarked">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{user.bookmarkedIds?.length || 0}</span>
                <span className="stat-label">Resep Tersimpan</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </InfoPageLayout>
  );
}
