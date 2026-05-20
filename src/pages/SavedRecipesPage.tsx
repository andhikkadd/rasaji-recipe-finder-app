import { useState, useEffect } from 'react';
import { PageShell } from '../components/PageLayout';
import { RecipeCard } from '../components/RecipeCard';
import { RecipePreviewModal } from '../components/RecipePreviewModal';
import { getSavedRecipes } from '../services/recipeApi';
import { useAuth } from '../contexts/AuthContext';
import type { Recipe } from '../types';

export function SavedRecipesPage() {
  const auth = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipeForPreview, setSelectedRecipeForPreview] = useState<Recipe | null>(null);

  useEffect(() => {
    if (auth.isLoggedIn) {
      const loadSaved = async () => {
        try {
          const data = await getSavedRecipes();
          setRecipes(data);
        } catch (err) {
          console.error('Failed to load saved recipes:', err);
        } finally {
          setIsLoading(false);
        }
      };
      loadSaved();
    }
  }, [auth.isLoggedIn]);

  const handleToggleBookmark = async (recipe: Recipe) => {
    if (!auth.isLoggedIn) return;
    const isSaved = (auth.user?.bookmarkedIds || []).includes(recipe.id);
    try {
      await auth.updateAction(recipe.id, 'bookmark', !isSaved);
      setRecipes(prev => prev.filter(r => r.id !== recipe.id));
    } catch (err) {
      console.error('Failed to update bookmark:', err);
    }
  };

  const handleToggleLike = async (recipe: Recipe) => {
    if (!auth.isLoggedIn) return;
    const isLiked = (auth.user?.likedIds || []).includes(recipe.id);
    try {
      await auth.updateAction(recipe.id, 'like', !isLiked);
      setRecipes(prev => prev.map(r => {
        if (r.id === recipe.id) {
          return {
            ...r,
            likes: Math.max(0, (r.likes || 0) + (!isLiked ? 1 : -1))
          };
        }
        return r;
      }));
    } catch (err) {
      console.error('Failed to update like:', err);
    }
  };

  const savedRecipeIds = auth.user?.bookmarkedIds || [];
  const likedRecipeIds = auth.user?.likedIds || [];

  return (
    <PageShell 
      title="Resep Tersimpan" 
      subtitle="Menu yang kamu simpan untuk dibuka lagi nanti."
      breadcrumbItems={[{ label: 'Resep Tersimpan' }]}
    >
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Memuat resep tersimpan...
        </div>
      ) : recipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Belum ada resep yang disimpan. Mulai jelajahi dan simpan resep favoritmu!
        </div>
      ) : (
        <div className="recipe-grid animate-fade-in">
          {recipes.map((recipe, index) => (
            <RecipeCard 
              key={recipe.id}
              recipe={recipe}
              index={index}
              onClick={() => setSelectedRecipeForPreview(recipe)}
              isSaved={savedRecipeIds.includes(recipe.id)}
              onToggleSave={() => handleToggleBookmark(recipe)}
              isLiked={likedRecipeIds.includes(recipe.id)}
              onToggleLike={() => handleToggleLike(recipe)}
            />
          ))}
        </div>
      )}

      {selectedRecipeForPreview && (
        <RecipePreviewModal
          recipe={selectedRecipeForPreview}
          onClose={() => setSelectedRecipeForPreview(null)}
        />
      )}
    </PageShell>
  );
}
