/**
 * Vault item validation functions
 */

import {
  MAX_TITLE_LENGTH,
  MAX_URL_LENGTH,
  MAX_NOTES_LENGTH,
  MAX_USERNAME_LENGTH,
} from '@iforgotpassword/shared-constants';
import type { VaultItemType } from '@iforgotpassword/shared-types';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Valid vault item types
 */
const VALID_ITEM_TYPES: VaultItemType[] = ['login', 'card', 'note', 'identity'];

/**
 * Validates vault item type
 */
export function validateItemType(itemType: string): ValidationResult {
  const errors: string[] = [];

  if (!itemType || typeof itemType !== 'string') {
    errors.push('Item type is required');
    return { valid: false, errors };
  }

  if (!VALID_ITEM_TYPES.includes(itemType as VaultItemType)) {
    errors.push(`Item type must be one of: ${VALID_ITEM_TYPES.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates encrypted vault item data
 */
export function validateEncryptedVaultItem(data: {
  encryptedData: string;
  encryptedKey: string;
  iv: string;
  authTag: string;
  itemType: string;
}): ValidationResult {
  const errors: string[] = [];

  // Validate encrypted data
  if (!data.encryptedData || typeof data.encryptedData !== 'string') {
    errors.push('Encrypted data is required');
  }

  // Validate encrypted key (optional - can be empty string if using master key encryption)
  if (data.encryptedKey !== undefined && typeof data.encryptedKey !== 'string') {
    errors.push('Encrypted key must be a string');
  }

  // Validate IV
  if (!data.iv || typeof data.iv !== 'string') {
    errors.push('Initialization vector is required');
  }

  // Validate auth tag
  if (!data.authTag || typeof data.authTag !== 'string') {
    errors.push('Authentication tag is required');
  }

  // Validate item type
  const itemTypeValidation = validateItemType(data.itemType);
  if (!itemTypeValidation.valid) {
    errors.push(...itemTypeValidation.errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates decrypted login credential
 */
export function validateLoginCredential(data: {
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
}): ValidationResult {
  const errors: string[] = [];

  // Validate title
  if (!data.title || typeof data.title !== 'string') {
    errors.push('Title is required');
  } else if (data.title.length > MAX_TITLE_LENGTH) {
    errors.push(`Title must not exceed ${MAX_TITLE_LENGTH} characters`);
  }

  // Validate username
  if (!data.username || typeof data.username !== 'string') {
    errors.push('Username is required');
  } else if (data.username.length > MAX_USERNAME_LENGTH) {
    errors.push(`Username must not exceed ${MAX_USERNAME_LENGTH} characters`);
  }

  // Validate password
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Password is required');
  }

  // Validate URL (optional)
  if (data.url && typeof data.url === 'string' && data.url.length > MAX_URL_LENGTH) {
    errors.push(`URL must not exceed ${MAX_URL_LENGTH} characters`);
  }

  // Validate notes (optional)
  if (data.notes && typeof data.notes === 'string' && data.notes.length > MAX_NOTES_LENGTH) {
    errors.push(`Notes must not exceed ${MAX_NOTES_LENGTH} characters`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates URL domain format
 */
export function validateUrlDomain(domain?: string): ValidationResult {
  const errors: string[] = [];

  if (domain !== undefined) {
    if (typeof domain !== 'string') {
      errors.push('URL domain must be a string');
    } else if (domain.length > MAX_URL_LENGTH) {
      errors.push(`URL domain must not exceed ${MAX_URL_LENGTH} characters`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
