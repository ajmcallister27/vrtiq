# Whiteout - Ski Run Difficulty Ratings

A complete, self-hosted application for crowdsourced ski run difficulty ratings.

## Project Structure

```
whiteout/
├── frontend/          # React + Vite + Tailwind
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Node.js + Express + Prisma
│   ├── src/
│   ├── prisma/
│   └── package.json
├── .env.example
└── README.md
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Quick Start

### 1. Set Up PostgreSQL

```bash
# macOS (Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database
psql -U postgres
CREATE DATABASE whiteout;
\q
```

### 2. Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Edit with your database credentials
# DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/whiteout
```

### 3. Install & Run Backend

```bash
cd backend
npm install
npx prisma migrate deploy   # Run migrations
npx prisma db seed          # Seed with initial data
npm run dev                 # Start development server
```

Backend will be running at http://localhost:3001

### 4. Install & Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be running at http://localhost:5173

## Production Deployment

### Backend

```bash
cd backend
npm install
npx prisma migrate deploy
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run build
# Serve the dist/ folder with nginx, Apache, or any static host
```

### Using PM2 (Recommended for Backend)

```bash
npm install -g pm2
cd backend
pm2 start npm --name "whiteout-api" -- start
pm2 save
pm2 startup
```

### Docker (Alternative)

Both frontend and backend include Dockerfiles for containerized deployment.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/resorts | List all resorts |
| GET | /api/resorts/:id | Get resort by ID |
| POST | /api/resorts | Create resort |
| PUT | /api/resorts/:id | Update resort |
| DELETE | /api/resorts/:id | Delete resort |
| GET | /api/runs | List all runs |
| GET | /api/runs?resort_id=xxx | Filter runs by resort |
| POST | /api/runs | Create run |
| POST | /api/runs/bulk | Bulk create runs |
| PUT | /api/runs/:id | Update run |
| DELETE | /api/runs/:id | Delete run |
| GET | /api/ratings | List all ratings |
| GET | /api/ratings?run_id=xxx | Filter ratings by run |
| POST | /api/ratings | Create rating |
| GET | /api/notes | List condition notes |
| POST | /api/notes | Create note |
| GET | /api/comparisons | List comparisons |
| POST | /api/comparisons | Create comparison |
| GET | /health | Health check |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |
| PORT | Backend server port | No (default: 3001) |
| NODE_ENV | Environment (development/production) | No |
| VITE_API_URL | API URL for frontend | No (default: /api) |

## License

MIT License - Use freely for any purpose.
