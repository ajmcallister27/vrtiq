# vrtIQ Backend

This backend is a self-hosted reimplementation of the Base44 API used by the `vrtIQ` frontend.
It implements:

- **Entities API** (`/api/v1/entities/*`) with filtering, sorting, pagination
- **Authentication** (`/api/v1/auth/*`) using JWT
- **Integrations** (`/api/v1/integrations/Core/*`) for LLM and file operations (stubbed)
- **App public settings** (`/api/apps/public/prod/public-settings/by-id/:id`)

## Getting Started

### 1) Install dependencies

```bash
cd backend
npm install
```

### 2) Configure environment

Copy the example env file and edit as needed:

```bash
cp .env.example .env
```

Important environment behavior:
- In `production`, startup fails if `JWT_SECRET` is missing.
- In `production`, startup fails if `CORS_ALLOWED_ORIGINS` is empty.
- `CORS_ALLOWED_ORIGINS` must be a comma-separated explicit allowlist.
- `DATABASE_URL` is used for local Prisma migration generation.
- Set both `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to use Turso at runtime.

### 3) Initialize the database

```bash
npm run generate
npm run migrate
npm run seed
```

This creates an SQLite database at `dev.db` and seeds an admin user.

For Turso production migrations:
1. Generate SQL locally with `npm run migrate`.
2. Apply the generated SQL to Turso with Turso CLI (`turso db shell <db-name> < ./prisma/migrations/<migration>/migration.sql`).

### 4) Start the server

```bash
npm run dev
```

The server listens on `http://localhost:3000` by default.

Health endpoints:
- `GET /health/live`
- `GET /health/ready`
- `GET /health` (backward-compatible alias)

---

## Running with Frontend

The frontend expects the Base44 API under `/api/`.
If running the frontend separately (e.g., Vite), configure a proxy from `/api` to this backend.

Example Vite proxy in `vite.config.js`:

```js
server: {
  proxy: {
    '/api': 'http://localhost:3000'
  }
}
```

Alternatively, you can add a hosts entry to point `vrtiq.base44.app` to `127.0.0.1` and run the backend on port 80.

## Notes

- The backend enforces JWT auth for creating/updating entities and integration endpoints.
- A default admin user is created by `npm run seed` (email/password in `.env`).

## Production Deployment

Use Render for backend hosting and Turso for the database.
See the repository root deployment guide: `../PRODUCTION_RENDER_TURSO.md`.
