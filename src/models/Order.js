import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customer: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    zipCode: String,
  },
  items: [{
    productId: String,
    name: String,
    type: String,
    quantity: Number,
    price: Number,
    image: String,
  }],
  totalAmount: Number,
  paymentMethod: { type: String, default: 'cod' },
  status: { type: String, default: 'pending' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);