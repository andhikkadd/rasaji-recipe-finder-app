import type { Recipe, AiRecipe, AiAssistantResponse } from '../types';

// ─── AI Recipe Generator (mock) ──────────────────────────
export async function generateRecipeIdeasFromIngredients(
  ingredients: string[],
  _preference: string | null
): Promise<AiRecipe[]> {
  await new Promise(resolve => setTimeout(resolve, 2000));

  return [
    {
      id: `ai-${Date.now()}-1`,
      name: `Tumis ${ingredients[0] || 'Sayur'} Simpel Ala Kos`,
      description: `Masakan praktis menggunakan ${ingredients.join(', ')} yang kamu punya.`,
      ingredientsUsed: ingredients.slice(0, 3),
      missingIngredients: ['Bawang Putih', 'Garam', 'Minyak Goreng'],
      time: '15 Menit',
      difficulty: 'Sangat Mudah',
      steps: [
        'Panaskan sedikit minyak di wajan.',
        'Tumis bumbu dasar hingga harum.',
        `Masukkan ${ingredients[0] || 'bahan utama'} dan aduk rata.`,
        'Tambahkan sedikit air, masak hingga matang.',
        'Sajikan selagi hangat.'
      ]
    },
    {
      id: `ai-${Date.now()}-2`,
      name: `Nasi Goreng ${ingredients[0] || 'Spesial'}`,
      description: `Nasi goreng dari sisa bahan di kulkas: ${ingredients.join(', ')}.`,
      ingredientsUsed: ingredients,
      missingIngredients: ['Nasi Putih', 'Kecap Manis'],
      time: '20 Menit',
      difficulty: 'Mudah',
      steps: [
        'Orak-arik telur atau protein yang ada.',
        `Masukkan ${ingredients.join(', ')}.`,
        'Masukkan nasi putih, aduk rata.',
        'Tambahkan bumbu dan kecap manis.',
        'Sajikan panas-panas.'
      ]
    }
  ];
}

// ─── AI Recipe Normalizer (mock) ──────────────────────────
/**
 * Normalizes messy external recipe data into Racikin's clean format.
 * In the future, this will call an LLM to clean up ingredients, steps, etc.
 */
export async function normalizeExternalRecipe(rawRecipe: Partial<Recipe>): Promise<Partial<Recipe>> {
  // Mock: just return the recipe with some cleanup
  await new Promise(r => setTimeout(r, 200));

  return {
    ...rawRecipe,
    title: rawRecipe.title?.trim() || 'Tanpa Judul',
    ingredients: (rawRecipe.ingredients || []).map(i => i.trim()).filter(Boolean),
    steps: (rawRecipe.steps || []).map(s => s.trim()).filter(Boolean),
    tags: rawRecipe.tags || [],
    category: rawRecipe.category || 'Lainnya',
    difficulty: rawRecipe.difficulty || 'Sedang',
  };
}

// ─── AI Recipe Assistant (mock Q&A) ──────────────────────
/**
 * Answers a question about a specific recipe.
 * Returns a single answer string. Designed to be upgraded to a chat thread later.
 */

const MOCK_ANSWERS: Record<string, string> = {
  'bawang bombay': '🧅 Bawang bombay bisa diganti dengan bawang merah iris tipis (2x lipat takaran). Rasanya akan sedikit berbeda tapi tetap enak! Kalau mau lebih mirip, gunakan daun bawang putih bagian batangnya.',
  'anak kos': '🎓 Versi anak kos: Kurangi bahan jadi setengah, ganti santan dengan susu UHT + sedikit tepung maizena, dan gunakan bumbu instan sebagai basis. Masak pakai wajan anti lengket biasa.',
  'hemat': '💰 Tips hemat: Ganti protein utama dengan tempe/tahu, kurangi bumbu premium, dan gunakan bumbu dasar siap pakai. Estimasi biaya bisa turun 40-60%.',
  'sehat': '🥗 Versi sehat: Kurangi minyak goreng (tumis tanpa minyak pakai teflon), ganti gula dengan madu, tambah sayuran segar, dan kurangi garam. Gunakan metode kukus/panggang bukan goreng.',
  'pedas': '🌶️ Tambahkan 5-10 cabe rawit utuh atau cabe rawit iris saat menumis bumbu. Untuk pedas yang lebih meledak, tambahkan 1 sdm sambal oelek atau bubuk cabe Korea (gochugaru).',
  'santan': '🥥 Pengganti santan: Gunakan susu evaporasi, susu oat, atau santan kelentik instan. Untuk rasa gurih tanpa santan, tambahkan 1 sdm krim keju atau mentega.',
  'default': '🤖 Hmm, pertanyaan yang menarik! Untuk saat ini saya belum bisa memberikan jawaban spesifik untuk pertanyaan ini. Tim Racikin sedang mengembangkan AI yang lebih pintar. Coba tanyakan tentang pengganti bahan, versi hemat, versi sehat, atau cara membuat lebih pedas!'
};

export async function askRecipeAssistant(
  _recipe: Recipe,
  question: string
): Promise<AiAssistantResponse> {
  // Simulate AI thinking time
  await new Promise(r => setTimeout(r, 1500));

  const q = question.toLowerCase();

  let answer = MOCK_ANSWERS.default;
  for (const [keyword, response] of Object.entries(MOCK_ANSWERS)) {
    if (keyword !== 'default' && q.includes(keyword)) {
      answer = response;
      break;
    }
  }

  return { question, answer };
}
