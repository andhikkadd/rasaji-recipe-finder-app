export interface Recipe {
  id: string;
  title: string;
  url?: string;
  image?: string;       // kept for backward compatibility
  imageUrl?: string;    // from API
  category: string;
  shortDescription: string;
  cookingTime: string;
  prepTime?: string;
  cookTime?: string;
  difficulty: string;
  servings: number | string;
  ingredients: string[];
  steps: string[];         // kept for backward compatibility
  instructions?: string[]; // from API
  caloriesEstimate: number;
  tags: string[];
  likes: number;
  tips?: string;
  alternativeIngredients?: string;
}

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
