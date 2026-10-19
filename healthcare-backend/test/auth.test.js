import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { authRouter } from '../src/routes/auth.js';

// These rejection paths must work without querying a database.
test('auth endpoints reject role escalation and missing/invalid tokens', async () => {
  process.env.JWT_SECRET = 'test-only-secret-that-is-at-least-32-characters';
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/auth`;
  try {
    const elevated = await fetch(`${base}/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'test@example.com', password: 'ExamplePass123!', role: 'admin' }),
    });
    assert.equal(elevated.status, 400);
    assert.equal((await elevated.json()).message, 'Public registration is for patients only');
    assert.equal((await fetch(`${base}/me`)).status, 401);
    assert.equal((await fetch(`${base}/me`, { headers: { Authorization: 'Bearer invalid' } })).status, 401);
    assert.equal((await fetch(`${base}/users`)).status, 401);
    const invalid = await fetch(`${base}/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', email: 'bad', password: 'short' }),
    });
    assert.equal(invalid.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
