import test from 'node:test';
import assert from 'node:assert/strict';
import { validAvailability, doctorResponse } from '../src/utils/hospital.js';
import { User } from '../src/models/User.js';
import { Hospital } from '../src/models/Hospital.js';
import { requireRole } from '../src/middleware/auth.js';

test('weekly schedules reject duplicate days, duplicate times and malformed slots', () => {
  assert.equal(validAvailability([]), true);
  const monday = { day: 'Monday', slots: ['09:00 AM', '02:00 PM'] };
  assert.equal(validAvailability([monday]), true);
  assert.equal(validAvailability([monday, monday]), false);
  assert.equal(validAvailability([{ day: 'Monday', slots: ['09:00 AM', '09:00 AM'] }]), false);
  assert.equal(validAvailability([{ day: 'Monday', slots: ['25:00 PM'] }]), false);
  assert.equal(validAvailability([{ day: 'Holiday', slots: [] }]), false);
  assert.equal(validAvailability(null), false);
});

test('doctor profile rejects invalid fee and schedule without writing to MongoDB', async () => {
  const user = new User({ name: 'Doctor', email: 'doctor@example.com', passwordHash: 'test-hash', role: 'doctor',
    doctorProfile: { department: '507f1f77bcf86cd799439011', fee: -1, availability: [{ day: 'Monday', slots: ['bad'] }] },
  });
  await assert.rejects(user.validate());
  user.doctorProfile.fee = 0;
  user.doctorProfile.availability = [{ day: 'Monday', slots: ['09:00 AM'] }];
  await user.validate();
  assert.equal(user.doctorProfile.fee, 0);
  const hospital = new Hospital({ key: 'another-hospital', name: 'Second Hospital' });
  await assert.rejects(hospital.validate());
});

test('doctor directory does not expose credentials and keeps a zero fee', () => {
  const result = doctorResponse({ id: 'doctor-1', name: 'Doctor', isActive: true, passwordHash: 'private',
    doctorProfile: { department: { id: 'dept-1', name: 'General Medicine' }, fee: 0, qualification: '', experience: '', availability: [] },
  });
  assert.equal(result.departmentId, 'dept-1');
  assert.equal(result.fee, 0);
  assert.equal(result.passwordHash, undefined);
  assert.equal(result.email, undefined);
});

test('only the admin role passes the admin guard', () => {
  let passed = false;
  let status;
  const res = { status(code) { status = code; return this; }, json() {} };
  requireRole('admin')({ user: { role: 'patient' } }, res, () => { passed = true; });
  assert.equal(status, 403); assert.equal(passed, false);
  requireRole('admin')({ user: { role: 'admin' } }, res, () => { passed = true; });
  assert.equal(passed, true);
});

test('editing doctor details preserves separately saved consultation slots', async () => {
  const { doctorDetailsUpdate } = await import('../src/utils/hospital.js');
  const user = new User({ name: 'Doctor', email: 'doctor@example.com', passwordHash: 'test-hash', role: 'doctor',
    doctorProfile: { department: '507f1f77bcf86cd799439011', fee: 300,
      availability: [{ day: 'Monday', slots: ['09:00 AM', '10:00 AM'] }] },
  });
  // A details form submits no slots, while another screen owns the saved schedule.
  user.set(doctorDetailsUpdate({ name: 'Updated Doctor', email: user.email, isActive: true,
    doctorProfile: { department: '507f1f77bcf86cd799439011', fee: 500, qualification: 'MBBS', experience: '8 years', availability: [] },
  }));
  await user.validate();
  assert.equal(user.name, 'Updated Doctor');
  assert.equal(user.doctorProfile.fee, 500);
  assert.deepEqual([...user.doctorProfile.availability[0].slots], ['09:00 AM', '10:00 AM']);
});
