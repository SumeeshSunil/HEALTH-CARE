import test from 'node:test';
import assert from 'node:assert/strict';
import reducer, { fetchAppointments, bookAppointment, demoPayment, cancelAppointment } from '../src/redux/slices/appointmentSlice.js';
import { billingTotals } from '../src/utils/appointmentView.js';

test('logout ignores a delayed booking response', () => {
  let state = reducer(undefined, bookAppointment.pending('old', {}));
  state = reducer(state, { type: 'auth/logout' });
  state = reducer(state, bookAppointment.fulfilled({ appointment: { id: 'old-booking' } }, 'old', {}));
  assert.deepEqual(state.appointments, []);
});
test('a delayed payment response cannot overwrite a newer cancellation and refund state', () => {
  let state = reducer(undefined, demoPayment.pending('pay', {}));
  state = reducer(state, cancelAppointment.pending('cancel', '1'));
  state = reducer(state, cancelAppointment.fulfilled({ appointment: { id: '1', version: 2, status: 'cancelled', bill: { status: 'refund_pending' } } }, 'cancel', '1'));
  state = reducer(state, demoPayment.fulfilled({ appointment: { id: '1', version: 1, status: 'pending', bill: { status: 'paid' } } }, 'pay', {}));
  assert.equal(state.appointments[0].status, 'cancelled');
  assert.equal(state.appointments[0].bill.status, 'refund_pending');
});
test('an older list cannot erase a just-created booking', () => {
  let state = reducer(undefined, fetchAppointments.pending('list'));
  state = reducer(state, bookAppointment.pending('book', {}));
  state = reducer(state, bookAppointment.fulfilled({ appointment: { id: 'new', version: 0 } }, 'book', {}));
  state = reducer(state, fetchAppointments.fulfilled({ appointments: [], demoPaymentsEnabled: true }, 'list'));
  assert.equal(state.appointments[0].id, 'new');
});
test('financial summaries keep demo payments separate and omit void debts', () => {
  const items = [
    { bill: { status: 'paid', amount: 300, isDemo: false } },
    { bill: { status: 'paid', amount: 500, isDemo: true } },
    { bill: { status: 'unpaid', amount: 200 } },
    { bill: { status: 'void', amount: 600 } },
    { bill: { status: 'refund_pending', amount: 400 } },
  ];
  assert.deepEqual(billingTotals(items), { received: 300, demo: 500, unpaid: 200, refundPending: 400 });
});

test('booking dates follow the hospital timezone across UTC midnight boundaries', async () => {
  const { hospitalToday } = await import('../src/utils/appointmentView.js');
  assert.equal(hospitalToday(new Date('2030-01-06T23:30:00Z')), '2030-01-07');
});
