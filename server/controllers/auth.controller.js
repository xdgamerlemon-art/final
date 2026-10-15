import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const issueToken = (user) => jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
const safeUser = (user) => ({ id: user.id, name: user.name, username: user.username || user.name.toLowerCase().replace(/[^a-z0-9]+/g, '.'), email: user.email, role: user.role, isActive: user.isActive });
export const register = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;
  if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email is already registered' });
  if (await User.exists({ username: username.toLowerCase() })) return res.status(409).json({ message: 'That username is already taken' });
  const user = await User.create({ name, username: username.toLowerCase(), email, password, role: 'user' });
  res.status(201).json({ token: issueToken(user), user: safeUser(user) });
});
export const login = asyncHandler(async (req, res) => {
  const identifier = (req.body.identifier || req.body.email).toLowerCase();
  const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }, { name: new RegExp(`^${identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }] }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) return res.status(401).json({ message: 'Username/email or password is incorrect' });
  if (!user.isActive) return res.status(403).json({ message: 'This account is deactivated' });
  res.json({ token: issueToken(user), user: safeUser(user) });
});
export const getProfile = asyncHandler(async (req, res) => res.json({ user: safeUser(req.user) }));
export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = {};
  if (req.body.name !== undefined) allowed.name = req.body.name;
  if (req.body.username !== undefined) allowed.username = req.body.username.toLowerCase();
  if (req.body.email !== undefined) allowed.email = req.body.email.toLowerCase();
  if (req.body.password) {
    if (req.body.password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    const fresh = await User.findById(req.user.id).select('+password');
    fresh.password = req.body.password;
    await fresh.save();
  }
  const user = await User.findByIdAndUpdate(req.user.id, allowed, { new: true, runValidators: true });
  res.json({ user: safeUser(user) });
});
