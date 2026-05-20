import type { Recipe } from '../types';
import { RecipeActions } from './RecipeActions';
import './FeaturedRecipeLayout.css';

interface FeaturedRecipeLayoutProps {
  recipes: Recipe[];
  likedRecipeIds: string[];
  savedRecipeIds: string[];
  onRecipeClick: (recipe: Recipe) => void;
  onToggleLike: (recipe: Recipe) => void;
  onToggleSave: (recipe: Recipe) => void;
}

export function FeaturedRecipeLayout({
  recipes,
  likedRecipeIds,
  savedRecipeIds,
  onRecipeClick,
  onToggleLike,
  onToggleSave,
}: FeaturedRecipeLayoutProps) {
  if (recipes.length < 3) return null;

  const featuredRecipe = recipes[0];
  const highlight1 = recipes[1];
  const highlight2 = recipes[2];

  return (
    <div className="featured-section animate-fade-in">
      <h3 className="section-title" style={{ margin: 0 }}>Pilihan Hari Ini</h3>
      <p className="section-subtitle">Menu yang cocok buat jadi inspirasi masak hari ini.</p>

      <div className="featured-layout">
        {/* Large Featured Card (Left) */}
        {featuredRecipe && (
          <div className="featured-large-card animate-fade-in" onClick={() => onRecipeClick(featuredRecipe)}>
            <div className="featured-large-img-container">
              <img
                src={featuredRecipe.image || '/logo.ico'}
                alt={featuredRecipe.title}
                className="featured-large-img"
                loading="lazy"
              />
              <span className="featured-large-badge">{featuredRecipe.displayBadge || featuredRecipe.category}</span>
            </div>
            <div className="featured-large-content">
              <div>
                <h4 className="featured-large-title">{featuredRecipe.title}</h4>
                <p className="featured-large-desc">
                  {featuredRecipe.shortDescription || 'Resep otentik pilihan hari ini.'}
                </p>
              </div>
              <RecipeActions
                recipe={featuredRecipe}
                isLiked={likedRecipeIds.includes(featuredRecipe.id)}
                isSaved={savedRecipeIds.includes(featuredRecipe.id)}
                onToggleLike={onToggleLike}
                onToggleSave={onToggleSave}
              />
            </div>
          </div>
        )}

        {/* Small Stack Cards (Right) */}
        <div className="featured-small-stack">
          {[highlight1, highlight2].map((recipe) => {
            if (!recipe) return null;
            return (
              <div key={recipe.id} className="featured-small-card animate-fade-in" onClick={() => onRecipeClick(recipe)}>
                <div className="featured-small-img-container">
                  <img
                    src={recipe.image || '/logo.ico'}
                    alt={recipe.title}
                    className="featured-small-img"
                    loading="lazy"
                  />
                </div>
                <div className="featured-small-content">
                  <div className="featured-small-top">
                    <span className="featured-small-category">{recipe.displayBadge || recipe.category}</span>
                    <h4 className="featured-small-title">{recipe.title}</h4>
                    {recipe.shortDescription && (
                      <p className="featured-small-desc">
                        {recipe.shortDescription}
                      </p>
                    )}
                  </div>
                  <RecipeActions
                    recipe={recipe}
                    isLiked={likedRecipeIds.includes(recipe.id)}
                    isSaved={savedRecipeIds.includes(recipe.id)}
                    onToggleLike={onToggleLike}
                    onToggleSave={onToggleSave}
                    compact={true}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
