/**
 * Sync Service
 * Handles synchronization with the backend, conflict resolution, and offline queue management
 */

import type {
  VaultItem,
  SyncPullResponse,
  SyncPushResponse,
  SyncChange,
  SyncConflict,
} from '@iforgotpassword/shared-types';
import { indexedDB } from '../storage/indexedDB';
import { apiService } from './api';
import { localStorageService } from '../storage/localStorage';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

export interface SyncState {
  status: SyncStatus;
  lastSyncTime: number | null;
  isSyncing: boolean;
  error: string | null;
  queuedChanges: number;
}

class SyncService {
  private syncInProgress = false;
  private syncListeners: Set<(state: SyncState) => void> = new Set();
  private currentState: SyncState = {
    status: 'idle',
    lastSyncTime: null,
    isSyncing: false,
    error: null,
    queuedChanges: 0,
  };

  /**
   * Subscribe to sync state changes
   */
  subscribe(listener: (state: SyncState) => void): () => void {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.syncListeners.forEach((listener) => listener(this.currentState));
  }

  /**
   * Update sync state
   */
  private updateState(updates: Partial<SyncState>): void {
    this.currentState = { ...this.currentState, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current sync state
   */
  getState(): SyncState {
    return { ...this.currentState };
  }

  /**
   * Check if online
   */
  private isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Full sync: pull from server, push local changes, resolve conflicts
   */
  async fullSync(encryptionKey?: CryptoKey): Promise<void> {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping');
      return;
    }

    if (!this.isOnline()) {
      this.updateState({ status: 'offline', error: 'No internet connection' });
      return;
    }

    this.syncInProgress = true;
    this.updateState({ status: 'syncing', isSyncing: true, error: null });

    try {
      await indexedDB.init();

      // Step 1: Process offline queue first
      await this.processOfflineQueue();

      // Step 2: Pull changes from server
      await this.pullFromServer(encryptionKey);

      // Step 3: Push any remaining local changes
      await this.pushToServer();

      const queueCount = (await indexedDB.getSyncQueue()).length;
      this.updateState({
        status: 'idle',
        isSyncing: false,
        lastSyncTime: Date.now(),
        queuedChanges: queueCount,
      });
    } catch (error) {
      console.error('Sync failed:', error);
      this.updateState({
        status: 'error',
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      });
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Pull changes from server
   */
  private async pullFromServer(_encryptionKey?: CryptoKey): Promise<void> {
    try {
      const deviceId = await localStorageService.getDeviceId();
      const syncMetadata = await indexedDB.getSyncMetadata();
      const lastSyncVersion = syncMetadata?.lastSyncVersion || 0;

      const response = (await apiService.syncPull(
        deviceId,
        lastSyncVersion
      )) as any;

      const pullData = response.data as SyncPullResponse;

      // Handle deleted items
      if (pullData.deletedIds && pullData.deletedIds.length > 0) {
        for (const deletedId of pullData.deletedIds) {
          await indexedDB.deleteVaultItem(deletedId);
        }
      }

      // Handle modified/new items
      if (pullData.items && pullData.items.length > 0) {
        const conflicts: SyncConflict[] = [];

        for (const remoteItem of pullData.items) {
          const localItem = await indexedDB.getVaultItem(remoteItem.id);

          if (localItem && !localItem.deletedAt) {
            // Check for conflict
            const conflict = this.detectConflict(localItem, remoteItem);
            if (conflict) {
              // Resolve using last-write-wins
              const resolved = this.resolveConflictLastWriteWins(localItem, remoteItem);
              await indexedDB.saveVaultItem(resolved);
              conflicts.push({
                itemId: remoteItem.id,
                localVersion: localItem.version,
                remoteVersion: remoteItem.version,
                localItem,
                remoteItem,
                conflictType: 'version',
              });
            } else {
              // No conflict, save remote item
              await indexedDB.saveVaultItem(remoteItem);
            }
          } else {
            // New item or local was deleted, save remote item
            await indexedDB.saveVaultItem(remoteItem);
          }
        }

        if (conflicts.length > 0) {
          console.log(`Resolved ${conflicts.length} conflicts using last-write-wins`);
        }
      }

      // Update sync metadata
      await indexedDB.saveSyncMetadata({
        lastSyncVersion: pullData.currentVersion,
        lastSyncTimestamp: Date.now(),
        deviceId,
      });
    } catch (error) {
      console.error('Pull from server failed:', error);
      throw error;
    }
  }

  /**
   * Push changes to server
   */
  private async pushToServer(): Promise<void> {
    try {
      const queue = await indexedDB.getSyncQueue();

      if (queue.length === 0) {
        return;
      }

      const deviceId = await localStorageService.getDeviceId();
      const changes: SyncChange[] = [];

      // Convert queue items to sync changes
      for (const queueItem of queue) {
        if (queueItem.action === 'delete') {
          changes.push({
            action: 'delete',
            itemId: queueItem.itemId,
          });
        } else if (queueItem.action === 'create' || queueItem.action === 'update') {
          const item = await indexedDB.getVaultItem(queueItem.itemId);
          if (item) {
            changes.push({
              action: queueItem.action,
              itemId: queueItem.itemId,
              item,
              version: item.version,
            });
          }
        }
      }

      if (changes.length === 0) {
        // Clear queue if no valid changes
        await indexedDB.clearSyncQueue();
        return;
      }

      // Push to server
      const response = (await apiService.syncPush(deviceId, changes)) as any;
      const pushData = response.data as SyncPushResponse;

      // Handle conflicts from server
      if (pushData.conflicts && pushData.conflicts.length > 0) {
        console.log(`Server reported ${pushData.conflicts.length} conflicts`);
        for (const conflict of pushData.conflicts) {
          // Resolve conflicts and re-queue if needed
          const localItem = await indexedDB.getVaultItem(conflict.itemId);
          if (localItem) {
            const resolved = this.resolveConflictLastWriteWins(localItem, conflict.remoteItem);
            await indexedDB.saveVaultItem(resolved);
          }
        }
      }

      // Clear successfully synced items from queue
      for (const queueItem of queue) {
        await indexedDB.removeFromSyncQueue(queueItem.id);
      }

      // Update sync metadata
      const syncMetadata = await indexedDB.getSyncMetadata();
      if (syncMetadata) {
        await indexedDB.saveSyncMetadata({
          ...syncMetadata,
          lastSyncVersion: pushData.syncVersion,
          lastSyncTimestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('Push to server failed:', error);
      throw error;
    }
  }

  /**
   * Process offline queue (retry failed syncs)
   */
  private async processOfflineQueue(): Promise<void> {
    const queue = await indexedDB.getSyncQueue();
    const maxRetries = 3;

    // Remove items that have exceeded retry limit
    for (const item of queue) {
      if (item.retryCount >= maxRetries) {
        console.warn(`Queue item ${item.id} exceeded max retries, removing`);
        await indexedDB.removeFromSyncQueue(item.id);
      }
    }
  }

  /**
   * Queue a change for sync (used when offline or sync fails)
   */
  async queueChange(
    action: 'create' | 'update' | 'delete',
    itemId: string,
    itemData?: any
  ): Promise<void> {
    try {
      await indexedDB.init();
      await indexedDB.addToSyncQueue({
        action,
        itemId,
        itemData,
      });

      const queueCount = (await indexedDB.getSyncQueue()).length;
      this.updateState({ queuedChanges: queueCount });
    } catch (error) {
      console.error('Failed to queue change:', error);
    }
  }

  /**
   * Detect conflict between local and remote items
   */
  private detectConflict(localItem: VaultItem, remoteItem: VaultItem): boolean {
    // Check if versions differ
    if (localItem.version !== remoteItem.version) {
      return true;
    }

    // Check if both were modified since last sync
    const localModified = new Date(localItem.lastModifiedAt || localItem.updatedAt).getTime();
    const remoteModified = new Date(remoteItem.lastModifiedAt || remoteItem.updatedAt).getTime();

    // If timestamps are very close (within 1 second), no conflict
    if (Math.abs(localModified - remoteModified) < 1000) {
      return false;
    }

    // If local is newer but version is same, it's a conflict
    return localModified !== remoteModified;
  }

  /**
   * Resolve conflict using last-write-wins strategy
   */
  private resolveConflictLastWriteWins(
    localItem: VaultItem,
    remoteItem: VaultItem
  ): VaultItem {
    const localModified = new Date(localItem.lastModifiedAt || localItem.updatedAt).getTime();
    const remoteModified = new Date(remoteItem.lastModifiedAt || remoteItem.updatedAt).getTime();

    // Last write wins
    if (localModified > remoteModified) {
      console.log(`Conflict resolved: keeping local version of ${localItem.id}`);
      return localItem;
    } else {
      console.log(`Conflict resolved: keeping remote version of ${remoteItem.id}`);
      return remoteItem;
    }
  }

  /**
   * Sync a single item immediately (optimistic sync)
   */
  async syncItem(itemId: string, action: 'create' | 'update' | 'delete'): Promise<void> {
    console.log(`[SYNC] syncItem called: ${action} ${itemId}`);
    
    if (!this.isOnline()) {
      console.log('[SYNC] Offline, queuing change');
      await this.queueChange(action, itemId);
      return;
    }

    try {
      const deviceId = await localStorageService.getDeviceId();
      const change: SyncChange = {
        action,
        itemId,
      };

      if (action !== 'delete') {
        const item = await indexedDB.getVaultItem(itemId);
        if (item) {
          change.item = item;
          change.version = item.version;
          console.log('[SYNC] Pushing change to server:', { action, itemId, version: item.version });
        } else {
          console.warn('[SYNC] Item not found in IndexedDB:', itemId);
          return;
        }
      }

      const response = await apiService.syncPush(deviceId, [change]);
      console.log('[SYNC] Push successful:', response);
    } catch (error) {
      console.error('[SYNC] Failed to sync item, queuing for later:', error);
      await this.queueChange(action, itemId);
    }
  }

  /**
   * Get queued changes count
   */
  async getQueuedChangesCount(): Promise<number> {
    try {
      await indexedDB.init();
      const queue = await indexedDB.getSyncQueue();
      return queue.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Clear all sync data (for logout/reset)
   */
  async clearSyncData(): Promise<void> {
    await indexedDB.init();
    await indexedDB.clearSyncQueue();
    await indexedDB.saveSyncMetadata({
      lastSyncVersion: 0,
      lastSyncTimestamp: 0,
      deviceId: await localStorageService.getDeviceId(),
    });
    this.updateState({
      status: 'idle',
      lastSyncTime: null,
      isSyncing: false,
      error: null,
      queuedChanges: 0,
    });
  }
}

export const syncService = new SyncService();
