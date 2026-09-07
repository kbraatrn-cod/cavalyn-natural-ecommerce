'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

export default function ProfilePage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [stats, setStats] = useState({ orders: 0, favorites: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [ordersRes, favsRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/favorites'),
        ]);

        const ordersData = await ordersRes.json();
        const favsData = await favsRes.json();

        setStats({
          orders: ordersData.orders?.length || 0,
          favorites: favsData.favorites?.length || 0,
        });
      } catch (error) {
        console.error('Profil istatistik hatası:', error);
      }
    }

    if (session) fetchStats();
  }, [session]);

  if (!session) return null;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-header__avatar">
            {session.user.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="profile-header__info">
            <h1 className="profile-header__name">{session.user.name}</h1>
            <p className="profile-header__email">{session.user.email}</p>
            {session.user.role === 'admin' && (
              <span className="badge badge--primary" style={{ marginTop: 8 }}>👑 Admin</span>
            )}
          </div>
        </div>

        <div className="profile-stats">
          <div className="profile-stat-card">
            <div className="profile-stat-card__icon">📦</div>
            <div className="profile-stat-card__value">{stats.orders}</div>
            <div className="profile-stat-card__label">Siparişlerim</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-card__icon">❤️</div>
            <div className="profile-stat-card__value">{stats.favorites}</div>
            <div className="profile-stat-card__label">Favorilerim</div>
          </div>
        </div>

        <div className="profile-menu">
          <Link href="/profile/orders" className="profile-menu__item">
            <span className="profile-menu__item-icon">📦</span>
            <div className="profile-menu__item-content">
              <div className="profile-menu__item-title">Siparişlerim</div>
              <div className="profile-menu__item-desc">Sipariş geçmişinizi görüntüleyin</div>
            </div>
            <span className="profile-menu__item-arrow">→</span>
          </Link>

          <Link href="/profile/favorites" className="profile-menu__item">
            <span className="profile-menu__item-icon">❤️</span>
            <div className="profile-menu__item-content">
              <div className="profile-menu__item-title">Favorilerim</div>
              <div className="profile-menu__item-desc">Favori ürünlerinizi yönetin</div>
            </div>
            <span className="profile-menu__item-arrow">→</span>
          </Link>

          {session.user.role === 'admin' && (
            <Link href="/admin" className="profile-menu__item profile-menu__item--admin">
              <span className="profile-menu__item-icon">⚙️</span>
              <div className="profile-menu__item-content">
                <div className="profile-menu__item-title">Admin Panel</div>
                <div className="profile-menu__item-desc">Site yönetim paneline gidin</div>
              </div>
              <span className="profile-menu__item-arrow">→</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
