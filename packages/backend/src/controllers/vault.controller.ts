/**
 * Vault controller
 */

import type { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../services/database';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { validateEncryptedVaultItem } from '@iforgotpassword/shared-validators';
import type { CreateVaultItemRequest, UpdateVaultItemRequest } from '@iforgotpassword/shared-types';
import { DEFAULT_PAGINATION_LIMIT, MAX_PAGINATION_LIMIT } from '@iforgotpassword/shared-constants';
import logger from '../utils/logger';

/**
 * Get all vault items for the authenticated user
 */
export async function getVaultItems(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const limit = Math.min(
      parseInt(req.query.limit as string) || DEFAULT_PAGINATION_LIMIT,
      MAX_PAGINATION_LIMIT
    );
    const offset = parseInt(req.query.offset as string) || 0;
    const since = req.query.since ? new Date(req.query.since as string) : undefined;

    const db = getDatabase();
    const items = await db.getVaultItems(userId, { since, limit, offset });
    const syncVersion = await db.getCurrentSyncVersion(userId);

    res.json({
      success: true,
      data: {
        items,
        syncVersion,
        hasMore: items.length === limit,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single vault item
 */
export async function getVaultItem(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const itemId = req.params.id;

    const db = getDatabase();
    const item = await db.getVaultItemById(userId, itemId);

    if (!item) {
      throw new NotFoundError('Vault item not found');
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new vault item
 */
export async function createVaultItem(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const data: CreateVaultItemRequest = req.body;

    // Validate input
    const validation = validateEncryptedVaultItem(data);
    if (!validation.valid) {
      throw new BadRequestError('Validation failed', validation.errors);
    }

    const db = getDatabase();

    // Create vault item
    const item = await db.createVaultItem(userId, {
      ...data,
      lastModifiedBy: req.body.deviceId || 'unknown',
    });

    const syncVersion = await db.getCurrentSyncVersion(userId);

    logger.info(`Vault item created: ${item.id} for user: ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        id: item.id,
        version: item.version,
        syncVersion,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a vault item
 */
export async function updateVaultItem(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const itemId = req.params.id;
    const data: UpdateVaultItemRequest = req.body;

    // Validate input
    const validation = validateEncryptedVaultItem({ ...data, itemType: 'login' });
    if (!validation.valid) {
      throw new BadRequestError('Validation failed', validation.errors);
    }

    const db = getDatabase();

    // Check if item exists
    const existingItem = await db.getVaultItemById(userId, itemId);
    if (!existingItem) {
      throw new NotFoundError('Vault item not found');
    }

    // Check version for optimistic locking
    if (data.version !== existingItem.version) {
      throw new BadRequestError('Version conflict. Please refresh and try again.');
    }

    // Update vault item
    const item = await db.updateVaultItem(userId, itemId, {
      ...data,
      lastModifiedBy: req.body.deviceId || 'unknown',
    });

    const syncVersion = await db.getCurrentSyncVersion(userId);

    logger.info(`Vault item updated: ${itemId} for user: ${userId}`);

    res.json({
      success: true,
      data: {
        version: item.version,
        syncVersion,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a vault item
 */
export async function deleteVaultItem(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const itemId = req.params.id;

    const db = getDatabase();

    // Check if item exists
    const existingItem = await db.getVaultItemById(userId, itemId);
    if (!existingItem) {
      throw new NotFoundError('Vault item not found');
    }

    // Soft delete the item
    await db.deleteVaultItem(userId, itemId);

    const syncVersion = await db.getCurrentSyncVersion(userId);

    logger.info(`Vault item deleted: ${itemId} for user: ${userId}`);

    res.json({
      success: true,
      data: {
        syncVersion,
      },
    });
  } catch (error) {
    next(error);
  }
}
