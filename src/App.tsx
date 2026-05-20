/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
import { Navbar } from './components/Navbar';
import { ScrollToTop } from './components/ScrollToTop';
import { TentangPage } from './pages/TentangPage';
import { KontakPage } from './pages/KontakPage';
import { BantuanPage } from './pages/BantuanPage';
import { PrivasiPage } from './pages/PrivasiPage';
import type { Recipe, AiRecipe } from './types';
import { ProfilPage } from './pages/ProfilPage';
import { PengaturanAkunPage } from './pages/PengaturanAkunPage';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

function HomeView() {
  const auth = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

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
      showToast("Masuk dulu untuk menyimpan resep.", "error");
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
      showToast("Masuk dulu untuk menyimpan resep.", "error");
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



  const handleSavedTab = useCallback(() => {
    if (!auth.isLoggedIn) {
      openAuth('login');
      return;
    }
    setActiveTab('saved');
  }, [auth, openAuth]);

  useEffect(() => {
    const state = location.state as { activeTab?: string } | null;
    if (state && state.activeTab) {
      const tab = state.activeTab;
      if (tab === 'explore') resetToExplore();
      else if (tab === 'popular') handlePopularTab();
      else if (tab === 'saved') handleSavedTab();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, resetToExplore, handlePopularTab, handleSavedTab, navigate]);

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
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'explore') resetToExplore();
          else if (tab === 'popular') handlePopularTab();
          else if (tab === 'saved') handleSavedTab();
        }}
      />

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
            <Route path="/tentang" element={<TentangPage />} />
            <Route path="/kontak" element={<KontakPage />} />
            <Route path="/bantuan" element={<BantuanPage />} />
            <Route path="/privasi" element={<PrivasiPage />} />
            <Route path="/profil" element={<ProtectedRoute element={<ProfilPage />} />} />
            <Route path="/pengaturan-akun" element={<ProtectedRoute element={<PengaturanAkunPage />} />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
