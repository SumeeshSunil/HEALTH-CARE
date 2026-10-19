import test from 'node:test';
import assert from 'node:assert/strict';
import reducer, { loginUser, restoreSession, logout } from '../src/redux/slices/authSlice.js';

const user = { id: 'mongo-user-id', name: 'Test Patient', role: 'patient' };
test('logout rejects a late login response instead of signing back in', () => {
  let state = reducer(undefined, loginUser.pending('request-1', {}));
  state = reducer(state, logout());
  state = reducer(state, loginUser.fulfilled({ user, token: 'token' }, 'request-1', {}));
  assert.equal(state.isAuthenticated, false);
  assert.equal(state.token, null);
});
test('refresh trusts only the server response; outages preserve the token for retry', () => {
  let state = { ...reducer(undefined, { type: 'init' }), token: 'saved-token' };
  assert.equal(state.user, null);
  state = reducer(state, restoreSession.pending('restore-1'));
  state = reducer(state, restoreSession.rejected(null, 'restore-1', undefined, { status: 0, message: 'Offline' }));
  assert.equal(state.token, 'saved-token');
  assert.equal(state.isAuthenticated, false);
  state = reducer(state, restoreSession.pending('restore-2'));
  state = reducer(state, restoreSession.fulfilled({ user, token: 'saved-token' }, 'restore-2'));
  assert.equal(state.isAuthenticated, true);
  assert.equal(state.user.id, user.id);
});
test('a rejected expired token is removed', () => {
  let state = { ...reducer(undefined, { type: 'init' }), token: 'expired-token' };
  state = reducer(state, restoreSession.pending('restore-1'));
  state = reducer(state, restoreSession.rejected(null, 'restore-1', undefined, { status: 401, message: 'Expired' }));
  assert.equal(state.token, null);
  assert.equal(state.isAuthenticated, false);
});
