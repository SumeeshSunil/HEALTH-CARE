import mongoose from 'mongoose';
import { timePattern } from '../utils/hospital.js';

const billSchema = new mongoose.Schema({
  amountPaise: { type: Number, required: true, min: 0, max: 10000000, immutable: true, validate: Number.isSafeInteger },
  paymentChoice: { type: String, enum: ['hospital', 'online'], required: true },
  status: { type: String, enum: ['unpaid', 'paid', 'void', 'refund_pending', 'refunded'], default: 'unpaid' },
  method: { type: String, enum: ['cash', 'card', 'online', 'waived', null], default: null },
  source: { type: String, enum: ['hospital', 'demo', 'free', null], default: null },
  paidAt: { type: Date, default: null },
  refundedAt: { type: Date, default: null },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reference: { type: String, default: null },
  lastAttempt: { type: String, enum: ['failed', 'success', null], default: null },
}, { _id: false });

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  patientEmail: { type: String, required: true },
  doctorName: { type: String, required: true },
  department: { type: String, required: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  time: { type: String, required: true, match: timePattern },
  reason: { type: String, trim: true, maxlength: 2000, default: '' },
  status: { type: String, enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'], default: 'pending' },
  seat: { type: Number, required: true, min: 1, max: 4, validate: Number.isInteger },
  occupiesSlot: { type: Boolean, default: true },
  bookingKey: { type: String, required: true, maxlength: 100 },
  bill: { type: billSchema, required: true },
  completedAt: { type: Date, default: null },
}, { timestamps: true, optimisticConcurrency: true });

// Four seats per slot: a unique index prevents concurrent requests claiming the same seat.
appointmentSchema.index({ doctor: 1, date: 1, time: 1, seat: 1 }, { unique: true, name: 'slot_seat', partialFilterExpression: { occupiesSlot: true } });
appointmentSchema.index({ patient: 1, doctor: 1, date: 1, time: 1 }, { unique: true, name: 'patient_slot', partialFilterExpression: { occupiesSlot: true } });
appointmentSchema.index({ patient: 1, bookingKey: 1 }, { unique: true, name: 'booking_retry' });
export const Appointment = mongoose.model('Appointment', appointmentSchema);
