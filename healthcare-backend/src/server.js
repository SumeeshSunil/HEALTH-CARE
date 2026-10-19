import express from 'express';
import mongoose from 'mongoose';
import { connectDB, isDatabaseConnected } from './config/db.js';
import { authRouter } from './routes/auth.js';
import { validateJwtSecret } from './utils/token.js';
import { User } from './models/User.js';
import { Hospital, Department } from './models/Hospital.js';
import { hospitalRouter } from './routes/hospital.js';

// Express receives HTTP requests and sends responses to the frontend.
const app = express();
const port = Number(process.env.PORT || 5000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a whole number between 1 and 65535.');
}

// Read JSON request bodies. Later, login and appointment forms will send JSON.
app.use(express.json({ limit: '100kb' }));
app.disable('x-powered-by');
app.use('/api/auth', authRouter);
app.use('/api/hospital', hospitalRouter);

// A health check confirms the API server is running.
app.get('/api/health', (req, res) => {
  const connected = isDatabaseConnected();
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'error',
    message: 'Healthcare backend is running',
    database: connected ? 'connected' : 'disconnected',
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must contain valid JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large' });
  }
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: 'Check the submitted field values' });
  }
  console.error('Request failed:', err.name);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

try {
  validateJwtSecret();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

try {
  await connectDB();
  await Promise.all([User.init(), Hospital.init(), Department.init()]);
  const server = app.listen(port, '127.0.0.1', () => {
    console.log(`Healthcare API: http://localhost:${port}/api/health`);
  });
  server.on('error', async (err) => {
    console.error(`Could not start the API: ${err.code || 'unknown error'}`);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
} catch {
  console.error(process.env.MONGODB_URI
    ? 'Could not connect to MongoDB. Check MONGODB_URI, database availability, and network access.'
    : 'MONGODB_URI is missing. Add it to healthcare-backend/.env.');
  await mongoose.disconnect();
  process.exitCode = 1;
}
