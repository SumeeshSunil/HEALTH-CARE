import express from 'express';
import cors from 'cors';
import { hosting, corsOptions } from './config/hosting.js';
import { isDatabaseConnected } from './config/db.js';
import { authRouter } from './routes/auth.js';
import { hospitalRouter } from './routes/hospital.js';
import { appointmentRouter } from './routes/appointments.js';
import { serviceRouter } from './routes/services.js';
import { clinicalRouter } from './routes/clinical.js';
import { HttpError } from './utils/HttpError.js';

// Express receives HTTP requests and sends responses to the frontend.
export const app = express();
// Render forwards the visitor's IP through its reverse proxy.
app.set('trust proxy', hosting.trustProxy);
// This also answers preflight requests before the JWT middleware runs.
app.use(cors(corsOptions(hosting)));
// Read the JSON sent by frontend forms.
app.use(express.json({ limit: '100kb' }));
app.disable('x-powered-by');
app.use('/api/auth', authRouter);
app.use('/api/hospital', hospitalRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/services', serviceRouter);

// A health check confirms the API server is running.
app.get('/api/health', (req, res) => {
  const connected = isDatabaseConnected();
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'error',
    message: 'Healthcare backend is running',
    database: connected ? 'connected' : 'disconnected',
  });
});

app.use('/api', clinicalRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.use((err, req, res, next) => {
  if (err instanceof HttpError) return res.status(err.status).json({ message: err.message });
  if (err.code === 11000) return res.status(409).json({ message: 'This entry already exists' });
  if (err.name === 'VersionError') return res.status(409).json({ message: 'This entry changed. Refresh and try again' });
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

