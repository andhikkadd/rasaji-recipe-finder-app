/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { SearchBar } from './components/SearchBar';
import { RecipeList } from './components/RecipeList';
import { RecipeCard } from './components/RecipeCard';
import { RecipePreviewModal } from './components/RecipePreviewModal';

// Fisher-Yates array shuffler to dynamicize home explore discovery feeds
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface IntentionCard {
  title: string;
  description: string;
  icon: string;
  primaryKeyword: string;
  keywords: string[];
}

const INTENTION_CARDS: IntentionCard[] = [
  {
    title: "Masakan Cepat",
    description: "Menu simpel buat hari yang padat.",
    icon: "🍜",
    primaryKeyword: "mie",
    keywords: ["mie", "telur", "nasi goreng", "tumis", "cepat", "instan"]
  },
  {
    title: "Lauk Harian",
    description: "Olahan ayam, tahu, tempe, dan daging buat makan utama.",
    icon: "🍗",
    primaryKeyword: "ayam",
    keywords: ["ayam", "tahu", "tempe", "daging", "lauk"]
  },
  {
    title: "Menu Berkuah",
    description: "Soto, sup, dan hidangan hangat buat makan nyaman.",
    icon: "🍲",
    primaryKeyword: "soto",
    keywords: ["soto", "sup", "kuah", "bakso", "gulai"]
  },
  {
    title: "Serba Telur",
    description: "Ide praktis dari telur buat sarapan atau lauk cepat.",
    icon: "🍳",
    primaryKeyword: "telur",
    keywords: ["telur", "dadar", "ceplok"]
  },
  {
    title: "Tahu & Tempe",
    description: "Menu ekonomis yang tetap enak dan gampang dibuat.",
    icon: "🍢",
    primaryKeyword: "tahu",
    keywords: ["tahu", "tempe", "orek"]
  },
  {
    title: "Pedas Mantap",
    description: "Sambal dan masakan berbumbu pedas.",
    icon: "🌶️",
    primaryKeyword: "sambal",
    keywords: ["sambal", "balado", "rica", "pedas", "mercon"]
  },
  {
    title: "Menu Nasi",
    description: "Nasi goreng, nasi uduk, dan menu nasi lainnya.",
    icon: "🍚",
    primaryKeyword: "nasi",
    keywords: ["nasi", "uduk"]
  },
  {
    title: "Camilan Sore",
    description: "Ide camilan ringan buat teman santai.",
    icon: "🥞",
    primaryKeyword: "camilan",
    keywords: ["camilan", "gorengan", "pisang", "bakwan", "cireng"]
  },
  {
    title: "Sayur Rumahan",
    description: "Pilihan sayur simpel buat menu harian.",
    icon: "🥗",
    primaryKeyword: "sayur",
    keywords: ["sayur", "kangkung", "bayam", "sawi", "capcay"]
  }
];

function getDailyCategoryHighlights(recipesList: Recipe[]): IntentionCard[] {
  const validCards = INTENTION_CARDS.filter(card => {
    return recipesList.some(recipe => {
      const targetStr = [
        recipe.title,
        recipe.category,
        recipe.shortDescription,
        ...(recipe.tags || []),
        ...(recipe.ingredients || [])
      ].join(' ').toLowerCase();
      return card.keywords.some(kw => targetStr.includes(kw.toLowerCase()));
    });
  });

  if (validCards.length <= 3) return validCards;

  const dateStr = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }

  const selected: IntentionCard[] = [];
  const tempPool = [...validCards];
  for (let i = 0; i < 3; i++) {
    const idx = Math.abs((hash + i) % tempPool.length);
    selected.push(tempPool[idx]);
    tempPool.splice(idx, 1);
  }
  return selected;
}

import { RecipeFullPage } from './components/RecipeFullPage';
import { CategoryFilter } from './components/CategoryFilter';
import { FeaturedRecipeLayout } from './components/FeaturedRecipeLayout';
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
  getRecipesByCategory,
  toggleLike as apiToggleLike,
  toggleBookmark as apiToggleBookmark,
  cacheExternalRecipe,
  getPopularRecipes,
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
import { PopularRecipesPage } from './pages/PopularRecipesPage';
import { SavedRecipesPage } from './pages/SavedRecipesPage';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

function HomeView() {
  const auth = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiRecipes, setAiRecipes] = useState<AiRecipe[]>([]);



  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching_internal' | 'expanding_query' | 'searching_external' | 'done'>('idle');
  const [nonFoodQuery, setNonFoodQuery] = useState(false);



  const [selectedRecipeForPreview, setSelectedRecipeForPreview] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'explore' | 'saved' | 'ai-search'>('explore');

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');



  const openAuth = useCallback((tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setShowAuthModal(true);
  }, []);

  const isLiked = useCallback((recipeId: string) => {
    if (auth.isLoggedIn) return auth.hasLiked(recipeId);
    return false;
  }, [auth]);

  const isBookmarked = useCallback((recipeId: string) => {
    if (auth.isLoggedIn) return auth.hasBookmarked(recipeId);
    return false;
  }, [auth]);

  useEffect(() => {
    getLatestRecipes()
      .then(data => { setRecipes(shuffleArray(data)); setIsLoading(false); })
      .catch(() => setIsLoading(false));

    getPopularRecipes()
      .then(data => {
        // Strict engagement-based sorting priority:
        // 1. likes count DESC -> 2. bookmarks count DESC -> 3. views count DESC -> 4. createdAt DESC
        const sorted = [...data].sort((a, b) => {
          if ((b.likes || 0) !== (a.likes || 0)) {
            return (b.likes || 0) - (a.likes || 0);
          }
          if ((b.bookmarks || 0) !== (a.bookmarks || 0)) {
            return (b.bookmarks || 0) - (a.bookmarks || 0);
          }
          if ((b.views || 0) !== (a.views || 0)) {
            return (b.views || 0) - (a.views || 0);
          }
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        setPopularRecipes(sorted);
      })
      .catch(err => console.error('Failed to load popular recipes:', err));
  }, []);

  const handleToggleLike = useCallback((recipe: Recipe) => {
    if (!auth.isLoggedIn) {
      showToast("Masuk dulu untuk menyukai resep.", "error");
      openAuth('login');
      return;
    }
    const liked = isLiked(recipe.id);
    const newLiked = !liked;

    // Update local states optimistically
    const updateLikes = (prev: Recipe[]) => prev.map(r => {
      if (r.id === recipe.id) {
        return {
          ...r,
          likes: Math.max(0, (r.likes || 0) + (newLiked ? 1 : -1))
        };
      }
      return r;
    });
    setRecipes(updateLikes);
    setPopularRecipes(updateLikes);

    auth.updateAction(recipe.id, 'like', newLiked);

    if (!recipe._isExternalMock) {
      apiToggleLike(recipe.id, newLiked ? 'like' : 'unlike')
        .then(res => {
          const syncLikes = (prev: Recipe[]) => prev.map(r => {
            if (r.id === recipe.id) {
              return { ...r, likes: res.likes };
            }
            return r;
          });
          setRecipes(syncLikes);
          setPopularRecipes(syncLikes);
        })
        .catch(() => {
          auth.updateAction(recipe.id, 'like', liked);
          const rollbackLikes = (prev: Recipe[]) => prev.map(r => {
            if (r.id === recipe.id) {
              return { ...r, likes: recipe.likes };
            }
            return r;
          });
          setRecipes(rollbackLikes);
          setPopularRecipes(rollbackLikes);
          showToast("Gagal menyukai resep. Silakan coba lagi.", "error");
        });
    }
  }, [auth, isLiked, openAuth, showToast]);

  const handleToggleBookmark = useCallback((recipe: Recipe) => {
    if (!auth.isLoggedIn) {
      showToast("Masuk dulu untuk menyimpan resep.", "error");
      openAuth('login');
      return;
    }
    const bookmarked = isBookmarked(recipe.id);
    const newBookmarked = !bookmarked;

    // Update local states optimistically
    const updateBookmarks = (prev: Recipe[]) => prev.map(r => {
      if (r.id === recipe.id) {
        return {
          ...r,
          bookmarks: Math.max(0, (r.bookmarks || 0) + (newBookmarked ? 1 : -1))
        };
      }
      return r;
    });
    setRecipes(updateBookmarks);
    setPopularRecipes(updateBookmarks);

    auth.updateAction(recipe.id, 'bookmark', newBookmarked);

    if (!recipe._isExternalMock) {
      apiToggleBookmark(recipe.id, newBookmarked ? 'bookmark' : 'unbookmark')
        .then(res => {
          const syncBookmarks = (prev: Recipe[]) => prev.map(r => {
            if (r.id === recipe.id) {
              return { ...r, bookmarks: res.bookmarks };
            }
            return r;
          });
          setRecipes(syncBookmarks);
          setPopularRecipes(syncBookmarks);
        })
        .catch(() => {
          auth.updateAction(recipe.id, 'bookmark', bookmarked);
          const rollbackBookmarks = (prev: Recipe[]) => prev.map(r => {
            if (r.id === recipe.id) {
              return { ...r, bookmarks: recipe.bookmarks };
            }
            return r;
          });
          setRecipes(rollbackBookmarks);
          setPopularRecipes(rollbackBookmarks);
          showToast("Gagal menyimpan resep. Silakan coba lagi.", "error");
        });
    }
  }, [auth, isBookmarked, openAuth, showToast]);

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
      try { const data = await getLatestRecipes(); setRecipes(shuffleArray(data)); } catch (err) { console.error('Gagal mengambil resep terbaru:', err); }
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
      try { const data = await getLatestRecipes(); setRecipes(shuffleArray(data)); } catch (err) { console.error('Gagal mengambil resep terbaru:', err); }
      setIsLoading(false);
      return;
    }

    setHasSearched(true);
    setIsLoading(true);
    try { const data = await getRecipesByCategory(category); setRecipes(data); } catch (err) { console.error('Gagal mengambil resep kategori:', err); }
    setIsLoading(false);
  }, []);

  const resetToExplore = useCallback(async () => {
    setActiveTab('explore');
    setHasSearched(false);
    setSelectedCategory(null);
    setSearchQuery('');
    setSearchStatus('idle');
    setIsLoading(true);
    try { const data = await getLatestRecipes(); setRecipes(shuffleArray(data)); } catch (err) { console.error('Gagal mengambil resep terbaru:', err); }
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
      else if (tab === 'saved') handleSavedTab();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, resetToExplore, handleSavedTab, navigate]);

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

  const savedRecipeIds = auth.user?.bookmarkedIds || [];
  const likedRecipeIds = auth.user?.likedIds || [];
  const bookmarkedRecipes = recipes.filter(r => savedRecipeIds.includes(r.id));

  // Editorial layout helper variables
  const mainRecipes: Recipe[] = recipes.length >= 3 ? recipes.slice(3) : recipes;

  return (
    <>
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'explore') resetToExplore();
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

            {isLoading ? (
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
            ) : hasSearched || selectedCategory ? (
              <>
                <h2 className="section-title">
                  {selectedCategory && selectedCategory !== 'Semua'
                    ? `Kategori: ${selectedCategory}`
                    : 'Hasil Pencarian'}
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
            ) : (
              <>
                {/* ─── Featured Recipe Section: Pilihan Hari Ini ─── */}
                <FeaturedRecipeLayout
                  recipes={recipes}
                  likedRecipeIds={likedRecipeIds}
                  savedRecipeIds={savedRecipeIds}
                  onRecipeClick={handleRecipeClick}
                  onToggleLike={handleToggleLike}
                  onToggleSave={handleToggleBookmark}
                />

                {/* ─── Latest Recipes Section: Menu Harian Terbaru ─── */}
                <h2 className="section-title" style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>Menu Harian Terbaru</h2>

                {/* Chunk 1: First 8 recipes */}
                <div className="recipe-grid animate-fade-in">
                  {mainRecipes.slice(0, 8).map((recipe, index) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onClick={() => handleRecipeClick(recipe)}
                      index={index}
                      isSaved={savedRecipeIds.includes(recipe.id)}
                      onToggleSave={() => handleToggleBookmark(recipe)}
                      isLiked={likedRecipeIds.includes(recipe.id)}
                      onToggleLike={() => handleToggleLike(recipe)}
                    />
                  ))}
                </div>

                {/* ─── Middle Content Break: "Masak nggak harus ribet" ─── */}
                <div className="editorial-strip animate-fade-in" style={{ margin: '3rem 0' }}>
                  <span className="editorial-strip-icon">🍳</span>
                  <div className="editorial-strip-content">
                    <h5>Masak nggak harus ribet</h5>
                    <p>Pilih menu yang sesuai dengan bahan, waktu, dan mood hari ini.</p>
                  </div>
                </div>

                {/* ─── Resep Populer Section ─── */}
                <div className="popular-section animate-fade-in" style={{ margin: '3.5rem 0' }}>
                  <div className="popular-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                      <h3 className="section-title" style={{ margin: 0 }}>Resep Populer</h3>
                      <p className="section-subtitle" style={{ margin: '0.25rem 0 0 0' }}>Menu yang paling banyak disukai pengguna Rasaji.</p>
                    </div>
                    <button
                      className="view-all-pill-btn"
                      onClick={() => navigate('/populer')}
                      style={{
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.16)',
                        color: '#10B981',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem',
                        padding: '8px 16px',
                        borderRadius: '9999px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span>Lihat semua</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                  </div>

                  <div className="recipe-grid">
                    {popularRecipes.length === 0 ? (
                      <div style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1 / -1' }}>
                        Memuat resep populer...
                      </div>
                    ) : (
                      popularRecipes.slice(0, 8).map((recipe, index) => (
                        <RecipeCard
                          key={`pop-${recipe.id}`}
                          recipe={recipe}
                          onClick={() => handleRecipeClick(recipe)}
                          index={index}
                          isSaved={savedRecipeIds.includes(recipe.id)}
                          onToggleSave={() => handleToggleBookmark(recipe)}
                          isLiked={likedRecipeIds.includes(recipe.id)}
                          onToggleLike={() => handleToggleLike(recipe)}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* ─── Dynamic Category/Mood Highlights: Lagi pengen masak yang praktis? ─── */}
                {recipes.length > 0 && (
                  <div className="mood-highlights-section animate-fade-in" style={{ margin: '3.5rem 0' }}>
                    <h3 className="section-title" style={{ margin: 0 }}>Lagi pengen masak yang praktis?</h3>
                    <p className="section-subtitle" style={{ margin: '0.25rem 0 1.5rem 0' }}>Pilih suasana memasakmu hari ini untuk rekomendasi cepat.</p>

                    <div className="mood-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                      {getDailyCategoryHighlights(recipes).map((card, idx) => (
                        <div
                          key={`mood-${idx}`}
                          className="mood-card glass"
                          onClick={() => handleSearch(card.primaryKeyword)}
                          style={{
                            padding: '1.75rem',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '1.25rem',
                            alignItems: 'center',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            border: '1px solid var(--border-color)',
                            background: 'var(--surface-color)',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          <span className="mood-icon" style={{ fontSize: '2.5rem', lineHeight: 1 }}>{card.icon}</span>
                          <div>
                            <h4 className="mood-title" style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 750, color: 'var(--text-primary)' }}>{card.title}</h4>
                            <p className="mood-desc" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{card.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── Content Break C: Saved Recipes Promotion ─── */}
                {!auth.isLoggedIn && (
                  <div className="editorial-break-banner promo-banner animate-fade-in" style={{ margin: '3.5rem 0' }}>
                    <div className="editorial-break-content">
                      <span className="editorial-break-tag">Simpan Resep</span>
                      <h4 className="editorial-break-title">Suka dengan resep di Rasaji?</h4>
                      <p className="editorial-break-desc">Buat akun gratis sekarang untuk menyimpan resep favoritmu dan mengaksesnya kapan saja, di mana saja.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <button
                        className="editorial-break-btn"
                        onClick={() => openAuth('register')}
                      >
                        Daftar Gratis
                      </button>
                      <button
                        className="editorial-break-btn secondary"
                        onClick={() => openAuth('login')}
                        style={{ background: 'transparent', border: '1px solid var(--accent-color)', color: 'var(--accent-color)' }}
                      >
                        Masuk
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── Latest Recipes Section: Rest of recipes (Chunk 2) ─── */}
                {mainRecipes.length > 8 && (
                  <>
                    <h2 className="section-title" style={{ marginTop: '3.5rem', marginBottom: '1.5rem' }}>Rekomendasi Lainnya</h2>
                    <div className="recipe-grid animate-fade-in">
                      {mainRecipes.slice(8).map((recipe, index) => (
                        <RecipeCard
                          key={recipe.id}
                          recipe={recipe}
                          onClick={() => handleRecipeClick(recipe)}
                          index={index}
                          isSaved={savedRecipeIds.includes(recipe.id)}
                          onToggleSave={() => handleToggleBookmark(recipe)}
                          isLiked={likedRecipeIds.includes(recipe.id)}
                          onToggleLike={() => handleToggleLike(recipe)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
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
            <Route path="/populer" element={<PopularRecipesPage />} />
            <Route path="/resep/:slug" element={<RecipeFullPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/tentang" element={<TentangPage />} />
            <Route path="/kontak" element={<KontakPage />} />
            <Route path="/bantuan" element={<BantuanPage />} />
            <Route path="/privasi" element={<PrivasiPage />} />
            <Route path="/profil" element={<ProtectedRoute element={<ProfilPage />} />} />
            <Route path="/pengaturan-akun" element={<ProtectedRoute element={<PengaturanAkunPage />} />} />
            <Route path="/tersimpan" element={<ProtectedRoute element={<SavedRecipesPage />} />} />
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
