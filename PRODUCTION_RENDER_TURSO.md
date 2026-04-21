# vrtIQ Production Deployment on Render + Turso

This guide is the source of truth for production deployment with:
- Frontend on GitHub Pages
- Backend on Render
- Database on Turso

## 1) Architecture

- Frontend: GitHub Pages static build
- Backend: Render Node web service (`backend/server.js`)
- Database: Turso (libSQL) via Prisma driver adapter

## 2) Prerequisites

You need:
- Render account and project
- Turso account and CLI
- GitHub repository admin access
- Production frontend origin(s), for example `https://<user>.github.io` or your custom domain

## 3) Turso setup

1. Create a Turso DB.
2. Capture URL:
```bash
turso db show --url <db-name>
```
3. Create auth token:
```bash
turso db tokens create <db-name>
```
4. Save both values for Render env vars:
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

## 4) Prisma migration workflow with Turso

Prisma Migrate does not apply directly to Turso in this project flow.
Use this pattern:

1. Generate migration locally:
```bash
cd backend
npm ci
npm run generate
npm run migrate
```
2. Apply SQL to Turso:
```bash
turso db shell <db-name> < ./prisma/migrations/<timestamp_migration_name>/migration.sql
```

Repeat this for each new migration before deploying backend changes that depend on it.

## 5) Render backend setup

You can deploy with either the Render Blueprint (`render.yaml`) or manual service setup.

Settings:
- Root Directory: `backend`
- Build Command: `npm ci ; npm run generate`
- Start Command: `npm start`
- Health Check Path: `/health/ready`

Required environment variables:
- `NODE_ENV=production`
- `PORT=3000`
- `JWT_SECRET=<strong-random-secret>`
- `JWT_EXPIRES_IN=7d`
- `CORS_ALLOWED_ORIGINS=<comma-separated-frontend-origins>`
- `TURSO_DATABASE_URL=<from-turso>`
- `TURSO_AUTH_TOKEN=<from-turso>`
- `DATABASE_URL=file:./dev.db` (kept for Prisma local tooling compatibility)

## 6) Frontend GitHub Pages setup

1. In GitHub repo secrets, set:
- `VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api/v1`
2. Keep the existing Pages workflow enabled.
3. Push to `master` to trigger deployment.

## 7) Post-deploy checks

Backend:
```bash
curl -f https://<your-render-service>.onrender.com/health/live
curl -f https://<your-render-service>.onrender.com/health/ready
```

Frontend:
- Load your GitHub Pages site
- Confirm login and entity fetches succeed
- Confirm browser network calls target your Render API base URL

## 8) Rollback strategy

- Backend code rollback: redeploy previous commit in Render.
- Schema rollback: apply a compensating migration SQL to Turso.
- Frontend rollback: redeploy previous commit with GitHub Pages workflow.

## 9) Security checklist

- Use explicit `CORS_ALLOWED_ORIGINS` (no wildcard)
- Rotate `TURSO_AUTH_TOKEN` on compromise
- Rotate `JWT_SECRET` periodically
- Avoid storing credentials in repository files
