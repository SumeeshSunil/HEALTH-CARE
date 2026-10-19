import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { readToken } from '../utils/token.js';

export async function requireAuth(req, res, next) {
  const match = /^Bearer (\S+)$/i.exec(req.get('authorization') || '');
  if (!match) return res.status(401).json({ message: 'Sign in to continue' });
  let payload;
  try {
    payload = readToken(match[1]);
    if (!mongoose.isObjectIdOrHexString(payload.sub)) throw new Error('Invalid subject');
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token. Sign in again' });
  }
  // Read current permissions, so a disabled account cannot reuse an old token.
  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) return res.status(401).json({ message: 'Account unavailable' });
  req.user = user;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission for this action' });
    }
    next();
  };
}
