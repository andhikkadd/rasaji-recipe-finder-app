import type { Recipe } from '../types';
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
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="recipe-image-container" onClick={() => onClick(recipe)}>
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="recipe-image"
          loading="lazy"
        />
        <div className="recipe-category-badge">{recipe.category}</div>
      </div>
      <div className="recipe-content">
        <h3 className="recipe-title" onClick={() => onClick(recipe)}>{recipe.title}</h3>
        
        <p className="recipe-desc" onClick={() => onClick(recipe)}>{recipe.shortDescription}</p>
        
        <div className="recipe-meta-row">
          <span className="recipe-meta-item">⏱️ {recipe.cookingTime}</span>
          <span className="recipe-meta-item">👨‍🍳 {recipe.difficulty}</span>
        </div>

        <div className="recipe-actions">
          <button 
            className={`action-btn like-btn ${isLiked ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike(recipe);
            }}
            aria-label={isLiked ? "Unlike" : "Like"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span className="like-count">{recipe.likes + (isLiked ? 1 : 0)}</span>
          </button>
          
          <button 
            className={`action-btn save-btn ${isSaved ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(recipe);
            }}
            aria-label={isSaved ? "Remove bookmark" : "Bookmark"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
