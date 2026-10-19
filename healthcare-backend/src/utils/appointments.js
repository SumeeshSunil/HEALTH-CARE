import { randomUUID } from 'node:crypto';
import { timePattern } from './hospital.js';
import { HttpError } from './HttpError.js';

export function demoPaymentsEnabled() {
  return process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEMO_PAYMENTS !== 'false';
}

export function hospitalClock(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return { date: value.year + '-' + value.month + '-' + value.day, minutes: Number(value.hour) * 60 + Number(value.minute) };
}
export function validDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(date + 'T00:00:00Z');
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}
export function futureSlot(date, time, now = new Date()) {
  if (!validDate(date) || typeof time !== 'string' || !timePattern.test(time)) return false;
  const clock = hospitalClock(now);
  const [hour, minute] = time.slice(0, 5).split(':').map(Number);
  const minutes = (hour % 12 + (time.endsWith('PM') ? 12 : 0)) * 60 + minute;
  return date > clock.date || (date === clock.date && minutes > clock.minutes);
}
export function scheduledSlots(doctor, date) {
  if (!validDate(date)) throw new HttpError(400, 'Choose a valid appointment date');
  const day = new Date(date + 'T12:00:00+05:30').toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', weekday: 'long' });
  return doctor.doctorProfile?.availability.find(item => item.day === day)?.slots || [];
}
export function assertBookingSlot(doctor, date, time, now = new Date()) {
  if (!doctor?.isActive || doctor.role !== 'doctor') throw new HttpError(400, 'Doctor is unavailable');
  if (!futureSlot(date, time, now)) throw new HttpError(400, 'Choose a future consultation slot');
  if (!scheduledSlots(doctor, date).includes(time)) throw new HttpError(400, 'This time is outside the doctor schedule');
}
export function assertAccess(appointment, user) {
  const allowed = user.role === 'admin'
    || (user.role === 'patient' && String(appointment.patient) === user.id)
    || (user.role === 'doctor' && String(appointment.doctor) === user.id);
  if (!allowed) throw new HttpError(403, 'You cannot access this appointment');
}
export function applyStatus(appointment, user, status) {
  assertAccess(appointment, user);
  const allowed = (user.role === 'admin' && ['confirmed', 'rejected', 'cancelled'].includes(status))
    || (user.role === 'patient' && status === 'cancelled')
    || (user.role === 'doctor' && status === 'completed');
  if (!allowed) throw new HttpError(403, 'You cannot perform this appointment action');
  if (appointment.status === status) return;
  const prior = status === 'confirmed' || status === 'rejected' ? ['pending']
    : status === 'completed' ? ['confirmed'] : ['pending', 'confirmed'];
  if (!prior.includes(appointment.status)) throw new HttpError(409, 'Appointment status has changed. Refresh the list');
  appointment.status = status;
  if (status === 'completed') appointment.completedAt = new Date();
  if (status === 'cancelled' || status === 'rejected') {
    appointment.occupiesSlot = false;
    appointment.bill.status = appointment.bill.status === 'paid' && appointment.bill.amountPaise > 0 ? 'refund_pending' : 'void';
  }
}
export function applyPayment(appointment, { method, source, userId, outcome = 'success' }) {
  if (!['pending', 'confirmed', 'completed'].includes(appointment.status)) throw new HttpError(409, 'Payment is unavailable for a cancelled or rejected appointment');
  if (appointment.bill.status === 'paid') return;
  if (appointment.bill.status !== 'unpaid') throw new HttpError(409, 'This bill cannot be paid');
  if (outcome === 'failed') { appointment.bill.lastAttempt = 'failed'; return; }
  appointment.bill.status = 'paid'; appointment.bill.method = method; appointment.bill.source = source;
  appointment.bill.paidAt = new Date(); appointment.bill.recordedBy = userId;
  appointment.bill.reference = (source === 'demo' ? 'DEMO-' : 'HOSPITAL-') + randomUUID();
  appointment.bill.lastAttempt = 'success';
}
export function appointmentResponse(doc) {
  const amount = doc.bill.amountPaise / 100;
  const patientId = String(doc.patient?._id || doc.patient);
  const doctorId = String(doc.doctor?._id || doc.doctor);
  return {
    id: doc.id, version: doc.__v ?? 0, patientId, doctorId,
    patientName: doc.patientName, patientEmail: doc.patientEmail, doctorName: doc.doctorName,
    patientDetails: { name: doc.patient?.name || doc.patientName, email: doc.patient?.email || doc.patientEmail,
      mobile: doc.patient?.mobile || '', dob: doc.patient?.dob || '', gender: doc.patient?.gender || '',
      bloodGroup: doc.patient?.bloodGroup || '', emergencyContact: doc.patient?.emergencyContact || '', address: doc.patient?.address || '' },
    department: doc.department, date: doc.date, time: doc.time, reason: doc.reason,
    status: doc.status, createdAt: doc.createdAt, completedAt: doc.completedAt,
    bill: { id: doc.id, appointmentId: doc.id, invoiceNumber: 'INV-' + doc.id.toUpperCase(),
      patientId, doctorId, patientName: doc.patientName, doctorName: doc.doctorName,
      date: doc.date, description: 'Consultation with ' + doc.doctorName, amount, totalAmount: amount,
      paymentChoice: doc.bill.paymentChoice, status: doc.bill.status, paymentMethod: doc.bill.method,
      source: doc.bill.source, isDemo: doc.bill.source === 'demo', paidOn: doc.bill.paidAt,
      refundedAt: doc.bill.refundedAt, reference: doc.bill.reference, lastAttempt: doc.bill.lastAttempt },
  };
}
