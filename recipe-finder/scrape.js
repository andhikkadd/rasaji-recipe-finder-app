import * as cheerio from 'cheerio';

async function scrape() {
  try {
    const res = await fetch('https://resepkoki.id/resep/');
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const recipes = [];
    $('.jeg_post').each((i, el) => {
      const title = $(el).find('.jeg_post_title a').text().trim();
      const link = $(el).find('.jeg_post_title a').attr('href');
      if(title && link) {
        recipes.push({ title, link });
      }
    });
    console.log(`Found ${recipes.length} recipes.`);
    console.log(recipes.slice(0, 2));
  } catch(e) {
    console.error(e);
  }
}
scrape();
