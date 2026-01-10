/**
 * IndexedDB Storage Service
 * Stores encrypted vault items locally for offline access and sync
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { VaultItem } from '@iforgotpassword/shared-types';

const DB_NAME = 'iforgotpassword';
const DB_VERSION = 1;

// Store names
const VAULT_STORE = 'vault';
const SYNC_STORE = 'sync';
const METADATA_STORE = 'metadata';

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

class IndexedDBService {
  private db: IDBPDatabase | null = null;

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<void> {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
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
