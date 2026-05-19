import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import { checkFoodIntent, validateExternalResults, askRecipeAssistant, expandKitchenQuery } from './aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const prisma = new PrismaClient({});

app.use(express.json());

// ─── Session middleware ───────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'rasaji-dev-secret-2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // Set to true in production with HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// ─── Auth helper: attach user to request if logged in ────
function optionalAuth(req, _res, next) {
  // req.session.userId is set by login
  req.userId = req.session?.userId || null;
  next();
}
app.use(optionalAuth);

// ─── Admin Middleware ─────────────────────────────────────
async function requireAdmin(req, res, next) {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error checking admin status' });
  }
}

// ─── Auth Endpoints ───────────────────────────────────────

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nama, email, dan password wajib diisi.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter.' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email sudah terdaftar. Coba masuk.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: 'user' },
    });
    // Auto-login after register
    req.session.userId = user.id;
    res.status(201).json({
      id: user.id, name: user.name, email: user.email, role: user.role,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Gagal mendaftar. Coba lagi.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi.' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }
    req.session.userId = user.id;
    res.json({
      id: user.id, name: user.name, email: user.email, role: user.role,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Gagal masuk. Coba lagi.' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
  if (!req.userId) {
    return res.json(null);
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.json(null);
    // Also get user's liked and bookmarked recipe IDs
    const actions = await prisma.userAction.findMany({
      where: { userId: user.id },
      select: { recipeId: true, type: true },
    });
    const likedIds = actions.filter(a => a.type === 'like').map(a => a.recipeId);
    const bookmarkedIds = actions.filter(a => a.type === 'bookmark').map(a => a.recipeId);
    res.json({
      id: user.id, name: user.name, email: user.email, role: user.role,
      likedIds, bookmarkedIds,
    });
  } catch (error) {
    console.error('Me error:', error);
    res.json(null);
  }
});

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

function calculateRelevance(recipe, query, expandedTerms = []) {
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
    if (ing.toLowerCase().includes(q)) { score += 25; break; }
  }

  // Expanded term scoring
  expandedTerms.forEach((term, index) => {
    const t = term.toLowerCase();
    const weight = Math.max(20 - (index * 2), 5); // 20, 18, 16, 14, 12
    if (title.includes(t) || category.includes(t)) {
      score += weight;
    } else {
      let matched = false;
      for (const tag of tags) { if (tag.toLowerCase().includes(t)) { matched = true; break; } }
      if (!matched) {
         for (const kw of keywords) { if (kw.toLowerCase().includes(t)) { matched = true; break; } }
      }
      if (!matched) {
         for (const ing of ingredients) { if (ing.toLowerCase().includes(t)) { matched = true; break; } }
      }
      if (matched) score += Math.floor(weight / 2);
    }
  });

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

    if (!q && !category) {
      return res.json([]);
    }

    const where = {
      AND: [
        { status: 'verified' },
        { sourceType: 'internal' }
      ]
    };

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

// ─── Search Expansion endpoint ────────────────────────────
app.get('/api/recipes/expand', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ results: [], foodIntent: null });

    const intentResult = await checkFoodIntent(q);
    const isFood = intentResult.intent === 'food' || intentResult.intent === 'maybe_food';
    if (!intentResult.canGenerateFallback) {
      return res.json({ results: [], foodIntent: isFood ? null : false });
    }

    const expandedTerms = await expandKitchenQuery(q);
    if (!expandedTerms || expandedTerms.length === 0) {
      return res.json({ results: [], foodIntent: isFood });
    }

    const where = {
      AND: [
        { status: 'verified' },
        { sourceType: 'internal' }
      ],
      OR: expandedTerms.map(term => ({
        OR: [
          { title: { contains: term } },
          { category: { contains: term } },
          { tags: { contains: term } },
          { keywords: { contains: term } },
          { ingredients: { contains: term } },
          { shortDescription: { contains: term } }
        ]
      }))
    };

    const recipes = await prisma.recipe.findMany({ where, take: 50 });

    const scored = recipes
      .map(r => ({ ...r, _score: calculateRelevance(r, q, expandedTerms) }))
      .filter(r => r._score > 0)
      .sort((a, b) => b._score - a._score);

    res.json({
      results: scored.map(r => {
        const { _score, ...recipe } = r;
        return formatRecipe(recipe);
      }),
      foodIntent: intentResult.isFoodRelated
    });
  } catch (error) {
    console.error('Expand search error:', error);
    res.status(500).json({ error: 'Expand search failed' });
  }
});

// ─── Popular recipes ──────────────────────────────────────
app.get('/api/recipes/popular', async (req, res) => {
  try {
    const recipes = await prisma.recipe.findMany({
      where: { status: 'verified', sourceType: 'internal' },
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
      where: { status: 'verified', sourceType: 'internal' },
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
        status: 'verified',
        sourceType: 'internal',
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
    if (!recipe || recipe.status !== 'verified' || recipe.sourceType !== 'internal') {
      return res.status(404).json({ error: 'Recipe not found' });
    }
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
    if (!recipe || recipe.status !== 'verified' || recipe.sourceType !== 'internal') {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(formatRecipe(recipe));
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// ─── Toggle like (auth required) ──────────────────────────
app.post('/api/recipes/:id/like', async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ needsAuth: true, message: 'Masuk dulu buat kasih suka resep ini.' });
  }
  try {
    const { action } = req.body; // 'like' or 'unlike'
    const recipeId = req.params.id;

    if (action === 'unlike') {
      await prisma.userAction.deleteMany({
        where: { userId: req.userId, recipeId, type: 'like' },
      });
      await prisma.recipe.update({
        where: { id: recipeId },
        data: { likes: { decrement: 1 } },
      });
    } else {
      await prisma.userAction.create({
        data: { userId: req.userId, recipeId, type: 'like' },
      }).catch(() => {}); // Ignore if already exists
      await prisma.recipe.update({
        where: { id: recipeId },
        data: { likes: { increment: 1 } },
      });
    }

    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
    res.json({ likes: recipe?.likes || 0 });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// ─── Toggle bookmark (auth required) ─────────────────────
app.post('/api/recipes/:id/bookmark', async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ needsAuth: true, message: 'Masuk dulu buat nyimpen resep ini.' });
  }
  try {
    const { action } = req.body; // 'bookmark' or 'unbookmark'
    const recipeId = req.params.id;

    if (action === 'unbookmark') {
      await prisma.userAction.deleteMany({
        where: { userId: req.userId, recipeId, type: 'bookmark' },
      });
      await prisma.recipe.update({
        where: { id: recipeId },
        data: { bookmarks: { decrement: 1 } },
      });
    } else {
      await prisma.userAction.create({
        data: { userId: req.userId, recipeId, type: 'bookmark' },
      }).catch(() => {});
      await prisma.recipe.update({
        where: { id: recipeId },
        data: { bookmarks: { increment: 1 } },
      });
    }

    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
    res.json({ bookmarks: recipe?.bookmarks || 0 });
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
    const normalizedTitle = (data.title || '').trim().toLowerCase();
    const baseSlug = (data.title || 'resep')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80);

    // ── Dedup check: slug prefix OR exact title OR sourceUrl ──
    const orConds = [
      { slug: { startsWith: baseSlug } },
      { title: { equals: data.title, mode: 'insensitive' } },
    ];
    if (data.sourceUrl) {
      orConds.push({ sourceUrl: data.sourceUrl });
    }

    const existing = await prisma.recipe.findFirst({
      where: {
        OR: orConds,
      },
    });
    if (existing) {
      await prisma.recipe.update({ where: { id: existing.id }, data: { views: { increment: 1 } } });
      return res.json(formatRecipe(existing));
    }

    const slug = baseSlug + '-' + Date.now();
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
        cachedAt: new Date(),
        reviewStatus: 'pending',
      },
    });
    res.json(formatRecipe(recipe));
  } catch (error) {
    console.error('Cache external error:', error);
    res.status(500).json({ error: 'Failed to cache external recipe' });
  }
});

// ─── External Search (stub for future real API) ───────────
// Currently returns mock data. Replace internals with real
// scraping/search API (e.g., Google Custom Search, SerpAPI,
// or direct Cookpad/ResepKoki API) when ready.
// The frontend calls this endpoint and blends results inline.
const MOCK_EXTERNAL_RECIPES = {
  mie: [
    {
      title: 'Mie Ayam Bakso Spesial',
      image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'Mie',
      ingredients: ['200g mie telur', '150g ayam cincang', '4 butir bakso sapi', 'Sawi hijau', 'Bawang putih, kecap asin, minyak wijen'],
      steps: ['Rebus mie hingga al dente', 'Tumis ayam cincang dengan bumbu', 'Sajikan mie dengan topping ayam dan bakso'],
      tags: ['Mie', 'Bakso', 'Ayam'],
      cookingTime: '30 Menit', difficulty: 'Sedang', servings: '2',
      sourceUrl: 'https://resepkoki.id/resep/mie-ayam-bakso', sourceName: 'ResepKoki',
    },
    {
      title: 'Mie Aceh Goreng Seafood',
      image: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'Mie',
      ingredients: ['200g mie kuning tebal', '100g udang kupas', '50g cumi potong', 'Bumbu Aceh: kunyit, jintan, lada, ketumbar', 'Tomat, daun bawang'],
      steps: ['Haluskan bumbu Aceh', 'Tumis bumbu, masukkan seafood', 'Masukkan mie, aduk rata dengan api besar'],
      tags: ['Mie', 'Pedas', 'Seafood', 'Aceh'],
      cookingTime: '25 Menit', difficulty: 'Sedang', servings: '2',
      sourceUrl: 'https://cookpad.com/id/resep/mie-aceh-goreng', sourceName: 'Cookpad',
    },
  ],
  ayam: [
    {
      title: 'Ayam Geprek Sambal Bawang',
      image: 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'Ayam',
      ingredients: ['2 potong dada ayam', 'Tepung terigu & maizena', '10 cabe rawit, 5 bawang putih', 'Garam, gula, terasi'],
      steps: ['Goreng ayam berlapis tepung hingga crispy', 'Ulek sambal bawang', 'Geprek ayam dan siram sambal'],
      tags: ['Ayam', 'Pedas', 'Geprek'],
      cookingTime: '30 Menit', difficulty: 'Mudah', servings: '2',
      sourceUrl: 'https://masakapahariini.com/resep/ayam-geprek', sourceName: 'MasakApaHariIni',
    },
  ],
  rendang: [
    {
      title: 'Rendang Jengkol Empuk',
      image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'Daging',
      ingredients: ['500g jengkol (rebus hingga empuk)', '500ml santan kental', 'Bumbu rendang lengkap', 'Daun kunyit, serai, daun jeruk'],
      steps: ['Rebus jengkol hingga tidak bau', 'Masak bumbu rendang dengan santan', 'Masukkan jengkol, masak hingga kering'],
      tags: ['Rendang', 'Jengkol', 'Tradisional'],
      cookingTime: '2 Jam', difficulty: 'Sedang', servings: '6',
      sourceUrl: 'https://resepkoki.id/resep/rendang-jengkol', sourceName: 'ResepKoki',
    },
  ],
  nasi: [
    {
      title: 'Nasi Tutug Oncom Khas Tasik',
      image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800',
      category: 'Nasi',
      ingredients: ['3 cup nasi putih hangat', '200g oncom merah', 'Cabe rawit, bawang merah, bawang putih', 'Daun bawang, garam'],
      steps: ['Kukus oncom, hancurkan', 'Tumis bumbu, masukkan oncom', 'Campurkan dengan nasi hangat, aduk rata'],
      tags: ['Nasi', 'Tradisional', 'Sunda'],
      cookingTime: '20 Menit', difficulty: 'Mudah', servings: '4',
      sourceUrl: 'https://cookpad.com/id/resep/nasi-tutug-oncom', sourceName: 'Cookpad',
    },
  ],
  sambal: [
    {
      title: 'Sambal Terasi Goreng Khas Lamongan',
      image: 'https://images.pexels.com/photos/4552136/pexels-photo-4552136.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'Sambal',
      ingredients: ['15 cabe merah keriting', '10 cabe rawit', '5 bawang merah', '3 bawang putih', '1 sdt terasi bakar', 'Tomat merah'],
      steps: ['Goreng semua bahan kecuali terasi', 'Ulek kasar bersama terasi bakar', 'Tambahkan garam dan gula secukupnya'],
      tags: ['Sambal', 'Pedas', 'Tradisional'],
      cookingTime: '15 Menit', difficulty: 'Mudah', servings: '4',
      sourceUrl: 'https://resepkoki.id/resep/sambal-terasi-goreng', sourceName: 'ResepKoki',
    },
  ],
  tahu: [
    {
      title: 'Tahu Gejrot Cirebon',
      image: 'https://images.pexels.com/photos/5409015/pexels-photo-5409015.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'Tahu & Tempe',
      ingredients: ['10 buah tahu pong kecil', '5 cabe rawit', '3 bawang putih', '3 bawang merah', 'Gula merah, asam jawa', 'Kecap manis'],
      steps: ['Goreng tahu hingga renyah', 'Ulek bumbu gejrot kasar', 'Larutkan bumbu dengan air panas', 'Siram ke tahu, tambahkan kecap manis'],
      tags: ['Tahu & Tempe', 'Tradisional', 'Camilan'],
      cookingTime: '20 Menit', difficulty: 'Mudah', servings: '3',
      sourceUrl: 'https://cookpad.com/id/resep/tahu-gejrot-cirebon', sourceName: 'Cookpad',
    },
  ],
};

function cleanTags(tags) {
  if (!Array.isArray(tags)) return [];
  
  const isNoisy = (tag) => {
    const t = tag.toLowerCase().trim();
    if (t.length < 2 || t.length > 25) return true;
    if (/\b(202\d)\b/.test(t) || /\d{4}/.test(t)) return true;
    if (t.includes('_')) return true;

    const patterns = [
      'coboy', 'kolaksurabaya', 'sarapanduludong', 'cookpad', 'recook', 'challenge', 'event', 'apron',
      'komunitas', 'indonesia', 'week', 'weekly', 'squad', 'dapur', 'masak', 'pemula', 'menularest',
      'phiekitchen', 'community', 'username', 'author', 'olahanayam', 'ayamsausmentega',
      'clover', 'arisan', 'bancakan', 'motobareng', 'posbar', 'pejuang', 'tantangan', 'member',
      'alaresto', 'kopijos', 'serbakelapa', 'selaluistimewa', 'istimewa', 'harikartini', 'kartini',
      'astahomeware', 'pancong', 'salamkompak', 'ontyblusukan', 'dewisaraswati', 'bundakeyla',
      'agustinaerlinda', 'hasiltani', 'brand', 'desaku', 'sajiku', 'saori', 'wings', 'rosebrand'
    ];

    for (const p of patterns) {
      if (t.includes(p)) return true;
    }

    if (/^\d+$/.test(t)) return true;
    return false;
  };

  return Array.from(
    new Set(
      tags
        .map(t => typeof t === 'string' ? t.replace(/#/g, '').replace(/@/g, '').trim() : '')
        .filter(t => t && !isNoisy(t))
        .map(t => {
          return t.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        })
    )
  ).slice(0, 5);
}

/**
 * Server-side AI normalizer (mock).
 * In the future, replace this with a call to Gemini API:
 *   const { GoogleGenerativeAI } = require('@google/generative-ai');
 *   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
 *   const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
 *   const prompt = `Normalize this recipe into JSON: ${JSON.stringify(raw)}`;
 *   const result = await model.generateContent(prompt);
 */
function normalizeExternalRecipe(raw) {
  const cleanedTags = cleanTags(raw.tags || []);
  return {
    title: (raw.title || 'Tanpa Judul').trim(),
    image: raw.image || null,
    category: raw.category || 'Lainnya',
    shortDescription: raw.ingredients
      ? `Bahan utama: ${raw.ingredients.slice(0, 3).join(', ')}${raw.ingredients.length > 3 ? '...' : ''}`
      : 'Resep dari internet.',
    ingredients: (raw.ingredients || []).map(i => typeof i === 'string' ? i.trim() : String(i)).filter(Boolean),
    steps: (raw.steps || []).map(s => typeof s === 'string' ? s.trim() : String(s)).filter(Boolean),
    tags: cleanedTags,
    keywords: cleanTags(raw.keywords || []).map(k => k.toLowerCase()),
    cookingTime: raw.cookingTime || null,
    difficulty: raw.difficulty || 'Sedang',
    servings: raw.servings || null,
    sourceUrl: raw.sourceUrl || null,
    sourceName: raw.sourceName || null,
  };
}


// ─── AI Assistant Endpoint (Rule-based MVP) ──────────────────────────────

app.post('/api/ai/ask-recipe', async (req, res) => {
  try {
    const { recipeId, question, recipeContext } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Pertanyaan wajib diisi.' });
    }

    const { answer } = await askRecipeAssistant(question, recipeContext);
    
    res.json({ question, answer });
  } catch (error) {
    console.error('AI ask error:', error);
    res.status(500).json({ error: 'Gagal mendapatkan jawaban AI.' });
  }
});


// ─── Smart Dynamic Fallback Generator ─────────────────────
const SWEET_KEYWORDS = ['kue','cake','bolu','brownies','puding','pudding','donat','roti','biskuit','pancake','coklat','chocolate','klepon','onde','dadar','serabi','martabak manis','pisang','kolak','manisan','tart','pie','wajik','cenil'];
const DRINK_KEYWORDS = ['teh','kopi','jus','susu','smoothie','milkshake','wedang','bandrek','bajigur','sekoteng','cendol','dawet','cincau','sirup','kelapa muda','boba','thai tea'];
const PROTEIN_KEYWORDS = ['ayam','sapi','babi','kambing','bebek','ikan','udang','cumi','kepiting','kerang','tongkol','tuna','salmon','lele','nila','patin','bandeng','daging','telur','usus','jeroan','hati','ampela','babat','kikil','limpa','paru','otak','lidah','iso'];

function detectQueryCategory(query) {
  const q = query.toLowerCase();
  for (const kw of SWEET_KEYWORDS) { if (q.includes(kw)) return 'sweet'; }
  for (const kw of DRINK_KEYWORDS) { if (q.includes(kw)) return 'drink'; }
  for (const kw of PROTEIN_KEYWORDS) { if (q.includes(kw)) return 'protein'; }
  return 'generic';
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

// Build realistic ingredients for a main-ingredient query
function buildIngredients(mainIngredient, category) {
  const q = mainIngredient;
  if (category === 'protein') {
    return [
      `500 gram ${q}`,
      '5 siung bawang putih, cincang',
      '4 siung bawang merah, iris',
      '3 buah cabai merah, iris (sesuai selera)',
      '2 sdm kecap manis',
      '1 sdt garam',
      '1 sdt lada bubuk',
      '1 ruas jahe, memarkan',
      'minyak goreng secukupnya',
    ];
  }
  if (category === 'sweet') {
    return [
      `200 gram ${q}`,
      '2 butir telur',
      '150 gram gula pasir',
      '100 gram tepung terigu',
      '100 ml susu cair',
      '50 gram mentega, lelehkan',
      '1 sdt baking powder',
      '1/2 sdt vanili',
    ];
  }
  if (category === 'drink') {
    return [
      `2 sdm ${q} bubuk atau 2 sachet`,
      '200 ml air panas',
      '100 ml susu cair (opsional)',
      '2 sdm gula pasir atau gula aren',
      'es batu secukupnya',
    ];
  }
  // generic
  return [
    `300 gram ${q}`,
    '3 siung bawang putih',
    '3 siung bawang merah',
    '2 buah cabai merah',
    '1 sdt garam',
    '1 sdt gula pasir',
    'minyak goreng secukupnya',
    'air secukupnya',
  ];
}

function buildSteps(mainIngredient, category, title) {
  const q = mainIngredient;
  if (category === 'protein') {
    return [
      `Bersihkan ${q}, potong sesuai selera.`,
      'Haluskan atau iris bawang putih, bawang merah, cabai, dan jahe.',
      `Panaskan minyak, tumis bumbu hingga harum.`,
      `Masukkan ${q}, aduk rata hingga berubah warna.`,
      'Tambahkan kecap manis, garam, lada, dan sedikit air.',
      'Masak dengan api kecil hingga bumbu meresap dan matang. Koreksi rasa, sajikan.',
    ];
  }
  if (category === 'sweet') {
    return [
      'Panaskan oven 180°C. Siapkan loyang, olesi mentega.',
      'Kocok telur dan gula hingga mengembang dan pucat.',
      `Masukkan ${q} yang sudah dihaluskan atau dicairkan.`,
      'Ayak tepung terigu dan baking powder, aduk perlahan.',
      'Tuang susu dan mentega cair, aduk rata.',
      'Panggang 30–35 menit atau hingga matang. Tusuk tengah, jika bersih berarti matang.',
    ];
  }
  if (category === 'drink') {
    return [
      `Seduh ${q} dengan air panas, aduk rata.`,
      'Tambahkan gula, aduk hingga larut.',
      'Tambahkan susu jika suka.',
      'Sajikan panas, atau tuang ke gelas berisi es batu untuk versi dingin.',
    ];
  }
  return [
    `Siapkan dan bersihkan ${q}.`,
    'Haluskan atau iris semua bumbu.',
    'Panaskan minyak, tumis bumbu hingga harum.',
    `Masukkan ${q}, aduk rata.`,
    'Tambahkan garam, gula, dan air secukupnya.',
    'Masak hingga matang. Koreksi rasa, sajikan hangat.',
  ];
}

function generateDynamicFallback(query) {
  const category = detectQueryCategory(query);
  const q = capitalizeWords(query.trim());
  const ql = query.trim().toLowerCase();
  let templates = [];

  switch (category) {
    case 'protein':
      templates = [
        { title: `${q} Kecap`, category: 'Lauk', tags: ['Protein', 'Kecap'], cookingTime: '35 Menit', difficulty: 'Mudah', servings: '3' },
        { title: `${q} Goreng Rempah`, category: 'Lauk', tags: ['Protein', 'Goreng'], cookingTime: '30 Menit', difficulty: 'Mudah', servings: '3' },
        { title: `${q} Rica-Rica`, category: 'Lauk', tags: ['Protein', 'Pedas'], cookingTime: '40 Menit', difficulty: 'Sedang', servings: '4' },
        { title: `${q} Bakar Bumbu Kecap`, category: 'Lauk', tags: ['Protein', 'Bakar'], cookingTime: '45 Menit', difficulty: 'Sedang', servings: '3' },
      ];
      break;
    case 'sweet':
      templates = [
        { title: `${q} Kukus Lembut`, category: 'Kue & Dessert', tags: ['Kue', 'Kukus'], cookingTime: '40 Menit', difficulty: 'Mudah', servings: '8' },
        { title: `${q} Panggang Coklat`, category: 'Kue & Dessert', tags: ['Kue', 'Panggang'], cookingTime: '50 Menit', difficulty: 'Sedang', servings: '8' },
        { title: `${q} Lumer`, category: 'Kue & Dessert', tags: ['Dessert', 'Manis'], cookingTime: '35 Menit', difficulty: 'Mudah', servings: '6' },
      ];
      break;
    case 'drink':
      templates = [
        { title: `Es ${q} Segar`, category: 'Minuman', tags: ['Minuman', 'Es'], cookingTime: '5 Menit', difficulty: 'Mudah', servings: '2' },
        { title: `${q} Susu Hangat`, category: 'Minuman', tags: ['Minuman', 'Hangat'], cookingTime: '5 Menit', difficulty: 'Mudah', servings: '2' },
        { title: `${q} Spesial`, category: 'Minuman', tags: ['Minuman'], cookingTime: '10 Menit', difficulty: 'Mudah', servings: '2' },
      ];
      break;
    case 'generic':
    default:
      templates = [
        { title: `${q} Tumis Bawang`, category: 'Sayur', tags: ['Sayur', 'Tumis'], cookingTime: '20 Menit', difficulty: 'Mudah', servings: '3' },
        { title: `${q} Goreng Krispy`, category: 'Camilan', tags: ['Camilan', 'Goreng'], cookingTime: '25 Menit', difficulty: 'Mudah', servings: '3' },
        { title: `${q} Kuah Segar`, category: 'Sup', tags: ['Sup', 'Kuah'], cookingTime: '30 Menit', difficulty: 'Mudah', servings: '4' },
      ];
      break;
  }

  return templates.map(t => {
    const ingredients = buildIngredients(ql, category);
    const steps = buildSteps(ql, category, t.title);
    return {
      ...t,
      id: `ext-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      slug: t.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      image: null,
      shortDescription: `Resep ${t.title} rumahan yang mudah dibuat dan lezat.`,
      ingredients,
      steps,
      tools: ['wajan atau panci', 'spatula', 'pisau', 'talenan', 'kompor'],
      tips: 'Koreksi rasa sebelum diangkat. Sesuaikan tingkat kepedasan dengan selera keluarga.',
      keywords: [query],
      sourceUrl: null,
      sourceName: 'Rasaji Fallback',
      sourceType: 'external',
      status: 'cached_unverified',
      isVerified: false,
      likes: 0, bookmarks: 0, views: 0,
      caloriesEstimate: 0,
      _isExternalMock: true,
    };
  });
}

app.get('/api/external-search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    if (!q) return res.json({ results: [], foodIntent: false });

    // ── Step 1: AI food intent check (Gemini or rule-based) ──
    const intentResult = await checkFoodIntent(q);
    const isFood = intentResult.intent === 'food' || intentResult.intent === 'maybe_food';
    if (!intentResult.canGenerateFallback) {
      console.log(`[Search] Fallback blocked for query: "${q}" (${intentResult.reason})`);
      return res.json({ results: [], foodIntent: isFood ? null : false });
    }

    // ── Step 2: Try hardcoded MOCK_EXTERNAL_RECIPES first ──
    const results = [];
    for (const [keyword, recipes] of Object.entries(MOCK_EXTERNAL_RECIPES)) {
      if (q.includes(keyword) || keyword.includes(q)) {
        for (const raw of recipes) {
          const normalized = normalizeExternalRecipe(raw);
          results.push({
            ...normalized,
            id: `ext-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            slug: normalized.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
            sourceType: 'external',
            status: 'cached_unverified',
            isVerified: false,
            likes: 0, bookmarks: 0, views: 0,
            caloriesEstimate: 0,
            _isExternalMock: true,
          });
        }
      }
    }

    // ── Step 3: Dynamic fallback if no hardcoded match ──
    if (results.length === 0) {
      const dynamic = generateDynamicFallback(q);
      results.push(...dynamic);
    }

    // ── Step 4: Validate results (min fields + maybe-query cooking-word check) ──
    const validated = validateExternalResults(results, intentResult);

    // ── Step 5: Dedup against existing DB slugs ──
    const slugs = validated.map(r => r.slug);
    const existingInDb = await prisma.recipe.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true },
    });
    const existingSlugSet = new Set(existingInDb.map(r => r.slug));
    const deduped = validated.filter(r => !existingSlugSet.has(r.slug));

    res.json({ results: deduped, foodIntent: intentResult.isFoodRelated });
  } catch (error) {
    console.error('External search error:', error);
    res.status(500).json({ results: [], foodIntent: 'maybe', error: 'External search failed' });
  }
});


// ─── Admin Protected Routes ─────────────────────────────────
app.use('/api/admin', requireAdmin);

// ─── Admin: List recipes pending review ───────────────────
app.get('/api/admin/recipes/review', async (req, res) => {
  try {
    const status = req.query.status;
    
    let whereClause = {};
    if (status) {
      whereClause = { status: String(status) };
    } else {
      whereClause = { status: { in: ['scraped', 'cached_unverified'] } };
    }

    const recipes = await prisma.recipe.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(recipes.map(formatRecipe));
  } catch (error) {
    console.error('Admin reviews error:', error);
    res.status(500).json({ error: 'Failed to list reviews' });
  }
});

// ─── Admin: Get review stats ──────────────────────────────
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [total, verified, scraped, cached, rejected] = await Promise.all([
      prisma.recipe.count(),
      prisma.recipe.count({ where: { status: 'verified' } }),
      prisma.recipe.count({ where: { status: 'scraped' } }),
      prisma.recipe.count({ where: { status: 'cached_unverified' } }),
      prisma.recipe.count({ where: { status: 'rejected' } }),
    ]);
    res.json({ total, verified, scraped, cached_unverified: cached, rejected });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// ─── Admin: Get recipe detail ─────────────────────────────
app.get('/api/admin/recipes/:id', async (req, res) => {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: req.params.id },
    });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(formatRecipe(recipe));
  } catch (error) {
    console.error('Admin get recipe error:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// ─── Admin: Approve a recipe ──────────────────────────────
app.post('/api/admin/recipes/:id/approve', async (req, res) => {
  try {
    const recipe = await prisma.recipe.update({
      where: { id: req.params.id },
      data: {
        status: 'verified',
        isVerified: true,
        reviewStatus: 'approved',
        reviewNotes: req.body.notes || null,
        reviewedAt: new Date(),
      },
    });
    res.json(formatRecipe(recipe));
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ error: 'Failed to approve recipe' });
  }
});

// ─── Admin: Reject a recipe ──────────────────────────────
app.post('/api/admin/recipes/:id/reject', async (req, res) => {
  try {
    const recipe = await prisma.recipe.update({
      where: { id: req.params.id },
      data: {
        status: 'rejected',
        isVerified: false,
        reviewStatus: 'rejected',
        reviewNotes: req.body.notes || req.body.reason || null,
        reviewedAt: new Date(),
      },
    });
    res.json(formatRecipe(recipe));
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ error: 'Failed to reject recipe' });
  }
});

// ─── Admin: Edit a recipe ─────────────────────────────────
app.put('/api/admin/recipes/:id', async (req, res) => {
  try {
    const data = req.body;
    const updateData = {};
    // Only update fields that were provided
    const directFields = ['title', 'image', 'category', 'shortDescription', 'fullDescription',
      'tips', 'alternativeIngredients', 'cookingTime', 'difficulty', 'servings',
      'caloriesEstimate', 'status', 'sourceType', 'sourceName', 'sourceUrl'];
    for (const f of directFields) {
      if (data[f] !== undefined) updateData[f] = data[f];
    }
    // JSON fields need serialization
    const jsonFields = ['ingredients', 'steps', 'tags', 'keywords', 'tools'];
    for (const f of jsonFields) {
      if (data[f] !== undefined) updateData[f] = JSON.stringify(data[f]);
    }
    if (data.isVerified !== undefined) updateData.isVerified = Boolean(data.isVerified);
    // Mark as reviewed
    updateData.reviewStatus = 'needs_edit';
    updateData.reviewNotes = data.reviewNotes || 'Edited by admin';
    updateData.reviewedAt = new Date();

    const recipe = await prisma.recipe.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json(formatRecipe(recipe));
  } catch (error) {
    console.error('Edit error:', error);
    res.status(500).json({ error: 'Failed to edit recipe' });
  }
});

// ─── Admin: Delete a recipe ──────────────────────────────
app.delete('/api/admin/recipes/:id', async (req, res) => {
  try {
    await prisma.recipe.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
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
          status: 'verified',
          sourceType: 'internal',
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
      where: { status: 'verified', sourceType: 'internal' },
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
  console.log(`Rasaji API running on port ${PORT}`);
});

