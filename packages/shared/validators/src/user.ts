/**
 * User validation functions
 */

import {
  EMAIL_REGEX,
  MAX_EMAIL_LENGTH,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PBKDF2_ITERATIONS,
} from '@iforgotpassword/shared-constants';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates an email address
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
    return { valid: false, errors };
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    errors.push(`Email must not exceed ${MAX_EMAIL_LENGTH} characters`);
  }

  if (!EMAIL_REGEX.test(email)) {
    errors.push('Invalid email format');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a password
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { valid: false, errors };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    errors.push(`Password must not exceed ${MAX_PASSWORD_LENGTH} characters`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates KDF iterations
 */
export function validateKdfIterations(iterations: number): ValidationResult {
  const errors: string[] = [];

  if (typeof iterations !== 'number' || !Number.isInteger(iterations)) {
    errors.push('KDF iterations must be an integer');
    return { valid: false, errors };
  }

  if (iterations < MIN_PBKDF2_ITERATIONS) {
    errors.push(`KDF iterations must be at least ${MIN_PBKDF2_ITERATIONS}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates registration data
 */
export function validateRegistration(data: {
  email: string;
  authKey: string;
  salt: string;
  kdfIterations: number;
}): ValidationResult {
  const errors: string[] = [];

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    errors.push(...emailValidation.errors);
  }

  // Validate auth key
  if (!data.authKey || typeof data.authKey !== 'string') {
    errors.push('Authentication key is required');
  }

  // Validate salt
  if (!data.salt || typeof data.salt !== 'string') {
    errors.push('Salt is required');
  }

  // Validate KDF iterations
  const kdfValidation = validateKdfIterations(data.kdfIterations);
  if (!kdfValidation.valid) {
    errors.push(...kdfValidation.errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates login data
 */
export function validateLogin(data: {
  email: string;
  authKey: string;
  deviceId: string;
}): ValidationResult {
  const errors: string[] = [];

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    errors.push(...emailValidation.errors);
  }

  // Validate auth key
  if (!data.authKey || typeof data.authKey !== 'string') {
    errors.push('Authentication key is required');
  }

  // Validate device ID
  if (!data.deviceId || typeof data.deviceId !== 'string') {
    errors.push('Device ID is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
