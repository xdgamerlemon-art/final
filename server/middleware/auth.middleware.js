import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required' });
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user || !user.isActive) return res.status(401).json({ message: 'Account unavailable' });
    req.user = user;
    next();
  } catch (error) { next(error); }
}
