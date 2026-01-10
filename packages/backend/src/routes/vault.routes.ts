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

/**
 * @swagger
 * /vault/items:
 *   get:
 *     tags:
 *       - Vault
 *     summary: Get all vault items
 *     description: Retrieves all encrypted vault items for the authenticated user. Supports pagination and delta sync.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 1000
 *         description: Maximum number of items to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *       - in: query
 *         name: since
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Only return items modified after this timestamp (for delta sync)
 *     responses:
 *       200:
 *         description: Successfully retrieved vault items
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
 *                       items:
 *                         $ref: '#/components/schemas/VaultItem'
 *                     syncVersion:
 *                       type: integer
 *                       example: 125
 *                     hasMore:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/items', getVaultItems);

/**
 * @swagger
 * /vault/items/{id}:
 *   get:
 *     tags:
 *       - Vault
 *     summary: Get a specific vault item
 *     description: Retrieves a single encrypted vault item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vault item ID
 *     responses:
 *       200:
 *         description: Successfully retrieved vault item
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/VaultItem'
 *       404:
 *         description: Vault item not found
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
router.get('/items/:id', getVaultItem);

/**
 * @swagger
 * /vault/items:
 *   post:
 *     tags:
 *       - Vault
 *     summary: Create a new vault item
 *     description: Creates a new encrypted vault item (login, card, note, or identity)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVaultItemRequest'
 *     responses:
 *       201:
 *         description: Vault item created successfully
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     version:
 *                       type: integer
 *                       example: 1
 *                     syncVersion:
 *                       type: integer
 *                       example: 126
 *       400:
 *         description: Invalid request data
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
router.post('/items', createVaultItem);

/**
 * @swagger
 * /vault/items/{id}:
 *   put:
 *     tags:
 *       - Vault
 *     summary: Update a vault item
 *     description: Updates an existing encrypted vault item with optimistic locking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vault item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVaultItemRequest'
 *     responses:
 *       200:
 *         description: Vault item updated successfully
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
 *                     version:
 *                       type: integer
 *                       example: 2
 *                     syncVersion:
 *                       type: integer
 *                       example: 127
 *       404:
 *         description: Vault item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - Version mismatch (optimistic locking)
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
router.put('/items/:id', updateVaultItem);

/**
 * @swagger
 * /vault/items/{id}:
 *   delete:
 *     tags:
 *       - Vault
 *     summary: Delete a vault item
 *     description: Soft deletes a vault item (marks as deleted for sync purposes)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Vault item ID
 *     responses:
 *       200:
 *         description: Vault item deleted successfully
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
 *                     message:
 *                       type: string
 *                       example: Vault item deleted successfully
 *                     syncVersion:
 *                       type: integer
 *                       example: 128
 *       404:
 *         description: Vault item not found
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
router.delete('/items/:id', deleteVaultItem);

export default router;
