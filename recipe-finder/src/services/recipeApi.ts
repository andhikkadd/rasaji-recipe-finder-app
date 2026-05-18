import { normalizeRecipe } from '../utils/recipeNormalizer';
import type { Recipe, SearchFilters } from '../types';

const API = '/api';

// ─── Title dedup helper ───────────────────────────────────
function dedup(title: string): string {
  const t = title.trim();
  if (t.length < 6) return t;
  const mid = Math.floor(t.length / 2);
  const idx = t.indexOf(' ', mid - 3);
  if (idx > 0) {
    const a = t.substring(0, idx).trim();
    const b = t.substring(idx).trim();
    if (a === b) return a;
  }
  return t;
}

// ─── Normalize API response ──────────────────────────────
function normalize(raw: any): Recipe {
  const baseRecipe: Recipe = {
    id: raw.id,
    slug: raw.slug || raw.id,
    title: dedup(raw.title || 'Tanpa Judul'),
    image: raw.image || undefined,
    category: raw.category || 'Lainnya',
    shortDescription: raw.shortDescription || buildDesc(raw),
    fullDescription: raw.fullDescription || undefined,
    ingredients: Array.isArray(raw.ingredients) ? raw.ingredients : [],
    tools: Array.isArray(raw.tools) ? raw.tools : undefined,
    steps: Array.isArray(raw.steps) ? raw.steps : [],
    tips: raw.tips || undefined,
    alternativeIngredients: raw.alternativeIngredients || undefined,
    prepTime: raw.prepTime || undefined,
    cookTime: raw.cookTime || undefined,
    cookingTime: raw.cookingTime || raw.cookTime || raw.prepTime || undefined,
    difficulty: raw.difficulty || 'Sedang',
    servings: raw.servings || '-',
    caloriesEstimate: raw.caloriesEstimate || 0,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    keywords: Array.isArray(raw.keywords) ? raw.keywords : undefined,
    sourceType: raw.sourceType || 'internal',
    sourceUrl: raw.sourceUrl || undefined,
    sourceName: raw.sourceName || undefined,
    status: raw.status || 'verified',
    isVerified: raw.isVerified || false,
    likes: raw.likes || 0,
    bookmarks: raw.bookmarks || 0,
    views: raw.views || 0,
    _isExternalMock: raw._isExternalMock || false,
  };
  
  return normalizeRecipe(baseRecipe);
}

function buildDesc(raw: any): string {
  const ings: string[] = Array.isArray(raw.ingredients) ? raw.ingredients : [];
  if (ings.length > 0) {
    return `Bahan utama: ${ings.slice(0, 3).join(', ')}${ings.length > 3 ? '...' : ''}`;
  }
  return 'Resep otentik Indonesia.';
}

// ─── API Functions ────────────────────────────────────────

/** Relevance-scored search */
export async function searchRecipes(query: string, filters?: SearchFilters): Promise<Recipe[]> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.status) params.set('status', filters.status);

  const res = await fetch(`${API}/recipes/search?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.map(normalize);
}

/** Get popular recipes sorted by likes + views */
export async function getPopularRecipes(): Promise<Recipe[]> {
  const res = await fetch(`${API}/recipes/popular`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.map(normalize);
}

/** Get latest recipes */
export async function getLatestRecipes(): Promise<Recipe[]> {
  const res = await fetch(`${API}/recipes/latest`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.map(normalize);
}

/** Get recipes by category */
export async function getRecipesByCategory(category: string): Promise<Recipe[]> {
  const res = await fetch(`${API}/recipes/category/${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.map(normalize);
}

/** Get recipe by slug */
export async function getRecipeBySlug(slug: string): Promise<Recipe> {
  const res = await fetch(`${API}/recipes/slug/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return normalize(data);
}

/** Toggle like on a recipe */
export async function toggleLike(recipeId: string, action: 'like' | 'unlike'): Promise<{ likes: number }> {
  const res = await fetch(`${API}/recipes/${recipeId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/** Toggle bookmark on a recipe */
export async function toggleBookmark(recipeId: string, action: 'bookmark' | 'unbookmark'): Promise<{ bookmarks: number }> {
  const res = await fetch(`${API}/recipes/${recipeId}/bookmark`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/** Increment view count */
export async function incrementView(recipeId: string): Promise<void> {
  fetch(`${API}/recipes/${recipeId}/view`, { method: 'POST' }).catch(() => {});
}

/** Cache an external recipe into the database */
export async function cacheExternalRecipe(recipe: Partial<Recipe>): Promise<Recipe> {
  const res = await fetch(`${API}/recipes/cache-external`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return normalize(data);
}

// ─── Legacy compat ────────────────────────────────────────
export async function fetchRecipes(query?: string): Promise<Recipe[]> {
  if (query) return searchRecipes(query);
  return getLatestRecipes();
}
