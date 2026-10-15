import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  username: { type: String, lowercase: true, trim: true, minlength: 3, maxlength: 24, match: /^[a-z0-9_]+$/, unique: true, sparse: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['user', 'seller', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
userSchema.pre('save', async function () { if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12); });
userSchema.methods.comparePassword = function (candidate) { return bcrypt.compare(candidate, this.password); };
export default mongoose.model('User', userSchema);
