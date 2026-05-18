import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import session from 'express-session';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const prisma = new PrismaClient({});

app.use(express.json());

// ─── Session middleware ───────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'racikin-dev-secret-2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
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
        cachedAt: new Date(),
        reviewStatus: 'pending',
      },
    });
    res.json(formatRecipe(recipe));
  } catch (error) {
    // If sourceUrl already exists, just return the existing recipe
    if (error.code === 'P2002') {
      try {
        const existing = await prisma.recipe.findFirst({
          where: { sourceUrl: req.body.sourceUrl },
        });
        if (existing) {
          await prisma.recipe.update({
            where: { id: existing.id },
            data: { views: { increment: 1 } },
          });
          return res.json(formatRecipe(existing));
        }
      } catch {}
    }
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
  return {
    title: (raw.title || 'Tanpa Judul').trim(),
    image: raw.image || null,
    category: raw.category || 'Lainnya',
    shortDescription: raw.ingredients
      ? `Bahan utama: ${raw.ingredients.slice(0, 3).join(', ')}${raw.ingredients.length > 3 ? '...' : ''}`
      : 'Resep dari internet.',
    ingredients: (raw.ingredients || []).map(i => typeof i === 'string' ? i.trim() : String(i)).filter(Boolean),
    steps: (raw.steps || []).map(s => typeof s === 'string' ? s.trim() : String(s)).filter(Boolean),
    tags: raw.tags || [],
    keywords: raw.keywords || [],
    cookingTime: raw.cookingTime || null,
    difficulty: raw.difficulty || 'Sedang',
    servings: raw.servings || null,
    sourceUrl: raw.sourceUrl || null,
    sourceName: raw.sourceName || null,
  };
}

// ─── AI Assistant Endpoint (Rule-based MVP) ──────────────────────────────

const SUBSTITUTION_MAP = {
  'kentang': 'ubi, singkong, wortel, labu siam',
  'bawang bombay': 'bawang merah, daun bawang',
  'santan': 'fiber creme, susu evaporasi, kemiri halus',
  'cabai': 'saus sambal, bubuk cabai, lada',
  'cabe': 'saus sambal, bubuk cabai, lada', // alias
  'telur': 'tahu, tempe, ayam suwir',
  'ayam': 'tahu, tempe, jamur, ikan',
  'kecap': 'gula merah + sedikit garam, saus tiram, kecap asin',
  'tomat': 'saus tomat, air asam jawa',
  'daun bawang': 'seledri, bawang goreng',
  'tepung terigu': 'tepung beras, maizena, tapioka'
};

function detectIntent(q) {
  if (/(kalo gapunya|kalau nggak ada|ga ada|ganti apa|bisa diganti apa)/.test(q)) {
    return 'ingredient_substitution';
  }
  if (/(bikin versi anak kos|anak kos)/.test(q)) return 'student_version';
  if (/(bikin lebih hemat|hemat)/.test(q)) return 'budget_version';
  if (/(bikin lebih pedas|pedas|pedes)/.test(q)) return 'spicy_version';
  if (/(ringkas langkahnya|ringkas langkah|ringkas)/.test(q)) return 'summarize_steps';
  if (/(buat \d+ porsi|buat \d+ orang|porsi)/.test(q)) return 'portion_adjustment';
  return 'fallback';
}

function extractIngredient(q) {
  // Matches phrases like: "kalo gapunya kentang gmn", "kalau nggak ada santan gimana"
  let match = q.match(/(?:kalo gapunya|kalau nggak ada|ga ada)\s+([a-z\s]+?)(?:\s+gmn|\s+gimana|\s+bisa diganti apa|\s+ganti apa|\s+dong|\?|$)/);
  if (match) return match[1].trim();

  // Matches phrases like: "bawang bombay bisa diganti apa", "tomat ganti apa"
  match = q.match(/([a-z\s]+?)\s+(?:bisa diganti apa|ganti apa)/);
  if (match) return match[1].trim();

  return null;
}

app.post('/api/ai/ask-recipe', async (req, res) => {
  try {
    const { recipeId, question, recipeContext } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Pertanyaan wajib diisi.' });
    }

    // Future: Call Gemini API here using `recipeContext` and `question`.
    // if (process.env.GEMINI_API_KEY) {
    //    try {
    //      const answer = await callGemini(question, recipeContext);
    //      return res.json({ question, answer });
    //    } catch (e) {
    //      // Fallback to rule-based on failure
    //    }
    // }

    // Mock thinking delay
    await new Promise(r => setTimeout(r, 1200));
    
    const q = question.toLowerCase();
    const intent = detectIntent(q);
    const titleContext = recipeContext?.title ? ` untuk resep ${recipeContext.title}` : '';
    let answer = '';

    switch (intent) {
      case 'ingredient_substitution':
        const ingredient = extractIngredient(q);
        if (ingredient) {
          const matchKey = Object.keys(SUBSTITUTION_MAP).find(k => ingredient.includes(k) || k.includes(ingredient));
          if (matchKey) {
            answer = `Kalau nggak ada ${matchKey}, bisa diganti ${SUBSTITUTION_MAP[matchKey]}. Kalau ${matchKey} cuma pelengkap, aman diskip. Tapi kalau jadi bahan utama, pilih pengganti yang teksturnya atau rasanya mirip biar hasilnya tetap enak.`;
          } else {
            answer = `Bisa, tapi tergantung fungsi ${ingredient} di resep. Kalau hanya pelengkap, bisa diskip. Kalau bahan utama, sebaiknya diganti dengan bahan yang rasa atau teksturnya mirip.`;
          }
        } else {
          answer = `Bahan mana yang mau diganti? Coba sebutkan nama bahannya ya.`;
        }
        break;

      case 'student_version':
        answer = `Versi Anak Kos${titleContext}:\n- Kurangi bahan-bahan yang mahal\n- Gunakan bahan pantry yang umum ada di kos\n- Pakai alat masak seadanya (misal 1 panci/wajan saja)\n- Bikin langkah masaknya lebih simpel (misal pakai bumbu dasar)`;
        break;

      case 'budget_version':
        answer = `Versi Hemat${titleContext}:\nCoba ganti bahan utama/protein dengan pilihan yang lebih murah, atau gunakan bumbu dan bahan yang lebih sederhana tanpa mengurangi rasa.`;
        break;

      case 'spicy_version':
        answer = `Bikin Lebih Pedas${titleContext}:\nKamu bisa menambahkan cabai rawit, sambal, lada, atau chili oil ke dalam resep ini sesuai selera pedasmu.`;
        break;

      case 'summarize_steps':
        if (recipeContext?.steps && Array.isArray(recipeContext.steps) && recipeContext.steps.length > 0) {
          const s = recipeContext.steps;
          if (s.length <= 4) {
            answer = `Ringkasan Langkah${titleContext}:\n` + s.map((step, i) => `${i + 1}. ${step}`).join('\n');
          } else {
            answer = `Ringkasan Langkah${titleContext}:\n1. Siapkan bahan (potong/cuci).\n2. ${s[Math.floor(s.length / 3)] || 'Tumis/masak bumbu dan bahan utama.'}\n3. ${s[Math.floor((s.length / 3) * 2)] || 'Tambahkan sisa bahan dan perasa.'}\n4. ${s[s.length - 1] || 'Sajikan selagi hangat.'}`;
          }
        } else {
          answer = `Ringkasan Langkah${titleContext}:\n1. Siapkan semua bahan.\n2. Olah bahan utama dan bumbu.\n3. Masak hingga matang dan sajikan.`;
        }
        break;

      case 'portion_adjustment':
        answer = `Sesuaikan Porsi${titleContext}:\nUntuk mengubah porsi, kalikan atau bagi takaran setiap bahan dengan perbandingan yang kamu inginkan. (Contoh: jika ingin porsi 2x lipat, kalikan semua bahan dengan 2).`;
        break;

      case 'fallback':
      default:
        answer = `Racikin AI masih belajar!\n\nCoba tanya:\n- "kalo gapunya santan ganti apa"\n- "bikin versi anak kos"\n- "bikin lebih hemat"\n- "bikin lebih pedas"\n- "ringkas langkahnya"`;
        break;
    }

    res.json({ question, answer });
  } catch (error) {
    console.error('AI ask error:', error);
    res.status(500).json({ error: 'Gagal mendapatkan jawaban AI.' });
  }
});


app.get('/api/external-search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    if (!q) return res.json([]);

    // ── MOCK: Replace this block with real external API call ──
    // Example future implementation:
    //   const response = await fetch(`https://serpapi.com/search?q=${q}+resep&api_key=${API_KEY}`);
    //   const rawResults = await response.json();
    //   const normalized = rawResults.map(normalizeExternalRecipe);
    //   return res.json(normalized);

    const results = [];
    for (const [keyword, recipes] of Object.entries(MOCK_EXTERNAL_RECIPES)) {
      if (q.includes(keyword) || keyword.includes(q)) {
        for (const raw of recipes) {
          // Run through normalizer pipeline
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

    res.json(results);
  } catch (error) {
    console.error('External search error:', error);
    res.status(500).json({ error: 'External search failed' });
  }
});

// ─── Admin: List recipes pending review ───────────────────
app.get('/api/admin/reviews', async (req, res) => {
  try {
    const status = req.query.status || 'cached_unverified';
    const recipes = await prisma.recipe.findMany({
      where: { status: String(status) },
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

