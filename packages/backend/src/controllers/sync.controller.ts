/**
 * Sync controller
 *
 * Handles synchronization endpoints for multi-device coordination
 */

import type { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../services/database';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { validateEncryptedVaultItem } from '@iforgotpassword/shared-validators';
import type {
  SyncPullRequest,
  SyncPullResponse,
  SyncPushRequest,
  SyncPushResponse,
  SyncChange,
  SyncConflict,
} from '@iforgotpassword/shared-types';
import logger from '../utils/logger';

/**
 * Pull changes from server since last sync version
 */
export async function pullChanges(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const data: SyncPullRequest = req.body;

    // Validate request
    if (!data.deviceId || typeof data.lastSyncVersion !== 'number') {
      throw new BadRequestError('Invalid sync pull request. deviceId and lastSyncVersion are required.');
    }

    const db = getDatabase();

    // Get the last sync timestamp for this device
    const syncMetadata = await db.getSyncMetadata(userId, data.deviceId);
    const lastSyncTimestamp = syncMetadata?.lastSyncAt || new Date(0);

    // Get items modified since last sync
    const items = await db.getVaultItems(userId, { since: lastSyncTimestamp });

    // Get deleted item IDs since last sync
    const deletedIds = await db.getDeletedVaultItems(userId, lastSyncTimestamp);

    // Get current sync version
    const currentVersion = await db.getCurrentSyncVersion(userId);

    // For Week 3-4, we'll do basic conflict detection (just report them)
    // More sophisticated conflict resolution will be in Month 3
    const conflicts: SyncConflict[] = [];

    // Update sync metadata
    await db.updateSyncMetadata(userId, data.deviceId, {
      lastSyncAt: new Date(),
      lastSyncVersion: currentVersion,
    });

    const response: SyncPullResponse = {
      items,
      deletedIds,
      currentVersion,
      conflicts,
    };

    logger.info(
      `Sync pull: User ${userId}, Device ${data.deviceId}, Items: ${items.length}, Deleted: ${deletedIds.length}`
    );

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Push batch of changes to server
 */
export async function pushChanges(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const data: SyncPushRequest = req.body;

    // Validate request
    if (!data.deviceId || !Array.isArray(data.changes)) {
      throw new BadRequestError('Invalid sync push request. deviceId and changes array are required.');
    }

    const db = getDatabase();
    const conflicts: SyncConflict[] = [];

    // Process each change
    for (const change of data.changes) {
      try {
        await processChange(userId, data.deviceId, change, db, conflicts);
      } catch (error) {
        // Log error but continue processing other changes
        logger.error(`Error processing sync change for user ${userId}:`, error);
        // Don't throw, continue with other changes
      }
    }

    // Get updated sync version
    const syncVersion = await db.getCurrentSyncVersion(userId);

    // Update sync metadata
    await db.updateSyncMetadata(userId, data.deviceId, {
      lastSyncAt: new Date(),
      lastSyncVersion: syncVersion,
    });

    const response: SyncPushResponse = {
      syncVersion,
      conflicts,
    };

    logger.info(
      `Sync push: User ${userId}, Device ${data.deviceId}, Changes: ${data.changes.length}, Conflicts: ${conflicts.length}`
    );

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Process a single sync change
 */
async function processChange(
  userId: string,
  deviceId: string,
  change: SyncChange,
  db: any,
  conflicts: SyncConflict[]
): Promise<void> {
  switch (change.action) {
    case 'create':
      if (!change.item) {
        throw new BadRequestError('Create action requires item data');
      }

      // Validate item
      const createValidation = validateEncryptedVaultItem(change.item);
      if (!createValidation.valid) {
        throw new BadRequestError('Validation failed for create', createValidation.errors);
      }

      await db.createVaultItem(userId, {
        ...change.item,
        lastModifiedBy: deviceId,
      });
      break;

    case 'update':
      if (!change.item || !change.itemId) {
        throw new BadRequestError('Update action requires item data and itemId');
      }

      // Check if item exists
      const existingItem = await db.getVaultItemById(userId, change.itemId);
      if (!existingItem) {
        throw new NotFoundError(`Vault item ${change.itemId} not found`);
      }

      // Check for version conflict
      if (change.version !== undefined && change.version !== existingItem.version) {
        conflicts.push({
          itemId: change.itemId,
          localVersion: change.version,
          remoteVersion: existingItem.version,
          remoteItem: existingItem,
          conflictType: 'version',
        });
        // Skip update on conflict
        break;
      }

      // Validate item
      const updateValidation = validateEncryptedVaultItem({
        ...change.item,
        itemType: existingItem.itemType,
      });
      if (!updateValidation.valid) {
        throw new BadRequestError('Validation failed for update', updateValidation.errors);
      }

      await db.updateVaultItem(userId, change.itemId, {
        ...change.item,
        lastModifiedBy: deviceId,
      });
      break;

    case 'delete':
      if (!change.itemId) {
        throw new BadRequestError('Delete action requires itemId');
      }

      // Check if item exists
      const itemToDelete = await db.getVaultItemById(userId, change.itemId);
      if (!itemToDelete) {
        // Item already deleted or doesn't exist, not an error
        logger.info(`Item ${change.itemId} already deleted or not found`);
        break;
      }

      await db.deleteVaultItem(userId, change.itemId);
      break;

    default:
      throw new BadRequestError(`Unknown sync action: ${(change as any).action}`);
  }
}
