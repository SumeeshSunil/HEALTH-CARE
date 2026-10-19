import test from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest } from '../src/services/api.js';

test('API sends JSON credentials and reports server errors', async () => {
  const original = globalThis.fetch;
  let captured;
  globalThis.fetch = async (url, options) => {
    captured = { url, options };
    return new Response(JSON.stringify({ message: 'Invalid email or password' }), { status: 401 });
  };
  try {
    await assert.rejects(apiRequest('/auth/login', { method: 'POST', body: { email: 'a@example.com', password: 'bad' } }),
      (err) => err.status === 401 && err.message === 'Invalid email or password');
    assert.equal(captured.url, '/api/auth/login');
    assert.equal(captured.options.headers['Content-Type'], 'application/json');
    assert.equal(JSON.parse(captured.options.body).email, 'a@example.com');
  } finally { globalThis.fetch = original; }
});
test('protected requests attach Bearer tokens and network failures show guidance', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (_, options) => {
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    return new Response(JSON.stringify({ user: { id: '1' } }));
  };
  try {
    assert.equal((await apiRequest('/auth/me', { token: 'test-token' })).user.id, '1');
    globalThis.fetch = async () => { throw new Error('network down'); };
    await assert.rejects(apiRequest('/auth/me'), (err) => err.status === 0 && err.message.includes('backend'));
  } finally { globalThis.fetch = original; }
});
