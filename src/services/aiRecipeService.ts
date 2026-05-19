import type { Recipe, AiRecipe, AiAssistantResponse } from '../types';

// ─── AI Provider Config ──────────────────────────────────
// Set this to 'gemini' and provide GEMINI_API_KEY in .env
// to switch from mock to real AI responses.
const AI_PROVIDER: 'mock' | 'gemini' = 'mock';
const GEMINI_API_KEY = ''; // Will be set via env in production

// ─── AI Recipe Generator (mock) ──────────────────────────
export async function generateRecipeIdeasFromIngredients(
  ingredients: string[],
  _preference: string | null
): Promise<AiRecipe[]> {
  if (AI_PROVIDER === 'gemini' && GEMINI_API_KEY) {
    // Future: Call Gemini API
    // const prompt = `Given these ingredients: ${ingredients.join(', ')},
    //   suggest 2-3 Indonesian recipes. Return JSON array with fields:
    //   name, description, ingredientsUsed, missingIngredients, time, difficulty, steps`;
    // const response = await callGemini(prompt);
    // return JSON.parse(response);
  }

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

// ─── AI Recipe Normalizer ─────────────────────────────────
/**
 * Normalizes messy external recipe data into Rasaji's clean format.
 *
 * Current: Basic string cleanup (mock).
 * Future:  Calls Gemini API to intelligently normalize ingredients
 *          (e.g., "2 bawang merah yg sdh dikupas" → "2 bawang merah (kupas)")
 *          and standardize step formatting.
 *
 * Integration point for Gemini:
 *   const prompt = `You are a recipe data normalizer for an Indonesian recipe platform.
 *     Clean up this recipe data into a standardized JSON format:
 *     ${JSON.stringify(rawRecipe)}
 *     Rules:
 *     - Fix ingredient formatting: quantity + unit + item name
 *     - Split compound steps into individual steps
 *     - Infer category from title and ingredients
 *     - Generate 3-5 relevant keywords
 *     - Estimate cooking time if missing
 *     Return valid JSON matching this schema: { title, ingredients[], steps[], ... }`;
 *   const response = await callGemini(prompt);
 *   return JSON.parse(response);
 */
export async function normalizeExternalRecipe(rawRecipe: Partial<Recipe>): Promise<Partial<Recipe>> {
  if (AI_PROVIDER === 'gemini' && GEMINI_API_KEY) {
    // Future: Call Gemini API for intelligent normalization
    // return await callGeminiNormalizer(rawRecipe);
  }

  // Mock: Basic cleanup
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

// ─── AI Recipe Assistant (Single Q&A) ────────────────────
/**
 * Answers a question about a specific recipe.
 * Returns a single Q&A pair — designed to be upgraded to chat later.
 *
 * Integration point for Gemini:
 *   const prompt = `You are "Rasaji AI", a friendly Indonesian cooking assistant.
 *     The user is looking at this recipe: "${recipe.title}"
 *     Ingredients: ${recipe.ingredients.join(', ')}
 *     Steps: ${recipe.steps.join('. ')}
 *
 *     User question: "${question}"
 *
 *     Answer in Bahasa Indonesia, casual and friendly.
 *     Use food emojis. Keep it concise (2-3 sentences max).`;
 *   const response = await callGemini(prompt);
 *   return { question, answer: response };
 */

export async function askRecipeAssistant(
  recipe: Recipe,
  question: string
): Promise<AiAssistantResponse> {
  const res = await fetch('/api/ai/ask-recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipeId: recipe.id,
      question,
      recipeContext: {
        title: recipe.title,
        ingredients: recipe.ingredients,
        tools: recipe.tools,
        steps: recipe.steps,
        tips: recipe.tips
      }
    })
  });
  
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to get AI response');
  }
  
  return data;
}

// ─── Gemini API Helper (future) ──────────────────────────
// async function callGemini(prompt: string): Promise<string> {
//   const response = await fetch(
//     `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
//     {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         contents: [{ parts: [{ text: prompt }] }],
//         generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
//       }),
//     }
//   );
//   const data = await response.json();
//   return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
// }
