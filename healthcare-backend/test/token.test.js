import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { createToken, readToken, validateJwtSecret } from '../src/utils/token.js';

test('JWT validates signatures and rejects expired or tampered tokens', () => {
  process.env.JWT_SECRET = 'test-only-secret-that-is-at-least-32-characters';
  const token = createToken('507f1f77bcf86cd799439011');
  assert.equal(readToken(token).sub, '507f1f77bcf86cd799439011');
  const [header, payload] = token.split('.');
  assert.throws(() => readToken(`${header}.${payload}.invalid`));
  const expired = jwt.sign({}, process.env.JWT_SECRET, {
    expiresIn: -1, issuer: 'healthcare-api', audience: 'healthcare-frontend',
  });
  assert.throws(() => readToken(expired));
  process.env.JWT_SECRET = 'short';
  assert.throws(validateJwtSecret);
});
