import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SearchBar } from './components/SearchBar';
import { RecipeList } from './components/RecipeList';
import { RecipePreviewModal } from './components/RecipePreviewModal';
import { RecipeFullPage } from './components/RecipeFullPage';
import { CategoryFilter } from './components/CategoryFilter';
import { AiIngredientSearch } from './components/AiIngredientSearch';
import { AiRecipeCard } from './components/AiRecipeCard';
import { IngredientCtaCard } from './components/IngredientCtaCard';
import { AuthModal } from './components/AuthModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { generateRecipeIdeasFromIngredients } from './services/aiRecipeService';
import {
  searchRecipes,
  searchExpandedRecipes,
  getLatestRecipes,
  getPopularRecipes,
  getRecipesByCategory,
  toggleLike as apiToggleLike,
  toggleBookmark as apiToggleBookmark,
  cacheExternalRecipe,
} from './services/recipeApi';
import { searchExternalRecipes } from './services/externalSearchService';
import { Footer } from './components/Footer';
import { features } from './config/features';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import type { Recipe, AiRecipe } from './types';
import './App.css';

function HomeView() {
  const auth = useAuth();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiRecipes, setAiRecipes] = useState<AiRecipe[]>([]);

  // localStorage fallback for guests
  const [guestLikes] = useState<string[]>(() => {
    const saved = localStorage.getItem('rasaji_likes');
    return saved ? JSON.parse(saved) : [];
  });
  const [guestBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('rasaji_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching_internal' | 'expanding_query' | 'searching_external' | 'done'>('idle');
  const [nonFoodQuery, setNonFoodQuery] = useState(false);



  const [selectedRecipeForPreview, setSelectedRecipeForPreview] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'explore' | 'popular' | 'saved' | 'ai-search'>('explore');

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

  const isLiked = useCallback((recipeId: string) => {
    if (auth.isLoggedIn) return auth.hasLiked(recipeId);
    return guestLikes.includes(recipeId);
  }, [auth, guestLikes]);

  const isBookmarked = useCallback((recipeId: string) => {
    if (auth.isLoggedIn) return auth.hasBookmarked(recipeId);
    return guestBookmarks.includes(recipeId);
  }, [auth, guestBookmarks]);

  useEffect(() => {
    localStorage.setItem('rasaji_likes', JSON.stringify(guestLikes));
  }, [guestLikes]);

  useEffect(() => {
    localStorage.setItem('rasaji_bookmarks', JSON.stringify(guestBookmarks));
  }, [guestBookmarks]);

  useEffect(() => {
    getLatestRecipes()
      .then(data => { setRecipes(data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const handleToggleLike = useCallback((recipe: Recipe) => {
    if (!auth.isLoggedIn) {
      openAuth('login');
      return;
    }
    const liked = isLiked(recipe.id);
    auth.updateAction(recipe.id, 'like', !liked);
    if (!recipe._isExternalMock) {
      apiToggleLike(recipe.id, liked ? 'unlike' : 'like').catch(() => {
        auth.updateAction(recipe.id, 'like', liked);
      });
    }
  }, [auth, isLiked, openAuth]);

  const handleToggleBookmark = useCallback((recipe: Recipe) => {
    if (!auth.isLoggedIn) {
      openAuth('login');
      return;
    }
    const bookmarked = isBookmarked(recipe.id);
    auth.updateAction(recipe.id, 'bookmark', !bookmarked);
    if (!recipe._isExternalMock) {
      apiToggleBookmark(recipe.id, bookmarked ? 'unbookmark' : 'bookmark').catch(() => {
        auth.updateAction(recipe.id, 'bookmark', bookmarked);
      });
    }
  }, [auth, isBookmarked, openAuth]);

  const handleRecipeClick = useCallback(async (recipe: Recipe) => {
    if (recipe._isExternalMock) {
      try {
        const cached = await cacheExternalRecipe(recipe);
        setSelectedRecipeForPreview(cached);
      } catch {
        setSelectedRecipeForPreview(recipe);
      }
    } else {
      setSelectedRecipeForPreview(recipe);
    }
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setActiveTab('explore');
    setSelectedCategory(null);
    setSearchQuery(query);

    if (!query.trim()) {
      setHasSearched(false);
      setSearchStatus('idle');
      setIsLoading(true);
      try { const data = await getLatestRecipes(); setRecipes(data); } catch (err) { console.error('Gagal mengambil resep terbaru:', err); }
      setIsLoading(false);
      return;
    }

    setHasSearched(true);
    setSearchStatus('searching_internal');
    setIsLoading(true);
    setNonFoodQuery(false);

    try {
      // Step 1: Internal search
      const internal = await searchRecipes(query);
      setRecipes(internal);

      // Rasaji 1.0: Stop here and don't fallback to AI/External unless explicitly enabled
      if (!features.ENABLE_EXTERNAL_SEARCH && !features.ENABLE_AI_SEARCH) {
        setSearchStatus('done');
        setIsLoading(false);
        return;
      }

      // If internal has enough results (>= 5), show immediately
      if (internal.length >= 5) {
        setSearchStatus('done');
        setIsLoading(false);
        return;
      }

      // Step 2: Expand Kitchen Query
      setSearchStatus('expanding_query');
      const { recipes: expandedInternal, foodIntent: expandIntent } = await searchExpandedRecipes(query);

      // Server says this query is not food-related
      if (expandIntent === false) {
        setNonFoodQuery(true);
        setRecipes(internal); // keep any internal results (likely 0)
        setSearchStatus('done');
        return;
      }

      // Dedup internal and expanded
      const internalSlugs = new Set(internal.map(r => r.slug));
      const internalTitles = new Set(internal.map(r => r.title.toLowerCase().trim()));
      
      const uniqueExpanded = expandedInternal.filter(
        r => !internalSlugs.has(r.slug) && !internalTitles.has(r.title.toLowerCase().trim())
      );
      
      const combinedInternal = [...internal, ...uniqueExpanded];
      setRecipes(combinedInternal);

      if (combinedInternal.length >= 5) {
        setSearchStatus('done');
        setIsLoading(false);
        return;
      }

      // Step 3: Not enough expanded internal results — show what we have + search external
      setSearchStatus('searching_external');

      const { recipes: external, foodIntent } = await searchExternalRecipes(query);

      if (foodIntent === false) {
        setNonFoodQuery(true);
        setSearchStatus('done');
        return;
      }

      // Dedup external against combinedInternal
      const combinedSlugs = new Set(combinedInternal.map(r => r.slug));
      const combinedTitles = new Set(combinedInternal.map(r => r.title.toLowerCase().trim()));
      
      const uniqueExternal = external.filter(
        ext => !combinedSlugs.has(ext.slug) && !combinedTitles.has(ext.title.toLowerCase().trim())
      );

      setRecipes([...combinedInternal, ...uniqueExternal]);
      setSearchStatus('done');
    } catch {
      setSearchStatus('done');
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCategorySelect = useCallback(async (category: string | null) => {
    setActiveTab('explore');
    setSelectedCategory(category);
    setSearchQuery('');
    setSearchStatus('idle');

    if (!category || category === 'Semua') {
      setHasSearched(false);
      setIsLoading(true);
      try { const data = await getLatestRecipes(); setRecipes(data); } catch (err) { console.error('Gagal mengambil resep terbaru:', err); }
      setIsLoading(false);
      return;
    }

    setHasSearched(true);
    setIsLoading(true);
    try { const data = await getRecipesByCategory(category); setRecipes(data); } catch (err) { console.error('Gagal mengambil resep kategori:', err); }
    setIsLoading(false);
  }, []);

  const handlePopularTab = useCallback(async () => {
    setActiveTab('popular');
    setSearchStatus('idle');
    setIsLoading(true);
    try { const data = await getPopularRecipes(); setRecipes(data); } catch (err) { console.error('Gagal mengambil resep populer:', err); }
    setIsLoading(false);
  }, []);

  const resetToExplore = useCallback(async () => {
    setActiveTab('explore');
    setHasSearched(false);
    setSelectedCategory(null);
    setSearchQuery('');
    setSearchStatus('idle');
    setIsLoading(true);
    try { const data = await getLatestRecipes(); setRecipes(data); } catch (err) { console.error('Gagal mengambil resep terbaru:', err); }
    setIsLoading(false);

    // Smooth scroll to top/hero after render
    setTimeout(() => {
      const hero = document.getElementById('home-hero');
      if (hero) {
        hero.scrollIntoView({ behavior: 'smooth' });
      }
    }, 80);
  }, []);

  const handleLogoClick = useCallback(async () => {
    if (activeTab === 'explore' && !hasSearched && !selectedCategory) {
      const hero = document.getElementById('home-hero');
      if (hero) {
        hero.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      await resetToExplore();
    }
  }, [activeTab, hasSearched, selectedCategory, resetToExplore]);

  const handleSavedTab = useCallback(() => {
    if (!auth.isLoggedIn) {
      openAuth('login');
      return;
    }
    setActiveTab('saved');
  }, [auth, openAuth]);

  const handleAiSearch = async (ingredients: string[]) => {
    setIsAiLoading(true);
    try {
      const ideas = await generateRecipeIdeasFromIngredients(ingredients, null);
      setAiRecipes(ideas);
    } catch (err) {
      console.error('Gagal memuat resep AI:', err);
      setAiRecipes([]);
    }
    finally { setIsAiLoading(false); }
  };

  const savedRecipeIds = auth.isLoggedIn ? (auth.user?.bookmarkedIds || []) : guestBookmarks;
  const likedRecipeIds = auth.isLoggedIn ? (auth.user?.likedIds || []) : guestLikes;
  const bookmarkedRecipes = recipes.filter(r => savedRecipeIds.includes(r.id));

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
          <button className={`nav-tab ${activeTab === 'explore' ? 'active' : ''}`} onClick={resetToExplore}>
            Eksplor
          </button>
          <button className={`nav-tab ${activeTab === 'popular' ? 'active' : ''}`} onClick={handlePopularTab}>
            Populer
          </button>
          <button className={`nav-tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={handleSavedTab}>
            Tersimpan ({savedRecipeIds.length})
          </button>
        </div>

        <div className="auth-section">
          {auth.isLoggedIn ? (
            <div className="user-menu" ref={dropdownRef}>
              <button 
                className="user-profile-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="user-avatar">
                  {auth.user?.name.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{auth.user?.name}</span>
                <svg className={`user-chevron ${isDropdownOpen ? 'open' : ''}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              
              {isDropdownOpen && (
                <div className="user-dropdown animate-slide-up-fast">
                  <button className="dropdown-item">Profil Saya</button>
                  <button className="dropdown-item">Pengaturan Akun</button>
                  <button className="dropdown-item" onClick={handleSavedTab}>Resep Tersimpan</button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item text-danger" onClick={() => { auth.logout(); setIsDropdownOpen(false); }}>Keluar</button>
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

      <main className="app-main">
        {activeTab === 'ai-search' && features.ENABLE_AI_SEARCH && (
          <div className="ai-search-view animate-fade-in">
            <button className="back-btn" onClick={() => setActiveTab('explore')}>← Kembali ke Beranda</button>
            <AiIngredientSearch onSearch={handleAiSearch} isLoading={isAiLoading} />
            <div className="ai-recipes-grid">
              {isAiLoading ? (
                <div className="recipes-loading">Meracik ide resep untukmu...</div>
              ) : aiRecipes.length > 0 ? (
                aiRecipes.map(recipe => <AiRecipeCard key={recipe.id} recipe={recipe} />)
              ) : (
                <div className="empty-state"><p>Belum ada hasil. Silakan masukkan bahan-bahan di atas.</p></div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'explore' && (
          <>
            <div className="hero-section" id="home-hero">
              <h2 className="hero-title">Bingung makan apa hari ini?</h2>
              <p className="hero-subtitle">Temukan ide masakan yang simpel, enak, dan cocok buat menu harian.</p>
            </div>

            <SearchBar
              onSearch={handleSearch}
              isLoading={isLoading}
              initialValue={searchQuery}
              placeholder="Cari resep, bahan, atau menu favorit..."
            />

            {!hasSearched && features.ENABLE_AI_SEARCH && <IngredientCtaCard onClick={() => setActiveTab('ai-search')} />}

            <div className="category-section">
              <h3 className="category-heading">Lagi pengen masak apa?</h3>
              <CategoryFilter onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} />
            </div>

            <h2 className="section-title">
              {hasSearched ? 'Hasil Pencarian' : 'Menu Harian Terbaru'}
            </h2>

            <RecipeList
              recipes={recipes}
              isLoading={isLoading}
              hasSearched={hasSearched}
              onRecipeClick={handleRecipeClick}
              savedRecipes={bookmarkedRecipes}
              onToggleSave={handleToggleBookmark}
              likedRecipes={likedRecipeIds}
              onToggleLike={handleToggleLike}
              searchStatus={searchStatus}
              nonFoodQuery={nonFoodQuery}
            />
          </>
        )}

        {activeTab === 'popular' && (
          <>
            <h2 className="section-title">Lagi Banyak Disukai</h2>
            <RecipeList
              recipes={recipes}
              isLoading={isLoading}
              hasSearched={true}
              onRecipeClick={handleRecipeClick}
              savedRecipes={bookmarkedRecipes}
              onToggleSave={handleToggleBookmark}
              likedRecipes={likedRecipeIds}
              onToggleLike={handleToggleLike}
            />
          </>
        )}

        {activeTab === 'saved' && (
          <>
            <h2 className="section-title">Resep Tersimpan</h2>
            {auth.isLoggedIn ? (
              <RecipeList
                recipes={bookmarkedRecipes}
                isLoading={false}
                hasSearched={true}
                onRecipeClick={handleRecipeClick}
                savedRecipes={bookmarkedRecipes}
                onToggleSave={handleToggleBookmark}
                likedRecipes={likedRecipeIds}
                onToggleLike={handleToggleLike}
              />
            ) : (
              <div className="auth-prompt animate-fade-in">
                <p>Masuk dulu buat nyimpen resep favoritmu! 🍳</p>
                <button className="auth-prompt-btn" onClick={() => openAuth('login')}>Masuk</button>
              </div>
            )}
          </>
        )}
      </main>

      {selectedRecipeForPreview && (
        <RecipePreviewModal
          recipe={selectedRecipeForPreview}
          onClose={() => setSelectedRecipeForPreview(null)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          initialTab={authModalTab}
        />
      )}
    </>
  );
}



function AppRoutes() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="app-shell" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Memuat sesi...</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <main className="main-content">
        <div className="content-container">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/resep/:slug" element={<RecipeFullPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
