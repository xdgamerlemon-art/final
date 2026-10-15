import mongoose from 'mongoose';
const messageSchema = new mongoose.Schema({
  senderName: { type: String, required: true, trim: true, maxlength: 80 },
  senderEmail: { type: String, required: true, lowercase: true, trim: true },
  message: { type: String, required: true, trim: true, minlength: 8, maxlength: 2000 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });
export default mongoose.model('Message', messageSchema);
