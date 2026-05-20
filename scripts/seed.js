import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const importPath = path.join(__dirname, '..', 'prisma', 'local_recipes_export.json');

const prisma = new PrismaClient();

const CATEGORY_IMAGES = {
  'Ayam': [
    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=600&auto=format&fit=crop&q=80'
  ],
  'Nasi': [
    'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80'
  ],
  'Mie': [
    'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1612966608967-30dc550b58da?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&auto=format&fit=crop&q=80'
  ],
  'Daging': [
    'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&auto=format&fit=crop&q=80'
  ],
  'Ikan': [
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580958189406-2158fe3c574d?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=80'
  ],
  'Telur': [
    'https://images.unsplash.com/photo-1516685018646-549198525c1b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80'
  ],
  'Tahu & Tempe': [
    'https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80'
  ],
  'Sayur': [
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600&auto=format&fit=crop&q=80'
  ],
  'Sambal': [
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600&auto=format&fit=crop&q=80'
  ],
  'Cemilan': [
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600&auto=format&fit=crop&q=80'
  ],
  'Camilan': [
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600&auto=format&fit=crop&q=80'
  ],
  'Minuman': [
    'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&auto=format&fit=crop&q=80'
  ],
  'Lainnya': [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&auto=format&fit=crop&q=80'
  ]
};

function getCuratedImage(category, slug) {
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Lainnya'];
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash += slug.charCodeAt(i);
  }
  return images[hash % images.length];
}

function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;
  if (!/^https?:\/\//i.test(trimmed)) return false;
  const lower = trimmed.toLowerCase();
  if (lower.includes('placeholder') || lower.includes('broken-image')) return false;
  return true;
}


function generateEditorialDescription(title, category) {
  const cleanTitle = title.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (category === 'Ayam') {
    return `${cleanTitle} yang gurih dengan perpaduan rempah khas Nusantara yang kaya rasa.`;
  }
  if (category === 'Sayur') {
    return `${cleanTitle} segar dan sehat, dimasak praktis dengan rasa gurih alami yang pas untuk santapan harian.`;
  }
  if (category === 'Telur') {
    return `${cleanTitle} lezat dengan bumbu meresap sempurna, pilihan praktis yang disukai seluruh keluarga.`;
  }
  if (category === 'Daging') {
    return `${cleanTitle} empuk nan gurih dengan rempah otentik, dimasak perlahan hingga bumbu meresap sempurna.`;
  }
  if (category === 'Ikan') {
    return `${cleanTitle} dengan daging lembut berbalut bumbu tradisional pilihan, nikmat disantap selagi hangat.`;
  }
  if (category === 'Tahu & Tempe') {
    return `${cleanTitle} gurih renyah kaya cita rasa lokal, pendamping makan nasi yang ekonomis dan nikmat.`;
  }
  if (category === 'Sambal') {
    return `${cleanTitle} pedas segar beraroma khas, pelengkap wajib hidangan makan Anda hari ini.`;
  }
  if (category === 'Nasi') {
    return `${cleanTitle} lezat kaya rempah beraroma harum, praktis, mengenyangkan, dan menggugah selera.`;
  }
  if (category === 'Mie') {
    return `${cleanTitle} kenyal lezat berbalut bumbu gurih yang nendang, kreasi favorit keluarga tercinta.`;
  }
  if (category === 'Minuman') {
    return `${cleanTitle} manis segar beraroma alami, pelepas dahaga tradisional yang legit dan memanjakan.`;
  }
  return `${cleanTitle} ala rumahan yang simpel, kaya rasa, dan cocok untuk melengkapi menu makan siang Anda.`;
}

function cleanTitle(title) {
  return title.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim().substring(0, 80);
}

const CURATED_STATIC_FALLBACKS = [
  {
    title: "Ayam Goreng Lengkuas Rempah",
    category: "Ayam",
    shortDescription: "Ayam goreng klasik dengan taburan serundeng lengkuas yang super gurih dan melimpah.",
    ingredients: ["1 ekor ayam pejantan (potong 8 bagian)", "150 gram lengkuas muda (parut kasar)", "2 lembar daun salam & 2 lembar daun jeruk", "1 batang serai (memarkan)", "Bumbu Halus: 8 siung bawang merah, 5 siung bawang putih"],
    steps: ["Siapkan wajan besar. Masukkan ayam, bumbu halus, lengkuas parut, daun salam, daun jeruk, dan serai. Aduk rata.", "Tuang air secukupnya hingga ayam setengah terendam. Api sedang.", "Ungkep ayam hingga air menyusut habis dan bumbu meresap.", "Goreng ayam hingga matang kecoklatan."],
  },
  {
    title: "Telur Bumbu Balado Merah",
    category: "Telur",
    shortDescription: "Telur rebus goreng dengan balutan bumbu balado merah yang pedas manis.",
    ingredients: ["6 butir telur ayam (rebus, kupas)", "2 lembar daun jeruk", "Bumbu Halus: 10 cabe merah keriting, 5 cabe rawit"],
    steps: ["Goreng telur rebus hingga berkulit.", "Tumis bumbu halus dan daun jeruk.", "Masukkan telur, aduk rata dan bumbui."],
  },
  {
    title: "Rendang Daging Sapi Padang Asli",
    category: "Daging",
    shortDescription: "Daging sapi dimasak perlahan dalam santan dan rempah hingga menghitam dan empuk.",
    ingredients: ["1 kg Daging Sapi (potong kotak tebal)", "1 liter Santan Kental & 1 liter Santan Cair", "3 lembar daun kunyit, 5 lembar daun jeruk"],
    steps: ["Masukkan santan cair, bumbu halus, daun-daunan ke wajan besar. Rebus.", "Aduk perlahan. Masukkan daging.", "Masak berjam-jam hingga minyak menyusut dan menghitam."],
  }
];

async function seed() {
  console.log('Seeding verified recipes via Prisma...');
  const now = new Date();
  let sourceRecipes = [];

  if (fs.existsSync(importPath)) {
    console.log('Found local recipes JSON export. Loading...');
    const rawData = fs.readFileSync(importPath, 'utf8');
    const rawRecipes = JSON.parse(rawData);
    
    sourceRecipes = rawRecipes.filter(r => {
      if (r.status === 'rejected') return false;
      const titleLower = (r.title || '').toLowerCase();
      if (titleLower.includes('kipas sederhana')) return false;
      if (titleLower.includes('babi')) return false;
      if (titleLower.includes('test')) return false;
      if (titleLower.includes('placeholder')) return false;
      if (titleLower.includes('query')) return false;
      if (r.category === 'Lauk') return false;
      if (cleanTitle(r.title).length < 4) return false;
      return true;
    }).map(r => {
      const titleVal = cleanTitle(r.title);
      const slugVal = slugify(titleVal);
      const catVal = r.category || 'Lainnya';
      const imageVal = isValidImageUrl(r.image) ? r.image.trim() : getCuratedImage(catVal, slugVal);
      
      let descVal = r.shortDescription || '';
      if (!descVal || descVal.startsWith('Bahan utama:') || descVal.length < 15) {
        descVal = generateEditorialDescription(titleVal, catVal);
      }

      const tagsVal = Array.isArray(r.tags) ? r.tags : (r.tags ? JSON.parse(r.tags) : [catVal, "Tradisional", "Pilihan"]);
      const keywordsVal = Array.isArray(r.keywords) ? r.keywords : (r.keywords ? JSON.parse(r.keywords) : [titleVal.toLowerCase(), catVal.toLowerCase()]);
      
      return {
        title: titleVal,
        slug: slugVal,
        category: catVal,
        image: imageVal,
        shortDescription: descVal,
        ingredients: Array.isArray(r.ingredients) ? r.ingredients : JSON.parse(r.ingredients),
        steps: Array.isArray(r.steps) ? r.steps : JSON.parse(r.steps),
        tags: tagsVal,
        keywords: keywordsVal,
        likes: r.likes || 0
      };
    });
  } else {
    console.log('No local export found. Using curated static subset...');
    sourceRecipes = CURATED_STATIC_FALLBACKS.map(r => {
      const titleVal = cleanTitle(r.title);
      const slugVal = slugify(titleVal);
      const catVal = r.category;
      return {
        ...r,
        slug: slugVal,
        image: getCuratedImage(catVal, slugVal),
        tags: [catVal, "Tradisional", "Lauk"],
        keywords: [titleVal.toLowerCase(), catVal.toLowerCase()],
        likes: 120
      };
    });
  }

  console.log(`Ingesting ${sourceRecipes.length} sanitized recipes...`);
  let seeded = 0;

  for (const r of sourceRecipes) {
    try {
      await prisma.recipe.upsert({
        where: { slug: r.slug },
        update: {
          title: r.title,
          image: r.image,
          category: r.category,
          shortDescription: r.shortDescription,
          ingredients: JSON.stringify(r.ingredients),
          steps: JSON.stringify(r.steps),
          tags: JSON.stringify(r.tags),
          keywords: JSON.stringify(r.keywords),
          sourceType: 'internal',
          status: 'verified',
          isVerified: true,
          updatedAt: now,
        },
        create: {
          slug: r.slug,
          title: r.title,
          image: r.image,
          category: r.category,
          shortDescription: r.shortDescription,
          ingredients: JSON.stringify(r.ingredients),
          steps: JSON.stringify(r.steps),
          tags: JSON.stringify(r.tags),
          keywords: JSON.stringify(r.keywords),
          sourceType: 'internal',
          sourceName: 'Rasaji',
          status: 'verified',
          isVerified: true,
          likes: r.likes || 0,
          bookmarks: 0,
          views: 0,
          createdAt: now,
          updatedAt: now,
        },
      });
      seeded++;
    } catch (err) {
      console.error(`  [FAIL] ${r.title}:`, err.message);
    }
  }

  console.log(`\nSeed completed! Upserted ${seeded} sanitized recipes.`);

  // Safe cascade delete of invalid entries
  const cleanupConditions = [
    { title: { contains: 'Kipas Sederhana', mode: 'insensitive' } },
    { title: { contains: 'Babi', mode: 'insensitive' } }
  ];

  if (process.env.RESET_DB === 'true') {
    console.log('RESET_DB=true detected. Including broad cleanup of external/unverified recipes...');
    cleanupConditions.push({ status: { not: 'verified' } });
    cleanupConditions.push({ sourceType: { not: 'internal' } });
  } else {
    console.log('Broad database cleanup skipped to preserve user-generated/scraped production data. (Set RESET_DB=true to force a full clean)');
  }

  const badRecipes = await prisma.recipe.findMany({
    where: {
      OR: cleanupConditions
    },
    select: { id: true }
  });

  if (badRecipes.length > 0) {
    const badIds = badRecipes.map(r => r.id);
    await prisma.userAction.deleteMany({
      where: { recipeId: { in: badIds } }
    });
    const deleteResult = await prisma.recipe.deleteMany({
      where: { id: { in: badIds } }
    });
    console.log(`Wiped ${deleteResult.count} unverified or invalid records from DB.`);
  } else {
    console.log('No invalid records to delete.');
  }

  const counts = await prisma.recipe.aggregate({
    _count: { id: true },
  });
  console.log(`Total verified recipes in database: ${counts._count.id}`);
}

seed()
  .catch((e) => {
    console.error('Fatal seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
