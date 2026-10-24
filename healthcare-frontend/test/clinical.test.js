import test from 'node:test';
import assert from 'node:assert/strict';
import records, { fetchRecords } from '../src/redux/slices/recordsSlice.js';
import notifications, { fetchNotifications, markRead } from '../src/redux/slices/notificationSlice.js';
import appointments, { saveConsultation } from '../src/redux/slices/appointmentSlice.js';
import { dashboardFor } from '../src/services/session.js';

test('clinical and notification responses cannot restore a logged-out patient session', () => {
    let state = records(undefined, fetchRecords.pending('old'));
    state = records(state, { type: 'auth/logout' });
    state = records(state, fetchRecords.fulfilled({ records: [{ id: 'private' }] }, 'old'));
    assert.deepEqual(state.records, []);
    let feed = notifications(undefined, fetchNotifications.pending('old'));
    feed = notifications(feed, { type: 'auth/logout' });
    feed = notifications(feed, fetchNotifications.fulfilled({ notifications: [{ id: 'private' }] }, 'old'));
    assert.deepEqual(feed.notifications, []);
});
test('a stale notification refresh cannot undo a saved read action', () => {
    let state = notifications(undefined, fetchNotifications.pending('first'));
    state = notifications(state, fetchNotifications.fulfilled({ notifications: [{ id: 'event', unread: true }] }, 'first'));
    state = notifications(state, fetchNotifications.pending('stale'));
    state = notifications(state, markRead.fulfilled(['event'], 'read', 'event'));
    state = notifications(state, fetchNotifications.fulfilled({ notifications: [{ id: 'event', unread: true }] }, 'stale'));
    assert.equal(state.notifications[0].unread, false);
});
test('consultation completion updates the saved appointment and is ignored after logout', () => {
    let state = appointments(undefined, saveConsultation.pending('consult', { id: 'visit' }));
    state = appointments(state, saveConsultation.fulfilled({ appointment: { id: 'visit', status: 'completed', version: 1 } }, 'consult'));
    assert.equal(state.appointments[0].status, 'completed');
    state = appointments(state, { type: 'auth/logout' });
    state = appointments(state, saveConsultation.fulfilled({ appointment: { id: 'visit', status: 'completed' } }, 'consult'));
    assert.deepEqual(state.appointments, []);
});
test('department staff have working dashboard routes', () => {
    assert.equal(dashboardFor('lab'), '/lab/dashboard');
    assert.equal(dashboardFor('pharmacy'), '/pharmacy/dashboard');
    assert.equal(dashboardFor('unknown'), '/unauthorized');
});
