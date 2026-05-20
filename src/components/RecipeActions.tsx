import type { Recipe } from '../types';
import './RecipeActions.css';

interface RecipeActionsProps {
  recipe: Recipe;
  isLiked: boolean;
  isSaved: boolean;
  onToggleLike: (recipe: Recipe) => void;
  onToggleSave: (recipe: Recipe) => void;
  compact?: boolean;
}

export function RecipeActions({ recipe, isLiked, isSaved, onToggleLike, onToggleSave, compact = false }: RecipeActionsProps) {
  const displayLikes = recipe.likes || 0;

  return (
    <div className={`recipe-actions-minimal ${compact ? 'compact' : ''}`}>
      <button
        className={`action-btn-minimal like-btn ${isLiked ? 'active' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggleLike(recipe); }}
        aria-label={isLiked ? 'Unlike' : 'Like'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width={compact ? "16" : "18"} height={compact ? "16" : "18"} viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span className="like-count">{displayLikes > 0 ? `${displayLikes} suka` : '0 suka'}</span>
      </button>

      <button
        className={`action-btn-minimal save-btn ${isSaved ? 'active' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggleSave(recipe); }}
        aria-label={isSaved ? 'Remove bookmark' : 'Bookmark'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width={compact ? "16" : "18"} height={compact ? "16" : "18"} viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
        </svg>
      </button>
    </div>
  );
}
