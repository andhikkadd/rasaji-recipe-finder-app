import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function main() {
  const recipes = await prisma.recipe.findMany({
    select: { tags: true, keywords: true }
  });
  
  const allTags = new Set();
  for (const r of recipes) {
    try {
      const tags = JSON.parse(r.tags || '[]');
      tags.forEach(t => allTags.add(t));
    } catch {}
    try {
      const kws = JSON.parse(r.keywords || '[]');
      kws.forEach(k => allTags.add(k));
    } catch {}
  }
  
  const sortedTags = Array.from(allTags).sort();
  fs.writeFileSync('scratch_all_tags.txt', sortedTags.join('\n'));
  console.log(`Successfully dumped ${sortedTags.length} tags to scratch_all_tags.txt`);
}

main().finally(() => prisma.$disconnect());
