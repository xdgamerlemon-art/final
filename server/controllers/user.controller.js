import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('name email role isActive createdAt').sort({ createdAt: -1 });
  res.json({ users });
});
export const updateUserRole = asyncHandler(async (req, res) => {
  if (req.user.id === req.params.id) return res.status(400).json({ message: 'Admins cannot change their own role' });
  const { role } = req.body;
  if (!['user', 'seller', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select('name email role isActive');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
});
export const toggleUserStatus = asyncHandler(async (req, res) => {
  if (req.user.id === req.params.id) return res.status(400).json({ message: 'You cannot deactivate your own account' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive } });
});
