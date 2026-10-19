import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../src/utils/password.js';

test('password hashes use unique salts and reject wrong passwords', async () => {
  const first = await hashPassword('ExamplePass123!');
  const second = await hashPassword('ExamplePass123!');
  assert.notEqual(first, second);
  assert.equal(await verifyPassword('ExamplePass123!', first), true);
  assert.equal(await verifyPassword('wrong password', first), false);
});
