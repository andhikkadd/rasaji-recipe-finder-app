import type { Recipe } from '../types';

const API_BASE = '/api';

/**
 * Some scraped titles end up doubled (e.g. "Rendang Sapi Rendang Sapi").
 * This detects and fixes that by checking if the string is its own prefix repeated.
 */
function deduplicateTitle(title: string): string {
  const t = title.trim();
  if (t.length < 4) return t;
  const half = Math.floor(t.length / 2);
  const firstHalf = t.substring(0, half).trim();
  const secondHalf = t.substring(half).trim();
  if (firstHalf === secondHalf) return firstHalf;
  // Also try with a space separator
  const spaceIdx = t.indexOf(' ', half - 3);
  if (spaceIdx > 0) {
    const part1 = t.substring(0, spaceIdx).trim();
    const part2 = t.substring(spaceIdx).trim();
    if (part1 === part2) return part1;
  }
  return t;
}

/**
 * Normalize an API recipe response into the frontend Recipe shape.
 * This bridges the gap between the DB schema and the existing component expectations.
 */
function normalizeRecipe(raw: any): Recipe {
  return {
    id: raw.id,
    title: deduplicateTitle(raw.title || 'Tanpa Judul'),
    url: raw.url || undefined,
    image: raw.imageUrl || raw.image || undefined,
    imageUrl: raw.imageUrl || undefined,
    category: inferCategory(raw),
    shortDescription: buildDescription(raw),
    cookingTime: raw.cookTime || raw.prepTime || '-',
    prepTime: raw.prepTime || undefined,
    cookTime: raw.cookTime || undefined,
    difficulty: 'Sedang',
    servings: raw.servings || '-',
    ingredients: Array.isArray(raw.ingredients) ? raw.ingredients : [],
    steps: Array.isArray(raw.instructions) ? raw.instructions : (Array.isArray(raw.steps) ? raw.steps : []),
    instructions: Array.isArray(raw.instructions) ? raw.instructions : [],
    caloriesEstimate: 0,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    likes: 0,
  };
}

function inferCategory(raw: any): string {
  const tags: string[] = Array.isArray(raw.tags) ? raw.tags : [];
  const title = (raw.title || '').toLowerCase();
  const allText = [...tags.map(t => t.toLowerCase()), title].join(' ');

  if (allText.includes('ayam')) return 'Ayam';
  if (allText.includes('daging') || allText.includes('sapi') || allText.includes('rendang')) return 'Daging';
  if (allText.includes('ikan') || allText.includes('lele') || allText.includes('udang')) return 'Ikan';
  if (allText.includes('telur')) return 'Telur';
  if (allText.includes('tahu') || allText.includes('tempe')) return 'Tahu & Tempe';
  if (allText.includes('sayur') || allText.includes('gado') || allText.includes('cap cay')) return 'Sayur';
  if (allText.includes('nasi') || allText.includes('uduk')) return 'Nasi';
  if (allText.includes('mie') || allText.includes('bakso')) return 'Mie';
  if (allText.includes('sambal')) return 'Sambal';
  return 'Lainnya';
}

function buildDescription(raw: any): string {
  const ingredients: string[] = Array.isArray(raw.ingredients) ? raw.ingredients : [];
  if (ingredients.length > 0) {
    const preview = ingredients.slice(0, 4).join(', ');
    return `Bahan utama: ${preview}${ingredients.length > 4 ? '...' : ''}`;
  }
  return 'Resep otentik Indonesia.';
}

/**
 * Fetch all recipes, optionally filtered by a search query.
 */
export async function fetchRecipes(query?: string): Promise<Recipe[]> {
  const url = query ? `${API_BASE}/recipes?query=${encodeURIComponent(query)}` : `${API_BASE}/recipes`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.map(normalizeRecipe);
}

/**
 * Fetch a single recipe by ID.
 */
export async function fetchRecipeById(id: string): Promise<Recipe> {
  const res = await fetch(`${API_BASE}/recipes/${id}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return normalizeRecipe(data);
}
