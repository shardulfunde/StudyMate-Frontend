# Deploy StudyMate Frontend on Render + Cron Setup

## 1. Prepare environment variables
In Render, add these frontend env vars for your Static Site:

- `VITE_API_BASE_URL` = your FastAPI URL (example: `https://your-backend.onrender.com`)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Use values from your Firebase web app config.

## 2. Create Static Site on Render
1. Push this frontend code to GitHub.
2. In Render dashboard: `New` -> `Static Site`.
3. Select your repo.
4. Configure:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Root Directory: `frontend` (important in this monorepo layout)
5. Add env vars from step 1.
6. Deploy.

## 3. Add your URL
After deploy, Render gives a URL like:
- `https://studymate-frontend.onrender.com`

If you have a custom domain:
1. Open Static Site -> `Settings` -> `Custom Domains`
2. Add your domain (example: `app.yourdomain.com`)
3. Update DNS as Render shows.
4. Wait for SSL certificate to be issued automatically.

## 4. SPA rewrite rule (recommended)
For React Router routes (`/notes`, `/admin`, etc.), add a rewrite rule in Render Static Site:

- Source: `/*`
- Destination: `/index.html`
- Action: `Rewrite`

This prevents 404 on refresh for client-side routes.

## 5. Cron-safe page (no login, no backend calls)
A static file is available at:

- `/cron-heartbeat.html`

Full example:
- `https://studymate-frontend.onrender.com/cron-heartbeat.html`

This page:
- does not require Firebase login
- does not call backend endpoints
- is safe for periodic health pings

## 6. Create cron job on Render
Render cron jobs are separate services.

1. In Render dashboard: `New` -> `Cron Job`
2. Configure:
   - Name: `studymate-frontend-heartbeat`
   - Schedule: for example `*/10 * * * *` (every 10 minutes)
   - Runtime: `Docker` or `Native` (either is fine)
   - Command:
     - Linux curl:
       `curl -fsS https://YOUR-FRONTEND-URL/cron-heartbeat.html > /dev/null`
3. Save and deploy cron job.

Replace `YOUR-FRONTEND-URL` with your actual Render/custom domain.

## 7. Verify
1. Open in browser:
   - `https://YOUR-FRONTEND-URL/cron-heartbeat.html`
2. In cron logs, confirm successful HTTP 200 responses.

## Notes
- Static sites on Render do not sleep like web services, so heartbeat is usually optional.
- This heartbeat is useful as a controlled monitoring check and does not load backend.
