import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Direct SQLite connection for schema migration
const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(dbPath);

console.log('Starting platform migration...');

// Step 1: Rename columns and add new ones
const migrations = [
  // Rename 'url' to 'sourceUrl'
  `ALTER TABLE Recipe RENAME COLUMN url TO sourceUrl;`,
  // Rename 'imageUrl' to 'image'
  `ALTER TABLE Recipe RENAME COLUMN imageUrl TO image;`,
  // Rename 'instructions' to 'steps'
  `ALTER TABLE Recipe RENAME COLUMN instructions TO steps;`,
  // Add new columns
  `ALTER TABLE Recipe ADD COLUMN slug TEXT;`,
  `ALTER TABLE Recipe ADD COLUMN category TEXT DEFAULT 'Lainnya';`,
  `ALTER TABLE Recipe ADD COLUMN shortDescription TEXT;`,
  `ALTER TABLE Recipe ADD COLUMN fullDescription TEXT;`,
  `ALTER TABLE Recipe ADD COLUMN tools TEXT;`,
  `ALTER TABLE Recipe ADD COLUMN tips TEXT;`,
  `ALTER TABLE Recipe ADD COLUMN alternativeIngredients TEXT;`,
  `ALTER TABLE Recipe ADD COLUMN difficulty TEXT DEFAULT 'Sedang';`,
  `ALTER TABLE Recipe ADD COLUMN caloriesEstimate INTEGER DEFAULT 0;`,
  `ALTER TABLE Recipe ADD COLUMN keywords TEXT;`,
  `ALTER TABLE Recipe ADD COLUMN sourceType TEXT DEFAULT 'external';`,
  `ALTER TABLE Recipe ADD COLUMN sourceName TEXT;`,
  `ALTER TABLE Recipe ADD COLUMN status TEXT DEFAULT 'scraped';`,
  `ALTER TABLE Recipe ADD COLUMN isVerified INTEGER DEFAULT 0;`,
  `ALTER TABLE Recipe ADD COLUMN likes INTEGER DEFAULT 0;`,
  `ALTER TABLE Recipe ADD COLUMN bookmarks INTEGER DEFAULT 0;`,
  `ALTER TABLE Recipe ADD COLUMN views INTEGER DEFAULT 0;`,
];

for (const sql of migrations) {
  try {
    db.exec(sql);
    console.log(`  OK: ${sql.substring(0, 60)}...`);
  } catch (err) {
    // Column may already exist
    if (err.message.includes('duplicate column') || err.message.includes('already exists')) {
      console.log(`  SKIP (already exists): ${sql.substring(0, 60)}...`);
    } else {
      console.error(`  FAIL: ${sql.substring(0, 60)}...`, err.message);
    }
  }
}

// Step 2: Generate slugs for all existing recipes
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 80);
}

const recipes = db.prepare('SELECT id, title FROM Recipe WHERE slug IS NULL').all();
console.log(`\nGenerating slugs for ${recipes.length} recipes...`);

const updateSlug = db.prepare('UPDATE Recipe SET slug = ? WHERE id = ?');
const slugCounts = {};

for (const recipe of recipes) {
  let baseSlug = slugify(recipe.title);
  if (!baseSlug) baseSlug = 'resep';
  
  // Handle duplicates by appending a counter
  if (slugCounts[baseSlug]) {
    slugCounts[baseSlug]++;
    baseSlug = `${baseSlug}-${slugCounts[baseSlug]}`;
  } else {
    slugCounts[baseSlug] = 1;
  }
  
  updateSlug.run(baseSlug, recipe.id);
}
console.log('Slugs generated.');

// Step 3: Generate categories from tags/title for scraped recipes
function inferCategory(title, tagsStr) {
  const tags = (() => { try { return JSON.parse(tagsStr || '[]'); } catch { return []; } })();
  const allText = [...tags.map(t => t.toLowerCase()), title.toLowerCase()].join(' ');
  
  if (allText.includes('ayam')) return 'Ayam';
  if (allText.includes('daging') || allText.includes('sapi') || allText.includes('rendang')) return 'Daging';
  if (allText.includes('ikan') || allText.includes('lele') || allText.includes('udang')) return 'Ikan';
  if (allText.includes('telur')) return 'Telur';
  if (allText.includes('tahu') || allText.includes('tempe')) return 'Tahu & Tempe';
  if (allText.includes('sayur') || allText.includes('gado') || allText.includes('cap cay') || allText.includes('capcay')) return 'Sayur';
  if (allText.includes('nasi') || allText.includes('uduk')) return 'Nasi';
  if (allText.includes('mie') || allText.includes('mi ') || allText.includes('bakso')) return 'Mie';
  if (allText.includes('sambal')) return 'Sambal';
  return 'Lainnya';
}

const allRecipes = db.prepare('SELECT id, title, tags, ingredients FROM Recipe').all();
const updateCategory = db.prepare('UPDATE Recipe SET category = ?, shortDescription = ? WHERE id = ?');

console.log(`\nInferring categories for ${allRecipes.length} recipes...`);
for (const r of allRecipes) {
  const category = inferCategory(r.title, r.tags);
  // Build short description from ingredients
  let desc = 'Resep otentik Indonesia.';
  try {
    const ings = JSON.parse(r.ingredients || '[]');
    if (ings.length > 0) {
      desc = `Bahan utama: ${ings.slice(0, 3).join(', ')}${ings.length > 3 ? '...' : ''}`;
    }
  } catch {}
  updateCategory.run(category, desc, r.id);
}

// Step 4: Set sourceName for scraped recipes from Cookpad
db.exec(`UPDATE Recipe SET sourceName = 'Cookpad' WHERE sourceUrl LIKE '%cookpad%'`);

console.log('\n=== Migration complete! ===');
console.log(`Total recipes: ${db.prepare('SELECT COUNT(*) as c FROM Recipe').get().c}`);
console.log(`With slugs: ${db.prepare("SELECT COUNT(*) as c FROM Recipe WHERE slug IS NOT NULL AND slug != ''").get().c}`);

db.close();
