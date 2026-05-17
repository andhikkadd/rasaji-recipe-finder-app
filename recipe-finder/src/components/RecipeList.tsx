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
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="no-results-icon">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <h3>No recipes found</h3>
        <p>Try adjusting your search terms to find what you're looking for.</p>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="empty-state animate-fade-in">
        <h2 className="hero-text">Discover Delicious Recipes</h2>
        <p>Enter an ingredient or dish name above to start exploring culinary wonders.</p>
      </div>
    );
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
