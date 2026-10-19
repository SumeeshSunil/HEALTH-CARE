import mongoose from 'mongoose';

export async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

// Do not log connection strings: they may contain passwords.
mongoose.connection.on('error', () => console.error('MongoDB connection error'));
mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
