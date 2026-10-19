import { patientProfileUpdate } from '../utils/patientProfile.js';
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
  const { address = '', mobile = '', dob = '' } = req.body;
  if (typeof address !== 'string' || address.length > 500
      || typeof mobile !== 'string' || mobile.length > 30
      || typeof dob !== 'string' || (dob && (!/^\d{4}-\d{2}-\d{2}$/.test(dob)
      || Number.isNaN(Date.parse(dob)) || new Date(dob).toISOString().slice(0, 10) !== dob || dob > new Date().toISOString().slice(0, 10)))) {
    return res.status(400).json({ message: 'Provide valid address, mobile and date of birth values' });
  }
  const passwordHash = await hashPassword(password);
  try {
    const user = await User.create({ name: name.trim(), email, passwordHash, role: 'patient', address, mobile, dob });
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

// JWT identifies the account. Client-supplied IDs and permission changes are rejected.
authRouter.patch('/me', requireAuth, requireRole('patient'), async (req, res) => {
  const values = patientProfileUpdate(req.body);
  const user = await User.findByIdAndUpdate(req.user.id, { $set: values }, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ message: 'Patient account not found' });
  res.json({ user: publicUser(user) });
});

// First role-protected endpoint: the admin can view registered users.
authRouter.get('/users', requireAuth, requireRole('admin'), async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).limit(100);
  res.json({ users: users.map(publicUser) });
});

// Status changes take effect on the next authenticated request.
authRouter.patch('/users/:id/status', requireAuth, requireRole('admin'), async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ message: 'You cannot disable your own account' });
  if (!/^[a-f0-9]{24}$/i.test(req.params.id) || typeof req.body?.isActive !== 'boolean') {
    return res.status(400).json({ message: 'Provide a valid user ID and active status' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { $set: { isActive: req.body.isActive } }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: publicUser(user) });
});
