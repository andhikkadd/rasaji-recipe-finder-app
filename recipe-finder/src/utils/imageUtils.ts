import type { Recipe } from '../types';

const FALLBACK_IMAGES: Record<string, string> = {
  'Ayam': 'https://images.unsplash.com/photo-1626804475297-41609ea004eb?w=800&q=80',
  'Telur': 'https://images.unsplash.com/photo-1525351484163-9e45e5427845?w=800&q=80',
  'Ikan': 'https://images.unsplash.com/photo-1513269811566-0e1ce5e4f454?w=800&q=80',
  'Daging': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80',
  'Tahu & Tempe': 'https://images.unsplash.com/photo-1596633605700-1efc9b49e277?w=800&q=80',
  'Sayur': 'https://images.unsplash.com/photo-1548943487-a2e4e43b4850?w=800&q=80',
  'Nasi': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80',
  'Mie': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80',
  'Sambal': 'https://images.unsplash.com/photo-1558961363-a0c47bcc86cb?w=800&q=80',
  'Camilan': 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&q=80',
  'Minuman': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
};

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1548943487-a2e4e43b4850?w=800&q=80';

export function getRecipeImage(recipe: Recipe): string {
  // If the recipe has a specific image, use it
  if (recipe.image && recipe.image.trim() !== '') {
    return recipe.image;
  }
  
  // Otherwise, use the category fallback
  return FALLBACK_IMAGES[recipe.category] || DEFAULT_FALLBACK;
}
