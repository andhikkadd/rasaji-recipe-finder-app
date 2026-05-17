import { useEffect } from 'react';
import type { Recipe } from '../types';
import { getRecipeImage } from '../utils/imageUtils';
import './RecipeDetails.css';

interface RecipeDetailsProps {
  recipe: Recipe;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  isLiked: boolean;
  onToggleLike: () => void;
}

export function RecipeDetails({ recipe, onClose, isSaved, onToggleSave, isLiked, onToggleLike }: RecipeDetailsProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleAiAction = (action: string) => {
    alert(`Fitur AI "${action}" segera hadir! Saat ini sedang dalam tahap pengembangan.`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
        <button className="close-btn glass" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="modal-hero">
          <img src={getRecipeImage(recipe)} alt={`${recipe.title} - Resep Racikin`} className="modal-image" />
          <div className="modal-hero-gradient"></div>
          <div className="modal-hero-content">
            <span className="modal-category">{recipe.category}</span>
            <h2 className="modal-title">{recipe.title}</h2>
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-actions-row">
            <div className="modal-meta-grid">
              <div className="meta-item">
                <span className="meta-icon">⏱️</span>
                <span className="meta-text">{recipe.cookingTime || recipe.cookTime || recipe.prepTime || '-'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">👨‍🍳</span>
                <span className="meta-text">{recipe.difficulty || 'Sedang'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">🍽️</span>
                <span className="meta-text">{recipe.servings || '-'} Porsi</span>
              </div>
              {recipe.caloriesEstimate > 0 && (
                <div className="meta-item">
                  <span className="meta-icon">🔥</span>
                  <span className="meta-text">{recipe.caloriesEstimate} Kkal</span>
                </div>
              )}  
            </div>
            
            <div className="modal-buttons">
              <button 
                className={`action-btn like-btn ${isLiked ? 'active' : ''}`}
                onClick={onToggleLike}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span>{(recipe.likes || 0) + (isLiked ? 1 : 0)} Suka</span>
              </button>
              <button 
                className={`action-btn save-btn ${isSaved ? 'active' : ''}`}
                onClick={onToggleSave}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
                </svg>
                <span>{isSaved ? 'Tersimpan' : 'Simpan Resep'}</span>
              </button>
            </div>
          </div>

          <p className="modal-desc">{recipe.shortDescription}</p>

          <div className="recipe-grid-layout">
            <div className="recipe-ingredients">
              <h3>Bahan-bahan</h3>
              <ul className="ingredient-list">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
              
              {recipe.alternativeIngredients && (
                <div className="info-box alternative">
                  <strong>💡 Opsi Ganti Bahan:</strong>
                  <p>{recipe.alternativeIngredients}</p>
                </div>
              )}
            </div>

            <div className="recipe-instructions">
              <h3>Cara Memasak</h3>
              <ol className="instruction-list">
                {(recipe.steps?.length ? recipe.steps : recipe.instructions || []).map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>

              {recipe.tips && (
                <div className="info-box tips">
                  <strong>✨ Tips Racikin:</strong>
                  <p>{recipe.tips}</p>
                </div>
              )}
            </div>
          </div>

          {/* Future Ready AI Actions */}
          <div className="ai-actions-section">
            <h3 className="ai-actions-title">🤖 Racikin AI (Akan Datang)</h3>
            <p className="ai-actions-desc">Sesuaikan resep ini dengan kebutuhanmu menggunakan AI kami.</p>
            <div className="ai-action-buttons">
              <button onClick={() => handleAiAction("Bikin versi anak kos")} className="ai-btn">Bikin versi anak kos</button>
              <button onClick={() => handleAiAction("Bikin lebih hemat")} className="ai-btn">Bikin lebih hemat</button>
              <button onClick={() => handleAiAction("Bikin lebih sehat")} className="ai-btn">Bikin lebih sehat</button>
              <button onClick={() => handleAiAction("Bikin lebih pedas")} className="ai-btn">Bikin lebih pedas</button>
              <button onClick={() => handleAiAction("Ganti bahan yang nggak ada")} className="ai-btn">Ganti bahan yang nggak ada</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
