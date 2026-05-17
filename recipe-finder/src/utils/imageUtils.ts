import type { Recipe } from '../types';

const FALLBACK_IMAGES: Record<string, string> = {
  'Ayam': 'https://placehold.co/800x600/fef08a/854d0e?text=Resep+Ayam',
  'Telur': 'https://placehold.co/800x600/fed7aa/9a3412?text=Resep+Telur',
  'Ikan': 'https://placehold.co/800x600/93c5fd/1e3a8a?text=Resep+Ikan',
  'Daging': 'https://placehold.co/800x600/fca5a5/7f1d1d?text=Resep+Daging',
  'Tahu & Tempe': 'https://placehold.co/800x600/fde047/713f12?text=Tahu+%26+Tempe',
  'Sayur': 'https://placehold.co/800x600/bbf7d0/14532d?text=Resep+Sayur',
  'Nasi': 'https://placehold.co/800x600/e5e5e5/404040?text=Resep+Nasi',
  'Mie': 'https://placehold.co/800x600/fef08a/ca8a04?text=Resep+Mie',
  'Sambal': 'https://placehold.co/800x600/fecaca/b91c1c?text=Resep+Sambal',
  'Camilan': 'https://placehold.co/800x600/ddd6fe/4c1d95?text=Camilan',
  'Minuman': 'https://placehold.co/800x600/bfdbfe/1d4ed8?text=Minuman',
};

const DEFAULT_FALLBACK = 'https://placehold.co/800x600/f1f5f9/475569?text=Resep+Racikin';

export function getRecipeImage(recipe: Recipe): string {
  // If the recipe has a specific image, use it
  if (recipe.image && recipe.image.trim() !== '') {
    return recipe.image;
  }
  
  // Otherwise, use the category fallback
  return FALLBACK_IMAGES[recipe.category] || DEFAULT_FALLBACK;
}
