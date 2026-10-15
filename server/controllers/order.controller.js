import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const createOrder = asyncHandler(async (req, res) => {
  const input = req.body.items;
  if (!Array.isArray(input) || input.length === 0 || input.length > 50) return res.status(400).json({ message: 'Cart must contain 1–50 items' });
  const quantities = new Map();
  for (const item of input) {
    if (!mongoose.isValidObjectId(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1) return res.status(400).json({ message: 'Invalid cart item' });
    quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
  }
  const changed = [];
  const orderItems = [];
  try {
    for (const [productId, quantity] of quantities) {
      const product = await Product.findOneAndUpdate({ _id: productId, status: 'approved', stock: { $gte: quantity } }, { $inc: { stock: -quantity } }, { new: true });
      if (!product) throw Object.assign(new Error('One or more products are unavailable or out of stock'), { statusCode: 409 });
      changed.push({ productId, quantity });
      orderItems.push({ productId, title: product.title, quantity, unitPrice: product.price, sellerId: product.sellerId });
    }
    const totalAmount = Number(orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toFixed(2));
    const [order] = await Order.create([{ userId: req.user.id, items: orderItems, totalAmount }]);
    res.status(201).json({ order });
  } catch (error) {
    await Promise.all(changed.map(({ productId, quantity }) => Product.updateOne({ _id: productId }, { $inc: { stock: quantity } })));
    throw error;
  }
});
export const getUserOrders = asyncHandler(async (req, res) => res.json({ orders: await Order.find({ userId: req.user.id }).sort({ createdAt: -1 }) }));
export const getAllOrders = asyncHandler(async (req, res) => res.json({ orders: await Order.find().populate('userId', 'name email').sort({ createdAt: -1 }) }));
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const allowed = ['processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid order status' });
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ order });
});
