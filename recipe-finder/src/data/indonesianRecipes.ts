import type { Recipe } from '../types';

export const INDONESIAN_RECIPES: Recipe[] = [
  {
    id: "r1",
    title: "Nasi Goreng Kampung",

    category: "Nasi",
    shortDescription: "Nasi goreng simpel ala rumahan dengan bumbu ulek yang harum dan pedas manis.",
    cookingTime: "15 Menit",
    difficulty: "Mudah",
    servings: 2,
    caloriesEstimate: 450,
    likes: 1205,
    tags: ["Cepat & Simpel", "Nasi & Mie", "Pedas"],
    ingredients: [
      "2 piring Nasi Putih dingin",
      "2 butir Telur",
      "3 siung Bawang Merah",
      "2 siung Bawang Putih",
      "3 buah Cabe Rawit",
      "1 sdm Kecap Manis",
      "Garam dan lada secukupnya"
    ],
    steps: [
      "Haluskan bawang merah, bawang putih, dan cabe.",
      "Panaskan minyak, tumis bumbu halus hingga harum.",
      "Sisihkan bumbu di tepi wajan, masukkan telur dan orak-arik.",
      "Masukkan nasi putih, aduk rata dengan bumbu dan telur.",
      "Tambahkan kecap manis, garam, dan lada. Masak hingga matang dan sajikan hangat."
    ],
    tips: "Gunakan nasi yang sudah diinapkan semalaman di kulkas agar tidak lembek saat digoreng.",
    alternativeIngredients: "Ganti cabe rawit dengan cabe merah besar jika tidak suka terlalu pedas."
  },
  {
    id: "r2",
    title: "Ayam Geprek Spesial",

    category: "Ayam",
    shortDescription: "Ayam goreng tepung renyah yang digeprek hancur dengan sambal bawang super pedas.",
    cookingTime: "30 Menit",
    difficulty: "Sedang",
    servings: 4,
    caloriesEstimate: 520,
    likes: 980,
    tags: ["Lauk Harian", "Ayam", "Pedas"],
    ingredients: [
      "500g Dada Ayam fillet",
      "1 bungkus Tepung Bumbu Serbaguna",
      "10 buah Cabe Rawit Merah",
      "3 siung Bawang Putih",
      "Minyak panas secukupnya",
      "Garam dan penyedap rasa"
    ],
    steps: [
      "Baluri ayam dengan tepung bumbu basah, lalu gulingkan ke tepung bumbu kering.",
      "Goreng ayam dalam minyak panas hingga kuning keemasan dan renyah. Tiriskan.",
      "Ulek kasar cabe rawit, bawang putih, garam, dan penyedap.",
      "Siram sambal ulek dengan 2 sdm minyak panas sisa menggoreng ayam.",
      "Letakkan ayam di atas piring, lalu geprek bersama sambal hingga merata."
    ],
    tips: "Siraman minyak panas sangat penting untuk mematangkan bawang putih mentah pada sambal.",
  },
  {
    id: "r3",
    title: "Sayur Asem Segar",

    category: "Sayur",
    shortDescription: "Sayur kuah asam segar dengan isian melinjo, jagung manis, dan kacang panjang.",
    cookingTime: "40 Menit",
    difficulty: "Sedang",
    servings: 5,
    caloriesEstimate: 120,
    likes: 845,
    tags: ["Sayur", "Sehat", "Lauk Harian"],
    ingredients: [
      "1 ikat Kacang Panjang (potong)",
      "1 buah Jagung Manis (potong melintang)",
      "50g Buah Melinjo",
      "1 genggam Daun Melinjo",
      "1 buah Labu Siam (potong dadu)",
      "3 sdm Asam Jawa",
      "1 blok Kaldu Sapi",
      "Bumbu halus: 5 Bawang merah, 3 Bawang putih, 3 Cabe merah, 1 sdt terasi"
    ],
    steps: [
      "Rebus air hingga mendidih. Masukkan bumbu halus dan jagung serta melinjo.",
      "Masak hingga jagung dan melinjo empuk.",
      "Masukkan labu siam dan kacang panjang, didihkan kembali.",
      "Tambahkan air asam jawa, kaldu, garam, dan sedikit gula. Aduk rata.",
      "Terakhir masukkan daun melinjo, masak sebentar lalu angkat."
    ],
    tips: "Sajikan bersama ikan asin dan sambal terasi untuk kenikmatan maksimal."
  },
  {
    id: "r4",
    title: "Telur Dadar Padang",

    category: "Telur",
    shortDescription: "Telur dadar tebal, gurih, dan mengembang sempurna ala restoran Padang.",
    cookingTime: "15 Menit",
    difficulty: "Mudah",
    servings: 3,
    caloriesEstimate: 210,
    likes: 1540,
    tags: ["Anak Kos", "Hemat", "Telur", "Cepat & Simpel"],
    ingredients: [
      "4 butir Telur Bebek (atau ayam)",
      "2 sdm Tepung Beras",
      "1 batang Daun Bawang (iris tipis)",
      "3 siung Bawang Merah (iris)",
      "1 lembar Daun Kunyit (iris sangat halus)",
      "1 sdm Bumbu Merah Dasar (Cabe ulek)",
      "Minyak agak banyak untuk menggoreng"
    ],
    steps: [
      "Kocok lepas telur bersama bumbu merah, bawang merah, daun bawang, dan daun kunyit.",
      "Tambahkan tepung beras, aduk rata hingga tidak ada yang bergerindil.",
      "Panaskan minyak agak banyak di wajan cekung sampai benar-benar panas.",
      "Tuang adonan telur. Gunakan api sedang cenderung kecil agar matang hingga ke dalam.",
      "Balik perlahan ketika bagian bawah sudah kokoh dan kecoklatan. Angkat dan potong-potong."
    ],
    tips: "Gunakan telur bebek agar hasilnya lebih gurih dan tebal. Pastikan minyak benar-benar panas saat telur dituang."
  },
  {
    id: "r5",
    title: "Orek Tempe Manis Pedas",

    category: "Tahu & Tempe",
    shortDescription: "Tempe goreng renyah yang dimasak dengan bumbu kecap manis dan irisan cabe.",
    cookingTime: "25 Menit",
    difficulty: "Mudah",
    servings: 4,
    caloriesEstimate: 280,
    likes: 1102,
    tags: ["Anak Kos", "Hemat", "Lauk Harian"],
    ingredients: [
      "1 papan Tempe (potong korek api)",
      "4 siung Bawang Merah",
      "2 siung Bawang Putih",
      "3 buah Cabe Merah Besar (iris serong)",
      "3 sdm Kecap Manis",
      "1 ruas Lengkuas (geprek)",
      "1 lembar Daun Salam"
    ],
    steps: [
      "Goreng tempe hingga kering dan renyah. Angkat dan tiriskan.",
      "Tumis bawang merah, bawang putih, lengkuas, dan daun salam hingga wangi.",
      "Masukkan irisan cabe merah, aduk sebentar.",
      "Tambahkan kecap manis, sedikit air, garam, dan penyedap. Masak hingga bumbu agak mengental.",
      "Masukkan tempe goreng, aduk cepat hingga bumbu merata. Angkat."
    ],
    alternativeIngredients: "Bisa ditambahkan kacang tanah goreng agar lebih renyah dan gurih."
  },
  {
    id: "r6",
    title: "Mie Goreng Tek Tek",

    category: "Mie",
    shortDescription: "Mie goreng gerobakan dengan aroma bumbu kemiri yang kuat dan gurih.",
    cookingTime: "20 Menit",
    difficulty: "Mudah",
    servings: 2,
    caloriesEstimate: 420,
    likes: 2310,
    tags: ["Nasi & Mie", "Cepat & Simpel", "Lauk Harian"],
    ingredients: [
      "1 bungkus Mie Telur Kering (rebus matang)",
      "1 butir Telur",
      "3 lembar Kol (iris kasar)",
      "1 batang Sawi Hijau",
      "2 sdm Kecap Manis",
      "1 sdm Saus Tiram",
      "Bumbu halus: 3 Bawang merah, 2 Bawang putih, 2 butir Kemiri"
    ],
    steps: [
      "Panaskan sedikit minyak, masukkan telur dan orak-arik. Sisihkan di pinggir wajan.",
      "Masukkan bumbu halus, tumis hingga matang dan harum.",
      "Masukkan sayuran (kol, sawi), aduk hingga agak layu.",
      "Masukkan mie rebus. Tambahkan kecap manis, saus tiram, lada, dan garam.",
      "Aduk cepat dengan api besar hingga bumbu merata dan tercium aroma bakaran. Sajikan."
    ]
  },
  {
    id: "r7",
    title: "Soto Ayam Kuah Kuning",

    category: "Ayam",
    shortDescription: "Soto ayam dengan kuah kaldu segar bumbu kuning lengkap dengan koya.",
    cookingTime: "60 Menit",
    difficulty: "Sedang",
    servings: 6,
    caloriesEstimate: 310,
    likes: 3120,
    tags: ["Lauk Harian", "Sayur", "Ayam"],
    ingredients: [
      "1/2 ekor Ayam",
      "1 batang Serai (geprek)",
      "3 lembar Daun Jeruk",
      "Bumbu Halus: 6 Bawang merah, 4 Bawang putih, 2 ruas Kunyit, 1 sdt Ketumbar",
      "Pelengkap: Soun, Tauge, Kol, Telur Rebus, Jeruk Nipis"
    ],
    steps: [
      "Rebus ayam dengan 1.5 liter air hingga matang dan berkaldu. Angkat ayam, suwir-suwir dagingnya.",
      "Tumis bumbu halus bersama serai dan daun jeruk hingga harum dan matang.",
      "Masukkan tumisan bumbu ke dalam kuah kaldu ayam. Beri garam dan gula, didihkan.",
      "Siapkan mangkuk, tata soun, tauge, kol, dan ayam suwir.",
      "Siram dengan kuah soto panas. Sajikan dengan telur rebus, jeruk nipis, dan sambal."
    ]
  },
  {
    id: "r8",
    title: "Es Teh Kampul",

    category: "Minuman",
    shortDescription: "Es teh manis segar khas Solo dengan irisan jeruk peras yang mengambang.",
    cookingTime: "5 Menit",
    difficulty: "Mudah",
    servings: 1,
    caloriesEstimate: 90,
    likes: 755,
    tags: ["Cepat & Simpel"],
    ingredients: [
      "1 kantong Teh Celup (aroma melati)",
      "2 sdm Gula Pasir",
      "1 buah Jeruk Peras / Jeruk Nipis (iris tipis)",
      "Es Batu secukupnya",
      "200ml Air Panas"
    ],
    steps: [
      "Seduh teh celup dengan air panas hingga warnanya pekat.",
      "Tambahkan gula pasir, aduk hingga larut sepenuhnya.",
      "Siapkan gelas berisi es batu, tuang teh manis.",
      "Masukkan 2-3 irisan jeruk ke dalam gelas. Aduk sebentar agar aroma jeruk keluar.",
      "Nikmati selagi dingin."
    ]
  }
];
