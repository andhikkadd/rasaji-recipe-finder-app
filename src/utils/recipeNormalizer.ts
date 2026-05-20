import type { Recipe } from '../types';

export function isNoisyTag(tag: string): boolean {
  const t = tag.toLowerCase().trim();
  
  // 1. Length check
  if (t.length < 2 || t.length > 25) return true;
  
  // 2. Year check (e.g., contains any 4-digit number or 202x)
  if (/\b(202\d)\b/.test(t) || /\d{4}/.test(t)) return true;
  
  // 3. Underscore names (handles signatures/usernames like alaresto_wongkito, melancong3c2526)
  if (t.includes('_')) return true;

  // 4. Common event/community/user pattern matches
  const patterns = [
    'coboy', 'kolaksurabaya', 'sarapanduludong', 'cookpad', 'recook', 'challenge', 'event', 'apron',
    'komunitas', 'indonesia', 'week', 'weekly', 'squad', 'dapur', 'masak', 'pemula', 'menularest',
    'phiekitchen', 'community', 'username', 'author', 'olahanayam', 'ayamsausmentega',
    'clover', 'arisan', 'bancakan', 'motobareng', 'posbar', 'pejuang', 'tantangan', 'member',
    'alaresto', 'kopijos', 'serbakelapa', 'selaluistimewa', 'istimewa', 'harikartini', 'kartini',
    'astahomeware', 'pancong', 'salamkompak', 'ontyblusukan', 'dewisaraswati', 'bundakeyla',
    'agustinaerlinda', 'hasiltani', 'brand', 'desaku', 'sajiku', 'saori', 'wings', 'rosebrand'
  ];

  for (const p of patterns) {
    if (t.includes(p)) return true;
  }

  // 5. Single numeric values
  if (/^\d+$/.test(t)) return true;

  return false;
}

export function normalizeTags(tags: string[]): string[] {
  if (!Array.isArray(tags)) return [];
  
  return Array.from(
    new Set(
      tags
        .map(t => t.replace(/#/g, '').replace(/@/g, '').trim())
        .filter(t => !isNoisyTag(t))
        .map(t => {
          // Capitalize naturally
          return t.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        })
    )
  ).slice(0, 5);
}

export function cleanRecipeTitle(title: string): string {
  if (!title) return '';
  // Remove leading numbers, dots, spaces, and optionally the word "Resep"
  // e.g., "331. Ikan Bakar" -> "Ikan Bakar"
  // "12 Resep Ayam Kecap" -> "Ayam Kecap"
  // "Resep Ayam Geprek" -> "Ayam Geprek"
  const cleaned = title.replace(/^[\d\s.]*(?:Resep\s+)?/i, '').trim();
  
  // If it ended up empty, fallback to original
  return cleaned || title;
}

export function cleanRecipeStep(step: string): string {
  if (!step) return '';
  // Match "Step 1:", "Langkah 1:", "01 ", "1. ", "01 1 " at the beginning
  // We use a loop or global replace to catch repeating prefixes just in case
  let cleaned = step;
  const regex = /^(?:(?:step|langkah)\s*\d+[.:-]*\s*|[\d.\s-]+)+/i;
  cleaned = cleaned.replace(regex, '').trim();

  // If it ended up empty (e.g. step was just "1"), fallback
  return cleaned || step;
}

export function cleanIngredientText(ingredient: string): string {
  if (!ingredient) return '';
  let cleaned = ingredient;
  
  // Remove leading bullets or dashes
  cleaned = cleaned.replace(/^[•*\s-]+/, '');
  
  // Remove leading numbering like "1. ", "2) " but careful not to remove "2 ekor ikan"
  cleaned = cleaned.replace(/^\d+[.)]\s+/, '');
  
  return cleaned.trim() || ingredient;
}

export function cleanTipsText(tip: string): string {
  if (!tip) return '';
  let cleaned = tip;
  cleaned = cleaned.replace(/^[•*\s-]+/, '');
  cleaned = cleaned.replace(/^\d+[.)]\s+/, '');
  return cleaned.trim() || tip;
}

export function normalizeRecipe(recipe: Partial<Recipe>): Recipe {
  // Use raw or fallback
  const normalized: Partial<Recipe> = { ...recipe };

  if (normalized.title) {
    normalized.title = cleanRecipeTitle(normalized.title);
  }

  if (Array.isArray(normalized.ingredients)) {
    normalized.ingredients = normalized.ingredients
      .map(cleanIngredientText)
      .filter(Boolean); // remove empty
  }

  if (Array.isArray(normalized.tools)) {
    normalized.tools = normalized.tools
      .map(cleanIngredientText)
      .filter(Boolean);
  }

  if (Array.isArray(normalized.steps)) {
    normalized.steps = normalized.steps
      .map(cleanRecipeStep)
      .filter(Boolean);
  }

  if (typeof normalized.tips === 'string') {
    // Some tips might be separated by newlines
    normalized.tips = normalized.tips
      .split('\n')
      .map(cleanTipsText)
      .filter(Boolean)
      .join('\n');
  } else if (Array.isArray(normalized.tips as unknown)) {
    // If it's an array (runtime possibility from scraped data), clean it and join
    normalized.tips = (normalized.tips as unknown as string[])
      .map(cleanTipsText)
      .filter(Boolean)
      .join('\n');
  }

  if (Array.isArray(normalized.tags)) {
    normalized.tags = normalizeTags(normalized.tags);
  }

  if (Array.isArray(normalized.keywords)) {
    normalized.keywords = normalizeTags(normalized.keywords).map(k => k.toLowerCase());
  }

  return normalized as Recipe;
}

