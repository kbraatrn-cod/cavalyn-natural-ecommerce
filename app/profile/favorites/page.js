'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { useCart } from '@/context/CartContext';
import { formatPrice, getCategoryLabel } from '@/lib/constants';

export default function ProfileFavoritesPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const { addItem } = useCart();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchFavorites() {
    try {
      const res = await fetch('/api/favorites');
      const data = await res.json();
      if (res.ok) {
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error('Favori yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) fetchFavorites();
  }, [session]);

  const handleRemoveFavorite = async (productId) => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        setFavorites(prev => prev.filter(f => f._id !== productId));
        addToast('Favorilerden çıkarıldı', 'info');
      }
    } catch (error) {
      addToast('Bir hata oluştu', 'error');
    }
  };

  const handleAddToCart = (product) => {
    addItem(product, 1, null);
  };

  if (!session) return null;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-page__header">
          <Link href="/profile" className="profile-page__back">← Profil</Link>
          <h1 className="profile-page__title">❤️ Favorilerim</h1>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="loader" /></div>
        ) : favorites.length > 0 ? (
          <div className="favorites-grid">
            {favorites.map(product => (
              <div key={product._id} className="favorite-card">
                <Link href={`/products/${product.slug || product._id}`} className="favorite-card__image">
                  <img
                    src={product.images?.[0] || '/images/hero.png'}
                    alt={product.name}
                  />
                </Link>
                <div className="favorite-card__info">
                  <div className="favorite-card__category">
                    {getCategoryLabel(product.category)}
                  </div>
                  <Link
                    href={`/products/${product.slug || product._id}`}
                    className="favorite-card__name"
                  >
                    {product.name}
                  </Link>
                  <div className="favorite-card__rating">
                    ⭐ {product.rating?.toFixed(1) || '0.0'} ({product.reviewCount || 0})
                  </div>
                  <div className="favorite-card__price">
                    {product.discountPrice ? (
                      <>
                        <span className="favorite-card__price--current">
                          {formatPrice(product.discountPrice)}
                        </span>
                        <span className="favorite-card__price--old">
                          {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="favorite-card__price--current">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                  <div className="favorite-card__actions">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="btn btn--primary btn--sm"
                      disabled={product.stock <= 0}
                    >
                      {product.stock > 0 ? '🛒 Sepete Ekle' : 'Tükendi'}
                    </button>
                    <button
                      onClick={() => handleRemoveFavorite(product._id)}
                      className="btn btn--secondary btn--sm"
                      title="Favorilerden çıkar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">❤️</div>
            <h2 className="empty-state__title">Henüz favori yok</h2>
            <p className="empty-state__desc">
              Beğendiğiniz ürünleri favorilere ekleyerek kolayca ulaşın!
            </p>
            <Link href="/products" className="btn btn--primary mt-6">Ürünleri Keşfet</Link>
          </div>
        )}
      </div>
    </div>
  );
}
