export interface Recipe {
  id: string;
  title: string;
  image?: string;
  category: string;
  shortDescription: string;
  cookingTime: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  servings: number;
  ingredients: string[];
  steps: string[];
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
