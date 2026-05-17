import { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { RecipeList } from './components/RecipeList';
import { RecipeDetails } from './components/RecipeDetails';
import { RegionFilter } from './components/RegionFilter';
import type { Recipe } from './types';
import './App.css';

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('savedRecipes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'saved'>('explore');

  // Fetch default "popular" recipes on mount
  useEffect(() => {
    const fetchPopular = async () => {
      setIsLoading(true);
      try {
        // We'll search for 'chicken' as a proxy for popular default recipes
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=chicken`);
        const data = await response.json();
        // Take the first 8
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

  const handleSearch = async (query: string) => {
    setActiveTab('explore');
    setIsLoading(true);
    setHasSearched(true);
    setSelectedRegion(null);
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

  const handleRegionSelect = async (region: string) => {
    setActiveTab('explore');
    setIsLoading(true);
    setHasSearched(true);
    setSelectedRegion(region);
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${region}`);
      const data = await response.json();
      setRecipes(data.meals || []);
    } catch (error) {
      console.error('Failed to fetch recipes by region:', error);
      setRecipes([]);
    } finally {
      setIsLoading(false);
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

  const displayRecipes = activeTab === 'saved' ? savedRecipes : (hasSearched ? recipes : popularRecipes);

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
            <path d="M12 2v20"></path>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          <h1 className="logo-text">Culinary <span className="text-accent">Canvas</span></h1>
        </div>
        
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('explore')}
          >
            Explore
          </button>
          <button 
            className={`nav-tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved ({savedRecipes.length})
          </button>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'explore' && (
          <>
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            <RegionFilter 
              onRegionSelect={handleRegionSelect} 
              selectedRegion={selectedRegion} 
              isLoading={isLoading} 
            />
          </>
        )}
        
        {activeTab === 'explore' && !hasSearched && (
          <h2 className="section-title">Popular Recipes</h2>
        )}
        {activeTab === 'saved' && (
          <h2 className="section-title">Your Saved Recipes</h2>
        )}

        <RecipeList 
          recipes={displayRecipes} 
          isLoading={activeTab === 'explore' && isLoading} 
          hasSearched={activeTab === 'saved' || hasSearched} // Hide empty state banner for saved if empty
          onRecipeClick={handleRecipeClick} 
          savedRecipes={savedRecipes}
          onToggleSave={toggleSaveRecipe}
        />
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
