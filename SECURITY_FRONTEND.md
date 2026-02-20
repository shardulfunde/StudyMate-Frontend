# Frontend Security Guide (React + Firebase + FastAPI)

## Authentication and Token Handling
- Firebase ID tokens are cached in memory only (`src/services/auth.js`).
- Tokens are refreshed silently before expiry and on 401 retry (`getFreshIdToken(true)`).
- No auth token is stored in `localStorage` or `sessionStorage`.

## API Requests
- All API requests attach `Authorization: Bearer <id_token>`.
- Protected fetch requests retry once after silent refresh on 401.
- Global handlers:
  - `401`: sign out user and return to login state.
  - `403`: show permission error toast.
  - `429`: show rate-limit toast (uses `Retry-After` when present).

## CORS and Credentials
- Current integration uses Bearer tokens, so `credentials: 'omit'` and `withCredentials: false`.
- Do not enable `withCredentials` unless backend switches to secure cookie auth.
- Keep API origin fixed in env (`VITE_API_BASE_URL`) and avoid runtime user-controlled API URLs.

## XSS / CSRF Notes
- Avoid rendering untrusted HTML (`dangerouslySetInnerHTML`) unless sanitized.
- If cookie auth is adopted later, use:
  - `HttpOnly`, `Secure`, `SameSite=Lax/Strict` cookies
  - CSRF token protection

## Environment Variables
- Use `.env` for frontend runtime config only.
- Never put private backend secrets in frontend env.
- Firebase web config is public by design, but still lock down allowed domains and usage in Firebase/GCP.

## Production Build / Deploy
- Build with `npm run build`.
- Serve only over HTTPS.
- Add security headers at hosting/CDN layer:
  - `Content-Security-Policy`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Frame-Options: DENY`
