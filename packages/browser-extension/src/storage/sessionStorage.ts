/**
 * Session Storage Service
 * Manages temporary session data (tokens, encryption keys)
 * Automatically cleared when vault is locked
 * 
 * Now uses background service worker memory for persistence across popup open/close
 */

import browser from 'webextension-polyfill';

export class SessionStorage {
  /**
   * Store the encryption key in background service worker
   * Note: CryptoKey cannot be directly serialized, so we export/import it
   */
  async setEncryptionKey(key: CryptoKey): Promise<void> {
    const exported = await crypto.subtle.exportKey('raw', key);
    const keyString = this.arrayBufferToBase64(exported);

    // Store in background service worker memory
    try {
      await browser.runtime.sendMessage({
        type: 'SET_SESSION',
        session: { encryptionKey: keyString },
      });
    } catch (error) {
      console.error('Failed to store encryption key in background:', error);
      // Fallback to browser.storage.session
      await browser.storage.session.set({ encryptionKey: keyString });
    }
  }

  /**
   * Get the encryption key from background service worker
   */
  async getEncryptionKey(): Promise<CryptoKey | null> {
    try {
      // Try to get from background service worker first
      const response = await browser.runtime.sendMessage({ type: 'GET_SESSION' });
      
      if (response?.success && response.session?.encryptionKey) {
        const keyBuffer = this.base64ToArrayBuffer(response.session.encryptionKey);
        return crypto.subtle.importKey(
          'raw',
          keyBuffer,
          { name: 'AES-GCM' },
          true,
          ['encrypt', 'decrypt']
        );
      }
    } catch (error) {
      console.error('Failed to get encryption key from background:', error);
      // Fallback to browser.storage.session
      const result = await browser.storage.session.get('encryptionKey');
      if (result.encryptionKey) {
        const keyBuffer = this.base64ToArrayBuffer(result.encryptionKey);
        return crypto.subtle.importKey(
          'raw',
          keyBuffer,
          { name: 'AES-GCM' },
          true,
          ['encrypt', 'decrypt']
        );
      }
    }

    return null;
  }

  /**
   * Store access token in background service worker
   */
  async setAccessToken(token: string): Promise<void> {
    try {
      await browser.runtime.sendMessage({
        type: 'SET_SESSION',
        session: { accessToken: token },
      });
    } catch (error) {
      console.error('Failed to store access token in background:', error);
      await browser.storage.session.set({ accessToken: token });
    }
  }

  /**
   * Get access token from background service worker
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const response = await browser.runtime.sendMessage({ type: 'GET_SESSION' });
      if (response?.success && response.session?.accessToken) {
        return response.session.accessToken;
      }
    } catch (error) {
      console.error('Failed to get access token from background:', error);
      const result = await browser.storage.session.get('accessToken');
      return result.accessToken || null;
    }
    return null;
  }

  /**
   * Store refresh token in background service worker
   */
  async setRefreshToken(token: string): Promise<void> {
    try {
      await browser.runtime.sendMessage({
        type: 'SET_SESSION',
        session: { refreshToken: token },
      });
    } catch (error) {
      console.error('Failed to store refresh token in background:', error);
      await browser.storage.session.set({ refreshToken: token });
    }
  }

  /**
   * Get refresh token from background service worker
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const response = await browser.runtime.sendMessage({ type: 'GET_SESSION' });
      if (response?.success && response.session?.refreshToken) {
        return response.session.refreshToken;
      }
    } catch (error) {
      console.error('Failed to get refresh token from background:', error);
      const result = await browser.storage.session.get('refreshToken');
      return result.refreshToken || null;
    }
    return null;
  }

  /**
   * Store both tokens at once in background service worker
   */
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await browser.runtime.sendMessage({
        type: 'SET_SESSION',
        session: { accessToken, refreshToken },
      });
    } catch (error) {
      console.error('Failed to store tokens in background:', error);
      await browser.storage.session.set({ accessToken, refreshToken });
    }
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
    // Clear background service worker session state
    try {
      await browser.runtime.sendMessage({ type: 'VAULT_LOCKED' });
    } catch (error) {
      console.error('Failed to clear session in background:', error);
    }
    // Also clear browser.storage.session as fallback
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
