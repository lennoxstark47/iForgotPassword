/**
 * Authentication controller
 */

import type { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../services/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors';
import { validateRegistration, validateLogin } from '@iforgotpassword/shared-validators';
import { hashAuthKey } from '@iforgotpassword/shared-crypto';
import type {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
} from '@iforgotpassword/shared-types';
import { ACCOUNT_LOCKOUT_DURATION_MS } from '@iforgotpassword/shared-constants';
import logger from '../utils/logger';

/**
 * Register a new user
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data: RegisterRequest = req.body;

    // Validate input
    const validation = validateRegistration(data);
    if (!validation.valid) {
      throw new BadRequestError('Validation failed', validation.errors);
    }

    const db = getDatabase();

    // Check if user already exists
    const existingUser = await db.getUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash the auth key before storing
    const hashedAuthKey = hashAuthKey(Buffer.from(data.authKey, 'base64'));

    // Create user
    const user = await db.createUser({
      ...data,
      authKey: hashedAuthKey,
    });

    // Generate tokens
    const token = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken(user.id);

    logger.info(`User registered: ${user.email}`);

    res.status(201).json({
      success: true,
      data: {
        userId: user.id,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login a user
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data: LoginRequest = req.body;

    // Validate input
    const validation = validateLogin(data);
    if (!validation.valid) {
      throw new BadRequestError('Validation failed', validation.errors);
    }

    const db = getDatabase();

    // Get user
    const user = await db.getUserByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      throw new UnauthorizedError('Account is temporarily locked. Please try again later.');
    }

    // Hash the provided auth key
    const hashedAuthKey = hashAuthKey(Buffer.from(data.authKey, 'base64'));

    // Compare auth keys
    if (hashedAuthKey !== user.authKeyHash) {
      // Increment failed attempts
      const failedAttempts = user.failedLoginAttempts + 1;
      const updates: any = {
        failedLoginAttempts: failedAttempts,
      };

      // Lock account if too many failed attempts
      if (failedAttempts >= 5) {
        updates.lockedUntil = new Date(Date.now() + ACCOUNT_LOCKOUT_DURATION_MS);
      }

      await db.updateUser(user.id, updates);

      throw new UnauthorizedError('Invalid credentials');
    }

    // Reset failed attempts on successful login
    await db.updateUser(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: undefined,
      lastLoginAt: new Date(),
    });

    // Get sync metadata
    const syncMetadata = await db.getSyncMetadata(user.id, data.deviceId);
    const syncVersion = await db.getCurrentSyncVersion(user.id);

    // Update sync metadata
    await db.updateSyncMetadata(user.id, data.deviceId, {
      deviceName: data.deviceName,
      deviceType: 'browser',
      lastSyncAt: new Date(),
      lastSyncVersion: syncVersion,
    } as any);

    // Generate tokens
    const token = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken(user.id);

    logger.info(`User logged in: ${user.email}`);

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        syncVersion,
        lastSyncAt: syncMetadata?.lastSyncAt?.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const data: RefreshTokenRequest = req.body;

    if (!data.refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }

    // Verify refresh token
    const payload = verifyRefreshToken(data.refreshToken);

    const db = getDatabase();
    const user = await db.getUserById(payload.userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Generate new tokens
    const token = generateAccessToken({ userId: user.id, email: user.email });
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      data: {
        token,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
}
