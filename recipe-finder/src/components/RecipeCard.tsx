import type { Recipe } from '../types';
import './RecipeCard.css';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
  index: number;
}

export function RecipeCard({ recipe, onClick, index }: RecipeCardProps) {
  return (
    <div 
      className="recipe-card glass" 
      onClick={() => onClick(recipe)}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
