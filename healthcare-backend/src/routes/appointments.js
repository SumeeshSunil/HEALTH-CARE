import { Router } from 'express';
import mongoose from 'mongoose';
import { Appointment } from '../models/Appointment.js';
import { User } from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { HttpError } from '../utils/HttpError.js';
import { demoPaymentsEnabled, validDate, futureSlot, scheduledSlots, assertBookingSlot, assertAccess, applyStatus, applyPayment, appointmentResponse } from '../utils/appointments.js';

export const appointmentRouter = Router();
appointmentRouter.use(requireAuth, requireRole('patient', 'doctor', 'admin'));

appointmentRouter.get('/', async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : req.user.role === 'doctor' ? { doctor: req.user.id } : { patient: req.user.id };
  const appointments = await Appointment.find(filter).populate('patient', 'name email mobile dob gender bloodGroup emergencyContact address').sort({ date: -1, createdAt: -1 });
  res.json({ appointments: appointments.map(appointmentResponse), demoPaymentsEnabled: demoPaymentsEnabled() });
});

// Counts only; patients never receive another patient's booking details.
appointmentRouter.get('/availability', async (req, res) => {
  const { doctorId, date } = req.query;
  if (!mongoose.isObjectIdOrHexString(doctorId) || !validDate(date)) throw new HttpError(400, 'Choose a doctor and valid date');
  const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isActive: true });
  if (!doctor) throw new HttpError(404, 'Doctor is unavailable');
  const counts = await Appointment.aggregate([
    { $match: { doctor: new mongoose.Types.ObjectId(doctorId), date, occupiesSlot: true } },
    { $group: { _id: '$time', count: { $sum: 1 } } },
  ]);
  const slots = scheduledSlots(doctor, date).filter(time => futureSlot(date, time))
    .map(time => ({ time, remaining: Math.max(0, 4 - (counts.find(item => item._id === time)?.count || 0)) }));
  res.json({ slots, demoPaymentsEnabled: demoPaymentsEnabled() });
});

function sameBooking(existing, body) {
  return String(existing.doctor) === body.doctorId && existing.date === body.date && existing.time === body.time
    && existing.bill.paymentChoice === body.paymentChoice && existing.reason === (body.reason || '').trim();
}
async function retryResponse(req, res) {
  const existing = await Appointment.findOne({ patient: req.user.id, bookingKey: req.body.bookingKey });
  if (!existing) return false;
  if (!sameBooking(existing, req.body)) throw new HttpError(409, 'This booking was already submitted with different details. Check My Appointments');
  res.json({ appointment: appointmentResponse(existing) });
  return true;
}

appointmentRouter.post('/', requireRole('patient'), async (req, res) => {
  const { doctorId, date, time, paymentChoice, bookingKey, reason = '' } = req.body || {};
  if (!mongoose.isObjectIdOrHexString(doctorId) || !validDate(date) || typeof time !== 'string'
      || !['hospital', 'online'].includes(paymentChoice) || typeof bookingKey !== 'string' || !/^[a-zA-Z0-9_-]{16,100}$/.test(bookingKey)
      || typeof reason !== 'string' || reason.length > 2000) throw new HttpError(400, 'Provide doctor, date, time, payment choice and a booking key');
  if (await retryResponse(req, res)) return;
  if (paymentChoice === 'online' && !demoPaymentsEnabled()) throw new HttpError(400, 'Online payment is not available. Choose Pay at hospital');
  const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isActive: true }).populate('doctorProfile.department');
  if (!doctor?.doctorProfile?.department) throw new HttpError(404, 'Doctor is unavailable');
  assertBookingSlot(doctor, date, time);
  const amountPaise = Math.round(doctor.doctorProfile.fee * 100);
  for (let seat = 1; seat <= 4; seat++) {
    try {
      const appointment = await Appointment.create({
        patient: req.user.id, doctor: doctorId, patientName: req.user.name, patientEmail: req.user.email,
        doctorName: doctor.name, department: doctor.doctorProfile.department.name,
        date, time, reason: reason.trim(), bookingKey, seat,
        bill: { amountPaise, paymentChoice, ...(amountPaise === 0 ? { status: 'paid', method: 'waived', source: 'free', paidAt: new Date() } : {}) },
      });
      await appointment.populate('patient', 'name email mobile dob gender bloodGroup emergencyContact address');
      return res.status(201).json({ appointment: appointmentResponse(appointment) });
    } catch (err) {
      if (err.code !== 11000) throw err;
      if (await retryResponse(req, res)) return;
      if (err.keyPattern?.patient) throw new HttpError(409, 'You already have an appointment in this doctor slot');
      if (!err.keyPattern?.seat) throw err;
      // Another request claimed this seat. Try the next of the four seats.
    }
  }
  throw new HttpError(409, 'This slot is full. Choose another consultation time');
});

async function changeAppointment(req, change) {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) throw new HttpError(400, 'Invalid appointment ID');
  for (let attempt = 0; attempt < 3; attempt++) {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) throw new HttpError(404, 'Appointment not found');
    assertAccess(appointment, req.user);
    change(appointment);
    try { await appointment.save(); await appointment.populate('patient', 'name email mobile dob gender bloodGroup emergencyContact address'); return appointmentResponse(appointment); }
    catch (err) { if (err.name !== 'VersionError') throw err; }
  }
  throw new HttpError(409, 'Another update changed this appointment. Refresh and try again');
}

appointmentRouter.patch('/:id/status', async (req, res) => {
  const appointment = await changeAppointment(req, doc => applyStatus(doc, req.user, req.body?.status));
  res.json({ appointment });
});

appointmentRouter.post('/:id/payment/demo', requireRole('patient'), async (req, res) => {
  if (!demoPaymentsEnabled()) throw new HttpError(403, 'Demo payments are disabled');
  if (!['success', 'failed'].includes(req.body?.outcome)) throw new HttpError(400, 'Choose a demo payment outcome');
  const appointment = await changeAppointment(req, doc => applyPayment(doc, { method: 'online', source: 'demo', userId: req.user.id, outcome: req.body.outcome }));
  res.json({ appointment });
});

appointmentRouter.post('/:id/payment/hospital', requireRole('admin'), async (req, res) => {
  if (!['cash', 'card', 'online'].includes(req.body?.method)) throw new HttpError(400, 'Choose cash, card or online as the received payment method');
  const appointment = await changeAppointment(req, doc => applyPayment(doc, { method: req.body.method, source: 'hospital', userId: req.user.id }));
  res.json({ appointment });
});

appointmentRouter.post('/:id/payment/refund', requireRole('admin'), async (req, res) => {
  const appointment = await changeAppointment(req, doc => {
    if (doc.bill.status === 'refunded') return;
    if (doc.bill.status !== 'refund_pending') throw new HttpError(409, 'No refund is pending for this bill');
    // Records an already completed refund; this endpoint transfers no money.
    doc.bill.status = 'refunded'; doc.bill.refundedAt = new Date();
  });
  res.json({ appointment });
});
