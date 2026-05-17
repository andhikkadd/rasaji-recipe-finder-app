import type { Recipe } from '../types';

const FALLBACK_IMAGES: Record<string, string> = {
  'Ayam': 'https://images.pexels.com/photos/10580196/pexels-photo-10580196.jpeg?auto=compress&cs=tinysrgb&w=800', // Ayam Goreng
  'Telur': 'https://images.pexels.com/photos/824635/pexels-photo-824635.jpeg?auto=compress&cs=tinysrgb&w=800', // Telur
  'Ikan': 'https://images.pexels.com/photos/3296395/pexels-photo-3296395.jpeg?auto=compress&cs=tinysrgb&w=800', // Ikan
  'Daging': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Daging
  'Tahu & Tempe': 'https://images.pexels.com/photos/5409015/pexels-photo-5409015.jpeg?auto=compress&cs=tinysrgb&w=800', // Tahu/Tempe
  'Sayur': 'https://images.pexels.com/photos/257816/pexels-photo-257816.jpeg?auto=compress&cs=tinysrgb&w=800', // Sayur
  'Nasi': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Nasi
  'Mie': 'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress&cs=tinysrgb&w=800', // Mie
  'Sambal': 'https://images.pexels.com/photos/4552136/pexels-photo-4552136.jpeg?auto=compress&cs=tinysrgb&w=800', // Sambal
  'Camilan': 'https://images.unsplash.com/photo-1541529086526-db283c563270?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Camilan
  'Minuman': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Minuman
};

const DEFAULT_FALLBACK = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'; // Default to a nice rice dish

export function getRecipeImage(recipe: Recipe): string {
  // If the recipe has a specific image, use it
  if (recipe.image && recipe.image.trim() !== '') {
    return recipe.image;
  }
  
  // Otherwise, use the category fallback
  return FALLBACK_IMAGES[recipe.category] || DEFAULT_FALLBACK;
}
