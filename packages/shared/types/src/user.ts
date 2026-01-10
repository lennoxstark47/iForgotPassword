/**
 * User-related types
 */

/**
 * User database model
 */
export interface User {
  id: string;
  email: string;
  authKeyHash: string;
  salt: string;
  kdfIterations: number;
  kdfAlgorithm: 'PBKDF2' | 'Argon2';

  // Self-hosting configuration
  customDbConfig?: string; // Encrypted JSON
  isSelfHosted: boolean;

  // Account management
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;

  // Security
  failedLoginAttempts: number;
  lockedUntil?: Date;
}

/**
 * User registration request
 */
export interface RegisterRequest {
  email: string;
  authKey: string; // Hashed authentication key
  salt: string;
  kdfIterations: number;
  kdfAlgorithm: 'PBKDF2' | 'Argon2';
}

/**
 * User registration response
 */
export interface RegisterResponse {
  userId: string;
  token: string;
  refreshToken: string;
}

/**
 * User login request
 */
export interface LoginRequest {
  email: string;
  authKey: string; // Hashed authentication key
  deviceId: string;
  deviceName?: string;
}

/**
 * User login response
 */
export interface LoginResponse {
  token: string;
  refreshToken: string;
  syncVersion: number;
  lastSyncAt?: string;
}

/**
 * JWT token payload
 */
export interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}
