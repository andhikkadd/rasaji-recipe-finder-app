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

// API Endpoints
app.get('/api/recipes', async (req, res) => {
  try {
    const { query } = req.query;
    let recipes;
    if (query) {
      recipes = await prisma.recipe.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { tags: { contains: query } },
            { ingredients: { contains: query } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      recipes = await prisma.recipe.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200
      });
    }
    
    // Parse JSON strings back to arrays for frontend
    const formattedRecipes = recipes.map(recipe => ({
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients || '[]'),
      instructions: JSON.parse(recipe.instructions || '[]'),
      tags: JSON.parse(recipe.tags || '[]')
    }));

    res.json(formattedRecipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: req.params.id }
    });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    
    res.json({
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients || '[]'),
      instructions: JSON.parse(recipe.instructions || '[]'),
      tags: JSON.parse(recipe.tags || '[]')
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// Serve static files from the Vite build directory
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// For all other requests, send index.html (client-side routing)
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API route not found' });
  } else {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
