import { Router } from 'express';
import { register, login, me, googleRedirect, googleCallback } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, me);
router.get('/google', googleRedirect);
router.get('/google/callback', googleCallback);

export default router;