import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const prisma = new PrismaClient({});

app.use(express.json());

// ─── Helpers ──────────────────────────────────────────────
function parseJsonField(val) {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
}

function formatRecipe(r) {
  return {
    ...r,
    ingredients: parseJsonField(r.ingredients),
    steps: parseJsonField(r.steps),
    tags: parseJsonField(r.tags),
    keywords: parseJsonField(r.keywords),
    tools: parseJsonField(r.tools),
  };
}

function calculateRelevance(recipe, query) {
  const q = query.toLowerCase();
  let score = 0;

  // Title scoring
  const title = (recipe.title || '').toLowerCase();
  if (title === q) score += 100;
  else if (title.startsWith(q)) score += 70;
  else if (title.includes(q)) score += 50;

  // Category scoring
  const category = (recipe.category || '').toLowerCase();
  if (category === q || category.includes(q)) score += 30;

  // Tags scoring
  const tags = parseJsonField(recipe.tags);
  for (const tag of tags) {
    if (tag.toLowerCase().includes(q)) { score += 20; break; }
  }

  // Keywords scoring
  const keywords = parseJsonField(recipe.keywords);
  for (const kw of keywords) {
    if (kw.toLowerCase().includes(q)) { score += 15; break; }
  }

  // Ingredients scoring
  const ingredients = parseJsonField(recipe.ingredients);
  for (const ing of ingredients) {
    if (ing.toLowerCase().includes(q)) { score += 10; break; }
  }

  // Verified bonus
  if (recipe.isVerified) score += 25;

  // Popularity micro-bonus
  score += Math.min((recipe.views || 0) / 100, 5);
  score += Math.min((recipe.likes || 0) / 50, 5);

  return score;
}

// ─── Search endpoint (relevance-scored) ───────────────────
app.get('/api/recipes/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const category = req.query.category;
    const status = req.query.status;

    if (!q && !category) {
      return res.json([]);
    }

    const where = {
      AND: [
        { status: { not: 'rejected' } },
      ]
    };

    if (status) {
      where.AND.push({ status });
    }

    if (category) {
      where.AND.push({ category });
    }

    if (q) {
      where.AND.push({
        OR: [
          { title: { contains: q } },
          { category: { contains: q } },
          { tags: { contains: q } },
          { keywords: { contains: q } },
          { ingredients: { contains: q } },
          { shortDescription: { contains: q } },
        ]
      });
    }

    const recipes = await prisma.recipe.findMany({ where, take: 100 });

    // Score and sort by relevance
    const scored = recipes
      .map(r => ({ ...r, _score: q ? calculateRelevance(r, q) : 0 }))
      .filter(r => !q || r._score > 0)
      .sort((a, b) => b._score - a._score);

    res.json(scored.map(r => {
      const { _score, ...recipe } = r;
      return formatRecipe(recipe);
    }));
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// ─── Popular recipes ──────────────────────────────────────
app.get('/api/recipes/popular', async (req, res) => {
  try {
    const recipes = await prisma.recipe.findMany({
      where: { status: { not: 'rejected' } },
      orderBy: [{ likes: 'desc' }, { views: 'desc' }],
      take: 50,
    });
    res.json(recipes.map(formatRecipe));
  } catch (error) {
    console.error('Popular error:', error);
    res.status(500).json({ error: 'Failed to fetch popular recipes' });
  }
});

// ─── Latest recipes ───────────────────────────────────────
app.get('/api/recipes/latest', async (req, res) => {
  try {
    const recipes = await prisma.recipe.findMany({
      where: { status: { not: 'rejected' } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(recipes.map(formatRecipe));
  } catch (error) {
    console.error('Latest error:', error);
    res.status(500).json({ error: 'Failed to fetch latest recipes' });
  }
});

// ─── Recipes by category ─────────────────────────────────
app.get('/api/recipes/category/:category', async (req, res) => {
  try {
    const recipes = await prisma.recipe.findMany({
      where: {
        category: req.params.category,
        status: { not: 'rejected' },
      },
      orderBy: [{ isVerified: 'desc' }, { likes: 'desc' }],
      take: 50,
    });
    res.json(recipes.map(formatRecipe));
  } catch (error) {
    console.error('Category error:', error);
    res.status(500).json({ error: 'Failed to fetch by category' });
  }
});

// ─── Get by slug ──────────────────────────────────────────
app.get('/api/recipes/slug/:slug', async (req, res) => {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { slug: req.params.slug },
    });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(formatRecipe(recipe));
  } catch (error) {
    console.error('Slug error:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// ─── Get by ID ────────────────────────────────────────────
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: req.params.id },
    });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(formatRecipe(recipe));
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// ─── Toggle like ──────────────────────────────────────────
app.post('/api/recipes/:id/like', async (req, res) => {
  try {
    const { action } = req.body; // 'like' or 'unlike'
    const recipe = await prisma.recipe.update({
      where: { id: req.params.id },
      data: { likes: { increment: action === 'unlike' ? -1 : 1 } },
    });
    res.json({ likes: recipe.likes });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// ─── Toggle bookmark ──────────────────────────────────────
app.post('/api/recipes/:id/bookmark', async (req, res) => {
  try {
    const { action } = req.body; // 'bookmark' or 'unbookmark'
    const recipe = await prisma.recipe.update({
      where: { id: req.params.id },
      data: { bookmarks: { increment: action === 'unbookmark' ? -1 : 1 } },
    });
    res.json({ bookmarks: recipe.bookmarks });
  } catch (error) {
    console.error('Bookmark error:', error);
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
});

// ─── Increment view ───────────────────────────────────────
app.post('/api/recipes/:id/view', async (req, res) => {
  try {
    const recipe = await prisma.recipe.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
    });
    res.json({ views: recipe.views });
  } catch (error) {
    console.error('View error:', error);
    res.status(500).json({ error: 'Failed to increment view' });
  }
});

// ─── Cache external recipe ────────────────────────────────
app.post('/api/recipes/cache-external', async (req, res) => {
  try {
    const data = req.body;
    // Generate slug from title
    const slug = (data.title || 'resep')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80) + '-' + Date.now();

    const recipe = await prisma.recipe.create({
      data: {
        slug,
        title: data.title,
        image: data.image || null,
        category: data.category || 'Lainnya',
        shortDescription: data.shortDescription || null,
        ingredients: JSON.stringify(data.ingredients || []),
        steps: JSON.stringify(data.steps || []),
        tags: JSON.stringify(data.tags || []),
        keywords: JSON.stringify(data.keywords || []),
        tools: data.tools ? JSON.stringify(data.tools) : null,
        tips: data.tips || null,
        cookingTime: data.cookingTime || null,
        difficulty: data.difficulty || 'Sedang',
        servings: data.servings || null,
        sourceType: 'external',
        sourceUrl: data.sourceUrl || null,
        sourceName: data.sourceName || null,
        status: 'cached_unverified',
        isVerified: false,
        views: 1,
      },
    });
    res.json(formatRecipe(recipe));
  } catch (error) {
    // If sourceUrl already exists, just return the existing recipe
    if (error.code === 'P2002' && data?.sourceUrl) {
      const existing = await prisma.recipe.findFirst({
        where: { sourceUrl: data.sourceUrl },
      });
      if (existing) {
        await prisma.recipe.update({
          where: { id: existing.id },
          data: { views: { increment: 1 } },
        });
        return res.json(formatRecipe(existing));
      }
    }
    console.error('Cache external error:', error);
    res.status(500).json({ error: 'Failed to cache external recipe' });
  }
});

// ─── Legacy endpoint (backward compat) ────────────────────
app.get('/api/recipes', async (req, res) => {
  try {
    const { query } = req.query;
    if (query) {
      // Redirect to search
      const recipes = await prisma.recipe.findMany({
        where: {
          status: { not: 'rejected' },
          OR: [
            { title: { contains: query } },
            { tags: { contains: query } },
            { ingredients: { contains: query } },
          ]
        },
        take: 100,
      });
      return res.json(recipes.map(formatRecipe));
    }
    const recipes = await prisma.recipe.findMany({
      where: { status: { not: 'rejected' } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(recipes.map(formatRecipe));
  } catch (error) {
    console.error('Legacy fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// ─── Static files & SPA fallback ──────────────────────────
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API route not found' });
  } else {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Racikin API running on port ${PORT}`);
});
