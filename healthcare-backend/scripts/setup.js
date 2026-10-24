import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

if (existsSync('.env')) {
  console.log('.env already exists; it was left unchanged.');
} else {
  const template = readFileSync('.env.example', 'utf8');
  writeFileSync('.env', template.replace(/^JWT_SECRET=.*$/m, 'JWT_SECRET=' + randomBytes(48).toString('hex')), { flag: 'wx' });
  console.log('Created .env with a random JWT secret. Set MONGODB_URI if needed.');
}
