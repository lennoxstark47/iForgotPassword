import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * Encryption algorithm used throughout the application
 */
export const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

/**
 * IV (Initialization Vector) length in bytes
 */
export const IV_LENGTH = 16;

/**
 * Auth tag length for GCM mode
 */
export const AUTH_TAG_LENGTH = 16;

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  encryptedData: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypts data using AES-256-GCM
 * @param data - The data to encrypt (will be JSON stringified)
 * @param key - The encryption key (must be 32 bytes for AES-256)
 * @returns Encrypted data with IV and auth tag
 */
export function encrypt(data: unknown, key: Buffer): EncryptedData {
  if (key.length !== 32) {
    throw new Error('Encryption key must be 32 bytes for AES-256');
  }

  // Generate random IV
  const iv = randomBytes(IV_LENGTH);

  // Convert data to string
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);

  // Create cipher
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  // Encrypt data
  let encrypted = cipher.update(dataString, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  // Get auth tag
  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

/**
 * Decrypts data using AES-256-GCM
 * @param encryptedData - The encrypted data structure
 * @param key - The decryption key (must be 32 bytes for AES-256)
 * @returns Decrypted data as string
 */
export function decrypt(encryptedData: EncryptedData, key: Buffer): string {
  if (key.length !== 32) {
    throw new Error('Decryption key must be 32 bytes for AES-256');
  }

  // Convert from base64
  const iv = Buffer.from(encryptedData.iv, 'base64');
  const authTag = Buffer.from(encryptedData.authTag, 'base64');

  // Create decipher
  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  // Decrypt data
  let decrypted = decipher.update(encryptedData.encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Decrypts data and parses as JSON
 * @param encryptedData - The encrypted data structure
 * @param key - The decryption key
 * @returns Decrypted and parsed data
 */
export function decryptJSON<T>(encryptedData: EncryptedData, key: Buffer): T {
  const decrypted = decrypt(encryptedData, key);
  return JSON.parse(decrypted);
}

/**
 * Generates a random encryption key
 * @param length - Key length in bytes (default: 32 for AES-256)
 * @returns Random key buffer
 */
export function generateKey(length: number = 32): Buffer {
  return randomBytes(length);
}

/**
 * Generates a random salt for key derivation
 * @param length - Salt length in bytes (default: 32)
 * @returns Random salt buffer
 */
export function generateSalt(length: number = 32): Buffer {
  return randomBytes(length);
}
