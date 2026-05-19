import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Recipe } from '../types';
import { getRecipeImage } from '../utils/imageUtils';
import { askRecipeAssistant } from '../services/aiRecipeService';
import { useAuth } from '../contexts/AuthContext';
import { toggleLike as apiToggleLike, toggleBookmark as apiToggleBookmark } from '../services/recipeApi';
import { AuthModal } from './AuthModal';
import { features } from '../config/features';
import './RecipeFullPage.css';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function RecipeFullPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Tanya Rasaji state
  const [isTanyaOpen, setIsTanyaOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiQuestion, setAiQuestion] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  
  const aiInputRef = useRef<HTMLInputElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Auth / Actions state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const [guestLikes, _setGuestLikes] = useState<string[]>(() => {
    const saved = localStorage.getItem('rasaji_likes');
    return saved ? JSON.parse(saved) : [];
  });
  const [guestBookmarks, _setGuestBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('rasaji_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('rasaji_likes', JSON.stringify(guestLikes)); }, [guestLikes]);
  useEffect(() => { localStorage.setItem('rasaji_bookmarks', JSON.stringify(guestBookmarks)); }, [guestBookmarks]);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`/api/recipes/slug/${slug}`);
        if (!res.ok) {
           const fallbackRes = await fetch(`/api/recipes/${slug}`);
           if (!fallbackRes.ok) throw new Error('Recipe not found');
           const data = await fallbackRes.json();
           setRecipe(data);
        } else {
           const data = await res.json();
           setRecipe(data);
        }
      } catch (e) {
        setError('Resep tidak ditemukan.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipe();

    // Auto dismiss greeting after 5 seconds
    const timer = setTimeout(() => setShowGreeting(false), 5000);
    return () => clearTimeout(timer);
  }, [slug]);

  // Scroll chat to bottom when messages change
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isAiLoading, isTanyaOpen]);

  // Initialize chat when opened
  useEffect(() => {
    if (isTanyaOpen && messages.length === 0) {
      setMessages([{
        id: 'initial',
        role: 'assistant',
        content: 'Hai! Aku bisa bantu jelasin resep ini, ganti bahan, atau bikin versinya lebih simpel.'
      }]);
    }
  }, [isTanyaOpen, messages.length]);

  if (isLoading) return <div className="page-loading">Memuat resep...</div>;
  if (error || !recipe) return <div className="page-error"><p>{error}</p><button className="back-nav-btn" onClick={() => navigate('/')}>Kembali ke Beranda</button></div>;

  const steps = recipe.steps?.length ? recipe.steps : [];

  const isLiked = auth.isLoggedIn ? auth.hasLiked(recipe.id) : guestLikes.includes(recipe.id);
  const isBookmarked = auth.isLoggedIn ? auth.hasBookmarked(recipe.id) : guestBookmarks.includes(recipe.id);

  const handleToggleLike = () => {
    if (!auth.isLoggedIn) {
      setAuthModalTab('login');
      setShowAuthModal(true);
      return;
    }
    const currentlyLiked = isLiked;
    auth.updateAction(recipe.id, 'like', !currentlyLiked);
    if (!recipe._isExternalMock) {
      apiToggleLike(recipe.id, currentlyLiked ? 'unlike' : 'like').catch(() => {
        auth.updateAction(recipe.id, 'like', currentlyLiked);
      });
    }
  };

  const handleToggleBookmark = () => {
    if (!auth.isLoggedIn) {
      setAuthModalTab('login');
      setShowAuthModal(true);
      return;
    }
    const currentlyBookmarked = isBookmarked;
    auth.updateAction(recipe.id, 'bookmark', !currentlyBookmarked);
    if (!recipe._isExternalMock) {
      apiToggleBookmark(recipe.id, currentlyBookmarked ? 'unbookmark' : 'bookmark').catch(() => {
        auth.updateAction(recipe.id, 'bookmark', currentlyBookmarked);
      });
    }
  };

  const formatMessageText = (text: string) => {
    // Remove markdown bolding for cleaner UI, or render simple bold
    return text.replace(/\*\*(.*?)\*\*/g, '$1');
  };

  const handleAiAsk = async (question?: string) => {
    const q = question || aiQuestion.trim();
    if (!q || isAiLoading) return;

    setShowGreeting(false);
    
    // Add user message
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    
    setAiQuestion('');
    setIsAiLoading(true);

    try {
      const response = await askRecipeAssistant(recipe, q);
      const assistantMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: formatMessageText(response.answer) 
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan saat menghubungi Rasaji. Coba lagi nanti ya.'
      }]);
    } finally {
      setIsAiLoading(false);
      // Refocus input if on desktop (optional)
      if (window.innerWidth > 768) {
        aiInputRef.current?.focus();
      }
    }
  };

  const quickQuestions = [
    'Kalau nggak ada bahan ini?',
    'Bikin versi anak kos',
    'Bikin lebih hemat',
    'Ringkas langkahnya',
    'Bikin lebih pedas'
  ];

  // Merge tags and keywords for display, capitalize naturally, add exactly one # prefix, and limit to 3–5 chips
  const allTags = Array.from(
    new Set(
      [...(recipe.tags || []), ...(recipe.keywords || [])]
        .map(t => t.replace(/^#+/, '').replace(/@/g, '').trim())
        .filter(t => t.length > 0)
        .map(t => {
          // Capitalize naturally
          return t.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        })
    )
  )
    .map(clean => `#${clean}`)
    .slice(0, 5);

  return (
    <div className="recipe-full-page animate-fade-in">
      <div className="page-container">
        
        {/* Breadcrumb */}
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <button className="breadcrumb-btn" onClick={() => navigate('/')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="breadcrumb-home-icon">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Beranda
          </button>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="breadcrumb-separator">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span className="breadcrumb-current">{recipe.title}</span>
        </nav>

        {/* 1. Hero / Header Area */}
        <header className="hero-header-section">
          <h1 className="hero-title">{recipe.title}</h1>
          {recipe.shortDescription && <p className="hero-description">{recipe.shortDescription}</p>}
          
          {allTags.length > 0 && (
            <div className="hero-tags">
              {allTags.map((tag, i) => (
                <span key={i} className="tag-chip">{tag}</span>
              ))}
            </div>
          )}

          <div className="hero-actions">
            <button className={`action-btn like-btn ${isLiked ? 'active' : ''}`} onClick={handleToggleLike}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              Suka
            </button>
            <button className={`action-btn save-btn ${isBookmarked ? 'active' : ''}`} onClick={handleToggleBookmark}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
              </svg>
              Simpan
            </button>
          </div>

          <div className="hero-image-wrapper mt-4">
            <img src={getRecipeImage(recipe)} alt={recipe.title} className="hero-image" />
          </div>
        </header>

        {/* Main Grid: Sidebar + Content */}
        <div className="recipe-content-grid">
          
          {/* 2. Left Sidebar: Preparation Checklist ONLY */}
          <aside className="prep-sidebar">
            <div className="prep-card">
              <h2 className="prep-title">Bahan-bahan</h2>
              <ul className="prep-list ingredients-list">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="prep-item">
                    <span className="prep-bullet">•</span>
                    <span className="prep-text">{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            {recipe.tools && recipe.tools.length > 0 && (
              <div className="prep-card">
                <h2 className="prep-title">Alat yang Dibutuhkan</h2>
                <ul className="prep-list tools-list">
                  {recipe.tools.map((t, i) => (
                    <li key={i} className="prep-item">
                      <span className="prep-bullet">•</span>
                      <span className="prep-text">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* 3. Main Content: Cooking Flow */}
          <main className="cooking-main">
            <section className="steps-section">
              <h2 className="section-title">Langkah-langkah</h2>
              <div className="steps-container">
                {steps.map((step, i) => (
                  <div className="step-card" key={i}>
                    <div className="step-number">{(i + 1).toString().padStart(2, '0')}</div>
                    <div className="step-content">
                      <p>{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. After the steps: Supportive Content */}
            {(recipe.tips || recipe.alternativeIngredients || recipe.fullDescription) && (
              <section className="supportive-section">
                <h2 className="section-title">Panduan Tambahan</h2>
                <div className="support-cards-grid">
                  {recipe.tips && (
                    <div className="support-card support-tips">
                      <h3 className="support-heading">✨ Tips dari Rasaji</h3>
                      <p>{recipe.tips}</p>
                    </div>
                  )}
                  
                  {recipe.alternativeIngredients && (
                    <div className="support-card support-alt">
                      <h3 className="support-heading">💡 Alternatif Bahan</h3>
                      <p>{recipe.alternativeIngredients}</p>
                    </div>
                  )}

                  {recipe.fullDescription && (
                    <div className="support-card support-notes">
                      <h3 className="support-heading">📝 Catatan Masak</h3>
                      <p>{recipe.fullDescription}</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* 5. Floating Tanya Rasaji Assistant */}
      {features.ENABLE_AI_ASSISTANT && (
        <div className={`tanya-floating-container ${isTanyaOpen ? 'open' : ''}`}>
          
          {/* Greeting Bubble */}
          {!isTanyaOpen && showGreeting && (
            <div className="tanya-greeting-bubble animate-slide-up">
              Hai, ada yang bisa Rasaji bantu?
              <button className="close-greeting" onClick={(e) => { e.stopPropagation(); setShowGreeting(false); }}>✕</button>
            </div>
          )}

          {isTanyaOpen && (
            <div className="tanya-chat-window shadow-xl animate-scale-in">
              <div className="tanya-chat-header">
                 <div className="tanya-header-left">
                   <div className="tanya-chat-title">
                      <span className="sparkles-icon">✨</span>
                      Tanya Rasaji
                   </div>
                   <div className="tanya-chat-subtitle">Tanya apa aja soal resep ini.</div>
                 </div>
                 <button className="tanya-close-btn" onClick={() => setIsTanyaOpen(false)}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                 </button>
              </div>
              
              <div className="tanya-chat-body" ref={chatBodyRef}>
                 {messages.map((msg) => (
                   <div key={msg.id} className={`chat-message ${msg.role}`}>
                     <div className="chat-bubble">
                       {msg.content}
                     </div>
                   </div>
                 ))}

                 {isAiLoading && (
                   <div className="chat-message assistant">
                     <div className="chat-bubble loading-bubble">
                       <div className="typing-dots">
                         <span></span><span></span><span></span>
                       </div>
                     </div>
                   </div>
                 )}
              </div>

              <div className="tanya-chat-footer">
                <div className="tanya-quick-chips-scroll">
                  {quickQuestions.map((q, i) => (
                    <button key={i} className="chip-btn" onClick={() => handleAiAsk(q)} disabled={isAiLoading}>
                      {q}
                    </button>
                  ))}
                </div>
                <form className="tanya-chat-form" onSubmit={(e) => { e.preventDefault(); handleAiAsk(); }}>
                  <input
                    ref={aiInputRef}
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="Ketik pertanyaanmu..."
                    disabled={isAiLoading}
                  />
                  <button type="submit" disabled={isAiLoading || !aiQuestion.trim()} className="send-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </form>
              </div>
            </div>
          )}

          {!isTanyaOpen && (
            <button className="tanya-circle-fab" onClick={() => { setIsTanyaOpen(true); setShowGreeting(false); }}>
               <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/></svg>
            </button>
          )}
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          initialTab={authModalTab}
        />
      )}
    </div>
  );
}
