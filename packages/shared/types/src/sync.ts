/**
 * Synchronization types
 */

import { VaultItem } from './vault';

/**
 * Device types
 */
export type DeviceType = 'browser' | 'ios' | 'android' | 'desktop' | 'web';

/**
 * Sync metadata for a device
 */
export interface SyncMetadata {
  id: string;
  userId: string;
  deviceId: string;
  deviceName?: string;
  deviceType: DeviceType;
  lastSyncAt?: Date;
  lastSyncVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Sync action types
 */
export type SyncAction = 'create' | 'update' | 'delete';

/**
 * Sync change item
 */
export interface SyncChange {
  action: SyncAction;
  item?: VaultItem;
  itemId?: string; // For delete operations
  version?: number; // For optimistic locking
}

/**
 * Sync pull request
 */
export interface SyncPullRequest {
  lastSyncVersion: number;
  deviceId: string;
}

/**
 * Sync pull response
 */
export interface SyncPullResponse {
  items: VaultItem[];
  deletedIds: string[];
  currentVersion: number;
  conflicts: SyncConflict[];
}

/**
 * Sync push request
 */
export interface SyncPushRequest {
  deviceId: string;
  changes: SyncChange[];
}

/**
 * Sync push response
 */
export interface SyncPushResponse {
  syncVersion: number;
  conflicts: SyncConflict[];
}

/**
 * Sync conflict
 */
export interface SyncConflict {
  itemId: string;
  localVersion: number;
  remoteVersion: number;
  localItem?: VaultItem;
  remoteItem: VaultItem;
  conflictType: 'version' | 'deleted';
}

/**
 * Conflict resolution strategy
 */
export type ConflictResolution = 'use-local' | 'use-remote' | 'merge';

/**
 * Resolved conflict
 */
export interface ResolvedConflict {
  itemId: string;
  resolution: ConflictResolution;
  resolvedItem?: VaultItem;
}
