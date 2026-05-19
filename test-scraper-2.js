import * as cheerio from 'cheerio';

async function test() {
  const url = 'https://cookpad.com/id/cari/rendang%20sapi';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const links = [];
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('/resep/')) {
      links.push(href);
    }
  });
  console.log('Total a tags with resep:', links.length);
  console.log('First 5:', links.slice(0, 5));
}
test();
