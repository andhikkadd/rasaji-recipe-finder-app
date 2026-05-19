import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Recipe } from '../types';
import { getRecipeImage } from '../utils/imageUtils';
import { cacheExternalRecipe } from '../services/recipeApi';
import './RecipePreviewModal.css';

interface RecipePreviewModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export function RecipePreviewModal({ recipe, onClose }: RecipePreviewModalProps) {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleReadFull = async () => {
    let targetRecipe = recipe;
    if (recipe._isExternalMock) {
      try {
        const cached = await cacheExternalRecipe(recipe);
        targetRecipe = cached;
      } catch (err) {
        console.error('Failed to cache external mock recipe:', err);
        return; // Stop navigation if caching fails
      }
    }
    onClose();
    navigate(`/resep/${targetRecipe.slug || targetRecipe.id}`);
  };

  const totalIng = recipe.ingredients.length;
  const showIngCount = Math.max(3, Math.floor(totalIng / 2));
  const partialIngredients = recipe.ingredients.slice(0, showIngCount);
  const remainingIng = totalIng - showIngCount;

  const totalSteps = recipe.steps?.length || 0;
  const showStepCount = Math.min(2, Math.max(1, Math.floor(totalSteps / 3))); // Show 1-2 steps
  const partialSteps = recipe.steps?.slice(0, showStepCount) || [];
  const remainingSteps = totalSteps - showStepCount;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content compact-modal animate-slide-up" onClick={e => e.stopPropagation()}>
        <button className="close-btn glass" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="modal-hero compact-hero">
          <img src={getRecipeImage(recipe)} alt={recipe.title} className="modal-image" />
          <div className="modal-hero-gradient"></div>
        </div>

        <div className="modal-body compact-body">
          <h2 className="modal-title-clean">{recipe.title}</h2>
          
          {recipe.shortDescription && (
            <p className="modal-desc-clean">{recipe.shortDescription}</p>
          )}

          <div className="preview-sections-clean">
            <div className="preview-section-clean">
              <h3 className="preview-title-clean">Bahan utama</h3>
              <ul className="preview-list-clean">
                {partialIngredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
                {remainingIng > 0 && (
                  <li 
                    className="preview-more-text" 
                    onClick={handleReadFull}
                    role="button"
                    tabIndex={0}
                    aria-label={`Baca semua ${totalIng} bahan di resep lengkap`}
                  >
                    Lihat {remainingIng} bahan lainnya
                  </li>
                )}
              </ul>
            </div>

            <div className="preview-section-clean">
              <h3 className="preview-title-clean">Langkah-langkah</h3>
              <ol className="preview-list-clean">
                {partialSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
                {remainingSteps > 0 && (
                  <li 
                    className="preview-more-text" 
                    onClick={handleReadFull}
                    role="button"
                    tabIndex={0}
                    aria-label={`Baca semua ${totalSteps} langkah di resep lengkap`}
                  >
                    Lihat {remainingSteps} langkah lainnya
                  </li>
                )}
              </ol>
            </div>
          </div>

          <button className="primary-cta-btn" onClick={handleReadFull}>
            Baca Resep Lengkap
          </button>
        </div>
      </div>
    </div>
  );
}
