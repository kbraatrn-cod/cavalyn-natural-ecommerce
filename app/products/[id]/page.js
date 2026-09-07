'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import ProductCard from '@/components/product/ProductCard';
import { CATEGORIES } from '@/lib/constants';

function formatPrice(price) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(price);
}

function getCategoryLabel(slug) {
  const cat = CATEGORIES.find(c => c.value === slug);
  return cat ? cat.label : slug;
}

function StarRating({ rating, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(0);
  return (
    <span className="rating">
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`rating__star ${
            i <= (interactive ? (hovered || rating) : Math.round(rating))
              ? 'rating__star--filled'
              : ''
          }`}
          onClick={() => interactive && onRate && onRate(i)}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          style={interactive ? { cursor: 'pointer', fontSize: '1.5rem' } : {}}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function formatDate(date) {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export default function ProductDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const { addItem } = useCart();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);

  // Favori state
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // Yorum state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${params.id}`);
        const data = await res.json();

        if (res.ok) {
          setProduct(data.product);
          setReviews(data.reviews || []);
          setRelatedProducts(data.relatedProducts || []);
          if (data.product.variants?.length > 0) {
            setSelectedVariant(data.product.variants[0]);
          }
        }
      } catch (error) {
        console.error('Ürün yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.id]);

  // Favori durumunu kontrol et
  useEffect(() => {
    async function checkFavorite() {
      if (!session || !product) return;
      try {
        const res = await fetch('/api/favorites');
        const data = await res.json();
        if (res.ok) {
          const isFav = data.favorites?.some(
            fav => (fav._id || fav) === product._id
          );
          setIsFavorite(isFav);
        }
      } catch (error) {
        console.error('Favori kontrol hatası:', error);
      }
    }
    checkFavorite();
  }, [session, product]);

  // Kullanıcının bu ürüne daha önce yorum yapıp yapmadığını kontrol et
  useEffect(() => {
    if (session && reviews.length > 0) {
      const userReview = reviews.find(r => r.user?._id === session.user.id);
      if (userReview) {
        setHasReviewed(true);
      }
    }
  }, [session, reviews]);

  const handleToggleFavorite = async () => {
    if (!session) {
      addToast('Favorilere eklemek için giriş yapmalısınız', 'warning');
      return;
    }

    setFavLoading(true);
    try {
      if (isFavorite) {
        const res = await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product._id }),
        });
        if (res.ok) {
          setIsFavorite(false);
          addToast('Favorilerden çıkarıldı', 'info');
        }
      } else {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product._id }),
        });
        if (res.ok) {
          setIsFavorite(true);
          addToast('Favorilere eklendi! ❤️', 'success');
        }
      }
    } catch (error) {
      addToast('Bir hata oluştu', 'error');
    } finally {
      setFavLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!session) {
      addToast('Yorum yapmak için giriş yapmalısınız', 'warning');
      return;
    }

    if (reviewRating === 0) {
      addToast('Lütfen bir puan verin', 'warning');
      return;
    }

    if (reviewComment.trim().length < 10) {
      addToast('Yorum en az 10 karakter olmalıdır', 'warning');
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        addToast('Yorumunuz başarıyla eklendi! 🎉', 'success');
        setReviews(prev => [data.review, ...prev]);
        setReviewRating(0);
        setReviewComment('');
        setHasReviewed(true);

        // Ürün puanını güncelle
        setProduct(prev => ({
          ...prev,
          reviewCount: (prev.reviewCount || 0) + 1,
          rating: data.review.rating,
        }));
      } else {
        addToast(data.error || 'Yorum eklenemedi', 'error');
      }
    } catch (error) {
      addToast('Bir hata oluştu', 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader" style={{ paddingTop: '150px' }}>
        <div className="loader" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="empty-state" style={{ paddingTop: '150px' }}>
        <div className="empty-state__icon">😔</div>
        <h2 className="empty-state__title">Ürün Bulunamadı</h2>
        <p className="empty-state__desc">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
        <Link href="/products" className="btn btn--primary mt-6">Ürünlere Dön</Link>
      </div>
    );
  }

  const currentPrice = selectedVariant
    ? product.price + (selectedVariant.priceModifier || 0)
    : product.price;

  const currentDiscountPrice = product.discountPrice
    ? product.discountPrice + (selectedVariant?.priceModifier || 0)
    : null;

  const displayPrice = currentDiscountPrice || currentPrice;

  const stockCount = selectedVariant?.stock ?? product.stock;
  const stockStatus = stockCount > 10
    ? { text: 'Stokta', class: '' }
    : stockCount > 0
      ? { text: `Son ${stockCount} adet!`, class: 'product-detail__stock--low' }
      : { text: 'Tükendi', class: 'product-detail__stock--out' };

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariant);
  };

  return (
    <div className="product-detail">
      <div className="container">
        {/* Breadcrumb */}
        <nav style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-400)' }}>
          <Link href="/" style={{ color: 'var(--color-gray-400)' }}>Ana Sayfa</Link>
          {' / '}
          <Link href="/products" style={{ color: 'var(--color-gray-400)' }}>Ürünler</Link>
          {' / '}
          <Link href={`/products?category=${product.category}`} style={{ color: 'var(--color-gray-400)' }}>
            {getCategoryLabel(product.category)}
          </Link>
          {' / '}
          <span style={{ color: 'var(--color-dark)' }}>{product.name}</span>
        </nav>

        <div className="product-detail__grid">
          {/* Sol: Görsel Galerisi */}
          <div className="product-detail__gallery">
            <div className="product-detail__main-image">
              <img
                src={product.images?.[mainImage] || '/images/hero.png'}
                alt={product.name}
              />
            </div>
            {product.images?.length > 1 && (
              <div className="product-detail__thumbnails">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`product-detail__thumb ${idx === mainImage ? 'product-detail__thumb--active' : ''}`}
                    onClick={() => setMainImage(idx)}
                  >
                    <img src={img} alt={`${product.name} - ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sağ: Ürün Bilgileri */}
          <div className="product-detail__info">
            <div className="product-detail__category">
              {getCategoryLabel(product.category)}
            </div>

            <h1 className="product-detail__title">{product.name}</h1>

            {/* Puan */}
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={product.rating} />
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-400)' }}>
                {product.rating} ({product.reviewCount} değerlendirme)
              </span>
            </div>

            {/* Fiyat */}
            <div className="product-detail__price">
              {formatPrice(displayPrice)}
              {currentDiscountPrice && (
                <span className="product-detail__price--old">
                  {formatPrice(currentPrice)}
                </span>
              )}
            </div>

            {/* İndirim badge */}
            {currentDiscountPrice && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <span className="badge badge--error">
                  %{Math.round(((currentPrice - currentDiscountPrice) / currentPrice) * 100)} İndirim
                </span>
              </div>
            )}

            {/* Açıklama */}
            <p className="product-detail__desc">{product.description}</p>

            {/* Varyantlar */}
            {product.variants?.length > 0 && (
              <div className="product-detail__variants">
                <div className="product-detail__variant-label">Boyut Seçin:</div>
                <div className="product-detail__variant-options">
                  {product.variants.map((v, idx) => (
                    <button
                      key={idx}
                      className={`product-detail__variant-btn ${
                        selectedVariant?.name === v.name ? 'product-detail__variant-btn--active' : ''
                      }`}
                      onClick={() => setSelectedVariant(v)}
                    >
                      {v.name}
                      {v.priceModifier > 0 && (
                        <span style={{ fontSize: 'var(--font-size-xs)', opacity: 0.7 }}>
                          {' '}(+{formatPrice(v.priceModifier)})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Miktar */}
            <div className="product-detail__quantity">
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Adet:</span>
              <button
                className="product-detail__qty-btn"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="product-detail__qty-value">{quantity}</span>
              <button
                className="product-detail__qty-btn"
                onClick={() => setQuantity(q => Math.min(stockCount, q + 1))}
                disabled={quantity >= stockCount}
              >
                +
              </button>
            </div>

            {/* Stok durumu */}
            <div className={`product-detail__stock ${stockStatus.class}`} style={{ marginBottom: 'var(--space-4)' }}>
              <span>{stockCount > 0 ? '●' : '○'}</span>
              <span>{stockStatus.text}</span>
            </div>

            {/* Butonlar */}
            <div className="product-detail__actions">
              <button
                className="btn btn--primary btn--lg"
                onClick={handleAddToCart}
                disabled={stockCount <= 0}
                id="add-to-cart"
                style={{ flex: 1 }}
              >
                {stockCount > 0 ? '🛒 Sepete Ekle' : 'Tükendi'}
              </button>
              <button
                className={`btn btn--secondary btn--lg btn--icon ${isFavorite ? 'btn--favorite-active' : ''}`}
                aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                onClick={handleToggleFavorite}
                disabled={favLoading}
                id="toggle-favorite"
                style={{
                  color: isFavorite ? '#e74c3c' : undefined,
                  fontSize: '1.5rem',
                  transition: 'all 0.3s ease',
                  transform: favLoading ? 'scale(0.9)' : 'scale(1)',
                }}
              >
                {isFavorite ? '❤️' : '♡'}
              </button>
            </div>

            {/* Toplam fiyat */}
            {quantity > 1 && (
              <div style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-primary-50)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-primary-700)',
              }}>
                Toplam: {formatPrice(displayPrice * quantity)}
              </div>
            )}

            {/* Etiketler */}
            {product.tags?.length > 0 && (
              <div className="flex gap-2 mt-6" style={{ flexWrap: 'wrap' }}>
                {product.tags.map(tag => (
                  <span key={tag} className="badge badge--primary">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Yorumlar */}
        <div className="reviews-section">
          <div className="section__header" style={{ textAlign: 'left' }}>
            <h2 className="section__title">Müşteri Yorumları ({product.reviewCount})</h2>
          </div>

          {/* Yorum Yazma Formu */}
          {session && !hasReviewed ? (
            <form className="review-form" onSubmit={handleSubmitReview} id="review-form">
              <h3 className="review-form__title">Yorum Yaz</h3>
              <div className="review-form__rating">
                <span className="review-form__label">Puanınız:</span>
                <StarRating
                  rating={reviewRating}
                  interactive={true}
                  onRate={setReviewRating}
                />
                {reviewRating > 0 && (
                  <span className="review-form__rating-text">
                    {['', 'Çok Kötü', 'Kötü', 'Orta', 'İyi', 'Mükemmel'][reviewRating]}
                  </span>
                )}
              </div>
              <textarea
                className="review-form__textarea"
                placeholder="Bu ürün hakkındaki düşüncelerinizi yazın... (en az 10 karakter)"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                maxLength={1000}
                id="review-comment"
              />
              <div className="review-form__footer">
                <span className="review-form__char-count">
                  {reviewComment.length}/1000
                </span>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={reviewSubmitting || reviewRating === 0 || reviewComment.trim().length < 10}
                  id="submit-review"
                >
                  {reviewSubmitting ? 'Gönderiliyor...' : '✍️ Yorumu Gönder'}
                </button>
              </div>
            </form>
          ) : session && hasReviewed ? (
            <div className="review-form review-form--done">
              <p style={{ textAlign: 'center', color: 'var(--color-primary-600)', fontWeight: 500 }}>
                ✅ Bu ürün için yorumunuz alınmıştır. Teşekkürler!
              </p>
            </div>
          ) : (
            <div className="review-form review-form--login">
              <p style={{ textAlign: 'center' }}>
                Yorum yapmak için{' '}
                <Link href="/login" style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>
                  giriş yapın
                </Link>
              </p>
            </div>
          )}

          {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review._id} className="review-card">
                <div className="review-card__header">
                  <div className="review-card__author">
                    <div className="review-card__avatar">
                      {review.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="review-card__name">{review.user?.name || 'Anonim'}</div>
                      <div className="review-card__date">{formatDate(review.createdAt)}</div>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="review-card__text">{review.comment}</p>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <div className="empty-state__icon">💬</div>
              <h3 className="empty-state__title">Henüz yorum yok</h3>
              <p className="empty-state__desc">
                Bu ürün hakkında ilk yorumu siz yapın!
              </p>
            </div>
          )}
        </div>

        {/* Benzer Ürünler */}
        {relatedProducts.length > 0 && (
          <div className="section" style={{ paddingBottom: 0 }}>
            <div className="section__header">
              <div className="section__label">🌿 Benzer Ürünler</div>
              <h2 className="section__title">Bunları da Beğenebilirsiniz</h2>
            </div>
            <div className="product-grid">
              {relatedProducts.map(rp => (
                <ProductCard
                  key={rp._id}
                  product={rp}
                  categoryLabel={getCategoryLabel(rp.category)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
