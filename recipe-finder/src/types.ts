// ─── Recipe Status & Source Types ─────────────────────────
export type RecipeStatus = 'verified' | 'scraped' | 'cached_unverified' | 'rejected';
export type SourceType = 'internal' | 'external';

// ─── Main Recipe Interface ────────────────────────────────
export interface Recipe {
  id: string;
  slug: string;
  title: string;
  image?: string;
  category: string;
  shortDescription?: string;
  fullDescription?: string;
  ingredients: string[];
  tools?: string[];
  steps: string[];
  tips?: string;
  alternativeIngredients?: string;
  prepTime?: string;
  cookTime?: string;
  cookingTime?: string;
  difficulty: string;
  servings: string | number;
  caloriesEstimate: number;
  tags: string[];
  keywords?: string[];
  sourceType: SourceType;
  sourceUrl?: string;
  sourceName?: string;
  status: RecipeStatus;
  isVerified: boolean;
  likes: number;
  bookmarks: number;
  views: number;
  createdAt?: string;
  updatedAt?: string;

  // Frontend-only: flag for external mock results not yet in DB
  _isExternalMock?: boolean;
}

// ─── Search Filters ───────────────────────────────────────
export interface SearchFilters {
  category?: string;
  status?: RecipeStatus;
}

// ─── AI Types ─────────────────────────────────────────────
export interface AiRecipe {
  id: string;
  name: string;
  description: string;
  ingredientsUsed: string[];
  missingIngredients: string[];
  time: string;
  difficulty: string;
  steps: string[];
}

export interface AiAssistantResponse {
  question: string;
  answer: string;
}
