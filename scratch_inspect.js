import fs from 'fs';
import path from 'path';

const importPath = './prisma/local_recipes_export.json';
const data = JSON.parse(fs.readFileSync(importPath, 'utf8'));

console.log(`Total recipes loaded: ${data.length}`);

// Count by category
const categories = {};
const images = {};
const sampleByCat = {};

for (const r of data) {
  categories[r.category] = (categories[r.category] || 0) + 1;
  images[r.image] = (images[r.image] || 0) + 1;
  if (!sampleByCat[r.category]) {
    sampleByCat[r.category] = [];
  }
  if (sampleByCat[r.category].length < 3) {
    sampleByCat[r.category].push({ title: r.title, image: r.image, desc: r.shortDescription });
  }
}

console.log('\nCategories:');
console.log(JSON.stringify(categories, null, 2));

console.log('\nTop 15 Images Used:');
const sortedImages = Object.entries(images).sort((a, b) => b[1] - a[1]).slice(0, 15);
console.log(sortedImages);

console.log('\nSample recipes per category:');
console.log(JSON.stringify(sampleByCat, null, 2));
