import { pathToFileURL } from 'node:url';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Hospital, Department } from '../src/models/Hospital.js';
import { CatalogItem } from '../src/models/Services.js';
import { hashPassword } from '../src/utils/password.js';
import { days } from '../src/utils/hospital.js';

export async function seedDemo() {
  if (process.env.NODE_ENV === 'production') throw new Error('Demo seeding is disabled in production');
  const passwordHash = await hashPassword('SchoolDemo123!');
  const department = await Department.findOneAndUpdate({ key: 'general medicine' },
    { $setOnInsert: { name: 'General Medicine', key: 'general medicine' } }, { upsert: true, returnDocument: 'after' });
  await Hospital.updateOne({ key: 'main' }, { $setOnInsert: { key: 'main', name: 'School Demo Hospital', address: 'Demo campus', phone: '', openingHours: '9 AM to 5 PM' } }, { upsert: true });
  const profiles = [
    { role: 'admin', name: 'Demo Admin', email: 'admin@school.test' },
    { role: 'doctor', name: 'Dr Demo', email: 'doctor@school.test', doctorProfile: {
      department: department.id, fee: 300, qualification: 'Demo qualification',
      availability: days.map(day => ({ day, slots: ['09:00 AM', '10:00 AM', '02:00 PM', '04:00 PM'] })),
    } },
    { role: 'patient', name: 'Demo Patient', email: 'patient@school.test' },
    { role: 'lab', name: 'Demo Lab Staff', email: 'lab@school.test' },
    { role: 'pharmacy', name: 'Demo Pharmacy Staff', email: 'pharmacy@school.test' },
  ];
  for (const profile of profiles) await User.updateOne({ email: profile.email }, { $setOnInsert: { ...profile, passwordHash } }, { upsert: true, runValidators: true });
  for (const item of [
    { kind: 'lab', name: 'Complete Blood Count (demo)', pricePaise: 25000, description: 'School project lab test' },
    { kind: 'lab', name: 'Blood Glucose (demo)', pricePaise: 10000, description: 'School project lab test' },
    { kind: 'medicine', name: 'Demo Vitamin Tablets', pricePaise: 5000, description: 'Fictional catalog item for demonstrating stock and payment', stock: 100 },
    { kind: 'medicine', name: 'Demo First Aid Pack', pricePaise: 12000, description: 'Fictional catalog item for the school demo', stock: 50 },
  ]) await CatalogItem.updateOne({ kind: item.kind, name: item.name }, { $setOnInsert: item }, { upsert: true, runValidators: true });
  console.log('Demo accounts: admin / doctor / patient / lab / pharmacy @school.test');
  console.log('Demo password: SchoolDemo123! (existing accounts are never reset)');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await connectDB(); await seedDemo(); }
  catch (e) { console.error(e.message); process.exitCode = 1; }
  finally { await mongoose.disconnect(); }
}
