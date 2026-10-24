// Optional disposable demo: the regular server still uses your MongoDB URI.
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app.js';
import { seedDemo } from './seed-demo.js';

if (process.env.NODE_ENV === 'production') throw new Error('Temporary demo mode is disabled in production');
process.env.JWT_SECRET = randomBytes(48).toString('hex');
process.env.ENABLE_DEMO_PAYMENTS = 'true';
const cached = resolve('node_modules/.cache/mongodb-memory-server/mongod.exe');
const database = await MongoMemoryServer.create(existsSync(cached) ? { binary: { systemBinary: cached } } : {});
await mongoose.connect(database.getUri(), { dbName: 'school_demo' });
await Promise.all(Object.values(mongoose.models).map(m => m.init()));
await seedDemo();
const server = app.listen(Number(process.env.PORT || 5000), '127.0.0.1', () => {
  console.log('Demo API: http://localhost:' + (process.env.PORT || 5000));
  console.log('Temporary demo: all data is deleted when this process stops.');
});
async function stop() {
  await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect(); await database.stop();
}
process.once('SIGINT', () => { stop().finally(() => process.exit()); });
process.once('SIGTERM', () => { stop().finally(() => process.exit()); });
server.once('error', async e => { console.error(e.message); await mongoose.disconnect(); await database.stop(); process.exitCode = 1; });
