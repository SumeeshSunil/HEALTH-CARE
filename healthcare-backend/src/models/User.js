import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['patient', 'doctor', 'admin', 'pharmacy', 'lab'], default: 'patient' },
  address: { type: String, default: "", maxlength: 500 },
  mobile: { type: String, default: "", maxlength: 30 },
  dob: { type: String, default: "", maxlength: 10 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);

// Explicit fields prevent password hashes from leaking in API responses.
export function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive, address: user.address, mobile: user.mobile, dob: user.dob };
}
