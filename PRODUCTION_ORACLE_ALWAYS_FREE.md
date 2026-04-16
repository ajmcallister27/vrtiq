# vrtIQ Production Deployment on Oracle Always Free

This guide is the single source of truth for deploying vrtIQ backend to Oracle Always Free on Ubuntu with a GitHub Pages frontend.

Follow it in order. If you skip a step, the most likely failure modes are CORS mismatches, missing secrets, failed Prisma migrations, or a blocked deploy workflow.

## 1) Architecture and hard limits

- Frontend: GitHub Pages.
- Backend: Node.js + Express + Prisma + SQLite.
- Reverse proxy/TLS: Caddy.
- Process manager: systemd.
- Target shape: Oracle Ampere A1 only (`VM.Standard.A1.Flex`).

Hard capacity ceiling across all compute instances:
- Total OCPU: 4 max
- Total memory: 24 GB max

Scaling policy:
- Autoscaling is not allowed.
- Horizontal scaling is not allowed unless equivalent capacity is removed first and total stays <= 4 OCPU and <= 24 GB.

Free-tier monthly quota proofs (31-day worst case):
- OCPU-hours = 4 x 24 x 31 = 2976, which is under 3000.
- Memory GB-hours = 24 x 24 x 31 = 17856, which is under 18000.

Storage policy:
- Combined DB + backups + logs + artifacts must remain under 200 GB.
- Keep logs and backups pruned automatically.

## 2) What you need before you start

You need:
- An Oracle Cloud account with Always Free capacity available in your region.
- A domain or subdomain for the API, such as `api.vrtiq.com`.
- Access to the GitHub repository and the ability to set GitHub Secrets.
- An SSH key pair for the server and GitHub Actions deploys.
- The frontend origin list you will allow in CORS. If your GitHub Pages site uses a custom domain, the origin is typically `https://vrtiq.com`.

## 3) Oracle Cloud setup

### 3.1 Pick the right region

1. Sign in to Oracle Cloud.
2. Use a region that still has Always Free Ampere A1 capacity.
3. If your current region has no capacity, switch to a region that does.

### 3.2 Create the compute instance

1. Open the Compute service and create a new instance.
2. Choose a shape in the Always Free family.
3. Select `VM.Standard.A1.Flex`.
4. Set the shape to exactly:
- 4 OCPU
- 24 GB memory
5. Use Ubuntu 22.04 LTS as the image.
6. Leave autoscaling disabled.
7. Add your SSH public key during instance creation.
8. Attach a public IPv4 address.
9. Set the boot volume to something reasonable, such as 50 to 100 GB.

### 3.3 Network rules

Use either a security list or NSG, but be consistent.

Open inbound TCP ports:
- 22 for SSH
- 80 for HTTP redirect and ACME challenge handling
- 443 for HTTPS

No other public inbound ports are required.

### 3.4 Storage guardrail on Oracle

Do not attach extra block volumes unless you need them and can still stay under the 200 GB total storage budget.

Recommended layout:
- Boot volume for OS and app checkout.
- SQLite database and backups under `/var/lib/vrtiq`.
- Logs under `/var/log/vrtiq`.

### 3.5 Create DNS

1. Create an A record for your API hostname.
2. Point it at the instance public IPv4 address.
3. Wait for DNS propagation before testing HTTPS.

## 4) Server bootstrap

SSH in and install base packages:

```bash
sudo apt update
sudo apt -y upgrade
sudo apt install -y git curl build-essential rsync
```

Create deploy user:

```bash
sudo adduser --disabled-password --gecos "" vrtiq
sudo usermod -aG sudo vrtiq
sudo mkdir -p /home/vrtiq/.ssh
sudo cp /home/ubuntu/.ssh/authorized_keys /home/vrtiq/.ssh/authorized_keys
sudo chown -R vrtiq:vrtiq /home/vrtiq/.ssh
sudo chmod 700 /home/vrtiq/.ssh
sudo chmod 600 /home/vrtiq/.ssh/authorized_keys
```

Optional firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

Switch user:

```bash
sudo su - vrtiq
```

## 5) Install Node and Caddy

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

## 6) Clone and prepare app

```bash
sudo mkdir -p /srv/vrtiq
sudo mkdir -p /var/lib/vrtiq/db
sudo mkdir -p /var/lib/vrtiq/backups
sudo mkdir -p /var/log/vrtiq
sudo chown -R vrtiq:vrtiq /srv/vrtiq /var/lib/vrtiq /var/log/vrtiq

cd /srv/vrtiq
git clone git@github.com:ajmcallister27/vrtiq.git app
cd /srv/vrtiq/app/backend
npm ci
npm run generate
```

## 7) Backend environment

Create runtime environment file for systemd:

```bash
sudo mkdir -p /etc/vrtiq
sudo cp /srv/vrtiq/app/backend/.env.example /etc/vrtiq/backend.env
sudo chown root:root /etc/vrtiq/backend.env
sudo chmod 600 /etc/vrtiq/backend.env
```

Generate a production JWT secret:

```bash
openssl rand -hex 48
```

Edit `/etc/vrtiq/backend.env` with production values:

```dotenv
NODE_ENV=production
PORT=3000
DATABASE_URL=file:/var/lib/vrtiq/db/prod.db
JWT_SECRET=paste-output-from-openssl-rand-hex-48
JWT_EXPIRES_IN=7d
CORS_ALLOWED_ORIGINS=https://vrtiq.com
BODY_JSON_LIMIT=1mb
BODY_URLENCODED_LIMIT=100kb
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_AUTH_MAX=20
RATE_LIMIT_MUTATION_MAX=120
APP_ID=vrtIQ
APP_NAME=vrtIQ
REQUIRE_AUTH=true
STORAGE_LIMIT_GB=200
BACKUP_RETENTION_DAYS=14
LOG_RETENTION_DAYS=14
```

Notes:
- Backend will refuse startup in production if `JWT_SECRET` is missing.
- Backend will refuse startup in production if `CORS_ALLOWED_ORIGINS` is empty.
- CORS allowlist is strict and wildcard origins are rejected.
- If you use a different frontend domain, update `CORS_ALLOWED_ORIGINS` before starting the service.

## 8) Install systemd units

```bash
sudo cp /srv/vrtiq/app/backend/deploy/systemd/vrtiq-backend.service /etc/systemd/system/
sudo cp /srv/vrtiq/app/backend/deploy/systemd/vrtiq-backup.service /etc/systemd/system/
sudo cp /srv/vrtiq/app/backend/deploy/systemd/vrtiq-backup.timer /etc/systemd/system/
sudo cp /srv/vrtiq/app/backend/deploy/systemd/vrtiq-prune.service /etc/systemd/system/
sudo cp /srv/vrtiq/app/backend/deploy/systemd/vrtiq-prune.timer /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable vrtiq-backend
sudo systemctl enable vrtiq-backup.timer
sudo systemctl enable vrtiq-prune.timer
```

Run migrations and start service:

```bash
cd /srv/vrtiq/app/backend
npm run migrate:deploy
sudo systemctl start vrtiq-backend
sudo systemctl start vrtiq-backup.timer
sudo systemctl start vrtiq-prune.timer
sudo systemctl status vrtiq-backend --no-pager
```

Health checks:

```bash
curl -f http://127.0.0.1:3000/health/live
curl -f http://127.0.0.1:3000/health/ready
```

## 9) Configure Caddy for TLS

Caddy handles certificates automatically once DNS points to the server and port 80/443 are open.

Set Caddy site:

```bash
sudo tee /etc/caddy/Caddyfile > /dev/null <<'CADDY'
api.vrtiq.com {
  encode zstd gzip
  reverse_proxy 127.0.0.1:3000
}
CADDY

sudo systemctl reload caddy
sudo systemctl status caddy --no-pager
```

Verify HTTPS:

```bash
curl -f https://api.vrtiq.com/health/live
curl -f https://api.vrtiq.com/health/ready
```

## 10) First deploy and guardrail checks

Before the first production start, run the pre-deploy guardrail script.

Run pre-deploy guardrail check (required):

```bash
cd /srv/vrtiq/app/backend
bash ./deploy/predeploy-check.sh
```

Manual projection check values shown by script must remain:
- OCPU-hours <= 3000
- Memory GB-hours <= 18000
- Storage <= 200 GB

If any of those values are exceeded, reduce capacity or storage before proceeding.

## 11) Auto deploy from GitHub on push to master

Workflow file is already in repo:
- `.github/workflows/deploy-backend.yml`

Required GitHub Secrets:
- `ORACLE_HOST`
- `ORACLE_USER`
- `ORACLE_SSH_KEY`
- `ORACLE_PORT` (set `22`)

Allow restart command without password:

```bash
sudo visudo
```

Add:

```text
vrtiq ALL=(ALL) NOPASSWD:/bin/systemctl daemon-reload,/bin/systemctl restart vrtiq-backend,/bin/systemctl is-active vrtiq-backend
```

Deployment path used by workflow:
- `/srv/vrtiq/app/backend/deploy/deploy.sh`

Deploy script is idempotent and fail-fast:
- fetch/pull with `--ff-only`
- reinstall dependencies
- regenerate Prisma client
- apply migrations
- run guardrail precheck
- restart service
- verify readiness endpoint

Recommended first deployment order:
1. Provision Oracle VM.
2. Clone repo.
3. Configure environment file.
4. Run migrations.
5. Start service.
6. Test local health endpoints.
7. Configure Caddy.
8. Test public HTTPS endpoint.
9. Turn on GitHub Actions deploy.

## 12) Rollback

If latest deployment is bad:

```bash
cd /srv/vrtiq/app
git reflog -n 5
# pick previous good commit hash

git checkout master
git reset --hard HEAD@{1}
cd backend
npm ci
npm run generate
npm run migrate:deploy
sudo systemctl restart vrtiq-backend
curl -f http://127.0.0.1:3000/health/ready
```

Then push a revert commit to master so repo state matches running state.

## 13) Backups and retention

Automated:
- `vrtiq-backup.timer` runs daily at 02:15 UTC.
- `vrtiq-prune.timer` runs every 6 hours.

Scripts:
- `deploy/backup-db.sh`: creates gzip SQLite backup and prunes old backups.
- `deploy/prune-storage.sh`: prunes backups/logs/artifacts and vacuums journal logs.

Manual backup:

```bash
cd /srv/vrtiq/app/backend
bash ./deploy/backup-db.sh
```

Manual prune:

```bash
cd /srv/vrtiq/app/backend
bash ./deploy/prune-storage.sh
```

## 14) Monitoring and alerts

Create Oracle Monitoring alarms for:
- Compute usage percentage (70%, 85%, 95%)
- Memory usage percentage (70%, 85%, 95%)
- Filesystem/storage usage percentage (70%, 85%, 95%)

Alert semantics:
- 70%: warning, review trend and capacity plan.
- 85%: urgent, execute pruning and verify growth source.
- 95%: critical, immediate mitigation required.

Recommended monthly projection check (run on day 1 and day 15):

```bash
cd /srv/vrtiq/app/backend
bash ./deploy/predeploy-check.sh
```

## 15) Smoke checks after deploy

1. `GET /health/live` returns 200.
2. `GET /health/ready` returns 200.
3. Frontend can call backend from allowed origins.
4. Requests from non-allowlisted origins are blocked by CORS.
5. Push to `master` triggers successful backend deploy workflow.
6. `sudo systemctl status vrtiq-backend` is active after restart.
7. Backups are generated and old backups are pruned.
8. Combined storage remains below 200 GB.

## 16) Recovery checklist

If the server fails to come up after a deploy:
1. Check `sudo journalctl -u vrtiq-backend -n 200 --no-pager`.
2. Confirm `/etc/vrtiq/backend.env` has the right values.
3. Confirm the SQLite file path exists and is writable by `vrtiq`.
4. Run `bash ./deploy/predeploy-check.sh` again.
5. Roll back using the steps above if the failure is tied to the last commit.
