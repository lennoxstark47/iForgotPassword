/**
 * API routes
 */

import { Router, type IRouter } from 'express';
import authRoutes from './auth.routes';
import vaultRoutes from './vault.routes';
import syncRoutes from './sync.routes';
import { API_BASE_PATH } from '@iforgotpassword/shared-constants';

const router: IRouter = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health check
 *     description: Returns the health status of the API server
 *     security: []
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
router.use(`${API_BASE_PATH}/auth`, authRoutes);
router.use(`${API_BASE_PATH}/vault`, vaultRoutes);
router.use(`${API_BASE_PATH}/sync`, syncRoutes);

export default router;
