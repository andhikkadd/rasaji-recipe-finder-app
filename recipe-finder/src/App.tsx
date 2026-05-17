import { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { RecipeList } from './components/RecipeList';
import { RecipeDetails } from './components/RecipeDetails';
import { RegionFilter } from './components/RegionFilter';
import type { Recipe } from './types';
import './App.css';

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
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
      </header>

      <main className="app-main">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        
        <RegionFilter 
          onRegionSelect={handleRegionSelect} 
          selectedRegion={selectedRegion} 
          isLoading={isLoading} 
        />
        
        <RecipeList 
          recipes={recipes} 
          isLoading={isLoading} 
          hasSearched={hasSearched}
          onRecipeClick={handleRecipeClick} 
        />
      </main>

      {selectedRecipe && (
        <RecipeDetails 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
        />
      )}
    </div>
  );
}

export default App;
