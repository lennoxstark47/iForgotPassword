/**
 * IndexedDB Storage Service
 * Stores encrypted vault items locally for offline access and sync
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { VaultItem } from '@iforgotpassword/shared-types';

const DB_NAME = 'iforgotpassword';
const DB_VERSION = 2;

// Store names
const VAULT_STORE = 'vault';
const SYNC_STORE = 'sync';
const METADATA_STORE = 'metadata';
const SYNC_QUEUE_STORE = 'sync_queue';

interface SyncMetadata {
  lastSyncVersion: number;
  lastSyncTimestamp: number;
  deviceId: string;
}

interface VaultMetadata {
  userId: string;
  email: string;
  vaultVersion: number;
  lastModified: number;
}

export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  itemId: string;
  itemData?: any;
  timestamp: number;
  retryCount: number;
}

class IndexedDBService {
  private db: IDBPDatabase | null = null;

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<void> {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Vault items store
        if (!db.objectStoreNames.contains(VAULT_STORE)) {
          const vaultStore = db.createObjectStore(VAULT_STORE, { keyPath: 'id' });
          vaultStore.createIndex('type', 'type');
          vaultStore.createIndex('createdAt', 'createdAt');
          vaultStore.createIndex('updatedAt', 'updatedAt');
          vaultStore.createIndex('deleted', 'deleted');
        }

        // Sync metadata store
        if (!db.objectStoreNames.contains(SYNC_STORE)) {
          db.createObjectStore(SYNC_STORE, { keyPath: 'key' });
        }

        // General metadata store
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          db.createObjectStore(METADATA_STORE, { keyPath: 'key' });
        }

        // Sync queue store (added in version 2)
        if (oldVersion < 2 && !db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
          const queueStore = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' });
          queueStore.createIndex('timestamp', 'timestamp');
          queueStore.createIndex('action', 'action');
        }
      },
    });
  }

  /**
   * Get the database instance
   */
  private getDB(): IDBPDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  // ==================== Vault Items ====================

  /**
   * Get all vault items (excluding soft-deleted)
   */
  async getAllVaultItems(): Promise<VaultItem[]> {
    const db = this.getDB();
    const allItems = await db.getAll(VAULT_STORE);
    return allItems.filter((item) => !item.deleted);
  }

  /**
   * Get a single vault item by ID
   */
  async getVaultItem(id: string): Promise<VaultItem | undefined> {
    const db = this.getDB();
    return db.get(VAULT_STORE, id);
  }

  /**
   * Save a vault item (create or update)
   */
  async saveVaultItem(item: VaultItem): Promise<void> {
    const db = this.getDB();
    await db.put(VAULT_STORE, item);
  }

  /**
   * Save multiple vault items (batch operation)
   */
  async saveVaultItems(items: VaultItem[]): Promise<void> {
    const db = this.getDB();
    const tx = db.transaction(VAULT_STORE, 'readwrite');

    await Promise.all([
      ...items.map((item) => tx.store.put(item)),
      tx.done,
    ]);
  }

  /**
   * Soft delete a vault item
   */
  async deleteVaultItem(id: string): Promise<void> {
    const db = this.getDB();
    const item = await db.get(VAULT_STORE, id);

    if (item) {
      item.deleted = true;
      item.updatedAt = Date.now();
      await db.put(VAULT_STORE, item);
    }
  }

  /**
   * Permanently delete a vault item
   */
  async permanentlyDeleteVaultItem(id: string): Promise<void> {
    const db = this.getDB();
    await db.delete(VAULT_STORE, id);
  }

  /**
   * Clear all vault items
   */
  async clearVault(): Promise<void> {
    const db = this.getDB();
    await db.clear(VAULT_STORE);
  }

  // ==================== Sync Metadata ====================

  /**
   * Get sync metadata
   */
  async getSyncMetadata(): Promise<SyncMetadata | undefined> {
    const db = this.getDB();
    return db.get(SYNC_STORE, 'sync');
  }

  /**
   * Save sync metadata
   */
  async saveSyncMetadata(metadata: SyncMetadata): Promise<void> {
    const db = this.getDB();
    await db.put(SYNC_STORE, { key: 'sync', ...metadata });
  }

  // ==================== Vault Metadata ====================

  /**
   * Get vault metadata
   */
  async getVaultMetadata(): Promise<VaultMetadata | undefined> {
    const db = this.getDB();
    return db.get(METADATA_STORE, 'vault');
  }

  /**
   * Save vault metadata
   */
  async saveVaultMetadata(metadata: VaultMetadata): Promise<void> {
    const db = this.getDB();
    await db.put(METADATA_STORE, { key: 'vault', ...metadata });
  }

  // ==================== Sync Queue ====================

  /**
   * Add an item to the sync queue
   */
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const db = this.getDB();
    const queueItem: SyncQueueItem = {
      ...item,
      id: `${item.action}_${item.itemId}_${Date.now()}`,
      timestamp: Date.now(),
      retryCount: 0,
    };
    await db.put(SYNC_QUEUE_STORE, queueItem);
  }

  /**
   * Get all items in the sync queue
   */
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const db = this.getDB();
    return db.getAll(SYNC_QUEUE_STORE);
  }

  /**
   * Remove an item from the sync queue
   */
  async removeFromSyncQueue(id: string): Promise<void> {
    const db = this.getDB();
    await db.delete(SYNC_QUEUE_STORE, id);
  }

  /**
   * Clear the sync queue
   */
  async clearSyncQueue(): Promise<void> {
    const db = this.getDB();
    await db.clear(SYNC_QUEUE_STORE);
  }

  /**
   * Increment retry count for a queue item
   */
  async incrementQueueRetryCount(id: string): Promise<void> {
    const db = this.getDB();
    const item = await db.get(SYNC_QUEUE_STORE, id);
    if (item) {
      item.retryCount += 1;
      await db.put(SYNC_QUEUE_STORE, item);
    }
  }

  // ==================== Cleanup ====================

  /**
   * Clear all data from the database
   */
  async clearAll(): Promise<void> {
    const db = this.getDB();
    await Promise.all([
      db.clear(VAULT_STORE),
      db.clear(SYNC_STORE),
      db.clear(METADATA_STORE),
      db.clear(SYNC_QUEUE_STORE),
    ]);
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Export singleton instance
export const indexedDB = new IndexedDBService();
