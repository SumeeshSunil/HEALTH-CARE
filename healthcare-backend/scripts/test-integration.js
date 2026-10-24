// A real disposable MongoDB; no application database is read or changed.
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket, createServer } from 'node:net';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Department } from '../src/models/Hospital.js';
import { Appointment } from '../src/models/Appointment.js';
import { CatalogItem } from '../src/models/Services.js';
import { hashPassword } from '../src/utils/password.js';
import { createToken } from '../src/utils/token.js';
import { days } from '../src/utils/hospital.js';

function request(token, method, url, body) {
  return new Promise((resolveRequest, reject) => {
    const socket = new Socket();
    Object.defineProperty(socket, 'remoteAddress', { value: '127.0.0.1' });
    const req = new IncomingMessage(socket);
    req.method = method; req.url = '/api' + url; req.body = body;
    req.headers = token ? { authorization: 'Bearer ' + token } : {};
    const res = new ServerResponse(req);
    res.end = chunk => { socket.destroy(); resolveRequest({ status: res.statusCode, body: chunk ? JSON.parse(chunk.toString()) : null }); return res; };
    app.handle(req, res, reject);
  });
}
async function call(token, method, path, body, expected = 200) {
  const result = await request(token, method, path, body);
  assert.equal(result.status, expected, `${method} ${path}: ${JSON.stringify(result.body)}`);
  return result.body;
}
let database;
let productionServer;
let productionStopped;
try {
  process.env.JWT_SECRET = randomBytes(48).toString('hex');
  process.env.NODE_ENV = 'test'; process.env.ENABLE_DEMO_PAYMENTS = 'true';
  // Use a previously downloaded Windows test binary if available.
  const cached = resolve('node_modules/.cache/mongodb-memory-server/mongod.exe');
  database = await MongoMemoryServer.create(existsSync(cached) ? { binary: { systemBinary: cached } } : {});
  await mongoose.connect(database.getUri(), { dbName: 'healthcare_integration_test' });
  await Promise.all(Object.values(mongoose.models).map(m => m.init()));
  const password = 'Integration123!';
  const passwordHash = await hashPassword(password);
  const adminUser = await User.create({ name: 'Admin', email: 'admin@example.test', role: 'admin', passwordHash });
  const admin = createToken(adminUser.id);
  const patient = await call(null, 'POST', '/auth/register', { name: 'Patient', email: 'patient@example.test', password }, 201);
  const stranger = await call(null, 'POST', '/auth/register', { name: 'Other Patient', email: 'other@example.test', password }, 201);
  const p = patient.token;
  await call(null, 'GET', '/services/orders', undefined, 401);
  await call(null, 'GET', '/health');
  await call(null, 'POST', '/auth/register', { name: 'Bad', email: 'bad@example.test', password, role: 'admin' }, 400);
  assert.equal((await call(p, 'GET', '/auth/me')).user.role, 'patient');
  await call(p, 'GET', '/auth/users', undefined, 403);
  await call(p, 'POST', '/auth/staff', { name: 'Bad', email: 'bad@example.test', password, role: 'lab' }, 403);
  const labUser = (await call(admin, 'POST', '/auth/staff', { name: 'Lab', email: 'lab@example.test', password, role: 'lab' }, 201)).user;
  const pharmacyUser = (await call(admin, 'POST', '/auth/staff', { name: 'Pharmacy', email: 'pharmacy@example.test', password, role: 'pharmacy' }, 201)).user;
  const lab = (await call(null, 'POST', '/auth/login', { email: labUser.email, password })).token;
  const pharmacy = (await call(null, 'POST', '/auth/login', { email: pharmacyUser.email, password })).token;
  await call(null, 'POST', '/auth/login', { email: labUser.email, password: 'WrongPassword123' }, 401);
  assert.ok(!(await call(admin, 'GET', '/auth/users')).users.some(u => 'passwordHash' in u));
  console.log('PASS: JWT registration/login, role checks, staff creation, password privacy');

  await call(p, 'POST', '/services/catalog/lab', { name: 'Test', price: 10 }, 403);
  await call(pharmacy, 'POST', '/services/catalog/lab', { name: 'Test', price: 10 }, 403);
  const test = (await call(lab, 'POST', '/services/catalog/lab', { name: 'Blood test', price: 250 }, 201)).item;
  const med = (await call(pharmacy, 'POST', '/services/catalog/medicine', { name: 'Demo Medicine', price: 12.5, stock: 3 }, 201)).item;
  const labKey = randomUUID();
  const labOrder = (await call(p, 'POST', '/services/orders', { itemId: test.id, quantity: 1, bookingKey: labKey, amount: 1 }, 201)).order;
  assert.equal(labOrder.amount, 250);
  assert.equal((await call(p, 'POST', '/services/orders', { itemId: test.id, quantity: 1, bookingKey: labKey })).order.id, labOrder.id);
  await call(p, 'POST', '/services/orders', { itemId: test.id, quantity: 2, bookingKey: labKey }, 409);
  const labPath = '/services/orders/' + labOrder.id;
  await call(stranger.token, 'POST', labPath + '/payment', { method: 'demo' }, 403);
  await call(pharmacy, 'POST', labPath + '/payment', { method: 'cash' }, 403);
  await call(p, 'POST', labPath + '/payment', { method: 'cash' }, 403);
  await call(p, 'PATCH', labPath + '/status', { status: 'completed', result: 'Fake' }, 403);
  await call(lab, 'PATCH', labPath + '/status', { status: 'sample_collected' }, 409);
  assert.equal((await call(p, 'POST', labPath + '/payment', { method: 'demo', outcome: 'failed' })).order.payment.status, 'unpaid');
  const paid = (await call(p, 'POST', labPath + '/payment', { method: 'demo' })).order;
  assert.equal(paid.payment.status, 'paid');
  const repeated = await Promise.all(Array.from({ length: 4 }, () => call(p, 'POST', labPath + '/payment', { method: 'demo' })));
  for (const response of repeated) assert.equal(response.order.payment.reference, paid.payment.reference);
  await call(lab, 'PATCH', labPath + '/status', { status: 'completed', result: 'Report' }, 409);
  await call(lab, 'PATCH', labPath + '/status', { status: 'sample_collected' });
  await call(lab, 'PATCH', labPath + '/status', { status: 'completed', result: '' }, 400);
  await call(lab, 'PATCH', labPath + '/status', { status: 'completed', result: 'School demo result' });
  assert.equal((await call(p, 'GET', '/services/orders')).orders[0].result, 'School demo result');
  assert.equal((await call(stranger.token, 'GET', '/services/orders')).orders.length, 0);
  assert.equal((await call(pharmacy, 'GET', '/services/orders')).orders.length, 0);
  console.log('PASS: server-priced lab orders, retries, patient isolation, payment receipts, sample and report workflow');

  const orderMedicine = async () => (await call(p, 'POST', '/services/orders', { itemId: med.id, quantity: 2, bookingKey: randomUUID(), amount: 0 }, 201)).order;
  const m1 = await orderMedicine(); const m2 = await orderMedicine();
  assert.equal(m1.amount, 25);
  for (const order of [m1, m2]) await call(pharmacy, 'POST', '/services/orders/' + order.id + '/payment', { method: 'cash' });
  const dispense = id => request(pharmacy, 'PATCH', '/services/orders/' + id + '/status', { status: 'dispensed' });
  const dispenses = await Promise.all([dispense(m1.id), dispense(m1.id), dispense(m2.id)]);
  assert.ok(dispenses.some(r => r.status === 200));
  assert.ok(dispenses.some(r => r.status === 409));
  assert.equal((await CatalogItem.findById(med.id)).stock, 1, 'Concurrent dispensing never oversells stock');
  const completed = dispenses.find(r => r.status === 200).body.order;
  await dispense(completed.id);
  assert.equal((await CatalogItem.findById(med.id)).stock, 1, 'A dispense retry must not deduct twice');
  await call(pharmacy, 'POST', '/services/catalog/medicine/' + med.id + '/restock', { quantity: 5 });
  await call(pharmacy, 'PATCH', '/services/catalog/medicine/' + med.id, { name: med.name, price: 15, stock: 999, isActive: false });
  assert.equal((await CatalogItem.findById(med.id)).stock, 6, 'Editing a price must not overwrite inventory');
  assert.equal((await call(p, 'GET', '/services/catalog/medicine')).items.length, 0);
  await call(p, 'POST', '/services/orders', { itemId: med.id, quantity: 1, bookingKey: randomUUID() }, 404);
  assert.equal((await call(p, 'GET', '/services/orders')).orders.find(o => o.id === m1.id).amount, 25, 'Existing order price is unchanged');
  console.log('PASS: medicine totals, counter receipts, concurrent stock handling, restock, inactive catalog items');

  const department = await Department.create({ name: 'General Medicine', key: 'general medicine' });
  const doctor = await User.create({ name: 'Doctor', email: 'doctor@example.test', role: 'doctor', passwordHash,
    doctorProfile: { department: department.id, fee: 300, availability: days.map(day => ({ day, slots: ['09:00 AM'] })) } });
  const d = createToken(doctor.id);
  const otherDoctor = await User.create({ name: 'Other Doctor', email: 'other-doctor@example.test', role: 'doctor', passwordHash,
    doctorProfile: { department: department.id, fee: 300 } });
  const date = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const visit = (await call(p, 'POST', '/appointments', { doctorId: doctor.id, date, time: '09:00 AM', paymentChoice: 'hospital', bookingKey: randomUUID() }, 201)).appointment;
  assert.equal((await call(d, 'GET', '/lab-results')).results[0].result, 'School demo result');
  assert.equal((await call(createToken(otherDoctor.id), 'GET', '/lab-results')).results.length, 0);
  assert.equal((await call(stranger.token, 'GET', '/lab-results')).results.length, 0);
  await call(d, 'POST', '/appointments/' + visit.id + '/consultation', { diagnosis: 'Demo diagnosis' }, 409);
  await call(admin, 'PATCH', '/appointments/' + visit.id + '/status', { status: 'confirmed' });
  const consult = { diagnosis: 'Demo diagnosis', notes: 'School project notes', prescriptions: [{ medicine: 'Demo item', dosage: 'Demo schedule', duration: 'Demo duration' }] };
  await call(createToken(otherDoctor.id), 'POST', '/appointments/' + visit.id + '/consultation', consult, 403);
  await call(d, 'POST', '/appointments/' + visit.id + '/consultation', consult);
  assert.equal((await Appointment.findById(visit.id)).status, 'completed');
  assert.equal((await call(p, 'GET', '/records')).records[0].prescriptions[0].medicine, 'Demo item');
  assert.equal((await call(stranger.token, 'GET', '/records')).records.length, 0);
  assert.equal((await call(createToken(otherDoctor.id), 'GET', '/records')).records.length, 0);
  await call(d, 'POST', '/certificates', { patientId: stranger.user.id, type: 'Sick Leave Certificate', startDate: date, endDate: date, notes: 'Demo' }, 403);
  await call(d, 'POST', '/certificates', { patientId: patient.user.id, type: 'Sick Leave Certificate', startDate: date, endDate: date, notes: 'Demo' }, 201);
  assert.equal((await call(p, 'GET', '/certificates')).certificates.length, 1);
  assert.equal((await call(stranger.token, 'GET', '/certificates')).certificates.length, 0);
  assert.equal((await call(p, 'GET', '/messages/contacts')).contacts[0].id, doctor.id);
  await call(stranger.token, 'POST', '/messages', { recipientId: doctor.id, text: 'No appointment' }, 403);
  await call(p, 'POST', '/messages', { recipientId: doctor.id, text: 'Hello doctor' }, 201);
  await call(d, 'POST', '/messages', { recipientId: patient.user.id, text: 'Hello patient' }, 201);
  assert.equal((await call(p, 'GET', '/messages')).messages.length, 2);
  assert.equal((await call(createToken(otherDoctor.id), 'GET', '/messages')).messages.length, 0);
  console.log('PASS: atomic consultation saving, private medical records, certificates and appointment-linked messages');

  const notifications = (await call(p, 'GET', '/notifications')).notifications;
  assert.ok(notifications.length >= 4);
  await call(p, 'POST', '/notifications/read', { keys: notifications.map(n => n.id) });
  assert.ok((await call(p, 'GET', '/notifications')).notifications.every(n => !n.unread));
  assert.equal((await call(stranger.token, 'GET', '/notifications')).notifications.length, 0);
  const summary = (await call(admin, 'GET', '/reports')).summary;
  assert.equal(summary.demoPayments, 250); assert.equal(summary.hospitalReceipts, 50);
  await call(admin, 'PATCH', '/auth/users/' + labUser.id + '/status', { isActive: false });
  await call(lab, 'GET', '/services/orders', undefined, 401);
  process.env.NODE_ENV = 'production';
  const newOrder = (await call(p, 'POST', '/services/orders', { itemId: test.id, quantity: 1, bookingKey: randomUUID() }, 201)).order;
  await call(p, 'POST', '/services/orders/' + newOrder.id + '/payment', { method: 'demo' }, 403);
  console.log('PASS: saved notification reads, department reports, disabled accounts, production demo-payment guard');

  // Start the real production entry point against only this disposable database.
  const portProbe = createServer();
  await new Promise((resolve, reject) => { portProbe.once('error', reject); portProbe.listen(0, '127.0.0.1', resolve); });
  const port = portProbe.address().port;
  await new Promise(resolve => portProbe.close(resolve));
  productionServer = spawn(process.execPath, ['src/server.js'], { env: {
    ...process.env, NODE_ENV: 'production', PORT: String(port), HOST: '0.0.0.0',
    MONGODB_URI: database.getUri('healthcare_integration_test'),
    FRONTEND_URL: 'https://school-hosting-test.vercel.app', TRUST_PROXY_HOPS: '1',
  }, stdio: ['ignore', 'pipe', 'pipe'] });
  productionStopped = new Promise(resolve => productionServer.once('exit', resolve));
  let serverOutput = '';
  productionServer.stdout.on('data', data => { serverOutput += data.toString(); });
  productionServer.stderr.on('data', data => { serverOutput += data.toString(); });
  productionServer.on('error', error => { serverOutput += error.message; });
  const base = 'http://127.0.0.1:' + port + '/api';
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { ready = (await fetch(base + '/health', { signal: AbortSignal.timeout(1000) })).ok; } catch { /* Wait for MongoDB and the listener. */ }
    if (ready || productionServer.exitCode !== null) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, 'Production server did not become healthy: ' + serverOutput);
  assert.match(serverOutput, /0\.0\.0\.0/);
  const origin = 'https://school-hosting-test.vercel.app';
  const preflight = await fetch(base + '/auth/login', { method: 'OPTIONS', headers: {
    Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type,authorization',
  } });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
  const login = await fetch(base + '/auth/login', { method: 'POST', headers: {
    Origin: origin, 'Content-Type': 'application/json', 'X-Forwarded-For': '198.51.100.60',
  }, body: JSON.stringify({ email: 'patient@example.test', password }) });
  assert.equal(login.status, 200);
  const loginBody = await login.json();
  const me = await fetch(base + '/auth/me', { headers: { Origin: origin, Authorization: 'Bearer ' + loginBody.token } });
  assert.equal(me.status, 200);
  assert.equal((await me.json()).user.id, patient.user.id);
  const rejectedOrigin = await fetch(base + '/auth/me', { headers: { Origin: 'https://other.vercel.app' } });
  assert.equal(rejectedOrigin.status, 403);
  console.log('PASS: production server startup, public port binding, Vercel preflight, cross-origin login and JWT requests');

  const old = await promisify(execFile)(process.execPath, ['scripts/test-appointments-mongo.js'], {
    env: { ...process.env, MONGODB_URI: database.getUri() },
  });
  process.stdout.write(old.stdout);
  console.log('All integration checks passed.');
} catch (e) {
  console.error(e); process.exitCode = 1;
} finally {
  if (productionServer && productionServer.exitCode === null) productionServer.kill();
  if (productionStopped) await productionStopped;
  await mongoose.disconnect();
  if (database) await database.stop();
}
