import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { hashPassword, validPassword } from '../src/utils/password.js';

try {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const name = process.env.ADMIN_NAME?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || !name || name.length > 100 || !validPassword(password)) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD (8–128 characters).');
  }
  await connectDB();
  await User.init();
  if (await User.exists({ email })) throw new Error('Email already exists. No account was changed.');
  await User.create({ name, email, passwordHash: await hashPassword(password), role: 'admin' });
  console.log('Admin created. Remove ADMIN_PASSWORD from your local settings.');
} catch (err) {
  console.error(err.message.startsWith('Set ADMIN') || err.message.startsWith('Email already')
    ? err.message : 'Admin creation failed. Check database connection and settings.');
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
