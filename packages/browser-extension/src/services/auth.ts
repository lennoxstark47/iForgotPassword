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

    console.log('[AUTH] Registration - Generated salt:', keys.salt);
    console.log('[AUTH] Registration - Auth key:', keys.authKey);

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
    
    console.log('[AUTH] Registration - Salt saved to localStorage');

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

    // Notify background script with full session data (non-blocking, ignore errors)
    try {
      const exported = await crypto.subtle.exportKey('raw', keys.encryptionKey);
      const keyString = this.arrayBufferToBase64(exported);
      
      await browser.runtime.sendMessage({
        type: 'VAULT_UNLOCKED',
        encryptionKey: keyString,
        accessToken: loginResponse.token,
        refreshToken: loginResponse.refreshToken,
        userEmail: email,
      });
    } catch (error) {
      // Background script might not be ready or message passing might fail
      // This is non-critical, so we can continue
      console.warn('Failed to notify background script:', error);
    }

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
    let storedSalt = await localStorage.get('salt');
    
    console.log('[AUTH] Login - Retrieved salt from localStorage:', storedSalt);

    // If no salt in local storage, fetch it from the backend
    if (!storedSalt) {
      console.log('[AUTH] Login - No local salt found, fetching from backend...');
      try {
        const saltData = await apiService.getSalt(email);
        storedSalt = saltData.salt;
        
        // Store salt locally for future logins
        await localStorage.set('salt', storedSalt);
        console.log('[AUTH] Login - Salt retrieved from backend and saved locally:', storedSalt);
      } catch (error) {
        console.error('[AUTH] Login - Failed to retrieve salt from backend:', error);
        throw new Error('Unable to retrieve login credentials. Please check your email or register first.');
      }
    }

    // Derive keys from master password with existing salt
    const keys = await cryptoService.deriveKeys(email, masterPassword, storedSalt);
    
    console.log('[AUTH] Login - Derived auth key:', keys.authKey);
    console.log('[AUTH] Login - Using salt:', keys.salt);

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

    // Notify background script with full session data (non-blocking, fire-and-forget)
    try {
      const exported = await crypto.subtle.exportKey('raw', keys.encryptionKey);
      const keyString = this.arrayBufferToBase64(exported);
      
      // Don't await - fire and forget to avoid blocking
      browser.runtime.sendMessage({
        type: 'VAULT_UNLOCKED',
        encryptionKey: keyString,
        accessToken: loginResponse.token,
        refreshToken: loginResponse.refreshToken,
        userEmail: email,
        isFirefox: navigator.userAgent.includes('Firefox'),
      }).catch(error => {
        // Background script might not be ready or message passing might fail
        // This is non-critical, so we just log it
        console.warn('Failed to notify background script:', error);
      });
    } catch (error) {
      console.warn('Failed to export encryption key:', error);
    }

    console.log('[AUTH] Unlock complete, returning result');

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

    // Notify background script (non-blocking, ignore errors)
    try {
      await browser.runtime.sendMessage({ type: 'VAULT_LOCKED' });
    } catch (error) {
      console.warn('Failed to notify background script:', error);
    }
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

    // Notify background script (non-blocking, ignore errors)
    try {
      await browser.runtime.sendMessage({ type: 'VAULT_LOCKED' });
    } catch (error) {
      console.warn('Failed to notify background script:', error);
    }
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

  // ==================== Helper Methods ====================

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

// Export singleton instance
export const authService = new AuthService();
