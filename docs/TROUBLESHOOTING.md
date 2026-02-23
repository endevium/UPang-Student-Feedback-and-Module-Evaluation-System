# Troubleshooting — UPang SFME

This document collects common issues, quick diagnostics, and immediate remediation steps. Expand any entry into a full runbook when needed.

1) Frontend cannot reach backend (CORS / network / wrong URL)
  - Symptom: Browser shows network error or CORS blocked; `fetch` returns 0 or console shows blocked request.
  - Quick checks:
    - Open DevTools → Network, inspect request URL, method, headers and payload.
    - Confirm `API_BASE_URL` is correct for the environment (see frontend `.env` or `vite` config).
    - Check backend logs for the incoming request and any CORS or host header errors.
  - Immediate fix: update `API_BASE_URL`, enable CORS for the frontend origin in backend settings (only for dev), or fix reverse-proxy configuration.

2) Login POST returns 400 (Bad Request)
  - Symptom: Login fails with HTTP 400; response often contains validation errors.
  - Quick checks:
    - Inspect Request Payload in DevTools for missing/incorrect fields (e.g., `email` vs `student_number`).
    - Log outgoing payload immediately before `fetch` in `src/components/LoginModal.jsx`.
    - Check backend validation error JSON in response body for a precise reason.
  - Immediate fix: align frontend field names and content-type (`application/json`) with backend expectations; ensure reCAPTCHA token is present and valid.

3) reCAPTCHA failures / token invalid
  - Symptom: Server rejects requests that include `recaptcha_token`, or frontend shows "reCAPTCHA failed".
  - Quick checks:
    - Confirm `RECAPTCHA_SITE_KEY` is set in the frontend environment and server secret key in backend env.
    - Use browser console to ensure the reCAPTCHA widget executes and returns a non-empty token.
    - Inspect server-side reCAPTCHA verification logs (requests to Google's verify API).
  - Immediate fix: correct site/secret keys in env, ensure tokens are not being reset prematurely, or temporarily disable reCAPTCHA in staging for debugging.

4) 500 / 502 / 504 server errors
  - Symptom: Server returns 5xx codes; app may be down or overloaded.
  - Quick checks:
    - Check backend service logs, gunicorn/uwsgi logs, and webserver/reverse-proxy logs.
    - Monitor CPU/RAM and database connection pool exhaustion.
  - Immediate fix: restart application process, scale instances, or roll back recent deploy if a new release caused regression.

5) Database connection errors
  - Symptom: App cannot connect to DB; errors like "could not connect" or connection refused.
  - Quick checks:
    - Verify DB host/port, credentials, and network security groups/firewall.
    - Confirm DB is up and accepting connections; check connection limits.
  - Immediate fix: restart DB (if safe), increase connection pool, or update host/credentials to correct values.

6) Slow queries or timeouts
  - Symptom: Operations take too long or time out; users see slow UI responses.
  - Quick checks:
    - Enable/inspect slow query log; identify queries with highest total time.
    - Reproduce query with `EXPLAIN ANALYZE` in a safe environment.
  - Immediate fix: add or rebuild indexes, limit result sets, or implement caching for hot endpoints.

7) Authentication/account lockouts / throttling
  - Symptom: Users cannot login due to throttles (429) or locked accounts.
  - Quick checks:
    - Inspect rate limiter logs and configuration (DRF throttles or reverse proxy limits).
    - Check account status in DB (locked, must_change_password flag).
  - Immediate fix: temporarily raise throttling limits for incidents, or whitelist admin IPs.

8) Model inference errors (sentiment)
  - Symptom: ML inference fails or returns unexpected outputs.
  - Quick checks:
    - Validate model files exist in `sentiment_model_final/` and that file permissions allow reads.
    - Confirm the tokenizer and model versions are compatible.
  - Immediate fix: roll back to known-good model artifact, or run a local inference test with a sample input to narrow the issue.

9) How to gather useful debug data (always collect these before escalating)
  - Frontend: Browser DevTools network request, request payload, response body, console errors, app version.
  - Backend: request logs (with request id if available), stack traces, recent deploy/commit hash, resource metrics.
  - DB: slow query / error logs, replication status, recent schema changes.

10) How to escalate
  - Gather the debug artifacts above and open an incident in the project's issue tracker. Tag the owners listed in `MAINTENANCE_NOTES.md` and include: time, steps to reproduce, request/response snapshots, and recent deploy hash.

