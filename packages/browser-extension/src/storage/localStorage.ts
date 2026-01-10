/**
 * Local Storage Service
 * Manages persistent local data (user settings, device ID)
 */

import browser from 'webextension-polyfill';
import type { Settings } from '../types';

const DEFAULT_SETTINGS: Settings = {
  autoLockMinutes: 15,
  apiBaseUrl: 'http://localhost:3000',
  theme: 'light',
};

export class LocalStorage {
  /**
   * Get or create device ID
   */
  async getDeviceId(): Promise<string> {
    const result = await browser.storage.local.get('deviceId');

    if (result.deviceId) {
      return result.deviceId;
    }

    // Generate new device ID
    const deviceId = crypto.randomUUID();
    await browser.storage.local.set({ deviceId });
    return deviceId;
  }

  /**
   * Get user email (last logged in user)
   */
  async getUserEmail(): Promise<string | null> {
    const result = await browser.storage.local.get('userEmail');
    return result.userEmail || null;
  }

  /**
   * Set user email
   */
  async setUserEmail(email: string): Promise<void> {
    await browser.storage.local.set({ userEmail: email });
  }

  /**
   * Get settings
   */
  async getSettings(): Promise<Settings> {
    const result = await browser.storage.local.get('settings');
    return result.settings || DEFAULT_SETTINGS;
  }

  /**
   * Update settings
   */
  async updateSettings(settings: Partial<Settings>): Promise<void> {
    const currentSettings = await this.getSettings();
    const newSettings = { ...currentSettings, ...settings };
    await browser.storage.local.set({ settings: newSettings });
  }

  /**
   * Get authentication hash (hashed master password for verification)
   */
  async getAuthHash(): Promise<string | null> {
    const result = await browser.storage.local.get('authHash');
    return result.authHash || null;
  }

  /**
   * Set authentication hash
   */
  async setAuthHash(hash: string): Promise<void> {
    await browser.storage.local.set({ authHash: hash });
  }

  /**
   * Get a value from local storage
   */
  async get(key: string): Promise<string | null> {
    const result = await browser.storage.local.get(key);
    return result[key] || null;
  }

  /**
   * Set a value in local storage
   */
  async set(key: string, value: string): Promise<void> {
    await browser.storage.local.set({ [key]: value });
  }

  /**
   * Check if user has previously registered
   */
  async hasRegistered(): Promise<boolean> {
    const email = await this.getUserEmail();
    return !!email;
  }

  /**
   * Clear user data (logout)
   */
  async clearUserData(): Promise<void> {
    await browser.storage.local.remove(['userEmail', 'authHash']);
  }

  /**
   * Clear all local storage
   */
  async clearAll(): Promise<void> {
    await browser.storage.local.clear();
  }
}

// Export singleton instance
export const localStorage = new LocalStorage();
