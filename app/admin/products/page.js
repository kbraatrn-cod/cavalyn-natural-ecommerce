'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { formatPrice, CATEGORIES } from '@/lib/constants';

export default function AdminProductsPage() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [deleteModal, setDeleteModal] = useState(null);

  async function fetchProducts(page = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();

      if (res.ok) {
        setProducts(data.products);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Ürün yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const handleDelete = async (productId) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        addToast('Ürün başarıyla silindi', 'success');
        setDeleteModal(null);
        fetchProducts(pagination.page);
      } else {
        addToast('Ürün silinemedi', 'error');
      }
    } catch (error) {
      addToast('Bir hata oluştu', 'error');
    }
  };

  const toggleActive = async (product) => {
    try {
      const res = await fetch(`/api/admin/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, isActive: !product.isActive }),
      });

      if (res.ok) {
        addToast(
          product.isActive ? 'Ürün pasif yapıldı' : 'Ürün aktif yapıldı',
          'success'
        );
        fetchProducts(pagination.page);
      }
    } catch (error) {
      addToast('Bir hata oluştu', 'error');
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="admin-toolbar">
        <form onSubmit={handleSearch} className="admin-toolbar__search">
          <input
            type="text"
            placeholder="Ürün ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
          />
          <button type="submit" className="btn btn--primary btn--sm">Ara</button>
        </form>

        <div className="admin-toolbar__filters">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="admin-select"
          >
            <option value="">Tüm Kategoriler</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <Link href="/admin/products/new" className="btn btn--primary">
            + Yeni Ürün
          </Link>
        </div>
      </div>

      {/* Ürün Tablosu */}
      {loading ? (
        <div className="admin-loading"><div className="loader" /></div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Görsel</th>
                  <th>Ürün Adı</th>
                  <th>Kategori</th>
                  <th>Fiyat</th>
                  <th>Stok</th>
                  <th>Puan</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? products.map(product => (
                  <tr key={product._id}>
                    <td>
                      <img
                        src={product.images?.[0] || '/images/hero.png'}
                        alt={product.name}
                        style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{product.name}</div>
                      {product.featured && <span className="admin-badge admin-badge--featured">Vitrin</span>}
                    </td>
                    <td>{CATEGORIES.find(c => c.value === product.category)?.label || product.category}</td>
                    <td className="admin-table__price">
                      {product.discountPrice ? (
                        <>
                          <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '0.85em' }}>
                            {formatPrice(product.price)}
                          </span>
                          <br />
                          {formatPrice(product.discountPrice)}
                        </>
                      ) : (
                        formatPrice(product.price)
                      )}
                    </td>
                    <td>
                      <span className={`admin-badge ${
                        product.stock === 0 ? 'admin-badge--danger' :
                        product.stock <= 5 ? 'admin-badge--warning' : 'admin-badge--success'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      ⭐ {product.rating?.toFixed(1) || '0.0'} ({product.reviewCount || 0})
                    </td>
                    <td>
                      <button
                        onClick={() => toggleActive(product)}
                        className={`admin-badge ${product.isActive ? 'admin-badge--success' : 'admin-badge--danger'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        {product.isActive ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <Link
                          href={`/admin/products/${product._id}`}
                          className="admin-action-btn admin-action-btn--edit"
                          title="Düzenle"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => setDeleteModal(product)}
                          className="admin-action-btn admin-action-btn--delete"
                          title="Sil"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}>
                      Ürün bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Sayfalama */}
          {pagination.pages > 1 && (
            <div className="admin-pagination">
              <span>Toplam {pagination.total} ürün</span>
              <div className="admin-pagination__buttons">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => fetchProducts(p)}
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

      {/* Silme Onay Modalı */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Ürünü Sil</h3>
              <button onClick={() => setDeleteModal(null)} className="modal__close">✕</button>
            </div>
            <div className="modal__body">
              <p>
                <strong>&quot;{deleteModal.name}&quot;</strong> ürününü silmek istediğinize emin misiniz?
              </p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-400)', marginTop: 8 }}>
                Bu işlem ürünü pasif yapacaktır.
              </p>
            </div>
            <div className="modal__footer">
              <button onClick={() => setDeleteModal(null)} className="btn btn--secondary">İptal</button>
              <button
                onClick={() => handleDelete(deleteModal._id)}
                className="btn btn--danger"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
