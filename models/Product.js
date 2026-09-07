import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ürün adı zorunludur'],
    trim: true,
    maxlength: [120, 'Ürün adı en fazla 120 karakter olabilir'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Ürün açıklaması zorunludur'],
    maxlength: [2000, 'Açıklama en fazla 2000 karakter olabilir'],
  },
  price: {
    type: Number,
    required: [true, 'Fiyat alanı zorunludur'],
    min: [0, 'Fiyat 0\'dan küçük olamaz'],
  },
  discountPrice: {
    type: Number,
    min: [0, 'İndirimli fiyat 0\'dan küçük olamaz'],
  },
  category: {
    type: String,
    required: [true, 'Kategori alanı zorunludur'],
    enum: [
      'bitkisel-yaglar',
      'cilt-bakim',
      'sac-bakim',
      'aromaterapi',
      'dogal-sabunlar',
      'vucut-bakim',
    ],
  },
  images: [{
    type: String,
  }],
  variants: [{
    name: String,   // örn: "50ml", "100ml"
    value: String,
    priceModifier: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
  }],
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Stok 0\'dan küçük olamaz'],
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  tags: [String],
  featured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Kayıttan önce slug oluştur
productSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Sanal alan: indirim yüzdesi
productSchema.virtual('discountPercentage').get(function () {
  if (this.discountPrice && this.price) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// JSON çıktısında virtual alanları dahil et
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Text index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
