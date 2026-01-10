/**
 * API-related constants
 */

/**
 * API version
 */
export const API_VERSION = 'v1';

/**
 * API base path
 */
export const API_BASE_PATH = `/api/${API_VERSION}`;

/**
 * Default pagination limit
 */
export const DEFAULT_PAGINATION_LIMIT = 50;

/**
 * Maximum pagination limit
 */
export const MAX_PAGINATION_LIMIT = 200;

/**
 * JWT token expiration (15 minutes)
 */
export const JWT_EXPIRATION = '15m';

/**
 * JWT token expiration in seconds
 */
export const JWT_EXPIRATION_SECONDS = 15 * 60;

/**
 * Refresh token expiration (7 days)
 */
export const REFRESH_TOKEN_EXPIRATION = '7d';

/**
 * Refresh token expiration in seconds
 */
export const REFRESH_TOKEN_EXPIRATION_SECONDS = 7 * 24 * 60 * 60;

/**
 * Rate limit window (15 minutes)
 */
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

/**
 * Maximum login attempts per window
 */
export const MAX_LOGIN_ATTEMPTS = 5;

/**
 * Maximum registration attempts per window
 */
export const MAX_REGISTRATION_ATTEMPTS = 3;

/**
 * Maximum API requests per window
 */
export const MAX_API_REQUESTS = 100;

/**
 * Account lockout duration (30 minutes)
 */
export const ACCOUNT_LOCKOUT_DURATION_MS = 30 * 60 * 1000;
