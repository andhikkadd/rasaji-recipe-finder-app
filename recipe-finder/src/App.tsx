import { useState, useEffect, useCallback } from 'react';
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
    const saved = localStorage.getItem('racikin_likes');
    return saved ? JSON.parse(saved) : [];
  });
  const [guestBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('racikin_bookmarks');
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
    localStorage.setItem('racikin_likes', JSON.stringify(guestLikes));
  }, [guestLikes]);

  useEffect(() => {
    localStorage.setItem('racikin_bookmarks', JSON.stringify(guestBookmarks));
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

      // If internal has enough results (>= 5), show immediately
      if (internal.length >= 5) {
        setRecipes(internal);
        setSearchStatus('done');
        setIsLoading(false);
        return;
      }

      setRecipes(internal);

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
  }, []);

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
        <div className="logo-container" onClick={resetToExplore}>
          <svg className="brand-logo-mark" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            {/* Custom R with mixing-motion curved leg */}
            <path
              d="M10 6 L10 30 M10 6 L20 6 Q27 6 27 13 Q27 19 20 19.5 L10 19.5 M16 19.5 Q20 22 24 30"
              fill="none"
              stroke="#172033"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Small green leaf accent */}
            <path
              d="M26 4 Q30 2 31 6 Q29 8 26 7 Q25 5.5 26 4Z"
              fill="#10b981"
            />
            {/* Warm seasoning dot */}
            <circle cx="28.5" cy="9.5" r="1.2" fill="#f59e0b" opacity="0.75" />
          </svg>
          <h1 className="logo-text">Racik<span className="text-accent">in</span></h1>
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
            <div className="user-menu">
              <div className="user-avatar">
                {auth.user?.name.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{auth.user?.name}</span>
              <button className="auth-nav-btn logout-btn" onClick={auth.logout}>
                Keluar
              </button>
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
        {activeTab === 'ai-search' && (
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
            <div className="hero-section">
              <h2 className="hero-title">Bingung makan apa hari ini?</h2>
              <p className="hero-subtitle">Temukan ide masakan yang simpel, enak, dan cocok buat menu harian.</p>
            </div>

            <SearchBar
              onSearch={handleSearch}
              isLoading={isLoading}
              initialValue={searchQuery}
              placeholder="Cari resep, bahan, atau menu favorit..."
            />

            {!hasSearched && <IngredientCtaCard onClick={() => setActiveTab('ai-search')} />}

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
