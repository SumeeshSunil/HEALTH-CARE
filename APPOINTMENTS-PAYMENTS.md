> Historical implementation guide. The backend now also saves clinical records, certificates, messages, notifications, lab tests and medicine orders. See the [current project README](README.md) for setup, demo accounts and current limitations.

# Step 6: appointments, consultation bills and payment choice

Bookings now use MongoDB. Patient, doctor and admin screens load their authorized
appointments from the API. The appointment stores its consultation bill in the
same document, so there cannot be a booking without its bill or a second fee
created at consultation completion. All code remains JavaScript and JSX.

## Run and try it

Keep MongoDB and both development servers running. No new packages are needed.
If the backend is not running with watch mode, restart it to load the new routes.

1. Patient: open Hospital Doctors, choose a doctor, date and available time.
2. Choose **Pay at hospital** or **Pay now (project demo)** and submit.
3. The appointment starts as **pending**. Its consultation bill is **unpaid**.
   The amount comes from the doctor's saved fee, not from browser input.
4. Pay at hospital: sign in as admin, open All Appointments, choose cash/card/online
   transfer, and click **Record payment received** only after receipt.
5. Pay now: the same booking screen shows a clearly labelled demo checkout.
   **Simulate successful payment** records paid/demo; **Simulate failed payment**
   leaves the bill unpaid. No actual money is collected and no card data is asked for.
6. Admin: approve or reject the pending appointment. Approval and payment are
   separate: an appointment can be pending/paid or confirmed/unpaid.
7. Patient: refresh My Appointments or Consultation Bills to verify persistence.
   You can retry demo payment from either page or pay at the hospital later.
8. Doctor: the consultation queue shows only their own appointments and bill
   status. Only confirmed appointments can be completed. Completion no longer
   creates a second consultation bill.
9. Cancel an unpaid booking: it becomes cancelled, its bill becomes void, and its
   slot place is released. Rejecting an unpaid booking follows the same bill rule.
10. Cancel/reject a paid booking: its bill becomes refund pending. Admin records
    a completed external refund, or completes a demo refund for a demo receipt.
    The app itself does not transfer refunds.

Refresh buttons reload server data. Switching focus back to the app also reloads
appointments. Separate browser sessions share database state; changes are visible
on refresh/focus, rather than through a live WebSocket connection.

## What is saved

| Appointment status | Meaning |
| --- | --- |
| pending | Waiting for admin approval |
| confirmed | Approved by admin |
| completed | Completed by the assigned doctor |
| rejected | Rejected by admin |
| cancelled | Cancelled by the patient or admin |

| Bill status | Meaning |
| --- | --- |
| unpaid | Payment has not been recorded |
| paid | Hospital receipt, demo payment, or zero-fee consultation |
| void | Unpaid booking cancelled/rejected; nothing is due |
| refund_pending | A paid booking was cancelled/rejected |
| refunded | Admin recorded refund completion |

The bill includes the initial payment choice, amount, payment method, source,
receipt reference and payment/refund timestamps. Bills use integer paise in
MongoDB to avoid money rounding problems. A doctor's later fee change does not
change existing bills. Zero-fee consultations are marked paid/waived without
charging anything or requiring a refund if cancelled.

## Beginner explanation of the backend files

| File | Purpose |
| --- | --- |
| `src/models/Appointment.js` | Defines the booking and its bill in MongoDB |
| `src/routes/appointments.js` | HTTP endpoints for booking, approval, cancellation and payments |
| `src/utils/appointments.js` | Date/schedule checks, permissions, status transitions and response formatting |
| `src/utils/HttpError.js` | Returns useful request errors without exposing database details |
| `scripts/test-appointments-mongo.js` | Optional tests using a separate disposable database |

Every time slot has four numbered places (seats 1–4). MongoDB's unique index
prevents two bookings from claiming the same place. The backend tries each seat
and rejects the booking if all four are occupied. This handles simultaneous
requests; counting bookings only in JavaScript would allow a race.

Another index prevents one patient booking the same doctor/date/time twice while
that booking is active. A booking key makes retries return the original booking
instead of charging/booking again. Cancelled/rejected bookings release their seats.
Pending unpaid bookings still reserve a place until cancelled or rejected.

Mongoose's optimistic concurrency checks stop payment and cancellation updates
from overwriting each other. The backend retries a conflicting update against
the latest document. The frontend also compares document versions so delayed
responses cannot restore an older payment or appointment status.

## API and JWT permissions

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/appointments` | Patient: own; doctor: assigned; admin: all |
| GET | `/api/appointments/availability?doctorId=...&date=...` | Signed-in patient/doctor/admin; counts only |
| POST | `/api/appointments` | Patient |
| PATCH | `/api/appointments/:id/status` | Admin approval/rejection/cancellation; patient own cancellation; doctor assigned completion |
| POST | `/api/appointments/:id/payment/demo` | Patient, own appointment, demo enabled |
| POST | `/api/appointments/:id/payment/hospital` | Admin records received cash/card/online transfer |
| POST | `/api/appointments/:id/payment/refund` | Admin records a pending refund as completed |

Booking body: doctorId, date (`YYYY-MM-DD`), time (`09:00 AM`), reason,
paymentChoice (`hospital` or `online`), bookingKey (the frontend generates this).
Client amounts, patient IDs, doctor names, bill status and seat numbers are ignored.
Dates and future-slot checks use Asia/Kolkata time. Past or unscheduled slots and
disabled doctors are rejected. Availability counts do not disclose patient data.

## Project demo payments

Demo checkout is enabled in local development unless `ENABLE_DEMO_PAYMENTS=false`
is set in backend .env. NODE_ENV=production always disables it. Without a real
gateway, production supports Pay at hospital only. Do not enable a fake success
callback for actual payments: a future gateway integration must verify payment
with the provider on the backend before marking a real online bill paid.

Demo receipts are clearly labelled and excluded from real hospital collection
summaries. Hospital receipts are manually recorded by staff, not bank-verified
transactions. No card numbers, UPI PINs or bank credentials are collected.

## Checks

Inside healthcare-backend:

```powershell
npm run check
npm test
npm run test:mongo
```

The MongoDB check connects using MONGODB_URI but selects a unique temporary
`healthcare_appointment_test_...` database. It creates only fictional test records,
checks concurrent booking capacity, duplicate retries, permissions, payments,
refunds and a payment/cancellation race, then drops that exact test database.
Your application database is not selected for these checks. The MongoDB user
must have permission to create and remove that separate test database.

Inside healthcare-frontend:

```powershell
npm test
npm run build
npm run lint
```

## Remaining work

Diagnosis, clinical notes, prescriptions, certificates, messages, notifications,
and full patient profile/history persistence remain for later migration. The
existing doctor's consultation form still saves clinical records locally for the
current browser session; only completion status and its existing bill persist
in MongoDB in this step. Refreshing will not recover those clinical details yet.

Old JSON appointment/bill records are not imported. Start with a new booking.
The migrated booking/billing/report screens do not load the JSON samples. This
step adds no automatic expiry for unpaid bookings, real gateway, live push
updates, or automatic cancellation when a doctor schedule changes. Existing
bookings keep their saved time and price.

## Commit from HEALTH CARE

```powershell
git add .
git status
git commit -m "Migrate appointments and consultation payments to MongoDB"
```

Review staged files and keep .env and node_modules excluded. Next step is
persisting consultation notes, diagnoses and prescriptions so completion and
clinical records can be saved as one backend workflow.
