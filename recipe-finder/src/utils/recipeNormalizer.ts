import type { Recipe } from '../types';

export function cleanRecipeTitle(title: string): string {
  if (!title) return '';
  // Remove leading numbers, dots, spaces, and optionally the word "Resep"
  // e.g., "331. Ikan Bakar" -> "Ikan Bakar"
  // "12 Resep Ayam Kecap" -> "Ayam Kecap"
  // "Resep Ayam Geprek" -> "Ayam Geprek"
  let cleaned = title.replace(/^[\d\s\.]*(?:Resep\s+)?/i, '').trim();
  
  // If it ended up empty, fallback to original
  return cleaned || title;
}

export function cleanRecipeStep(step: string): string {
  if (!step) return '';
  // Match "Step 1:", "Langkah 1:", "01 ", "1. ", "01 1 " at the beginning
  // We use a loop or global replace to catch repeating prefixes just in case
  let cleaned = step;
  const regex = /^(?:(?:step|langkah)\s*\d+[\.\:\-]*\s*|[\d\.\-\s]+)+/i;
  cleaned = cleaned.replace(regex, '').trim();

  // If it ended up empty (e.g. step was just "1"), fallback
  return cleaned || step;
}

export function cleanIngredientText(ingredient: string): string {
  if (!ingredient) return '';
  let cleaned = ingredient;
  
  // Remove leading bullets or dashes
  cleaned = cleaned.replace(/^[•\-\*\s]+/, '');
  
  // Remove leading numbering like "1. ", "2) " but careful not to remove "2 ekor ikan"
  cleaned = cleaned.replace(/^\d+[\.\)]\s+/, '');
  
  return cleaned.trim() || ingredient;
}

export function cleanTipsText(tip: string): string {
  if (!tip) return '';
  let cleaned = tip;
  cleaned = cleaned.replace(/^[•\-\*\s]+/, '');
  cleaned = cleaned.replace(/^\d+[\.\)]\s+/, '');
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

  return normalized as Recipe;
}
