import { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { RecipeList } from './components/RecipeList';
import { RecipeDetails } from './components/RecipeDetails';
import { CategoryFilter } from './components/CategoryFilter';
import { AiIngredientSearch } from './components/AiIngredientSearch';
import { AiRecipeCard } from './components/AiRecipeCard';
import { IngredientCtaCard } from './components/IngredientCtaCard';
import { generateRecipeIdeasFromIngredients } from './services/aiRecipeService';
import { fetchRecipes } from './services/recipeApi';
import type { Recipe, AiRecipe } from './types';
import './App.css';

function App() {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiRecipes, setAiRecipes] = useState<AiRecipe[]>([]);
  
  const [savedRecipes, setSavedRecipes] = useState<string[]>(() => {
    const saved = localStorage.getItem('savedRecipes_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [likedRecipes, setLikedRecipes] = useState<string[]>(() => {
    const liked = localStorage.getItem('likedRecipes_v2');
    return liked ? JSON.parse(liked) : [];
  });
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'explore' | 'popular' | 'saved' | 'ai-search'>('explore');

  // Load recipes from the API on mount
  useEffect(() => {
    fetchRecipes()
      .then(data => {
        setAllRecipes(data);
        setRecipes(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load recipes from API:', err);
        // Fallback: try loading from static file
        fetch('/data/recipes.json')
          .then(res => res.json())
          .then(data => {
            setAllRecipes(data);
            setRecipes(data);
          })
          .catch(() => {})
          .finally(() => setIsLoading(false));
      });
  }, []);

  useEffect(() => {
    localStorage.setItem('savedRecipes_v2', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  useEffect(() => {
    localStorage.setItem('likedRecipes_v2', JSON.stringify(likedRecipes));
  }, [likedRecipes]);

  const toggleSaveRecipe = (recipe: Recipe) => {
    setSavedRecipes(prev => {
      if (prev.includes(recipe.id)) {
        return prev.filter(id => id !== recipe.id);
      }
      return [...prev, recipe.id];
    });
  };

  const toggleLikeRecipe = (recipe: Recipe) => {
    setLikedRecipes(prev => {
      if (prev.includes(recipe.id)) {
        return prev.filter(id => id !== recipe.id);
      }
      return [...prev, recipe.id];
    });
  };

  const handleNormalSearch = async (query: string) => {
    setActiveTab('explore');
    setHasSearched(true);
    setSelectedCategory(null);
    
    if (!query) {
      setRecipes(allRecipes);
      setHasSearched(false);
      return;
    }

    // Try API search first
    setIsLoading(true);
    try {
      const results = await fetchRecipes(query);
      setRecipes(results);
    } catch {
      // Fallback to client-side filtering
      const lowerQuery = query.toLowerCase();
      const filtered = allRecipes.filter(r => 
        r.title.toLowerCase().includes(lowerQuery) || 
        r.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        r.ingredients.some(ing => ing.toLowerCase().includes(lowerQuery))
      );
      setRecipes(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (category: string | null) => {
    setActiveTab('explore');
    setSelectedCategory(category);
    
    if (!category || category === 'Semua') {
      setHasSearched(false);
      setRecipes(allRecipes);
      return;
    }

    setHasSearched(true);
    const filtered = allRecipes.filter(r => 
      r.category === category || r.tags.includes(category)
    );
    setRecipes(filtered);
  };

  const handleAiSearch = async (ingredients: string[]) => {
    setIsAiLoading(true);
    try {
      const ideas = await generateRecipeIdeasFromIngredients(ingredients, null);
      setAiRecipes(ideas);
    } catch (error) {
      console.error('Failed to generate AI recipes:', error);
      setAiRecipes([]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const resetToExplore = () => {
    setActiveTab('explore');
    setHasSearched(false);
    setRecipes(allRecipes);
  };

  // Derived data
  const savedRecipesList = allRecipes.filter(r => savedRecipes.includes(r.id));

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
          <button 
            className={`nav-tab ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={resetToExplore}
          >
            Eksplor
          </button>
          <button 
            className={`nav-tab ${activeTab === 'popular' ? 'active' : ''}`}
            onClick={() => setActiveTab('popular')}
          >
            Populer
          </button>
          <button 
            className={`nav-tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Tersimpan ({savedRecipes.length})
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* AI Ingredient Search View (Isolated Page) */}
        {activeTab === 'ai-search' && (
          <div className="ai-search-view animate-fade-in">
            <button className="back-btn" onClick={() => setActiveTab('explore')}>
              ← Kembali ke Beranda
            </button>
            <AiIngredientSearch onSearch={handleAiSearch} isLoading={isAiLoading} />
            
            <div className="ai-recipes-grid">
              {isAiLoading ? (
                <div className="recipes-loading">Meracik ide resep untukmu...</div>
              ) : aiRecipes.length > 0 ? (
                aiRecipes.map(recipe => (
                  <AiRecipeCard key={recipe.id} recipe={recipe} />
                ))
              ) : (
                <div className="empty-state">
                  <p>Belum ada hasil. Silakan masukkan bahan-bahan di atas.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Regular Explore View */}
        {activeTab === 'explore' && (
          <>
            <div className="hero-section">
              <h2 className="hero-title">Bingung makan apa hari ini?</h2>
              <p className="hero-subtitle">Cari resep masakan Indonesia yang simpel, enak, dan cocok buat menu harian.</p>
            </div>

            <SearchBar onSearch={handleNormalSearch} isLoading={isLoading} />
            
            {!hasSearched && (
              <IngredientCtaCard onClick={() => setActiveTab('ai-search')} />
            )}

            <CategoryFilter 
              onCategorySelect={handleCategorySelect} 
              selectedCategory={selectedCategory} 
            />

            <h2 className="section-title">
              {hasSearched ? 'Hasil Pencarian' : 'Menu Harian Terbaru'}
            </h2>
            
            <RecipeList 
              recipes={recipes} 
              isLoading={isLoading} 
              hasSearched={hasSearched} 
              onRecipeClick={setSelectedRecipe} 
              savedRecipes={savedRecipesList}
              onToggleSave={toggleSaveRecipe}
              likedRecipes={likedRecipes}
              onToggleLike={toggleLikeRecipe}
            />
          </>
        )}

        {/* Popular View */}
        {activeTab === 'popular' && (
          <>
            <h2 className="section-title">Resep Paling Populer</h2>
            <RecipeList 
              recipes={allRecipes} 
              isLoading={isLoading} 
              hasSearched={true} 
              onRecipeClick={setSelectedRecipe} 
              savedRecipes={savedRecipesList}
              onToggleSave={toggleSaveRecipe}
              likedRecipes={likedRecipes}
              onToggleLike={toggleLikeRecipe}
            />
          </>
        )}

        {/* Saved View */}
        {activeTab === 'saved' && (
          <>
            <h2 className="section-title">Resep Tersimpan Kamu</h2>
            <RecipeList 
              recipes={savedRecipesList} 
              isLoading={false} 
              hasSearched={true} 
              onRecipeClick={setSelectedRecipe} 
              savedRecipes={savedRecipesList}
              onToggleSave={toggleSaveRecipe}
              likedRecipes={likedRecipes}
              onToggleLike={toggleLikeRecipe}
            />
          </>
        )}
      </main>

      {selectedRecipe && (
        <RecipeDetails 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
          isSaved={savedRecipes.includes(selectedRecipe.id)}
          onToggleSave={() => toggleSaveRecipe(selectedRecipe)}
          isLiked={likedRecipes.includes(selectedRecipe.id)}
          onToggleLike={() => toggleLikeRecipe(selectedRecipe)}
        />
      )}
    </div>
  );
}

export default App;
