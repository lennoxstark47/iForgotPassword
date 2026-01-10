/**
 * Base database adapter interface
 *
 * This abstract class defines the interface that all database adapters must implement.
 * This allows the application to support multiple database types (PostgreSQL, MySQL, MongoDB, etc.)
 */

import type {
  User,
  VaultItem,
  RegisterRequest,
  SyncMetadata,
} from '@iforgotpassword/shared-types';

export abstract class DatabaseAdapter {
  /**
   * Connect to the database
   */
  abstract connect(config?: unknown): Promise<void>;

  /**
   * Disconnect from the database
   */
  abstract disconnect(): Promise<void>;

  /**
   * Check if database connection is healthy
   */
  abstract healthCheck(): Promise<boolean>;

  // User operations
  abstract createUser(data: RegisterRequest): Promise<User>;
  abstract getUserByEmail(email: string): Promise<User | null>;
  abstract getUserById(userId: string): Promise<User | null>;
  abstract updateUser(userId: string, data: Partial<User>): Promise<User>;
  abstract deleteUser(userId: string): Promise<void>;

  // Vault operations
  abstract createVaultItem(userId: string, data: Partial<VaultItem>): Promise<VaultItem>;
  abstract getVaultItems(
    userId: string,
    options?: { since?: Date; limit?: number; offset?: number }
  ): Promise<VaultItem[]>;
  abstract getVaultItemById(userId: string, itemId: string): Promise<VaultItem | null>;
  abstract updateVaultItem(
    userId: string,
    itemId: string,
    data: Partial<VaultItem>
  ): Promise<VaultItem>;
  abstract deleteVaultItem(userId: string, itemId: string): Promise<void>;
  abstract getDeletedVaultItems(userId: string, since: Date): Promise<string[]>;

  // Sync operations
  abstract getSyncMetadata(userId: string, deviceId: string): Promise<SyncMetadata | null>;
  abstract updateSyncMetadata(
    userId: string,
    deviceId: string,
    data: Partial<SyncMetadata>
  ): Promise<SyncMetadata>;
  abstract getCurrentSyncVersion(userId: string): Promise<number>;
}
