import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const importPath = path.join(__dirname, '..', 'prisma', 'local_recipes_export.json');

// Connects to target database dynamically via DATABASE_URL env
const prisma = new PrismaClient();

async function main() {
  console.log('Starting recipe import script...');
  
  if (!fs.existsSync(importPath)) {
    console.error(`Error: Export file not found at ${importPath}`);
    console.error('Please run "node scripts/exportRecipes.js" first to export your local data.');
    process.exit(1);
  }
  
  const rawData = fs.readFileSync(importPath, 'utf8');
  const recipes = JSON.parse(rawData);
  
  console.log(`Loaded ${recipes.length} recipes from export file.`);
  let upsertedCount = 0;
  
  for (const r of recipes) {
    if (r.status === 'rejected') {
      console.log(`  [SKIP] Skipping rejected recipe: ${r.title}`);
      continue;
    }
    
    try {
      await prisma.recipe.upsert({
        where: { slug: r.slug },
        update: {
          title: r.title,
          image: r.image || null,
          category: r.category || 'Lainnya',
          shortDescription: r.shortDescription || null,
          fullDescription: r.fullDescription || null,
          ingredients: r.ingredients,
          tools: r.tools || null,
          steps: r.steps,
          tips: r.tips || null,
          alternativeIngredients: r.alternativeIngredients || null,
          prepTime: r.prepTime || null,
          cookTime: r.cookTime || null,
          cookingTime: r.cookingTime || null,
          difficulty: r.difficulty || 'Sedang',
          servings: r.servings ? String(r.servings) : null,
          caloriesEstimate: r.caloriesEstimate || 0,
          tags: r.tags,
          keywords: r.keywords || null,
          sourceType: r.sourceType || 'internal',
          sourceUrl: r.sourceUrl || null,
          sourceName: r.sourceName || null,
          status: r.status || 'verified',
          isVerified: Boolean(r.isVerified),
          likes: r.likes || 0,
          bookmarks: r.bookmarks || 0,
          views: r.views || 0,
          reviewStatus: r.reviewStatus || null,
          reviewNotes: r.reviewNotes || null,
          reviewedAt: r.reviewedAt ? new Date(r.reviewedAt) : null,
          cachedAt: r.cachedAt ? new Date(r.cachedAt) : null,
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          updatedAt: new Date(),
        },
        create: {
          slug: r.slug,
          title: r.title,
          image: r.image || null,
          category: r.category || 'Lainnya',
          shortDescription: r.shortDescription || null,
          fullDescription: r.fullDescription || null,
          ingredients: r.ingredients,
          tools: r.tools || null,
          steps: r.steps,
          tips: r.tips || null,
          alternativeIngredients: r.alternativeIngredients || null,
          prepTime: r.prepTime || null,
          cookTime: r.cookTime || null,
          cookingTime: r.cookingTime || null,
          difficulty: r.difficulty || 'Sedang',
          servings: r.servings ? String(r.servings) : null,
          caloriesEstimate: r.caloriesEstimate || 0,
          tags: r.tags,
          keywords: r.keywords || null,
          sourceType: r.sourceType || 'internal',
          sourceUrl: r.sourceUrl || null,
          sourceName: r.sourceName || null,
          status: r.status || 'verified',
          isVerified: Boolean(r.isVerified),
          likes: r.likes || 0,
          bookmarks: r.bookmarks || 0,
          views: r.views || 0,
          reviewStatus: r.reviewStatus || null,
          reviewNotes: r.reviewNotes || null,
          reviewedAt: r.reviewedAt ? new Date(r.reviewedAt) : null,
          cachedAt: r.cachedAt ? new Date(r.cachedAt) : null,
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          updatedAt: new Date(),
        }
      });
      console.log(`  [UPSERTED] ${r.title}`);
      upsertedCount++;
    } catch (err) {
      console.error(`  [FAIL] Failed to import recipe: ${r.title}`, err.message);
    }
  }
  
  console.log(`\nImport complete! Successfully upserted ${upsertedCount} recipes.`);
}

main()
  .catch((e) => {
    console.error('Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
