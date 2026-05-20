import type { Recipe } from '../types';
import { getRecipeImage } from '../utils/imageUtils';
import { RecipeActions } from './RecipeActions';
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

        <RecipeActions 
          recipe={recipe}
          isLiked={isLiked}
          isSaved={isSaved}
          onToggleLike={onToggleLike}
          onToggleSave={onToggleSave}
        />
      </div>
    </div>
  );
}
