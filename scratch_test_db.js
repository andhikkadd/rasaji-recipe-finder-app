import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Testing connection to PostgreSQL database...');
  const start = Date.now();
  try {
    const count = await prisma.recipe.count();
    console.log(`Database query succeeded! Total recipes in DB: ${count}`);
    console.log(`Time taken: ${Date.now() - start}ms`);
  } catch (err) {
    console.error('Database connection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
