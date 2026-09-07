// Ürün Kategorileri — Cavalyn güzellik/kozmetik
export const CATEGORIES = [
  { value: 'kirpik', label: 'Kirpik', emoji: '👁️', count: 12 },
  { value: 'cilt-bakim', label: 'Cilt Bakım', emoji: '✨', count: 18 },
  { value: 'makyaj', label: 'Makyaj', emoji: '💄', count: 15 },
  { value: 'sac-bakim', label: 'Saç Bakım', emoji: '💆', count: 10 },
  { value: 'parfum', label: 'Parfüm', emoji: '🌸', count: 8 },
  { value: 'vucut-bakim', label: 'Vücut Bakım', emoji: '🧴', count: 14 },
];

// Sipariş Durumları
export const ORDER_STATUSES = {
  pending: { label: 'Beklemede', color: 'warning' },
  processing: { label: 'Hazırlanıyor', color: 'info' },
  shipped: { label: 'Kargoda', color: 'primary' },
  delivered: { label: 'Teslim Edildi', color: 'success' },
  cancelled: { label: 'İptal Edildi', color: 'error' },
};

// Site Bilgileri
export const SITE_CONFIG = {
  name: 'Cavalyn',
  description: 'Doğal güzellik ve kozmetik ürünlerinin güvenilir adresi',
  tagline: 'Doğal Güzelliğin Adresi',
  currency: 'TL',
  shippingThreshold: 300, // Ücretsiz kargo sınırı (TL)
  shippingCost: 29.90,
  trendyolUrl: 'https://ty.gl/em3w2cs7llxet',
};

// Fiyat Formatlama
export function formatPrice(price) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(price);
}

// Tarih Formatlama
export function formatDate(date) {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

// Slug'dan kategori adı bulma
export function getCategoryLabel(slug) {
  const cat = CATEGORIES.find(c => c.value === slug);
  return cat ? cat.label : slug;
}
