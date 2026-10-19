import test from 'node:test';
import assert from 'node:assert/strict';
import reducer, { fetchHospitalData } from '../src/redux/slices/doctorSlice.js';
import { slotsToForm, formToSlots } from '../src/utils/weeklySlots.js';

test('a late hospital response cannot restore another session after logout', () => {
  let state = reducer(undefined, fetchHospitalData.pending('old-request'));
  state = reducer(state, { type: 'auth/logout' });
  state = reducer(state, fetchHospitalData.fulfilled({ doctors: [{ id: 'old-doctor' }], departments: [], hospital: { name: 'Old' } }, 'old-request'));
  assert.deepEqual(state.doctors, []);
  assert.equal(state.hospital, null);
});
test('weekly slots normalize comma-separated input and preserve off-duty days', () => {
  const form = slotsToForm([{ day: 'Monday', slots: ['09:00 AM'] }]);
  assert.equal(form.Sunday, '');
  form.Monday = '09:00 am, 02:00 pm, ';
  assert.deepEqual(formToSlots(form), [{ day: 'Monday', slots: ['09:00 AM', '02:00 PM'] }]);
});
