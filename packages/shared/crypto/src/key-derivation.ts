import { pbkdf2Sync, randomBytes } from 'crypto';

/**
 * Default PBKDF2 iterations (100,000 for good security without excessive delay)
 */
export const DEFAULT_PBKDF2_ITERATIONS = 100000;

/**
 * Key derivation algorithm types
 */
export type KDFAlgorithm = 'PBKDF2' | 'Argon2';

/**
 * Master key derivation result
 */
export interface DerivedKeys {
  authKey: Buffer;
  encryptionKey: Buffer;
  masterKey: Buffer;
}

/**
 * Derives master key from password using PBKDF2
 * @param password - User's master password
 * @param salt - Salt (unique per user)
 * @param iterations - Number of PBKDF2 iterations
 * @returns Master key (64 bytes total)
 */
export function deriveMasterKey(
  password: string,
  salt: Buffer,
  iterations: number = DEFAULT_PBKDF2_ITERATIONS
): Buffer {
  // Derive 64 bytes (512 bits) total
  // First 32 bytes will be auth key, last 32 bytes will be encryption key
  return pbkdf2Sync(password, salt, iterations, 64, 'sha256');
}

/**
 * Splits master key into authentication key and encryption key
 * @param masterKey - The derived master key (64 bytes)
 * @returns Object containing both keys
 */
export function splitMasterKey(masterKey: Buffer): DerivedKeys {
  if (masterKey.length !== 64) {
    throw new Error('Master key must be 64 bytes');
  }

  // First 32 bytes for authentication
  const authKey = masterKey.subarray(0, 32);

  // Last 32 bytes for encryption
  const encryptionKey = masterKey.subarray(32, 64);

  return {
    authKey,
    encryptionKey,
    masterKey,
  };
}

/**
 * Derives authentication and encryption keys from password
 * @param password - User's master password
 * @param salt - Salt (unique per user)
 * @param iterations - Number of PBKDF2 iterations
 * @returns Authentication and encryption keys
 */
export function deriveKeys(
  password: string,
  salt: Buffer,
  iterations: number = DEFAULT_PBKDF2_ITERATIONS
): DerivedKeys {
  const masterKey = deriveMasterKey(password, salt, iterations);
  return splitMasterKey(masterKey);
}

/**
 * Generates a unique salt for a user
 * @returns Random salt buffer (32 bytes)
 */
export function generateUserSalt(): Buffer {
  return randomBytes(32);
}

/**
 * Hashes the authentication key for server storage
 * @param authKey - The authentication key
 * @returns Hashed authentication key (for server storage)
 */
export function hashAuthKey(authKey: Buffer): string {
  // Use SHA-256 to hash the auth key before sending to server
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(authKey).digest('base64');
}
