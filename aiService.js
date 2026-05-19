// ─── Rasaji AI Service ─────────────────────────────────────────────────────
// Gemini-powered when GEMINI_API_KEY is set in .env; rule-based fallback otherwise.
// Frontend never calls AI directly — all AI logic lives here (backend only).

// ─── Non-food signals (word-level match) ─────────────────────────────────────
const NON_FOOD_KEYWORDS = [
  'kipas','laptop','komputer','computer','printer','monitor','keyboard','mouse',
  'motor','mobil','sepeda','ban','velg','helm',
  'baju','kemeja','kaos','celana','rok','jaket','sepatu','sandal','tas','dompet','payung',
  'meja','kursi','lemari','kasur','sofa','bantal','guling','cermin','pintu','jendela',
  'hp','handphone','telepon','kamera','kabel','charger','baterai','lampu',
  'buku','pensil','pena','spidol','kertas',
  'pompa','genset','tangki','selang',
  'televisi','tv','radio','speaker','headphone','earphone',
  'cincin','gelang','kalung','anting',
  'obat','vitamin','suplemen',
];

// ─── Clear food signals (substring match) ────────────────────────────────────
const FOOD_SIGNALS = [
  'ayam','sapi','babi','kambing','bebek','ikan','udang','cumi','kepiting','kerang',
  'tongkol','tuna','salmon','lele','nila','patin','bandeng','daging','telur',
  'usus','jeroan','hati','ampela','babat','kikil','limpa','paru','otak','lidah','iso',
  'tempe','tahu','oncom','jamur','kacang','edamame',
  'nasi','mie','bihun','kwetiau','kentang','singkong','ubi','roti','pasta','lontong','ketupat','jagung',
  'sayur','kangkung','bayam','wortel','kol','cabai','cabe','bawang','tomat',
  'santan','kunyit','jahe','serai','terong','labu','buncis','pare',
  'rendang','soto','rawon','bakso','seblak','pecel','sate','gulai','opor',
  'tongseng','semur','lodeh','balado','geprek','rica','kare','gule',
  'sop','sup','laksa','pempek','siomay','batagor','lumpia','rujak','lotek','ketoprak','gado','capcay',
  'kue','bolu','brownies','pisang','martabak','cilok','cireng','bakwan',
  'risol','pastel','puding','klepon','onde','coklat','donat','kerupuk','keripik','wajik','serabi',
  'teh','kopi','susu','jus','wedang','cendol','sirup','kelapa','minuman','boba',
  'resep','masak','goreng','bakar','rebus','tumis','kukus','panggang',
  'sambal','bumbu','kuah','pedas','manis','gurih','asin','crispy','kremes',
];

// ─── Cooking context words for "maybe" title validation ──────────────────────
export const COOKING_CONTEXT_WORDS = [
  'sate','goreng','bakar','panggang','tumis','kuah','bumbu','sambal','rica',
  'kecap','balado','gulai','sop','sup','rebus','kukus','pedas','manis','gurih',
  'rendang','semur','opor','lodeh','tongseng','kremes','asam','rempah','crispy',
  'acar','rebus','ungkep','kukus',
];

// ─── Rule-based food intent check ────────────────────────────────────────────
export function checkFoodIntentRuleBased(query) {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/);

  const nonFoodMatch = words.find(w => NON_FOOD_KEYWORDS.includes(w));
  if (nonFoodMatch) {
    return {
      intent: 'non_food',
      confidence: 1.0,
      entityType: 'unknown',
      canGenerateFallback: false,
      reason: `Non-food word detected: "${nonFoodMatch}"`,
      source: 'rule-based'
    };
  }

  const foodMatch = FOOD_SIGNALS.find(kw => q.includes(kw));
  if (foodMatch) {
    return {
      intent: 'food',
      confidence: 1.0,
      entityType: 'ingredient',
      canGenerateFallback: true,
      reason: `Food keyword matched: "${foodMatch}"`,
      source: 'rule-based'
    };
  }

  // Strict fallback: If no explicit food signal is found, assume it is NOT food.
  // We do not default to maybe_food for unknown random words.
  return {
    intent: 'unknown',
    confidence: 0.5,
    entityType: 'unknown',
    canGenerateFallback: false,
    reason: 'Query context unclear, lacking strong food signals.',
    source: 'rule-based'
  };
}

// ─── Gemini model (lazy-loaded) ───────────────────────────────────────────────
let _geminiClient = null;

async function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (_geminiClient) return _geminiClient;
  try {
    const { GoogleGenAI } = await import('@google/genai');
    _geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('[AI] Gemini client ready');
    return _geminiClient;
  } catch (e) {
    console.warn('[AI] Gemini unavailable, using rule-based fallback:', e.message);
    return null;
  }
}

// ─── checkFoodIntent: Gemini → rule-based fallback ───────────────────────────
export async function checkFoodIntent(query) {
  const ai = await getGeminiClient();
  if (!ai) return checkFoodIntentRuleBased(query);

  try {
    const prompt = `You are a strict recipe search intent validator for an Indonesian cooking app.
A user searched for: "${query}"

Your job is to strictly classify the search intent.
DO NOT be creative. DO NOT invent recipes from person names (e.g., "prabowo", "jokowi"), random words, objects (e.g., "kipas", "laptop"), brands, memes (e.g., "fufufafa"), or gibberish.
If unsure, prefer "non_food" instead of inventing fake recipes.

Respond ONLY with a valid JSON object matching this structure:
{
  "intent": "food" | "maybe_food" | "non_food" | "gibberish",
  "confidence": number, // 0.0 to 1.0
  "entityType": "ingredient" | "dish" | "drink" | "snack" | "cooking_method" | "person" | "object" | "brand" | "unknown",
  "canGenerateFallback": boolean,
  "reason": "brief reason"
}

Rules for \`canGenerateFallback\`:
- \`true\` ONLY if the query is clearly a food, ingredient, dish, snack, drink, or cooking method (e.g., "ayam", "tepung", "santan").
- \`false\` for person names, objects, random words, gibberish, brands, memes, or unclear terms.
- For \`maybe_food\`, only set to \`true\` if there is a strong, real-world culinary context.`;

    const result = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
    });
    const text = result.text.trim();
    const match = text.match(/\{[\s\S]*?\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return { ...parsed, source: 'gemini' };
    }
  } catch (e) {
    console.warn('[AI] Gemini intent check failed:', e.message);
  }

  return checkFoodIntentRuleBased(query);
}

// ─── validateExternalResults ──────────────────────────────────────────────────
// Keeps only results with complete usable data.
// For 'maybe_food' queries: title must also contain a cooking context word.
export function validateExternalResults(results, intentResult) {
  return results.filter(r => {
    if (!r.title?.trim()) return false;
    if (!r.shortDescription?.trim()) return false;

    const ingredients = Array.isArray(r.ingredients)
      ? r.ingredients.filter(i => i && !i.includes('akan ditampilkan'))
      : [];
    if (ingredients.length < 2) return false;

    const steps = Array.isArray(r.steps)
      ? r.steps.filter(s => s && !s.includes('akan ditampilkan'))
      : [];
    if (steps.length < 2) return false;

    // Reject non_food entirely
    if (intentResult?.intent === 'non_food' || intentResult?.intent === 'gibberish' || intentResult?.intent === 'unknown') {
      return false;
    }

    // For 'maybe_food' queries: enforce food context in the title
    if (intentResult?.intent === 'maybe_food') {
      const titleLow = r.title.toLowerCase();
      if (!COOKING_CONTEXT_WORDS.some(w => titleLow.includes(w))) return false;
    }

    return true;
  });
}

// ─── Query Expansion (Kitchen-Aware Search) ──────────────────────────────────
const FALLBACK_EXPANSION_MAP = {
  'ayam': ['sate ayam', 'opor ayam', 'ayam goreng', 'ayam bakar', 'soto ayam'],
  'santan': ['sayur lodeh', 'opor ayam', 'rendang', 'gulai', 'kolak'],
  'telur': ['telur dadar', 'telur balado', 'nasi goreng', 'omelet', 'telur ceplok'],
  'tepung': ['bakwan', 'tempe mendoan', 'cireng', 'pisang goreng', 'kue'],
  'tahu': ['tahu isi', 'tahu tek', 'tahu gejrot', 'tahu goreng', 'tumis tahu'],
  'tempe': ['tempe orek', 'tempe mendoan', 'kering tempe', 'tempe bacem', 'sayur tempe'],
  'daging': ['rendang', 'soto daging', 'rawon', 'sate sapi', 'empal'],
  'ikan': ['ikan bakar', 'ikan goreng', 'ikan gurame', 'ikan nila', 'pesmol'],
  'sayur': ['sayur sop', 'sayur asem', 'sayur lodeh', 'capcay', 'tumis kangkung'],
};

export async function expandKitchenQueryRuleBased(query) {
  const q = query.toLowerCase().trim();
  for (const [key, terms] of Object.entries(FALLBACK_EXPANSION_MAP)) {
    if (q.includes(key)) {
      return terms;
    }
  }
  return [];
}

export async function expandKitchenQuery(query) {
  const ai = await getGeminiClient();
  if (!ai) return expandKitchenQueryRuleBased(query);

  try {
    const prompt = `You are a kitchen-aware recipe search engine for Indonesian food.
The user searched for: "${query}"

Return an array of up to 5 highly relevant and popular Indonesian recipe ideas, dish names, or food types related to this query.
If the query is a cooking method, flavor, or ingredient, return specific dishes that use it.
If the query is unclear or not related to food, return an empty array [].

Examples:
Query: "tepung" -> ["bakwan", "tempe mendoan", "cireng", "pisang goreng", "kue"]
Query: "santan" -> ["sayur lodeh", "opor ayam", "rendang", "gulai", "kolak"]
Query: "bakar" -> ["ikan bakar", "ayam bakar", "sate", "iga bakar", "jagung bakar"]

Output MUST be valid JSON, strictly an array of strings. Do not output anything else.`;

    const result = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
    });
    
    const text = result.text.trim();
    const match = text.match(/\[[\s\S]*?\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, 5).filter(t => typeof t === 'string' && t.trim() !== '');
      }
    }
  } catch (e) {
    console.warn('[AI] Gemini expandKitchenQuery failed:', e.message);
  }

  return expandKitchenQueryRuleBased(query);
}

// ─── Rule-based Recipe Assistant Fallback ────────────────────────────────────
const SUBSTITUTION_MAP = {
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

function detectAssistantIntent(q) {
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

export async function askRecipeAssistantRuleBased(question, recipeContext) {
  await new Promise(r => setTimeout(r, 1200)); // Mock thinking delay
  const q = question.toLowerCase();
  const intent = detectAssistantIntent(q);
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
      answer = `Rasaji AI masih belajar!\n\nCoba tanya:\n- "kalo gapunya santan ganti apa"\n- "bikin versi anak kos"\n- "bikin lebih hemat"\n- "bikin lebih pedas"\n- "ringkas langkahnya"`;
      break;
  }

  return { answer };
}

// ─── askRecipeAssistant: Gemini → rule-based fallback ─────────────────────────
export async function askRecipeAssistant(question, recipeContext) {
  const ai = await getGeminiClient();
  if (!ai) return askRecipeAssistantRuleBased(question, recipeContext);

  try {
    const prompt = `You are Tanya Rasaji, a friendly Indonesian cooking buddy for the recipe app "Rasaji".
The user is viewing the following recipe:
Title: ${recipeContext?.title || 'Unknown'}
Category: ${recipeContext?.category || 'Unknown'}
Ingredients: ${Array.isArray(recipeContext?.ingredients) ? recipeContext.ingredients.join(', ') : 'Unknown'}
Steps: ${Array.isArray(recipeContext?.steps) ? recipeContext.steps.join('; ') : 'Unknown'}

User asks: "${question}"

--- PERSONALITY & TONE RULES ---
1. You are a human cooking buddy, NOT a customer service bot. DO NOT say "sebagai AI", "saya siap membantu", "maaf, saya hanya", or "ada pertanyaan lain?".
2. Respond with NATURAL VARIATION. Do not force the same sentence structure or the same opening phrase every time.
3. Be casual, warm, practical, and helpful. Use natural Indonesian. 
4. Light casual phrases are okay ("wkwk", "hehe", "aman kok", "bisa banget", "kalau mau simpel"), but don't overuse slang.
5. Match the user's tone: casual if they are casual, clear/direct if they are serious, and gently redirect if they are random.
6. Keep answers concise. Short paragraphs. DO NOT use Markdown bold (**). DO NOT over-format with bullet points unless explicitly asked for steps.
7. Mention the recipe name ONLY when genuinely useful. Do not repeat it constantly.

--- COOKING KNOWLEDGE BEHAVIOR ---
- Understand Indonesian home cooking, anak kos survival, budget-friendly meals, and flavor balance (gurih, pedas, manis, asam).
- When asked about SUBSTITUTIONS:
  - Say if it can be replaced, skipped, or is essential.
  - Suggest realistic, local alternatives.
  - Briefly explain the effect on taste/texture.
- Answer STRICTLY based on the current recipe context. Do not make up unrelated recipe details. If unsure, admit it naturally without fake confidence.

--- OUT-OF-TOPIC HANDLING ---
If the user asks something completely unrelated to cooking or the current recipe, gently and naturally redirect them back without sounding stiff. Use varied responses, for example:
- "Wkwk yang itu di luar dapur dulu ya. Kalau soal resep ini, aku bisa bantu bagian bahan atau langkahnya."
- "Hehe itu bukan ranah masak dulu. Tapi kalau mau, aku bisa bantu bikin resep ini lebih simpel."
- "Kalau soal itu aku nggak masuk dulu wkwk. Tapi buat resep ini, aku bisa bantu jelasin yang bikin bingung."
(DO NOT use these exact examples every time, vary them naturally).

--- EXAMPLES OF GOOD TONE ---
User: "aku lapar"
Response: "Wkwk timing-nya pas, lagi buka resep juga. Kalau mau cepet, aku bisa bantu ringkas langkahnya biar langsung kebayang mulai dari mana."

User: "kalau santan diganti susu evaporasi gimana?"
Response: "Bisa kok, tapi rasanya bakal lebih ringan dan nggak segurih santan. Buat masakan ini masih aman, cuma tambahin sedikit kemiri atau bawang goreng biar gurihnya kebantu. Masukinnya jangan terlalu lama dimasak biar nggak pecah."

User: "ini susah ga?"
Response: "Nggak terlalu susah kok. Yang penting bumbunya ditumis dulu sampai harum, terus masaknya jangan keburu-buru. Kalau mau versi lebih simpel, bisa aku bantu ringkas."

Provide your answer below (remember: no markdown formatting, natural tone, concise):`;

    const result = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
    });
    const answerText = result.text.trim();
    return { answer: answerText };
  } catch (e) {
    console.warn('[AI] Gemini askRecipeAssistant failed:', e.message);
    return askRecipeAssistantRuleBased(question, recipeContext);
  }
}
