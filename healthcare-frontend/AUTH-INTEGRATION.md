# Step 4: connect React authentication

Login now calls POST /api/auth/login and checks the actual password. Registration
calls POST /api/auth/register and creates a patient in MongoDB, including optional
address, mobile, and date of birth. Staff use accounts created through backend
administration; public doctor registration has been removed.

## Run locally

Open two terminals:

1. Inside healthcare-backend: npm install, then npm run dev. MongoDB must be
   available and .env must contain MONGODB_URI and JWT_SECRET.
2. Inside healthcare-frontend: npm install, then npm run dev. Open the URL Vite prints.

Vite forwards /api requests to http://127.0.0.1:5000. If you change the backend
port, update the proxy in vite.config.js. Local development now uses the root
URL; production keeps the existing /healthcare-frontend/ asset base.

## What changed

- services/api.js sends requests, attaches tokens, and shows server/network errors.
- authSlice.js manages async login, registration, and refresh recovery.
- main.jsx saves only the token in sessionStorage and discards the old demo user.
- AuthSession.jsx signs out at token expiration or when a protected API returns 401.
- ProtectedRoute waits for verification, checks roles, and offers retry on outages.
- Login and registration show errors and disable submission while waiting.
- Existing profile forms use a separate local display action; profile persistence
  and other existing features will be migrated in later steps.

A refresh validates the token with GET /api/auth/me. A saved user object cannot
sign someone in. Closing the tab clears the session storage; logout removes the
token. Tokens expire after one hour. Backend role checks enforce API permissions.
The JWT is readable by JavaScript in this simple local setup; production session
hardening and per-token revocation are separate work.

## Verify

Run npm test and npm run build inside healthcare-frontend. Run npm run check and
npm test inside healthcare-backend. Then check in your browser:

1. Register a new patient with a password of at least eight characters.
2. Confirm the user appears in MongoDB and no plaintext password is stored.
3. Refresh: remain signed in after server verification.
4. Sign out, then attempt a wrong password: see an error and remain signed out.
5. Sign in with the right password and confirm patient navigation.
6. Stop the backend and refresh a protected page: see Retry. Restart it and retry.
7. Use an admin created with npm run create-admin to check admin navigation.

Existing JSON demo accounts have not been migrated. Appointments, records,
profile edits, billing, messages, and dashboards still use their current demo
state; this step migrates authentication only. New MongoDB IDs will be linked
with those features as each feature is migrated.

The Vite proxy is local tooling. GitHub Pages hosts static files and cannot run
this backend. Production API hosting/routing must be configured before deploying
this connected version. Do not put MongoDB credentials or JWT_SECRET in VITE_ vars.

## Commit from HEALTH CARE

After checks pass:

```powershell
git add .
git status
git commit -m "Connect React authentication to JWT backend"
```

Review the staged files and exclude .env and node_modules.
