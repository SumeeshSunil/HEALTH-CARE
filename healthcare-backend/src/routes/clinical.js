import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Appointment } from '../models/Appointment.js';
import { User } from '../models/User.js';
import { Certificate, Message, ServiceOrder, NotificationRead } from '../models/Services.js';
import { HttpError } from '../utils/HttpError.js';
import { validDate } from '../utils/appointments.js';

export const clinicalRouter = Router();
clinicalRouter.use(requireAuth);
function scope(user) {
  return user.role === 'admin' ? {} : user.role === 'doctor' ? { doctor: user.id } : { patient: user.id };
}
const clinicalRoles = requireRole('patient', 'doctor', 'admin');
function certificateResponse(doc) {
  return { id: doc.id, patientId: String(doc.patient), doctorId: String(doc.doctor),
    patientName: doc.patientName, doctorName: doc.doctorName, type: doc.type,
    startDate: doc.startDate, endDate: doc.endDate, notes: doc.notes, createdAt: doc.createdAt };
}

clinicalRouter.get('/records', clinicalRoles, async (req, res) => {
  const visits = await Appointment.find({ ...scope(req.user), consultation: { $exists: true } }).sort({ completedAt: -1 });
  res.json({ records: visits.map(v => ({ id: v.id, appointmentId: v.id, patientId: String(v.patient), doctorId: String(v.doctor),
    doctorName: v.doctorName, date: v.completedAt?.toISOString().slice(0, 10),
    diagnosis: v.consultation.diagnosis, notes: v.consultation.notes, prescriptions: v.consultation.prescriptions })) });
});

clinicalRouter.get('/lab-results', clinicalRoles, async (req, res) => {
  let filter = { kind: 'lab', status: 'completed' };
  if (req.user.role === 'patient') filter.patient = req.user.id;
  if (req.user.role === 'doctor') {
    const patients = await Appointment.distinct('patient', { doctor: req.user.id });
    filter.patient = { $in: patients };
  }
  const results = await ServiceOrder.find(filter).sort({ updatedAt: -1 });
  res.json({ results: results.map(o => ({ id: o.id, patientId: String(o.patient), test: o.itemName, result: o.result, date: o.updatedAt })) });
});

clinicalRouter.get('/certificates', clinicalRoles, async (req, res) => {
  res.json({ certificates: (await Certificate.find(scope(req.user)).sort({ createdAt: -1 })).map(certificateResponse) });
});
clinicalRouter.post('/certificates', requireRole('doctor'), async (req, res) => {
  const { patientId, type, startDate, endDate, notes } = req.body || {};
  if (!mongoose.isObjectIdOrHexString(patientId) || !validDate(startDate) || !validDate(endDate) || endDate < startDate
      || !['Sick Leave Certificate', 'Medical Fitness Certificate', 'Return to Work Authorization'].includes(type)
      || typeof notes !== 'string' || !notes.trim() || notes.length > 2000) throw new HttpError(400, 'Provide a patient, certificate type, date range and notes');
  if (!await Appointment.exists({ patient: patientId, doctor: req.user.id, status: 'completed' })) throw new HttpError(403, 'Complete a consultation with this patient first');
  const patient = await User.findById(patientId);
  if (!patient) throw new HttpError(404, 'Patient not found');
  const certificate = await Certificate.create({ patient: patientId, doctor: req.user.id, patientName: patient.name,
    doctorName: req.user.name, type, startDate, endDate, notes: notes.trim() });
  res.status(201).json({ certificate: certificateResponse(certificate) });
});

clinicalRouter.get('/messages/contacts', requireRole('patient', 'doctor'), async (req, res) => {
  const visits = await Appointment.find(scope(req.user));
  const isPatient = req.user.role === 'patient';
  const ids = [...new Set(visits.map(v => String(isPatient ? v.doctor : v.patient)))];
  const users = await User.find({ _id: { $in: ids }, isActive: true }).select('name role');
  res.json({ contacts: users.map(u => ({ id: u.id, name: u.name, role: u.role })) });
});
clinicalRouter.get('/messages', requireRole('patient', 'doctor'), async (req, res) => {
  const messages = await Message.find(scope(req.user)).sort({ createdAt: 1 });
  res.json({ messages: messages.map(m => ({ id: m.id, patientId: String(m.patient), doctorId: String(m.doctor),
    senderId: String(m.sender), text: m.text, createdAt: m.createdAt })) });
});
clinicalRouter.post('/messages', requireRole('patient', 'doctor'), async (req, res) => {
  const { recipientId, text } = req.body || {};
  if (!mongoose.isObjectIdOrHexString(recipientId) || typeof text !== 'string' || !text.trim() || text.length > 2000) throw new HttpError(400, 'Choose a contact and enter a message (1–2000 characters)');
  const patient = req.user.role === 'patient' ? req.user.id : recipientId;
  const doctor = req.user.role === 'doctor' ? req.user.id : recipientId;
  if (!await Appointment.exists({ patient, doctor }) || !await User.exists({ _id: recipientId, isActive: true, role: req.user.role === 'patient' ? 'doctor' : 'patient' })) throw new HttpError(403, 'Messages require an existing doctor-patient booking');
  const m = await Message.create({ patient, doctor, sender: req.user.id, text: text.trim() });
  res.status(201).json({ message: { id: m.id, patientId: patient, doctorId: doctor, senderId: req.user.id, text: m.text, createdAt: m.createdAt } });
});

// Build notifications from saved events, avoiding duplicated copies of medical data.
clinicalRouter.get('/notifications', requireRole('patient'), async (req, res) => {
  const [visits, orders, certificates, reads] = await Promise.all([
    Appointment.find({ patient: req.user.id }), ServiceOrder.find({ patient: req.user.id }),
    Certificate.find({ patient: req.user.id }), NotificationRead.find({ user: req.user.id }),
  ]);
  const keys = new Set(reads.map(r => r.key));
  const events = [
    ...visits.map(v => ({ id: 'visit-' + v.id + '-' + v.status, title: 'Appointment ' + v.status,
      message: `${v.doctorName} · ${v.date} · ${v.time}`, type: 'appointment', createdAt: v.updatedAt })),
    ...orders.map(o => ({ id: 'order-' + o.id + '-' + o.status + '-' + o.payment.status,
      title: (o.kind === 'lab' ? 'Lab test ' : 'Medicine order ') + o.status.replaceAll('_', ' '),
      message: `${o.itemName} · Payment ${o.payment.status}`, type: o.kind === 'lab' ? 'lab' : 'billing', createdAt: o.updatedAt })),
    ...certificates.map(c => ({ id: 'certificate-' + c.id, title: 'Certificate issued', message: c.type + ' by ' + c.doctorName, type: 'info', createdAt: c.createdAt })),
  ].sort((a, b) => b.createdAt - a.createdAt);
  res.json({ notifications: events.map(e => ({ ...e, userId: req.user.id, unread: !keys.has(e.id), time: e.createdAt.toISOString() })) });
});
clinicalRouter.post('/notifications/read', requireRole('patient'), async (req, res) => {
  const keys = req.body?.keys;
  if (!Array.isArray(keys) || keys.length > 500 || keys.some(k => typeof k !== 'string' || !/^(visit|order|certificate)-[a-zA-Z0-9_-]{1,85}$/.test(k))) throw new HttpError(400, 'Provide valid notification IDs');
  if (keys.length) await NotificationRead.bulkWrite([...new Set(keys)].map(key => ({ updateOne: {
    filter: { user: req.user.id, key }, update: { $setOnInsert: { user: req.user.id, key } }, upsert: true,
  } })));
  res.json({ success: true });
});

clinicalRouter.get('/reports', requireRole('admin'), async (req, res) => {
  const orders = await ServiceOrder.find();
  const summary = { labOrders: 0, medicineOrders: 0, hospitalReceipts: 0, demoPayments: 0, unpaid: 0 };
  for (const o of orders) {
    summary[o.kind === 'lab' ? 'labOrders' : 'medicineOrders']++;
    const bucket = o.payment.status === 'unpaid' ? 'unpaid' : o.payment.method === 'demo' ? 'demoPayments' : 'hospitalReceipts';
    summary[bucket] += o.amountPaise / 100;
  }
  res.json({ summary });
});
