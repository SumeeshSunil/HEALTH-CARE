import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { User, publicUser } from '../models/User.js';
import { hashPassword, verifyPassword, validPassword } from '../utils/password.js';
import { createToken } from '../utils/token.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const authRouter = Router();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 20,
  standardHeaders: 'draft-8', legacyHeaders: false,
  message: { message: 'Too many attempts. Try again in 15 minutes' },
});
const normalizeEmail = (value) => typeof value === 'string' ? value.trim().toLowerCase() : '';

authRouter.post('/register', limiter, async (req, res) => {
  const { name, password, role } = req.body || {};
  const email = normalizeEmail(req.body?.email);
  if (role !== undefined && role !== 'patient') {
    return res.status(400).json({ message: 'Public registration is for patients only' });
  }
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 100
      || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || !validPassword(password)) {
    return res.status(400).json({ message: 'Provide a name, valid email, and password of 8–128 characters' });
  }
  const passwordHash = await hashPassword(password);
  try {
    const user = await User.create({ name: name.trim(), email, passwordHash, role: 'patient' });
    res.status(201).json({ token: createToken(user.id), user: publicUser(user) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Email is already registered' });
    throw err;
  }
});

authRouter.post('/login', limiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;
  if (!email || email.length > 254 || !validPassword(password)) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !user.isActive || !await verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({ token: createToken(user.id), user: publicUser(user) });
});

authRouter.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

// First role-protected endpoint: the admin can view registered users.
authRouter.get('/users', requireAuth, requireRole('admin'), async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).limit(100);
  res.json({ users: users.map(publicUser) });
});
