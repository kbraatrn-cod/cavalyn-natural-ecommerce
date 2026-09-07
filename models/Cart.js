import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Miktar en az 1 olmalıdır'],
      default: 1,
    },
    variant: {
      name: String,
      value: String,
      priceModifier: { type: Number, default: 0 },
    },
  }],
}, {
  timestamps: true,
});

export default mongoose.models.Cart || mongoose.model('Cart', cartSchema);
