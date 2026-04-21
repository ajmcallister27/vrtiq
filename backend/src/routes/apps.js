import express from 'express';
import { getPublicSettings } from '../controllers/apps.js';
import { attachUser } from '../middleware/auth.js';

const router = express.Router();

// Attach user information so we can enforce auth if required
router.use(attachUser);

router.get('/prod/public-settings/by-id/:id', getPublicSettings);

export default router;
