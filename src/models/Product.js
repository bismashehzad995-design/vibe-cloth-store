import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  imageUrl: { type: String, required: true },
category: { type: String, required: true, enum: ["Men", "Women", "Kids"] },
 productType: { type: String, enum: ["Shirts", "Trousers", "Jeans", "Jackets", "Winter Wear", "Formal Wear", "Casual Wear"] },
 createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);