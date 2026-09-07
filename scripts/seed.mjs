// Veritabanına örnek ürünler ekleyen seed scripti
// Kullanım: node scripts/seed.mjs

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI tanımlanmalıdır. Değeri .env.local dosyanızdan sağlayın.');
}

const products = [
  // Bitkisel Yağlar
  {
    name: 'Soğuk Sıkım Zeytinyağı',
    description: 'Ege bölgesinin en kaliteli zeytinlerinden soğuk sıkım yöntemiyle elde edilen saf zeytinyağı. Cilt bakımı, saç bakımı ve mutfak kullanımına uygundur. Zengin E vitamini içeriği ile cildinizi besler ve nemlendirir.',
    price: 189.90,
    discountPrice: 149.90,
    category: 'bitkisel-yaglar',
    images: ['/images/category-oils.png'],
    variants: [
      { name: '100ml', value: '100ml', priceModifier: 0, stock: 50 },
      { name: '250ml', value: '250ml', priceModifier: 60, stock: 30 },
      { name: '500ml', value: '500ml', priceModifier: 140, stock: 15 },
    ],
    stock: 95,
    rating: 4.8,
    reviewCount: 124,
    tags: ['zeytinyağı', 'soğuk sıkım', 'organik', 'cilt bakım'],
    featured: true,
    isActive: true,
  },
  {
    name: 'Argan Yağı - Saf',
    description: 'Fas\'tan ithal edilen %100 saf argan yağı. Saç ve cilt bakımında mucizevi etkileri ile bilinir. Kırışıklık önleyici, nemlendirici ve saç onarıcı özellikler taşır.',
    price: 219.90,
    discountPrice: null,
    category: 'bitkisel-yaglar',
    images: ['/images/category-oils.png'],
    variants: [
      { name: '30ml', value: '30ml', priceModifier: 0, stock: 40 },
      { name: '50ml', value: '50ml', priceModifier: 50, stock: 25 },
      { name: '100ml', value: '100ml', priceModifier: 120, stock: 10 },
    ],
    stock: 75,
    rating: 4.9,
    reviewCount: 89,
    tags: ['argan', 'saç bakım', 'cilt bakım', 'anti-aging'],
    featured: true,
    isActive: true,
  },
  {
    name: 'Susam Yağı',
    description: 'Geleneksel yöntemlerle üretilen soğuk sıkım susam yağı. Masaj yağı olarak kullanıma idealdir. Kas ağrılarını hafifletir ve cildi derinlemesine besler.',
    price: 129.90,
    discountPrice: 99.90,
    category: 'bitkisel-yaglar',
    images: ['/images/category-oils.png'],
    stock: 60,
    rating: 4.5,
    reviewCount: 45,
    tags: ['susam yağı', 'masaj', 'organik'],
    featured: false,
    isActive: true,
  },
  {
    name: 'Hindistan Cevizi Yağı',
    description: 'Organik, soğuk sıkım hindistan cevizi yağı. Saç maskesi, cilt nemlendirici ve yemeklerde kullanılabilir. Doğal antibakteriyel özelliğe sahiptir.',
    price: 159.90,
    discountPrice: null,
    category: 'bitkisel-yaglar',
    images: ['/images/category-oils.png'],
    stock: 80,
    rating: 4.7,
    reviewCount: 156,
    tags: ['hindistan cevizi', 'organik', 'çok amaçlı'],
    featured: false,
    isActive: true,
  },

  // Cilt Bakım
  {
    name: 'Doğal Cilt Bakım Seti',
    description: 'Gül suyu tonik, hyaluronik asit serum ve şea yağı nemlendirici içeren 3\'lü doğal cilt bakım seti. Tüm cilt tipleri için uygundur.',
    price: 299.90,
    discountPrice: 249.90,
    category: 'cilt-bakim',
    images: ['/images/category-skincare.png'],
    stock: 25,
    rating: 4.7,
    reviewCount: 56,
    tags: ['cilt bakım seti', 'gül suyu', 'serum', 'nemlendirici'],
    featured: true,
    isActive: true,
  },
  {
    name: 'Hyaluronik Asit Serum',
    description: 'Yoğun nem sağlayan %2 saf hyaluronik asit serumu. İnce çizgileri azaltır, cildi dolgunlaştırır ve parlaklık verir.',
    price: 179.90,
    discountPrice: null,
    category: 'cilt-bakim',
    images: ['/images/category-skincare.png'],
    stock: 45,
    rating: 4.8,
    reviewCount: 112,
    tags: ['serum', 'hyaluronik asit', 'anti-aging', 'nemlendirici'],
    featured: false,
    isActive: true,
  },
  {
    name: 'Gül Suyu Tonik',
    description: 'Isparta güllerinden elde edilen %100 saf gül suyu. Cildi temizler, gözenekleri sıkılaştırır ve doğal parlaklık verir.',
    price: 89.90,
    discountPrice: 69.90,
    category: 'cilt-bakim',
    images: ['/images/category-skincare.png'],
    stock: 70,
    rating: 4.6,
    reviewCount: 98,
    tags: ['gül suyu', 'tonik', 'temizleyici', 'doğal'],
    featured: false,
    isActive: true,
  },
  {
    name: 'C Vitamini Serum',
    description: '%15 C vitamini içeren aydınlatıcı serum. Cilt tonunu eşitler, lekeleri azaltır ve antioksidan koruma sağlar.',
    price: 199.90,
    discountPrice: 169.90,
    category: 'cilt-bakim',
    images: ['/images/category-skincare.png'],
    stock: 35,
    rating: 4.9,
    reviewCount: 67,
    tags: ['c vitamini', 'aydınlatıcı', 'leke giderici', 'serum'],
    featured: true,
    isActive: true,
  },

  // Aromaterapi
  {
    name: 'Lavanta Yağı - Saf',
    description: 'Burdur lavantalarından elde edilen %100 saf lavanta esansiyel yağı. Rahatlatıcı, stres giderici ve uyku düzenleyici özellikler taşır.',
    price: 129.90,
    discountPrice: null,
    category: 'aromaterapi',
    images: ['/images/category-aromatherapy.png'],
    variants: [
      { name: '10ml', value: '10ml', priceModifier: 0, stock: 60 },
      { name: '30ml', value: '30ml', priceModifier: 50, stock: 30 },
    ],
    stock: 90,
    rating: 4.9,
    reviewCount: 89,
    tags: ['lavanta', 'esansiyel yağ', 'rahatlatıcı', 'aromaterapi'],
    featured: true,
    isActive: true,
  },
  {
    name: 'Çay Ağacı Yağı',
    description: 'Avustralya çay ağacından elde edilen saf esansiyel yağ. Antibakteriyel, antifungal ve antiseptik özelliklere sahiptir. Akne ve cilt problemleri için idealdir.',
    price: 109.90,
    discountPrice: 89.90,
    category: 'aromaterapi',
    images: ['/images/category-aromatherapy.png'],
    stock: 55,
    rating: 4.7,
    reviewCount: 134,
    tags: ['çay ağacı', 'antibakteriyel', 'akne', 'esansiyel yağ'],
    featured: false,
    isActive: true,
  },
  {
    name: 'Okaliptüs Yağı',
    description: 'Nefes açıcı ve ferahlatıcı okaliptüs esansiyel yağı. Burun tıkanıklığı, grip ve soğuk algınlığında rahatlama sağlar.',
    price: 99.90,
    discountPrice: null,
    category: 'aromaterapi',
    images: ['/images/category-aromatherapy.png'],
    stock: 40,
    rating: 4.5,
    reviewCount: 72,
    tags: ['okaliptüs', 'nefes açıcı', 'ferahlatıcı'],
    featured: false,
    isActive: true,
  },

  // Doğal Sabunlar
  {
    name: 'El Yapımı Keçi Sütlü Sabun',
    description: 'Keçi sütü, bal ve yulaf ezmesi içeren el yapımı doğal sabun. Hassas ciltler için idealdir. Cildi yumuşatır ve nemlendirir.',
    price: 59.90,
    discountPrice: null,
    category: 'dogal-sabunlar',
    images: ['/images/category-soaps.png'],
    stock: 100,
    rating: 4.6,
    reviewCount: 203,
    tags: ['keçi sütlü', 'el yapımı', 'hassas cilt', 'doğal sabun'],
    featured: true,
    isActive: true,
  },
  {
    name: 'Bıttım Sabunu',
    description: 'Güneydoğu Anadolu\'nun geleneksel bıttım sabunu. Saç dökülmesine karşı etkili, saçı güçlendiren ve parlatan doğal formül.',
    price: 49.90,
    discountPrice: 39.90,
    category: 'dogal-sabunlar',
    images: ['/images/category-soaps.png'],
    stock: 85,
    rating: 4.4,
    reviewCount: 178,
    tags: ['bıttım', 'saç dökülmesi', 'geleneksel', 'doğal sabun'],
    featured: false,
    isActive: true,
  },
  {
    name: 'Defne Sabunu - Halep',
    description: '%40 defne yağı içeren geleneksel Halep sabunu. Egzama, sedef ve akne gibi cilt problemlerine yardımcı olur.',
    price: 69.90,
    discountPrice: null,
    category: 'dogal-sabunlar',
    images: ['/images/category-soaps.png'],
    stock: 65,
    rating: 4.8,
    reviewCount: 145,
    tags: ['defne', 'halep sabunu', 'egzama', 'doğal sabun'],
    featured: false,
    isActive: true,
  },

  // Saç Bakım
  {
    name: 'Argan Saç Bakım Maskesi',
    description: 'Argan yağı, keratin ve E vitamini içeren yoğun saç bakım maskesi. Yıpranmış, kuru ve boyalı saçlar için onarıcı formül.',
    price: 149.90,
    discountPrice: 119.90,
    category: 'sac-bakim',
    images: ['/images/category-oils.png'],
    stock: 40,
    rating: 4.7,
    reviewCount: 91,
    tags: ['argan', 'saç maskesi', 'onarıcı', 'keratin'],
    featured: false,
    isActive: true,
  },
  {
    name: 'Doğal Saç Serumu',
    description: 'Jojoba yağı ve argan yağı karışımı doğal saç serumu. Saçlara parlaklık ve yumuşaklık verir, elektriklenmeyi önler.',
    price: 119.90,
    discountPrice: null,
    category: 'sac-bakim',
    images: ['/images/category-oils.png'],
    stock: 55,
    rating: 4.6,
    reviewCount: 63,
    tags: ['saç serumu', 'jojoba', 'parlaklık', 'doğal'],
    featured: false,
    isActive: true,
  },

  // Vücut Bakım
  {
    name: 'Şea Yağı Vücut Losyonu',
    description: '%100 doğal şea yağı bazlı vücut losyonu. Yoğun nem sağlar, cildi ipeksi yumuşaklığa kavuşturur. Tüm cilt tipleri için uygundur.',
    price: 139.90,
    discountPrice: null,
    category: 'vucut-bakim',
    images: ['/images/category-skincare.png'],
    stock: 50,
    rating: 4.5,
    reviewCount: 77,
    tags: ['şea yağı', 'vücut losyonu', 'nemlendirici'],
    featured: false,
    isActive: true,
  },
  {
    name: 'Tuz Peeling - Lavanta',
    description: 'Deniz tuzu ve lavanta yağı içeren doğal vücut peelingi. Ölü deri hücrelerini temizler, cildi yeniler ve rahatlatır.',
    price: 89.90,
    discountPrice: 74.90,
    category: 'vucut-bakim',
    images: ['/images/category-skincare.png'],
    stock: 35,
    rating: 4.3,
    reviewCount: 54,
    tags: ['peeling', 'tuz', 'lavanta', 'vücut bakım'],
    featured: false,
    isActive: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    // Mevcut ürünleri sil
    await mongoose.connection.collection('products').deleteMany({});
    console.log('🗑️  Mevcut ürünler temizlendi');

    // Slug oluştur ve ürünleri ekle
    const productsWithSlug = products.map(p => ({
      ...p,
      slug: p.name
        .toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    }));

    await mongoose.connection.collection('products').insertMany(productsWithSlug);
    console.log(`🌱 ${productsWithSlug.length} ürün eklendi!`);

    // Ürün listesini yazdır
    productsWithSlug.forEach(p => {
      const disc = p.discountPrice ? ` (indirimli: ${p.discountPrice}₺)` : '';
      console.log(`   → ${p.name} - ${p.price}₺${disc}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Seed tamamlandı!');
  } catch (error) {
    console.error('❌ Seed hatası:', error);
    process.exit(1);
  }
}

seed();
