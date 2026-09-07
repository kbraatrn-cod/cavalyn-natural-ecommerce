'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice, formatDate } from '@/lib/constants';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard');
        const data = await res.json();
        if (res.ok) {
          setStats(data.stats);
          setRecentOrders(data.recentOrders || []);
          setLowStockProducts(data.lowStockProducts || []);
        }
      } catch (error) {
        console.error('Dashboard verileri yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loader" />
      </div>
    );
  }

  const statusLabels = {
    pending: 'Beklemede',
    processing: 'Hazırlanıyor',
    shipped: 'Kargoda',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal',
  };

  const statusColors = {
    pending: '#f39c12',
    processing: '#3498db',
    shipped: '#9b59b6',
    delivered: '#27ae60',
    cancelled: '#e74c3c',
  };

  return (
    <div className="admin-dashboard">
      {/* İstatistik Kartları */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>💰</div>
          <div className="admin-stat-card__info">
            <div className="admin-stat-card__value">{formatPrice(stats?.totalRevenue || 0)}</div>
            <div className="admin-stat-card__label">Toplam Gelir</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>📦</div>
          <div className="admin-stat-card__info">
            <div className="admin-stat-card__value">{stats?.totalOrders || 0}</div>
            <div className="admin-stat-card__label">Toplam Sipariş</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>👥</div>
          <div className="admin-stat-card__info">
            <div className="admin-stat-card__value">{stats?.totalUsers || 0}</div>
            <div className="admin-stat-card__label">Kayıtlı Kullanıcı</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon" style={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)' }}>🛍️</div>
          <div className="admin-stat-card__info">
            <div className="admin-stat-card__value">{stats?.totalProducts || 0}</div>
            <div className="admin-stat-card__label">Toplam Ürün</div>
          </div>
        </div>
      </div>

      <div className="admin-dashboard__grid">
        {/* Son Siparişler */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">Son Siparişler</h2>
            <Link href="/admin/orders" className="admin-card__link">Tümünü Gör →</Link>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sipariş No</th>
                  <th>Müşteri</th>
                  <th>Tutar</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? recentOrders.map(order => (
                  <tr key={order._id}>
                    <td className="admin-table__id">#{order._id?.slice(-6)}</td>
                    <td>{order.user?.name || 'Bilinmiyor'}</td>
                    <td className="admin-table__price">{formatPrice(order.totalAmount)}</td>
                    <td>
                      <span
                        className="admin-badge"
                        style={{ background: statusColors[order.status] + '20', color: statusColors[order.status] }}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="admin-table__date">{formatDate(order.createdAt)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Henüz sipariş yok</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Düşük Stoklu Ürünler */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">⚠️ Düşük Stok</h2>
            <Link href="/admin/products" className="admin-card__link">Tümünü Gör →</Link>
          </div>
          <div className="admin-table-wrapper">
            {lowStockProducts.length > 0 ? (
              <div className="admin-low-stock-list">
                {lowStockProducts.map(product => (
                  <div key={product._id} className="admin-low-stock-item">
                    <div className="admin-low-stock-item__info">
                      <span className="admin-low-stock-item__name">{product.name}</span>
                      <span className="admin-low-stock-item__category">{product.category}</span>
                    </div>
                    <span className={`admin-badge ${product.stock === 0 ? 'admin-badge--danger' : 'admin-badge--warning'}`}>
                      {product.stock === 0 ? 'Tükendi' : `${product.stock} adet`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-gray-400)' }}>
                Tüm stoklar yeterli 👍
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
