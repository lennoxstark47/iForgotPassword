/**
 * Crypto Service
 * Handles key derivation and encryption/decryption using Web Crypto API
 */

const DEFAULT_PBKDF2_ITERATIONS = 100000;

export interface DerivedKeys {
  authKey: string; // Base64 encoded
  encryptionKey: CryptoKey; // Web Crypto Key object
  salt: string; // Base64 encoded
  iterations: number;
}

class CryptoService {
  /**
   * Derive authentication and encryption keys from master password
   * Uses PBKDF2 with SHA-256 to derive a 64-byte master key
   * First 32 bytes -> auth key (sent to server)
   * Last 32 bytes -> encryption key (stays local)
   */
  async deriveKeys(
    email: string,
    masterPassword: string,
    existingSalt?: string
  ): Promise<DerivedKeys> {
    const iterations = DEFAULT_PBKDF2_ITERATIONS;

    // Generate or use existing salt (email + random bytes)
    let saltBuffer: Uint8Array;
    if (existingSalt) {
      saltBuffer = this.base64ToArrayBuffer(existingSalt);
    } else {
      const randomSalt = crypto.getRandomValues(new Uint8Array(16));
      const emailBytes = new TextEncoder().encode(email);
      saltBuffer = new Uint8Array(emailBytes.length + randomSalt.length);
      saltBuffer.set(emailBytes, 0);
      saltBuffer.set(randomSalt, emailBytes.length);
    }

    // Convert password to key for PBKDF2
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(masterPassword),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    // Derive 64 bytes (512 bits) total
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBuffer.buffer as ArrayBuffer,
        iterations,
        hash: 'SHA-256',
      },
      passwordKey,
      512 // 64 bytes * 8 bits
    );

    const derivedBytes = new Uint8Array(derivedBits);

    // Split into auth key (first 32 bytes) and encryption key (last 32 bytes)
    const authKeyBytes = derivedBytes.slice(0, 32);
    const encKeyBytes = derivedBytes.slice(32, 64);

    // Hash the auth key with SHA-256 for server storage
    const hashedAuthKey = await crypto.subtle.digest('SHA-256', authKeyBytes.buffer as ArrayBuffer);
    const authKey = this.arrayBufferToBase64(hashedAuthKey);

    // Import encryption key as CryptoKey for AES-GCM
    const encryptionKey = await crypto.subtle.importKey(
      'raw',
      encKeyBytes.buffer as ArrayBuffer,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );

    return {
      authKey,
      encryptionKey,
      salt: this.arrayBufferToBase64(saltBuffer.buffer as ArrayBuffer),
      iterations,
    };
  }

  /**
   * Import encryption key from base64 string
   */
  async importEncryptionKey(keyString: string): Promise<CryptoKey> {
    const keyBuffer = this.base64ToArrayBuffer(keyString);
    return crypto.subtle.importKey(
      'raw',
      keyBuffer.buffer as ArrayBuffer,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Export encryption key to base64 string
   */
  async exportEncryptionKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key);
    return this.arrayBufferToBase64(exported);
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

  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Uint8Array(bytes.buffer);
  }
}

// Export singleton instance
export const cryptoService = new CryptoService();
