/**
 * Authentication Service
 * Handles user authentication, registration, and session management
 */

import browser from 'webextension-polyfill';
import { apiService } from './api';
import { cryptoService } from './crypto';
import { sessionStorage } from '../storage/sessionStorage';
import { localStorage } from '../storage/localStorage';
import { indexedDB } from '../storage/indexedDB';
import type { RegisterFormData, UnlockFormData } from '../types';

class AuthService {
  /**
   * Initialize the auth service
   */
  async init() {
    await Promise.all([
      apiService.init(),
      indexedDB.init(),
    ]);
  }

  /**
   * Register a new user
   */
  async register(data: RegisterFormData): Promise<{ email: string; encryptionKey: CryptoKey }> {
    const { email, masterPassword } = data;

    // Derive keys from master password
    const keys = await cryptoService.deriveKeys(email, masterPassword);

    // Get or create device ID
    const deviceId = await localStorage.getDeviceId();

    // Register with backend using auth key
    await apiService.register({
      email,
      authKey: keys.authKey,
      salt: keys.salt,
      kdfIterations: keys.iterations,
      kdfAlgorithm: 'PBKDF2' as const,
    });

    // Save user email and salt locally
    await localStorage.setUserEmail(email);
    await localStorage.set('salt', keys.salt);

    // Store encryption key in session
    await sessionStorage.setEncryptionKey(keys.encryptionKey);

    // Login to get tokens
    const loginResponse = await apiService.login({
      email,
      authKey: keys.authKey,
      deviceId,
      deviceName: navigator.userAgent.includes('Firefox') ? 'Firefox Extension' : 'Chrome Extension',
    });

    // Store tokens
    await sessionStorage.setTokens(loginResponse.token, loginResponse.refreshToken);

    // Notify background script
    await browser.runtime.sendMessage({ type: 'VAULT_UNLOCKED' });

    return {
      email,
      encryptionKey: keys.encryptionKey,
    };
  }

  /**
   * Login/Unlock vault
   */
  async unlock(data: UnlockFormData): Promise<{ email: string; encryptionKey: CryptoKey }> {
    const { email, masterPassword } = data;

    // Get stored salt for this user
    const storedSalt = await localStorage.get('salt');

    // Derive keys from master password with existing salt
    const keys = await cryptoService.deriveKeys(email, masterPassword, storedSalt || undefined);

    // Get device ID
    const deviceId = await localStorage.getDeviceId();

    // Login with backend
    const loginResponse = await apiService.login({
      email,
      authKey: keys.authKey,
      deviceId,
      deviceName: navigator.userAgent.includes('Firefox') ? 'Firefox Extension' : 'Chrome Extension',
    });

    // Store tokens
    await sessionStorage.setTokens(loginResponse.token, loginResponse.refreshToken);

    // Store encryption key in session
    await sessionStorage.setEncryptionKey(keys.encryptionKey);

    // Save user email locally (in case it wasn't saved before)
    await localStorage.setUserEmail(email);

    // Notify background script
    await browser.runtime.sendMessage({ type: 'VAULT_UNLOCKED' });

    return {
      email,
      encryptionKey: keys.encryptionKey,
    };
  }

  /**
   * Lock the vault
   */
  async lock(): Promise<void> {
    // Clear session storage (tokens and encryption key)
    await sessionStorage.clear();

    // Notify background script
    await browser.runtime.sendMessage({ type: 'VAULT_LOCKED' });
  }

  /**
   * Logout (clear all data)
   */
  async logout(): Promise<void> {
    // Clear session storage
    await sessionStorage.clear();

    // Clear user data from local storage
    await localStorage.clearUserData();

    // Clear vault from IndexedDB
    await indexedDB.clearAll();

    // Notify background script
    await browser.runtime.sendMessage({ type: 'VAULT_LOCKED' });
  }

  /**
   * Check if user is authenticated and vault is unlocked
   */
  async checkSession(): Promise<boolean> {
    return sessionStorage.isSessionActive();
  }

  /**
   * Get the stored user email (last logged in user)
   */
  async getStoredUserEmail(): Promise<string | null> {
    return localStorage.getUserEmail();
  }

  /**
   * Check if user has registered before
   */
  async hasRegistered(): Promise<boolean> {
    return localStorage.hasRegistered();
  }
}

// Export singleton instance
export const authService = new AuthService();
