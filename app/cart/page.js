'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { SITE_CONFIG } from '@/lib/constants';

function formatPrice(price) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(price);
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, itemCount } = useCart();

  const shippingCost = subtotal >= SITE_CONFIG.shippingThreshold ? 0 : SITE_CONFIG.shippingCost;
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state__icon">🛒</div>
            <h1 className="empty-state__title">Sepetiniz Boş</h1>
            <p className="empty-state__desc">
              Henüz sepetinize ürün eklemediniz. Doğal ürünlerimizi keşfetmeye ne dersiniz?
            </p>
            <Link href="/products" className="btn btn--primary btn--lg mt-6">
              Alışverişe Başla
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
          <h1 className="products-page__title">Sepetim ({itemCount} ürün)</h1>
          <button
            className="btn btn--ghost btn--sm"
            onClick={clearCart}
            style={{ color: 'var(--color-error)' }}
          >
            🗑️ Sepeti Temizle
          </button>
        </div>

        <div className="cart-page__grid">
          {/* Sol: Sepet Öğeleri */}
          <div>
            {items.map((item, idx) => (
              <div key={`${item.productId}-${item.variant?.name || idx}`} className="cart-item">
                <div className="cart-item__image">
                  <img
                    src={item.image || '/images/hero.png'}
                    alt={item.name}
                  />
                </div>
                <div>
                  <div className="cart-item__name">{item.name}</div>
                  {item.variant && (
                    <div className="cart-item__variant">Boyut: {item.variant.name}</div>
                  )}
                  <div className="product-detail__quantity" style={{ marginTop: 'var(--space-3)', marginBottom: 0 }}>
                    <button
                      className="product-detail__qty-btn"
                      onClick={() => updateQuantity(
                        item.productId,
                        item.quantity - 1,
                        item.variant?.name
                      )}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="product-detail__qty-value" style={{ fontSize: 'var(--font-size-base)' }}>
                      {item.quantity}
                    </span>
                    <button
                      className="product-detail__qty-btn"
                      onClick={() => updateQuantity(
                        item.productId,
                        item.quantity + 1,
                        item.variant?.name
                      )}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-item__price">
                  {formatPrice((item.discountPrice || item.price) * item.quantity)}
                </div>
                <button
                  className="cart-item__remove"
                  onClick={() => removeItem(item.productId, item.variant?.name)}
                  aria-label="Kaldır"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Sağ: Sipariş Özeti */}
          <div className="cart-summary">
            <div className="cart-summary__title">Sipariş Özeti</div>
            <div className="cart-summary__row">
              <span>Ara Toplam</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="cart-summary__row">
              <span>Kargo</span>
              <span>
                {shippingCost === 0 ? (
                  <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Ücretsiz</span>
                ) : (
                  formatPrice(shippingCost)
                )}
              </span>
            </div>
            {shippingCost > 0 && (
              <div style={{
                padding: 'var(--space-3)',
                background: 'var(--color-primary-50)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-primary-700)',
                marginBottom: 'var(--space-3)',
                textAlign: 'center',
              }}>
                🚚 {formatPrice(SITE_CONFIG.shippingThreshold - subtotal)} daha ekleyin, kargo bedava!
              </div>
            )}
            <div className="cart-summary__total">
              <span>Toplam</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link href="/checkout" className="btn btn--primary btn--lg btn--full mt-6" id="checkout-btn">
              Ödemeye Geç →
            </Link>
            <Link
              href="/products"
              className="btn btn--ghost btn--full mt-2"
              style={{ fontSize: 'var(--font-size-sm)' }}
            >
              ← Alışverişe Devam Et
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
