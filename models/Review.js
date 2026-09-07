import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Puan vermek zorunludur'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, 'Yorum yazmak zorunludur'],
    maxlength: [1000, 'Yorum en fazla 1000 karakter olabilir'],
  },
}, {
  timestamps: true,
});

// Aynı kullanıcı aynı ürüne tek yorum atabilir
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
