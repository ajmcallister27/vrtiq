# Whiteout Backend

Express.js + Prisma + PostgreSQL API server.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your database URL

npx prisma migrate deploy
npx prisma db seed
npm run dev
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Open Prisma database GUI
