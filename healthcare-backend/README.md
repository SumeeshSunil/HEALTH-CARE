# Healthcare backend — Step 1

This is the first backend step: an Express server with a health-check endpoint.
The frontend is unchanged and still uses its existing demo data.

## Run it

Open a PowerShell terminal inside `healthcare-backend`:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Open http://localhost:5000/api/health in your browser. You should see:

```json
{"status":"ok","message":"Healthcare backend is running"}
```

Keep the terminal open while using the backend. Press Ctrl+C to stop it.
`npm run dev` restarts the server when you save changes.
`npm start` runs it without automatic restarts.
`npm run check` checks JavaScript syntax.

Requires Node.js 22.9 or newer (Node.js 24 is installed on this computer).
The server listens on this computer only for local development.

## Understand the files

| File | Purpose |
| --- | --- |
| `package.json` | Lists libraries and commands for the backend |
| `package-lock.json` | Records installed dependency versions; commit this file |
| `src/server.js` | Starts Express and defines API routes |
| `.env.example` | Configuration template that can be committed |
| `.env` | Your local configuration; ignored by Git |

A route combines a request method and a URL. `GET /api/health` asks the server
for its status. `res.json(...)` sends a JSON response. Express handles the
request and response using `req` and `res`.

The parent `.gitignore` excludes dependencies, build files, local settings,
and future SQLite database files from the combined repository.

## Commit this step

From the parent `HEALTH CARE` folder, initialize Git once if you have not already:

```powershell
git init
git add .
git status
git commit -m "Set up healthcare backend with health check"
```

Review `git status` before committing. Neither `node_modules` nor `.env` should
be staged. This first combined commit also includes your existing frontend.
Connect the combined repository to your chosen GitHub repository before pushing.

## Next steps (separate commits)

1. Add SQLite storage, password hashing, JWT authentication, and role checks.
2. Connect frontend login and registration to the API.
3. Migrate existing users, doctor availability, appointments, consultations,
   records, bills, messages, notifications, profiles, and admin actions.
4. Add the admin medicine catalog, doctor medicine search and dosage instructions,
   pharmacy fulfillment, medicine bills, and cash/card/online payment status.
5. Add test ordering, payment before lab processing, lab worklists, and results.

JWT, database storage, and frontend API integration are not implemented in Step 1.
