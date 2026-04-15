import express from 'express';
import { login, signup, me, updateMe, inviteUser, logout } from '../controllers/auth.js';
import { attachUser, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Apply user attachment for all auth routes so we can respond with anonymous if no token is present
router.use(attachUser);

router.post('/login', login);
router.post('/signup', signup);
router.get('/me', requireAuth, me);
router.put('/me', requireAuth, updateMe);
router.post('/invite', requireAuth, inviteUser);
router.post('/logout', requireAuth, logout);

export default router;
