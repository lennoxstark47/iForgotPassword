/**
 * Shared Validators Library
 *
 * Input validation functions used across the iForgotPassword ecosystem.
 */

// Export user validators
export {
  validateEmail,
  validatePassword,
  validateKdfIterations,
  validateRegistration,
  validateLogin,
} from './user';

// Export vault validators
export {
  validateItemType,
  validateEncryptedVaultItem,
  validateLoginCredential,
  validateUrlDomain,
} from './vault';

// Export validation result type
export type { ValidationResult } from './user';
