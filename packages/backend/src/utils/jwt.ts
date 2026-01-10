/**
 * JWT utility functions
 */

import jwt from 'jsonwebtoken';
import { config } from '../config';
import type { TokenPayload } from '@iforgotpassword/shared-types';
import {
  JWT_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
} from '@iforgotpassword/shared-constants';

/**
 * Generates an access token
 */
export function generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: JWT_EXPIRATION,
  });
}

/**
 * Generates a refresh token
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, config.jwt.refreshSecret, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });
}

/**
 * Verifies and decodes an access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Verifies and decodes a refresh token
 */
export function verifyRefreshToken(token: string): { userId: string } {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as { userId: string };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}
