import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['patient', 'doctor', 'admin', 'pharmacy', 'lab'], default: 'patient' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);

// Explicit fields prevent password hashes from leaking in API responses.
export function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive };
}
