import type { AiRecipe } from '../types';
import './AiRecipeCard.css';

interface AiRecipeCardProps {
  recipe: AiRecipe;
}

export function AiRecipeCard({ recipe }: AiRecipeCardProps) {
  return (
    <div className="ai-recipe-card card animate-fade-in">
      <div className="ai-card-header">
        <h3 className="ai-card-title">{recipe.name}</h3>
        <div className="ai-card-meta">
          <span className="meta-badge time">
            ⏱️ {recipe.time}
          </span>
          <span className="meta-badge difficulty">
            👨‍🍳 {recipe.difficulty}
          </span>
        </div>
      </div>
      
      <p className="ai-card-desc">{recipe.description}</p>
      
      <div className="ai-ingredients-section">
        <div className="ingredient-group">
          <strong>Bahan yang dipakai:</strong>
          <div className="ingredient-chips">
            {recipe.ingredientsUsed.map(ing => (
              <span key={ing} className="chip used">{ing}</span>
            ))}
          </div>
        </div>
        
        {recipe.missingIngredients.length > 0 && (
          <div className="ingredient-group">
            <strong>Bahan tambahan (kurang):</strong>
            <div className="ingredient-chips">
              {recipe.missingIngredients.map(ing => (
                <span key={ing} className="chip missing">{ing}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="ai-steps-section">
        <strong>Cara Masak Singkat:</strong>
        <ol className="ai-steps-list">
          {recipe.steps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
