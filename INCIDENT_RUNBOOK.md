# vrtIQ Incident Recovery Runbook

This runbook covers backend incident triage and recovery for Render + Turso production.

## 1) Severity levels

- Sev 1: Full outage, data loss risk, or auth failure for all users.
- Sev 2: Partial outage, degraded API performance, or failed deploy.
- Sev 3: Non-critical bug with available workaround.

## 2) Immediate triage checklist

1. Confirm backend health endpoints:
```bash
curl -f https://<render-service>.onrender.com/health/live
curl -f https://<render-service>.onrender.com/health/ready
```
2. Check latest Render deploy logs and runtime logs.
3. Confirm latest GitHub Pages deployment run completed.
4. Verify Turso status and token validity.

## 3) Common incident playbooks

### A) Backend not starting on Render

1. Validate required env vars in Render service:
- `NODE_ENV=production`
- `JWT_SECRET`
- `CORS_ALLOWED_ORIGINS`
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
2. Check Render build logs for dependency/install failures.
3. Check runtime logs for startup validation errors.
4. Roll back to last healthy deploy in Render if needed.

### B) Readiness failing, liveness passing

Likely DB connectivity issue.

1. Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are present and correct.
2. Confirm Turso database is reachable.
3. Re-apply latest migration SQL if schema drift is suspected.

### C) CORS rejections after frontend change

1. Update Render `CORS_ALLOWED_ORIGINS` with exact frontend origin list.
2. Redeploy backend.
3. Verify with browser network logs and endpoint calls.

### D) Failed frontend release

1. Check GitHub Actions workflow `Deploy static content to Pages`.
2. Verify repository secret `VITE_API_BASE_URL` is set correctly.
3. Trigger a manual workflow dispatch after fixing secrets.

## 4) Rollback procedure

1. Backend rollback:
- In Render dashboard, redeploy previous successful version.
2. Frontend rollback:
- Re-run GitHub Pages deploy on a known good commit.
3. Database rollback:
- Apply a compensating SQL migration using Turso CLI.

## 5) Data recovery strategy

- Turso provides backups/point-in-time capabilities based on your plan.
- For destructive incidents, restore in Turso, then validate API readiness before reopening traffic.

## 6) Post-incident actions

1. Create timeline of events and root cause.
2. Capture affected endpoints and user impact.
3. Add corrective action with owner and due date.
4. Update deployment docs and tests to prevent recurrence.
