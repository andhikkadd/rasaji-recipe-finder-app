import type { Recipe } from '../types';
import { getRecipeImage } from '../utils/imageUtils';
import './RecipeCard.css';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
  index: number;
  isSaved: boolean;
  onToggleSave: (recipe: Recipe) => void;
  isLiked: boolean;
  onToggleLike: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onClick, index, isSaved, onToggleSave, isLiked, onToggleLike }: RecipeCardProps) {
  const displayTime = recipe.cookingTime || recipe.cookTime || recipe.prepTime || '-';
  const displayLikes = (recipe.likes || 0) + (isLiked ? 1 : 0);

  return (
    <div
      className="recipe-card glass animate-fade-in"
      style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
    >
      <div className="recipe-image-container" onClick={() => onClick(recipe)}>
        <img
          src={getRecipeImage(recipe)}
          alt={`${recipe.title} - Resep Racikin`}
          className="recipe-image"
          loading="lazy"
        />
        <div className="recipe-category-badge">{recipe.category}</div>
        {recipe.isVerified && (
          <div className="recipe-verified-badge" title="Resep terverifikasi">✓</div>
        )}
      </div>
      <div className="recipe-content">
        <h3 className="recipe-title" onClick={() => onClick(recipe)}>{recipe.title}</h3>

        <p className="recipe-desc" onClick={() => onClick(recipe)}>
          {recipe.shortDescription || 'Resep otentik Indonesia.'}
        </p>

        <div className="recipe-meta-row">
          <span className="recipe-meta-item">⏱️ {displayTime}</span>
          <span className="recipe-meta-item">👨‍🍳 {recipe.difficulty || 'Sedang'}</span>
        </div>

        <div className="recipe-actions">
          <button
            className={`action-btn like-btn ${isLiked ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleLike(recipe); }}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span className="like-count">{displayLikes}</span>
          </button>

          <button
            className={`action-btn save-btn ${isSaved ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleSave(recipe); }}
            aria-label={isSaved ? 'Remove bookmark' : 'Bookmark'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
            </svg>
          </button>

          {(recipe.views || 0) > 0 && (
            <span className="recipe-views">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {recipe.views}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
