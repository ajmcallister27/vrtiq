import express from 'express';
import { createEditRequest, listPendingEditRequests, deleteEditRequest } from '../controllers/editRequests.js';
import { requireAuth, requireAdmin, attachUser } from '../middleware/auth.js';

const router = express.Router();

// Attach user if token is present; allow anonymous submissions
router.use(attachUser);

// Create a new pending edit request (no auth required)
router.post('/', createEditRequest);

// List pending edit requests (admin only)
router.get('/pending', requireAuth, requireAdmin, listPendingEditRequests);

// Delete an edit request (admin only)
router.delete('/:id', requireAuth, requireAdmin, deleteEditRequest);

export default router;
