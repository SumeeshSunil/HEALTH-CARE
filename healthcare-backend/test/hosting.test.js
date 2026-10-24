import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import cors from 'cors';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import { hostingConfig, corsOptions } from '../src/config/hosting.js';

function request(app, method, headers = {}) {
  return new Promise((resolve, reject) => {
    const socket = new Socket();
    Object.defineProperty(socket, 'remoteAddress', { value: '127.0.0.1' });
    const req = new IncomingMessage(socket);
    req.method = method; req.url = '/api/test'; req.headers = headers;
    const res = new ServerResponse(req);
    res.end = chunk => { socket.destroy(); resolve({ status: res.statusCode, headers: res.getHeaders(), body: chunk ? JSON.parse(chunk.toString()) : null }); return res; };
    app.handle(req, res, reject);
  });
}

test('hosting uses a public listener and explicit HTTPS origins in production', () => {
  const config = hostingConfig({ NODE_ENV: 'production', RENDER: 'true', FRONTEND_URL: 'https://school.vercel.app/' });
  assert.equal(config.host, '0.0.0.0');
  assert.equal(config.trustProxy, 1);
  assert.deepEqual(config.origins, ['https://school.vercel.app']);
  assert.throws(() => hostingConfig({ NODE_ENV: 'production' }), /FRONTEND_URL/);
  for (const origin of ['*', 'http://school.vercel.app', 'https://school.vercel.app/path', 'https://user:pass@school.vercel.app']) {
    assert.throws(() => hostingConfig({ NODE_ENV: 'production', FRONTEND_URL: origin }), /FRONTEND_URL/);
  }
});

test('local hosting keeps the Vite proxy working and validates proxy settings', () => {
  const config = hostingConfig({});
  assert.equal(config.host, '127.0.0.1'); assert.equal(config.trustProxy, 0);
  assert.ok(config.origins.includes('http://localhost:5173'));
  assert.equal(hostingConfig({ TRUST_PROXY_HOPS: '2' }).trustProxy, 2);
  for (const value of ['true', '-1', '10', '1.5']) assert.throws(() => hostingConfig({ TRUST_PROXY_HOPS: value }), /TRUST_PROXY_HOPS/);
});

test('Vercel preflight permits JWT and profile updates, and rejects other websites', async () => {
  const config = hostingConfig({ NODE_ENV: 'production', FRONTEND_URL: 'https://school.vercel.app', TRUST_PROXY_HOPS: '1' });
  const app = express();
  app.set('trust proxy', config.trustProxy);
  app.use(cors(corsOptions(config)));
  app.all('/api/test', (req, res) => res.json({ ip: req.ip, protectedRouteReached: true }));
  app.use((err, req, res, next) => res.status(err.status || 500).json({ message: err.message }));
  const preflight = await request(app, 'OPTIONS', {
    origin: 'https://school.vercel.app', 'access-control-request-method': 'PATCH',
    'access-control-request-headers': 'authorization,content-type',
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers['access-control-allow-origin'], 'https://school.vercel.app');
  assert.match(preflight.headers['access-control-allow-headers'], /Authorization/);
  assert.match(preflight.headers['access-control-allow-methods'], /PATCH/);
  assert.equal((await request(app, 'POST', { origin: 'https://unrelated.vercel.app' })).status, 403);
  const normal = await request(app, 'GET', { origin: 'https://school.vercel.app', 'x-forwarded-for': '198.51.100.20' });
  assert.equal(normal.body.ip, '198.51.100.20');
  assert.equal((await request(app, 'GET')).status, 200, 'Render health checks have no Origin header');
});
