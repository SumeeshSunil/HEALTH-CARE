# Healthcare backend

Beginner-oriented MERN API using JavaScript, Express, Mongoose and JWT.

## Start locally

From healthcare-backend, run npm install. Create .env from .env.example only if
it does not already exist. Keep your MongoDB URI and a random JWT_SECRET of at
least 32 characters in .env. Never commit that file.

```powershell
npm run dev
```

MongoDB must connect before the API starts. Open http://localhost:5000/api/health
for its connection status. npm start runs without automatic restarts.

## Implemented

- Patient registration, password hashing, JWT login, active-account and role checks.
- Single hospital details, departments, doctor accounts and weekly availability.
- MongoDB appointments, backend slot capacity, approval/rejection and cancellation.
- One consultation bill per booking, pay-at-hospital or project demo payment,
  cash/card/online receipt recording, and refund statuses.

No TypeScript or separate SQL database is used. A local MongoDB server or Atlas
connection can be used with MONGODB_URI.

## Guides

- AUTH.md: login/register examples and creating the first admin.
- SEED-DOCTORS.md: edit JSON and seed/update fictional project doctors directly.
- ../SINGLE-HOSPITAL.md: hospital, departments and separate doctor admin pages.
- ../APPOINTMENTS-PAYMENTS.md: booking/payment flows, APIs and detailed checks.

## Checks

```powershell
npm run check
npm test
npm run test:mongo
```

The last command needs a database connection and permission to create/drop a
separate temporary test database. It never selects your application database.

Optional local setting: ENABLE_DEMO_PAYMENTS=false disables demo checkout.
Production always disables demo payments. No real payment gateway is connected.
Clinical records, prescriptions, certificates, messages, notifications, lab tests,
medicine inventory, department orders and receipts are now saved by the API.
See the root README for the complete setup, demo accounts, endpoint list and
school-project boundaries. Run `npm run test:integration` for the complete
disposable-database checks, or `npm run demo` for a temporary seeded demo.
