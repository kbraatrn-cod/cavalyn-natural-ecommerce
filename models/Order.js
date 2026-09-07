import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
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
    name: String,
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    variant: String,
    image: String,
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: String,
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: String,
    zip: String,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    default: 'credit_card',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  trackingNumber: String,
  notes: String,
}, {
  timestamps: true,
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
