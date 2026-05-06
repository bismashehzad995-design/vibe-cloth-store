import mongoose from "mongoose";

const ReturnSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  type: { type: String, enum: ["return", "exchange"], required: true },
  reason: { type: String, required: true },
  comment: { type: String, default: "" },
  items: { type: Array, default: [] },
  status: { type: String, enum: ["pending", "approved", "rejected", "completed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Return || mongoose.model("Return", ReturnSchema);