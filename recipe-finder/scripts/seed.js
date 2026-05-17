import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(dbPath);

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim().substring(0, 80);
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

const VERIFIED_RECIPES = [
  {
    title: "Ayam Goreng Lengkuas Rempah",
    category: "Ayam",
    shortDescription: "Ayam goreng klasik dengan taburan serundeng lengkuas yang super gurih dan melimpah.",
    cookingTime: "45 Menit",
    difficulty: "Sedang",
    servings: "4",
    caloriesEstimate: 520,
    likes: 3205,
    tags: ["Lauk Harian", "Ayam", "Gorengan", "Tradisional"],
    keywords: ["ayam goreng", "lengkuas", "serundeng", "rempah", "lauk"],
    ingredients: ["1 ekor ayam pejantan (potong 8 bagian)", "150 gram lengkuas muda (parut kasar)", "2 lembar daun salam & 2 lembar daun jeruk", "1 batang serai (memarkan)", "Bumbu Halus: 8 siung bawang merah, 5 siung bawang putih", "Bumbu Halus: 3 butir kemiri, 1 sdm ketumbar bubuk", "Bumbu Halus: 1 ruas kunyit, 1 ruas jahe", "Garam, kaldu jamur, dan sedikit gula pasir"],
    steps: ["Siapkan wajan besar. Masukkan ayam, bumbu halus, lengkuas parut, daun salam, daun jeruk, dan serai. Aduk rata.", "Tuang air secukupnya hingga ayam setengah terendam. Api sedang.", "Ungkep ayam hingga air menyusut habis dan bumbu meresap sempurna.", "Panaskan minyak. Goreng ayam hingga kuning keemasan.", "Goreng sisa bumbu lengkuas hingga kecoklatan dan renyah (serundeng).", "Taburkan serundeng di atas ayam goreng panas."],
    tips: "Gunakan lengkuas yang masih muda agar serundengnya tidak berserat keras.",
    alternativeIngredients: "Bisa menggunakan ayam broiler, namun kurangi takaran air saat mengungkep."
  },
  {
    title: "Ayam Rica-Rica Khas Manado",
    category: "Ayam",
    shortDescription: "Pedas, wangi, dan menggugah selera! Ayam dimasak dengan bumbu tumbuk kasar dan daun kemangi.",
    cookingTime: "50 Menit",
    difficulty: "Sedang",
    servings: "5",
    caloriesEstimate: 450,
    likes: 2140,
    tags: ["Ayam", "Pedas", "Lauk Harian"],
    keywords: ["rica rica", "manado", "pedas", "kemangi"],
    ingredients: ["1/2 ekor ayam (potong kecil)", "2 ikat daun kemangi", "3 lembar daun jeruk & 1 lembar daun pandan", "1 batang serai (geprek)", "1 buah jeruk nipis", "Bumbu Tumbuk: 15 cabe merah keriting, 10 cabe rawit merah", "Bumbu Tumbuk: 8 bawang merah, 4 bawang putih, 2 cm jahe"],
    steps: ["Kucuri ayam dengan jeruk nipis, goreng setengah matang.", "Tumis bumbu tumbuk kasar dengan daun jeruk, pandan, serai.", "Masukkan ayam goreng ke tumisan bumbu.", "Tuang 150ml air, masak hingga menyusut.", "Masukkan daun kemangi, aduk cepat 30 detik."],
    tips: "Jangan blender bumbu sampai halus; ulek kasar agar teksturnya terasa.",
    alternativeIngredients: "Daun pandan bisa dilewati jika sulit dicari."
  },
  {
    title: "Telur Bumbu Balado Merah",
    category: "Telur",
    shortDescription: "Telur rebus goreng dengan balutan bumbu balado merah yang pedas manis.",
    cookingTime: "25 Menit",
    difficulty: "Mudah",
    servings: "4",
    caloriesEstimate: 210,
    likes: 4520,
    tags: ["Telur", "Pedas", "Cepat & Simpel", "Anak Kos"],
    keywords: ["balado", "telur", "pedas", "simpel"],
    ingredients: ["6 butir telur ayam (rebus, kupas)", "2 lembar daun jeruk", "1 buah tomat merah", "Bumbu Halus: 10 cabe merah keriting, 5 cabe rawit", "Bumbu Halus: 6 bawang merah, 2 bawang putih", "Garam, gula merah, kaldu bubuk"],
    steps: ["Goreng telur rebus hingga berkulit.", "Tumis bumbu halus dan daun jeruk.", "Masukkan tomat, hancurkan.", "Bumbui dengan garam, gula merah, kaldu.", "Masukkan telur, aduk rata."],
    tips: "Taburi wajan dengan sedikit tepung terigu sebelum memasukkan telur agar tidak meletup.",
    alternativeIngredients: "Telur bisa diganti tahu goreng atau kentang dadu goreng."
  },
  {
    title: "Rendang Daging Sapi Padang Asli",
    category: "Daging",
    shortDescription: "Daging sapi dimasak perlahan dalam santan dan rempah hingga menghitam, empuk, dan kaya rasa.",
    cookingTime: "3 Jam",
    difficulty: "Sulit",
    servings: "8",
    caloriesEstimate: 650,
    likes: 8900,
    tags: ["Daging", "Tradisional", "Lauk Harian"],
    keywords: ["rendang", "padang", "sapi", "santan", "rempah"],
    ingredients: ["1 kg Daging Sapi (potong kotak tebal)", "1 liter Santan Kental & 1 liter Santan Cair", "3 lembar daun kunyit, 5 lembar daun jeruk, 2 batang serai", "1 buah asam kandis", "Bumbu Halus: 150g cabe merah keriting", "Bumbu Halus: 15 bawang merah, 7 bawang putih", "Bumbu Halus: 3 cm jahe, 3 cm lengkuas, 2 cm kunyit, 1 sdm ketumbar"],
    steps: ["Masukkan santan cair, bumbu halus, daun-daunan ke wajan besar. Rebus.", "Aduk perlahan agar santan tidak pecah. Masukkan daging.", "Masak terus, tuangkan santan kental saat mulai mengental.", "Kecilkan api, masak berjam-jam sambil terus diaduk.", "Warna akan menggelap. Matikan api saat bumbu mengering."],
    tips: "Gunakan teknik 'menimba' dari bawah ke atas agar daging tidak hancur.",
    alternativeIngredients: "Bumbu rendang cocok untuk ayam kampung, telur rebus, atau paru."
  },
  {
    title: "Tumis Kangkung Terasi Belacan",
    category: "Sayur",
    shortDescription: "Kangkung segar ditumis kilat dengan aroma terasi bakar yang menggoda.",
    cookingTime: "10 Menit",
    difficulty: "Mudah",
    servings: "3",
    caloriesEstimate: 85,
    likes: 5630,
    tags: ["Sayur", "Cepat & Simpel", "Lauk Harian", "Pedas"],
    keywords: ["kangkung", "terasi", "tumis", "simpel"],
    ingredients: ["2 ikat Kangkung (petik daun dan pucuk)", "1 sdt Terasi udang", "5 cabe rawit merah (iris)", "4 bawang merah & 2 bawang putih (iris)", "1 buah tomat merah", "1 sdm saus tiram", "Garam dan kaldu jamur"],
    steps: ["Pastikan kangkung sudah dicuci dan ditiriskan.", "Panaskan minyak hingga benar-benar panas.", "Tumis bawang dan terasi super cepat.", "Masukkan cabe dan tomat.", "Masukkan kangkung, saus tiram, garam. Aduk cepat 1-2 menit."],
    tips: "Api paling besar, durasi memasak sangat singkat.",
    alternativeIngredients: "Bisa ditambahkan telur puyuh rebus atau udang kupas."
  },
  {
    title: "Tahu Crispy Cabe Garam",
    category: "Tahu & Tempe",
    shortDescription: "Tahu sutra berbalut tepung renyah, ditumis dengan bawang putih dan cabe.",
    cookingTime: "25 Menit",
    difficulty: "Mudah",
    servings: "3",
    caloriesEstimate: 310,
    likes: 6720,
    tags: ["Tahu & Tempe", "Camilan", "Pedas", "Cepat & Simpel"],
    keywords: ["tahu", "crispy", "cabe garam", "camilan"],
    ingredients: ["1 buah Tahu Sutra ukuran besar (potong dadu)", "5 sdm tepung maizena & 1 sdt kaldu bubuk", "10 siung bawang putih (cincang halus)", "8 cabe rawit merah & 2 cabe merah keriting", "2 batang daun bawang (iris)", "Garam dan lada putih"],
    steps: ["Tiriskan tahu dari airnya.", "Baluri tepung maizena, goreng renyah.", "Tumis bawang putih dengan api kecil.", "Masukkan cabe dan daun bawang.", "Masukkan tahu, taburi garam dan lada, aduk lempar."],
    tips: "Goreng bawang putih dari saat minyak masih hangat dengan api kecil.",
    alternativeIngredients: "Bisa diaplikasikan untuk jamur tiram, tempe, atau cumi."
  },
  {
    title: "Tempe Mendoan Purwokerto Asli",
    category: "Tahu & Tempe",
    shortDescription: "Tempe lebar berbalut adonan tepung basah dan daun bawang, digoreng setengah matang.",
    cookingTime: "15 Menit",
    difficulty: "Mudah",
    servings: "5",
    caloriesEstimate: 250,
    likes: 4100,
    tags: ["Tahu & Tempe", "Camilan", "Hemat", "Tradisional"],
    keywords: ["mendoan", "tempe", "purwokerto", "gorengan"],
    ingredients: ["1 papan tempe (iris tipis melebar)", "150g tepung terigu", "50g tepung beras", "4 batang daun bawang (iris kasar)", "Bumbu Halus: 3 bawang putih, 1 ruas kencur, 1 sdt ketumbar", "Air es secukupnya", "Garam dan kaldu penyedap"],
    steps: ["Campur tepung terigu, tepung beras, bumbu halus, garam.", "Tuang air es sedikit demi sedikit.", "Masukkan daun bawang.", "Celupkan tempe ke adonan.", "Goreng 2-3 menit saja (setengah matang)."],
    tips: "Aroma khas mendoan berasal dari kencur, jangan lewatkan.",
    alternativeIngredients: "Cocolan wajib: kecap manis, cabe rawit, bawang merah iris."
  },
  {
    title: "Nasi Liwet Sunda Magic Com",
    category: "Nasi",
    shortDescription: "Nasi liwet tradisional dimasak di rice cooker. Gurih beraroma rempah dan ikan asin.",
    cookingTime: "40 Menit",
    difficulty: "Mudah",
    servings: "4",
    caloriesEstimate: 380,
    likes: 3125,
    tags: ["Nasi", "Hemat", "Anak Kos"],
    keywords: ["nasi liwet", "rice cooker", "magic com", "teri"],
    ingredients: ["3 cup beras", "50 gram ikan teri (goreng kering)", "5 bawang merah & 3 bawang putih (iris tipis)", "3 daun salam, 2 serai, 2 daun jeruk", "5 cabe rawit utuh", "Air secukupnya", "Garam, kaldu jamur"],
    steps: ["Tumis bawang hingga layu dan harum.", "Masukkan daun salam, daun jeruk, serai.", "Masukkan beras, air, tumisan ke rice cooker.", "Tambahkan garam, kaldu, cabe rawit. Taburkan setengah teri.", "Cook. Setelah matang, aduk dan taburkan sisa teri."],
    tips: "Minyak sisa menggoreng teri membuat nasi liwet harum dan mengkilap.",
    alternativeIngredients: "Sajikan dengan tahu goreng, ayam goreng, sambal terasi."
  },
  {
    title: "Mie Nyemek Pedas Abang-Abang",
    category: "Mie",
    shortDescription: "Mie rebus kuah kental nyemek, dimasak dengan bumbu ulek yang nendang dan sayur.",
    cookingTime: "15 Menit",
    difficulty: "Mudah",
    servings: "1",
    caloriesEstimate: 510,
    likes: 9550,
    tags: ["Mie", "Pedas", "Cepat & Simpel", "Anak Kos"],
    keywords: ["mie nyemek", "pedas", "mie instan", "anak kos"],
    ingredients: ["1 bungkus Mie Instan rasa Kari Ayam", "1 butir telur", "Segenggam sawi hijau dan irisan kol", "1 batang daun bawang", "Bumbu Ulek: 3 bawang merah, 1 bawang putih, 5 cabe rawit", "1 sdm kecap manis", "1 sdm saus sambal"],
    steps: ["Tumis bumbu ulek hingga harum.", "Sisihkan bumbu, masukkan telur, orak-arik.", "Tuang 250ml air, didihkan.", "Masukkan mie, sawi, kol.", "Masukkan bumbu bawaan mie, kecap, saus sambal. Masak hingga kental."],
    tips: "Kecap manis dan saus sambal yang dikaramelisasi membuat nyemek enak.",
    alternativeIngredients: "Tambahkan sosis, bakso, atau kerupuk pangsit."
  },
  {
    title: "Ikan Nila Bakar Bumbu Kecap",
    category: "Ikan",
    shortDescription: "Ikan bakar manis gurih. Daging lembut, bumbu kecap meresap sampai ke tulang.",
    cookingTime: "40 Menit",
    difficulty: "Sedang",
    servings: "2",
    caloriesEstimate: 320,
    likes: 2100,
    tags: ["Ikan", "Mewah", "Lauk Harian"],
    keywords: ["ikan bakar", "nila", "kecap", "bumbu"],
    ingredients: ["2 ekor ikan nila (kerat-kerat)", "1 jeruk nipis & garam", "Bumbu Oles: 5 sdm kecap manis, 1 sdm mentega cair", "Bumbu Halus: 5 bawang merah, 3 bawang putih", "Bumbu Halus: 1 sdt ketumbar, 2 cm kunyit, 1 cm jahe"],
    steps: ["Cuci ikan, lumuri jeruk nipis dan garam.", "Tumis bumbu halus.", "Campurkan setengah bumbu dengan kecap dan mentega.", "Ungkep ikan sebentar.", "Panggang, olesi bumbu kecap berulang kali."],
    tips: "Mentega cair membuat ikan mengkilat dan tidak mudah lengket.",
    alternativeIngredients: "Ganti ikan nila dengan gurame atau bawal."
  },
  {
    title: "Sambal Matah Bali Asli",
    category: "Sambal",
    shortDescription: "Sambal mentah khas Bali yang wangi, segar, dan meledak di mulut.",
    cookingTime: "10 Menit",
    difficulty: "Mudah",
    servings: "4",
    caloriesEstimate: 95,
    likes: 10450,
    tags: ["Sambal", "Pedas", "Cepat & Simpel"],
    keywords: ["sambal matah", "bali", "mentah", "segar"],
    ingredients: ["15 bawang merah (iris tipis)", "15 cabe rawit merah (iris halus)", "3 batang serai (iris super tipis)", "5 lembar daun jeruk (iris tipis)", "1 sdt terasi bakar", "1 sdt garam", "2 jeruk limau", "4 sdm minyak kelapa"],
    steps: ["Masukkan semua irisan ke mangkuk.", "Tambahkan garam dan kaldu, remas perlahan.", "Panaskan minyak kelapa hingga mendidih.", "Tuangkan minyak panas ke bumbu.", "Kucuri jeruk limau, aduk rata."],
    tips: "Jangan memasak sambal ini. Cukup disiram minyak panas.",
    alternativeIngredients: "Tambahkan bunga kecombrang segar."
  },
  {
    title: "Es Cendol Dawet Gula Aren",
    category: "Minuman",
    shortDescription: "Butiran cendol hijau kenyal berenang di kuah santan dan gula aren legit.",
    cookingTime: "30 Menit",
    difficulty: "Sedang",
    servings: "4",
    caloriesEstimate: 210,
    likes: 2100,
    tags: ["Minuman", "Tradisional", "Manis"],
    keywords: ["cendol", "dawet", "gula aren", "santan"],
    ingredients: ["100g tepung beras, 30g tepung sagu", "500ml air pandan & suji", "400ml santan kelapa, 1/2 sdt garam", "250g gula aren, 100ml air", "Es batu"],
    steps: ["Rebus gula aren dengan air dan daun pandan.", "Rebus santan dengan garam.", "Campur tepung dengan air pandan, masak hingga kental.", "Cetak cendol ke dalam air es.", "Sajikan: gula aren, es batu, cendol, siram santan."],
    tips: "Air es sangat dingin membuat cendol kenyal dan tidak hancur.",
    alternativeIngredients: "Santan bisa diganti susu full cream."
  },
  {
    title: "Fuyunghai ala Warteg",
    category: "Telur",
    shortDescription: "Omelet tebal gaya lokal, renyah di luar empuk di dalam, disiram saus asam manis.",
    cookingTime: "30 Menit",
    difficulty: "Mudah",
    servings: "3",
    caloriesEstimate: 340,
    likes: 1890,
    tags: ["Telur", "Cepat & Simpel", "Anak Kos", "Sayur"],
    keywords: ["fuyunghai", "telur dadar", "warteg", "saus asam manis"],
    ingredients: ["4 butir telur", "50 gram kol (iris tipis)", "1 wortel kecil (parut kasar)", "1 batang daun bawang", "2 sdm tepung tapioka", "Saus: 1/2 bawang bombay, 1 bawang putih, 3 sdm saus tomat, 1 sdt saus tiram"],
    steps: ["Campur telur, kol, wortel, daun bawang, tapioka.", "Goreng di minyak banyak dan panas.", "Balik perlahan. Tiriskan.", "Tumis bawang untuk saus. Tambahkan saus tomat dan tiram.", "Kentalkan dengan maizena. Siram ke fuyunghai."],
    tips: "Larutan tapioka membuat fuyunghai tebal dan keriting.",
    alternativeIngredients: "Tambahkan suwiran ayam atau udang."
  },
  {
    title: "Sengkel Sapi Bumbu Lada Hitam",
    category: "Daging",
    shortDescription: "Irisan sengkel super empuk berlapis saus lada hitam kental dan pedas.",
    cookingTime: "60 Menit",
    difficulty: "Sedang",
    servings: "4",
    caloriesEstimate: 420,
    likes: 2410,
    tags: ["Daging", "Mewah", "Pedas"],
    keywords: ["sengkel", "lada hitam", "sapi", "mewah"],
    ingredients: ["500g Daging Sengkel (rebus empuk, iris tipis)", "1 bawang bombay besar", "1 paprika merah/hijau", "3 bawang putih (cincang)", "1 sdm lada hitam butir (tumbuk kasar)", "3 sdm kecap manis, 2 sdm saus tiram, 1 sdm kecap inggris", "Larutan maizena"],
    steps: ["Rebus sengkel hingga empuk. Iris tipis.", "Tumis bawang putih, bawang bombay, paprika.", "Masukkan irisan daging.", "Masukkan semua saus dan lada hitam.", "Kentalkan dengan larutan maizena."],
    tips: "Gunakan lada hitam butir yang ditumbuk sendiri.",
    alternativeIngredients: "Ganti sengkel dengan tenderloin."
  },
  {
    title: "Sayur Lodeh Labu Siam",
    category: "Sayur",
    shortDescription: "Sayur lodeh rumahan dengan kuah santan kuning yang ringan dan gurih.",
    cookingTime: "30 Menit",
    difficulty: "Mudah",
    servings: "6",
    caloriesEstimate: 150,
    likes: 1240,
    tags: ["Sayur", "Lauk Harian", "Hemat"],
    keywords: ["lodeh", "labu siam", "santan", "sayur"],
    ingredients: ["2 labu siam (potong korek api)", "150g buncis (iris miring)", "1 papan tempe (goreng dadu)", "500ml santan cair & 200ml santan kental", "2 daun salam, 1 lengkuas", "Bumbu Halus: 6 bawang merah, 3 bawang putih, 3 kemiri, 1 kunyit"],
    steps: ["Remas labu siam dengan garam, cuci.", "Tumis bumbu halus dengan daun salam dan lengkuas.", "Tuang santan cair, didihkan.", "Masukkan sayuran dan tempe.", "Tuang santan kental, masak perlahan."],
    tips: "Gula merah adalah kunci keseimbangan rasa lodeh.",
    alternativeIngredients: "Tambahkan cabe ijo, terong, atau kacang panjang."
  }
];

console.log('Seeding verified recipes...');
const now = new Date().toISOString();

const insert = db.prepare(`
  INSERT OR IGNORE INTO Recipe (
    id, slug, title, image, category, shortDescription, fullDescription,
    ingredients, tools, steps, tips, alternativeIngredients,
    cookingTime, difficulty, servings, caloriesEstimate,
    tags, keywords, sourceType, sourceUrl, sourceName,
    status, isVerified, likes, bookmarks, views, createdAt, updatedAt
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?
  )
`);

let seeded = 0;
for (const r of VERIFIED_RECIPES) {
  const id = uuid();
  const slug = slugify(r.title);
  try {
    insert.run(
      id, slug, r.title, null, r.category, r.shortDescription, null,
      JSON.stringify(r.ingredients), null, JSON.stringify(r.steps), r.tips || null, r.alternativeIngredients || null,
      r.cookingTime, r.difficulty, r.servings, r.caloriesEstimate,
      JSON.stringify(r.tags), JSON.stringify(r.keywords), 'internal', null, 'Racikin',
      'verified', 1, r.likes, 0, 0, now, now
    );
    console.log(`  [SEEDED] ${r.title}`);
    seeded++;
  } catch (err) {
    console.log(`  [SKIP] ${r.title}: ${err.message}`);
  }
}

console.log(`\nSeeded ${seeded} verified recipes.`);
console.log(`Total recipes: ${db.prepare('SELECT COUNT(*) as c FROM Recipe').get().c}`);
console.log(`Verified: ${db.prepare("SELECT COUNT(*) as c FROM Recipe WHERE status = 'verified'").get().c}`);
console.log(`Scraped: ${db.prepare("SELECT COUNT(*) as c FROM Recipe WHERE status = 'scraped'").get().c}`);

db.close();
