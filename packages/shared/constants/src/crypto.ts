/**
 * Cryptography-related constants
 */

/**
 * Minimum master password length
 */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Recommended master password length
 */
export const RECOMMENDED_PASSWORD_LENGTH = 12;

/**
 * Maximum master password length
 */
export const MAX_PASSWORD_LENGTH = 128;

/**
 * Minimum PBKDF2 iterations
 */
export const MIN_PBKDF2_ITERATIONS = 100000;

/**
 * Recommended PBKDF2 iterations
 */
export const RECOMMENDED_PBKDF2_ITERATIONS = 100000;

/**
 * Salt length in bytes
 */
export const SALT_LENGTH = 32;

/**
 * Encryption key length in bytes (AES-256)
 */
export const ENCRYPTION_KEY_LENGTH = 32;

/**
 * IV length in bytes
 */
export const IV_LENGTH = 16;

/**
 * Auth tag length in bytes (GCM)
 */
export const AUTH_TAG_LENGTH = 16;
