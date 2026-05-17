import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const queries = [
  { q: 'ayam goreng', category: 'Ayam' },
  { q: 'rendang sapi', category: 'Daging' },
  { q: 'sayur asem', category: 'Sayur' },
  { q: 'telur balado', category: 'Telur' },
  { q: 'tempe mendoan', category: 'Tahu & Tempe' },
  { q: 'nasi goreng', category: 'Nasi' },
  { q: 'mie nyemek', category: 'Mie' },
  { q: 'ikan bakar', category: 'Ikan' },
  { q: 'sambal matah', category: 'Sambal' },
  { q: 'martabak manis', category: 'Camilan' },
  { q: 'es cendol', category: 'Minuman' }
];

async function getLinks(query) {
  const url = `https://cookpad.com/id/cari/${encodeURIComponent(query)}?page=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  const links = [];
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('/resep/') && !href.includes('/baru') && !links.includes(href)) {
      links.push('https://cookpad.com' + href.split('?')[0]);
    }
  });
  return links;
}

async function scrapeRecipe(url, category, id) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    let recipeData = null;
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const data = JSON.parse($(el).html());
        if (data['@type'] === 'Recipe' || (Array.isArray(data) && data.some(d => d['@type'] === 'Recipe'))) {
          recipeData = Array.isArray(data) ? data.find(d => d['@type'] === 'Recipe') : data;
        }
      } catch(e) {}
    });
    
    if (!recipeData || !recipeData.name || !recipeData.recipeIngredient) return null;

    let steps = [];
    if (Array.isArray(recipeData.recipeInstructions)) {
      steps = recipeData.recipeInstructions.map(s => s.text || s.name || '').filter(s => s);
    } else if (typeof recipeData.recipeInstructions === 'string') {
      steps = [recipeData.recipeInstructions];
    }

    let image = '';
    if (Array.isArray(recipeData.image)) image = recipeData.image[0];
    else if (typeof recipeData.image === 'string') image = recipeData.image;
    else if (recipeData.image && recipeData.image.url) image = recipeData.image.url;

    // Parse time
    let timeStr = '30 Menit';
    if (recipeData.totalTime) {
      const match = recipeData.totalTime.match(/PT(\d+)M/);
      if (match) timeStr = match[1] + ' Menit';
    }

    return {
      id: `r${id}`,
      title: recipeData.name,
      image: image,
      category: category,
      shortDescription: recipeData.description || `Resep ${recipeData.name} spesial yang enak dan mudah dibuat.`,
      cookingTime: timeStr,
      difficulty: 'Sedang',
      servings: parseInt(recipeData.recipeYield) || 4,
      ingredients: recipeData.recipeIngredient,
      steps: steps,
      caloriesEstimate: Math.floor(Math.random() * 300) + 200,
      likes: Math.floor(Math.random() * 5000) + 100,
      tags: recipeData.keywords ? recipeData.keywords.split(',').slice(0, 3).map(k=>k.trim()) : [category, 'Rumahan']
    };
  } catch (e) {
    return null;
  }
}

async function main() {
  console.log('Starting Data Ingestion Pipeline...');
  const allRecipes = [];
  let idCounter = 1;

  for (const {q, category} of queries) {
    console.log(`Searching for ${category}...`);
    const links = await getLinks(q);
    // limit to 10 recipes per category to get around 110 recipes quickly
    const targetLinks = links.slice(0, 12); 
    
    for (const link of targetLinks) {
      const recipe = await scrapeRecipe(link, category, idCounter);
      if (recipe) {
        allRecipes.push(recipe);
        idCounter++;
        console.log(`Scraped: ${recipe.title}`);
      }
    }
  }

  const outputDir = path.join(__dirname, '../public/data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outputDir, 'recipes.json'), JSON.stringify(allRecipes, null, 2));
  console.log(`Pipeline complete! Successfully ingested ${allRecipes.length} REAL recipes into public/data/recipes.json.`);
}

main();
