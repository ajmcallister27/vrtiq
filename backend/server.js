import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';

import authRoutes from './src/routes/auth.js';
import entitiesRoutes from './src/routes/entities.js';
import integrationsRoutes from './src/routes/integrations.js';
import appsRoutes from './src/routes/apps.js';
import editRequestsRoutes from './src/routes/editRequests.js';
import { attachUser } from './src/middleware/auth.js';
import { notFoundHandler, errorHandler } from './src/middleware/errorHandler.js';
import prisma from './src/prismaClient.js';
import { appConfig } from './src/config/env.js';
import { authRateLimiter, mutationRateLimiter } from './src/middleware/rateLimit.js';

let isShuttingDown = false;

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = new Set(appConfig.corsAllowedOrigins);
function corsOrigin(origin, callback) {
  if (!origin) {
    callback(null, true);
    return;
  }

  if (allowedOrigins.has(origin)) {
    callback(null, true);
    return;
  }

  const corsError = new Error('Origin is not allowed by CORS policy');
  corsError.statusCode = 403;
  callback(corsError);
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));
app.use(express.json({ limit: appConfig.bodyJsonLimit }));
app.use(express.urlencoded({ extended: true, limit: appConfig.bodyUrlEncodedLimit }));

// Liveness endpoint: process can handle requests.
app.get('/health/live', (req, res) => {
  res.json({ status: 'ok', uptime_seconds: Math.round(process.uptime()), shutting_down: isShuttingDown });
});

// Backward-compatible health endpoint.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime_seconds: Math.round(process.uptime()), shutting_down: isShuttingDown });
});

// Readiness endpoint: confirms DB connectivity and shutdown state.
app.get('/health/ready', async (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({ status: 'degraded', reason: 'server_shutting_down' });
  }

  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    return res.json({ status: 'ready' });
  } catch (error) {
    return res.status(503).json({ status: 'degraded', reason: 'database_unavailable' });
  }
});

app.use('/api/v1/auth', authRateLimiter);
app.use('/api/v1/entities', mutationRateLimiter);
app.use('/api/v1/integrations', mutationRateLimiter);
app.use('/api/v1/edit-requests', mutationRateLimiter);

// For endpoints that need auth user context
app.use(attachUser);

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/entities', entitiesRoutes);
app.use('/api/v1/integrations', integrationsRoutes);
app.use('/api/v1/edit-requests', editRequestsRoutes);
app.use('/api/apps/public', appsRoutes);

// Catch-all
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(appConfig.port, () => {
  console.log(`Backend running on http://localhost:${appConfig.port} (${appConfig.nodeEnv})`);
});

async function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`${signal} received. Starting graceful shutdown...`);

  const forceExitTimer = setTimeout(() => {
    console.error('Graceful shutdown timeout exceeded. Forcing exit.');
    process.exit(1);
  }, 10_000);
  forceExitTimer.unref();

  server.close(async (serverCloseError) => {
    try {
      await prisma.$disconnect();
    } catch (prismaDisconnectError) {
      console.error('Error while disconnecting Prisma during shutdown:', prismaDisconnectError);
    } finally {
      clearTimeout(forceExitTimer);
      if (serverCloseError) {
        console.error('HTTP server close failed:', serverCloseError);
        process.exit(1);
      }

      console.log('Graceful shutdown complete.');
      process.exit(0);
    }
  });
}

process.on('SIGINT', () => {
  shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  shutdown('uncaughtException');
});
