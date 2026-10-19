import mongoose from 'mongoose';
import { days, timePattern, validAvailability } from '../utils/hospital.js';

const doctorProfileSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  fee: { type: Number, min: 0, max: 100000, required: true },
  qualification: { type: String, default: '', maxlength: 150 },
  experience: { type: String, default: '', maxlength: 100 },
  availability: { type: [new mongoose.Schema({
    day: { type: String, enum: days, required: true },
    slots: [{ type: String, match: timePattern }],
  }, { _id: false })], default: [], validate: validAvailability },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['patient', 'doctor', 'admin', 'pharmacy', 'lab'], default: 'patient' },
  address: { type: String, default: "", maxlength: 500 },
  mobile: { type: String, default: "", maxlength: 30 },
  dob: { type: String, default: "", maxlength: 10 },
  doctorProfile: { type: doctorProfileSchema, default: undefined },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);

// Explicit fields prevent password hashes from leaking in API responses.
export function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive, address: user.address, mobile: user.mobile, dob: user.dob };
}
