'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { SITE_CONFIG } from '@/lib/constants';

function formatPrice(price) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(price);
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { addToast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const shippingCost = subtotal >= SITE_CONFIG.shippingThreshold ? 0 : SITE_CONFIG.shippingCost;
  const total = subtotal + shippingCost;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Ad Soyad gerekli';
    if (!formData.phone.trim()) newErrors.phone = 'Telefon gerekli';
    if (!formData.address.trim()) newErrors.address = 'Adres gerekli';
    if (!formData.city.trim()) newErrors.city = 'Şehir gerekli';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            variant: item.variant,
          })),
          shippingAddress: formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          addToast('Sipariş vermek için giriş yapmanız gerekiyor', 'warning');
          router.push('/login?callbackUrl=/checkout');
          return;
        }
        addToast(data.error || 'Sipariş oluşturulamadı', 'error');
        return;
      }

      // Başarılı sipariş
      clearCart();
      router.push(`/checkout/success?orderId=${data.order.id}`);

    } catch (error) {
      addToast('Bir hata oluştu, lütfen tekrar deneyin', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state__icon">🛒</div>
            <h1 className="empty-state__title">Sepetiniz Boş</h1>
            <p className="empty-state__desc">Ödeme yapabilmek için önce sepetinize ürün eklemeniz gerekiyor.</p>
            <Link href="/products" className="btn btn--primary btn--lg mt-6">
              Alışverişe Başla
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="products-page__title mb-8">Ödeme</h1>

        <form onSubmit={handleSubmit}>
          <div className="checkout-page__grid">
            {/* Sol: Teslimat Bilgileri */}
            <div>
              <div className="checkout-section">
                <h2 className="checkout-section__title">
                  <span>📍</span> Teslimat Bilgileri
                </h2>
                <div className="checkout-form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="checkout-fullname">Ad Soyad *</label>
                    <input
                      type="text"
                      id="checkout-fullname"
                      name="fullName"
                      className={`form-input ${errors.fullName ? 'form-input--error' : ''}`}
                      placeholder="Ad Soyad"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                    {errors.fullName && <span className="form-error">{errors.fullName}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="checkout-phone">Telefon *</label>
                    <input
                      type="tel"
                      id="checkout-phone"
                      name="phone"
                      className={`form-input ${errors.phone ? 'form-input--error' : ''}`}
                      placeholder="05XX XXX XX XX"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && <span className="form-error">{errors.phone}</span>}
                  </div>

                  <div className="form-group form-group--full">
                    <label className="form-label" htmlFor="checkout-address">Adres *</label>
                    <textarea
                      id="checkout-address"
                      name="address"
                      className={`form-textarea ${errors.address ? 'form-input--error' : ''}`}
                      placeholder="Mahalle, sokak, bina no, daire no..."
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                    />
                    {errors.address && <span className="form-error">{errors.address}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="checkout-city">Şehir *</label>
                    <input
                      type="text"
                      id="checkout-city"
                      name="city"
                      className={`form-input ${errors.city ? 'form-input--error' : ''}`}
                      placeholder="İstanbul"
                      value={formData.city}
                      onChange={handleChange}
                    />
                    {errors.city && <span className="form-error">{errors.city}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="checkout-zip">Posta Kodu</label>
                    <input
                      type="text"
                      id="checkout-zip"
                      name="zip"
                      className="form-input"
                      placeholder="34000"
                      value={formData.zip}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Ödeme Yöntemi */}
              <div className="checkout-section">
                <h2 className="checkout-section__title">
                  <span>💳</span> Ödeme Yöntemi
                </h2>
                <div
                  style={{
                    padding: 'var(--space-4)',
                    background: 'var(--color-primary-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid var(--color-primary-400)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                  }}
                >
                  <input type="radio" checked readOnly id="payment-cod" />
                  <label htmlFor="payment-cod" style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                    🚚 Kapıda Ödeme
                  </label>
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)', marginTop: 'var(--space-3)' }}>
                  Siparişinizi teslim alırken nakit veya kredi kartı ile ödeme yapabilirsiniz.
                </p>
              </div>

              {/* Sipariş Notu */}
              <div className="checkout-section">
                <h2 className="checkout-section__title">
                  <span>📝</span> Sipariş Notu (Opsiyonel)
                </h2>
                <textarea
                  name="notes"
                  className="form-textarea"
                  placeholder="Sipariş ile ilgili özel bir notunuz varsa buraya yazabilirsiniz..."
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>

            {/* Sağ: Sipariş Özeti */}
            <div className="checkout-summary">
              <div className="cart-summary__title">Sipariş Özeti</div>

              {/* Ürünler */}
              {items.map((item, idx) => (
                <div key={`${item.productId}-${idx}`} className="checkout-summary__item">
                  <div className="checkout-summary__item-image">
                    <img src={item.image || '/images/hero.png'} alt={item.name} />
                  </div>
                  <div className="checkout-summary__item-info">
                    <div className="checkout-summary__item-name">{item.name}</div>
                    <div className="checkout-summary__item-detail">
                      {item.variant && `${item.variant.name} · `}{item.quantity} adet
                    </div>
                  </div>
                  <div className="checkout-summary__item-price">
                    {formatPrice((item.discountPrice || item.price) * item.quantity)}
                  </div>
                </div>
              ))}

              {/* Toplam */}
              <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-gray-200)' }}>
                <div className="cart-summary__row">
                  <span>Ara Toplam</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="cart-summary__row">
                  <span>Kargo</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Ücretsiz</span>
                    ) : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="cart-summary__total">
                  <span>Toplam</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--lg btn--full mt-6"
                disabled={loading}
                id="place-order"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="loader loader--sm" /> Sipariş Veriliyor...
                  </span>
                ) : (
                  `Siparişi Onayla — ${formatPrice(total)}`
                )}
              </button>

              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)', textAlign: 'center', marginTop: 'var(--space-3)' }}>
                🔒 Bilgileriniz güvenle korunmaktadır
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
