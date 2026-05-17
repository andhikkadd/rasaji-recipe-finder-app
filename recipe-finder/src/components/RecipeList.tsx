import type { Recipe } from '../types';
import { RecipeCard } from './RecipeCard';
import './RecipeList.css';

interface RecipeListProps {
  recipes: Recipe[];
  onRecipeClick: (recipe: Recipe) => void;
  isLoading: boolean;
  hasSearched: boolean;
  savedRecipes: Recipe[];
  onToggleSave: (recipe: Recipe) => void;
}

export function RecipeList({ recipes, onRecipeClick, isLoading, hasSearched, savedRecipes, onToggleSave }: RecipeListProps) {
  if (isLoading) {
    return (
      <div className="recipes-loading">
        <div className="skeleton-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card glass"></div>
          ))}
        </div>
      </div>
    );
  }

  if (hasSearched && recipes.length === 0) {
    return (
      <div className="no-results glass-panel animate-fade-in">
        <div className="no-results-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <h3>Resep tidak ditemukan</h3>
        <p>Coba cari resep seperti nasi goreng, ayam, telur, atau mie.</p>
      </div>
    );
  }

  // If not searched and no popular recipes, return null (handled by App.tsx)
  if (!hasSearched && recipes.length === 0) {
    return null; 
  }

  return (
    <div className="recipe-grid">
      {recipes.map((recipe, index) => (
        <RecipeCard 
          key={recipe.idMeal} 
          recipe={recipe} 
          onClick={onRecipeClick}
          index={index}
          isSaved={savedRecipes.some(r => r.idMeal === recipe.idMeal)}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
}
