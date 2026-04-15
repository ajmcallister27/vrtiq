import express from 'express';
import { listEntities, getEntityById, createEntity, updateEntity, deleteEntity } from '../controllers/entities.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// List / filter
router.get('/:entity', listEntities);
// Get by ID
router.get('/:entity/:id', getEntityById);

// Create (requires auth)
router.post('/:entity', requireAuth, createEntity);
// Update (requires auth)
router.put('/:entity/:id', requireAuth, updateEntity);
// Delete (requires auth)
router.delete('/:entity/:id', requireAuth, deleteEntity);

export default router;
