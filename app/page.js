import Link from 'next/link';
import { SITE_CONFIG, CATEGORIES } from '@/lib/constants';
import NewsletterForm from '@/components/ui/NewsletterForm';
import ProductCard from '@/components/product/ProductCard';

// Örnek öne çıkan ürünler (daha sonra API'den çekilecek)
const featuredProducts = [
  {
    _id: '1',
    name: 'Profesyonel İpek Kirpik Seti',
    slug: 'profesyonel-ipek-kirpik-seti',
    price: 249.90,
    discountPrice: 189.90,
    category: 'kirpik',
    rating: 4.8,
    reviewCount: 124,
    images: ['/images/hero.png'],
    featured: true,
  },
  {
    _id: '2',
    name: 'Doğal Cilt Bakım Serumu',
    slug: 'dogal-cilt-bakim-serumu',
    price: 179.90,
    discountPrice: null,
    category: 'cilt-bakim',
    rating: 4.9,
    reviewCount: 89,
    images: ['/images/hero.png'],
    featured: true,
  },
  {
    _id: '3',
    name: 'Kalıcı Mat Ruj Seti',
    slug: 'kalici-mat-ruj-seti',
    price: 299.90,
    discountPrice: 249.90,
    category: 'makyaj',
    rating: 4.7,
    reviewCount: 56,
    images: ['/images/hero.png'],
    featured: true,
  },
  {
    _id: '4',
    name: 'Keratin Saç Bakım Maskesi',
    slug: 'keratin-sac-bakim-maskesi',
    price: 159.90,
    discountPrice: null,
    category: 'sac-bakim',
    rating: 4.6,
    reviewCount: 203,
    images: ['/images/hero.png'],
    featured: true,
  },
];

function getCategoryLabel(slug) {
  const cat = CATEGORIES.find(c => c.value === slug);
  return cat ? cat.label : slug;
}

export default function Home() {
  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="hero" id="hero-section">
        <div className="hero__bg">
          <img src="/images/hero.png" alt="Cavalyn güzellik ürünleri" />
          <div className="hero__overlay" />
        </div>
        <div className="hero__content">
          <div className="hero__text">
            <div className="hero__label">
              ✨ Doğal & Premium Güzellik
            </div>
            <h1 className="hero__title">
              Güzelliğinize <span>Değer Katın</span>
            </h1>
            <p className="hero__desc">
              Profesyonel güzellik ürünleri, cilt bakım ve makyaj koleksiyonumuzla
              kendinizi özel hissedin. Tüm ürünlerimiz özenle seçilmiş
              ve kalite testlerinden geçmiştir.
            </p>
            <div className="hero__actions">
              <Link href="/products" className="btn btn--primary btn--lg">
                Ürünleri Keşfet
              </Link>
              <Link href="/products?featured=true" className="btn btn--secondary btn--lg">
                En Çok Satanlar
              </Link>
            </div>
            <div className="hero__stats">
              <div>
                <div className="hero__stat-value">200+</div>
                <div className="hero__stat-label">Premium Ürün</div>
              </div>
              <div>
                <div className="hero__stat-value">15K+</div>
                <div className="hero__stat-label">Mutlu Müşteri</div>
              </div>
              <div>
                <div className="hero__stat-value">%100</div>
                <div className="hero__stat-label">Güvenilir</div>
              </div>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__image-container">
              <img src="/images/hero.png" alt="Cavalyn güzellik koleksiyonu" />
            </div>
            <div className="hero__float-card" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>💎</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Premium Kalite</div>
                <div style={{ fontSize: '0.75rem', color: '#A0929A' }}>Sertifikalı ürünler</div>
              </div>
            </div>
            <div className="hero__float-card" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>⭐</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>4.9 Puan</div>
                <div style={{ fontSize: '0.75rem', color: '#A0929A' }}>5,000+ Değerlendirme</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== KATEGORİLER ===== */}
      <section className="section" id="categories-section">
        <div className="container">
          <div className="section__header">
            <div className="section__label">💄 Kategoriler</div>
            <h2 className="section__title">Koleksiyonlarımızı Keşfedin</h2>
            <p className="section__desc">
              Güzellik rutininizi tamamlayacak premium ürün kategorilerimize göz atın
            </p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.slice(0, 4).map(cat => (
              <Link
                key={cat.value}
                href={`/products?category=${cat.value}`}
                className="category-card"
              >
                <img
                  className="category-card__image"
                  src={'/images/hero.png'}
                  alt={cat.label}
                />
                <div className="category-card__overlay" />
                <div className="category-card__content">
                  <div className="category-card__name">{cat.label}</div>
                  <div className="category-card__count">{cat.count} ürün</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ÖNE ÇIKAN ÜRÜNLER ===== */}
      <section className="section" id="featured-section" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="section__header">
            <div className="section__label">⭐ Öne Çıkanlar</div>
            <h2 className="section__title">En Sevilen Ürünler</h2>
            <p className="section__desc">
              Müşterilerimizin en çok tercih ettiği güzellik ürünleri
            </p>
          </div>
          <div className="product-grid">
            {featuredProducts.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                categoryLabel={getCategoryLabel(product.category)}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/products" className="btn btn--secondary btn--lg">
              Tüm Ürünleri Gör →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== NEDEN BİZ ===== */}
      <section className="section" id="features-section">
        <div className="container">
          <div className="section__header">
            <div className="section__label">💎 Farkımız</div>
            <h2 className="section__title">Neden Cavalyn?</h2>
            <p className="section__desc">
              Güzellik yolculuğunuzda size eşlik eden güvenilir partneriniz
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card__icon">✨</div>
              <h3 className="feature-card__title">Premium Kalite</h3>
              <p className="feature-card__desc">
                Tüm ürünlerimiz dermatolog testlerinden geçmiştir.
                Cildinize en iyi bakımı sunuyoruz.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">🔬</div>
              <h3 className="feature-card__title">Sertifikalı Ürünler</h3>
              <p className="feature-card__desc">
                Her ürünümüz uluslararası kalite standartlarına uygun
                üretilmekte ve sertifikalandırılmaktadır.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">🚚</div>
              <h3 className="feature-card__title">Hızlı Kargo</h3>
              <p className="feature-card__desc">
                {SITE_CONFIG.shippingThreshold}₺ üzeri siparişlerde ücretsiz kargo.
                1-3 iş günü içinde teslimat.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">💜</div>
              <h3 className="feature-card__title">Müşteri Memnuniyeti</h3>
              <p className="feature-card__desc">
                15.000+ mutlu müşteri. 14 gün içinde koşulsuz iade garantisi
                sunuyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="section" id="newsletter-section">
        <div className="container">
          <div className="newsletter">
            <h2 className="newsletter__title">Güzellik Haberleri ✨</h2>
            <p className="newsletter__desc">
              Yeni ürünler, kampanyalar ve güzellik ipuçları için
              bültenimize abone olun. İlk siparişinizde %10 indirim kazanın!
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
