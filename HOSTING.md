# Host the frontend on Vercel and the backend on Render

The repository includes `healthcare-frontend/vercel.json` and a root `render.yaml` Blueprint. Deployment still requires your Vercel/Render accounts and a MongoDB Atlas connection. No cloud service is created by these files alone.

## 1. MongoDB Atlas

1. Create an Atlas cluster and a database user with read/write access to the `healthcare` database.
2. Copy the Node.js connection string. It will look like `mongodb+srv://USER:PASSWORD@CLUSTER/healthcare?retryWrites=true&w=majority`. Replace placeholders, and URL-encode special characters in the database password.
3. When your Render service exists, copy its **Connect → Outbound** IP ranges into Atlas **Network Access**. Add your own IP too if you will create the first admin from your computer.

Your laptop's MongoDB database is separate from Atlas. Existing local users/records are not automatically copied. Do not put the connection string in GitHub or Vercel's `VITE_` variables.

## 2. Reserve the Vercel project URL

Import `SumeeshSunil/HEALTH-CARE` into Vercel and set **Root Directory** to `healthcare-frontend`. Select **Vite** and Node.js **24.x**. The included `vercel.json` sets:

| Setting | Value |
| --- | --- |
| Install command | `npm ci --include=dev` |
| Build command | `npm run build` |
| Output directory | `dist` |

Note the stable production domain Vercel assigns to this project, such as `https://your-project.vercel.app`. You need it for Render's `FRONTEND_URL`. The first build will stop with a helpful error until you set the backend URL in step 4.

The frontend uses `HashRouter`, so URLs such as `/#/patient/dashboard` need no catch-all rewrite. Assets now build at `/`, instead of the previous GitHub Pages subdirectory.

## 3. Render backend

Use **New → Blueprint**, connect this GitHub repository and select the root `render.yaml`. The Blueprint prompts for:

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | Your private Atlas connection string, with `/healthcare` as the database |
| `FRONTEND_URL` | Your stable Vercel production origin, such as `https://your-project.vercel.app` |

Render generates `JWT_SECRET`. The Blueprint sets production mode, Node 24, host `0.0.0.0`, one trusted proxy hop, and disabled demo payments. Render supplies `PORT` automatically.

For manual setup with **New → Web Service**, use:

| Setting | Value |
| --- | --- |
| Branch | `main` |
| Root directory | `healthcare-backend` |
| Runtime | Node |
| Build command | `npm ci --omit=dev` |
| Start command | `npm start` |
| Health check path | `/api/health` |

Use the variables in `healthcare-backend/deployment.env.example`, and generate a private JWT secret locally:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Enter that output as `JWT_SECRET` in Render. Do not commit it. Trust one proxy hop for this Render setup; if your infrastructure changes, verify that `TRUST_PROXY_HOPS` still matches your proxy chain.

Copy the backend URL and open `https://YOUR-BACKEND.onrender.com/api/health`. It should return `"status":"ok"` and `"database":"connected"` after Atlas permits the Render outbound ranges. Use `npm start`, not `npm run demo` or the Vite development server.

## 4. Connect Vercel to Render

In the Vercel project's **Settings → Environment Variables**, add:

```text
VITE_API_BASE_URL=https://YOUR-BACKEND.onrender.com/api
```

Set it for Production; also set it for Preview if you intend to test preview deployments. Redeploy Vercel because Vite embeds this public API URL at build time. Node.js 24.x is recommended for both hosts.

Check Render's `FRONTEND_URL` matches the browser origin of your Vercel production site exactly: HTTPS, hostname only, no `/#/login` path. A trailing `/` is accepted. Multiple explicitly trusted website origins can be listed with commas. Preview deployment URLs and custom domains must be added individually; all `*.vercel.app` websites are not automatically allowed. Redeploy Render after environment changes.

## 5. Create your first hosted administrator

Point your local backend `.env` at Atlas, with its database URI and `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` values. Then run from `healthcare-backend`:

```powershell
npm run create-admin
```

This creates only a new account; it does not reset an existing one. Remove `ADMIN_PASSWORD` from the local environment file afterward. Sign in on Vercel as that admin to create departments, doctors, lab/pharmacy staff and catalog items. Patients can register through the website. Do not seed the shared, public demo passwords into a publicly accessible deployment.

## 6. Verify the hosted app

- Register and sign in as a fictional patient; reload the browser and confirm the JWT session restores.
- Save a profile, book a future consultation, and confirm it appears in the admin/doctor accounts after refreshing.
- Approve a consultation, save prescriptions and issue a certificate.
- Send a doctor/patient test message and mark a notification read.
- Book a lab test, record a counter receipt as lab staff, collect the sample and release the report.
- Order a medicine, record a pharmacy counter receipt, dispense it, and check stock and receipts.
- Verify admin reports and disabled account access.

Cash/card actions record payment already received; they do not charge a bank account. Simulated online payments remain disabled in production. Free Render services sleep when inactive, and waking up can delay the first request; the frontend now waits up to 60 seconds. If the first request still times out, retry once the backend is awake.

## Local development

The existing local Vite `/api` proxy still works with the backend on port 5000. `FRONTEND_URL` is optional outside production; localhost and 127.0.0.1 on port 5173 are permitted for local development. Local `.env` files are not rewritten by these hosting changes.

For the previous GitHub Pages base path, set `VITE_BASE_PATH=/healthcare-frontend/` when building. Leave it unset or `/` for Vercel.

## Troubleshooting

- **Vercel build asks for `VITE_API_BASE_URL`:** set the HTTPS Render API URL including `/api`, then rebuild. A development `/api` proxy does not exist on the hosted Vercel site.
- **Render exits with `FRONTEND_URL` guidance:** supply the Vercel production domain, without a page path. Production requires HTTPS.
- **Browser cannot reach the API but health works:** compare `VITE_API_BASE_URL` and `FRONTEND_URL` with the actual Render/Vercel domains. Check the failed browser request for CORS errors.
- **MongoDB disconnected/startup failed:** verify the Atlas URI, database user/password and IP access list. `localhost` refers to the Render server, not your laptop.
- **Unexpected login rate limits:** confirm `TRUST_PROXY_HOPS=1` for this Render deployment. Do not change it to unrestricted `true`.
- **Demo login is rejected:** local demo accounts do not automatically exist in Atlas. Create the first admin as above.

Official references: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [Render Blueprint specification](https://render.com/docs/blueprint-spec), [Render outbound IPs](https://render.com/docs/outbound-ip-addresses), [Atlas connections](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/), [Express proxy rate limiting](https://express-rate-limit.mintlify.app/guides/troubleshooting-proxy-issues).
