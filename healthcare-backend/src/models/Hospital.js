import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  key: { type: String, default: 'main', enum: ['main'], unique: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  address: { type: String, trim: true, maxlength: 500, default: '' },
  phone: { type: String, trim: true, maxlength: 30, default: '' },
  openingHours: { type: String, trim: true, maxlength: 200, default: '' },
}, { timestamps: true });
export const Hospital = mongoose.model('Hospital', hospitalSchema);

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  key: { type: String, required: true, unique: true },
}, { timestamps: true });
export const Department = mongoose.model('Department', departmentSchema);
