/**
 * End-to-End Encryption Verification Tests
 * Tests the core encryption functionality to ensure zero-knowledge architecture
 */

import { encrypt, decrypt, decryptJSON, generateKey, generateSalt } from '../src/encryption';

describe('Encryption - AES-256-GCM', () => {
  let testKey: Buffer;

  beforeEach(() => {
    testKey = generateKey(32);
  });

  describe('Key Generation', () => {
    it('should generate a 32-byte key for AES-256', () => {
      const key = generateKey(32);
      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(32);
    });

    it('should generate unique keys', () => {
      const key1 = generateKey(32);
      const key2 = generateKey(32);
      expect(key1.equals(key2)).toBe(false);
    });

    it('should generate a 32-byte salt', () => {
      const salt = generateSalt(32);
      expect(salt).toBeInstanceOf(Buffer);
      expect(salt.length).toBe(32);
    });
  });

  describe('String Encryption', () => {
    it('should encrypt and decrypt a string', () => {
      const plaintext = 'This is a secret password';
      const encrypted = encrypt(plaintext, testKey);

      expect(encrypted.encryptedData).toBeTruthy();
      expect(encrypted.iv).toBeTruthy();
      expect(encrypted.authTag).toBeTruthy();

      const decrypted = decrypt(encrypted, testKey);
      expect(decrypted).toBe(plaintext);
    });

    it('should fail with wrong key', () => {
      const plaintext = 'Secret data';
      const encrypted = encrypt(plaintext, testKey);

      const wrongKey = generateKey(32);
      expect(() => decrypt(encrypted, wrongKey)).toThrow();
    });

    it('should fail with tampered data', () => {
      const plaintext = 'Secret data';
      const encrypted = encrypt(plaintext, testKey);

      // Tamper with encrypted data
      encrypted.encryptedData = encrypted.encryptedData.substring(0, encrypted.encryptedData.length - 5) + 'AAAAA';

      expect(() => decrypt(encrypted, testKey)).toThrow();
    });

    it('should fail with tampered auth tag', () => {
      const plaintext = 'Secret data';
      const encrypted = encrypt(plaintext, testKey);

      // Tamper with auth tag
      encrypted.authTag = 'AAAAAAAAAAAAAAAAAAAAAA==';

      expect(() => decrypt(encrypted, testKey)).toThrow();
    });
  });

  describe('JSON Encryption', () => {
    it('should encrypt and decrypt JSON objects', () => {
      const data = {
        username: 'user@example.com',
        password: 'SuperSecret123!',
        url: 'https://example.com',
        notes: 'Important account',
      };

      const encrypted = encrypt(data, testKey);
      const decrypted = decryptJSON(encrypted, testKey);

      expect(decrypted).toEqual(data);
    });

    it('should handle complex nested objects', () => {
      const data = {
        credentials: {
          username: 'admin',
          password: 'pass123',
          metadata: {
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          },
        },
        tags: ['work', 'important'],
      };

      const encrypted = encrypt(data, testKey);
      const decrypted = decryptJSON(encrypted, testKey);

      expect(decrypted).toEqual(data);
    });
  });

  describe('Key Length Validation', () => {
    it('should reject keys that are not 32 bytes', () => {
      const shortKey = generateKey(16);
      expect(() => encrypt('data', shortKey)).toThrow('Encryption key must be 32 bytes for AES-256');
    });

    it('should reject keys that are too long', () => {
      const longKey = generateKey(64);
      expect(() => encrypt('data', longKey)).toThrow('Encryption key must be 32 bytes for AES-256');
    });
  });

  describe('IV Randomness', () => {
    it('should generate unique IVs for same plaintext', () => {
      const plaintext = 'Same data encrypted twice';
      const encrypted1 = encrypt(plaintext, testKey);
      const encrypted2 = encrypt(plaintext, testKey);

      // IVs should be different
      expect(encrypted1.iv).not.toBe(encrypted2.iv);

      // But both should decrypt to same plaintext
      expect(decrypt(encrypted1, testKey)).toBe(plaintext);
      expect(decrypt(encrypted2, testKey)).toBe(plaintext);
    });
  });

  describe('Data Integrity', () => {
    it('should detect any modification to ciphertext', () => {
      const plaintext = 'Critical data';
      const encrypted = encrypt(plaintext, testKey);

      // Try to modify each character of base64 ciphertext
      const originalData = encrypted.encryptedData;
      for (let i = 0; i < Math.min(originalData.length, 10); i++) {
        const tamperedData = originalData.substring(0, i) + 'X' + originalData.substring(i + 1);
        const tamperedEncrypted = { ...encrypted, encryptedData: tamperedData };

        expect(() => decrypt(tamperedEncrypted, testKey)).toThrow();
      }
    });
  });
});

describe('Key Derivation - PBKDF2', () => {
  const { deriveMasterKey, splitMasterKey, deriveKeys, hashAuthKey } = require('../src/key-derivation');

  describe('Master Key Derivation', () => {
    it('should derive a 64-byte master key', () => {
      const password = 'StrongMasterPassword123!';
      const salt = generateSalt(32);
      const masterKey = deriveMasterKey(password, salt, 100000);

      expect(masterKey).toBeInstanceOf(Buffer);
      expect(masterKey.length).toBe(64);
    });

    it('should produce consistent keys for same inputs', () => {
      const password = 'TestPassword';
      const salt = generateSalt(32);
      const iterations = 100000;

      const key1 = deriveMasterKey(password, salt, iterations);
      const key2 = deriveMasterKey(password, salt, iterations);

      expect(key1.equals(key2)).toBe(true);
    });

    it('should produce different keys for different passwords', () => {
      const salt = generateSalt(32);
      const key1 = deriveMasterKey('password1', salt, 100000);
      const key2 = deriveMasterKey('password2', salt, 100000);

      expect(key1.equals(key2)).toBe(false);
    });

    it('should produce different keys for different salts', () => {
      const password = 'SamePassword';
      const salt1 = generateSalt(32);
      const salt2 = generateSalt(32);

      const key1 = deriveMasterKey(password, salt1, 100000);
      const key2 = deriveMasterKey(password, salt2, 100000);

      expect(key1.equals(key2)).toBe(false);
    });
  });

  describe('Key Splitting', () => {
    it('should split 64-byte key into auth and encryption keys', () => {
      const masterKey = Buffer.alloc(64);
      const { authKey, encryptionKey } = splitMasterKey(masterKey);

      expect(authKey.length).toBe(32);
      expect(encryptionKey.length).toBe(32);
    });

    it('should produce different auth and encryption keys', () => {
      const password = 'TestPassword';
      const salt = generateSalt(32);
      const { authKey, encryptionKey } = deriveKeys(password, salt, 100000);

      expect(authKey.equals(encryptionKey)).toBe(false);
    });

    it('should throw error if master key is not 64 bytes', () => {
      const wrongKey = Buffer.alloc(32);
      expect(() => splitMasterKey(wrongKey)).toThrow('Master key must be 64 bytes');
    });
  });

  describe('Zero-Knowledge Architecture', () => {
    it('should demonstrate auth key and encryption key separation', () => {
      const password = 'MasterPassword123!';
      const salt = generateSalt(32);
      const { authKey, encryptionKey } = deriveKeys(password, salt, 100000);

      // Hash auth key for server storage (simulating client behavior)
      const hashedAuthKey = hashAuthKey(authKey);

      // Encryption key stays local
      const testData = { username: 'user', password: 'pass123' };
      const encrypted = encrypt(testData, encryptionKey);

      // Server only has hashedAuthKey, cannot decrypt
      expect(hashedAuthKey).toBeTruthy();
      expect(hashedAuthKey).not.toContain('user');
      expect(hashedAuthKey).not.toContain('pass123');

      // Only client with encryption key can decrypt
      const decrypted = decryptJSON(encrypted, encryptionKey);
      expect(decrypted).toEqual(testData);
    });
  });
});

describe('End-to-End Encryption Flow', () => {
  const { deriveKeys } = require('../src/key-derivation');

  it('should simulate complete registration and encryption flow', () => {
    // Step 1: User registers with master password
    const masterPassword = 'MySecureMasterPassword123!';
    const salt = generateSalt(32);

    // Step 2: Derive keys
    const { authKey, encryptionKey } = deriveKeys(masterPassword, salt, 100000);

    // Step 3: Client sends hashed auth key to server (server stores this)
    const { hashAuthKey } = require('../src/key-derivation');
    const hashedAuthKey = hashAuthKey(authKey);

    // Step 4: Client encrypts vault item with encryption key (kept locally)
    const vaultItem = {
      type: 'login',
      username: 'myuser@site.com',
      password: 'SitePassword456!',
      url: 'https://example.com',
    };

    const encryptedItem = encrypt(vaultItem, encryptionKey);

    // Step 5: Verify server cannot decrypt (no encryption key)
    // Server only has: hashedAuthKey, encrypted vault item
    // This simulates what server stores
    const serverData = {
      authKeyHash: hashedAuthKey,
      vaultItem: encryptedItem,
    };

    expect(serverData.vaultItem.encryptedData).toBeTruthy();
    expect(serverData.vaultItem.encryptedData).not.toContain('myuser@site.com');
    expect(serverData.vaultItem.encryptedData).not.toContain('SitePassword456!');

    // Step 6: Client retrieves and decrypts data
    const decryptedItem = decryptJSON(serverData.vaultItem, encryptionKey);
    expect(decryptedItem).toEqual(vaultItem);
  });

  it('should simulate login from different device', () => {
    // Device 1: Registration
    const masterPassword = 'MyPassword123!';
    const salt = generateSalt(32);

    const device1Keys = deriveKeys(masterPassword, salt, 100000);
    const { hashAuthKey } = require('../src/key-derivation');
    const hashedAuthKey = hashAuthKey(device1Keys.authKey);

    // Server stores: email, hashedAuthKey, salt, encrypted items
    const vaultItem = { username: 'test', password: 'secret' };
    const encryptedItem = encrypt(vaultItem, device1Keys.encryptionKey);

    // Device 2: Login with same password
    // Device 2 gets salt from server
    const device2Keys = deriveKeys(masterPassword, salt, 100000);
    const device2HashedAuthKey = hashAuthKey(device2Keys.authKey);

    // Device 2 auth key should match Device 1
    expect(device2HashedAuthKey).toBe(hashedAuthKey);

    // Device 2 can decrypt with same encryption key
    const decrypted = decryptJSON(encryptedItem, device2Keys.encryptionKey);
    expect(decrypted).toEqual(vaultItem);
  });
});
