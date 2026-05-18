import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// These functions mirror the frontend normalizer to keep it simple in a single script

function cleanRecipeTitle(title) {
  if (!title) return '';
  let cleaned = title.replace(/^[\d\s\.]*(?:Resep\s+)?/i, '').trim();
  return cleaned || title;
}

function cleanRecipeStep(step) {
  if (!step) return '';
  let cleaned = step;
  const regex = /^(?:(?:step|langkah)\s*\d+[\.\:\-]*\s*|[\d\.\-\s]+)+/i;
  cleaned = cleaned.replace(regex, '').trim();
  return cleaned || step;
}

function cleanIngredientText(ingredient) {
  if (!ingredient) return '';
  let cleaned = ingredient;
  cleaned = cleaned.replace(/^[•\-\*\s]+/, '');
  cleaned = cleaned.replace(/^\d+[\.\)]\s+/, '');
  return cleaned.trim() || ingredient;
}

function cleanTipsText(tip) {
  if (!tip) return '';
  let cleaned = tip;
  cleaned = cleaned.replace(/^[•\-\*\s]+/, '');
  cleaned = cleaned.replace(/^\d+[\.\)]\s+/, '');
  return cleaned.trim() || tip;
}

async function run() {
  console.log('Starting recipe normalization...');
  const recipes = await prisma.recipe.findMany();
  
  let updatedCount = 0;

  for (const recipe of recipes) {
    let changed = false;
    
    const newTitle = cleanRecipeTitle(recipe.title);
    if (newTitle !== recipe.title) changed = true;

    // Ingredients
    let newIngredients = recipe.ingredients;
    if (Array.isArray(recipe.ingredients)) {
      const cleaned = recipe.ingredients.map(cleanIngredientText).filter(Boolean);
      if (JSON.stringify(cleaned) !== JSON.stringify(recipe.ingredients)) {
        newIngredients = cleaned;
        changed = true;
      }
    } else if (typeof recipe.ingredients === 'string') {
      try {
        const parsed = JSON.parse(recipe.ingredients);
        if (Array.isArray(parsed)) {
          newIngredients = parsed.map(cleanIngredientText).filter(Boolean);
          changed = true;
        }
      } catch (e) {
        // String but not JSON array? Maybe split by newline
        newIngredients = recipe.ingredients.split('\n').map(cleanIngredientText).filter(Boolean);
        changed = true;
      }
    }

    // Tools
    let newTools = recipe.tools;
    if (Array.isArray(recipe.tools)) {
      const cleaned = recipe.tools.map(cleanIngredientText).filter(Boolean);
      if (JSON.stringify(cleaned) !== JSON.stringify(recipe.tools)) {
        newTools = cleaned;
        changed = true;
      }
    }

    // Steps
    let newSteps = recipe.steps;
    if (Array.isArray(recipe.steps)) {
      const cleaned = recipe.steps.map(cleanRecipeStep).filter(Boolean);
      if (JSON.stringify(cleaned) !== JSON.stringify(recipe.steps)) {
        newSteps = cleaned;
        changed = true;
      }
    } else if (typeof recipe.steps === 'string') {
      try {
        const parsed = JSON.parse(recipe.steps);
        if (Array.isArray(parsed)) {
          newSteps = parsed.map(cleanRecipeStep).filter(Boolean);
          changed = true;
        }
      } catch (e) {
        newSteps = recipe.steps.split('\n').map(cleanRecipeStep).filter(Boolean);
        changed = true;
      }
    }

    // Tips
    let newTips = recipe.tips;
    if (typeof recipe.tips === 'string') {
      const cleaned = recipe.tips.split('\n').map(cleanTipsText).filter(Boolean).join('\n');
      if (cleaned !== recipe.tips) {
        newTips = cleaned;
        changed = true;
      }
    }

    if (changed) {
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: {
          title: newTitle,
          ingredients: JSON.stringify(newIngredients),
          tools: newTools ? JSON.stringify(newTools) : null,
          steps: JSON.stringify(newSteps),
          tips: newTips
        }
      });
      updatedCount++;
      console.log(`Cleaned: ${recipe.title} -> ${newTitle}`);
    }
  }

  console.log(`\nDone! Cleaned ${updatedCount} out of ${recipes.length} recipes.`);
  await prisma.$disconnect();
}

run().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
