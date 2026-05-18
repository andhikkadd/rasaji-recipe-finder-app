import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getReviewStats, getReviewRecipes, approveRecipe, rejectRecipe, deleteRecipe, updateRecipe } from '../services/adminApi';
import { normalizeRecipe } from '../utils/recipeNormalizer';
import type { Recipe } from '../types';
import './AdminDashboard.css';

export function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeTab, setActiveTab] = useState<string>('needs_review'); // 'needs_review', 'scraped', 'cached_unverified', 'verified', 'rejected', 'all'
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData(activeTab);
    }
  }, [user, activeTab]);

  const loadData = async (tab: string) => {
    try {
      const statsData = await getReviewStats();
      setStats(statsData);

      const recipeData = await getReviewRecipes(tab === 'needs_review' || tab === 'all' ? '' : tab);
      setRecipes(recipeData);
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) return <div className="admin-message">Memuat...</div>;
  if (!user) return <div className="admin-message">Harap masuk untuk mengakses halaman admin.</div>;
  if (user.role !== 'admin') return <div className="admin-message">Kamu tidak punya akses ke halaman admin.</div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Review</h1>
        <p>Cek resep dari sumber luar sebelum masuk sebagai resep terverifikasi.</p>
      </header>

      {stats && (
        <div className="admin-stats">
          <div className="stat-card">
            <span>Menunggu Review</span>
            <strong>{stats.scraped + stats.cached_unverified}</strong>
          </div>
          <div className="stat-card">
            <span>Scraped</span>
            <strong>{stats.scraped}</strong>
          </div>
          <div className="stat-card">
            <span>Verified</span>
            <strong>{stats.verified}</strong>
          </div>
          <div className="stat-card">
            <span>Rejected</span>
            <strong>{stats.rejected}</strong>
          </div>
        </div>
      )}

      <div className="admin-tabs">
        <button className={activeTab === 'needs_review' ? 'active' : ''} onClick={() => setActiveTab('needs_review')}>
          Menunggu Review
        </button>
        <button className={activeTab === 'scraped' ? 'active' : ''} onClick={() => setActiveTab('scraped')}>
          Scraped
        </button>
        <button className={activeTab === 'cached_unverified' ? 'active' : ''} onClick={() => setActiveTab('cached_unverified')}>
          Cached Unverified
        </button>
        <button className={activeTab === 'verified' ? 'active' : ''} onClick={() => setActiveTab('verified')}>
          Verified
        </button>
        <button className={activeTab === 'rejected' ? 'active' : ''} onClick={() => setActiveTab('rejected')}>
          Rejected
        </button>
      </div>

      <div className="admin-list">
        {recipes.length === 0 ? (
          <p className="empty-message">Belum ada resep yang perlu direview di kategori ini.</p>
        ) : (
          <div className="admin-grid">
            {recipes.map(r => (
              <div key={r.id} className="admin-recipe-card">
                <div className="img-wrapper">
                  {r.image ? <img src={r.image} alt={r.title} /> : <div className="placeholder" />}
                </div>
                <div className="card-info">
                  <h3>{r.title}</h3>
                  <div className="meta">
                    <span className={`badge status-${r.status}`}>{r.status}</span>
                    <span>{r.category}</span>
                  </div>
                  <p className="source">Sumber: {r.sourceName || 'Internal'}</p>
                  <button className="btn-review" onClick={() => setSelectedRecipe(r)}>Review</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRecipe && (
        <AdminReviewModal 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)}
          onRefresh={() => {
            setSelectedRecipe(null);
            loadData(activeTab);
          }}
        />
      )}
    </div>
  );
}

function AdminReviewModal({ recipe, onClose, onRefresh }: { recipe: Recipe, onClose: () => void, onRefresh: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Recipe>>({ ...recipe });
  
  // Convert arrays to string for textarea editing
  const [ingStr, setIngStr] = useState((recipe.ingredients || []).join('\n'));
  const [toolsStr, setToolsStr] = useState((recipe.tools || []).join('\n'));
  const [stepsStr, setStepsStr] = useState((recipe.steps || []).join('\n'));
  const [tagsStr, setTagsStr] = useState((recipe.tags || []).join('\n'));
  const [tipsStr, setTipsStr] = useState(recipe.tips || '');

  const handleAction = async (action: 'approve' | 'reject' | 'delete') => {
    try {
      if (action === 'approve') await approveRecipe(recipe.id);
      if (action === 'reject') await rejectRecipe(recipe.id);
      if (action === 'delete') {
        if (!window.confirm('Yakin ingin menghapus resep ini secara permanen?')) return;
        await deleteRecipe(recipe.id);
      }
      onRefresh();
    } catch (e) {
      alert('Gagal memproses aksi.');
    }
  };

  const handleSaveEdit = async () => {
    try {
      const updated: Partial<Recipe> = {
        ...editData,
        ingredients: ingStr.split('\n').filter(Boolean),
        tools: toolsStr.split('\n').filter(Boolean),
        steps: stepsStr.split('\n').filter(Boolean),
        tags: tagsStr.split('\n').filter(Boolean),
        tips: tipsStr,
      };

      // Run through normalizer
      const cleaned = normalizeRecipe(updated);

      await updateRecipe(recipe.id, cleaned);
      alert('Berhasil disimpan!');
      setIsEditing(false);
      onRefresh();
    } catch (e) {
      alert('Gagal menyimpan.');
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content">
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Resep' : 'Detail Review'}</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {isEditing ? (
            <div className="edit-form">
              <label>Judul</label>
              <input value={editData.title || ''} onChange={e => setEditData({...editData, title: e.target.value})} />
              
              <label>Kategori</label>
              <input value={editData.category || ''} onChange={e => setEditData({...editData, category: e.target.value})} />

              <label>Image URL</label>
              <input value={editData.image || ''} onChange={e => setEditData({...editData, image: e.target.value})} />

              <label>Bahan-bahan (1 baris = 1 bahan)</label>
              <textarea rows={6} value={ingStr} onChange={e => setIngStr(e.target.value)} />

              <label>Alat (1 baris = 1 alat)</label>
              <textarea rows={3} value={toolsStr} onChange={e => setToolsStr(e.target.value)} />

              <label>Langkah-langkah (1 baris = 1 langkah)</label>
              <textarea rows={8} value={stepsStr} onChange={e => setStepsStr(e.target.value)} />

              <label>Tips</label>
              <textarea rows={4} value={tipsStr} onChange={e => setTipsStr(e.target.value)} />

              <label>Tags</label>
              <textarea rows={3} value={tagsStr} onChange={e => setTagsStr(e.target.value)} />
            </div>
          ) : (
            <div className="view-detail">
              {recipe.image && <img src={recipe.image} className="preview-img" alt="" />}
              <h3>{recipe.title}</h3>
              <p><strong>Status:</strong> {recipe.status}</p>
              <p><strong>Sumber:</strong> <a href={recipe.sourceUrl} target="_blank" rel="noreferrer">{recipe.sourceName || recipe.sourceUrl}</a></p>
              
              <div className="data-lists">
                <div>
                  <h4>Bahan:</h4>
                  <ul>{recipe.ingredients.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
                </div>
                <div>
                  <h4>Langkah:</h4>
                  <ol>{recipe.steps.map((s, idx) => <li key={idx}>{s}</li>)}</ol>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {isEditing ? (
            <>
              <button className="btn-secondary" onClick={() => setIsEditing(false)}>Batal</button>
              <button className="btn-primary" onClick={handleSaveEdit}>Simpan Perubahan</button>
            </>
          ) : (
            <>
              <button className="btn-secondary" onClick={() => setIsEditing(true)}>Edit</button>
              <div className="actions">
                <button className="btn-danger" onClick={() => handleAction('delete')}>Hapus</button>
                <button className="btn-warning" onClick={() => handleAction('reject')}>Tolak</button>
                <button className="btn-success" onClick={() => handleAction('approve')}>Setujui</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
