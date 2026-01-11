/**
 * Vault Service
 * Handles encryption, decryption, and management of vault items
 */

import type {
  VaultItem,
  LoginCredential,
  CardCredential,
  NoteCredential,
  IdentityCredential,
  VaultItemType,
  CreateVaultItemResponse,
  UpdateVaultItemResponse,
} from '@iforgotpassword/shared-types';
import { indexedDB } from '../storage/indexedDB';
import { apiService } from './api';
import { localStorageService } from '../storage/localStorage';

export type DecryptedItem = {
  id: string;
  type: VaultItemType;
  data: LoginCredential | CardCredential | NoteCredential | IdentityCredential;
  createdAt: Date;
  updatedAt: Date;
};

class VaultService {
  /**
   * Encrypt data using the encryption key
   */
  private async encryptData(
    data: any,
    encryptionKey: CryptoKey
  ): Promise<{ encryptedData: string; iv: string; authTag: string }> {
    const dataString = JSON.stringify(data);
    const dataBuffer = new TextEncoder().encode(dataString);

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt with AES-GCM
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128,
      },
      encryptionKey,
      dataBuffer
    );

    // Split encrypted data and auth tag
    const encryptedArray = new Uint8Array(encryptedBuffer);
    const ciphertext = encryptedArray.slice(0, -16);
    const authTag = encryptedArray.slice(-16);

    return {
      encryptedData: this.arrayBufferToBase64(ciphertext.buffer),
      iv: this.arrayBufferToBase64(iv.buffer),
      authTag: this.arrayBufferToBase64(authTag.buffer),
    };
  }

  /**
   * Decrypt data using the encryption key
   */
  private async decryptData(
    encryptedData: string,
    iv: string,
    authTag: string,
    encryptionKey: CryptoKey
  ): Promise<any> {
    const ciphertext = this.base64ToArrayBuffer(encryptedData);
    const ivBuffer = this.base64ToArrayBuffer(iv);
    const authTagBuffer = this.base64ToArrayBuffer(authTag);

    // Combine ciphertext and auth tag
    const encryptedBuffer = new Uint8Array([
      ...new Uint8Array(ciphertext),
      ...new Uint8Array(authTagBuffer),
    ]);

    try {
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: ivBuffer,
          tagLength: 128,
        },
        encryptionKey,
        encryptedBuffer
      );

      const decryptedString = new TextDecoder().decode(decryptedBuffer);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt vault item. Invalid encryption key or corrupted data.');
    }
  }

  /**
   * Get all vault items from IndexedDB and decrypt them
   */
  async getAllItems(encryptionKey: CryptoKey): Promise<DecryptedItem[]> {
    try {
      await indexedDB.init();
      const encryptedItems = await indexedDB.getAllVaultItems();

      const decryptedItems = await Promise.all(
        encryptedItems.map(async (item) => {
          try {
            const decryptedData = await this.decryptData(
              item.encryptedData,
              item.iv,
              item.authTag,
              encryptionKey
            );

            return {
              id: item.id,
              type: item.itemType,
              data: decryptedData,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            };
          } catch (error) {
            console.error(`Failed to decrypt item ${item.id}:`, error);
            return null;
          }
        })
      );

      return decryptedItems.filter((item): item is DecryptedItem => item !== null);
    } catch (error) {
      console.error('Failed to get vault items:', error);
      return [];
    }
  }

  /**
   * Create a new vault item
   */
  async createItem(
    type: VaultItemType,
    data: LoginCredential | CardCredential | NoteCredential | IdentityCredential,
    encryptionKey: CryptoKey
  ): Promise<DecryptedItem> {
    try {
      // Encrypt the data
      const { encryptedData, iv, authTag } = await this.encryptData(data, encryptionKey);

      // Get device ID
      const deviceId = await localStorageService.getDeviceId();

      // Extract URL domain for auto-fill (if login type)
      let urlDomain: string | undefined;
      if (type === 'login' && 'url' in data && data.url) {
        try {
          const url = new URL(data.url);
          urlDomain = url.hostname;
        } catch (error) {
          // Invalid URL, ignore
        }
      }

      // Call API to create item
      const response = (await apiService.createVaultItem({
        encryptedData,
        encryptedKey: '', // For now, we use the same encryption key
        iv,
        authTag,
        itemType: type,
        urlDomain,
      })) as CreateVaultItemResponse;

      // Create VaultItem object for local storage
      const vaultItem: VaultItem = {
        id: response.id,
        userId: '', // Will be set by backend
        encryptedData,
        encryptedKey: '',
        iv,
        authTag,
        itemType: type,
        urlDomain,
        version: response.version,
        lastModifiedAt: new Date(),
        lastModifiedBy: deviceId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to IndexedDB
      await indexedDB.init();
      await indexedDB.saveVaultItem(vaultItem);

      return {
        id: response.id,
        type,
        data,
        createdAt: vaultItem.createdAt,
        updatedAt: vaultItem.updatedAt,
      };
    } catch (error) {
      console.error('Failed to create vault item:', error);
      throw new Error('Failed to create vault item');
    }
  }

  /**
   * Update an existing vault item
   */
  async updateItem(
    id: string,
    type: VaultItemType,
    data: LoginCredential | CardCredential | NoteCredential | IdentityCredential,
    encryptionKey: CryptoKey
  ): Promise<DecryptedItem> {
    try {
      // Get existing item from IndexedDB
      await indexedDB.init();
      const existingItem = await indexedDB.getVaultItem(id);

      if (!existingItem) {
        throw new Error('Vault item not found');
      }

      // Encrypt the new data
      const { encryptedData, iv, authTag } = await this.encryptData(data, encryptionKey);

      // Extract URL domain for auto-fill (if login type)
      let urlDomain: string | undefined;
      if (type === 'login' && 'url' in data && data.url) {
        try {
          const url = new URL(data.url);
          urlDomain = url.hostname;
        } catch (error) {
          // Invalid URL, ignore
        }
      }

      // Call API to update item
      const response = (await apiService.updateVaultItem(id, {
        encryptedData,
        encryptedKey: '',
        iv,
        authTag,
        version: existingItem.version,
        urlDomain,
      })) as UpdateVaultItemResponse;

      // Get device ID
      const deviceId = await localStorageService.getDeviceId();

      // Update VaultItem object
      const updatedItem: VaultItem = {
        ...existingItem,
        encryptedData,
        iv,
        authTag,
        urlDomain,
        version: response.version,
        lastModifiedAt: new Date(),
        lastModifiedBy: deviceId,
        updatedAt: new Date(),
      };

      // Save to IndexedDB
      await indexedDB.saveVaultItem(updatedItem);

      return {
        id,
        type,
        data,
        createdAt: updatedItem.createdAt,
        updatedAt: updatedItem.updatedAt,
      };
    } catch (error) {
      console.error('Failed to update vault item:', error);
      throw new Error('Failed to update vault item');
    }
  }

  /**
   * Delete a vault item
   */
  async deleteItem(id: string): Promise<void> {
    try {
      // Call API to delete item
      await apiService.deleteVaultItem(id);

      // Soft delete from IndexedDB
      await indexedDB.init();
      await indexedDB.deleteVaultItem(id);
    } catch (error) {
      console.error('Failed to delete vault item:', error);
      throw new Error('Failed to delete vault item');
    }
  }

  /**
   * Sync vault items with server
   */
  async syncWithServer(): Promise<void> {
    try {
      await indexedDB.init();
      const deviceId = await localStorageService.getDeviceId();
      const syncMetadata = await indexedDB.getSyncMetadata();
      const lastSyncVersion = syncMetadata?.lastSyncVersion || 0;

      // Pull changes from server
      const pullResponse = (await apiService.syncPull(deviceId, lastSyncVersion)) as any;

      // Save pulled items to IndexedDB
      if (pullResponse.items && pullResponse.items.length > 0) {
        await indexedDB.saveVaultItems(pullResponse.items);
      }

      // Update sync metadata
      await indexedDB.saveSyncMetadata({
        lastSyncVersion: pullResponse.syncVersion || 0,
        lastSyncTimestamp: Date.now(),
        deviceId,
      });
    } catch (error) {
      console.error('Failed to sync with server:', error);
      throw new Error('Failed to sync vault');
    }
  }

  // Helper methods

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

export const vaultService = new VaultService();
