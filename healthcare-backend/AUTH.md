> Historical implementation guide. The backend now also saves clinical records, certificates, messages, notifications, lab tests and medicine orders. See the [current project README](../README.md) for setup, demo accounts and current limitations.

# Step 3: users and JWT login

The frontend is unchanged. This step adds backend authentication only.

## Setup

Run `npm install` inside healthcare-backend. Keep your existing `.env` and its
MONGODB_URI. Generate a secret with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Copy that random output into `.env` as `JWT_SECRET=your_random_value`.
Do not commit `.env`. Run `npm run check`, `npm test`, then `npm run dev`.

## How it works

Registration stores a user document in MongoDB. Passwords are salted and hashed
using Node's scrypt; the original password is never stored. Login checks the
hash and returns a signed JWT valid for one hour. Protected routes verify the
token and load the current user from MongoDB, including their active status and
role. JWT contains the user ID, not the password. Twenty login/registration
attempts per IP per 15 minutes are allowed in this single-server setup.

Public registration accepts patients only. Doctor, admin, pharmacy, and lab
roles cannot be selected through public registration. Existing frontend demo
accounts have not been imported and will not log into this API yet.

| Method | URL | Access |
| --- | --- | --- |
| POST | `/api/auth/register` | Public patient registration: name, email, password |
| POST | `/api/auth/login` | Public login: email, password |
| GET | `/api/auth/me` | Signed-in active user |
| GET | `/api/auth/users` | Admin only; newest 100 users |

Password length: 8–128 characters. Email addresses are trimmed and lowercase.
User responses include id, name, email, role, and isActive; never a password hash.

## Try it in PowerShell

With the backend running, open another terminal:

```powershell
$body = @{ name = 'Test Patient'; email = 'patient@example.com'; password = 'ExamplePass123!' } | ConvertTo-Json
$result = Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/auth/register -ContentType 'application/json' -Body $body
$headers = @{ Authorization = "Bearer $($result.token)" }
Invoke-RestMethod http://localhost:5000/api/auth/me -Headers $headers

$login = @{ email = 'patient@example.com'; password = 'ExamplePass123!' } | ConvertTo-Json
$result = Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/auth/login -ContentType 'application/json' -Body $login
```

Register once; duplicate email returns 409. Wrong login returns 401. Missing,
invalid, or expired tokens return 401. A patient requesting `/api/auth/users`
gets 403. These examples use fictional test data.

## Create the first admin

Temporarily add ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD to your private `.env`,
using your own values and a password of 8–128 characters. Then run:

```powershell
npm run create-admin
```

Remove those three ADMIN settings afterward. The command creates a new admin;
it never promotes or overwrites an existing account. Log in using `/api/auth/login`
and use its token to access `/api/auth/users`. Staff account management comes later.

## Commit

From HEALTH CARE, after installation and checks:

```powershell
git add .
git status
git commit -m "Add MongoDB users and JWT authentication"
```

Review that `.env` and node_modules are excluded. Commit package-lock.json.
Next step connects the React login and registration to these endpoints.

Local logout will discard the token; per-token revocation and password recovery
are not included in this step. Frontend integration and existing feature migration
are still pending.
