import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const editable = ['title', 'description', 'price', 'category', 'stock', 'imageUrl'];
const fieldsFrom = (body) => Object.fromEntries(editable.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));
export const createProduct = asyncHandler(async (req, res) => {
  const data = fieldsFrom(req.body);
  if (editable.slice(0, 5).some((key) => data[key] === undefined)) return res.status(400).json({ message: 'Title, description, price, category, and stock are required' });
  data.imageUrl ??= '';
  const product = await Product.create({ ...data, sellerId: req.user.id, status: 'pending' });
  res.status(201).json({ product });
});
export const getApprovedProducts = asyncHandler(async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 120) : '';
  const category = typeof req.query.category === 'string' ? req.query.category.trim().slice(0, 60) : '';
  const minPrice = req.query.minPrice === undefined || req.query.minPrice === '' ? undefined : Number(req.query.minPrice);
  const maxPrice = req.query.maxPrice === undefined || req.query.maxPrice === '' ? undefined : Number(req.query.maxPrice);
  if ((minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0)) || (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0)) || (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice)) return res.status(400).json({ message: 'Invalid price range' });
  const filter = { status: 'approved' };
  if (search) filter.$text = { $search: search };
  if (category && category !== 'All') filter.category = category;
  if (minPrice !== undefined || maxPrice !== undefined) filter.price = {};
  if (minPrice !== undefined) filter.price.$gte = minPrice;
  if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  const products = await Product.find(filter).populate('sellerId', 'name').sort({ createdAt: -1 }).limit(100);
  res.json({ products });
});
export const getSellerProducts = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { sellerId: req.user.id };
  const products = await Product.find(filter).populate('sellerId', 'name email').sort({ updatedAt: -1 });
  res.json({ products });
});
export const getPendingProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ status: 'pending' }).populate('sellerId', 'name email').sort({ updatedAt: 1 });
  res.json({ products });
});
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (req.user.role !== 'admin' && product.sellerId.toString() !== req.user.id) return res.status(403).json({ message: 'Not your product' });
  const changes = fieldsFrom(req.body);
  if (!Object.keys(changes).length) return res.status(400).json({ message: 'No editable fields supplied' });
  product.pendingChanges = { ...(product.pendingChanges || {}), ...changes };
  product.status = 'pending';
  product.rejectionReason = '';
  await product.save();
  res.json({ product });
});
export const approveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (product.pendingChanges) for (const [key, value] of Object.entries(product.pendingChanges)) product[key] = value;
  product.pendingChanges = null;
  product.status = 'approved';
  product.rejectionReason = '';
  await product.save();
  res.json({ product });
});
export const rejectProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.pendingChanges = null;
  product.status = 'rejected';
  product.rejectionReason = String(req.body.reason || '').slice(0, 300);
  await product.save();
  res.json({ product });
});
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (req.user.role !== 'admin' && product.sellerId.toString() !== req.user.id) return res.status(403).json({ message: 'Not your product' });
  await product.deleteOne();
  res.json({ message: 'Product removed' });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, status: 'approved' }).populate('sellerId', 'name');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ product });
});
