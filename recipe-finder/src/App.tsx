import { useState, useEffect, useCallback } from 'react';
import { SearchBar } from './components/SearchBar';
import { RecipeList } from './components/RecipeList';
import { RecipeDetails } from './components/RecipeDetails';
import { CategoryFilter } from './components/CategoryFilter';
import { AiIngredientSearch } from './components/AiIngredientSearch';
import { AiRecipeCard } from './components/AiRecipeCard';
import { IngredientCtaCard } from './components/IngredientCtaCard';
import { generateRecipeIdeasFromIngredients } from './services/aiRecipeService';
import {
  searchRecipes,
  getLatestRecipes,
  getPopularRecipes,
  getRecipesByCategory,
  toggleLike as apiToggleLike,
  toggleBookmark as apiToggleBookmark,
  incrementView,
  cacheExternalRecipe,
} from './services/recipeApi';
import { searchExternalRecipes } from './services/externalSearchService';
import type { Recipe, AiRecipe } from './types';
import './App.css';

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiRecipes, setAiRecipes] = useState<AiRecipe[]>([]);

  const [savedRecipes, setSavedRecipes] = useState<string[]>(() => {
    const saved = localStorage.getItem('racikin_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  const [likedRecipes, setLikedRecipes] = useState<string[]>(() => {
    const liked = localStorage.getItem('racikin_likes');
    return liked ? JSON.parse(liked) : [];
  });

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'explore' | 'popular' | 'saved' | 'ai-search'>('explore');

  // ─── Load initial recipes ─────────────────────────────
  useEffect(() => {
    getLatestRecipes()
      .then(data => {
        setRecipes(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load recipes:', err);
        setIsLoading(false);
      });
  }, []);

  // ─── Persist likes/bookmarks ──────────────────────────
  useEffect(() => {
    localStorage.setItem('racikin_bookmarks', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  useEffect(() => {
    localStorage.setItem('racikin_likes', JSON.stringify(likedRecipes));
  }, [likedRecipes]);

  // ─── Recipe actions ───────────────────────────────────
  const handleToggleLike = useCallback((recipe: Recipe) => {
    const isLiked = likedRecipes.includes(recipe.id);
    // Optimistic update
    setLikedRecipes(prev =>
      isLiked ? prev.filter(id => id !== recipe.id) : [...prev, recipe.id]
    );
    // Persist to API (fire and forget)
    if (!recipe._isExternalMock) {
      apiToggleLike(recipe.id, isLiked ? 'unlike' : 'like').catch(() => {});
    }
  }, [likedRecipes]);

  const handleToggleBookmark = useCallback((recipe: Recipe) => {
    const isSaved = savedRecipes.includes(recipe.id);
    setSavedRecipes(prev =>
      isSaved ? prev.filter(id => id !== recipe.id) : [...prev, recipe.id]
    );
    if (!recipe._isExternalMock) {
      apiToggleBookmark(recipe.id, isSaved ? 'unbookmark' : 'bookmark').catch(() => {});
    }
  }, [savedRecipes]);

  // ─── Open recipe detail ───────────────────────────────
  const handleRecipeClick = useCallback(async (recipe: Recipe) => {
    if (recipe._isExternalMock) {
      // Cache the external recipe into the DB on first open
      try {
        const cached = await cacheExternalRecipe(recipe);
        setSelectedRecipe(cached);
      } catch {
        // Fallback: show the mock recipe as-is
        setSelectedRecipe(recipe);
      }
    } else {
      setSelectedRecipe(recipe);
      incrementView(recipe.id);
    }
  }, []);

  // ─── Search ───────────────────────────────────────────
  const handleSearch = useCallback(async (query: string) => {
    setActiveTab('explore');
    setSelectedCategory(null);
    setSearchQuery(query);

    if (!query.trim()) {
      setHasSearched(false);
      setIsLoading(true);
      try {
        const data = await getLatestRecipes();
        setRecipes(data);
      } catch {}
      setIsLoading(false);
      return;
    }

    setHasSearched(true);
    setIsLoading(true);

    try {
      // 1. Search internal DB
      const internal = await searchRecipes(query);

      // 2. Fetch external mock results (blended)
      const external = await searchExternalRecipes(query);

      // 3. Blend: internal first (already relevance-sorted), then external
      // But interleave external results after every ~5 internal results
      const blended: Recipe[] = [];
      let extIdx = 0;
      for (let i = 0; i < internal.length; i++) {
        blended.push(internal[i]);
        // Insert an external result after every 5 internal results
        if ((i + 1) % 5 === 0 && extIdx < external.length) {
          blended.push(external[extIdx++]);
        }
      }
      // Add remaining external results
      while (extIdx < external.length) {
        blended.push(external[extIdx++]);
      }

      setRecipes(blended);
    } catch (err) {
      console.error('Search failed:', err);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Category filter ──────────────────────────────────
  const handleCategorySelect = useCallback(async (category: string | null) => {
    setActiveTab('explore');
    setSelectedCategory(category);
    setSearchQuery('');

    if (!category || category === 'Semua') {
      setHasSearched(false);
      setIsLoading(true);
      try {
        const data = await getLatestRecipes();
        setRecipes(data);
      } catch {}
      setIsLoading(false);
      return;
    }

    setHasSearched(true);
    setIsLoading(true);
    try {
      const data = await getRecipesByCategory(category);
      setRecipes(data);
    } catch {}
    setIsLoading(false);
  }, []);

  // ─── Tab handlers ─────────────────────────────────────
  const handlePopularTab = useCallback(async () => {
    setActiveTab('popular');
    setIsLoading(true);
    try {
      const data = await getPopularRecipes();
      setRecipes(data);
    } catch {}
    setIsLoading(false);
  }, []);

  const resetToExplore = useCallback(async () => {
    setActiveTab('explore');
    setHasSearched(false);
    setSelectedCategory(null);
    setSearchQuery('');
    setIsLoading(true);
    try {
      const data = await getLatestRecipes();
      setRecipes(data);
    } catch {}
    setIsLoading(false);
  }, []);

  // ─── AI search ────────────────────────────────────────
  const handleAiSearch = async (ingredients: string[]) => {
    setIsAiLoading(true);
    try {
      const ideas = await generateRecipeIdeasFromIngredients(ingredients, null);
      setAiRecipes(ideas);
    } catch {
      setAiRecipes([]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // ─── Derived ──────────────────────────────────────────
  const bookmarkedRecipes = recipes.filter(r => savedRecipes.includes(r.id));

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo-container" onClick={resetToExplore}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
            <path d="M12 2v20"></path>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          <h1 className="logo-text">Raci<span className="text-accent">kin</span></h1>
        </div>

        <div className="nav-tabs">
          <button className={`nav-tab ${activeTab === 'explore' ? 'active' : ''}`} onClick={resetToExplore}>
            Eksplor
          </button>
          <button className={`nav-tab ${activeTab === 'popular' ? 'active' : ''}`} onClick={handlePopularTab}>
            Populer
          </button>
          <button className={`nav-tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
            Tersimpan ({savedRecipes.length})
          </button>
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
              <p className="hero-subtitle">Cari resep masakan Indonesia yang simpel, enak, dan cocok buat menu harian.</p>
            </div>

            <SearchBar onSearch={handleSearch} isLoading={isLoading} initialValue={searchQuery} />

            {!hasSearched && <IngredientCtaCard onClick={() => setActiveTab('ai-search')} />}

            <CategoryFilter onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} />

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
              likedRecipes={likedRecipes}
              onToggleLike={handleToggleLike}
            />
          </>
        )}

        {activeTab === 'popular' && (
          <>
            <h2 className="section-title">Resep Paling Populer</h2>
            <RecipeList
              recipes={recipes}
              isLoading={isLoading}
              hasSearched={true}
              onRecipeClick={handleRecipeClick}
              savedRecipes={bookmarkedRecipes}
              onToggleSave={handleToggleBookmark}
              likedRecipes={likedRecipes}
              onToggleLike={handleToggleLike}
            />
          </>
        )}

        {activeTab === 'saved' && (
          <>
            <h2 className="section-title">Resep Tersimpan Kamu</h2>
            <RecipeList
              recipes={bookmarkedRecipes}
              isLoading={false}
              hasSearched={true}
              onRecipeClick={handleRecipeClick}
              savedRecipes={bookmarkedRecipes}
              onToggleSave={handleToggleBookmark}
              likedRecipes={likedRecipes}
              onToggleLike={handleToggleLike}
            />
          </>
        )}
      </main>

      {selectedRecipe && (
        <RecipeDetails
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          isSaved={savedRecipes.includes(selectedRecipe.id)}
          onToggleSave={() => handleToggleBookmark(selectedRecipe)}
          isLiked={likedRecipes.includes(selectedRecipe.id)}
          onToggleLike={() => handleToggleLike(selectedRecipe)}
        />
      )}
    </div>
  );
}

export default App;
