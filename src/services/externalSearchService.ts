import type { Recipe, SourceType, RecipeStatus } from '../types';

/**
 * External Search Service
 *
 * Calls GET /api/external-search?q=... which now returns:
 *   { results: Recipe[], foodIntent: true | false | 'maybe' }
 *
 * - foodIntent: false  → query is not food-related; show non-food empty state
 * - foodIntent: true | 'maybe' → blend results with internal search
 *
 * Results are validated server-side (min 2 ingredients, min 2 steps, no placeholders).
 * They are NOT saved to DB unless the user opens the recipe detail page.
 */

export interface ExternalSearchResult {
  recipes: Recipe[];
  foodIntent: boolean | 'maybe';
}

export async function searchExternalRecipes(query: string): Promise<ExternalSearchResult> {
  if (!query.trim()) return { recipes: [], foodIntent: true };

  try {
    const res = await fetch(`/api/external-search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return { recipes: [], foodIntent: true };

    const data = await res.json();

    // Handle both old array shape (legacy) and new { results, foodIntent } shape
    const rawResults = (Array.isArray(data) ? data : (data.results ?? [])) as unknown[];
    const foodIntent: boolean | 'maybe' = Array.isArray(data) ? true : (data.foodIntent ?? true);

    const recipes: Recipe[] = rawResults.map((rawItem: unknown) => {
      const r = rawItem as Partial<Recipe> & Record<string, unknown>;
      return {
        id: (r.id as string) || '',
        slug: (r.slug as string) || '',
        title: (r.title as string) || 'Tanpa Judul',
        image: (r.image as string) || undefined,
        category: (r.category as string) || 'Lainnya',
        shortDescription: (r.shortDescription as string) || undefined,
        fullDescription: (r.fullDescription as string) || undefined,
        ingredients: Array.isArray(r.ingredients) ? (r.ingredients as string[]) : [],
        tools: Array.isArray(r.tools) ? (r.tools as string[]) : undefined,
        steps: Array.isArray(r.steps) ? (r.steps as string[]) : [],
        tips: (r.tips as string) || undefined,
        alternativeIngredients: (r.alternativeIngredients as string) || undefined,
        prepTime: (r.prepTime as string) || undefined,
        cookTime: (r.cookTime as string) || undefined,
        cookingTime: (r.cookingTime as string) || undefined,
        difficulty: (r.difficulty as string) || 'Sedang',
        servings: (r.servings as string | number) || '-',
        caloriesEstimate: (r.caloriesEstimate as number) || 0,
        tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
        keywords: Array.isArray(r.keywords) ? (r.keywords as string[]) : undefined,
        sourceType: (r.sourceType as SourceType) || 'external',
        sourceUrl: (r.sourceUrl as string) || undefined,
        sourceName: (r.sourceName as string) || undefined,
        status: (r.status as RecipeStatus) || 'cached_unverified',
        isVerified: !!r.isVerified,
        likes: (r.likes as number) || 0,
        bookmarks: (r.bookmarks as number) || 0,
        views: (r.views as number) || 0,
        _isExternalMock: true,
      } as Recipe;
    });

    return { recipes, foodIntent };
  } catch (error) {
    console.error('External search failed:', error);
    return { recipes: [], foodIntent: true };
  }
}
