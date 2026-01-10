/**
 * Shared Crypto Library
 *
 * Provides encryption, decryption, key derivation, and password generation
 * utilities for the iForgotPassword ecosystem.
 */

// Export encryption functions
export {
  encrypt,
  decrypt,
  decryptJSON,
  generateKey,
  generateSalt,
  ENCRYPTION_ALGORITHM,
  IV_LENGTH,
  AUTH_TAG_LENGTH,
  type EncryptedData,
} from './encryption';

// Export key derivation functions
export {
  deriveMasterKey,
  splitMasterKey,
  deriveKeys,
  generateUserSalt,
  hashAuthKey,
  DEFAULT_PBKDF2_ITERATIONS,
  type KDFAlgorithm,
  type DerivedKeys,
} from './key-derivation';

// Export password generation functions
export {
  generatePassword,
  checkPasswordStrength,
  generatePassphrase,
  DEFAULT_PASSWORD_OPTIONS,
  type PasswordOptions,
} from './password-gen';
