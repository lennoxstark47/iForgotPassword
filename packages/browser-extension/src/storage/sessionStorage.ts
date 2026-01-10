/**
 * Session Storage Service
 * Manages temporary session data (tokens, encryption keys)
 * Automatically cleared when vault is locked
 */

import browser from 'webextension-polyfill';

export class SessionStorage {
  /**
   * Store the encryption key in session storage
   * Note: CryptoKey cannot be directly serialized, so we export/import it
   */
  async setEncryptionKey(key: CryptoKey): Promise<void> {
    const exported = await crypto.subtle.exportKey('raw', key);
    const keyString = this.arrayBufferToBase64(exported);

    await browser.storage.session.set({
      encryptionKey: keyString,
    });
  }

  /**
   * Get the encryption key from session storage
   */
  async getEncryptionKey(): Promise<CryptoKey | null> {
    const result = await browser.storage.session.get('encryptionKey');

    if (!result.encryptionKey) {
      return null;
    }

    const keyBuffer = this.base64ToArrayBuffer(result.encryptionKey);

    return crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Store access token
   */
  async setAccessToken(token: string): Promise<void> {
    await browser.storage.session.set({ accessToken: token });
  }

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    const result = await browser.storage.session.get('accessToken');
    return result.accessToken || null;
  }

  /**
   * Store refresh token
   */
  async setRefreshToken(token: string): Promise<void> {
    await browser.storage.session.set({ refreshToken: token });
  }

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    const result = await browser.storage.session.get('refreshToken');
    return result.refreshToken || null;
  }

  /**
   * Store both tokens at once
   */
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await browser.storage.session.set({
      accessToken,
      refreshToken,
    });
  }

  /**
   * Check if session is active (has encryption key and tokens)
   */
  async isSessionActive(): Promise<boolean> {
    const [key, token] = await Promise.all([
      this.getEncryptionKey(),
      this.getAccessToken(),
    ]);

    return !!(key && token);
  }

  /**
   * Clear all session data (used when locking vault)
   */
  async clear(): Promise<void> {
    await browser.storage.session.clear();
  }

  // ==================== Helper Methods ====================

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

// Export singleton instance
export const sessionStorage = new SessionStorage();
