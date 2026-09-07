'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatPrice, formatDate, ORDER_STATUSES } from '@/lib/constants';

export default function ProfileOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (res.ok) {
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error('Sipariş yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    }

    if (session) fetchOrders();
  }, [session]);

  const statusColors = {
    pending: '#f39c12',
    processing: '#3498db',
    shipped: '#9b59b6',
    delivered: '#27ae60',
    cancelled: '#e74c3c',
  };

  if (!session) return null;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-page__header">
          <Link href="/profile" className="profile-page__back">← Profil</Link>
          <h1 className="profile-page__title">📦 Siparişlerim</h1>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="loader" /></div>
        ) : orders.length > 0 ? (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div
                  className="order-card__header"
                  onClick={() => setExpandedOrder(
                    expandedOrder === order._id ? null : order._id
                  )}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="order-card__info">
                    <span className="order-card__id">#{order._id?.slice(-6)}</span>
                    <span className="order-card__date">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="order-card__summary">
                    <span className="order-card__total">{formatPrice(order.totalAmount)}</span>
                    <span
                      className="admin-badge"
                      style={{
                        background: statusColors[order.status] + '20',
                        color: statusColors[order.status],
                      }}
                    >
                      {ORDER_STATUSES[order.status]?.label || order.status}
                    </span>
                    <span className="order-card__expand">
                      {expandedOrder === order._id ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {expandedOrder === order._id && (
                  <div className="order-card__details">
                    <div className="order-card__items">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="order-card__item">
                          <div className="order-card__item-img">
                            <img
                              src={item.product?.images?.[0] || '/images/hero.png'}
                              alt={item.product?.name || 'Ürün'}
                            />
                          </div>
                          <div className="order-card__item-info">
                            <Link
                              href={`/products/${item.product?.slug || item.product?._id}`}
                              className="order-card__item-name"
                            >
                              {item.product?.name || 'Ürün'}
                            </Link>
                            {item.variant?.name && (
                              <span className="order-card__item-variant">{item.variant.name}</span>
                            )}
                          </div>
                          <div className="order-card__item-qty">x{item.quantity}</div>
                          <div className="order-card__item-price">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Sipariş durum çizgisi */}
                    <div className="order-timeline">
                      {['pending', 'processing', 'shipped', 'delivered'].map((step, idx) => {
                        const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
                        const currentIdx = statusOrder.indexOf(order.status);
                        const isActive = idx <= currentIdx;
                        const isCancelled = order.status === 'cancelled';

                        return (
                          <div
                            key={step}
                            className={`order-timeline__step ${isActive && !isCancelled ? 'order-timeline__step--active' : ''} ${isCancelled ? 'order-timeline__step--cancelled' : ''}`}
                          >
                            <div className="order-timeline__dot" />
                            <span className="order-timeline__label">
                              {ORDER_STATUSES[step]?.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">📦</div>
            <h2 className="empty-state__title">Henüz sipariş yok</h2>
            <p className="empty-state__desc">İlk siparişinizi vermek için ürünleri keşfedin!</p>
            <Link href="/products" className="btn btn--primary mt-6">Ürünleri Keşfet</Link>
          </div>
        )}
      </div>
    </div>
  );
}
