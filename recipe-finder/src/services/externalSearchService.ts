import type { Recipe } from '../types';

/**
 * External Search Service
 *
 * Calls the backend endpoint GET /api/external-search?q=...
 * which currently serves mock data but is designed to be replaced
 * with real scraping/API calls (SerpAPI, Google Custom Search, etc.)
 *
 * The backend normalizes results through normalizeExternalRecipe()
 * before returning them.
 *
 * Rules:
 * - Results are blended inline with internal search results
 * - Results have _isExternalMock: true (not yet in DB)
 * - They are NOT saved unless the user opens/views the recipe
 * - On open, App.tsx calls cacheExternalRecipe() to persist them
 *   with status: cached_unverified, sourceType: external
 */

export async function searchExternalRecipes(query: string): Promise<Recipe[]> {
  if (!query.trim()) return [];

  try {
    const res = await fetch(`/api/external-search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();

    // Ensure _isExternalMock is set on all results
    return data.map((r: any) => ({
      ...r,
      ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
      steps: Array.isArray(r.steps) ? r.steps : [],
      tags: Array.isArray(r.tags) ? r.tags : [],
      keywords: Array.isArray(r.keywords) ? r.keywords : [],
      _isExternalMock: true,
    }));
  } catch (error) {
    console.error('External search failed:', error);
    return [];
  }
}
