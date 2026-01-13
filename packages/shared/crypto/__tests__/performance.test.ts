/**
 * Performance Tests for Encryption Operations
 * Ensures encryption/decryption meets acceptable performance standards
 */

import { encrypt, decrypt, generateKey, generateSalt } from '../src/encryption';
import { deriveMasterKey, deriveKeys } from '../src/key-derivation';

describe('Encryption Performance', () => {
  let testKey: Buffer;

  beforeEach(() => {
    testKey = generateKey(32);
  });

  describe('Encryption Speed', () => {
    it('should encrypt small data (< 1KB) in under 10ms', () => {
      const data = { username: 'user@example.com', password: 'password123' };
      const iterations = 100;

      const start = Date.now();
      for (let i = 0; i < iterations; i++) {
        encrypt(data, testKey);
      }
      const end = Date.now();

      const avgTime = (end - start) / iterations;
      expect(avgTime).toBeLessThan(10);
      console.log(`Average encryption time (small data): ${avgTime.toFixed(2)}ms`);
    });

    it('should encrypt medium data (10KB) in under 50ms', () => {
      const data = {
        username: 'user@example.com',
        password: 'password123',
        notes: 'A'.repeat(10000), // 10KB of data
      };

      const start = Date.now();
      encrypt(data, testKey);
      const end = Date.now();

      const time = end - start;
      expect(time).toBeLessThan(50);
      console.log(`Encryption time (10KB): ${time}ms`);
    });

    it('should encrypt large data (100KB) in under 100ms', () => {
      const data = {
        username: 'user@example.com',
        password: 'password123',
        notes: 'A'.repeat(100000), // 100KB of data
      };

      const start = Date.now();
      encrypt(data, testKey);
      const end = Date.now();

      const time = end - start;
      expect(time).toBeLessThan(100);
      console.log(`Encryption time (100KB): ${time}ms`);
    });
  });

  describe('Decryption Speed', () => {
    it('should decrypt small data in under 10ms', () => {
      const data = { username: 'user@example.com', password: 'password123' };
      const encrypted = encrypt(data, testKey);
      const iterations = 100;

      const start = Date.now();
      for (let i = 0; i < iterations; i++) {
        decrypt(encrypted, testKey);
      }
      const end = Date.now();

      const avgTime = (end - start) / iterations;
      expect(avgTime).toBeLessThan(10);
      console.log(`Average decryption time (small data): ${avgTime.toFixed(2)}ms`);
    });

    it('should decrypt large data (100KB) in under 100ms', () => {
      const data = { notes: 'A'.repeat(100000) };
      const encrypted = encrypt(data, testKey);

      const start = Date.now();
      decrypt(encrypted, testKey);
      const end = Date.now();

      const time = end - start;
      expect(time).toBeLessThan(100);
      console.log(`Decryption time (100KB): ${time}ms`);
    });
  });

  describe('Key Derivation Performance', () => {
    it('should derive master key with 100K iterations in under 500ms', () => {
      const password = 'MyStrongPassword123!';
      const salt = generateSalt(32);
      const iterations = 100000;

      const start = Date.now();
      deriveMasterKey(password, salt, iterations);
      const end = Date.now();

      const time = end - start;
      expect(time).toBeLessThan(500);
      console.log(`Key derivation time (100K iterations): ${time}ms`);
    });

    it('should complete full key derivation in under 500ms', () => {
      const password = 'MyStrongPassword123!';
      const salt = generateSalt(32);
      const iterations = 100000;

      const start = Date.now();
      deriveKeys(password, salt, iterations);
      const end = Date.now();

      const time = end - start;
      expect(time).toBeLessThan(500);
      console.log(`Full key derivation time: ${time}ms`);
    });

    it('should handle 200K iterations in under 1000ms', () => {
      const password = 'MyStrongPassword123!';
      const salt = generateSalt(32);
      const iterations = 200000;

      const start = Date.now();
      deriveMasterKey(password, salt, iterations);
      const end = Date.now();

      const time = end - start;
      expect(time).toBeLessThan(1000);
      console.log(`Key derivation time (200K iterations): ${time}ms`);
    });
  });

  describe('Bulk Operations', () => {
    it('should handle 100 vault items encryption in under 500ms', () => {
      const items = Array(100)
        .fill(null)
        .map((_, i) => ({
          username: `user${i}@example.com`,
          password: `password${i}`,
          url: `https://example${i}.com`,
        }));

      const start = Date.now();
      items.forEach((item) => encrypt(item, testKey));
      const end = Date.now();

      const time = end - start;
      expect(time).toBeLessThan(500);
      console.log(`Bulk encryption (100 items): ${time}ms (${(time / 100).toFixed(2)}ms per item)`);
    });

    it('should handle 100 vault items decryption in under 500ms', () => {
      const items = Array(100)
        .fill(null)
        .map((_, i) => ({
          username: `user${i}@example.com`,
          password: `password${i}`,
        }));

      const encrypted = items.map((item) => encrypt(item, testKey));

      const start = Date.now();
      encrypted.forEach((enc) => decrypt(enc, testKey));
      const end = Date.now();

      const time = end - start;
      expect(time).toBeLessThan(500);
      console.log(`Bulk decryption (100 items): ${time}ms (${(time / 100).toFixed(2)}ms per item)`);
    });
  });

  describe('Memory Efficiency', () => {
    it('should not leak memory during repeated operations', () => {
      const data = { username: 'test', password: 'test123' };
      const iterations = 1000;

      // Get baseline memory
      if (global.gc) global.gc();
      const memBefore = process.memoryUsage().heapUsed;

      // Perform operations
      for (let i = 0; i < iterations; i++) {
        const encrypted = encrypt(data, testKey);
        decrypt(encrypted, testKey);
      }

      // Check memory after
      if (global.gc) global.gc();
      const memAfter = process.memoryUsage().heapUsed;
      const memDiff = memAfter - memBefore;
      const memDiffMB = memDiff / 1024 / 1024;

      console.log(`Memory used after ${iterations} operations: ${memDiffMB.toFixed(2)}MB`);

      // Should not use more than 10MB for 1000 operations
      expect(memDiffMB).toBeLessThan(10);
    });
  });
});

describe('Real-world Performance Scenarios', () => {
  it('should simulate user login flow in under 600ms', async () => {
    const password = 'MyStrongPassword123!';
    const salt = generateSalt(32);

    const start = Date.now();

    // Step 1: Derive keys (simulates user login)
    const { encryptionKey } = deriveKeys(password, salt, 100000);

    // Step 2: Simulate fetching and decrypting 10 vault items
    const vaultItems = Array(10)
      .fill(null)
      .map((_, i) => ({
        username: `user${i}@site.com`,
        password: `pass${i}`,
        url: `https://site${i}.com`,
      }));

    const encrypted = vaultItems.map((item) => encrypt(item, encryptionKey));
    encrypted.forEach((enc) => decrypt(enc, encryptionKey));

    const end = Date.now();
    const time = end - start;

    console.log(`Complete login flow with 10 items: ${time}ms`);
    expect(time).toBeLessThan(600);
  });

  it('should simulate vault sync (50 items) in under 2 seconds', () => {
    const key = generateKey(32);

    // Simulate 50 vault items
    const items = Array(50)
      .fill(null)
      .map((_, i) => ({
        id: `item-${i}`,
        username: `user${i}@example.com`,
        password: `password${i}`,
        url: `https://example${i}.com`,
        notes: `Notes for item ${i}`,
      }));

    const start = Date.now();

    // Encrypt all items (simulates push sync)
    const encrypted = items.map((item) => encrypt(item, key));

    // Decrypt all items (simulates pull sync)
    encrypted.forEach((enc) => decrypt(enc, key));

    const end = Date.now();
    const time = end - start;

    console.log(`Sync 50 items (encrypt + decrypt): ${time}ms`);
    expect(time).toBeLessThan(2000);
  });
});
