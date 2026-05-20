import { useState, useEffect, useCallback } from 'react';
import { PageShell } from '../components/PageLayout';
import { RecipeCard } from '../components/RecipeCard';
import { RecipePreviewModal } from '../components/RecipePreviewModal';
import { getPopularRecipes, toggleLike as apiToggleLike, toggleBookmark as apiToggleBookmark } from '../services/recipeApi';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { Recipe } from '../types';

export function PopularRecipesPage() {
  const auth = useAuth();
  const { showToast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipeForPreview, setSelectedRecipeForPreview] = useState<Recipe | null>(null);

  useEffect(() => {
    const loadPopular = async () => {
      try {
        const data = await getPopularRecipes();
        // Strict engagement-based sorting priority:
        // 1. likes count DESC -> 2. bookmarks count DESC -> 3. views count DESC -> 4. createdAt DESC
        const sorted = [...data].sort((a, b) => {
          if ((b.likes || 0) !== (a.likes || 0)) {
            return (b.likes || 0) - (a.likes || 0);
          }
          if ((b.bookmarks || 0) !== (a.bookmarks || 0)) {
            return (b.bookmarks || 0) - (a.bookmarks || 0);
          }
          if ((b.views || 0) !== (a.views || 0)) {
            return (b.views || 0) - (a.views || 0);
          }
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        setRecipes(sorted);
      } catch (err) {
        console.error('Failed to load popular recipes:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPopular();
  }, []);

  const savedRecipeIds = auth.user?.bookmarkedIds || [];
  const likedRecipeIds = auth.user?.likedIds || [];

  const handleToggleLike = useCallback((recipe: Recipe) => {
    if (!auth.isLoggedIn) {
      showToast("Masuk dulu untuk menyukai resep.", "error");
      return;
    }
    const liked = likedRecipeIds.includes(recipe.id);
    const newLiked = !liked;
    
    // Update local recipes state optimistically
    setRecipes(prev => prev.map(r => {
      if (r.id === recipe.id) {
        return {
          ...r,
          likes: Math.max(0, (r.likes || 0) + (newLiked ? 1 : -1))
        };
      }
      return r;
    }));

    auth.updateAction(recipe.id, 'like', newLiked);
    
    if (!recipe._isExternalMock) {
      apiToggleLike(recipe.id, newLiked ? 'like' : 'unlike')
        .then(res => {
          setRecipes(prev => prev.map(r => {
            if (r.id === recipe.id) {
              return { ...r, likes: res.likes };
            }
            return r;
          }));
        })
        .catch(() => {
          auth.updateAction(recipe.id, 'like', liked);
          setRecipes(prev => prev.map(r => {
            if (r.id === recipe.id) {
              return { ...r, likes: recipe.likes };
            }
            return r;
          }));
          showToast("Gagal menyukai resep. Silakan coba lagi.", "error");
        });
    }
  }, [auth, likedRecipeIds, showToast]);

  const handleToggleBookmark = useCallback((recipe: Recipe) => {
    if (!auth.isLoggedIn) {
      showToast("Masuk dulu untuk menyimpan resep.", "error");
      return;
    }
    const bookmarked = savedRecipeIds.includes(recipe.id);
    const newBookmarked = !bookmarked;

    // Update local recipes state optimistically
    setRecipes(prev => prev.map(r => {
      if (r.id === recipe.id) {
        return {
          ...r,
          bookmarks: Math.max(0, (r.bookmarks || 0) + (newBookmarked ? 1 : -1))
        };
      }
      return r;
    }));

    auth.updateAction(recipe.id, 'bookmark', newBookmarked);

    if (!recipe._isExternalMock) {
      apiToggleBookmark(recipe.id, newBookmarked ? 'bookmark' : 'unbookmark')
        .then(res => {
          setRecipes(prev => prev.map(r => {
            if (r.id === recipe.id) {
              return { ...r, bookmarks: res.bookmarks };
            }
            return r;
          }));
        })
        .catch(() => {
          auth.updateAction(recipe.id, 'bookmark', bookmarked);
          setRecipes(prev => prev.map(r => {
            if (r.id === recipe.id) {
              return { ...r, bookmarks: recipe.bookmarks };
            }
            return r;
          }));
          showToast("Gagal menyimpan resep. Silakan coba lagi.", "error");
        });
    }
  }, [auth, savedRecipeIds, showToast]);

  return (
    <PageShell 
      title="Resep Populer" 
      subtitle="Menu yang paling banyak disukai dan disimpan pengguna Rasaji."
      breadcrumbItems={[{ label: 'Resep Populer' }]}
    >
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Memuat resep populer...
        </div>
      ) : recipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Belum ada resep populer terkini.
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
