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
  likedRecipes: string[];
  onToggleLike: (recipe: Recipe) => void;
  searchStatus?: 'idle' | 'searching_internal' | 'expanding_query' | 'searching_external' | 'done';
  nonFoodQuery?: boolean;
}

export function RecipeList({ recipes, onRecipeClick, isLoading, hasSearched, savedRecipes, onToggleSave, likedRecipes, onToggleLike, searchStatus = 'idle', nonFoodQuery = false }: RecipeListProps) {
  // Stage 1: Searching internal database
  if (searchStatus === 'searching_internal') {
    return (
      <div className="search-status-block animate-fade-in">
        <div className="search-status-text">
          <span className="search-dots-icon">🔍</span>
          Lagi nyari resep<span className="animated-dots"></span>
        </div>
        <div className="skeleton-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card glass"></div>
          ))}
        </div>
      </div>
    );
  }

  // Stage 1.5: Expanding query
  if (searchStatus === 'expanding_query') {
    return (
      <>
        {recipes.length > 0 && (
          <div className="recipe-grid">
            {recipes.map((recipe, index) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                onClick={() => onRecipeClick(recipe)}
                index={index}
                isSaved={savedRecipes.some(r => r.id === recipe.id)}
                onToggleSave={() => onToggleSave(recipe)}
                isLiked={likedRecipes.includes(recipe.id)}
                onToggleLike={() => onToggleLike(recipe)}
              />
            ))}
          </div>
        )}
        <div className="search-status-block animate-fade-in mt-4">
          <div className="search-status-text text-sm">
            <span className="search-dots-icon">✨</span>
            Belum banyak di Racikin, lagi coba cari ide lain yang masih nyambung<span className="animated-dots"></span>
          </div>
          <div className="skeleton-grid mt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-card glass"></div>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Stage 2: Internal results found but few, searching external
  if (searchStatus === 'searching_external') {
    return (
      <>
        {recipes.length > 0 && (
          <div className="recipe-grid">
            {recipes.map((recipe, index) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                onClick={onRecipeClick}
                index={index}
                isSaved={savedRecipes.some(r => r.id === recipe.id)}
                onToggleSave={onToggleSave}
                isLiked={likedRecipes.includes(recipe.id)}
                onToggleLike={onToggleLike}
              />
            ))}
          </div>
        )}
        <div className="search-status-block external-search animate-fade-in">
          <div className="search-status-text">
            <span className="search-dots-icon">🌐</span>
            Masih kurang, lagi coba cari dari sumber lain<span className="animated-dots"></span>
          </div>
          <div className="skeleton-grid skeleton-grid-small">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-card glass"></div>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Default loading (non-search contexts like initial load, tab switch)
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

  // Final empty state: only show after ALL searches are done
  if (hasSearched && recipes.length === 0 && searchStatus === 'done') {
    if (nonFoodQuery) {
      return (
        <div className="no-results glass-panel animate-fade-in">
          <div className="no-results-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <h3>Kayaknya kata kunci ini belum dikenali sebagai makanan atau resep 🤔</h3>
          <p>Coba cari bahan atau menu seperti <strong>ayam, mie, telur, sambal,</strong> atau <strong>seblak</strong>.</p>
        </div>
      );
    }
    return (
      <div className="no-results glass-panel animate-fade-in">
        <div className="no-results-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <h3>Belum ketemu resep yang cocok</h3>
        <p>Coba kata lain, misalnya ayam, mie, telur, atau sambal.</p>
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
          key={recipe.id} 
          recipe={recipe} 
          onClick={onRecipeClick}
          index={index}
          isSaved={savedRecipes.some(r => r.id === recipe.id)}
          onToggleSave={onToggleSave}
          isLiked={likedRecipes.includes(recipe.id)}
          onToggleLike={onToggleLike}
        />
      ))}
    </div>
  );
}
