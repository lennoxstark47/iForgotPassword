/**
 * PostgreSQL database adapter
 */

import { Pool } from 'pg';
import { DatabaseAdapter } from './base.adapter';
import type {
  User,
  VaultItem,
  RegisterRequest,
  SyncMetadata,
} from '@iforgotpassword/shared-types';
import { config } from '../../../config';
import logger from '../../../utils/logger';

export class PostgreSQLAdapter extends DatabaseAdapter {
  private pool: Pool | null = null;

  async connect(customConfig?: unknown): Promise<void> {
    const dbConfig = customConfig || config.database;

    this.pool = new Pool({
      host: (dbConfig as typeof config.database).host,
      port: (dbConfig as typeof config.database).port,
      database: (dbConfig as typeof config.database).name,
      user: (dbConfig as typeof config.database).user,
      password: (dbConfig as typeof config.database).password,
      ssl: (dbConfig as typeof config.database).ssl
        ? { rejectUnauthorized: false }
        : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    try {
      const client = await this.pool.connect();
      client.release();
      logger.info('PostgreSQL database connected successfully');
    } catch (error) {
      logger.error('Failed to connect to PostgreSQL database:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      logger.info('PostgreSQL database disconnected');
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.pool) return false;

    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch {
      return false;
    }
  }

  private getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.pool;
  }

  // User operations
  async createUser(data: RegisterRequest): Promise<User> {
    const pool = this.getPool();

    const query = `
      INSERT INTO users (email, auth_key_hash, salt, kdf_iterations, kdf_algorithm)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [data.email, data.authKey, data.salt, data.kdfIterations, data.kdfAlgorithm];

    const result = await pool.query(query, values);
    return this.mapUserFromDB(result.rows[0]);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const pool = this.getPool();

    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) return null;

    return this.mapUserFromDB(result.rows[0]);
  }

  async getUserById(userId: string): Promise<User | null> {
    const pool = this.getPool();

    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) return null;

    return this.mapUserFromDB(result.rows[0]);
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const pool = this.getPool();

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.lastLoginAt) {
      updates.push(`last_login_at = $${paramIndex++}`);
      values.push(data.lastLoginAt);
    }

    if (data.failedLoginAttempts !== undefined) {
      updates.push(`failed_login_attempts = $${paramIndex++}`);
      values.push(data.failedLoginAttempts);
    }

    if (data.lockedUntil !== undefined) {
      updates.push(`locked_until = $${paramIndex++}`);
      values.push(data.lockedUntil);
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return this.mapUserFromDB(result.rows[0]);
  }

  async deleteUser(userId: string): Promise<void> {
    const pool = this.getPool();

    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  }

  // Vault operations
  async createVaultItem(userId: string, data: Partial<VaultItem>): Promise<VaultItem> {
    const pool = this.getPool();

    const query = `
      INSERT INTO vault_items (
        user_id, encrypted_data, encrypted_key, iv, auth_tag,
        item_type, url_domain, folder_id, last_modified_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      userId,
      data.encryptedData,
      data.encryptedKey,
      data.iv,
      data.authTag,
      data.itemType,
      data.urlDomain || null,
      data.folderId || null,
      data.lastModifiedBy,
    ];

    const result = await pool.query(query, values);
    return this.mapVaultItemFromDB(result.rows[0]);
  }

  async getVaultItems(
    userId: string,
    options?: { since?: Date; limit?: number; offset?: number }
  ): Promise<VaultItem[]> {
    const pool = this.getPool();

    let query = 'SELECT * FROM vault_items WHERE user_id = $1 AND deleted_at IS NULL';
    const values: unknown[] = [userId];
    let paramIndex = 2;

    if (options?.since) {
      query += ` AND last_modified_at > $${paramIndex++}`;
      values.push(options.since);
    }

    query += ' ORDER BY last_modified_at DESC';

    if (options?.limit) {
      query += ` LIMIT $${paramIndex++}`;
      values.push(options.limit);
    }

    if (options?.offset) {
      query += ` OFFSET $${paramIndex++}`;
      values.push(options.offset);
    }

    const result = await pool.query(query, values);
    return result.rows.map(this.mapVaultItemFromDB);
  }

  async getVaultItemById(userId: string, itemId: string): Promise<VaultItem | null> {
    const pool = this.getPool();

    const query = 'SELECT * FROM vault_items WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL';
    const result = await pool.query(query, [itemId, userId]);

    if (result.rows.length === 0) return null;

    return this.mapVaultItemFromDB(result.rows[0]);
  }

  async updateVaultItem(
    userId: string,
    itemId: string,
    data: Partial<VaultItem>
  ): Promise<VaultItem> {
    const pool = this.getPool();

    const query = `
      UPDATE vault_items
      SET
        encrypted_data = COALESCE($1, encrypted_data),
        encrypted_key = COALESCE($2, encrypted_key),
        iv = COALESCE($3, iv),
        auth_tag = COALESCE($4, auth_tag),
        url_domain = COALESCE($5, url_domain),
        folder_id = COALESCE($6, folder_id),
        version = version + 1,
        last_modified_at = NOW(),
        last_modified_by = $7,
        updated_at = NOW()
      WHERE id = $8 AND user_id = $9 AND deleted_at IS NULL
      RETURNING *
    `;

    const values = [
      data.encryptedData,
      data.encryptedKey,
      data.iv,
      data.authTag,
      data.urlDomain,
      data.folderId,
      data.lastModifiedBy,
      itemId,
      userId,
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Vault item not found or already deleted');
    }

    return this.mapVaultItemFromDB(result.rows[0]);
  }

  async deleteVaultItem(userId: string, itemId: string): Promise<void> {
    const pool = this.getPool();

    const query = `
      UPDATE vault_items
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    `;

    await pool.query(query, [itemId, userId]);
  }

  async getDeletedVaultItems(userId: string, since: Date): Promise<string[]> {
    const pool = this.getPool();

    const query = `
      SELECT id FROM vault_items
      WHERE user_id = $1 AND deleted_at > $2
    `;

    const result = await pool.query(query, [userId, since]);
    return result.rows.map((row) => row.id);
  }

  // Sync operations
  async getSyncMetadata(userId: string, deviceId: string): Promise<SyncMetadata | null> {
    const pool = this.getPool();

    const query = 'SELECT * FROM sync_metadata WHERE user_id = $1 AND device_id = $2';
    const result = await pool.query(query, [userId, deviceId]);

    if (result.rows.length === 0) return null;

    return this.mapSyncMetadataFromDB(result.rows[0]);
  }

  async updateSyncMetadata(
    userId: string,
    deviceId: string,
    data: Partial<SyncMetadata>
  ): Promise<SyncMetadata> {
    const pool = this.getPool();

    const query = `
      INSERT INTO sync_metadata (user_id, device_id, device_name, device_type, last_sync_at, last_sync_version)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, device_id)
      DO UPDATE SET
        device_name = COALESCE($3, sync_metadata.device_name),
        device_type = COALESCE($4, sync_metadata.device_type),
        last_sync_at = COALESCE($5, sync_metadata.last_sync_at),
        last_sync_version = COALESCE($6, sync_metadata.last_sync_version),
        updated_at = NOW()
      RETURNING *
    `;

    const values = [
      userId,
      deviceId,
      data.deviceName || null,
      data.deviceType || null,
      data.lastSyncAt || new Date(),
      data.lastSyncVersion || 0,
    ];

    const result = await pool.query(query, values);
    return this.mapSyncMetadataFromDB(result.rows[0]);
  }

  async getCurrentSyncVersion(userId: string): Promise<number> {
    const pool = this.getPool();

    const query = `
      SELECT COALESCE(MAX(version), 0) as max_version
      FROM vault_items
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].max_version, 10);
  }

  // Mapping functions
  private mapUserFromDB(row: any): User {
    return {
      id: row.id,
      email: row.email,
      authKeyHash: row.auth_key_hash,
      salt: row.salt,
      kdfIterations: row.kdf_iterations,
      kdfAlgorithm: row.kdf_algorithm,
      customDbConfig: row.custom_db_config,
      isSelfHosted: row.is_self_hosted,
      emailVerified: row.email_verified,
      twoFactorEnabled: row.two_factor_enabled,
      twoFactorSecret: row.two_factor_secret,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at,
      failedLoginAttempts: row.failed_login_attempts,
      lockedUntil: row.locked_until,
    };
  }

  private mapVaultItemFromDB(row: any): VaultItem {
    return {
      id: row.id,
      userId: row.user_id,
      encryptedData: row.encrypted_data,
      encryptedKey: row.encrypted_key,
      iv: row.iv,
      authTag: row.auth_tag,
      itemType: row.item_type,
      titleEncrypted: row.title_encrypted,
      urlDomain: row.url_domain,
      folderId: row.folder_id,
      version: row.version,
      lastModifiedAt: row.last_modified_at,
      lastModifiedBy: row.last_modified_by,
      deletedAt: row.deleted_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapSyncMetadataFromDB(row: any): SyncMetadata {
    return {
      id: row.id,
      userId: row.user_id,
      deviceId: row.device_id,
      deviceName: row.device_name,
      deviceType: row.device_type,
      lastSyncAt: row.last_sync_at,
      lastSyncVersion: row.last_sync_version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
