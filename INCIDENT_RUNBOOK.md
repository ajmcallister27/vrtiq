# vrtIQ Incident Recovery Runbook

This runbook covers backend incident triage, rollback, and SQLite backup/restore on Oracle Always Free.

## 1) Severity levels

- Sev 1: Full outage, data loss risk, or auth failure for all users.
- Sev 2: Partial outage, degraded API performance, or failed deploy.
- Sev 3: Non-critical bug with available workaround.

## 2) Immediate triage checklist

1. Confirm health endpoints:
```bash
curl -f https://api.vrtiq.example/health/live
curl -f https://api.vrtiq.example/health/ready
```
2. Check service status:
```bash
sudo systemctl status vrtiq-backend --no-pager
```
3. Check recent logs:
```bash
sudo journalctl -u vrtiq-backend -n 200 --no-pager
```
4. Confirm latest deployment run:
- GitHub Actions workflow `Deploy Backend to Oracle`
5. Run guardrail and storage checks:
```bash
cd /srv/vrtiq/app/backend
bash ./deploy/predeploy-check.sh
```

## 3) Common incident playbooks

### A) Service not starting

1. Validate env file exists and permissions are strict:
```bash
sudo ls -l /etc/vrtiq/backend.env
```
2. Validate required production values:
- NODE_ENV=production
- JWT_SECRET is set
- CORS_ALLOWED_ORIGINS is set
- DATABASE_URL points to valid sqlite file path
3. Retry service:
```bash
sudo systemctl daemon-reload
sudo systemctl restart vrtiq-backend
sudo systemctl status vrtiq-backend --no-pager
```

### B) Readiness failing, liveness passing

Likely DB connectivity issue.

1. Check DB file path and permissions:
```bash
sudo ls -l /var/lib/vrtiq/db/prod.db
```
2. Ensure runtime user can read/write DB directory:
```bash
sudo chown -R vrtiq:vrtiq /var/lib/vrtiq/db
```
3. Re-run migrations:
```bash
cd /srv/vrtiq/app/backend
npm run migrate:deploy
```
4. Restart service and retest readiness.

### C) CORS rejections after frontend change

1. Update `/etc/vrtiq/backend.env` `CORS_ALLOWED_ORIGINS` with exact frontend origin list.
2. Restart:
```bash
sudo systemctl restart vrtiq-backend
```
3. Verify with browser/network logs and endpoint calls.

### D) Failed production deploy from GitHub Actions

1. SSH into server and run deploy script manually:
```bash
cd /srv/vrtiq/app
bash ./backend/deploy/deploy.sh
```
2. If manual deploy succeeds, investigate missing/incorrect GitHub secrets.
3. If manual deploy fails, follow rollback steps below.

## 4) Rollback procedure

1. Find last known good commit:
```bash
cd /srv/vrtiq/app
git reflog -n 10
```
2. Reset and redeploy to that commit:
```bash
git checkout master
git reset --hard HEAD@{1}
cd backend
npm ci
npm run generate
npm run migrate:deploy
sudo systemctl restart vrtiq-backend
curl -f http://127.0.0.1:3000/health/ready
```
3. Push revert commit to master to realign remote branch with running state.

## 5) Backup and restore

### Create on-demand backup

```bash
cd /srv/vrtiq/app/backend
bash ./deploy/backup-db.sh
ls -lh /var/lib/vrtiq/backups
```

### Restore from backup

1. Stop app:
```bash
sudo systemctl stop vrtiq-backend
```
2. Restore chosen backup:
```bash
LATEST_BACKUP="$(ls -1t /var/lib/vrtiq/backups/prod-*.db.gz | head -n 1)"
sudo rm -f /var/lib/vrtiq/db/prod.db
sudo gunzip -c "${LATEST_BACKUP}" | sudo tee /var/lib/vrtiq/db/prod.db > /dev/null
sudo chown vrtiq:vrtiq /var/lib/vrtiq/db/prod.db
sudo chmod 600 /var/lib/vrtiq/db/prod.db
```
3. Start app and verify:
```bash
sudo systemctl start vrtiq-backend
curl -f http://127.0.0.1:3000/health/ready
```

## 6) Storage and quota breach response

If any threshold crosses 85%:

1. Run prune job:
```bash
cd /srv/vrtiq/app/backend
bash ./deploy/prune-storage.sh
```
2. Re-run capacity check:
```bash
bash ./deploy/predeploy-check.sh
```
3. Remove stale artifacts under `/srv/vrtiq/releases` if required.
4. Confirm no autoscaling or extra instances were introduced.

## 7) Post-incident actions

1. Create timeline of events and root cause.
2. Capture affected endpoints and user impact.
3. Add corrective action with owner and due date.
4. Update deployment guide or scripts to prevent recurrence.
