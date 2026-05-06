import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    size: String,
    quantity: Number,
    price: Number,
    image: String,
  }],
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Cart || mongoose.model('Cart', cartSchema);