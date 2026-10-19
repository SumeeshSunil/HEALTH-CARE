# Step 5: one hospital, departments and doctor management

This step turns the doctor directory into one hospital's directory. There is one
hospital profile, many departments, and many doctor accounts. JWT authentication
and role checks remain in use. All backend code is JavaScript; React components
are JSX, with JavaScript helpers. No TypeScript is used.

## Try it

Keep MongoDB, the backend (`npm run dev` in healthcare-backend), and the frontend
(`npm run dev` in healthcare-frontend) running. No new dependencies were added.

1. Sign in as your admin and open **Hospital Setup** in the sidebar.
2. Save your actual hospital name, address, phone and opening hours.
3. Add your departments, such as General Medicine and Cardiology.
4. Expand **Doctor Schedules** in the sidebar and open **Doctor Creation**.
   Add the doctor name, login email, initial password, department, fee and optional
   qualification/experience. This page does not edit consultation slots.
5. Open **Doctor Schedules > Doctor Timings**, choose a created doctor, and enter
   weekly slots as `09:00 AM, 10:30 AM`. Blank days are off duty. A doctor without
   slots cannot be booked.
6. Refresh to confirm that the data persists. Edit the doctor to change their
   details or active status. An inactive doctor is hidden from the patient list.
7. Sign in as a patient. **Hospital Doctors** shows this hospital's doctors only.
   Filter by department or search by name, then open the doctor's booking page.
8. Sign in with the new doctor's email and password. **My Schedule** saves weekly
   slots to MongoDB. Doctors can change only their own schedule.
9. **Manage Users** now loads real accounts from MongoDB. Enable/disable affects
   subsequent API requests and login. You cannot disable your own admin account.

The sidebar's **Doctor Schedules** button expands two separate pages:
**Doctor Creation** and **Doctor Timings**. Hospital Setup has only hospital
details and departments. The old /admin/schedules URL redirects to Doctor Timings.
Doctor profile details are now read from the hospital directory; administration
edits professional details. Patients cannot create doctor accounts.

## Understand the backend

| File | What it does |
| --- | --- |
| `src/models/Hospital.js` | Defines one hospital profile and department documents |
| `src/models/User.js` | Adds a doctor's professional details inside their user document |
| `src/routes/hospital.js` | Reads/saves hospital details, departments, doctors and schedules |
| `src/utils/hospital.js` | Checks weekly slots and builds safe doctor responses |
| `src/routes/auth.js` | Adds admin-controlled account enable/disable |

A doctor account and professional profile are saved in one MongoDB document.
That avoids needing transactions between a login collection and a doctor
collection. The department is a reference to a department document. Mongoose
`populate()` retrieves its name for display. No hospital ID is accepted from
forms: hospital settings always update the single `main` profile.

`requireAuth` verifies JWT and loads the current active user. `requireRole('admin')`
protects administration endpoints. Only admins can create doctor accounts or
change another doctor's details. A doctor may update their own weekly schedule.
The API never returns password hashes.

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/hospital` | Signed in |
| PUT | `/api/hospital` | Admin |
| GET | `/api/hospital/departments` | Signed in |
| POST | `/api/hospital/departments` | Admin |
| GET | `/api/hospital/doctors` | Signed in; active doctors |
| GET | `/api/hospital/doctors?includeInactive=true` | Admin can include disabled doctors |
| POST | `/api/hospital/doctors` | Admin creates a doctor account |
| PATCH | `/api/hospital/doctors/:id` | Admin edits a doctor |
| PUT | `/api/hospital/doctors/:id/availability` | Admin or that doctor |
| PATCH | `/api/auth/users/:id/status` | Admin; body is `{ "isActive": false }` or true |

## Understand the frontend

- `doctorSlice.js` loads real hospital details, departments and doctors.
- `HospitalSettings.jsx` provides hospital details and department management.
- `DoctorCreation.jsx` creates/edits doctor accounts without changing their slots.
- `DoctorTimings.jsx` selects an existing doctor and saves only weekly slots.
- `DoctorSearch.jsx` filters hospital doctors by department/name; location search
  and invented ratings/fees are removed from this directory.
- `DoctorSchedule.jsx` saves the current doctor's weekly schedule through the API.
- `ManageUsers.jsx` uses MongoDB accounts and persists active-status changes.
- `WeeklySlots.jsx` displays seven day inputs; `utils/weeklySlots.js` converts
  comma-separated input into API data.
- Booking matches the exact MongoDB doctor ID. Unknown IDs no longer silently
  select the first doctor. Only the configured slots are shown.
- The navbar uses the saved hospital name. The public landing page remains a
  generic hospital portal until login.

## Still pending

Appointments are still held in frontend Redux state, so booking/approval is not
shared between separate browser sessions and is lost on refresh. Appointment
capacity must be checked on the server in the next migration step. This step
changes doctor selection and weekly schedule storage only.

Existing demo appointments, records, messages, certificates, reports, patient
profile edits and billing have not all been migrated. Old JSON doctor accounts
are not imported. Some legacy screens still use sample data; the new directory
and account list do not use those samples. Department rename/removal, password
recovery, staff roles beyond doctors, and pagination beyond the newest 100 user
accounts are not part of this step.

## Check and commit

Backend: `npm run check` and `npm test`.
Frontend: `npm test`, `npm run build`, and `npm run lint`.

From the parent HEALTH CARE folder:

```powershell
git add .
git status
git commit -m "Add single hospital setup and doctor management"
```

Review staged changes. Keep `.env` and `node_modules` excluded. Use your existing
Git remote to push. Next step: migrate appointment booking, listing, capacity
checks and approval to MongoDB with patient/doctor/admin permissions.

## Navigation separation update

Doctor detail edits use individual MongoDB field updates, so saving a fee,
department, or name cannot erase slots changed on the Doctor Timings page.
Existing doctor IDs, passwords, hospital settings, and departments are preserved.
This change does not require reseeding doctors or reinstalling packages.

After validation, commit from HEALTH CARE:

```powershell
git add .
git status
git commit -m "Separate hospital setup and doctor schedule pages"
```
