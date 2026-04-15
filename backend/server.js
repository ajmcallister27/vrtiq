import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'express-async-errors';

import authRoutes from './src/routes/auth.js';
import entitiesRoutes from './src/routes/entities.js';
import integrationsRoutes from './src/routes/integrations.js';
import appsRoutes from './src/routes/apps.js';
import editRequestsRoutes from './src/routes/editRequests.js';
import { attachUser } from './src/middleware/auth.js';
import { notFoundHandler, errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// For endpoints that need auth user context
app.use(attachUser);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/entities', entitiesRoutes);
app.use('/api/v1/integrations', integrationsRoutes);
app.use('/api/v1/edit-requests', editRequestsRoutes);
app.use('/api/apps/public', appsRoutes);

// Catch-all
app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
