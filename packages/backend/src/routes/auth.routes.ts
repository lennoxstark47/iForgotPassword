/**
 * Authentication routes
 */

import { Router, type IRouter } from 'express';
import { register, login, refreshToken } from '../controllers/auth.controller';
import { loginLimiter, registrationLimiter } from '../middleware/ratelimit.middleware';

const router: IRouter = Router();

router.post('/register', registrationLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refreshToken);

export default router;
