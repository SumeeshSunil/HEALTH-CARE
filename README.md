# Healthcare school project

Simple JavaScript backend: Express + MongoDB (Mongoose) + JWT. The existing React frontend calls the API. There are no microservices, queues or payment gateway accounts to configure.

## Quick school demonstration

Use Node.js 22.12+ or 24. Open two terminals from this folder.

Terminal 1:

```powershell
cd healthcare-backend
npm ci
npm run demo
```

Terminal 2:

```powershell
cd healthcare-frontend
npm ci
npm run dev
```

Open **http://localhost:5173**. On Windows, if `npm` reports a missing `npm-cli.js`, use `& 'C:/Program Files/nodejs/npm.cmd'` in place of `npm`.

The optional demo server downloads a MongoDB executable on first use (a large download), runs a temporary local database, and creates the accounts below. **Demo data disappears when the demo server stops.** Use the normal setup below to keep data between restarts.

All demo accounts use password **`SchoolDemo123!`**:

| Role | Email | What to demonstrate |
| --- | --- | --- |
| Admin | admin@school.test | Hospital, departments, doctors, approvals, staff, reports |
| Doctor | doctor@school.test | Schedule, consultations, saved prescriptions, certificates, messages |
| Patient | patient@school.test | Appointments, profile, records, lab tests, medicines and payments |
| Lab staff | lab@school.test | Test catalog, receipts, samples and lab reports |
| Pharmacy staff | pharmacy@school.test | Medicine catalog, restocking, receipts and dispensing |

## Normal setup: keep your data

1. Start a local MongoDB server, or use a MongoDB Atlas connection string.
2. In `healthcare-backend`, run:

   ```powershell
   npm ci
   npm run setup
   ```

3. Edit `healthcare-backend/.env` if your MongoDB URI differs from `mongodb://127.0.0.1:27017/healthcare`. Setup generates a random JWT secret and never overwrites an existing `.env`.
4. For fictional presentation data, run `npm run seed:demo`. This inserts only missing demo accounts/catalog items; it never resets existing passwords, prices or stock. For an empty project instead, follow `healthcare-backend/AUTH.md` to create your first admin.
5. Run `npm run dev` in the backend and frontend terminals. Data now persists in your configured MongoDB database.

Use only fictional information and demo credentials in this school project. Demo accounts have a shared, public password.

## Presentation walkthrough

1. As patient, book a doctor appointment for a future slot. Choose payment at the hospital or simulated online payment.
2. As admin, approve it and record any consultation counter payment.
3. As doctor, open the approved consultation, enter notes and prescriptions, and save. Completion and clinical notes are saved together. Issue a certificate for that patient after consultation.
4. As patient, refresh Medical Records and Certificates to see the saved documents. Messages work between doctors and patients with an existing appointment.
5. As patient, book a lab test. Either simulate checkout or ask lab staff to record cash/card already received. As lab staff, mark the sample collected, enter a report and release it. The patient sees the report in Lab tests & results.
6. As patient, order a medicine and pay. As pharmacy staff, dispense it; stock decreases once even if the request is retried. Use Restock to add inventory.
7. As admin, view consultation and department payment reports. Patients can refresh notifications and mark them read; read state is saved.

Refresh buttons retrieve changes made by other accounts. Use separate browser profiles/private windows to demonstrate multiple accounts at once.

## Payments and simple project boundaries

- Online checkout is explicitly a **simulation**. It never charges cards, uses a real gateway or transfers money. Success/failure controls demonstrate the workflow. Production mode disables simulated payments.
- Cash/card buttons **record money already received** at the counter. Receipt references and server-calculated amounts are saved. Patients cannot set prices or mark counter payments themselves.
- Lab and medicine orders contain one catalog item per order. Lab orders have no appointment time slot. Medicine stock is deducted when dispensed; placing/paying an order does not reserve inventory. Staff may need to restock before dispensing a paid order.
- Service orders do not implement cancellation/refunds. Consultation cancellation/refund tracking remains available in the existing appointment screens.
- The medicine catalog is a simple demonstration of stock and billing, without prescription matching, expiry/batch tracking, delivery or clinical decision logic.
- Certificates use the browser Print dialog. Lab reports are plain text. There are no email/SMS, file uploads or realtime chat sockets.
- Vite proxies `/api` to port 5000 during development/preview. Run the frontend through Vite; opening `index.html` directly will not work. Deployment under another origin would need hosting/proxy configuration.

## Backend code map

| File | Purpose |
| --- | --- |
| src/server.js | Connect MongoDB and start the API |
| src/app.js | Express routes and shared error responses |
| src/middleware/auth.js | Check JWT, active account and allowed roles |
| src/routes/auth.js | Register, login, profile, admin users and staff creation |
| src/routes/hospital.js | Hospital, departments, doctors and schedules |
| src/routes/appointments.js | Bookings, approval, consultation notes and consultation payments |
| src/routes/services.js | Lab/medicine catalog, orders, stock and payments |
| src/routes/clinical.js | Records, certificates, messages, notifications and reports |
| src/models/Services.js | Small schemas for department and supporting features |

Paths above are relative to `healthcare-backend`.

## Main new API endpoints

Send `Authorization: Bearer <JWT>` to protected routes.

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | /api/auth/staff | Admin creates lab/pharmacy staff |
| GET | /api/services/catalog/:kind | Signed-in users; kind is lab or medicine |
| POST / PATCH | /api/services/catalog/:kind[/:id] | Admin or matching department staff |
| POST | /api/services/catalog/medicine/:id/restock | Admin/pharmacy |
| GET | /api/services/orders | Patient's own orders, or staff's department |
| POST | /api/services/orders | Patient; itemId, quantity, bookingKey |
| POST | /api/services/orders/:id/payment | Owner's demo checkout or matching staff's counter receipt |
| PATCH | /api/services/orders/:id/status | Matching staff/admin |
| POST | /api/appointments/:id/consultation | Assigned doctor |
| GET | /api/records | Patient's own records, assigned doctor's records, or admin |
| GET | /api/lab-results | Patient's reports, reports for a doctor's booked patients, or admin |
| GET / POST | /api/certificates | Read own/assigned; doctor issues after completed consultation |
| GET | /api/messages/contacts | Patient/doctor with a booking |
| GET / POST | /api/messages | Patient/doctor; POST recipientId and text |
| GET | /api/notifications | Patient's saved events |
| POST | /api/notifications/read | Patient; keys array |
| GET | /api/reports | Admin lab/medicine totals |

## Checks

Backend:

```powershell
npm test
npm run check
npm run test:integration
```

Integration checks start and stop a disposable MongoDB database, check JWT/roles, lab reports, stock races, payments, clinical records, certificates, messages and notifications, then run the existing appointment database checks. They never use your application database. The first run can download MongoDB. `npm run test:mongo` remains available for the original appointment checks against a separately named temporary database on your configured MongoDB instance.

Frontend:

```powershell
npm test
npm run build
npm run lint
```

The original frontend dependencies currently produce npm audit advisories; review dependency updates before any public deployment. Lint also reports the existing Toast component's development fast-refresh warning.
