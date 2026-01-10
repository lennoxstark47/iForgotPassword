/**
 * Vault routes
 */

import { Router, type IRouter } from 'express';
import {
  getVaultItems,
  getVaultItem,
  createVaultItem,
  updateVaultItem,
  deleteVaultItem,
} from '../controllers/vault.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: IRouter = Router();

// All vault routes require authentication
router.use(authenticate);

router.get('/items', getVaultItems);
router.get('/items/:id', getVaultItem);
router.post('/items', createVaultItem);
router.put('/items/:id', updateVaultItem);
router.delete('/items/:id', deleteVaultItem);

export default router;
