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
  const displayLikes = (recipe.likes || 0) + (isLiked ? 1 : 0);

  return (
    <div
      className="recipe-card glass animate-fade-in"
      style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
      onClick={() => onClick(recipe)}
    >
      <div className="recipe-image-container">
        <img
          src={getRecipeImage(recipe)}
          alt={`${recipe.title} - Resep Rasaji`}
          className="recipe-image"
          loading="lazy"
        />
        <div className="recipe-category-badge">{recipe.displayBadge || recipe.category}</div>
      </div>
      <div className="recipe-content">
        <h3 className="recipe-title">{recipe.title}</h3>

        <p className="recipe-desc line-clamp-2">
          {recipe.shortDescription || 'Resep otentik pilihan kami.'}
        </p>

        <div className="recipe-actions-minimal">
          <button
            className={`action-btn-minimal like-btn ${isLiked ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleLike(recipe); }}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span className="like-count">{displayLikes > 0 ? displayLikes : ''}</span>
          </button>

          <button
            className={`action-btn-minimal save-btn ${isSaved ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleSave(recipe); }}
            aria-label={isSaved ? 'Remove bookmark' : 'Bookmark'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
