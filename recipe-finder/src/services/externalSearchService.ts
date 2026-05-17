import type { Recipe } from '../types';

/**
 * Mock external search service.
 * Simulates fetching recipes from external sites like Cookpad, ResepKoki, etc.
 * Returns fake external results that are NOT yet in the Racikin database.
 * These should be blended inline with internal search results.
 *
 * In a real implementation, this would call a backend scraping/search API.
 */

interface ExternalMockRecipe {
  title: string;
  image: string;
  category: string;
  ingredients: string[];
  steps: string[];
  tags: string[];
  cookingTime: string;
  difficulty: string;
  servings: string;
  sourceUrl: string;
  sourceName: string;
}

const MOCK_EXTERNAL_DB: Record<string, ExternalMockRecipe[]> = {
  mie: [
    {
      title: 'Mie Ayam Bakso Spesial',
      image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'Mie',
      ingredients: ['200g mie telur', '150g ayam cincang', '4 butir bakso sapi', 'Sawi hijau', 'Bawang putih, kecap asin, minyak wijen'],
      steps: ['Rebus mie hingga al dente', 'Tumis ayam cincang dengan bumbu', 'Sajikan mie dengan topping ayam dan bakso'],
      tags: ['Mie', 'Bakso', 'Ayam'],
      cookingTime: '30 Menit',
      difficulty: 'Sedang',
      servings: '2',
      sourceUrl: 'https://resepkoki.id/resep/mie-ayam-bakso',
      sourceName: 'ResepKoki',
    },
    {
      title: 'Mie Aceh Goreng Seafood',
      image: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'Mie',
      ingredients: ['200g mie kuning tebal', '100g udang kupas', '50g cumi potong', 'Bumbu Aceh: kunyit, jintan, lada, ketumbar', 'Tomat, daun bawang'],
      steps: ['Haluskan bumbu Aceh', 'Tumis bumbu, masukkan seafood', 'Masukkan mie, aduk rata dengan api besar'],
      tags: ['Mie', 'Pedas', 'Seafood', 'Aceh'],
      cookingTime: '25 Menit',
      difficulty: 'Sedang',
      servings: '2',
      sourceUrl: 'https://cookpad.com/id/resep/mie-aceh-goreng',
      sourceName: 'Cookpad',
    },
  ],
  ayam: [
    {
      title: 'Ayam Geprek Sambal Bawang',
      image: 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'Ayam',
      ingredients: ['2 potong dada ayam', 'Tepung terigu & maizena', '10 cabe rawit, 5 bawang putih', 'Garam, gula, terasi'],
      steps: ['Goreng ayam berlapis tepung hingga crispy', 'Ulek sambal bawang', 'Geprek ayam dan siram sambal'],
      tags: ['Ayam', 'Pedas', 'Geprek'],
      cookingTime: '30 Menit',
      difficulty: 'Mudah',
      servings: '2',
      sourceUrl: 'https://masakapahariini.com/resep/ayam-geprek',
      sourceName: 'MasakApaHariIni',
    },
  ],
  rendang: [
    {
      title: 'Rendang Jengkol Empuk',
      image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'Daging',
      ingredients: ['500g jengkol (rebus hingga empuk)', '500ml santan kental', 'Bumbu rendang lengkap', 'Daun kunyit, serai, daun jeruk'],
      steps: ['Rebus jengkol hingga tidak bau', 'Masak bumbu rendang dengan santan', 'Masukkan jengkol, masak hingga kering'],
      tags: ['Rendang', 'Jengkol', 'Tradisional'],
      cookingTime: '2 Jam',
      difficulty: 'Sedang',
      servings: '6',
      sourceUrl: 'https://resepkoki.id/resep/rendang-jengkol',
      sourceName: 'ResepKoki',
    },
  ],
  nasi: [
    {
      title: 'Nasi Tutug Oncom Khas Tasik',
      image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800',
      category: 'Nasi',
      ingredients: ['3 cup nasi putih hangat', '200g oncom merah', 'Cabe rawit, bawang merah, bawang putih', 'Daun bawang, garam'],
      steps: ['Kukus oncom, hancurkan', 'Tumis bumbu, masukkan oncom', 'Campurkan dengan nasi hangat, aduk rata'],
      tags: ['Nasi', 'Tradisional', 'Sunda'],
      cookingTime: '20 Menit',
      difficulty: 'Mudah',
      servings: '4',
      sourceUrl: 'https://cookpad.com/id/resep/nasi-tutug-oncom',
      sourceName: 'Cookpad',
    },
  ],
};

/**
 * Search for external recipes (mock).
 * Returns Recipe[] with _isExternalMock = true, so the frontend knows
 * NOT to persist these unless the user opens them.
 */
export async function searchExternalRecipes(query: string): Promise<Recipe[]> {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 300));

  const q = query.toLowerCase().trim();
  const results: Recipe[] = [];

  for (const [keyword, recipes] of Object.entries(MOCK_EXTERNAL_DB)) {
    if (q.includes(keyword) || keyword.includes(q)) {
      for (const mock of recipes) {
        results.push({
          id: `ext-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          slug: mock.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
          title: mock.title,
          image: mock.image,
          category: mock.category,
          shortDescription: `Bahan utama: ${mock.ingredients.slice(0, 3).join(', ')}...`,
          ingredients: mock.ingredients,
          steps: mock.steps,
          tags: mock.tags,
          cookingTime: mock.cookingTime,
          difficulty: mock.difficulty,
          servings: mock.servings,
          caloriesEstimate: 0,
          sourceType: 'external',
          sourceUrl: mock.sourceUrl,
          sourceName: mock.sourceName,
          status: 'cached_unverified',
          isVerified: false,
          likes: 0,
          bookmarks: 0,
          views: 0,
          _isExternalMock: true,
        });
      }
    }
  }

  return results;
}
