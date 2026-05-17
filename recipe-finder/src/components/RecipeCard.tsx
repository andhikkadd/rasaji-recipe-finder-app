import type { Recipe } from '../types';
import './RecipeCard.css';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
  index: number;
  isSaved: boolean;
  onToggleSave: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onClick, index, isSaved, onToggleSave }: RecipeCardProps) {
  return (
    <div 
      className="recipe-card card" 
      onClick={() => onClick(recipe)}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <button 
        className={`save-btn ${isSaved ? 'saved' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave(recipe);
        }}
        aria-label={isSaved ? "Remove from saved" : "Save recipe"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>

      <div className="card-img-wrapper">
        <img 
          src={recipe.strMealThumb} 
          alt={recipe.strMeal} 
          className="card-img" 
          loading="lazy" 
        />
        {recipe.strCategory && <div className="card-badge">{recipe.strCategory}</div>}
      </div>
      <div className="card-content">
        <h3 className="card-title">{recipe.strMeal}</h3>
        {recipe.strArea && (
          <p className="card-area">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            {recipe.strArea} Origin
          </p>
        )}
      </div>
    </div>
  );
}
