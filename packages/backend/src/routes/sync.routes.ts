/**
 * Sync routes
 */

import { Router, type IRouter } from 'express';
import { pullChanges, pushChanges } from '../controllers/sync.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: IRouter = Router();

/**
 * @swagger
 * /sync/pull:
 *   post:
 *     tags:
 *       - Sync
 *     summary: Pull changes from server
 *     description: Get all vault items and deletions since last sync version (delta sync)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *               - lastSyncVersion
 *             properties:
 *               deviceId:
 *                 type: string
 *                 format: uuid
 *                 description: Unique device identifier
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               lastSyncVersion:
 *                 type: number
 *                 description: Last sync version this device has
 *                 example: 120
 *     responses:
 *       200:
 *         description: Sync pull successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       description: Modified vault items since last sync
 *                       items:
 *                         $ref: '#/components/schemas/VaultItem'
 *                     deletedIds:
 *                       type: array
 *                       description: IDs of items deleted since last sync
 *                       items:
 *                         type: string
 *                       example: ["uuid1", "uuid2"]
 *                     currentVersion:
 *                       type: number
 *                       description: Current sync version on server
 *                       example: 125
 *                     conflicts:
 *                       type: array
 *                       description: Detected conflicts (empty for basic sync)
 *                       items:
 *                         type: object
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/pull', authenticate, pullChanges);

/**
 * @swagger
 * /sync/push:
 *   post:
 *     tags:
 *       - Sync
 *     summary: Push batch of changes to server
 *     description: Send multiple create/update/delete operations in a single request
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *               - changes
 *             properties:
 *               deviceId:
 *                 type: string
 *                 format: uuid
 *                 description: Unique device identifier
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               changes:
 *                 type: array
 *                 description: Array of changes to apply
 *                 items:
 *                   type: object
 *                   required:
 *                     - action
 *                   properties:
 *                     action:
 *                       type: string
 *                       enum: [create, update, delete]
 *                       description: Type of operation
 *                     item:
 *                       description: Vault item data (required for create/update)
 *                       type: object
 *                     itemId:
 *                       type: string
 *                       description: Item ID (required for update/delete)
 *                     version:
 *                       type: number
 *                       description: Current version (for optimistic locking on update)
 *                 example:
 *                   - action: create
 *                     item:
 *                       encryptedData: "base64..."
 *                       encryptedKey: "base64..."
 *                       iv: "base64..."
 *                       authTag: "base64..."
 *                       itemType: "login"
 *                   - action: update
 *                     itemId: "uuid-123"
 *                     version: 1
 *                     item:
 *                       encryptedData: "base64..."
 *                       encryptedKey: "base64..."
 *                       iv: "base64..."
 *                       authTag: "base64..."
 *                   - action: delete
 *                     itemId: "uuid-456"
 *     responses:
 *       200:
 *         description: Sync push successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     syncVersion:
 *                       type: number
 *                       description: New sync version after push
 *                       example: 126
 *                     conflicts:
 *                       type: array
 *                       description: Detected conflicts during push
 *                       items:
 *                         type: object
 *                         properties:
 *                           itemId:
 *                             type: string
 *                           localVersion:
 *                             type: number
 *                           remoteVersion:
 *                             type: number
 *                           conflictType:
 *                             type: string
 *                             enum: [version, deleted]
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/push', authenticate, pushChanges);

export default router;
