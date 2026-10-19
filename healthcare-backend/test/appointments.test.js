import test from 'node:test';
import assert from 'node:assert/strict';
import { Appointment } from '../src/models/Appointment.js';
import { assertBookingSlot, assertAccess, applyStatus, applyPayment, appointmentResponse, futureSlot, demoPaymentsEnabled } from '../src/utils/appointments.js';
const patientId = '507f1f77bcf86cd799439011';
const doctorId = '507f1f77bcf86cd799439012';
const patient = { id: patientId, role: 'patient' };
const doctor = { id: doctorId, role: 'doctor' };
const admin = { id: '507f1f77bcf86cd799439013', role: 'admin' };
function booking() {
  return new Appointment({ patient: patientId, doctor: doctorId, patientName: 'Patient', patientEmail: 'patient@example.com',
    doctorName: 'Doctor', department: 'General Medicine', date: '2030-01-07', time: '09:00 AM', seat: 1, bookingKey: 'test-booking-key-123456',
    bill: { amountPaise: 30000, paymentChoice: 'hospital' },
  });
}

test('future slots use India time and reject invalid dates and unscheduled times', () => {
  const now = new Date('2030-01-06T23:30:00Z'); // Monday 05:00 in India.
  const profile = { role: 'doctor', isActive: true, doctorProfile: { availability: [{ day: 'Monday', slots: ['09:00 AM'] }] } };
  assertBookingSlot(profile, '2030-01-07', '09:00 AM', now);
  assert.throws(() => assertBookingSlot(profile, '2030-01-07', '10:00 AM', now));
  assert.equal(futureSlot('2030-01-07', '04:30 AM', now), false);
  assert.equal(futureSlot('2030-02-31', '09:00 AM', now), false);
  assert.equal(futureSlot('2030-01-07', '05:00 AM', now), false);
  assert.throws(() => assertBookingSlot({ ...profile, isActive: false }, '2030-01-07', '09:00 AM', now));
});
test('patients and doctors cannot access another account appointment', () => {
  const doc = booking();
  assertAccess(doc, patient); assertAccess(doc, doctor); assertAccess(doc, admin);
  assert.throws(() => assertAccess(doc, { id: 'other', role: 'patient' }), err => err.status === 403);
  assert.throws(() => assertAccess(doc, { id: 'other', role: 'doctor' }), err => err.status === 403);
});
test('approval, cancellation, rejection and completion have separate role rules', () => {
  const doc = booking();
  assert.throws(() => applyStatus(doc, patient, 'confirmed'), err => err.status === 403);
  assert.throws(() => applyStatus(doc, doctor, 'completed'), err => err.status === 409);
  applyStatus(doc, admin, 'confirmed');
  applyStatus(doc, doctor, 'completed');
  assert.equal(doc.status, 'completed');
  assert.equal(doc.bill.status, 'unpaid');
  assert.throws(() => applyStatus(doc, patient, 'cancelled'), err => err.status === 409);
});
test('failed demo payments remain unpaid; successful payment is idempotent and does not approve booking', () => {
  const doc = booking();
  applyPayment(doc, { method: 'online', source: 'demo', userId: patientId, outcome: 'failed' });
  assert.equal(doc.bill.status, 'unpaid'); assert.equal(doc.bill.lastAttempt, 'failed');
  applyPayment(doc, { method: 'online', source: 'demo', userId: patientId });
  const reference = doc.bill.reference;
  applyPayment(doc, { method: 'cash', source: 'hospital', userId: admin.id });
  assert.equal(doc.bill.reference, reference); assert.equal(doc.bill.source, 'demo');
  assert.equal(doc.bill.status, 'paid'); assert.equal(doc.status, 'pending');
  assert.equal(appointmentResponse(doc).bill.amount, 300);
});
test('cancelling a paid appointment requests a refund and frees its seat', () => {
  const doc = booking();
  applyPayment(doc, { method: 'cash', source: 'hospital', userId: admin.id });
  applyStatus(doc, patient, 'cancelled');
  assert.equal(doc.occupiesSlot, false); assert.equal(doc.bill.status, 'refund_pending');
  assert.throws(() => applyPayment(doc, { method: 'online', source: 'demo', userId: patientId }), err => err.status === 409);
});
test('rejecting an unpaid booking voids its bill instead of keeping an outstanding debt', () => {
  const doc = booking(); applyStatus(doc, admin, 'rejected');
  assert.equal(doc.occupiesSlot, false); assert.equal(doc.bill.status, 'void');
});
test('slot seats outside 1–4 and invalid money values are rejected', async () => {
  const doc = booking(); await doc.validate();
  doc.seat = 5; await assert.rejects(doc.validate());
  doc.seat = 1; doc.bill.amountPaise = 0.5; await assert.rejects(doc.validate());
});
test('free consultations do not create refund debts when cancelled', () => {
  const doc = booking(); doc.bill.amountPaise = 0; doc.bill.status = 'paid'; doc.bill.source = 'free';
  applyStatus(doc, patient, 'cancelled'); assert.equal(doc.bill.status, 'void');
});
test('simulated payments are disabled in production', () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production'; assert.equal(demoPaymentsEnabled(), false);
  if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous;
});


test('populated booking contact details preserve patient identity and exclude private account fields', () => {
  const doc = booking().toObject({ virtuals: true });
  doc.patient = { _id: patientId, mobile: '1234567890', dob: '1995-03-12', passwordHash: 'secret', address: 'private address' };
  const result = appointmentResponse(doc);
  assert.equal(result.patientId, patientId);
  assert.equal(result.doctorId, doctorId);
  assert.equal(result.bill.patientId, patientId);
  assert.equal(result.patientName, 'Patient');
  assert.equal(result.status, 'pending');
  assert.deepEqual(result.patientDetails, { mobile: '1234567890', dob: '1995-03-12' });
  assert.equal(JSON.stringify(result).includes('secret'), false);
  assert.equal(JSON.stringify(result).includes('private address'), false);
});

test('older bookings without populated patient details show no fabricated profile values', () => {
  const result = appointmentResponse(booking());
  assert.equal(result.patientId, patientId);
  assert.deepEqual(result.patientDetails, { mobile: '', dob: '' });
});
