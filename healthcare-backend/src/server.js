import mongoose from 'mongoose';
import { app } from './app.js';
import { connectDB } from './config/db.js';
import { validateJwtSecret } from './utils/token.js';
import { User } from './models/User.js';
import { Hospital, Department } from './models/Hospital.js';
import { Appointment } from './models/Appointment.js';
import { CatalogItem, ServiceOrder, Message, Certificate, NotificationRead } from './models/Services.js';

const port = Number(process.env.PORT || 5000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');


try {
  validateJwtSecret();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

try {
  await connectDB();
  await Promise.all([User, Hospital, Department, Appointment, CatalogItem, ServiceOrder, Message, Certificate, NotificationRead].map(model => model.init()));
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
