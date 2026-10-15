import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB, { closeDB } from './config/db.js';
import { createLocalDevApi } from './routes/localDevApi.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import userRoutes from './routes/user.routes.js';
import messageRoutes from './routes/message.routes.js';
import orderRoutes from './routes/order.routes.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL?.split(',').map((origin) => origin.trim()) || 'http://localhost:5173' }));
app.use(express.json({ limit: '32kb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const port = Number(process.env.PORT) || 5000;
async function start() {
	const localMode = !process.env.MONGO_URI;
	if (localMode && process.env.NODE_ENV === 'production') throw new Error('MONGO_URI and JWT_SECRET must be configured in production');
	if (localMode) {
		console.warn('LOCAL DEVELOPMENT MODE: using persistent JSON data instead of MongoDB. Do not use this mode in production.');
		app.use('/api', await createLocalDevApi());
	} else {
		if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET must be configured when MONGO_URI is set');
		await connectDB();
		app.use('/api/auth', authRoutes);
		app.use('/api/products', productRoutes);
		app.use('/api/users', userRoutes);
		app.use('/api/messages', messageRoutes);
		app.use('/api/orders', orderRoutes);
	}
	app.use(notFound);
	app.use(errorHandler);
	const server = app.listen(port, '127.0.0.1', () => console.log(`ArtisanCraft API listening on http://localhost:${port}`));
	const shutdown = async () => { server.close(); if (!localMode) await closeDB(); process.exit(0); };
	process.once('SIGINT', shutdown);
	process.once('SIGTERM', shutdown);
}
start().catch((error) => { console.error('ArtisanCraft API failed to start:', error.message); process.exit(1); });
