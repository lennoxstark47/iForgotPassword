/**
 * API routes
 */

import { Router, type IRouter } from 'express';
import authRoutes from './auth.routes';
import vaultRoutes from './vault.routes';
import { API_BASE_PATH } from '@iforgotpassword/shared-constants';

const router: IRouter = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
router.use(`${API_BASE_PATH}/auth`, authRoutes);
router.use(`${API_BASE_PATH}/vault`, vaultRoutes);

export default router;
