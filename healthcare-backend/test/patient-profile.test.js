import test from 'node:test';
import assert from 'node:assert/strict';
import { patientProfileUpdate } from '../src/utils/patientProfile.js';
import { User, publicUser } from '../src/models/User.js';
const now = new Date('2030-01-06T20:00:00Z');
test('profile validates demographic fields without adding defaults', () => {
 assert.deepEqual(patientProfileUpdate({ name: ' Patient ', dob: '2000-02-29', gender: 'Female', bloodGroup: 'AB-', emergencyContact: ' 12345 ' }, now),
 { name: 'Patient', dob: '2000-02-29', gender: 'Female', bloodGroup: 'AB-', emergencyContact: '12345' });
 assert.deepEqual(patientProfileUpdate({ bloodGroup: '' }, now), { bloodGroup: '' });
});
test('profile rejects permission changes, invalid dates and invalid blood groups', () => {
 for (const body of [{ role: 'admin' }, { id: 'another-user' }, { passwordHash: 'x' }, { email: 'other@example.com' }, { name: '' }, { dob: '2029-02-29' }, { dob: '2030-01-08' }, { bloodGroup: 'X+' }, { gender: 'Patient' }, { mobile: {} }, {}]) {
  assert.throws(() => patientProfileUpdate(body, now), error => error.status === 400);
 }
 assert.equal(patientProfileUpdate({ dob: '2030-01-07' }, now).dob, '2030-01-07');
});
test('saved profile schema and public response retain demographics without exposing credentials', async () => {
 const user = new User({ name: 'Patient', email: 'patient@example.com', passwordHash: 'secret', dob: '2000-01-01', gender: 'Other', bloodGroup: 'O-', emergencyContact: '12345' });
 await user.validate();
 const result = publicUser(user);
 assert.equal(result.gender, 'Other'); assert.equal(result.bloodGroup, 'O-'); assert.equal(result.emergencyContact, '12345');
 assert.equal(Object.hasOwn(result, 'passwordHash'), false);
 user.bloodGroup = 'X+'; await assert.rejects(user.validate());
});
