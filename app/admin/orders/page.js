'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { formatPrice, formatDate, ORDER_STATUSES } from '@/lib/constants';

export default function AdminOrdersPage() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  async function fetchOrders(page = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();

      if (res.ok) {
        setOrders(data.orders);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Sipariş yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        addToast(`Sipariş durumu "${ORDER_STATUSES[newStatus]?.label}" olarak güncellendi`, 'success');
        fetchOrders(pagination.page);
        setSelectedOrder(null);
      } else {
        addToast('Sipariş güncellenemedi', 'error');
      }
    } catch (error) {
      addToast('Bir hata oluştu', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusColors = {
    pending: '#f39c12',
    processing: '#3498db',
    shipped: '#9b59b6',
    delivered: '#27ae60',
    cancelled: '#e74c3c',
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar__filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select"
          >
            <option value="">Tüm Durumlar</option>
            {Object.entries(ORDER_STATUSES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-400)' }}>
            Toplam {pagination.total} sipariş
          </span>
        </div>
      </div>

      {/* Sipariş Tablosu */}
      {loading ? (
        <div className="admin-loading"><div className="loader" /></div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sipariş No</th>
                  <th>Müşteri</th>
                  <th>Ürünler</th>
                  <th>Tutar</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? orders.map(order => (
                  <tr key={order._id}>
                    <td className="admin-table__id">#{order._id?.slice(-6)}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{order.user?.name || 'Bilinmiyor'}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)' }}>
                        {order.user?.email}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 'var(--font-size-sm)' }}>
                        {order.items?.length || 0} ürün
                      </span>
                    </td>
                    <td className="admin-table__price">{formatPrice(order.totalAmount)}</td>
                    <td>
                      <span
                        className="admin-badge"
                        style={{
                          background: statusColors[order.status] + '20',
                          color: statusColors[order.status],
                        }}
                      >
                        {ORDER_STATUSES[order.status]?.label || order.status}
                      </span>
                    </td>
                    <td className="admin-table__date">{formatDate(order.createdAt)}</td>
                    <td>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="admin-action-btn admin-action-btn--edit"
                        title="Detay / Düzenle"
                      >
                        📋
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                      Sipariş bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Sayfalama */}
          {pagination.pages > 1 && (
            <div className="admin-pagination">
              <div className="admin-pagination__buttons">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => fetchOrders(p)}
                    className={`admin-pagination__btn ${p === pagination.page ? 'admin-pagination__btn--active' : ''}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Sipariş Detay Modalı */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Sipariş Detayı — #{selectedOrder._id?.slice(-6)}</h3>
              <button onClick={() => setSelectedOrder(null)} className="modal__close">✕</button>
            </div>
            <div className="modal__body">
              <div className="admin-order-detail">
                <div className="admin-order-detail__info">
                  <div>
                    <strong>Müşteri:</strong> {selectedOrder.user?.name} ({selectedOrder.user?.email})
                  </div>
                  <div>
                    <strong>Tarih:</strong> {formatDate(selectedOrder.createdAt)}
                  </div>
                  <div>
                    <strong>Toplam:</strong> {formatPrice(selectedOrder.totalAmount)}
                  </div>
                  <div>
                    <strong>Ödeme:</strong> {selectedOrder.paymentMethod === 'kapida-odeme' ? 'Kapıda Ödeme' : selectedOrder.paymentMethod}
                  </div>
                  {selectedOrder.shippingAddress && (
                    <div>
                      <strong>Adres:</strong> {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}
                    </div>
                  )}
                </div>

                <h4 style={{ margin: 'var(--space-4) 0 var(--space-2)' }}>Ürünler</h4>
                <div className="admin-order-items">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="admin-order-item">
                      <span>{item.product?.name || 'Ürün'}</span>
                      <span>x{item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <h4 style={{ margin: 'var(--space-4) 0 var(--space-2)' }}>Durum Güncelle</h4>
                <div className="admin-status-buttons">
                  {Object.entries(ORDER_STATUSES).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => handleUpdateStatus(selectedOrder._id, key)}
                      disabled={updatingStatus || selectedOrder.status === key}
                      className={`btn btn--sm ${selectedOrder.status === key ? 'btn--primary' : 'btn--secondary'}`}
                      style={{
                        opacity: selectedOrder.status === key ? 1 : 0.7,
                      }}
                    >
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
