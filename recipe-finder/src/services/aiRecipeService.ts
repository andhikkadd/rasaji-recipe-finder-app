import type { AiRecipe } from '../types';

/**
 * Mock service to simulate an AI recipe generation based on ingredients.
 * This is structured so it can easily be swapped out with a real API call later.
 */
export async function generateRecipeIdeasFromIngredients(
  ingredients: string[],
  _preference: string | null
): Promise<AiRecipe[]> {
  // Simulate network delay for realism
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Just some generic mock responses that feel realistic
  return [
    {
      id: `ai-${Date.now()}-1`,
      name: `Tumis ${ingredients[0] || 'Sayur'} Simpel Ala Kos`,
      description: `Masakan super praktis menggunakan bahan utama ${ingredients.join(', ')} yang kamu punya. Cocok untuk makan siang atau malam.`,
      ingredientsUsed: ingredients.slice(0, 3),
      missingIngredients: ['Bawang Putih', 'Garam', 'Minyak Goreng'],
      time: '15 Menit',
      difficulty: 'Sangat Mudah',
      steps: [
        'Panaskan sedikit minyak di wajan.',
        'Tumis bumbu dasar (bawang, garam) hingga harum.',
        `Masukkan ${ingredients[0] || 'bahan utama'} dan aduk rata.`,
        'Tambahkan sedikit air, masak hingga matang.',
        'Sajikan selagi hangat.'
      ]
    },
    {
      id: `ai-${Date.now()}-2`,
      name: `Nasi Goreng ${ingredients[0] || 'Spesial'}`,
      description: `Ide gampang kalau lagi buntu. Bikin nasi goreng dari sisa bahan yang ada di kulkas.`,
      ingredientsUsed: ingredients,
      missingIngredients: ['Nasi Putih', 'Kecap Manis'],
      time: '20 Menit',
      difficulty: 'Mudah',
      steps: [
        'Orak-arik telur atau bahan protein yang ada.',
        `Masukkan potongan ${ingredients.join(', ')}.`,
        'Masukkan nasi putih, aduk rata.',
        'Tambahkan bumbu dan kecap manis sesuai selera.',
        'Sajikan panas-panas.'
      ]
    }
  ];
}
