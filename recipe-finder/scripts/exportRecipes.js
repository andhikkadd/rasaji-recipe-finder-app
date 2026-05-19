import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const exportPath = path.join(__dirname, '..', 'prisma', 'local_recipes_export.json');

const prisma = new PrismaClient();

async function main() {
  console.log('Exporting recipes from local database...');
  
  // Exclude rejected recipes
  const recipes = await prisma.recipe.findMany({
    where: {
      status: {
        not: 'rejected'
      }
    }
  });
  
  console.log(`Found ${recipes.length} non-rejected recipes.`);
  
  fs.writeFileSync(exportPath, JSON.stringify(recipes, null, 2));
  console.log(`Successfully exported ${recipes.length} recipes to ${exportPath}`);
}

main()
  .catch((e) => {
    console.error('Export failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
