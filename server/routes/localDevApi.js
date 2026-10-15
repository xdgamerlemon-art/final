import { Router } from 'express';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const storePath = fileURLToPath(new URL('../.local-data.json', import.meta.url));
const id = () => randomUUID().replaceAll('-', '');
const stamp = () => new Date().toISOString();
const safeUser = ({ password, ...user }) => ({ ...user, username: user.username || user.name.toLowerCase().replace(/[^a-z0-9]+/g, '.') });
const apiDocument = (document) => ({ ...document, _id: document.id });
const productSchema = z.object({ title: z.string().trim().min(2).max(120), description: z.string().trim().min(8).max(3000), price: z.coerce.number().positive().max(1000000), category: z.string().trim().min(2).max(60), stock: z.coerce.number().int().min(0).max(100000), imageUrl: z.string().trim().url().max(500).or(z.literal('')).optional() });
const wrap = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

export async function createLocalDevApi() {
  const secret = process.env.JWT_SECRET || randomBytes(48).toString('hex');
  process.env.JWT_SECRET = secret;
  let state;
  try { state = JSON.parse(await readFile(storePath, 'utf8')); }
  catch {
    const adminId = id(); const makerId = id();
    state = {
      users: [
        { id: adminId, name: 'ArtisanCraft Admin', username: 'admin', email: 'admin@artisancraft.local', password: await bcrypt.hash('ArtisanCraftAdmin!26', 12), role: 'admin', isActive: true, createdAt: stamp() },
        { id: makerId, name: 'Willow Studio', username: 'willow', email: 'maker@artisancraft.local', password: await bcrypt.hash('ArtisanCraftMaker!26', 12), role: 'seller', isActive: true, createdAt: stamp() }
      ],
      products: [
        ['Moss-glazed breakfast bowl', 'A hand-thrown stoneware bowl with a soft moss glaze, made for slow mornings and everyday rituals.', 38, 'Ceramics', 12],
        ['Wildflower linen tea towel', 'A naturally dyed linen tea towel printed by hand with a delicate wildflower motif.', 24, 'Textiles', 18],
        ['Little sun brass earrings', 'Lightweight brass earrings shaped and polished by hand in a small independent studio.', 42, 'Jewelry', 8],
        ['Hand-carved walnut spoon', 'A smooth, carefully carved walnut serving spoon finished with food-safe plant oil.', 31, 'Woodwork', 6]
      ].map(([title, description, price, category, stock]) => ({ id: id(), title, description, price, category, stock, imageUrl: '', sellerId: makerId, status: 'approved', pendingChanges: null, rejectionReason: '', createdAt: stamp(), updatedAt: stamp() })),
      messages: [], orders: []
    };
    await writeFile(storePath, JSON.stringify(state, null, 2), 'utf8');
    console.warn('LOCAL DEVELOPMENT MODE: JSON data is stored in server/.local-data.json. Do not use this mode in production.');
    console.warn('Demo admin: admin@artisancraft.local / ArtisanCraftAdmin!26');
    console.warn('Demo seller: maker@artisancraft.local / ArtisanCraftMaker!26');
  }
  const usedUsernames = new Set();
  for (const user of state.users) {
    const demoUsername = user.email.endsWith('@artisancraft.local') ? user.email.split('@')[0] : '';
    let username = String(demoUsername || user.username || user.email.split('@')[0] || user.name).toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24) || `maker${user.id.slice(0, 8)}`;
    if (username.length < 3) username = `${username}${user.id.slice(0, 3)}`;
    while (usedUsernames.has(username)) username = `${username.slice(0, 19)}${user.id.slice(0, 5)}`;
    user.username = username;
    usedUsernames.add(username);
  }
  await writeFile(storePath, JSON.stringify(state, null, 2), 'utf8');
  let writes = Promise.resolve();
  const persist = () => { const data = JSON.stringify(state, null, 2); writes = writes.then(() => writeFile(storePath, data, 'utf8')); return writes; };
  const router = Router();
  const issueToken = (user) => jwt.sign({ id: user.id }, secret, { expiresIn: process.env.JWT_EXPIRE || '7d' });
  const protect = (req, res, next) => {
    try {
      const header = req.headers.authorization || '';
      if (!header.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required' });
      const payload = jwt.verify(header.slice(7), secret);
      const user = state.users.find((item) => item.id === payload.id && item.isActive);
      if (!user) return res.status(401).json({ message: 'Account unavailable' });
      req.user = user; next();
    } catch (error) { next(error); }
  };
  const roles = (...allowed) => (req, res, next) => req.user && allowed.includes(req.user.role) ? next() : res.status(403).json({ message: 'You do not have permission to perform this action' });
  const findProduct = (productId) => state.products.find((item) => item.id === productId);
  const productDocument = (item, seller = false) => ({ ...apiDocument(item), ...(seller ? { sellerId: state.users.find((user) => user.id === item.sellerId) ? { id: item.sellerId, _id: item.sellerId, name: state.users.find((user) => user.id === item.sellerId).name, email: state.users.find((user) => user.id === item.sellerId).email } : null } : {}) });
  const ownedProduct = (req, res) => {
    const product = findProduct(req.params.id);
    if (!product) { res.status(404).json({ message: 'Product not found' }); return null; }
    if (req.user.role !== 'admin' && product.sellerId !== req.user.id) { res.status(403).json({ message: 'Not your product' }); return null; }
    return product;
  };

  router.get('/health', (req, res) => res.json({ status: 'ok', mode: 'local-demo' }));
  router.post('/auth/register', wrap(async (req, res) => {
    const input = z.object({ name: z.string().trim().min(2).max(80), username: z.string().trim().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/), email: z.string().email().max(254), password: z.string().min(8).max(100) }).parse(req.body);
    const email = input.email.toLowerCase();
    if (state.users.some((user) => user.email === email)) return res.status(409).json({ message: 'Email is already registered' });
    const username = input.username.toLowerCase();
    if (state.users.some((user) => user.username === username)) return res.status(409).json({ message: 'That username is already taken' });
    const user = { id: id(), name: input.name, username, email, password: await bcrypt.hash(input.password, 12), role: 'user', isActive: true, createdAt: stamp() };
    state.users.push(user); await persist(); res.status(201).json({ token: issueToken(user), user: safeUser(user) });
  }));
  router.post('/auth/login', wrap(async (req, res) => {
    const input = z.object({ identifier: z.string().trim().min(1).max(254).optional(), email: z.string().trim().min(1).max(254).optional(), password: z.string().min(1).max(100) }).refine((data) => data.identifier || data.email, { message: 'Enter your username or email' }).parse(req.body);
    const identifier = (input.identifier || input.email).toLowerCase();
    const user = state.users.find((item) => item.email.toLowerCase() === identifier || item.username?.toLowerCase() === identifier || item.name.toLowerCase() === identifier);
    if (!user || !(await bcrypt.compare(input.password, user.password))) return res.status(401).json({ message: 'Username/email or password is incorrect' });
    if (!user.isActive) return res.status(403).json({ message: 'This account is deactivated' });
    res.json({ token: issueToken(user), user: safeUser(user) });
  }));
  router.get('/auth/profile', protect, (req, res) => res.json({ user: safeUser(req.user) }));
  router.patch('/auth/profile', protect, wrap(async (req, res) => {
    const input = z.object({ name: z.string().trim().min(2).max(80).optional(), username: z.string().trim().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/).optional(), email: z.string().email().max(254).optional(), password: z.string().min(8).max(100).optional() }).parse(req.body);
    if (input.email && state.users.some((user) => user.email === input.email.toLowerCase() && user.id !== req.user.id)) return res.status(409).json({ message: 'Email is already registered' });
    if (input.name) req.user.name = input.name;
    if (input.username) { const username = input.username.toLowerCase(); if (state.users.some((user) => user.username === username && user.id !== req.user.id)) return res.status(409).json({ message: 'That username is already taken' }); req.user.username = username; }
    if (input.email) req.user.email = input.email.toLowerCase();
    if (input.password) req.user.password = await bcrypt.hash(input.password, 12);
    await persist(); res.json({ user: safeUser(req.user) });
  }));

  router.get('/products', (req, res) => {
    let products = state.products.filter((item) => item.status === 'approved');
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    if (search) products = products.filter((item) => `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(search));
    if (req.query.category && req.query.category !== 'All') products = products.filter((item) => item.category === req.query.category);
    if (req.query.minPrice !== undefined) products = products.filter((item) => item.price >= Number(req.query.minPrice));
    if (req.query.maxPrice !== undefined) products = products.filter((item) => item.price <= Number(req.query.maxPrice));
    res.json({ products: products.slice(0, 100).map((item) => productDocument(item, true)) });
  });
  router.get('/products/mine', protect, roles('seller', 'admin'), (req, res) => res.json({ products: state.products.filter((item) => req.user.role === 'admin' || item.sellerId === req.user.id).map((item) => productDocument(item)) }));
  router.get('/products/pending', protect, roles('admin'), (req, res) => res.json({ products: state.products.filter((item) => item.status === 'pending').map((item) => productDocument(item, true)) }));
  router.get('/products/:id', (req, res) => { const item = findProduct(req.params.id); if (!item || item.status !== 'approved') return res.status(404).json({ message: 'Product not found' }); res.json({ product: productDocument(item, true) }); });
  router.post('/products', protect, roles('seller', 'admin'), wrap(async (req, res) => {
    const input = productSchema.parse(req.body); const product = { ...input, imageUrl: input.imageUrl || '', id: id(), sellerId: req.user.id, status: 'pending', pendingChanges: null, rejectionReason: '', createdAt: stamp(), updatedAt: stamp() };
    state.products.push(product); await persist(); res.status(201).json({ product: apiDocument(product) });
  }));
  router.patch('/products/:id', protect, roles('seller', 'admin'), wrap(async (req, res) => {
    const product = ownedProduct(req, res); if (!product) return;
    const changes = productSchema.partial().parse(req.body); if (!Object.keys(changes).length) return res.status(400).json({ message: 'No editable fields supplied' });
    product.pendingChanges = { ...(product.pendingChanges || {}), ...changes }; product.status = 'pending'; product.rejectionReason = ''; product.updatedAt = stamp(); await persist(); res.json({ product: apiDocument(product) });
  }));
  router.post('/products/:id/approve', protect, roles('admin'), wrap(async (req, res) => { const product = findProduct(req.params.id); if (!product) return res.status(404).json({ message: 'Product not found' }); Object.assign(product, product.pendingChanges || {}); product.pendingChanges = null; product.status = 'approved'; product.rejectionReason = ''; product.updatedAt = stamp(); await persist(); res.json({ product: apiDocument(product) }); }));
  router.post('/products/:id/reject', protect, roles('admin'), wrap(async (req, res) => { const product = findProduct(req.params.id); if (!product) return res.status(404).json({ message: 'Product not found' }); product.pendingChanges = null; product.status = 'rejected'; product.rejectionReason = String(req.body.reason || '').slice(0, 300); product.updatedAt = stamp(); await persist(); res.json({ product: apiDocument(product) }); }));
  router.delete('/products/:id', protect, roles('seller', 'admin'), wrap(async (req, res) => { const product = ownedProduct(req, res); if (!product) return; state.products = state.products.filter((item) => item.id !== product.id); await persist(); res.json({ message: 'Product removed' }); }));

  router.post('/messages', wrap(async (req, res) => {
    const input = z.object({ senderName: z.string().trim().min(2).max(80), senderEmail: z.string().email().max(254), message: z.string().trim().min(8).max(2000) }).parse(req.body);
    state.messages.push({ ...input, id: id(), status: 'pending', createdAt: stamp() }); await persist(); res.status(201).json({ message: 'Thanks for reaching out. Your note is awaiting review.' });
  }));
  router.get('/messages/approved', (req, res) => res.json({ messages: state.messages.filter((item) => item.status === 'approved').slice(-12).reverse().map(apiDocument) }));
  router.get('/messages', protect, roles('admin'), (req, res) => res.json({ messages: [...state.messages].reverse().map(apiDocument) }));
  for (const status of ['approve', 'reject']) router.post(`/messages/:id/${status}`, protect, roles('admin'), wrap(async (req, res) => { const message = state.messages.find((item) => item.id === req.params.id); if (!message) return res.status(404).json({ message: 'Message not found' }); message.status = status === 'approve' ? 'approved' : 'rejected'; await persist(); res.json({ message: apiDocument(message) }); }));

  router.use('/users', protect, roles('admin'));
  router.get('/users', (req, res) => res.json({ users: state.users.map((user) => apiDocument(safeUser(user))) }));
  router.patch('/users/:id/role', wrap(async (req, res) => { if (req.params.id === req.user.id) return res.status(400).json({ message: 'Admins cannot change their own role' }); const input = z.object({ role: z.enum(['user', 'seller', 'admin']) }).parse(req.body); const user = state.users.find((item) => item.id === req.params.id); if (!user) return res.status(404).json({ message: 'User not found' }); user.role = input.role; await persist(); res.json({ user: safeUser(user) }); }));
  router.patch('/users/:id/status', wrap(async (req, res) => { if (req.params.id === req.user.id) return res.status(400).json({ message: 'You cannot deactivate your own account' }); const user = state.users.find((item) => item.id === req.params.id); if (!user) return res.status(404).json({ message: 'User not found' }); user.isActive = !user.isActive; await persist(); res.json({ user: safeUser(user) }); }));

  router.use('/orders', protect);
  router.post('/orders', wrap(async (req, res) => {
    const input = z.object({ items: z.array(z.object({ productId: z.string(), quantity: z.coerce.number().int().min(1).max(100) })).min(1).max(50) }).parse(req.body);
    const quantities = new Map(); for (const item of input.items) quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
    const chosen = [];
    for (const [productId, quantity] of quantities) { const product = findProduct(productId); if (!product || product.status !== 'approved' || product.stock < quantity) return res.status(409).json({ message: 'One or more products are unavailable or out of stock' }); chosen.push({ product, quantity }); }
    const items = chosen.map(({ product, quantity }) => ({ productId: product.id, title: product.title, quantity, unitPrice: product.price, sellerId: product.sellerId }));
    for (const { product, quantity } of chosen) product.stock -= quantity;
    const order = { id: id(), userId: req.user.id, items, totalAmount: Number(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toFixed(2)), status: 'placed', createdAt: stamp() };
    state.orders.push(order); await persist(); res.status(201).json({ order: apiDocument(order) });
  }));
  router.get('/orders/mine', (req, res) => res.json({ orders: state.orders.filter((item) => item.userId === req.user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(apiDocument) }));
  router.get('/orders', roles('admin'), (req, res) => res.json({ orders: [...state.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((order) => ({ ...apiDocument(order), userId: { name: state.users.find((user) => user.id === order.userId)?.name || 'Customer', email: state.users.find((user) => user.id === order.userId)?.email || '' } })) }));
  router.patch('/orders/:id/status', roles('admin'), wrap(async (req, res) => { const input = z.object({ status: z.enum(['processing', 'shipped', 'delivered', 'cancelled']) }).parse(req.body); const order = state.orders.find((item) => item.id === req.params.id); if (!order) return res.status(404).json({ message: 'Order not found' }); order.status = input.status; await persist(); res.json({ order }); }));

  return router;
}
