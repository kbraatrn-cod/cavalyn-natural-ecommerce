'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

function StarRating({ rating }) {
  return (
    <span className="card__stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i}>{i <= Math.round(rating) ? '★' : '☆'}</span>
      ))}
    </span>
  );
}

function formatPrice(price) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(price);
}

export default function ProductCard({ product, categoryLabel }) {
  const { addItem } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product);
  };

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="card" id={`product-card-${product._id}`}>
      <div className="card__image-wrapper">
        <img src={product.images?.[0] || '/images/hero.png'} alt={product.name} />
        {discountPercent > 0 && (
          <span className="card__badge card__badge--sale">
            %{discountPercent} İndirim
          </span>
        )}
        <button className="card__favorite" aria-label="Favorilere ekle">
          ♡
        </button>
      </div>
      <div className="card__body">
        <div className="card__category">{categoryLabel}</div>
        <h3 className="card__title">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="card__rating">
          <StarRating rating={product.rating} />
          <span className="card__review-count">({product.reviewCount})</span>
        </div>
        <div className="card__price-row">
          <div>
            <span className="card__price">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && (
              <span className="card__price--old">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <button
            className="card__add-btn"
            aria-label="Sepete ekle"
            onClick={handleAddToCart}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
