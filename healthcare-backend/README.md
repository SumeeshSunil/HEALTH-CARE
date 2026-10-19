# Healthcare backend — Step 2

This MERN backend now connects Express to MongoDB using Mongoose.
The frontend is unchanged and still uses its existing demo data.

## Run it

Open a PowerShell terminal inside `healthcare-backend`:

```powershell
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

Open http://localhost:5000/api/health in your browser. You should see:

```json
{"status":"ok","message":"Healthcare backend is running","database":"connected"}
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
and private connection settings from the combined repository.

## Commit this step

From the parent `HEALTH CARE` folder, initialize Git once if you have not already:

```powershell
git init
git add .
git status
git commit -m "Connect healthcare backend to MongoDB with Mongoose"
```

Review `git status` before committing. Neither `node_modules` nor `.env` should
be staged. This first combined commit also includes your existing frontend.
Connect the combined repository to your chosen GitHub repository before pushing.

## Next steps (separate commits)

1. Add MongoDB user models, password hashing, JWT authentication, and role checks.
2. Connect frontend login and registration to the API.
3. Migrate existing users, doctor availability, appointments, consultations,
   records, bills, messages, notifications, profiles, and admin actions.
4. Add the admin medicine catalog, doctor medicine search and dosage instructions,
   pharmacy fulfillment, medicine bills, and cash/card/online payment status.
5. Add test ordering, payment before lab processing, lab worklists, and results.

The database connection is implemented. JWT and the user model are now implemented; frontend API integration is next.

## MongoDB connection (Step 2)

Mongoose connects Node.js to MongoDB. In your existing `.env`, add:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/healthcare
```

Start your local MongoDB service before `npm run dev`. If you use MongoDB Atlas,
replace the URL with your Atlas driver connection string including the healthcare
 database name. Configure your database user and allow your current IP in Atlas
Network Access. URL-encode special characters in passwords. Never commit your
real connection string. The existing `.env` has been preserved.

`src/config/db.js` connects to MongoDB. `src/server.js` waits for that connection
before starting Express. On success the terminal prints `MongoDB connected`.
If MongoDB later disconnects, `/api/health` returns HTTP 503 and reports
`database: "disconnected"`. Startup failures print guidance without the URI.

The database connection step did not write records. With Step 3, the users collection is created at startup and registration writes user records. MongoDB can be viewed in
Compass or Atlas. See AUTH.md for the implemented user model and JWT login.


## Step 3: authentication
See AUTH.md for JWT setup, registration/login examples, first-admin creation, and commit instructions. Authentication is implemented in the backend; React integration is next.

