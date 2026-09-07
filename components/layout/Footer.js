import Link from 'next/link';
import { SITE_CONFIG, CATEGORIES } from '@/lib/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="main-footer">
      <div className="footer__top">
        {/* Marka */}
        <div className="footer__brand">
          <Link href="/" className="navbar__logo">
            <img src="/images/logo.png" alt="Cavalyn" className="navbar__logo-img" />
          </Link>
          <p className="footer__brand-desc">
            {SITE_CONFIG.description}. Tüm ürünlerimiz özenle seçilmiş,
            kaliteli ve güvenilir içeriklerle hazırlanmaktadır.
            Güzelliğiniz için en iyi ürünleri sunuyoruz.
          </p>
          {SITE_CONFIG.trendyolUrl && (
            <a
              href={SITE_CONFIG.trendyolUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer__trendyol-link"
            >
              🛍️ Trendyol Mağazamız
            </a>
          )}
        </div>

        {/* Kategoriler */}
        <div>
          <h4 className="footer__heading">Kategoriler</h4>
          {CATEGORIES.slice(0, 5).map(cat => (
            <Link
              key={cat.value}
              href={`/products?category=${cat.value}`}
              className="footer__link"
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Hızlı Linkler */}
        <div>
          <h4 className="footer__heading">Hızlı Linkler</h4>
          <Link href="/products" className="footer__link">Tüm Ürünler</Link>
          <Link href="/about" className="footer__link">Hakkımızda</Link>
          <Link href="/contact" className="footer__link">İletişim</Link>
          <Link href="/faq" className="footer__link">Sıkça Sorulan Sorular</Link>
        </div>

        {/* Müşteri Hizmetleri */}
        <div>
          <h4 className="footer__heading">Müşteri Hizmetleri</h4>
          <Link href="/shipping" className="footer__link">Kargo Bilgileri</Link>
          <Link href="/returns" className="footer__link">İade & Değişim</Link>
          <Link href="/privacy" className="footer__link">Gizlilik Politikası</Link>
          <Link href="/terms" className="footer__link">Kullanım Koşulları</Link>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© {currentYear} {SITE_CONFIG.name}. Tüm hakları saklıdır. ✨ {SITE_CONFIG.tagline}</p>
      </div>
    </footer>
  );
}
