// Integration checks run in a uniquely named, temporary database, never the app database.
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import mongoose from 'mongoose';
import express from 'express';
import { User } from '../src/models/User.js';
import { Department } from '../src/models/Hospital.js';
import { Appointment } from '../src/models/Appointment.js';
import { appointmentRouter } from '../src/routes/appointments.js';
import { createToken } from '../src/utils/token.js';
import { hashPassword } from '../src/utils/password.js';
import { HttpError } from '../src/utils/HttpError.js';

const testDbName = 'healthcare_appointment_test_' + randomBytes(8).toString('hex');
let connected = false;
function request(app, user, method, url, body) {
  return new Promise((resolve, reject) => {
    const socket = new Socket();
    const req = new IncomingMessage(socket);
    req.method = method; req.url = url; req.body = body;
    req.headers = { authorization: 'Bearer ' + createToken(user.id) };
    const res = new ServerResponse(req);
    res.end = chunk => { socket.destroy(); resolve({ status: res.statusCode, body: chunk ? JSON.parse(chunk.toString()) : null }); return res; };
    app.handle(req, res, reject);
  });
}
try {
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI in .env first');
  process.env.JWT_SECRET ||= randomBytes(48).toString('hex');
  process.env.NODE_ENV = 'test'; process.env.ENABLE_DEMO_PAYMENTS = 'true';
  await mongoose.connect(process.env.MONGODB_URI, { dbName: testDbName, serverSelectionTimeoutMS: 5000 });
  connected = true;
  await Promise.all([User.init(), Department.init(), Appointment.init()]);
  const app = express();
  app.use('/api/appointments', appointmentRouter);
  app.use((err, req, res, next) => res.status(err instanceof HttpError ? err.status : 500).json({ message: err instanceof HttpError ? err.message : 'Unexpected integration test error' }));
  const passwordHash = await hashPassword('IntegrationTestOnly123!');
  const patients = await User.create(Array.from({ length: 5 }, (_, i) => ({ name: 'Test Patient ' + i, email: 'patient' + i + '@example.com', role: 'patient', passwordHash })));
  const admin = await User.create({ name: 'Test Admin', email: 'admin@example.com', role: 'admin', passwordHash });
  const department = await Department.create({ name: 'General Medicine', key: 'general medicine' });
  const date = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const day = new Date(date + 'T12:00:00+05:30').toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', weekday: 'long' });
  const doctorProfile = { department: department.id, fee: 300, availability: [{ day, slots: ['09:00 AM', '10:00 AM'] }] };
  const doctor = await User.create({ name: 'Test Doctor', email: 'doctor@example.com', role: 'doctor', passwordHash, doctorProfile });
  const otherDoctor = await User.create({ name: 'Other Doctor', email: 'other-doctor@example.com', role: 'doctor', passwordHash, doctorProfile });
  const bodies = patients.map(() => ({ doctorId: doctor.id, date, time: '09:00 AM', reason: 'Integration test', paymentChoice: 'hospital', bookingKey: randomUUID(), amount: 1 }));
  const bookings = await Promise.all(patients.map((patient, i) => request(app, patient, 'POST', '/api/appointments', bodies[i])));
  assert.equal(bookings.filter(result => result.status === 201).length, 4, 'Exactly four concurrent bookings must succeed');
  assert.equal(bookings.filter(result => result.status === 409).length, 1, 'The fifth booking must be refused');
  assert.equal(await Appointment.countDocuments({ occupiesSlot: true }), 4);
  const successful = bookings.map((result, i) => ({ ...result, patient: patients[i], index: i })).filter(result => result.status === 201);
  const first = successful[0];
  assert.equal(first.body.appointment.bill.amount, 300, 'Client-provided amount must be ignored');
  const retry = await request(app, first.patient, 'POST', '/api/appointments', bodies[first.index]);
  assert.equal(retry.status, 200); assert.equal(retry.body.appointment.id, first.body.appointment.id);
  const duplicate = await request(app, first.patient, 'POST', '/api/appointments', { ...bodies[first.index], bookingKey: randomUUID() });
  assert.equal(duplicate.status, 409, 'The same patient cannot book the same slot twice');
  assert.equal((await request(app, first.patient, 'GET', '/api/appointments')).body.appointments.length, 1);
  assert.equal((await request(app, otherDoctor, 'GET', '/api/appointments')).body.appointments.length, 0);
  const firstPath = '/api/appointments/' + first.body.appointment.id;
  assert.equal((await request(app, first.patient, 'PATCH', firstPath + '/status', { status: 'confirmed' })).status, 403);
  const stranger = patients.find(patient => patient.id !== first.patient.id);
  assert.equal((await request(app, stranger, 'POST', firstPath + '/payment/demo', { outcome: 'success' })).status, 403);
  let response = await request(app, first.patient, 'POST', firstPath + '/payment/demo', { outcome: 'failed' });
  assert.equal(response.status, 200); assert.equal(response.body.appointment.bill.status, 'unpaid');
  response = await request(app, first.patient, 'POST', firstPath + '/payment/demo', { outcome: 'success' });
  assert.equal(response.status, 200); assert.equal(response.body.appointment.status, 'pending'); assert.equal(response.body.appointment.bill.status, 'paid');
  const receipt = response.body.appointment.bill.reference;
  response = await request(app, first.patient, 'POST', firstPath + '/payment/demo', { outcome: 'success' });
  assert.equal(response.body.appointment.bill.reference, receipt);
  response = await request(app, first.patient, 'PATCH', firstPath + '/status', { status: 'cancelled' });
  assert.equal(response.status, 200); assert.equal(response.body.appointment.bill.status, 'refund_pending');
  const failedIndex = bookings.findIndex(result => result.status === 409);
  assert.equal((await request(app, patients[failedIndex], 'POST', '/api/appointments', bodies[failedIndex])).status, 201, 'A cancelled seat must become available');
  assert.equal((await request(app, admin, 'POST', firstPath + '/payment/refund')).body.appointment.bill.status, 'refunded');
  const second = successful[1]; const secondPath = '/api/appointments/' + second.body.appointment.id;
  assert.equal((await request(app, admin, 'PATCH', secondPath + '/status', { status: 'confirmed' })).status, 200);
  response = await request(app, admin, 'POST', secondPath + '/payment/hospital', { method: 'cash' });
  assert.equal(response.status, 200); assert.equal(response.body.appointment.bill.paymentMethod, 'cash');
  assert.equal((await request(app, doctor, 'PATCH', secondPath + '/status', { status: 'completed' })).status, 200);
  const raceBooking = await request(app, first.patient, 'POST', '/api/appointments', { ...bodies[first.index], time: '10:00 AM', bookingKey: randomUUID() });
  assert.equal(raceBooking.status, 201);
  const racePath = '/api/appointments/' + raceBooking.body.appointment.id;
  await Promise.all([
    request(app, first.patient, 'POST', racePath + '/payment/demo', { outcome: 'success' }),
    request(app, first.patient, 'PATCH', racePath + '/status', { status: 'cancelled' }),
  ]);
  const final = await Appointment.findById(raceBooking.body.appointment.id);
  assert.equal(final.status, 'cancelled');
  assert.ok(['refund_pending', 'void'].includes(final.bill.status), 'Cancelled booking must never remain paid');
  console.log('MongoDB checks passed: concurrent capacity, retries, account scope, payment choices, receipts, refunds and cancellation/payment races.');
} catch (err) {
  console.error(err.name === 'MongooseServerSelectionError'
    ? 'MongoDB integration check could not connect. Run npm run test:mongo in your own backend terminal.'
    : err.name === 'AssertionError' ? err.message : 'MongoDB integration check failed: ' + err.name);
  process.exitCode = 1;
} finally {
  if (connected && mongoose.connection.name === testDbName && testDbName.startsWith('healthcare_appointment_test_')) {
    await mongoose.connection.dropDatabase();
  }
  await mongoose.disconnect();
}
