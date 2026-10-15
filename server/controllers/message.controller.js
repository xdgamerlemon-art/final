import Message from '../models/Message.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const submitMessage = asyncHandler(async (req, res) => {
  const message = await Message.create({ ...req.body, userId: req.user?.id || null, status: 'pending' });
  res.status(201).json({ message: 'Thanks for reaching out. Your note is awaiting review.' });
});
export const getApprovedMessages = asyncHandler(async (req, res) => res.json({ messages: await Message.find({ status: 'approved' }).select('senderName message createdAt').sort({ createdAt: -1 }).limit(12) }));
export const getAllMessages = asyncHandler(async (req, res) => res.json({ messages: await Message.find().sort({ createdAt: -1 }) }));
export const approveMessage = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true, runValidators: true });
  if (!message) return res.status(404).json({ message: 'Message not found' });
  res.json({ message });
});
export const rejectMessage = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true, runValidators: true });
  if (!message) return res.status(404).json({ message: 'Message not found' });
  res.json({ message });
});
