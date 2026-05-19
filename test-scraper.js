import * as cheerio from 'cheerio';

async function test() {
  const recipeRes = await fetch('https://cookpad.com/id/resep/25779607', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const recipeHtml = await recipeRes.text();
  const $r = cheerio.load(recipeHtml);
  
  let recipeData = null;
  $r('script[type="application/ld+json"]').each((i, el) => {
    try {
      const data = JSON.parse($r(el).html());
      if (data['@type'] === 'Recipe' || (Array.isArray(data) && data.some(d => d['@type'] === 'Recipe'))) {
        recipeData = Array.isArray(data) ? data.find(d => d['@type'] === 'Recipe') : data;
      }
    } catch(e) {}
  });
  
  if (recipeData) {
    console.log('Title:', recipeData.name);
    console.log('Ingredients:', recipeData.recipeIngredient);
    console.log('Steps:', recipeData.recipeInstructions.map(s => s.text));
  } else {
    console.log('No ld+json recipe found');
  }
}
test();
