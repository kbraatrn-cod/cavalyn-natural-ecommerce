'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import { CATEGORIES } from '@/lib/constants';

const SORT_OPTIONS = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'price-asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price-desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'rating', label: 'En Yüksek Puan' },
  { value: 'popular', label: 'En Popüler' },
  { value: 'name-asc', label: 'A-Z Sıralama' },
];

function getCategoryLabel(slug) {
  const cat = CATEGORIES.find(c => c.value === slug);
  return cat ? cat.label : slug;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  // Filtre state
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (sort) params.set('sort', sort);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (search) params.set('search', search);
      params.set('page', page.toString());
      params.set('limit', '12');

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setProducts(data.products);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  }, [category, sort, minPrice, maxPrice, search, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // URL'i güncelle
  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (sort && sort !== 'newest') params.set('sort', sort);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (search) params.set('search', search);
    if (page > 1) params.set('page', page.toString());

    const queryString = params.toString();
    router.replace(`/products${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [category, sort, minPrice, maxPrice, search, page, router]);

  const clearFilters = () => {
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSearch('');
    setSort('newest');
    setPage(1);
  };

  const handleCategoryClick = (catValue) => {
    setCategory(prev => prev === catValue ? '' : catValue);
    setPage(1);
  };

  return (
    <div className="products-page">
      <div className="container">
        {/* Sayfa Başlığı */}
        <div className="products-page__header">
          <h1 className="products-page__title">
            {category ? getCategoryLabel(category) : 'Tüm Ürünler'}
          </h1>
          <p className="products-page__count">
            {pagination.total} ürün bulundu
          </p>
        </div>

        <div className="products-page__layout">
          {/* Filtre Sidebar */}
          <aside className={`filter-sidebar ${filterOpen ? 'filter-sidebar--open' : ''}`} id="filter-sidebar">
            <div className="filter-sidebar__title">
              <span>🔍 Filtreler</span>
              <button className="filter-sidebar__clear" onClick={clearFilters}>
                Temizle
              </button>
            </div>

            {/* Arama */}
            <div className="filter-group">
              <div className="filter-group__label">Ara</div>
              <input
                type="text"
                className="form-input"
                placeholder="Ürün ara..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                id="product-search"
              />
            </div>

            {/* Kategoriler */}
            <div className="filter-group">
              <div className="filter-group__label">Kategori</div>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  className={`filter-group__option ${category === cat.value ? 'filter-group__option--active' : ''}`}
                  onClick={() => handleCategoryClick(cat.value)}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                  <span className="filter-group__option-count">{cat.count}</span>
                </button>
              ))}
            </div>

            {/* Fiyat Aralığı */}
            <div className="filter-group">
              <div className="filter-group__label">Fiyat Aralığı</div>
              <div className="filter-price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  id="filter-min-price"
                />
                <span>—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  id="filter-max-price"
                />
              </div>
            </div>

            {/* Mobilde Kapat */}
            <button
              className="btn btn--primary btn--full mt-4"
              onClick={() => setFilterOpen(false)}
              style={{ display: filterOpen ? 'block' : 'none' }}
            >
              Filtreleri Uygula
            </button>
          </aside>

          {/* Ürün Listesi */}
          <div>
            {/* Sıralama Barı */}
            <div className="sort-bar">
              <div className="sort-bar__left">
                <button
                  className="filter-toggle-btn"
                  onClick={() => setFilterOpen(true)}
                >
                  🔍 Filtreler
                </button>
                <span>{pagination.total} ürün</span>
              </div>
              <select
                className="sort-bar__select"
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                id="sort-select"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Ürün Grid */}
            {loading ? (
              <div className="page-loader">
                <div className="loader" />
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="product-grid">
                  {products.map(product => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      categoryLabel={getCategoryLabel(product.category)}
                    />
                  ))}
                </div>

                {/* Sayfalama */}
                {pagination.pages > 1 && (
                  <div className="pagination">
                    <button
                      className="pagination__btn"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      ← Önceki
                    </button>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        className={`pagination__btn ${page === p ? 'pagination__btn--active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className="pagination__btn"
                      onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={page >= pagination.pages}
                    >
                      Sonraki →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-state__icon">🔍</div>
                <h3 className="empty-state__title">Ürün Bulunamadı</h3>
                <p className="empty-state__desc">
                  Arama kriterlerinize uygun ürün bulunamadı.
                  Filtreleri değiştirmeyi veya temizlemeyi deneyin.
                </p>
                <button className="btn btn--secondary mt-6" onClick={clearFilters}>
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="page-loader" style={{ paddingTop: '150px' }}>
        <div className="loader" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
