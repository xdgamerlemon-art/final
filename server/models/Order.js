import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [{ productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, title: { type: String, required: true }, quantity: { type: Number, required: true, min: 1 }, unitPrice: { type: Number, required: true, min: 0 }, sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } }],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'placed' }
}, { timestamps: true });
export default mongoose.model('Order', orderSchema);
