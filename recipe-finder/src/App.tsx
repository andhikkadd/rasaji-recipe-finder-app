import { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { RecipeList } from './components/RecipeList';
import { RecipeDetails } from './components/RecipeDetails';
import { IntentFilter } from './components/IntentFilter';
import { AiIngredientSearch } from './components/AiIngredientSearch';
import { AiRecipeCard } from './components/AiRecipeCard';
import { generateRecipeIdeasFromIngredients } from './services/aiRecipeService';
import type { Recipe, AiRecipe } from './types';
import './App.css';

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([]);
  const [aiRecipes, setAiRecipes] = useState<AiRecipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('savedRecipes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'saved'>('explore');
  
  // Track which search mode was used last to know what results to display
  const [lastSearchMode, setLastSearchMode] = useState<'normal' | 'ai' | 'popular'>('popular');

  // Fetch default "popular" recipes on mount
  useEffect(() => {
    const fetchPopular = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=chicken`);
        const data = await response.json();
        setPopularRecipes(data.meals ? data.meals.slice(0, 8) : []);
      } catch (error) {
        console.error('Failed to fetch popular recipes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPopular();
  }, []);

  useEffect(() => {
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  const toggleSaveRecipe = (recipe: Recipe) => {
    setSavedRecipes(prev => {
      const isSaved = prev.some(r => r.idMeal === recipe.idMeal);
      if (isSaved) {
        return prev.filter(r => r.idMeal !== recipe.idMeal);
      } else {
        return [...prev, recipe];
      }
    });
  };

  const handleNormalSearch = async (query: string) => {
    setActiveTab('explore');
    setIsLoading(true);
    setHasSearched(true);
    setLastSearchMode('normal');
    setSelectedIntent(null);
    setAiRecipes([]); // clear AI results
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      const data = await response.json();
      setRecipes(data.meals || []);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIntentSelect = async (intent: string | null) => {
    setActiveTab('explore');
    setSelectedIntent(intent);
    setLastSearchMode('normal');
    setAiRecipes([]);
    
    if (!intent) {
      // If "Semua" is selected, just show popular
      setHasSearched(false);
      setRecipes([]);
      setLastSearchMode('popular');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      // Map Indonesian intents to MealDB search queries as a simple fallback
      const queryMap: Record<string, string> = {
        'Cepat & Simpel': 'egg',
        'Anak Kos': 'noodle',
        'Hemat': 'rice',
        'Pedas': 'spicy',
        'Sehat': 'salad',
        'Lauk Harian': 'chicken',
        'Nasi & Mie': 'rice',
        'Ayam': 'chicken',
        'Telur': 'egg',
        'Sayur': 'veg',
        'Camilan': 'snack'
      };
      
      const query = queryMap[intent] || intent;
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      const data = await response.json();
      setRecipes(data.meals || []);
    } catch (error) {
      console.error('Failed to fetch recipes by intent:', error);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiSearch = async (ingredients: string[]) => {
    setActiveTab('explore');
    setIsAiLoading(true);
    setHasSearched(true);
    setLastSearchMode('ai');
    setSelectedIntent(null);
    
    try {
      const ideas = await generateRecipeIdeasFromIngredients(ingredients, selectedIntent);
      setAiRecipes(ideas);
    } catch (error) {
      console.error('Failed to generate AI recipes:', error);
      setAiRecipes([]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleRecipeClick = async (recipe: Recipe) => {
    if (!recipe.strInstructions) {
      try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipe.idMeal}`);
        const data = await response.json();
        if (data.meals && data.meals.length > 0) {
          setSelectedRecipe(data.meals[0]);
        }
      } catch (error) {
        console.error('Failed to fetch full recipe details:', error);
      }
    } else {
      setSelectedRecipe(recipe);
    }
  };

  const displayNormalRecipes = activeTab === 'saved' ? savedRecipes : (lastSearchMode === 'normal' ? recipes : popularRecipes);

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
            <path d="M12 2v20"></path>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          <h1 className="logo-text">Raci<span className="text-accent">kin</span></h1>
        </div>
        
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('explore')}
          >
            Eksplor
          </button>
          <button 
            className={`nav-tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Resep Tersimpan ({savedRecipes.length})
          </button>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'explore' && (
          <div className="hero-section">
            <h2 className="hero-title">Bingung masak apa hari ini?</h2>
            <p className="hero-subtitle">Cari resep makanan favoritmu, atau masukkan bahan yang kamu punya biar Racikin bantu carikan ide masak yang simpel.</p>
          </div>
        )}

        {activeTab === 'explore' && (
          <>
            <SearchBar onSearch={handleNormalSearch} isLoading={isLoading && lastSearchMode === 'normal'} />
            <AiIngredientSearch onSearch={handleAiSearch} isLoading={isAiLoading} />
            <IntentFilter 
              onIntentSelect={handleIntentSelect} 
              selectedIntent={selectedIntent} 
              isLoading={isLoading || isAiLoading} 
            />
          </>
        )}
        
        {/* Render Results */}
        {activeTab === 'explore' && lastSearchMode === 'popular' && (
          <h2 className="section-title">Ide Resep Terpopuler</h2>
        )}
        {activeTab === 'explore' && lastSearchMode === 'ai' && (
          <h2 className="section-title">Hasil Racikan Bahan Kamu</h2>
        )}
        {activeTab === 'explore' && lastSearchMode === 'normal' && (
          <h2 className="section-title">Hasil Pencarian</h2>
        )}
        {activeTab === 'saved' && (
          <h2 className="section-title">Resep Tersimpan Kamu</h2>
        )}

        {activeTab === 'explore' && lastSearchMode === 'ai' ? (
          // Render AI Results
          <div className="ai-recipes-grid">
            {isAiLoading ? (
              <div className="recipes-loading">Meracik ide resep untukmu...</div>
            ) : aiRecipes.length > 0 ? (
              aiRecipes.map(recipe => (
                <AiRecipeCard key={recipe.id} recipe={recipe} />
              ))
            ) : (
              <div className="empty-state">
                <div className="no-results-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <h3>Gagal menemukan ide masak</h3>
                <p>Maaf, Racikin belum menemukan ide dari bahan tersebut. Coba gunakan bahan lain ya!</p>
              </div>
            )}
          </div>
        ) : (
          // Render Normal Results
          <RecipeList 
            recipes={displayNormalRecipes} 
            isLoading={activeTab === 'explore' && isLoading && lastSearchMode !== 'ai'} 
            hasSearched={activeTab === 'saved' || hasSearched} 
            onRecipeClick={handleRecipeClick} 
            savedRecipes={savedRecipes}
            onToggleSave={toggleSaveRecipe}
          />
        )}
      </main>

      {selectedRecipe && (
        <RecipeDetails 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
          isSaved={savedRecipes.some(r => r.idMeal === selectedRecipe.idMeal)}
          onToggleSave={() => toggleSaveRecipe(selectedRecipe)}
        />
      )}
    </div>
  );
}

export default App;
