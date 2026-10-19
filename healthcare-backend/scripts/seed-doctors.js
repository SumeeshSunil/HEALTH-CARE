import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { Department } from '../src/models/Hospital.js';
import { hashPassword } from '../src/utils/password.js';
import { validAvailability } from '../src/utils/hospital.js';

// Edit the JSON file, then run npm run seed:doctors. Email identifies each account.
const validateOnly = process.argv.includes('--validate');
function doctorFields(row, departmentId) {
  if (!row || typeof row.name !== 'string' || typeof row.email !== 'string'
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())
      || typeof row.department !== 'string' || !row.department.trim()
      || !Array.isArray(row.days) || !Array.isArray(row.slots)
      || typeof row.fee !== 'number' || !Number.isFinite(row.fee)
      || typeof row.isActive !== 'boolean') throw new Error('Check the doctor fields in data/demo-doctors.json');
  const availability = row.days.map(day => ({ day, slots: row.slots }));
  if (!validAvailability(availability)) throw new Error('Check weekly days and times in data/demo-doctors.json');
  return {
    name: row.name.trim(), email: row.email.trim().toLowerCase(), role: 'doctor', isActive: row.isActive,
    doctorProfile: { department: departmentId, fee: row.fee, qualification: row.qualification || '', experience: row.experience || '', availability },
  };
}

try {
  const rows = JSON.parse(readFileSync(new URL('../data/demo-doctors.json', import.meta.url), 'utf8'));
  if (!Array.isArray(rows) || !rows.length) throw new Error('Add at least one doctor to data/demo-doctors.json');
  const emails = new Set();
  // Validate all rows before making any database changes.
  for (const row of rows) {
    const fields = doctorFields(row, '507f1f77bcf86cd799439011');
    if (emails.has(fields.email)) throw new Error('Duplicate email in the seed file: ' + fields.email);
    emails.add(fields.email);
    await new User({ ...fields, passwordHash: 'validation-only' }).validate();
  }
  if (validateOnly) {
    console.log('Validated ' + rows.length + ' doctor entries. No database changes made.');
  } else {
    if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI in healthcare-backend/.env');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    await User.init();
    const departments = await Department.find();
    const plan = [];
    for (const row of rows) {
      const department = departments.find(item => item.name.trim().toLowerCase() === row.department.trim().toLowerCase());
      if (!department) throw new Error('Department not found: ' + row.department + '. Use an existing department name.');
      const fields = doctorFields(row, department.id);
      const existing = await User.findOne({ email: fields.email });
      if (existing && existing.role !== 'doctor') throw new Error('Email belongs to a different account role: ' + fields.email);
      plan.push({ fields, existing });
    }
    for (const { fields, existing } of plan) {
      // setOnInsert supplies a password only for new accounts. Existing passwords and IDs stay intact.
      const password = randomBytes(12).toString('base64url');
      const passwordHash = await hashPassword(password);
      await User.findOneAndUpdate({ email: fields.email, role: 'doctor' },
        { $set: fields, $setOnInsert: { passwordHash } }, { upsert: true, new: true, runValidators: true });
      console.log((existing ? 'Updated: ' : 'Created: ') + fields.email);
      if (!existing) console.log('Initial password: ' + password);
    }
    console.log('Finished. Refresh the app to see the saved doctors.');
  }
} catch (err) {
  // Connection errors may contain credentials, so only print safe guidance.
  if (err.name === 'MongooseServerSelectionError' || err.name === 'MongoParseError') {
    console.error('Could not connect to MongoDB. Check MONGODB_URI and run this command in your own backend terminal.');
  } else if (err.code === 11000) {
    console.error('An email conflicts with an existing account. Existing passwords were not reset.');
  } else if (err.name === 'ValidationError') {
    console.error('Invalid doctor data. Check names, fees, qualifications, and weekly slots in the JSON file.');
  } else {
    console.error(err instanceof SyntaxError ? 'Invalid JSON in data/demo-doctors.json' : err.message);
  }
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
