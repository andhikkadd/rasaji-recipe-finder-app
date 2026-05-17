export interface Recipe {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string;
  strYoutube: string;
  [key: string]: string | null; // For dynamic ingredients and measures
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
