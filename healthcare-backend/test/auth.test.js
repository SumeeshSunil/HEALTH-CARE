import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import { authRouter } from '../src/routes/auth.js';

// Exercise Express routing without opening a listening port or needing MongoDB.
function request(app, method, url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const socket = new Socket();
    Object.defineProperty(socket, 'remoteAddress', { value: '127.0.0.1' });
    const req = new IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.headers = headers;
    req.body = body;
    const res = new ServerResponse(req);
    res.end = (chunk) => {
      socket.destroy();
      resolve({ status: res.statusCode, body: chunk ? JSON.parse(chunk.toString()) : null });
      return res;
    };
    app.handle(req, res, reject);
  });
}

test('auth rejects role escalation, invalid details and missing/invalid tokens', async () => {
  process.env.JWT_SECRET = 'test-only-secret-that-is-at-least-32-characters';
  const app = express();
  app.use('/api/auth', authRouter);
  const elevated = await request(app, 'POST', '/api/auth/register', {
    name: 'Test', email: 'test@example.com', password: 'ExamplePass123!', role: 'admin',
  });
  assert.equal(elevated.status, 400);
  assert.equal(elevated.body.message, 'Public registration is for patients only');
  assert.equal((await request(app, 'GET', '/api/auth/me')).status, 401);
  assert.equal((await request(app, 'GET', '/api/auth/me', null, { authorization: 'Bearer invalid' })).status, 401);
  assert.equal((await request(app, 'GET', '/api/auth/users')).status, 401);
  assert.equal((await request(app, 'POST', '/api/auth/register', {
    name: '', email: 'bad', password: 'short',
  })).status, 400);
  assert.equal((await request(app, 'POST', '/api/auth/register', {
    name: 'Test', email: 'test@example.com', password: 'ExamplePass123!', dob: '2020-02-31',
  })).status, 400);
});
