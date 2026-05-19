import { PrismaClient } from '@prisma/client';

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

function removeTitleDuplicates(title) {
  let t = title.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  
  // 1. Strip leading numbers
  t = t.replace(/^\d+[\.\s-]\s*/, '');

  // 2. Sliding window duplicate words block detector (e.g. Ayam Crispy Saus Mentega Ayam Crispy Saus Mentega)
  const words = t.split(' ');
  for (let len = 1; len <= Math.floor(words.length / 2); len++) {
    for (let i = 0; i <= words.length - 2 * len; i++) {
      const chunk1 = words.slice(i, i + len).join(' ').toLowerCase();
      const chunk2 = words.slice(i + len, i + 2 * len).join(' ').toLowerCase();
      if (chunk1 === chunk2) {
        words.splice(i + len, len);
        t = words.join(' ');
        return removeTitleDuplicates(t);
      }
    }
  }

  // 3. Simple character-based half duplication check
  const halfLen = Math.floor(t.length / 2);
  for (let len = 4; len <= halfLen; len++) {
    const chunk1 = t.substring(0, len).trim().toLowerCase();
    const chunk2 = t.substring(len, 2 * len).trim().toLowerCase();
    if (chunk1 === chunk2) {
      t = t.substring(0, len).trim();
      break;
    }
  }

  // 4. Strip duplicate trailing numbering remnants
  const numMatch = t.match(/\s+\d+(\.|\s+)\s*/);
  if (numMatch) {
    t = t.substring(0, numMatch.index).trim();
  }

  // 5. Remove messy parenthesis event text
  t = t.replace(/\s*\(\s*(menu|resep|cara|khas|spesial|versi|ala)\s+[^)]+\)/gi, '');
  t = t.replace(/\s+-\s+resep\s+[^-\s]+/gi, '');
  t = t.trim();

  // 6. Casing clean-up
  return t.split(' ').map(w => {
    if (w.length === 0) return '';
    if (w.startsWith('(')) {
      return '(' + w.charAt(1).toUpperCase() + w.slice(2).toLowerCase();
    }
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ').trim();
}

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim().substring(0, 80);
}

function deriveBadge(title, category) {
  const t = title.toLowerCase();
  const cat = category.toLowerCase();
  
  if (t.includes('capcay') || t.includes('capcai')) return 'Capcay';
  if (t.includes('nasi goreng')) return 'Nasi Goreng';
  if (t.includes('nasi uduk')) return 'Nasi Uduk';
  if (t.includes('nasi kuning')) return 'Nasi Kuning';
  if (t.includes('mie goreng') || t.includes('mi goreng')) return 'Mie Goreng';
  if (t.includes('mie ayam') || t.includes('mi ayam')) return 'Mie Ayam';
  if (t.includes('soto ayam')) return 'Soto Ayam';
  if (t.includes('bakso')) return 'Bakso';
  if (t.includes('rendang')) return 'Rendang';
  if (t.includes('sate')) return 'Sate';
  if (t.includes('gulai')) return 'Gulai';
  if (t.includes('sop') || t.includes('sup')) return 'Sup';
  if (t.includes('sambal')) return 'Sambal';
  if (t.includes('balado')) return 'Balado';
  if (t.includes('opor')) return 'Opor';
  
  if (cat.includes('ayam')) return 'Ayam';
  if (cat.includes('mie') || cat.includes('mi')) return 'Mie';
  if (cat.includes('nasi')) return 'Nasi';
  if (cat.includes('daging') || cat.includes('sapi') || cat.includes('kambing')) return 'Daging';
  if (cat.includes('ikan') || cat.includes('seafood') || cat.includes('udang')) return 'Ikan';
  if (cat.includes('telur')) return 'Telur';
  if (cat.includes('tahu') || cat.includes('tempe')) return 'Tahu & Tempe';
  if (cat.includes('sayur') || cat.includes('tumis') || cat.includes('cah ')) return 'Sayur';
  if (cat.includes('sambal')) return 'Sambal';
  if (cat.includes('cemilan') || cat.includes('camilan')) return 'Camilan';
  if (cat.includes('minuman') || cat.includes('es ') || cat.includes('jus')) return 'Minuman';
  
  if (t.includes('ayam')) return 'Ayam';
  if (t.includes('bebek')) return 'Bebek';
  if (t.includes('sapi') || t.includes('kambing') || t.includes('daging')) return 'Daging';
  if (t.includes('ikan') || t.includes('mujair') || t.includes('lele') || t.includes('nila') || t.includes('bandeng') || t.includes('gurame')) return 'Ikan';
  if (t.includes('cumi') || t.includes('udang') || t.includes('kepiting')) return 'Seafood';
  if (t.includes('telur')) return 'Telur';
  if (t.includes('tahu')) return 'Tahu';
  if (t.includes('tempe')) return 'Tempe';
  if (t.includes('sayur') || t.includes('kangkung') || t.includes('bayam') || t.includes('sawi') || t.includes('kol')) return 'Sayur';
  if (t.includes('pisang') || t.includes('roti') || t.includes('donat') || t.includes('kue')) return 'Camilan';
  if (t.includes('teh') || t.includes('kopi') || t.includes('susu') || t.includes('es ')) return 'Minuman';

  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
}

function cleanTagsAndKeywords(title, category, tags, keywords) {
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
  
  const cleanArray = (arr) => {
    if (!arr) return [];
    const items = typeof arr === 'string' ? JSON.parse(arr) : arr;
    return items
      .map(x => typeof x === 'string' ? x.replace(/#/g, '').replace(/@/g, '').trim() : '')
      .filter(x => x && !isNoisy(x))
      .map(x => x.toLowerCase().trim());
  };

  let finalTags = cleanArray(tags);
  let finalKeywords = cleanArray(keywords);

  if (finalTags.length === 0) {
    const tWords = title.toLowerCase().split(' ');
    if (tWords.includes('ayam')) finalTags.push('ayam');
    if (tWords.includes('nasi')) finalTags.push('nasi');
    if (tWords.includes('mie') || tWords.includes('mi')) finalTags.push('mie');
    if (tWords.includes('telur')) finalTags.push('telur');
    if (tWords.includes('sambal')) finalTags.push('sambal');
    if (tWords.includes('sayur') || tWords.includes('capcay')) finalTags.push('sayur');
    if (tWords.includes('goreng')) finalTags.push('goreng');
    if (tWords.includes('kuah') || tWords.includes('sup')) finalTags.push('kuah');
    
    finalTags.push(category.toLowerCase());
    finalTags.push('tradisional');
    finalTags.push('rumahan');
  }

  finalTags = Array.from(new Set(finalTags)).slice(0, 5).map(t => {
    return t.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  });

  finalKeywords = Array.from(new Set([...finalKeywords, ...finalTags.map(t => t.toLowerCase())])).slice(0, 8);

  return { tags: finalTags, keywords: finalKeywords };
}

function cleanDescription(title, category) {
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

function sanitizeListItem(text) {
  if (!text) return '';
  let s = text.trim();
  
  // 1. Remove checklist bullet icons and numbering remnants
  s = s.replace(/[✅☑✔❌🍳🔸▪•●*-]/g, '');
  
  // 2. Remove markdown artifacts and campaign hashtag prefixes
  s = s.replace(/\*\*/g, '');
  s = s.replace(/##+/g, '');
  s = s.replace(/@\w+/g, '');
  s = s.replace(/#\w+/g, '');
  s = s.replace(/#/g, '');

  // 3. Purge event parentheticals
  s = s.replace(/\(?\s*maaf\s+tidak\s+terfoto\s*\)?/gi, '');
  
  // 4. Remove step prefixing like "Step 1:" or "Langkah 1:"
  s = s.replace(/^(step|langkah)\s*\d+[:\s-]\s*/gi, '');

  return s.replace(/\s+/g, ' ').trim();
}

function sanitizeIngredients(ingredientsArr) {
  return ingredientsArr
    .map(ing => sanitizeListItem(ing))
    .filter(ing => {
      if (!ing) return false;
      const lower = ing.toLowerCase();
      // Filter standalone header groups
      if (lower.startsWith('bahan ') && !/\d/.test(ing) && ing.length < 25) {
        return false;
      }
      if (lower === 'bahan' || lower === 'bumbu' || lower === 'cara membuat' || lower === 'bahan-bahan') return false;
      return true;
    });
}

function sanitizeSteps(stepsArr) {
  const result = [];
  for (const step of stepsArr) {
    const cleaned = sanitizeListItem(step);
    if (!cleaned) continue;
    
    // Split overly long steps joined by period
    if (cleaned.length > 200 && cleaned.includes('.')) {
      const parts = cleaned.split(/(?<=\.)\s+/);
      for (const p of parts) {
        const cleanedPart = sanitizeListItem(p);
        if (cleanedPart && cleanedPart.length > 5) {
          result.push(cleanedPart);
        }
      }
    } else {
      result.push(cleaned);
    }
  }
  return result;
}

async function main() {
  console.log('Fetching all recipes from database...');
  const recipes = await prisma.recipe.findMany();
  console.log(`Found ${recipes.length} recipes inside local database.`);
  
  let cleanedCount = 0;
  const slugTracker = new Map();

  for (const r of recipes) {
    const titleVal = removeTitleDuplicates(r.title);
    
    // Slug generation with collision resolution
    let baseSlug = slugify(titleVal);
    let finalSlug = baseSlug;
    let count = 1;
    while (slugTracker.has(finalSlug)) {
      count++;
      finalSlug = `${baseSlug}-${count}`;
    }
    slugTracker.set(finalSlug, r.id);

    const badgeVal = deriveBadge(titleVal, r.category);
    const descVal = cleanDescription(titleVal, r.category);
    
    // Parse list fields safely
    let tArr = [];
    let kwArr = [];
    let ingArr = [];
    let stepArr = [];
    let toolArr = [];
    
    try { tArr = r.tags ? JSON.parse(r.tags) : []; } catch { tArr = []; }
    try { kwArr = r.keywords ? JSON.parse(r.keywords) : []; } catch { kwArr = []; }
    try { ingArr = r.ingredients ? JSON.parse(r.ingredients) : []; } catch { ingArr = []; }
    try { stepArr = r.steps ? JSON.parse(r.steps) : []; } catch { stepArr = []; }
    try { toolArr = r.tools ? JSON.parse(r.tools) : []; } catch { toolArr = []; }

    const { tags: tagsVal, keywords: keywordsVal } = cleanTagsAndKeywords(titleVal, r.category, tArr, kwArr);
    const cleanedIngredients = sanitizeIngredients(ingArr);
    const cleanedSteps = sanitizeSteps(stepArr);
    const cleanedTools = toolArr.map(t => sanitizeListItem(t)).filter(Boolean);
    const imageVal = getCuratedImage(r.category, finalSlug);

    try {
      await prisma.recipe.update({
        where: { id: r.id },
        data: {
          title: titleVal,
          slug: finalSlug,
          displayBadge: badgeVal,
          shortDescription: descVal,
          image: imageVal,
          tags: JSON.stringify(tagsVal),
          keywords: JSON.stringify(keywordsVal),
          ingredients: JSON.stringify(cleanedIngredients),
          steps: JSON.stringify(cleanedSteps),
          tools: JSON.stringify(cleanedTools),
          updatedAt: new Date()
        }
      });
      cleanedCount++;
    } catch (err) {
      console.error(`  [FAIL] Failed to update: ${r.title} (${r.id})`, err.message);
    }
  }

  console.log(`\nMetadata deep clean complete! Cleaned and normalized ${cleanedCount} verified Indonesian recipes.`);
  
  const finalCheck = await prisma.recipe.findMany({
    select: { title: true, slug: true, displayBadge: true, tags: true, shortDescription: true }
  });
  
  console.log('\nAudit Sample after Deep Clean:');
  finalCheck.slice(0, 8).forEach(s => {
    console.log(`- Title: "${s.title}"`);
    console.log(`  Slug: "${s.slug}"`);
    console.log(`  Badge: "${s.displayBadge}"`);
    console.log(`  Desc: "${s.shortDescription}"`);
    console.log(`  Tags: ${s.tags}\n`);
  });
}

main()
  .catch((e) => {
    console.error('Metadata deep clean error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
