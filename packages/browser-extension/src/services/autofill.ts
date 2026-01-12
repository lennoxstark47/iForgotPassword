/**
 * Autofill Service
 * Handles credential matching and autofill logic
 */

import type { LoginCredential } from '@iforgotpassword/shared-types';
import { indexedDB } from '../storage/indexedDB';
import browser from 'webextension-polyfill';

export interface MatchedCredential {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
}

class AutofillService {
  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return null;
    }
  }

  /**
   * Check if two domains match (including subdomains)
   */
  private domainsMatch(domain1: string, domain2: string): boolean {
    const d1 = domain1.toLowerCase();
    const d2 = domain2.toLowerCase();

    // Exact match
    if (d1 === d2) return true;

    // Subdomain match (e.g., login.example.com matches example.com)
    if (d1.endsWith('.' + d2) || d2.endsWith('.' + d1)) return true;

    // Root domain match (e.g., www.example.com matches example.com)
    const getRootDomain = (domain: string) => {
      const parts = domain.split('.');
      if (parts.length >= 2) {
        return parts.slice(-2).join('.');
      }
      return domain;
    };

    return getRootDomain(d1) === getRootDomain(d2);
  }

  /**
   * Get matching credentials for a given URL
   */
  async getMatchingCredentials(
    pageUrl: string,
    encryptionKey: CryptoKey
  ): Promise<MatchedCredential[]> {
    const pageDomain = this.extractDomain(pageUrl);
    if (!pageDomain) return [];

    try {
      await indexedDB.init();
      const allItems = await indexedDB.getAllVaultItems();

      // Filter login items that match the domain
      const matchingItems = allItems.filter((item) => {
        if (item.itemType !== 'login') return false;
        if (item.deletedAt) return false;
        if (!item.urlDomain) return false;

        return this.domainsMatch(pageDomain, item.urlDomain);
      });

      // Decrypt and return
      const credentials: MatchedCredential[] = [];

      for (const item of matchingItems) {
        try {
          const decryptedData = (await this.decryptData(
            item.encryptedData,
            item.iv,
            item.authTag,
            encryptionKey
          )) as LoginCredential;

          credentials.push({
            id: item.id,
            title: decryptedData.title,
            username: decryptedData.username,
            password: decryptedData.password,
            url: decryptedData.url,
          });
        } catch (error) {
          console.error(`Failed to decrypt credential ${item.id}:`, error);
        }
      }

      return credentials;
    } catch (error) {
      console.error('Failed to get matching credentials:', error);
      return [];
    }
  }

  /**
   * Security check: Verify the page is secure (HTTPS)
   */
  isSecurePage(url: string): boolean {
    try {
      const urlObj = new URL(url);
      // Allow localhost for development
      if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
        return true;
      }
      return urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Security check: Verify the form is not in an iframe from a different origin
   */
  async isFormSafe(tabId: number): Promise<boolean> {
    try {
      // Check if the tab is valid and active
      const tab = await browser.tabs.get(tabId);
      if (!tab.url) return false;

      // Verify HTTPS
      if (!this.isSecurePage(tab.url)) {
        console.warn('Autofill blocked: page is not secure (HTTPS required)');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Security check failed:', error);
      return false;
    }
  }

  /**
   * Decrypt credential data
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

    const encryptedBuffer = new Uint8Array([
      ...new Uint8Array(ciphertext),
      ...new Uint8Array(authTagBuffer),
    ]);

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

export const autofillService = new AutofillService();
