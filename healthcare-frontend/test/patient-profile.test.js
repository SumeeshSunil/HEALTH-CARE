import test from 'node:test';
import assert from 'node:assert/strict';
import { ageFromDob, bookedPatientProfiles } from '../src/utils/patientProfile.js';
test('DOB computes age on birthday and keeps invalid and missing values empty', () => {
 assert.equal(ageFromDob('2000-10-19', '2030-10-18'), 29);
 assert.equal(ageFromDob('2000-10-19', '2030-10-19'), 30);
 assert.equal(ageFromDob('2030-10-19', '2030-10-19'), 0);
 for (const dob of ['', '2030-02-31', '2031-01-01']) assert.equal(ageFromDob(dob, '2030-10-19'), null);
});
test('records use booked patient MongoDB IDs and saved profile fields without demo fallbacks', () => {
 const appointments = [{ patientId: 'abc123', doctorId: 'doctor1', patientName: 'Booking Name', patientEmail: 'old@example.com', patientDetails: { name: 'Saved Name', email: 'saved@example.com', bloodGroup: 'AB+', gender: 'Female', dob: '2000-01-01' } },
 { patientId: 'abc123', doctorId: 'doctor1' }, { patientId: 'private-patient', doctorId: 'doctor2' }];
 const profiles = bookedPatientProfiles(appointments, 'doctor1');
 assert.equal(profiles.length, 1); assert.equal(profiles[0].id, 'abc123'); assert.equal(profiles[0].name, 'Saved Name');
 assert.equal(profiles[0].bloodGroup, 'AB+'); assert.equal(profiles[0].email, 'saved@example.com');
 assert.deepEqual(bookedPatientProfiles(appointments, null), []);
 assert.deepEqual(bookedPatientProfiles([], 'doctor1'), []);
});
