import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({});

async function scrapeRecipe(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);

    // This selector logic is a best-effort example for Cookpad and similar sites
    let title = $('h1').first().text().trim() || $('title').text().replace(/Resep | - Cookpad/gi, '').trim();
    // Deduplicate titles that got doubled from nested elements
    const halfLen = Math.floor(title.length / 2);
    const firstHalf = title.substring(0, halfLen).trim();
    const secondHalf = title.substring(halfLen).trim();
    if (firstHalf && firstHalf === secondHalf) title = firstHalf;
    if (!title) return null;

    // Try to find image
    let imageUrl = $('picture img').attr('src') || $('img').first().attr('src');
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = null; // Ignore relative or base64 images if they are weird, or fix them
    }

    // Ingredients
    const ingredients = [];
    $('.ingredient-list li, .ingredients li').each((i, el) => {
      ingredients.push($(el).text().trim());
    });
    // Fallback if empty
    if (ingredients.length === 0) {
      $('div[itemprop="recipeIngredient"]').each((i, el) => {
        ingredients.push($(el).text().trim());
      });
    }

    // Instructions
    const instructions = [];
    $('.step, .recipe-steps li').each((i, el) => {
      instructions.push($(el).text().replace(/\n/g, ' ').trim());
    });
    // Fallback
    if (instructions.length === 0) {
      $('div[itemprop="recipeInstructions"] p').each((i, el) => {
        instructions.push($(el).text().trim());
      });
    }

    // Tags / Keywords
    const tags = [];
    $('a[href*="/cari/"]').each((i, el) => {
      tags.push($(el).text().trim());
    });

    const prepTime = $('span[itemprop="prepTime"]').text().trim() || null;
    const cookTime = $('span[itemprop="cookTime"]').text().trim() || null;
    const servings = $('span[itemprop="recipeYield"]').text().trim() || null;

    return {
      title,
      url,
      imageUrl,
      prepTime,
      cookTime,
      servings,
      ingredients: JSON.stringify(ingredients),
      instructions: JSON.stringify(instructions),
      tags: JSON.stringify([...new Set(tags)]), // deduplicate
    };
  } catch (err) {
    console.error(`Failed to scrape ${url}`, err);
    return null;
  }
}

async function scrapeSearchPage(searchQuery) {
  const searchUrl = `https://cookpad.com/id/cari/${encodeURIComponent(searchQuery)}`;
  console.log(`\n--- Searching: "${searchQuery}" at ${searchUrl}`);
  
  try {
    const res = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const links = [];
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('/resep/') && !href.endsWith('/resep/baru')) {
        const fullUrl = href.startsWith('http') ? href : `https://cookpad.com${href}`;
        links.push(fullUrl);
      }
    });

    const uniqueLinks = [...new Set(links)].slice(0, 15);
    console.log(`Found ${uniqueLinks.length} unique recipe links.`);
    let saved = 0;

    for (const link of uniqueLinks) {
      const exists = await prisma.recipe.findUnique({ where: { url: link } });
      if (exists) {
        console.log(`  [SKIP] Already in DB: ${link}`);
        continue;
      }

      const recipeData = await scrapeRecipe(link);
      if (recipeData && recipeData.title && recipeData.ingredients !== '[]') {
        // Inject the search query as a tag if no tags were scraped
        const existingTags = JSON.parse(recipeData.tags);
        if (existingTags.length === 0) {
          recipeData.tags = JSON.stringify([searchQuery]);
        }
        await prisma.recipe.create({ data: recipeData });
        console.log(`  [SAVED] ${recipeData.title}`);
        saved++;
      } else {
        console.log(`  [FAIL] Could not parse: ${link}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    return saved;
  } catch (err) {
    console.error(`Error searching "${searchQuery}":`, err.message);
    return 0;
  }
}

async function runScraper() {
  const searchQueries = [
    'nasi goreng', 'soto ayam', 'rendang sapi', 'gado gado',
    'bakso', 'mie goreng', 'ayam goreng', 'sate ayam',
    'opor ayam', 'gulai kambing', 'pecel lele', 'tempe goreng',
    'sambal goreng ati', 'rawon', 'pempek', 'nasi uduk',
    'sop buntut', 'tahu goreng', 'ikan bakar', 'cap cay'
  ];

  let totalSaved = 0;
  for (const query of searchQueries) {
    const saved = await scrapeSearchPage(query);
    totalSaved += saved;
    console.log(`--- Saved ${saved} recipes for "${query}". Total so far: ${totalSaved}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log(`\n=== DONE. Total recipes saved: ${totalSaved} ===`);
  await prisma.$disconnect();
}

runScraper();
