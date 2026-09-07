'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { CATEGORIES } from '@/lib/constants';

export default function AdminNewProductPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    stock: '',
    tags: '',
    featured: false,
    isActive: true,
    images: [''],
    variants: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...form.images];
    newImages[index] = value;
    setForm(prev => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setForm(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addVariant = () => {
    setForm(prev => ({
      ...prev,
      variants: [...prev.variants, { name: '', value: '', priceModifier: 0, stock: 0 }],
    }));
  };

  const removeVariant = (index) => {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...form.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setForm(prev => ({ ...prev, variants: newVariants }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const body = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : undefined,
        category: form.category,
        stock: parseInt(form.stock) || 0,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        featured: form.featured,
        isActive: form.isActive,
        images: form.images.filter(Boolean),
        variants: form.variants.map(v => ({
          ...v,
          priceModifier: parseFloat(v.priceModifier) || 0,
          stock: parseInt(v.stock) || 0,
        })),
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        addToast('Ürün başarıyla oluşturuldu! 🎉', 'success');
        router.push('/admin/products');
      } else {
        addToast(data.error || 'Ürün oluşturulamadı', 'error');
      }
    } catch (error) {
      addToast('Bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h2>Yeni Ürün Ekle</h2>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form__grid">
          {/* Sol kolon - Temel bilgiler */}
          <div className="admin-form__section">
            <h3 className="admin-form__section-title">Temel Bilgiler</h3>

            <div className="admin-form__group">
              <label className="admin-form__label">Ürün Adı *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="admin-input"
                required
                placeholder="örn: Lavanta Yağı"
              />
            </div>

            <div className="admin-form__group">
              <label className="admin-form__label">Açıklama *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="admin-input admin-textarea"
                required
                rows={5}
                placeholder="Ürün açıklaması..."
              />
            </div>

            <div className="admin-form__row">
              <div className="admin-form__group">
                <label className="admin-form__label">Fiyat (₺) *</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="admin-input"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="admin-form__group">
                <label className="admin-form__label">İndirimli Fiyat (₺)</label>
                <input
                  type="number"
                  name="discountPrice"
                  value={form.discountPrice}
                  onChange={handleChange}
                  className="admin-input"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="admin-form__row">
              <div className="admin-form__group">
                <label className="admin-form__label">Kategori *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="admin-select"
                  required
                >
                  <option value="">Seçin...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form__group">
                <label className="admin-form__label">Stok *</label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  className="admin-input"
                  required
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="admin-form__group">
              <label className="admin-form__label">Etiketler (virgülle ayırın)</label>
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className="admin-input"
                placeholder="doğal, organik, el yapımı"
              />
            </div>

            <div className="admin-form__row">
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                />
                <span>Vitrin ürünü</span>
              </label>
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />
                <span>Aktif</span>
              </label>
            </div>
          </div>

          {/* Sağ kolon - Görseller ve varyantlar */}
          <div className="admin-form__section">
            <h3 className="admin-form__section-title">Görseller</h3>

            {form.images.map((img, idx) => (
              <div key={idx} className="admin-form__image-row">
                <input
                  type="url"
                  value={img}
                  onChange={(e) => handleImageChange(idx, e.target.value)}
                  className="admin-input"
                  placeholder="https://... (görsel URL'si)"
                />
                {form.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(idx)}
                    className="admin-action-btn admin-action-btn--delete"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addImageField} className="btn btn--secondary btn--sm">
              + Görsel Ekle
            </button>

            <h3 className="admin-form__section-title" style={{ marginTop: 'var(--space-6)' }}>
              Varyantlar (Opsiyonel)
            </h3>

            {form.variants.map((variant, idx) => (
              <div key={idx} className="admin-form__variant">
                <div className="admin-form__row">
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                    className="admin-input"
                    placeholder="Ad (örn: 50ml)"
                  />
                  <input
                    type="number"
                    value={variant.priceModifier}
                    onChange={(e) => handleVariantChange(idx, 'priceModifier', e.target.value)}
                    className="admin-input"
                    placeholder="Fiyat farkı"
                    step="0.01"
                  />
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                    className="admin-input"
                    placeholder="Stok"
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="admin-action-btn admin-action-btn--delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addVariant} className="btn btn--secondary btn--sm">
              + Varyant Ekle
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="admin-form__footer">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="btn btn--secondary"
          >
            İptal
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={loading}
          >
            {loading ? 'Kaydediliyor...' : '✓ Ürünü Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
