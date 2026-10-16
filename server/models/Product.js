import mongoose from 'mongoose';
const productFields = {
  title: { type: String, trim: true, minlength: 2, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 3000 },
  price: { type: Number, min: 0.01 },
  category: { type: String, trim: true, maxlength: 60 },
  stock: { type: Number, min: 0, validate: Number.isInteger },
  imageUrl: { type: String, trim: true, maxlength: 500 }
};
const productSchema = new mongoose.Schema({
  ...Object.fromEntries(Object.entries(productFields).map(([key, value]) => [key, { ...value, required: true }])),
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  pendingChanges: { type: mongoose.Schema.Types.Mixed, default: null },
  rejectionReason: { type: String, default: '' }
}, { timestamps: true });
productSchema.index({ title: 'text', description: 'text', category: 'text' });
productSchema.index({ status: 1, createdAt: -1, _id: -1 });
productSchema.index({ status: 1, category: 1, createdAt: -1, _id: -1 });
productSchema.index({ status: 1, price: 1, createdAt: -1, _id: -1 });
export { productFields };
export default mongoose.model('Product', productSchema);
