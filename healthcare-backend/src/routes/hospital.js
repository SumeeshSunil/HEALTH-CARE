import { Router } from 'express';
import mongoose from 'mongoose';
import { Hospital, Department } from '../models/Hospital.js';
import { User } from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { hashPassword, validPassword } from '../utils/password.js';
import { validAvailability, doctorResponse, doctorDetailsUpdate } from '../utils/hospital.js';

export const hospitalRouter = Router();
hospitalRouter.use(requireAuth);
const admin = requireRole('admin');
const text = (value, max, required = false) => typeof value === 'string' && value.trim().length <= max && (!required || !!value.trim());

hospitalRouter.get('/', async (req, res) => {
  const hospital = await Hospital.findOne({ key: 'main' }).select('name address phone openingHours -_id');
  res.json({ hospital: hospital || { name: 'Our Hospital', address: '', phone: '', openingHours: '' } });
});

hospitalRouter.put('/', admin, async (req, res) => {
  const { name, address = '', phone = '', openingHours = '' } = req.body || {};
  if (!text(name, 100, true) || !text(address, 500) || !text(phone, 30) || !text(openingHours, 200)) {
    return res.status(400).json({ message: 'Provide a hospital name and valid contact details' });
  }
  const hospital = await Hospital.findOneAndUpdate({ key: 'main' },
    { $set: { name: name.trim(), address: address.trim(), phone: phone.trim(), openingHours: openingHours.trim() } },
    { upsert: true, new: true, runValidators: true });
  res.json({ hospital });
});

hospitalRouter.get('/departments', async (req, res) => {
  const departments = await Department.find().sort({ name: 1 });
  res.json({ departments: departments.map(d => ({ id: d.id, name: d.name })) });
});

hospitalRouter.post('/departments', admin, async (req, res) => {
  const name = req.body?.name;
  if (!text(name, 100, true)) return res.status(400).json({ message: 'Enter a department name (1–100 characters)' });
  try {
    const department = await Department.create({ name: name.trim(), key: name.trim().toLowerCase() });
    res.status(201).json({ department: { id: department.id, name: department.name } });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Department already exists' });
    throw err;
  }
});

hospitalRouter.get('/doctors', async (req, res) => {
  const filter = { role: 'doctor', doctorProfile: { $exists: true } };
  if (!(req.user.role === 'admin' && req.query.includeInactive === 'true')) filter.isActive = true;
  const users = await User.find(filter).populate('doctorProfile.department').sort({ name: 1 });
  res.json({ doctors: users.map(user => ({ ...doctorResponse(user), ...(req.user.role === 'admin' ? { email: user.email } : {}) })) });
});

async function doctorFields(body, creating) {
  const { name, email, departmentId, fee, qualification = '', experience = '', availability = [], password, isActive = true } = body || {};
  if (!text(name, 100, true) || !text(email, 254, true) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      || !mongoose.isObjectIdOrHexString(departmentId) || typeof fee !== 'number' || !Number.isFinite(fee) || fee < 0 || fee > 100000
      || !text(qualification, 150) || !text(experience, 100) || !validAvailability(availability)
      || typeof isActive !== 'boolean' || (creating && !validPassword(password))) {
    return { error: 'Check name, email, department, fee, password (8–128 characters), and weekly slots (e.g. 09:00 AM)' };
  }
  if (!await Department.exists({ _id: departmentId })) return { error: 'Choose an existing hospital department' };
  return { data: {
    name: name.trim(), email: email.trim().toLowerCase(), isActive,
    doctorProfile: { department: departmentId, fee, qualification: qualification.trim(), experience: experience.trim(), availability },
  } };
}

hospitalRouter.post('/doctors', admin, async (req, res) => {
  const result = await doctorFields(req.body, true);
  if (result.error) return res.status(400).json({ message: result.error });
  try {
    // One document stores both the account and doctor details; no multi-document transaction needed.
    const user = await User.create({ ...result.data, role: 'doctor', passwordHash: await hashPassword(req.body.password) });
    await user.populate('doctorProfile.department');
    res.status(201).json({ doctor: { ...doctorResponse(user), email: user.email } });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Email is already registered' });
    throw err;
  }
});

hospitalRouter.patch('/doctors/:id', admin, async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ message: 'Invalid doctor ID' });
  const result = await doctorFields(req.body, false);
  if (result.error) return res.status(400).json({ message: result.error });
  try {
    const user = await User.findOneAndUpdate({ _id: req.params.id, role: 'doctor' }, { $set: doctorDetailsUpdate(result.data) },
      { new: true, runValidators: true }).populate('doctorProfile.department');
    if (!user) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ doctor: { ...doctorResponse(user), email: user.email } });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Email is already registered' });
    throw err;
  }
});

hospitalRouter.put('/doctors/:id/availability', requireRole('admin', 'doctor'), async (req, res) => {
  if (req.user.role === 'doctor' && req.user.id !== req.params.id) return res.status(403).json({ message: 'You can change only your own schedule' });
  if (!mongoose.isObjectIdOrHexString(req.params.id) || !validAvailability(req.body?.availability)) {
    return res.status(400).json({ message: 'Provide a valid doctor ID and weekly slots' });
  }
  const user = await User.findOneAndUpdate({ _id: req.params.id, role: 'doctor', doctorProfile: { $exists: true } },
    { $set: { 'doctorProfile.availability': req.body.availability } }, { new: true, runValidators: true }).populate('doctorProfile.department');
  if (!user) return res.status(404).json({ message: 'Doctor not found' });
  res.json({ doctor: doctorResponse(user) });
});
